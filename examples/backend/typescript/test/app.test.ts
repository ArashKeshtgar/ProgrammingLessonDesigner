import assert from 'node:assert/strict';
import { AddressInfo } from 'node:net';
import { describe, it } from 'node:test';
import initSqlJs from 'sql.js';
import { createApp } from '../src/app.js';
import { loadSettings } from '../src/config.js';
import { SqliteProjects } from '../src/db.js';
import { InMemoryProjects, StatusCounts, StatusQueries } from '../src/models.js';
import { AuthError, TokenService, User } from '../src/tokens.js';

const A = 'a'.repeat(32);
const R = 'r'.repeat(32);
const users = new Map<number, User>([
  [1, { id: 1, username: 'admin', role: 'Admin', tokenVersion: 0 }],
  [2, { id: 2, username: 'viewer', role: 'Viewer', tokenVersion: 0 }],
]);

const fakeQueries = (counts?: StatusCounts, fail = false): StatusQueries => ({
  async status() {
    if (fail) throw new Error('Login failed for user ledger_reader');
    return counts ?? { sent: 36, interviewing: 0, followupsDue: 11 };
  },
});

// #region test
// The real Express app on a free port; only the database is faked.
async function call(queries: StatusQueries, path: string, init?: RequestInit, projects = new InMemoryProjects()) {
  const tokens = new TokenService(A, R, (id) => users.get(id));
  const server = createApp(queries, projects, tokens).listen(0);
  try {
    const { port } = server.address() as AddressInfo;
    const res = await fetch(`http://127.0.0.1:${port}${path}`, init);
    return { status: res.status, headers: res.headers, body: (await res.json()) as Record<string, any> };
  } finally {
    server.close();
  }
}

describe('/status', () => {
  it('reports counts', async () => {
    const { body } = await call(fakeQueries(), '/status');
    assert.equal(body.summary, '36 sent, 0 interviewing, 11 follow-up(s) due');
  });

  it('treats NULL sums as zero', async () => {
    const { body } = await call(fakeQueries({ sent: null, interviewing: null, followupsDue: null }), '/status');
    assert.equal(body.summary, '0 sent, 0 interviewing, 0 follow-up(s) due');
  });

  it('is unhealthy without leaking the database error', async () => {
    const { body } = await call(fakeQueries(undefined, true), '/status');
    assert.deepEqual(body, { healthy: false, error: 'Database unreachable.' });
  });
});
// #endregion

const bearer = (id: number) => ({
  Authorization: `Bearer ${new TokenService(A, R, (i) => users.get(i)).issue(users.get(id)!).accessToken}`,
  'Content-Type': 'application/json',
});
const post = (id: number | null, body: unknown): RequestInit => ({
  method: 'POST',
  headers: id ? bearer(id) : { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

describe('/projects', () => {
  it('404s an unknown project', async () => {
    const res = await call(fakeQueries(), '/projects/nope');
    assert.equal(res.status, 404);
    assert.deepEqual(res.body, { error: 'Unknown project: nope' });
  });

  it('creates with 201 and Location', async () => {
    const res = await call(fakeQueries(), '/projects', post(1, { key: 'lab-flow', displayName: 'LabFlow', adapterBaseUrl: 'http://localhost:4005' }));
    assert.equal(res.status, 201);
    assert.equal(res.headers.get('location'), '/projects/lab-flow');
  });

  it('400s an invalid body with field errors', async () => {
    const res = await call(fakeQueries(), '/projects', post(1, { key: 'Bad Key!', displayName: '', adapterBaseUrl: 'not a url' }));
    assert.equal(res.status, 400);
    assert.deepEqual(Object.keys(res.body.errors).sort(), ['adapterBaseUrl', 'displayName', 'key']);
  });

  it('rejects an unknown field', async () => {
    const res = await call(fakeQueries(), '/projects', post(1, { key: 'x', displayName: 'X', adapterBaseUrl: 'http://x', isAdmin: true }));
    assert.equal(res.status, 400);
    assert.ok('isAdmin' in res.body.errors);
  });

  it('checks roles', async () => {
    const body = { key: 'x', displayName: 'X', adapterBaseUrl: 'http://x' };
    assert.equal((await call(fakeQueries(), '/projects', post(null, body))).status, 401);
    assert.equal((await call(fakeQueries(), '/projects', post(2, body))).status, 403);
  });

  it('500s without details on an unexpected error', async () => {
    const broken = new InMemoryProjects();
    broken.find = async () => {
      throw new Error('SQL Server 10.0.0.5 login failed for sa');
    };
    const res = await call(fakeQueries(), '/projects/x', undefined, broken);
    assert.equal(res.status, 500);
    assert.equal(res.body.error, 'Something went wrong.');
    assert.ok(res.body.traceId);
  });
});

describe('tokens and config', () => {
  it('a refresh token is not an access token, and logout revokes it', () => {
    const tokens = new TokenService(A, R, (id) => users.get(id));
    const pair = tokens.issue(users.get(1)!);
    assert.throws(() => tokens.verifyAccess(pair.refreshToken), AuthError);
    assert.ok(tokens.refresh(pair.refreshToken).accessToken);
    users.get(1)!.tokenVersion++;
    try {
      assert.throws(() => tokens.refresh(pair.refreshToken), /revoked/);
    } finally {
      users.get(1)!.tokenVersion--;
    }
  });

  it('secrets must be long and different', () => {
    assert.throws(() => new TokenService('short', R, () => undefined));
    assert.throws(() => new TokenService(A, A, () => undefined));
    assert.throws(() => loadSettings({ JWT_SECRET: A }));
  });

  it('parameters keep an injection attempt as plain text', async () => {
    const SQL = await initSqlJs();
    const repo = new SqliteProjects(new SQL.Database());
    const evil = "x'; DROP TABLE projects; --";
    await repo.add({ key: evil, displayName: 'Evil', adapterBaseUrl: 'http://x' });
    assert.equal((await repo.find(evil))?.displayName, 'Evil');
    assert.equal(await repo.find('x'), undefined);
  });
});
