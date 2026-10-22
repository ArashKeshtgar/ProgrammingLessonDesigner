import { useEffect, useState } from 'react'
import type { ProjectStatus } from '../shared/model'
import { apiFetch } from './session'

// #region card
interface Props {
  project: ProjectStatus // in: <StatusCard project={p} />
  busy?: boolean
  onRefresh(key: string): void // out: a callback prop, React's version of an event
}

export function StatusCard({ project, busy = false, onRefresh }: Props) {
  const label = project.healthy ? (project.summary ?? 'Healthy') : (project.error ?? 'Down')
  return (
    <article className={project.healthy ? 'card' : 'card down'}>
      <h3>{project.displayName}</h3>
      <p>{label}</p>
      <button onClick={() => onRefresh(project.key)} disabled={busy}>
        Refresh
      </button>
    </article>
  )
}
// #endregion

// #region list
export function StatusList() {
  // State: React re-renders the component when a setter is called with a new value.
  const [projects, setProjects] = useState<ProjectStatus[] | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Runs after the first render; the empty array means "once", not on every render.
  useEffect(() => {
    let cancelled = false // the component may unmount before the request finishes
    apiFetch<ProjectStatus[]>('/projects')
      .then((ps) => !cancelled && setProjects(ps))
      .catch((e: Error) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [])

  async function reload(key: string) {
    setBusyKey(key)
    try {
      const fresh = await apiFetch<ProjectStatus>(`/projects/${encodeURIComponent(key)}`)
      // Never mutate state in place: build a new array.
      setProjects((ps) => ps?.map((p) => (p.key === key ? fresh : p)) ?? null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyKey(null)
    }
  }

  if (error) return <p role="alert">{error}</p>
  if (!projects) return <p>Loading…</p>
  return (
    <>
      {projects.map((p) => (
        <StatusCard key={p.key} project={p} busy={busyKey === p.key} onRefresh={reload} />
      ))}
    </>
  )
}
// #endregion
