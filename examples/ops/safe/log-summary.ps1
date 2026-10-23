#!/usr/bin/env pwsh
# Counts the ERROR lines of a log and shows the three most common messages:
#   log-summary.ps1 <log file>
#region strict
param([Parameter(Mandatory)][string]$Log)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# A missing file is a non-terminating error for Select-String: without 'Stop' it prints
# red text, $found is empty and the script reports 0. -CaseSensitive: grep is, and
# Select-String is not by default.
$found = @(Select-String -LiteralPath $Log -Pattern 'ERROR' -SimpleMatch -CaseSensitive)
"errors: $($found.Count)"
$found | ForEach-Object { $_.Line -replace '.*ERROR:? *', '' } |
    Group-Object -NoElement | Sort-Object Count -Descending | Select-Object -First 3 |
    ForEach-Object { '{0,7} {1}' -f $_.Count, $_.Name }
#endregion
