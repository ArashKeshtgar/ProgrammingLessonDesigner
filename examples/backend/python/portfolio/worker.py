import asyncio
import logging
from collections.abc import Awaitable, Callable

logger = logging.getLogger(__name__)


# #region worker
async def run_worker(
    dispatch: Callable[[], Awaitable[None]],
    poll_seconds: float,
    stop: asyncio.Event,
) -> None:
    while not stop.is_set() and poll_seconds > 0:
        try:
            await dispatch()
        except Exception:  # CancelledError is a BaseException, so it passes through
            logger.exception("The outbox pass failed; trying again on the next one.")
        try:
            # wakes up early when stop is set, so shutdown does not wait out the delay
            await asyncio.wait_for(stop.wait(), timeout=poll_seconds)
        except asyncio.TimeoutError:
            pass
# #endregion
