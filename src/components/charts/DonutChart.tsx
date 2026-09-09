interface Segment {
  label: string
  value: number
  color: string
}

interface Props {
  segments: Segment[]
  size?: number
  stroke?: number
  centerValue?: string
  centerLabel?: string
}

/**
 * Donut of categorical parts. Segments are separated by a 2px surface-color gap
 * (the data-viz spacer, not a stroke). Identity is carried by the legend rows
 * the parent renders alongside — never by color alone.
 */
export function DonutChart({ segments, size = 128, stroke = 18, centerValue, centerLabel }: Props) {
  const parts = segments.filter(s => s.value > 0)
  const total = parts.reduce((sum, s) => sum + s.value, 0)
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const gap = parts.length > 1 ? 2 : 0 // 2px surface gap between touching arcs

  let cumulative = 0
  const arcs = parts.map((s, i) => {
    const arcLen = (s.value / total) * circ
    const drawn = Math.max(arcLen - gap, 0.5)
    const dashoffset = -cumulative
    cumulative += arcLen
    return (
      <circle
        key={i}
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={s.color} strokeWidth={stroke}
        strokeDasharray={`${drawn} ${circ - drawn}`}
        strokeDashoffset={dashoffset}
      />
    )
  })

  const label = parts.map(s => `${s.label}: ${s.value}`).join(', ')

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size} height={size}
        transform={`rotate(-90 0 0)`}
        style={{ transform: 'rotate(-90deg)' }}
        role="img" aria-label={`Distribution — ${label}`}
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={stroke} />
        {total > 0 && arcs}
      </svg>
      {(centerValue || centerLabel) && (
        <div className="ring-center" style={{ position: 'absolute', inset: 0, justifyContent: 'center' }}>
          {centerValue && <span className="ring-center__value">{centerValue}</span>}
          {centerLabel && <span className="ring-center__label">{centerLabel}</span>}
        </div>
      )}
    </div>
  )
}
