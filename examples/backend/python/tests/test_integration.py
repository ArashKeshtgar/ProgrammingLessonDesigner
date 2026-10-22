import json
import os
import sqlite3
import threading
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from portfolio import outbox
from portfolio.assistant import ask, run_portfolio_tool
from portfolio.webhook import sign, webhook_router

SECRET = "whsec_test"


def signed(body: dict, t: int, secret: str = SECRET):
    raw = json.dumps(body).encode()
    return raw, {"Stripe-Signature": f"t={t},v1={sign(secret, t, raw)}", "Content-Type": "application/json"}


def webhook_client(handled: list):
    app = FastAPI()
    app.include_router(webhook_router(["other", SECRET], handled.append, set(), clock=lambda: 1_000_000))
    return TestClient(app)


def test_webhook_accepts_valid_and_handles_once():
    handled: list = []
    client = webhook_client(handled)
    raw, headers = signed({"id": "evt_1", "type": "payment_intent.succeeded"}, 1_000_000)
    assert client.post("/webhooks/payments", content=raw, headers=headers).json() == {"received": True}
    assert client.post("/webhooks/payments", content=raw, headers=headers).json()["duplicate"] is True
    assert len(handled) == 1


def test_webhook_rejects_tampered_and_old():
    client = webhook_client([])
    raw, headers = signed({"id": "evt_2", "amount": 100}, 1_000_000)
    tampered = raw.replace(b"100", b"999")
    assert client.post("/webhooks/payments", content=tampered, headers=headers).status_code == 400
    raw, headers = signed({"id": "evt_3"}, 1_000_000 - 301)
    assert client.post("/webhooks/payments", content=raw, headers=headers).status_code == 400


def test_outbox_retries_with_backoff_then_delivers():
    conn = sqlite3.connect(":memory:")
    conn.executescript(outbox.SCHEMA)
    outbox.place_order(conn, "o1", "Jane")
    sent: list = []
    down = True

    def send(payload):
        if down:
            raise ConnectionError("lab system down")
        sent.append(payload)

    assert outbox.dispatch(conn, send, now=0) == 0
    assert conn.execute("SELECT attempts, next_attempt FROM outbox").fetchone() == (1, 10)
    assert outbox.dispatch(conn, send, now=5) == 0  # not due yet: nothing tried
    assert outbox.dispatch(conn, send, now=10) == 0
    assert conn.execute("SELECT attempts, next_attempt FROM outbox").fetchone() == (2, 30)
    down = False
    assert outbox.dispatch(conn, send, now=30) == 1
    assert sent == ['{"order": "o1"}']


def test_order_and_message_commit_together():
    conn = sqlite3.connect(":memory:")
    conn.executescript(outbox.SCHEMA)
    outbox.place_order(conn, "o1", "Jane")
    with pytest.raises(sqlite3.IntegrityError):
        outbox.place_order(conn, "o1", "Jane again")  # duplicate id: the whole transaction rolls back
    assert conn.execute("SELECT COUNT(*) FROM outbox").fetchone() == (1,)


def test_backoff_is_capped():
    assert [outbox.backoff_seconds(n) for n in (1, 2, 3)] == [10, 20, 40]
    assert outbox.backoff_seconds(12) == 1800


def block(**kw):
    return SimpleNamespace(**kw)


def test_assistant_runs_tools_then_answers():
    replies = iter([
        block(stop_reason="tool_use", content=[
            block(type="tool_use", id="t1", name="get_project_status", input={"key": "ledgerdash"}),
            block(type="tool_use", id="t2", name="get_project_status", input={"key": "missing"}),
        ]),
        block(stop_reason="end_turn", content=[block(type="text", text="LedgerDash is healthy.")]),
    ])
    seen: list = []

    def create(messages):
        seen.append(list(messages))
        return next(replies)

    answer = ask(create, run_portfolio_tool({"ledgerdash": {"healthy": True}}), "Is ledger ok?")
    assert answer == "LedgerDash is healthy."
    results = seen[1][-1]["content"]
    assert len(results) == 2 and results[1]["is_error"] is True  # both results in one user message


def test_assistant_stops_after_max_turns():
    loop = block(stop_reason="tool_use", content=[
        block(type="tool_use", id="t", name="get_project_status", input={"key": "a"})])
    assert "6 steps" in ask(lambda _m: loop, run_portfolio_tool({"a": {}}), "?")


@pytest.mark.skipif(not os.environ.get("MONGO_URL"), reason="needs MONGO_URL")
def test_only_one_concurrent_finalize_wins():
    from pymongo import MongoClient

    from portfolio.orders import finalize_order

    orders = MongoClient(os.environ["MONGO_URL"]).get_database("lessons").get_collection("orders_py")
    orders.delete_many({})
    orders.insert_one({"_id": "o1", "status": "pending"})
    results: list = []
    threads = [threading.Thread(target=lambda: results.append(finalize_order(orders, "o1"))) for _ in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert results.count("won") == 1
    assert results.count("processing") == 9
