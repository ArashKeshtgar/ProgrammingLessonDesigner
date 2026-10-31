const e="shared",s="ControlPanel",n={"docker-compose.yml":203,"deploy/vps/backup.sh":83,"deploy/vps/compose.vps.yml":171,"deploy/vps/README.md":343,"deploy/vps/bootstrap.sh":171,"db/init.sh":25,"db/01-databases.sql":7,"db/02-service-login.sql":27,"db/03-controlpanel-schema.sql":58,"deploy/vps/make-env.sh":115,"deploy/labflow/sql-login.sql":26,"deploy/clinic/sql-logins.sql":43,"deploy/vps/migrate.sh":89,"services/core-api/src/database/database.service.ts":41,"deploy/vps/make-clinic-secrets.sh":96,"compose.apps.yml":507,"deploy/vps/install-jobs.sh":25,"deploy/vps/watchdog.sh":70,"deploy/vps/backup-offsite.sh":55,"deploy/vps/restore-db.sh":119,"deploy/vps/restore-test.sh":107,"deploy/vps/export-dbs.ps1":32},t={"role/service":{file:"docker-compose.yml",start:27,end:37,code:`sqlserver:
  image: mcr.microsoft.com/mssql/server:2022-latest
  environment:
    ACCEPT_EULA: "Y"
    MSSQL_SA_PASSWORD: \${SA_PASSWORD:?set SA_PASSWORD in .env}
  # Published on 14333 so it doesn't collide with a local SQL Server on 1433.
  ports:
    - "14333:1433"
  restart: unless-stopped
  volumes:
    - sqldata:/var/opt/mssql`},"role/dbs":{file:"deploy/vps/backup.sh",start:18,end:18,code:"DATABASES=(ControlPanelDb HisPlusDemo LedgerDashboard LabFlow PharmaFlow FinancePowerApp)"},"role/health":{file:"docker-compose.yml",start:39,end:43,code:`test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P \\"$$MSSQL_SA_PASSWORD\\" -Q 'SELECT 1' -b -o /dev/null"]
interval: 5s
timeout: 5s
retries: 30
start_period: 20s`},"vps/override":{file:"deploy/vps/compose.vps.yml",start:57,end:65,code:`sqlserver:
  ports: !reset []
  environment:
    MSSQL_PID: Express
    MSSQL_MEMORY_LIMIT_MB: "2048"
  volumes:
    # backup.sh and restore-db.sh exchange .bak files through here. The
    # folder must belong to uid 10001 (mssql); bootstrap.sh creates it.
    - \${BACKUP_DIR:-/srv/backups}/mssql:/var/opt/mssql/backup`},"vps/why":{file:"deploy/vps/compose.vps.yml",start:15,end:16,code:`#   - SQL Server runs as Express: the Developer edition isn't licensed for
#     anything the public can reach.`},"vps/uid":{file:"deploy/vps/bootstrap.sh",start:144,end:145,code:`# SQL Server in its container runs as uid 10001 and writes backups here.
install -d -o 10001 -g "$DEPLOY_USER" -m 775 /srv/backups/mssql`},"vps/arm":{file:"deploy/vps/bootstrap.sh",start:32,end:33,code:`# The SQL Server image only exists for x86-64; an ARM server can't run it.
[[ "$(uname -m)" == "x86_64" ]] || die "SQL Server needs an x86-64 server; this one is $(uname -m)."`},"init/dbinit":{file:"docker-compose.yml",start:45,end:59,code:`db-init:
  image: mcr.microsoft.com/mssql/server:2022-latest
  depends_on:
    sqlserver:
      condition: service_healthy
  entrypoint: ["/bin/bash", "/db/init.sh"]
  environment:
    SA_PASSWORD: \${SA_PASSWORD}
    DB_PASSWORD: \${DB_PASSWORD:?set DB_PASSWORD in .env}
    WUTILITY_ADAPTER: wutility-adapter:4001
    HISPLUS_ADAPTER: hisplus-adapter:4002
    LEDGERDASH_ADAPTER: ledgerdash-adapter:4006
  volumes:
    - ./db:/db:ro
  restart: "no"`},"init/loop":{file:"db/init.sh",start:16,end:24,code:`for script in /db/*.sql; do
  echo "Running $(basename "$script")"
  "$SQLCMD" -C -b -S sqlserver -U sa -P "$SA_PASSWORD" -i "$script" \\
    -v DB_PASSWORD="$DB_PASSWORD" \\
    -v ADAPTER_HOST="$ADAPTER_HOST" \\
    -v WUTILITY_ADAPTER="$WUTILITY_ADAPTER" \\
    -v HISPLUS_ADAPTER="$HISPLUS_ADAPTER" \\
    -v LEDGERDASH_ADAPTER="$LEDGERDASH_ADAPTER"
done`},"init/create":{file:"db/01-databases.sql",start:1,end:7,code:`-- Creates the two databases Control Panel uses. Safe to re-run.
IF DB_ID(N'ControlPanelDb') IS NULL CREATE DATABASE ControlPanelDb;
GO
-- HisPlusDemo is a stand-in for the real HIS+ database, holding demo rows
-- only. hisplus-adapter must never be pointed at real hospital data.
IF DB_ID(N'HisPlusDemo') IS NULL CREATE DATABASE HisPlusDemo;
GO`},"logins/svc":{file:"db/02-service-login.sql",start:9,end:20,code:`IF SUSER_ID(N'controlpanel_svc') IS NULL
    CREATE LOGIN controlpanel_svc WITH PASSWORD = N'$(DB_PASSWORD)', CHECK_POLICY = ON;
ELSE
    ALTER LOGIN controlpanel_svc WITH PASSWORD = N'$(DB_PASSWORD)';
GO

USE ControlPanelDb;
GO
IF USER_ID(N'controlpanel_svc') IS NULL CREATE USER controlpanel_svc FOR LOGIN controlpanel_svc;
IF IS_ROLEMEMBER(N'db_owner', N'controlpanel_svc') = 1 ALTER ROLE db_owner DROP MEMBER controlpanel_svc;
ALTER ROLE db_datareader ADD MEMBER controlpanel_svc;
ALTER ROLE db_datawriter ADD MEMBER controlpanel_svc;`},"logins/deny":{file:"db/03-controlpanel-schema.sql",start:55,end:58,code:`-- db_datawriter could otherwise rewrite history; the service login may only add rows.
IF USER_ID(N'controlpanel_svc') IS NOT NULL
    DENY UPDATE, DELETE ON dbo.AuditLog TO controlpanel_svc;
GO`},"logins/sqlpw":{file:"deploy/vps/make-env.sh",start:32,end:36,code:`# Letters and digits only, so no value ever needs quoting in .env, sqlcmd
# -v or a connection string. The -Aa1 suffix satisfies SQL Server's
# password policy (three character classes) whatever the random part is.
rand() { openssl rand -base64 96 | tr -dc 'A-Za-z0-9' | head -c "$1"; }
sqlpw() { printf '%s-Aa1' "$(rand 28)"; }`},"applogins/labflow":{file:"deploy/labflow/sql-login.sql",start:8,end:25,code:`IF SUSER_ID(N'labflow_svc') IS NULL
    CREATE LOGIN labflow_svc WITH PASSWORD = N'$(LABFLOW_DB_PASSWORD)', CHECK_POLICY = ON, DEFAULT_DATABASE = LabFlow;
ELSE
    ALTER LOGIN labflow_svc WITH PASSWORD = N'$(LABFLOW_DB_PASSWORD)';
GO
USE LabFlow;
GO
IF USER_ID(N'labflow_svc') IS NULL CREATE USER labflow_svc FOR LOGIN labflow_svc;
ALTER ROLE db_datareader ADD MEMBER labflow_svc;
ALTER ROLE db_datawriter ADD MEMBER labflow_svc;
-- LabFlow runs its upgrade scripts (database/050 on) at start-up, and they
-- create tables; without this the API crashes on start.
ALTER ROLE db_ddladmin ADD MEMBER labflow_svc;
-- NEXT VALUE FOR on the accession and MRN sequences needs UPDATE on them.
GRANT UPDATE ON OBJECT::lab.AccessionSeq TO labflow_svc;
GRANT UPDATE ON OBJECT::core.MrnSeq TO labflow_svc;
-- The access log is append-only for the application.
DENY UPDATE, DELETE ON SCHEMA::audit TO labflow_svc;`},"applogins/pharma":{file:"deploy/clinic/sql-logins.sql",start:25,end:33,code:`USE PharmaFlow;
GO
IF USER_ID(N'pharmaflow_svc') IS NULL CREATE USER pharmaflow_svc FOR LOGIN pharmaflow_svc;
ALTER ROLE db_datareader ADD MEMBER pharmaflow_svc;
ALTER ROLE db_datawriter ADD MEMBER pharmaflow_svc;
-- NEXT VALUE FOR on the prescription numbers needs UPDATE on the sequence.
GRANT UPDATE ON OBJECT::rx.RxNumber TO pharmaflow_svc;
-- Who opened which patient (PHIPA) is append-only for the application.
DENY UPDATE, DELETE ON SCHEMA::audit TO pharmaflow_svc;`},"applogins/hub":{file:"deploy/clinic/sql-logins.sql",start:9,end:13,code:`IF SUSER_ID(N'clinichub_svc') IS NULL
    CREATE LOGIN clinichub_svc WITH PASSWORD = N'$(CLINICHUB_DB_PASSWORD)', CHECK_POLICY = ON;
ELSE
    ALTER LOGIN clinichub_svc WITH PASSWORD = N'$(CLINICHUB_DB_PASSWORD)';
ALTER SERVER ROLE dbcreator ADD MEMBER clinichub_svc;`},"migrate/runfile":{file:"deploy/vps/migrate.sh",start:17,end:22,code:`run_sql_file() {
  local file="$1"; shift
  # Through stdin, so the temp file belongs to mssql and it can delete it.
  docker compose exec -T sqlserver bash -c \\
    'f=$(mktemp); cat > "$f"; /opt/mssql-tools18/bin/sqlcmd -C -b -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -i "$f" "$@"; rc=$?; rm -f "$f"; exit $rc' _ "$@" < "$file"
}`},"migrate/migratedb":{file:"deploy/vps/migrate.sh",start:48,end:60,code:`migrate_db() {
  local db="$1" dir="$2/database" table="$3" applied f name
  sql "IF DB_ID(N'$db') IS NULL CREATE DATABASE [$db]" >/dev/null
  sql "USE [$db]; IF OBJECT_ID(N'dbo.$table') IS NULL CREATE TABLE dbo.$table (Script nvarchar(200) NOT NULL PRIMARY KEY, AppliedUtc datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME())" >/dev/null
  applied="$(sql "SET NOCOUNT ON; USE [$db]; SELECT Script FROM dbo.$table")"
  for f in "$dir"/[0-9][0-9][0-9]_*.sql; do
    name="$(basename "$f")"
    grep -qxF "$name" <<<"$applied" && continue
    echo "==> $db  $name"
    # -I: quoted identifiers (filtered indexes); -f 65001: the scripts are UTF-8.
    run_sql_file "$f" -d "$db" -I -f 65001 >/dev/null
    sql "USE [$db]; INSERT dbo.$table (Script) VALUES (N'$name')" >/dev/null
  done`},"connect/pool":{file:"services/core-api/src/database/database.service.ts",start:22,end:31,code:`this.pool = await new sql.ConnectionPool({
  server: this.config.get<string>('DB_SERVER', 'localhost'),
  database: this.config.get<string>('DB_NAME', 'ControlPanelDb'),
  user: this.config.get<string>('DB_USER', 'controlpanel_svc'),
  password: this.config.get<string>('DB_PASSWORD'),
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
  },
}).connect();`},"connect/labflow":{file:"deploy/vps/compose.vps.yml",start:132,end:132,code:'ConnectionStrings__LabFlow: "Server=sqlserver,1433;Database=LabFlow;User Id=labflow_svc;Password=${LABFLOW_DB_PASSWORD};TrustServerCertificate=True"'},"connect/sqlcs":{file:"deploy/vps/make-clinic-secrets.sh",start:42,end:51,code:`sql_cs() { printf 'Server=sqlserver,1433;Database=%s;User Id=%s;Password=%s;TrustServerCertificate=True;Encrypt=True' "$1" "$2" "$3"; }

# ---- SQL Server logins (deploy/clinic/sql-logins.sql) and the connection strings built from them
put clinichub-db-password "$(sqlpw)"
put clinichub-catalog-connection "$(sql_cs ClinicHub_Catalog clinichub_svc "$(get clinichub-db-password)")"
put clinichub-server-connection "$(printf 'Server=sqlserver,1433;User Id=clinichub_svc;Password=%s;TrustServerCertificate=True;Encrypt=True' "$(get clinichub-db-password)")"
put pharmaflow-db-password "$(sqlpw)"
put pharmaflow-connection "$(sql_cs PharmaFlow pharmaflow_svc "$(get pharmaflow-db-password)")"
put finance-db-password "$(sqlpw)"
put finance-connection "$(sql_cs FinancePowerApp finance_svc "$(get finance-db-password)")"`},"pcvps/pclabflow":{file:"compose.apps.yml",start:156,end:158,code:`  ConnectionStrings__LabFlow: "Server=host.docker.internal,1433;Database=LabFlow;User Id=labflow_svc;Password=\${LABFLOW_DB_PASSWORD:?set LABFLOW_DB_PASSWORD in .env};TrustServerCertificate=True"
extra_hosts:
  - "host.docker.internal:host-gateway"`},"pcvps/adapter":{file:"docker-compose.yml",start:157,end:160,code:`DB_SERVER: host.docker.internal
DB_NAME: LedgerDashboard
DB_USER: ledger_reader
DB_PASSWORD: \${LEDGER_READER_PASSWORD:?set LEDGER_READER_PASSWORD in .env}`},"pcvps/vpsdep":{file:"deploy/vps/compose.vps.yml",start:77,end:84,code:`ledgerdash-adapter:
  ports: !reset []
  depends_on:
    sqlserver:
      condition: service_healthy
  environment:
    DB_SERVER: sqlserver
    TZ: America/Toronto`},"nightly/cron":{file:"deploy/vps/install-jobs.sh",start:15,end:16,code:`30 3 * * * $CP/deploy/vps/backup.sh >> $LOGS/backup.log 2>&1 $MARK
0 5 1 * * $CP/deploy/vps/restore-test.sh >> $LOGS/restore-test.log 2>&1 $MARK`},"nightly/loop":{file:"deploy/vps/backup.sh",start:39,end:50,code:`for db in "\${DATABASES[@]}" "\${clinic_dbs[@]}"; do
  db="$(tr -d '[:space:]' <<<"$db")"
  if [[ -z "$(sql "SET NOCOUNT ON; SELECT name FROM sys.databases WHERE name = N'$db'" | tr -d '[:space:]')" ]]; then
    echo "  skip $db (not on this server)"
    continue
  fi
  # Express can't compress backups; gzip does it afterwards.
  sql "BACKUP DATABASE [$db] TO DISK = N'/var/opt/mssql/backup/$db.bak' WITH INIT, COPY_ONLY, CHECKSUM" >/dev/null
  # Read it through the container: the file belongs to mssql (uid 10001).
  docker compose exec -T sqlserver cat "/var/opt/mssql/backup/$db.bak" | gzip > "$OUT/$db.bak.gz"
  docker compose exec -T sqlserver rm -f "/var/opt/mssql/backup/$db.bak"
  echo "  $db ok"`},"nightly/clinicdbs":{file:"deploy/vps/backup.sh",start:38,end:38,code:`mapfile -t clinic_dbs < <(sql "SET NOCOUNT ON; SELECT name FROM sys.databases WHERE name LIKE N'ClinicHub[_]%' ORDER BY name" | tr -d '\\r' | sed '/^\\s*$/d')`},"nightly/stale":{file:"deploy/vps/watchdog.sh",start:61,end:62,code:`latest="$(find "$BACKUPS/daily" -mindepth 1 -maxdepth 1 -type d -mmin -$((26 * 60)) 2>/dev/null | head -1)"
[[ -n "$latest" ]] || problems+=("no backup in $BACKUPS/daily from the last 26 hours")`},"offsite/restic":{file:"deploy/vps/backup-offsite.sh",start:39,end:44,code:`restic() {
  docker run --rm -i --env-file "$RESTIC_ENV" --hostname "$(hostname)" \\
    -v restic-cache:/root/.cache/restic \\
    -v "$FOLDER:/backup/daily:ro" -v "$SECRETS:/backup/secrets:ro" \\
    "$RESTIC_IMAGE" "$@"
}`},"offsite/backup":{file:"deploy/vps/backup-offsite.sh",start:47,end:50,code:`restic cat config >/dev/null 2>&1 || restic init
# Not the repository's own key and credentials (they are in the password manager; a copy behind them helps nobody).
restic backup --quiet --tag nightly --exclude /backup/secrets/backup /backup/daily /backup/secrets
restic forget --quiet --tag nightly --keep-daily 14 --keep-weekly 8 --keep-monthly 12 --prune`},"offsite/notconf":{file:"deploy/vps/backup-offsite.sh",start:29,end:33,code:`if [[ ! -r "$RESTIC_ENV" ]]; then
  echo "  off-server copy: not configured ($RESTIC_ENV missing); the backup stays on this server only"
  ping_check backup-offsite fail "Not configured: $RESTIC_ENV is missing"
  exit 0
fi`},"restore/moves":{file:"deploy/vps/restore-db.sh",start:51,end:64,code:`# One MOVE per file in the backup: Windows paths mean nothing here.
local moves="" n=0 logical type ext
while IFS='|' read -r logical _ type _; do
  [[ -z "$logical" || -z "$type" ]] && continue
  case "$type" in L) ext=ldf ;; *) ext=mdf ;; esac
  [[ $n -gt 0 && "$ext" == mdf ]] && ext=ndf
  moves+=", MOVE N'$logical' TO N'/var/opt/mssql/data/\${db}_$n.$ext'"
  n=$((n + 1))
done < <(sql "SET NOCOUNT ON; RESTORE FILELISTONLY FROM DISK = N'$inside'")
[[ $n -gt 0 ]] || { echo "No files listed in the backup."; return 1; }

sql "IF DB_ID(N'$db') IS NOT NULL ALTER DATABASE [$db] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
     RESTORE DATABASE [$db] FROM DISK = N'$inside' WITH REPLACE, RECOVERY$moves;
     ALTER DATABASE [$db] SET MULTI_USER;" >/dev/null`},"restore/ledger":{file:"deploy/vps/restore-db.sh",start:68,end:72,code:`LedgerDashboard)
  local ld="$ROOT/LedgerDashboard"
  sql "USE [LedgerDashboard]; DROP USER IF EXISTS ledger_svc; DROP USER IF EXISTS ledger_reader;" >/dev/null
  run_sql_file "$ld/db/02-service-login.sql" -v "DB_PASSWORD=$(env_val DB_PASSWORD "$ld/server/.env")"
  run_sql_file "$ld/db/05-reader-login.sql" -v "READER_PASSWORD=$(env_val LEDGER_READER_PASSWORD .env)"`},"restore/restart":{file:"deploy/vps/restore-db.sh",start:114,end:118,code:`# Whatever was connected to the old copies reconnects to the new ones.
running="$(docker compose ps --services --status running)"
for svc in ledgerdashboard ledgerdash-adapter labflow-api clinichub pharmaflow-api finance-api; do
  if grep -qx "$svc" <<<"$running"; then docker compose restart "$svc"; fi
done`},"restoretest/check":{file:"deploy/vps/restore-test.sh",start:43,end:44,code:`# A tenth of the data is downloaded and its checksums verified each month: all of it over about a year.
restic check --read-data-subset=10% >/dev/null`},"restoretest/test":{file:"deploy/vps/restore-test.sh",start:71,end:76,code:`sql "IF DB_ID(N'$test_db') IS NOT NULL DROP DATABASE [$test_db];
     RESTORE DATABASE [$test_db] FROM DISK = N'$INSIDE/$db.bak' WITH RECOVERY, CHECKSUM$moves;" >/dev/null
step="DBCC CHECKDB of $db"
sql "DBCC CHECKDB (N'$test_db') WITH NO_INFOMSGS, ALL_ERRORMSGS;" >/dev/null
tables="$(sql "SET NOCOUNT ON; SELECT COUNT(*) FROM [$test_db].sys.tables" | tr -d '[:space:]')"
sql "ALTER DATABASE [$test_db] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [$test_db];" >/dev/null`},"restoretest/traps":{file:"deploy/vps/restore-test.sh",start:26,end:28,code:`cleanup() { docker run --rm -v "$BACKUPS/mssql:/m" alpine rm -rf /m/restore-test; }
trap 'ping_check restore-test fail "restore-test.sh failed: $step (line $LINENO)"' ERR
trap cleanup EXIT`},"export/steps":{file:"deploy/vps/README.md",start:115,end:117,code:`docker compose up -d --wait sqlserver
deploy/vps/restore-db.sh
rm /srv/backups/import/*.bak`},"export/ps":{file:"deploy/vps/export-dbs.ps1",start:22,end:29,code:`foreach ($db in $Databases) {
    $file = Join-Path $backupDir "$db-vps.bak"
    Write-Host "Backing up $db -> $file"
    sqlcmd -S $Server -E -b -Q "BACKUP DATABASE [$db] TO DISK = N'$file' WITH INIT, COPY_ONLY, CHECKSUM"
    if ($LASTEXITCODE -ne 0) { throw "Backup of $db failed." }
    Copy-Item $file (Join-Path $OutDir "$db.bak") -Force
    Remove-Item $file
}`}},o=[],r=[],a=[],l={project:e,repo:s,files:n,examples:t,endpoints:o,tables:r,routes:a};export{l as default,o as endpoints,t as examples,n as files,e as project,s as repo,a as routes,r as tables};
