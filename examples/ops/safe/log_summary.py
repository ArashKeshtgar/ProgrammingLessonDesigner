"""Counts the ERROR lines of a log and shows the three most common messages:
python3 log_summary.py <log file>"""

# #region strict
import re
import sys
from collections import Counter
from pathlib import Path

# Python stops by itself: a missing file raises, and an uncaught exception ends the
# script with exit code 1 and a traceback. Nothing to switch on.
lines = Path(sys.argv[1]).read_text(encoding="utf-8").splitlines()
errors = [line for line in lines if "ERROR" in line]
print(f"errors: {len(errors)}")
messages = Counter(re.sub(r".*ERROR:? *", "", line, count=1) for line in errors)
for message, n in messages.most_common(3):
    print(f"{n:7d} {message}")
# #endregion
