import { MessageStrip } from '@ui5/webcomponents-react'
import type { B1Issue } from '../types/b1'

interface Props {
  issues: B1Issue[]
  onClose: (lineID: number) => void
}

export function IssueList({ issues, onClose }: Props) {
  const open = issues.filter(i => !i.closed)
  if (open.length === 0) return null

  return (
    <div className="issue-list">
      {open.map(i => (
        <MessageStrip
          key={i.lineID}
          design={i.priority === 1 ? 'Negative' : i.priority === 2 ? 'Critical' : 'Information'}
          onClose={() => onClose(i.lineID)}
          style={{ marginBottom: '6px' }}
        >
          <strong>P{i.priority}</strong> · Stage {i.stageID}: {i.remarks}
        </MessageStrip>
      ))}
    </div>
  )
}
