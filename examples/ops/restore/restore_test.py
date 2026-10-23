"""Copies the newest backup off the server, then proves the copy restores: checksum,
integrity check, and a table that is not empty. Nightly, after backup.py."""

import gzip
import hashlib
import os
import shutil
import sqlite3
import sys
import tempfile
from contextlib import closing
from pathlib import Path

backups = Path(os.environ.get("BACKUP_DIR", "/srv/backups"))
offsite = Path(os.environ["OFFSITE_DIR"])
table = os.environ.get("TABLE", "orders")
minimum = int(os.environ.get("MIN_ROWS", "1"))

# #region offsite
daily = sorted(d for d in (backups / "daily").iterdir() if d.is_dir())
if not daily:
    sys.exit(f"no backup in {backups / 'daily'}")
latest = daily[-1]
copy = offsite / latest.name
# On the VPS this is `rclone copy` (or restic) to another provider and another account.
# Here a folder stands in for that remote. Only what is not there yet is copied.
offsite.mkdir(parents=True, exist_ok=True)
if not copy.exists():
    shutil.copytree(latest, copy)
# #endregion

# #region restore
# From the copy you would have after losing the server, not from the original.
expected = (copy / "SHA256SUMS").read_text().split()[0]
if hashlib.sha256((copy / "app.db.gz").read_bytes()).hexdigest() != expected:
    sys.exit(f"checksum mismatch in {copy}")
with tempfile.TemporaryDirectory() as tmp:
    restored = Path(tmp) / "restored.db"
    with gzip.open(copy / "app.db.gz", "rb") as z, open(restored, "wb") as f:
        shutil.copyfileobj(z, f)
    with closing(sqlite3.connect(restored)) as conn:
        check = conn.execute("PRAGMA integrity_check").fetchone()[0]
        if check != "ok":
            sys.exit(f"integrity check: {check}")
        # A backup of an empty database restores perfectly; it is still no backup.
        rows = conn.execute(f"SELECT count(*) FROM {table}").fetchone()[0]
if rows < minimum:
    sys.exit(f"only {rows} row(s) in {table}, expected {minimum} or more")
print(f"restore test ok: {latest.name}, {rows} rows in {table}")
# #endregion
