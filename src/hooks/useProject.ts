import { useCallback, useEffect, useState } from 'react'
import { fetchProject, patchProject } from '../api/client'
import type { B1Project, B1Stage } from '../types/b1'

export function useProject(absEntry: number | null) {
  const [project, setProject] = useState<B1Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (absEntry == null) { setProject(null); return }
    setLoading(true)
    setDirty(false)
    fetchProject(absEntry)
      .then(setProject)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [absEntry])

  const updateStage = useCallback((updated: B1Stage) => {
    setProject(p => {
      if (!p) return p
      return { ...p, stages: p.stages.map(s => s.lineID === updated.lineID ? updated : s) }
    })
    setDirty(true)
  }, [])

  const deleteStage = useCallback((lineID: number) => {
    setProject(p => {
      if (!p) return p
      return {
        ...p,
        stages: p.stages
          .filter(s => s.lineID !== lineID)
          .map(s => s.dependsOnStage1 === lineID ? { ...s, dependsOnStage1: null } : s),
      }
    })
    setDirty(true)
  }, [])

  const addStage = useCallback(() => {
    setProject(p => {
      if (!p) return p
      const last = p.stages[p.stages.length - 1]
      const nextId = Math.max(...p.stages.map(s => s.lineID), 0) + 1
      const startDate = last?.closeDate ?? new Date().toISOString().slice(0, 10)
      const closeDate = addDays(startDate, 7)
      const newStage: B1Stage = {
        lineID: nextId, stageID: nextId,
        description: 'New Stage',
        startDate, closeDate,
        percentualCompletness: 0,
        isFinished: false,
        dependsOnStage1: last?.lineID ?? null,
        expectedCosts: 0,
      }
      return { ...p, stages: [...p.stages, newStage] }
    })
    setDirty(true)
  }, [])

  const save = useCallback(async () => {
    if (!project || !dirty) return
    setSaving(true)
    setSaveError(null)
    try {
      await patchProject(project.absEntry, project.stages)
      setDirty(false)
    } catch (e) {
      setSaveError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }, [project, dirty])

  return { project, loading, dirty, saving, error, saveError, clearSaveError: () => setSaveError(null), updateStage, deleteStage, addStage, save }
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
