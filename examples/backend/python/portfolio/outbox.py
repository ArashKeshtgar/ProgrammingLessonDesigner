import json
import sqlite3
from collections.abc import Callable

MAX_ATTEMPTS = 12

SCHEMA = """
CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, patient TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS outbox (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payload TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    next_attempt REAL,
    sent REAL,
    last_error TEXT
);"""


# #region save
def place_order(conn: sqlite3.Connection, order_id: str, patient: str) -> None:
    # The order and its message commit together: either both exist or neither does.
    with conn:
        conn.execute("INSERT INTO orders (id, patient) VALUES (?, ?)", (order_id, patient))
        conn.execute("INSERT INTO outbox (payload) VALUES (?)", (json.dumps({"order": order_id}),))
# #endregion


# #region dispatch
def backoff_seconds(attempts: int) -> float:
    # 10 s, 20 s, 40 s ... capped at 30 minutes.
    return min(10 * 2 ** (attempts - 1), 30 * 60)


def dispatch(conn: sqlite3.Connection, send: Callable[[str], None], now: float) -> int:
    due = conn.execute(
        """SELECT id, payload, attempts FROM outbox
           WHERE sent IS NULL AND attempts < ? AND (next_attempt IS NULL OR next_attempt <= ?)
           ORDER BY id LIMIT 20""",
        (MAX_ATTEMPTS, now),
    ).fetchall()
    delivered = 0
    for msg_id, payload, attempts in due:
        attempts += 1
        try:
            send(payload)
            conn.execute("UPDATE outbox SET attempts = ?, sent = ?, last_error = NULL WHERE id = ?",
                         (attempts, now, msg_id))
            delivered += 1
        except Exception as e:  # the receiver is down: keep the message, try later
            conn.execute("UPDATE outbox SET attempts = ?, next_attempt = ?, last_error = ? WHERE id = ?",
                         (attempts, now + backoff_seconds(attempts), str(e), msg_id))
        conn.commit()
    return delivered
# #endregion
