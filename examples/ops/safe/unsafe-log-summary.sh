#!/usr/bin/env bash
# The same summary without strict mode, kept to show what goes wrong: given a log
# that does not exist it prints "errors: 0" and exits 0. The tests check that it does.
# #region unsafe
log="$1"
# shellcheck disable=SC2126  # grep | wc -l on purpose: it is the pipeline that lies
count="$(grep 'ERROR' "$log" | wc -l)"
echo "errors: $count"
# #endregion
