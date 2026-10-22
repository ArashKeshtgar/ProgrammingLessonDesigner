import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { AddressInfo } from 'node:net';
import { describe, it } from 'node:test';
import express from 'express';
import { MongoClient } from 'mongodb';
import initSqlJs from 'sql.js';
import type Anthropic from '@anthropic-ai/sdk';
import { ask, portfolioTool } from '../src/assistant.js';
import { listWithStatus } from '../src/fanout.js';
import { finalizeOrder, OrderDoc } from '../src/orders.js';
import { backoffSeconds, dispatch, placeOrder, SCHEMA } from '../src/outbox.js';
import { sign, webhookRouter } from '../src/webhook.js';
import { runWorker } from '../src/worker.js';

describe('concurrency', () => {
  it('fans out, keeps order and never throws', async () => {
    const server = createServer((req, res) => {
      if (req.url === '/up/status') return res.end('{"healthy":true}');
      res.statusCode = 500;
      res.end();
    }).listen(0);
    try {
      const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
      const result = await listWithStatus([
        { key: 'up', adapterBaseUrl: `${base}/up` },
        { key: 'broken', adapterBaseUrl: `${base}/broken` },
        { key: 'down', adapterBaseUrl: 'http://127.0.0.1:1' },
      ]);
      assert.deepEqual(result.map((r) => r.status), [
        { healthy: true },
        { healthy: false, error: 'Adapter returned HTTP 500' },
        { healthy: false, error: 'Adapter unreachable.' },
      ]);
    } finally {
      server.close();
    }
  });

  it('the worker survives a failing pass and stops', async () => {
    const stop = new AbortController();
    let calls = 0;
    await runWorker(async () => {
      calls++;
      if (calls === 1) throw new Error('database down');
      stop.abort();
    }, 0.01, stop.signal, { error: () => undefined });
    assert.equal(calls, 2);
  });
});

describe('webhook', () => {
  const SECRET = 'whsec_test';
  async function send(handled: unknown[], body: object, t: number, mutate = (b: Buffer) => b) {
    const app = express();
    app.use(webhookRouter(['other', SECRET], async (e) => void handled.push(e), seen, () => 1_000_000));
    const server = app.listen(0);
    try {
      const raw = Buffer.from(JSON.stringify(body));
      const res = await fetch(`http://127.0.0.1:${(server.address() as AddressInfo).port}/webhooks/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${t},v1=${sign(SECRET, t, raw)}` },
        body: mutate(raw),
      });
      return { status: res.status, body: (await res.json()) as Record<string, unknown> };
    } finally {
      server.close();
    }
  }
  const seen = new Set<string>();

  it('accepts a valid event once', async () => {
    const handled: unknown[] = [];
    assert.deepEqual((await send(handled, { id: 'evt_1' }, 1_000_000)).body, { received: true });
    assert.equal((await send(handled, { id: 'evt_1' }, 1_000_000)).body.duplicate, true);
    assert.equal(handled.length, 1);
  });

  it('rejects a tampered or old event', async () => {
    const tampered = (b: Buffer) => Buffer.from(b.toString().replace('100', '999'));
    assert.equal((await send([], { id: 'evt_2', amount: 100 }, 1_000_000, tampered)).status, 400);
    assert.equal((await send([], { id: 'evt_3' }, 1_000_000 - 301)).status, 400);
  });
});

describe('outbox', () => {
  it('retries with backoff, then delivers', async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    db.exec(SCHEMA);
    placeOrder(db, 'o1', 'Jane');
    const sent: string[] = [];
    let down = true;
    const send = async (p: string) => {
      if (down) throw new Error('lab system down');
      sent.push(p);
    };
    const row = () => db.exec('SELECT attempts, next_attempt FROM outbox')[0].values[0];
    assert.equal(await dispatch(db, send, 0), 0);
    assert.deepEqual(row(), [1, 10]);
    assert.equal(await dispatch(db, send, 5), 0);
    assert.equal(await dispatch(db, send, 10), 0);
    assert.deepEqual(row(), [2, 30]);
    down = false;
    assert.equal(await dispatch(db, send, 30), 1);
    assert.deepEqual(sent, ['{"order":"o1"}']);
  });

  it('commits the order and its message together', async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    db.exec(SCHEMA);
    placeOrder(db, 'o1', 'Jane');
    assert.throws(() => placeOrder(db, 'o1', 'Jane again'));
    assert.deepEqual(db.exec('SELECT COUNT(*) FROM outbox')[0].values, [[1]]);
  });

  it('caps the backoff', () => {
    assert.deepEqual([1, 2, 3].map(backoffSeconds), [10, 20, 40]);
    assert.equal(backoffSeconds(12), 1800);
  });
});

describe('assistant', () => {
  const msg = (stop_reason: string, content: unknown[]) => ({ stop_reason, content }) as unknown as Anthropic.Beta.Messages.BetaMessage;

  it('runs tools, then answers', async () => {
    const replies = [
      msg('tool_use', [
        { type: 'tool_use', id: 't1', name: 'get_project_status', input: { key: 'ledgerdash' } },
        { type: 'tool_use', id: 't2', name: 'get_project_status', input: { key: 'missing' } },
      ]),
      msg('end_turn', [{ type: 'text', text: 'LedgerDash is healthy.' }]),
    ];
    const seen: unknown[][] = [];
    const answer = await ask(
      async (m) => (seen.push([...m]), replies.shift()!),
      portfolioTool({ ledgerdash: { healthy: true } }),
      'Is ledger ok?',
    );
    assert.equal(answer, 'LedgerDash is healthy.');
    const results = (seen[1].at(-1) as { content: { is_error?: boolean }[] }).content;
    assert.equal(results.length, 2);
    assert.equal(results[1].is_error, true);
  });

  it('stops after the turn cap', async () => {
    const loop = msg('tool_use', [{ type: 'tool_use', id: 't', name: 'get_project_status', input: { key: 'a' } }]);
    assert.match(await ask(async () => loop, portfolioTool({ a: {} }), '?'), /6 steps/);
  });
});

describe('mongo', { skip: !process.env.MONGO_URL && 'needs MONGO_URL' }, () => {
  it('lets exactly one concurrent finalize win', async () => {
    const client = await MongoClient.connect(process.env.MONGO_URL!);
    try {
      const orders = client.db('lessons').collection<OrderDoc>('orders_ts');
      await orders.deleteMany({});
      await orders.insertOne({ _id: 'o1', status: 'pending' });
      const results = await Promise.all(Array.from({ length: 10 }, () => finalizeOrder(orders, 'o1')));
      assert.equal(results.filter((r) => r === 'won').length, 1);
      assert.equal(results.filter((r) => r === 'processing').length, 9);
    } finally {
      await client.close();
    }
  });
});
