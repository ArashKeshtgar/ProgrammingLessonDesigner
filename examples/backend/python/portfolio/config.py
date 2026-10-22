import os
from collections.abc import Mapping

MIN_SECRET_LENGTH = 32


# #region config
def require_secret(env: Mapping[str, str], name: str) -> str:
    # No fallback value: a missing secret stops the app at startup, not on the first login.
    value = env.get(name, "")
    if len(value) < MIN_SECRET_LENGTH:
        raise RuntimeError(f"{name} must be set to a random value of at least {MIN_SECRET_LENGTH} characters.")
    return value


def load_settings(env: Mapping[str, str] = os.environ) -> dict[str, str]:
    access = require_secret(env, "JWT_SECRET")
    refresh = require_secret(env, "JWT_REFRESH_SECRET")
    if access == refresh:
        raise RuntimeError("JWT_SECRET and JWT_REFRESH_SECRET must be different values.")
    return {"jwt_secret": access, "jwt_refresh_secret": refresh, "db_path": env.get("DB_PATH", "portfolio.db")}
# #endregion
