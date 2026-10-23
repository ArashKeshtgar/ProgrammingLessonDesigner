#!/usr/bin/env bash
# Copies the newest backup off the server, then proves the copy restores: checksum,
# integrity check, and a table that is not empty. Nightly, after backup.sh:
#   BACKUP_DIR=/srv/backups OFFSITE_DIR=/mnt/offsite restore-test.sh
set -euo pipefail

backups="${BACKUP_DIR:-/srv/backups}"
offsite="${OFFSITE_DIR:?set OFFSITE_DIR}"
table="${TABLE:-orders}"
min="${MIN_ROWS:-1}"

# #region offsite
latest="$(find "$backups/daily" -mindepth 1 -maxdepth 1 -type d | sort | tail -n 1)"
[[ -n "$latest" ]] || { echo "no backup in $backups/daily" >&2; exit 1; }
stamp="$(basename "$latest")"
copy="$offsite/$stamp"
# On the VPS this is `rclone copy "$latest" offsite:portfolio/$stamp` (or restic):
# another provider and another account, so one mistake or one breach can't reach both.
# Here a folder stands in for that remote. cp -r into an existing folder would nest it.
mkdir -p "$offsite"
[[ -d "$copy" ]] || cp -r "$latest" "$copy"
# #endregion

# #region restore
# From the copy you would have after losing the server, not from the original.
(cd "$copy" && sha256sum --quiet -c SHA256SUMS) || { echo "checksum mismatch in $copy" >&2; exit 1; }
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
gunzip -c "$copy/app.db.gz" > "$tmp/restored.db"
check="$(sqlite3 "$tmp/restored.db" 'PRAGMA integrity_check;')"
[[ "$check" == ok ]] || { echo "integrity check: $check" >&2; exit 1; }
# A backup of an empty database restores perfectly; it is still no backup.
rows="$(sqlite3 "$tmp/restored.db" "SELECT count(*) FROM $table;")"
[[ "$rows" -ge "$min" ]] || { echo "only $rows row(s) in $table, expected $min or more" >&2; exit 1; }
echo "restore test ok: $stamp, $rows rows in $table"
# #endregion
