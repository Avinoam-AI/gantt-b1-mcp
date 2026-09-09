import type { B1Project } from '../types/b1'
import { STATUS_COLORS, STATUS_GLYPHS, STATUS_LABELS } from '../types/b1'
import { analyzeProject } from '../lib/analytics'
import { fmtMoney, fmtMoneyCompact } from '../lib/format'
import { Icon } from './Icon'
import { StatTile } from './charts/StatTile'
import { ProgressRing } from './charts/ProgressRing'
import { DonutChart } from './charts/DonutChart'
import { BarChart } from './charts/BarChart'

interface Props {
  project: B1Project
}

export function AnalyticsView({ project }: Props) {
  const a = analyzeProject(project)

  const ahead = a.scheduleVariance >= 0
  const variancePts = Math.abs(Math.round(a.scheduleVariance))

  // Donut + legend share the same per-status data
  const donutSegments = a.byStatus.map(b => ({
    label: STATUS_LABELS[b.status],
    value: b.count,
    color: STATUS_COLORS[b.status],
  }))

  // Budget-by-stage bars, colored by status, largest first
  const barRows = a.costByStage.map(c => ({
    label: c.stage.description,
    value: c.cost,
    valueLabel: fmtMoney(c.cost),
    color: STATUS_COLORS[c.status],
  }))

  return (
    <div className="analytics">
      {/* KPI stat tiles */}
      <div className="stat-row">
        <StatTile
          icon="wallet" tone="accent" label="Total budget"
          value={fmtMoneyCompact(a.totalBudget)}
          sub={<><strong>{a.stagesTotal}</strong> stages · {fmtMoney(a.avgStageCost)} avg</>}
        />
        <StatTile
          icon="coins" tone="success" label="Committed"
          value={fmtMoneyCompact(a.committedCost)}
          sub={<><strong>{Math.round(a.committedPct)}%</strong> of budget booked</>}
        />
        <StatTile
          icon="piggy" tone="muted" label="Remaining"
          value={fmtMoneyCompact(a.remainingCost)}
          sub={<>on {a.stagesTotal - a.stagesDone} open stage{a.stagesTotal - a.stagesDone !== 1 ? 's' : ''}</>}
        />
        <StatTile
          icon="target" tone="accent" label="Completion"
          value={`${Math.round(a.overallPct)}%`}
          sub={
            <span className={ahead ? 'stat-tile__sub--success' : 'stat-tile__sub--danger'}>
              {variancePts === 0 ? 'On plan' : `${variancePts} pts ${ahead ? 'ahead of' : 'behind'} plan`}
            </span>
          }
        />
        <StatTile
          icon="layers" tone="accent" label="Stages done"
          value={`${a.stagesDone}/${a.stagesTotal}`}
          sub={a.atRiskCount > 0 ? <span className="stat-tile__sub--danger">{a.atRiskCount} at risk</span> : <>all on track</>}
        />
        <StatTile
          icon="alert" tone={a.openIssues > 0 ? 'danger' : 'muted'} label="Open issues"
          value={a.openIssues}
          sub={a.openIssues > 0 ? <><strong>{a.issuesByPriority[0].count}</strong> high priority</> : <>none open</>}
        />
      </div>

      <div className="panel-grid">
        {/* Completion & schedule */}
        <div className="panel">
          <div className="panel__head">
            <div className="panel__title">Completion &amp; schedule</div>
            <div className="panel__subtitle">Progress against the planned timeline</div>
          </div>
          <div className="ring-wrap">
            <ProgressRing value={a.overallPct} centerLabel="complete" />
            <div className="ring-legend">
              <div className="ring-stat">
                <span className="ring-stat__value">{Math.round(a.elapsedPct)}%</span>
                <span className="ring-stat__label">Timeline elapsed</span>
              </div>
              <div className="ring-stat">
                <span className="ring-stat__value" style={{ color: ahead ? 'var(--success)' : 'var(--danger)' }}>
                  {ahead ? '+' : '−'}{variancePts} pts
                </span>
                <span className="ring-stat__label">{ahead ? 'Ahead of plan' : 'Behind plan'}</span>
              </div>
              <div className="ring-stat">
                <span className="ring-stat__value">{a.elapsedDays} / {a.durationDays} d</span>
                <span className="ring-stat__label">Days elapsed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stage status distribution */}
        <div className="panel">
          <div className="panel__head">
            <div className="panel__title">Stage status</div>
            <div className="panel__subtitle">{a.stagesTotal} stages by current state</div>
          </div>
          <div className="ring-wrap">
            <DonutChart segments={donutSegments} centerValue={String(a.stagesTotal)} centerLabel="stages" />
            <div className="legend-rows">
              {a.byStatus.map(b => (
                <div className="legend-row" key={b.status}>
                  <span className="legend-row__key" style={{ background: STATUS_COLORS[b.status] }}>
                    {STATUS_GLYPHS[b.status]}
                  </span>
                  <span className="legend-row__label">{STATUS_LABELS[b.status]}</span>
                  <span className="legend-row__value">{b.count}</span>
                  <span className="legend-row__pct">{fmtMoneyCompact(b.cost)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget by stage */}
        <div className="panel panel--wide">
          <div className="panel__head">
            <div className="panel__title">Budget by stage</div>
            <div className="panel__subtitle">Expected cost per stage · colored by status</div>
          </div>

          {/* Committed vs remaining split */}
          <div className="meter" role="img" aria-label={`Committed ${fmtMoney(a.committedCost)} of ${fmtMoney(a.totalBudget)}`}>
            <div className="meter__seg" style={{ width: `${a.committedPct}%`, background: 'var(--success)' }} />
            <div className="meter__seg" style={{ width: `${100 - a.committedPct}%`, background: 'var(--accent)' }} />
          </div>
          <div className="meter-legend">
            <span className="meter-legend__item">
              <span className="meter-legend__key" style={{ background: 'var(--success)' }} />
              Committed <strong>{fmtMoney(a.committedCost)}</strong>
            </span>
            <span className="meter-legend__item">
              <span className="meter-legend__key" style={{ background: 'var(--accent)' }} />
              Remaining <strong>{fmtMoney(a.remainingCost)}</strong>
            </span>
          </div>

          <div style={{ height: 16 }} />
          <BarChart rows={barRows} />
        </div>

        {/* Attention needed */}
        <div className="panel panel--wide">
          <div className="panel__head">
            <div className="panel__title">Attention needed</div>
            <div className="panel__subtitle">
              {a.overdueCount > 0
                ? `${a.overdueCount} overdue stage${a.overdueCount !== 1 ? 's' : ''}`
                : 'No overdue stages'}
              {a.atRiskCount > 0 ? ` · ${a.atRiskCount} at risk` : ''}
            </div>
          </div>
          <div className="callouts">
            {a.alerts.length === 0 && (
              <div className="callout callout--empty">
                <Icon name="check" size={16} />
                On schedule — nothing is overdue
              </div>
            )}
            {a.alerts.map(al => (
              <div className="callout" key={al.stage.lineID}>
                <span className="callout__badge" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                  <Icon name="clock" size={12} /> OVERDUE
                </span>
                <span className="callout__name">{al.stage.description}</span>
                <span className="callout__meta">{al.daysOverdue} day{al.daysOverdue !== 1 ? 's' : ''} late</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
