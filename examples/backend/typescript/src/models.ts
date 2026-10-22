import { z } from 'zod';

export interface ProjectRow {
  key: string;
  displayName: string;
  adapterBaseUrl: string;
}

// #region validation
export const CreateProject = z
  .object({
    key: z.string().regex(/^[a-z0-9-]{1,40}$/),
    displayName: z.string().min(1).max(100),
    adapterBaseUrl: z.string().url().refine((u) => /^https?:\/\//.test(u), 'must be http(s)'),
  })
  // Unknown fields are an error, not silently dropped (like Nest's whitelist + forbid).
  .strict();

export type CreateProject = z.infer<typeof CreateProject>;
// #endregion

export interface StatusCounts {
  // SUM over no rows is NULL in SQL, so every count may arrive as null.
  sent: number | null;
  interviewing: number | null;
  followupsDue: number | null;
}

// #region ports
export interface StatusQueries {
  status(): Promise<StatusCounts>;
}

export interface ProjectRepository {
  find(key: string): Promise<ProjectRow | undefined>;
  add(row: ProjectRow): Promise<void>;
}
// #endregion

export class InMemoryProjects implements ProjectRepository {
  readonly rows = new Map<string, ProjectRow>();
  async find(key: string) {
    return this.rows.get(key);
  }
  async add(row: ProjectRow) {
    this.rows.set(row.key, row);
  }
}
