import asyncio

import httpx
from pydantic import BaseModel


class Project(BaseModel):
    key: str
    adapter_base_url: str


class AdapterStatus(BaseModel):
    healthy: bool
    error: str | None = None


class ProjectWithStatus(BaseModel):
    project: Project
    status: AdapterStatus


# #region fanout
async def fetch_status(client: httpx.AsyncClient, p: Project) -> AdapterStatus:
    # Never raises for an adapter problem: a down adapter becomes healthy=False.
    try:
        res = await client.get(f"{p.adapter_base_url}/status", timeout=3.0)
        if res.status_code != 200:
            return AdapterStatus(healthy=False, error=f"Adapter returned HTTP {res.status_code}")
        return AdapterStatus(**res.json())
    except (httpx.HTTPError, ValueError):  # ValueError: bad JSON or a pydantic ValidationError
        return AdapterStatus(healthy=False, error="Adapter unreachable.")


async def list_with_status(
    client: httpx.AsyncClient, registry: list[Project]
) -> list[ProjectWithStatus]:
    # gather starts every call at once and keeps the input order.
    statuses = await asyncio.gather(*(fetch_status(client, p) for p in registry))
    return [ProjectWithStatus(project=p, status=s) for p, s in zip(registry, statuses)]
# #endregion
