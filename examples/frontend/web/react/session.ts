import { createContext, useContext } from 'react'
import { createApi } from '../shared/api'
import type { Role } from '../shared/model'

export interface Session {
  role: Role | null
  signOut(): void
}

export const SessionContext = createContext<Session>({ role: null, signOut: () => {} })
export const useSession = () => useContext(SessionContext)

// One api instance for the app; the token store is localStorage.
export const apiFetch = createApi(
  '/api',
  {
    access: () => localStorage.getItem('access'),
    refresh: () => localStorage.getItem('refresh'),
    save: (p) => (localStorage.setItem('access', p.accessToken), localStorage.setItem('refresh', p.refreshToken)),
    clear: () => (localStorage.removeItem('access'), localStorage.removeItem('refresh')),
  },
  () => window.dispatchEvent(new Event('signed-out')),
)
