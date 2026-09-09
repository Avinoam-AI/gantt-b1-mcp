import type { ReactNode } from 'react'
import { Icon, type IconName } from '../Icon'

type Tone = 'accent' | 'success' | 'warn' | 'danger' | 'muted'

interface Props {
  icon: IconName
  label: string
  value: ReactNode
  sub?: ReactNode
  tone?: Tone
}

/**
 * Stat tile — label · value · optional sub-line. The value uses proportional
 * figures (per the data-viz mark spec for large standalone numbers).
 */
export function StatTile({ icon, label, value, sub, tone = 'accent' }: Props) {
  return (
    <div className="stat-tile">
      <div className="stat-tile__head">
        <div className={`stat-tile__icon stat-tile__icon--${tone}`}>
          <Icon name={icon} size={16} />
        </div>
        <span className="stat-tile__label">{label}</span>
      </div>
      <div className="stat-tile__value">{value}</div>
      {sub && <div className="stat-tile__sub">{sub}</div>}
    </div>
  )
}
