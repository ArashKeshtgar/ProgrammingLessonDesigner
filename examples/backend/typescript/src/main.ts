import initSqlJs from 'sql.js';
import { createApp } from './app.js';
import { loadSettings } from './config.js';
import { SqliteProjects } from './db.js';
import { TokenService } from './tokens.js';

// Composition root: the only place that knows which real implementations are used.
const settings = loadSettings();
const SQL = await initSqlJs();
const db = new SQL.Database();
const projects = new SqliteProjects(db);
const queries = {
  async status() {
    const [[count]] = db.exec('SELECT COUNT(*) FROM projects')[0].values as number[][];
    return { sent: count, interviewing: 0, followupsDue: 0 };
  },
};
const tokens = new TokenService(settings.jwtSecret, settings.jwtRefreshSecret, () => undefined);

createApp(queries, projects, tokens).listen(settings.port, () => console.log(`listening on ${settings.port}`));
