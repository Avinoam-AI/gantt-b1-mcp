import { useCallback, useRef } from 'react'
import { type B1Stage, STATUS_COLORS, stageStatus } from '../types/b1'

const ROW_H = 46
const BAR_TOP = 9

interface Props {
  stage: B1Stage
  rowIndex: number
  issues: number
  pxDay: number
  vStart: string
  selected: boolean
  onSelect: (lineID: number) => void
  onChange: (stage: B1Stage) => void
}

function diffDays(a: string, b: string): number {
  return Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000)
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function fmtDate(s: string): string {
  return new Date(s + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function GanttBar({ stage, rowIndex, issues, pxDay, vStart, selected, onSelect, onChange }: Props) {
  const status  = stageStatus(stage)
  const color   = STATUS_COLORS[status]
  const offDays = diffDays(vStart, stage.startDate)
  const durDays = Math.max(1, diffDays(stage.startDate, stage.closeDate) + 1)
  const left    = offDays * pxDay
  const width   = Math.max(durDays * pxDay, 10)
  const top     = rowIndex * ROW_H + BAR_TOP

  // Keep latest stage in a ref so drag callbacks never go stale
  const stageRef = useRef(stage)
  stageRef.current = stage

  const dragRef = useRef<{ type: string; startX: number; origStart: string; origEnd: string } | null>(null)
  const barRef  = useRef<HTMLDivElement>(null)

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current) return
    const { type, startX, origStart, origEnd } = dragRef.current
    const dd = Math.round((e.clientX - startX) / pxDay)
    let newStart = origStart
    let newEnd   = origEnd
    if (type === 'move') {
      newStart = addDays(origStart, dd)
      newEnd   = addDays(origEnd,   dd)
    } else if (type === 'resize-right') {
      const ne = addDays(origEnd, dd)
      if (ne >= origStart) newEnd = ne
    } else if (type === 'resize-left') {
      const ns = addDays(origStart, dd)
      if (ns <= origEnd) newStart = ns
    }
    onChange({ ...stageRef.current, startDate: newStart, closeDate: newEnd })
  }, [pxDay, onChange])

  const onMouseUp = useCallback(() => {
    dragRef.current = null
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    barRef.current?.classList.remove('gantt-bar--dragging')
  }, [onMouseMove])

  const startDrag = useCallback((type: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = { type, startX: e.clientX, origStart: stageRef.current.startDate, origEnd: stageRef.current.closeDate }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    barRef.current?.classList.add('gantt-bar--dragging')
  }, [onMouseMove, onMouseUp])

  // Tooltip state
  const ttRef = useRef<HTMLDivElement>(null)
  const span = durDays + ' day' + (durDays !== 1 ? 's' : '')

  const showTip = (e: React.MouseEvent) => {
    if (!ttRef.current) return
    ttRef.current.style.display = 'block'
    moveTip(e)
  }
  const moveTip = (e: React.MouseEvent) => {
    if (!ttRef.current) return
    ttRef.current.style.left = (e.clientX + 14) + 'px'
    ttRef.current.style.top  = (e.clientY - 10) + 'px'
  }
  const hideTip = () => { if (ttRef.current) ttRef.current.style.display = 'none' }

  return (
    <>
      {/* Tooltip — rendered at document root via portal-like positioning */}
      <div
        ref={ttRef}
        className="gantt-tooltip"
        style={{ display: 'none' }}
      >
        <div className="gantt-tooltip__name">{stage.description}</div>
        <div className="gantt-tooltip__row">Dates: <span>{fmtDate(stage.startDate)} → {fmtDate(stage.closeDate)}</span></div>
        <div className="gantt-tooltip__row">Duration: <span>{span}</span></div>
        <div className="gantt-tooltip__row">Progress: <span>{stage.percentualCompletness}%</span></div>
        <div className="gantt-tooltip__row">Status: <span style={{ color }}>{status}</span></div>
      </div>

      <div
        ref={barRef}
        className={'gantt-bar' + (selected ? ' gantt-bar--selected' : '')}
        style={{ left, width, top, background: color + 'cc' }}
        onMouseDown={e => { if (!(e.target as HTMLElement).classList.contains('gantt-bar__rh')) startDrag('move', e) }}
        onClick={() => onSelect(stage.lineID)}
        onMouseEnter={showTip}
        onMouseMove={moveTip}
        onMouseLeave={hideTip}
      >
        {/* Left resize handle */}
        <div className="gantt-bar__rh gantt-bar__rh--left" onMouseDown={e => startDrag('resize-left', e)} />
        {/* Progress fill */}
        <div className="gantt-bar__progress" style={{ width: stage.percentualCompletness + '%', background: color }} />
        {/* Label */}
        <span className="gantt-bar__label">{stage.description}</span>
        {/* Issue dot */}
        {issues > 0 && <span className="gantt-bar__issue" title={`${issues} open issue(s)`} />}
        {/* Finished dot */}
        {stage.isFinished && <span className="gantt-bar__fin" title="Finished" />}
        {/* Right resize handle */}
        <div className="gantt-bar__rh gantt-bar__rh--right" onMouseDown={e => startDrag('resize-right', e)} />
      </div>
    </>
  )
}
