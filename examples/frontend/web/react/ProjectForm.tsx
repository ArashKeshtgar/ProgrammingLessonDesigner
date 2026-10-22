import { useState, type FormEvent } from 'react'
import { validateProject, type CreateProject } from '../shared/model'
import { useProjects } from './useProjects'

// #region form
export function ProjectForm() {
  const { create } = useProjects()
  // Controlled inputs: the value lives in state, every keystroke goes through setForm.
  const [form, setForm] = useState<CreateProject>({ key: '', displayName: '', adapterBaseUrl: '' })
  const [touched, setTouched] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const errors = validateProject(form) // derived on each render, not stored
  const set = (field: keyof CreateProject) => (e: { target: { value: string } }) => setForm({ ...form, [field]: e.target.value })

  async function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (Object.keys(errors).length) return
    setSaving(true)
    try {
      await create(form)
      setForm({ key: '', displayName: '', adapterBaseUrl: '' })
      setTouched(false)
    } catch (err) {
      setServerError((err as Error).message) // the server checks again (e.g. 409 already exists)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <label>Key <input value={form.key} onChange={set('key')} /></label>
      {touched && errors.key && <small>{errors.key}</small>}
      <label>Name <input value={form.displayName} onChange={set('displayName')} /></label>
      {touched && errors.displayName && <small>{errors.displayName}</small>}
      <label>Adapter URL <input value={form.adapterBaseUrl} onChange={set('adapterBaseUrl')} /></label>
      {touched && errors.adapterBaseUrl && <small>{errors.adapterBaseUrl}</small>}
      {serverError && <p role="alert">{serverError}</p>}
      <button disabled={saving}>Save</button>
    </form>
  )
}
// #endregion
