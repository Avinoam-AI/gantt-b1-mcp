import { Button, ShellBar } from '@ui5/webcomponents-react'
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme.js'
import { useEffect, useState } from 'react'
import { useProject } from './hooks/useProject'
import { useProjects } from './hooks/useProjects'
import { GanttChart } from './components/GanttChart'
import { AnalyticsView } from './components/AnalyticsView'
import { IssueList } from './components/IssueList'
import { ProjectPicker } from './components/ProjectPicker'
import { StageEditor } from './components/StageEditor'
import { Icon } from './components/Icon'
import { ProgressRing } from './components/charts/ProgressRing'
import { fmtDate, fmtMoneyCompact } from './lib/format'
import { DEMO_MODE } from './api/client'
import type { B1Project } from './types/b1'

type View = 'timeline' | 'analytics'

function statusLabel(s: string) {
  return s?.replace('pst_', '') ?? '—'
}

function statusTone(s: string): { bg: string; fg: string } {
  if (/finish/i.test(s)) return { bg: 'var(--success-bg)', fg: 'var(--success)' }
  if (/stop|pause|hold/i.test(s)) return { bg: 'var(--warn-bg)', fg: 'var(--warn)' }
  return { bg: 'var(--accent-bg)', fg: 'var(--accent)' }
}

function ProjectHeader({ project }: { project: B1Project }) {
  const open   = project.issues.filter(i => !i.closed).length
  const done   = project.stages.filter(s => s.isFinished).length
  const budget = project.stages.reduce((sum, s) => sum + (s.expectedCosts || 0), 0)
  const pct    = project.finishedPercent ?? 0
  const tone   = statusTone(project.projectStatus)

  return (
    <div className="proj-header">
      <div className="proj-header__top">
        <div className="proj-header__ring">
          <ProgressRing value={pct} size={58} stroke={7} centerLabel="" />
        </div>
        <div className="proj-header__id">
          <div className="proj-header__name">{project.projectName}</div>
          <div className="proj-header__customer">
            <Icon name="building" size={13} />
            {project.businessPartnerName || '—'}
          </div>
        </div>
        <span className="status-pill" style={{ background: tone.bg, color: tone.fg }}>
          <span className="status-pill__dot" style={{ background: tone.fg }} />
          {statusLabel(project.projectStatus)}
        </span>
      </div>

      <div className="proj-header__kpis">
        <div className="kpi-card">
          <div className="kpi-card__icon"><Icon name="calendar" size={17} /></div>
          <div className="kpi-card__body">
            <span className="kpi-card__value">{fmtDate(project.startDate)}</span>
            <span className="kpi-card__label">Start</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card__icon"><Icon name="flag" size={17} /></div>
          <div className="kpi-card__body">
            <span className="kpi-card__value">{fmtDate(project.dueDate)}</span>
            <span className="kpi-card__label">Due</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card__icon"><Icon name="wallet" size={17} /></div>
          <div className="kpi-card__body">
            <span className="kpi-card__value">{fmtMoneyCompact(budget)}</span>
            <span className="kpi-card__label">Budget</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card__icon kpi-card__icon--success"><Icon name="layers" size={17} /></div>
          <div className="kpi-card__body">
            <span className="kpi-card__value">{done}/{project.stages.length}</span>
            <span className="kpi-card__label">Stages done</span>
          </div>
        </div>
        {open > 0 && (
          <div className="kpi-card">
            <div className="kpi-card__icon kpi-card__icon--danger"><Icon name="alert" size={17} /></div>
            <div className="kpi-card__body">
              <span className="kpi-card__value">{open}</span>
              <span className="kpi-card__label">Open issues</span>
            </div>
          </div>
        )}
      </div>

      <div className="proj-header__bar">
        <div className="proj-header__bar-fill" style={{ width: pct + '%' }} />
      </div>
    </div>
  )
}

