// The same shapes the backend examples return.
export interface ProjectStatus {
  key: string
  displayName: string
  healthy: boolean
  summary?: string
  error?: string
}

export interface CreateProject {
  key: string
  displayName: string
  adapterBaseUrl: string
}

export type Role = 'Admin' | 'Viewer'

// #region rules
// The backend's rules, repeated on the client for instant feedback. The server still checks:
// client-side validation is for the user, not for security.
export function validateProject(p: CreateProject): Partial<Record<keyof CreateProject, string>> {
  const errors: Partial<Record<keyof CreateProject, string>> = {}
  if (!/^[a-z0-9-]{1,40}$/.test(p.key)) errors.key = 'Lowercase letters, digits and dashes, up to 40.'
  if (!p.displayName.trim()) errors.displayName = 'Required.'
  else if (p.displayName.length > 100) errors.displayName = 'Up to 100 characters.'
  if (!/^https?:\/\/\S+$/.test(p.adapterBaseUrl)) errors.adapterBaseUrl = 'An http(s) URL.'
  return errors
}
// #endregion
