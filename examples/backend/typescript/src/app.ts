import { randomUUID } from 'node:crypto';
import express, { NextFunction, Request, Response } from 'express';
import { CreateProject, ProjectRepository, StatusQueries } from './models.js';
import { AuthError, TokenService, User } from './tokens.js';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// #region factory
export function createApp(queries: StatusQueries, projects: ProjectRepository, tokens: TokenService) {
  // Everything the app needs comes in as an argument, so a test can pass fakes.
  const app = express();
  app.use(express.json());
  // #endregion

  // #region roles
  const requireRole =
    (...roles: User['role'][]) =>
    (req: Request, _res: Response, next: NextFunction) => {
      const header = req.header('authorization') ?? '';
      if (!header.startsWith('Bearer ')) return next(new HttpError(401, 'Sign in first.'));
      try {
        const claims = tokens.verifyAccess(header.slice('Bearer '.length));
        if (!roles.includes(claims.role)) return next(new HttpError(403, 'Not allowed for your role.'));
        next();
      } catch (err) {
        next(err instanceof AuthError ? new HttpError(401, err.message) : err);
      }
    };
  // #endregion

  // #region routes
  app.get('/status', async (_req, res) => {
    try {
      const s = await queries.status();
      const m = { sent: s.sent ?? 0, interviewing: s.interviewing ?? 0, followupsDue: s.followupsDue ?? 0 };
      const summary = `${m.sent} sent, ${m.interviewing} interviewing, ${m.followupsDue} follow-up(s) due`;
      res.json({ healthy: true, summary, metrics: m });
    } catch {
      // Unhealthy is an answer, not an error: the dashboard shows it.
      res.json({ healthy: false, error: 'Database unreachable.' });
    }
  });

  // Express 4 does not catch a rejected promise from a handler: pass errors to next() yourself.
  app.get('/projects/:key', async (req, res, next) => {
    try {
      const row = await projects.find(req.params.key);
      if (!row) throw new HttpError(404, `Unknown project: ${req.params.key}`);
      res.json(row);
    } catch (err) {
      next(err);
    }
  });

  app.post('/projects', requireRole('Admin'), async (req, res, next) => {
    try {
      const parsed = CreateProject.safeParse(req.body);
      if (!parsed.success) {
        const errors = Object.fromEntries(
          // an unknown field has an empty path and names the field in `keys`
          parsed.error.issues.map((i) => [i.path.join('.') || ('keys' in i ? i.keys.join(',') : 'body'), i.message]),
        );
        return res.status(400).json({ error: 'Invalid request.', errors });
      }
      if (await projects.find(parsed.data.key)) throw new HttpError(409, `Project ${parsed.data.key} already exists.`);
      await projects.add(parsed.data);
      res.status(201).location(`/projects/${parsed.data.key}`).json(parsed.data);
    } catch (err) {
      next(err);
    }
  });
  // #endregion

  // #region errors
  // Four parameters is how Express recognises an error handler. Registered last.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    if (err instanceof SyntaxError) return res.status(400).json({ error: 'Body is not valid JSON.' });
    // The details go to the log, never to the caller (they can name servers, users, SQL).
    const traceId = randomUUID();
    console.error(`Unhandled error ${traceId}`, err);
    res.status(500).json({ error: 'Something went wrong.', traceId });
  });
  // #endregion

  return app;
}
