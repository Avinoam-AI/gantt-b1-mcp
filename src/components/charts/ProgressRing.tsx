interface Props {
  /** 0–100 */
  value: number
  size?: number
  stroke?: number
  color?: string
  centerValue?: string
  centerLabel?: string
}

/**
 * Circular progress gauge (a single-value donut). The track is a recessive
 * surface step; the arc carries the value and animates in. Value is also shown
 * as text in the center, so meaning never rests on the arc length alone.
 */
export function ProgressRing({
  value, size = 128, stroke = 13, color = 'var(--accent)', centerValue, centerLabel,
}: Props) {
  const pct = Math.max(0, Math.min(100, value))
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const filled = (pct / 100) * circ
  const valueFont = Math.round(size * 0.22) // scales the center number with the ring

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} role="img" aria-label={`${Math.round(pct)} percent complete`}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--surface3)" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={circ / 4}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ['--ring-circ' as any]: circ,
            animation: 'drawRing var(--t-slow) var(--ease)',
            transition: 'stroke-dasharray var(--t-slow) var(--ease)',
          }}
        />
      </svg>
      <div className="ring-center" style={{ position: 'absolute', inset: 0, justifyContent: 'center' }}>
        <span className="ring-center__value" style={{ fontSize: valueFont }}>{centerValue ?? `${Math.round(pct)}%`}</span>
        {centerLabel && <span className="ring-center__label">{centerLabel}</span>}
      </div>
    </div>
  )
}
