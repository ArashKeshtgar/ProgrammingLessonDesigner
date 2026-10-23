#!/usr/bin/env pwsh
# Nightly backup of one SQLite database (the stand-in for the server's SQL Server and
# MongoDB) into BACKUP_DIR/daily/<stamp>/, keeping KEEP_DAYS days. From Task Scheduler:
#   Register-ScheduledTask Backup -Trigger (New-ScheduledTaskTrigger -Daily -At 3:30am) `
#       -Action (New-ScheduledTaskAction pwsh '-NoProfile -NonInteractive -File C:\ops\backup.ps1')
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

#region backup
$db = $env:DB
if (-not $db) { throw 'set DB to the database file' }
$backups = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { '/srv/backups' }
$keep = if ($env:KEEP_DAYS) { [int]$env:KEEP_DAYS } else { 14 }
$out = Join-Path $backups "daily/$(Get-Date -Format 'yyyyMMdd-HHmmss')"

New-Item -ItemType Directory -Force $out | Out-Null
"[$(Get-Date -Format o)] backup -> $out"
# .backup takes a consistent copy while the app keeps writing; Copy-Item of a live
# database file can catch it halfway through a write.
sqlite3 $db ".backup '$out/app.db'"
if ($LASTEXITCODE -ne 0) { throw "sqlite3 .backup failed ($LASTEXITCODE)" }

$source = [IO.File]::OpenRead("$out/app.db")
$target = [IO.Compression.GZipStream]::new([IO.File]::Create("$out/app.db.gz"), [IO.Compression.CompressionLevel]::Optimal)
try { $source.CopyTo($target) } finally { $target.Dispose(); $source.Dispose() }
Remove-Item "$out/app.db"
# The checksum travels with the backup, in sha256sum's format so `sha256sum -c` reads it.
$hash = (Get-FileHash "$out/app.db.gz" -Algorithm SHA256).Hash.ToLower()
Set-Content "$out/SHA256SUMS" "$hash  app.db.gz"
#endregion

#region retention
# Exactly KEEP_DAYS x 24 hours, unlike find -mtime, which rounds down to whole days.
$cutoff = (Get-Date).AddDays(-$keep)
Get-ChildItem (Join-Path $backups 'daily') -Directory |
    Where-Object LastWriteTime -lt $cutoff |
    ForEach-Object { $_.FullName; Remove-Item $_.FullName -Recurse -Force }
"[$(Get-Date -Format o)] done ($([math]::Round((Get-Item "$out/app.db.gz").Length / 1KB)) KB)"
#endregion
