import type { B1Project, B1ProjectSummary, B1Stage } from '../types/b1'

export async function fetchProjects(): Promise<B1ProjectSummary[]> {
  const res = await fetch('/api/projects')
  if (!res.ok) throw new Error(`Failed to load projects: ${res.status}`)
  return res.json()
}

export async function fetchProject(absEntry: number): Promise<B1Project> {
  const res = await fetch(`/api/projects/${absEntry}`)
  if (!res.ok) throw new Error(`Failed to load project ${absEntry}: ${res.status}`)
  return res.json()
}

export async function patchProject(absEntry: number, stages: B1Stage[]): Promise<void> {
  const res = await fetch(`/api/projects/${absEntry}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stages }),
  })
  if (res.ok || res.status === 204) return
  const msg = await res.json().then(b => b?.error).catch(() => null)
  throw new Error(msg ?? `Save failed: ${res.status}`)
}
