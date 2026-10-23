#!/usr/bin/env bash
# Writes the SSH hardening drop-in and proves sshd really uses it. As root:
#   harden-ssh.sh
# On a server, `systemctl reload ssh` follows; the test container has no systemd.
set -euo pipefail

DIR=/etc/ssh/sshd_config.d

# #region harden
# sshd keeps the FIRST value it reads for a setting, and cloud images ship
# 50-cloud-init.conf with "PasswordAuthentication yes": this file must sort before it.
rm -f "$DIR/99-hardening.conf"
cat > "$DIR/00-hardening.conf" <<'EOF'
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
X11Forwarding no
EOF

sshd -t   # syntax check: a broken config would lock everyone out on the next reload
# Ask sshd what it will do, not what the file says. Into a variable first: in
# `sshd -T | grep -q`, grep quits at the first match, sshd dies of SIGPIPE writing
# the rest, and pipefail reports the whole pipeline as failed.
effective="$(sshd -T)"
grep -qx 'passwordauthentication no' <<<"$effective" || { echo "sshd still accepts passwords" >&2; exit 1; }
echo "ssh hardened"
# #endregion
