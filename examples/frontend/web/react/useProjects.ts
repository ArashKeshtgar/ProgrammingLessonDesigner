import { useCallback, useEffect, useState } from 'react'
import type { CreateProject, ProjectStatus } from '../shared/model'
import { apiFetch } from './session'

// #region client
// A custom hook: components call useProjects() and get data, state and actions.
// The token handling (attach, refresh once on 401, sign out) is inside apiFetch.
export function useProjects() {
  const [projects, setProjects] = useState<ProjectStatus[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setProjects(await apiFetch<ProjectStatus[]>('/projects'))
    } catch (e) {
      setError((e as Error).message)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const create = useCallback(
    async (p: CreateProject) => {
      await apiFetch('/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
      await load()
    },
    [load],
  )

  return { projects, error, create, reload: load }
}
// #endregion
