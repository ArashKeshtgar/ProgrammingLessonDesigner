const e="labflow",t="LabFlow",n={"README.md":126,"database/deploy.ps1":51,"src/LabFlow.Api/Properties/launchSettings.json":55,"tests/LabFlow.Api.Tests/ConnectedTests.cs":337,"tests/LabFlow.Api.Tests/SlotCalculatorTests.cs":81,"src/LabFlow.Api/Program.cs":120,"src/LabFlow.Api/Auth/DemoAuthHandler.cs":94,"src/LabFlow.Api/Auth/ClinicHubConnection.cs":431,"src/LabFlow.Api/Auth/ConfidentialityGate.cs":37,"src/LabFlow.Api/Endpoints/ResultEndpoints.cs":324,"web/src/components/RestrictedGate.tsx":33,"src/LabFlow.Api/Auth/AuditLogger.cs":30,"database/010_schema.sql":641,"src/LabFlow.Api/Domain/SlotCalculator.cs":57,"src/LabFlow.Api/Endpoints/BookingEndpoints.cs":220,"src/LabFlow.Api/Endpoints/Validation.cs":62,"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs":318,"src/LabFlow.Api/Endpoints/OrderEndpoints.cs":348,"database/050_electronic_orders.sql":36,"database/052_order_cancellation.sql":10,"src/LabFlow.Api/Auth/ResultSender.cs":127,"database/051_outbound_messages.sql":22,"web/src/App.tsx":84,"web/src/api.ts":177,"database/054_analytics_dw_view.sql":22,"docs/data-model.md":89,"database/020_seed_reference.sql":114,"src/LabFlow.Api/Domain/HealthCard.cs":38,"database/053_finance.sql":16,"etl/README.md":115,"etl/builder/BuildPackage.cs":333,"database/040_etl_dw.sql":544,"database/tools/analytics_dw_reader.sql":22,"bi/README.md":40},a={"run/deploy":{file:"database/deploy.ps1",start:41,end:51,code:`$scripts = Get-ChildItem $here -Filter '*.sql' |
    Where-Object { $_.Name -match '^\\d{3}_' -and $_.Name -ne '001_database.sql' } |
    Sort-Object Name
if (-not $scripts) { throw "No numbered scripts found in $here" }
if ($NoDemo) { $scripts = $scripts | Where-Object Name -notlike '*_seed_demo.sql' }

foreach ($s in $scripts) {
    Write-Host "Running $($s.Name)..."
    Invoke-Sql $Database $s.FullName $null
}
Write-Host "$Database is ready." -ForegroundColor Green`},"run/profile":{file:"src/LabFlow.Api/Properties/launchSettings.json",start:26,end:39,code:`"connected-per-clinic": {
  "commandName": "Project",
  "dotnetRunMessages": true,
  "launchBrowser": false,
  "applicationUrl": "http://localhost:5180",
  "environmentVariables": {
    "ASPNETCORE_ENVIRONMENT": "Development",
    "ClinicHub__Authority": "http://localhost:5301/",
    "ClinicHub__ClientSecret": "dev-only-labflow-secret",
    "ClinicHub__RequireHttpsMetadata": "false",
    "ClinicHub__FinanceUrl": "http://localhost:5400",
    "ClinicHub__DatabasePattern": "Server=.;Database=LabFlow_{clinic};Trusted_Connection=True;TrustServerCertificate=True"
  }
},`},"run/guard":{file:"database/deploy.ps1",start:35,end:39,code:`$schemaExists = & sqlcmd -S $Server -E -d $Database -h -1 -W -Q "SET NOCOUNT ON; SELECT COUNT(*) FROM sys.schemas WHERE name = 'lab'"
if ($schemaExists.Trim() -eq '1') {
    Write-Host "$Database already has a schema. Use -Recreate to rebuild." -ForegroundColor Yellow
    return
}`},"tests/sqlfact":{file:"tests/LabFlow.Api.Tests/ConnectedTests.cs",start:26,end:45,code:`public sealed class SqlFactAttribute : FactAttribute
{
    public static readonly string Server = Environment.GetEnvironmentVariable("LABFLOW_TEST_SQL")
        ?? "Server=.;Trusted_Connection=True;TrustServerCertificate=True";

    private static readonly Lazy<bool> Available = new(() =>
    {
        try
        {
            using var c = new SqlConnection(new SqlConnectionStringBuilder(Server) { ConnectTimeout = 3, InitialCatalog = "master" }.ConnectionString);
            c.Open();
            return true;
        }
        catch (SqlException) { return false; }
    });

    public SqlFactAttribute()
    {
        if (!Available.Value)
            Skip = "No SQL Server available for LabFlow's database tests.";`},"tests/settings":{file:"tests/LabFlow.Api.Tests/ConnectedTests.cs",start:70,end:73,code:`builder.UseSetting("ClinicHub:Authority", "https://hub.test/");
builder.UseSetting("ClinicHub:ClientSecret", "test-secret");
builder.UseSetting("ClinicHub:RecheckMinutes", "0");
builder.UseSetting("ClinicHub:SendSeconds", "0");`},"tests/weekday":{file:"tests/LabFlow.Api.Tests/SlotCalculatorTests.cs",start:24,end:31,code:`public void Weekday_has_slots_from_open_to_last_full_slot_before_close()
{
    var slots = SlotCalculator.GetSlots(new DateOnly(2026, 9, 28), Hours, false, NoneBooked, LongAgo);

    Assert.Equal(54, slots.Count);   // 9 hours x 6 slots
    Assert.Equal(new TimeOnly(7, 0), slots[0].LocalTime);
    Assert.Equal(new TimeOnly(15, 50), slots[^1].LocalTime);
}`},"tests/decides":{file:"tests/LabFlow.Api.Tests/ConnectedTests.cs",start:262,end:273,code:`public async Task ClinicHub_decides_at_each_check()
{
    factory.TokenEndpoint = () => ConnectedFactory.Granted("frontdesk");
    var c = await factory.SignInAsync("9", "Sam Okafor", "harbourview", "frontdesk");
    Assert.Equal(HttpStatusCode.OK, (await c.GetAsync("/api/reception/patients?q=zz")).StatusCode);

    factory.TokenEndpoint = () => ConnectedFactory.Granted("results.view");
    Assert.Equal(HttpStatusCode.Forbidden, (await c.GetAsync("/api/reception/patients?q=zz")).StatusCode);

    factory.TokenEndpoint = null;
    Assert.Equal(HttpStatusCode.Unauthorized, (await c.GetAsync("/api/reception/patients?q=zz")).StatusCode);
}`},"sign-in/register":{file:"src/LabFlow.Api/Program.cs",start:30,end:36,code:`// Not connected, the demo sign-in exists only in Development; elsewhere every protected endpoint returns 401.
if (!connected)
{
    var auth = builder.Services.AddAuthentication(DemoAuthHandler.SchemeName);
    if (builder.Environment.IsDevelopment())
        auth.AddScheme<AuthenticationSchemeOptions, DemoAuthHandler>(DemoAuthHandler.SchemeName, null);
}`},"sign-in/demo":{file:"src/LabFlow.Api/Auth/DemoAuthHandler.cs",start:27,end:33,code:`var externalId = Request.Headers[Header].ToString();
if (string.IsNullOrEmpty(externalId))
    return AuthenticateResult.NoResult();

var user = await db.AppUsers.AsNoTracking()
    .SingleOrDefaultAsync(u => u.ExternalId == externalId && u.IsActive, Context.RequestAborted);
if (user is null)`},"sign-in/policies":{file:"src/LabFlow.Api/Program.cs",start:38,end:40,code:`builder.Services.AddAuthorizationBuilder()
    .AddPolicy(Policies.FrontDesk, p => p.RequireClaim(LabPermissions.ClaimType, LabPermissions.FrontDesk, LabPermissions.Admin))
    .AddPolicy(Policies.ResultsEntry, p => p.RequireClaim(LabPermissions.ClaimType, LabPermissions.ResultsEnter, LabPermissions.Admin));`},"sign-in/roles":{file:"src/LabFlow.Api/Auth/DemoAuthHandler.cs",start:82,end:89,code:`public static string[] ForRole(string role) => role switch
{
    "Admin" => All,
    "Reception" or "Collector" => [FrontDesk],
    "Technologist" or "Pathologist" => [ResultsView, ResultsEnter],
    "Practitioner" => [ResultsView],
    _ => [],
};`},"sign-in/settings":{file:"src/LabFlow.Api/Program.cs",start:89,end:93,code:`app.MapGet("/api/auth/settings", (IServiceProvider services) => new
{
    signIn = connected ? "clinichub" : "demo",
    perClinicDatabase = connected && services.GetRequiredService<LabDatabases>().PerClinic,
});`},"clinichub/oidc":{file:"src/LabFlow.Api/Auth/ClinicHubConnection.cs",start:242,end:254,code:`.AddOpenIdConnect(Scheme, "ClinicHub", o =>
{
    o.Authority = hub.Authority;
    o.ClientId = hub.ClientId;
    o.ClientSecret = hub.ClientSecret;
    o.RequireHttpsMetadata = hub.RequireHttpsMetadata;
    o.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    o.ResponseType = OpenIdConnectResponseType.Code;
    o.ResponseMode = OpenIdConnectResponseMode.Query;
    o.UsePkce = true;
    o.Scope.Clear();
    foreach (var s in new[] { "openid", "profile", "clinic", "offline_access" })
        o.Scope.Add(s);`},"clinichub/recheck":{file:"src/LabFlow.Api/Auth/ClinicHubConnection.cs",start:353,end:370,code:`var checkedAt = DateTimeOffset.FromUnixTimeSeconds(long.Parse(principal.FindFirstValue(ClinicHubClaims.CheckedAt) ?? "0")).UtcDateTime;
var permissions = principal.FindAll(LabPermissions.ClaimType).Select(c => c.Value).ToList();
if (DateTime.UtcNow - checkedAt >= TimeSpan.FromMinutes(options.RecheckMinutes))
{
    switch (await Refresh(ctx, options))
    {
        case RefreshResult.Refused:
        case RefreshResult.Unreachable when DateTime.UtcNow - checkedAt > TimeSpan.FromMinutes(options.OfflineGraceMinutes):
            await Reject(ctx);
            return;
        case RefreshResult.Ok(var granted):
            permissions = granted;
            checkedAt = DateTime.UtcNow;
            ctx.ShouldRenew = true;
            break;
    }
}
ctx.ReplacePrincipal(Principal(user, slug!, principal.FindFirstValue(ClinicHubClaims.ClinicName) ?? slug!, permissions, checkedAt));`},"clinichub/cookie":{file:"src/LabFlow.Api/Auth/ClinicHubConnection.cs",start:224,end:232,code:`o.Cookie.Name = "labflow.auth";
o.Cookie.HttpOnly = true;
// Lax: the browser arrives from ClinicHub's sign-in. Unsafe API calls must also carry X-LabFlow.
o.Cookie.SameSite = SameSiteMode.Lax;
o.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
o.ExpireTimeSpan = TimeSpan.FromHours(12);
o.SlidingExpiration = true;
o.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = 401; return Task.CompletedTask; };
o.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = 403; return Task.CompletedTask; };`},"clinichub/csrf":{file:"src/LabFlow.Api/Auth/ClinicHubConnection.cs",start:420,end:429,code:`public static IApplicationBuilder UseCsrfHeaderCheck(this IApplicationBuilder app) => app.Use(async (ctx, next) =>
{
    var unsafeMethod = !(HttpMethods.IsGet(ctx.Request.Method) || HttpMethods.IsHead(ctx.Request.Method) || HttpMethods.IsOptions(ctx.Request.Method));
    if (unsafeMethod && ctx.Request.Path.StartsWithSegments("/api") && !ctx.Request.Headers.ContainsKey(CsrfHeader))
    {
        ctx.Response.StatusCode = StatusCodes.Status400BadRequest;
        await ctx.Response.WriteAsJsonAsync(new { title = $"Missing {CsrfHeader} header." });
        return;
    }
    await next();`},"clinichub/local":{file:"src/LabFlow.Api/Auth/ClinicHubConnection.cs",start:301,end:306,code:`var externalId = $"clinichub:{sub}";
var user = await db.AppUsers.SingleOrDefaultAsync(u => u.ExternalId == externalId);
if (user is null)
    // ClinicHub keeps no e-mail address; sec.AppUser needs a unique one, so this placeholder never receives mail.
    db.AppUsers.Add(user = new AppUser { ExternalId = externalId, Email = $"clinichub-{sub}@users.invalid", IsActive = true });
user.DisplayName = hub.FindFirstValue("name") ?? hub.FindFirstValue("preferred_username") ?? externalId;`},"databases/connection":{file:"src/LabFlow.Api/Auth/ClinicHubConnection.cs",start:80,end:86,code:`public string ConnectionString(string? slug)
{
    if (!PerClinic)
        return config.GetConnectionString("LabFlow") ?? throw new InvalidOperationException("ConnectionStrings:LabFlow is not configured.");
    if (!IsValidSlug(slug))
        throw new NoClinicException();
    return options.Value.DatabasePattern!.Replace("{clinic}", slug);`},"databases/scoped":{file:"src/LabFlow.Api/Auth/ClinicHubConnection.cs",start:205,end:218,code:`// The request's database: the signed-in person's clinic, or for anonymous booking the clinic it names.
services.AddScoped(sp =>
{
    var databases = sp.GetRequiredService<LabDatabases>();
    var http = sp.GetRequiredService<IHttpContextAccessor>().HttpContext;
    // A person's session says "clinic"; ClinicHub's own service token says "clinic_slug"; public booking may name one.
    var slug = http?.User.FindFirstValue(ClinicHubClaims.Clinic) ?? http?.User.FindFirstValue("clinic_slug")
        ?? http?.Request.Headers[ClinicHubClaims.ClinicHeader].FirstOrDefault();
    if (databases.PerClinic && http?.User.Identity?.IsAuthenticated != true)
    {
        if (!LabDatabases.IsValidSlug(slug) || !databases.ExistsAsync(slug!).GetAwaiter().GetResult())
            throw new NoClinicException();
    }
    return LabDatabases.Create(databases.ConnectionString(slug));`},"databases/exists":{file:"src/LabFlow.Api/Auth/ClinicHubConnection.cs",start:96,end:97,code:`/// <summary>Anonymous booking may only reach a clinic database that has been built (no database is made for a stranger).</summary>
public async Task<bool> ExistsAsync(string slug)`},"databases/prepare":{file:"src/LabFlow.Api/Auth/ClinicHubConnection.cs",start:93,end:94,code:`public Task PrepareAsync(string slug) =>
    PerClinic ? _prepared.GetOrAdd(slug, s => new Lazy<Task>(() => BuildAsync(s))).Value : Task.CompletedTask;`},"databases/buildscripts":{file:"src/LabFlow.Api/Auth/ClinicHubConnection.cs",start:122,end:131,code:`await using (var check = new SqlCommand("SELECT COUNT(*) FROM sys.schemas WHERE name = 'lab'", db))
    if ((int)(await check.ExecuteScalarAsync())! == 1)
    {
        // Built before: only the upgrade scripts, which are safe to run again.
        await RunScriptsAsync(db, name, UpgradeScripts());
        return;
    }
// Schema, sequences and reference data. Not the database itself (made above), the synthetic patients, or the
// warehouse and legacy-test mapping, which belong to migrating the original lab's data, not to a new clinic.
await RunScriptsAsync(db, name, Scripts(f => !f.StartsWith("001_") && !f.Contains("_seed_demo") && !f.Contains("_etl_") && !f.Contains("_legacy_")));`},"databases/noclinic":{file:"src/LabFlow.Api/Program.cs",start:64,end:68,code:`catch (NoClinicException ex) when (!ctx.Response.HasStarted)
{
    ctx.Response.StatusCode = StatusCodes.Status400BadRequest;
    await ctx.Response.WriteAsJsonAsync(new { title = ex.Message });
}`},"restricted/filter":{file:"src/LabFlow.Api/Endpoints/ResultEndpoints.cs",start:46,end:54,code:`api.AddEndpointFilter(async (ctx, next) =>
{
    var http = ctx.HttpContext;
    if (!int.TryParse(http.Request.RouteValues["id"]?.ToString(), out var id))
        return await next(ctx);
    var label = await RestrictedLabelAsync(http.RequestServices.GetRequiredService<LabFlowDbContext>(), id, http.RequestAborted);
    return label is not null && !http.RequestServices.GetRequiredService<ConfidentialityGate>().IsOpen(http.User, $"requisition:{id}")
        ? ConfidentialityGate.Closed(label)
        : await next(ctx);`},"restricted/override":{file:"src/LabFlow.Api/Endpoints/ResultEndpoints.cs",start:32,end:41,code:`var label = await RestrictedLabelAsync(db, id, ct);
if (label is null)
    return Results.Ok(new { open = true });
if (!ConfidentialityGate.ReasonOk(body.Reason))
    return Results.BadRequest(new { title = $"Say why, in at least {ConfidentialityGate.MinReason} characters." });
var until = gate.Open(user, $"requisition:{id}");
audit.Log("RestrictedOverride", "Results", id, await db.Requisitions.Where(r => r.RequisitionId == id).Select(r => r.PatientId).SingleAsync(ct),
    new { label, reason = body.Reason!.Trim() });
await db.SaveChangesAsync(ct);
return Results.Ok(new { open = true, until });`},"restricted/gate":{file:"src/LabFlow.Api/Auth/ConfidentialityGate.cs",start:18,end:27,code:`private static string Key(ClaimsPrincipal user, string item) =>
    $"restricted|{user.FindFirstValue(ClinicHubClaims.Clinic)}|{user.FindFirstValue(ClaimTypes.NameIdentifier)}|{item}";

public bool IsOpen(ClaimsPrincipal user, string item) => cache.TryGetValue(Key(user, item), out _);

public DateTime Open(ClaimsPrincipal user, string item)
{
    var until = clock.GetUtcNow().UtcDateTime + Lasts;
    cache.Set(Key(user, item), true, new DateTimeOffset(until, TimeSpan.Zero));
    return until;`},"restricted/ui":{file:"web/src/components/RestrictedGate.tsx",start:22,end:30,code:`<label>Why do you need to open it?
  <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} maxLength={300} />
</label>
{error && <div className="alert" role="alert">{error}</div>}
<div className="actions">
  <button type="button" className="btn ghost" onClick={onCancel}>Not now</button>
  <button type="button" className="btn primary" disabled={busy || reason.trim().length < 10} onClick={submit}>{action}</button>
</div>
<p className="muted">At least 10 characters. The access lasts one hour.</p>`},"restricted/code":{file:"src/LabFlow.Api/Endpoints/OrderEndpoints.cs",start:197,end:203,code:`public static string? Confidentiality(JsonNode? resource)
{
    var codes = resource?["meta"]?["security"]?.AsArray().Where(c => (string?)c?["system"] == ConfidentialitySystem)
        .Select(c => (string?)c!["code"]).Where(c => !string.IsNullOrEmpty(c)).ToList() ?? [];
    if (codes.Count == 0 || codes.All(c => c is "U" or "L" or "M" or "N"))
        return null;
    return codes.Contains("V") ? "V" : "R";`},"audit/log":{file:"src/LabFlow.Api/Auth/AuditLogger.cs",start:13,end:28,code:`public void Log(string action, string entityType, object? entityId, int? patientId, object? details = null)
{
    var ctx = http.HttpContext;
    db.AccessLogs.Add(new AccessLog
    {
        OccurredAt = DateTime.UtcNow,
        UserId = ctx?.User.UserId(),
        Action = action,
        EntityType = entityType,
        EntityId = entityId?.ToString(),
        PatientId = patientId,
        Details = details is null ? null : JsonSerializer.Serialize(details),
        IpAddress = ctx?.Connection.RemoteIpAddress?.ToString(),
        // W3C trace id is 32 hex chars, the same shape as a Guid in "N" format
        CorrelationId = Activity.Current is { } a ? Guid.ParseExact(a.TraceId.ToHexString(), "N") : null,
    });`},"audit/use":{file:"src/LabFlow.Api/Endpoints/BookingEndpoints.cs",start:154,end:156,code:`audit.Log("Create", "Appointment", appointment.AppointmentId, patient.PatientId, new { channel = "Web" });
await db.SaveChangesAsync(ct);
await tx.CommitAsync(ct);`},"audit/trigger":{file:"database/010_schema.sql",start:520,end:523,code:`CREATE TRIGGER audit.TR_AccessLog_AppendOnly ON audit.AccessLog
INSTEAD OF UPDATE, DELETE
AS
    THROW 50001, 'audit.AccessLog is append-only.', 1;`},"audit/daysheet":{file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",start:57,end:58,code:`audit.Log("View", "AppointmentDaySheet", $"{locationId}:{date:yyyy-MM-dd}", null, new { count = rows.Count });
await db.SaveChangesAsync(ct);`},"audit/action":{file:"database/056_audit_restricted_override.sql",start:4,end:9,code:`IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_AccessLog_Action' AND definition LIKE N'%RestrictedOverride%')
BEGIN
    ALTER TABLE audit.AccessLog DROP CONSTRAINT CK_AccessLog_Action;
    ALTER TABLE audit.AccessLog ADD CONSTRAINT CK_AccessLog_Action CHECK (Action IN
        ('View','Create','Update','Delete','Print','Export','Email','Login','LoginFailed','AiGenerate','RestrictedOverride'));
END`},"slots/slots":{file:"src/LabFlow.Api/Domain/SlotCalculator.cs",start:27,end:44,code:`foreach (var h in hours.Where(h => h.DayOfWeek == (byte)date.DayOfWeek).OrderBy(h => h.OpenTime))
{
    var step = TimeSpan.FromMinutes(h.SlotMinutes);
    for (var t = h.OpenTime; t.Add(step) <= h.CloseTime && t >= h.OpenTime; t = t.Add(step))
    {
        var local = date.ToDateTime(t, DateTimeKind.Unspecified);
        if (zone.IsInvalidTime(local)) continue;   // skipped hour when clocks go forward

        var startUtc = TimeZoneInfo.ConvertTimeToUtc(local, zone);
        if (startUtc <= nowUtc) continue;

        var booked = bookedByStartUtc.GetValueOrDefault(startUtc);
        var remaining = h.CapacityPerSlot - booked;
        if (remaining > 0)
            slots.Add(new Slot(startUtc, startUtc.Add(step), t, remaining));
    }
}
return slots;`},"slots/day":{file:"src/LabFlow.Api/Domain/SlotCalculator.cs",start:53,end:56,code:`/// <summary>UTC range covering one local calendar day.</summary>
public static (DateTime FromUtc, DateTime ToUtc) DayRangeUtc(DateOnly date) =>
    (TimeZoneInfo.ConvertTimeToUtc(date.ToDateTime(TimeOnly.MinValue), Toronto),
     TimeZoneInfo.ConvertTimeToUtc(date.AddDays(1).ToDateTime(TimeOnly.MinValue), Toronto));`},"slots/booked":{file:"src/LabFlow.Api/Endpoints/BookingEndpoints.cs",start:71,end:76,code:`var booked = await db.Appointments
    .Where(a => a.LocationId == locationId && a.StartUtc >= fromUtc && a.StartUtc < toUtc
                && a.Status != AppointmentStatus.Cancelled)
    .GroupBy(a => a.StartUtc)
    .Select(g => new { g.Key, Count = g.Count() })
    .ToDictionaryAsync(x => x.Key, x => x.Count, ct);`},"booking/lock":{file:"src/LabFlow.Api/Endpoints/BookingEndpoints.cs",start:97,end:103,code:`// Serialize bookings for this slot so two people can't take the last place.
var lockName = $"slot:{req.LocationId}:{startUtc:O}";
await db.Database.ExecuteSqlAsync($"""
    DECLARE @r int;
    EXEC @r = sp_getapplock @Resource = {lockName}, @LockMode = 'Exclusive', @LockOwner = 'Transaction', @LockTimeout = 5000;
    IF @r < 0 THROW 50002, 'Could not lock the booking slot.', 1;
    """, ct);`},"booking/rate":{file:"src/LabFlow.Api/Program.cs",start:45,end:47,code:`o.AddPolicy(BookingEndpoints.BookingRateLimit, ctx => RateLimitPartition.GetFixedWindowLimiter(
    ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
    _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1) }));`},"booking/match":{file:"src/LabFlow.Api/Endpoints/BookingEndpoints.cs",start:174,end:183,code:`if (d.NormalizedHealthCard is { } hcn)
{
    var existing = await db.Patients.SingleOrDefaultAsync(p => p.HealthCardNumber == hcn, ct);
    if (existing is not null)
    {
        var matches = existing.DateOfBirth == d.DateOfBirth
                      && string.Equals(existing.LastName.Trim(), d.LastName.Trim(), StringComparison.OrdinalIgnoreCase);
        return matches
            ? (existing, null)
            : (existing, Results.UnprocessableEntity(new { error = "The health card details don't match our records. Please call the location to book." }));`},"booking/email":{file:"src/LabFlow.Api/Endpoints/BookingEndpoints.cs",start:134,end:138,code:`// Confirmation goes to the address on file, never to one typed by an anonymous caller
// for an existing patient - otherwise anyone with a health card number could redirect
// someone else's notifications.
string? sentTo = null;
if (patient.ConsentEmailNotification && !string.IsNullOrEmpty(patient.Email))`},"reception/duplicate":{file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",start:225,end:229,code:`// Ordering a panel and one of its members is a duplicate order.
var orderedIds = tests.Select(t => t.TestId).ToHashSet();
foreach (var panel in tests.Where(t => t.Members.Count > 0))
    foreach (var dup in panel.Members.Where(m => orderedIds.Contains(m.MemberTestId)))
        v.Add("testIds", $"{dup.Member.NameEn} is already part of {panel.NameEn}.");`},"reception/sex":{file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",start:222,end:223,code:`foreach (var t in tests.Where(t => t.ApplicableSex is not null && patient.Sex != t.ApplicableSex))
    v.Add("testIds", $"{t.NameEn} only applies to sex {t.ApplicableSex}.");`},"reception/selfpay":{file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",start:231,end:234,code:`// Without an Ontario health card everything is self-pay, so every test needs a price.
var hasOhip = patient?.HealthCardNumber is not null && patient.HealthCardProvince == "ON";
if (!hasOhip)
    foreach (var t in tests.Where(t => t.UninsuredPrice is null))`},"reception/invoice":{file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",start:271,end:280,code:`var patientPays = requisition.Items.Sum(i => i.Price ?? 0);
if (patientPays > 0)
    db.Invoices.Add(new Invoice
    {
        RequisitionId = requisition.RequisitionId,
        PatientId = requisition.PatientId,
        Subtotal = patientPays,
        Tax = 0,   // HST treatment of uninsured lab services still to be confirmed
        Status = "Open",
        CreatedAt = now,`},"reception/tubes":{file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",start:304,end:306,code:`// Tubes to draw: specimen types of the ordered tests and of panel members.
var tubes = r.Items
    .SelectMany(i => i.Test.Members.Select(m => m.Member.SpecimenTypeCode).Append(i.Test.SpecimenTypeCode))`},"reception/search":{file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",start:84,end:88,code:`query = hcn.Length == 10 && hcn.All(char.IsAsciiDigit)
    ? query.Where(p => p.HealthCardNumber == hcn)
    : q.StartsWith("LF", StringComparison.OrdinalIgnoreCase)
        ? query.Where(p => p.Mrn == q.ToUpperInvariant())
        : NameSearch(query, q);`},"results/range":{file:"src/LabFlow.Api/Endpoints/ResultEndpoints.cs",start:131,end:133,code:`// The most specific range for the patient's sex and age.
var range = ranges.Where(r => r.TestId == test.TestId && (r.Sex == requisition.Patient.Sex || r.Sex == "U") && ageDays >= r.AgeFromDays && ageDays <= r.AgeToDays)
    .OrderBy(r => r.Sex == "U").FirstOrDefault();`},"results/copy":{file:"src/LabFlow.Api/Endpoints/ResultEndpoints.cs",start:141,end:144,code:`result.RefLow = range?.Low;
result.RefHigh = range?.High;
result.RefText = range?.DisplayText ?? (range is { Low: { } lo, High: { } hi } ? $"{lo:0.###} - {hi:0.###}" : null);
result.AbnormalFlag = number is { } v && range is not null ? Flag(v, range) : null;`},"results/flag":{file:"src/LabFlow.Api/Endpoints/ResultEndpoints.cs",start:207,end:213,code:`/// <summary>HL7 table 0078 flag from the copied range.</summary>
public static string Flag(decimal value, ReferenceRange range) =>
    range.CriticalLow is { } cl && value < cl ? "LL"
    : range.CriticalHigh is { } ch && value > ch ? "HH"
    : range.Low is { } lo && value < lo ? "L"
    : range.High is { } hi && value > hi ? "H"
    : "N";`},"results/correction":{file:"src/LabFlow.Api/Endpoints/ResultEndpoints.cs",start:136,end:137,code:`else if (result.Status is "Final" or "Corrected")
    result.VerifiedAt = null;   // a correction after release: verified again when re-released`},"results/version":{file:"src/LabFlow.Api/Endpoints/ResultEndpoints.cs",start:176,end:187,code:`var version = (short)((await db.Reports.Where(r => r.RequisitionId == id).MaxAsync(r => (short?)r.Version, ct) ?? 0) + 1);
foreach (var r in pending)
{
    r.Status = version == 1 ? "Final" : "Corrected";
    r.VerifiedAt = now;
    r.VerifiedByUserId = user.UserId();
}
foreach (var item in requisition.Items.Where(i => i.Status != "Cancelled"))
    item.Status = "Verified";
requisition.Status = "Final";
requisition.UpdatedAt = now;
db.Reports.Add(new LabReport { RequisitionId = id, Version = version, Status = version == 1 ? "Final" : "Amended", IssuedAt = now, IssuedByUserId = user.UserId() });`},"orders-in/dispatch":{file:"src/LabFlow.Api/Endpoints/OrderEndpoints.cs",start:44,end:53,code:`if ((string?)bundle?["resourceType"] != "Bundle" || (string?)bundle["type"] != "transaction")
    return Outcome("Expected a FHIR transaction Bundle.");
var entries = bundle["entry"]?.AsArray().Select(e => e?["resource"]).ToList() ?? [];
if (entries is [{ } only] && (string?)only["resourceType"] == "Patient" && only["link"] is not null)
    return await MergeAsync(db, audit, slug, only, ct);
var revoked = entries.Where(r => (string?)r?["resourceType"] == "ServiceRequest" && (string?)r?["status"] == "revoked").ToList();
if (revoked.Count > 0)
    return revoked.Count == entries.Count
        ? await CancelAsync(db, audit, slug, revoked!, ct)
        : Outcome("A Bundle that withdraws orders carries only the revoked ServiceRequests.");`},"orders-in/codes":{file:"src/LabFlow.Api/Endpoints/OrderEndpoints.cs",start:61,end:75,code:`// Tests: LOINC where the catalog has it, LabFlow's own code for panels.
var tests = await db.Tests.AsNoTracking().Where(t => t.IsActive && t.IsOrderable).ToListAsync(ct);
var wanted = new List<(Test Test, string ExternalId)>();
foreach (var sr in requests)
{
    var coding = sr!["code"]?["coding"]?.AsArray().Select(c => c!).ToList() ?? [];
    var test = coding.Select(c => (string?)c["system"] switch
    {
        Loinc => tests.FirstOrDefault(t => t.LoincCode == (string?)c["code"]),
        LabFlowTestCode => tests.FirstOrDefault(t => t.Code == (string?)c["code"]),
        _ => null,
    }).FirstOrDefault(t => t is not null);
    if (test is null)
        return Outcome($"LabFlow can't perform '{(string?)coding.FirstOrDefault()?["display"] ?? (string?)coding.FirstOrDefault()?["code"] ?? "?"}'. Codes use {Loinc} or {LabFlowTestCode}.");
    wanted.Add((test, (string?)sr["identifier"]?[0]?["value"] ?? ""));`},"orders-in/prepare":{file:"src/LabFlow.Api/Endpoints/OrderEndpoints.cs",start:38,end:39,code:`// The first order for a clinic can come before any of its staff has signed in here.
await databases.PrepareAsync(slug);`},"orders-in/existing":{file:"src/LabFlow.Api/Endpoints/OrderEndpoints.cs",start:78,end:82,code:`var existing = await db.ElectronicOrders.AsNoTracking().SingleOrDefaultAsync(o => o.SourceClinic == slug && o.ExternalId == requisition, ct);
int patientId, practitionerId, orderId;
if (existing is not null)
    // Sent again (ClinicHub retried after a lost answer): accepted once.
    (patientId, practitionerId, orderId) = (existing.PatientId, existing.PractitionerId, existing.ElectronicOrderId);`},"cancel/again":{file:"src/LabFlow.Api/Endpoints/OrderEndpoints.cs",start:254,end:255,code:`if (item.CancelledAt is not null)
    continue;   // sent again: already withdrawn`},"cancel/rule":{file:"src/LabFlow.Api/Endpoints/OrderEndpoints.cs",start:258,end:262,code:`var line = await db.RequisitionItems.SingleOrDefaultAsync(i => i.RequisitionId == requisitionId && i.TestId == item.TestId, ct);
if (line is not null && line.Status != "Cancelled"
    && (line.Status is not ("Ordered" or "Collected") || await db.Results.AnyAsync(r => r.RequisitionItemId == line.RequisitionItemId, ct)))
    return Outcome($"Results have been entered for {(await db.Tests.SingleAsync(t => t.TestId == item.TestId, ct)).NameEn}; call the lab to cancel.",
        StatusCodes.Status409Conflict, "business-rule");`},"cancel/column":{file:"database/052_order_cancellation.sql",start:6,end:9,code:`IF COL_LENGTH(N'lab.ElectronicOrderItem', N'CancelledAt') IS NULL
ALTER TABLE lab.ElectronicOrderItem ADD
    CancelledAt  datetime2(0)  NULL,
    CancelReason nvarchar(200) NULL;`},"cancel/apply":{file:"src/LabFlow.Api/Endpoints/OrderEndpoints.cs",start:267,end:285,code:`foreach (var (order, item, reason) in done)
{
    item.CancelledAt = now;
    item.CancelReason = reason ?? "Cancelled by the ordering clinic";
    if (order.RequisitionId is { } requisitionId)
    {
        var requisition = await db.Requisitions.Include(r => r.Items).SingleAsync(r => r.RequisitionId == requisitionId, ct);
        var line = requisition.Items.SingleOrDefault(i => i.TestId == item.TestId);
        if (line is not null)
        {
            line.Status = "Cancelled";
            line.CancelReason = item.CancelReason;
        }
        if (requisition.Items.All(i => i.Status == "Cancelled"))
            requisition.Status = "Cancelled";
        requisition.UpdatedAt = now;
    }
    else if (order.Items.All(i => i.CancelledAt is not null))
        order.Status = "Cancelled";`},"results-out/queue":{file:"src/LabFlow.Api/Endpoints/ResultEndpoints.cs",start:189,end:196,code:`// Ordered from ClinicHub: the results go back to it, one DiagnosticReport per ordered test.
var order = await db.ElectronicOrders.Include(o => o.Items).SingleOrDefaultAsync(o => o.RequisitionId == id, ct);
if (order is not null)
    db.OutboundMessages.Add(new OutboundMessage
    {
        Destination = "ClinicHub", Kind = "DiagnosticReport", RequisitionId = id, CreatedAt = now,
        PayloadJson = ResultBundle(requisition, order, results, version == 1 ? "final" : "amended", now).ToJsonString(),
    });`},"results-out/basedon":{file:"src/LabFlow.Api/Endpoints/ResultEndpoints.cs",start:310,end:312,code:`["basedOn"] = new JsonArray(new JsonObject
{
    ["identifier"] = new JsonObject { ["system"] = $"urn:clinichub:{order.SourceClinic}:service-request", ["value"] = ordered.ExternalId },`},"results-out/label":{file:"src/LabFlow.Api/Endpoints/ResultEndpoints.cs",start:304,end:307,code:`// The order's confidentiality label comes back on its results (IntegrationHub's flow 7).
["meta"] = order.Confidentiality is { } label ? new JsonObject
{
    ["security"] = new JsonArray(new JsonObject { ["system"] = OrderEndpoints.ConfidentialitySystem, ["code"] = label }),`},"results-out/due":{file:"src/LabFlow.Api/Auth/ResultSender.cs",start:58,end:59,code:`due = await db.OutboundMessages.Where(m => m.SentAt == null && m.Attempts < MaxAttempts && (m.NextAttemptAt == null || m.NextAttemptAt <= now))
    .OrderBy(m => m.OutboundMessageId).Take(20).ToListAsync(ct);`},"results-out/retry":{file:"src/LabFlow.Api/Auth/ResultSender.cs",start:85,end:87,code:`m.NextAttemptAt = now.AddSeconds(Math.Min(10 * Math.Pow(2, m.Attempts - 1), 1800));
if (ex.Message.StartsWith("401"))
    _token = null;`},"results-out/finance":{file:"src/LabFlow.Api/Auth/FinanceSender.cs",start:12,end:20,code:`/// The lab's money to FinancePowerApp, the group's accounting, as financial documents built from the billing tables
/// (each with an id that never changes, marked in billing.FinanceExport once accepted). No health information leaves:
/// no patient, no test names; patients are one party and invoices go by number.
///
/// <list type="bullet">
/// <item>A patient invoice for uninsured tests: owed by "Patients", Lab.Uninsured (exempt: a health care service). Paid
/// online: a receipt by card. Voided or refunded: reversed.</item>
/// <item>A finished requisition's insured tests, where ref.Test has its OHIP fee: owed by OHIP, Lab.OHIP.</item>
/// </list>`},"fe-app/who":{file:"web/src/App.tsx",start:26,end:33,code:`// Connected, ClinicHub's permissions decide; with the demo menu, the seeded user's role.
const isStaff = connected
  ? !!me?.permissions.some(p => p === 'frontdesk' || p === 'admin')
  : !!role && FRONT_DESK.includes(role)
const signInError = new URLSearchParams(window.location.search).get('signInError')
const canResult = connected
  ? !!me?.permissions.some(p => p === 'results.enter' || p === 'admin')
  : !!role && ['Technologist', 'Pathologist', 'Admin'].includes(role)`},"fe-app/topbar":{file:"web/src/App.tsx",start:53,end:60,code:`{connected && (me?.userId
  ? (
    <div className="user-switch">
      <span>{me.name} · {me.clinic}</span>
      <a href="/api/auth/sso/signout">Sign out</a>
    </div>
  )
  : <a className="user-switch" href={\`/api/auth/sso/start?returnUrl=\${encodeURIComponent('/reception')}\`}>Staff sign-in with ClinicHub</a>)}`},"fe-app/headers":{file:"web/src/api.ts",start:112,end:118,code:`// X-LabFlow: required on changes when signed in with a cookie (connected to ClinicHub); harmless otherwise.
const headers: Record<string, string> = { 'X-LabFlow': '1' }
const user = getDemoUser()
if (user) headers['X-Demo-User'] = user
const clinic = bookingClinic()
if (clinic) headers['X-LabFlow-Clinic'] = clinic
if (body !== undefined) headers['Content-Type'] = 'application/json'`},"fe-app/clinic":{file:"web/src/api.ts",start:81,end:89,code:`export function bookingClinic(): string {
  const fromLink = new URLSearchParams(window.location.search).get('clinic')
  try {
    if (fromLink) sessionStorage.setItem(CLINIC_KEY, fromLink)
    return fromLink ?? sessionStorage.getItem(CLINIC_KEY) ?? ''
  } catch {
    return fromLink ?? ''
  }
}`},"fe-app/restricted":{file:"web/src/api.ts",start:99,end:99,code:"export const isRestricted = (e: unknown): e is ApiError => e instanceof ApiError && e.status === 403 && e.data.code === 'restricted'"},"scripts/conventions":{file:"database/010_schema.sql",start:3,end:9,code:`-- Conventions
--   * All timestamps are UTC (datetime2). The app converts to America/Toronto for display.
--   * Text is nvarchar (English + French).
--   * Money is decimal, never float.
--   * No passwords are stored: authentication is external (ASP.NET Core Identity / Entra ID),
--     sec.AppUser only maps the external subject to a role.
--   * FHIR resource each table corresponds to is noted in its header comment.`},"scripts/upgrades":{file:"src/LabFlow.Api/Auth/ClinicHubConnection.cs",start:135,end:138,code:`/// Scripts from 050 on change existing databases and are written to be run again safely (IF OBJECT_ID … IS NULL).
/// deploy.ps1 runs them on a new database like any other; LabFlow runs them on start-up for a database built before.
/// </summary>
public static IEnumerable<string> UpgradeScripts() => Scripts(f => string.CompareOrdinal(f, "050") >= 0);`},"scripts/guard":{file:"database/054_analytics_dw_view.sql",start:6,end:7,code:`IF OBJECT_ID(N'dw.FactLabResult', N'U') IS NOT NULL
EXEC (N'CREATE OR ALTER VIEW dw.vw_AnalyticsMonthly AS`},"scripts/temporal":{file:"database/010_schema.sql",start:176,end:179,code:`ValidFrom                 datetime2(0)  GENERATED ALWAYS AS ROW START HIDDEN NOT NULL,
ValidTo                   datetime2(0)  GENERATED ALWAYS AS ROW END   HIDDEN NOT NULL,
PERIOD FOR SYSTEM_TIME (ValidFrom, ValidTo),
CONSTRAINT CK_Patient_HealthCard CHECK (HealthCardNumber IS NULL OR HealthCardNumber NOT LIKE '%[^0-9]%'),`},"scripts/index":{file:"database/051_outbound_messages.sql",start:20,end:21,code:`IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_OutboundMessage_Pending')
CREATE INDEX IX_OutboundMessage_Pending ON lab.OutboundMessage (NextAttemptAt) WHERE SentAt IS NULL;`},"data-catalog/checks":{file:"database/010_schema.sql",start:88,end:90,code:`CONSTRAINT CK_Test_Loinc CHECK (LoincCode IS NULL OR (LoincCode LIKE '%[0-9]-[0-9]' AND LoincCode NOT LIKE '%[^0-9-]%')),
CONSTRAINT CK_Test_NumericUnit CHECK (ResultType <> 'Numeric' OR UnitCode IS NOT NULL),
CONSTRAINT CK_Test_UninsuredPrice CHECK (IsOhipInsured = 1 OR UninsuredPrice IS NOT NULL)`},"data-catalog/panels":{file:"database/020_seed_reference.sql",start:77,end:83,code:`INSERT ref.PanelMember (PanelTestId, MemberTestId, SortOrder)
SELECT p.TestId, m.TestId, v.SortOrder
FROM (VALUES ('LIPID','CHOL',1), ('LIPID','TRIG',2), ('LIPID','HDL',3), ('LIPID','LDLC',4),
             ('LYTES','NA',1),   ('LYTES','K',2),
             ('CBC','WBC',1),    ('CBC','HGB',2),    ('CBC','PLT',3)) v(Panel, Member, SortOrder)
JOIN ref.Test p ON p.Code = v.Panel
JOIN ref.Test m ON m.Code = v.Member;`},"data-people/hcn":{file:"database/010_schema.sql",start:184,end:184,code:"CREATE UNIQUE INDEX UX_Patient_HealthCard ON core.Patient (HealthCardNumber) WHERE HealthCardNumber IS NOT NULL;"},"data-people/applink":{file:"database/010_schema.sql",start:226,end:227,code:`CONSTRAINT CK_AppUser_PatientLink      CHECK (Role <> 'Patient'      OR PatientId IS NOT NULL),
CONSTRAINT CK_AppUser_PractitionerLink CHECK (Role <> 'Practitioner' OR PractitionerId IS NOT NULL)`},"data-people/luhn":{file:"src/LabFlow.Api/Domain/HealthCard.cs",start:16,end:32,code:`public static bool IsValidNumber(string? number)
{
    if (number is null || number.Length != 10 || !number.All(char.IsAsciiDigit))
        return false;

    var sum = 0;
    for (var i = 0; i < 10; i++)
    {
        var digit = number[9 - i] - '0';
        if (i % 2 == 1)
        {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
    }
    return sum % 10 == 0;`},"data-lab/review":{file:"database/010_schema.sql",start:414,end:415,code:`CONSTRAINT CK_ResultInterpretation_Review CHECK (Status NOT IN ('Approved','Rejected')
                                                 OR (ReviewedByUserId IS NOT NULL AND ReviewedAt IS NOT NULL))`},"data-lab/total":{file:"database/010_schema.sql",start:489,end:489,code:"Total            AS (Subtotal + Tax) PERSISTED,"},"etl/package":{file:"etl/builder/BuildPackage.cs",start:1,end:11,code:`// Builds etl/LabFlowETL/LabFlowETL.dtsx with the SSIS object model (SQL Server
// 2019 / v15), so the package is reproducible from source and reviewable as
// code. The generated .dtsx opens in Visual Studio's SSIS designer like any
// hand-drawn package.
//
//   Settings: User::LegacyServer/LegacyDatabase/LabFlowServer/LabFlowDatabase/LookbackVisits
//   Control flow:  SQL Start run -> DFT Extract legacy -> SQL Transform and load
//                  (OnError: SQL Fail run)
//   Data flow:     four independent paths, legacy -> etl.stg_*
//                    Tests / Payers:  OLE DB Source -> Data Conversion (code page 1256 -> Unicode) -> OLE DB Destination
//                    Visits / Results: OLE DB Source (de-identifying query from a variable) -> Row Count -> OLE DB Destination`},"etl/load":{file:"database/040_etl_dw.sql",start:320,end:323,code:`DECLARE @shift int = (SELECT CAST(Value AS int) FROM etl.Secret WHERE Name = 'DateShiftDays');
IF @shift IS NULL THROW 50101, 'etl.Secret has no DateShiftDays; run etl.usp_StartRun first.', 1;

BEGIN TRAN;`},"etl/secret":{file:"database/040_etl_dw.sql",start:241,end:247,code:`IF NOT EXISTS (SELECT 1 FROM etl.Secret WHERE Name = 'PatientHashSalt')
    INSERT etl.Secret (Name, Value) VALUES ('PatientHashSalt', CONVERT(varchar(64), CRYPT_GEN_RANDOM(32), 2));
IF NOT EXISTS (SELECT 1 FROM etl.Secret WHERE Name = 'DateShiftDays')
    -- a nonzero shift between -180 and +180 days
    INSERT etl.Secret (Name, Value)
    VALUES ('DateShiftDays', CAST((ABS(CHECKSUM(CRYPT_GEN_RANDOM(4))) % 180 + 1)
                                  * CASE WHEN ABS(CHECKSUM(NEWID())) % 2 = 0 THEN 1 ELSE -1 END AS varchar(10)));`},"etl/jalali":{file:"database/040_etl_dw.sql",start:195,end:200,code:`CREATE FUNCTION etl.fn_JalaliToGregorian (@j varchar(10))
RETURNS date
WITH SCHEMABINDING
AS
BEGIN
    IF @j IS NULL OR @j NOT LIKE '[0-9][0-9][0-9][0-9]/[0-1][0-9]/[0-3][0-9]' RETURN NULL;`},"dw/view":{file:"database/054_analytics_dw_view.sql",start:7,end:21,code:`EXEC (N'CREATE OR ALTER VIEW dw.vw_AnalyticsMonthly AS
SELECT
    d.[Year] AS [Year], d.[Month] AS [Month],                -- the visit''s month, after the warehouse''s date shift
    f.TestKey, p.PayerType,
    COUNT(*)                                       AS Results,
    COUNT(DISTINCT f.LegacyVisitNo)                AS Visits,
    SUM(CAST(f.HasAnswer AS int))                  AS Answered,
    SUM(CAST(f.IsAbnormal AS int))                 AS Abnormal,
    SUM(CAST(f.IsCritical AS int))                 AS Critical,
    SUM(CAST(f.TurnaroundDays AS int))             AS TurnaroundDaysSum,
    COUNT(f.TurnaroundDays)                        AS TurnaroundCount
FROM dw.FactLabResult f
JOIN dw.DimDate d ON d.DateKey = f.VisitDateKey
JOIN dw.DimPayer p ON p.PayerKey = f.PayerKey
GROUP BY d.[Year], d.[Month], f.TestKey, p.PayerType');`},"dw/grant":{file:"database/tools/analytics_dw_reader.sql",start:20,end:21,code:`GRANT SELECT ON dw.vw_AnalyticsMonthly TO analytics_dw_reader;
GRANT SELECT ON dw.DimTest (TestKey, LoincCode, LabFlowCode, TestName, Section, IsPanel) TO analytics_dw_reader;`},"dw/merge":{file:"database/040_etl_dw.sql",start:478,end:484,code:`    OR ISNULL(f.ValueSi, -1) <> ISNULL(s.ValueSi, -1) OR f.IsAbnormal <> s.IsAbnormal OR f.IsCritical <> s.IsCritical
    OR ISNULL(f.ResultDateKey, 0) <> ISNULL(s.ResultDateKey, 0) OR f.PayerKey <> s.PayerKey)
THEN UPDATE SET
    TestKey = s.TestKey, PanelTestKey = s.PanelTestKey, PatientKey = s.PatientKey, PayerKey = s.PayerKey,
    VisitDateKey = s.VisitDateKey, ResultDateKey = s.ResultDateKey, AgeYears = s.AgeYears, AgeBand = s.AgeBand,
    HasAnswer = s.HasAnswer, ValueText = s.ValueText, ValueNumeric = s.ValueNumeric, ValueSi = s.ValueSi,
    IsAbnormal = s.IsAbnormal, IsCritical = s.IsCritical, TurnaroundDays = s.TurnaroundDays, UpdatedRunId = @RunId`}},s=[{area:"Booking",method:"GET",path:"/api/locations",access:"public",file:"src/LabFlow.Api/Endpoints/BookingEndpoints.cs",line:31},{area:"Booking",method:"GET",path:"/api/tests",access:"public",file:"src/LabFlow.Api/Endpoints/BookingEndpoints.cs",line:38},{area:"Booking",method:"GET",path:"/api/locations/{locationId}/slots",access:"public",file:"src/LabFlow.Api/Endpoints/BookingEndpoints.cs",line:52},{area:"Booking",method:"POST",path:"/api/appointments",access:"public",handler:"BookAsync",file:"src/LabFlow.Api/Endpoints/BookingEndpoints.cs",line:60},{area:"Order",method:"POST",path:"/fhir",access:"clinichub.orders",file:"src/LabFlow.Api/Endpoints/OrderEndpoints.cs",line:35},{area:"Reception",method:"GET",path:"/api/reception/electronic-orders",access:"FrontDesk",file:"src/LabFlow.Api/Endpoints/OrderEndpoints.cs",line:126},{area:"Reception",method:"POST",path:"/api/reception/electronic-orders/{id:int}/override",access:"FrontDesk",file:"src/LabFlow.Api/Endpoints/OrderEndpoints.cs",line:144},{area:"Reception",method:"POST",path:"/api/reception/electronic-orders/{id:int}/requisition",access:"FrontDesk",file:"src/LabFlow.Api/Endpoints/OrderEndpoints.cs",line:159},{area:"Reception",method:"GET",path:"/api/reception/appointments",access:"FrontDesk",file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",line:41},{area:"Reception",method:"POST",path:"/api/reception/appointments/{id:int}/check-in",access:"FrontDesk",file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",line:66},{area:"Reception",method:"POST",path:"/api/reception/appointments/{id:int}/no-show",access:"FrontDesk",file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",line:69},{area:"Reception",method:"POST",path:"/api/reception/appointments/{id:int}/cancel",access:"FrontDesk",file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",line:72},{area:"Reception",method:"GET",path:"/api/reception/patients",access:"FrontDesk",file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",line:77},{area:"Reception",method:"GET",path:"/api/reception/patients/{id:int}",access:"FrontDesk",file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",line:98},{area:"Reception",method:"POST",path:"/api/reception/patients",access:"FrontDesk",file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",line:107},{area:"Reception",method:"GET",path:"/api/reception/practitioners",access:"FrontDesk",file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",line:124},{area:"Reception",method:"POST",path:"/api/reception/requisitions",access:"FrontDesk",handler:"CreateRequisitionAsync",file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",line:137},{area:"Reception",method:"GET",path:"/api/reception/requisitions/{id:int}",access:"FrontDesk",file:"src/LabFlow.Api/Endpoints/ReceptionEndpoints.cs",line:139},{area:"Result",method:"POST",path:"/api/lab/requisitions/{id:int}/override",access:"ResultsEntry",file:"src/LabFlow.Api/Endpoints/ResultEndpoints.cs",line:30},{area:"Results",method:"GET",path:"/api/lab/worklist",access:"ResultsEntry",file:"src/LabFlow.Api/Endpoints/ResultEndpoints.cs",line:58},{area:"Results",method:"GET",path:"/api/lab/requisitions/{id:int}",access:"ResultsEntry",file:"src/LabFlow.Api/Endpoints/ResultEndpoints.cs",line:79},{area:"Results",method:"PUT",path:"/api/lab/requisitions/{id:int}/results",access:"ResultsEntry",file:"src/LabFlow.Api/Endpoints/ResultEndpoints.cs",line:89},{area:"Results",method:"POST",path:"/api/lab/requisitions/{id:int}/release",access:"ResultsEntry",file:"src/LabFlow.Api/Endpoints/ResultEndpoints.cs",line:160},{area:"Program",method:"GET",path:"/api/me",access:"public",file:"src/LabFlow.Api/Program.cs",line:79},{area:"Program",method:"GET",path:"/api/auth/settings",access:"public",file:"src/LabFlow.Api/Program.cs",line:89},{area:"Program",method:"GET",path:"/api/auth/sso/start",access:"public",file:"src/LabFlow.Api/Program.cs",line:97},{area:"Program",method:"GET",path:"/api/auth/sso/signout",access:"public",file:"src/LabFlow.Api/Program.cs",line:101},{area:"Program",method:"GET",path:"/api/dev/users",access:"public",file:"src/LabFlow.Api/Program.cs",line:108}],l=[{database:"LabFlow",schema:"ref",table:"Department",file:"database/010_schema.sql",line:39,columns:[{name:"DepartmentId",type:"SMALLINT",nullable:!1,notes:["PK","identity"]},{name:"Code",type:"VARCHAR(10)",nullable:!1,notes:["unique"]},{name:"NameEn",type:"NVARCHAR(100)",nullable:!1,notes:[]},{name:"NameFr",type:"NVARCHAR(100)",nullable:!0,notes:[]},{name:"SortOrder",type:"SMALLINT",nullable:!1,notes:["default 0"]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]}],denies:[]},{database:"LabFlow",schema:"ref",table:"Unit",file:"database/010_schema.sql",line:49,columns:[{name:"UnitCode",type:"VARCHAR(20)",nullable:!1,notes:["PK"]},{name:"Display",type:"NVARCHAR(20)",nullable:!1,notes:[]}],denies:[]},{database:"LabFlow",schema:"ref",table:"SpecimenType",file:"database/010_schema.sql",line:55,columns:[{name:"SpecimenTypeCode",type:"VARCHAR(10)",nullable:!1,notes:["PK"]},{name:"NameEn",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"NameFr",type:"NVARCHAR(60)",nullable:!0,notes:[]},{name:"Container",type:"NVARCHAR(100)",nullable:!0,notes:[]}],denies:[]},{database:"LabFlow",schema:"ref",table:"Test",file:"database/010_schema.sql",line:63,columns:[{name:"TestId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Code",type:"VARCHAR(20)",nullable:!1,notes:["unique"]},{name:"LoincCode",type:"VARCHAR(10)",nullable:!0,notes:[]},{name:"NameEn",type:"NVARCHAR(150)",nullable:!1,notes:[]},{name:"NameFr",type:"NVARCHAR(150)",nullable:!0,notes:[]},{name:"ShortName",type:"NVARCHAR(30)",nullable:!0,notes:[]},{name:"DepartmentId",type:"SMALLINT",nullable:!1,notes:["→ ref.Department"]},{name:"SpecimenTypeCode",type:"VARCHAR(10)",nullable:!0,notes:["→ ref.SpecimenType"]},{name:"ResultType",type:"VARCHAR(10)",nullable:!1,notes:["check ResultType IN ('Numeric','Text','Coded','Panel')"]},{name:"UnitCode",type:"VARCHAR(20)",nullable:!0,notes:["→ ref.Unit"]},{name:"DecimalPlaces",type:"TINYINT",nullable:!0,notes:[]},{name:"ApplicableSex",type:"CHAR(1)",nullable:!0,notes:["check ApplicableSex IN ('M','F')"]},{name:"IsOrderable",type:"BIT",nullable:!1,notes:["default 1"]},{name:"OhipFeeCode",type:"VARCHAR(10)",nullable:!0,notes:[]},{name:"IsOhipInsured",type:"BIT",nullable:!1,notes:["default 1"]},{name:"UninsuredPrice",type:"DECIMAL(10,2)",nullable:!0,notes:[]},{name:"FastingRequired",type:"BIT",nullable:!1,notes:["default 0"]},{name:"PreparationEn",type:"NVARCHAR(500)",nullable:!0,notes:[]},{name:"PreparationFr",type:"NVARCHAR(500)",nullable:!0,notes:[]},{name:"TurnaroundHours",type:"SMALLINT",nullable:!0,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]},{name:"CreatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"UpdatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"RowVer",type:"ROWVERSION",nullable:!0,notes:[]}],denies:[],checks:["LoincCode IS NULL OR (LoincCode LIKE '%[0-9]-[0-9]' AND LoincCode NOT LIKE '%[^0-9-]%')","ResultType <> 'Numeric' OR UnitCode IS NOT NULL","IsOhipInsured = 1 OR UninsuredPrice IS NOT NULL"]},{database:"LabFlow",schema:"ref",table:"PanelMember",file:"database/010_schema.sql",line:94,columns:[{name:"PanelTestId",type:"INT",nullable:!1,notes:["PK","→ ref.Test"]},{name:"MemberTestId",type:"INT",nullable:!1,notes:["PK","→ ref.Test"]},{name:"SortOrder",type:"SMALLINT",nullable:!1,notes:["default 0"]}],denies:[],checks:["PanelTestId <> MemberTestId"]},{database:"LabFlow",schema:"ref",table:"ReferenceRange",file:"database/010_schema.sql",line:103,columns:[{name:"ReferenceRangeId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"TestId",type:"INT",nullable:!1,notes:["→ ref.Test"]},{name:"Sex",type:"CHAR(1)",nullable:!1,notes:["default 'U'","check Sex IN ('M','F','U')"]},{name:"AgeFromDays",type:"INT",nullable:!1,notes:["default 0"]},{name:"AgeToDays",type:"INT",nullable:!1,notes:["default 54750"]},{name:"PregnancyWeekFrom",type:"TINYINT",nullable:!0,notes:[]},{name:"PregnancyWeekTo",type:"TINYINT",nullable:!0,notes:[]},{name:"Low",type:"DECIMAL(18,6)",nullable:!0,notes:[]},{name:"High",type:"DECIMAL(18,6)",nullable:!0,notes:[]},{name:"CriticalLow",type:"DECIMAL(18,6)",nullable:!0,notes:[]},{name:"CriticalHigh",type:"DECIMAL(18,6)",nullable:!0,notes:[]},{name:"DisplayText",type:"NVARCHAR(100)",nullable:!0,notes:[]},{name:"Comment",type:"NVARCHAR(300)",nullable:!0,notes:[]},{name:"EffectiveFrom",type:"DATE",nullable:!1,notes:["default CAST"]},{name:"EffectiveTo",type:"DATE",nullable:!0,notes:[]}],denies:[],checks:["AgeFromDays <= AgeToDays","Low IS NULL OR High IS NULL OR Low <= High","(PregnancyWeekFrom IS NULL AND PregnancyWeekTo IS NULL) OR PregnancyWeekFrom <= PregnancyWeekTo"]},{database:"LabFlow",schema:"core",table:"Location",file:"database/010_schema.sql",line:132,columns:[{name:"LocationId",type:"SMALLINT",nullable:!1,notes:["PK","identity"]},{name:"Name",type:"NVARCHAR(100)",nullable:!1,notes:[]},{name:"AddressLine1",type:"NVARCHAR(100)",nullable:!1,notes:[]},{name:"AddressLine2",type:"NVARCHAR(100)",nullable:!0,notes:[]},{name:"City",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"Province",type:"CHAR(2)",nullable:!1,notes:["default 'ON'"]},{name:"PostalCode",type:"CHAR(7)",nullable:!1,notes:[]},{name:"Phone",type:"VARCHAR(20)",nullable:!0,notes:[]},{name:"Email",type:"NVARCHAR(254)",nullable:!0,notes:[]},{name:"IsCollectionCentre",type:"BIT",nullable:!1,notes:["default 1"]},{name:"IsLab",type:"BIT",nullable:!1,notes:["default 0"]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]}],denies:[],checks:["PostalCode LIKE '[A-Z][0-9][A-Z] [0-9][A-Z][0-9]'"]},{database:"LabFlow",schema:"core",table:"Patient",file:"database/010_schema.sql",line:149,columns:[{name:"PatientId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Mrn",type:"VARCHAR(12)",nullable:!1,notes:["unique"]},{name:"HealthCardNumber",type:"CHAR(10)",nullable:!0,notes:["unique where HealthCardNumber IS NOT NULL"]},{name:"HealthCardVersion",type:"VARCHAR(2)",nullable:!0,notes:[]},{name:"HealthCardExpiry",type:"DATE",nullable:!0,notes:[]},{name:"HealthCardProvince",type:"CHAR(2)",nullable:!0,notes:[]},{name:"FirstName",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"MiddleName",type:"NVARCHAR(60)",nullable:!0,notes:[]},{name:"LastName",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"DateOfBirth",type:"DATE",nullable:!1,notes:[]},{name:"Sex",type:"CHAR(1)",nullable:!1,notes:["check Sex IN ('M','F','X','U')"]},{name:"GenderIdentity",type:"NVARCHAR(50)",nullable:!0,notes:[]},{name:"Email",type:"NVARCHAR(254)",nullable:!0,notes:[]},{name:"MobilePhone",type:"VARCHAR(20)",nullable:!0,notes:[]},{name:"PreferredLanguage",type:"CHAR(2)",nullable:!1,notes:["default 'en'","check PreferredLanguage IN ('en','fr')"]},{name:"AddressLine1",type:"NVARCHAR(100)",nullable:!0,notes:[]},{name:"AddressLine2",type:"NVARCHAR(100)",nullable:!0,notes:[]},{name:"City",type:"NVARCHAR(60)",nullable:!0,notes:[]},{name:"Province",type:"CHAR(2)",nullable:!0,notes:[]},{name:"PostalCode",type:"CHAR(7)",nullable:!0,notes:[]},{name:"ConsentEmailNotification",type:"BIT",nullable:!1,notes:["default 0"]},{name:"ConsentAiSummary",type:"BIT",nullable:!1,notes:["default 0"]},{name:"ConsentRecordedAt",type:"DATETIME2(0)",nullable:!0,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]},{name:"CreatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"RowVer",type:"ROWVERSION",nullable:!0,notes:[]},{name:"ValidFrom",type:"DATETIME2(0)",nullable:!1,notes:[]},{name:"ValidTo",type:"DATETIME2(0)",nullable:!1,notes:[]}],denies:[],checks:["HealthCardNumber IS NULL OR HealthCardNumber NOT LIKE '%[^0-9]%'","PostalCode IS NULL OR PostalCode LIKE '[A-Z][0-9][A-Z] [0-9][A-Z][0-9]'","DateOfBirth >= '1900-01-01'"]},{database:"LabFlow",schema:"core",table:"Practitioner",file:"database/010_schema.sql",line:188,columns:[{name:"PractitionerId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"LicenceNumber",type:"VARCHAR(10)",nullable:!1,notes:[]},{name:"LicenceBody",type:"VARCHAR(6)",nullable:!1,notes:["default 'CPSO'","check LicenceBody IN ('CPSO','CNO')"]},{name:"OhipBillingNumber",type:"CHAR(6)",nullable:!0,notes:[]},{name:"FirstName",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"LastName",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"Specialty",type:"NVARCHAR(80)",nullable:!0,notes:[]},{name:"ClinicName",type:"NVARCHAR(150)",nullable:!0,notes:[]},{name:"AddressLine1",type:"NVARCHAR(100)",nullable:!0,notes:[]},{name:"City",type:"NVARCHAR(60)",nullable:!0,notes:[]},{name:"Province",type:"CHAR(2)",nullable:!0,notes:[]},{name:"PostalCode",type:"CHAR(7)",nullable:!0,notes:[]},{name:"Phone",type:"VARCHAR(20)",nullable:!0,notes:[]},{name:"Fax",type:"VARCHAR(20)",nullable:!0,notes:[]},{name:"Email",type:"NVARCHAR(254)",nullable:!0,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]},{name:"CreatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]}],denies:[],uniques:["(LicenceBody, LicenceNumber)"]},{database:"LabFlow",schema:"sec",table:"AppUser",file:"database/010_schema.sql",line:214,columns:[{name:"UserId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"ExternalId",type:"NVARCHAR(128)",nullable:!1,notes:["unique"]},{name:"Email",type:"NVARCHAR(254)",nullable:!1,notes:["unique"]},{name:"DisplayName",type:"NVARCHAR(120)",nullable:!1,notes:[]},{name:"Role",type:"VARCHAR(20)",nullable:!1,notes:["check Role IN ('Admin','Reception','Collector','Technologist','Pathologist','Practitioner','Patient')"]},{name:"PatientId",type:"INT",nullable:!0,notes:["→ core.Patient"]},{name:"PractitionerId",type:"INT",nullable:!0,notes:["→ core.Practitioner"]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]},{name:"CreatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"LastLoginAt",type:"DATETIME2(0)",nullable:!0,notes:[]}],denies:[],checks:["Role <> 'Practitioner' OR PractitionerId IS NOT NULL"]},{database:"LabFlow",schema:"sched",table:"LocationHours",file:"database/010_schema.sql",line:235,columns:[{name:"LocationId",type:"SMALLINT",nullable:!1,notes:["PK","→ core.Location"]},{name:"DayOfWeek",type:"TINYINT",nullable:!1,notes:["PK","check DayOfWeek BETWEEN 0 AND 6"]},{name:"OpenTime",type:"TIME(0)",nullable:!1,notes:["PK"]},{name:"CloseTime",type:"TIME(0)",nullable:!1,notes:[]},{name:"SlotMinutes",type:"TINYINT",nullable:!1,notes:["default 10"]},{name:"CapacityPerSlot",type:"TINYINT",nullable:!1,notes:["default 2"]}],denies:[],checks:["OpenTime < CloseTime"]},{database:"LabFlow",schema:"sched",table:"LocationClosure",file:"database/010_schema.sql",line:247,columns:[{name:"LocationId",type:"SMALLINT",nullable:!1,notes:["PK","→ core.Location"]},{name:"ClosedOn",type:"DATE",nullable:!1,notes:["PK"]},{name:"Reason",type:"NVARCHAR(100)",nullable:!0,notes:[]}],denies:[]},{database:"LabFlow",schema:"sched",table:"Appointment",file:"database/010_schema.sql",line:255,columns:[{name:"AppointmentId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ core.Patient"]},{name:"LocationId",type:"SMALLINT",nullable:!1,notes:["→ core.Location"]},{name:"StartUtc",type:"DATETIME2(0)",nullable:!1,notes:[]},{name:"EndUtc",type:"DATETIME2(0)",nullable:!1,notes:[]},{name:"Status",type:"VARCHAR(12)",nullable:!1,notes:["default 'Booked'","check Status IN ('Booked','CheckedIn','Completed','Cancelled','NoShow')"]},{name:"Channel",type:"VARCHAR(8)",nullable:!1,notes:["default 'Web'","check Channel IN ('Web','Phone','WalkIn')"]},{name:"RequisitionImageUri",type:"NVARCHAR(500)",nullable:!0,notes:[]},{name:"Notes",type:"NVARCHAR(500)",nullable:!0,notes:[]},{name:"CancelReason",type:"NVARCHAR(200)",nullable:!0,notes:[]},{name:"CreatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"CreatedByUserId",type:"INT",nullable:!0,notes:["→ sec.AppUser"]},{name:"RowVer",type:"ROWVERSION",nullable:!0,notes:[]}],denies:[],checks:["StartUtc < EndUtc"]},{database:"LabFlow",schema:"lab",table:"Requisition",file:"database/010_schema.sql",line:281,columns:[{name:"RequisitionId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"AccessionNumber",type:"VARCHAR(20)",nullable:!1,notes:["unique"]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ core.Patient"]},{name:"OrderingPractitionerId",type:"INT",nullable:!1,notes:["→ core.Practitioner"]},{name:"LocationId",type:"SMALLINT",nullable:!1,notes:["→ core.Location"]},{name:"AppointmentId",type:"INT",nullable:!0,notes:["→ sched.Appointment","unique where AppointmentId IS NOT NULL"]},{name:"Priority",type:"VARCHAR(8)",nullable:!1,notes:["default 'Routine'","check Priority IN ('Routine','Stat')"]},{name:"Status",type:"VARCHAR(20)",nullable:!1,notes:["default 'Received'","check Status IN ('Received','InProgress','PartiallyResulted','Final','Cancelled')"]},{name:"PayerType",type:"VARCHAR(10)",nullable:!1,notes:["default 'OHIP'","check PayerType IN ('OHIP','Patient','ThirdParty')"]},{name:"RequisitionDate",type:"DATE",nullable:!1,notes:[]},{name:"ClinicalNotes",type:"NVARCHAR(1000)",nullable:!0,notes:[]},{name:"IsPregnant",type:"BIT",nullable:!1,notes:["default 0"]},{name:"PregnancyWeek",type:"TINYINT",nullable:!0,notes:[]},{name:"FastingHours",type:"TINYINT",nullable:!0,notes:[]},{name:"ReceivedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"ReceivedByUserId",type:"INT",nullable:!0,notes:["→ sec.AppUser"]},{name:"UpdatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"RowVer",type:"ROWVERSION",nullable:!0,notes:[]}],denies:[],checks:["IsPregnant = 1 OR PregnancyWeek IS NULL"]},{database:"LabFlow",schema:"lab",table:"RequisitionCopyTo",file:"database/010_schema.sql",line:308,columns:[{name:"RequisitionId",type:"INT",nullable:!1,notes:["PK","→ lab.Requisition"]},{name:"PractitionerId",type:"INT",nullable:!1,notes:["PK","→ core.Practitioner"]}],denies:[]},{database:"LabFlow",schema:"lab",table:"RequisitionItem",file:"database/010_schema.sql",line:315,columns:[{name:"RequisitionItemId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"RequisitionId",type:"INT",nullable:!1,notes:["→ lab.Requisition"]},{name:"TestId",type:"INT",nullable:!1,notes:["→ ref.Test"]},{name:"Status",type:"VARCHAR(12)",nullable:!1,notes:["default 'Ordered'","check Status IN ('Ordered','Collected','InProgress','Resulted','Verified','Cancelled')"]},{name:"IsInsured",type:"BIT",nullable:!1,notes:[]},{name:"Price",type:"DECIMAL(10,2)",nullable:!0,notes:[]},{name:"CancelReason",type:"NVARCHAR(200)",nullable:!0,notes:[]}],denies:[],checks:["IsInsured = 1 OR Price IS NOT NULL"],uniques:["(RequisitionId, TestId)"]},{database:"LabFlow",schema:"lab",table:"Specimen",file:"database/010_schema.sql",line:329,columns:[{name:"SpecimenId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"RequisitionId",type:"INT",nullable:!1,notes:["→ lab.Requisition"]},{name:"Barcode",type:"VARCHAR(20)",nullable:!1,notes:["unique"]},{name:"SpecimenTypeCode",type:"VARCHAR(10)",nullable:!1,notes:["→ ref.SpecimenType"]},{name:"CollectedAt",type:"DATETIME2(0)",nullable:!1,notes:[]},{name:"CollectedByUserId",type:"INT",nullable:!0,notes:["→ sec.AppUser"]},{name:"ReceivedInLabAt",type:"DATETIME2(0)",nullable:!0,notes:[]},{name:"Status",type:"VARCHAR(10)",nullable:!1,notes:["default 'Collected'","check Status IN ('Collected','Received','Rejected','Disposed')"]},{name:"RejectionReason",type:"NVARCHAR(200)",nullable:!0,notes:[]}],denies:[],checks:["Status <> 'Rejected' OR RejectionReason IS NOT NULL"]},{database:"LabFlow",schema:"lab",table:"Result",file:"database/010_schema.sql",line:347,columns:[{name:"ResultId",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"RequisitionItemId",type:"INT",nullable:!1,notes:["→ lab.RequisitionItem"]},{name:"TestId",type:"INT",nullable:!1,notes:["→ ref.Test"]},{name:"SpecimenId",type:"INT",nullable:!0,notes:["→ lab.Specimen"]},{name:"ValueNumeric",type:"DECIMAL(18,6)",nullable:!0,notes:[]},{name:"ValueText",type:"NVARCHAR(1000)",nullable:!0,notes:[]},{name:"UnitCode",type:"VARCHAR(20)",nullable:!0,notes:["→ ref.Unit"]},{name:"RefLow",type:"DECIMAL(18,6)",nullable:!0,notes:[]},{name:"RefHigh",type:"DECIMAL(18,6)",nullable:!0,notes:[]},{name:"RefText",type:"NVARCHAR(100)",nullable:!0,notes:[]},{name:"AbnormalFlag",type:"VARCHAR(2)",nullable:!0,notes:["check AbnormalFlag IN ('N','L','H','LL','HH','A')"]},{name:"IsCritical",type:"AS",nullable:!0,notes:[]},{name:"CriticalCalledAt",type:"DATETIME2(0)",nullable:!0,notes:[]},{name:"CriticalCalledTo",type:"NVARCHAR(150)",nullable:!0,notes:[]},{name:"Status",type:"VARCHAR(12)",nullable:!1,notes:["default 'Preliminary'","check Status IN ('Preliminary','Final','Corrected','Cancelled')"]},{name:"Comment",type:"NVARCHAR(1000)",nullable:!0,notes:[]},{name:"ResultedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"ResultedByUserId",type:"INT",nullable:!0,notes:["→ sec.AppUser"]},{name:"VerifiedAt",type:"DATETIME2(0)",nullable:!0,notes:[]},{name:"VerifiedByUserId",type:"INT",nullable:!0,notes:["→ sec.AppUser"]},{name:"LegacyAnswer",type:"VARCHAR(250)",nullable:!0,notes:[]},{name:"RowVer",type:"ROWVERSION",nullable:!0,notes:[]},{name:"ValidFrom",type:"DATETIME2(0)",nullable:!1,notes:[]},{name:"ValidTo",type:"DATETIME2(0)",nullable:!1,notes:[]}],denies:[],checks:["Status = 'Cancelled' OR ValueNumeric IS NOT NULL OR ValueText IS NOT NULL","Status NOT IN ('Final','Corrected') OR VerifiedAt IS NOT NULL"],uniques:["(RequisitionItemId, TestId)"]},{database:"LabFlow",schema:"lab",table:"Report",file:"database/010_schema.sql",line:381,columns:[{name:"ReportId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"RequisitionId",type:"INT",nullable:!1,notes:["→ lab.Requisition"]},{name:"Version",type:"SMALLINT",nullable:!1,notes:["default 1"]},{name:"Status",type:"VARCHAR(12)",nullable:!1,notes:["check Status IN ('Preliminary','Final','Amended')"]},{name:"IssuedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"IssuedByUserId",type:"INT",nullable:!0,notes:["→ sec.AppUser"]},{name:"PdfBlobUri",type:"NVARCHAR(500)",nullable:!0,notes:[]},{name:"Hl7MessageId",type:"VARCHAR(50)",nullable:!0,notes:[]},{name:"IsPatientVisible",type:"BIT",nullable:!1,notes:["default 0"]}],denies:[],uniques:["(RequisitionId, Version)"]},{database:"LabFlow",schema:"lab",table:"ResultInterpretation",file:"database/010_schema.sql",line:396,columns:[{name:"InterpretationId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"RequisitionId",type:"INT",nullable:!1,notes:["→ lab.Requisition"]},{name:"ReportId",type:"INT",nullable:!0,notes:["→ lab.Report"]},{name:"Audience",type:"VARCHAR(10)",nullable:!1,notes:["check Audience IN ('Patient','Clinician')"]},{name:"Language",type:"CHAR(2)",nullable:!1,notes:["default 'en'","check Language IN ('en','fr')"]},{name:"ContentMarkdown",type:"NVARCHAR(MAX)",nullable:!1,notes:[]},{name:"FindingsJson",type:"NVARCHAR(MAX)",nullable:!0,notes:["check FindingsJson IS NULL OR ISJSON(FindingsJson) = 1"]},{name:"Model",type:"VARCHAR(64)",nullable:!1,notes:[]},{name:"PromptVersion",type:"VARCHAR(20)",nullable:!1,notes:[]},{name:"InputTokens",type:"INT",nullable:!0,notes:[]},{name:"OutputTokens",type:"INT",nullable:!0,notes:[]},{name:"Status",type:"VARCHAR(12)",nullable:!1,notes:["default 'Draft'","check Status IN ('Draft','Approved','Rejected','Superseded')"]},{name:"ReviewedByUserId",type:"INT",nullable:!0,notes:["→ sec.AppUser"]},{name:"ReviewedAt",type:"DATETIME2(0)",nullable:!0,notes:[]},{name:"ReviewComment",type:"NVARCHAR(500)",nullable:!0,notes:[]},{name:"CreatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]}],denies:[],checks:["Status NOT IN ('Approved','Rejected') OR (ReviewedByUserId IS NOT NULL AND ReviewedAt IS NOT NULL)"]},{database:"LabFlow",schema:"notify",table:"Notification",file:"database/010_schema.sql",line:427,columns:[{name:"NotificationId",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"PatientId",type:"INT",nullable:!0,notes:["→ core.Patient"]},{name:"PractitionerId",type:"INT",nullable:!0,notes:["→ core.Practitioner"]},{name:"RequisitionId",type:"INT",nullable:!0,notes:["→ lab.Requisition"]},{name:"AppointmentId",type:"INT",nullable:!0,notes:["→ sched.Appointment"]},{name:"Channel",type:"VARCHAR(8)",nullable:!1,notes:["check Channel IN ('Email','Sms')"]},{name:"TemplateCode",type:"VARCHAR(40)",nullable:!1,notes:[]},{name:"Language",type:"CHAR(2)",nullable:!1,notes:["default 'en'"]},{name:"Recipient",type:"NVARCHAR(254)",nullable:!1,notes:[]},{name:"Status",type:"VARCHAR(10)",nullable:!1,notes:["default 'Queued'","check Status IN ('Queued','Sending','Sent','Failed','Cancelled')"]},{name:"AttemptCount",type:"TINYINT",nullable:!1,notes:["default 0"]},{name:"NextAttemptAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"QueuedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"SentAt",type:"DATETIME2(0)",nullable:!0,notes:[]},{name:"LastError",type:"NVARCHAR(1000)",nullable:!0,notes:[]},{name:"ProviderMessageId",type:"VARCHAR(100)",nullable:!0,notes:[]}],denies:[],checks:["PatientId IS NOT NULL OR PractitionerId IS NOT NULL"]},{database:"LabFlow",schema:"billing",table:"OhipClaim",file:"database/010_schema.sql",line:454,columns:[{name:"ClaimId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"RequisitionId",type:"INT",nullable:!1,notes:["unique","→ lab.Requisition"]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ core.Patient"]},{name:"HealthCardNumber",type:"CHAR(10)",nullable:!1,notes:[]},{name:"HealthCardVersion",type:"VARCHAR(2)",nullable:!0,notes:[]},{name:"ReferringOhipBillingNumber",type:"CHAR(6)",nullable:!0,notes:[]},{name:"ServiceDate",type:"DATE",nullable:!1,notes:[]},{name:"Status",type:"VARCHAR(10)",nullable:!1,notes:["default 'Draft'","check Status IN ('Draft','Submitted','Accepted','Rejected','Paid')"]},{name:"BatchNumber",type:"VARCHAR(20)",nullable:!0,notes:[]},{name:"SubmittedAt",type:"DATETIME2(0)",nullable:!0,notes:[]},{name:"TotalAmount",type:"DECIMAL(10,2)",nullable:!1,notes:["default 0"]},{name:"ErrorCodes",type:"VARCHAR(50)",nullable:!0,notes:[]},{name:"CreatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]}],denies:[]},{database:"LabFlow",schema:"billing",table:"OhipClaimItem",file:"database/010_schema.sql",line:472,columns:[{name:"ClaimItemId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"ClaimId",type:"INT",nullable:!1,notes:["→ billing.OhipClaim"]},{name:"RequisitionItemId",type:"INT",nullable:!1,notes:["→ lab.RequisitionItem"]},{name:"FeeCode",type:"VARCHAR(10)",nullable:!1,notes:[]},{name:"Units",type:"TINYINT",nullable:!1,notes:["default 1"]},{name:"Amount",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"ExplanatoryCode",type:"VARCHAR(5)",nullable:!0,notes:[]}],denies:[]},{database:"LabFlow",schema:"billing",table:"Invoice",file:"database/010_schema.sql",line:483,columns:[{name:"InvoiceId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"RequisitionId",type:"INT",nullable:!1,notes:["→ lab.Requisition"]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ core.Patient"]},{name:"Subtotal",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"Tax",type:"DECIMAL(10,2)",nullable:!1,notes:["default 0"]},{name:"Total",type:"COMPUTED",nullable:null,notes:["= Subtotal + Tax","persisted"]},{name:"Status",type:"VARCHAR(10)",nullable:!1,notes:["default 'Open'","check Status IN ('Open','Paid','Void','Refunded')"]},{name:"PaymentProvider",type:"VARCHAR(20)",nullable:!0,notes:[]},{name:"PaymentReference",type:"VARCHAR(100)",nullable:!0,notes:[]},{name:"PaidAt",type:"DATETIME2(0)",nullable:!0,notes:[]},{name:"CreatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]}],denies:[]},{database:"LabFlow",schema:"audit",table:"AccessLog",file:"database/010_schema.sql",line:503,columns:[{name:"AuditId",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"OccurredAt",type:"DATETIME2(3)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"UserId",type:"INT",nullable:!0,notes:[]},{name:"Action",type:"VARCHAR(20)",nullable:!1,notes:["check Action IN ('View','Create','Update','Delete','Print','Export','Email','Login','LoginFailed','AiGenerate')"]},{name:"EntityType",type:"VARCHAR(50)",nullable:!1,notes:[]},{name:"EntityId",type:"VARCHAR(50)",nullable:!0,notes:[]},{name:"PatientId",type:"INT",nullable:!0,notes:[]},{name:"Details",type:"NVARCHAR(MAX)",nullable:!0,notes:["check Details IS NULL OR ISJSON(Details) = 1"]},{name:"IpAddress",type:"VARCHAR(45)",nullable:!0,notes:[]},{name:"CorrelationId",type:"UNIQUEIDENTIFIER",nullable:!0,notes:[]}],denies:[],checks:["Action IN ('View','Create','Update','Delete','Print','Export','Email','Login','LoginFailed','AiGenerate','RestrictedOverride')"]},{database:"LabFlow",schema:"etl",table:"LegacyTestMap",file:"database/010_schema.sql",line:530,columns:[{name:"LegacyAzId",type:"INT",nullable:!1,notes:["PK"]},{name:"LegacyCode",type:"VARCHAR(12)",nullable:!0,notes:[]},{name:"LegacyName",type:"VARCHAR(50)",nullable:!0,notes:[]},{name:"LegacyUnit",type:"VARCHAR(15)",nullable:!0,notes:[]},{name:"TestId",type:"INT",nullable:!0,notes:["→ ref.Test"]},{name:"Factor",type:"DECIMAL(18,8)",nullable:!0,notes:[]},{name:"MapStatus",type:"VARCHAR(12)",nullable:!1,notes:["default 'Unmapped'","check MapStatus IN ('Unmapped','Suggested','Reviewed','Excluded')"]},{name:"Notes",type:"NVARCHAR(300)",nullable:!0,notes:[]},{name:"ReviewedAt",type:"DATETIME2(0)",nullable:!0,notes:[]}],denies:[],checks:["MapStatus <> 'Reviewed' OR TestId IS NOT NULL"]},{database:"LabFlow",schema:"etl",table:"Secret",file:"database/040_etl_dw.sql",line:25,columns:[{name:"Name",type:"VARCHAR(30)",nullable:!1,notes:["PK"]},{name:"Value",type:"VARCHAR(100)",nullable:!1,notes:[]},{name:"CreatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]}],denies:[]},{database:"LabFlow",schema:"etl",table:"LoadRun",file:"database/040_etl_dw.sql",line:31,columns:[{name:"RunId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Package",type:"VARCHAR(100)",nullable:!1,notes:[]},{name:"StartedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"EndedAt",type:"DATETIME2(0)",nullable:!0,notes:[]},{name:"Status",type:"VARCHAR(10)",nullable:!1,notes:["default 'Running'","check Status IN ('Running','Succeeded','Failed')"]},{name:"FromVisitNo",type:"BIGINT",nullable:!1,notes:[]},{name:"VisitsExtracted",type:"INT",nullable:!0,notes:[]},{name:"ResultsExtracted",type:"INT",nullable:!0,notes:[]},{name:"ResultsInserted",type:"INT",nullable:!0,notes:[]},{name:"ResultsUpdated",type:"INT",nullable:!0,notes:[]},{name:"ResultsSkipped",type:"INT",nullable:!0,notes:[]},{name:"ResultsRejected",type:"INT",nullable:!0,notes:[]},{name:"Warnings",type:"INT",nullable:!0,notes:[]},{name:"Message",type:"NVARCHAR(2000)",nullable:!0,notes:[]}],denies:[]},{database:"LabFlow",schema:"etl",table:"RejectRow",file:"database/040_etl_dw.sql",line:49,columns:[{name:"RejectRowId",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"RunId",type:"INT",nullable:!1,notes:["→ etl.LoadRun"]},{name:"Severity",type:"VARCHAR(8)",nullable:!1,notes:["check Severity IN ('Rejected','Warning')"]},{name:"SourceTable",type:"VARCHAR(30)",nullable:!1,notes:[]},{name:"SourceKey",type:"VARCHAR(60)",nullable:!1,notes:[]},{name:"Rule_",type:"VARCHAR(40)",nullable:!1,notes:[]},{name:"RawValue",type:"NVARCHAR(250)",nullable:!0,notes:[]}],denies:[]},{database:"LabFlow",schema:"etl",table:"Watermark",file:"database/040_etl_dw.sql",line:60,columns:[{name:"Name",type:"VARCHAR(30)",nullable:!1,notes:["PK"]},{name:"Value",type:"BIGINT",nullable:!1,notes:[]},{name:"UpdatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]}],denies:[]},{database:"LabFlow",schema:"etl",table:"stg_Test",file:"database/040_etl_dw.sql",line:69,columns:[{name:"LegacyAzId",type:"INT",nullable:!1,notes:["PK"]},{name:"LegacyCode",type:"NVARCHAR(12)",nullable:!0,notes:[]},{name:"LegacyName",type:"NVARCHAR(50)",nullable:!0,notes:[]},{name:"LegacyUnit",type:"NVARCHAR(15)",nullable:!0,notes:[]},{name:"Section",type:"TINYINT",nullable:!0,notes:[]}],denies:[]},{database:"LabFlow",schema:"etl",table:"stg_Payer",file:"database/040_etl_dw.sql",line:77,columns:[{name:"LegacyPayerId",type:"SMALLINT",nullable:!1,notes:["PK"]},{name:"PayerName",type:"NVARCHAR(200)",nullable:!0,notes:[]}],denies:[]},{database:"LabFlow",schema:"etl",table:"stg_Visit",file:"database/040_etl_dw.sql",line:82,columns:[{name:"LegacyVisitNo",type:"BIGINT",nullable:!1,notes:["PK"]},{name:"PatientHash",type:"NCHAR(16)",nullable:!1,notes:[]},{name:"LegacySex",type:"TINYINT",nullable:!0,notes:[]},{name:"Age",type:"TINYINT",nullable:!0,notes:[]},{name:"AgeKind",type:"TINYINT",nullable:!0,notes:[]},{name:"VisitDateJ",type:"NVARCHAR(10)",nullable:!0,notes:[]},{name:"VisitTime",type:"NVARCHAR(8)",nullable:!0,notes:[]},{name:"AnswerDateJ",type:"NVARCHAR(10)",nullable:!0,notes:[]},{name:"AnswerTime",type:"NVARCHAR(8)",nullable:!0,notes:[]},{name:"LegacyPayerId",type:"SMALLINT",nullable:!0,notes:[]},{name:"Cancelled",type:"BIT",nullable:!0,notes:[]},{name:"PregnancyWeek",type:"TINYINT",nullable:!0,notes:[]}],denies:[]},{database:"LabFlow",schema:"etl",table:"stg_Result",file:"database/040_etl_dw.sql",line:97,columns:[{name:"LegacyVisitNo",type:"BIGINT",nullable:!1,notes:["PK"]},{name:"LegacyAzId",type:"SMALLINT",nullable:!1,notes:["PK"]},{name:"LegacyChildAzId",type:"SMALLINT",nullable:!1,notes:["PK"]},{name:"RowNo",type:"TINYINT",nullable:!1,notes:["PK"]},{name:"RowNo2",type:"SMALLINT",nullable:!1,notes:["PK"]},{name:"Answer",type:"NVARCHAR(250)",nullable:!0,notes:[]},{name:"Unit",type:"NVARCHAR(15)",nullable:!0,notes:[]},{name:"NormalRange",type:"NVARCHAR(200)",nullable:!0,notes:[]},{name:"OutOfRange",type:"TINYINT",nullable:!0,notes:[]},{name:"OutOfCritical",type:"TINYINT",nullable:!0,notes:[]},{name:"NoAnswer",type:"NVARCHAR(1)",nullable:!0,notes:[]}],denies:[]},{database:"LabFlow",schema:"dw",table:"DimDate",file:"database/040_etl_dw.sql",line:117,columns:[{name:"DateKey",type:"INT",nullable:!1,notes:["PK"]},{name:"Date",type:"DATE",nullable:!1,notes:["unique"]},{name:"Year",type:"SMALLINT",nullable:!1,notes:[]},{name:"Quarter",type:"TINYINT",nullable:!1,notes:[]},{name:"Month",type:"TINYINT",nullable:!1,notes:[]},{name:"MonthName",type:"VARCHAR(10)",nullable:!1,notes:[]},{name:"YearMonth",type:"CHAR(7)",nullable:!1,notes:[]},{name:"Day",type:"TINYINT",nullable:!1,notes:[]},{name:"WeekdayNo",type:"TINYINT",nullable:!1,notes:[]},{name:"WeekdayName",type:"VARCHAR(10)",nullable:!1,notes:[]},{name:"IsWeekend",type:"BIT",nullable:!1,notes:[]}],denies:[]},{database:"LabFlow",schema:"dw",table:"DimTest",file:"database/040_etl_dw.sql",line:131,columns:[{name:"TestKey",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"LegacyAzId",type:"INT",nullable:!1,notes:["unique"]},{name:"LegacyCode",type:"VARCHAR(12)",nullable:!0,notes:[]},{name:"LegacyName",type:"NVARCHAR(50)",nullable:!0,notes:[]},{name:"LegacyUnit",type:"NVARCHAR(15)",nullable:!0,notes:[]},{name:"LoincCode",type:"VARCHAR(10)",nullable:!0,notes:[]},{name:"LabFlowCode",type:"VARCHAR(20)",nullable:!0,notes:[]},{name:"TestName",type:"NVARCHAR(150)",nullable:!1,notes:[]},{name:"SiUnit",type:"VARCHAR(20)",nullable:!0,notes:[]},{name:"Factor",type:"DECIMAL(18,8)",nullable:!0,notes:[]},{name:"MapStatus",type:"VARCHAR(12)",nullable:!1,notes:[]},{name:"IsPanel",type:"BIT",nullable:!1,notes:["default 0"]},{name:"Section",type:"TINYINT",nullable:!0,notes:[]}],denies:[]},{database:"LabFlow",schema:"dw",table:"DimPayer",file:"database/040_etl_dw.sql",line:147,columns:[{name:"PayerKey",type:"SMALLINT",nullable:!1,notes:["PK","identity"]},{name:"LegacyPayerId",type:"SMALLINT",nullable:!1,notes:["unique"]},{name:"PayerName",type:"NVARCHAR(200)",nullable:!1,notes:[]},{name:"PayerType",type:"VARCHAR(10)",nullable:!1,notes:[]}],denies:[]},{database:"LabFlow",schema:"dw",table:"DimPatient",file:"database/040_etl_dw.sql",line:154,columns:[{name:"PatientKey",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"PatientHash",type:"CHAR(16)",nullable:!1,notes:["unique"]},{name:"Sex",type:"CHAR(1)",nullable:!1,notes:["check Sex IN ('F','M','U')"]}],denies:[]},{database:"LabFlow",schema:"dw",table:"FactLabResult",file:"database/040_etl_dw.sql",line:160,columns:[{name:"ResultKey",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"LegacyVisitNo",type:"BIGINT",nullable:!1,notes:[]},{name:"LegacyAzId",type:"SMALLINT",nullable:!1,notes:[]},{name:"LegacyChildAzId",type:"SMALLINT",nullable:!1,notes:[]},{name:"RowNo",type:"TINYINT",nullable:!1,notes:[]},{name:"RowNo2",type:"SMALLINT",nullable:!1,notes:[]},{name:"TestKey",type:"INT",nullable:!1,notes:["→ dw.DimTest"]},{name:"PanelTestKey",type:"INT",nullable:!0,notes:["→ dw.DimTest"]},{name:"PatientKey",type:"INT",nullable:!1,notes:["→ dw.DimPatient"]},{name:"PayerKey",type:"SMALLINT",nullable:!1,notes:["→ dw.DimPayer"]},{name:"VisitDateKey",type:"INT",nullable:!1,notes:["→ dw.DimDate"]},{name:"ResultDateKey",type:"INT",nullable:!0,notes:["→ dw.DimDate"]},{name:"AgeYears",type:"TINYINT",nullable:!0,notes:[]},{name:"AgeBand",type:"VARCHAR(8)",nullable:!1,notes:[]},{name:"HasAnswer",type:"BIT",nullable:!1,notes:[]},{name:"ValueText",type:"NVARCHAR(250)",nullable:!0,notes:[]},{name:"ValueNumeric",type:"DECIMAL(18,6)",nullable:!0,notes:[]},{name:"ValueSi",type:"DECIMAL(18,6)",nullable:!0,notes:[]},{name:"IsAbnormal",type:"BIT",nullable:!1,notes:[]},{name:"IsCritical",type:"BIT",nullable:!1,notes:[]},{name:"TurnaroundDays",type:"SMALLINT",nullable:!0,notes:[]},{name:"LoadRunId",type:"INT",nullable:!1,notes:["→ etl.LoadRun"]},{name:"UpdatedRunId",type:"INT",nullable:!0,notes:[]}],denies:[],uniques:["(LegacyVisitNo, LegacyAzId, LegacyChildAzId, RowNo, RowNo2)"]},{database:"LabFlow",schema:"lab",table:"ElectronicOrder",file:"database/050_electronic_orders.sql",line:8,columns:[{name:"ElectronicOrderId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"SourceClinic",type:"VARCHAR(40)",nullable:!1,notes:[]},{name:"ExternalId",type:"NVARCHAR(80)",nullable:!1,notes:[]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ core.Patient"]},{name:"PractitionerId",type:"INT",nullable:!1,notes:["→ core.Practitioner"]},{name:"Priority",type:"VARCHAR(10)",nullable:!1,notes:["check Priority IN ('Routine','Stat')"]},{name:"ClinicalNotes",type:"NVARCHAR(1000)",nullable:!0,notes:[]},{name:"Status",type:"VARCHAR(20)",nullable:!1,notes:["default 'Waiting'","check Status IN ('Waiting','Requisitioned','Cancelled')"]},{name:"ReceivedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"RequisitionId",type:"INT",nullable:!0,notes:["→ lab.Requisition"]}],denies:[],checks:["Status <> 'Requisitioned' OR RequisitionId IS NOT NULL"],uniques:["(SourceClinic, ExternalId)"]},{database:"LabFlow",schema:"lab",table:"ElectronicOrderItem",file:"database/050_electronic_orders.sql",line:26,columns:[{name:"ElectronicOrderId",type:"INT",nullable:!1,notes:["PK","→ lab.ElectronicOrder"]},{name:"TestId",type:"INT",nullable:!1,notes:["PK","→ ref.Test"]},{name:"ExternalId",type:"NVARCHAR(40)",nullable:!1,notes:[]},{name:"CancelledAt",type:"DATETIME2(0)",nullable:!0,notes:[]},{name:"CancelReason",type:"NVARCHAR(200)",nullable:!0,notes:[]}],denies:[]},{database:"LabFlow",schema:"lab",table:"OutboundMessage",file:"database/051_outbound_messages.sql",line:6,columns:[{name:"OutboundMessageId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Destination",type:"VARCHAR(20)",nullable:!1,notes:["check Destination IN ('ClinicHub')"]},{name:"Kind",type:"VARCHAR(40)",nullable:!1,notes:[]},{name:"RequisitionId",type:"INT",nullable:!0,notes:["→ lab.Requisition"]},{name:"PayloadJson",type:"NVARCHAR(MAX)",nullable:!1,notes:["check ISJSON(PayloadJson) = 1"]},{name:"CreatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"SentAt",type:"DATETIME2(0)",nullable:!0,notes:[]},{name:"Attempts",type:"INT",nullable:!1,notes:["default 0"]},{name:"NextAttemptAt",type:"DATETIME2(0)",nullable:!0,notes:[]},{name:"LastError",type:"NVARCHAR(1000)",nullable:!0,notes:[]}],denies:[]},{database:"LabFlow",schema:"billing",table:"FinanceExport",file:"database/053_finance.sql",line:12,columns:[{name:"ExternalId",type:"VARCHAR(200)",nullable:!1,notes:["PK"]},{name:"SentAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]}],denies:[]}],i=[{path:"/",component:"BookingPage",guards:[]},{path:"/results",component:"ResultsPage",guards:[]},{path:"/reception",component:"ReceptionPage",guards:[]}],o={project:e,repo:t,files:n,examples:a,endpoints:s,tables:l,routes:i};export{o as default,s as endpoints,a as examples,n as files,e as project,t as repo,i as routes,l as tables};
