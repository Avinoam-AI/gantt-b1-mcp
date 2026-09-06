import { Option, Select } from '@ui5/webcomponents-react'
import type { B1ProjectSummary } from '../types/b1'

interface Props {
  projects: B1ProjectSummary[]
  loading: boolean
  selectedId: number | null
  onChange: (id: number) => void
}

export function ProjectPicker({ projects, loading, selectedId, onChange }: Props) {
  return (
    <Select
      disabled={loading || projects.length === 0}
      style={{ minWidth: '320px' }}
      onChange={e => {
        const val = e.detail.selectedOption.value
        if (val) onChange(Number(val))
      }}
    >
      {!selectedId && (
        <Option value="" selected={!selectedId}>
          {loading ? 'Loading projects…' : 'Select a project…'}
        </Option>
      )}
      {projects.map(p => (
        <Option
          key={p.absEntry}
          value={String(p.absEntry)}
          selected={p.absEntry === selectedId}
        >
          {p.projectName} · {p.businessPartnerName}
        </Option>
      ))}
    </Select>
  )
}
