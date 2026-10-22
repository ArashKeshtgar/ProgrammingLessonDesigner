import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createApi, TokenStore } from '../shared/api.js'
import { validateProject } from '../shared/model.js'

function store(access: string | null, refresh: string | null) {
  const s = { access, refresh, cleared: false }
  const tokens: TokenStore = {
    access: () => s.access,
    refresh: () => s.refresh,
    save: (p) => ((s.access = p.accessToken), (s.refresh = p.refreshToken)),
    clear: () => ((s.access = s.refresh = null), (s.cleared = true)),
  }
  return { s, tokens }
}

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status })

describe('apiFetch', () => {
  it('refreshes once for parallel 401s and retries each request', async () => {
    const { s, tokens } = store('old', 'r1')
    let refreshes = 0
    const fake = async (url: string | URL | Request, init?: RequestInit) => {
      const u = String(url)
      if (u.endsWith('/auth/refresh')) {
        refreshes++
        await new Promise((r) => setTimeout(r, 10)) // still in flight when the second 401 arrives
        return json(200, { accessToken: 'new', refreshToken: 'r2' })
      }
      const auth = (init?.headers as Record<string, string>)?.Authorization
      return auth === 'Bearer new' ? json(200, { path: u }) : json(401, { error: 'expired' })
    }
    const api = createApi('http://api', tokens, () => assert.fail('should stay signed in'), fake as typeof fetch)
    const [a, b] = await Promise.all([api<{ path: string }>('/projects'), api<{ path: string }>('/status')])
    assert.equal(refreshes, 1)
    assert.deepEqual([a.path, b.path], ['http://api/projects', 'http://api/status'])
    assert.equal(s.refresh, 'r2')
  })

  it('signs out when the refresh fails', async () => {
    const { s, tokens } = store('old', 'revoked')
    let signedOut = false
    const fake = async (url: string | URL | Request) =>
      String(url).endsWith('/auth/refresh') ? json(401, { error: 'revoked' }) : json(401, { error: 'expired' })
    const api = createApi('http://api', tokens, () => (signedOut = true), fake as typeof fetch)
    await assert.rejects(api('/projects'), /Session expired/)
    assert.equal(signedOut, true)
    assert.equal(s.cleared, true)
  })

  it('passes server error messages through', async () => {
    const { tokens } = store('t', null)
    const api = createApi('http://api', tokens, () => {}, (async () => json(404, { error: 'Unknown project: x' })) as typeof fetch)
    await assert.rejects(api('/projects/x'), /Unknown project: x/)
  })
})

describe('validateProject', () => {
  it('matches the backend rules', () => {
    assert.deepEqual(validateProject({ key: 'lab-flow', displayName: 'LabFlow', adapterBaseUrl: 'http://x' }), {})
    assert.deepEqual(Object.keys(validateProject({ key: 'Bad Key!', displayName: ' ', adapterBaseUrl: 'ftp://x' })).sort(), [
      'adapterBaseUrl',
      'displayName',
      'key',
    ])
  })
})
