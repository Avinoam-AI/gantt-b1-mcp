import { Button, ShellBar } from '@ui5/webcomponents-react'
import { useEffect, useState } from 'react'
import { useProject } from './hooks/useProject'
import { useProjects } from './hooks/useProjects'
import { GanttChart } from './components/GanttChart'
import { IssueList } from './components/IssueList'
import { ProjectPicker } from './components/ProjectPicker'
import { StageEditor } from './components/StageEditor'
import { DEMO_MODE } from './api/client'
import type { B1Project } from './types/b1'

function fmtDate(s: string) {
  if (!s) return '—'
  return new Date(s + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusLabel(s: string) {
  return s?.replace('pst_', '') ?? '—'
}

function ProjectHeader({ project }: { project: B1Project }) {
  const open   = project.issues.filter(i => !i.closed).length
  const done   = project.stages.filter(s => s.isFinished).length
  const pct    = project.finishedPercent ?? 0

  return (
    <div className="proj-header">
      <div className="proj-header__left">
        <div className="proj-header__name">{project.projectName}</div>
        <div className="proj-header__customer">{project.businessPartnerName}</div>
      </div>
      <div className="proj-header__kpis">
        <div className="proj-kpi">
          <span className="proj-kpi__label">Status</span>
          <span className="proj-kpi__value proj-kpi__value--status">{statusLabel(project.projectStatus)}</span>
        </div>
        <div className="proj-kpi">
          <span className="proj-kpi__label">Start</span>
          <span className="proj-kpi__value">{fmtDate(project.startDate)}</span>
        </div>
        <div className="proj-kpi">
          <span className="proj-kpi__label">Due</span>
          <span className="proj-kpi__value">{fmtDate(project.dueDate)}</span>
        </div>
        <div className="proj-kpi">
          <span className="proj-kpi__label">Progress</span>
          <span className="proj-kpi__value">{pct}%</span>
        </div>
        <div className="proj-kpi">
          <span className="proj-kpi__label">Stages</span>
          <span className="proj-kpi__value">{done}/{project.stages.length}</span>
        </div>
        {open > 0 && (
          <div className="proj-kpi proj-kpi--warn">
            <span className="proj-kpi__label">Issues</span>
            <span className="proj-kpi__value">{open} open</span>
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
  const [darkMode, setDarkMode] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const [demoBannerDismissed,    setDemoBannerDismissed]    = useState(false)
  const [finishedNoticeDismissed, setFinishedNoticeDismissed] = useState(false)
  const [dismissedIssues,         setDismissedIssues]         = useState<Set<number>>(new Set())

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
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
        <div style={{ flex: 1 }} />
        <Button icon="add" disabled={!project} onClick={addStage}>Add Stage</Button>
        <Button icon="download" disabled={!project} onClick={exportCSV}>Export CSV</Button>
        <Button
          icon={darkMode ? 'sap-icon://light-mode' : 'sap-icon://dark-mode'}
          design="Transparent"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onClick={() => setDarkMode(d => !d)}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
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
              <div className="app__empty-icon">📊</div>
              <div className="app__empty-title">No project selected</div>
              <div className="app__empty-hint">Choose a project from the toolbar above to view its Gantt chart.</div>
            </div>
          </div>
        )}

        {loadingProject && (
          <div className="app__empty">
            <div className="app__empty-card">
              <div className="app__empty-hint">Loading project…</div>
            </div>
          </div>
        )}

        {project && (
          <>
            {project.issues.some(i => !i.closed && !dismissedIssues.has(i.lineID)) && (
              <IssueList
                issues={project.issues.filter(i => !dismissedIssues.has(i.lineID))}
                onClose={handleDismissIssue}
              />
            )}

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
          </>
        )}
      </div>
    </div>
  )
}
