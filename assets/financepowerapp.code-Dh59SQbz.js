const e="financepowerapp",n="FinancePowerApp",t={"README.md":107,"database/deploy.ps1":48,"src/FinancePowerApp.Api/Program.cs":61,"src/FinancePowerApp.Api/Properties/launchSettings.json":26,"web/vite.config.ts":17,"tests/FinancePowerApp.Tests/ApiFactory.cs":72,"tests/FinancePowerApp.Tests/LedgerApiTests.cs":169,"tests/FinancePowerApp.Tests/PostingEngineTests.cs":112,"tests/FinancePowerApp.Tests/SignInTests.cs":68,"database/005_powerapp_baseline.sql":179,"database/011_expense_posting.sql":16,"src/FinancePowerApp.Api/Domain/Ledger.cs":489,"src/FinancePowerApp.Api/Data/FinanceDbContext.cs":74,"src/FinancePowerApp.Api/Auth/AuthSetup.cs":119,"src/FinancePowerApp.Api/Auth/ClinicHubSignIn.cs":205,"web/src/api.ts":103,"src/FinancePowerApp.Api/Endpoints/IntegrationEndpoints.cs":76,"src/FinancePowerApp.Api/appsettings.Development.json":10,"database/010_erp_schema.sql":238,"database/020_seed_reference.sql":151,"src/FinancePowerApp.Api/Data/Entities.cs":280,"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs":262,"src/FinancePowerApp.Api/Domain/FinancialDocument.cs":104,"src/FinancePowerApp.Api/Domain/PostingEngine.cs":160,"web/src/pages/Inbox.tsx":79,"src/FinancePowerApp.Api/Domain/Reports.cs":160,"database/030_reports.sql":56,"src/FinancePowerApp.Api/Endpoints/ReportEndpoints.cs":67,"database/tools/analytics_reader.sql":56,"database/060_item_payments.sql":12,"web/src/App.tsx":110,"web/src/pages/Dashboard.tsx":50,"web/src/pages/Journal.tsx":173,"web/src/pages/Reports.tsx":158,"web/src/pages/Setup.tsx":306},a={"run/deploy":{file:"database/deploy.ps1",start:42,end:47,code:`foreach ($s in $scripts) {
    if ($applied -contains $s.Name) { continue }
    Write-Host "Running $($s.Name)..."
    Invoke-Sql $Database $s.FullName $null
    Invoke-Sql $Database $null "INSERT dbo.ErpMigration (Script) VALUES (N'$($s.Name)')"
}`},"run/secrets":{file:"src/FinancePowerApp.Api/Program.cs",start:10,end:11,code:`// Secrets as files, one per setting (e.g. ConnectionStrings__Finance), the way Docker mounts them; none outside a container.
builder.Configuration.AddKeyPerFile("/run/secrets", optional: true);`},"run/proxy":{file:"web/vite.config.ts",start:4,end:17,code:`// The API runs on :5400 (src/FinancePowerApp.Api). Proxying keeps the browser on one origin, so the API needs no CORS policy.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5401,
    strictPort: true,
    proxy: {
      // The browser's Host is kept, so a sign-in through ClinicHub returns to :5401 (registered there) and lands on the page.
      '/api': { target: 'http://localhost:5400', changeOrigin: false },
      '/signin-oidc': { target: 'http://localhost:5400', changeOrigin: false },
      '/signout-callback-oidc': { target: 'http://localhost:5400', changeOrigin: false },
    },
  },
})`},"tests/build":{file:"tests/FinancePowerApp.Tests/ApiFactory.cs",start:35,end:39,code:`var dir = Path.Combine(AppContext.BaseDirectory, "database");
foreach (var file in Directory.GetFiles(dir, "*.sql").Where(f => Regex.IsMatch(Path.GetFileName(f), @"^\\d{3}_")).Order())
    foreach (var batch in Regex.Split(await File.ReadAllTextAsync(file), @"^\\s*GO\\s*$", RegexOptions.Multiline | RegexOptions.IgnoreCase))
        if (!string.IsNullOrWhiteSpace(batch))
            await new SqlCommand(batch, conn).ExecuteNonQueryAsync();`},"tests/claim":{file:"tests/FinancePowerApp.Tests/LedgerApiTests.cs",start:35,end:58,code:`public async Task A_claim_and_its_remittance_settle_the_receivable_and_sending_twice_changes_nothing()
{
    var app = factory.App();
    var posted = await Send(app, Claim("1001", "AB12-001001", 37.95m));
    Assert.Equal("Posted", (string)posted["status"]!);
    var again = await Send(app, Claim("1001", "AB12-001001", 37.95m));
    Assert.True(again["duplicate"]!.GetValue<bool>());
    Assert.Equal(1, await factory.Scalar<int>("SELECT COUNT(*) FROM ar.Item WHERE Reference = 'AB12-001001'"));

    var remittance = await Send(app, new
    {
        sourceKey = "harbourview", externalId = "ra:2026-10:AB12-001001", kind = "Receipt", date = "2026-10-20", reference = "RA-2026-10", method = "EFT",
        party = new { type = "OHIP", code = "OHIP" },
        lines = new object[]
        {
            new { amount = 30.00m, appliesTo = "AB12-001001" },
            new { category = "Adjustment.ShortPaid", amount = 7.95m, appliesTo = "AB12-001001" },
        },
    });
    Assert.Equal("Posted", (string)remittance["status"]!);
    Assert.Equal(0m, await factory.Scalar<decimal>("SELECT Balance FROM ar.Item WHERE Reference = 'AB12-001001'"));

    var tb = await Json(await factory.App().GetAsync("/api/reports/trial-balance?asOf=2026-12-31"));
    Assert.Equal(tb["totalDebit"]!.GetValue<decimal>(), tb["totalCredit"]!.GetValue<decimal>());`},"tests/nostart":{file:"tests/FinancePowerApp.Tests/SignInTests.cs",start:58,end:67,code:`public void Outside_development_it_refuses_to_start_without_ClinicHub()
{
    using var production = new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
    {
        b.UseEnvironment("Production");
        b.UseSetting("ConnectionStrings:Finance", "Server=unused;Database=unused");
    });
    var ex = Assert.ThrowsAny<Exception>(() => production.CreateClient());
    Assert.Contains("ClinicHub:ClientSecret", ex.ToString());
}`},"powerapp/trigger":{file:"database/005_powerapp_baseline.sql",start:153,end:178,code:`-- The Power App's guard: expenses in a closed month can't be inserted or changed.
IF OBJECT_ID(N'dbo.trg_BlockChangesOnClosedPeriod', N'TR') IS NULL
EXEC(N'CREATE TRIGGER [dbo].[trg_BlockChangesOnClosedPeriod]
ON [dbo].[Expenses]
INSTEAD OF INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM inserted i JOIN AccountingPeriods p ON i.PeriodId = p.PeriodId WHERE p.IsClosed = 1)
    BEGIN
        RAISERROR (''Accounting period is closed. No changes allowed.'', 16, 1);
        RETURN;
    END
    IF NOT EXISTS (SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO Expenses (Amount, Category, ExpenseDate, Vendor, Description, Status, PeriodId, ApprovedBy, ApprovedDate, CategoryId, TaxAmount)
        SELECT Amount, Category, ExpenseDate, Vendor, Description, Status, PeriodId, ApprovedBy, ApprovedDate, CategoryId, TaxAmount FROM inserted;
    END
    ELSE
    BEGIN
        UPDATE e SET e.Amount = i.Amount, e.Category = i.Category, e.ExpenseDate = i.ExpenseDate, e.Vendor = i.Vendor,
            e.Description = i.Description, e.Status = i.Status, e.PeriodId = i.PeriodId, e.ApprovedBy = i.ApprovedBy,
            e.ApprovedDate = i.ApprovedDate, e.CategoryId = i.CategoryId, e.TaxAmount = i.TaxAmount
        FROM Expenses e JOIN inserted i ON e.ExpenseId = i.ExpenseId;
    END
END;');`},"powerapp/never":{file:"database/011_expense_posting.sql",start:1,end:7,code:`-- The Power App's dbo.Expenses has an INSTEAD OF trigger (trg_BlockChangesOnClosedPeriod) that rewrites every update
-- with its own column list and refuses changes in closed months. So the ledger never writes to dbo.Expenses: which
-- journal entry an approved expense became is kept here, and the two columns 010 added are taken back.

ALTER TABLE dbo.Expenses DROP CONSTRAINT FK_Expenses_Entity;
ALTER TABLE dbo.Expenses DROP CONSTRAINT FK_Expenses_Journal;
ALTER TABLE dbo.Expenses DROP COLUMN EntityId, JournalEntryId;`},"powerapp/expenses":{file:"src/FinancePowerApp.Api/Domain/Ledger.cs",start:288,end:293,code:`/// Approved expenses not yet in the ledger become bills of the default business: the full amount paid to the
/// expense account of their category, owed to the vendor. The Power App's TaxAmount is the part deductible for
/// income tax (it feeds vw_TaxLedger with the category's TaxDeductible flag), not HST: the Power App doesn't record
/// the HST on a receipt, so no input tax credit is taken. Returns how many were posted, and why others weren't.
/// </summary>
public async Task<(int Posted, List<string> Skipped)> PostApprovedExpensesAsync(string user)`},"signin/start":{file:"src/FinancePowerApp.Api/Auth/AuthSetup.cs",start:50,end:51,code:`if (!hub.SignInEnabled && !builder.Environment.IsDevelopment() && builder.Environment.EnvironmentName != "Testing")
    throw new InvalidOperationException("Set ClinicHub:Authority and ClinicHub:ClientSecret: outside development people sign in through ClinicHub.");`},"signin/policies":{file:"src/FinancePowerApp.Api/Auth/AuthSetup.cs",start:70,end:75,code:`builder.Services.AddAuthorization(o =>
{
    foreach (var p in FinancePermissions.All)
        o.AddPolicy(p, policy => policy.RequireAuthenticatedUser().RequireAssertion(ctx =>
            ctx.User.HasClaim(PermissionClaim, p) || ctx.User.HasClaim(PermissionClaim, FinancePermissions.Admin)));
});`},"signin/recheck":{file:"src/FinancePowerApp.Api/Auth/ClinicHubSignIn.cs",start:119,end:133,code:`if (DateTime.UtcNow - checkedAt >= TimeSpan.FromMinutes(options.RecheckMinutes))
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
}`},"signin/local":{file:"src/FinancePowerApp.Api/Auth/ClinicHubSignIn.cs",start:88,end:94,code:`private static ClaimsPrincipal ToLocalPrincipal(ClaimsPrincipal hub, out bool allowed)
{
    var permissions = hub.FindAll(AuthSetup.PermissionClaim).Select(c => c.Value).Where(FinancePermissions.All.Contains).Distinct().ToList();
    allowed = permissions.Count > 0;
    var name = hub.FindFirstValue("name") ?? hub.FindFirstValue("preferred_username") ?? hub.FindFirstValue("sub") ?? "unknown";
    return allowed ? Principal(hub.FindFirstValue("sub")!, name, hub.FindFirstValue(ClinicName), permissions, DateTime.UtcNow) : hub;
}`},"csrf/check":{file:"src/FinancePowerApp.Api/Auth/ClinicHubSignIn.cs",start:193,end:204,code:`public static IApplicationBuilder UseCsrfHeaderCheck(this IApplicationBuilder app) => app.Use(async (ctx, next) =>
{
    var unsafeMethod = !(HttpMethods.IsGet(ctx.Request.Method) || HttpMethods.IsHead(ctx.Request.Method) || HttpMethods.IsOptions(ctx.Request.Method));
    if (unsafeMethod && ctx.Request.Path.StartsWithSegments("/api") && !ctx.Request.Headers.ContainsKey(CsrfHeader)
        && !ctx.Request.Headers.Authorization.ToString().StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
    {
        ctx.Response.StatusCode = StatusCodes.Status400BadRequest;
        await ctx.Response.WriteAsJsonAsync(new { title = $"Missing {CsrfHeader} header." });
        return;
    }
    await next();
});`},"csrf/header":{file:"web/src/api.ts",start:10,end:11,code:`// X-Finance: with sign-in through ClinicHub the session is a cookie, so the API wants proof the call comes from this app.
headers: { 'X-Finance': '1', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },`},"csrf/test":{file:"tests/FinancePowerApp.Tests/SignInTests.cs",start:44,end:47,code:`// The documents endpoint is open to the sign-in (it checks the sender itself), so here the header check is what answers.
var res = await client.PostAsJsonAsync("/api/integration/documents", Array.Empty<object>());
Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
Assert.Contains("X-Finance", await res.Content.ReadAsStringAsync());`},"csrf/cookie":{file:"src/FinancePowerApp.Api/Auth/ClinicHubSignIn.cs",start:30,end:39,code:`o.Cookie.Name = "finance.auth";
o.Cookie.HttpOnly = true;
// Lax: the browser arrives from ClinicHub's sign-in. Unsafe API calls must also carry X-Finance.
o.Cookie.SameSite = SameSiteMode.Lax;
o.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
o.ExpireTimeSpan = TimeSpan.FromHours(12);
o.SlidingExpiration = true;
o.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = 401; return Task.CompletedTask; };
o.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = 403; return Task.CompletedTask; };
o.Events.OnValidatePrincipal = ValidateAsync;`},"senders/sources":{file:"src/FinancePowerApp.Api/Auth/AuthSetup.cs",start:44,end:44,code:'public static readonly string[] Sources = ["clinichub", "labflow", "clinicreport", "pharmaflow"];'},"senders/source":{file:"src/FinancePowerApp.Api/Auth/AuthSetup.cs",start:86,end:104,code:`var hub = http.RequestServices.GetRequiredService<IOptions<ClinicHubOptions>>().Value;
if (!string.IsNullOrWhiteSpace(hub.Authority) && http.Request.Headers.Authorization.ToString().StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
{
    var result = await http.AuthenticateAsync(ServiceScheme);
    if (!result.Succeeded)
        return null;
    var p = result.Principal!;
    var scopes = (p.FindFirstValue("scope") ?? "").Split(' ');
    if (!scopes.Contains(FinanceScope))
        return null;
    var client = p.FindFirstValue("client_id") ?? p.FindFirstValue("azp") ?? (p.FindFirstValue("sub") == "clinichub" ? "clinichub" : null);
    return client is not null && Sources.Contains(client) ? client : null;
}
var env = http.RequestServices.GetRequiredService<IHostEnvironment>();
if (!env.IsDevelopment() && env.EnvironmentName != "Testing")
    return null;
var keys = http.RequestServices.GetRequiredService<IConfiguration>().GetSection("Integration:DevKeys").Get<Dictionary<string, string>>() ?? [];
var key = http.Request.Headers["X-Finance-Key"].ToString();
return key.Length > 0 ? keys.FirstOrDefault(k => k.Value == key && Sources.Contains(k.Key)).Key : null;`},"senders/unknown":{file:"src/FinancePowerApp.Api/Endpoints/IntegrationEndpoints.cs",start:23,end:25,code:`var source = await AuthSetup.DocumentSourceAsync(http);
if (source is null)
    return Results.Problem("Send a ClinicHub token for the audience \\"finance\\" with the scope \\"finance\\".", statusCode: StatusCodes.Status401Unauthorized);`},"businesses/itc":{file:"src/FinancePowerApp.Api/Data/Entities.cs",start:18,end:22,code:`    /// A business making zero-rated or taxable supplies (a pharmacy) claims back the HST it pays; one making only
    /// exempt health care supplies (a clinic, a lab) cannot, and the HST becomes part of the cost.
    /// </summary>
    public bool ClaimsInputTaxCredits => Kind is EntityKinds.Pharmacy or EntityKinds.Holding;
}`},"businesses/resolve":{file:"src/FinancePowerApp.Api/Domain/Ledger.cs",start:413,end:420,code:`public async Task<Entity?> ResolveEntityAsync(string source, string sourceKey)
{
    var map = await db.EntitySources.AsNoTracking().SingleOrDefaultAsync(m => m.Source == source && m.SourceKey == sourceKey);
    if (map is not null)
        return await db.Entities.SingleAsync(e => e.EntityId == map.EntityId);
    // A business can also be named by its own code ("RX").
    return await db.Entities.SingleOrDefaultAsync(e => e.Code == sourceKey && e.IsActive);
}`},"businesses/patient":{file:"src/FinancePowerApp.Api/Domain/Ledger.cs",start:438,end:449,code:`/// <summary>The party a document names, created the first time. Patients are one party: never named.</summary>
public async Task<Party> PartyAsync(DocumentParty p)
{
    var code = p.Type == PartyTypes.Patient ? "PATIENT" : p.Code.Trim().ToUpperInvariant();
    var party = await db.Parties.SingleOrDefaultAsync(x => x.PartyType == p.Type && x.Code == code);
    if (party is not null)
        return party;
    party = new Party
    {
        PartyType = p.Type, Code = code, Name = p.Type == PartyTypes.Patient ? "Patients (private pay)" : Short(p.Name, 150) ?? code,
        PaymentTermsDays = p.Type is PartyTypes.Patient ? 0 : 30,
    };`},"accounts/coa":{file:"database/020_seed_reference.sql",start:29,end:33,code:`('1100', N'Accounts receivable – OHIP',          'Asset', 'Receivable',    1, '1060', N'Claims submitted to the Ministry of Health, waiting for the remittance advice.'),
('1105', N'Accounts receivable – other provinces','Asset','Receivable',    1, '1060', N'Reciprocal medical billing (RMB) for patients covered by another province.'),
('1110', N'Accounts receivable – ODB',           'Asset', 'Receivable',    1, '1060', N'Ontario Drug Benefit claims adjudicated online, paid by the Ministry.'),
('1120', N'Accounts receivable – WSIB',          'Asset', 'Receivable',    1, '1060', N'Workplace Safety and Insurance Board.'),
('1130', N'Accounts receivable – insurers',      'Asset', 'Receivable',    1, '1060', N'Private drug and extended health plans.'),`},"accounts/type":{file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",start:121,end:123,code:`// An account with postings keeps its type: changing it would move history between statements.
if (a.Type != req.Type && await db.JournalLines.AnyAsync(l => l.AccountId == id))
    return Field("type", "This account has postings; its type can't change. Create a new account instead.");`},"accounts/tax":{file:"database/020_seed_reference.sql",start:17,end:21,code:`INSERT tax.TaxCode (Code, Name, RatePercent, Recoverable, Description) VALUES
('HST13',  N'HST 13 % (Ontario)', 13.00, 1, N'Taxable supplies in Ontario: over-the-counter products, most third-party forms and reports, cosmetic services.'),
('ZERO',   N'Zero-rated',          0.00, 1, N'Prescription drugs and their dispensing fees, many medical devices. No tax charged; input tax credits can be claimed.'),
('EXEMPT', N'Exempt',              0.00, 0, N'Health care services by physicians, nurses and other practitioners, and lab and diagnostic services. No tax charged; no input tax credits.'),
('NONE',   N'Outside HST',         0.00, 0, N'Not a supply: transfers, wages, OHIP payments for exempt services already coded EXEMPT.');`},"journal/lines":{file:"src/FinancePowerApp.Api/Domain/Ledger.cs",start:267,end:283,code:`private async Task CheckLinesAsync(IReadOnlyList<ManualLine> lines)
{
    if (lines.Count < 2)
        throw new LedgerException("An entry needs at least two lines.");
    if (lines.Any(l => l.Debit < 0 || l.Credit < 0 || (l.Debit > 0 && l.Credit > 0) || l.Debit + l.Credit == 0
            || decimal.Round(l.Debit, 2) != l.Debit || decimal.Round(l.Credit, 2) != l.Credit))
        throw new LedgerException("Each line is either a debit or a credit, in dollars and cents.");
    if (lines.Sum(l => l.Debit) != lines.Sum(l => l.Credit))
        throw new LedgerException($"Debits ({lines.Sum(l => l.Debit):N2}) and credits ({lines.Sum(l => l.Credit):N2}) must be equal.");
    var ids = lines.Select(l => l.AccountId).Distinct().ToList();
    var accounts = await db.Accounts.Where(a => ids.Contains(a.AccountId)).ToListAsync();
    if (accounts.Count != ids.Count || accounts.Any(a => !a.IsActive || !a.IsPostable))
        throw new LedgerException("Every line needs an active account that takes postings.");
    var parties = lines.Where(l => l.PartyId is not null).Select(l => l.PartyId!.Value).Distinct().ToList();
    if (parties.Count > 0 && await db.Parties.CountAsync(p => parties.Contains(p.PartyId)) != parties.Count)
        throw new LedgerException("Unknown party.");
}`},"journal/draft":{file:"src/FinancePowerApp.Api/Domain/Ledger.cs",start:234,end:241,code:`public async Task DeleteDraftAsync(long id)
{
    var entry = await db.JournalEntries.SingleOrDefaultAsync(e => e.JournalEntryId == id) ?? throw new LedgerException("No such entry.");
    if (entry.Status != JournalStatus.Draft)
        throw new LedgerException("A posted entry is never deleted: reverse it.");
    db.JournalEntries.Remove(entry);
    await db.SaveChangesAsync();
}`},"journal/reverse":{file:"src/FinancePowerApp.Api/Domain/Ledger.cs",start:243,end:265,code:`/// <summary>A posted entry is corrected by its mirror image, dated in an open month; both stay in the ledger.</summary>
public async Task<JournalEntry> ReverseEntryAsync(long id, DateOnly date, string user, string? memo)
{
    var original = await db.JournalEntries.Include(e => e.Lines).Include(e => e.Entity).SingleOrDefaultAsync(e => e.JournalEntryId == id)
        ?? throw new LedgerException("No such entry.");
    if (original.Status != JournalStatus.Posted)
        throw new LedgerException(original.Status == JournalStatus.Reversed ? "Already reversed." : "Only a posted entry can be reversed.");
    var (period, late) = await PeriodForAsync(date);
    var reversal = await NewEntryAsync(original.Entity, period, late ? period.Start : date, original.Source, memo ?? $"Reverses {original.Number}", user);
    reversal.ReversalOfId = original.JournalEntryId;
    reversal.LatePosting = late;
    foreach (var l in original.Lines.OrderBy(l => l.LineNumber))
        reversal.Lines.Add(new JournalLine
        {
            LineNumber = l.LineNumber, AccountId = l.AccountId, Debit = l.Credit, Credit = l.Debit, PartyId = l.PartyId,
            Department = l.Department, ProviderCode = l.ProviderCode, TaxCode = l.TaxCode, Memo = l.Memo,
        });
    Post(reversal, user);
    original.Status = JournalStatus.Reversed;
    db.JournalEntries.Add(reversal);
    await db.SaveChangesAsync();
    return reversal;
}`},"periods/close":{file:"src/FinancePowerApp.Api/Domain/Ledger.cs",start:358,end:372,code:`public async Task ClosePeriodAsync(int periodId)
{
    var period = await db.Periods.SingleOrDefaultAsync(p => p.PeriodId == periodId) ?? throw new LedgerException("No such month.");
    if (period.IsClosed)
        throw new LedgerException($"{period.Label} is already closed.");
    var drafts = await db.JournalEntries.CountAsync(e => e.PeriodId == periodId && e.Status == JournalStatus.Draft);
    if (drafts > 0)
        throw new LedgerException($"{period.Label} has {drafts} draft {(drafts == 1 ? "entry" : "entries")}: post or delete them first.");
    var waiting = await db.Documents.CountAsync(d => d.Status == DocumentStatus.NeedsMapping && d.DocumentDate >= period.Start && d.DocumentDate <= period.End);
    if (waiting > 0)
        throw new LedgerException($"{waiting} {(waiting == 1 ? "document dated in this month waits" : "documents dated in this month wait")} for an account mapping.");
    period.IsClosed = true;
    period.ClosedDate = Now;
    await db.SaveChangesAsync();
}`},"periods/late":{file:"src/FinancePowerApp.Api/Domain/Ledger.cs",start:394,end:409,code:`/// <summary>The date's month, or, when it is closed, the first open month after it (a late posting).</summary>
public async Task<(Period Period, bool Late)> PeriodForAsync(DateOnly date)
{
    var p = await PeriodOfAsync(date);
    if (!p.IsClosed)
        return (p, false);
    var next = date;
    for (var i = 0; i < 36; i++)
    {
        next = new DateOnly(next.Year, next.Month, 1).AddMonths(1);
        var candidate = await PeriodOfAsync(next);
        if (!candidate.IsClosed)
            return (candidate, true);
    }
    throw new LedgerException("No open month in the next three years.");
}`},"periods/memo":{file:"src/FinancePowerApp.Api/Domain/Ledger.cs",start:468,end:469,code:`private static string? Memo(FinancialDocument d, bool late) =>
    late ? $"{d.Memo ?? d.Reference} (dated {d.Date:yyyy-MM-dd}, a closed month)" : d.Memo ?? $"{d.Kind} {d.Reference}";`},"periods/test":{file:"tests/FinancePowerApp.Tests/LedgerApiTests.cs",start:81,end:88,code:`public async Task A_document_for_a_closed_month_lands_in_the_next_open_one()
{
    await factory.Exec("UPDATE dbo.AccountingPeriods SET IsClosed = 1, ClosedDate = SYSUTCDATETIME() WHERE [Year] = 2025 AND [Month] = 3");
    var doc = await Send(factory.App(), Claim("late", "AB12-LATE", 20m, date: "2025-03-15"));
    var entry = await Json(await factory.App().GetAsync($"/api/journal/{doc["journalEntryId"]}"));
    Assert.Equal("2025-04", (string)entry["entry"]!["period"]!);
    Assert.True(entry["entry"]!["latePosting"]!.GetValue<bool>());
}`},"documents/contract":{file:"src/FinancePowerApp.Api/Domain/FinancialDocument.cs",start:6,end:8,code:`/// What an application sends when money changes hands, in its own words. It never names accounts: it says what
/// kind of document it is, who the other party is, and what each line is (a category such as "OHIP.Professional").
/// The ledger's maps decide the accounts. No health information: no patient names, diagnoses or service codes.`},"documents/record":{file:"src/FinancePowerApp.Api/Domain/FinancialDocument.cs",start:14,end:16,code:`public record FinancialDocument(
    string SourceKey, string ExternalId, string Kind, DateOnly Date, string Reference, DocumentParty? Party,
    DocumentLine[] Lines, string? Method = null, DateOnly? DueDate = null, string? Memo = null, string? Reverses = null);`},"documents/once":{file:"src/FinancePowerApp.Api/Domain/Ledger.cs",start:22,end:24,code:`var existing = await db.Documents.SingleOrDefaultAsync(x => x.Source == source && x.ExternalId == d.ExternalId);
if (existing is not null)
    return (existing, true);`},"documents/race":{file:"src/FinancePowerApp.Api/Domain/Ledger.cs",start:38,end:45,code:`catch (DbUpdateException)
{
    // Sent twice at the same moment: the other request stored it.
    db.ChangeTracker.Clear();
    var stored = await db.Documents.SingleOrDefaultAsync(x => x.Source == source && x.ExternalId == d.ExternalId);
    if (stored is null) throw;
    return (stored, true);
}`},"documents/limit":{file:"src/FinancePowerApp.Api/Endpoints/IntegrationEndpoints.cs",start:26,end:27,code:`if (documents.Length is 0 or > 200)
    return LedgerEndpoints.Field("documents", "Send 1 to 200 documents at a time.");`},"posting/pure":{file:"src/FinancePowerApp.Api/Domain/PostingEngine.cs",start:30,end:31,code:`/// Double entry for each kind of document. Pure: given the document, the business and the maps, it returns the
/// journal lines and what happens to receivables and payables, or which words have no account yet.`},"posting/invoice":{file:"src/FinancePowerApp.Api/Domain/PostingEngine.cs",start:66,end:80,code:`case DocumentKinds.Invoice:
{
    var control = Control(Receivable);
    decimal total = 0;
    foreach (var l in d.Lines)
    {
        var tax = Tax(l, maps);
        if (Category(l.Category) is { } acc) lines.Add(new(acc, 0, l.Amount, l.Department, l.ProviderCode, l.TaxCode, l.Memo));
        if (tax > 0) lines.Add(new(maps.TaxPayableAccountId, 0, tax, l.Department, null, l.TaxCode, "HST collected"));
        total += l.Amount + tax;
    }
    if (control is { } c) lines.Insert(0, new(c, total, 0, Memo: d.Memo, WithParty: true));
    effects.Add(new(d.Reference, Raised: total));
    break;
}`},"posting/bill":{file:"src/FinancePowerApp.Api/Domain/PostingEngine.cs",start:107,end:123,code:`case DocumentKinds.Bill:
{
    var control = Control(Payable);
    decimal total = 0;
    foreach (var l in d.Lines)
    {
        var tax = Tax(l, maps);
        var recoverable = tax > 0 && entity.ClaimsInputTaxCredits && maps.TaxCodes.TryGetValue(l.TaxCode ?? "", out var code) && code.Recoverable;
        // A business that makes only exempt supplies can't recover the HST it pays: it is part of the cost.
        if (Category(l.Category) is { } acc) lines.Add(new(acc, recoverable ? l.Amount : l.Amount + tax, 0, l.Department, l.ProviderCode, l.TaxCode, l.Memo));
        if (recoverable) lines.Add(new(maps.TaxRecoverableAccountId, tax, 0, l.Department, null, l.TaxCode, "HST input tax credit"));
        total += l.Amount + tax;
    }
    if (control is { } c) lines.Add(new(c, 0, total, Memo: d.Memo, WithParty: true));
    effects.Add(new(d.Reference, Raised: total));
    break;
}`},"posting/override":{file:"src/FinancePowerApp.Api/Domain/Ledger.cs",start:428,end:429,code:`// A business's own mapping wins over the default.
Categories = categories.OrderBy(m => m.EntityId is null ? 0 : 1).GroupBy(m => m.Category).ToDictionary(g => g.Key, g => g.Last().AccountId),`},"waiting/wait":{file:"src/FinancePowerApp.Api/Domain/Ledger.cs",start:71,end:78,code:`var plan = PostingEngine.Plan(d, entity, maps);
if (!plan.Complete)
{
    await Wait(doc, string.Join("; ", plan.Missing));
    return;
}
if (plan.Debits != plan.Credits)
    throw new LedgerException($"Document {doc.DocumentId} does not balance ({plan.Debits} ≠ {plan.Credits}).");`},"waiting/map":{file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",start:199,end:210,code:`// Mapping a category (for every business, or one) posts the documents that were waiting for it.
admin.MapPut("/maps/category", async (SaveMap req, FinanceDbContext db, Ledger ledger) =>
{
    var category = req.Category?.Trim() ?? "";
    if (category.Length is 0 or > 60) return Field("category", "A category, at most 60 characters.");
    if (!await db.Accounts.AnyAsync(a => a.AccountId == req.AccountId && a.IsPostable && a.IsActive)) return Field("accountId", "Choose an account that takes postings.");
    var map = await db.CategoryMaps.SingleOrDefaultAsync(m => m.Category == category && m.EntityId == req.EntityId);
    if (map is null) db.CategoryMaps.Add(new CategoryMap { Category = category, EntityId = req.EntityId, AccountId = req.AccountId, Description = Clean(req.Description) });
    else (map.AccountId, map.Description) = (req.AccountId, Clean(req.Description) ?? map.Description);
    await db.SaveChangesAsync();
    return Results.Ok(new { reposted = await Repost(db, ledger) });
});`},"waiting/test":{file:"tests/FinancePowerApp.Tests/LedgerApiTests.cs",start:62,end:78,code:`public async Task An_unmapped_category_waits_and_mapping_it_posts_the_document()
{
    var app = factory.App();
    var doc = await Send(app, new
    {
        sourceKey = "harbourview", externalId = "invoice:new-kind", kind = "Invoice", date = "2026-10-06", reference = "INV-77",
        party = new { type = "Patient", code = "PATIENT" },
        lines = new[] { new { category = "Uninsured.TravelMedicine", amount = 80m, taxCode = "EXEMPT" } },
    });
    Assert.Equal("NeedsMapping", (string)doc["status"]!);
    Assert.Contains("Uninsured.TravelMedicine", (string)doc["error"]!);

    var account = await factory.Scalar<int>("SELECT AccountId FROM gl.Account WHERE Number = '4100'");
    var mapped = await Json(await app.PutAsJsonAsync("/api/maps/category", new { category = "Uninsured.TravelMedicine", accountId = account }));
    Assert.True(mapped["reposted"]!.GetValue<int>() >= 1);
    Assert.Equal("Posted", await factory.Scalar<string>("SELECT Status FROM integ.Document WHERE ExternalId = 'invoice:new-kind'"));
}`},"waiting/undo":{file:"src/FinancePowerApp.Api/Domain/Ledger.cs",start:171,end:176,code:`var undo = PostingEngine.Plan(od, entity, maps).Effects
    .Select(e => new ItemEffect(e.Reference, Raised: 0, Paid: -e.Paid, Adjusted: e.Raised > 0 ? e.Raised : -e.Adjusted)).ToList();
// An invoice or bill taken back: its whole amount is adjusted away (payables have no adjustment column, so it is "paid").
if (od.Kind is DocumentKinds.Bill)
    undo = undo.Select(u => u with { Paid = u.Adjusted, Adjusted = 0 }).ToList();
await ApplyEffectsAsync(od.Kind, entity, party, original, od, undo);`},"waiting/repost":{file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",start:222,end:228,code:`public static async Task<int> Repost(FinanceDbContext db, Ledger ledger)
{
    var waiting = await db.Documents.Where(d => d.Status == DocumentStatus.NeedsMapping).OrderBy(d => d.DocumentId).ToListAsync();
    foreach (var d in waiting)
        await ledger.PostDocumentAsync(d);
    return waiting.Count(d => d.Status == DocumentStatus.Posted);
}`},"openitems/effects":{file:"src/FinancePowerApp.Api/Domain/Ledger.cs",start:132,end:147,code:`var item = await db.Receivables.SingleOrDefaultAsync(i => i.EntityId == entity.EntityId && i.Source == doc.Source && i.Reference == e.Reference);
if (e.Raised > 0)
{
    if (item is null)
        db.Receivables.Add(new ArItem
        {
            EntityId = entity.EntityId, PartyId = party.PartyId, Source = doc.Source, Reference = e.Reference, DocumentId = doc.DocumentId,
            ItemDate = d.Date, DueDate = d.DueDate ?? d.Date.AddDays(party.PaymentTermsDays), Amount = e.Raised,
        });
    else item.Amount += e.Raised;
}
if (item is not null)
{
    item.Paid += e.Paid;
    item.Adjusted += e.Adjusted;
}`},"openitems/receipt":{file:"src/FinancePowerApp.Api/Domain/PostingEngine.cs",start:81,end:106,code:`case DocumentKinds.Receipt:
case DocumentKinds.Adjustment:
{
    var control = Control(Receivable);
    int? cash = d.Kind == DocumentKinds.Receipt && d.Lines.Any(DocumentValidation.IsCash) ? Cash() : null;
    foreach (var group in d.Lines.GroupBy(l => l.AppliesTo ?? d.Reference))
    {
        decimal paid = 0, adjusted = 0;
        foreach (var l in group)
        {
            if (d.Kind == DocumentKinds.Receipt && DocumentValidation.IsCash(l))
            {
                if (cash is { } k) lines.Add(new(k, l.Amount, 0, l.Department, l.ProviderCode, Memo: l.Memo));
                paid += l.Amount;
            }
            else
            {
                if (Category(l.Category) is { } acc) lines.Add(new(acc, l.Amount, 0, l.Department, l.ProviderCode, Memo: l.Memo ?? l.Category));
                adjusted += l.Amount;
            }
        }
        if (control is { } c) lines.Add(new(c, 0, paid + adjusted, Memo: group.Key, WithParty: true));
        effects.Add(new(group.Key, Paid: paid, Adjusted: adjusted));
    }
    break;
}`},"openitems/bucket":{file:"src/FinancePowerApp.Api/Domain/Reports.cs",start:103,end:103,code:'static string Bucket(int days) => days <= 0 ? "Current" : days <= 30 ? "1-30" : days <= 60 ? "31-60" : days <= 90 ? "61-90" : "90+";'},"hst/tax":{file:"src/FinancePowerApp.Api/Domain/PostingEngine.cs",start:156,end:159,code:`/// <summary>The tax on a line: as the application sent it, or the code's rate on the amount, rounded to the cent.</summary>
public static decimal Tax(DocumentLine l, PostingMaps maps) =>
    l.Tax ?? (l.TaxCode is not null && maps.TaxCodes.TryGetValue(l.TaxCode, out var code)
        ? decimal.Round(l.Amount * code.RatePercent / 100m, 2, MidpointRounding.AwayFromZero) : 0m);`},"hst/view":{file:"database/030_reports.sql",start:28,end:38,code:`-- The GST/HST return (GST34) per business and month: line 103 tax collected, 106 input tax credits, 109 net tax.
CREATE VIEW tax.vw_HstReturn AS
SELECT
    EntityId, EntityCode, PeriodId, PeriodLabel,
    SUM(CASE WHEN AccountType = 'Revenue' THEN Credit - Debit ELSE 0 END) AS Line101Sales,
    SUM(CASE WHEN AccountSubtype = 'TaxPayable' THEN Credit - Debit ELSE 0 END) AS Line103TaxCollected,
    SUM(CASE WHEN AccountSubtype = 'TaxRecoverable' THEN Debit - Credit ELSE 0 END) AS Line106InputTaxCredits,
    SUM(CASE WHEN AccountSubtype = 'TaxPayable' THEN Credit - Debit ELSE 0 END)
      - SUM(CASE WHEN AccountSubtype = 'TaxRecoverable' THEN Debit - Credit ELSE 0 END) AS Line109NetTax
FROM gl.vw_LedgerLines
GROUP BY EntityId, EntityCode, PeriodId, PeriodLabel;`},"hst/itc":{file:"tests/FinancePowerApp.Tests/LedgerApiTests.cs",start:102,end:116,code:`public async Task A_pharmacy_purchase_claims_hst_back_and_shows_on_the_hst_return()
{
    var pharmacy = factory.App(ApiFactory.PharmaKey);
    var doc = await Send(pharmacy, new
    {
        sourceKey = "pharmacy", externalId = "po:55", kind = "Bill", date = "2026-10-08", reference = "PO-55",
        party = new { type = "Supplier", code = "WHOLESALER", name = "Drug wholesaler" },
        lines = new[] { new { category = "Inventory.Drugs", amount = 1000m, taxCode = "ZERO" }, new { category = "Medical Supplies", amount = 200m, taxCode = "HST13" } },
    });
    Assert.Equal("Posted", (string)doc["status"]!);
    var rx = await factory.Scalar<int>("SELECT EntityId FROM org.Entity WHERE Code = 'RX'");
    var hst = (await Json(await factory.App().GetAsync($"/api/reports/hst?entityId={rx}&from=2026-10-01&to=2026-10-31"))).AsArray();
    Assert.Equal(26m, hst.Single()!["inputTaxCredits"]!.GetValue<decimal>());
    Assert.Equal(1226m, await factory.Scalar<decimal>("SELECT Balance FROM ap.Item WHERE Reference = 'PO-55'"));
}`},"statements/bs":{file:"src/FinancePowerApp.Api/Domain/Reports.cs",start:63,end:80,code:`/// <summary>Calendar fiscal years: this year's revenue less expenses shows as current earnings in equity.</summary>
public async Task<BalanceSheet> BalanceSheetAsync(int? entityId, DateOnly asOf)
{
    var rows = await Balances(Between(entityId, null, asOf));
    var yearStart = new DateOnly(asOf.Year, 1, 1);
    var year = await Balances(Between(entityId, yearStart, asOf));
    var prior = await Balances(Between(entityId, null, yearStart.AddDays(-1)));
    decimal Earnings(AccountBalance[] r) => r.Where(x => x.Type == AccountTypes.Revenue).Sum(x => x.Balance) - r.Where(x => x.Type == AccountTypes.Expense).Sum(x => x.Balance);
    var current = Earnings(year);
    var retainedPrior = Earnings(prior);
    var assets = Of("Assets", rows.Where(r => r.Type == AccountTypes.Asset));
    var liabilities = Of("Liabilities", rows.Where(r => r.Type == AccountTypes.Liability));
    var equityAccounts = rows.Where(r => r.Type == AccountTypes.Equity).ToList();
    if (retainedPrior != 0)
        equityAccounts.Add(new AccountBalance(0, "", "Earnings of prior years (not yet closed)", AccountTypes.Equity, "RetainedEarnings", 0, 0, retainedPrior));
    var equity = Of("Equity", equityAccounts);
    return new BalanceSheet(asOf, assets, liabilities, equity, current, liabilities.Total + equity.Total + current);
}`},"statements/csv":{file:"src/FinancePowerApp.Api/Endpoints/ReportEndpoints.cs",start:55,end:66,code:`private static IResult Csv(string name, string[] header, IEnumerable<object[]> rows)
{
    static string Cell(object v) => v switch
    {
        decimal d => d.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture),
        DateOnly d => d.ToString("yyyy-MM-dd"),
        _ => $"\\"{v?.ToString()?.Replace("\\"", "\\"\\"")}\\"",
    };
    var sb = new StringBuilder().AppendLine(string.Join(',', header.Select(h => $"\\"{h}\\"")));
    foreach (var r in rows) sb.AppendLine(string.Join(',', r.Select(Cell)));
    return Results.File(Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray(), "text/csv", name);
}`},"analytics/deny":{file:"database/tools/analytics_reader.sql",start:27,end:36,code:`-- Columns that can hold personal details or free text: the login cannot read them, so a mistake in
-- Analytics cannot load them. (Column DENY wins over the schema GRANT.)
DENY SELECT ON org.Party (Email, Phone)                      TO analytics_reader;
DENY SELECT ON gl.JournalEntry (Memo, CreatedBy, PostedBy)   TO analytics_reader;
DENY SELECT ON gl.JournalLine (Memo)                         TO analytics_reader;
DENY SELECT ON gl.Account (Description)                      TO analytics_reader;
DENY SELECT ON gl.CategoryMap (Description)                  TO analytics_reader;
DENY SELECT ON tax.TaxCode (Description)                     TO analytics_reader;
DENY SELECT ON ar.Item (Reference)                           TO analytics_reader;
DENY SELECT ON ap.Item (Reference)                           TO analytics_reader;`},"analytics/chain":{file:"database/tools/analytics_reader.sql",start:39,end:48,code:`-- Views and functions owned by dbo read their tables through ownership chaining, so the column DENYs above do not
-- apply through them (gl.vw_LedgerLines shows the entry memo, ar.vw_Aging the reference). Every view and function in
-- the granted schemas is therefore denied, except the views below that carry no text (two aggregates and the payment dates, from database/060_item_payments.sql). Run this script again after
-- adding a view: a new one is readable until then.
DECLARE @sql nvarchar(max) = N'';
SELECT @sql += N'DENY SELECT ON ' + QUOTENAME(s.name) + N'.' + QUOTENAME(o.name) + N' TO analytics_reader;' + CHAR(10)
FROM sys.objects o JOIN sys.schemas s ON s.schema_id = o.schema_id
WHERE s.name IN (N'org', N'gl', N'ar', N'ap', N'tax') AND o.type IN ('V', 'IF', 'TF')
  AND s.name + N'.' + o.name NOT IN (N'gl.vw_PeriodMovement', N'tax.vw_HstReturn', N'ar.vw_ItemPayments');
EXEC sp_executesql @sql;`},"analytics/payments":{file:"database/060_item_payments.sql",start:5,end:11,code:`CREATE OR ALTER VIEW ar.vw_ItemPayments AS
SELECT i.ItemId, i.EntityId, d.DocumentDate AS PaymentDate, SUM(l.Amount) AS Amount
FROM integ.Document d
CROSS APPLY OPENJSON(d.PayloadJson, '$.lines') WITH (Amount decimal(14, 2) '$.amount', AppliesTo nvarchar(60) '$.appliesTo') l
JOIN ar.Item i ON i.EntityId = d.EntityId AND i.Reference = COALESCE(l.AppliesTo, d.Reference)
WHERE d.Kind = 'Receipt' AND d.Status = 'Posted'
GROUP BY i.ItemId, i.EntityId, d.DocumentId, d.DocumentDate;`},"web/picker":{file:"web/src/App.tsx",start:62,end:67,code:`<label className="entity-pick">Books of
  <select value={entityId ?? ''} onChange={e => setEntityId(e.target.value ? Number(e.target.value) : undefined)}>
    <option value="">All businesses (combined)</option>
    {entities.filter(e => e.isActive).map(e => <option key={e.entityId} value={e.entityId}>{e.code} · {e.name}</option>)}
  </select>
</label>`},"web/gate":{file:"web/src/App.tsx",start:53,end:54,code:`if (!me.name) return <SignIn />
if (me.permissions.length === 0) return <p className="page error">{me.name}: your role does not allow FinancePowerApp. <a href="/api/auth/sso/signout">Sign out</a></p>`},"web/can":{file:"web/src/App.tsx",start:55,end:55,code:"const can = (p: string) => me.permissions.includes(p) || me.permissions.includes('admin')"},"web/request":{file:"web/src/api.ts",start:7,end:19,code:`async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method, credentials: 'same-origin',
    // X-Finance: with sign-in through ClinicHub the session is a cookie, so the API wants proof the call comes from this app.
    headers: { 'X-Finance': '1', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return undefined as T
  const text = await res.text()
  const data = text ? JSON.parse(text) : undefined
  if (!res.ok) throw new ApiError(res.status, data?.detail ?? data?.title ?? \`Request failed (\${res.status})\`, data?.errors ?? {})
  return data as T
}`}},s=[{area:"Integration",method:"POST",path:"/api/integration/documents",access:"public",file:"src/FinancePowerApp.Api/Endpoints/IntegrationEndpoints.cs",line:21},{area:"Integration",method:"GET",path:"/api/documents",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/IntegrationEndpoints.cs",line:45},{area:"Integration",method:"GET",path:"/api/documents/{id:long}",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/IntegrationEndpoints.cs",line:56},{area:"Integration",method:"POST",path:"/api/documents/repost",access:"ledger.post",file:"src/FinancePowerApp.Api/Endpoints/IntegrationEndpoints.cs",line:58},{area:"Expenses",method:"POST",path:"/api/expenses/post-approved",access:"ledger.post",file:"src/FinancePowerApp.Api/Endpoints/IntegrationEndpoints.cs",line:62},{area:"Expenses",method:"GET",path:"/api/expenses",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/IntegrationEndpoints.cs",line:67},{area:"Ledger",method:"GET",path:"/api/me",access:"public",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:34},{area:"Ledger",method:"GET",path:"/api/entities",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:39},{area:"Ledger",method:"POST",path:"/api/entities",access:"admin",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:46},{area:"Ledger",method:"PUT",path:"/api/entities/{id:int}",access:"admin",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:56},{area:"Ledger",method:"PUT",path:"/api/entity-sources",access:"admin",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:67},{area:"Ledger",method:"GET",path:"/api/parties",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:80},{area:"Ledger",method:"POST",path:"/api/parties",access:"admin",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:82},{area:"Ledger",method:"PUT",path:"/api/parties/{id:int}",access:"admin",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:92},{area:"Ledger",method:"GET",path:"/api/accounts",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:103},{area:"Ledger",method:"GET",path:"/api/tax-codes",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:104},{area:"Ledger",method:"POST",path:"/api/accounts",access:"admin",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:105},{area:"Ledger",method:"PUT",path:"/api/accounts/{id:int}",access:"admin",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:115},{area:"Ledger",method:"GET",path:"/api/periods",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:130},{area:"Ledger",method:"POST",path:"/api/periods/{id:int}/close",access:"admin",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:136},{area:"Ledger",method:"POST",path:"/api/periods/{id:int}/reopen",access:"admin",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:137},{area:"Ledger",method:"POST",path:"/api/periods/year/{year:int}",access:"admin",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:138},{area:"Ledger",method:"GET",path:"/api/journal",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:146},{area:"Ledger",method:"GET",path:"/api/journal/{id:long}",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:161},{area:"Ledger",method:"POST",path:"/api/journal",access:"ledger.post",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:174},{area:"Ledger",method:"POST",path:"/api/journal/{id:long}/post",access:"ledger.post",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:179},{area:"Ledger",method:"DELETE",path:"/api/journal/{id:long}",access:"ledger.post",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:180},{area:"Ledger",method:"POST",path:"/api/journal/{id:long}/reverse",access:"ledger.post",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:181},{area:"Ledger",method:"GET",path:"/api/maps",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:188},{area:"Ledger",method:"PUT",path:"/api/maps/category",access:"admin",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:200},{area:"Ledger",method:"DELETE",path:"/api/maps/category/{id:int}",access:"admin",file:"src/FinancePowerApp.Api/Endpoints/LedgerEndpoints.cs",line:211},{area:"Reports",method:"GET",path:"/api/reports/dashboard",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/ReportEndpoints.cs",line:15},{area:"Reports",method:"GET",path:"/api/reports/trial-balance",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/ReportEndpoints.cs",line:17},{area:"Reports",method:"GET",path:"/api/reports/income-statement",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/ReportEndpoints.cs",line:24},{area:"Reports",method:"GET",path:"/api/reports/balance-sheet",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/ReportEndpoints.cs",line:35},{area:"Reports",method:"GET",path:"/api/reports/hst",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/ReportEndpoints.cs",line:36},{area:"Reports",method:"GET",path:"/api/reports/aging",access:"ledger.view",file:"src/FinancePowerApp.Api/Endpoints/ReportEndpoints.cs",line:45},{area:"Program",method:"GET",path:"/healthz",access:"public",file:"src/FinancePowerApp.Api/Program.cs",line:43},{area:"Program",method:"GET",path:"/api/auth/settings",access:"public",file:"src/FinancePowerApp.Api/Program.cs",line:45},{area:"Program",method:"GET",path:"/api/auth/sso/start",access:"public",file:"src/FinancePowerApp.Api/Program.cs",line:48},{area:"Program",method:"GET",path:"/api/auth/sso/signout",access:"public",file:"src/FinancePowerApp.Api/Program.cs",line:52}],i=[{database:"FinancePowerApp",table:"AccountingPeriods",file:"database/005_powerapp_baseline.sql",line:7,columns:[{name:"PeriodId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Year",type:"INT",nullable:!1,notes:[]},{name:"Month",type:"INT",nullable:!1,notes:[]},{name:"IsClosed",type:"BIT",nullable:!1,notes:["default (0)"]},{name:"ClosedDate",type:"DATETIME",nullable:!0,notes:[]}],denies:[],uniques:["(Year, Month)"]},{database:"FinancePowerApp",table:"ExpenseCategories",file:"database/005_powerapp_baseline.sql",line:17,columns:[{name:"CategoryId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"CategoryName",type:"NVARCHAR(50)",nullable:!0,notes:[]},{name:"TaxDeductible",type:"BIT",nullable:!0,notes:[]}],denies:[]},{database:"FinancePowerApp",table:"Expenses",file:"database/005_powerapp_baseline.sql",line:25,columns:[{name:"ExpenseId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Amount",type:"DECIMAL(12,2)",nullable:!1,notes:[]},{name:"Category",type:"VARCHAR(50)",nullable:!0,notes:[]},{name:"ExpenseDate",type:"DATE",nullable:!0,notes:[]},{name:"Vendor",type:"VARCHAR(100)",nullable:!0,notes:[]},{name:"Description",type:"VARCHAR(255)",nullable:!0,notes:[]},{name:"Status",type:"VARCHAR(20)",nullable:!0,notes:[]},{name:"CreatedAt",type:"DATETIME",nullable:!0,notes:["default getdate()"]},{name:"PeriodId",type:"INT",nullable:!0,notes:["→ AccountingPeriods"]},{name:"ApprovedBy",type:"NVARCHAR(100)",nullable:!0,notes:[]},{name:"ApprovedDate",type:"DATETIME",nullable:!0,notes:[]},{name:"CategoryId",type:"INT",nullable:!0,notes:["→ ExpenseCategories"]},{name:"TaxAmount",type:"DECIMAL(12,2)",nullable:!0,notes:[]}],denies:[]},{database:"FinancePowerApp",schema:"org",table:"Entity",file:"database/010_erp_schema.sql",line:26,columns:[{name:"EntityId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Code",type:"VARCHAR(20)",nullable:!1,notes:["unique"]},{name:"Name",type:"NVARCHAR(120)",nullable:!1,notes:[]},{name:"Kind",type:"VARCHAR(20)",nullable:!1,notes:["check Kind IN ('Clinic','Lab','Diagnostics','Pharmacy','Holding')"]},{name:"HstNumber",type:"VARCHAR(15)",nullable:!0,notes:["check HstNumber IS NULL OR HstNumber LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]RT[0-9][0-9][0-9][0-9]'"]},{name:"Province",type:"CHAR(2)",nullable:!1,notes:["default 'ON'"]},{name:"IsDefault",type:"BIT",nullable:!1,notes:["default 0","unique where IsDefault = 1"]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]},{name:"CreatedUtc",type:"DATETIME2(3)",nullable:!1,notes:["default SYSUTCDATETIME()"]}],denies:[]},{database:"FinancePowerApp",schema:"org",table:"EntitySource",file:"database/010_erp_schema.sql",line:41,columns:[{name:"Source",type:"VARCHAR(30)",nullable:!1,notes:["PK"]},{name:"SourceKey",type:"VARCHAR(60)",nullable:!1,notes:["PK"]},{name:"EntityId",type:"INT",nullable:!1,notes:["→ org.Entity"]}],denies:[]},{database:"FinancePowerApp",schema:"org",table:"Party",file:"database/010_erp_schema.sql",line:51,columns:[{name:"PartyId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"PartyType",type:"VARCHAR(20)",nullable:!1,notes:["check PartyType IN ('OHIP','ODB','WSIB','Province','Insurer','Patient','Provider','Supplier','Other')"]},{name:"Code",type:"VARCHAR(40)",nullable:!1,notes:[]},{name:"Name",type:"NVARCHAR(150)",nullable:!1,notes:[]},{name:"Email",type:"NVARCHAR(150)",nullable:!0,notes:[]},{name:"Phone",type:"VARCHAR(25)",nullable:!0,notes:[]},{name:"PaymentTermsDays",type:"INT",nullable:!1,notes:["default 30"]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]}],denies:["SELECT (Email, Phone) to analytics_reader"],uniques:["(PartyType, Code)"]},{database:"FinancePowerApp",schema:"tax",table:"TaxCode",file:"database/010_erp_schema.sql",line:67,columns:[{name:"Code",type:"VARCHAR(10)",nullable:!1,notes:["PK"]},{name:"Name",type:"NVARCHAR(80)",nullable:!1,notes:[]},{name:"RatePercent",type:"DECIMAL(5,2)",nullable:!1,notes:["check RatePercent BETWEEN 0 AND 100"]},{name:"Recoverable",type:"BIT",nullable:!1,notes:["default 1"]},{name:"Description",type:"NVARCHAR(300)",nullable:!0,notes:[]}],denies:["SELECT (Description) to analytics_reader"]},{database:"FinancePowerApp",schema:"gl",table:"Account",file:"database/010_erp_schema.sql",line:77,columns:[{name:"AccountId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Number",type:"VARCHAR(10)",nullable:!1,notes:["unique"]},{name:"Name",type:"NVARCHAR(120)",nullable:!1,notes:[]},{name:"Type",type:"VARCHAR(10)",nullable:!1,notes:["check [Type] IN ('Asset','Liability','Equity','Revenue','Expense')"]},{name:"Subtype",type:"VARCHAR(20)",nullable:!0,notes:["check Subtype IN ('Bank','Cash','Clearing','Receivable','Inventory','TaxRecoverable','Payable','TaxPayable','RetainedEarnings','CostOfSales')"]},{name:"ParentId",type:"INT",nullable:!0,notes:["→ gl.Account"]},{name:"IsPostable",type:"BIT",nullable:!1,notes:["default 1"]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]},{name:"GifiCode",type:"CHAR(4)",nullable:!0,notes:[]},{name:"Description",type:"NVARCHAR(300)",nullable:!0,notes:[]}],denies:["SELECT (Description) to analytics_reader"]},{database:"FinancePowerApp",schema:"gl",table:"JournalEntry",file:"database/010_erp_schema.sql",line:93,columns:[{name:"JournalEntryId",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"EntityId",type:"INT",nullable:!1,notes:["→ org.Entity"]},{name:"Number",type:"VARCHAR(20)",nullable:!1,notes:["unique"]},{name:"EntryDate",type:"DATE",nullable:!1,notes:[]},{name:"PeriodId",type:"INT",nullable:!1,notes:["→ AccountingPeriods"]},{name:"Source",type:"VARCHAR(30)",nullable:!1,notes:[]},{name:"DocumentId",type:"BIGINT",nullable:!0,notes:["→ integ.Document"]},{name:"Memo",type:"NVARCHAR(300)",nullable:!0,notes:[]},{name:"Status",type:"VARCHAR(10)",nullable:!1,notes:["check [Status] IN ('Draft','Posted','Reversed')"]},{name:"ReversalOfId",type:"BIGINT",nullable:!0,notes:["→ gl.JournalEntry","unique where ReversalOfId IS NOT NULL"]},{name:"LatePosting",type:"BIT",nullable:!1,notes:["default 0"]},{name:"CreatedBy",type:"NVARCHAR(100)",nullable:!1,notes:[]},{name:"CreatedUtc",type:"DATETIME2(3)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"PostedBy",type:"NVARCHAR(100)",nullable:!0,notes:[]},{name:"PostedUtc",type:"DATETIME2(3)",nullable:!0,notes:[]}],denies:["SELECT (Memo, CreatedBy, PostedBy) to analytics_reader"],checks:["[Status] = 'Draft' OR (PostedUtc IS NOT NULL AND PostedBy IS NOT NULL)"]},{database:"FinancePowerApp",schema:"gl",table:"JournalLine",file:"database/010_erp_schema.sql",line:117,columns:[{name:"JournalLineId",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"JournalEntryId",type:"BIGINT",nullable:!1,notes:["→ gl.JournalEntry"]},{name:"LineNumber",type:"SMALLINT",nullable:!1,notes:[]},{name:"AccountId",type:"INT",nullable:!1,notes:["→ gl.Account"]},{name:"Debit",type:"DECIMAL(14,2)",nullable:!1,notes:["default 0"]},{name:"Credit",type:"DECIMAL(14,2)",nullable:!1,notes:["default 0"]},{name:"PartyId",type:"INT",nullable:!0,notes:["→ org.Party"]},{name:"Department",type:"VARCHAR(30)",nullable:!0,notes:[]},{name:"ProviderCode",type:"VARCHAR(20)",nullable:!0,notes:[]},{name:"TaxCode",type:"VARCHAR(10)",nullable:!0,notes:["→ tax.TaxCode"]},{name:"Memo",type:"NVARCHAR(200)",nullable:!0,notes:[]}],denies:["SELECT (Memo) to analytics_reader"],checks:["Debit >= 0 AND Credit >= 0 AND (Debit = 0 OR Credit = 0) AND Debit + Credit > 0"],uniques:["(JournalEntryId, LineNumber)"]},{database:"FinancePowerApp",schema:"gl",table:"CategoryMap",file:"database/010_erp_schema.sql",line:138,columns:[{name:"CategoryMapId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"EntityId",type:"INT",nullable:!0,notes:["→ org.Entity"]},{name:"Category",type:"VARCHAR(60)",nullable:!1,notes:["unique where EntityId IS NULL"]},{name:"AccountId",type:"INT",nullable:!1,notes:["→ gl.Account"]},{name:"Description",type:"NVARCHAR(200)",nullable:!0,notes:[]}],denies:["SELECT (Description) to analytics_reader"],uniques:["(Category, EntityId)"]},{database:"FinancePowerApp",schema:"gl",table:"ControlMap",file:"database/010_erp_schema.sql",line:149,columns:[{name:"ControlMapId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"PartyType",type:"VARCHAR(20)",nullable:!1,notes:[]},{name:"Side",type:"VARCHAR(10)",nullable:!1,notes:["check Side IN ('Receivable','Payable')"]},{name:"AccountId",type:"INT",nullable:!1,notes:["→ gl.Account"]}],denies:[],uniques:["(PartyType, Side)"]},{database:"FinancePowerApp",schema:"gl",table:"CashMap",file:"database/010_erp_schema.sql",line:158,columns:[{name:"Method",type:"VARCHAR(20)",nullable:!1,notes:["PK"]},{name:"AccountId",type:"INT",nullable:!1,notes:["→ gl.Account"]}],denies:[]},{database:"FinancePowerApp",schema:"ar",table:"Item",file:"database/010_erp_schema.sql",line:167,columns:[{name:"ItemId",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"EntityId",type:"INT",nullable:!1,notes:["→ org.Entity"]},{name:"PartyId",type:"INT",nullable:!1,notes:["→ org.Party"]},{name:"Source",type:"VARCHAR(30)",nullable:!1,notes:[]},{name:"Reference",type:"VARCHAR(60)",nullable:!1,notes:[]},{name:"DocumentId",type:"BIGINT",nullable:!0,notes:["→ integ.Document"]},{name:"ItemDate",type:"DATE",nullable:!1,notes:[]},{name:"DueDate",type:"DATE",nullable:!1,notes:[]},{name:"Amount",type:"DECIMAL(14,2)",nullable:!1,notes:["check Amount > 0"]},{name:"Paid",type:"DECIMAL(14,2)",nullable:!1,notes:["default 0"]},{name:"Adjusted",type:"DECIMAL(14,2)",nullable:!1,notes:["default 0"]},{name:"Balance",type:"COMPUTED",nullable:null,notes:["= Amount - Paid - Adjusted","persisted"]}],denies:["SELECT (Reference) to analytics_reader"],checks:["Paid >= 0 AND Adjusted >= 0"],uniques:["(EntityId, Source, Reference)"]},{database:"FinancePowerApp",schema:"ap",table:"Item",file:"database/010_erp_schema.sql",line:186,columns:[{name:"ItemId",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"EntityId",type:"INT",nullable:!1,notes:["→ org.Entity"]},{name:"PartyId",type:"INT",nullable:!1,notes:["→ org.Party"]},{name:"Source",type:"VARCHAR(30)",nullable:!1,notes:[]},{name:"Reference",type:"VARCHAR(60)",nullable:!1,notes:[]},{name:"DocumentId",type:"BIGINT",nullable:!0,notes:["→ integ.Document"]},{name:"ItemDate",type:"DATE",nullable:!1,notes:[]},{name:"DueDate",type:"DATE",nullable:!1,notes:[]},{name:"Amount",type:"DECIMAL(14,2)",nullable:!1,notes:["check Amount > 0"]},{name:"Paid",type:"DECIMAL(14,2)",nullable:!1,notes:["default 0"]},{name:"Balance",type:"COMPUTED",nullable:null,notes:["= Amount - Paid","persisted"]}],denies:["SELECT (Reference) to analytics_reader"],checks:["Paid >= 0"],uniques:["(EntityId, Source, Reference)"]},{database:"FinancePowerApp",schema:"integ",table:"Document",file:"database/010_erp_schema.sql",line:206,columns:[{name:"DocumentId",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"Source",type:"VARCHAR(30)",nullable:!1,notes:[]},{name:"ExternalId",type:"VARCHAR(200)",nullable:!1,notes:[]},{name:"SourceKey",type:"VARCHAR(60)",nullable:!1,notes:[]},{name:"EntityId",type:"INT",nullable:!0,notes:["→ org.Entity"]},{name:"Kind",type:"VARCHAR(20)",nullable:!1,notes:["check Kind IN ('Invoice','Receipt','Adjustment','Bill','Payment','Usage','Reversal')"]},{name:"PartyType",type:"VARCHAR(20)",nullable:!0,notes:[]},{name:"PartyCode",type:"VARCHAR(40)",nullable:!0,notes:[]},{name:"DocumentDate",type:"DATE",nullable:!1,notes:[]},{name:"Reference",type:"VARCHAR(60)",nullable:!1,notes:[]},{name:"Total",type:"DECIMAL(14,2)",nullable:!1,notes:[]},{name:"PayloadJson",type:"NVARCHAR(MAX)",nullable:!1,notes:[]},{name:"Status",type:"VARCHAR(15)",nullable:!1,notes:["check [Status] IN ('Received','Posted','NeedsMapping','Rejected','Reversed')"]},{name:"Error",type:"NVARCHAR(1000)",nullable:!0,notes:[]},{name:"JournalEntryId",type:"BIGINT",nullable:!0,notes:["→ gl.JournalEntry"]},{name:"ReceivedUtc",type:"DATETIME2(3)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"PostedUtc",type:"DATETIME2(3)",nullable:!0,notes:[]}],denies:[],uniques:["(Source, ExternalId)"]},{database:"FinancePowerApp",schema:"ap",table:"ExpensePosting",file:"database/011_expense_posting.sql",line:10,columns:[{name:"ExpenseId",type:"INT",nullable:!1,notes:["PK","→ Expenses"]},{name:"EntityId",type:"INT",nullable:!1,notes:["→ org.Entity"]},{name:"JournalEntryId",type:"BIGINT",nullable:!1,notes:["→ gl.JournalEntry"]},{name:"PostedUtc",type:"DATETIME2(3)",nullable:!1,notes:["default SYSUTCDATETIME()"]}],denies:[]}],r=[{path:"/",redirect:"/dashboard",guards:[]},{path:"/dashboard",component:"Dashboard",guards:[]},{path:"/journal",component:"Journal",guards:[]},{path:"/inbox",component:"Inbox",guards:[]},{path:"/reports",component:"Reports",guards:[]},{path:"/setup",component:"Setup",guards:[]},{path:"*",redirect:"/dashboard",guards:[]}],o={project:e,repo:n,files:t,examples:a,endpoints:s,tables:i,routes:r};export{o as default,s as endpoints,a as examples,t as files,e as project,n as repo,r as routes,i as tables};
