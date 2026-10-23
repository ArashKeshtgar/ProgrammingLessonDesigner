#!/usr/bin/env bash
# Starts the app behind Caddy and behind nginx (compose.yml) and checks what a browser
# gets back: status codes, basic auth and the security headers. Needs Docker and curl.
set -euo pipefail
cd "$(dirname "$0")"

tmp="$(mktemp -d)"
trap 'docker compose down --volumes --remove-orphans >/dev/null 2>&1; rm -rf "$tmp"' EXIT

export BASIC_AUTH_USER=arash
BASIC_AUTH_HASH="$(docker run --rm caddy:2.10-alpine caddy hash-password --plaintext secret)"
export BASIC_AUTH_HASH
printf 'arash:%s\n' "$(openssl passwd -apr1 secret)" > "$tmp/htpasswd"
chmod 644 "$tmp/htpasswd"
export HTPASSWD="$tmp/htpasswd"

docker compose up -d --wait

fail=0
status() { curl -s -o /dev/null -w '%{http_code}' -m 5 "$@"; }
header() { local name="$1"; shift; { curl -s -D - -o /dev/null -m 5 "$@" | tr -d '\r' | grep -i "^$name:" | cut -d' ' -f2-; } || true; }
expect() {
  if [[ "$2" == "$3" ]]; then echo "  ok    $1"; else echo "  FAIL  $1: got '$2', expected '$3'"; fail=1; fi
}

for _ in $(seq 30); do [[ "$(status http://localhost:18080/)" == 200 && "$(status http://localhost:18090/)" == 200 ]] && break; sleep 1; done

echo "Caddy"
expect "public site answers" "$(status http://localhost:18080/)" 200
expect "app's Server header removed" "$(header Server http://localhost:18080/)" ""
expect "HSTS" "$(header Strict-Transport-Security http://localhost:18080/)" "max-age=31536000"
expect "nosniff" "$(header X-Content-Type-Options http://localhost:18080/)" "nosniff"
expect "private site without password" "$(status http://localhost:18081/)" 401
expect "private site, wrong password" "$(status -u arash:wrong http://localhost:18081/)" 401
expect "private site, right password" "$(status -u arash:secret http://localhost:18081/)" 200
expect "HSTS on the 401 too" "$(header Strict-Transport-Security http://localhost:18081/)" "max-age=31536000"

echo "nginx"
expect "public site answers" "$(status http://localhost:18090/)" 200
expect "Server header: name without version" "$(header Server http://localhost:18090/)" "nginx"
expect "HSTS" "$(header Strict-Transport-Security http://localhost:18090/)" "max-age=31536000"
expect "private site without password" "$(status http://localhost:18091/)" 401
expect "private site, right password" "$(status -u arash:secret http://localhost:18091/)" 200
expect "HSTS on the 401 too (always)" "$(header Strict-Transport-Security http://localhost:18091/)" "max-age=31536000"

exit "$fail"
