#!/usr/bin/env pwsh
# Pulls every repo under a folder, then waits until the app answers its health URL:
#   $env:HEALTH_URL = 'http://localhost:8080/status'; deploy.ps1 <repos folder>
# The real one rebuilds containers between the two steps (docker compose up -d --build).
param([Parameter(Mandatory)][string]$Root)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$url = $env:HEALTH_URL
if (-not $url) { throw 'set HEALTH_URL' }
$timeout = if ($env:HEALTH_TIMEOUT) { [int]$env:HEALTH_TIMEOUT } else { 60 }
$lockFile = if ($env:LOCK_FILE) { $env:LOCK_FILE } else { '/tmp/portfolio-deploy.lock' }

#region lock
# One deploy at a time. FileShare.None is an exclusive lock (on Linux .NET takes the
# same flock as bash's `flock`); it fails at once instead of waiting, hence the loop.
# The lock goes when the handle is closed or the process ends.
$lock = $null
$said = $false
while (-not $lock) {
    try { $lock = [IO.File]::Open($lockFile, 'OpenOrCreate', 'ReadWrite', 'None') }
    catch [IO.IOException] {
        if (-not $said) { 'another deploy is running; waiting'; $said = $true }
        Start-Sleep -Milliseconds 500
    }
}
#endregion

try {
    #region pull
    foreach ($dir in Get-ChildItem -LiteralPath $Root -Directory) {
        if (-not (Test-Path (Join-Path $dir.FullName '.git'))) { continue }
        "pull $($dir.Name)"
        # --ff-only: the server's copy never has commits of its own. If it somehow
        # does, stop here rather than invent a merge commit nobody reviewed.
        git -C $dir.FullName pull --quiet --ff-only
        if ($LASTEXITCODE -ne 0) { throw "git pull --ff-only failed in $($dir.Name)" }
    }
    #endregion

    #region health
    foreach ($i in 1..$timeout) {
        try {
            $r = Invoke-WebRequest -Uri $url -TimeoutSec 5
            if ($r.StatusCode -eq 200) { 'deploy ok'; exit 0 }
        }
        catch { Start-Sleep -Seconds 1 }
    }
    throw "not healthy after ${timeout}s: $url"
    #endregion
}
finally { $lock.Dispose() }
