const e="clinichub",n="ClinicHub",t={"README.md":127,"src/ClinicHub.Api/appsettings.Development.json":107,"web/vite.config.ts":20,"src/ClinicHub.Api/Program.cs":110,"tests/ClinicHub.Tests/FrontDeskTests.cs":259,"src/ClinicHub.Api/Catalog/ClinicDatabases.cs":95,"docs/architecture.md":441,"src/ClinicHub.Api/Auth/AuthSetup.cs":163,"src/ClinicHub.Api/Catalog/ClinicProvisioning.cs":76,"src/ClinicHub.Api/Endpoints/UserEndpoints.cs":404,"src/ClinicHub.Api/Catalog/SecurityLog.cs":44,"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs":258,"web/src/api.ts":412,"src/ClinicHub.Api/Auth/Totp.cs":92,"src/ClinicHub.Api/Auth/Permissions.cs":184,"src/ClinicHub.Api/Data/Security.cs":45,"src/ClinicHub.Api/Sso/SsoEndpoints.cs":201,"src/ClinicHub.Api/Sso/SsoSetup.cs":194,"src/ClinicHub.Api/Endpoints/FrontDeskEndpoints.cs":223,"src/ClinicHub.Api/Domain/HealthCard.cs":38,"src/ClinicHub.Api/Domain/HcvSimulator.cs":40,"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs":643,"src/ClinicHub.Api/Domain/PatientMatching.cs":171,"src/ClinicHub.Api/Domain/ConsentGuard.cs":81,"src/ClinicHub.Api/Endpoints/ConsentEndpoints.cs":181,"src/ClinicHub.Api/Endpoints/EncounterEndpoints.cs":399,"src/ClinicHub.Api/Domain/EncounterSigning.cs":57,"src/ClinicHub.Api/Domain/OhipFiles.cs":295,"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs":333,"docs/ohip-billing.md":87,"src/ClinicHub.Api/Domain/OhipSimulator.cs":63,"src/ClinicHub.Api/Integrations/FinanceFeed.cs":189,"src/ClinicHub.Api/Integrations/OutboxDispatcher.cs":262,"src/ClinicHub.Api/Endpoints/OrderEndpoints.cs":218,"src/ClinicHub.Api/Integrations/FhirOrders.cs":250,"src/ClinicHub.Api/Endpoints/ResultEndpoints.cs":205,"web/src/App.tsx":215,"web/src/pages/EncounterPage.tsx":827,"src/ClinicHub.Api/Catalog/CatalogDbContext.cs":60,"src/ClinicHub.Api/Catalog/CatalogEntities.cs":150,"src/ClinicHub.Api/Catalog/Migrations/CatalogDbContextModelSnapshot.cs":560,"src/ClinicHub.Api/Data/ReferenceSeeder.cs":69,"src/ClinicHub.Api/Data/ClinicHubDbContext.cs":424,"docs/schema.md":194,"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs":2893},i={"run/vite":{file:"web/vite.config.ts",start:6,end:20,code:`export default defineConfig({
  plugins: [react()],
  server: {
    port: 5301,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:5300',
      // Keep the browser's Host so the sign-in server advertises its endpoints on :5301, where its pages are.
      '/connect': { target: 'http://localhost:5300', changeOrigin: false },
      '/.well-known': { target: 'http://localhost:5300', changeOrigin: false },
      // Results from LabFlow and ClinicReport (FHIR DiagnosticReport).
      '/fhir': { target: 'http://localhost:5300', changeOrigin: false },
    },
  },
})`},"run/settings":{file:"src/ClinicHub.Api/appsettings.Development.json",start:2,end:5,code:`"ConnectionStrings": {
  "Catalog": "Server=.;Database=ClinicHub_Catalog;Integrated Security=True;TrustServerCertificate=True",
  "ClinicServer": "Server=.;Integrated Security=True;TrustServerCertificate=True"
},`},"run/demo":{file:"src/ClinicHub.Api/Program.cs",start:64,end:65,code:`if (services.GetRequiredService<IOptions<DemoOptions>>().Value.Enabled)
    await DemoSeeder.SeedAsync(services.GetRequiredService<CatalogDbContext>(), provisioning, services.GetRequiredService<ClinicDatabases>(),`},"tests/prefix":{file:"tests/ClinicHub.Tests/FrontDeskTests.cs",start:15,end:17,code:`private readonly string _server = Environment.GetEnvironmentVariable("CLINICHUB_TEST_SQL")
    ?? "Server=.;Integrated Security=True;TrustServerCertificate=True";
private readonly string _prefix = $"ClinicHub_Test_{Guid.NewGuid():N}_";`},"tests/settings":{file:"tests/ClinicHub.Tests/FrontDeskTests.cs",start:23,end:27,code:`builder.UseEnvironment("Testing");
builder.UseSetting("ConnectionStrings:Catalog", Catalog);
builder.UseSetting("ConnectionStrings:ClinicServer", _server);
builder.UseSetting("Clinics:DatabasePrefix", _prefix);
builder.UseSetting("Demo:Enabled", "true");`},"tests/drop":{file:"tests/ClinicHub.Tests/FrontDeskTests.cs",start:82,end:98,code:`async Task IAsyncLifetime.DisposeAsync()
{
    await base.DisposeAsync();
    SqlConnection.ClearAllPools();
    await using var conn = new SqlConnection(_server);
    await conn.OpenAsync();
    var names = new List<string>();
    await using (var list = new SqlCommand("SELECT name FROM sys.databases WHERE name LIKE @p", conn))
    {
        list.Parameters.AddWithValue("@p", _prefix + "%");
        await using var r = await list.ExecuteReaderAsync();
        while (await r.ReadAsync()) names.Add(r.GetString(0));
    }
    foreach (var name in names)
    {
        await using var drop = new SqlCommand($"ALTER DATABASE [{name}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [{name}];", conn);
        await drop.ExecuteNonQueryAsync();`},"tests/signin":{file:"tests/ClinicHub.Tests/FrontDeskTests.cs",start:67,end:77,code:`public async Task<HttpClient> SignInAsync(string user, string clinic = "harbourview", bool followRedirects = true)
{
    var c = CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true, AllowAutoRedirect = followRedirects });
    c.DefaultRequestHeaders.Add("X-ClinicHub", "1");
    var me = await (await c.PostAsJsonAsync("/api/auth/demo-login", new { userName = user })).EnsureSuccessStatusCode().Content.ReadFromJsonAsync<JsonNode>();
    if (me!["clinic"] is null)
    {
        var id = me["clinics"]!.AsArray().Single(x => (string)x!["slug"]! == clinic)!["id"]!.GetValue<int>();
        (await c.PostAsJsonAsync("/api/auth/clinic", new { clinicId = id })).EnsureSuccessStatusCode();
    }
    return c;`},"tests/fake":{file:"tests/ClinicHub.Tests/FrontDeskTests.cs",start:55,end:60,code:`builder.UseSetting("Integrations:PollSeconds", "0");
builder.UseSetting("Integrations:LabFlow:FhirBaseUrl", "https://lab.test/fhir");
builder.UseSetting("Integrations:ClinicReport:FhirBaseUrl", "https://report.test/fhir");
builder.UseSetting("Integrations:PharmaFlow:FhirBaseUrl", "https://pharmacy.test/fhir");
builder.ConfigureTestServices(services =>
    services.AddHttpClient(ClinicHub.Api.Integrations.OutboxDispatcher.HttpClientName).ConfigurePrimaryHttpMessageHandler(() => Fhir));`},"startup/secrets":{file:"src/ClinicHub.Api/Program.cs",start:13,end:14,code:`// Secrets as files, one per setting (e.g. ConnectionStrings__Finance), the way Docker mounts them; none outside a container.
builder.Configuration.AddKeyPerFile("/run/secrets", optional: true);`},"startup/upgrade":{file:"src/ClinicHub.Api/Program.cs",start:55,end:66,code:`using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var provisioning = services.GetRequiredService<ClinicProvisioning>();
    await provisioning.UpgradeAllAsync();
    await SsoSetup.RegisterClientsAsync(services);
    // A one-off command (seed-demo, admin): run it and exit instead of serving.
    if (await AdminCommands.RunAsync(args, services))
        return;
    if (services.GetRequiredService<IOptions<DemoOptions>>().Value.Enabled)
        await DemoSeeder.SeedAsync(services.GetRequiredService<CatalogDbContext>(), provisioning, services.GetRequiredService<ClinicDatabases>(),
            services.GetRequiredService<IPasswordHasher<Account>>(), services.GetRequiredService<TimeProvider>().GetUtcNow().UtcDateTime);`},"startup/pipeline":{file:"src/ClinicHub.Api/Program.cs",start:82,end:90,code:`app.UseDefaultFiles();
app.UseStaticFiles();
if (app.Environment.IsDevelopment())
    app.MapOpenApi().AllowAnonymous();
app.UseRateLimiter();
app.UseSsoCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseCsrfHeaderCheck();`},"startup/noclinic":{file:"src/ClinicHub.Api/Program.cs",start:72,end:81,code:`// Clinic data asked for before a clinic was chosen: tell the page to show the clinic picker.
app.Use(async (ctx, next) =>
{
    try { await next(); }
    catch (NoClinicException ex) when (!ctx.Response.HasStarted)
    {
        ctx.Response.StatusCode = StatusCodes.Status409Conflict;
        await ctx.Response.WriteAsJsonAsync(new { title = ex.Message, chooseClinic = true });
    }
});`},"clinic-db/scoped":{file:"src/ClinicHub.Api/Catalog/ClinicDatabases.cs",start:85,end:90,code:`services.AddScoped(sp =>
{
    var user = sp.GetRequiredService<IHttpContextAccessor>().HttpContext?.User;
    var clinicId = user?.ClinicId() ?? throw new NoClinicException();
    return sp.GetRequiredService<ClinicDatabases>().Open(clinicId);
});`},"clinic-db/open":{file:"src/ClinicHub.Api/Catalog/ClinicDatabases.cs",start:37,end:47,code:`public async Task<ClinicHubDbContext> OpenAsync(int clinicId)
{
    if (!_connections.TryGetValue(clinicId, out var cs))
    {
        using var scope = scopes.CreateScope();
        var catalog = scope.ServiceProvider.GetRequiredService<CatalogDbContext>();
        var clinic = await catalog.Clinics.AsNoTracking().SingleOrDefaultAsync(c => c.Id == clinicId && c.IsActive)
            ?? throw new NoClinicException();
        cs = _connections[clinicId] = ConnectionStringFor(clinic);
    }
    return Create(cs);`},"clinic-db/connection":{file:"src/ClinicHub.Api/Catalog/ClinicDatabases.cs",start:29,end:31,code:`public string ConnectionStringFor(Clinic clinic) => clinic.ConnectionString is { } protectedValue
    ? protection.CreateProtector(ConnectionPurpose).Unprotect(protectedValue)
    : new SqlConnectionStringBuilder(Server) { InitialCatalog = clinic.DatabaseName }.ConnectionString;`},"clinic-db/sync":{file:"src/ClinicHub.Api/Catalog/ClinicDatabases.cs",start:50,end:52,code:`/// <summary>For dependency injection, which cannot await. Cookie validation has already cached the clinic by then.</summary>
public ClinicHubDbContext Open(int clinicId) =>
    _connections.TryGetValue(clinicId, out var cs) ? Create(cs) : OpenAsync(clinicId).GetAwaiter().GetResult();`},"clinic-db/retry":{file:"src/ClinicHub.Api/Catalog/ClinicDatabases.cs",start:56,end:57,code:`public static ClinicHubDbContext Create(string connectionString) =>
    new(new DbContextOptionsBuilder<ClinicHubDbContext>().UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure()).Options);`},"clinic-db/dropped":{file:"src/ClinicHub.Api/Auth/AuthSetup.cs",start:102,end:110,code:`// A clinic the person no longer belongs to (or that was closed) is dropped; they choose again.
var clinicId = ctx.Principal!.ClinicId();
if (clinicId is not null && !Access.Clinics(account).Any(c => c.Id == clinicId))
    clinicId = null;
int? providerId = null;
if (clinicId is not null)
{
    await using var clinicDb = await ctx.HttpContext.RequestServices.GetRequiredService<ClinicDatabases>().OpenAsync(clinicId.Value);
    providerId = await clinicDb.Providers.Where(p => p.UserId == account.Id).Select(p => (int?)p.Id).FirstOrDefaultAsync();`},"provisioning/create":{file:"src/ClinicHub.Api/Catalog/ClinicProvisioning.cs",start:14,end:39,code:`public async Task<Clinic> CreateAsync(string slug, string name, int? creatorAccountId)
{
    var now = clock.GetUtcNow().UtcDateTime;
    var clinic = new Clinic { Slug = slug, Name = name, DatabaseName = options.Value.DatabasePrefix + slug, CreatedUtc = now };
    catalog.Clinics.Add(clinic);
    await catalog.SaveChangesAsync();
    await EnsureRolesAsync(clinic);
    await databases.MigrateAsync(clinic);
    // A first location under the clinic's name, so the day board works from the start; address and rooms are filled in later.
    await using (var clinicDb = databases.Open(clinic))
    {
        clinicDb.Locations.Add(new Data.Location { Name = name });
        await clinicDb.SaveChangesAsync();
    }

    if (creatorAccountId is { } creator)
    {
        var admin = await catalog.Roles.SingleAsync(r => r.ClinicId == clinic.Id && r.Name == SystemRoles.Administrator);
        catalog.AccountRoles.Add(new AccountRole { AccountId = creator, RoleId = admin.Id });
        await catalog.SaveChangesAsync();
        var account = await catalog.Accounts.SingleAsync(a => a.Id == creator);
        await using var db = databases.Open(clinic);
        await StaffSync.EnsureAsync(db, account, member: true, now);
    }
    await log.WriteAsync(SecurityEventTypes.ClinicCreated, creatorAccountId, detail: $"{clinic.Name} ({clinic.Slug}, database {clinic.DatabaseName})", clinicId: clinic.Id);
    return clinic;`},"provisioning/roles":{file:"src/ClinicHub.Api/Catalog/ClinicProvisioning.cs",start:46,end:63,code:`public async Task EnsureRolesAsync(Clinic clinic)
{
    var tracked = await catalog.Clinics.SingleAsync(c => c.Id == clinic.Id);
    // Clinics opened before this was tracked knew ClinicHub's own permissions, none of the other applications'.
    var known = (tracked.KnownPermissions is null ? Permissions.All.Where(p => !p.Contains(':')) : Permissions.Parse(tracked.KnownPermissions)).ToHashSet();
    var fresh = Permissions.All.Where(p => !known.Contains(p)).ToHashSet();
    var existing = await catalog.Roles.Where(r => r.ClinicId == clinic.Id).ToDictionaryAsync(r => r.Name);
    foreach (var (name, description, permissions) in SystemRoles.Defaults)
    {
        if (!existing.TryGetValue(name, out var role))
            catalog.Roles.Add(new Role { ClinicId = clinic.Id, Name = name, Description = description, Permissions = Permissions.Format(permissions), IsSystem = true });
        else if (role.IsSystem && permissions.Any(fresh.Contains))
            role.Permissions = Permissions.Format(Permissions.Parse(role.Permissions).Union(permissions.Where(fresh.Contains)));
    }
    if (existing.TryGetValue(SystemRoles.Administrator, out var admin))
        admin.Permissions = Permissions.Format(Permissions.All);
    tracked.KnownPermissions = Permissions.Format(Permissions.All);
    await catalog.SaveChangesAsync();`},"provisioning/validate":{file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",start:303,end:307,code:`var slug = (req.Slug ?? "").Trim().ToLowerInvariant();
if (slug.Length is < 2 or > 40 || !slug.All(c => char.IsAsciiLetterLower(c) || char.IsAsciiDigit(c) || c == '-'))
    errors["slug"] = ["2–40 lower-case letters, digits or dashes."];
else if (await catalog.Clinics.AnyAsync(c => c.Slug == slug))
    errors["slug"] = ["Another clinic uses this name."];`},"provisioning/all":{file:"src/ClinicHub.Api/Catalog/ClinicProvisioning.cs",start:67,end:73,code:`public async Task UpgradeAllAsync()
{
    await catalog.Database.MigrateAsync();
    foreach (var clinic in await catalog.Clinics.Where(c => c.IsActive).ToListAsync())
    {
        await EnsureRolesAsync(clinic);
        await databases.MigrateAsync(clinic);`},"provisioning/staff":{file:"src/ClinicHub.Api/Catalog/SecurityLog.cs",start:28,end:41,code:`public static async Task EnsureAsync(ClinicHubDbContext clinicDb, Account account, bool member, DateTime now)
{
    var copy = await clinicDb.Users.SingleOrDefaultAsync(u => u.Id == account.Id);
    if (copy is null)
    {
        if (!member)
            return;
        clinicDb.Users.Add(copy = new User { Id = account.Id });
    }
    copy.UserName = account.UserName;
    copy.DisplayName = account.DisplayName;
    copy.Credentials = account.Credentials;
    copy.IsActive = member && account.IsActive;
    copy.SyncedUtc = now;`},"sign-in/lockout":{file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",start:49,end:54,code:`if (account?.LockoutEndUtc is { } until && until > now.UtcDateTime)
{
    await log.WriteAsync(SecurityEventTypes.LoginFailed, null, account.Id, "Account locked");
    return Results.Problem($"Too many failed attempts. Try again after {Math.Ceiling((until - now.UtcDateTime).TotalMinutes)} minutes, or ask an administrator to unlock the account.",
        statusCode: StatusCodes.Status423Locked);
}`},"sign-in/failed":{file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",start:75,end:84,code:`async Task<IResult> Failed(Account? a, string detail, string message, bool twoFactor = false)
{
    if (a is not null && ++a.FailedLoginCount >= MaxFailedLogins)
    {
        a.FailedLoginCount = 0;
        a.LockoutEndUtc = now.UtcDateTime + LockoutDuration;
        log.Add(SecurityEventTypes.LockedOut, a.Id);
    }
    log.Add(SecurityEventTypes.LoginFailed, a?.Id, detail: a is null ? $"Unknown user name \\"{Short(userName)}\\"" : detail);
    await catalog.SaveChangesAsync();`},"sign-in/rate":{file:"src/ClinicHub.Api/Program.cs",start:44,end:51,code:`var loginsPerMinute = builder.Configuration.GetValue("RateLimits:LoginsPerMinute", 10);
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy(AuthEndpoints.LoginRateLimit, ctx => RateLimitPartition.GetFixedWindowLimiter(
        ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = loginsPerMinute, Window = TimeSpan.FromMinutes(1) }));
});`},"sign-in/dummy":{file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",start:56,end:59,code:`// Hash even when the account does not exist so timing does not reveal valid user names.
var result = hasher.VerifyHashedPassword(account ?? new Account(), account?.PasswordHash ?? DummyHash, req.Password ?? "");
if (account is null || result == PasswordVerificationResult.Failed)
    return await Failed(account, "Wrong password", "Wrong user name or password.");`},"sign-in/single":{file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",start:202,end:215,code:`/// <summary>Signs in, straight into the clinic when the person belongs to only one.</summary>
private static async Task<IResult> SignIn(CatalogDbContext catalog, ClinicDatabases clinics, SecurityLog log, Account account,
    DateTime now, HttpContext http, string how)
{
    account.FailedLoginCount = 0;
    account.LockoutEndUtc = null;
    account.LastLoginUtc = now;
    log.Add(SecurityEventTypes.LoginSucceeded, account.Id, detail: how);
    await catalog.SaveChangesAsync();
    var memberOf = Access.Clinics(account).ToList();
    if (memberOf.Count == 1)
        return Results.Ok(await EnterClinic(clinics, log, account, memberOf[0].Id, now, http));
    await AuthSetup.SignInAsync(http, account, null);
    return Results.Ok(ToMe(account, AuthSetup.CreatePrincipal(account, null)));`},"sign-in/code":{file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",start:63,end:71,code:`if (account.TwoFactorEnabled)
{
    if (string.IsNullOrWhiteSpace(req.Code))
        return Results.Problem("Enter the 6-digit code from your authenticator app.", statusCode: StatusCodes.Status401Unauthorized,
            extensions: new Dictionary<string, object?> { ["twoFactorRequired"] = true });
    var secret = protection.CreateProtector(TwoFactorPurpose).Unprotect(account.TwoFactorSecret!);
    if (Totp.Verify(secret, req.Code, now, account.TwoFactorLastStep) is not { } step)
        return await Failed(account, "Wrong two-factor code", "That code is wrong or already used.", twoFactor: true);
    account.TwoFactorLastStep = step;`},"sign-in/rehash":{file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",start:60,end:61,code:`if (result == PasswordVerificationResult.SuccessRehashNeeded)
    account.PasswordHash = hasher.HashPassword(account, req.Password!);`},"sign-in/unlock":{file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",start:163,end:169,code:`// Unlocking only ends a lockout early; any administrator of a clinic the person works at may do it.
var account = await Members(catalog, me.RequiredClinicId()).SingleOrDefaultAsync(a => a.Id == id);
if (account is null)
    return Results.NotFound();
account.FailedLoginCount = 0;
account.LockoutEndUtc = null;
log.Add(SecurityEventTypes.UserUnlocked, me.RequiredUserId(), id, clinicId: me.RequiredClinicId());`},"sign-in/enter":{file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",start:218,end:226,code:`private static async Task<MeDto> EnterClinic(ClinicDatabases clinics, SecurityLog log, Account account, int clinicId, DateTime now, HttpContext http)
{
    int? providerId;
    await using (var clinicDb = await clinics.OpenAsync(clinicId))
    {
        await StaffSync.EnsureAsync(clinicDb, account, member: true, now);
        providerId = await clinicDb.Providers.Where(p => p.UserId == account.Id).Select(p => (int?)p.Id).FirstOrDefaultAsync();
    }
    await log.WriteAsync(SecurityEventTypes.ClinicSelected, account.Id, clinicId: clinicId);`},"session/cookie":{file:"src/ClinicHub.Api/Auth/AuthSetup.cs",start:65,end:75,code:`o.Cookie.Name = "clinichub.auth";
o.Cookie.HttpOnly = true;
// Lax, not Strict: an application on another site (ClinicReport) sends people here to sign in, and
// that navigation must carry the session. Unsafe API calls still need the X-ClinicHub header.
o.Cookie.SameSite = SameSiteMode.Lax;
o.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
o.ExpireTimeSpan = TimeSpan.FromHours(10);
o.SlidingExpiration = true;
o.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = 401; return Task.CompletedTask; };
o.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = 403; return Task.CompletedTask; };
o.Events.OnValidatePrincipal = LoadCurrentAccess;`},"session/validate":{file:"src/ClinicHub.Api/Auth/AuthSetup.cs",start:90,end:112,code:`private static async Task LoadCurrentAccess(CookieValidatePrincipalContext ctx)
{
    var id = ctx.Principal?.UserId();
    var stamp = ctx.Principal?.FindFirstValue(AppClaims.Stamp);
    var catalog = ctx.HttpContext.RequestServices.GetRequiredService<CatalogDbContext>();
    var account = id is null ? null : await catalog.Accounts.AsNoTracking().WithRoles().SingleOrDefaultAsync(a => a.Id == id);
    if (account is null || !account.IsActive || account.SecurityStamp != stamp)
    {
        ctx.RejectPrincipal();
        await ctx.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return;
    }
    // A clinic the person no longer belongs to (or that was closed) is dropped; they choose again.
    var clinicId = ctx.Principal!.ClinicId();
    if (clinicId is not null && !Access.Clinics(account).Any(c => c.Id == clinicId))
        clinicId = null;
    int? providerId = null;
    if (clinicId is not null)
    {
        await using var clinicDb = await ctx.HttpContext.RequestServices.GetRequiredService<ClinicDatabases>().OpenAsync(clinicId.Value);
        providerId = await clinicDb.Providers.Where(p => p.UserId == account.Id).Select(p => (int?)p.Id).FirstOrDefaultAsync();
    }
    ctx.ReplacePrincipal(CreatePrincipal(account, clinicId, providerId));`},"session/access":{file:"src/ClinicHub.Api/Auth/AuthSetup.cs",start:32,end:43,code:`public static Access For(Account account, int? clinicId)
{
    var roles = account.Roles.Select(ar => ar.Role).Where(r => clinicId != null && r.ClinicId == clinicId).ToList();
    var permissions = roles.Any(r => r.IsSystem && r.Name == SystemRoles.Administrator)
        ? Auth.Permissions.All
        : Auth.Permissions.All.Where(p => roles.Any(r => Auth.Permissions.Parse(r.Permissions).Contains(p))).ToArray();
    // A role anywhere that requires two-factor protects the whole account: it is one sign-in for every clinic.
    var twoFactorRequired = account.Roles.Any(ar => ar.Role.RequireTwoFactor);
    var pending = account.MustChangePassword ? PendingActions.ChangePassword
        : twoFactorRequired && !account.TwoFactorEnabled ? PendingActions.SetupTwoFactor
        : null;
    return new Access(roles.Select(r => r.Name).OrderBy(n => n).ToArray(), pending is null ? permissions : [], twoFactorRequired, pending);`},"session/fallback":{file:"src/ClinicHub.Api/Auth/AuthSetup.cs",start:78,end:82,code:`var auth = services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());
foreach (var p in Permissions.All)
    auth.AddPolicy(p, policy => policy.RequireClaim(AppClaims.Permission, p));
auth.AddPolicy(PlatformAdmin, policy => policy.RequireClaim(PlatformAdmin, "true"));`},"session/csrf":{file:"src/ClinicHub.Api/Auth/AuthSetup.cs",start:152,end:161,code:`public static IApplicationBuilder UseCsrfHeaderCheck(this IApplicationBuilder app) => app.Use(async (ctx, next) =>
{
    var unsafeMethod = !(HttpMethods.IsGet(ctx.Request.Method) || HttpMethods.IsHead(ctx.Request.Method) || HttpMethods.IsOptions(ctx.Request.Method));
    if (unsafeMethod && ctx.Request.Path.StartsWithSegments("/api") && !ctx.Request.Headers.ContainsKey(CsrfHeader))
    {
        ctx.Response.StatusCode = StatusCodes.Status400BadRequest;
        await ctx.Response.WriteAsJsonAsync(new { title = $"Missing {CsrfHeader} header." });
        return;
    }
    await next();`},"session/client":{file:"web/src/api.ts",start:39,end:54,code:`async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: { 'X-ClinicHub': '1', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return undefined as T
  const text = await res.text()
  const data = text ? JSON.parse(text) : undefined
  if (!res.ok) {
    if (res.status === 401 && !url.startsWith('/api/auth/')) window.dispatchEvent(new Event('clinichub:signed-out'))
    // Problem details: the specific message is in detail; title is the generic status text unless no detail was given.
    throw new ApiError(res.status, data?.detail ?? data?.title ?? \`Request failed (\${res.status})\`, data?.errors ?? {}, data ?? {})
  }
  return data as T`},"two-factor/code":{file:"src/ClinicHub.Api/Auth/Totp.cs",start:23,end:31,code:`public static string Code(string secret, long step)
{
    var counter = BitConverter.GetBytes(step);
    if (BitConverter.IsLittleEndian)
        Array.Reverse(counter);
    var hash = HMACSHA1.HashData(Base32Decode(secret), counter);
    var offset = hash[^1] & 0x0F;
    var binary = ((hash[offset] & 0x7F) << 24) | (hash[offset + 1] << 16) | (hash[offset + 2] << 8) | hash[offset + 3];
    return (binary % 1_000_000).ToString("D6");`},"two-factor/verify":{file:"src/ClinicHub.Api/Auth/Totp.cs",start:38,end:52,code:`public static long? Verify(string secret, string? code, DateTimeOffset now, long lastUsedStep)
{
    code = new string((code ?? "").Where(char.IsDigit).ToArray());
    if (code.Length != 6)
        return null;
    var current = StepAt(now);
    for (var step = current - 1; step <= current + 1; step++)
    {
        if (step <= lastUsedStep)
            continue;
        if (CryptographicOperations.FixedTimeEquals(Encoding.ASCII.GetBytes(Code(secret, step)), Encoding.ASCII.GetBytes(code)))
            return step;
    }
    return null;
}`},"two-factor/setup":{file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",start:147,end:155,code:`account.MapPost("/two-factor/setup", async (ClaimsPrincipal principal, CatalogDbContext catalog, IDataProtectionProvider protection) =>
{
    var a = (await LoadAccount(catalog, principal.RequiredUserId(), tracked: true))!;
    if (a.TwoFactorEnabled)
        return Results.Problem("Two-factor sign-in is already on. Turn it off first to use a new device.", statusCode: StatusCodes.Status409Conflict);
    var secret = Totp.NewSecret();
    a.TwoFactorSecret = protection.CreateProtector(TwoFactorPurpose).Protect(secret);
    await catalog.SaveChangesAsync();
    return Results.Ok(new TwoFactorSetup(secret, Totp.OtpAuthUri("ClinicHub", a.UserName, secret)));`},"two-factor/pending":{file:"src/ClinicHub.Api/Auth/AuthSetup.cs",start:40,end:42,code:`var pending = account.MustChangePassword ? PendingActions.ChangePassword
    : twoFactorRequired && !account.TwoFactorEnabled ? PendingActions.SetupTwoFactor
    : null;`},"two-factor/uri":{file:"src/ClinicHub.Api/Auth/Totp.cs",start:15,end:19,code:`public static string NewSecret() => Base32Encode(RandomNumberGenerator.GetBytes(20));

public static string OtpAuthUri(string issuer, string account, string secret) =>
    $"otpauth://totp/{Uri.EscapeDataString(issuer)}:{Uri.EscapeDataString(account)}" +
    $"?secret={secret}&issuer={Uri.EscapeDataString(issuer)}&algorithm=SHA1&digits=6&period={StepSeconds}";`},"two-factor/enable":{file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",start:162,end:171,code:`if (a.TwoFactorEnabled || a.TwoFactorSecret is null)
    return Results.Problem("Start the setup first.", statusCode: StatusCodes.Status409Conflict);
var secret = protection.CreateProtector(TwoFactorPurpose).Unprotect(a.TwoFactorSecret);
if (Totp.Verify(secret, body.Code, clock.GetUtcNow(), a.TwoFactorLastStep) is not { } step)
    return Results.ValidationProblem(new Dictionary<string, string[]> { ["code"] = ["That code doesn't match. Check the phone's clock and try the newest code."] });
a.TwoFactorEnabled = true;
a.TwoFactorLastStep = step;
log.Add(SecurityEventTypes.TwoFactorEnabled, a.Id);
await catalog.SaveChangesAsync();
await AuthSetup.SignInAsync(http, a, principal.ClinicId());`},"two-factor/disable":{file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",start:179,end:184,code:`if (Access.For(a, null).TwoFactorRequired)
    return Results.Problem("One of your roles requires two-factor sign-in.", statusCode: StatusCodes.Status409Conflict);
if (hasher.VerifyHashedPassword(a, a.PasswordHash, body.Password ?? "") == PasswordVerificationResult.Failed)
    return Results.ValidationProblem(new Dictionary<string, string[]> { ["password"] = ["Password is wrong."] });
a.TwoFactorEnabled = false;
a.TwoFactorSecret = null;`},"permissions/keys":{file:"src/ClinicHub.Api/Auth/Permissions.cs",start:11,end:14,code:`public const string PatientsView = "patients.view";
public const string PatientsEdit = "patients.edit";
public const string PatientsMerge = "patients.merge";
public const string ScheduleView = "schedule.view";`},"permissions/appkeys":{file:"src/ClinicHub.Api/Auth/Permissions.cs",start:51,end:55,code:`// LabFlow: the laboratory.
public const string LabFrontDesk = "labflow:frontdesk";
public const string LabResultsView = "labflow:results.view";
public const string LabResultsEnter = "labflow:results.enter";
public const string LabAdmin = "labflow:admin";`},"permissions/forapp":{file:"src/ClinicHub.Api/Auth/Permissions.cs",start:134,end:135,code:`public static string[] ForApp(IEnumerable<string> granted, string app) =>
    granted.Where(p => p.StartsWith(app + ":", StringComparison.Ordinal)).Select(p => p[(app.Length + 1)..]).ToArray();`},"permissions/defaults":{file:"src/ClinicHub.Api/Auth/Permissions.cs",start:162,end:164,code:`(FrontDesk, "Registration, booking and check-in; lab bookings.",
    [Permissions.PatientsView, Permissions.PatientsEdit, Permissions.ScheduleView, Permissions.ScheduleManage, Permissions.BillingView,
     Permissions.LabFrontDesk]),`},"permissions/policy":{file:"src/ClinicHub.Api/Auth/AuthSetup.cs",start:80,end:81,code:`foreach (var p in Permissions.All)
    auth.AddPolicy(p, policy => policy.RequireClaim(AppClaims.Permission, p));`},"permissions/parse":{file:"src/ClinicHub.Api/Auth/Permissions.cs",start:137,end:138,code:`public static string[] Parse(string? stored) =>
    (stored ?? "").Split(' ', StringSplitOptions.RemoveEmptyEntries).Where(All.Contains).Distinct().ToArray();`},"permissions/lastadmin":{file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",start:395,end:397,code:`return candidates.Any(a => Access.For(new Account { Roles = a.Roles }, clinicId).Permissions.Contains(Permissions.UsersManage))
    ? null
    : "At least one person must keep the \\"Manage users and roles\\" permission in this clinic.";`},"logs/security":{file:"src/ClinicHub.Api/Catalog/SecurityLog.cs",start:7,end:21,code:`public class SecurityLog(CatalogDbContext catalog, IHttpContextAccessor http, TimeProvider clock)
{
    /// <summary>Adds an event; it is saved with the caller's next SaveChanges on the catalog.</summary>
    public void Add(string type, int? actor, int? target = null, string? detail = null, int? clinicId = null) =>
        catalog.SecurityEvents.Add(new SecurityEvent
        {
            AtUtc = clock.GetUtcNow().UtcDateTime, Type = type, ClinicId = clinicId, ActorAccountId = actor, TargetAccountId = target,
            Detail = detail is { Length: > 500 } ? detail[..500] : detail,
            IpAddress = http.HttpContext?.Connection.RemoteIpAddress?.ToString(),
        });

    public async Task WriteAsync(string type, int? actor, int? target = null, string? detail = null, int? clinicId = null)
    {
        Add(type, actor, target, detail, clinicId);
        await catalog.SaveChangesAsync();`},"logs/access":{file:"src/ClinicHub.Api/Data/Security.cs",start:32,end:44,code:`/// <summary>Every open, edit, print or export of a patient's record (PHIPA: "who has looked at my record?").</summary>
public class PatientAccessLog
{
    public long Id { get; set; }
    public DateTime AtUtc { get; set; }
    public int UserId { get; set; }
    public int PatientId { get; set; }
    [MaxLength(10)] public string Action { get; set; } = AccessActions.View;

    /// <summary>What was opened, e.g. "Encounter 120", "Chart", "Invoice 33".</summary>
    [MaxLength(60)] public string Context { get; set; } = "";
    public int? ConsentOverrideId { get; set; }
    [MaxLength(64)] public string? IpAddress { get; set; }`},"logs/write":{file:"src/ClinicHub.Api/Endpoints/FrontDeskEndpoints.cs",start:67,end:68,code:`db.PatientAccessLog.Add(new PatientAccessLog { AtUtc = now, UserId = userId, PatientId = appt.PatientId, Action = AccessActions.Edit,
    Context = $"Check-in, appointment {appt.Id}", IpAddress = AuthEndpoints.Ip(http) });`},"logs/auditq":{file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",start:261,end:262,code:`var q = catalog.SecurityEvents.AsNoTracking().Where(e => e.ClinicId == clinicId
    || (e.ClinicId == null && ((e.ActorAccountId != null && members.Contains(e.ActorAccountId.Value)) || (e.TargetAccountId != null && members.Contains(e.TargetAccountId.Value)))));`},"logs/merged":{file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",start:277,end:278,code:`// A patient's log includes the records merged into theirs: same person, opened under an older MRN.
if (patientId is not null) q = q.Where(l => l.PatientId == patientId || db.Patients.Any(p => p.Id == l.PatientId && p.MergedIntoPatientId == patientId));`},"sso/authorize":{file:"src/ClinicHub.Api/Sso/SsoEndpoints.cs",start:58,end:81,code:`var cookie = await http.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
if (request.HasPromptValue(PromptValues.Login))
{
    await http.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    return ToClinicHub();
}
if (!cookie.Succeeded)
    return request.HasPromptValue(PromptValues.None) ? Refuse(Errors.LoginRequired, "Not signed in to ClinicHub.") : ToClinicHub();

var principal = cookie.Principal!;
var account = await catalog.Accounts.AsNoTracking().WithRoles().SingleOrDefaultAsync(a => a.Id == principal.UserId() && a.IsActive);
if (account is null)
    return ToClinicHub();
var clinicId = principal.ClinicId();
var access = Access.For(account, clinicId);
if (access.Pending is not null || clinicId is null)
    return request.HasPromptValue(PromptValues.None) ? Refuse(Errors.InteractionRequired, "Finish signing in to ClinicHub first.") : ToClinicHub();

var appPermissions = Permissions.ForApp(access.Permissions, http.RequestServices.GetRequiredService<IOptions<SsoOptions>>().Value.AppOf(request.ClientId!));
var clinic = account.Roles.Select(r => r.Role.Clinic).First(c => c.Id == clinicId);
if (appPermissions.Length == 0)
{
    await log.WriteAsync(SecurityEventTypes.SsoRefused, account.Id, detail: $"{request.ClientId}: no permission", clinicId: clinicId);
    return Refuse(Errors.AccessDenied, $"No role you hold at {clinic.Name} gives access to {request.ClientId}.");`},"sso/token":{file:"src/ClinicHub.Api/Sso/SsoEndpoints.cs",start:116,end:124,code:`var account = await catalog.Accounts.AsNoTracking().WithRoles().SingleOrDefaultAsync(a => a.Id == accountId && a.IsActive);
if (account is null || account.SecurityStamp != previous.GetClaim(SsoClaims.Stamp))
    return Refuse(Errors.InvalidGrant, "The ClinicHub session has ended. Sign in again.");

var access = Access.For(account, clinicId);
var appPermissions = Permissions.ForApp(access.Permissions, http.RequestServices.GetRequiredService<IOptions<SsoOptions>>().Value.AppOf(request.ClientId!));
var clinic = account.Roles.Select(r => r.Role.Clinic).FirstOrDefault(c => c.Id == clinicId);
if (clinic is null || appPermissions.Length == 0)
    return Refuse(Errors.InvalidGrant, "Access to this application at this clinic has been removed.");`},"sso/clientcreds":{file:"src/ClinicHub.Api/Sso/SsoEndpoints.cs",start:96,end:107,code:`if (request.IsClientCredentialsGrantType())
{
    // An application on its own behalf (OpenIddict has already checked its secret): it may send results here, and
    // financial documents to FinancePowerApp (a token for the audience "finance").
    var app = new ClaimsIdentity(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme, Claims.Name, Claims.Role);
    app.SetClaim(Claims.Subject, request.ClientId).SetClaim(Claims.ClientId, request.ClientId);
    var scopes = request.GetScopes().Intersect([SsoClaims.ResultsScope, SsoClaims.FinanceScope]).ToList();
    app.SetScopes(scopes);
    if (scopes.Contains(SsoClaims.FinanceScope))
        app.SetResources(SsoClaims.FinanceScope);
    app.SetDestinations(_ => [OpenIddictConstants.Destinations.AccessToken]);
    return Results.SignIn(new ClaimsPrincipal(app), properties: null, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);`},"frontdesk/transitions":{file:"src/ClinicHub.Api/Endpoints/FrontDeskEndpoints.cs",start:191,end:200,code:`private static readonly Dictionary<string, string[]> Transitions = new()
{
    [AppointmentStatus.Booked] = [AppointmentStatus.NoShow, AppointmentStatus.Cancelled],
    [AppointmentStatus.Arrived] = [AppointmentStatus.Roomed, AppointmentStatus.Cancelled],
    [AppointmentStatus.Roomed] = [AppointmentStatus.WithProvider],
    [AppointmentStatus.WithProvider] = [AppointmentStatus.Completed],
};

/// <summary>Check-in (Booked → Arrived) has its own endpoint because it validates the health card.</summary>
public static bool Allowed(string from, string to) => Transitions.TryGetValue(from, out var next) && next.Contains(to);`},"frontdesk/checkin":{file:"src/ClinicHub.Api/Endpoints/FrontDeskEndpoints.cs",start:40,end:70,code:`api.MapPost("/appointments/{id:int}/check-in", async (int id, CheckInRequest req, ClaimsPrincipal user, ClinicHubDbContext db, TimeProvider clock, HttpContext http) =>
{
    var appt = await db.Appointments.Include(a => a.Patient).Include(a => a.AppointmentType).SingleOrDefaultAsync(a => a.Id == id);
    if (appt is null)
        return Results.NotFound();
    if (appt.Status != AppointmentStatus.Booked)
        return Results.Problem($"Already {Words(appt.Status)}.", statusCode: StatusCodes.Status409Conflict);

    var now = clock.GetUtcNow().UtcDateTime;
    var userId = user.RequiredUserId();
    var reciprocal = await db.Provinces.ToDictionaryAsync(p => p.Code, p => p.ReciprocalBilling);
    var result = HcvSimulator.Check(appt.Patient, req.PresentedVersion, Today(clock), reciprocal);

    var check = new EligibilityCheck
    {
        PatientId = appt.PatientId, CheckedUtc = now, HealthCardNumber = appt.Patient.HealthCardNumber ?? "",
        HealthCardVersion = req.PresentedVersion ?? appt.Patient.HealthCardVersion, ResponseCode = result.Code,
        IsEligible = result.Eligible, Message = result.Message, CheckedByUserId = userId,
    };
    db.Encounters.Add(new Encounter
    {
        PatientId = appt.PatientId, ProviderId = appt.ProviderId, LocationId = appt.LocationId, Appointment = appt,
        EligibilityCheck = check, PaymentProgram = result.PaymentProgram, ReasonForVisit = appt.Reason, CheckInUtc = now,
        Kind = appt.Source == AppointmentSources.WalkIn ? EncounterKinds.WalkIn
            : appt.AppointmentType.Name == "Virtual visit" ? EncounterKinds.Virtual : EncounterKinds.Office,
    });
    Move(appt, AppointmentStatus.Arrived, now, userId);
    db.PatientAccessLog.Add(new PatientAccessLog { AtUtc = now, UserId = userId, PatientId = appt.PatientId, Action = AccessActions.Edit,
        Context = $"Check-in, appointment {appt.Id}", IpAddress = AuthEndpoints.Ip(http) });
    await db.SaveChangesAsync();
    return Results.Ok(new { eligibility = new EligibilityBrief(result.Code, result.Eligible, result.Message, result.PaymentProgram) });`},"frontdesk/room":{file:"src/ClinicHub.Api/Endpoints/FrontDeskEndpoints.cs",start:82,end:91,code:`if (req.Status == AppointmentStatus.Roomed)
{
    var room = await db.Rooms.SingleOrDefaultAsync(r => r.Id == req.RoomId && r.LocationId == appt.LocationId && r.IsActive);
    if (room is null)
        return Results.ValidationProblem(new Dictionary<string, string[]> { ["roomId"] = ["Pick a room."] });
    var occupied = await db.Appointments.AnyAsync(a => a.RoomId == room.Id && a.Id != appt.Id
        && (a.Status == AppointmentStatus.Roomed || a.Status == AppointmentStatus.WithProvider));
    if (occupied)
        return Results.Problem($"{room.Name} is occupied.", statusCode: StatusCodes.Status409Conflict);
    appt.RoomId = room.Id;`},"frontdesk/concurrency":{file:"src/ClinicHub.Api/Endpoints/FrontDeskEndpoints.cs",start:113,end:116,code:`catch (DbUpdateConcurrencyException)
{
    return Results.Problem("Someone else just changed this appointment. Refresh and try again.", statusCode: StatusCodes.Status409Conflict);
}`},"frontdesk/walkin":{file:"src/ClinicHub.Api/Endpoints/FrontDeskEndpoints.cs",start:132,end:138,code:`var providerId = req.ProviderId is { } chosen && walkInProviders.Contains(chosen) ? chosen
    : (await db.Appointments.Where(a => a.StartUtc >= dayStart && a.StartUtc < dayEnd && walkInProviders.Contains(a.ProviderId)
            && (a.Status == AppointmentStatus.Booked || a.Status == AppointmentStatus.Arrived))
        .GroupBy(a => a.ProviderId).Select(g => new { g.Key, Count = g.Count() }).ToListAsync())
      .Concat(walkInProviders.Select(p => new { Key = p, Count = 0 }))
      .GroupBy(x => x.Key).Select(g => new { Provider = g.Key, Count = g.Sum(x => x.Count) })
      .OrderBy(x => x.Count).First().Provider;`},"health-card/luhn":{file:"src/ClinicHub.Api/Domain/HealthCard.cs",start:16,end:32,code:`public static bool IsValidNumber(string? number)
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
    return sum % 10 == 0;`},"health-card/hcv":{file:"src/ClinicHub.Api/Domain/HcvSimulator.cs",start:15,end:38,code:`public static HcvResult Check(Patient patient, string? presentedVersion, DateOnly today, IReadOnlyDictionary<string, bool> reciprocalByProvince)
{
    if (patient.HealthCardNumber is null)
    {
        if (patient.CoverageProvince is { } p && p != "ON" && reciprocalByProvince.GetValueOrDefault(p))
            return new("RMB", true, PaymentPrograms.Rmb, $"Insured in {p}: bill OHIP under reciprocal medical billing.");
        if (patient.CoverageProvince == "QC")
            return new("QC", false, PaymentPrograms.Uninsured, "Quebec is not part of reciprocal billing: the patient pays and claims RAMQ.");
        return new("NONE", false, PaymentPrograms.Uninsured, "No provincial coverage on file: uninsured visit, the patient pays.");
    }

    if (!HealthCard.IsValidNumber(patient.HealthCardNumber))
        return new("INV", false, PaymentPrograms.Uninsured, "Health number fails the check digit. Re-enter it from the card.");

    var version = (presentedVersion ?? patient.HealthCardVersion ?? "").Trim().ToUpperInvariant();
    if (!HealthCard.IsValidVersion(version))
        return new("VFMT", false, PaymentPrograms.Uninsured, "Version code must be up to two letters.");
    if (!string.Equals(version, patient.HealthCardVersion ?? "", StringComparison.OrdinalIgnoreCase))
        return new("VER", false, PaymentPrograms.Uninsured, "Version code does not match the card on file. Ask for the current card.");

    if (patient.HealthCardExpiry is { } expiry && expiry < today)
        return new("EXP", false, PaymentPrograms.Uninsured, $"Card expired on {expiry:yyyy-MM-dd}. Ask the patient to renew at ServiceOntario.");

    return new("OK", true, PaymentPrograms.Hcp, "Eligible for OHIP-insured services.");`},"health-card/check":{file:"src/ClinicHub.Api/Data/ClinicHubDbContext.cs",start:142,end:142,code:`t.HasCheckConstraint("CK_Patient_HealthCard", "HealthCardNumber IS NULL OR (LEN(HealthCardNumber) = 10 AND HealthCardNumber NOT LIKE '%[^0-9]%')");`},"health-card/normalize":{file:"src/ClinicHub.Api/Domain/HealthCard.cs",start:9,end:10,code:`public static string Normalize(string input) =>
    new(input.Where(char.IsAsciiLetterOrDigit).ToArray());`},"health-card/form":{file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",start:549,end:552,code:`var card = Clean(f.HealthCardNumber) is { } c ? HealthCard.Normalize(c) : null;
Check(card is not null && !HealthCard.IsValidNumber(card), "healthCardNumber", "Not a valid Ontario health card number (10 digits, check digit).");
Check(!HealthCard.IsValidVersion(Clean(f.HealthCardVersion)?.ToUpperInvariant()), "healthCardVersion", "One or two letters.");
Check(card is null && Clean(f.HealthCardVersion) is not null, "healthCardVersion", "A version code needs a card number.");`},"health-card/record":{file:"src/ClinicHub.Api/Endpoints/FrontDeskEndpoints.cs",start:53,end:62,code:`var check = new EligibilityCheck
{
    PatientId = appt.PatientId, CheckedUtc = now, HealthCardNumber = appt.Patient.HealthCardNumber ?? "",
    HealthCardVersion = req.PresentedVersion ?? appt.Patient.HealthCardVersion, ResponseCode = result.Code,
    IsEligible = result.Eligible, Message = result.Message, CheckedByUserId = userId,
};
db.Encounters.Add(new Encounter
{
    PatientId = appt.PatientId, ProviderId = appt.ProviderId, LocationId = appt.LocationId, Appointment = appt,
    EligibilityCheck = check, PaymentProgram = result.PaymentProgram, ReasonForVisit = appt.Reason, CheckInUtc = now,`},"patients/score":{file:"src/ClinicHub.Api/Domain/PatientMatching.cs",start:23,end:55,code:`public static Match Score(Patient a, Patient b)
{
    if (a.HealthCardNumber is not null && a.HealthCardNumber == b.HealthCardNumber)
        return new(100, ["Same health card"]);

    var score = 0;
    var reasons = new List<string>();
    void Add(int points, string reason) { score += points; reasons.Add(reason); }

    if (a.DateOfBirth == b.DateOfBirth) Add(35, "Same date of birth");
    else if (OneDateTypo(a.DateOfBirth, b.DateOfBirth)) Add(20, "Date of birth differs by one typo");

    var (lastA, lastB) = (Name(a.LastName), Name(b.LastName));
    if (lastA == lastB) Add(25, "Same last name");
    else if (Distance(lastA, lastB) == 1) Add(18, "Last name differs by one letter");
    else if (Soundex(lastA) == Soundex(lastB)) Add(12, "Last name sounds the same");

    var (firstA, firstB) = (Name(a.FirstName), Name(b.FirstName));
    var preferredMatch = Name(a.PreferredName) is { Length: > 0 } pa && (pa == firstB || pa == Name(b.PreferredName))
        || Name(b.PreferredName) is { Length: > 0 } pb && pb == firstA;
    if (firstA == firstB) Add(20, "Same first name");
    else if (preferredMatch) Add(15, "First name matches a preferred name");
    else if (Distance(firstA, firstB) == 1) Add(15, "First name differs by one letter");
    else if (firstA.Length >= 3 && firstB.Length >= 3 && (firstA.StartsWith(firstB) || firstB.StartsWith(firstA))) Add(12, "Short form of the first name");

    if (Digits(a.Phone) is { Length: >= 7 } phone && phone == Digits(b.Phone)) Add(10, "Same phone");
    if (!string.IsNullOrWhiteSpace(a.Email) && string.Equals(a.Email.Trim(), b.Email?.Trim(), StringComparison.OrdinalIgnoreCase)) Add(10, "Same email");
    if (Postal(a.PostalCode) is { Length: 6 } postal && postal == Postal(b.PostalCode)) Add(5, "Same postal code");

    if (a.Sex is "M" or "F" or "X" && b.Sex is "M" or "F" or "X" && a.Sex != b.Sex) Add(-10, "Different sex");
    if (a.HealthCardNumber is not null && b.HealthCardNumber is not null) Add(-40, "Different health cards");

    return new(Math.Clamp(score, 0, 100), [.. reasons]);`},"patients/thresholds":{file:"src/ClinicHub.Api/Domain/PatientMatching.cs",start:15,end:19,code:`/// <summary>At or above this, the pair waits in the duplicates queue for a person to decide.</summary>
public const int Candidate = 60;

/// <summary>At or above this, registering the new record is stopped until the clerk confirms.</summary>
public const int Likely = 80;`},"patients/register":{file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",start:86,end:93,code:`var matches = PatientMatching.FindMatches(patient, await Neighbours(db, patient));
if (!req.ConfirmNew && matches.Any(m => m.Match.Score >= PatientMatching.Likely))
    return Results.Problem("This person may already be registered. Open the existing record, or confirm this is someone else.",
        statusCode: StatusCodes.Status409Conflict, extensions: new Dictionary<string, object?>
        {
            ["possibleDuplicates"] = matches.Select(m => new PossibleDuplicate(Brief(m.Other, today), m.Other.DateOfBirth, m.Other.Phone,
                m.Match.Score, m.Match.Reasons)).ToArray(),
        });`},"patients/moves":{file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",start:247,end:256,code:`await db.Appointments.Where(x => x.PatientId == from).ExecuteUpdateAsync(s => s.SetProperty(x => x.PatientId, to));
await db.Encounters.Where(x => x.PatientId == from).ExecuteUpdateAsync(s => s.SetProperty(x => x.PatientId, to));
await db.EligibilityChecks.Where(x => x.PatientId == from).ExecuteUpdateAsync(s => s.SetProperty(x => x.PatientId, to));
await db.Referrals.Where(x => x.PatientId == from).ExecuteUpdateAsync(s => s.SetProperty(x => x.PatientId, to));
await db.ServiceRequests.Where(x => x.PatientId == from).ExecuteUpdateAsync(s => s.SetProperty(x => x.PatientId, to));
await db.Prescriptions.Where(x => x.PatientId == from).ExecuteUpdateAsync(s => s.SetProperty(x => x.PatientId, to));
await db.Claims.Where(x => x.PatientId == from).ExecuteUpdateAsync(s => s.SetProperty(x => x.PatientId, to));
await db.Invoices.Where(x => x.PatientId == from).ExecuteUpdateAsync(s => s.SetProperty(x => x.PatientId, to));
await db.ConsentDirectives.Where(x => x.PatientId == from).ExecuteUpdateAsync(s => s.SetProperty(x => x.PatientId, to));
await db.Allergies.Where(x => x.PatientId == from).ExecuteUpdateAsync(s => s.SetProperty(x => x.PatientId, to));`},"patients/written":{file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",start:233,end:236,code:`// What moves is written down, so that the merge can be undone (see Unmerge).
var moved = new Dictionary<string, List<int>>
{
    [nameof(db.Appointments)] = await db.Appointments.Where(x => x.PatientId == from).Select(x => x.Id).ToListAsync(),`},"patients/refused":{file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",start:373,end:375,code:`var outboxIds = JsonSerializer.Deserialize<List<long>>(log.OutboxIdsJson) ?? [];
if (await db.Outbox.AnyAsync(m => outboxIds.Contains(m.Id) && m.SentUtc != null))
    return "The applications have already been told about this merge and cannot be told to take it back. Correct the records there by hand.";`},"patients/restore":{file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",start:385,end:391,code:`// The fields the merge filled in are emptied again, unless the value has been changed since.
var beforeFields = JsonSerializer.Deserialize<Dictionary<string, string?>>(log.FieldsBeforeJson) ?? [];
var afterFields = JsonSerializer.Deserialize<Dictionary<string, string?>>(log.FieldsAfterJson) ?? [];
var current = Snapshot(survivor);
foreach (var (field, was) in beforeFields)
    if (current[field] == afterFields[field])
        Restore(survivor, field, was);`},"patients/live":{file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",start:258,end:262,code:`// The merged record leaves the live set first, so its health card can move to the survivor
// (one live record per card is a unique index).
merged.MergedIntoPatientId = to;
merged.UpdatedUtc = now;
await db.SaveChangesAsync();`},"consent/applies":{file:"src/ClinicHub.Api/Domain/ConsentGuard.cs",start:71,end:79,code:`private bool Applies(ConsentDirective d, int encounterId, int encounterProviderId, string status)
{
    var ownVisit = ProviderId == encounterProviderId;
    return d.Scope switch
    {
        ConsentScopes.Encounter => d.EncounterId == encounterId && !ownVisit,
        ConsentScopes.Provider => d.ExcludedProviderId is { } excluded && excluded == ProviderId && !ownVisit,
        _ => !ownVisit && status != EncounterStatus.Open,
    };`},"consent/decide":{file:"src/ClinicHub.Api/Domain/ConsentGuard.cs",start:56,end:66,code:`public Decision Decide(int encounterId, int encounterProviderId, string encounterStatus)
{
    int? used = null;
    foreach (var d in Directives.Where(d => Applies(d, encounterId, encounterProviderId, encounterStatus)))
    {
        var o = Overrides.FirstOrDefault(o => o.ConsentDirectiveId == d.Id);
        if (o is null)
            return new(true, null);
        used ??= o.Id;
    }
    return new(false, used);`},"consent/filter":{file:"src/ClinicHub.Api/Endpoints/ConsentEndpoints.cs",start:136,end:150,code:`public static async ValueTask<object?> EncounterFilter(EndpointFilterInvocationContext ctx, EndpointFilterDelegate next)
{
    var http = ctx.HttpContext;
    if (!int.TryParse(http.Request.RouteValues["id"]?.ToString(), out var id))
        return await next(ctx);
    var db = http.RequestServices.GetRequiredService<ClinicHubDbContext>();
    var e = await db.Encounters.AsNoTracking().Where(x => x.Id == id)
        .Select(x => new { x.PatientId, x.ProviderId, x.Status, x.Patient.FirstName, x.Patient.LastName, x.Patient.Mrn }).SingleOrDefaultAsync();
    if (e is null)
        return await next(ctx);
    var now = http.RequestServices.GetRequiredService<TimeProvider>().GetUtcNow().UtcDateTime;
    var decision = (await ConsentView.LoadAsync(db, e.PatientId, http.User, now)).Decide(id, e.ProviderId, e.Status);
    if (decision.Withheld)
        return Withheld(http.User, e.PatientId, $"{e.LastName}, {e.FirstName}", e.Mrn);
    http.Items[OverrideItem] = decision.OverrideId;`},"consent/override":{file:"src/ClinicHub.Api/Endpoints/ConsentEndpoints.cs",start:110,end:117,code:`var overrides = directives.Select(d => new ConsentOverride
{
    ConsentDirectiveId = d.Id, UserId = userId, Reason = reason, AtUtc = now, ExpiresUtc = now + ConsentView.OverrideLength,
}).ToList();
db.ConsentOverrides.AddRange(overrides);
await db.SaveChangesAsync();
db.PatientAccessLog.Add(new PatientAccessLog { AtUtc = now, UserId = userId, PatientId = id, Action = AccessActions.View,
    Context = "Emergency override of consent directive", ConsentOverrideId = overrides[0].Id, IpAddress = AuthEndpoints.Ip(http) });`},"consent/withheld":{file:"src/ClinicHub.Api/Endpoints/ConsentEndpoints.cs",start:154,end:159,code:`public static IResult Withheld(ClaimsPrincipal user, int patientId, string patient, string mrn) =>
    Results.Problem("Withheld at the patient's request (PHIPA consent directive).", statusCode: StatusCodes.Status403Forbidden,
        extensions: new Dictionary<string, object?>
        {
            ["consentWithheld"] = true, ["canOverride"] = user.Can(Permissions.ConsentOverride),
            ["patientId"] = patientId, ["patient"] = patient, ["mrn"] = mrn,`},"consent/load":{file:"src/ClinicHub.Api/Domain/ConsentGuard.cs",start:50,end:51,code:`Overrides = await db.ConsentOverrides.AsNoTracking()
    .Where(o => ids.Contains(o.ConsentDirectiveId) && o.UserId == userId && o.ExpiresUtc > now).ToListAsync(),`},"consent/revoke":{file:"src/ClinicHub.Api/Endpoints/ConsentEndpoints.cs",start:91,end:93,code:`d.RevokedUtc = now;
db.PatientAccessLog.Add(new PatientAccessLog { AtUtc = now, UserId = user.RequiredUserId(), PatientId = d.PatientId, Action = AccessActions.Edit,
    Context = $"Consent directive {id} withdrawn", IpAddress = AuthEndpoints.Ip(http) });`},"visits/note":{file:"src/ClinicHub.Api/Endpoints/EncounterEndpoints.cs",start:103,end:134,code:`// Saved as the clinician types (the page sends it after a pause), so it returns only the time it was saved.
api.MapPut("/{id:int}/note", async (int id, NoteRequest req, ClaimsPrincipal user, ClinicHubDbContext db, TimeProvider clock) =>
{
    var e = await db.Encounters.Include(x => x.Note).SingleOrDefaultAsync(x => x.Id == id);
    if (Locked(e) is { } locked)
        return locked;
    var now = clock.GetUtcNow().UtcDateTime;
    void Apply(ClinicalNote n)
    {
        n.Subjective = Clean(req.Subjective);
        n.Objective = Clean(req.Objective);
        n.Assessment = Clean(req.Assessment);
        n.Plan = Clean(req.Plan);
        n.AuthorUserId = user.RequiredUserId();
        n.UpdatedUtc = now;
    }
    var creating = e!.Note is null;
    e.Note ??= new ClinicalNote();
    Apply(e.Note);
    try
    {
        await db.SaveChangesAsync();
    }
    catch (DbUpdateException) when (creating)
    {
        // A save from another tab or request created the note first: update that one.
        db.ChangeTracker.Clear();
        var existing = await db.ClinicalNotes.SingleAsync(n => n.EncounterId == id);
        Apply(existing);
        await db.SaveChangesAsync();
    }
    return Results.Ok(new { updatedUtc = now });`},"visits/sign":{file:"src/ClinicHub.Api/Endpoints/EncounterEndpoints.cs",start:191,end:205,code:`api.MapPost("/{id:int}/sign", async (int id, ClaimsPrincipal user, ClinicHubDbContext db, TimeProvider clock, HttpContext http) =>
{
    var e = await db.Encounters.Include(x => x.Patient).Include(x => x.Provider).Include(x => x.Note).Include(x => x.Vitals)
        .Include(x => x.Diagnoses).Include(x => x.Services).ThenInclude(s => s.UninsuredService)
        .SingleOrDefaultAsync(x => x.Id == id);
    if (Locked(e) is { } locked)
        return locked;
    if (user.ProviderId() != e!.ProviderId)
        return Results.Problem("Only the treating provider can sign this visit.", statusCode: StatusCodes.Status403Forbidden);
    var missing = ReadyToSign(e);
    if (missing.Length > 0)
        return Results.ValidationProblem(new Dictionary<string, string[]> { ["sign"] = missing });

    var now = clock.GetUtcNow().UtcDateTime;
    EncounterSigning.Sign(db, e, user.RequiredUserId(), now);`},"visits/claim":{file:"src/ClinicHub.Api/Domain/EncounterSigning.cs",start:26,end:38,code:`// Salaried providers (most nurse practitioners) have no billing number: their insured services are recorded, not claimed.
if (insured.Count > 0 && e.PaymentProgram != PaymentPrograms.Uninsured && e.Provider.OhipBillingNumber is not null)
    db.Claims.Add(new Claim
    {
        EncounterId = e.Id, PatientId = e.PatientId, ProviderId = e.ProviderId, PaymentProgram = e.PaymentProgram,
        HealthCardNumber = e.Patient.HealthCardNumber ?? e.Patient.OutOfProvinceNumber, HealthCardVersion = e.Patient.HealthCardVersion,
        Province = e.PaymentProgram == PaymentPrograms.Rmb ? e.Patient.CoverageProvince : "ON",
        // One claim per encounter and program, so the encounter number is unique and readable on the remittance.
        AccountingNumber = e.Id.ToString("D8", CultureInfo.InvariantCulture),
        Status = ClaimStatus.Ready, AmountSubmitted = insured.Sum(s => s.Fee), CreatedUtc = now,
        Items = insured.Select(s => new ClaimItem { ServiceCode = s.FeeCodeServiceCode!, ServiceDate = s.ServiceDate, Units = s.Units,
            DiagnosticCode = primary, FeeSubmitted = s.Fee }).ToList(),
    });`},"visits/addendum":{file:"src/ClinicHub.Api/Endpoints/EncounterEndpoints.cs",start:220,end:234,code:`// A signed note never changes; a correction is appended with its author and time.
api.MapPost("/{id:int}/addendum", async (int id, AddendumRequest req, ClaimsPrincipal user, ClinicHubDbContext db, TimeProvider clock) =>
{
    var e = await db.Encounters.Include(x => x.Note).SingleOrDefaultAsync(x => x.Id == id);
    if (e is null)
        return Results.NotFound();
    if (e.Status != EncounterStatus.Signed || e.Note is null)
        return Results.Problem("Addenda are for signed visits; edit the note instead.", statusCode: StatusCodes.Status409Conflict);
    var text = Clean(req.Text);
    if (text is null)
        return Results.ValidationProblem(new Dictionary<string, string[]> { ["text"] = ["Write the addendum."] });
    var now = clock.GetUtcNow().UtcDateTime;
    var local = TimeZoneInfo.ConvertTimeFromUtc(now, DemoSeeder.Toronto);
    var entry = $"[{local:yyyy-MM-dd HH:mm}, {user.Identity!.Name}] {text}";
    e.Note.Addendum = e.Note.Addendum is null ? entry : e.Note.Addendum + "\\n\\n" + entry;`},"claims/write":{file:"src/ClinicHub.Api/Domain/OhipFiles.cs",start:22,end:32,code:`public static string Write(string recordId, Field[] layout, IReadOnlyDictionary<string, object?> values)
{
    var sb = new StringBuilder(recordId, RecordLength);
    foreach (var f in layout)
    {
        values.TryGetValue(f.Name, out var v);
        sb.Append(f.Kind == Kind.Numeric ? Numeric(v, f) : Alpha(v?.ToString(), f.Length));
    }
    if (sb.Length != RecordLength)
        throw new InvalidOperationException($"{recordId} layout is {sb.Length} characters, not {RecordLength}.");
    return sb.ToString();`},"claims/numeric":{file:"src/ClinicHub.Api/Domain/OhipFiles.cs",start:55,end:68,code:`/// <summary>Right-justified, zero-filled. Money is written in cents.</summary>
private static string Numeric(object? value, Field f)
{
    var n = value switch
    {
        null => 0L,
        decimal d => (long)Math.Round(d * 100m, MidpointRounding.AwayFromZero),
        DateOnly date => long.Parse(date.ToString("yyyyMMdd", CultureInfo.InvariantCulture), CultureInfo.InvariantCulture),
        _ => Convert.ToInt64(value, CultureInfo.InvariantCulture),
    };
    var text = Math.Abs(n).ToString(CultureInfo.InvariantCulture);
    if (text.Length > f.Length)
        throw new InvalidOperationException($"{f.Name} value {n} does not fit in {f.Length} digits.");
    return text.PadLeft(f.Length, '0');`},"claims/layout":{file:"src/ClinicHub.Api/Domain/OhipFiles.cs",start:100,end:103,code:`public static readonly FixedWidth.Field[] Het =
[
    new("ServiceCode", 5), new("Reserved1", 2), new("FeeSubmitted", 6, N), new("NumberOfServices", 2, N), new("ServiceDate", 8, N),
    new("DiagnosticCode", 4), new("Reserved", 49),`},"claims/filename":{file:"src/ClinicHub.Api/Domain/OhipFiles.cs",start:117,end:118,code:`/// <summary>H + month letter (A = January) + billing number + "." + batch sequence, e.g. HJ123456.004.</summary>
public static string FileName(Batch b) => $"H{(char)('A' + b.Date.Month - 1)}{b.ProviderNumber}.{b.Sequence % 1000:000}";`},"claims/batch":{file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",start:124,end:140,code:`foreach (var group in claims.GroupBy(c => c.Provider))
{
    var p = group.Key;
    var number = (await db.ClaimBatches.Where(b => b.ProviderId == p.Id).MaxAsync(b => (int?)b.BatchNumber) ?? 0) + 1;
    var file = new ClaimFile.Batch(today, number, location.OhipGroupNumber, p.OhipBillingNumber!, p.SpecialtyCode ?? "00",
        group.Select(c => new ClaimFile.ClaimEntry(c.AccountingNumber, c.PaymentProgram, c.HealthCardNumber, c.HealthCardVersion,
            c.Patient.DateOfBirth, c.ReferringProviderNumber,
            c.Items.OrderBy(i => i.Id).Select(i => new ClaimFile.Item(i.ServiceCode, i.FeeSubmitted, i.Units, i.ServiceDate, i.DiagnosticCode)).ToArray(),
            c.PaymentProgram == PaymentPrograms.Rmb ? (c.Patient.LastName, c.Patient.FirstName, c.Patient.Sex, c.Province ?? "") : null)).ToArray());
    var batch = new ClaimBatch
    {
        ProviderId = p.Id, GroupNumber = location.OhipGroupNumber, BatchNumber = number, FileName = ClaimFile.FileName(file),
        FileContent = ClaimFile.Build(file), ClaimCount = group.Count(), Total = group.Sum(c => c.AmountSubmitted), CreatedUtc = now,
        Claims = group.ToList(),
    };
    db.ClaimBatches.Add(batch);
    created.Add(batch);`},"claims/alpha":{file:"src/ClinicHub.Api/Domain/OhipFiles.cs",start:48,end:52,code:`/// <summary>Left-justified, space-filled, upper case, plain ASCII.</summary>
private static string Alpha(string? value, int length)
{
    var ascii = new string((value ?? "").Normalize(NormalizationForm.FormD).Where(c => c is >= ' ' and <= '~').ToArray()).ToUpperInvariant();
    return (ascii.Length > length ? ascii[..length] : ascii).PadRight(length);`},"claims/read":{file:"src/ClinicHub.Api/Domain/OhipFiles.cs",start:35,end:45,code:`public static Dictionary<string, string> Read(string line, Field[] layout)
{
    var padded = line.PadRight(RecordLength);
    var result = new Dictionary<string, string>();
    var at = 3;
    foreach (var f in layout)
    {
        result[f.Name] = padded.Substring(at, f.Length).Trim();
        at += f.Length;
    }
    return result;`},"claims/rmb":{file:"src/ClinicHub.Api/Domain/OhipFiles.cs",start:142,end:149,code:`if (c.Reciprocal is { } r)
{
    lines.Add(FixedWidth.Write("HER", Her, new Dictionary<string, object?>
    {
        ["RegistrationNumber"] = c.HealthNumber, ["LastName"] = r.LastName, ["FirstName"] = r.FirstName,
        ["Sex"] = r.Sex == "M" ? "1" : "2", ["Province"] = r.Province,
    }));
    her++;`},"claims/trailer":{file:"src/ClinicHub.Api/Domain/OhipFiles.cs",start:161,end:161,code:'lines.Add(FixedWidth.Write("HEE", Hee, new Dictionary<string, object?> { ["ClaimHeaderCount"] = heh, ["RegistrationCount"] = her, ["ItemCount"] = het }));'},"remittance/match":{file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",start:239,end:262,code:`foreach (var entry in advice.Claims)
{
    claims.TryGetValue(entry.AccountingNumber, out var claim);
    var unmatched = claim?.Items.ToList() ?? [];
    foreach (var line in entry.Items)
    {
        var item = unmatched.FirstOrDefault(i => i.ServiceCode == line.ServiceCode && i.ServiceDate == line.ServiceDate);
        if (item is not null)
        {
            unmatched.Remove(item);
            item.FeePaid = line.Paid;
            item.ExplanatoryCode = line.ExplanatoryCode;
        }
        ra.Items.Add(new RemittanceItem
        {
            AccountingNumber = entry.AccountingNumber, ServiceCode = line.ServiceCode, ServiceDate = line.ServiceDate,
            AmountSubmitted = line.Submitted, AmountPaid = line.Paid, ExplanatoryCode = line.ExplanatoryCode, ClaimItem = item,
        });
    }
    if (claim is null)
        continue;
    claim.AmountPaid = claim.Items.Sum(i => i.FeePaid ?? 0);
    claim.Status = claim.AmountPaid <= 0 ? ClaimStatus.Rejected
        : claim.Items.All(i => i.FeePaid >= i.FeeSubmitted) ? ClaimStatus.Paid : ClaimStatus.PartiallyPaid;`},"remittance/once":{file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",start:228,end:229,code:`if (await db.Remittances.AnyAsync(r => r.FileName == fileName))
    return Results.Problem($"{fileName} was already imported.", statusCode: StatusCodes.Status409Conflict);`},"remittance/overhead":{file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",start:287,end:294,code:`var payments = items.Where(i => i.Claim != null).GroupBy(i => i.Claim!.ProviderId).Select(g =>
{
    var p = providers[g.Key];
    var paid = g.Sum(i => i.AmountPaid);
    var overhead = Math.Round(paid * p.OverheadPercent / 100m, 2, MidpointRounding.AwayFromZero);
    return new ProviderPayment(p.Id, p.DisplayName, p.OhipBillingNumber, g.Select(i => i.AccountingNumber).Distinct().Count(),
        g.Sum(i => i.AmountSubmitted), paid, p.OverheadPercent, overhead, paid - overhead);
}).OrderBy(p => p.Provider).ToArray();`},"remittance/resubmit":{file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",start:88,end:102,code:`// A refused claim goes back to Ready once the cause (usually the health card) is fixed.
api.MapPost("/claims/{id:int}/resubmit", async (int id, ClinicHubDbContext db) =>
{
    var claim = await db.Claims.Include(c => c.Items).Include(c => c.Patient).SingleOrDefaultAsync(c => c.Id == id);
    if (claim is null)
        return Results.NotFound();
    if (claim.Status != ClaimStatus.Rejected)
        return Results.Problem("Only refused claims are resubmitted.", statusCode: StatusCodes.Status409Conflict);
    // The claim carries the card as it is now on file.
    claim.HealthCardNumber = claim.PaymentProgram == PaymentPrograms.Rmb ? claim.Patient.OutOfProvinceNumber : claim.Patient.HealthCardNumber;
    claim.HealthCardVersion = claim.Patient.HealthCardVersion;
    claim.Status = ClaimStatus.Ready;
    claim.ClaimBatchId = null;
    claim.AmountPaid = 0;
    foreach (var i in claim.Items) { i.FeePaid = null; i.ExplanatoryCode = null; }`},"finance/what":{file:"src/ClinicHub.Api/Integrations/FinanceFeed.cs",start:12,end:24,code:`/// The clinic's money, sent to FinancePowerApp (the group's accounting) as financial documents. Built from the
/// billing tables as they are, each with an id that never changes (claim:12:raised), so a document is sent once and a
/// resent one is recognised there. No health information leaves: no patient names, health cards, diagnoses or fee
/// codes. Patients are one party; invoices are known by their number.
///
/// <list type="bullet">
/// <item>A claim ready for OHIP (or WSIB): an invoice to the payer, OHIP professional fees (reciprocal billing for
/// another province's patient: OHIP pays it and recovers it).</item>
/// <item>A remittance advice: a receipt from OHIP, one line per claim paid; a claim paid less than billed, once final,
/// adjusts the rest (short-paid). A refused claim stays owed until it is resubmitted and paid, or written off there.</item>
/// <item>Each physician's share of a remittance, net of the clinic's overhead: a bill from the physician.</item>
/// <item>An invoice for uninsured services: owed by the patient, with its HST; a payment against it: a receipt.</item>
/// </list>`},"finance/send":{file:"src/ClinicHub.Api/Integrations/FinanceFeed.cs",start:35,end:40,code:`public async Task<int> SendAsync(ClinicHubDbContext db, Clinic clinic, ServiceTokens tokens, CancellationToken ct = default)
{
    if (!Connected)
        return 0;
    var sent = (await db.FinanceExports.AsNoTracking().Select(x => x.ExternalId).ToListAsync(ct)).ToHashSet();
    var pending = (await BuildAsync(db, clinic, ct)).Where(d => !sent.Contains((string)d["externalId"]!)).ToList();`},"finance/share":{file:"src/ClinicHub.Api/Integrations/FinanceFeed.cs",start:111,end:115,code:`// Each physician's share of what this remittance paid for their claims, net of the clinic's overhead.
foreach (var p in r.Items.Where(i => i.OhipBillingNumber != null).GroupBy(i => (i.ProviderId, i.OhipBillingNumber, i.Provider, i.OverheadPercent)))
{
    var total = p.Sum(i => i.AmountPaid);
    var net = total - Math.Round(total * p.Key.OverheadPercent / 100m, 2, MidpointRounding.AwayFromZero);`},"finance/chunk":{file:"src/ClinicHub.Api/Integrations/FinanceFeed.cs",start:42,end:48,code:`foreach (var chunk in pending.Chunk(100))
{
    using var request = new HttpRequestMessage(HttpMethod.Post, options.CurrentValue.Finance.BaseUrl!.TrimEnd('/') + "/api/integration/documents")
    {
        Content = JsonContent.Create(new JsonArray(chunk.Select(d => (JsonNode)d.DeepClone()).ToArray())),
    };
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokens.Create(Audience, clinic, Scope));`},"finance/mark":{file:"src/ClinicHub.Api/Integrations/FinanceFeed.cs",start:65,end:69,code:`var marks = chunk.Select(d => new FinanceExport { ExternalId = (string)d["externalId"]!, SentUtc = now }).ToList();
db.FinanceExports.AddRange(marks);
await db.SaveChangesAsync(ct);
foreach (var m in marks) db.Entry(m).State = EntityState.Detached;   // the set is re-read on every pass
accepted += chunk.Length;`},"finance/pass":{file:"src/ClinicHub.Api/Integrations/OutboxDispatcher.cs",start:41,end:42,code:`// The clinic's money to the group's accounting, on the same pass.
await finance.SendAsync(db, clinic, tokens, ct);`},"orders/tx":{file:"src/ClinicHub.Api/Endpoints/OrderEndpoints.cs",start:71,end:75,code:`// One transaction, run by the database's retrying strategy (it repeats the whole unit on a transient failure).
await db.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
{
    db.ChangeTracker.Clear();
    await using var tx = await db.Database.BeginTransactionAsync();`},"orders/place":{file:"src/ClinicHub.Api/Endpoints/OrderEndpoints.cs",start:94,end:109,code:`var message = new OutboxMessage { Destination = group.Key, Kind = OutboxKinds.Order, CreatedUtc = now };
db.Outbox.Add(message);
await db.SaveChangesAsync();
var orders = group.Select(i => new ServiceRequest
{
    EncounterId = encounter.Id, PatientId = encounter.PatientId, RequesterProviderId = providerId, TargetSystem = group.Key,
    Code = i!.Code, Display = i.Display, Priority = priority, ClinicalNotes = notes, Status = ServiceRequestStatus.Draft,
    CreatedUtc = now, OutboxMessageId = message.Id,
}).ToList();
db.ServiceRequests.AddRange(orders);
await db.SaveChangesAsync();
// The message is written now, with the order, so what was ordered is what gets sent.
message.ServiceRequestId = orders[0].Id;
var label = await ConfidentialityLabels.ForAsync(db, encounter.PatientId, encounter.Id);
message.PayloadJson = FhirOrderBundle.Build(clinic, encounter.Patient, requester, orders, now, label).ToJsonString();
placed.AddRange(orders);`},"orders/due":{file:"src/ClinicHub.Api/Integrations/OutboxDispatcher.cs",start:36,end:37,code:`var due = await db.Outbox.Where(m => m.SentUtc == null && m.Attempts < MaxAttempts && (m.NextAttemptUtc == null || m.NextAttemptUtc <= now))
    .OrderBy(m => m.Id).Take(20).ToListAsync(ct);`},"orders/backoff":{file:"src/ClinicHub.Api/Integrations/OutboxDispatcher.cs",start:111,end:114,code:`catch (Exception ex) when (ex is HttpRequestException or InvalidOperationException or TaskCanceledException)
{
    message.LastError = ex.Message.Length > 1000 ? ex.Message[..1000] : ex.Message;
    message.NextAttemptUtc = now.AddSeconds(Math.Min(10 * Math.Pow(2, message.Attempts - 1), 1800));`},"orders/refused":{file:"src/ClinicHub.Api/Integrations/OutboxDispatcher.cs",start:71,end:81,code:`if (cancel && (int)response.StatusCode is 400 or 404 or 409 or 422)
{
    // An answer, not a failure: the application will not cancel (e.g. the specimen is already resulted).
    foreach (var o in orders)
        Refused(o, $"{message.Destination} did not cancel: {Problem(body)}");
    message.SentUtc = now;
    message.LastError = Problem(body);
    message.NextAttemptUtc = null;
    await db.SaveChangesAsync(ct);
    logger.LogInformation("{Destination} refused to cancel order {Id} for {Clinic}", message.Destination, message.ServiceRequestId, clinic.Slug);
    return true;`},"orders/token":{file:"src/ClinicHub.Api/Integrations/FhirOrders.cs",start:80,end:98,code:`public string Create(string audience, Clinic clinic, string scope = OrdersScope)
{
    var issuer = sso.Value.Issuer ?? server.CurrentValue.Issuer?.AbsoluteUri
        ?? throw new InvalidOperationException("Set Sso:Issuer: tokens ClinicHub sends on its own need its public address.");
    var now = clock.GetUtcNow().UtcDateTime;
    return new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
    {
        Issuer = issuer,
        Audience = audience,
        IssuedAt = now,
        NotBefore = now,
        Expires = now.AddMinutes(5),
        SigningCredentials = server.CurrentValue.SigningCredentials.First(),
        Subject = new ClaimsIdentity(
        [
            new Claim("sub", "clinichub"), new Claim("scope", scope),
            new Claim(SsoClaims.ClinicSlug, clinic.Slug), new Claim(SsoClaims.ClinicName, clinic.Name),
        ]),
    });`},"results/policy":{file:"src/ClinicHub.Api/Endpoints/ResultEndpoints.cs",start:30,end:34,code:`public static void AddResultsPolicy(this IServiceCollection services) =>
    services.AddAuthorizationBuilder().AddPolicy(ResultsPolicy, p => p
        .AddAuthenticationSchemes(OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)
        .RequireAuthenticatedUser()
        .RequireAssertion(ctx => ctx.User.HasScope(SsoClaims.ResultsScope)));`},"results/sender":{file:"src/ClinicHub.Api/Endpoints/ResultEndpoints.cs",start:111,end:116,code:`var client = sender.GetClaim(OpenIddictConstants.Claims.ClientId) ?? sender.GetClaim(OpenIddictConstants.Claims.Subject);
var target = client switch { "labflow" => TargetSystems.LabFlow, "clinicreport" => TargetSystems.ClinicReport,
    // IntegrationHub brings in the HL7 results of a laboratory outside the group.
    "integrationhub" => TargetSystems.ExternalLab, _ => null };
if (target is null)
    return Outcome($"{client} does not send results to ClinicHub.", StatusCodes.Status403Forbidden);`},"results/basedon":{file:"src/ClinicHub.Api/Endpoints/ResultEndpoints.cs",start:122,end:134,code:`var basedOn = report!["basedOn"]?.AsArray().Select(b => b?["identifier"]).FirstOrDefault(i => ((string?)i?["system"])?.EndsWith(":service-request") == true);
var system = (string?)basedOn?["system"] ?? "";
var parts = system.Split(':');
if (parts is not ["urn", "clinichub", var slug, "service-request"] || !int.TryParse((string?)basedOn?["value"], out var orderId))
    return Outcome("Each DiagnosticReport needs basedOn.identifier with ClinicHub's order (urn:clinichub:{clinic}:service-request).");
var clinic = await catalog.Clinics.AsNoTracking().SingleOrDefaultAsync(c => c.Slug == slug && c.IsActive);
if (clinic is null)
    return Outcome($"No clinic '{slug}'.");

await using var db = databases.Open(clinic);
var order = await db.ServiceRequests.SingleOrDefaultAsync(s => s.Id == orderId);
if (order is null || order.TargetSystem != target)
    return Outcome($"Order {orderId} at {slug} was not sent to {client}.", StatusCodes.Status403Forbidden);`},"results/withheld":{file:"src/ClinicHub.Api/Endpoints/ResultEndpoints.cs",start:72,end:85,code:`private static async Task<List<ResultRow>> HideWithheld(ClinicHubDbContext db, List<ResultRow> rows, ClaimsPrincipal user, DateTime now)
{
    var patients = rows.Select(r => r.PatientId).Distinct().ToList();
    var guarded = await db.ConsentDirectives.Where(d => patients.Contains(d.PatientId) && d.RevokedUtc == null).Select(d => d.PatientId).Distinct().ToListAsync();
    if (guarded.Count == 0)
        return rows;
    var encounterIds = rows.Where(r => guarded.Contains(r.PatientId)).Select(r => r.EncounterId).Distinct().ToList();
    var visits = await db.Encounters.AsNoTracking().Where(e => encounterIds.Contains(e.Id)).ToDictionaryAsync(e => e.Id, e => new { e.ProviderId, e.Status });
    var views = new Dictionary<int, ConsentView>();
    foreach (var p in guarded)
        views[p] = await ConsentView.LoadAsync(db, p, user, now);
    return rows.Select(r => views.TryGetValue(r.PatientId, out var v) && v.Decide(r.EncounterId, visits[r.EncounterId].ProviderId, visits[r.EncounterId].Status).Withheld
        ? r with { Summary = null, ExternalUrl = null, IsAbnormal = false, Withheld = true }
        : r).ToList();`},"results/status":{file:"src/ClinicHub.Api/Endpoints/ResultEndpoints.cs",start:143,end:148,code:`var status = ((string?)report["status"] ?? "final") switch
{
    "preliminary" or "partial" or "registered" => "Preliminary",
    "amended" or "corrected" or "appended" => "Amended",
    "cancelled" or "entered-in-error" => "Cancelled",
    _ => "Final",`},"results/version":{file:"src/ClinicHub.Api/Endpoints/ResultEndpoints.cs",start:157,end:165,code:`var result = await db.DiagnosticResults.SingleOrDefaultAsync(r => r.ServiceRequestId == orderId && r.ExternalReportId == externalId);
if (result is null)
    db.DiagnosticResults.Add(result = new DiagnosticResult { ServiceRequestId = orderId, ExternalReportId = externalId });
else if (result.Summary != summary || result.Status != status)
{
    // A new version: whoever acknowledged the old one has not seen this one.
    result.ReviewedByUserId = null;
    result.ReviewedUtc = null;
}`},"results/inbox":{file:"src/ClinicHub.Api/Endpoints/ResultEndpoints.cs",start:45,end:48,code:`if (all != true && providerId is not null)
    q = q.Where(r => r.ServiceRequest.RequesterProviderId == providerId);
q = reviewed == true ? q.Where(r => r.ReviewedUtc != null) : q.Where(r => r.ReviewedUtc == null);
var rows = await q.OrderByDescending(r => r.IsAbnormal).ThenByDescending(r => r.ReceivedUtc).Take(200).Select(Row(db)).ToListAsync();`},"fe-shell/landing":{file:"web/src/App.tsx",start:109,end:114,code:`<Route path="/" element={<Navigate replace to={
  can(me, 'encounters.sign') && me.providerId ? '/visits'
    : can(me, 'billing.manage') && !can(me, 'schedule.manage') ? '/billing'
    : can(me, 'schedule.view') ? '/frontdesk'
    : can(me, 'audit.view') ? '/logs'
    : '/account'} />} />`},"fe-shell/nav":{file:"web/src/App.tsx",start:87,end:94,code:`{can(me, 'schedule.view') && <NavLink to="/frontdesk">Front desk</NavLink>}
{can(me, 'patients.view') && <NavLink to="/patients">Patients</NavLink>}
{can(me, 'encounters.view') && <NavLink to="/visits">Visits</NavLink>}
{can(me, 'results.review') && <NavLink to="/results">Results{waiting > 0 && <span className="count">{waiting}</span>}</NavLink>}
{can(me, 'billing.view') && <NavLink to="/billing">Billing</NavLink>}
{can(me, 'users.manage') && <NavLink to="/people">People</NavLink>}
{can(me, 'audit.view') && <NavLink to="/logs">Logs</NavLink>}
{me.isPlatformAdmin && <NavLink to="/clinics">Clinics</NavLink>}`},"fe-shell/apps":{file:"web/src/App.tsx",start:95,end:96,code:'{/* Other applications sign in through ClinicHub: opening one needs no second password. */}\n{apps.filter(a => a.url).map(a => <a key={a.clientId} href={a.url} className="app-link" title={`Open ${a.name} (signs in with ClinicHub)`}>{a.name} ↗</a>)}'},"fe-shell/switch":{file:"web/src/App.tsx",start:80,end:85,code:`{me.clinics.length > 1 ? (
  <select className="clinic-switch" value={clinic.id} aria-label="Clinic" title="Switch clinic"
    onChange={async e => { setMe(await api.selectClinic(Number(e.target.value))); navigate('/') }}>
    {me.clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
  </select>
) : <span className="clinic-name">{clinic.name}</span>}`},"fe-shell/gates":{file:"web/src/App.tsx",start:47,end:56,code:`if (!settings || me === undefined) return <p className="muted page">Loading…</p>
if (ready && returnUrl) return <p className="muted page">Returning to {appName(returnUrl)}…</p>
if (!me) return <Login settings={settings} onSignedIn={setMe} returnTo={returnUrl ? appName(returnUrl) : null} />
if (me.pendingAction) return <PendingAction me={me} onDone={setMe} onSignOut={signOut} />
if (!me.clinic) return <ClinicPicker me={me} onChosen={setMe} onSignOut={signOut} />

return (
  <SessionContext.Provider value={{ me, settings, setMe }}>
    {/* A new key per clinic: every page reloads its data from the newly chosen clinic's database. */}
    <Shell key={me.clinic.id} me={me} settings={settings} setMe={setMe} signOut={signOut} />`},"fe-shell/can":{file:"web/src/api.ts",start:80,end:80,code:"export const can = (me: Me, p: string) => me.permissions.includes(p)"},"fe-shell/signedout":{file:"web/src/api.ts",start:50,end:50,code:"if (res.status === 401 && !url.startsWith('/api/auth/')) window.dispatchEvent(new Event('clinichub:signed-out'))"},"fe-shell/returnurl":{file:"web/src/App.tsx",start:142,end:145,code:`/** Only ClinicHub's own sign-in endpoint: anything else in returnUrl would make this page an open redirect. */
function safeReturnUrl() {
  const url = new URLSearchParams(window.location.search).get('returnUrl')
  return url && url.startsWith('/connect/authorize?') ? url : null`},"fe-autosave/change":{file:"web/src/pages/EncounterPage.tsx",start:202,end:209,code:`const change = (key: keyof Soap, value: string) => {
  latest.current = { ...latest.current, [key]: value }
  setSoap(latest.current)
  dirty.current = true
  setStatus('Editing…')
  window.clearTimeout(timer.current)
  timer.current = window.setTimeout(flush, 800)
}`},"fe-autosave/flush":{file:"web/src/pages/EncounterPage.tsx",start:184,end:200,code:`// One save at a time: a blur and the typing timer can both fire, and each waits for the one before.
const flush = useCallback(() => {
  window.clearTimeout(timer.current)
  inFlight.current = inFlight.current.then(async () => {
    if (!dirty.current) return
    dirty.current = false
    setStatus('Saving…')
    try {
      const { updatedUtc } = await encounters.saveNote(id, latest.current)
      setStatus(dirty.current ? 'Editing…' : \`Saved \${localTime(updatedUtc)}\`)
    } catch (e) {
      dirty.current = true
      setStatus(e instanceof ApiError ? \`Not saved: \${e.message}\` : 'Not saved, retrying when you type again.')
    }
  })
  return inFlight.current
}, [id])`},"fe-autosave/leave":{file:"web/src/pages/EncounterPage.tsx",start:211,end:212,code:`// Leaving the page saves what was typed.
useEffect(() => () => { if (dirty.current) encounters.saveNote(id, latest.current) }, [id])`},"fe-autosave/blur":{file:"web/src/pages/EncounterPage.tsx",start:102,end:102,code:"onChange={e => note.change(key, e.target.value)} onBlur={note.flush} />"},"fe-autosave/signbtn":{file:"web/src/pages/EncounterPage.tsx",start:128,end:128,code:"onClick={async () => { await note.flush(); await run(() => encounters.sign(id)) }}>Sign visit</button>"},"fe-autosave/locked":{file:"src/ClinicHub.Api/Endpoints/EncounterEndpoints.cs",start:262,end:267,code:`private static IResult? Locked(Encounter? e) => e switch
{
    null => Results.NotFound(),
    { Status: EncounterStatus.Signed } => Results.Problem("This visit is signed and locked. Add an addendum instead.", statusCode: StatusCodes.Status409Conflict),
    { Status: EncounterStatus.Voided } => Results.Problem("This visit was voided.", statusCode: StatusCodes.Status409Conflict),
    _ => null,`},"fe-autosave/server":{file:"src/ClinicHub.Api/Endpoints/EncounterEndpoints.cs",start:119,end:134,code:`var creating = e!.Note is null;
e.Note ??= new ClinicalNote();
Apply(e.Note);
try
{
    await db.SaveChangesAsync();
}
catch (DbUpdateException) when (creating)
{
    // A save from another tab or request created the note first: update that one.
    db.ChangeTracker.Clear();
    var existing = await db.ClinicalNotes.SingleAsync(n => n.EncounterId == id);
    Apply(existing);
    await db.SaveChangesAsync();
}
return Results.Ok(new { updatedUtc = now });`},"data-catalog/migrate":{file:"src/ClinicHub.Api/Catalog/ClinicDatabases.cs",start:60,end:65,code:`public async Task MigrateAsync(Clinic clinic)
{
    await using var db = Open(clinic);
    await db.Database.MigrateAsync();
    await ReferenceSeeder.SeedAsync(db);
}`},"data-catalog/clinic":{file:"src/ClinicHub.Api/Catalog/CatalogDbContext.cs",start:26,end:30,code:`b.Entity<Clinic>(e =>
{
    e.ToTable("Clinic", t => t.HasCheckConstraint("CK_Clinic_Slug", "Slug NOT LIKE '%[^a-z0-9-]%' AND LEN(Slug) >= 2"));
    e.HasIndex(x => x.Slug).IsUnique();
    e.HasIndex(x => x.DatabaseName).IsUnique();`},"data-catalog/roles":{file:"src/ClinicHub.Api/Catalog/CatalogDbContext.cs",start:37,end:48,code:`b.Entity<Role>(e =>
{
    e.ToTable("Role");
    e.HasIndex(x => new { x.ClinicId, x.Name }).IsUnique();
    e.HasOne(x => x.Clinic).WithMany(c => c.Roles).HasForeignKey(x => x.ClinicId).OnDelete(DeleteBehavior.Restrict);
});
b.Entity<AccountRole>(e =>
{
    e.ToTable("AccountRole");
    e.HasKey(x => new { x.AccountId, x.RoleId });
    e.HasOne(x => x.Account).WithMany(a => a.Roles).HasForeignKey(x => x.AccountId).OnDelete(DeleteBehavior.Cascade);
    e.HasOne(x => x.Role).WithMany(r => r.Accounts).HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Cascade);`},"data-catalog/openiddict":{file:"src/ClinicHub.Api/Catalog/ClinicDatabases.cs",start:80,end:81,code:`// The catalog also stores the sign-in server's registered applications, authorizations and tokens (OpenIddict).
services.AddDbContext<CatalogDbContext>(o => o.UseSqlServer(catalog, sql => sql.EnableRetryOnFailure()).UseOpenIddict());`},"data-catalog/seeder":{file:"src/ClinicHub.Api/Data/ReferenceSeeder.cs",start:6,end:8,code:`/// Lists every installation needs. Adds what is missing and never overwrites, because a clinic edits
/// its own price list. OHIP codes here are a small ILLUSTRATIVE subset with approximate fees:
/// a real installation imports the current Schedule of Benefits and diagnostic code list.`},"data-care/conventions":{file:"src/ClinicHub.Api/Data/ClinicHubDbContext.cs",start:62,end:68,code:`protected override void ConfigureConventions(ModelConfigurationBuilder b)
{
    b.Properties<decimal>().HavePrecision(10, 2);
    b.Properties<decimal?>().HavePrecision(10, 2);
    // UTC instants: datetime2 without time zone, the "Utc" suffix says what they hold.
    b.Properties<DateTime>().HaveColumnType("datetime2(3)");
    b.Properties<DateTime?>().HaveColumnType("datetime2(3)");`},"data-care/cascade":{file:"src/ClinicHub.Api/Data/ClinicHubDbContext.cs",start:82,end:86,code:`// SQL Server refuses multiple cascade paths, and clinical history must not vanish with a parent
// row anyway: nothing cascades except pure child rows configured explicitly below.
foreach (var fk in b.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
    if (fk.DeleteBehavior == DeleteBehavior.Cascade && !CascadingChildren.Contains(fk.DeclaringEntityType.ClrType))
        fk.DeleteBehavior = DeleteBehavior.Restrict;`},"data-care/in":{file:"src/ClinicHub.Api/Data/ClinicHubDbContext.cs",start:422,end:423,code:`private static string In(string column, IEnumerable<string> values) =>
    $"{column} IN ({string.Join(",", values.Select(v => $"'{v}'"))})";`},"data-care/encounter":{file:"src/ClinicHub.Api/Data/ClinicHubDbContext.cs",start:234,end:239,code:`e.ToTable("Encounter", "care", t =>
{
    t.HasCheckConstraint("CK_Encounter_Ctas", "CtasLevel IS NULL OR CtasLevel BETWEEN 1 AND 5");
    t.HasCheckConstraint("CK_Encounter_Program", In("PaymentProgram", [PaymentPrograms.Hcp, PaymentPrograms.Rmb, PaymentPrograms.Wcb, PaymentPrograms.Uninsured]));
    t.HasCheckConstraint("CK_Encounter_Signed", "Status <> 'Signed' OR (SignedUtc IS NOT NULL AND SignedByUserId IS NOT NULL)");
    t.HasCheckConstraint("CK_Encounter_Status", In("Status", [EncounterStatus.Open, EncounterStatus.Signed, EncounterStatus.Voided]));`},"data-care/primary":{file:"src/ClinicHub.Api/Data/ClinicHubDbContext.cs",start:268,end:268,code:'e.HasIndex(x => x.EncounterId).IsUnique().HasFilter("IsPrimary = 1").HasDatabaseName("UX_EncounterDiagnosis_Primary");'},"data-care/live":{file:"src/ClinicHub.Api/Data/ClinicHubDbContext.cs",start:148,end:148,code:'e.HasIndex(x => x.HealthCardNumber).IsUnique().HasFilter("HealthCardNumber IS NOT NULL AND MergedIntoPatientId IS NULL");'},"data-orders/pending":{file:"src/ClinicHub.Api/Data/ClinicHubDbContext.cs",start:333,end:333,code:'e.HasIndex(x => x.NextAttemptUtc).HasFilter("SentUtc IS NULL").HasDatabaseName("IX_Outbox_Pending");'},"data-orders/unreviewed":{file:"src/ClinicHub.Api/Data/ClinicHubDbContext.cs",start:324,end:325,code:`// The results inbox: everything not yet reviewed.
e.HasIndex(x => x.ReviewedUtc).HasFilter("ReviewedUtc IS NULL").HasDatabaseName("IX_DiagnosticResult_Unreviewed");`},"data-orders/claim":{file:"src/ClinicHub.Api/Data/ClinicHubDbContext.cs",start:349,end:357,code:`e.ToTable("Claim", "billing", t =>
{
    t.HasCheckConstraint("CK_Claim_Program", In("PaymentProgram", [PaymentPrograms.Hcp, PaymentPrograms.Rmb, PaymentPrograms.Wcb]));
    t.HasCheckConstraint("CK_Claim_Status", In("Status", [ClaimStatus.Draft, ClaimStatus.Ready, ClaimStatus.Submitted, ClaimStatus.Paid, ClaimStatus.PartiallyPaid, ClaimStatus.Rejected]));
    t.HasCheckConstraint("CK_Claim_Amounts", "AmountSubmitted >= 0 AND AmountPaid >= 0");
});
e.HasIndex(x => x.AccountingNumber).IsUnique();
e.HasIndex(x => new { x.Status, x.ProviderId });
e.HasIndex(x => new { x.EncounterId, x.PaymentProgram }).IsUnique();`},"data-orders/invoice":{file:"src/ClinicHub.Api/Data/ClinicHubDbContext.cs",start:380,end:381,code:`t.HasCheckConstraint("CK_Invoice_BillTo", "PatientId IS NOT NULL OR ThirdPartyName IS NOT NULL");
t.HasCheckConstraint("CK_Invoice_Totals", "Total = Subtotal + Tax AND Balance BETWEEN 0 AND Total");`},"data-orders/export":{file:"src/ClinicHub.Api/Data/ClinicHubDbContext.cs",start:392,end:393,code:`e.ToTable("FinanceExport", "billing");
e.HasKey(x => x.ExternalId);`},"data-orders/staffid":{file:"src/ClinicHub.Api/Data/ClinicHubDbContext.cs",start:407,end:408,code:`// The catalog account's id, not a new one.
e.Property(x => x.Id).ValueGeneratedNever();`}},a=[{area:"Allergies",method:"GET",path:"/api/allergens",access:"patients.view",file:"src/ClinicHub.Api/Endpoints/AllergyEndpoints.cs",line:26},{area:"Allergies",method:"GET",path:"/api/patients/{id:int}/allergies",access:"patients.view",file:"src/ClinicHub.Api/Endpoints/AllergyEndpoints.cs",line:29},{area:"Allergies",method:"POST",path:"/api/patients/{id:int}/allergies",access:"encounters.document",file:"src/ClinicHub.Api/Endpoints/AllergyEndpoints.cs",line:33},{area:"Allergies",method:"POST",path:"/api/patients/{id:int}/allergies/none",access:"encounters.document",file:"src/ClinicHub.Api/Endpoints/AllergyEndpoints.cs",line:72},{area:"Allergies",method:"POST",path:"/api/allergies/{id:int}/end",access:"encounters.document",file:"src/ClinicHub.Api/Endpoints/AllergyEndpoints.cs",line:96},{area:"Auth",method:"POST",path:"/api/auth/login",access:"public",file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",line:42},{area:"Auth",method:"POST",path:"/api/auth/demo-login",access:"public",file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",line:91},{area:"Auth",method:"POST",path:"/api/auth/logout",access:"public",file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",line:100},{area:"Auth",method:"GET",path:"/api/auth/me",access:"public",file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",line:108},{area:"Auth",method:"POST",path:"/api/auth/clinic",access:"signed-in",file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",line:115},{area:"Auth",method:"POST",path:"/api/auth/password",access:"signed-in",file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",line:126},{area:"Auth",method:"POST",path:"/api/auth/two-factor/setup",access:"signed-in",file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",line:147},{area:"Auth",method:"POST",path:"/api/auth/two-factor/enable",access:"signed-in",file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",line:158},{area:"Auth",method:"POST",path:"/api/auth/two-factor/disable",access:"signed-in",file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",line:175},{area:"Auth",method:"POST",path:"/api/auth/sessions/revoke",access:"signed-in",file:"src/ClinicHub.Api/Endpoints/AuthEndpoints.cs",line:191},{area:"Billing",method:"GET",path:"/api/billing/overview",access:"billing.view",file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",line:47},{area:"Billing",method:"GET",path:"/api/billing/claims",access:"billing.view",file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",line:64},{area:"Billing",method:"GET",path:"/api/billing/claims/{id:int}",access:"billing.view",file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",line:72},{area:"Billing",method:"POST",path:"/api/billing/claims/{id:int}/resubmit",access:"billing.manage",file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",line:89},{area:"Billing",method:"GET",path:"/api/billing/batches",access:"billing.view",file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",line:107},{area:"Billing",method:"POST",path:"/api/billing/batches",access:"billing.manage",file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",line:111},{area:"Billing",method:"GET",path:"/api/billing/batches/{id:int}/file",access:"billing.view",file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",line:146},{area:"Billing",method:"POST",path:"/api/billing/batches/{id:int}/submit",access:"billing.manage",file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",line:152},{area:"Billing",method:"GET",path:"/api/billing/remittances",access:"billing.view",file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",line:166},{area:"Billing",method:"GET",path:"/api/billing/remittances/{id:int}",access:"billing.view",file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",line:169},{area:"Billing",method:"GET",path:"/api/billing/remittances/{id:int}/file",access:"billing.view",file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",line:173},{area:"Billing",method:"POST",path:"/api/billing/remittances/simulate",access:"billing.manage",file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",line:179},{area:"Billing",method:"POST",path:"/api/billing/remittances",access:"billing.manage",file:"src/ClinicHub.Api/Endpoints/BillingEndpoints.cs",line:209},{area:"Consent",method:"GET",path:"/api/patients/{id:int}/consent",access:"patients.view",file:"src/ClinicHub.Api/Endpoints/ConsentEndpoints.cs",line:32},{area:"Consent",method:"POST",path:"/api/patients/{id:int}/consent",access:"consent.manage",file:"src/ClinicHub.Api/Endpoints/ConsentEndpoints.cs",line:49},{area:"Consent",method:"POST",path:"/api/consent/{id:int}/revoke",access:"consent.manage",file:"src/ClinicHub.Api/Endpoints/ConsentEndpoints.cs",line:83},{area:"Consent",method:"POST",path:"/api/patients/{id:int}/consent/override",access:"consent.override",file:"src/ClinicHub.Api/Endpoints/ConsentEndpoints.cs",line:100},{area:"Consent",method:"GET",path:"/api/consent/overrides",access:"audit.view",file:"src/ClinicHub.Api/Endpoints/ConsentEndpoints.cs",line:123},{area:"Encounters",method:"GET",path:"/api/encounters",access:"encounters.view",file:"src/ClinicHub.Api/Endpoints/EncounterEndpoints.cs",line:53},{area:"Encounters",method:"GET",path:"/api/encounters/{id:int}",access:"encounters.view",file:"src/ClinicHub.Api/Endpoints/EncounterEndpoints.cs",line:68},{area:"Encounters",method:"POST",path:"/api/encounters/{id:int}/start",access:"encounters.document",file:"src/ClinicHub.Api/Endpoints/EncounterEndpoints.cs",line:80},{area:"Encounters",method:"POST",path:"/api/encounters/{id:int}/finish",access:"encounters.document",file:"src/ClinicHub.Api/Endpoints/EncounterEndpoints.cs",line:82},{area:"Encounters",method:"POST",path:"/api/encounters/{id:int}/vitals",access:"encounters.document",file:"src/ClinicHub.Api/Endpoints/EncounterEndpoints.cs",line:85},{area:"Encounters",method:"PUT",path:"/api/encounters/{id:int}/note",access:"encounters.document",file:"src/ClinicHub.Api/Endpoints/EncounterEndpoints.cs",line:104},{area:"Encounters",method:"PUT",path:"/api/encounters/{id:int}/coding",access:"encounters.sign",file:"src/ClinicHub.Api/Endpoints/EncounterEndpoints.cs",line:138},{area:"Encounters",method:"POST",path:"/api/encounters/{id:int}/sign",access:"encounters.sign",file:"src/ClinicHub.Api/Endpoints/EncounterEndpoints.cs",line:191},{area:"Encounters",method:"POST",path:"/api/encounters/{id:int}/addendum",access:"encounters.document",file:"src/ClinicHub.Api/Endpoints/EncounterEndpoints.cs",line:221},{area:"Reference",method:"GET",path:"/api/codes",access:"encounters.view",file:"src/ClinicHub.Api/Endpoints/EncounterEndpoints.cs",line:239},{area:"Front desk",method:"GET",path:"/api/frontdesk/day",access:"schedule.view",file:"src/ClinicHub.Api/Endpoints/FrontDeskEndpoints.cs",line:34},{area:"Front desk",method:"POST",path:"/api/frontdesk/appointments/{id:int}/check-in",access:"schedule.manage",file:"src/ClinicHub.Api/Endpoints/FrontDeskEndpoints.cs",line:40},{area:"Front desk",method:"POST",path:"/api/frontdesk/appointments/{id:int}/status",access:"schedule.manage",file:"src/ClinicHub.Api/Endpoints/FrontDeskEndpoints.cs",line:73},{area:"Front desk",method:"POST",path:"/api/frontdesk/walk-ins",access:"schedule.manage",file:"src/ClinicHub.Api/Endpoints/FrontDeskEndpoints.cs",line:121},{area:"Orders",method:"GET",path:"/api/orders/catalog",access:"encounters.view",file:"src/ClinicHub.Api/Endpoints/OrderEndpoints.cs",line:33},{area:"Orders",method:"GET",path:"/api/encounters/{id:int}/orders",access:"encounters.view",file:"src/ClinicHub.Api/Endpoints/OrderEndpoints.cs",line:39},{area:"Orders",method:"POST",path:"/api/encounters/{id:int}/orders",access:"orders.manage",file:"src/ClinicHub.Api/Endpoints/OrderEndpoints.cs",line:42},{area:"Orders",method:"POST",path:"/api/orders/{id:int}/cancel",access:"orders.manage",file:"src/ClinicHub.Api/Endpoints/OrderEndpoints.cs",line:121},{area:"Orders",method:"POST",path:"/api/orders/{id:int}/resend",access:"orders.manage",file:"src/ClinicHub.Api/Endpoints/OrderEndpoints.cs",line:188},{area:"Patients",method:"GET",path:"/api/patients",access:"patients.view",file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",line:44},{area:"Patients",method:"GET",path:"/api/patients/{id:int}",access:"patients.view",file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",line:62},{area:"Patients",method:"POST",path:"/api/patients",access:"patients.edit",file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",line:74},{area:"Patients",method:"PUT",path:"/api/patients/{id:int}",access:"patients.edit",file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",line:104},{area:"Patients",method:"GET",path:"/api/patients/duplicates",access:"patients.merge",file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",line:137},{area:"Patients",method:"GET",path:"/api/patients/duplicates/{id:int}",access:"patients.merge",file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",line:148},{area:"Patients",method:"POST",path:"/api/patients/duplicates/scan",access:"patients.merge",file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",line:162},{area:"Patients",method:"POST",path:"/api/patients/duplicates/{id:int}/not-duplicate",access:"patients.merge",file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",line:168},{area:"Patients",method:"POST",path:"/api/patients/merge",access:"patients.merge",file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",line:182},{area:"Patients",method:"POST",path:"/api/patients/{id:int}/unmerge",access:"patients.merge",file:"src/ClinicHub.Api/Endpoints/PatientEndpoints.cs",line:201},{area:"Prescriptions",method:"GET",path:"/api/prescriptions/catalog",access:"encounters.view",file:"src/ClinicHub.Api/Endpoints/PrescriptionEndpoints.cs",line:36},{area:"Prescriptions",method:"GET",path:"/api/encounters/{id:int}/prescriptions",access:"encounters.view",file:"src/ClinicHub.Api/Endpoints/PrescriptionEndpoints.cs",line:41},{area:"Prescriptions",method:"POST",path:"/api/encounters/{id:int}/prescriptions",access:"prescriptions.write",file:"src/ClinicHub.Api/Endpoints/PrescriptionEndpoints.cs",line:44},{area:"Prescriptions",method:"POST",path:"/api/encounters/{id:int}/prescriptions/check",access:"prescriptions.write",file:"src/ClinicHub.Api/Endpoints/PrescriptionEndpoints.cs",line:50},{area:"Prescriptions",method:"GET",path:"/api/patients/{id:int}/medications",access:"encounters.view",file:"src/ClinicHub.Api/Endpoints/PrescriptionEndpoints.cs",line:61},{area:"Prescriptions",method:"POST",path:"/api/prescriptions/{id:int}/renew",access:"prescriptions.write",file:"src/ClinicHub.Api/Endpoints/PrescriptionEndpoints.cs",line:80},{area:"Prescriptions",method:"POST",path:"/api/prescriptions/{id:int}/cancel",access:"prescriptions.write",file:"src/ClinicHub.Api/Endpoints/PrescriptionEndpoints.cs",line:115},{area:"Prescriptions",method:"POST",path:"/api/prescriptions/{id:int}/resend",access:"prescriptions.write",file:"src/ClinicHub.Api/Endpoints/PrescriptionEndpoints.cs",line:180},{area:"Result",method:"POST",path:"/fhir",access:"results.post",handler:"Receive",file:"src/ClinicHub.Api/Endpoints/ResultEndpoints.cs",line:38},{area:"Results",method:"GET",path:"/api/results",access:"results.review",file:"src/ClinicHub.Api/Endpoints/ResultEndpoints.cs",line:41},{area:"Results",method:"POST",path:"/api/results/{id:int}/review",access:"results.review",file:"src/ClinicHub.Api/Endpoints/ResultEndpoints.cs",line:52},{area:"Users",method:"GET",path:"/api/permissions",access:"users.manage",file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",line:46},{area:"Users",method:"GET",path:"/api/users",access:"users.manage",file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",line:48},{area:"Users",method:"POST",path:"/api/users",access:"users.manage",file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",line:57},{area:"Users",method:"PUT",path:"/api/users/{id:int}",access:"users.manage",file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",line:107},{area:"Users",method:"POST",path:"/api/users/{id:int}/password",access:"users.manage",file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",line:144},{area:"Users",method:"POST",path:"/api/users/{id:int}/unlock",access:"users.manage",file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",line:161},{area:"Users",method:"POST",path:"/api/users/{id:int}/two-factor/reset",access:"users.manage",file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",line:175},{area:"Users",method:"POST",path:"/api/users/{id:int}/sessions/revoke",access:"users.manage",file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",line:187},{area:"Users",method:"GET",path:"/api/roles",access:"users.manage",file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",line:200},{area:"Users",method:"POST",path:"/api/roles",access:"users.manage",file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",line:204},{area:"Users",method:"PUT",path:"/api/roles/{id:int}",access:"users.manage",file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",line:216},{area:"Users",method:"DELETE",path:"/api/roles/{id:int}",access:"users.manage",file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",line:238},{area:"Audit",method:"GET",path:"/api/audit",access:"audit.view",file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",line:257},{area:"Audit",method:"GET",path:"/api/audit/access",access:"audit.view",file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",line:274},{area:"Platform",method:"GET",path:"/api/platform/clinics",access:"platform-admin",file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",line:293},{area:"Platform",method:"POST",path:"/api/platform/clinics",access:"platform-admin",file:"src/ClinicHub.Api/Endpoints/UserEndpoints.cs",line:300},{area:"Program",method:"GET",path:"/healthz",access:"public",file:"src/ClinicHub.Api/Program.cs",line:92},{area:"Program",method:"GET",path:"/api/settings",access:"public",file:"src/ClinicHub.Api/Program.cs",line:93},{area:"Sso",method:"GET",path:"/connect/authorize",access:"public",handler:"Authorize",file:"src/ClinicHub.Api/Sso/SsoEndpoints.cs",line:30},{area:"Sso",method:"POST",path:"/connect/authorize",access:"public",handler:"Authorize",file:"src/ClinicHub.Api/Sso/SsoEndpoints.cs",line:30},{area:"Sso",method:"POST",path:"/connect/token",access:"public",handler:"Token",file:"src/ClinicHub.Api/Sso/SsoEndpoints.cs",line:31},{area:"Sso",method:"GET",path:"/connect/userinfo",access:"public",handler:"UserInfo",file:"src/ClinicHub.Api/Sso/SsoEndpoints.cs",line:33},{area:"Sso",method:"POST",path:"/connect/userinfo",access:"public",handler:"UserInfo",file:"src/ClinicHub.Api/Sso/SsoEndpoints.cs",line:33},{area:"Sso",method:"GET",path:"/connect/logout",access:"public",handler:"Logout",file:"src/ClinicHub.Api/Sso/SsoEndpoints.cs",line:34},{area:"Sso",method:"POST",path:"/connect/logout",access:"public",handler:"Logout",file:"src/ClinicHub.Api/Sso/SsoEndpoints.cs",line:34},{area:"Auth",method:"GET",path:"/api/apps",access:"signed-in",file:"src/ClinicHub.Api/Sso/SsoEndpoints.cs",line:37}],s=[{database:"ClinicHub_Catalog",schema:"catalog",table:"Account",file:"src/ClinicHub.Api/Catalog/Migrations/CatalogDbContextModelSnapshot.cs",line:94,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"CreatedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"Credentials",type:"NVARCHAR(64)",nullable:!0,notes:[]},{name:"DisplayName",type:"NVARCHAR(128)",nullable:!1,notes:[]},{name:"FailedLoginCount",type:"INT",nullable:!1,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:[]},{name:"IsPlatformAdmin",type:"BIT",nullable:!1,notes:[]},{name:"LastLoginUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"LockoutEndUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"MustChangePassword",type:"BIT",nullable:!1,notes:[]},{name:"PasswordHash",type:"NVARCHAR(200)",nullable:!1,notes:[]},{name:"SecurityStamp",type:"NVARCHAR(64)",nullable:!1,notes:[]},{name:"TwoFactorEnabled",type:"BIT",nullable:!1,notes:[]},{name:"TwoFactorLastStep",type:"BIGINT",nullable:!1,notes:[]},{name:"TwoFactorSecret",type:"NVARCHAR(1000)",nullable:!0,notes:[]},{name:"UserName",type:"NVARCHAR(64)",nullable:!1,notes:["unique"]}],denies:[]},{database:"ClinicHub_Catalog",schema:"catalog",table:"AccountRole",file:"src/ClinicHub.Api/Catalog/Migrations/CatalogDbContextModelSnapshot.cs",line:109,columns:[{name:"AccountId",type:"INT",nullable:!1,notes:["PK","→ catalog.Account"]},{name:"RoleId",type:"INT",nullable:!1,notes:["PK","→ catalog.Role"]}],denies:[]},{database:"ClinicHub_Catalog",schema:"catalog",table:"Clinic",file:"src/ClinicHub.Api/Catalog/Migrations/CatalogDbContextModelSnapshot.cs",line:157,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"ConnectionString",type:"NVARCHAR(2000)",nullable:!0,notes:[]},{name:"CreatedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"DatabaseName",type:"NVARCHAR(128)",nullable:!1,notes:["unique"]},{name:"IsActive",type:"BIT",nullable:!1,notes:[]},{name:"KnownPermissions",type:"NVARCHAR(4000)",nullable:!0,notes:[]},{name:"Name",type:"NVARCHAR(120)",nullable:!1,notes:[]},{name:"Slug",type:"NVARCHAR(40)",nullable:!1,notes:["unique"]}],denies:[],checks:["Slug NOT LIKE '%[^a-z0-9-]%' AND LEN(Slug) >= 2"]},{database:"ClinicHub_Catalog",schema:"catalog",table:"Role",file:"src/ClinicHub.Api/Catalog/Migrations/CatalogDbContextModelSnapshot.cs",line:199,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"ClinicId",type:"INT",nullable:!1,notes:["→ catalog.Clinic"]},{name:"Description",type:"NVARCHAR(300)",nullable:!0,notes:[]},{name:"IsSystem",type:"BIT",nullable:!1,notes:[]},{name:"Name",type:"NVARCHAR(64)",nullable:!1,notes:[]},{name:"Permissions",type:"NVARCHAR(2000)",nullable:!1,notes:[]},{name:"RequireTwoFactor",type:"BIT",nullable:!1,notes:[]}],denies:[]},{database:"ClinicHub_Catalog",schema:"catalog",table:"SecurityEvent",file:"src/ClinicHub.Api/Catalog/Migrations/CatalogDbContextModelSnapshot.cs",line:245,columns:[{name:"Id",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"ActorAccountId",type:"INT",nullable:!0,notes:["→ catalog.Account"]},{name:"AtUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"ClinicId",type:"INT",nullable:!0,notes:["→ catalog.Clinic"]},{name:"Detail",type:"NVARCHAR(500)",nullable:!0,notes:[]},{name:"IpAddress",type:"NVARCHAR(64)",nullable:!0,notes:[]},{name:"TargetAccountId",type:"INT",nullable:!0,notes:["→ catalog.Account"]},{name:"Type",type:"NVARCHAR(32)",nullable:!1,notes:[]}],denies:[]},{database:"ClinicHub_Catalog",schema:"catalog",table:"OpenIddictApplications",file:"src/ClinicHub.Api/Catalog/Migrations/CatalogDbContextModelSnapshot.cs",line:311,columns:[{name:"Id",type:"NVARCHAR(450)",nullable:!1,notes:["PK"]},{name:"ApplicationType",type:"NVARCHAR(50)",nullable:!0,notes:[]},{name:"ClientId",type:"NVARCHAR(100)",nullable:!0,notes:["unique where [ClientId] IS NOT NULL"]},{name:"ClientSecret",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"ClientType",type:"NVARCHAR(50)",nullable:!0,notes:[]},{name:"ConcurrencyToken",type:"NVARCHAR(50)",nullable:!0,notes:["concurrency"]},{name:"ConsentType",type:"NVARCHAR(50)",nullable:!0,notes:[]},{name:"DisplayName",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"DisplayNames",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"JsonWebKeySet",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"Permissions",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"PostLogoutRedirectUris",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"Properties",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"RedirectUris",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"Requirements",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"Settings",type:"NVARCHAR(MAX)",nullable:!0,notes:[]}],denies:[]},{database:"ClinicHub_Catalog",schema:"catalog",table:"OpenIddictAuthorizations",file:"src/ClinicHub.Api/Catalog/Migrations/CatalogDbContextModelSnapshot.cs",line:353,columns:[{name:"Id",type:"NVARCHAR(450)",nullable:!1,notes:["PK"]},{name:"ApplicationId",type:"NVARCHAR(450)",nullable:!0,notes:["→ catalog.OpenIddictApplications"]},{name:"ConcurrencyToken",type:"NVARCHAR(50)",nullable:!0,notes:["concurrency"]},{name:"CreationDate",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"Properties",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"Scopes",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"Status",type:"NVARCHAR(50)",nullable:!0,notes:[]},{name:"Subject",type:"NVARCHAR(400)",nullable:!0,notes:[]},{name:"Type",type:"NVARCHAR(50)",nullable:!0,notes:[]}],denies:[]},{database:"ClinicHub_Catalog",schema:"catalog",table:"OpenIddictScopes",file:"src/ClinicHub.Api/Catalog/Migrations/CatalogDbContextModelSnapshot.cs",line:395,columns:[{name:"Id",type:"NVARCHAR(450)",nullable:!1,notes:["PK"]},{name:"ConcurrencyToken",type:"NVARCHAR(50)",nullable:!0,notes:["concurrency"]},{name:"Description",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"Descriptions",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"DisplayName",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"DisplayNames",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"Name",type:"NVARCHAR(200)",nullable:!0,notes:["unique where [Name] IS NOT NULL"]},{name:"Properties",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"Resources",type:"NVARCHAR(MAX)",nullable:!0,notes:[]}],denies:[]},{database:"ClinicHub_Catalog",schema:"catalog",table:"OpenIddictTokens",file:"src/ClinicHub.Api/Catalog/Migrations/CatalogDbContextModelSnapshot.cs",line:456,columns:[{name:"Id",type:"NVARCHAR(450)",nullable:!1,notes:["PK"]},{name:"ApplicationId",type:"NVARCHAR(450)",nullable:!0,notes:["→ catalog.OpenIddictApplications"]},{name:"AuthorizationId",type:"NVARCHAR(450)",nullable:!0,notes:["→ catalog.OpenIddictAuthorizations"]},{name:"ConcurrencyToken",type:"NVARCHAR(50)",nullable:!0,notes:["concurrency"]},{name:"CreationDate",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"ExpirationDate",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"Payload",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"Properties",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"RedemptionDate",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"ReferenceId",type:"NVARCHAR(100)",nullable:!0,notes:["unique where [ReferenceId] IS NOT NULL"]},{name:"Status",type:"NVARCHAR(50)",nullable:!0,notes:[]},{name:"Subject",type:"NVARCHAR(400)",nullable:!0,notes:[]},{name:"Type",type:"NVARCHAR(150)",nullable:!0,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"sched",table:"Appointment",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:105,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"AppointmentTypeId",type:"INT",nullable:!1,notes:["→ ref.AppointmentType"]},{name:"CancelReason",type:"NVARCHAR(200)",nullable:!0,notes:[]},{name:"CreatedByUserId",type:"INT",nullable:!1,notes:["→ sec.User"]},{name:"CreatedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"EndUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"LocationId",type:"INT",nullable:!1,notes:["→ clinic.Location"]},{name:"Notes",type:"NVARCHAR(500)",nullable:!0,notes:[]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ people.Patient"]},{name:"ProviderId",type:"INT",nullable:!1,notes:["→ clinic.Provider"]},{name:"QueueNumber",type:"INT",nullable:!0,notes:[]},{name:"Reason",type:"NVARCHAR(200)",nullable:!0,notes:[]},{name:"RoomId",type:"INT",nullable:!0,notes:["→ clinic.Room"]},{name:"RowVersion",type:"ROWVERSION",nullable:!1,notes:["concurrency"]},{name:"Source",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"StartUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"Status",type:"NVARCHAR(20)",nullable:!1,notes:[]}],denies:[],checks:["Status IN ('Booked','Arrived','Roomed','WithProvider','Completed','NoShow','Cancelled')","EndUtc > StartUtc"]},{database:"ClinicHub_<clinic>",schema:"sched",table:"AppointmentStatusChange",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:141,columns:[{name:"Id",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"AppointmentId",type:"INT",nullable:!1,notes:["→ sched.Appointment"]},{name:"AtUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"Status",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"UserId",type:"INT",nullable:!1,notes:["→ sec.User"]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"ref",table:"AppointmentType",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:176,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"BookableOnline",type:"BIT",nullable:!1,notes:[]},{name:"Color",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"DurationMinutes",type:"INT",nullable:!1,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:[]},{name:"Name",type:"NVARCHAR(100)",nullable:!1,notes:["unique"]}],denies:[],checks:["DurationMinutes BETWEEN 5 AND 480"]},{database:"ClinicHub_<clinic>",schema:"billing",table:"Claim",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:260,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"AccountingNumber",type:"NVARCHAR(8)",nullable:!1,notes:["unique"]},{name:"AmountPaid",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"AmountSubmitted",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"ClaimBatchId",type:"INT",nullable:!0,notes:["→ billing.ClaimBatch"]},{name:"CreatedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"EncounterId",type:"INT",nullable:!1,notes:["→ care.Encounter"]},{name:"HealthCardNumber",type:"NVARCHAR(10)",nullable:!0,notes:[]},{name:"HealthCardVersion",type:"NVARCHAR(2)",nullable:!0,notes:[]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ people.Patient"]},{name:"PaymentProgram",type:"NVARCHAR(10)",nullable:!1,notes:[]},{name:"ProviderId",type:"INT",nullable:!1,notes:["→ clinic.Provider"]},{name:"Province",type:"NVARCHAR(2)",nullable:!0,notes:[]},{name:"ReferringProviderNumber",type:"NVARCHAR(6)",nullable:!0,notes:[]},{name:"Status",type:"NVARCHAR(20)",nullable:!1,notes:[]}],denies:[],checks:["AmountSubmitted >= 0 AND AmountPaid >= 0","PaymentProgram IN ('HCP','RMB','WCB')","Status IN ('Draft','Ready','Submitted','Paid','PartiallyPaid','Rejected')"]},{database:"ClinicHub_<clinic>",schema:"billing",table:"ClaimBatch",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:321,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"BatchNumber",type:"INT",nullable:!1,notes:[]},{name:"ClaimCount",type:"INT",nullable:!1,notes:[]},{name:"CreatedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"FileContent",type:"NVARCHAR(MAX)",nullable:!1,notes:[]},{name:"FileName",type:"NVARCHAR(40)",nullable:!1,notes:[]},{name:"GroupNumber",type:"NVARCHAR(4)",nullable:!0,notes:[]},{name:"ProviderId",type:"INT",nullable:!1,notes:["→ clinic.Provider"]},{name:"Status",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"SubmittedUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"Total",type:"DECIMAL(10,2)",nullable:!1,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"billing",table:"ClaimItem",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:366,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"ClaimId",type:"INT",nullable:!1,notes:["→ billing.Claim"]},{name:"DiagnosticCode",type:"NVARCHAR(4)",nullable:!0,notes:[]},{name:"ExplanatoryCode",type:"NVARCHAR(2)",nullable:!0,notes:[]},{name:"FeePaid",type:"DECIMAL(10,2)",nullable:!0,notes:[]},{name:"FeeSubmitted",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"ServiceCode",type:"NVARCHAR(5)",nullable:!1,notes:[]},{name:"ServiceDate",type:"DATE",nullable:!1,notes:[]},{name:"Units",type:"TINYINT",nullable:!1,notes:[]}],denies:[],checks:["Units BETWEEN 1 AND 99 AND FeeSubmitted >= 0"]},{database:"ClinicHub_<clinic>",schema:"care",table:"ClinicalNote",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:416,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Addendum",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"Assessment",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"AuthorUserId",type:"INT",nullable:!1,notes:["→ sec.User"]},{name:"EncounterId",type:"INT",nullable:!1,notes:["unique"]},{name:"Objective",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"Plan",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"Subjective",type:"NVARCHAR(MAX)",nullable:!0,notes:[]},{name:"UpdatedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"people",table:"ConsentDirective",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:464,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"CreatedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"EncounterId",type:"INT",nullable:!0,notes:["→ care.Encounter"]},{name:"ExcludedProviderId",type:"INT",nullable:!0,notes:["→ clinic.Provider"]},{name:"Note",type:"NVARCHAR(300)",nullable:!0,notes:[]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ people.Patient"]},{name:"RecordedByUserId",type:"INT",nullable:!1,notes:["→ sec.User"]},{name:"RevokedUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"Scope",type:"NVARCHAR(20)",nullable:!1,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"people",table:"ConsentOverride",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:498,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"AtUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"ConsentDirectiveId",type:"INT",nullable:!1,notes:["→ people.ConsentDirective"]},{name:"ExpiresUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"Reason",type:"NVARCHAR(300)",nullable:!1,notes:[]},{name:"UserId",type:"INT",nullable:!1,notes:["→ sec.User"]}],denies:[],checks:["ExpiresUtc > AtUtc"]},{database:"ClinicHub_<clinic>",schema:"ref",table:"DiagnosticCode",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:520,columns:[{name:"Code",type:"NVARCHAR(4)",nullable:!1,notes:["PK"]},{name:"Description",type:"NVARCHAR(200)",nullable:!1,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"orders",table:"DiagnosticResult",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:573,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"ExternalReportId",type:"NVARCHAR(64)",nullable:!0,notes:[]},{name:"ExternalUrl",type:"NVARCHAR(300)",nullable:!0,notes:[]},{name:"IsAbnormal",type:"BIT",nullable:!1,notes:[]},{name:"ReceivedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"ReviewedByUserId",type:"INT",nullable:!0,notes:["→ sec.User"]},{name:"ReviewedUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"ServiceRequestId",type:"INT",nullable:!1,notes:["→ orders.ServiceRequest"]},{name:"Status",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"Summary",type:"NVARCHAR(MAX)",nullable:!0,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"care",table:"EligibilityCheck",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:624,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"CheckedByUserId",type:"INT",nullable:!1,notes:["→ sec.User"]},{name:"CheckedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"HealthCardNumber",type:"NVARCHAR(10)",nullable:!1,notes:[]},{name:"HealthCardVersion",type:"NVARCHAR(2)",nullable:!0,notes:[]},{name:"IsEligible",type:"BIT",nullable:!1,notes:[]},{name:"Message",type:"NVARCHAR(200)",nullable:!1,notes:[]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ people.Patient"]},{name:"ResponseCode",type:"NVARCHAR(4)",nullable:!1,notes:[]},{name:"Simulated",type:"BIT",nullable:!1,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"care",table:"Encounter",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:709,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"AppointmentId",type:"INT",nullable:!0,notes:["unique where AppointmentId IS NOT NULL","→ sched.Appointment"]},{name:"CheckInUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"CtasLevel",type:"TINYINT",nullable:!0,notes:[]},{name:"EligibilityCheckId",type:"INT",nullable:!0,notes:["→ care.EligibilityCheck"]},{name:"EndedUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"Kind",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"LocationId",type:"INT",nullable:!1,notes:["→ clinic.Location"]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ people.Patient"]},{name:"PaymentProgram",type:"NVARCHAR(10)",nullable:!1,notes:[]},{name:"ProviderId",type:"INT",nullable:!1,notes:["→ clinic.Provider"]},{name:"ReasonForVisit",type:"NVARCHAR(300)",nullable:!0,notes:[]},{name:"RowVersion",type:"ROWVERSION",nullable:!1,notes:["concurrency"]},{name:"SignedByUserId",type:"INT",nullable:!0,notes:["→ sec.User"]},{name:"SignedUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"StartedUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"Status",type:"NVARCHAR(20)",nullable:!1,notes:[]}],denies:[],checks:["CtasLevel IS NULL OR CtasLevel BETWEEN 1 AND 5","PaymentProgram IN ('HCP','RMB','WCB','Uninsured')","Status <> 'Signed' OR (SignedUtc IS NOT NULL AND SignedByUserId IS NOT NULL)","Status IN ('Open','Signed','Voided')"]},{database:"ClinicHub_<clinic>",schema:"care",table:"EncounterDiagnosis",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:753,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"DiagnosticCodeCode",type:"NVARCHAR(4)",nullable:!1,notes:["→ ref.DiagnosticCode"]},{name:"EncounterId",type:"INT",nullable:!1,notes:["unique where IsPrimary = 1","→ care.Encounter"]},{name:"IsPrimary",type:"BIT",nullable:!1,notes:[]},{name:"Note",type:"NVARCHAR(200)",nullable:!0,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"care",table:"EncounterService",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:792,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"EncounterId",type:"INT",nullable:!1,notes:["→ care.Encounter"]},{name:"Fee",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"FeeCodeServiceCode",type:"NVARCHAR(5)",nullable:!0,notes:["→ ref.FeeCode"]},{name:"ServiceDate",type:"DATE",nullable:!1,notes:[]},{name:"UninsuredServiceId",type:"INT",nullable:!0,notes:["→ ref.UninsuredService"]},{name:"Units",type:"TINYINT",nullable:!1,notes:[]}],denies:[],checks:["(FeeCodeServiceCode IS NOT NULL AND UninsuredServiceId IS NULL) OR (FeeCodeServiceCode IS NULL AND UninsuredServiceId IS NOT NULL)","Units BETWEEN 1 AND 99 AND Fee >= 0"]},{database:"ClinicHub_<clinic>",schema:"ref",table:"FeeCode",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:826,columns:[{name:"ServiceCode",type:"NVARCHAR(5)",nullable:!1,notes:["PK"]},{name:"Description",type:"NVARCHAR(200)",nullable:!1,notes:[]},{name:"EffectiveFrom",type:"DATE",nullable:!1,notes:[]},{name:"Fee",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:[]},{name:"IsIllustrative",type:"BIT",nullable:!1,notes:[]}],denies:[],checks:["Fee >= 0"]},{database:"ClinicHub_<clinic>",schema:"billing",table:"FinanceExport",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:843,columns:[{name:"ExternalId",type:"NVARCHAR(200)",nullable:!1,notes:["PK"]},{name:"SentUtc",type:"DATETIME2(3)",nullable:!1,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"orders",table:"InboundMessage",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:881,columns:[{name:"Id",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"Error",type:"NVARCHAR(1000)",nullable:!0,notes:[]},{name:"Kind",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"PayloadJson",type:"NVARCHAR(MAX)",nullable:!1,notes:[]},{name:"ProcessedUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"ReceivedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"Source",type:"NVARCHAR(20)",nullable:!1,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"billing",table:"Invoice",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:949,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Balance",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"CreatedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"EncounterId",type:"INT",nullable:!0,notes:["→ care.Encounter"]},{name:"IssuedUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"Number",type:"NVARCHAR(20)",nullable:!1,notes:["unique"]},{name:"PatientId",type:"INT",nullable:!0,notes:["→ people.Patient"]},{name:"RowVersion",type:"ROWVERSION",nullable:!1,notes:["concurrency"]},{name:"Status",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"Subtotal",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"Tax",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"ThirdPartyName",type:"NVARCHAR(120)",nullable:!0,notes:[]},{name:"Total",type:"DECIMAL(10,2)",nullable:!1,notes:[]}],denies:[],checks:["PatientId IS NOT NULL OR ThirdPartyName IS NOT NULL","Total = Subtotal + Tax AND Balance BETWEEN 0 AND Total"]},{database:"ClinicHub_<clinic>",schema:"billing",table:"InvoiceLine",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:998,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Description",type:"NVARCHAR(200)",nullable:!1,notes:[]},{name:"InvoiceId",type:"INT",nullable:!1,notes:["→ billing.Invoice"]},{name:"LineTotal",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"Quantity",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"TaxRatePercent",type:"DECIMAL(5,2)",nullable:!1,notes:[]},{name:"UninsuredServiceId",type:"INT",nullable:!0,notes:["→ ref.UninsuredService"]},{name:"UnitPrice",type:"DECIMAL(10,2)",nullable:!1,notes:[]}],denies:[],checks:["Quantity > 0 AND UnitPrice >= 0"]},{database:"ClinicHub_<clinic>",schema:"clinic",table:"Location",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1050,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"AddressLine1",type:"NVARCHAR(200)",nullable:!1,notes:[]},{name:"City",type:"NVARCHAR(80)",nullable:!1,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:[]},{name:"Name",type:"NVARCHAR(120)",nullable:!1,notes:[]},{name:"OhipGroupNumber",type:"NVARCHAR(4)",nullable:!0,notes:[]},{name:"Phone",type:"NVARCHAR(20)",nullable:!0,notes:[]},{name:"PostalCode",type:"NVARCHAR(7)",nullable:!1,notes:[]},{name:"Province",type:"NVARCHAR(2)",nullable:!1,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"orders",table:"OutboxMessage",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1108,columns:[{name:"Id",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"Attempts",type:"INT",nullable:!1,notes:[]},{name:"CreatedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"Destination",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"Kind",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"LastError",type:"NVARCHAR(1000)",nullable:!0,notes:[]},{name:"NextAttemptUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"PayloadJson",type:"NVARCHAR(MAX)",nullable:!1,notes:[]},{name:"PrescriptionId",type:"INT",nullable:!0,notes:["→ orders.Prescription"]},{name:"SentUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"ServiceRequestId",type:"INT",nullable:!0,notes:["→ orders.ServiceRequest"]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"people",table:"Patient",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1240,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"AddressLine1",type:"NVARCHAR(200)",nullable:!0,notes:[]},{name:"City",type:"NVARCHAR(80)",nullable:!0,notes:[]},{name:"CoverageProvince",type:"NVARCHAR(2)",nullable:!0,notes:[]},{name:"CreatedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"DateOfBirth",type:"DATE",nullable:!1,notes:[]},{name:"DeceasedDate",type:"DATE",nullable:!0,notes:[]},{name:"Email",type:"NVARCHAR(120)",nullable:!0,notes:[]},{name:"FamilyProviderName",type:"NVARCHAR(120)",nullable:!0,notes:[]},{name:"FamilyProviderOhipNumber",type:"NVARCHAR(6)",nullable:!0,notes:[]},{name:"FirstName",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"HealthCardExpiry",type:"DATE",nullable:!0,notes:[]},{name:"HealthCardNumber",type:"NVARCHAR(10)",nullable:!0,notes:["unique where HealthCardNumber IS NOT NULL AND MergedIntoPatientId IS NULL"]},{name:"HealthCardVersion",type:"NVARCHAR(2)",nullable:!0,notes:[]},{name:"IsDeceased",type:"BIT",nullable:!1,notes:[]},{name:"LastName",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"MergedIntoPatientId",type:"INT",nullable:!0,notes:["→ people.Patient"]},{name:"MiddleName",type:"NVARCHAR(60)",nullable:!0,notes:[]},{name:"Mrn",type:"NVARCHAR(12)",nullable:!1,notes:["unique"]},{name:"OutOfProvinceNumber",type:"NVARCHAR(12)",nullable:!0,notes:[]},{name:"Phone",type:"NVARCHAR(20)",nullable:!0,notes:[]},{name:"PostalCode",type:"NVARCHAR(7)",nullable:!0,notes:[]},{name:"PreferredLanguage",type:"NVARCHAR(2)",nullable:!1,notes:[]},{name:"PreferredName",type:"NVARCHAR(60)",nullable:!0,notes:[]},{name:"Province",type:"NVARCHAR(2)",nullable:!0,notes:[]},{name:"RowVersion",type:"ROWVERSION",nullable:!1,notes:["concurrency"]},{name:"Sex",type:"NVARCHAR(1)",nullable:!1,notes:[]},{name:"UpdatedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]}],denies:[],checks:["HealthCardNumber IS NULL OR (LEN(HealthCardNumber) = 10 AND HealthCardNumber NOT LIKE '%[^0-9]%')","MergedIntoPatientId IS NULL OR MergedIntoPatientId <> Id","Sex IN ('M','F','X','U')","HealthCardVersion IS NULL OR HealthCardVersion NOT LIKE '%[^A-Z]%'"]},{database:"ClinicHub_<clinic>",schema:"sec",table:"PatientAccessLog",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1294,columns:[{name:"Id",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"Action",type:"NVARCHAR(10)",nullable:!1,notes:[]},{name:"AtUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"ConsentOverrideId",type:"INT",nullable:!0,notes:["→ people.ConsentOverride"]},{name:"Context",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"IpAddress",type:"NVARCHAR(64)",nullable:!0,notes:[]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ people.Patient"]},{name:"UserId",type:"INT",nullable:!1,notes:["→ sec.User"]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"people",table:"PatientAllergy",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1353,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"AllergenKey",type:"NVARCHAR(40)",nullable:!0,notes:[]},{name:"CreatedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"EndReason",type:"NVARCHAR(200)",nullable:!0,notes:[]},{name:"EndedByUserId",type:"INT",nullable:!0,notes:["→ sec.User"]},{name:"EndedUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"NoKnown",type:"BIT",nullable:!1,notes:[]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ people.Patient"]},{name:"Reaction",type:"NVARCHAR(200)",nullable:!0,notes:[]},{name:"RecordedByUserId",type:"INT",nullable:!1,notes:["→ sec.User"]},{name:"Severity",type:"NVARCHAR(10)",nullable:!1,notes:[]},{name:"Substance",type:"NVARCHAR(100)",nullable:!1,notes:[]}],denies:[],checks:["Severity IN ('Mild','Moderate','Severe')"]},{database:"ClinicHub_<clinic>",schema:"people",table:"PatientDuplicateCandidate",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1404,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"FoundUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"PatientAId",type:"INT",nullable:!1,notes:["→ people.Patient"]},{name:"PatientBId",type:"INT",nullable:!1,notes:["→ people.Patient"]},{name:"Reasons",type:"NVARCHAR(300)",nullable:!1,notes:[]},{name:"ReviewedByUserId",type:"INT",nullable:!0,notes:["→ sec.User"]},{name:"ReviewedUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"Score",type:"INT",nullable:!1,notes:[]},{name:"Status",type:"NVARCHAR(20)",nullable:!1,notes:[]}],denies:[],checks:["PatientAId < PatientBId","Score BETWEEN 0 AND 100"]},{database:"ClinicHub_<clinic>",schema:"people",table:"PatientMergeLog",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1464,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"AtUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"ByUserId",type:"INT",nullable:!1,notes:["→ sec.User"]},{name:"FieldsAfterJson",type:"NVARCHAR(MAX)",nullable:!1,notes:[]},{name:"FieldsBeforeJson",type:"NVARCHAR(MAX)",nullable:!1,notes:[]},{name:"MergedId",type:"INT",nullable:!1,notes:["→ people.Patient"]},{name:"MovedJson",type:"NVARCHAR(MAX)",nullable:!1,notes:[]},{name:"OutboxIdsJson",type:"NVARCHAR(MAX)",nullable:!1,notes:[]},{name:"SurvivorId",type:"INT",nullable:!1,notes:["→ people.Patient"]},{name:"UndoneByUserId",type:"INT",nullable:!0,notes:["→ sec.User"]},{name:"UndoneUtc",type:"DATETIME2(3)",nullable:!0,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"billing",table:"Payment",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1503,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Amount",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"InvoiceId",type:"INT",nullable:!1,notes:["→ billing.Invoice"]},{name:"Method",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"ReceivedByUserId",type:"INT",nullable:!1,notes:["→ sec.User"]},{name:"ReceivedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"Reference",type:"NVARCHAR(60)",nullable:!0,notes:[]}],denies:[],checks:["Amount > 0"]},{database:"ClinicHub_<clinic>",schema:"orders",table:"Prescription",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1613,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"AlertNote",type:"NVARCHAR(1000)",nullable:!0,notes:[]},{name:"CancelReason",type:"NVARCHAR(200)",nullable:!0,notes:[]},{name:"CancelledUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"CreatedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"DaysSupply",type:"INT",nullable:!0,notes:[]},{name:"Din",type:"NVARCHAR(8)",nullable:!1,notes:[]},{name:"Directions",type:"NVARCHAR(200)",nullable:!1,notes:[]},{name:"Display",type:"NVARCHAR(200)",nullable:!1,notes:[]},{name:"EncounterId",type:"INT",nullable:!1,notes:["→ care.Encounter"]},{name:"ExternalId",type:"NVARCHAR(64)",nullable:!0,notes:[]},{name:"GroupNumber",type:"INT",nullable:!1,notes:[]},{name:"NoSubstitution",type:"BIT",nullable:!1,notes:[]},{name:"Note",type:"NVARCHAR(500)",nullable:!0,notes:[]},{name:"OutboxMessageId",type:"BIGINT",nullable:!0,notes:["→ orders.OutboxMessage"]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ people.Patient"]},{name:"PrescriberProviderId",type:"INT",nullable:!1,notes:["→ clinic.Provider"]},{name:"Quantity",type:"INT",nullable:!1,notes:[]},{name:"QuantityUnit",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"RenewsPrescriptionId",type:"INT",nullable:!0,notes:["→ orders.Prescription"]},{name:"Repeats",type:"INT",nullable:!1,notes:[]},{name:"SentUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"Status",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"StatusNote",type:"NVARCHAR(500)",nullable:!0,notes:[]}],denies:[],checks:["DaysSupply IS NULL OR DaysSupply BETWEEN 1 AND 365","Din NOT LIKE '%[^0-9]%' AND LEN(Din) = 8","Quantity > 0","Repeats BETWEEN 0 AND 11","Status IN ('Draft','Accepted','Cancelled','Failed','Cancelling')"]},{database:"ClinicHub_<clinic>",schema:"clinic",table:"Provider",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1694,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Email",type:"NVARCHAR(120)",nullable:!0,notes:[]},{name:"FirstName",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:[]},{name:"Kind",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"LastName",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"OhipBillingNumber",type:"NVARCHAR(6)",nullable:!0,notes:["unique where OhipBillingNumber IS NOT NULL"]},{name:"OverheadPercent",type:"DECIMAL(5,2)",nullable:!1,notes:[]},{name:"RegistrationNumber",type:"NVARCHAR(10)",nullable:!0,notes:[]},{name:"SpecialtyCode",type:"NVARCHAR(2)",nullable:!0,notes:[]},{name:"SpecialtyName",type:"NVARCHAR(60)",nullable:!0,notes:[]},{name:"Title",type:"NVARCHAR(10)",nullable:!0,notes:[]},{name:"UserId",type:"INT",nullable:!0,notes:["unique where UserId IS NOT NULL","→ sec.User"]}],denies:[],checks:["OhipBillingNumber IS NULL OR (LEN(OhipBillingNumber) = 6 AND OhipBillingNumber NOT LIKE '%[^0-9]%')","OverheadPercent BETWEEN 0 AND 100"]},{database:"ClinicHub_<clinic>",schema:"ref",table:"Province",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1718,columns:[{name:"Code",type:"NVARCHAR(2)",nullable:!1,notes:["PK"]},{name:"Name",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"ReciprocalBilling",type:"BIT",nullable:!1,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"care",table:"Referral",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1773,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Channel",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"EncounterId",type:"INT",nullable:!1,notes:["→ care.Encounter"]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ people.Patient"]},{name:"Reason",type:"NVARCHAR(1000)",nullable:!1,notes:[]},{name:"SentUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"Status",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"ToProviderName",type:"NVARCHAR(120)",nullable:!0,notes:[]},{name:"ToSpecialty",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"Urgency",type:"NVARCHAR(10)",nullable:!1,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"billing",table:"RemittanceAdvice",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1817,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"FileContent",type:"NVARCHAR(MAX)",nullable:!1,notes:[]},{name:"FileName",type:"NVARCHAR(40)",nullable:!1,notes:[]},{name:"GroupNumber",type:"NVARCHAR(4)",nullable:!0,notes:[]},{name:"ImportedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"OhipBillingNumber",type:"NVARCHAR(6)",nullable:!0,notes:[]},{name:"PaymentDate",type:"DATE",nullable:!1,notes:[]},{name:"Simulated",type:"BIT",nullable:!1,notes:[]},{name:"TotalPaid",type:"DECIMAL(10,2)",nullable:!1,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"billing",table:"RemittanceItem",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1867,columns:[{name:"Id",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"AccountingNumber",type:"NVARCHAR(8)",nullable:!1,notes:[]},{name:"AmountPaid",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"AmountSubmitted",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"ClaimItemId",type:"INT",nullable:!0,notes:["→ billing.ClaimItem"]},{name:"ExplanatoryCode",type:"NVARCHAR(2)",nullable:!0,notes:[]},{name:"RemittanceAdviceId",type:"INT",nullable:!1,notes:["→ billing.RemittanceAdvice"]},{name:"ServiceCode",type:"NVARCHAR(5)",nullable:!1,notes:[]},{name:"ServiceDate",type:"DATE",nullable:!1,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"clinic",table:"Room",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1899,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"IsActive",type:"BIT",nullable:!1,notes:[]},{name:"Kind",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"LocationId",type:"INT",nullable:!1,notes:["→ clinic.Location"]},{name:"Name",type:"NVARCHAR(40)",nullable:!1,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"sched",table:"ScheduleException",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1935,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Date",type:"DATE",nullable:!1,notes:[]},{name:"EndTime",type:"TIME",nullable:!0,notes:[]},{name:"Kind",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"ProviderId",type:"INT",nullable:!1,notes:["→ clinic.Provider"]},{name:"Reason",type:"NVARCHAR(200)",nullable:!0,notes:[]},{name:"StartTime",type:"TIME",nullable:!0,notes:[]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"sched",table:"ScheduleTemplate",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:1979,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"AcceptsWalkIns",type:"BIT",nullable:!1,notes:[]},{name:"DayOfWeek",type:"INT",nullable:!1,notes:[]},{name:"EffectiveFrom",type:"DATE",nullable:!1,notes:[]},{name:"EffectiveTo",type:"DATE",nullable:!0,notes:[]},{name:"EndTime",type:"TIME",nullable:!1,notes:[]},{name:"LocationId",type:"INT",nullable:!1,notes:["→ clinic.Location"]},{name:"ProviderId",type:"INT",nullable:!1,notes:["→ clinic.Provider"]},{name:"SlotMinutes",type:"INT",nullable:!1,notes:[]},{name:"StartTime",type:"TIME",nullable:!1,notes:[]}],denies:[],checks:["EndTime > StartTime","SlotMinutes BETWEEN 5 AND 120"]},{database:"ClinicHub_<clinic>",schema:"orders",table:"ServiceRequest",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:2073,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"CancelReason",type:"NVARCHAR(200)",nullable:!0,notes:[]},{name:"CancelledUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"ClinicalNotes",type:"NVARCHAR(500)",nullable:!0,notes:[]},{name:"Code",type:"NVARCHAR(40)",nullable:!1,notes:[]},{name:"CompletedUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"CreatedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"Display",type:"NVARCHAR(200)",nullable:!1,notes:[]},{name:"EncounterId",type:"INT",nullable:!1,notes:["→ care.Encounter"]},{name:"ExternalId",type:"NVARCHAR(64)",nullable:!0,notes:[]},{name:"OutboxMessageId",type:"BIGINT",nullable:!0,notes:["→ orders.OutboxMessage"]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ people.Patient"]},{name:"Priority",type:"NVARCHAR(10)",nullable:!1,notes:[]},{name:"RequesterProviderId",type:"INT",nullable:!1,notes:["→ clinic.Provider"]},{name:"SentUtc",type:"DATETIME2(3)",nullable:!0,notes:[]},{name:"Status",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"StatusNote",type:"NVARCHAR(500)",nullable:!0,notes:[]},{name:"TargetSystem",type:"NVARCHAR(20)",nullable:!1,notes:[]}],denies:[],checks:["Priority IN ('Routine','Stat')","TargetSystem IN ('LabFlow','ClinicReport','ExternalLab')"]},{database:"ClinicHub_<clinic>",schema:"ref",table:"UninsuredService",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:2115,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Code",type:"NVARCHAR(20)",nullable:!1,notes:["unique"]},{name:"IsActive",type:"BIT",nullable:!1,notes:[]},{name:"Name",type:"NVARCHAR(200)",nullable:!1,notes:[]},{name:"Price",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"TaxRatePercent",type:"DECIMAL(5,2)",nullable:!1,notes:[]}],denies:[],checks:["Price >= 0 AND TaxRatePercent BETWEEN 0 AND 100"]},{database:"ClinicHub_<clinic>",schema:"sec",table:"User",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:2151,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK"]},{name:"Credentials",type:"NVARCHAR(64)",nullable:!0,notes:[]},{name:"DisplayName",type:"NVARCHAR(128)",nullable:!1,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:[]},{name:"SyncedUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"UserName",type:"NVARCHAR(64)",nullable:!1,notes:["unique"]}],denies:[]},{database:"ClinicHub_<clinic>",schema:"care",table:"VitalSigns",file:"src/ClinicHub.Api/Data/Migrations/ClinicHubDbContextModelSnapshot.cs",line:2204,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"DiastolicMmHg",type:"SMALLINT",nullable:!0,notes:[]},{name:"EncounterId",type:"INT",nullable:!1,notes:["→ care.Encounter"]},{name:"HeartRate",type:"SMALLINT",nullable:!0,notes:[]},{name:"HeightCm",type:"DECIMAL(5,1)",nullable:!0,notes:[]},{name:"RespiratoryRate",type:"SMALLINT",nullable:!0,notes:[]},{name:"SpO2",type:"TINYINT",nullable:!0,notes:[]},{name:"SystolicMmHg",type:"SMALLINT",nullable:!0,notes:[]},{name:"TakenByUserId",type:"INT",nullable:!1,notes:["→ sec.User"]},{name:"TakenUtc",type:"DATETIME2(3)",nullable:!1,notes:[]},{name:"TemperatureC",type:"DECIMAL(4,1)",nullable:!0,notes:[]},{name:"WeightKg",type:"DECIMAL(5,1)",nullable:!0,notes:[]}],denies:[],checks:["(SpO2 IS NULL OR SpO2 <= 100) AND (TemperatureC IS NULL OR TemperatureC BETWEEN 25 AND 45) AND (HeartRate IS NULL OR HeartRate BETWEEN 10 AND 300)"]}],l=[{path:"/",component:"Navigate",guards:[]},{path:"/frontdesk",component:"FrontDesk",guards:[]},{path:"/patients",component:"Patients",guards:[]},{path:"/visits",component:"Visits",guards:[]},{path:"/visits/:id",component:"EncounterPage",guards:[]},{path:"/billing",component:"Billing",guards:[]},{path:"/results",component:"Results",guards:[]},{path:"/people",component:"Users",guards:[]},{path:"/logs",component:"Audit",guards:[]},{path:"/clinics",component:"Clinics",guards:[]},{path:"/account",component:"Account",guards:[]},{path:"*",redirect:"/",guards:[]}],r={project:e,repo:n,files:t,examples:i,endpoints:a,tables:s,routes:l};export{r as default,a as endpoints,i as examples,t as files,e as project,n as repo,l as routes,s as tables};
