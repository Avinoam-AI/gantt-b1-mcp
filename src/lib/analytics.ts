// Pure analytics derived from a loaded B1 project. No side effects, no deps —
// easy to reason about and to unit-test. All money is in the project currency
// (the demo data uses plain numbers; see lib/format.ts).
import type { B1Project, B1Stage, StageStatus } from '../types/b1'
import { stageStatus } from '../types/b1'

const STATUS_ORDER: StageStatus[] = ['completed', 'in-progress', 'at-risk', 'not-started']

export interface StatusBreakdown {
  status: StageStatus
  count: number
  cost: number
}

export interface StageCost {
  stage: B1Stage
  status: StageStatus
  cost: number
}

export interface ScheduleAlert {
  stage: B1Stage
  daysOverdue: number
}

export interface ProjectAnalytics {
  // ── Budget ──
  totalBudget: number
  committedCost: number   // budget booked against finished stages
  remainingCost: number   // budget on stages not yet finished
  avgStageCost: number
  committedPct: number    // committedCost / totalBudget (0–100)
  byStatus: StatusBreakdown[]
  costByStage: StageCost[] // sorted by cost, descending

  // ── Schedule health ──
  overallPct: number      // B1 FinishedPercent — the headline completion
  stagesDone: number
  stagesTotal: number
  overdueCount: number
  atRiskCount: number
  durationDays: number
  elapsedDays: number
  elapsedPct: number      // 0–100, clamped
  scheduleVariance: number // overallPct − elapsedPct; negative ⇒ behind plan
  alerts: ScheduleAlert[]  // overdue stages, most overdue first

  // ── Issues ──
  openIssues: number
  issuesByPriority: { priority: number; count: number }[] // P1, P2, P3
}

function dayDiff(a: string, b: string): number {
  return Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86_400_000)
}

export function analyzeProject(project: B1Project): ProjectAnalytics {
  const stages = project.stages
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString().slice(0, 10)

  // Budget
  const totalBudget = stages.reduce((sum, s) => sum + (s.expectedCosts || 0), 0)
  const committedCost = stages.filter(s => s.isFinished).reduce((sum, s) => sum + (s.expectedCosts || 0), 0)
  const remainingCost = totalBudget - committedCost
  const avgStageCost = stages.length ? totalBudget / stages.length : 0
  const committedPct = totalBudget ? (committedCost / totalBudget) * 100 : 0

  // Per-status breakdown (count + cost), kept in a stable legend order
  const byStatus: StatusBreakdown[] = STATUS_ORDER.map(status => {
    const rows = stages.filter(s => stageStatus(s) === status)
    return {
      status,
      count: rows.length,
      cost: rows.reduce((sum, s) => sum + (s.expectedCosts || 0), 0),
    }
  })

  const costByStage: StageCost[] = stages
    .map(s => ({ stage: s, status: stageStatus(s), cost: s.expectedCosts || 0 }))
    .sort((a, b) => b.cost - a.cost)

  // Schedule
  const overallPct = project.finishedPercent ?? 0
  const stagesDone = stages.filter(s => s.isFinished).length
  const stagesTotal = stages.length

  const overdue = stages
    .filter(s => !s.isFinished && s.closeDate && s.closeDate < todayISO)
    .map(s => ({ stage: s, daysOverdue: dayDiff(s.closeDate, todayISO) }))
    .sort((a, b) => b.daysOverdue - a.daysOverdue)

  const atRiskCount = stages.filter(s => stageStatus(s) === 'at-risk').length

  const durationDays = project.startDate && project.dueDate ? Math.max(1, dayDiff(project.startDate, project.dueDate)) : 0
  const rawElapsed = project.startDate ? dayDiff(project.startDate, todayISO) : 0
  const elapsedDays = Math.min(Math.max(rawElapsed, 0), durationDays)
  const elapsedPct = durationDays ? (elapsedDays / durationDays) * 100 : 0
  const scheduleVariance = overallPct - elapsedPct

  // Issues
  const openIssues = project.issues.filter(i => !i.closed).length
  const issuesByPriority = [1, 2, 3].map(priority => ({
    priority,
    count: project.issues.filter(i => !i.closed && i.priority === priority).length,
  }))

  return {
    totalBudget, committedCost, remainingCost, avgStageCost, committedPct,
    byStatus, costByStage,
    overallPct, stagesDone, stagesTotal, overdueCount: overdue.length, atRiskCount,
    durationDays, elapsedDays, elapsedPct, scheduleVariance, alerts: overdue,
    openIssues, issuesByPriority,
  }
}
