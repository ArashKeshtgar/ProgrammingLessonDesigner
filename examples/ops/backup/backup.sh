#!/usr/bin/env bash
# Nightly backup of one SQLite database (the stand-in for the server's SQL Server and
# MongoDB) into BACKUP_DIR/daily/<stamp>/, keeping KEEP_DAYS days. From cron:
#   30 3 * * * DB=/srv/app/app.db /srv/ops/backup.sh >> /srv/backups/backup.log 2>&1
set -euo pipefail

# #region backup
db="${DB:?set DB to the database file}"
backups="${BACKUP_DIR:-/srv/backups}"
keep="${KEEP_DAYS:-14}"
out="$backups/daily/$(date +%Y%m%d-%H%M%S)"

mkdir -p "$out"
echo "[$(date -Is)] backup -> $out"
# .backup takes a consistent copy while the app keeps writing; cp of a live
# database file can catch it halfway through a write.
sqlite3 "$db" ".backup '$out/app.db'"
gzip "$out/app.db"
# The checksum travels with the backup: a copy elsewhere can prove it is intact.
(cd "$out" && sha256sum app.db.gz > SHA256SUMS)
# #endregion

# #region retention
# -mtime +14 means "15 days or more": find counts whole days and drops the fraction.
find "$backups/daily" -mindepth 1 -maxdepth 1 -type d -mtime +"$keep" -print -exec rm -rf {} +
echo "[$(date -Is)] done ($(du -sh "$out" | cut -f1))"
# #endregion
