"""Nightly backup of one SQLite database (the stand-in for the server's SQL Server and
MongoDB) into BACKUP_DIR/daily/<stamp>/, keeping KEEP_DAYS days. Scheduled from cron
or a systemd timer, like the bash one; Python has no scheduler of its own."""

import gzip
import hashlib
import os
import shutil
import sqlite3
import time
from contextlib import closing
from datetime import datetime
from pathlib import Path

# #region backup
db = os.environ["DB"]
backups = Path(os.environ.get("BACKUP_DIR", "/srv/backups"))
keep = int(os.environ.get("KEEP_DAYS", "14"))
out = backups / "daily" / f"{datetime.now():%Y%m%d-%H%M%S}"

out.mkdir(parents=True)
print(f"[{datetime.now().isoformat(timespec='seconds')}] backup -> {out}", flush=True)
# The backup API takes a consistent copy while the app keeps writing; shutil.copy of a
# live database file can catch it halfway through a write. closing(): `with` on a
# bare sqlite3 connection only commits, it does not close the file.
with closing(sqlite3.connect(db)) as src, closing(sqlite3.connect(out / "app.db")) as dst:
    src.backup(dst)
with open(out / "app.db", "rb") as f, gzip.open(out / "app.db.gz", "wb") as z:
    shutil.copyfileobj(f, z)
(out / "app.db").unlink()
# The checksum travels with the backup, in sha256sum's format so `sha256sum -c` reads it.
digest = hashlib.sha256((out / "app.db.gz").read_bytes()).hexdigest()
(out / "SHA256SUMS").write_text(f"{digest}  app.db.gz\n")
# #endregion

# #region retention
# Exactly KEEP_DAYS x 24 hours, unlike find -mtime, which rounds down to whole days.
cutoff = time.time() - keep * 86400
for d in (backups / "daily").iterdir():
    if d.is_dir() and d.stat().st_mtime < cutoff:
        print(d)
        shutil.rmtree(d)
print(f"[{datetime.now().isoformat(timespec='seconds')}] done ({(out / 'app.db.gz').stat().st_size // 1024} KB)")
# #endregion
