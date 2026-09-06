import cors from 'cors'
import express from 'express'
import { callTool, initialize, listTools, type ToolDef } from './b1mcp.js'

const app = express()
app.use(cors())
app.use(express.json())

// ── Tool discovery ──────────────────────────────────────────────────────────
let tools: ToolDef[] = []

async function discoverTools() {
  try {
    await initialize()
    tools = await listTools()
    console.log('\n=== B1 MCP Tools discovered ===')
    tools.forEach(t => console.log(` • ${t.name}: ${t.description.slice(0, 80)}…`))
    console.log('================================\n')
  } catch (err) {
    console.warn('⚠ Could not connect to B1 MCP server:', (err as Error).message)
    console.warn('  API will return mock data until the server is reachable.\n')
  }
}

// ── Cached mock (offline fallback) ─────────────────────────────────────────
const MOCK_PROJECTS = [
  {
    absEntry: 1, projectName: 'New Server Install', businessPartnerName: 'Maxi-Teq',
    startDate: '2026-07-01', dueDate: '2026-08-31', finishedPercent: 5, projectStatus: 'pst_Started',
  },
  {
    absEntry: 2, projectName: 'Servers & Printer Install', businessPartnerName: 'Parameter Technology',
    startDate: '2026-07-01', dueDate: '2026-10-31', finishedPercent: 10, projectStatus: 'pst_Started',
  },
]

const MOCK_STAGES = [
  { lineID:1,stageID:1,description:'Project Initiation',startDate:'2026-07-01',closeDate:'2026-07-05',percentualCompletness:100,isFinished:true, dependsOnStage1:null,expectedCosts:1000 },
  { lineID:2,stageID:2,description:'Project Planning',  startDate:'2026-07-11',closeDate:'2026-07-29',percentualCompletness:10, isFinished:false,dependsOnStage1:null,expectedCosts:2000 },
  { lineID:3,stageID:3,description:'Project Launch',    startDate:'2026-08-01',closeDate:'2026-08-03',percentualCompletness:10, isFinished:false,dependsOnStage1:null,expectedCosts:3000 },
  { lineID:4,stageID:4,description:'Installation',      startDate:'2026-08-15',closeDate:'2026-08-19',percentualCompletness:50, isFinished:false,dependsOnStage1:3,  expectedCosts:12000 },
  { lineID:5,stageID:5,description:'Monitoring',        startDate:'2026-08-22',closeDate:'2026-08-26',percentualCompletness:15, isFinished:false,dependsOnStage1:4,  expectedCosts:1000 },
  { lineID:6,stageID:6,description:'Project Close',     startDate:'2026-08-29',closeDate:'2026-08-31',percentualCompletness:10, isFinished:false,dependsOnStage1:5,  expectedCosts:2000 },
]

const MOCK_ISSUES = [
  { lineID:1,stageID:3,remarks:'Project manager is on vacation',priority:3,closed:false },
  { lineID:2,stageID:4,remarks:'Configuration of users failed',  priority:1,closed:false },
]

// ── Normalise raw B1 API response into our DTO shape ─────────────────────────
function normaliseProjects(raw: unknown[]): unknown[] {
  return raw.map((p: unknown) => {
    const obj = p as Record<string, unknown>
    return {
      absEntry:            obj.AbsEntry      ?? obj.absEntry,
      projectName:         obj.ProjectName   ?? obj.projectName ?? '(unnamed)',
      businessPartnerName: obj.BusinessPartnerName ?? obj.businessPartnerName ?? '',
      startDate:           ((obj.StartDate ?? obj.startDate) as string | undefined)?.slice(0,10) ?? '',
      dueDate:             ((obj.DueDate   ?? obj.dueDate)   as string | undefined)?.slice(0,10) ?? '',
      finishedPercent:     obj.FinishedPercent ?? obj.finishedPercent ?? 0,
      projectStatus:       obj.ProjectStatus   ?? obj.projectStatus ?? '',
    }
  })
}

