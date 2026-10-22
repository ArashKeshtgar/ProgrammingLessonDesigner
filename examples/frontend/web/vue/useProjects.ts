import { onMounted, ref } from 'vue'
import type { CreateProject, ProjectStatus } from '../shared/model'
import { apiFetch } from './session'

// #region client
// A composable: Vue's version of a custom hook. It runs once per component that calls it.
// The token handling (attach, refresh once on 401, sign out) is inside apiFetch.
export function useProjects() {
  const projects = ref<ProjectStatus[]>([])
  const error = ref<string | null>(null)

  async function load() {
    try {
      projects.value = await apiFetch<ProjectStatus[]>('/projects')
    } catch (e) {
      error.value = (e as Error).message
    }
  }

  async function create(p: CreateProject) {
    await apiFetch('/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
    await load()
  }

  onMounted(load)
  return { projects, error, create, reload: load }
}
// #endregion
