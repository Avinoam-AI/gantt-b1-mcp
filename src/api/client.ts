import type { B1Project, B1ProjectSummary, B1Stage } from '../types/b1'

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_PROJECTS: B1ProjectSummary[] = [
  { absEntry: 1, projectName: 'ERP Implementation', businessPartnerName: 'Globex Corporation', startDate: '2025-01-06', dueDate: '2025-09-30', finishedPercent: 65, projectStatus: 'pst_Started' },
  { absEntry: 2, projectName: 'CRM Integration', businessPartnerName: 'Initech Ltd.', startDate: '2025-04-01', dueDate: '2025-10-31', finishedPercent: 30, projectStatus: 'pst_Started' },
  { absEntry: 3, projectName: 'Warehouse Automation', businessPartnerName: 'Umbrella Logistics', startDate: '2024-07-01', dueDate: '2025-03-31', finishedPercent: 100, projectStatus: 'pst_Finished' },
  { absEntry: 4, projectName: 'S/4HANA Cloud Migration', businessPartnerName: 'Pinnacle Industries', startDate: '2025-03-01', dueDate: '2026-06-30', finishedPercent: 22, projectStatus: 'pst_Started' },
]

const DEMO_FULL_PROJECTS: Record<number, B1Project> = {
  1: {
    ...DEMO_PROJECTS[0],
    stages: [
      { lineID: 1, stageID: 1, description: 'Requirements & Blueprint', startDate: '2025-01-06', closeDate: '2025-02-14', percentualCompletness: 100, isFinished: true,  dependsOnStage1: null, expectedCosts: 15000 },
      { lineID: 2, stageID: 2, description: 'System Design',            startDate: '2025-02-17', closeDate: '2025-03-28', percentualCompletness: 100, isFinished: true,  dependsOnStage1: 1,    expectedCosts: 20000 },
      { lineID: 3, stageID: 3, description: 'Configuration & Dev',      startDate: '2025-04-01', closeDate: '2025-06-27', percentualCompletness: 80,  isFinished: false, dependsOnStage1: 2,    expectedCosts: 45000 },
      { lineID: 4, stageID: 4, description: 'User Acceptance Testing',  startDate: '2025-06-30', closeDate: '2025-08-08', percentualCompletness: 10,  isFinished: false, dependsOnStage1: 3,    expectedCosts: 12000 },
      { lineID: 5, stageID: 5, description: 'Go-Live & Hypercare',      startDate: '2025-08-11', closeDate: '2025-09-30', percentualCompletness: 0,   isFinished: false, dependsOnStage1: 4,    expectedCosts: 8000  },
    ],
    issues: [
      { lineID: 1, stageID: 3, remarks: 'Custom approval workflow needs rework — original spec was ambiguous', priority: 1, closed: false },
      { lineID: 2, stageID: 3, remarks: 'Tax configuration for EU entities pending sign-off from finance',    priority: 2, closed: false },
      { lineID: 3, stageID: 2, remarks: 'Integration spec with legacy ERP finalised',                          priority: 3, closed: true  },
    ],
  },
  2: {
    ...DEMO_PROJECTS[1],
    stages: [
      { lineID: 1, stageID: 1, description: 'Discovery & Scoping',   startDate: '2025-04-01', closeDate: '2025-04-25', percentualCompletness: 100, isFinished: true,  dependsOnStage1: null, expectedCosts: 5000  },
      { lineID: 2, stageID: 2, description: 'API Design',             startDate: '2025-04-28', closeDate: '2025-05-23', percentualCompletness: 60,  isFinished: false, dependsOnStage1: 1,    expectedCosts: 9000  },
      { lineID: 3, stageID: 3, description: 'Backend Integration',    startDate: '2025-05-26', closeDate: '2025-07-25', percentualCompletness: 0,   isFinished: false, dependsOnStage1: 2,    expectedCosts: 22000 },
      { lineID: 4, stageID: 4, description: 'Frontend & Dashboard',   startDate: '2025-07-28', closeDate: '2025-09-19', percentualCompletness: 0,   isFinished: false, dependsOnStage1: 3,    expectedCosts: 18000 },
      { lineID: 5, stageID: 5, description: 'Testing & Rollout',      startDate: '2025-09-22', closeDate: '2025-10-31', percentualCompletness: 0,   isFinished: false, dependsOnStage1: 4,    expectedCosts: 7000  },
    ],
    issues: [
      { lineID: 1, stageID: 2, remarks: 'Rate-limit policy for external CRM API not yet confirmed by vendor', priority: 1, closed: false },
    ],
  },
  3: {
    ...DEMO_PROJECTS[2],
    stages: [
      { lineID: 1, stageID: 1, description: 'Site Survey & Planning',  startDate: '2024-07-01', closeDate: '2024-08-02', percentualCompletness: 100, isFinished: true, dependsOnStage1: null, expectedCosts: 8000  },
      { lineID: 2, stageID: 2, description: 'Hardware Procurement',    startDate: '2024-08-05', closeDate: '2024-09-27', percentualCompletness: 100, isFinished: true, dependsOnStage1: 1,    expectedCosts: 65000 },
      { lineID: 3, stageID: 3, description: 'WMS Configuration',       startDate: '2024-09-30', closeDate: '2024-12-06', percentualCompletness: 100, isFinished: true, dependsOnStage1: 2,    expectedCosts: 30000 },
      { lineID: 4, stageID: 4, description: 'Staff Training',          startDate: '2024-12-09', closeDate: '2025-01-17', percentualCompletness: 100, isFinished: true, dependsOnStage1: 3,    expectedCosts: 10000 },
      { lineID: 5, stageID: 5, description: 'Production Go-Live',      startDate: '2025-01-20', closeDate: '2025-03-31', percentualCompletness: 100, isFinished: true, dependsOnStage1: 4,    expectedCosts: 5000  },
    ],
    issues: [],
  },
  4: {
    ...DEMO_PROJECTS[3],
    stages: [
      { lineID: 1,  stageID: 1,  description: 'Project Kick-off & Governance',   startDate: '2025-03-01', closeDate: '2025-03-28', percentualCompletness: 100, isFinished: true,  dependsOnStage1: null, expectedCosts: 12000  },
      { lineID: 2,  stageID: 2,  description: 'As-Is Process Analysis',           startDate: '2025-03-31', closeDate: '2025-05-09', percentualCompletness: 100, isFinished: true,  dependsOnStage1: 1,    expectedCosts: 28000  },
      { lineID: 3,  stageID: 3,  description: 'To-Be Design & Gap Assessment',    startDate: '2025-05-12', closeDate: '2025-07-04', percentualCompletness: 55,  isFinished: false, dependsOnStage1: 2,    expectedCosts: 35000  },
      { lineID: 4,  stageID: 4,  description: 'Data Migration Strategy',          startDate: '2025-06-02', closeDate: '2025-08-01', percentualCompletness: 30,  isFinished: false, dependsOnStage1: 2,    expectedCosts: 22000  },
      { lineID: 5,  stageID: 5,  description: 'System Build — Finance Module',    startDate: '2025-07-07', closeDate: '2025-09-26', percentualCompletness: 10,  isFinished: false, dependsOnStage1: 3,    expectedCosts: 55000  },
      { lineID: 6,  stageID: 6,  description: 'System Build — Logistics Module',  startDate: '2025-07-07', closeDate: '2025-10-10', percentualCompletness: 5,   isFinished: false, dependsOnStage1: 3,    expectedCosts: 60000  },
      { lineID: 7,  stageID: 7,  description: 'System Build — HR & Payroll',      startDate: '2025-08-04', closeDate: '2025-10-31', percentualCompletness: 0,   isFinished: false, dependsOnStage1: 3,    expectedCosts: 45000  },
      { lineID: 8,  stageID: 8,  description: 'Integration & Interface Testing',  startDate: '2025-10-13', closeDate: '2025-12-05', percentualCompletness: 0,   isFinished: false, dependsOnStage1: 6,    expectedCosts: 30000  },
      { lineID: 9,  stageID: 9,  description: 'User Acceptance Testing',          startDate: '2025-12-08', closeDate: '2026-02-06', percentualCompletness: 0,   isFinished: false, dependsOnStage1: 8,    expectedCosts: 18000  },
      { lineID: 10, stageID: 10, description: 'Data Migration Execution',         startDate: '2026-01-05', closeDate: '2026-03-06', percentualCompletness: 0,   isFinished: false, dependsOnStage1: 4,    expectedCosts: 25000  },
      { lineID: 11, stageID: 11, description: 'Cutover & Go-Live',                startDate: '2026-03-09', closeDate: '2026-04-03', percentualCompletness: 0,   isFinished: false, dependsOnStage1: 9,    expectedCosts: 15000  },
      { lineID: 12, stageID: 12, description: 'Hypercare & Stabilisation',        startDate: '2026-04-06', closeDate: '2026-06-30', percentualCompletness: 0,   isFinished: false, dependsOnStage1: 11,   expectedCosts: 20000  },
    ],
    issues: [
      { lineID: 1, stageID: 3, remarks: 'Custom pricing logic for intercompany transactions not covered by standard S/4 — needs ABAP extension', priority: 1, closed: false },
      { lineID: 2, stageID: 4, remarks: 'Legacy data quality issues in customer master: ~4,000 duplicate BPs identified, cleanse before migration', priority: 1, closed: false },
      { lineID: 3, stageID: 6, remarks: 'Third-party WMS integration spec still pending from vendor — blocks interface design', priority: 2, closed: false },
      { lineID: 4, stageID: 5, remarks: 'Tax jurisdiction mapping for Brazil entities requires external consultant sign-off', priority: 2, closed: false },
      { lineID: 5, stageID: 2, remarks: 'As-Is documentation for legacy payroll system obtained and approved', priority: 3, closed: true  },
    ],
  },
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function fetchProjects(): Promise<B1ProjectSummary[]> {
  if (DEMO_MODE) return Promise.resolve(DEMO_PROJECTS)
  const res = await fetch('/api/projects')
  if (!res.ok) throw new Error(`Failed to load projects: ${res.status}`)
  return res.json()
}

export async function fetchProject(absEntry: number): Promise<B1Project> {
  if (DEMO_MODE) {
    const p = DEMO_FULL_PROJECTS[absEntry]
    if (!p) throw new Error(`Demo project ${absEntry} not found`)
    return Promise.resolve(structuredClone(p))
  }
  const res = await fetch(`/api/projects/${absEntry}`)
  if (!res.ok) throw new Error(`Failed to load project ${absEntry}: ${res.status}`)
  return res.json()
}

export async function patchProject(absEntry: number, stages: B1Stage[]): Promise<void> {
  if (DEMO_MODE) {
    // Persist edits locally so the session stays interactive
    const p = DEMO_FULL_PROJECTS[absEntry]
    if (p) p.stages = stages
    return Promise.resolve()
  }
  const res = await fetch(`/api/projects/${absEntry}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stages }),
  })
  if (res.ok || res.status === 204) return
  const msg = await res.json().then(b => b?.error).catch(() => null)
  throw new Error(msg ?? `Save failed: ${res.status}`)
}
