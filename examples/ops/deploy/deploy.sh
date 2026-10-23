#!/usr/bin/env bash
# Pulls every repo under a folder, then waits until the app answers its health URL:
#   HEALTH_URL=http://localhost:8080/status deploy.sh <repos folder>
# The real one rebuilds containers between the two steps (docker compose up -d --build).
set -euo pipefail

root="${1:?usage: deploy.sh <repos folder>}"
url="${HEALTH_URL:?set HEALTH_URL}"
timeout="${HEALTH_TIMEOUT:-60}"
lock="${LOCK_FILE:-/tmp/portfolio-deploy.lock}"

# #region lock
# One deploy at a time: a push that lands during a deploy waits for it instead of
# pulling and rebuilding over it. The kernel drops the lock when this process ends,
# however it ends, so a crashed deploy never leaves a stale lock behind.
exec 9>"$lock"
if ! flock -n 9; then
  echo "another deploy is running; waiting"
  flock 9
fi
# #endregion

# #region pull
for dir in "$root"/*/; do
  [[ -d "$dir/.git" ]] || continue
  echo "pull $(basename "$dir")"
  # --ff-only: the server's copy never has commits of its own. If it somehow does,
  # stop here rather than invent a merge commit nobody reviewed.
  git -C "$dir" pull --quiet --ff-only
done
# #endregion

# #region health
for _ in $(seq "$timeout"); do
  if curl -fsS -o /dev/null -m 5 "$url"; then
    echo "deploy ok"
    exit 0
  fi
  sleep 1
done
echo "not healthy after ${timeout}s: $url" >&2
exit 1
# #endregion
