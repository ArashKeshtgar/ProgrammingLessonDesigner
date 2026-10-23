#!/usr/bin/env bash
# The forced command of the CI key (command= in authorized_keys). sshd runs this
# whatever the client asked for, and puts the request in SSH_ORIGINAL_COMMAND.
# On the server it is deploy.sh; here it only says what happened, for the tests.
set -euo pipefail
echo "deploying (asked for: ${SSH_ORIGINAL_COMMAND:-nothing})"
