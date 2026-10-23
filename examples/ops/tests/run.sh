#!/usr/bin/env bash
# Runs every ops example in bash, PowerShell and Python and checks what each one did,
# inside the container of ../Dockerfile (Ubuntu 24.04, as root, so sshd can be used):
#   docker build -t lessons-ops examples/ops && docker run --rm lessons-ops
# Not -e: a failing check is counted and reported, and the next one still runs.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

LANGS=(bash pwsh python)
passed=0
failed=0

# check <name> <exit: a number, or "fail" for any non-zero> <text the output must
# contain, or "!text" it must not> -- <command...>
check() {
  local name="$1" want="$2" text="$3" out code ok=true
  shift 4
  out="$("$@" 2>&1)"
  code=$?
  if [[ "$want" == fail ]]; then [[ $code -ne 0 ]] || ok=false; else [[ $code -eq $want ]] || ok=false; fi
  if [[ "$text" == !* ]]; then [[ "$out" != *"${text:1}"* ]] || ok=false; else [[ "$out" == *"$text"* ]] || ok=false; fi
  if $ok; then
    echo "  ok    $name"
    passed=$((passed + 1))
  else
    echo "  FAIL  $name (exit $code, wanted $want)"
    printf '%s\n' "$out" | sed 's/^/          /'
    failed=$((failed + 1))
  fi
}

# run <lang> <dir/script> [args...]: the same example in the given language.
run() {
  local lang="$1" base="$2"
  shift 2
  case "$lang" in
    bash) bash "$base.sh" "$@" ;;
    pwsh) pwsh -NoProfile -NonInteractive -File "$base.ps1" "$@" ;;
    python) python3 "${base//-/_}.py" "$@" ;;
  esac
}
# The same switch, spelled the way each language spells it.
flag() { if [[ "$1" == pwsh ]]; then echo "$3"; else echo "$2"; fi; }
answer() { local a="$1"; shift; printf '%s\n' "$a" | "$@"; }

# A clone of a fresh bare "GitHub" repo, with one pushed commit.
make_repo() {
  rm -rf "$1" "$1.git"
  git init -q --bare "$1.git"
  git clone -q "$1.git" "$1" 2>/dev/null
  echo one > "$1/file.txt"
  git -C "$1" add file.txt
  git -C "$1" commit -q -m one
  git -C "$1" push -q origin main
}
# Pushes a commit to the repo's remote from a second clone, so the first falls behind.
push_elsewhere() {
  rm -rf "$1.other"
  git clone -q "$1.git" "$1.other"
  git -C "$1.other" commit -q --allow-empty -m elsewhere
  git -C "$1.other" push -q origin main
}

echo "1. Strict mode"
cat > /tmp/app.log <<'EOF'
2026-10-22 03:30:01 INFO backup started
2026-10-22 03:30:02 ERROR: db timeout
2026-10-22 03:30:03 ERROR: disk full
2026-10-22 03:30:04 ERROR: db timeout
2026-10-22 03:30:05 error: lower case, not counted
EOF
printf '2026-10-22 03:30:01 INFO all good\n' > /tmp/clean.log
for lang in "${LANGS[@]}"; do
  check "$lang: counts and groups the errors" 0 $'errors: 3\n      2 db timeout\n      1 disk full' -- run "$lang" safe/log-summary /tmp/app.log
  check "$lang: no errors is an answer, not a failure" 0 "errors: 0" -- run "$lang" safe/log-summary /tmp/clean.log
  check "$lang: a missing log stops the script" fail "!errors:" -- run "$lang" safe/log-summary /tmp/missing.log
done
check "without strict mode a missing log reads as 0 errors, exit 0" 0 "errors: 0" -- bash safe/unsafe-log-summary.sh /tmp/missing.log

