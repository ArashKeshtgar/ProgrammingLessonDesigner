"""Checks every repo, shows the plan, asks, then pushes and tags a release:
python3 release.py [--dry-run] [--yes] <repo>..."""

import argparse
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("repos", nargs="+")
parser.add_argument("--dry-run", action="store_true")
parser.add_argument("--yes", action="store_true")
args = parser.parse_args()
tag = f"release-{datetime.now():%Y%m%d-%H%M}"


def git(repo: str, *argv: str) -> str:
    # check=True: a failing git raises CalledProcessError and ends the script.
    return subprocess.run(["git", "-C", repo, *argv], check=True, capture_output=True, text=True).stdout.strip()


# #region checks
default: dict[str, str] = {}
problems: list[str] = []
for repo in args.repos:
    name = Path(repo).name
    git(repo, "fetch", "--quiet", "origin")
    # The branch the remote calls default is the one the server pulls.
    default[repo] = re.search(r"^ref: refs/heads/(\S+)\s+HEAD$", git(repo, "ls-remote", "--symref", "origin", "HEAD"), re.M)[1]
    branch = git(repo, "branch", "--show-current")
    behind = int(git(repo, "rev-list", "--count", f"HEAD..origin/{default[repo]}"))
    ahead = int(git(repo, "rev-list", "--count", f"origin/{default[repo]}..HEAD"))
    print(f"  {name:<12} {branch:<8} {ahead} new commit(s)")
    if branch != default[repo]:
        problems.append(f"{name} is on '{branch}', not '{default[repo]}'")
    if git(repo, "status", "--porcelain", "--untracked-files=no"):
        problems.append(f"{name} has uncommitted changes")
    if behind:
        problems.append(f"{name} is {behind} commit(s) behind origin: pull first")
# Every problem of every repo at once, not just the first: one round of fixing.
if problems:
    print("\n".join(f"  x {p}" for p in problems), file=sys.stderr)
    sys.exit(1)
# #endregion

# #region confirm
if args.dry_run:
    print(f"Dry run: nothing changed. Would tag {tag}.")
    sys.exit(0)
if not args.yes:
    try:
        answer = input(f"Push and tag {tag} in {len(args.repos)} repo(s)? (yes/no) ")
    except EOFError:  # no terminal and nothing piped in
        answer = ""
    if answer != "yes":
        print("Stopped.")
        sys.exit(1)
for repo in args.repos:
    git(repo, "push", "--quiet", "origin", f"HEAD:{default[repo]}")
    # The tag says exactly which commit is on the server, and is the way back.
    git(repo, "tag", "-a", tag, "-m", "Released")
    git(repo, "push", "--quiet", "origin", tag)
print(f"Released {tag}.")
# #endregion
