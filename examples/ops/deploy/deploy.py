"""Pulls every repo under a folder, then waits until the app answers its health URL:
HEALTH_URL=http://localhost:8080/status python3 deploy.py <repos folder>
The real one rebuilds containers between the two steps (docker compose up -d --build)."""

import fcntl
import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

root = Path(sys.argv[1])
url = os.environ["HEALTH_URL"]
timeout = int(os.environ.get("HEALTH_TIMEOUT", "60"))
lock_file = os.environ.get("LOCK_FILE", "/tmp/portfolio-deploy.lock")

# #region lock
# One deploy at a time: the same flock(2) as bash's `flock`, so the two even exclude
# each other. Released when the file is closed or the process ends, however it ends.
lock = open(lock_file, "w")  # not `with`: it is held for the whole run
try:
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
except BlockingIOError:
    print("another deploy is running; waiting", flush=True)
    fcntl.flock(lock, fcntl.LOCK_EX)
# #endregion

# #region pull
for d in sorted(root.iterdir()):
    if not (d / ".git").is_dir():
        continue
    print(f"pull {d.name}", flush=True)
    # --ff-only: the server's copy never has commits of its own. If it somehow does,
    # stop here rather than invent a merge commit nobody reviewed.
    subprocess.run(["git", "-C", str(d), "pull", "--quiet", "--ff-only"], check=True)
# #endregion

# #region health
for _ in range(timeout):
    try:
        with urllib.request.urlopen(url, timeout=5) as r:
            if r.status == 200:
                print("deploy ok")
                sys.exit(0)
    except OSError:  # refused, timed out, or an HTTP error status (HTTPError is an OSError)
        pass
    time.sleep(1)
sys.exit(f"not healthy after {timeout}s: {url}")
# #endregion
