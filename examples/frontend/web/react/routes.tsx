import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import type { Role } from '../shared/model'
import { ProjectForm } from './ProjectForm'
import { useSession } from './session'
import { StatusList } from './StatusCard'

// #region guard
// React Router has no guard hook: a wrapper component decides what to render.
function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const session = useSession()
  return session.role === role ? children : <Navigate to="/dashboard" replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<StatusList />} />
      <Route
        path="/projects/new"
        element={
          <RequireRole role="Admin">
            <ProjectForm />
          </RequireRole>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
// #endregion
