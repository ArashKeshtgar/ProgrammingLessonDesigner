#!/usr/bin/env bash
# Checks every repo, shows the plan, asks, then pushes and tags a release:
#   release.sh [--dry-run] [--yes] <repo>...
set -euo pipefail

dry_run=false
yes=false
while [[ $# -gt 0 && $1 == --* ]]; do
  case "$1" in
    --dry-run) dry_run=true ;;
    --yes) yes=true ;;
    *) echo "unknown option $1" >&2; exit 2 ;;
  esac
  shift
done
[[ $# -gt 0 ]] || { echo "usage: release.sh [--dry-run] [--yes] <repo>..." >&2; exit 2; }
tag="release-$(date +%Y%m%d-%H%M)"

# #region checks
declare -A default=()
problems=()
for repo in "$@"; do
  name="$(basename "$repo")"
  git -C "$repo" fetch --quiet origin
  # The branch the remote calls default is the one the server pulls.
  default[$repo]="$(git -C "$repo" ls-remote --symref origin HEAD | sed -nE 's|^ref: refs/heads/(\S+)\s+HEAD$|\1|p')"
  branch="$(git -C "$repo" branch --show-current)"
  behind="$(git -C "$repo" rev-list --count "HEAD..origin/${default[$repo]}")"
  ahead="$(git -C "$repo" rev-list --count "origin/${default[$repo]}..HEAD")"
  printf '  %-12s %-8s %s new commit(s)\n' "$name" "$branch" "$ahead"
  [[ "$branch" == "${default[$repo]}" ]] || problems+=("$name is on '$branch', not '${default[$repo]}'")
  [[ -z "$(git -C "$repo" status --porcelain --untracked-files=no)" ]] || problems+=("$name has uncommitted changes")
  [[ "$behind" -eq 0 ]] || problems+=("$name is $behind commit(s) behind origin: pull first")
done
# Every problem of every repo at once, not just the first: one round of fixing.
if [[ ${#problems[@]} -gt 0 ]]; then
  printf '  x %s\n' "${problems[@]}" >&2
  exit 1
fi
# #endregion

# #region confirm
if $dry_run; then
  echo "Dry run: nothing changed. Would tag $tag."
  exit 0
fi
if ! $yes; then
  read -r -p "Push and tag $tag in $# repo(s)? (yes/no) " answer || answer=""
  [[ "$answer" == yes ]] || { echo "Stopped."; exit 1; }
fi
for repo in "$@"; do
  git -C "$repo" push --quiet origin "HEAD:${default[$repo]}"
  # The tag says exactly which commit is on the server, and is the way back.
  git -C "$repo" tag -a "$tag" -m "Released"
  git -C "$repo" push --quiet origin "$tag"
done
echo "Released $tag."
# #endregion