function normaliseProject(raw: Record<string, unknown>): unknown {
  const stages = ((raw.PM_StagesCollection ?? raw.stages ?? []) as Record<string,unknown>[]).map(s => ({
    lineID:               s.LineID               ?? s.lineID,
    stageID:              s.StageID              ?? s.stageID,
    description:          s.Description          ?? s.description ?? '(unnamed)',
    startDate:            ((s.StartDate ?? s.startDate) as string | undefined)?.slice(0,10) ?? '',
    closeDate:            ((s.CloseDate ?? s.closeDate) as string | undefined)?.slice(0,10) ?? '',
    percentualCompletness:s.PercentualCompletness ?? s.percentualCompletness ?? 0,
    isFinished:           (s.IsFinished ?? s.isFinished) === 'tYES' || s.isFinished === true,
    dependsOnStage1:      s.DependsOnStage1 ?? s.dependsOnStage1 ?? null,
    expectedCosts:        s.ExpectedCosts   ?? s.expectedCosts   ?? 0,
  }))
  const issues = ((raw.PM_OpenIssuesCollection ?? raw.issues ?? []) as Record<string,unknown>[]).map(i => ({
    lineID:   i.LineID   ?? i.lineID,
    stageID:  i.StageID  ?? i.stageID,
    remarks:  i.Remarks  ?? i.remarks ?? '',
    priority: i.Priority ?? i.priority ?? 3,
    closed:   (i.Closed  ?? i.closed) === 'tYES' || i.closed === true,
  }))
  return {
    absEntry:            raw.AbsEntry             ?? raw.absEntry,
    projectName:         raw.ProjectName          ?? raw.projectName ?? '(unnamed)',
    businessPartnerName: raw.BusinessPartnerName  ?? raw.businessPartnerName ?? '',
    startDate:           ((raw.StartDate ?? raw.startDate) as string | undefined)?.slice(0,10) ?? '',
    dueDate:             ((raw.DueDate   ?? raw.dueDate)   as string | undefined)?.slice(0,10) ?? '',
    finishedPercent:     raw.FinishedPercent       ?? raw.finishedPercent ?? 0,
    projectStatus:       raw.ProjectStatus         ?? raw.projectStatus ?? '',
    stages,
    issues,
  }
}

// ── B1 helper: call b1_read with entity + query options ────────────────────
function hasTool(name: string): boolean {
  return tools.some(t => t.name === name)
}

async function b1Read(entityName: string, options: Record<string, unknown> = {}): Promise<unknown> {
  type B1ReadResult = { value?: unknown[]; [k: string]: unknown }
  const result = await callTool<B1ReadResult>('b1_read', { entityName, ...options })
  // b1_read returns { value: [...] } for list, or the entity directly for read-single
  if (Array.isArray(result)) return result
  if (result.value !== undefined) return result.value
  return result
}

// ── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/projects', async (_req, res) => {
  try {
    if (!hasTool('b1_read')) return res.json(MOCK_PROJECTS)
    const raw = await b1Read('ProjectManagements', {
      operation: 'read',
      selectString: 'AbsEntry,ProjectName,BusinessPartner,BusinessPartnerName,StartDate,DueDate,FinishedPercent,ProjectStatus',
    })
    const list = Array.isArray(raw) ? raw : [raw]
    res.json(normaliseProjects(list))
  } catch (err) {
    console.error('GET /api/projects error:', (err as Error).message)
    res.json(MOCK_PROJECTS)
  }
})

