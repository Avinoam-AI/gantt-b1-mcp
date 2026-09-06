import { Button, Switch } from '@ui5/webcomponents-react'
import { type B1Issue, type B1Stage, STATUS_COLORS, stageStatus } from '../types/b1'

interface Props {
  stage: B1Stage
  issues: B1Issue[]
  onChange: (s: B1Stage) => void
  onDelete: (lineID: number) => void
  onClose: () => void
}

export function StageEditor({ stage, issues, onChange, onDelete, onClose }: Props) {
  const status = stageStatus(stage)
  const color  = STATUS_COLORS[status]
  const stageIssues = issues.filter(i => i.stageID === stage.stageID && !i.closed)

  return (
    <div className="stage-editor">
      {/* Header */}
      <div className="stage-editor__hdr">
        <div className="stage-editor__status-dot" style={{ background: color }} />
        <span className="stage-editor__title">Edit Stage</span>
        <Button icon="decline" design="Transparent" onClick={onClose} />
      </div>

      <div className="stage-editor__body">
        {/* Description */}
        <div className="stage-editor__field">
          <span className="stage-editor__field-label">Description</span>
          <input
            type="text"
            value={stage.description}
            onChange={e => onChange({ ...stage, description: e.target.value })}
            className="stage-editor__input"
          />
        </div>

        {/* Dates */}
        <div className="stage-editor__row">
          <div className="stage-editor__field" style={{ flex: 1 }}>
            <span className="stage-editor__field-label">Start</span>
            <input
              type="date"
              value={stage.startDate}
              onChange={e => onChange({ ...stage, startDate: e.target.value })}
              className="stage-editor__input"
            />
          </div>
          <div className="stage-editor__field" style={{ flex: 1 }}>
            <span className="stage-editor__field-label">Close</span>
            <input
              type="date"
              value={stage.closeDate}
              onChange={e => onChange({ ...stage, closeDate: e.target.value })}
              className="stage-editor__input"
            />
          </div>
        </div>

        {/* Progress */}
        <div className="stage-editor__field">
          <span className="stage-editor__field-label">Progress: {stage.percentualCompletness}%</span>
          <input
            type="range"
            min={0} max={100} step={5}
            value={stage.percentualCompletness}
            onChange={e => onChange({ ...stage, percentualCompletness: Number(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent)', margin: '2px 0' }}
          />
        </div>

        {/* Finished */}
        <div className="stage-editor__switch-row">
          <span className="stage-editor__field-label">Finished</span>
          <Switch
            checked={stage.isFinished}
            onChange={e => onChange({ ...stage, isFinished: (e.detail as { checked: boolean }).checked })}
          />
        </div>

        {/* Expected cost */}
        <div className="stage-editor__field">
          <span className="stage-editor__field-label">Expected Cost</span>
          <input
            type="number"
            value={stage.expectedCosts}
            onChange={e => onChange({ ...stage, expectedCosts: Number(e.target.value) })}
            className="stage-editor__input"
          />
        </div>

        {/* Open issues */}
        {stageIssues.length > 0 && (
          <div className="stage-editor__issues">
            <span className="stage-editor__field-label">Open Issues</span>
            {stageIssues.map(i => (
              <div key={i.lineID} className="stage-editor__issue">
                <span className="stage-editor__issue-prio">P{i.priority}</span>
                {i.remarks}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="stage-editor__footer">
        <Button design="Negative" onClick={() => { if (confirm('Delete this stage?')) onDelete(stage.lineID) }}>
          Delete
        </Button>
        <Button design="Transparent" onClick={onClose}>Close</Button>
      </div>
    </div>
  )
}
