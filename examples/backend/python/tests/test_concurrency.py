import asyncio

import httpx

from portfolio.fanout import Project, list_with_status
from portfolio.worker import run_worker


def handler(request: httpx.Request) -> httpx.Response:
    if request.url.host == "up":
        return httpx.Response(200, json={"healthy": True})
    if request.url.host == "broken":
        return httpx.Response(500)
    raise httpx.ConnectError("refused", request=request)


def test_fanout_keeps_order_and_never_raises():
    registry = [Project(key=k, adapter_base_url=f"http://{k}") for k in ["up", "broken", "down"]]

    async def go():
        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
            return await list_with_status(client, registry)

    result = asyncio.run(go())
    assert [r.project.key for r in result] == ["up", "broken", "down"]
    assert result[0].status.healthy is True
    assert result[1].status.error == "Adapter returned HTTP 500"
    assert result[2].status.error == "Adapter unreachable."


def test_worker_survives_a_failing_pass_and_stops():
    calls = 0
    stop = asyncio.Event()

    async def dispatch():
        nonlocal calls
        calls += 1
        if calls == 1:
            raise RuntimeError("database down")
        stop.set()

    asyncio.run(asyncio.wait_for(run_worker(dispatch, 0.01, stop), timeout=2))
    assert calls == 2
