#!/usr/bin/env pwsh
# Writes the SSH hardening drop-in and proves sshd really uses it. As root:
#   pwsh harden-ssh.ps1
# On a server, `systemctl reload ssh` follows; the test container has no systemd.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$dir = '/etc/ssh/sshd_config.d'

#region harden
# sshd keeps the FIRST value it reads for a setting, and cloud images ship
# 50-cloud-init.conf with "PasswordAuthentication yes": this file must sort before it.
Remove-Item "$dir/99-hardening.conf" -ErrorAction Ignore
# Joined with "`n": a here-string takes the line endings of the .ps1 file itself,
# and a CRLF checkout would hand sshd "no`r".
@(
    'PermitRootLogin no'
    'PasswordAuthentication no'
    'KbdInteractiveAuthentication no'
    'PubkeyAuthentication yes'
    'MaxAuthTries 3'
    'X11Forwarding no'
) -join "`n" | Set-Content -NoNewline "$dir/00-hardening.conf"

# 'Stop' covers cmdlets only: a native program that fails just sets $LASTEXITCODE.
sshd -t
if ($LASTEXITCODE -ne 0) { throw 'sshd -t rejected the configuration' }
$effective = sshd -T
if ($LASTEXITCODE -ne 0) { throw 'sshd -T failed' }
if ($effective -notcontains 'passwordauthentication no') { throw 'sshd still accepts passwords' }
'ssh hardened'
#endregion
