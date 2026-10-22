import type { Database } from 'sql.js';
import { ProjectRepository, ProjectRow } from './models.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS projects (
  key TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  adapter_base_url TEXT NOT NULL
)`;

// #region repository
export class SqliteProjects implements ProjectRepository {
  constructor(private readonly db: Database) {
    db.run(SCHEMA);
  }

  async find(key: string): Promise<ProjectRow | undefined> {
    // ? placeholders: the driver sends the value separately, never as SQL text.
    const stmt = this.db.prepare('SELECT key, display_name, adapter_base_url FROM projects WHERE key = ?');
    try {
      stmt.bind([key]);
      if (!stmt.step()) return undefined;
      const [k, displayName, adapterBaseUrl] = stmt.get() as string[];
      return { key: k, displayName, adapterBaseUrl };
    } finally {
      stmt.free(); // sql.js statements hold WebAssembly memory until freed
    }
  }

  async add(row: ProjectRow): Promise<void> {
    this.db.run('INSERT INTO projects (key, display_name, adapter_base_url) VALUES (?, ?, ?)', [
      row.key,
      row.displayName,
      row.adapterBaseUrl,
    ]);
  }
}
// #endregion
