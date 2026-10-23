#!/usr/bin/env pwsh
# Checks every repo, shows the plan, asks, then pushes and tags a release:
#   release.ps1 [-DryRun] [-Yes] <repo>...
param(
    [Parameter(Mandatory, ValueFromRemainingArguments)][string[]]$Repos,
    [switch]$DryRun,
    [switch]$Yes
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$tag = "release-$(Get-Date -Format 'yyyyMMdd-HHmm')"

# git is a native program: 'Stop' does not see its failures, so every call checks.
function Invoke-Git([string]$repo) {
    $out = & git -C $repo @args
    if ($LASTEXITCODE -ne 0) { throw "git $args in $repo failed" }
    $out
}

#region checks
$default = @{}
$problems = @()
foreach ($repo in $Repos) {
    $name = Split-Path $repo -Leaf
    Invoke-Git $repo fetch --quiet origin | Out-Null
    # The branch the remote calls default is the one the server pulls.
    $default[$repo] = (Invoke-Git $repo ls-remote --symref origin HEAD |
        Select-String '^ref: refs/heads/(\S+)\s+HEAD$').Matches[0].Groups[1].Value
    $branch = Invoke-Git $repo branch --show-current
    $behind = [int](Invoke-Git $repo rev-list --count "HEAD..origin/$($default[$repo])")
    $ahead = [int](Invoke-Git $repo rev-list --count "origin/$($default[$repo])..HEAD")
    '  {0,-12} {1,-8} {2} new commit(s)' -f $name, $branch, $ahead
    if ($branch -ne $default[$repo]) { $problems += "$name is on '$branch', not '$($default[$repo])'" }
    if (Invoke-Git $repo status --porcelain --untracked-files=no) { $problems += "$name has uncommitted changes" }
    if ($behind -gt 0) { $problems += "$name is $behind commit(s) behind origin: pull first" }
}
# Every problem of every repo at once, not just the first: one round of fixing.
if ($problems) {
    $problems | ForEach-Object { [Console]::Error.WriteLine("  x $_") }
    exit 1
}
#endregion

#region confirm
if ($DryRun) {
    "Dry run: nothing changed. Would tag $tag."
    exit 0
}
if (-not $Yes) {
    # Not Read-Host: it throws under -NonInteractive (CI, scheduled tasks), and this
    # reads a piped answer the same way as a typed one. The prompt goes to stderr, as
    # bash's read -p does, so it never mixes with the output.
    [Console]::Error.Write("Push and tag $tag in $($Repos.Count) repo(s)? (yes/no) ")
    if ([Console]::In.ReadLine() -ne 'yes') { 'Stopped.'; exit 1 }
}
foreach ($repo in $Repos) {
    Invoke-Git $repo push --quiet origin "HEAD:$($default[$repo])" | Out-Null
    # The tag says exactly which commit is on the server, and is the way back.
    Invoke-Git $repo tag -a $tag -m 'Released' | Out-Null
    Invoke-Git $repo push --quiet origin $tag | Out-Null
}
"Released $tag."
#endregion
