"""Writes the SSH hardening drop-in and proves sshd really uses it. As root:
python3 harden_ssh.py
On a server, `systemctl reload ssh` follows; the test container has no systemd."""

import subprocess
import sys
from pathlib import Path

DIR = Path("/etc/ssh/sshd_config.d")

# #region harden
HARDENING = """\
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
X11Forwarding no
"""

# sshd keeps the FIRST value it reads for a setting, and cloud images ship
# 50-cloud-init.conf with "PasswordAuthentication yes": this file must sort before it.
(DIR / "99-hardening.conf").unlink(missing_ok=True)
(DIR / "00-hardening.conf").write_text(HARDENING, encoding="utf-8")

# check=True turns a non-zero exit into an exception; without it, a failure is silent.
subprocess.run(["sshd", "-t"], check=True)
effective = subprocess.run(["sshd", "-T"], check=True, capture_output=True, text=True).stdout
if "passwordauthentication no" not in effective.splitlines():
    sys.exit("sshd still accepts passwords")
print("ssh hardened")
# #endregion
