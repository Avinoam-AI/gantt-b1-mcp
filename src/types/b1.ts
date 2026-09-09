export interface B1ProjectSummary {
  absEntry: number
  projectName: string
  businessPartnerName: string
  startDate: string
  dueDate: string
  finishedPercent: number
  projectStatus: string
}

export interface B1Stage {
  lineID: number
  stageID: number
  description: string
  startDate: string
  closeDate: string
  percentualCompletness: number
  isFinished: boolean
  dependsOnStage1: number | null
  expectedCosts: number
}

export interface B1Issue {
  lineID: number
  stageID: number
  remarks: string
  priority: number
  closed: boolean
}

export interface B1Project extends B1ProjectSummary {
  stages: B1Stage[]
  issues: B1Issue[]
}

// Status derived from stage fields — used for color coding
export type StageStatus = 'completed' | 'at-risk' | 'in-progress' | 'not-started'

export function stageStatus(s: B1Stage): StageStatus {
  if (s.isFinished) return 'completed'
  if (s.percentualCompletness > 0 && s.percentualCompletness < 100) {
    // At risk: past close date and not finished
    const now = new Date()
    const close = new Date(s.closeDate)
    if (close < now) return 'at-risk'
    return 'in-progress'
  }
  return 'not-started'
}

// Enriched, CVD-safe status palette (validated: adjacent CVD ΔE ≥ 16, normal-vision ≥ 18).
// Neutral gray for "not started" is intentional; amber's low surface-contrast is covered by
// always pairing status color with a text label (the "relief" rule) in charts and legends.
export const STATUS_COLORS: Record<StageStatus, string> = {
  'completed':   '#2f9e5f',
  'in-progress': '#3b7fd4',
  'at-risk':     '#e08a2b',
  'not-started': '#8b93a7',
}

export const STATUS_LABELS: Record<StageStatus, string> = {
  'completed':   'Completed',
  'in-progress': 'In Progress',
  'at-risk':     'At Risk',
  'not-started': 'Not Started',
}

// A short glyph paired with each status so meaning never rests on color alone.
export const STATUS_GLYPHS: Record<StageStatus, string> = {
  'completed':   '✓',
  'in-progress': '▸',
  'at-risk':     '!',
  'not-started': '○',
}
