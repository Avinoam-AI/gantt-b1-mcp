import { useEffect, useState } from 'react'
import { fetchProjects } from '../api/client'
import type { B1ProjectSummary } from '../types/b1'

export function useProjects() {
  const [projects, setProjects] = useState<B1ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  return { projects, loading, error }
}
