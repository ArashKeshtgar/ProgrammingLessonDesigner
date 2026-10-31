const e="clinicreport",t="ClinicReport",n={"README.md":223,Dockerfile:30,"docker-compose.yml":26,"src/ClinicReport.Api/Properties/launchSettings.json":45,"src/ClinicReport.Api/Program.cs":115,"tests/ClinicReport.Tests/ApiTests.cs":237,"tests/ClinicReport.Tests/ConnectedTests.cs":280,".github/workflows/ci.yml":49,"src/ClinicReport.Api/Domain/TemplateDefinition.cs":164,"templates/echo-tte.json":643,"docs/templates.md":141,"src/ClinicReport.Api/Domain/Formula.cs":260,"src/ClinicReport.Api/Domain/ReportRenderer.cs":274,"src/ClinicReport.Api/Domain/ReportValues.cs":71,"src/ClinicReport.Api/Endpoints/TemplateEndpoints.cs":207,"src/ClinicReport.Api/Domain/TemplateValidator.cs":247,"src/ClinicReport.Api/Data/Seeding.cs":220,"web/src/pages/TemplateDesigner.tsx":619,"src/ClinicReport.Api/Endpoints/ReportEndpoints.cs":170,"src/ClinicReport.Api/Reports/ReportService.cs":304,"src/ClinicReport.Api/Reports/ReportHub.cs":93,"web/src/live.ts":57,"web/src/pages/ReportEditor.tsx":379,"src/ClinicReport.Api/Endpoints/PatientEndpoints.cs":91,"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs":279,"src/ClinicReport.Api/Auth/AuthSetup.cs":188,"src/ClinicReport.Api/Auth/Totp.cs":92,"web/src/components/TwoFactorSetup.tsx":51,"src/ClinicReport.Api/Auth/Permissions.cs":56,"src/ClinicReport.Api/Endpoints/UserEndpoints.cs":361,"src/ClinicReport.Api/Auth/SecurityLog.cs":42,"web/src/pages/Audit.tsx":82,"src/ClinicReport.Api/Auth/ClinicHubConnection.cs":349,"src/ClinicReport.Api/Endpoints/OrderEndpoints.cs":271,"web/src/pages/Worklist.tsx":145,"src/ClinicReport.Api/Auth/ConfidentialityGate.cs":35,"web/src/components/RestrictedGate.tsx":28,"src/ClinicReport.Api/Reports/ResultSender.cs":173,"src/ClinicReport.Api/Reports/FinanceSender.cs":135,"web/src/App.tsx":122,"web/src/api.ts":221,"web/src/main.tsx":21,"web/src/theme.ts":21,"src/ClinicReport.Api/Data/ClinicReportDbContext.cs":142,"src/ClinicReport.Api/Data/DatabaseInitializer.cs":67,"src/ClinicReport.Api/Data/Migrations/20261021033045_OrderConfidentiality.cs":28},i={"run/image":{file:"Dockerfile",start:18,end:30,code:`FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app ./
COPY --from=web /web/dist ./wwwroot
RUN mkdir /data && chown app:app /data
ENV ASPNETCORE_URLS=http://+:8080 \\
    ConnectionStrings__ClinicReport="Data Source=/data/clinicreport.db" \\
    ClinicHub__DatabasePattern="Data Source=/data/clinicreport-{clinic}.db" \\
    DataProtection__KeysDirectory=/data/keys
VOLUME /data
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "ClinicReport.Api.dll"]`},"run/profile":{file:"src/ClinicReport.Api/Properties/launchSettings.json",start:13,end:27,code:`"connected": {
  "commandName": "Project",
  "dotnetRunMessages": true,
  "launchBrowser": false,
  "applicationUrl": "http://localhost:5290",
  "environmentVariables": {
    "ASPNETCORE_ENVIRONMENT": "Development",
    "ClinicHub__Authority": "http://localhost:5301/",
    "ClinicHub__ClientSecret": "dev-only-clinicreport-secret",
    "ClinicHub__RequireHttpsMetadata": "false",
    "ClinicHub__DatabasePattern": "Data Source=clinicreport-{clinic}.db",
    "ClinicHub__PublicUrl": "http://localhost:5291/",
    "ClinicHub__FinanceUrl": "http://localhost:5400"
  }
},`},"run/init":{file:"src/ClinicReport.Api/Program.cs",start:53,end:57,code:`// Standalone: one database, prepared now. Connected to ClinicHub: one database per clinic, prepared at its first sign-in.
var connected = app.Services.IsConnected();
if (!connected)
    using (var scope = app.Services.CreateScope())
        await DatabaseInitializer.RunAsync(scope.ServiceProvider, wipe: false);`},"tests/factory":{file:"tests/ClinicReport.Tests/ApiTests.cs",start:18,end:25,code:`protected override void ConfigureWebHost(IWebHostBuilder builder)
{
    builder.UseEnvironment("Testing");
    builder.UseSetting("ConnectionStrings:ClinicReport", $"Data Source={_dbPath}");
    builder.UseSetting("Demo:Enabled", "true");
    builder.UseSetting("RateLimits:LoginsPerMinute", "1000");
    builder.UseSetting("Demo:LockAccounts", LockAccounts ? "true" : "false");
}`},"tests/parallel":{file:"tests/ClinicReport.Tests/ApiTests.cs",start:114,end:128,code:`public async Task Parallel_edits_to_different_fields_are_all_kept()
{
    var typist = await factory.SignInAsync("demo.typist");
    var physician = await factory.SignInAsync("demo.physician");
    var id = await NewEchoReportAsync(typist);

    var fields = new[] { "ivsd", "lvidd", "lvpwd", "lvids", "la_volume", "ao_root", "rv_basal", "tapse", "e_wave", "a_wave" };
    await Task.WhenAll(fields.Select((f, i) =>
        Patch(i % 2 == 0 ? typist : physician, id, new Dictionary<string, object> { [f] = 10 + i })));

    var report = await Json(await typist.GetAsync($"/api/reports/{id}"));
    foreach (var (f, i) in fields.Select((f, i) => (f, i)))
        Assert.Equal(10 + i, report["values"]![f]!.GetValue<double>());
    Assert.Equal(1 + fields.Length, report["revision"]!.GetValue<int>());
}`},"tests/fakehub":{file:"tests/ClinicReport.Tests/ConnectedTests.cs",start:24,end:27,code:`/// ClinicReport connected to ClinicHub. ClinicHub itself is a separate project, so its discovery document and
/// token endpoint are stand-ins here, and /test/hub-signin plays the part of the sign-in callback: it hands
/// ClinicReport what ClinicHub's id token would carry. (ClinicHub's side is tested in ClinicHub.)
/// </summary>`},"tests/smoke":{file:".github/workflows/ci.yml",start:43,end:49,code:`- name: Smoke test
  run: |
    docker run -d --name cr -p 8080:8080 clinicreport:ci
    for i in $(seq 1 30); do curl -fs http://localhost:8080/healthz && break; sleep 1; done
    curl -fs http://localhost:8080/healthz
    curl -fs http://localhost:8080/ | grep -q '<div id="root">'
    docker logs cr 2>&1 | grep -q 'Imported template echo-tte'`},"template-model/echo":{file:"templates/echo-tte.json",start:282,end:301,code:`  "id": "ms", "label": "Stenosis", "type": "choice",
  "options": [
    { "value": "none", "label": "None", "phrase": "" },
    { "value": "mild", "label": "Mild", "phrase": "There is mild mitral stenosis.", "abnormal": true },
    { "value": "moderate", "label": "Moderate", "phrase": "There is moderate mitral stenosis.", "abnormal": true },
    { "value": "severe", "label": "Severe", "phrase": "There is severe mitral stenosis.", "abnormal": true }
  ],
  "children": [
    {
      "id": "mv_mean_grad", "label": "Mean gradient", "type": "number", "unit": "mmHg", "decimals": 0,
      "showIf": { "field": "ms", "noneOf": ["none"] },
      "phrase": "The mean transmitral gradient is {value} mmHg"
    },
    {
      "id": "mva", "label": "MVA (planimetry / PHT)", "type": "number", "unit": "cm²", "decimals": 1,
      "showIf": { "field": "ms", "noneOf": ["none"] },
      "phrase": "Mitral valve area is {value} cm²."
    }
  ]
},`},"template-model/types":{file:"src/ClinicReport.Api/Domain/TemplateDefinition.cs",start:63,end:75,code:`public static class FieldTypes
{
    public const string Choice = "choice";       // one option
    public const string Multi = "multi";         // any number of options
    public const string Number = "number";       // typed measurement
    public const string Computed = "computed";   // formula over other numbers
    public const string Text = "text";           // one line
    public const string TextArea = "textarea";   // paragraph

    public static readonly string[] All = [Choice, Multi, Number, Computed, Text, TextArea];
    public static bool IsNumeric(string type) => type is Number or Computed;
    public static bool HasOptions(string type) => type is Choice or Multi;
}`},"template-model/range":{file:"src/ClinicReport.Api/Domain/TemplateDefinition.cs",start:151,end:157,code:`public Bounds? For(string? sex) => sex switch
{
    "M" when Male is not null => Male,
    "F" when Female is not null => Female,
    _ when Min is not null || Max is not null => new Bounds { Min = Min, Max = Max },
    _ => null,
};`},"template-model/strict":{file:"src/ClinicReport.Api/Domain/TemplateDefinition.cs",start:25,end:26,code:`// A misspelt property ("phrse") should fail loudly rather than vanish from the template.
UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow,`},"formula/power":{file:"src/ClinicReport.Api/Domain/Formula.cs",start:137,end:147,code:`// power := unary ('^' power)?   (right associative)
private Node ParsePower()
{
    var node = ParseUnary();
    if (Peek() == '^')
    {
        Next();
        return new Binary('^', node, ParsePower());
    }
    return node;
}`},"formula/arity":{file:"src/ClinicReport.Api/Domain/Formula.cs",start:210,end:217,code:`var (min, max) = name switch
{
    "sqrt" or "abs" => (1, 1),
    "round" => (1, 2),
    _ => (1, int.MaxValue),
};
if (args.Count < min || args.Count > max)
    throw Error($"{name}() takes {(min == max ? min.ToString() : $"{min}+")} argument(s)");`},"formula/binary":{file:"src/ClinicReport.Api/Domain/Formula.cs",start:60,end:76,code:`private sealed record Binary(char Op, Node Left, Node Right) : Node
{
    public override double? Eval(Func<string, double?> resolve)
    {
        if (Left.Eval(resolve) is not { } a || Right.Eval(resolve) is not { } b)
            return null;
        return Op switch
        {
            '+' => a + b,
            '-' => a - b,
            '*' => a * b,
            '/' => b == 0 ? null : a / b,
            '^' => Math.Pow(a, b),
            _ => throw new InvalidOperationException($"Unknown operator {Op}"),
        };
    }
}`},"formula/avg":{file:"src/ClinicReport.Api/Domain/Formula.cs",start:85,end:93,code:`    case "avg":
        // Averages ignore blanks: e' septal alone still gives an E/e' when lateral was not measured.
        var present = values.Where(v => v is not null).Select(v => v!.Value).ToArray();
        return present.Length == 0 ? null : present.Average();
    case "round":
        if (values[0] is not { } x) return null;
        var digits = values.Length > 1 && values[1] is { } d ? (int)d : 0;
        return Math.Round(x, Math.Clamp(digits, 0, 10), MidpointRounding.AwayFromZero);
}`},"renderer/choice":{file:"src/ClinicReport.Api/Domain/ReportRenderer.cs",start:104,end:111,code:`case FieldTypes.Choice:
{
    var opt = f.Options.FirstOrDefault(o => o.Value == _values.GetString(f.Id));
    if (opt is null)
        return (null, false);
    var phrase = opt.Phrase ?? f.Phrase ?? "{label}: {value}.";
    return (Fill(phrase, f, opt.Label, opt.Label), opt.Abnormal);
}`},"renderer/fill":{file:"src/ClinicReport.Api/Domain/ReportRenderer.cs",start:143,end:157,code:`private static string? Fill(string phrase, FieldDef f, string value, string values)
{
    if (string.IsNullOrWhiteSpace(phrase))
        return null;
    var s = phrase
        .Replace("{label}", f.Label)
        .Replace("{value}", value)
        .Replace("{values}", values)
        .Replace("{unit}", f.Unit ?? "");
    s = Spaces().Replace(s, " ").Replace(" .", ".").Replace(" ,", ",").Trim();
    if (s.Length == 0)
        return null;
    s = char.ToUpper(s[0], CultureInfo.InvariantCulture) + s[1..];
    return s[^1] is '.' or '!' or '?' or ':' ? s : s + ".";
}`},"renderer/visible":{file:"src/ClinicReport.Api/Domain/ReportRenderer.cs",start:180,end:181,code:`var visible = (_parents.GetValueOrDefault(fieldId) is not { } parent || IsVisible(parent.Id))
    && (f.ShowIf is null || Satisfies(f.ShowIf));`},"renderer/number":{file:"src/ClinicReport.Api/Domain/ReportRenderer.cs",start:214,end:220,code:`/// <summary>A typed or computed number, but only if its field is showing.</summary>
private double? NumberOf(string fieldId)
{
    if (!_fields.TryGetValue(fieldId, out var f) || !FieldTypes.IsNumeric(f.Type))
        return null;
    if (f.Type == FieldTypes.Number)
        return IsVisible(fieldId) ? _values.GetNumber(fieldId) : null;`},"renderer/flag":{file:"src/ClinicReport.Api/Domain/ReportRenderer.cs",start:259,end:263,code:`private static string? Flag(Bounds? b, double value) =>
    b is null ? null
    : b.Min is { } min && value < min ? "L"
    : b.Max is { } max && value > max ? "H"
    : null;`},"designer/publish":{file:"src/ClinicReport.Api/Endpoints/TemplateEndpoints.cs",start:113,end:131,code:`admin.MapPost("/{id:int}/publish", async (int id, ClaimsPrincipal user, ClinicReportDbContext db, TimeProvider clock) =>
{
    var t = await db.Templates.Include(t => t.Versions).SingleOrDefaultAsync(t => t.Id == id);
    var draft = t?.Versions.FirstOrDefault(v => v.Status == TemplateStatus.Draft);
    if (t is null || draft is null)
        return Results.NotFound();
    var errors = TemplateValidator.Validate(draft.DefinitionJson);
    if (errors.Count > 0)
        return Results.Problem(string.Join("\\n", errors), title: "Fix the template before publishing.", statusCode: StatusCodes.Status422UnprocessableEntity);

    var def = TemplateDefinition.Parse(draft.DefinitionJson);
    draft.Status = TemplateStatus.Published;
    draft.PublishedAt = clock.GetUtcNow().UtcDateTime;
    draft.PublishedByUserId = user.RequiredUserId();
    t.Name = def.Name;
    t.Service = def.Service;
    await db.SaveChangesAsync();
    return Results.Ok(await LoadDetail(db, id));
});`},"designer/key":{file:"src/ClinicReport.Api/Endpoints/TemplateEndpoints.cs",start:83,end:84,code:`if (def!.Key != t.Key)
    return Results.Problem($"The key must stay \\"{t.Key}\\"; reports and exports refer to it.", statusCode: StatusCodes.Status400BadRequest);`},"designer/placeholders":{file:"src/ClinicReport.Api/Domain/TemplateValidator.cs",start:189,end:196,code:`private static void CheckPlaceholders(string? phrase, string where, List<string> errors)
{
    if (phrase is null)
        return;
    foreach (Match m in PlaceholderPattern().Matches(phrase))
        if (!Placeholders.Contains(m.Groups[1].Value))
            errors.Add($"{where}: unknown placeholder {{{m.Groups[1].Value}}} in phrase; use {string.Join(", ", Placeholders.Select(p => "{" + p + "}"))}.");
}`},"designer/cycles":{file:"src/ClinicReport.Api/Domain/TemplateValidator.cs",start:207,end:222,code:`var state = new Dictionary<string, int>(); // 1 = visiting, 2 = done
bool Visit(string id)
{
    if (state.TryGetValue(id, out var s))
        return s == 1;
    state[id] = 1;
    if (deps.TryGetValue(id, out var next) && next.Any(n => deps.ContainsKey(n) && Visit(n)))
        return true;
    state[id] = 2;
    return false;
}

foreach (var id in deps.Keys)
    if (Visit(id))
    {
        errors.Add($"Field \\"{id}\\": computed formulas refer to each other in a loop.");`},"designer/seed":{file:"src/ClinicReport.Api/Data/Seeding.cs",start:37,end:58,code:`foreach (var path in Directory.GetFiles(directory, "*.json").Order())
{
    var json = await File.ReadAllTextAsync(path);
    var errors = TemplateValidator.Validate(json);
    if (errors.Count > 0)
    {
        logger.LogError("Skipping template {File}: {Errors}", Path.GetFileName(path), string.Join(" | ", errors));
        continue;
    }
    var def = TemplateDefinition.Parse(json);
    if (await db.Templates.AnyAsync(t => t.Key == def.Key))
        continue;

    db.Templates.Add(new ReportTemplate
    {
        Key = def.Key, Name = def.Name, Service = def.Service,
        Versions = [new TemplateVersion
        {
            Version = 1, Status = TemplateStatus.Published, DefinitionJson = def.ToJson(), CreatedAt = now, PublishedAt = now,
        }],
    });
    logger.LogInformation("Imported template {Key} from {File}", def.Key, Path.GetFileName(path));`},"designer/fees":{file:"src/ClinicReport.Api/Endpoints/TemplateEndpoints.cs",start:149,end:151,code:`static bool Bad(decimal? v) => v is < 0 or > 10000 || (v is { } x && decimal.Round(x, 2) != x);
if (Bad(body.OhipTechnicalFee) || Bad(body.OhipProfessionalFee))
    return Results.ValidationProblem(new Dictionary<string, string[]> { ["fees"] = ["Dollars and cents, from 0 to 10,000; empty for none."] });`},"report-service/filter":{file:"src/ClinicReport.Api/Endpoints/ReportEndpoints.cs",start:28,end:30,code:`// Every /{id} route: the report must exist and belong to a service the user may work on;
// otherwise it answers 404, as if the report were not there.
var one = api.MapGroup("/{id:int}").AddEndpointFilter(ServiceAccessFilter).AddEndpointFilter(ConfidentialityFilter);`},"report-service/mutate":{file:"src/ClinicReport.Api/Reports/ReportService.cs",start:206,end:232,code:`for (var attempt = 1; ; attempt++)
{
    var report = await LoadAsync(id, ct)
        ?? throw new ReportRuleException("Report not found.", StatusCodes.Status404NotFound);
    if (report.Status != ReportStatus.Draft)
        throw new ReportRuleException("This report is signed. Add an addendum instead of editing it.");

    var now = clock.GetUtcNow().UtcDateTime;
    var log = new List<ReportChange>();
    change(report, (field, value) => log.Add(new ReportChange
    {
        ReportId = id, Field = field, UserId = userId, At = now,
        NewValueJson = value is { } v ? v.GetRawText() : null,
    }));
    report.Revision++;
    report.UpdatedAt = now;
    db.Changes.AddRange(log);

    try
    {
        await db.SaveChangesAsync(ct);
    }
    catch (DbUpdateConcurrencyException) when (attempt < MaxSaveAttempts)
    {
        // Someone else saved between our read and write: start over from their version.
        db.ChangeTracker.Clear();
        continue;`},"report-service/token":{file:"src/ClinicReport.Api/Data/ClinicReportDbContext.cs",start:119,end:119,code:"e.Property(r => r.Revision).IsConcurrencyToken();"},"report-service/multi":{file:"src/ClinicReport.Api/Reports/ReportService.cs",start:259,end:267,code:`case FieldTypes.Multi:
    if (v.ValueKind != JsonValueKind.Array)
        throw Bad(field, "must be a list");
    var picked = v.EnumerateArray().Select(e => e.ValueKind == JsonValueKind.String ? e.GetString() : null).ToList();
    if (picked.Any(p => p is null || field.Options.All(o => o.Value != p)))
        throw Bad(field, "contains a value that is not one of its options");
    // Keep template order and drop duplicates so the narrative reads the same however it was clicked.
    var ordered = field.Options.Select(o => o.Value).Where(picked.Contains).ToArray();
    return JsonSerializer.SerializeToElement(ordered);`},"report-service/handler":{file:"src/ClinicReport.Api/Program.cs",start:99,end:113,code:`internal sealed class ReportRuleHandler(IProblemDetailsService problems) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext http, Exception exception, CancellationToken ct)
    {
        if (exception is not ReportRuleException rule)
            return false;
        http.Response.StatusCode = rule.Status;
        return await problems.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = http,
            ProblemDetails = { Status = rule.Status, Title = rule.Message },
            Exception = exception,
        });
    }
}`},"report-service/sign":{file:"src/ClinicReport.Api/Reports/ReportService.cs",start:148,end:155,code:`if (rendered.MissingRequired.Count > 0)
    throw new ReportRuleException("Answer the required fields first: " + string.Join("; ", rendered.MissingRequired) + ".", StatusCodes.Status422UnprocessableEntity);
if (string.IsNullOrWhiteSpace(r.Conclusion))
    throw new ReportRuleException("Write a conclusion before signing.", StatusCodes.Status422UnprocessableEntity);

r.Status = ReportStatus.Final;
r.SignedByUserId = userId;
r.SignedAt = clock.GetUtcNow().UtcDateTime;`},"report-service/addendum":{file:"src/ClinicReport.Api/Reports/ReportService.cs",start:178,end:179,code:`if (report.Status != ReportStatus.Final)
    throw new ReportRuleException("Addenda are for signed reports; edit the draft instead.");`},"live/hub":{file:"src/ClinicReport.Api/Reports/ReportHub.cs",start:39,end:43,code:`/// Live channel for an open report. Changes themselves go through the REST API (so they are validated
/// and audited in one place); the hub only carries presence and the "reportChanged" broadcasts.
/// </summary>
[Authorize(Policy = Permissions.ReportsView)]
public class ReportHub(PresenceTracker presence, ClinicReportDbContext db) : Hub`},"live/broadcast":{file:"src/ClinicReport.Api/Reports/ReportService.cs",start:243,end:244,code:`private Task BroadcastAsync(ReportDto dto, string? clientId, CancellationToken ct) =>
    hub.Clients.Group(ReportHub.GroupName(dto.Id)).SendAsync("reportChanged", new { clientId, report = dto }, ct);`},"live/join":{file:"src/ClinicReport.Api/Reports/ReportHub.cs",start:47,end:61,code:`public async Task JoinReport(int reportId)
{
    var service = await db.Reports.Where(r => r.Id == reportId).Select(r => r.TemplateVersion.Template.Service).SingleOrDefaultAsync();
    if (service is null || !Context.User!.CanAccessService(service))
        throw new HubException("Report not found.");

    if (presence.ReportOf(Context.ConnectionId) is { } previous && previous != reportId)
        await LeaveCurrent();

    var user = Context.User!;
    presence.Join(reportId, new Viewer(Context.ConnectionId, user.RequiredUserId(), user.Identity!.Name ?? "?",
        string.Join(", ", user.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value)), null));
    await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(reportId));
    await BroadcastPresence(reportId);
}`},"live/receive":{file:"web/src/live.ts",start:26,end:29,code:`conn.on('reportChanged', (msg: { clientId: string | null; report: Report }) => {
  if (msg.clientId !== clientId) handlers.current.onRemoteChange(msg.report)
})
conn.on('presence', (v: Viewer[]) => setViewers(v))`},"live/reconnect":{file:"web/src/live.ts",start:32,end:36,code:`conn.onreconnected(async () => {
  await conn.invoke('JoinReport', reportId)
  setConnected(true)
  handlers.current.onReconnected() // we may have missed changes while offline
})`},"live/accept":{file:"web/src/pages/ReportEditor.tsx",start:32,end:45,code:`/** Takes a report from the server (our save, someone else's, or a reload) without losing local typing. */
const accept = useCallback((r: Report) => {
  if (r.revision < revision.current) return // an older response overtaken by a newer one
  revision.current = r.revision
  setReport(r)
  setValues(() => {
    const v: Values = { ...r.values }
    for (const [k, val] of pending.current) {
      if (val == null) delete v[k]
      else v[k] = val
    }
    return v
  })
  if (conclusionEdits.current === 0) setConclusion(r.conclusion ?? '')`},"live/debounce":{file:"web/src/pages/ReportEditor.tsx",start:121,end:122,code:`// Clicks save at once; typing waits for a pause.
flushTimer.current = window.setTimeout(flush, field.type === 'choice' || field.type === 'multi' ? 0 : 500)`},"patients/read":{file:"src/ClinicReport.Api/Auth/AuthSetup.cs",start:78,end:79,code:`auth.AddPolicy(PatientsRead, policy => policy.RequireClaim(AppClaims.Permission,
    Permissions.ReportsView, Permissions.ReportsCreate, Permissions.PatientsManage));`},"patients/plausible":{file:"src/ClinicReport.Api/Endpoints/PatientEndpoints.cs",start:84,end:87,code:`var today = DateOnly.FromDateTime(clock.GetLocalNow().DateTime);
if (req.DateOfBirth > today || req.DateOfBirth < today.AddYears(-125))
    errors["dateOfBirth"] = ["Not a plausible date of birth."];
if (!Sexes.Contains(req.Sex))`},"patients/merge":{file:"src/ClinicReport.Api/Endpoints/OrderEndpoints.cs",start:211,end:224,code:`var old = await db.Patients.SingleOrDefaultAsync(p => p.Mrn == merged);
if (old is not null)
{
    var keep = await db.Patients.SingleOrDefaultAsync(p => p.Mrn == survivor);
    if (keep is null)
        old.Mrn = survivor;
    else
    {
        await db.Reports.Where(r => r.PatientId == old.Id).ExecuteUpdateAsync(u => u.SetProperty(r => r.PatientId, keep.Id));
        await db.ReportOrders.Where(o => o.PatientId == old.Id).ExecuteUpdateAsync(u => u.SetProperty(o => o.PatientId, keep.Id));
        await db.SecurityEvents.Where(e => e.PatientId == old.Id).ExecuteUpdateAsync(u => u.SetProperty(e => e.PatientId, keep.Id));
        db.Patients.Remove(old);
    }
    await db.SaveChangesAsync();`},"patients/demographics":{file:"src/ClinicReport.Api/Endpoints/OrderEndpoints.cs",start:74,end:80,code:`var local = await db.Patients.SingleOrDefaultAsync(p => p.Mrn == mrn)
    ?? db.Patients.Add(new Patient { Mrn = mrn, CreatedAt = now }).Entity;
// ClinicHub's register is the source of truth for the demographics of its patients.
local.LastName = family;
local.FirstName = given ?? "";
local.DateOfBirth = dob;
local.Sex = (string?)patient["gender"] switch { "male" => "M", "female" => "F", "other" => "X", _ => "U" };`},"accounts/lockout":{file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",start:55,end:60,code:`if (user?.LockoutEndUtc is { } until && until > now.UtcDateTime)
{
    await log.WriteAsync(SecurityEventTypes.LoginFailed, null, user.Id, "Account locked");
    return Results.Problem($"Too many failed attempts. Try again after {Math.Ceiling((until - now.UtcDateTime).TotalMinutes)} minutes, or ask an administrator to unlock the account.",
        statusCode: StatusCodes.Status423Locked);
}`},"accounts/timing":{file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",start:62,end:65,code:`// Hash even when the user does not exist so timing does not reveal valid user names.
var result = hasher.VerifyHashedPassword(user ?? new AppUser(), user?.PasswordHash ?? DummyHash, req.Password ?? "");
if (user is null || result == PasswordVerificationResult.Failed)
    return await Failed(user, "Wrong password", "Wrong user name or password.");`},"accounts/rate":{file:"src/ClinicReport.Api/Program.cs",start:42,end:49,code:`var loginsPerMinute = builder.Configuration.GetValue("RateLimits:LoginsPerMinute", 10);
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy(AuthEndpoints.LoginRateLimit, ctx => RateLimitPartition.GetFixedWindowLimiter(
        ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = loginsPerMinute, Window = TimeSpan.FromMinutes(1) }));
});`},"accounts/bootstrap":{file:"src/ClinicReport.Api/Data/Seeding.cs",start:103,end:106,code:`var password = config["Bootstrap:AdminPassword"];
var generated = string.IsNullOrEmpty(password);
if (generated)
    password = RandomNumberGenerator.GetString("abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789", 16);`},"accounts/pending":{file:"src/ClinicReport.Api/Auth/AuthSetup.cs",start:174,end:186,code:`public static IApplicationBuilder UsePendingActionGate(this IApplicationBuilder app) => app.Use(async (ctx, next) =>
{
    var pending = ctx.User.FindFirstValue(AppClaims.Pending);
    var path = ctx.Request.Path;
    if (pending is not null && (path.StartsWithSegments("/hubs")
        || (path.StartsWithSegments("/api") && !path.StartsWithSegments("/api/auth") && !path.StartsWithSegments("/api/settings"))))
    {
        ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
        await ctx.Response.WriteAsJsonAsync(new { title = pending == PendingActions.ChangePassword
            ? "Choose a new password first." : "Set up two-factor sign-in first.", pending });
        return;
    }
    await next();`},"accounts/password":{file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",start:31,end:36,code:`public static string? PasswordProblem(string? password, string? userName = null) =>
    password is null || password.Length < MinPasswordLength ? $"Use at least {MinPasswordLength} characters."
    : password.Length > 128 ? "Use at most 128 characters."
    : password.Distinct().Count() < 4 ? "Use more different characters."
    : userName is { Length: >= 3 } && password.Contains(userName, StringComparison.OrdinalIgnoreCase) ? "Don't include your user name."
    : null;`},"totp/code":{file:"src/ClinicReport.Api/Auth/Totp.cs",start:23,end:32,code:`public static string Code(string secret, long step)
{
    var counter = BitConverter.GetBytes(step);
    if (BitConverter.IsLittleEndian)
        Array.Reverse(counter);
    var hash = HMACSHA1.HashData(Base32Decode(secret), counter);
    var offset = hash[^1] & 0x0F;
    var binary = ((hash[offset] & 0x7F) << 24) | (hash[offset + 1] << 16) | (hash[offset + 2] << 8) | hash[offset + 3];
    return (binary % 1_000_000).ToString("D6");
}`},"totp/uri":{file:"src/ClinicReport.Api/Auth/Totp.cs",start:17,end:19,code:`public static string OtpAuthUri(string issuer, string account, string secret) =>
    $"otpauth://totp/{Uri.EscapeDataString(issuer)}:{Uri.EscapeDataString(account)}" +
    $"?secret={secret}&issuer={Uri.EscapeDataString(issuer)}&algorithm=SHA1&digits=6&period={StepSeconds}";`},"totp/verify":{file:"src/ClinicReport.Api/Auth/Totp.cs",start:38,end:52,code:`public static long? Verify(string secret, string? code, DateTimeOffset now, long lastUsedStep)
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
}`},"totp/protect":{file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",start:75,end:78,code:`var secret = protection.CreateProtector(TwoFactorPurpose).Unprotect(user.TwoFactorSecret!);
if (Totp.Verify(secret, req.Code, now, user.TwoFactorLastStep) is not { } step)
    return await Failed(user, "Wrong two-factor code", "That code is wrong or already used.", twoFactor: true);
user.TwoFactorLastStep = step;`},"totp/login":{file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",start:70,end:79,code:`if (user.TwoFactorEnabled)
{
    if (string.IsNullOrWhiteSpace(req.Code))
        return Results.Problem("Enter the 6-digit code from your authenticator app.", statusCode: StatusCodes.Status401Unauthorized,
            extensions: new Dictionary<string, object?> { ["twoFactorRequired"] = true });
    var secret = protection.CreateProtector(TwoFactorPurpose).Unprotect(user.TwoFactorSecret!);
    if (Totp.Verify(secret, req.Code, now, user.TwoFactorLastStep) is not { } step)
        return await Failed(user, "Wrong two-factor code", "That code is wrong or already used.", twoFactor: true);
    user.TwoFactorLastStep = step;
}`},"totp/enable":{file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",start:206,end:218,code:`account.MapPost("/two-factor/enable", async (CodeBody body, ClaimsPrincipal principal, ClinicReportDbContext db,
    IDataProtectionProvider protection, SecurityLog log, TimeProvider clock) =>
{
    var user = (await LoadUser(db, principal.RequiredUserId(), tracked: true))!;
    if (user.TwoFactorEnabled || user.TwoFactorSecret is null)
        return Results.Problem("Start the setup first.", statusCode: StatusCodes.Status409Conflict);
    var secret = protection.CreateProtector(TwoFactorPurpose).Unprotect(user.TwoFactorSecret);
    if (Totp.Verify(secret, body.Code, clock.GetUtcNow(), user.TwoFactorLastStep) is not { } step)
        return Results.ValidationProblem(new Dictionary<string, string[]> { ["code"] = ["That code doesn't match. Check the phone's clock and try the newest code."] });
    user.TwoFactorEnabled = true;
    user.TwoFactorLastStep = step;
    log.Add(SecurityEventTypes.TwoFactorEnabled, user.Id);
    await db.SaveChangesAsync();`},"permissions/catalog":{file:"src/ClinicReport.Api/Auth/Permissions.cs",start:9,end:16,code:`public const string ReportsView = "reports.view";
public const string ReportsCreate = "reports.create";
public const string ReportsEdit = "reports.edit";
public const string ReportsSign = "reports.sign";
public const string PatientsManage = "patients.manage";
public const string TemplatesDesign = "templates.design";
public const string UsersManage = "users.manage";
public const string AuditView = "audit.view";`},"permissions/access":{file:"src/ClinicReport.Api/Auth/AuthSetup.cs",start:30,end:43,code:`public static Access For(AppUser user)
{
    var roles = user.Roles.Select(ur => ur.Role).ToList();
    var permissions = roles.Any(r => r.IsSystem && r.Name == SystemRoles.Administrator)
        ? Auth.Permissions.All
        : Auth.Permissions.All.Where(p => roles.Any(r => Auth.Permissions.Parse(r.Permissions).Contains(p))).ToArray();
    var services = user.ServiceList();
    var twoFactorRequired = roles.Any(r => r.RequireTwoFactor);
    var pending = user.MustChangePassword ? PendingActions.ChangePassword
        : twoFactorRequired && !user.TwoFactorEnabled ? PendingActions.SetupTwoFactor
        : null;
    return new Access(roles.Select(r => r.Name).OrderBy(n => n).ToArray(), permissions,
        services.Count == 0 ? null : services.ToArray(), twoFactorRequired, pending);
}`},"permissions/policies":{file:"src/ClinicReport.Api/Auth/AuthSetup.cs",start:73,end:77,code:`var auth = services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());
// One policy per permission, named after it: .RequireAuthorization(Permissions.ReportsSign)
foreach (var p in Permissions.All)
    auth.AddPolicy(p, policy => policy.RequireClaim(AppClaims.Permission, p));`},"permissions/service":{file:"src/ClinicReport.Api/Auth/AuthSetup.cs",start:148,end:155,code:`public static string[]? ServiceScope(this ClaimsPrincipal user)
{
    var services = user.FindAll(AppClaims.Service).Select(c => c.Value).ToArray();
    return services.Contains(AppClaims.AllServices) ? null : services;
}

public static bool CanAccessService(this ClaimsPrincipal user, string service) =>
    user.ServiceScope() is not { } scope || scope.Contains(service, StringComparer.OrdinalIgnoreCase);`},"permissions/last":{file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",start:335,end:346,code:`private static async Task<string?> LastAdminProblem(ClinicReportDbContext db, AppUser? changedUser, Role? changedRole = null)
{
    var others = await db.Users.AsNoTracking().Include(u => u.Roles).ThenInclude(ur => ur.Role)
        .Where(u => u.IsActive && (changedUser == null || u.Id != changedUser.Id)).ToListAsync();
    if (changedRole is not null)
        foreach (var ur in others.SelectMany(u => u.Roles).Where(ur => ur.RoleId == changedRole.Id))
            ur.Role = changedRole;
    var candidates = changedUser is { IsActive: true } ? others.Append(changedUser) : others;
    return candidates.Any(u => Access.For(u).Permissions.Contains(Permissions.UsersManage))
        ? null
        : "At least one active user must keep the \\"Manage users and roles\\" permission.";
}`},"audit/add":{file:"src/ClinicReport.Api/Auth/SecurityLog.cs",start:13,end:24,code:`public void Add(string type, int? actor, int? target = null, string? detail = null, int? reportId = null, int? patientId = null) =>
    db.SecurityEvents.Add(new SecurityEvent
    {
        At = clock.GetUtcNow().UtcDateTime,
        Type = type,
        ActorUserId = actor,
        TargetUserId = target,
        ReportId = reportId,
        PatientId = patientId,
        Detail = detail is { Length: > 500 } ? detail[..500] : detail,
        IpAddress = http.HttpContext?.Connection.RemoteIpAddress?.ToString(),
    });`},"audit/viewed":{file:"src/ClinicReport.Api/Auth/SecurityLog.cs",start:33,end:41,code:`public async Task ReportViewedAsync(int userId, int reportId, int patientId, CancellationToken ct)
{
    var since = clock.GetUtcNow().UtcDateTime - ViewDedupWindow;
    if (await db.SecurityEvents.AnyAsync(e => e.Type == SecurityEventTypes.ReportViewed
            && e.ActorUserId == userId && e.ReportId == reportId && e.At >= since, ct))
        return;
    Add(SecurityEventTypes.ReportViewed, userId, reportId: reportId, patientId: patientId);
    await db.SaveChangesAsync(ct);
}`},"audit/csrf":{file:"src/ClinicReport.Api/Auth/AuthSetup.cs",start:158,end:168,code:`public static IApplicationBuilder UseCsrfHeaderCheck(this IApplicationBuilder app) => app.Use(async (ctx, next) =>
{
    var unsafeMethod = !(HttpMethods.IsGet(ctx.Request.Method) || HttpMethods.IsHead(ctx.Request.Method) || HttpMethods.IsOptions(ctx.Request.Method));
    if (unsafeMethod && ctx.Request.Path.StartsWithSegments("/api") && !ctx.Request.Headers.ContainsKey(CsrfHeader))
    {
        ctx.Response.StatusCode = StatusCodes.Status400BadRequest;
        await ctx.Response.WriteAsJsonAsync(new { title = $"Missing {CsrfHeader} header." });
        return;
    }
    await next();
});`},"audit/header":{file:"web/src/api.ts",start:110,end:114,code:`headers: {
  'X-ClinicReport': '1',
  'X-Client-Id': clientId,
  ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
},`},"audit/page":{file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",start:256,end:258,code:`if (before is not null)
    q = q.Where(e => e.Id < before);
return await q.OrderByDescending(e => e.Id).Take(200)`},"clinichub-signin/managed":{file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",start:38,end:42,code:`// Connected to ClinicHub: these exist only to say so (their handlers would need a clinic's database to bind).
var managed = () => Results.Problem("Sign-in, passwords, two-factor and roles are managed in ClinicHub for this installation.",
    statusCode: StatusCodes.Status409Conflict);
foreach (var path in new[] { "/login", "/demo-login", "/password", "/two-factor/setup", "/two-factor/enable", "/two-factor/disable" })
    api.MapPost(path, managed).AllowAnonymous();`},"clinichub-signin/oidc":{file:"src/ClinicReport.Api/Auth/ClinicHubConnection.cs",start:153,end:168,code:`auth.AddOpenIdConnect(Scheme, "ClinicHub", o =>
{
    o.Authority = hub.Authority;
    o.ClientId = hub.ClientId;
    o.ClientSecret = hub.ClientSecret;
    o.RequireHttpsMetadata = hub.RequireHttpsMetadata;
    o.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    o.ResponseType = OpenIdConnectResponseType.Code;
    // A redirect, not a cross-site form post, so the correlation cookies can stay SameSite=Lax over plain HTTP in development.
    o.ResponseMode = OpenIdConnectResponseMode.Query;
    o.UsePkce = true;
    o.Scope.Clear();
    foreach (var s in new[] { "openid", "profile", "clinic", "offline_access" })
        o.Scope.Add(s);
    o.SaveTokens = true;
    o.MapInboundClaims = false;`},"clinichub-signin/lax":{file:"src/ClinicReport.Api/Auth/AuthSetup.cs",start:59,end:60,code:`// Connected: the browser arrives from ClinicHub's sign-in, a navigation a Strict cookie would not survive.
o.Cookie.SameSite = connected ? SameSiteMode.Lax : SameSiteMode.Strict;`},"clinichub-signin/user":{file:"src/ClinicReport.Api/Auth/ClinicHubConnection.cs",start:212,end:226,code:`var externalId = $"clinichub:{hub.FindFirstValue("sub")}";
var now = DateTime.UtcNow;
var user = await db.Users.SingleOrDefaultAsync(u => u.ExternalId == externalId);
if (user is null)
{
    var userName = hub.FindFirstValue("preferred_username") ?? externalId;
    // A local account with the same user name (from before the clinic connected) is taken over, keeping its history.
    user = await db.Users.SingleOrDefaultAsync(u => u.UserName == userName && u.ExternalId == null)
        ?? db.Users.Add(new AppUser { UserName = userName, CreatedAt = now }).Entity;
    user.ExternalId = externalId;
    user.PasswordHash = "";
    user.TwoFactorEnabled = false;
    user.TwoFactorSecret = null;
    user.MustChangePassword = false;
}`},"clinichub-signin/permissions":{file:"src/ClinicReport.Api/Auth/ClinicHubConnection.cs",start:251,end:252,code:`// Only keys ClinicReport knows: ClinicHub already sends this application's permissions, without its prefix.
claims.AddRange(permissions.Where(Permissions.All.Contains).Distinct().Select(p => new Claim(AppClaims.Permission, p)));`},"clinichub-signin/recheck":{file:"src/ClinicReport.Api/Auth/ClinicHubConnection.cs",start:281,end:300,code:`if (DateTime.UtcNow - checkedAt >= TimeSpan.FromMinutes(options.RecheckMinutes))
{
    switch (await Refresh(ctx, options))
    {
        case RefreshResult.Refused:
            await Reject(ctx);
            return;
        case RefreshResult.Unreachable when DateTime.UtcNow - checkedAt > TimeSpan.FromMinutes(options.OfflineGraceMinutes):
            await Reject(ctx);
            return;
        case RefreshResult.Unreachable:
            break;
        case RefreshResult.Ok(var idToken):
            permissions = idToken.Claims.Where(c => c.Type == "permission").Select(c => c.Value).ToList();
            roles = idToken.Claims.Where(c => c.Type == "role").Select(c => c.Value).ToList();
            checkedAt = DateTime.UtcNow;
            ctx.ShouldRenew = true;
            break;
    }
}`},"clinichub-signin/create":{file:"src/ClinicReport.Api/Auth/ClinicHubConnection.cs",start:77,end:83,code:`public ClinicReportDbContext Create(string slug)
{
    if (!IsValidSlug(slug))
        throw new InvalidOperationException("Invalid clinic name.");
    var cs = options.Value.DatabasePattern.Replace("{clinic}", slug);
    return new ClinicReportDbContext(new DbContextOptionsBuilder<ClinicReportDbContext>().UseSqlite(cs).Options);
}`},"clinichub-signin/scoped":{file:"src/ClinicReport.Api/Auth/ClinicHubConnection.cs",start:132,end:139,code:`// The database of the request is the signed-in person's clinic.
services.AddScoped(sp =>
{
    var user = sp.GetRequiredService<IHttpContextAccessor>().HttpContext?.User;
    // A person's session says "clinic"; ClinicHub's own service token says "clinic_slug".
    var slug = user?.FindFirstValue(ClinicHubClaims.Clinic) ?? user?.FindFirstValue("clinic_slug")
        ?? throw new InvalidOperationException("Not signed in to a clinic.");
    return sp.GetRequiredService<ClinicReportDatabases>().Open(slug);`},"orders/policy":{file:"src/ClinicReport.Api/Auth/ClinicHubConnection.cs",start:149,end:151,code:`services.AddAuthorizationBuilder().AddPolicy(OrdersPolicy, p => p
    .AddAuthenticationSchemes(ServiceScheme).RequireAuthenticatedUser()
    .RequireClaim("scope", "orders").RequireAssertion(ctx => ClinicReportDatabases.IsValidSlug(ctx.User.FindFirstValue("clinic_slug"))));`},"orders/dispatch":{file:"src/ClinicReport.Api/Endpoints/OrderEndpoints.cs",start:46,end:53,code:`var entries = bundle["entry"]?.AsArray().Select(e => e?["resource"]).ToList() ?? [];
if (entries is [{ } only] && (string?)only["resourceType"] == "Patient" && only["link"] is not null)
    return await MergeAsync(db, hub.FindFirstValue("clinic_slug")!, only);
var revoked = entries.Where(r => (string?)r?["resourceType"] == "ServiceRequest" && (string?)r?["status"] == "revoked").ToList();
if (revoked.Count > 0)
    return revoked.Count == entries.Count
        ? await CancelAsync(db, hub.FindFirstValue("clinic_slug")!, revoked!, clock.GetUtcNow().UtcDateTime)
        : Outcome("A Bundle that withdraws orders carries only the revoked ServiceRequests.");`},"orders/codes":{file:"src/ClinicReport.Api/Endpoints/OrderEndpoints.cs",start:66,end:70,code:`var keys = orders.Select(o => o?["code"]?["coding"]?.AsArray().FirstOrDefault(c => (string?)c?["system"] == TemplateSystem)?["code"]?.ToString()).ToList();
var templates = await db.Templates.Where(t => t.IsActive).ToDictionaryAsync(t => t.Key);
var unknown = keys.Where(k => k is null || !templates.ContainsKey(k)).ToList();
if (unknown.Count > 0)
    return Outcome($"ClinicReport has no active template '{unknown[0] ?? "(no code)"}'. Codes use {TemplateSystem}.");`},"orders/existing":{file:"src/ClinicReport.Api/Endpoints/OrderEndpoints.cs",start:93,end:98,code:`var existing = await db.ReportOrders.SingleOrDefaultAsync(x => x.ExternalId == externalId);
if (existing is not null)
{
    saved.Add(existing);   // the same order sent again (a retry): accepted once
    continue;
}`},"orders/cancel":{file:"src/ClinicReport.Api/Endpoints/OrderEndpoints.cs",start:243,end:245,code:`if (order.Status == ReportOrderStatus.Started)
    return Outcome($"The {order.Template.Name} has been started (report {order.ReportId}); speak to the reading physician.",
        StatusCodes.Status409Conflict, "business-rule");`},"restricted/label":{file:"src/ClinicReport.Api/Endpoints/OrderEndpoints.cs",start:22,end:29,code:`public static string? Confidentiality(JsonNode? resource)
{
    var codes = resource?["meta"]?["security"]?.AsArray().Where(c => (string?)c?["system"] == ConfidentialitySystem)
        .Select(c => (string?)c!["code"]).Where(c => !string.IsNullOrEmpty(c)).ToList() ?? [];
    if (codes.Count == 0 || codes.All(c => c is "U" or "L" or "M" or "N"))
        return null;
    return codes.Contains("V") ? "V" : "R";
}`},"restricted/gate":{file:"src/ClinicReport.Api/Auth/ConfidentialityGate.cs",start:13,end:34,code:`public class ConfidentialityGate(IMemoryCache cache, TimeProvider clock)
{
    public static readonly TimeSpan Lasts = TimeSpan.FromHours(1);
    public const int MinReason = 10;

    private static string Key(ClaimsPrincipal user, string item) =>
        $"restricted|{user.FindFirst(ClinicHubClaims.Clinic)?.Value}|{user.FindFirst(ClaimTypes.NameIdentifier)?.Value}|{item}";

    public bool IsOpen(ClaimsPrincipal user, string item) => cache.TryGetValue(Key(user, item), out _);

    public DateTime Open(ClaimsPrincipal user, string item)
    {
        var until = clock.GetUtcNow().UtcDateTime + Lasts;
        cache.Set(Key(user, item), true, new DateTimeOffset(until, TimeSpan.Zero));
        return until;
    }

    public static IResult Closed(string label) => Results.Json(
        new { code = "restricted", label, title = "The patient has a consent directive at the clinic: this item is restricted.", reasonNeeded = true },
        statusCode: StatusCodes.Status403Forbidden);

    public static bool ReasonOk(string? reason) => reason is not null && reason.Trim().Length >= MinReason;`},"restricted/carry":{file:"src/ClinicReport.Api/Endpoints/OrderEndpoints.cs",start:189,end:190,code:`if (order.Confidentiality is not null)
    gate.Open(user, $"report:{report.Id}");   // the person who opened the order carries on with its report`},"restricted/hide":{file:"src/ClinicReport.Api/Endpoints/OrderEndpoints.cs",start:143,end:144,code:`// A restricted order is listed, so it is not lost, but who it is for and why stay hidden until the glass is broken.
return rows.Select(o => o.Confidentiality is null || gate.IsOpen(user, $"order:{o.Id}") ? o : o with { Patient = "Restricted", Mrn = "", Indication = null, ReferringPhysician = null }).ToList();`},"restricted/filter":{file:"src/ClinicReport.Api/Endpoints/ReportEndpoints.cs",start:145,end:154,code:`private static async ValueTask<object?> ConfidentialityFilter(EndpointFilterInvocationContext ctx, EndpointFilterDelegate next)
{
    var http = ctx.HttpContext;
    var id = int.Parse(http.Request.RouteValues["id"]!.ToString()!);
    var db = http.RequestServices.GetRequiredService<ClinicReportDbContext>();
    var label = await db.ReportOrders.Where(o => o.ReportId == id).Select(o => o.Confidentiality).FirstOrDefaultAsync();
    if (label is not null && !http.RequestServices.GetRequiredService<ConfidentialityGate>().IsOpen(http.User, $"report:{id}"))
        return ConfidentialityGate.Closed(label);
    return await next(ctx);
}`},"restricted/ui":{file:"web/src/components/RestrictedGate.tsx",start:7,end:26,code:`export function RestrictedGate({ label, onOpen, action = 'Open this report' }: { label: string; onOpen: (reason: string) => Promise<void>; action?: string }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    setBusy(true)
    setError(null)
    try { await onOpen(reason.trim()) } catch (e) { setError(e instanceof Error ? e.message : 'Not opened.') } finally { setBusy(false) }
  }
  return (
    <section className="card" role="region" aria-label="Restricted report">
      <h2>{label === 'V' ? 'Very restricted' : 'Restricted'}</h2>
      <p>The patient has a consent directive at the clinic. Open this only if you are caring for them or have another lawful reason. Your name and your reason are logged.</p>
      <label>Why do you need to open it?
        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} maxLength={300} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary" disabled={busy || reason.trim().length < 10} onClick={submit}>{action}</button>
      <p className="muted small">At least 10 characters. The access lasts one hour.</p>
    </section>`},"results-out/enqueue":{file:"src/ClinicReport.Api/Reports/ReportService.cs",start:162,end:166,code:`if (order is not null)
{
    r.SignedBy ??= signer;
    ResultMessages.Enqueue(db, order, r, "final", [], clinicHub.Value.PublicUrl, r.SignedAt.Value);
}`},"results-out/basedon":{file:"src/ClinicReport.Api/Reports/ResultSender.cs",start:36,end:39,code:`["basedOn"] = new JsonArray(new JsonObject
{
    ["identifier"] = new JsonObject { ["system"] = $"urn:clinichub:{slug}:service-request", ["value"] = orderId },
}),`},"results-out/link":{file:"src/ClinicReport.Api/Reports/ResultSender.cs",start:55,end:57,code:`["presentedForm"] = publicUrl is { Length: > 0 }
    ? new JsonArray(new JsonObject { ["contentType"] = "text/html", ["url"] = $"{publicUrl.TrimEnd('/')}/reports/{report.Id}/print", ["title"] = report.TemplateVersion.Template.Name })
    : null,`},"results-out/clinics":{file:"src/ClinicReport.Api/Reports/ResultSender.cs",start:88,end:100,code:`public IEnumerable<string> Clinics()
{
    var path = new SqliteConnectionStringBuilder(options.Value.DatabasePattern).DataSource;
    var full = Path.GetFullPath(path);
    var dir = Path.GetDirectoryName(full)!;
    var file = Path.GetFileName(full);
    var at = file.IndexOf("{clinic}", StringComparison.Ordinal);
    if (at < 0 || !Directory.Exists(dir))
        return [];
    var (prefix, suffix) = (file[..at], file[(at + "{clinic}".Length)..]);
    return Directory.GetFiles(dir, prefix + "*" + suffix).Select(Path.GetFileName)
        .Select(f => f![prefix.Length..^suffix.Length]).Where(ClinicReportDatabases.IsValidSlug);
}`},"results-out/retry":{file:"src/ClinicReport.Api/Reports/ResultSender.cs",start:131,end:133,code:`m.NextAttemptAt = now.AddSeconds(Math.Min(10 * Math.Pow(2, m.Attempts - 1), 1800));
if (ex.Message.StartsWith("401"))
    _token = null;`},"results-out/finance":{file:"src/ClinicReport.Api/Reports/FinanceSender.cs",start:80,end:95,code:`foreach (var r in signed)
{
    var lines = new JsonArray();
    var department = r.Service.Contains("Electrocardio", StringComparison.OrdinalIgnoreCase) || r.Service.Contains("ECG", StringComparison.OrdinalIgnoreCase) ? "ECG" : "Echo";
    if (r.OhipTechnicalFee is > 0 and var tech)
        lines.Add(Line("OHIP.Technical", tech, department));
    if (r.OhipProfessionalFee is > 0 and var prof)
        lines.Add(Line($"Diagnostics.{department}", prof, department));
    if (lines.Count == 0)
        continue;
    docs.Add(new JsonObject
    {
        ["sourceKey"] = sourceKey, ["externalId"] = $"report:{r.Id}:signed", ["kind"] = "Invoice", ["date"] = r.ExamDate.ToString("yyyy-MM-dd"),
        ["reference"] = $"CR-{r.Id:D6}", ["party"] = new JsonObject { ["type"] = "OHIP", ["code"] = "OHIP" }, ["lines"] = lines,
        ["memo"] = $"{r.Service} report CR-{r.Id:D6}",
    });`},"fe-app/gate":{file:"web/src/App.tsx",start:57,end:59,code:`if (!settings || me === undefined) return <div className="center muted">Loading…</div>
if (!me) return settings.signIn === 'clinichub' ? <ClinicHubSignIn settings={settings} /> : <Login settings={settings} onSignedIn={setMe} />
if (me.pendingAction) return <PendingActionPage me={me} settings={settings} onDone={setMe} onSignOut={signOut} />`},"fe-app/signout":{file:"web/src/App.tsx",start:47,end:55,code:`const signOut = useCallback(async () => {
  // Connected: one sign-out, here and at ClinicHub.
  if (settings?.signIn === 'clinichub') {
    window.location.assign('/api/auth/sso/signout')
    return
  }
  await api.logout()
  setMe(null)
}, [settings])`},"fe-app/request":{file:"web/src/api.ts",start:106,end:126,code:`async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: {
      'X-ClinicReport': '1',
      'X-Client-Id': clientId,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return undefined as T
  const text = await res.text()
  const data = text ? JSON.parse(text) : undefined
  if (!res.ok) {
    if (res.status === 401 && !url.startsWith('/api/auth/')) window.dispatchEvent(new Event('clinicreport:signed-out'))
    const message = data?.title && data?.detail ? \`\${data.title} \${data.detail}\` : data?.title ?? data?.detail ?? \`Request failed (\${res.status})\`
    throw new ApiError(res.status, message, data?.errors ?? {}, data ?? {})
  }
  return data as T
}`},"fe-app/signedout":{file:"web/src/App.tsx",start:38,end:40,code:`const onSignedOut = () => setMe(null)
window.addEventListener('clinicreport:signed-out', onSignedOut)
return () => window.removeEventListener('clinicreport:signed-out', onSignedOut)`},"fe-app/theme":{file:"web/src/theme.ts",start:6,end:12,code:`export function savedTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}`},"data-sqlite/sqlite":{file:"src/ClinicReport.Api/Program.cs",start:16,end:17,code:`var connectionString = builder.Configuration.GetConnectionString("ClinicReport") ?? "Data Source=clinicreport.db";
builder.Services.AddDbContext<ClinicReportDbContext>(o => o.UseSqlite(connectionString));`},"data-sqlite/migration":{file:"src/ClinicReport.Api/Data/Migrations/20261021033045_OrderConfidentiality.cs",start:11,end:18,code:`protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.AddColumn<string>(
        name: "Confidentiality",
        table: "ReportOrders",
        type: "TEXT",
        nullable: true);
}`},"data-sqlite/migrate":{file:"src/ClinicReport.Api/Data/DatabaseInitializer.cs",start:20,end:30,code:`if (wipe)
{
    await db.Database.EnsureDeletedAsync(ct);
    SqliteConnection.ClearAllPools();
}
await db.Database.MigrateAsync(ct);
await RoleSeeder.SeedAsync(db);
await TemplateSeeder.SeedAsync(db, Path.Combine(AppContext.BaseDirectory, "templates"), logger, now);
if (services.GetRequiredService<IOptions<DemoOptions>>().Value.Enabled)
    await DemoSeeder.SeedAsync(db, hasher, now);
await UserBootstrap.SeedAsync(db, config, hasher, logger, now);`},"data-sqlite/nocase":{file:"src/ClinicReport.Api/Data/ClinicReportDbContext.cs",start:46,end:57,code:`b.Entity<AppUser>(e =>
{
    e.Property(u => u.UserName).HasMaxLength(64).UseCollation("NOCASE");
    e.HasIndex(u => u.UserName).IsUnique();
    e.Property(u => u.DisplayName).HasMaxLength(128);
    e.Property(u => u.Credentials).HasMaxLength(64);
    e.Property(u => u.Services).HasMaxLength(2000);
    e.Property(u => u.SecurityStamp).HasMaxLength(64);
    e.Property(u => u.TwoFactorSecret).HasMaxLength(1000);
    e.Property(u => u.ExternalId).HasMaxLength(64);
    e.HasIndex(u => u.ExternalId).IsUnique().HasFilter("ExternalId IS NOT NULL");
});`},"data-sqlite/reset":{file:"src/ClinicReport.Api/Data/DatabaseInitializer.cs",start:50,end:53,code:`var next = new DateTimeOffset(now.Year, now.Month, now.Day, hour, 0, 0, TimeSpan.Zero);
if (next <= now)
    next = next.AddDays(1);
await Task.Delay(next - now, clock, stoppingToken);`},"data-sqlite/secrets":{file:"src/ClinicReport.Api/Program.cs",start:13,end:22,code:`// Secrets as files, one per setting (e.g. ConnectionStrings__Finance), the way Docker mounts them; none outside a container.
builder.Configuration.AddKeyPerFile("/run/secrets", optional: true);

var connectionString = builder.Configuration.GetConnectionString("ClinicReport") ?? "Data Source=clinicreport.db";
builder.Services.AddDbContext<ClinicReportDbContext>(o => o.UseSqlite(connectionString));

// Keys that encrypt the sign-in cookie. In the container they live in the data volume, so a redeploy
// doesn't sign everyone out.
if (builder.Configuration["DataProtection:KeysDirectory"] is { Length: > 0 } keysDirectory)
    builder.Services.AddDataProtection().PersistKeysToFileSystem(new DirectoryInfo(keysDirectory)).SetApplicationName("ClinicReport");`}},s=[{area:"Auth",method:"POST",path:"/api/auth/login",access:"public",file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",line:47},{area:"Auth",method:"POST",path:"/api/auth/demo-login",access:"public",file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",line:109},{area:"Auth",method:"GET",path:"/api/auth/sso/start",access:"public",file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",line:127},{area:"Auth",method:"GET",path:"/api/auth/sso/signout",access:"public",file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",line:133},{area:"Auth",method:"POST",path:"/api/auth/logout",access:"public",file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",line:143},{area:"Auth",method:"GET",path:"/api/auth/me",access:"public",file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",line:151},{area:"Auth",method:"POST",path:"/api/auth/password",access:"signed-in",file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",line:173},{area:"Auth",method:"POST",path:"/api/auth/two-factor/setup",access:"signed-in",file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",line:194},{area:"Auth",method:"POST",path:"/api/auth/two-factor/enable",access:"signed-in",file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",line:206},{area:"Auth",method:"POST",path:"/api/auth/two-factor/disable",access:"signed-in",file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",line:222},{area:"Auth",method:"POST",path:"/api/auth/sessions/revoke",access:"signed-in",file:"src/ClinicReport.Api/Endpoints/AuthEndpoints.cs",line:238},{area:"Order",method:"POST",path:"/fhir",access:"clinichub.orders",file:"src/ClinicReport.Api/Endpoints/OrderEndpoints.cs",line:39},{area:"Orders",method:"GET",path:"/api/orders",access:"reports.view",file:"src/ClinicReport.Api/Endpoints/OrderEndpoints.cs",line:132},{area:"Orders",method:"POST",path:"/api/orders/{id:int}/override",access:"reports.create",file:"src/ClinicReport.Api/Endpoints/OrderEndpoints.cs",line:148},{area:"Orders",method:"POST",path:"/api/orders/{id:int}/start",access:"reports.create",file:"src/ClinicReport.Api/Endpoints/OrderEndpoints.cs",line:162},{area:"Patients",method:"GET",path:"/api/patients",access:"patients.read",file:"src/ClinicReport.Api/Endpoints/PatientEndpoints.cs",line:21},{area:"Patients",method:"GET",path:"/api/patients/{id:int}",access:"patients.read",file:"src/ClinicReport.Api/Endpoints/PatientEndpoints.cs",line:34},{area:"Patients",method:"POST",path:"/api/patients",access:"patients.manage",file:"src/ClinicReport.Api/Endpoints/PatientEndpoints.cs",line:39},{area:"Patients",method:"PUT",path:"/api/patients/{id:int}",access:"patients.manage",file:"src/ClinicReport.Api/Endpoints/PatientEndpoints.cs",line:50},{area:"Reports",method:"POST",path:"/api/reports/{id:int}/override",access:"reports.view",file:"src/ClinicReport.Api/Endpoints/ReportEndpoints.cs",line:33},{area:"Reports",method:"GET",path:"/api/reports",access:"reports.view",file:"src/ClinicReport.Api/Endpoints/ReportEndpoints.cs",line:48},{area:"Reports",method:"POST",path:"/api/reports",access:"reports.create",file:"src/ClinicReport.Api/Endpoints/ReportEndpoints.cs",line:77},{area:"Reports",method:"GET",path:"/api/reports/{id:int}",access:"reports.view",file:"src/ClinicReport.Api/Endpoints/ReportEndpoints.cs",line:105},{area:"Reports",method:"PATCH",path:"/api/reports/{id:int}/values",access:"reports.edit",file:"src/ClinicReport.Api/Endpoints/ReportEndpoints.cs",line:115},{area:"Reports",method:"POST",path:"/api/reports/{id:int}/presets/{sectionId}",access:"reports.edit",file:"src/ClinicReport.Api/Endpoints/ReportEndpoints.cs",line:118},{area:"Reports",method:"PUT",path:"/api/reports/{id:int}/header",access:"reports.edit",file:"src/ClinicReport.Api/Endpoints/ReportEndpoints.cs",line:121},{area:"Reports",method:"PUT",path:"/api/reports/{id:int}/conclusion",access:"reports.edit",file:"src/ClinicReport.Api/Endpoints/ReportEndpoints.cs",line:124},{area:"Reports",method:"POST",path:"/api/reports/{id:int}/sign",access:"reports.sign",file:"src/ClinicReport.Api/Endpoints/ReportEndpoints.cs",line:127},{area:"Reports",method:"POST",path:"/api/reports/{id:int}/addenda",access:"reports.sign",file:"src/ClinicReport.Api/Endpoints/ReportEndpoints.cs",line:131},{area:"Reports",method:"GET",path:"/api/reports/{id:int}/history",access:"reports.view",file:"src/ClinicReport.Api/Endpoints/ReportEndpoints.cs",line:135},{area:"Templates",method:"GET",path:"/api/templates",access:"signed-in",file:"src/ClinicReport.Api/Endpoints/TemplateEndpoints.cs",line:39},{area:"Templates",method:"GET",path:"/api/templates/{id:int}",access:"signed-in",file:"src/ClinicReport.Api/Endpoints/TemplateEndpoints.cs",line:48},{area:"Templates",method:"GET",path:"/api/templates/{id:int}/export",access:"signed-in",file:"src/ClinicReport.Api/Endpoints/TemplateEndpoints.cs",line:51},{area:"Templates",method:"POST",path:"/api/templates",access:"templates.design",file:"src/ClinicReport.Api/Endpoints/TemplateEndpoints.cs",line:61},{area:"Templates",method:"PUT",path:"/api/templates/{id:int}/draft",access:"templates.design",file:"src/ClinicReport.Api/Endpoints/TemplateEndpoints.cs",line:76},{area:"Templates",method:"DELETE",path:"/api/templates/{id:int}/draft",access:"templates.design",file:"src/ClinicReport.Api/Endpoints/TemplateEndpoints.cs",line:101},{area:"Templates",method:"POST",path:"/api/templates/{id:int}/publish",access:"templates.design",file:"src/ClinicReport.Api/Endpoints/TemplateEndpoints.cs",line:113},{area:"Templates",method:"PUT",path:"/api/templates/{id:int}/active",access:"templates.design",file:"src/ClinicReport.Api/Endpoints/TemplateEndpoints.cs",line:133},{area:"Templates",method:"PUT",path:"/api/templates/{id:int}/fees",access:"templates.design",file:"src/ClinicReport.Api/Endpoints/TemplateEndpoints.cs",line:144},{area:"Templates",method:"POST",path:"/api/templates/preview",access:"templates.design",file:"src/ClinicReport.Api/Endpoints/TemplateEndpoints.cs",line:158},{area:"Users",method:"GET",path:"/api/permissions",access:"users.manage",file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",line:42},{area:"Users",method:"GET",path:"/api/services",access:"users.manage",file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",line:45},{area:"Users",method:"GET",path:"/api/users",access:"users.manage",file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",line:48},{area:"Users",method:"POST",path:"/api/users",access:"users.manage",file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",line:55},{area:"Users",method:"PUT",path:"/api/users/{id:int}",access:"users.manage",file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",line:87},{area:"Users",method:"POST",path:"/api/users/{id:int}/password",access:"users.manage",file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",line:132},{area:"Users",method:"POST",path:"/api/users/{id:int}/unlock",access:"users.manage",file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",line:150},{area:"Users",method:"POST",path:"/api/users/{id:int}/two-factor/reset",access:"users.manage",file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",line:163},{area:"Users",method:"POST",path:"/api/users/{id:int}/sessions/revoke",access:"users.manage",file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",line:176},{area:"Users",method:"GET",path:"/api/roles",access:"users.manage",file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",line:189},{area:"Users",method:"POST",path:"/api/roles",access:"users.manage",file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",line:193},{area:"Users",method:"PUT",path:"/api/roles/{id:int}",access:"users.manage",file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",line:204},{area:"Users",method:"DELETE",path:"/api/roles/{id:int}",access:"users.manage",file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",line:226},{area:"Audit",method:"GET",path:"/api/audit",access:"audit.view",file:"src/ClinicReport.Api/Endpoints/UserEndpoints.cs",line:243},{area:"Program",method:"GET",path:"/api/settings",access:"public",file:"src/ClinicReport.Api/Program.cs",line:72},{area:"Program",method:"GET",path:"/healthz",access:"public",file:"src/ClinicReport.Api/Program.cs",line:83}],r=[{database:"clinicreport-{clinic}.db",provider:"sqlite",table:"Users",file:"src/ClinicReport.Api/Data/Migrations/ClinicReportDbContextModelSnapshot.cs",line:95,columns:[{name:"Id",type:"INTEGER",nullable:!1,notes:["PK","autoincrement"]},{name:"CreatedAt",type:"TEXT",nullable:!1,notes:["DateTime"]},{name:"Credentials",type:"TEXT",nullable:!0,notes:["max 64"]},{name:"DisplayName",type:"TEXT",nullable:!1,notes:["max 128"]},{name:"ExternalId",type:"TEXT",nullable:!0,notes:["max 64","unique where ExternalId IS NOT NULL"]},{name:"FailedLoginCount",type:"INTEGER",nullable:!1,notes:[]},{name:"IsActive",type:"INTEGER",nullable:!1,notes:["bool"]},{name:"LastLoginAt",type:"TEXT",nullable:!0,notes:["DateTime"]},{name:"LockoutEndUtc",type:"TEXT",nullable:!0,notes:["DateTime"]},{name:"MustChangePassword",type:"INTEGER",nullable:!1,notes:["bool"]},{name:"PasswordHash",type:"TEXT",nullable:!1,notes:[]},{name:"SecurityStamp",type:"TEXT",nullable:!1,notes:["max 64"]},{name:"Services",type:"TEXT",nullable:!0,notes:["max 2000"]},{name:"TwoFactorEnabled",type:"INTEGER",nullable:!1,notes:["bool"]},{name:"TwoFactorLastStep",type:"INTEGER",nullable:!1,notes:[]},{name:"TwoFactorSecret",type:"TEXT",nullable:!0,notes:["max 1000"]},{name:"UserName",type:"TEXT",nullable:!1,notes:["max 64","collate NOCASE","unique"]}],denies:[]},{database:"clinicreport-{clinic}.db",provider:"sqlite",table:"FinanceExports",file:"src/ClinicReport.Api/Data/Migrations/ClinicReportDbContextModelSnapshot.cs",line:109,columns:[{name:"ExternalId",type:"TEXT",nullable:!1,notes:["PK","max 200"]},{name:"SentAt",type:"TEXT",nullable:!1,notes:["DateTime"]}],denies:[]},{database:"clinicreport-{clinic}.db",provider:"sqlite",table:"Patients",file:"src/ClinicReport.Api/Data/Migrations/ClinicReportDbContextModelSnapshot.cs",line:152,columns:[{name:"Id",type:"INTEGER",nullable:!1,notes:["PK","autoincrement"]},{name:"CreatedAt",type:"TEXT",nullable:!1,notes:["DateTime"]},{name:"DateOfBirth",type:"TEXT",nullable:!1,notes:["DateOnly"]},{name:"FirstName",type:"TEXT",nullable:!1,notes:["max 64"]},{name:"LastName",type:"TEXT",nullable:!1,notes:["max 64","collate NOCASE"]},{name:"Mrn",type:"TEXT",nullable:!1,notes:["max 32","unique"]},{name:"Sex",type:"TEXT",nullable:!1,notes:["max 1"]}],denies:[]},{database:"clinicreport-{clinic}.db",provider:"sqlite",table:"Reports",file:"src/ClinicReport.Api/Data/Migrations/ClinicReportDbContextModelSnapshot.cs",line:230,columns:[{name:"Id",type:"INTEGER",nullable:!1,notes:["PK","autoincrement"]},{name:"Conclusion",type:"TEXT",nullable:!0,notes:[]},{name:"CreatedAt",type:"TEXT",nullable:!1,notes:["DateTime"]},{name:"CreatedByUserId",type:"INTEGER",nullable:!1,notes:["→ Users"]},{name:"ExamDate",type:"TEXT",nullable:!1,notes:["DateOnly"]},{name:"HeightCm",type:"REAL",nullable:!0,notes:["double"]},{name:"Indication",type:"TEXT",nullable:!0,notes:["max 500"]},{name:"PatientId",type:"INTEGER",nullable:!1,notes:["→ Patients"]},{name:"ReferringPhysician",type:"TEXT",nullable:!0,notes:["max 128"]},{name:"Revision",type:"INTEGER",nullable:!1,notes:["concurrency"]},{name:"SignedAt",type:"TEXT",nullable:!0,notes:["DateTime"]},{name:"SignedByUserId",type:"INTEGER",nullable:!0,notes:["→ Users"]},{name:"SignedSnapshotJson",type:"TEXT",nullable:!0,notes:[]},{name:"Status",type:"TEXT",nullable:!1,notes:["max 16"]},{name:"TemplateVersionId",type:"INTEGER",nullable:!1,notes:["→ TemplateVersions"]},{name:"UpdatedAt",type:"TEXT",nullable:!1,notes:["DateTime"]},{name:"ValuesJson",type:"TEXT",nullable:!1,notes:[]},{name:"WeightKg",type:"REAL",nullable:!0,notes:["double"]}],denies:[]},{database:"clinicreport-{clinic}.db",provider:"sqlite",table:"Addenda",file:"src/ClinicReport.Api/Data/Migrations/ClinicReportDbContextModelSnapshot.cs",line:259,columns:[{name:"Id",type:"INTEGER",nullable:!1,notes:["PK","autoincrement"]},{name:"CreatedAt",type:"TEXT",nullable:!1,notes:["DateTime"]},{name:"ReportId",type:"INTEGER",nullable:!1,notes:["→ Reports"]},{name:"Text",type:"TEXT",nullable:!1,notes:["max 4000"]},{name:"UserId",type:"INTEGER",nullable:!1,notes:["→ Users"]}],denies:[]},{database:"clinicreport-{clinic}.db",provider:"sqlite",table:"Changes",file:"src/ClinicReport.Api/Data/Migrations/ClinicReportDbContextModelSnapshot.cs",line:291,columns:[{name:"Id",type:"INTEGER",nullable:!1,notes:["PK","autoincrement"]},{name:"At",type:"TEXT",nullable:!1,notes:["DateTime"]},{name:"Field",type:"TEXT",nullable:!1,notes:["max 64"]},{name:"NewValueJson",type:"TEXT",nullable:!0,notes:[]},{name:"ReportId",type:"INTEGER",nullable:!1,notes:["→ Reports"]},{name:"UserId",type:"INTEGER",nullable:!1,notes:["→ Users"]}],denies:[]},{database:"clinicreport-{clinic}.db",provider:"sqlite",table:"ReportOrders",file:"src/ClinicReport.Api/Data/Migrations/ClinicReportDbContextModelSnapshot.cs",line:364,columns:[{name:"Id",type:"INTEGER",nullable:!1,notes:["PK","autoincrement"]},{name:"CancelReason",type:"TEXT",nullable:!0,notes:[]},{name:"CancelledAt",type:"TEXT",nullable:!0,notes:["DateTime"]},{name:"Confidentiality",type:"TEXT",nullable:!0,notes:[]},{name:"ExternalId",type:"TEXT",nullable:!1,notes:["max 80","unique"]},{name:"Indication",type:"TEXT",nullable:!0,notes:["max 500"]},{name:"OrderedAt",type:"TEXT",nullable:!0,notes:["DateTime"]},{name:"PatientId",type:"INTEGER",nullable:!1,notes:["→ Patients"]},{name:"Priority",type:"TEXT",nullable:!1,notes:["max 10"]},{name:"ReceivedAt",type:"TEXT",nullable:!1,notes:["DateTime"]},{name:"ReferringPhysician",type:"TEXT",nullable:!0,notes:["max 200"]},{name:"ReportId",type:"INTEGER",nullable:!0,notes:["→ Reports"]},{name:"Requisition",type:"TEXT",nullable:!0,notes:["max 80"]},{name:"Status",type:"TEXT",nullable:!1,notes:["max 20"]},{name:"TemplateId",type:"INTEGER",nullable:!1,notes:["→ Templates"]}],denies:[]},{database:"clinicreport-{clinic}.db",provider:"sqlite",table:"Templates",file:"src/ClinicReport.Api/Data/Migrations/ClinicReportDbContextModelSnapshot.cs",line:402,columns:[{name:"Id",type:"INTEGER",nullable:!1,notes:["PK","autoincrement"]},{name:"IsActive",type:"INTEGER",nullable:!1,notes:["bool"]},{name:"Key",type:"TEXT",nullable:!1,notes:["max 64","unique"]},{name:"Name",type:"TEXT",nullable:!1,notes:["max 128"]},{name:"OhipProfessionalFee",type:"TEXT",nullable:!0,notes:["decimal"]},{name:"OhipTechnicalFee",type:"TEXT",nullable:!0,notes:["decimal"]},{name:"Service",type:"TEXT",nullable:!1,notes:["max 64"]}],denies:[]},{database:"clinicreport-{clinic}.db",provider:"sqlite",table:"ResultMessages",file:"src/ClinicReport.Api/Data/Migrations/ClinicReportDbContextModelSnapshot.cs",line:445,columns:[{name:"Id",type:"INTEGER",nullable:!1,notes:["PK","autoincrement"]},{name:"Attempts",type:"INTEGER",nullable:!1,notes:[]},{name:"CreatedAt",type:"TEXT",nullable:!1,notes:["DateTime"]},{name:"LastError",type:"TEXT",nullable:!0,notes:["max 1000"]},{name:"NextAttemptAt",type:"TEXT",nullable:!0,notes:["DateTime"]},{name:"PayloadJson",type:"TEXT",nullable:!1,notes:[]},{name:"ReportOrderId",type:"INTEGER",nullable:!1,notes:["→ ReportOrders"]},{name:"SentAt",type:"TEXT",nullable:!0,notes:["DateTime"]},{name:"Status",type:"TEXT",nullable:!1,notes:["max 20"]}],denies:[]},{database:"clinicreport-{clinic}.db",provider:"sqlite",table:"Roles",file:"src/ClinicReport.Api/Data/Migrations/ClinicReportDbContextModelSnapshot.cs",line:480,columns:[{name:"Id",type:"INTEGER",nullable:!1,notes:["PK","autoincrement"]},{name:"Description",type:"TEXT",nullable:!0,notes:["max 300"]},{name:"IsSystem",type:"INTEGER",nullable:!1,notes:["bool"]},{name:"Name",type:"TEXT",nullable:!1,notes:["max 64","collate NOCASE","unique"]},{name:"Permissions",type:"TEXT",nullable:!1,notes:["max 1000"]},{name:"RequireTwoFactor",type:"INTEGER",nullable:!1,notes:["bool"]}],denies:[]},{database:"clinicreport-{clinic}.db",provider:"sqlite",table:"SecurityEvents",file:"src/ClinicReport.Api/Data/Migrations/ClinicReportDbContextModelSnapshot.cs",line:525,columns:[{name:"Id",type:"INTEGER",nullable:!1,notes:["PK","autoincrement"]},{name:"ActorUserId",type:"INTEGER",nullable:!0,notes:[]},{name:"At",type:"TEXT",nullable:!1,notes:["DateTime"]},{name:"Detail",type:"TEXT",nullable:!0,notes:["max 500"]},{name:"IpAddress",type:"TEXT",nullable:!0,notes:["max 64"]},{name:"PatientId",type:"INTEGER",nullable:!0,notes:[]},{name:"ReportId",type:"INTEGER",nullable:!0,notes:[]},{name:"TargetUserId",type:"INTEGER",nullable:!0,notes:[]},{name:"Type",type:"TEXT",nullable:!1,notes:["max 32"]}],denies:[]},{database:"clinicreport-{clinic}.db",provider:"sqlite",table:"TemplateVersions",file:"src/ClinicReport.Api/Data/Migrations/ClinicReportDbContextModelSnapshot.cs",line:563,columns:[{name:"Id",type:"INTEGER",nullable:!1,notes:["PK","autoincrement"]},{name:"CreatedAt",type:"TEXT",nullable:!1,notes:["DateTime"]},{name:"DefinitionJson",type:"TEXT",nullable:!1,notes:[]},{name:"PublishedAt",type:"TEXT",nullable:!0,notes:["DateTime"]},{name:"PublishedByUserId",type:"INTEGER",nullable:!0,notes:[]},{name:"Status",type:"TEXT",nullable:!1,notes:["max 16"]},{name:"TemplateId",type:"INTEGER",nullable:!1,notes:["→ Templates"]},{name:"Version",type:"INTEGER",nullable:!1,notes:[]}],denies:[]},{database:"clinicreport-{clinic}.db",provider:"sqlite",table:"UserRoles",file:"src/ClinicReport.Api/Data/Migrations/ClinicReportDbContextModelSnapshot.cs",line:578,columns:[{name:"UserId",type:"INTEGER",nullable:!1,notes:["PK","→ Users"]},{name:"RoleId",type:"INTEGER",nullable:!1,notes:["PK","→ Roles"]}],denies:[]}],a=[{path:"/",component:"Worklist",guards:[]},{path:"/reports/new",component:"NewReport",guards:[]},{path:"/reports/:id",component:"ReportEditor",guards:[]},{path:"/reports/:id/print",component:"PrintReport",guards:[]},{path:"/templates",component:"Templates",guards:[]},{path:"/templates/:id",component:"TemplateDesigner",guards:["templates.design"]},{path:"/users",component:"Users",guards:["users.manage"]},{path:"/audit",component:"Audit",guards:["audit.view"]},{path:"/account",component:"Account",guards:[]},{path:"*",redirect:"/",guards:[]}],o={project:e,repo:t,files:n,examples:i,endpoints:s,tables:r,routes:a};export{o as default,s as endpoints,i as examples,n as files,e as project,t as repo,a as routes,r as tables};
