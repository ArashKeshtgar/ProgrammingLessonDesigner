export interface Project {
  key: string;
  adapterBaseUrl: string;
}

export interface AdapterStatus {
  healthy: boolean;
  error?: string;
}

// #region fanout
export async function fetchStatus(p: Project): Promise<AdapterStatus> {
  // Never throws for an adapter problem: a down adapter becomes healthy: false.
  try {
    const res = await fetch(`${p.adapterBaseUrl}/status`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { healthy: false, error: `Adapter returned HTTP ${res.status}` };
    return (await res.json()) as AdapterStatus;
  } catch {
    return { healthy: false, error: 'Adapter unreachable.' };
  }
}

export async function listWithStatus(registry: Project[]) {
  // map starts every call at once; Promise.all keeps the input order.
  return Promise.all(registry.map(async (project) => ({ project, status: await fetchStatus(project) })));
}
// #endregion
