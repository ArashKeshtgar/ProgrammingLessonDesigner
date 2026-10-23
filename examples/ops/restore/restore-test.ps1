#!/usr/bin/env pwsh
# Copies the newest backup off the server, then proves the copy restores: checksum,
# integrity check, and a table that is not empty. Nightly, after backup.ps1.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$backups = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { '/srv/backups' }
$offsite = $env:OFFSITE_DIR
if (-not $offsite) { throw 'set OFFSITE_DIR' }
$table = if ($env:TABLE) { $env:TABLE } else { 'orders' }
$min = if ($env:MIN_ROWS) { [int]$env:MIN_ROWS } else { 1 }

#region offsite
$latest = Get-ChildItem (Join-Path $backups 'daily') -Directory | Sort-Object Name | Select-Object -Last 1
if (-not $latest) { throw "no backup in $backups/daily" }
$copy = Join-Path $offsite $latest.Name
# On the VPS this is `rclone copy` (or restic) to another provider and another account.
# Here a folder stands in for that remote. Copy-Item -Recurse into an existing folder
# would nest it, so only copy what is not there yet.
New-Item -ItemType Directory -Force $offsite | Out-Null
if (-not (Test-Path $copy)) { Copy-Item $latest.FullName $copy -Recurse }
#endregion

#region restore
# From the copy you would have after losing the server, not from the original.
$expected = ((Get-Content (Join-Path $copy 'SHA256SUMS')) -split '\s+')[0]
$actual = (Get-FileHash (Join-Path $copy 'app.db.gz') -Algorithm SHA256).Hash
if ($actual -ne $expected) { throw "checksum mismatch in $copy" }   # -ne ignores case

$tmp = Join-Path ([IO.Path]::GetTempPath()) ([guid]::NewGuid())
New-Item -ItemType Directory $tmp | Out-Null
try {
    $restored = Join-Path $tmp 'restored.db'
    $zip = [IO.Compression.GZipStream]::new([IO.File]::OpenRead((Join-Path $copy 'app.db.gz')), [IO.Compression.CompressionMode]::Decompress)
    $file = [IO.File]::Create($restored)
    try { $zip.CopyTo($file) } finally { $file.Dispose(); $zip.Dispose() }

    $check = sqlite3 $restored 'PRAGMA integrity_check;'
    if ($LASTEXITCODE -ne 0 -or $check -ne 'ok') { throw "integrity check: $check" }
    # A backup of an empty database restores perfectly; it is still no backup.
    $rows = [int](sqlite3 $restored "SELECT count(*) FROM $table;")
    if ($LASTEXITCODE -ne 0) { throw "no table $table in the backup" }
    if ($rows -lt $min) { throw "only $rows row(s) in $table, expected $min or more" }
    "restore test ok: $($latest.Name), $rows rows in $table"
}
finally { Remove-Item $tmp -Recurse -Force }
#endregion
