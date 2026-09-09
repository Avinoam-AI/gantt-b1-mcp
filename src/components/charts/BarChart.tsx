interface BarRow {
  label: string
  value: number
  valueLabel: string
  color: string
}

interface Props {
  rows: BarRow[]
  /** Optional explicit max; defaults to the largest value. */
  max?: number
}

/**
 * Horizontal bars for magnitude (budget by stage). Value is labeled at the row
 * head (text in ink, never in the bar color); the bar carries only magnitude.
 */
export function BarChart({ rows, max }: Props) {
  const peak = max ?? Math.max(1, ...rows.map(r => r.value))
  return (
    <div className="hbar">
      {rows.map((r, i) => (
        <div className="hbar-row" key={i}>
          <div className="hbar-row__top">
            <span className="hbar-row__name" title={r.label}>{r.label}</span>
            <span className="hbar-row__val">{r.valueLabel}</span>
          </div>
          <div className="hbar-track">
            <div
              className="hbar-fill"
              style={{ width: `${(r.value / peak) * 100}%`, background: r.color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
