import type { Database } from 'sql.js';

export const MAX_ATTEMPTS = 12;

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, patient TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payload TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt REAL,
  sent REAL,
  last_error TEXT
);`;

// #region save
export function placeOrder(db: Database, orderId: string, patient: string): void {
  // The order and its message commit together: either both exist or neither does.
  db.run('BEGIN');
  try {
    db.run('INSERT INTO orders (id, patient) VALUES (?, ?)', [orderId, patient]);
    db.run('INSERT INTO outbox (payload) VALUES (?)', [JSON.stringify({ order: orderId })]);
    db.run('COMMIT');
  } catch (err) {
    db.run('ROLLBACK');
    throw err;
  }
}
// #endregion

// #region dispatch
export const backoffSeconds = (attempts: number) => Math.min(10 * 2 ** (attempts - 1), 30 * 60); // 10 s, 20 s, 40 s ... 30 min

export async function dispatch(db: Database, send: (payload: string) => Promise<void>, now: number): Promise<number> {
  const due = db.exec(
    `SELECT id, payload, attempts FROM outbox
     WHERE sent IS NULL AND attempts < ? AND (next_attempt IS NULL OR next_attempt <= ?)
     ORDER BY id LIMIT 20`,
    [MAX_ATTEMPTS, now],
  )[0]?.values ?? [];
  let delivered = 0;
  for (const [id, payload, prior] of due as [number, string, number][]) {
    const attempts = prior + 1;
    try {
      await send(payload);
      db.run('UPDATE outbox SET attempts = ?, sent = ?, last_error = NULL WHERE id = ?', [attempts, now, id]);
      delivered++;
    } catch (err) {
      // the receiver is down: keep the message, try later
      db.run('UPDATE outbox SET attempts = ?, next_attempt = ?, last_error = ? WHERE id = ?', [
        attempts, now + backoffSeconds(attempts), (err as Error).message, id,
      ]);
    }
  }
  return delivered;
}
// #endregion