app.get('/api/projects/:id', async (req, res) => {
  const id = Number(req.params.id)
  try {
    if (!hasTool('b1_read')) {
      return res.json({ ...MOCK_PROJECTS.find(p => p.absEntry === id) ?? MOCK_PROJECTS[0], stages: MOCK_STAGES, issues: MOCK_ISSUES })
    }
    const raw = await b1Read('ProjectManagements', {
      operation: 'read-single',
      parameters: { AbsEntry: id },
      expandString: 'PM_StagesCollection,PM_OpenIssuesCollection',
    })
    res.json(normaliseProject(raw as Record<string, unknown>))
  } catch (err) {
    console.error(`GET /api/projects/${id} error:`, (err as Error).message)
    res.json({ ...MOCK_PROJECTS.find(p => p.absEntry === id) ?? MOCK_PROJECTS[0], stages: MOCK_STAGES, issues: MOCK_ISSUES })
  }
})

app.patch('/api/projects/:id', async (req, res) => {
  const id = Number(req.params.id)
  try {
    if (!hasTool('b1_read') || !hasTool('b1_write')) return res.status(204).send()

    // 1. Fetch current B1 stages to preserve all fields (especially contribution %)
    type B1ReadResult = { value?: unknown[]; PM_StagesCollection?: unknown[]; [k: string]: unknown }
    const current = await callTool<B1ReadResult>('b1_read', {
      entityName: 'ProjectManagements',
      operation:  'read-single',
      parameters: { AbsEntry: id },
      expandString: 'PM_StagesCollection',
    })
    const b1Stages = (current.PM_StagesCollection ?? []) as Record<string, unknown>[]

    // 2. Build update-set: only fields safe to change (leave PercentualCompletness = B1 contribution % intact)
    const updatedMap = new Map<number, Record<string, unknown>>()
    for (const s of (req.body.stages ?? []) as Record<string, unknown>[]) {
      updatedMap.set(s.lineID as number, s)
    }

    const mergedStages = b1Stages.map(b1s => {
        if (b1s.IsFinished === 'tYES') {
          // Finished stages cannot be modified — send only the key so B1 keeps them unchanged
          return { LineID: b1s.LineID, StageID: b1s.StageID }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { FinishedDate: _fd, ...b1sClean } = b1s  // strip FinishedDate — B1 rejects null here
        const updated = updatedMap.get(b1s.LineID as number)
        if (!updated) return b1sClean
        return {
          ...b1sClean,  // keep all original fields (including PercentualCompletness contribution)
          Description:     updated.description,
          StartDate:       (updated.startDate as string) + 'T00:00:00Z',
          CloseDate:       (updated.closeDate as string) + 'T00:00:00Z',
          IsFinished:      updated.isFinished ? 'tYES' : 'tNO',
          DependsOnStage1: updated.dependsOnStage1 ?? null,
          ExpectedCosts:   updated.expectedCosts,
        }
      })

    // 3. Write merged stages back
    const result = await callTool<unknown>('b1_write', {
      entityName: 'ProjectManagements',
      operation:  'update',
      parameters: {
        AbsEntry: id,
        PM_StagesCollection: mergedStages,
      },
    })
    const resultStr = JSON.stringify(result)
    console.log(`PATCH /api/projects/${id} b1_write:`, resultStr.slice(0, 200))
    if (resultStr.includes('"error"')) {
      const rawMsg = (JSON.parse(resultStr)?.error?.message ?? 'B1 error') as string
      // B1 Service Layer re-validates all stages on any write to a project that
      // contains a finished stage, and rejects the whole document. Nothing in the
      // payload can work around this — surface a clear explanation instead.
      const hasFinished = b1Stages.some(s => s.IsFinished === 'tYES')
      const msg = /Finished stages cannot be changed/i.test(rawMsg) && hasFinished
        ? 'SAP B1 will not save changes to this project because it contains a finished stage. B1 locks the entire stage list once any stage is marked finished.'
        : rawMsg
      return res.status(409).json({ error: msg })
    }
    res.status(204).send()
  } catch (err) {
    console.error(`PATCH /api/projects/${id} error:`, (err as Error).message)
    res.status(500).json({ error: (err as Error).message })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', tools: tools.map(t => t.name) })
})

// ── Boot ─────────────────────────────────────────────────────────────────────
const PORT = 3001
discoverTools().then(() => {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`)
  })
})
