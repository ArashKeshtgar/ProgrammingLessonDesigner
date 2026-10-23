#!/usr/bin/env bash
# Counts the ERROR lines of a log and shows the three most common messages:
#   log-summary.sh <log file>
# #region strict
set -euo pipefail

log="${1:?usage: log-summary.sh <log file>}"

# grep exits 0 = found, 1 = nothing found, 2 = could not read the file. Under pipefail
# "nothing found" would stop the script, but here it is an answer: only 1 is excused.
matches() { grep "$@" || [[ $? -eq 1 ]]; }

count="$(matches -c 'ERROR' "$log")"
echo "errors: $count"
# awk, not head: head exits after 3 lines and a long sort output would then die of
# SIGPIPE, which pipefail reports as a failure (exit 141).
matches 'ERROR' "$log" | sed -E 's/.*ERROR:? *//' | sort | uniq -c | sort -rn | awk 'NR <= 3'
# #endregion
