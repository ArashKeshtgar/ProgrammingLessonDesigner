const e="edge",n="ControlPanel",s={"deploy/vps/Caddyfile":101,"deploy/vps/compose.vps.yml":171,"deploy/vps/README.md":343,"deploy/vps/bootstrap.sh":171,"deploy/vps/.env.vps.example":69,"deploy/vps/watchdog.sh":70,"deploy/vps/deploy.sh":94,"deploy/vps/labflow.caddy":8,"deploy/vps/set-basic-auth.sh":29,"deploy/clinic/clinic.caddy":52,"deploy/vps/compose.clinic.yml":386,"deploy/clinic/labflow.caddy":6,"deploy/vps/release.ps1":235},o={"role/service":{file:"deploy/vps/compose.vps.yml",start:20,end:24,code:`image: caddy:2
ports:
  - "80:80"
  - "443:443"
  - "443:443/udp"`},"role/mounts":{file:"deploy/vps/compose.vps.yml",start:39,end:45,code:`- ./deploy/vps/Caddyfile:/etc/caddy/Caddyfile:ro
# compose.clinic.yml mounts its own file at this path (LabFlow's old address sent to the clinic's lab).
- ./deploy/vps/labflow.caddy:/etc/caddy/sites/labflow.caddy:ro
- caddy-data:/data
- caddy-config:/config
# context.json from push-context.ps1 (a folder, so the swap-in rename shows up)
- \${CONTEXT_DIR:-/srv/portfolio/context}:/srv/context:ro`},"role/depends":{file:"deploy/vps/compose.vps.yml",start:46,end:55,code:`depends_on:
  - frontend
  - rebiomed-web
  - labflow-web
  - ledgerdashboard
  - lessons-web
  - lessons-sync
  - clinicreport
  - programming-web
restart: unless-stopped`},"firewall/ufw":{file:"deploy/vps/bootstrap.sh",start:82,end:90,code:`ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable
# Docker bypasses ufw for published ports; compose.vps.yml publishes
# nothing but Caddy's 80/443, so this is still the whole picture.`},"firewall/reset":{file:"deploy/vps/compose.vps.yml",start:57,end:58,code:`sqlserver:
  ports: !reset []`},"firewall/loopback":{file:"deploy/vps/compose.vps.yml",start:93,end:96,code:`# Loopback only: the nightly job search on the PC reaches it through
# \`ssh -L 14310:127.0.0.1:4310\`, with the API token instead of a login.
ports: !override
  - "127.0.0.1:4310:4310"`},"certs/global":{file:"deploy/vps/Caddyfile",start:1,end:6,code:`# Caddy gets and renews Let's Encrypt certificates for every site below by
# itself, once each domain's DNS A record points at this server.
# Values come from the caddy service's environment (compose.vps.yml).
{
	email {$ACME_EMAIL}
}`},"certs/dns":{file:"deploy/vps/README.md",start:52,end:56,code:"## 2. Domain and DNS\n\nFive A records, all to the server's IPv4 (and AAAA if it has IPv6):\n`panel`, `rebiomed`, `english`, `labflow`, `ledger`. Caddy can only get certificates once\nthese resolve, so do this early."},"certs/env":{file:"deploy/vps/compose.vps.yml",start:26,end:35,code:"ACME_EMAIL: ${ACME_EMAIL:?set ACME_EMAIL in .env}\nPANEL_DOMAIN: ${PANEL_DOMAIN:?set PANEL_DOMAIN in .env}\nREBIOMED_DOMAIN: ${REBIOMED_DOMAIN:?set REBIOMED_DOMAIN in .env}\nLABFLOW_DOMAIN: ${LABFLOW_DOMAIN:?set LABFLOW_DOMAIN in .env}\nLEDGER_DOMAIN: ${LEDGER_DOMAIN:?set LEDGER_DOMAIN in .env}\nLESSONS_DOMAIN: ${LESSONS_DOMAIN:?set LESSONS_DOMAIN in .env}\n# Private Context reader; defaults so an older .env keeps deploying.\nCONTEXT_DOMAIN: ${CONTEXT_DOMAIN:-ctx.arashkeshtgar.ca}\nCLINICREPORT_DOMAIN: ${CLINICREPORT_DOMAIN:-report.arashkeshtgar.ca}\nPROGRAMMING_DOMAIN: ${PROGRAMMING_DOMAIN:-code.arashkeshtgar.ca}"},"common/common":{file:"deploy/vps/Caddyfile",start:8,end:24,code:`(common) {
	encode zstd gzip
	# Two blocks on purpose: a deletion (-Server) defers its whole block until the
	# final response, and deferred headers are lost on an error response such as
	# basic_auth's 401. Set right away, these reach the 401 too.
	header {
		Strict-Transport-Security "max-age=31536000"
		X-Content-Type-Options nosniff
		Referrer-Policy strict-origin-when-cross-origin
	}
	# Deferred: also removes the apps' own Server header.
	header -Server
	log {
		output stdout
		format console
	}
}`},"certwatch/certs":{file:"deploy/vps/watchdog.sh",start:46,end:57,code:`mapfile -t domains < <(grep -E '^[A-Z_]+_DOMAIN=' .env | grep -v '^CLINIC_DOMAIN=' | cut -d= -f2- | tr -d "'\\"" | sed '/^$/d')
clinic="$(grep -E '^CLINIC_DOMAIN=' .env | cut -d= -f2- | tr -d "'\\"")"
if [[ -n "$clinic" ]] && grep -qE '^COMPOSE_FILE=.*compose\\.clinic\\.yml' .env; then
  for name in hub report lab pharmacy finance analytics integration; do domains+=("$name.$clinic"); done
fi
now="$(date +%s)"
for d in "\${domains[@]}"; do
  end="$(echo | timeout 10 openssl s_client -connect 127.0.0.1:443 -servername "$d" 2>/dev/null \\
    | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)"
  if [[ -z "$end" ]]; then problems+=("no certificate for $d"); continue; fi
  days=$(( ($(date -d "$end" +%s) - now) / 86400 ))
  (( days < CERT_DAYS )) && problems+=("certificate of $d ends in $days days")`},"certwatch/report":{file:"deploy/vps/watchdog.sh",start:64,end:70,code:`if [[ \${#problems[@]} -gt 0 ]]; then
  message="$(printf '%s\\n' "\${problems[@]}")"
  echo "[$(date -Is)] $(tr '\\n' ';' <<<"$message")"
  ping_check watchdog fail "$message"
else
  ping_check watchdog ok "$running containers running, disk \${disk}%, \${mem} MB free, \${#domains[@]} certificates"
fi`},"public/panel":{file:"deploy/vps/Caddyfile",start:34,end:38,code:`# Control Panel: public, with its own login (hand out the viewer account).
{$PANEL_DOMAIN} {
	import common
	reverse_proxy frontend:80
}`},"public/code":{file:"deploy/vps/Caddyfile",start:60,end:64,code:`# Programming lessons: public, static.
{$PROGRAMMING_DOMAIN} {
	import common
	reverse_proxy programming-web:80
}`},"public/report":{file:"deploy/vps/Caddyfile",start:86,end:91,code:`# ClinicReport: public demo (synthetic data, one-click demo users, nightly
# reset). Caddy proxies the SignalR WebSocket on /hubs as is.
{$CLINICREPORT_DOMAIN} {
	import common
	reverse_proxy clinicreport:8080
}`},"public/rebiomed":{file:"deploy/vps/Caddyfile",start:40,end:44,code:`# ReBiomed marketplace: public demo.
{$REBIOMED_DOMAIN} {
	import common
	reverse_proxy rebiomed-web:80
}`},"lessons/english":{file:"deploy/vps/Caddyfile",start:46,end:58,code:`# English collocation lessons: public (also on GitHub Pages). Its Context tab
# finds no /api/context here and says it is local-only. /api/sync is the
# review-progress sync (lessons-sync checks its own X-Sync-Key).
{$LESSONS_DOMAIN} {
	import common
	respond /api/context* 404
	handle /api/sync* {
		reverse_proxy lessons-sync:8080
	}
	handle {
		reverse_proxy lessons-web:80
	}
}`},"lessons/ctx":{file:"deploy/vps/Caddyfile",start:66,end:84,code:`# The same lessons app as the owner's private Context reader (the phone's
# home-screen app). /api/context is the context engine's export, pushed from
# the PC by push-context.ps1 into CONTEXT_DIR; it is never in the image.
{$CONTEXT_DOMAIN} {
	import common
	import private
	handle /api/context {
		root * /srv/context
		rewrite * /context.json
		header Cache-Control no-store
		file_server
	}
	handle /api/sync* {
		reverse_proxy lessons-sync:8080
	}
	handle {
		reverse_proxy lessons-web:80
	}
}`},"lessons/folder":{file:"deploy/vps/deploy.sh",start:59,end:61,code:`# Caddy mounts this for ctx.<domain>; made here (as deploy) so Docker doesn't
# create it root-owned and push-context.ps1 can still write into it.
mkdir -p "$ROOT/context"`},"basicauth/private":{file:"deploy/vps/Caddyfile",start:26,end:32,code:`# Only the owner's eyes: LedgerDashboard holds the job search (companies,
# contacts), and ctx.<domain> the owner's own reading.
(private) {
	basic_auth {
		{$BASIC_AUTH_USER} {$BASIC_AUTH_HASH}
	}
}`},"basicauth/ledger":{file:"deploy/vps/Caddyfile",start:93,end:97,code:`{$LEDGER_DOMAIN} {
	import common
	import private
	reverse_proxy ledgerdashboard:4310
}`},"basicauth/labflow":{file:"deploy/vps/labflow.caddy",start:1,end:8,code:`# LabFlow as the owner's demo (Development: its demo sign-in is a role switcher with no password, hence basic
# auth). Mounted by compose.vps.yml at /etc/caddy/sites/labflow.caddy; with the clinic platform, compose.clinic.yml
# mounts deploy/clinic/labflow.caddy there instead (LabFlow is the clinic's lab then).
{$LABFLOW_DOMAIN} {
	import common
	import private
	reverse_proxy labflow-web:80
}`},"basicauth/env":{file:"deploy/vps/compose.vps.yml",start:36,end:37,code:"BASIC_AUTH_USER: ${BASIC_AUTH_USER:?set BASIC_AUTH_USER in .env}\nBASIC_AUTH_HASH: ${BASIC_AUTH_HASH:?set BASIC_AUTH_HASH in .env (caddy hash-password)}"},"password/hash":{file:"deploy/vps/set-basic-auth.sh",start:12,end:28,code:`read -r -s -p "New basic-auth password (12+ chars): " P1; echo
read -r -s -p "Again: " P2; echo
[[ "$P1" == "$P2" ]] || { echo "They differ." >&2; exit 1; }
[[ \${#P1} -ge 12 ]] || { echo "Too short." >&2; exit 1; }
# A password typed with a non-Latin keyboard layout by mistake looks fine
# on screen (nothing is shown) and then never matches in the browser.
[[ "$P1" == "$(printf '%s' "$P1" | LC_ALL=C tr -cd '\\40-\\176')" ]] \\
  || { echo "Only English letters, digits and symbols, please (check the keyboard layout)." >&2; exit 1; }

HASH="$(printf '%s\\n' "$P1" | docker run --rm -i caddy:2 caddy hash-password)"
unset P1 P2
[[ "$HASH" == \\$2* ]] || { echo "Hashing failed." >&2; exit 1; }

# bcrypt hashes are [A-Za-z0-9./$] only, so | is a safe sed delimiter.
sed -i "s|^BASIC_AUTH_HASH=.*|BASIC_AUTH_HASH='$HASH'|" "$ENV"
cd "$CP"
docker compose up -d caddy`},"password/usage":{file:"deploy/vps/set-basic-auth.sh",start:2,end:5,code:`# Changes the basic-auth password in front of LabFlow and LedgerDashboard
# (user stays BASIC_AUTH_USER) and restarts Caddy. Run on the server:
#
#   ssh -t deploy@<server> /srv/portfolio/ControlPanel/deploy/vps/set-basic-auth.sh`},"clinicsites/hub":{file:"deploy/clinic/clinic.caddy",start:16,end:20,code:`# ClinicHub: the sign-in (issuer https://hub.{$CLINIC_DOMAIN}/) and the clinics' own work; pages and API in one container.
hub.{$CLINIC_DOMAIN} {
	import common
	reverse_proxy clinichub:8080
}`},"clinicsites/app":{file:"deploy/clinic/clinic.caddy",start:5,end:14,code:`# The applications whose React app is a separate container: the API's own paths go to the API, the rest to the page.
(app) {
	@api path /api/* /signin-oidc /signout-callback-oidc
	handle @api {
		reverse_proxy {args[0]}
	}
	handle {
		reverse_proxy {args[1]}
	}
}`},"clinicsites/lab":{file:"deploy/clinic/clinic.caddy",start:28,end:31,code:`lab.{$CLINIC_DOMAIN} {
	import common
	import app labflow-api:8080 labflow-web:80
}`},"clinicsites/analytics":{file:"deploy/clinic/clinic.caddy",start:43,end:52,code:`# Analytics and the hub's admin web proxy /api themselves (their own nginx).
analytics.{$CLINIC_DOMAIN} {
	import common
	reverse_proxy analytics-web:80
}

integration.{$CLINIC_DOMAIN} {
	import common
	reverse_proxy integrationhub-web:80
}`},"layers/import":{file:"deploy/vps/Caddyfile",start:99,end:101,code:`# Sites mounted by the compose layers: LabFlow (compose.vps.yml: the owner's demo, behind basic auth) and the clinic
# platform (compose.clinic.yml: its sites, and LabFlow's old address sent to the clinic's lab).
import /etc/caddy/sites/*.caddy`},"layers/mount":{file:"deploy/vps/compose.clinic.yml",start:61,end:67,code:`caddy:
  environment:
    CLINIC_DOMAIN: \${CLINIC_DOMAIN:?set CLINIC_DOMAIN in .env (e.g. clinic.arashkeshtgar.ca)}
  volumes:
    - ./deploy/clinic/clinic.caddy:/etc/caddy/sites/clinic.caddy:ro
    # Same path as compose.vps.yml's LabFlow site, so this one replaces it.
    - ./deploy/clinic/labflow.caddy:/etc/caddy/sites/labflow.caddy:ro`},"layers/redir":{file:"deploy/clinic/labflow.caddy",start:1,end:6,code:`# With the clinic platform, LabFlow is the clinic's lab at lab.{$CLINIC_DOMAIN}; its old address sends people there.
# compose.clinic.yml mounts this over deploy/vps/labflow.caddy (same path in the container).
{$LABFLOW_DOMAIN} {
	import common
	redir https://lab.{$CLINIC_DOMAIN}{uri} permanent
}`},"layers/composefile":{file:"deploy/vps/compose.clinic.yml",start:3,end:3,code:"#   COMPOSE_FILE=docker-compose.yml:compose.apps.yml:deploy/vps/compose.vps.yml:deploy/vps/compose.clinic.yml"},"aliases/aliases":{file:"deploy/vps/compose.clinic.yml",start:77,end:84,code:"aliases:\n  - hub.${CLINIC_DOMAIN}\n  - report.${CLINIC_DOMAIN}\n  - lab.${CLINIC_DOMAIN}\n  - pharmacy.${CLINIC_DOMAIN}\n  - finance.${CLINIC_DOMAIN}\n  - analytics.${CLINIC_DOMAIN}\n  - integration.${CLINIC_DOMAIN}"},"aliases/forwarded":{file:"deploy/vps/compose.clinic.yml",start:20,end:21,code:`# Caddy terminates TLS: the scheme and client address come from its X-Forwarded-* headers (sign-in redirects, Secure cookies).
ASPNETCORE_FORWARDEDHEADERS_ENABLED: "true"`},"aliases/jwks":{file:"deploy/vps/compose.clinic.yml",start:333,end:334,code:"# Over HTTPS through Caddy's alias: OpenIddict refuses plain HTTP to its endpoints outside development.\nHUB_AUTH_JWKS_URI: https://hub.${CLINIC_DOMAIN}/.well-known/jwks"},"reload/sum":{file:"deploy/vps/deploy.sh",start:41,end:44,code:`# Caddy bind-mounts the Caddyfile as a single file: a pull replaces the file,
# and the running container keeps the old one until it restarts.
caddy_sum() { cat "$CP/deploy/vps/Caddyfile" "$CP/deploy/vps/labflow.caddy" "$CP"/deploy/clinic/*.caddy 2>/dev/null | sha1sum; }
caddy_before="$(caddy_sum)"`},"reload/restart":{file:"deploy/vps/deploy.sh",start:74,end:77,code:`if [[ "$(caddy_sum)" != "$caddy_before" ]]; then
  log "Caddyfile changed: restart caddy"
  docker compose restart caddy
fi`},"reload/lock":{file:"deploy/vps/deploy.sh",start:37,end:39,code:`# One deploy at a time (a push during a running deploy waits).
exec 9>/tmp/portfolio-deploy.lock
flock 9`},"smoke/smoke":{file:"deploy/vps/release.ps1",start:216,end:224,code:`# Public sites; labflow, ledger and ctx sit behind basic auth, so 401 is right.
$expect = [ordered]@{ panel = 200; rebiomed = 200; english = 200; labflow = 401; ledger = 401; ctx = 401 }
$failed = @()
foreach ($site in $expect.Keys) {
    $code = curl.exe -s -o NUL -w '%{http_code}' -m 20 "https://$site.$Domain/"
    $ok = [int]$code -eq $expect[$site]
    Write-Host ("  {0,-9} {1}  {2}" -f $site, $code, $(if ($ok) { 'ok' } else { "expected $($expect[$site])" }))
    if (-not $ok) { $failed += $site }
}`},"smoke/fail":{file:"deploy/vps/release.ps1",start:232,end:235,code:`if ($failed) { throw "Released $tag, but these sites don't answer as expected: $($failed -join ', ')" }

Write-Host "\`nReleased $tag." -ForegroundColor Green
Write-Host "Undo (code): on the server, git checkout the previous release-* tag in each repo and rerun deploy.sh."`}},t=[],a=[],d=[],i={project:e,repo:n,files:s,examples:o,endpoints:t,tables:a,routes:d};export{i as default,t as endpoints,o as examples,s as files,e as project,n as repo,d as routes,a as tables};
