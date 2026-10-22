export interface TokenStore {
  access(): string | null
  refresh(): string | null
  save(pair: { accessToken: string; refreshToken: string }): void
  clear(): void
}

// #region api
// A fetch wrapper for React and Vue (Angular does the same in an HttpInterceptor):
// attach the access token; on 401 refresh once and retry; if the refresh fails, sign out.
export function createApi(baseUrl: string, tokens: TokenStore, onSignedOut: () => void, fetchFn = fetch) {
  // One refresh shared by every request that hit 401 at the same time: the server rotates
  // refresh tokens, so two parallel refreshes with the same token would race each other.
  let refreshing: Promise<string> | null = null

  function refreshAccessToken(): Promise<string> {
    refreshing ??= (async () => {
      const res = await fetchFn(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refresh() }),
      })
      if (!res.ok) throw new Error('Session expired.')
      const pair = await res.json()
      tokens.save(pair)
      return pair.accessToken as string
    })().finally(() => (refreshing = null))
    return refreshing
  }

  const withToken = (init: RequestInit, token: string | null): RequestInit => ({
    ...init,
    headers: { ...init.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })

  return async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    let res = await fetchFn(`${baseUrl}${path}`, withToken(init, tokens.access()))
    if (res.status === 401 && tokens.refresh()) {
      try {
        res = await fetchFn(`${baseUrl}${path}`, withToken(init, await refreshAccessToken()))
      } catch (err) {
        tokens.clear()
        onSignedOut()
        throw err
      }
    }
    if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? `HTTP ${res.status}`)
    return res.json() as Promise<T>
  }
}
// #endregion
