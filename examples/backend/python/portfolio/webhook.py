import hashlib
import hmac
import json
import time
from collections.abc import Callable

from fastapi import APIRouter, Header, HTTPException, Request

TOLERANCE_SECONDS = 300


class SignatureError(Exception):
    pass


# #region verify
def sign(secret: str, timestamp: int, body: bytes) -> str:
    # Stripe-style: HMAC-SHA256 over "<timestamp>.<raw body>".
    return hmac.new(secret.encode(), f"{timestamp}.".encode() + body, hashlib.sha256).hexdigest()


def verify(body: bytes, header: str, secrets: list[str], now: float) -> dict:
    parts = dict(p.split("=", 1) for p in header.split(",") if "=" in p)
    try:
        timestamp = int(parts.get("t", ""))
    except ValueError as e:
        raise SignatureError("No timestamp in the signature header.") from e
    if abs(now - timestamp) > TOLERANCE_SECONDS:
        raise SignatureError("Timestamp outside the tolerance (replayed?).")
    for secret in secrets:  # two endpoints, two secrets: accept either
        # compare_digest takes the same time whatever matches, so timing leaks nothing.
        if hmac.compare_digest(sign(secret, timestamp, body), parts.get("v1", "")):
            return json.loads(body)
    raise SignatureError("No matching signature.")
# #endregion


# #region route
def webhook_router(
    secrets: list[str], handle: Callable[[dict], None], seen: set[str], clock: Callable[[], float] = time.time
) -> APIRouter:
    router = APIRouter()

    @router.post("/webhooks/payments")
    async def receive(request: Request, stripe_signature: str = Header(default="")):
        body = await request.body()  # the raw bytes: parsing first would change what was signed
        try:
            event = verify(body, stripe_signature, secrets, clock())
        except SignatureError as e:
            raise HTTPException(400, f"Signature verification failed: {e}") from e
        # Providers retry: the same event can arrive twice. Handle it once.
        if event["id"] in seen:
            return {"received": True, "duplicate": True}
        handle(event)
        seen.add(event["id"])
        return {"received": True}

    return router
# #endregion
