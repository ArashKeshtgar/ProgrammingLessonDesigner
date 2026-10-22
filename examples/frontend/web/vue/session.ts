import { reactive } from 'vue'
import { createApi } from '../shared/api'
import type { Role } from '../shared/model'

// A reactive object is enough for app-wide state at this size (Pinia for more).
export const session = reactive<{ role: Role | null }>({ role: null })

export const apiFetch = createApi(
  '/api',
  {
    access: () => localStorage.getItem('access'),
    refresh: () => localStorage.getItem('refresh'),
    save: (p) => (localStorage.setItem('access', p.accessToken), localStorage.setItem('refresh', p.refreshToken)),
    clear: () => (localStorage.removeItem('access'), localStorage.removeItem('refresh')),
  },
  () => (session.role = null),
)
