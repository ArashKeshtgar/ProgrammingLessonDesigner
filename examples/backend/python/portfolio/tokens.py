from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Callable

import jwt

ACCESS_TTL = timedelta(minutes=15)
REFRESH_TTL = timedelta(days=7)
MIN_SECRET_LENGTH = 32


@dataclass
class User:
    id: int
    username: str
    role: str  # "Admin" | "Viewer"
    token_version: int = 0


class AuthError(Exception):
    pass


# #region tokens
class TokenService:
    # Two secrets: a refresh token can never verify as an access token, even before `typ` is read.
    def __init__(self, access_secret: str, refresh_secret: str, find_user: Callable[[int], User | None]):
        if min(len(access_secret), len(refresh_secret)) < MIN_SECRET_LENGTH:
            raise ValueError(f"JWT secrets must be at least {MIN_SECRET_LENGTH} characters.")
        if access_secret == refresh_secret:
            raise ValueError("The access and refresh secrets must be different.")
        self._access, self._refresh, self._find_user = access_secret, refresh_secret, find_user

    def issue(self, user: User) -> dict[str, str]:
        now = datetime.now(timezone.utc)
        access = {"sub": str(user.id), "role": user.role, "typ": "access", "exp": now + ACCESS_TTL}
        refresh = {"sub": str(user.id), "typ": "refresh", "tv": user.token_version, "exp": now + REFRESH_TTL}
        return {
            "access_token": jwt.encode(access, self._access, algorithm="HS256"),
            "refresh_token": jwt.encode(refresh, self._refresh, algorithm="HS256"),
        }

    def verify_access(self, token: str) -> dict:
        try:
            # algorithms= is required: never let the token choose its own algorithm.
            claims = jwt.decode(token, self._access, algorithms=["HS256"])
        except jwt.PyJWTError as e:
            raise AuthError("Invalid or expired token.") from e
        if claims.get("typ") != "access":
            raise AuthError("Not an access token.")
        return claims

    def refresh(self, token: str) -> dict[str, str]:
        try:
            claims = jwt.decode(token, self._refresh, algorithms=["HS256"])
        except jwt.PyJWTError as e:
            raise AuthError("Invalid or expired refresh token.") from e
        if claims.get("typ") != "refresh":
            raise AuthError("Not a refresh token.")
        # Re-read the user: a deleted user, a new role or a logout (token_version bump) applies now.
        user = self._find_user(int(claims["sub"]))
        if user is None or user.token_version != claims["tv"]:
            raise AuthError("Refresh token has been revoked.")
        return self.issue(user)
# #endregion
