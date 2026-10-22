import sqlite3

import pytest
from fastapi.testclient import TestClient

from portfolio.app import create_app
from portfolio.config import load_settings
from portfolio.db import SqliteProjects
from portfolio.models import InMemoryProjects, ProjectRow, StatusCounts
from portfolio.tokens import AuthError, TokenService, User

A = "a" * 32
R = "r" * 32
USERS = {1: User(1, "admin", "Admin"), 2: User(2, "viewer", "Viewer")}


class FakeQueries:
    def __init__(self, counts=None, fail=False):
        self.counts, self.fail = counts or StatusCounts(sent=36, interviewing=0, followups_due=11), fail

    def status(self):
        if self.fail:
            raise RuntimeError("Login failed for user ledger_reader")
        return self.counts


def make(queries=None, projects=None):
    tokens = TokenService(A, R, USERS.get)
    app = create_app(queries or FakeQueries(), projects or InMemoryProjects(), tokens)
    return TestClient(app, raise_server_exceptions=False), tokens


# #region test
def test_status_reports_counts():
    client, _ = make()
    body = client.get("/status").json()
    assert body["healthy"] is True
    assert body["summary"] == "36 sent, 0 interviewing, 11 follow-up(s) due"


def test_null_sums_count_as_zero():
    client, _ = make(FakeQueries(StatusCounts()))
    assert client.get("/status").json()["summary"] == "0 sent, 0 interviewing, 0 follow-up(s) due"


def test_unhealthy_without_leaking_the_database_error():
    client, _ = make(FakeQueries(fail=True))
    body = client.get("/status").json()
    assert body == {"healthy": False, "error": "Database unreachable."}
    assert "ledger_reader" not in str(body)
# #endregion


def admin_header(tokens, user_id=1):
    return {"Authorization": f"Bearer {tokens.issue(USERS[user_id])['access_token']}"}


def test_unknown_project_is_404():
    client, _ = make()
    res = client.get("/projects/nope")
    assert res.status_code == 404
    assert res.json() == {"error": "Unknown project: nope"}


def test_create_project_validates_and_returns_location():
    client, tokens = make()
    ok = client.post("/projects", headers=admin_header(tokens),
                     json={"key": "lab-flow", "display_name": "LabFlow", "adapter_base_url": "http://localhost:4005"})
    assert ok.status_code == 201
    assert ok.headers["location"] == "/projects/lab-flow"
    assert client.get("/projects/lab-flow").status_code == 200


def test_invalid_body_is_400_with_field_errors():
    client, tokens = make()
    res = client.post("/projects", headers=admin_header(tokens),
                      json={"key": "Bad Key!", "display_name": "", "adapter_base_url": "not a url"})
    assert res.status_code == 400
    assert set(res.json()["errors"]) == {"key", "display_name", "adapter_base_url"}


def test_unknown_field_is_rejected():
    client, tokens = make()
    res = client.post("/projects", headers=admin_header(tokens),
                      json={"key": "x", "display_name": "X", "adapter_base_url": "http://x", "isAdmin": True})
    assert res.status_code == 400
    assert "isAdmin" in res.json()["errors"]


def test_roles():
    client, tokens = make()
    body = {"key": "x", "display_name": "X", "adapter_base_url": "http://x"}
    assert client.post("/projects", json=body).status_code == 401
    assert client.post("/projects", json=body, headers=admin_header(tokens, 2)).status_code == 403


def test_unexpected_error_is_500_without_details():
    class Broken(InMemoryProjects):
        def find(self, key):
            raise RuntimeError("SQL Server 10.0.0.5 login failed for sa")

    client, _ = make(projects=Broken())
    res = client.get("/projects/x")
    assert res.status_code == 500
    assert res.json()["error"] == "Something went wrong."
    assert "sa" not in res.json()["error"] and "trace_id" in res.json()


def test_refresh_token_is_not_an_access_token_and_logout_revokes_it():
    tokens = TokenService(A, R, USERS.get)
    pair = tokens.issue(USERS[1])
    with pytest.raises(AuthError):
        tokens.verify_access(pair["refresh_token"])
    assert tokens.refresh(pair["refresh_token"])["access_token"]
    USERS[1].token_version += 1  # logout
    try:
        with pytest.raises(AuthError, match="revoked"):
            tokens.refresh(pair["refresh_token"])
    finally:
        USERS[1].token_version -= 1


def test_secrets_must_be_long_and_different():
    with pytest.raises(ValueError):
        TokenService("short", R, USERS.get)
    with pytest.raises(ValueError):
        TokenService(A, A, USERS.get)
    with pytest.raises(RuntimeError):
        load_settings({"JWT_SECRET": A})


def test_parameters_keep_injection_as_plain_text():
    repo = SqliteProjects(sqlite3.connect(":memory:"))
    evil = "x'; DROP TABLE projects; --"
    repo.add(ProjectRow(key=evil, display_name="Evil", adapter_base_url="http://x"))
    assert repo.find(evil).display_name == "Evil"
    assert repo.find("x") is None