echo "2. SSH hardening"
DROPINS=/etc/ssh/sshd_config.d
cloud_image() {
  rm -f "$DROPINS"/*.conf
  printf 'PasswordAuthentication yes\n' > "$DROPINS/50-cloud-init.conf"
  printf 'PasswordAuthentication no\n' > "$DROPINS/99-hardening.conf"
}
effective() { sshd -T | grep '^passwordauthentication '; }
cloud_image
check "a 99- drop-in loses to 50-cloud-init.conf: first value wins" 0 "passwordauthentication yes" -- effective
for lang in "${LANGS[@]}"; do
  cloud_image
  check "$lang: writes 00-hardening.conf and verifies it" 0 "ssh hardened" -- run "$lang" server/harden-ssh
  check "$lang: sshd now refuses passwords" 0 "passwordauthentication no" -- effective
  check "$lang: the old 99- file is gone" 1 "" -- test -e "$DROPINS/99-hardening.conf"
done

echo "3. Release"
for lang in "${LANGS[@]}"; do
  r="/tmp/release/$lang"
  mkdir -p "$r"
  make_repo "$r/api"
  make_repo "$r/web"
  git -C "$r/api" commit -q --allow-empty -m "new feature"
  check "$lang: dry run shows the plan" 0 "api          main     1 new commit(s)" -- run "$lang" release/release "$(flag "$lang" --dry-run -DryRun)" "$r/api" "$r/web"
  check "$lang: dry run changes nothing" 0 "!release-" -- git -C "$r/api.git" tag
  check "$lang: anything but yes stops" 1 "Stopped." -- answer no run "$lang" release/release "$r/api" "$r/web"
  check "$lang: yes pushes and tags" 0 "Released release-" -- answer yes run "$lang" release/release "$r/api" "$r/web"
  check "$lang: the tag is on GitHub" 0 "release-" -- git -C "$r/api.git" tag
  check "$lang: the commit is on GitHub" 0 "new feature" -- git -C "$r/api.git" log --oneline main
  git -C "$r/api" switch -q -c feature
  echo two > "$r/web/file.txt"
  check "$lang: wrong branch is refused" 1 "api is on 'feature', not 'main'" -- run "$lang" release/release "$(flag "$lang" --dry-run -DryRun)" "$r/api" "$r/web"
  check "$lang: ...and every other problem in the same run" 1 "web has uncommitted changes" -- run "$lang" release/release "$(flag "$lang" --dry-run -DryRun)" "$r/api" "$r/web"
  git -C "$r/web" checkout -q -- file.txt
  push_elsewhere "$r/web"
  check "$lang: behind GitHub is refused" 1 "web is 1 commit(s) behind origin" -- run "$lang" release/release "$(flag "$lang" --dry-run -DryRun)" "$r/web"
done

echo "4. Deploy"
mkdir -p /tmp/www && echo ok > /tmp/www/status
(cd /tmp/www && exec python3 -m http.server 18080 >/dev/null 2>&1) &
web_pid=$!
for _ in $(seq 20); do curl -fs -o /dev/null http://localhost:18080/status && break; sleep 0.5; done
export LOCK_FILE=/tmp/deploy.lock
for lang in "${LANGS[@]}"; do
  d="/tmp/deploy/$lang"
  mkdir -p "$d/srv"
  make_repo "$d/srv/app"
  rm -rf "$d/app.git" && mv "$d/srv/app.git" "$d/app.git"
  git -C "$d/srv/app" remote set-url origin "$d/app.git"
  push_elsewhere "$d/app"
  export HEALTH_URL=http://localhost:18080/status HEALTH_TIMEOUT=10
  check "$lang: pulls and waits for health" 0 "deploy ok" -- run "$lang" deploy/deploy "$d/srv"
  check "$lang: the server copy has the new commit" 0 "elsewhere" -- git -C "$d/srv/app" log --oneline -1
  flock "$LOCK_FILE" sleep 3 &
  sleep 0.5
  check "$lang: a second deploy waits for the first" 0 "another deploy is running; waiting" -- run "$lang" deploy/deploy "$d/srv"
  wait $!
  git -C "$d/srv/app" commit -q --allow-empty -m "made on the server"
  push_elsewhere "$d/app"
  check "$lang: a diverged server copy stops the deploy" fail "!deploy ok" -- run "$lang" deploy/deploy "$d/srv"
  git -C "$d/srv/app" reset -q --hard origin/main
  export HEALTH_URL=http://localhost:18099/status HEALTH_TIMEOUT=2
  check "$lang: no answer from the app is a failed deploy" fail "not healthy after 2s" -- run "$lang" deploy/deploy "$d/srv"
done
kill "$web_pid"
unset LOCK_FILE HEALTH_URL HEALTH_TIMEOUT

echo "5. Nightly backup"
make_db() {
  rm -f "$1"
  sqlite3 "$1" "CREATE TABLE orders (id INTEGER PRIMARY KEY, item TEXT);"
  for i in $(seq "$2"); do sqlite3 "$1" "INSERT INTO orders (item) VALUES ('item $i');"; done
}
make_db /tmp/app.db 5
export DB=/tmp/app.db KEEP_DAYS=14
for lang in "${LANGS[@]}"; do
  export BACKUP_DIR="/tmp/backups/$lang"
  rm -rf "$BACKUP_DIR"
  mkdir -p "$BACKUP_DIR"/daily/{old-20-days,mid-14-and-a-half,new-10-days}
  touch -d '20 days ago' "$BACKUP_DIR/daily/old-20-days"
  touch -d '348 hours ago' "$BACKUP_DIR/daily/mid-14-and-a-half"
  touch -d '10 days ago' "$BACKUP_DIR/daily/new-10-days"
  check "$lang: backs up" 0 "done" -- run "$lang" backup/backup
  newest="$(find "$BACKUP_DIR/daily" -mindepth 1 -maxdepth 1 -name '2*' | sort | tail -n 1)"
  check "$lang: gzip and checksum, readable by sha256sum -c" 0 "app.db.gz: OK" -- bash -c "cd '$newest' && sha256sum -c SHA256SUMS"
  check "$lang: 20 days old is removed" 1 "" -- test -e "$BACKUP_DIR/daily/old-20-days"
  check "$lang: 10 days old is kept" 0 "" -- test -e "$BACKUP_DIR/daily/new-10-days"
done
# find -mtime +14 counts whole days; the other two compare exact times.
check "bash: 14.5 days is kept (find rounds down to 14)" 0 "" -- test -e /tmp/backups/bash/daily/mid-14-and-a-half
check "pwsh: 14.5 days is removed" 1 "" -- test -e /tmp/backups/pwsh/daily/mid-14-and-a-half
check "python: 14.5 days is removed" 1 "" -- test -e /tmp/backups/python/daily/mid-14-and-a-half
unset KEEP_DAYS

echo "6. Restore test"
backup_of() { # backup_of <dir> <rows>: one nightly backup of a database with that many orders
  rm -rf "$1"
  make_db /tmp/restore-src.db "$2"
  DB=/tmp/restore-src.db BACKUP_DIR="$1" bash backup/backup.sh >/dev/null
}
backup_of /tmp/rs/good 5
backup_of /tmp/rs/empty 0
backup_of /tmp/rs/corrupt 5
gz="$(find /tmp/rs/corrupt/daily -name app.db.gz)"
printf 'garbage' >> "$gz"
mkdir -p /tmp/rs/none/daily
for lang in "${LANGS[@]}"; do
  o="/tmp/rs/offsite-$lang"
  rm -rf "$o"
  export OFFSITE_DIR="$o"
  BACKUP_DIR=/tmp/rs/good check "$lang: a good backup restores" 0 "5 rows in orders" -- run "$lang" restore/restore-test
  check "$lang: the off-server copy is there" 0 "app.db.gz" -- ls -R "$o"
  BACKUP_DIR=/tmp/rs/corrupt OFFSITE_DIR="$o-corrupt" check "$lang: a damaged file fails the checksum" fail "checksum mismatch" -- run "$lang" restore/restore-test
  BACKUP_DIR=/tmp/rs/empty OFFSITE_DIR="$o-empty" check "$lang: an empty database is not a backup" fail "only 0 row(s) in orders" -- run "$lang" restore/restore-test
  BACKUP_DIR=/tmp/rs/none OFFSITE_DIR="$o-none" check "$lang: no backup at all fails" fail "no backup in" -- run "$lang" restore/restore-test
done
unset OFFSITE_DIR BACKUP_DIR DB

echo "7. A CI key that can only deploy"
id deployer >/dev/null 2>&1 || useradd -m -s /bin/bash deployer
usermod -p '*' deployer   # no password, but not "locked": sshd would refuse a locked account
install -m 755 ci/only-deploy.sh /usr/local/bin/only-deploy
rm -rf /tmp/ci && mkdir -p /tmp/ci
ssh-keygen -q -t ed25519 -N '' -C github-deploy -f /tmp/ci/key
install -d -m 700 -o deployer -g deployer /home/deployer/.ssh
# #region forced-command
# One line in the server's ~deploy/.ssh/authorized_keys. Whatever the client asks
# for, sshd runs only this command; restrict also turns off port forwarding, agent
# forwarding, X11 and the terminal. A stolen CI key can deploy, and nothing else.
echo "restrict,command=\"/usr/local/bin/only-deploy\" $(cat /tmp/ci/key.pub)" > /home/deployer/.ssh/authorized_keys
# #endregion
chown deployer:deployer /home/deployer/.ssh/authorized_keys
chmod 600 /home/deployer/.ssh/authorized_keys
/usr/sbin/sshd -p 2222
# #region known-hosts
# The fingerprint is compared once, by a person (bootstrap.sh prints it); from then on
# CI trusts exactly this key, and a server that answers with another one is refused.
ssh-keyscan -p 2222 -t ed25519 localhost 2>/dev/null > /tmp/ci/known_hosts
ssh-keygen -lf /tmp/ci/known_hosts
# #endregion
ci_ssh() {
  local hosts="$1"
  shift
  ssh -T -i /tmp/ci/key -o IdentitiesOnly=yes -p 2222 -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$hosts" "$@"
}
check "no command: it deploys" 0 "deploying (asked for: nothing)" -- ci_ssh /tmp/ci/known_hosts deployer@localhost
check "another command: it still only deploys" 0 "deploying (asked for: cat /etc/shadow)" -- ci_ssh /tmp/ci/known_hosts deployer@localhost 'cat /etc/shadow'
check "port forwarding is refused" 255 "remote port forwarding failed" -- ci_ssh /tmp/ci/known_hosts -o ExitOnForwardFailure=yes -R 9999:localhost:22 deployer@localhost
ssh-keygen -q -t ed25519 -N '' -f /tmp/ci/impostor
echo "[localhost]:2222 $(cut -d' ' -f1,2 /tmp/ci/impostor.pub)" > /tmp/ci/wrong_hosts
check "a different host key is refused" 255 "Host key verification failed" -- ci_ssh /tmp/ci/wrong_hosts deployer@localhost
kill "$(cat /run/sshd.pid)" 2>/dev/null

echo
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
