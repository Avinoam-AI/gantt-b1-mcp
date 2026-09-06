// Minimal MCP Streamable HTTP client for the B1 MCP server
const MCP_URL = 'http://b1x.only.sap:3000/mcp'

let msgId = 0
const nextId = () => ++msgId
let sessionId: string | null = null

type JsonRpcRequest = {
  jsonrpc: '2.0'
  method: string
  params: Record<string, unknown>
  id: number
}

type JsonRpcResponse<T = unknown> = {
  jsonrpc: '2.0'
  id: number
  result?: T
  error?: { code: number; message: string }
}

async function postMcp<T>(body: JsonRpcRequest): Promise<{ result: T; headers: Headers }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  }
  if (sessionId) headers['Mcp-Session-Id'] = sessionId

  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`MCP HTTP ${res.status}: ${await res.text()}`)
  }

  // Capture session ID from response headers (set during initialize)
  const newSession = res.headers.get('Mcp-Session-Id')
  if (newSession) sessionId = newSession

  const ct = res.headers.get('content-type') ?? ''

  // Streamable HTTP: server may respond with SSE
  if (ct.includes('text/event-stream')) {
    const text = await res.text()
    const lines = text.split('\n')
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim()
      if (line.startsWith('data:')) {
        const json = line.slice(5).trim()
        if (json) {
          const parsed: JsonRpcResponse<T> = JSON.parse(json)
          if (parsed.error) throw new Error(parsed.error.message)
          return { result: parsed.result as T, headers: res.headers }
        }
      }
    }
    throw new Error('No data in SSE response')
  }

  const json: JsonRpcResponse<T> = await res.json()
  if (json.error) throw new Error(json.error.message)
  return { result: json.result as T, headers: res.headers }
}

export type ToolDef = { name: string; description: string; inputSchema: unknown }

export async function initialize(): Promise<void> {
  sessionId = null // reset before init
  const { headers } = await postMcp({
    jsonrpc: '2.0',
    method: 'initialize',
    params: {
      protocolVersion: '2025-03-26',
      capabilities: {},
      clientInfo: { name: 'gantt-b1-mcp', version: '1.0.0' },
    },
    id: nextId(),
  })
  // Some servers set session ID on the initialize response
  const sid = headers.get('Mcp-Session-Id')
  if (sid) sessionId = sid

  // Send initialized notification
  try {
    await fetch(MCP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}),
      },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }),
    })
  } catch { /* notification is fire-and-forget */ }
}

export async function listTools(): Promise<ToolDef[]> {
  const { result } = await postMcp<{ tools: ToolDef[] }>({
    jsonrpc: '2.0',
    method: 'tools/list',
    params: {},
    id: nextId(),
  })
  return result.tools ?? []
}

export async function callTool<T>(name: string, args: Record<string, unknown>): Promise<T> {
  type ToolResult = { content?: Array<{ type: string; text?: string }>; isError?: boolean; [k: string]: unknown }
  const { result } = await postMcp<ToolResult>({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: { name, arguments: args },
    id: nextId(),
  })

  // Check all content items for JSON data
  const contentItems = result?.content ?? []

  // Look for any content item with parseable JSON
  for (const item of contentItems) {
    const text = item.text
    if (!text) continue
    const jsonStart = text.search(/[\[{]/)
    if (jsonStart >= 0) {
      try {
        return JSON.parse(text.slice(jsonStart)) as T
      } catch { /* not JSON at that position, keep searching */ }
    }
  }

  // Return full result object if no text JSON found (let caller handle)
  if (Object.keys(result ?? {}).length > 0) {
    return result as unknown as T
  }

  throw new Error(`Tool "${name}" returned no parseable content`)
}
