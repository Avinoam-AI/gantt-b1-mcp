import { useState } from 'react'
import type { B1Issue, B1Stage } from '../types/b1'
import { STATUS_COLORS, STATUS_LABELS, stageStatus, type StageStatus } from '../types/b1'
import { GanttBar } from './GanttBar'

const ROW_H    = 46
const NAME_W   = 188   // fixed name column width
const TODAY    = new Date(); TODAY.setHours(0, 0, 0, 0)

function fmt(d: Date): string { return d.toISOString().slice(0, 10) }
function diffDays(a: string, b: string): number {
  return Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000)
}

interface Props {
  stages: B1Stage[]
  issues: B1Issue[]
  selectedStageId: number | null
  onSelectStage: (id: number | null) => void
  onStageChange: (s: B1Stage) => void
}

export function GanttChart({ stages, issues, selectedStageId, onSelectStage, onStageChange }: Props) {
  const [pxDay, setPxDay] = useState(28)

  const allDates    = stages.flatMap(s => [s.startDate, s.closeDate])
  const minDate     = allDates.length ? allDates.slice().sort()[0] : fmt(TODAY)
  const maxDate     = allDates.length ? allDates.slice().sort().reverse()[0] : fmt(TODAY)
  const padDate     = (d: string, n: number) => { const x = new Date(d + 'T00:00:00'); x.setDate(x.getDate() + n); return fmt(x) }
  const defaultStart = padDate(minDate, -14)
  const defaultEnd   = padDate(maxDate, 14)
  const [vStart, setVStart] = useState(defaultStart)
  const [vEnd,   setVEnd]   = useState(defaultEnd)

  const totalDays  = Math.max(1, diffDays(vStart, vEnd) + 1)
  const totalWidth = totalDays * pxDay

  // Month blocks
  const monthBlocks: { label: string; days: number }[] = []
  let cur  = new Date(vStart + 'T00:00:00')
  const endD = new Date(vEnd + 'T00:00:00')
  while (cur <= endD) {
    const y = cur.getFullYear(), m = cur.getMonth()
    const mEnd = new Date(y, m + 1, 0)
    const actualEnd = mEnd < endD ? mEnd : endD
    const days = diffDays(fmt(cur), fmt(actualEnd)) + 1
    monthBlocks.push({ label: cur.toLocaleDateString('en', { month: 'short', year: 'numeric' }), days })
    cur = new Date(y, m + 1, 1)
  }

  // Today offset
  const todayOff  = diffDays(vStart, fmt(TODAY))
  const showToday = todayOff >= 0 && todayOff < totalDays

  // Grid lines (month start boundaries, not first one)
  const gridLines: number[] = []
  let gCur = new Date(vStart + 'T00:00:00')
  while (gCur <= endD) {
    const next = new Date(gCur.getFullYear(), gCur.getMonth() + 1, 1)
    if (next <= endD) gridLines.push(diffDays(vStart, fmt(next)) * pxDay)
    gCur = next
  }

  // Dependency arrows
  const arrowPaths = stages.flatMap((s, i) => {
    if (!s.dependsOnStage1) return []
    const predIdx = stages.findIndex(x => x.lineID === s.dependsOnStage1)
    if (predIdx < 0) return []
    const pred = stages[predIdx]
    const x1 = diffDays(vStart, pred.closeDate) * pxDay + pxDay
    const y1 = predIdx * ROW_H + ROW_H / 2
    const x2 = diffDays(vStart, s.startDate) * pxDay
    const y2 = i * ROW_H + ROW_H / 2
    const mx = (x1 + x2) / 2
    return [`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`]
  })

  const issuesByStage = (stageID: number) =>
    issues.filter(i => i.stageID === stageID && !i.closed).length

  return (
    <div className="gantt-wrap">
      {/* Toolbar */}
      <div className="gantt-toolbar">
        <label className="gantt-toolbar__label">Zoom</label>
        <input
          type="range" min={12} max={100} value={pxDay}
          onChange={e => setPxDay(Number(e.target.value))}
          className="gantt-toolbar__zoom"
        />
        <span className="gantt-toolbar__zoom-val">{pxDay} px/day</span>
        <div className="gantt-toolbar__spacer" />
        <label className="gantt-toolbar__label">From</label>
        <input type="date" value={vStart} onChange={e => setVStart(e.target.value)} className="gantt-toolbar__date" />
        <label className="gantt-toolbar__label" style={{ marginLeft: '8px' }}>To</label>
        <input type="date" value={vEnd} onChange={e => setVEnd(e.target.value)} className="gantt-toolbar__date" />
      </div>

      {/* Single scroll container */}
      <div className="gantt-scroll">

        {/* Header row: corner + month blocks (sticky top) */}
        <div className="gantt-hdr-row">
          <div className="gantt-corner">Stage</div>
          <div className="gantt-months" style={{ width: totalWidth }}>
            {monthBlocks.map((b, i) => (
              <div key={i} className="gantt-month" style={{ width: b.days * pxDay }}>
                <span className="gantt-month__label">{b.label}</span>
              </div>
            ))}
            {/* Month dividers — same x as body grid lines for pixel alignment */}
            {gridLines.map((x, i) => (
              <div key={i} className="gantt-hdr-divider" style={{ left: x }} />
            ))}
          </div>
        </div>

        {/* Body row: name column + chart area */}
        <div style={{ display: 'flex' }}>

          {/* Stage name column (sticky left) */}
          <div className="gantt-names-col" style={{ width: NAME_W }}>
            {stages.map((s) => {
              const color = STATUS_COLORS[stageStatus(s)]
              const selected = s.lineID === selectedStageId
              return (
                <div
                  key={s.lineID}
                  className={'gantt-name-row' + (selected ? ' gantt-name-row--selected' : '')}
                  style={{ height: ROW_H }}
                  onClick={() => onSelectStage(selected ? null : s.lineID)}
                >
                  <span className="gantt-name-dot" style={{ background: color }} />
                  <span className="gantt-name-text" title={s.description}>{s.description}</span>
                  {issuesByStage(s.stageID) > 0 && (
                    <span className="gantt-name-issue" title="Has open issues">!</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Chart area */}
          <div
            className="gantt-chart-area"
            style={{ width: totalWidth, height: stages.length * ROW_H }}
          >
            {/* Grid lines */}
            {gridLines.map((x, i) => (
              <div key={i} className="gantt-grid-line" style={{ left: x }} />
            ))}

            {/* Today line */}
            {showToday && (
              <>
                <div className="gantt-today-line" style={{ left: todayOff * pxDay }} />
                <div className="gantt-today-label" style={{ left: todayOff * pxDay + 4 }}>Today</div>
              </>
            )}

            {/* Row backgrounds */}
            {stages.map((s, i) => (
              <div
                key={s.lineID}
                className={'gantt-row' + (s.lineID === selectedStageId ? ' gantt-row--selected' : '')}
                style={{ top: i * ROW_H, height: ROW_H }}
                onClick={() => onSelectStage(s.lineID === selectedStageId ? null : s.lineID)}
              />
            ))}

            {/* Dependency arrows */}
            <svg className="gantt-deps" style={{ width: totalWidth, height: stages.length * ROW_H }}>
              <defs>
                <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <polygon points="0 0,6 3,0 6" fill="#8892B8" />
                </marker>
              </defs>
              {arrowPaths.map((d, i) => (
                <path key={i} d={d} stroke="#8892B8" strokeWidth="1.5" fill="none" markerEnd="url(#arr)" />
              ))}
            </svg>

            {/* Bars */}
            {stages.map((s, i) => (
              <GanttBar
                key={s.lineID}
                stage={s}
                rowIndex={i}
                issues={issuesByStage(s.stageID)}
                pxDay={pxDay}
                vStart={vStart}
                selected={s.lineID === selectedStageId}
                onSelect={id => onSelectStage(id === selectedStageId ? null : id)}
                onChange={onStageChange}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="gantt-legend">
        {(Object.entries(STATUS_COLORS) as [StageStatus, string][]).map(([status, color]) => (
          <div key={status} className="gantt-legend__item">
            <div className="gantt-legend__swatch" style={{ background: color }} />
            <span>{STATUS_LABELS[status]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