export default function App() {
  const { projects, loading: loadingProjects } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [selectedStageId,   setSelectedStageId]   = useState<number | null>(null)
  const [view, setView] = useState<View>('timeline')
  const [darkMode, setDarkMode] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const [demoBannerDismissed,    setDemoBannerDismissed]    = useState(false)
  const [finishedNoticeDismissed, setFinishedNoticeDismissed] = useState(false)
  const [dismissedIssues,         setDismissedIssues]         = useState<Set<number>>(new Set())

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    // Keep the SAP Fiori components (ShellBar, buttons, select…) in step with our theme.
    setTheme(darkMode ? 'sap_horizon_dark' : 'sap_horizon')
  }, [darkMode])

  const { project, loading: loadingProject, dirty, saving, saveError, clearSaveError, updateStage, deleteStage, addStage, save } =
    useProject(selectedProjectId)

  const hasFinishedStage = project?.stages.some(s => s.isFinished) ?? false
  const selectedStage = project?.stages.find(s => s.lineID === selectedStageId) ?? null

  const handleProjectChange = (id: number) => {
    setSelectedProjectId(id)
    setSelectedStageId(null)
    setFinishedNoticeDismissed(false)
    setDismissedIssues(new Set())
  }

  const handleDismissIssue = (lineID: number) =>
    setDismissedIssues(prev => new Set([...prev, lineID]))

  const handleDeleteStage = (lineID: number) => {
    deleteStage(lineID)
    setSelectedStageId(null)
  }

  const exportCSV = () => {
    if (!project) return
    const header = 'Stage,Start,Close,Days,Progress (%),Finished,Predecessor,Expected Cost\n'
    const rows = project.stages.map(s => {
      const days = Math.round((new Date(s.closeDate).getTime() - new Date(s.startDate).getTime()) / 86400000) + 1
      return `"${s.description}",${s.startDate},${s.closeDate},${days},${s.percentualCompletness},${s.isFinished},${s.dependsOnStage1 ?? ''},${s.expectedCosts}`
    }).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([header + rows], { type: 'text/csv' }))
    a.download = `b1_${project.projectName.replace(/\s+/g, '_')}_stages.csv`
    a.click()
  }

  return (
    <div className="app">
      <ShellBar
        primaryTitle="B1 Project Gantt"
        secondaryTitle="Project management for SAP Business One"
        logo={<img src="https://www.sap.com/content/dam/application/shared/logos/sap-logo-svg.svg" alt="SAP" height={32} />}
      />

      {DEMO_MODE && !demoBannerDismissed && (
        <div className="save-bar save-bar--info" style={{ justifyContent: 'center' }}>
          <span>Demo mode — sample data only. All edits are local to this session and not saved to SAP Business One.</span>
          <Button icon="decline" design="Transparent" title="Dismiss" onClick={() => setDemoBannerDismissed(true)} />
        </div>
      )}

      {/* App toolbar */}
      <div className="app__toolbar">
        <span className="app__toolbar-label">Project</span>
        <ProjectPicker
          projects={projects}
          loading={loadingProjects}
          selectedId={selectedProjectId}
          onChange={handleProjectChange}
        />

        {project && (
          <div className="seg" role="tablist" aria-label="View">
            <button
              role="tab" aria-selected={view === 'timeline'}
              className={'seg__btn' + (view === 'timeline' ? ' seg__btn--active' : '')}
              onClick={() => setView('timeline')}
            >
              <Icon name="timeline" size={14} /> Timeline
            </button>
            <button
              role="tab" aria-selected={view === 'analytics'}
              className={'seg__btn' + (view === 'analytics' ? ' seg__btn--active' : '')}
              onClick={() => setView('analytics')}
            >
              <Icon name="analytics" size={14} /> Analytics
            </button>
          </div>
        )}

        <div style={{ flex: 1 }} />
        {view === 'timeline' && (
          <Button icon="add" disabled={!project} onClick={addStage}>Add Stage</Button>
        )}
        <Button icon="download" disabled={!project} onClick={exportCSV}>Export CSV</Button>
        <Button
          icon={darkMode ? 'light-mode' : 'dark-mode'}
          design="Transparent"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onClick={() => setDarkMode(d => !d)}
        >
          {darkMode ? 'Light' : 'Dark'}
        </Button>
      </div>

      {/* Project KPI header */}
      {project && <ProjectHeader project={project} />}

      {/* Save bar */}
      {dirty && (
        <div className="save-bar">
          <span>Unsaved changes</span>
          <Button design="Emphasized" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : DEMO_MODE ? 'Save (Demo)' : 'Save to B1'}
          </Button>
        </div>
      )}

      {/* Save error */}
      {saveError && (
        <div className="save-bar save-bar--error">
          <span>{saveError}</span>
          <Button icon="decline" design="Transparent" title="Dismiss" onClick={clearSaveError} />
        </div>
      )}

      {/* B1 finished-stage lock notice */}
      {project && hasFinishedStage && !saveError && !finishedNoticeDismissed && (
        <div className="save-bar save-bar--info">
          <span>This project has a finished stage — SAP B1 locks the stage list, so edits here can be explored but not saved back.</span>
          <Button icon="decline" design="Transparent" title="Dismiss" onClick={() => setFinishedNoticeDismissed(true)} />
        </div>
      )}

      <div className="app__content">
        {!project && !loadingProject && (
          <div className="app__empty">
            <div className="app__empty-card">
              <div className="app__empty-icon"><Icon name="analytics" size={30} /></div>
              <div className="app__empty-title">No project selected</div>
              <div className="app__empty-hint">Choose a project from the toolbar above to view its Gantt timeline and budget analytics.</div>
            </div>
          </div>
        )}

        {loadingProject && (
          <div className="skeleton-wrap">
            <div className="skel" style={{ height: 92 }} />
            <div className="skel" style={{ flex: 1 }} />
          </div>
        )}

        {project && !loadingProject && (
          <>
            {view === 'timeline' && project.issues.some(i => !i.closed && !dismissedIssues.has(i.lineID)) && (
              <IssueList
                issues={project.issues.filter(i => !dismissedIssues.has(i.lineID))}
                onClose={handleDismissIssue}
              />
            )}

            {view === 'analytics' ? (
              <AnalyticsView project={project} />
            ) : (
              <div className="app__workspace">
                <div className="app__gantt">
                  <GanttChart
                    key={project.absEntry}
                    stages={project.stages}
                    issues={project.issues}
                    selectedStageId={selectedStageId}
                    onSelectStage={setSelectedStageId}
                    onStageChange={updateStage}
                  />
                </div>

                {selectedStage && (
                  <div className="app__editor">
                    <StageEditor
                      stage={selectedStage}
                      issues={project.issues}
                      onChange={updateStage}
                      onDelete={handleDeleteStage}
                      onClose={() => setSelectedStageId(null)}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
