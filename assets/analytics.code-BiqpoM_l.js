const e="analytics",n="Analytics",t={"README.md":47,"docs/architecture.md":507,"CLAUDE.md":12,"src/analytics/settings.py":68,"src/analytics/cli.py":188,".env.example":35,Dockerfile:22,"tests/conftest.py":160,".github/workflows/ci.yml":63,"src/analytics/finance_tables.py":131,"tests/test_extract.py":81,"docs/sources.md":270,"src/analytics/extract.py":70,"src/analytics/warehouse.py":177,"src/analytics/sources.py":52,"dbt/dbt_project.yml":15,"dbt/profiles.yml":7,"dbt/models/staging/sources.yml":29,"dbt/models/marts/dim_business.sql":24,"dbt/models/marts/mart_revenue_monthly.sql":13,"dbt/tests/every_entry_balances.sql":5,"dbt/tests/no_negative_turnaround.sql":4,"dbt/models/marts/fact_open_item_snapshot.sql":28,"dbt/models/marts/mart_ohip_collection.sql":62,"src/analytics/events.py":351,"tests/test_events.py":462,"dbt/models/staging/stg_clinical_event.sql":17,"dbt/models/marts/fact_order.sql":64,"dbt/models/marts/mart_turnaround.sql":16,"src/analytics/auth.py":113,"tests/test_auth.py":279,"src/analytics/api.py":578,"src/analytics/forecast.py":255,"src/analytics/scoring.py":190,"docs/models/revenue-forecast.md":61,"src/analytics/anomalies.py":114,"docs/models/remittance-anomalies.md":49,"src/analytics/pipeline.py":322,"src/analytics/alerts.py":100,"src/analytics/retention.py":93,"src/analytics/reconcile.py":190,"web/src/App.tsx":65,"web/src/auth/AuthProvider.tsx":146,"web/src/api/client.ts":66,"web/src/components/Layout.tsx":127,"web/src/state/Dashboard.tsx":125,"web/src/lib/periods.ts":59,"web/src/api/useResource.ts":42,"web/src/lib/csv.ts":30},s={"overview/decisions":{file:"docs/architecture.md",start:25,end:38,code:'1. **Health information never enters.** Phase 1 uses only the accounting, which by design holds no patient names,\n   health cards, diagnoses or fee codes ("Patients" is one party). Clinical data arrives from IntegrationHub already\n   de-identified: a patient is an HMAC pseudonym, there are no names, birth dates, notes or result values. A field\n   that looks like health information in a source is a bug to report, not a column to load.\n2. **Reading FinancePowerApp\'s database is a deliberate, narrow exception** to "applications talk through APIs":\n   a dedicated SQL login with `SELECT` only on the `org`, `gl`, `ar`, `ap`, `tax` schemas and `dbo.AccountingPeriods`.\n   It is the usual warehouse extract. If FinancePowerApp later offers an export API, switch to it.\n3. **A clinic sees only its own numbers.** In FinancePowerApp, each clinic is a business whose `sourceKey` is\n   ClinicHub\'s clinic slug. A user signed in for a clinic sees that business; the group view needs\n   `analytics:group.view`.\n4. **Reproducible from scratch.** The warehouse is a file (`data/warehouse.duckdb`) rebuilt by `analytics build`; raw\n   extracts are kept as Parquet per run, so a model change can be rerun without touching the sources.\n5. **Forecasts are judged against a baseline.** Every model is backtested against a seasonal-naive forecast, and\n   the dashboard shows the baseline when the model does not beat it.'},"overview/status":{file:"README.md",start:37,end:47,code:"## Status\n\n- [x] Phase 0 — skeleton, CLI, CI, Docker\n- [x] Phase 1 — finance warehouse from FinancePowerApp, dbt marts, API\n- [x] Phase 2 — sign-in through ClinicHub, clinic-scoped access — API done; web sign-in comes with the web (phase 3)\n- [x] Phase 3 — dashboard: revenue, OHIP collection, receivables, HST\n- [x] Phase 4 — operations from IntegrationHub events: turnaround, cancellations\n- [x] Phase 5 — revenue forecasts and remittance anomalies, with backtests and model cards ([docs/models](docs/models)); not yet run on real books\n- [x] Phase 6 — `analytics run` / `analytics schedule`, a data-quality report per run (`/api/meta/runs`), images in CI, ControlPanel compose with the extract from FinancePowerApp's `analytics_reader` login, a webhook alert when a run fails (`ANALYTICS_ALERT_WEBHOOK_URL`), the Runs page, `analytics prune` for old extracts and reports, a reconciliation with FinancePowerApp's own reports on every run (`analytics reconcile`)\n\nAll data in tests and samples is synthetic."},"run/commands":{file:"README.md",start:18,end:28,code:`uv sync
cp .env.example .env
uv run analytics serve            # API on :5600
curl localhost:5600/healthz
# the finance endpoints need a ClinicHub access token: curl -H "Authorization: Bearer $TOKEN" localhost:5600/api/me
uv run analytics extract finance  # needs ANALYTICS_FINANCE_CONNECTION_STRING
uv run analytics consume --drain  # read IntegrationHub's events from RabbitMQ (without --drain: keep running)
uv run analytics build            # raw -> data/warehouse.duckdb -> dbt models and tests
uv run analytics score            # forecasts with backtests and remittance anomalies -> schema ml
uv run analytics run              # all of it into a copy of the warehouse, swapped in when it worked, plus a report in data/runs/
uv run analytics schedule         # run now and every ANALYTICS_RUN_EVERY (6h)`},"run/settings":{file:"src/analytics/settings.py",start:12,end:57,code:`class Settings(BaseSettings):
    """Every setting, read from the environment, \`.env\` or a secret file. Mirrors \`.env.example\`."""

    model_config = SettingsConfigDict(
        env_prefix="ANALYTICS_",
        env_file=".env",
        extra="ignore",
        secrets_dir=SECRETS_DIR if SECRETS_DIR.is_dir() else None,
    )

    host: str = "127.0.0.1"
    port: int = 5600
    data_dir: Path = Path("data")
    warehouse_path: Path = Path("data/warehouse.duckdb")
    dbt_project_dir: Path = Path("dbt")
    # Read-only login on FinancePowerApp (phase 1). Empty until configured.
    finance_connection_string: str = ""
    # LabFlow's warehouse through its read-only login (monthly lab volumes). Empty: not read.
    labflow_dw_connection_string: str = ""
    # ClinicHub sign-in (phase 2).
    oidc_issuer: str = "http://localhost:5301/"
    # Empty: {issuer}.well-known/jwks
    oidc_jwks_uri: str = ""
    # Empty: the audience of the token is not checked (not known yet, see docs/sources.md).
    oidc_audience: str = ""
    # The dashboard (phase 3) calls the API from this origin.
    web_origin: str = "http://localhost:5601"
    # RabbitMQ feed from IntegrationHub (phase 4).
    rabbitmq_url: str = "amqp://guest:guest@localhost:5672/"
    rabbitmq_exchange: str = "clinical.events"
    # The hub declares this durable queue too (both without arguments).
    rabbitmq_queue: str = "analytics.clinical-events"
    # A batch is written, then acknowledged: at most this many events, or this many seconds.
    consume_batch_size: int = 200
    consume_flush_seconds: float = 5.0
    # \`analytics schedule\` (phase 6): how often \`analytics run\` runs, e.g. 30m, 6h, 1d.
    run_every: str = "6h"
    # Told when a run fails and when it works again (JSON POST, \`text\` and details). Empty: nobody.
    alert_webhook_url: str = ""
    # A run that keeps failing is told again after this many hours.
    alert_repeat_hours: int = 24
    # Finance extracts older than this many days keep only the last one of each day (what the
    # open-item history is built from); 0 keeps everything.
    keep_extract_days: int = 14
    # Run reports kept (newest first, and always the last good one); 0 keeps everything.
    keep_reports: int = 200`},"run/serve":{file:"src/analytics/cli.py",start:182,end:188,code:`def serve(
    host: Annotated[str | None, typer.Option(help="Defaults to ANALYTICS_HOST.")] = None,
    port: Annotated[int | None, typer.Option(help="Defaults to ANALYTICS_PORT (5600).")] = None,
) -> None:
    """Start the API."""
    settings = get_settings()
    uvicorn.run("analytics.api:app", host=host or settings.host, port=port or settings.port)`},"tests/fakehub":{file:"tests/conftest.py",start:77,end:92,code:`def token(self, *, key: Any = None, kid: str = KEY_ID, **claims: Any) -> str:
    now = int(time.time())
    payload: dict[str, Any] = {
        "iss": ISSUER,
        "sub": "user-1",
        "name": "Test User",
        "iat": now,
        "exp": now + 300,
        **claims,
    }
    payload = {k: v for k, v in payload.items() if v is not None}
    return jwt.encode(
        payload,
        key or self.key,
        algorithm="RS256",
        headers={"kid": kid, "typ": "at+jwt"},`},"tests/fresh":{file:"tests/conftest.py",start:31,end:37,code:`@pytest.fixture(autouse=True)
def fresh_settings() -> Iterator[None]:
    """\`get_settings()\` is cached for the life of the process: a test that sets the environment
    must see its own values, and must not leave them behind."""
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()`},"tests/ci":{file:".github/workflows/ci.yml",start:7,end:17,code:`jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v5
      - run: uv sync --frozen
      - run: uv run ruff check
      - run: uv run ruff format --check
      - run: uv run mypy src
      - run: uv run pytest`},"columns/table":{file:"src/analytics/finance_tables.py",start:12,end:26,code:`class SourceTable:
    schema: str
    name: str
    columns: tuple[str, ...]

    @property
    def raw_name(self) -> str:
        """File and warehouse name, e.g. \`gl_journalline\`."""
        return f"{self.schema}_{self.name}".lower()

    @property
    def query(self) -> str:
        # Double quotes work on SQL Server (QUOTED_IDENTIFIER is on for ODBC) and on DuckDB.
        cols = ", ".join(f'"{c}"' for c in self.columns)
        return f"SELECT {cols} FROM {self.schema}.{self.name}"`},"columns/forbidden":{file:"src/analytics/finance_tables.py",start:126,end:128,code:`FORBIDDEN_COLUMNS = frozenset(
    {"Email", "Phone", "Memo", "Description", "CreatedBy", "PostedBy", "Reference"}
)`},"columns/test":{file:"tests/test_extract.py",start:25,end:33,code:`def test_no_table_selects_a_forbidden_column() -> None:
    for table in FINANCE_TABLES:
        assert not FORBIDDEN_COLUMNS & set(table.columns), table.raw_name


def test_queries_are_plain_selects_without_star() -> None:
    for table in FINANCE_TABLES:
        assert table.query.startswith('SELECT "')
        assert "*" not in table.query`},"extract/extract":{file:"src/analytics/extract.py",start:29,end:47,code:`    for table in FINANCE_TABLES:
        df = source.read(table.query)
        df.write_parquet(out_dir / f"{table.raw_name}.parquet")
        rows[table.raw_name] = df.height
    for table in OPTIONAL_TABLES:
        try:
            df = source.read(table.query)
        except (
            Exception
        ):  # the source has no such view (an older FinancePowerApp): nothing is lost
            continue
        df.write_parquet(out_dir / f"{table.raw_name}.parquet")
        rows[table.raw_name] = df.height
except Exception as exc:
    # Type and first line only: never echo a connection string or row content into the log.
    error = f"{type(exc).__name__}: {str(exc).splitlines()[0][:200] if str(exc) else ''}"
    raise
finally:
    _record(settings, run_id, started, rows, error)`},"extract/complete":{file:"src/analytics/warehouse.py",start:47,end:54,code:`def complete_runs(settings: Settings) -> list[str]:
    """Run ids (oldest first) whose directory holds every expected table."""
    base = settings.data_dir / "raw" / RAW_FINANCE
    if not base.is_dir():
        return []
    expected = [t.raw_name + ".parquet" for t in FINANCE_TABLES]
    return sorted(
        d.name for d in base.iterdir() if d.is_dir() and all((d / f).is_file() for f in expected)`},"extract/history":{file:"src/analytics/warehouse.py",start:92,end:101,code:`last_of_day: dict[date, str] = {}
for run in runs:
    last_of_day[run_date(run)] = run
for name in HISTORY_TABLES:
    selects = [
        f"SELECT DATE '{day.isoformat()}' AS snapshot_date, * "
        f"FROM read_parquet('{_parquet(settings, run, name)}')"
        for day, run in sorted(last_of_day.items())
    ]
    con.execute(f"CREATE OR REPLACE TABLE raw.{name}_history AS " + " UNION ALL ".join(selects))`},"marts/project":{file:"dbt/dbt_project.yml",start:10,end:15,code:`models:
  analytics:
    staging:
      +materialized: view
    marts:
      +materialized: table`},"marts/business":{file:"dbt/models/marts/dim_business.sql",start:3,end:9,code:`with keys as (
    select
        entity_id,
        list({'source': source, 'source_key': source_key} order by source, source_key) as source_keys,
        max(case when lower(source) = 'clinichub' then source_key end) as clinic_slug
    from {{ ref('stg_entity_source') }}
    group by entity_id`},"marts/revenue":{file:"dbt/models/marts/mart_revenue_monthly.sql",start:1,end:13,code:`-- Revenue = credits minus debits on revenue accounts, by posting month. Refund and adjustment accounts
-- that are revenue-type accounts reduce it. Department is the line of business.
select
    f.business_id,
    coalesce(f.department, 'Unassigned') as line_of_business,
    coalesce(f.provider_code, 'none') as provider_code,
    f.period_month as month,
    sum(f.credit - f.debit)::decimal(14, 2) as revenue,
    count(distinct f.journal_entry_id) as entries
from {{ ref('fact_gl_line') }} as f
inner join {{ ref('dim_account') }} as a on a.account_id = f.account_id
where a.account_type = 'Revenue'
group by 1, 2, 3, 4`},"checks/balances":{file:"dbt/tests/every_entry_balances.sql",start:1,end:5,code:`-- Debits equal credits in every entry that reached the books.
select journal_entry_id, sum(debit) as debit, sum(credit) as credit
from {{ ref('fact_gl_line') }}
group by journal_entry_id
having sum(debit) <> sum(credit)`},"checks/aging":{file:"dbt/models/marts/fact_open_item_snapshot.sql",start:19,end:28,code:`    date_diff('day', due_date, snapshot_date) as days_past_due,
    case
        when snapshot_date <= due_date then 'current'
        when date_diff('day', due_date, snapshot_date) <= 30 then '1-30'
        when date_diff('day', due_date, snapshot_date) <= 60 then '31-60'
        when date_diff('day', due_date, snapshot_date) <= 90 then '61-90'
        else '90+'
    end as aging_bucket
from items
where balance <> 0`},"checks/ohip":{file:"dbt/models/marts/mart_ohip_collection.sql",start:18,end:21,code:`adjustment_accounts as (
    select distinct category, account_id
    from {{ ref('stg_category_map') }}
    where category in ('Adjustment.ShortPaid', 'Adjustment.Refused')`},"allow-list/patterns":{file:"src/analytics/events.py",start:64,end:70,code:`_TOKEN = re.compile(r"^[A-Za-z0-9._-]{1,60}$")
_ORDER_ID = re.compile(r"^service-request\\|[A-Za-z0-9._-]{1,100}$")
_CODE = re.compile(r"^[A-Za-z0-9._:/-]{1,100}$")
_SYSTEM = re.compile(r"^[A-Za-z0-9:/._#-]{1,200}$")
_STATUS = re.compile(r"^[a-z-]{1,30}$")
_PSEUDONYM = re.compile(r"^[0-9a-f]{64}$")
_PRIORITIES = frozenset({"routine", "urgent", "asap", "stat"})`},"allow-list/parse":{file:"src/analytics/events.py",start:120,end:126,code:`version = raw.get("schemaVersion")
if version != SCHEMA_VERSION or isinstance(version, bool):
    raise reject("unsupported-schema-version")
if type_ in IGNORED_TYPES:
    raise Ignored
if type_ not in OPERATIONAL_TYPES:
    raise reject("unknown-type")`},"allow-list/test":{file:"tests/test_events.py",start:327,end:330,code:`def test_a_field_the_contract_does_not_know_never_reaches_the_disk(hub: Hub) -> None:
    hub.publish(good() | {"patientName": "Zzyzx Testpatient", "healthCard": "123-456-789"})

    consume(hub.settings, drain=True)`},"consumer/topology":{file:"src/analytics/events.py",start:215,end:233,code:`def ensure_topology(channel: BlockingChannel, settings: Settings) -> None:
    """Declare the queue and its binding as IntegrationHub does (durable, no arguments): idempotent.

    The exchange is the hub's: it is only checked (passive), so the Analytics account needs no
    configure permission on it. Permissions: configure and write on the queue (binding is a write
    on the queue), read on the queue and the exchange.
    """
    try:
        channel.exchange_declare(exchange=settings.rabbitmq_exchange, passive=True)
    except pika.exceptions.ChannelClosedByBroker as e:
        if e.reply_code == 404:
            raise ConsumerError(
                f"the exchange {settings.rabbitmq_exchange} does not exist yet: IntegrationHub "
                "creates it when it starts with HUB_EVENTS_ENABLED=true"
            ) from None
        raise
    channel.queue_declare(queue=settings.rabbitmq_queue, durable=True)
    channel.queue_bind(
        queue=settings.rabbitmq_queue, exchange=settings.rabbitmq_exchange, routing_key="#"`},"consumer/flush":{file:"src/analytics/events.py",start:288,end:297,code:`def flush() -> None:
    nonlocal rows, rejects, last_tag
    if last_tag is None:
        return
    writer(settings, rows, rejects)
    channel.basic_ack(delivery_tag=last_tag, multiple=True)
    result.stored += len(rows)
    result.rejected += len(rejects)
    result.batches += 1
    rows, rejects, last_tag = [], [], None`},"consumer/write":{file:"src/analytics/events.py",start:173,end:177,code:`final = directory / f"events-{stamp}.parquet"
temp = directory / f".{final.name}.tmp"
pl.DataFrame(rows, schema=EVENT_COLUMNS).write_parquet(temp)
_sync(temp)
os.replace(temp, final)`},"orders/dedupe":{file:"src/analytics/warehouse.py",start:125,end:129,code:`pattern = str(events_dir(settings) / "events-*.parquet").replace("'", "''")
con.execute(
    "CREATE OR REPLACE TABLE raw.clinical_event AS "
    f"SELECT * FROM read_parquet('{pattern}') "
    "QUALIFY row_number() OVER (PARTITION BY event_id ORDER BY received_at) = 1"`},"orders/orders":{file:"dbt/models/marts/fact_order.sql",start:13,end:20,code:`min(occurred_at) filter (where type = 'order.placed') as placed_at,
min(occurred_at) filter (where type = 'order.accepted') as accepted_at,
min(occurred_at) filter (where type = 'result.final') as first_final_at,
max(occurred_at) filter (where type = 'result.final') as last_final_at,
count(*) filter (where type = 'result.amended') as amended_count,
max(occurred_at) filter (where type = 'result.amended') as last_amended_at,
min(occurred_at) filter (where type = 'order.cancelled') as cancelled_at,
count(*) filter (where type = 'order.cancel-refused') as cancel_refused_count,`},"orders/status":{file:"dbt/models/marts/fact_order.sql",start:52,end:63,code:`    when cancelled_at is not null then 'cancelled'
    when first_final_at is not null and placed_at is null then 'resulted (placed before the hub)'
    when first_final_at is not null then 'resulted'
    when accepted_at is not null then 'accepted'
    when placed_at is not null then 'placed'
    else 'unknown'
end as status,
-- minutes from the order being placed to its first final result
case
    when placed_at is not null and first_final_at is not null
    then date_diff('second', placed_at, first_final_at) / 60.0
end as turnaround_minutes`},"orders/turn":{file:"dbt/models/marts/mart_turnaround.sql",start:11,end:13,code:`count(turnaround_minutes) as orders_resulted,
median(turnaround_minutes) as median_minutes,
quantile_cont(turnaround_minutes, 0.9) as p90_minutes`},"tokens/verify":{file:"src/analytics/auth.py",start:78,end:96,code:`def verify(self, token: str) -> User:
    try:
        key = self._jwks.get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            key.key,
            algorithms=["RS256"],
            issuer=self._issuer,
            audience=self._audience,
            leeway=60,
            options={
                "require": ["exp", "iss", "sub"],
                "verify_aud": self._audience is not None,
            },
        )
    except PyJWKClientConnectionError as exc:
        raise Unavailable from exc
    except (InvalidTokenError, PyJWKClientError) as exc:
        raise Unauthorized(type(exc).__name__) from exc`},"tokens/perms":{file:"src/analytics/auth.py",start:53,end:61,code:`def _permissions(value: Any) -> frozenset[str]:
    """ClinicHub's form (\`dashboard.view\`) and the prefixed one, as \`analytics:dashboard.view\`."""
    keys = _as_list(value)
    # Another application's key (\`labflow:admin\`) is not ours: dropped, not renamed.
    return frozenset(
        p if p.startswith(PREFIX) else PREFIX + p
        for p in keys
        if ":" not in p or p.startswith(PREFIX)
    )`},"tokens/scope":{file:"src/analytics/auth.py",start:107,end:113,code:`def scope_for(user: User) -> Scope:
    """\`group.view\` sees every business; \`dashboard.view\` only the clinic in the token."""
    if GROUP_VIEW in user.permissions:
        return Scope(group=True, clinic_slug=None)
    if DASHBOARD_VIEW in user.permissions and user.clinic_slug:
        return Scope(group=False, clinic_slug=user.clinic_slug)
    raise Forbidden`},"clinic-scope/current":{file:"src/analytics/api.py",start:61,end:78,code:`def current_user(request: Request) -> User:
    header = request.headers.get("Authorization", "")
    if header[:7].lower() != "bearer " or not header[7:].strip():
        raise HTTPException(401, "Sign in.", headers={"WWW-Authenticate": "Bearer"})
    try:
        return verifier.verify(header[7:].strip())
    except Unauthorized as exc:
        raise HTTPException(
            401, "The access token was not accepted.", headers={"WWW-Authenticate": "Bearer"}
        ) from exc
    except Unavailable as exc:
        raise HTTPException(503, "Tokens cannot be verified right now.") from exc

def current_scope(user: Annotated[User, Depends(current_user)]) -> Scope:
    try:
        return scope_for(user)
    except Forbidden as exc:
        raise HTTPException(403, "No permission to view finance data.") from exc`},"clinic-scope/clauses":{file:"src/analytics/api.py",start:549,end:562,code:`def _business_clauses(
    alias: str, scope: Scope, business: str | None
) -> tuple[list[str], list[Any]]:
    """The clinic in the token always applies; a \`business\` in the request narrows it further, so
    asking for another clinic gives an empty answer, not that clinic's numbers."""
    clauses: list[str] = []
    params: list[Any] = []
    if not scope.group:
        clauses.append(_SCOPE_FILTER.format(a=alias))
        params.append(scope.clinic_slug)
    if business:
        clauses.append(_BUSINESS_FILTER.format(a=alias))
        params += [business, business]
    return clauses, params`},"clinic-scope/test":{file:"tests/test_auth.py",start:146,end:157,code:`def test_clinic_viewer_sees_only_their_clinic(
    app_client: TestClient, clinichub: FakeClinicHub
) -> None:
    headers = clinic_headers(clinichub)

    revenue = app_client.get("/api/finance/revenue", headers=headers).json()
    assert {r["month"]: r["revenue"] for r in revenue} == {"2026-09-01": 150.0, "2026-10-01": 160.0}

    by_business = app_client.get(
        "/api/finance/revenue", params={"groupBy": "business"}, headers=headers
    ).json()
    assert by_business == [{"business": "HV", "revenue": 310.0}]`},"api/groups":{file:"src/analytics/api.py",start:23,end:38,code:`_REVENUE_GROUPS = {
    "month": "r.month",
    "business": "b.code as business",
    "lineOfBusiness": "r.line_of_business",
    "provider": "r.provider_code as provider",
}

# groupBy value -> select expression for the operations queries (fixed list, never request text).
_OPS_GROUPS = {
    "month": "date_trunc('month', o.placed_at)::date as month",
    "clinic": "o.clinic_slug as clinic",
    "department": "o.department as department",
    "test": "coalesce(o.test_code, 'unknown') as test",
    "priority": "coalesce(o.priority, 'unknown') as priority",
}
_DEPARTMENTS = ("Lab", "Diagnostics")`},"api/turnaround":{file:"src/analytics/api.py",start:230,end:249,code:`keys = [k.strip() for k in group_by.split(",") if k.strip() and k.strip() != "none"]
unknown = [k for k in keys if k not in _OPS_GROUPS]
if unknown:
    raise HTTPException(422, f"groupBy must be a list of: {', '.join(_OPS_GROUPS)}")
where, params = ops_clauses("o", scope, clinic, department, from_, to, "placed_at")
where = (where + " and " if where else "where ") + "o.placed_at is not null"
measures = (
    "count(*) as placed, count(o.turnaround_minutes) as resulted, "
    "count(*) filter (where o.status = 'cancelled') as cancelled, "
    "count(*) filter (where o.status in ('placed', 'accepted')) as pending, "
    "round(median(o.turnaround_minutes), 1)::double as median_minutes, "
    "round(quantile_cont(o.turnaround_minutes, 0.9), 1)::double as p90_minutes"
)
columns = ", ".join(_OPS_GROUPS[k] for k in keys)
positions = ", ".join(str(i + 1) for i in range(len(keys)))
sql = (
    f"select {columns + ', ' if keys else ''}{measures} from main.fact_order o {where}"
    + (f" group by {positions} order by {positions}" if keys else "")
)
return query(sql, params)`},"api/query":{file:"src/analytics/api.py",start:103,end:120,code:`def query(sql: str, params: list[Any]) -> list[dict[str, Any]]:
    if not config.warehouse_path.is_file():
        raise HTTPException(503, "The warehouse is not built yet. Run \`analytics build\`.")
    try:
        con = duckdb.connect(str(config.warehouse_path), read_only=True)
    except duckdb.IOException as exc:
        # \`analytics run\` is swapping in a new warehouse (or a manual build is writing it).
        raise HTTPException(
            503, "The warehouse is being updated; try again in a moment."
        ) from exc
    try:
        cursor = con.execute(sql, params)
        names = [c[0] for c in cursor.description]
        return [dict(zip(names, row, strict=True)) for row in cursor.fetchall()]
    except duckdb.CatalogException as exc:
        raise HTTPException(503, "The warehouse has no finance data yet.") from exc
    finally:
        con.close()`},"forecast/models":{file:"src/analytics/forecast.py",start:118,end:124,code:`BASELINE = "seasonal-naive"
MODELS = [
    Model(BASELINE, 1, lambda y, h: seasonal_naive(y, h)),
    Model("ets", 8, ets),
    Model("sarima", 2 * SEASON + 6, sarima),
    Model("gradient-boosting", 2 * SEASON, gradient_boosting),
]`},"forecast/naive":{file:"src/analytics/forecast.py",start:37,end:41,code:`def seasonal_naive(y: Series, h: int) -> Series:
    """The same month a year earlier; the last value when there is less than a year."""
    if len(y) >= SEASON:
        return np.array([y[len(y) - SEASON + (i % SEASON)] for i in range(h)], dtype=float)
    return np.full(h, y[-1], dtype=float)`},"forecast/choose":{file:"src/analytics/forecast.py",start:194,end:203,code:`def choose(backtests: list[Backtest]) -> str:
    """Lowest MASE; the baseline unless another model is strictly better than it."""
    base = next(b for b in backtests if b.model == BASELINE)
    best = base
    for b in backtests:
        if b.mase is not None and (best.mase is None or b.mase < best.mase):
            best = b
    if base.mase is None or best.mase is None or best.mase >= base.mase:
        return BASELINE
    return best.model`},"forecast/band":{file:"src/analytics/forecast.py",start:221,end:222,code:`errors = next(b for b in results if b.model == chosen).errors
width = [float(np.quantile([abs(row[k]) for row in errors], 0.8)) for k in range(horizon)]`},"anomalies/z":{file:"src/analytics/anomalies.py",start:60,end:72,code:`def robust_z(value: float, history: list[float]) -> tuple[float, float, float]:
    """(z, median, spread) of \`value\` against \`history\`."""
    median = statistics.median(history)
    mad = statistics.median(abs(v - median) for v in history)
    if mad > 0:
        return 0.6745 * (value - median) / mad, median, mad
    mean_ad = statistics.fmean(abs(v - median) for v in history)
    if mean_ad > 0:
        spread = 1.2533 * mean_ad
        return 0.6745 * (value - median) / spread, median, spread
    if value > median:
        return math.inf, median, 0.0
    return (-math.inf if value < median else 0.0), median, 0.0`},"anomalies/rules":{file:"src/analytics/anomalies.py",start:27,end:30,code:`MIN_HISTORY = 6
Z_FLAG = 3.5
MIN_POINTS = 0.02
MIN_BILLED = 500.0`},"anomalies/flag":{file:"src/analytics/anomalies.py",start:87,end:110,code:`earlier = billed[:i]
if len(earlier) < MIN_HISTORY:
    continue
for measure in MEASURES:
    amount = getattr(current, measure)
    rate = amount / current.billed
    history = [getattr(r, measure) / r.billed for r in earlier]
    z, usual, spread = robust_z(rate, history)
    out.append(
        Score(
            business_id=current.business_id,
            provider=current.provider,
            month=current.month,
            measure=measure,
            billed=current.billed,
            amount=amount,
            rate=rate,
            usual_rate=usual,
            spread=spread,
            history_months=len(earlier),
            z=z,
            flagged=z >= Z_FLAG
            and rate - usual >= MIN_POINTS
            and current.billed >= MIN_BILLED,`},"pipeline/next":{file:"src/analytics/pipeline.py",start:80,end:83,code:`def next_path(settings: Settings) -> Path:
    """Beside the live file, under the same name: dbt-duckdb names the database after the file."""
    live = settings.warehouse_path
    return live.parent / "next" / live.name`},"pipeline/replace":{file:"src/analytics/pipeline.py",start:197,end:206,code:`def _replace(src: Path, dest: Path, attempts: int = 20, pause: float = 0.5) -> None:
    """Swaps the new warehouse in; on Windows a reader may hold the file for a moment, so retry."""
    for i in range(attempts):
        try:
            os.replace(src, dest)
            return
        except PermissionError:
            if i == attempts - 1:
                raise
            time.sleep(pause)`},"pipeline/chain":{file:"src/analytics/pipeline.py",start:267,end:298,code:`ok = _step(report, "prepare", prepare) and _step(report, "extract", extract)
if ok:
    # Optional source: when it fails, the last extract of it is built again and the run goes on.
    _step(report, "labflow", extract_dw)
built = ok and _step(report, "build", build_step)
# The tests that failed are worth reporting even when the build as a whole failed.
report.failed_tests = dbt_failures(work) if ok else []
if built:
    # A difference, or a reconciliation that could not run, is reported; the run goes on.
    _step(report, "reconcile", reconcile_step)
scored = built and _step(report, "score", score_step)
previous = last_good_counts(settings)
if aside.is_file() and ok:
    try:
        counts = table_counts(aside)
    except duckdb.Error:
        counts = {}
    report.tables = [
        {"name": n, "rows": c, "previous": previous.get(n)} for n, c in sorted(counts.items())
    ]
    report.checks += checks_for(counts, previous, report.failed_tests)
if scored and _step(report, "replace", lambda: _replace_detail(aside, live)):
    report.warehouse_replaced = True
else:
    aside.unlink(missing_ok=True)
# Old data goes after every run, a failed one too (its partial extract is the first to go).
_step(report, "prune", lambda: prune(settings, now=started).describe())
report.finished_utc = datetime.now(UTC).isoformat()
if not report.warehouse_replaced:
    report.status = "failed"
else:
    report.status = "warning" if report.checks else "ok"`},"pipeline/schedule":{file:"src/analytics/cli.py",start:167,end:176,code:`while not stop.is_set():
    started = time.monotonic()
    try:
        print_report(run_pipeline(settings))
    except Exception as exc:  # a broken run must not end the schedule
        typer.echo(f"run failed: {describe_failure(exc)}", err=True)
    wait = max(0.0, interval.total_seconds() - (time.monotonic() - started))
    nxt = datetime.now(UTC) + timedelta(seconds=wait)
    typer.echo(f"Next run at {nxt:%Y-%m-%d %H:%M} UTC.")
    stop.wait(wait)`},"quality/checks":{file:"src/analytics/pipeline.py",start:155,end:173,code:`def checks_for(
    counts: dict[str, int], previous: dict[str, int], failures: list[dict[str, Any]]
) -> list[Check]:
    checks: list[Check] = []
    for f in failures:
        level = "warning" if f["status"] == "warn" else "error"
        kind = "dbt-test" if f["node"].startswith("test.") else "dbt-model"
        checks.append(Check(level, kind, f["node"], f"{f['status']}: {f['message']}".strip()))
    for name, before in sorted(previous.items()):
        now = counts.get(name)
        if now is None:
            continue
        if before > 0 and now == 0:
            checks.append(
                Check("warning", "empty-table", name, f"{before} rows last time, none now")
            )
        elif before >= DROP_MIN_ROWS and now < before * (1 - DROP_WARNING):
            checks.append(Check("warning", "row-drop", name, f"{before} rows last time, {now} now"))
    return checks`},"quality/due":{file:"src/analytics/alerts.py",start:56,end:66,code:`def due(report: Any, previous: list[dict[str, Any]], settings: Settings) -> str | None:
    """Which message this run owes: \`failed\`, \`recovered\` or nothing."""
    was_failing, told = _streak(previous)
    if report.status == "failed":
        if told is None:
            return ALERT_FAILED
        then, now = _parse(told.get("finished_utc", "")), _parse(report.finished_utc)
        if then and now and (now - then).total_seconds() >= settings.alert_repeat_hours * 3600:
            return ALERT_FAILED
        return None
    return ALERT_RECOVERED if was_failing and told is not None else None`},"reconcile/table":{file:"docs/architecture.md",start:442,end:446,code:"| Figure | FinancePowerApp | Analytics |\n|---|---|---|\n| Revenue per business and posting month | `gl.vw_PeriodMovement` on `Revenue` accounts, credits minus debits | `mart_revenue_monthly` |\n| HST collected, ITCs per business and month | `tax.vw_HstReturn` lines 103 and 106 | `mart_hst_period` (`tax_collected`, `itc`) |\n| Owed to / by each business | `ar.Item` / `ap.Item` `Balance` | latest `fact_open_item_snapshot` |"},"reconcile/books":{file:"src/analytics/reconcile.py",start:36,end:43,code:`"revenue": """
    SELECT pm.EntityId AS business_id, p."Year" AS yr, p."Month" AS mo, -SUM(pm.Net) AS amount
    FROM gl.vw_PeriodMovement pm
    JOIN gl.Account a ON a.AccountId = pm.AccountId
    JOIN dbo.AccountingPeriods p ON p.PeriodId = pm.PeriodId
    WHERE a."Type" = 'Revenue'
    GROUP BY pm.EntityId, p."Year", p."Month"
""",`},"reconcile/step":{file:"src/analytics/pipeline.py",start:253,end:261,code:`def reconcile_step() -> str:
    # Only against the books this run just read (the extract and these queries: seconds apart).
    if reconciler is None and (extractor is not None or not settings.finance_connection_string):
        return "skipped: nothing extracted from FinancePowerApp in this run"
    result = (reconciler or sql_server_reconcile)(work)
    report.checks.extend(
        Check("warning", "reconcile", d.subject(), d.message()) for d in result.differences
    )
    return result.describe()`},"web/manager":{file:"web/src/auth/AuthProvider.tsx",start:28,end:40,code:`function createManager(): UserManager {
  return new UserManager({
    authority: config.authority,
    client_id: config.clientId,
    redirect_uri: \`\${window.location.origin}\${CALLBACK_PATH}\`,
    post_logout_redirect_uri: \`\${window.location.origin}/\`,
    response_type: 'code', // authorization code with PKCE (S256): oidc-client-ts adds the challenge
    scope: config.scope,
    loadUserInfo: false,
    automaticSilentRenew: false,
    // The token lives for the tab only.
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
    stateStore: new WebStorageStateStore({ store: window.sessionStorage }),`},"web/client":{file:"web/src/api/client.ts",start:51,end:54,code:`if (response.status === 401) {
  session.expired();
  throw new ApiError(401, 'Your session ended. Signing in again.');
}`},"web/loop":{file:"web/src/auth/AuthProvider.tsx",start:47,end:55,code:`function tooManySignIns(): boolean {
  try {
    const now = Date.now();
    const recent: number[] = (JSON.parse(window.sessionStorage.getItem(LOOP_KEY) ?? '[]') as number[]).filter(
      (t) => now - t < 30_000,
    );
    recent.push(now);
    window.sessionStorage.setItem(LOOP_KEY, JSON.stringify(recent));
    return recent.length > 3;`},"web-data/last":{file:"web/src/state/Dashboard.tsx",start:86,end:88,code:`const financeLast = bounds.data?.lastMonth ?? null;
const opsLast = opsBounds.data?.lastMonth ?? null;
const lastMonth = financeLast && opsLast && opsLast > financeLast ? opsLast : financeLast;`},"web-data/range":{file:"web/src/lib/periods.ts",start:31,end:36,code:`export function rangeFor(preset: Preset, lastMonth: string): { from: string; to: string } {
  const year = lastMonth.slice(0, 4);
  switch (preset) {
    case 'last12':
      return { from: addMonths(lastMonth, -11), to: lastMonth };
    case 'last6':`},"web-data/ops":{file:"web/src/state/Dashboard.tsx",start:59,end:68,code:`export function useOps<T>(
  path: string,
  options: { params?: Params; department?: string } = {},
): Resource<T> {
  const { get, range, business, businesses } = useDashboard();
  const params: Params = { ...options.params, from: range.from, to: range.to };
  if (business) params.clinic = businesses.find((b) => b.code === business)?.clinicSlug ?? '-';
  if (options.department) params.department = options.department;
  const key = \`\${path}?\${new URLSearchParams(params as Record<string, string>).toString()}\`;
  return useResource<T>(key, (signal) => get<T>(path, params, signal));`},"web-data/csv":{file:"web/src/lib/csv.ts",start:5,end:11,code:`const FORMULA_START = /^[=+\\-@\\t\\r]/;

function cell(value: Cell): string {
  if (value == null) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  const text = FORMULA_START.test(value) ? \`'\${value}\` : value;
  return NEEDS_QUOTES.test(text) ? \`"\${text.replace(/"/g, '""')}"\` : text;`}},a=[],r=[],i=[{path:"ohip",component:"Ohip",guards:[]},{path:"receivables",component:"Receivables",guards:[]},{path:"hst",component:"Hst",guards:[]},{path:"operations",component:"Operations",guards:[]},{path:"group",component:"Group",guards:[]},{path:"forecast",component:"Forecast",guards:[]},{path:"runs",component:"Runs",guards:[]},{path:"*",redirect:"/",guards:[]}],o={project:e,repo:n,files:t,examples:s,endpoints:a,tables:r,routes:i};export{o as default,a as endpoints,s as examples,t as files,e as project,n as repo,i as routes,r as tables};
