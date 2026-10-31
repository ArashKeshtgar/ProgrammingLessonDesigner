const e="pharmaflow",n="PharmaFlow",t={"README.md":78,"docs/drugstore-to-ontario.md":67,"database/deploy.ps1":48,"src/PharmaFlow.Api/Program.cs":73,"src/PharmaFlow.Api/Properties/launchSettings.json":24,"src/PharmaFlow.Api/appsettings.json":7,"web/vite.config.ts":23,"tests/PharmaFlow.Tests/PharmaFlow.Tests.csproj":30,"tests/PharmaFlow.Tests/ReceptionTests.cs":343,"tests/PharmaFlow.Tests/FhirTests.cs":341,"web/src/components/RestrictedPanel.test.tsx":38,"database/010_schema.sql":264,"database/040_inventory_dispensing.sql":73,"src/PharmaFlow.Api/Data/PharmaDbContext.cs":103,"src/PharmaFlow.Api/Data/Entities.cs":293,"database/020_seed_reference.sql":93,"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs":172,"web/src/pages/BaseDefinitions.tsx":237,"database/030_seed_demo.sql":74,"src/PharmaFlow.Api/Endpoints/DrugEndpoints.cs":74,"web/src/pages/Drugs.tsx":102,"src/PharmaFlow.Api/Domain/HealthCard.cs":38,"src/PharmaFlow.Api/Endpoints/PeopleEndpoints.cs":149,"web/src/pages/People.tsx":168,"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs":275,"src/PharmaFlow.Api/Domain/Sig.cs":53,"src/PharmaFlow.Api/Domain/ReceptionChecks.cs":72,"src/PharmaFlow.Api/Endpoints/InventoryEndpoints.cs":121,"web/src/pages/Stock.tsx":95,"src/PharmaFlow.Api/Domain/Pricing.cs":39,"src/PharmaFlow.Api/Domain/FinanceFeed.cs":180,"src/PharmaFlow.Api/appsettings.Development.json":11,"src/PharmaFlow.Api/Auth/PharmaPermissions.cs":56,"src/PharmaFlow.Api/Auth/DevAuth.cs":34,"src/PharmaFlow.Api/Auth/ClinicHubSignIn.cs":209,"src/PharmaFlow.Api/Auth/ClinicHubService.cs":67,"web/src/api.ts":127,"src/PharmaFlow.Api/Endpoints/FhirEndpoints.cs":335,"database/050_electronic_prescriptions.sql":20,"database/051_prescription_mrn_and_label.sql":12,"src/PharmaFlow.Api/Auth/ConfidentialityGate.cs":37,"web/src/components/RestrictedPanel.tsx":21,"web/src/App.tsx":85,"web/src/pages/Reception.tsx":215,"web/package.json":30},a={"overview/what":{file:"README.md",start:11,end:25,code:`- **Base definitions:** dosage forms, routes, units, schedules (NAPRA I/II/III/unscheduled and the CDSA narcotic,
  controlled and targeted classes, flagged for the Narcotics Monitoring System), SIG codes with doses a day,
  ingredients with ATC codes and allergy families, interactions with severity, manufacturers, suppliers, payer plans
  (ODB, private, cash).
- **Drug catalog:** one product per DIN, with ingredient, strength, form, route, schedule, pack size, dispensing unit,
  cost, ODB Formulary and Limited Use flags, and an interchangeable group for generic substitution.
- **Patients and prescribers:** Ontario health card (check digit), allergies (by ingredient, family, or as the patient
  said), drug plan; prescribers by college (CPSO, CNO, RCDSO, OCP). Opening a patient is logged (PHIPA).
- **Reception:** a prescription (paper, fax, phone, electronic) entered drug by drug: what was written, the product,
  SIG (expanded into label text, with the days' supply worked out), quantity, refills (none for narcotics and
  controlled drugs), no-substitution. Each drug is checked against the patient's allergies, the other drugs on the
  prescription and recent medicines (interactions, duplicate therapy), and flagged when monitored, Limited Use or more
  than a year old. The pharmacist matches unmatched drugs, reviews the findings, holds or cancels.
- **Stock and dispensing:** supplier invoices received into lots; a drug ready to fill is dispensed (or refilled)
  from the lots that expire first, priced by the patient's plan, and the money goes to the group's accounting.`},"overview/map":{file:"docs/drugstore-to-ontario.md",start:27,end:39,code:"| Legacy | Tables | Ontario community pharmacy | PharmaFlow |\n|---|---|---|---|\n| Outpatient prescription | `SRequest`, `SAnswerDetail` | Prescription reception, filling, verification, dispensing, counselling | `rx.Prescription`, `rx.PrescriptionItem` (reception built; filling and dispensing next) |\n| Ward requests (inpatient) | `BRequest`, `BAnswerDetail`, `Part`, `PartDrug`, `PartStockCartex` | Hospital pharmacy only | **Not carried over**: a community pharmacy has no wards |\n| Main store, stock card | `Anbar`, `Cartex` | Inventory by lot and expiry | Next step (`inv` schema) |\n| Purchasing, returns | `Buy`, `DrugBuy`, `Seller`, `ReturnToSeller` | Orders from a wholesaler, invoices, returns | Suppliers now; purchases next, sent to the accounting as bills |\n| Catalog | `DrugDef`, `Kind`, `Type`, `Unit`, `SPS_DrugShape`, `MainGroup`, `SubGroup` | Health Canada's Drug Product Database (DIN), ingredients with ATC codes | `ref.Drug` (DIN), `ref.Ingredient`, `ref.DosageForm`, `ref.Unit`, `ref.Route` |\n| Dosing instructions | `UsageKind`, `UsageInstruction`, `BimeTaamin_DrugTimesADay` (frequency-based: \"every 8 hours – tab/cap\") | SIG codes on the prescription, label in plain English (and French) | `ref.SigCode` with doses a day; `Domain/Sig.cs` writes the label and days' supply |\n| Drug conflicts | `ConflictDrugs` (10 rows, free text) | Interaction checking at reception, by ingredient, with severity | `ref.Interaction`, `Domain/ReceptionChecks.cs` |\n| Insurance | `Bime`, `BimeDrug`, `BimeTaamin_*`, `BimeSalamat_*` | Ontario Drug Benefit (ODB) and private drug plans, adjudicated online | `ref.Plan` (co-pay, dispensing fee, mark-up as settings) |\n| Originality check (UID) | `OriginalityOfDrugs` | Narcotics Monitoring System for monitored drugs | `ref.Schedule.Monitored`; reception flags them |\n| Prescribers | `Doctor` (with a blacklist) | College registration: CPSO, CNO, RCDSO, OCP | `core.Prescriber` |\n| Cash desk | `CashPay`, `ExitOK` | Point of sale, payer split | With dispensing; sent to the accounting |"},"overview/rule":{file:"docs/drugstore-to-ontario.md",start:10,end:13,code:`> **Data rule.** The legacy database holds real patients (names, national codes, mobile numbers, birth dates on
> every outpatient and ward request). Everything here comes from schema metadata, aggregate counts and reference
> lists (dosage forms, units, dosing frequencies) read on an offline copy. No record about a patient was read, and none
> leaves that machine. PharmaFlow's demo data is synthetic.`},"run/commands":{file:"README.md",start:35,end:38,code:`./database/deploy.ps1 -Recreate                # PharmaFlow database with the demo data (-NoDemo for none)
dotnet run --project src/PharmaFlow.Api        # http://localhost:5500
cd web; npm install; npm run dev               # http://localhost:5501
dotnet test                                    # builds its own database from database/*.sql`},"run/deploy":{file:"database/deploy.ps1",start:42,end:47,code:`foreach ($s in $scripts) {
    if ($applied -contains $s.Name) { continue }
    Write-Host "Running $($s.Name)..."
    Invoke-Sql $Database $s.FullName $null
    Invoke-Sql $Database $null "INSERT dbo.SchemaMigration (Script) VALUES (N'$($s.Name)')"
}`},"run/refuse":{file:"src/PharmaFlow.Api/Program.cs",start:8,end:16,code:`// Secrets as files, one per setting (e.g. ConnectionStrings__Finance), the way Docker mounts them; none outside a container.
builder.Configuration.AddKeyPerFile("/run/secrets", optional: true);

// Staff sign in through ClinicHub when it is configured (ClinicHub:Authority and ClientSecret); otherwise there is only the
// development stub, which exists in Development and in tests and nowhere else.
var hub = builder.Configuration.GetSection("ClinicHub").Get<ClinicHubOptions>() ?? new ClinicHubOptions();
var signInThroughClinicHub = hub.SignInEnabled;
if (!signInThroughClinicHub && !builder.Environment.IsDevelopment() && builder.Environment.EnvironmentName != "Testing")
    throw new InvalidOperationException("Set ClinicHub:Authority and ClinicHub:ClientSecret: outside development staff sign in through ClinicHub.");`},"run/proxy":{file:"web/vite.config.ts",start:5,end:17,code:`// The API runs on :5500 (src/PharmaFlow.Api). Proxying keeps the browser on one origin, so the API needs no CORS policy.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5501,
    strictPort: true,
    proxy: {
      // The browser's Host is kept, so a sign-in through ClinicHub returns to :5501 (registered there) and lands on the page.
      '/api': { target: 'http://localhost:5500', changeOrigin: false },
      '/signin-oidc': { target: 'http://localhost:5500', changeOrigin: false },
      '/signout-callback-oidc': { target: 'http://localhost:5500', changeOrigin: false },
    },
  },`},"tests/build":{file:"tests/PharmaFlow.Tests/ReceptionTests.cs",start:120,end:132,code:`public async Task InitializeAsync()
{
    await using (var master = new SqlConnection(_server))
    {
        await master.OpenAsync();
        await new SqlCommand($"CREATE DATABASE [{_name}]", master).ExecuteNonQueryAsync();
    }
    await using var conn = new SqlConnection(ConnectionString);
    await conn.OpenAsync();
    foreach (var file in Directory.GetFiles(Path.Combine(AppContext.BaseDirectory, "database"), "*.sql").Where(f => Regex.IsMatch(Path.GetFileName(f), @"^\\d{3}_")).Order())
        foreach (var batch in Regex.Split(await File.ReadAllTextAsync(file), @"^\\s*GO\\s*$", RegexOptions.Multiline | RegexOptions.IgnoreCase))
            if (!string.IsNullOrWhiteSpace(batch))
                await new SqlCommand(batch, conn).ExecuteNonQueryAsync();`},"tests/sig":{file:"tests/PharmaFlow.Tests/ReceptionTests.cs",start:34,end:40,code:`public void Codes_become_label_text_and_the_days_supply_follows()
{
    var sig = Sig.Expand("1 TAB PO BID X 10 D", Codes);
    Assert.Equal("Take 1 tablet by mouth twice daily for 10 days", sig.Text);
    Assert.Equal((short)10, Sig.DaysSupply(20, sig));
    Assert.Equal((short)5, Sig.DaysSupply(30, Sig.Expand("2 tabs po tid", Codes)));
}`},"tests/perm":{file:"tests/PharmaFlow.Tests/FhirTests.cs",start:307,end:317,code:`public async Task Reception_reads_everything_and_writes_only_reception_work()
{
    Assert.Equal(HttpStatusCode.OK, await Call(HttpMethod.Get, "/api/drugs", "reception"));
    Assert.Equal(HttpStatusCode.OK, await Call(HttpMethod.Get, "/api/stock", "reception"));
    Assert.NotEqual(HttpStatusCode.Forbidden, await Call(HttpMethod.Post, "/api/prescriptions", "reception"));
    Assert.NotEqual(HttpStatusCode.Forbidden, await Call(HttpMethod.Post, "/api/patients", "reception"));
    Assert.Equal(HttpStatusCode.Forbidden, await Call(HttpMethod.Post, "/api/drugs", "reception"));
    Assert.Equal(HttpStatusCode.Forbidden, await Call(HttpMethod.Post, "/api/ref/plans", "reception"));
    Assert.Equal(HttpStatusCode.Forbidden, await Call(HttpMethod.Post, "/api/purchases", "reception"));
    Assert.Equal(HttpStatusCode.Forbidden, await Call(HttpMethod.Post, "/api/prescriptions/items/1/dispense", "reception"));
}`},"tests/vitest":{file:"web/src/components/RestrictedPanel.test.tsx",start:8,end:18,code:`it('names the label and asks for a reason of at least ten characters before it opens anything', async () => {
  const onOpen = vi.fn(async () => {})
  render(<RestrictedPanel label="V" onOpen={onOpen} onClose={() => {}} />)
  expect(screen.getByRole('heading', { name: 'Very restricted' })).toBeInTheDocument()
  const open = screen.getByRole('button', { name: 'Open this prescription' })
  expect(open).toBeDisabled()
  await userEvent.type(screen.getByLabelText(/Why do you need to open it/), '  Filling it at the counter now  ')
  expect(open).toBeEnabled()
  await userEvent.click(open)
  expect(onOpen).toHaveBeenCalledWith('Filling it at the counter now')   // trimmed
})`},"schema/heads":{file:"database/010_schema.sql",start:1,end:7,code:`-- PharmaFlow: a community pharmacy for an Ontario clinic group, the Ontario version of the legacy "Drugstore"
-- hospital pharmacy (see docs/drugstore-to-ontario.md). Schemas:
--   ref   base definitions: dosage forms, routes, units, NAPRA / controlled-substance schedules, SIG codes,
--         ingredients and their interactions, manufacturers, suppliers, payer plans; the drug catalog (DIN)
--   core  patients (with allergies) and prescribers
--   rx    prescriptions as received (reception), one row per drug ordered
--   audit who opened which patient (PHIPA)`},"schema/context":{file:"src/PharmaFlow.Api/Data/PharmaDbContext.cs",start:5,end:6,code:`/// <summary>Maps the tables built by database/*.sql. No migrations: the SQL scripts own the schema.</summary>
public class PharmaDbContext(DbContextOptions<PharmaDbContext> options) : DbContext(options)`},"schema/sequence":{file:"src/PharmaFlow.Api/Data/PharmaDbContext.cs",start:101,end:102,code:`public async Task<int> NextRxNumberAsync() =>
    (await Database.SqlQueryRaw<int>("SELECT NEXT VALUE FOR rx.RxNumber AS Value").ToListAsync()).Single();`},"refdefs/schedules":{file:"database/020_seed_reference.sql",start:25,end:32,code:`INSERT ref.Schedule (Code, Name, RequiresPrescription, Monitored, Description) VALUES
('I',  N'Schedule I (prescription)',             1, 0, N'NAPRA Schedule I: dispensed only on a prescription.'),
('II', N'Schedule II (behind the counter)',      0, 0, N'Sold by a pharmacist, no prescription; kept where the public can''t reach it.'),
('III',N'Schedule III (pharmacy only)',          0, 0, N'Sold in the pharmacy''s self-selection area.'),
('U',  N'Unscheduled',                           0, 0, N'Sold anywhere.'),
('N',  N'Narcotic',                              1, 1, N'Controlled Drugs and Substances Act narcotic. Recorded in the Narcotics Monitoring System.'),
('C',  N'Controlled drug',                       1, 1, N'CDSA controlled drug (e.g. stimulants). Recorded in the Narcotics Monitoring System.'),
('T',  N'Targeted substance (benzodiazepine)',   1, 1, N'CDSA targeted substance. Recorded in the Narcotics Monitoring System.');`},"refdefs/interaction":{file:"database/010_schema.sql",start:72,end:79,code:`CREATE TABLE ref.Interaction (
    IngredientAId int NOT NULL CONSTRAINT FK_Interaction_A REFERENCES ref.Ingredient(IngredientId),
    IngredientBId int NOT NULL CONSTRAINT FK_Interaction_B REFERENCES ref.Ingredient(IngredientId),
    Severity      varchar(10)   NOT NULL CONSTRAINT CK_Interaction_Severity CHECK (Severity IN ('Major','Moderate','Minor')),
    Description   nvarchar(400) NOT NULL,
    CONSTRAINT PK_Interaction PRIMARY KEY (IngredientAId, IngredientBId),
    CONSTRAINT CK_Interaction_Order CHECK (IngredientAId < IngredientBId)
);`},"refdefs/normalise":{file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",start:74,end:85,code:`api.MapPut("/interactions", async (InteractionBody b, PharmaDbContext db) =>
{
    if (b.IngredientAId == b.IngredientBId) return Field("ingredientBId", "Two different ingredients.");
    if (b.Severity is not ("Major" or "Moderate" or "Minor")) return Field("severity", "Major, Moderate or Minor.");
    if (string.IsNullOrWhiteSpace(b.Description) || b.Description.Length > 400) return Field("description", "What happens, at most 400 characters.");
    var (lo, hi) = b.IngredientAId < b.IngredientBId ? (b.IngredientAId, b.IngredientBId) : (b.IngredientBId, b.IngredientAId);
    if (await db.Ingredients.CountAsync(i => i.IngredientId == lo || i.IngredientId == hi) != 2) return Field("ingredientAId", "Unknown ingredient.");
    var x = await db.Interactions.FindAsync(lo, hi) ?? db.Interactions.Add(new Interaction { IngredientAId = lo, IngredientBId = hi }).Entity;
    (x.Severity, x.Description) = (b.Severity, b.Description.Trim());
    await db.SaveChangesAsync();
    return Results.NoContent();
});`},"drugs/drug":{file:"database/010_schema.sql",start:115,end:140,code:`CREATE TABLE ref.Drug (
    DrugId            int IDENTITY(1,1) CONSTRAINT PK_Drug PRIMARY KEY,
    Din               char(8)        NOT NULL CONSTRAINT UQ_Drug_Din UNIQUE CONSTRAINT CK_Drug_Din CHECK (Din NOT LIKE '%[^0-9]%'),
    BrandName         nvarchar(100)  NOT NULL,
    IngredientId      int            NOT NULL CONSTRAINT FK_Drug_Ingredient REFERENCES ref.Ingredient(IngredientId),
    Strength          decimal(10,3)  NULL,
    StrengthUnit      varchar(10)    NULL CONSTRAINT FK_Drug_StrengthUnit REFERENCES ref.Unit(Code),
    FormCode          varchar(10)    NOT NULL CONSTRAINT FK_Drug_Form REFERENCES ref.DosageForm(Code),
    RouteCode         varchar(10)    NOT NULL CONSTRAINT FK_Drug_Route REFERENCES ref.Route(Code),
    ScheduleCode      varchar(4)     NOT NULL CONSTRAINT FK_Drug_Schedule REFERENCES ref.Schedule(Code),
    ManufacturerId    int            NULL CONSTRAINT FK_Drug_Manufacturer REFERENCES ref.Manufacturer(ManufacturerId),
    PackSize          int            NOT NULL CONSTRAINT DF_Drug_Pack DEFAULT 100 CONSTRAINT CK_Drug_Pack CHECK (PackSize > 0),
    DispensingUnit    varchar(10)    NOT NULL CONSTRAINT FK_Drug_DispensingUnit REFERENCES ref.Unit(Code),
    -- Acquisition cost per dispensing unit (tablet, mL), what the pharmacy pays.
    UnitCost          decimal(10,4)  NOT NULL CONSTRAINT DF_Drug_Cost DEFAULT 0 CONSTRAINT CK_Drug_Cost CHECK (UnitCost >= 0),
    -- Listed on the Ontario Drug Benefit Formulary; LU = a Limited Use code the prescriber must give.
    OdbBenefit        bit            NOT NULL CONSTRAINT DF_Drug_Odb DEFAULT 0,
    OdbLimitedUse     bit            NOT NULL CONSTRAINT DF_Drug_LU DEFAULT 0,
    -- Products in the same group are interchangeable (generic substitution) unless the prescriber wrote "no substitution".
    InterchangeGroup  varchar(20)    NULL,
    IsActive          bit            NOT NULL CONSTRAINT DF_Drug_Active DEFAULT 1,
    -- Demo catalog: made-up DINs and costs, never to be dispensed from.
    IsDemo            bit            NOT NULL CONSTRAINT DF_Drug_Demo DEFAULT 0,
    CreatedAt         datetime2(0)   NOT NULL CONSTRAINT DF_Drug_Created DEFAULT SYSUTCDATETIME(),
    UpdatedAt         datetime2(0)   NOT NULL CONSTRAINT DF_Drug_Updated DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Drug_Strength CHECK ((Strength IS NULL AND StrengthUnit IS NULL) OR (Strength > 0 AND StrengthUnit IS NOT NULL))`},"drugs/save":{file:"src/PharmaFlow.Api/Endpoints/DrugEndpoints.cs",start:45,end:62,code:`var din = (b.Din ?? "").Trim();
var errors = new Dictionary<string, string[]>();
void Check(bool bad, string field, string msg) { if (bad && !errors.ContainsKey(field)) errors[field] = [msg]; }
Check(din.Length != 8 || !din.All(char.IsAsciiDigit), "din", "A DIN is 8 digits.");
Check(await db.Drugs.AnyAsync(d => d.Din == din && d.DrugId != id), "din", "This DIN is already in the catalog.");
Check(string.IsNullOrWhiteSpace(b.BrandName) || b.BrandName.Length > 100, "brandName", "The product name, at most 100 characters.");
Check(!await db.Ingredients.AnyAsync(i => i.IngredientId == b.IngredientId), "ingredientId", "Choose the ingredient.");
Check((b.Strength is null) != (Clean(b.StrengthUnit) is null) || b.Strength <= 0, "strength", "A strength with its unit, or neither.");
Check(Clean(b.StrengthUnit) is { } su && !await db.Units.AnyAsync(u => u.Code == su && u.Kind == "Strength"), "strengthUnit", "Unknown strength unit.");
Check(!await db.DosageForms.AnyAsync(f => f.Code == b.FormCode), "formCode", "Choose the dosage form.");
Check(!await db.Routes.AnyAsync(r => r.Code == b.RouteCode), "routeCode", "Choose the route.");
Check(!await db.Schedules.AnyAsync(s => s.Code == b.ScheduleCode), "scheduleCode", "Choose the schedule.");
Check(b.ManufacturerId is { } m && !await db.Manufacturers.AnyAsync(x => x.ManufacturerId == m), "manufacturerId", "Unknown manufacturer.");
Check(!await db.Units.AnyAsync(u => u.Code == b.DispensingUnit && u.Kind == "Dispensing"), "dispensingUnit", "Choose the dispensing unit.");
Check(b.PackSize <= 0, "packSize", "At least 1.");
Check(b.UnitCost < 0 || decimal.Round(b.UnitCost, 4) != b.UnitCost, "unitCost", "A cost per unit, up to 4 decimals.");
Check(b.InterchangeGroup?.Length > 20, "interchangeGroup", "At most 20 characters.");
if (errors.Count > 0) return Results.ValidationProblem(errors);`},"patients/luhn":{file:"src/PharmaFlow.Api/Domain/HealthCard.cs",start:16,end:33,code:`public static bool IsValidNumber(string? number)
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
    return sum % 10 == 0;
}`},"patients/allergy":{file:"database/010_schema.sql",start:172,end:182,code:`CREATE TABLE core.PatientAllergy (
    AllergyId     int IDENTITY(1,1) CONSTRAINT PK_PatientAllergy PRIMARY KEY,
    PatientId     int            NOT NULL CONSTRAINT FK_PatientAllergy_Patient REFERENCES core.Patient(PatientId),
    IngredientId  int            NULL CONSTRAINT FK_PatientAllergy_Ingredient REFERENCES ref.Ingredient(IngredientId),
    AllergyClass  nvarchar(40)   NULL,
    Description   nvarchar(120)  NULL,
    Reaction      nvarchar(120)  NULL,
    Severity      varchar(10)    NOT NULL CONSTRAINT DF_PatientAllergy_Sev DEFAULT 'Unknown' CONSTRAINT CK_PatientAllergy_Sev CHECK (Severity IN ('Mild','Moderate','Severe','Unknown')),
    RecordedAt    datetime2(0)   NOT NULL CONSTRAINT DF_PatientAllergy_Recorded DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_PatientAllergy_What CHECK (IngredientId IS NOT NULL OR AllergyClass IS NOT NULL OR Description IS NOT NULL)
);`},"audit/table":{file:"database/010_schema.sql",start:255,end:262,code:`CREATE TABLE audit.AccessLog (
    AuditId     bigint IDENTITY(1,1) CONSTRAINT PK_AccessLog PRIMARY KEY,
    OccurredAt  datetime2(3)  NOT NULL CONSTRAINT DF_AccessLog_At DEFAULT SYSUTCDATETIME(),
    UserName    nvarchar(100) NOT NULL,
    Action      varchar(10)   NOT NULL CONSTRAINT CK_AccessLog_Action CHECK (Action IN ('View','Create','Update','Print')),
    PatientId   int           NULL,
    Context     nvarchar(120) NOT NULL
);`},"audit/helper":{file:"src/PharmaFlow.Api/Endpoints/PeopleEndpoints.cs",start:147,end:148,code:`public static void Audit(PharmaDbContext db, ClaimsPrincipal user, TimeProvider clock, string action, int? patientId, string context) =>
    db.AccessLog.Add(new AccessLog { OccurredAt = clock.GetUtcNow().UtcDateTime, UserName = user.UserName(), Action = action, PatientId = patientId, Context = context });`},"audit/override":{file:"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs",start:37,end:40,code:`var until = gate.Open(user, id);
var why = body.Reason!.Trim();
PeopleEndpoints.Audit(db, user, clock, "Update", rx.PatientId, $"RESTRICTED OVERRIDE ({rx.Confidentiality}) prescription {rx.RxNumber}: {(why.Length > 200 ? why[..200] : why)}");
await db.SaveChangesAsync();`},"receive/narcotic":{file:"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs",start:108,end:110,code:`// Narcotics and controlled drugs may not be refilled (part-fills are written as such).
Check(it.DrugId is { } nd && it.RefillsAuthorized > 0 && await db.Drugs.AnyAsync(x => x.DrugId == nd && (x.ScheduleCode == "N" || x.ScheduleCode == "C")),
    $"items[{i}].refillsAuthorized", "A narcotic or controlled drug can't have refills.");`},"receive/review":{file:"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs",start:151,end:163,code:`// The pharmacist has looked at what the checks found: the drug can be filled.
api.MapPost("/items/{itemId:int}/review", async (int itemId, ClaimsPrincipal user, PharmaDbContext db, TimeProvider clock) =>
{
    var (rx, item) = await ItemAsync(db, itemId);
    if (item is null) return Results.NotFound();
    if (item.DrugId is null) return Results.Problem("Choose the product first.", statusCode: 409);
    if (item.Status is not (ItemStatus.Received or ItemStatus.OnHold)) return Results.Problem("This drug is past reception.", statusCode: 409);
    item.WarningsReviewedBy = user.UserName();
    item.WarningsReviewedAt = clock.GetUtcNow().UtcDateTime;
    item.Status = ItemStatus.ReadyToFill;
    await Settle(db, rx!, clock);
    return Results.Ok(await Detail(db, rx!.PrescriptionId));
});`},"receive/settle":{file:"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs",start:260,end:271,code:`internal static async Task Settle(PharmaDbContext db, Prescription rx, TimeProvider clock)
{
    await db.SaveChangesAsync();
    var statuses = await db.PrescriptionItems.Where(i => i.PrescriptionId == rx.PrescriptionId).Select(i => i.Status).ToListAsync();
    rx.Status = statuses.All(s => s == ItemStatus.Cancelled) ? RxStatus.Cancelled
        : statuses.Where(s => s != ItemStatus.Cancelled).All(s => s == ItemStatus.Dispensed) ? RxStatus.Completed
        : statuses.Any(s => s == ItemStatus.OnHold) && statuses.All(s => s is ItemStatus.OnHold or ItemStatus.Cancelled) ? RxStatus.OnHold
        : statuses.Any(s => s is ItemStatus.ReadyToFill or ItemStatus.Filled or ItemStatus.Verified or ItemStatus.Dispensed) ? RxStatus.InProgress
        : RxStatus.Received;
    rx.UpdatedAt = clock.GetUtcNow().UtcDateTime;
    await db.SaveChangesAsync();
}`},"sig/expand":{file:"src/PharmaFlow.Api/Domain/Sig.cs",start:15,end:42,code:`public static Expanded Expand(string sig, IReadOnlyDictionary<string, (string Expansion, decimal? DosesPerDay)> codes)
{
    var words = Tokens().Matches(sig.Trim()).Select(m => m.Value).ToList();
    var output = new List<string>();
    decimal? perDay = null, dose = null;
    foreach (var w in words)
    {
        var key = w.ToUpperInvariant();
        if (codes.TryGetValue(key, out var code))
        {
            output.Add(code.Expansion);
            perDay ??= code.DosesPerDay;
        }
        else
        {
            if (dose is null && decimal.TryParse(w, NumberStyles.Number, CultureInfo.InvariantCulture, out var n))
                dose = n;
            output.Add(w.ToLowerInvariant() == w || char.IsDigit(w[0]) ? w : w.ToLowerInvariant());
        }
    }
    var text = string.Join(' ', output);
    // A label starts with a verb: "Take" for anything swallowed or counted, unless the prescriber wrote one.
    var verbs = new[] { "apply", "instill", "inhale", "insert", "use", "take", "inject", "chew", "dissolve" };
    if (text.Length > 0 && !verbs.Any(v => text.StartsWith(v, StringComparison.OrdinalIgnoreCase)))
        text = "Take " + text;
    else if (text.Length > 0)
        text = char.ToUpperInvariant(text[0]) + text[1..];
    return new Expanded(text, perDay, dose);`},"sig/days":{file:"src/PharmaFlow.Api/Domain/Sig.cs",start:45,end:49,code:`/// <summary>Days a quantity lasts: quantity ÷ (dose × doses a day), when both are known.</summary>
public static short? DaysSupply(decimal quantity, Expanded sig) =>
    sig is { DosesPerDay: > 0, DoseQuantity: > 0 }
        ? (short)Math.Clamp(Math.Floor(quantity / (sig.DoseQuantity.Value * sig.DosesPerDay.Value)), 1, 365)
        : null;`},"sig/prn":{file:"tests/PharmaFlow.Tests/ReceptionTests.cs",start:43,end:49,code:`public void Unknown_words_are_kept_and_as_needed_has_no_days_supply()
{
    var sig = Sig.Expand("2 PUFFS INH Q4H PRN for wheeze", Codes);
    Assert.Equal("Take 2 puffs by inhalation every 4 hours as needed for wheeze", sig.Text);
    Assert.Null(Sig.DaysSupply(1, Sig.Expand("apply PRN", Codes)));
    Assert.StartsWith("Apply", Sig.Expand("apply PRN", Codes).Text);
}`},"checks/allergy":{file:"src/PharmaFlow.Api/Domain/ReceptionChecks.cs",start:41,end:49,code:`foreach (var a in allergies)
{
    if (a.IngredientId == drug.IngredientId)
        warnings.Add(new(WarningKinds.Allergy, "Major", $"Allergic to {drug.Ingredient}{Reaction(a)}."));
    else if (a.AllergyClass is not null && string.Equals(a.AllergyClass, drug.AllergyClass, StringComparison.OrdinalIgnoreCase))
        warnings.Add(new(WarningKinds.Allergy, "Major", $"Allergic to {a.AllergyClass}{Reaction(a)}; {drug.Ingredient} is one."));
    else if (a.Description is { Length: > 0 } d && (drug.Ingredient.Contains(d, StringComparison.OrdinalIgnoreCase) || d.Contains(drug.Ingredient, StringComparison.OrdinalIgnoreCase)))
        warnings.Add(new(WarningKinds.Allergy, "Major", $"Allergy recorded as \\"{d}\\"{Reaction(a)}."));
}`},"checks/against":{file:"src/PharmaFlow.Api/Domain/ReceptionChecks.cs",start:51,end:59,code:`var against = others.Where(o => o.DrugId != drug.DrugId).Select(o => (o.IngredientId, Label: $"{o.Name} (this prescription)"))
    .Concat(taking.Select(t => (t.IngredientId, Label: $"{t.Name} (Rx {t.RxNumber})"))).ToList();
foreach (var (ingredientId, label) in against)
{
    if (ingredientId == drug.IngredientId)
        warnings.Add(new(WarningKinds.Duplicate, "Moderate", $"{drug.Ingredient} is also in {label}."));
    var (lo, hi) = drug.IngredientId < ingredientId ? (drug.IngredientId, ingredientId) : (ingredientId, drug.IngredientId);
    if (interactions.FirstOrDefault(i => i.IngredientAId == lo && i.IngredientBId == hi) is { } x)
        warnings.Add(new(WarningKinds.Interaction, x.Severity, $"With {label}: {x.Description}"));`},"checks/taking":{file:"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs",start:195,end:201,code:`// What the patient takes: drugs on their prescriptions of the last 120 days still open or with refills left.
var since = today.AddDays(-120).ToDateTime(TimeOnly.MinValue);
var taking = await db.PrescriptionItems.AsNoTracking()
    .Where(i => i.DrugId != null && i.Status != ItemStatus.Cancelled && i.PrescriptionId != exceptPrescriptionId
        && db.Prescriptions.Any(r => r.PrescriptionId == i.PrescriptionId && r.PatientId == patientId && r.ReceivedAt >= since))
    .Select(i => new ReceptionChecks.Current(i.Drug!.IngredientId, i.Drug.BrandName, db.Prescriptions.Where(r => r.PrescriptionId == i.PrescriptionId).Select(r => r.RxNumber).First()))
    .ToListAsync();`},"purchases/purchase":{file:"database/040_inventory_dispensing.sql",start:11,end:22,code:`CREATE TABLE inv.Purchase (
    PurchaseId     int IDENTITY(1,1) CONSTRAINT PK_Purchase PRIMARY KEY,
    SupplierId     int            NOT NULL CONSTRAINT FK_Purchase_Supplier REFERENCES ref.Supplier(SupplierId),
    InvoiceNumber  varchar(40)    NOT NULL,
    InvoiceDate    date           NOT NULL,
    ReceivedAt     datetime2(0)   NOT NULL,
    -- Drugs are zero-rated; other supplies on the same invoice carry HST.
    DrugsAmount    decimal(12,2)  NOT NULL CONSTRAINT CK_Purchase_Drugs CHECK (DrugsAmount >= 0),
    SuppliesAmount decimal(12,2)  NOT NULL CONSTRAINT DF_Purchase_Supplies DEFAULT 0 CONSTRAINT CK_Purchase_Supplies CHECK (SuppliesAmount >= 0),
    SuppliesHst    decimal(12,2)  NOT NULL CONSTRAINT DF_Purchase_Hst DEFAULT 0 CONSTRAINT CK_Purchase_Hst CHECK (SuppliesHst >= 0),
    ReceivedBy     nvarchar(100)  NOT NULL,
    CONSTRAINT UQ_Purchase_Invoice UNIQUE (SupplierId, InvoiceNumber)`},"purchases/rules":{file:"src/PharmaFlow.Api/Endpoints/InventoryEndpoints.cs",start:35,end:37,code:`Check(await db.Purchases.AnyAsync(p => p.SupplierId == b.SupplierId && p.InvoiceNumber == b.InvoiceNumber.Trim()), "invoiceNumber", "This invoice was already received.");
Check(b.InvoiceDate > today, "invoiceDate", "Not in the future.");
Check(b.SuppliesAmount < 0 || b.SuppliesHst < 0 || b.SuppliesHst > decimal.Round(b.SuppliesAmount * 0.13m, 2) + 0.01m, "suppliesHst", "HST is at most 13 % of the supplies.");`},"dispense/lots":{file:"src/PharmaFlow.Api/Endpoints/InventoryEndpoints.cs",start:85,end:98,code:`var lots = await db.StockLots.Where(l => l.DrugId == item.DrugId && l.QuantityOnHand > 0 && l.ExpiryDate > today).OrderBy(l => l.ExpiryDate).ThenBy(l => l.LotId).ToListAsync();
if (lots.Sum(l => l.QuantityOnHand) < quantity)
    return Results.Problem($"Not enough in stock: {lots.Sum(l => l.QuantityOnHand)} on hand that hasn't expired.", statusCode: 409);

var used = new List<DispenseLot>();
var left = quantity;
foreach (var lot in lots)
{
    if (left == 0) break;
    var take = Math.Min(left, lot.QuantityOnHand);
    lot.QuantityOnHand -= take;
    used.Add(new DispenseLot { LotId = lot.LotId, Quantity = take, UnitCost = lot.UnitCost });
    left -= take;
}`},"dispense/refill":{file:"src/PharmaFlow.Api/Endpoints/InventoryEndpoints.cs",start:79,end:81,code:`var refill = item.Status == ItemStatus.Dispensed;
if (!(item.Status == ItemStatus.ReadyToFill || (refill && item.RefillsRemaining > 0)))
    return Results.Problem(refill ? "No refills left: the prescriber must authorize more." : "Only a drug that is ready to fill can be dispensed.", statusCode: 409);`},"dispense/price":{file:"database/040_inventory_dispensing.sql",start:56,end:57,code:`CONSTRAINT CK_Dispense_Price CHECK (Total = DrugCost + Markup + DispensingFee AND PlanPays + PatientPays = Total AND PlanPays >= 0 AND PatientPays >= 0),
CONSTRAINT CK_Dispense_Paid CHECK (PatientPays = 0 OR PaymentMethod IS NOT NULL)`},"pricing/for":{file:"src/PharmaFlow.Api/Domain/Pricing.cs",start:14,end:24,code:`public static readonly PlanTerms Cash = new(0, 100, 11.99m, 10);

public static Price For(decimal drugCost, PlanTerms? plan)
{
    var terms = plan ?? Cash;
    var cost = Round(drugCost);
    var markup = Round(cost * terms.MarkupPercent / 100m);
    var fee = Round(terms.DispensingFee);
    var total = cost + markup + fee;
    var patient = Math.Min(total, Round(terms.CopayAmount + total * terms.CopayPercent / 100m));
    return new Price(cost, markup, fee, total, total - patient, patient);`},"pricing/split":{file:"src/PharmaFlow.Api/Domain/Pricing.cs",start:31,end:36,code:`public static (decimal PlanDrug, decimal PlanFee, decimal PatientDrug, decimal PatientFee) Split(Price p)
{
    var patientFee = Math.Min(p.PatientPays, p.DispensingFee);
    var patientDrug = p.PatientPays - patientFee;
    return (p.DrugCost + p.Markup - patientDrug, p.DispensingFee - patientFee, patientDrug, patientFee);
}`},"pricing/test":{file:"tests/PharmaFlow.Tests/ReceptionTests.cs",start:261,end:268,code:`public void Odb_pays_all_but_the_copay_which_comes_out_of_the_fee_first()
{
    var p = Pricing.For(12.345m, new Pricing.PlanTerms(2.00m, 0, 8.83m, 8));
    Assert.Equal((12.35m, 0.99m, 8.83m, 22.17m), (p.DrugCost, p.Markup, p.DispensingFee, p.Total));
    Assert.Equal((20.17m, 2.00m), (p.PlanPays, p.PatientPays));
    var s = Pricing.Split(p);
    Assert.Equal((13.34m, 6.83m, 0m, 2.00m), s);
}`},"finance/dispense":{file:"src/PharmaFlow.Api/Domain/FinanceFeed.cs",start:130,end:147,code:`if (d.PlanPays > 0 && d.Plan is { } plan)
{
    var party = plan.PayerType == "ODB" ? Party("ODB", "ODB") : Party(plan.PayerType == "Insurer" ? "Insurer" : "Other", plan.Code, plan.Name);
    docs.Add(Doc(key, $"dispense:{d.DispenseId}:plan", "Invoice", date, $"{reference}-P", party,
        Lines(split.PlanDrug, split.PlanFee), memo: $"Plan share, Rx {d.Rx}"));
}
if (d.PatientPays > 0)
{
    docs.Add(Doc(key, $"dispense:{d.DispenseId}:patient", "Invoice", date, reference, Party("Patient", "PATIENT"),
        Lines(split.PatientDrug, split.PatientFee), memo: $"Patient share, Rx {d.Rx}"));
    if (d.PaymentMethod is not (null or "Account"))
        docs.Add(Doc(key, $"dispense:{d.DispenseId}:paid", "Receipt", date, reference, Party("Patient", "PATIENT"),
            [Line(null, d.PatientPays, null, appliesTo: reference)], method: d.PaymentMethod, memo: $"Paid at pick-up, Rx {d.Rx}"));
}
var cost = decimal.Round(d.Cost, 2, MidpointRounding.AwayFromZero);
if (cost > 0)
    docs.Add(Doc(key, $"dispense:{d.DispenseId}:cost", "Usage", date, reference, null,
        [new JsonObject { ["category"] = "Pharmacy.COGS", ["amount"] = cost, ["offsetCategory"] = "Inventory.Drugs", ["department"] = "Pharmacy" }], memo: $"Cost of drugs, Rx {d.Rx}"));`},"finance/sent":{file:"src/PharmaFlow.Api/Domain/FinanceFeed.cs",start:47,end:48,code:`var sent = (await db.FinanceExports.AsNoTracking().Select(x => x.ExternalId).ToListAsync(ct)).ToHashSet();
var pending = (await BuildAsync(db, options.CurrentValue.SourceKey, ct)).Where(d => !sent.Contains((string)d["externalId"]!)).ToList();`},"finance/worker":{file:"src/PharmaFlow.Api/Domain/FinanceFeed.cs",start:173,end:177,code:`while (!stoppingToken.IsCancellationRequested && feed.Connected)
{
    try { await feed.SendAsync(stoppingToken); }
    catch (Exception ex) when (ex is not OperationCanceledException) { logger.LogError(ex, "Sending financial documents failed; trying again shortly."); }
    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);`},"permissions/policies":{file:"src/PharmaFlow.Api/Auth/PharmaPermissions.cs",start:38,end:43,code:`public static AuthorizationBuilder AddPharmaPolicies(this AuthorizationBuilder auth) => auth
    .AddPolicy(Any, p => p.RequireAuthenticatedUser().RequireClaim(PharmaPermissions.ClaimType, PharmaPermissions.All))
    .AddPolicy(Reception, p => p.RequireAuthenticatedUser().RequireClaim(PharmaPermissions.ClaimType, PharmaPermissions.Reception, PharmaPermissions.Admin))
    .AddPolicy(Dispense, p => p.RequireAuthenticatedUser().RequireClaim(PharmaPermissions.ClaimType, PharmaPermissions.Dispense, PharmaPermissions.Admin))
    .AddPolicy(Stock, p => p.RequireAuthenticatedUser().RequireClaim(PharmaPermissions.ClaimType, PharmaPermissions.Stock, PharmaPermissions.Admin))
    .AddPolicy(Admin, p => p.RequireAuthenticatedUser().RequireClaim(PharmaPermissions.ClaimType, PharmaPermissions.Admin));`},"permissions/writes":{file:"src/PharmaFlow.Api/Auth/PharmaPermissions.cs",start:46,end:53,code:`public static RouteGroupBuilder RequireForWrites(this RouteGroupBuilder group, string policy) => group.AddEndpointFilter(async (ctx, next) =>
{
    var method = ctx.HttpContext.Request.Method;
    if (HttpMethods.IsGet(method) || HttpMethods.IsHead(method) || HttpMethods.IsOptions(method))
        return await next(ctx);
    var result = await ctx.HttpContext.RequestServices.GetRequiredService<IAuthorizationService>().AuthorizeAsync(ctx.HttpContext.User, policy);
    return result.Succeeded ? await next(ctx) : Results.Problem("Your role at the clinic does not allow this in PharmaFlow.", statusCode: StatusCodes.Status403Forbidden);
});`},"permissions/group":{file:"src/PharmaFlow.Api/Endpoints/PeopleEndpoints.cs",start:20,end:20,code:'var api = app.MapGroup("/api").RequireAuthorization(Policies.Any).RequireForWrites(Policies.Reception);'},"permissions/dev":{file:"src/PharmaFlow.Api/Auth/DevAuth.cs",start:21,end:24,code:`// Everything, unless X-Dev-Permissions narrows it ("reception stock"; "none" for nothing): to try a role without ClinicHub.
var granted = Request.Headers.TryGetValue(PermissionsHeader, out var asked)
    ? PharmaPermissions.All.Where(p => asked.ToString().Split(' ', StringSplitOptions.RemoveEmptyEntries).Contains(p))
    : PharmaPermissions.All;`},"signin/local":{file:"src/PharmaFlow.Api/Auth/ClinicHubSignIn.cs",start:94,end:95,code:`var permissions = hub.FindAll("permission").Select(c => c.Value).Where(PharmaPermissions.All.Contains).Distinct().ToList();
allowed = ClinicHubService.IsValidSlug(slug) && permissions.Count > 0;`},"signin/recheck":{file:"src/PharmaFlow.Api/Auth/ClinicHubSignIn.cs",start:127,end:141,code:`if (DateTime.UtcNow - checkedAt >= TimeSpan.FromMinutes(options.RecheckMinutes))
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
}`},"signin/csrf":{file:"src/PharmaFlow.Api/Auth/ClinicHubSignIn.cs",start:198,end:208,code:`public static IApplicationBuilder UseCsrfHeaderCheck(this IApplicationBuilder app) => app.Use(async (ctx, next) =>
{
    var unsafeMethod = !(HttpMethods.IsGet(ctx.Request.Method) || HttpMethods.IsHead(ctx.Request.Method) || HttpMethods.IsOptions(ctx.Request.Method));
    if (unsafeMethod && ctx.Request.Path.StartsWithSegments("/api") && !ctx.Request.Headers.ContainsKey(CsrfHeader))
    {
        ctx.Response.StatusCode = StatusCodes.Status400BadRequest;
        await ctx.Response.WriteAsJsonAsync(new { title = $"Missing {CsrfHeader} header." });
        return;
    }
    await next();
});`},"signin/header":{file:"web/src/api.ts",start:13,end:14,code:`// X-PharmaFlow: with sign-in through ClinicHub the session is a cookie, so the API wants proof the call comes from this app.
headers: { 'X-PharmaFlow': '1', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },`},"fhir/policy":{file:"src/PharmaFlow.Api/Auth/ClinicHubService.cs",start:58,end:61,code:`auth.Services.AddAuthorizationBuilder().AddPolicy(PrescriptionsPolicy, p => p
    .AddAuthenticationSchemes(Scheme).RequireAuthenticatedUser()
    .RequireClaim("scope", "prescriptions")
    .RequireAssertion(ctx => IsValidSlug(ctx.User.FindFirstValue(ClinicClaim))));`},"fhir/own":{file:"src/PharmaFlow.Api/Endpoints/FhirEndpoints.cs",start:88,end:90,code:`var own = $"urn:clinichub:{slug}:";
if (!groupSystem.StartsWith(own, StringComparison.Ordinal))
    throw new Invalid("The identifiers do not belong to the clinic of the token.", StatusCodes.Status403Forbidden, "forbidden");`},"fhir/patient":{file:"src/PharmaFlow.Api/Endpoints/FhirEndpoints.cs",start:145,end:147,code:`// The patient: the health card, or else name and birth date; new to the pharmacy, a record is made.
var patient = hcn is not null ? await db.Patients.SingleOrDefaultAsync(p => p.HealthCardNumber == hcn, ct) : null;
patient ??= await db.Patients.FirstOrDefaultAsync(p => p.LastName == family && p.FirstName == given && p.DateOfBirth == birth, ct);`},"fhir/resend":{file:"src/PharmaFlow.Api/Endpoints/FhirEndpoints.cs",start:170,end:173,code:`var externalGroup = $"{groupSystem}|{groupValue}";
var rx = await db.Prescriptions.Include(r => r.Items).SingleOrDefaultAsync(r => r.ExternalId == externalGroup, ct);
var known = rx?.Items.ToDictionary(i => i.ExternalId ?? "") ?? [];
var fresh = lines.Where(l => !known.ContainsKey(l.ExternalId)).ToList();`},"withdraw/late":{file:"src/PharmaFlow.Api/Endpoints/FhirEndpoints.cs",start:239,end:241,code:`// Dispensing has begun for any one: nothing is changed.
if (items.Any(i => i.Status is ItemStatus.Filled or ItemStatus.Verified or ItemStatus.Dispensed))
    throw new Invalid("Already being dispensed: the pharmacy cannot cancel it. Call the pharmacy.", StatusCodes.Status409Conflict, "business-rule");`},"withdraw/merge":{file:"src/PharmaFlow.Api/Endpoints/FhirEndpoints.cs",start:275,end:278,code:`/// ClinicHub merged two records (IntegrationHub's flow 6). The pharmacy keeps its own patients (by health card, or
/// name and birth date), so the merge moves the clinic's MRN on its prescriptions to the survivor's; two pharmacy
/// patients behind one clinic MRN are written to the access log as a possible duplicate, not merged on the clinic's
/// word. 200 either way, and for a record never seen here.`},"restricted/label":{file:"src/PharmaFlow.Api/Endpoints/FhirEndpoints.cs",start:265,end:272,code:`public static string? Confidentiality(JsonNode? resource)
{
    var codes = resource?["meta"]?["security"]?.AsArray().Where(c => (string?)c?["system"] == ConfidentialitySystem)
        .Select(c => (string?)c!["code"]).Where(c => !string.IsNullOrEmpty(c)).ToList() ?? [];
    if (codes.Count == 0 || codes.All(c => c is "U" or "L" or "M" or "N"))
        return null;
    return codes.Contains("V") ? "V" : "R";
}`},"restricted/mask":{file:"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs",start:62,end:67,code:`// A restricted prescription is listed, so it is not lost, but who it is for stays hidden until the glass is broken.
return rows.Select(r => r.Confidentiality is null || gate.IsOpen(user, r.PrescriptionId) ? (object)r : new
{
    r.PrescriptionId, r.RxNumber, r.ReceivedAt, r.Channel, r.Status, patient = "Restricted", PatientId = 0, prescriber = "", plan = "",
    r.items, ready = 0, warnings = 0, r.Confidentiality,
}).ToList();`},"restricted/gate":{file:"src/PharmaFlow.Api/Auth/ConfidentialityGate.cs",start:18,end:27,code:`private static string Key(ClaimsPrincipal user, int prescriptionId) =>
    $"restricted|{user.FindFirstValue(ClinicHubSignIn.Clinic)}|{user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("name")}|{prescriptionId}";

public bool IsOpen(ClaimsPrincipal user, int prescriptionId) => cache.TryGetValue(Key(user, prescriptionId), out _);

public DateTime Open(ClaimsPrincipal user, int prescriptionId)
{
    var until = clock.GetUtcNow().UtcDateTime + Lasts;
    cache.Set(Key(user, prescriptionId), true, new DateTimeOffset(until, TimeSpan.Zero));
    return until;`},"restricted/filter":{file:"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs",start:170,end:182,code:`public static async ValueTask<object?> RestrictedFilter(EndpointFilterInvocationContext ctx, EndpointFilterDelegate next)
{
    var http = ctx.HttpContext;
    var db = http.RequestServices.GetRequiredService<PharmaDbContext>();
    int? id = int.TryParse(http.Request.RouteValues["id"]?.ToString(), out var rxId) ? rxId : null;
    if (id is null && int.TryParse(http.Request.RouteValues["itemId"]?.ToString(), out var itemId))
        id = await db.PrescriptionItems.AsNoTracking().Where(i => i.ItemId == itemId).Select(i => (int?)i.PrescriptionId).SingleOrDefaultAsync();
    if (id is { } found
        && await db.Prescriptions.AsNoTracking().Where(r => r.PrescriptionId == found).Select(r => r.Confidentiality).SingleOrDefaultAsync() is { } label
        && !http.RequestServices.GetRequiredService<ConfidentialityGate>().IsOpen(http.User, found))
        return ConfidentialityGate.Closed(label);
    return await next(ctx);
}`},"web/gate":{file:"web/src/App.tsx",start:40,end:44,code:`if (error) return <p className="page error">Can't reach the pharmacy API: {error}</p>
if (!me) return <p className="page muted">Loading…</p>
if (!me.name) return <SignIn />
if (me.permissions.length === 0) return <p className="page error">{me.name}: your role does not allow PharmaFlow. <a href="/api/auth/sso/signout">Sign out</a></p>
if (!ref) return <p className="page muted">Loading…</p>`},"web/routes":{file:"web/src/App.tsx",start:63,end:71,code:`<Routes>
  <Route path="/" element={<Navigate replace to="/reception" />} />
  <Route path="/reception" element={<Reception />} />
  <Route path="/people" element={<People />} />
  <Route path="/stock" element={<Stock />} />
  <Route path="/drugs" element={<Drugs />} />
  <Route path="/definitions" element={<BaseDefinitions />} />
  <Route path="*" element={<Navigate to="/reception" />} />
</Routes>`},"web/request":{file:"web/src/api.ts",start:10,end:22,code:`async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method, credentials: 'same-origin',
    // X-PharmaFlow: with sign-in through ClinicHub the session is a cookie, so the API wants proof the call comes from this app.
    headers: { 'X-PharmaFlow': '1', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return undefined as T
  const text = await res.text()
  const data = text ? JSON.parse(text) : undefined
  if (!res.ok) throw new ApiError(res.status, data?.detail ?? data?.title ?? \`Request failed (\${res.status})\`, data?.errors ?? {}, data ?? {})
  return data as T
}`},"web/live":{file:"web/src/pages/Reception.tsx",start:77,end:85,code:`// Live checks while typing: the label text and what reception would find.
useEffect(() => {
  if (!patient) return
  const ready = items.filter(i => i.sig.trim() && i.quantity > 0)
  if (ready.length === 0) return
  const t = setTimeout(() => api.check({ patientId: patient.patientId, writtenDate: form.writtenDate, planId: form.planId ? Number(form.planId) : null, items })
    .then(setChecks).catch(() => {}), 350)
  return () => clearTimeout(t)
}, [patient, items, form.writtenDate, form.planId])`}},s=[{area:"Drugs",method:"GET",path:"/api/drugs",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/DrugEndpoints.cs",line:23},{area:"Drugs",method:"GET",path:"/api/drugs/{id:int}",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/DrugEndpoints.cs",line:31},{area:"Drugs",method:"POST",path:"/api/drugs",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/DrugEndpoints.cs",line:32},{area:"Drugs",method:"PUT",path:"/api/drugs/{id:int}",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/DrugEndpoints.cs",line:33},{area:"Fhir",method:"POST",path:"/fhir",access:"clinichub.prescriptions",handler:"Receive",file:"src/PharmaFlow.Api/Endpoints/FhirEndpoints.cs",line:39},{area:"Inventory",method:"GET",path:"/api/purchases",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/InventoryEndpoints.cs",line:24},{area:"Inventory",method:"POST",path:"/api/purchases",access:"pharmacy.stock",file:"src/PharmaFlow.Api/Endpoints/InventoryEndpoints.cs",line:28},{area:"Inventory",method:"GET",path:"/api/stock",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/InventoryEndpoints.cs",line:64},{area:"Dispensing",method:"POST",path:"/api/prescriptions/items/{itemId:int}/dispense",access:"pharmacy.dispense",file:"src/PharmaFlow.Api/Endpoints/InventoryEndpoints.cs",line:74},{area:"Patients",method:"GET",path:"/api/patients",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PeopleEndpoints.cs",line:22},{area:"Patients",method:"GET",path:"/api/patients/{id:int}",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PeopleEndpoints.cs",line:36},{area:"Patients",method:"POST",path:"/api/patients",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PeopleEndpoints.cs",line:56},{area:"Patients",method:"PUT",path:"/api/patients/{id:int}",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PeopleEndpoints.cs",line:57},{area:"Patients",method:"POST",path:"/api/patients/{id:int}/allergies",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PeopleEndpoints.cs",line:59},{area:"Patients",method:"DELETE",path:"/api/allergies/{id:int}",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PeopleEndpoints.cs",line:75},{area:"Prescribers",method:"GET",path:"/api/prescribers",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PeopleEndpoints.cs",line:84},{area:"Prescribers",method:"POST",path:"/api/prescribers",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PeopleEndpoints.cs",line:91},{area:"Prescribers",method:"PUT",path:"/api/prescribers/{id:int}",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PeopleEndpoints.cs",line:92},{area:"Reception",method:"POST",path:"/api/prescriptions/{id:int}/override",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs",line:30},{area:"Reception",method:"GET",path:"/api/prescriptions",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs",line:50},{area:"Reception",method:"GET",path:"/api/prescriptions/{id:int}",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs",line:70},{area:"Reception",method:"POST",path:"/api/prescriptions/check",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs",line:80},{area:"Reception",method:"POST",path:"/api/prescriptions",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs",line:87},{area:"Reception",method:"POST",path:"/api/prescriptions/items/{itemId:int}/match",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs",line:136},{area:"Reception",method:"POST",path:"/api/prescriptions/items/{itemId:int}/review",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs",line:152},{area:"Reception",method:"POST",path:"/api/prescriptions/items/{itemId:int}/hold",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs",line:165},{area:"Reception",method:"POST",path:"/api/prescriptions/items/{itemId:int}/cancel",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/PrescriptionEndpoints.cs",line:166},{area:"Base definitions",method:"GET",path:"/api/ref",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:27},{area:"Base definitions",method:"PUT",path:"/api/ref/forms/{code}",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:39},{area:"Base definitions",method:"PUT",path:"/api/ref/routes/{code}",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:41},{area:"Base definitions",method:"PUT",path:"/api/ref/units/{code}",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:43},{area:"Base definitions",method:"PUT",path:"/api/ref/sig-codes/{code}",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:53},{area:"Base definitions",method:"GET",path:"/api/ref/ingredients",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:64},{area:"Base definitions",method:"POST",path:"/api/ref/ingredients",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:66},{area:"Base definitions",method:"PUT",path:"/api/ref/ingredients/{id:int}",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:67},{area:"Base definitions",method:"GET",path:"/api/ref/interactions",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:69},{area:"Base definitions",method:"PUT",path:"/api/ref/interactions",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:74},{area:"Base definitions",method:"DELETE",path:"/api/ref/interactions/{a:int}/{b:int}",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:86},{area:"Base definitions",method:"POST",path:"/api/ref/manufacturers",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:95},{area:"Base definitions",method:"PUT",path:"/api/ref/manufacturers/{id:int}",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:96},{area:"Base definitions",method:"POST",path:"/api/ref/suppliers",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:97},{area:"Base definitions",method:"PUT",path:"/api/ref/suppliers/{id:int}",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:98},{area:"Base definitions",method:"POST",path:"/api/ref/plans",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:99},{area:"Base definitions",method:"PUT",path:"/api/ref/plans/{id:int}",access:"pharmacy",file:"src/PharmaFlow.Api/Endpoints/RefEndpoints.cs",line:100},{area:"Program",method:"GET",path:"/healthz",access:"public",file:"src/PharmaFlow.Api/Program.cs",line:48},{area:"Program",method:"GET",path:"/api/me",access:"public",file:"src/PharmaFlow.Api/Program.cs",line:50},{area:"Program",method:"GET",path:"/api/auth/settings",access:"public",file:"src/PharmaFlow.Api/Program.cs",line:54},{area:"Program",method:"GET",path:"/api/auth/sso/start",access:"public",file:"src/PharmaFlow.Api/Program.cs",line:57},{area:"Program",method:"GET",path:"/api/auth/sso/signout",access:"public",file:"src/PharmaFlow.Api/Program.cs",line:61}],i=[{database:"PharmaFlow",schema:"ref",table:"DosageForm",file:"database/010_schema.sql",line:20,columns:[{name:"Code",type:"VARCHAR(10)",nullable:!1,notes:["PK"]},{name:"Name",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"NameFr",type:"NVARCHAR(60)",nullable:!0,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]}],denies:[]},{database:"PharmaFlow",schema:"ref",table:"Route",file:"database/010_schema.sql",line:27,columns:[{name:"Code",type:"VARCHAR(10)",nullable:!1,notes:["PK"]},{name:"Name",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"NameFr",type:"NVARCHAR(60)",nullable:!0,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]}],denies:[]},{database:"PharmaFlow",schema:"ref",table:"Unit",file:"database/010_schema.sql",line:35,columns:[{name:"Code",type:"VARCHAR(10)",nullable:!1,notes:["PK"]},{name:"Name",type:"NVARCHAR(40)",nullable:!1,notes:[]},{name:"Kind",type:"VARCHAR(10)",nullable:!1,notes:["check Kind IN ('Strength','Dispensing')"]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]}],denies:[]},{database:"PharmaFlow",schema:"ref",table:"Schedule",file:"database/010_schema.sql",line:43,columns:[{name:"Code",type:"VARCHAR(4)",nullable:!1,notes:["PK"]},{name:"Name",type:"NVARCHAR(80)",nullable:!1,notes:[]},{name:"RequiresPrescription",type:"BIT",nullable:!1,notes:[]},{name:"Monitored",type:"BIT",nullable:!1,notes:["default 0"]},{name:"Description",type:"NVARCHAR(300)",nullable:!0,notes:[]}],denies:[]},{database:"PharmaFlow",schema:"ref",table:"SigCode",file:"database/010_schema.sql",line:53,columns:[{name:"Code",type:"VARCHAR(12)",nullable:!1,notes:["PK"]},{name:"Expansion",type:"NVARCHAR(80)",nullable:!1,notes:[]},{name:"ExpansionFr",type:"NVARCHAR(80)",nullable:!0,notes:[]},{name:"DosesPerDay",type:"DECIMAL(5,2)",nullable:!0,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]}],denies:[]},{database:"PharmaFlow",schema:"ref",table:"Ingredient",file:"database/010_schema.sql",line:63,columns:[{name:"IngredientId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Name",type:"NVARCHAR(100)",nullable:!1,notes:["unique"]},{name:"AtcCode",type:"VARCHAR(8)",nullable:!0,notes:[]},{name:"AllergyClass",type:"NVARCHAR(40)",nullable:!0,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]}],denies:[]},{database:"PharmaFlow",schema:"ref",table:"Interaction",file:"database/010_schema.sql",line:72,columns:[{name:"IngredientAId",type:"INT",nullable:!1,notes:["PK","→ ref.Ingredient"]},{name:"IngredientBId",type:"INT",nullable:!1,notes:["PK","→ ref.Ingredient"]},{name:"Severity",type:"VARCHAR(10)",nullable:!1,notes:["check Severity IN ('Major','Moderate','Minor')"]},{name:"Description",type:"NVARCHAR(400)",nullable:!1,notes:[]}],denies:[],checks:["IngredientAId < IngredientBId"]},{database:"PharmaFlow",schema:"ref",table:"Manufacturer",file:"database/010_schema.sql",line:81,columns:[{name:"ManufacturerId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Name",type:"NVARCHAR(120)",nullable:!1,notes:["unique"]},{name:"Country",type:"CHAR(2)",nullable:!0,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]}],denies:[]},{database:"PharmaFlow",schema:"ref",table:"Supplier",file:"database/010_schema.sql",line:88,columns:[{name:"SupplierId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Code",type:"VARCHAR(20)",nullable:!1,notes:["unique"]},{name:"Name",type:"NVARCHAR(120)",nullable:!1,notes:[]},{name:"Phone",type:"VARCHAR(25)",nullable:!0,notes:[]},{name:"Email",type:"NVARCHAR(120)",nullable:!0,notes:[]},{name:"AccountNumber",type:"VARCHAR(30)",nullable:!0,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]}],denies:[]},{database:"PharmaFlow",schema:"ref",table:"Drug",file:"database/010_schema.sql",line:115,columns:[{name:"DrugId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Din",type:"CHAR(8)",nullable:!1,notes:["unique","check Din NOT LIKE '%[^0-9]%'"]},{name:"BrandName",type:"NVARCHAR(100)",nullable:!1,notes:[]},{name:"IngredientId",type:"INT",nullable:!1,notes:["→ ref.Ingredient"]},{name:"Strength",type:"DECIMAL(10,3)",nullable:!0,notes:[]},{name:"StrengthUnit",type:"VARCHAR(10)",nullable:!0,notes:["→ ref.Unit"]},{name:"FormCode",type:"VARCHAR(10)",nullable:!1,notes:["→ ref.DosageForm"]},{name:"RouteCode",type:"VARCHAR(10)",nullable:!1,notes:["→ ref.Route"]},{name:"ScheduleCode",type:"VARCHAR(4)",nullable:!1,notes:["→ ref.Schedule"]},{name:"ManufacturerId",type:"INT",nullable:!0,notes:["→ ref.Manufacturer"]},{name:"PackSize",type:"INT",nullable:!1,notes:["default 100","check PackSize > 0"]},{name:"DispensingUnit",type:"VARCHAR(10)",nullable:!1,notes:["→ ref.Unit"]},{name:"UnitCost",type:"DECIMAL(10,4)",nullable:!1,notes:["default 0","check UnitCost >= 0"]},{name:"OdbBenefit",type:"BIT",nullable:!1,notes:["default 0"]},{name:"OdbLimitedUse",type:"BIT",nullable:!1,notes:["default 0"]},{name:"InterchangeGroup",type:"VARCHAR(20)",nullable:!0,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]},{name:"IsDemo",type:"BIT",nullable:!1,notes:["default 0"]},{name:"CreatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"UpdatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]}],denies:[],checks:["(Strength IS NULL AND StrengthUnit IS NULL) OR (Strength > 0 AND StrengthUnit IS NOT NULL)"]},{database:"PharmaFlow",schema:"core",table:"Patient",file:"database/010_schema.sql",line:148,columns:[{name:"PatientId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"HealthCardNumber",type:"CHAR(10)",nullable:!0,notes:["check HealthCardNumber IS NULL OR HealthCardNumber NOT LIKE '%[^0-9]%'","unique where HealthCardNumber IS NOT NULL"]},{name:"HealthCardVersion",type:"VARCHAR(2)",nullable:!0,notes:[]},{name:"FirstName",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"LastName",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"DateOfBirth",type:"DATE",nullable:!1,notes:[]},{name:"Sex",type:"CHAR(1)",nullable:!1,notes:["default 'U'","check Sex IN ('M','F','X','U')"]},{name:"Phone",type:"VARCHAR(25)",nullable:!0,notes:[]},{name:"Email",type:"NVARCHAR(120)",nullable:!0,notes:[]},{name:"AddressLine1",type:"NVARCHAR(200)",nullable:!0,notes:[]},{name:"City",type:"NVARCHAR(80)",nullable:!0,notes:[]},{name:"PostalCode",type:"VARCHAR(7)",nullable:!0,notes:[]},{name:"DefaultPlanId",type:"INT",nullable:!0,notes:[]},{name:"PlanMemberId",type:"VARCHAR(30)",nullable:!0,notes:[]},{name:"Notes",type:"NVARCHAR(500)",nullable:!0,notes:[]},{name:"CreatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"UpdatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"RowVer",type:"ROWVERSION",nullable:!0,notes:[]}],denies:[]},{database:"PharmaFlow",schema:"core",table:"PatientAllergy",file:"database/010_schema.sql",line:172,columns:[{name:"AllergyId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ core.Patient"]},{name:"IngredientId",type:"INT",nullable:!0,notes:["→ ref.Ingredient"]},{name:"AllergyClass",type:"NVARCHAR(40)",nullable:!0,notes:[]},{name:"Description",type:"NVARCHAR(120)",nullable:!0,notes:[]},{name:"Reaction",type:"NVARCHAR(120)",nullable:!0,notes:[]},{name:"Severity",type:"VARCHAR(10)",nullable:!1,notes:["default 'Unknown'","check Severity IN ('Mild','Moderate','Severe','Unknown')"]},{name:"RecordedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]}],denies:[],checks:["IngredientId IS NOT NULL OR AllergyClass IS NOT NULL OR Description IS NOT NULL"]},{database:"PharmaFlow",schema:"core",table:"Prescriber",file:"database/010_schema.sql",line:187,columns:[{name:"PrescriberId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"LicenceBody",type:"VARCHAR(6)",nullable:!1,notes:["check LicenceBody IN ('CPSO','CNO','RCDSO','OCP')"]},{name:"LicenceNumber",type:"VARCHAR(10)",nullable:!1,notes:[]},{name:"FirstName",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"LastName",type:"NVARCHAR(60)",nullable:!1,notes:[]},{name:"Phone",type:"VARCHAR(25)",nullable:!0,notes:[]},{name:"Fax",type:"VARCHAR(25)",nullable:!0,notes:[]},{name:"Clinic",type:"NVARCHAR(120)",nullable:!0,notes:[]},{name:"IsActive",type:"BIT",nullable:!1,notes:["default 1"]}],denies:[],uniques:["(LicenceBody, LicenceNumber)"]},{database:"PharmaFlow",schema:"rx",table:"Prescription",file:"database/010_schema.sql",line:205,columns:[{name:"PrescriptionId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"RxNumber",type:"VARCHAR(12)",nullable:!1,notes:["unique"]},{name:"PatientId",type:"INT",nullable:!1,notes:["→ core.Patient"]},{name:"PrescriberId",type:"INT",nullable:!1,notes:["→ core.Prescriber"]},{name:"WrittenDate",type:"DATE",nullable:!1,notes:[]},{name:"ReceivedAt",type:"DATETIME2(0)",nullable:!1,notes:[]},{name:"Channel",type:"VARCHAR(6)",nullable:!1,notes:["check Channel IN ('Paper','Fax','Phone','eRx')"]},{name:"PlanId",type:"INT",nullable:!0,notes:[]},{name:"Status",type:"VARCHAR(10)",nullable:!1,notes:["check [Status] IN ('Received','InProgress','Completed','OnHold','Cancelled')"]},{name:"Notes",type:"NVARCHAR(500)",nullable:!0,notes:[]},{name:"ExternalId",type:"VARCHAR(100)",nullable:!0,notes:["unique where ExternalId IS NOT NULL","unique where ExternalId IS NOT NULL"]},{name:"ReceivedBy",type:"NVARCHAR(100)",nullable:!1,notes:[]},{name:"UpdatedAt",type:"DATETIME2(0)",nullable:!1,notes:[]},{name:"RowVer",type:"ROWVERSION",nullable:!0,notes:[]}],denies:[]},{database:"PharmaFlow",schema:"rx",table:"PrescriptionItem",file:"database/010_schema.sql",line:226,columns:[{name:"ItemId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"PrescriptionId",type:"INT",nullable:!1,notes:["→ rx.Prescription"]},{name:"LineNumber",type:"TINYINT",nullable:!1,notes:[]},{name:"DrugId",type:"INT",nullable:!0,notes:["→ ref.Drug"]},{name:"DrugText",type:"NVARCHAR(200)",nullable:!1,notes:[]},{name:"Sig",type:"NVARCHAR(300)",nullable:!1,notes:[]},{name:"SigExpanded",type:"NVARCHAR(500)",nullable:!1,notes:[]},{name:"Quantity",type:"DECIMAL(10,2)",nullable:!1,notes:["check Quantity > 0"]},{name:"DaysSupply",type:"SMALLINT",nullable:!0,notes:["check DaysSupply IS NULL OR DaysSupply BETWEEN 1 AND 365"]},{name:"RefillsAuthorized",type:"TINYINT",nullable:!1,notes:["default 0"]},{name:"RefillsRemaining",type:"TINYINT",nullable:!1,notes:["default 0"]},{name:"NoSubstitution",type:"BIT",nullable:!1,notes:["default 0"]},{name:"Status",type:"VARCHAR(12)",nullable:!1,notes:["check [Status] IN ('Received','ReadyToFill','Filled','Verified','Dispensed','OnHold','Cancelled')"]},{name:"WarningsJson",type:"NVARCHAR(MAX)",nullable:!1,notes:["default '[]'"]},{name:"WarningsReviewedBy",type:"NVARCHAR(100)",nullable:!0,notes:[]},{name:"WarningsReviewedAt",type:"DATETIME2(0)",nullable:!0,notes:[]},{name:"CancelReason",type:"NVARCHAR(200)",nullable:!0,notes:[]}],denies:[],checks:["RefillsRemaining <= RefillsAuthorized","[Status] IN ('Received','OnHold','Cancelled') OR DrugId IS NOT NULL"],uniques:["(PrescriptionId, LineNumber)"]},{database:"PharmaFlow",schema:"audit",table:"AccessLog",file:"database/010_schema.sql",line:255,columns:[{name:"AuditId",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"OccurredAt",type:"DATETIME2(3)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"UserName",type:"NVARCHAR(100)",nullable:!1,notes:[]},{name:"Action",type:"VARCHAR(10)",nullable:!1,notes:["check Action IN ('View','Create','Update','Print')"]},{name:"PatientId",type:"INT",nullable:!0,notes:[]},{name:"Context",type:"NVARCHAR(120)",nullable:!1,notes:[]}],denies:[]},{database:"PharmaFlow",schema:"inv",table:"Purchase",file:"database/040_inventory_dispensing.sql",line:11,columns:[{name:"PurchaseId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"SupplierId",type:"INT",nullable:!1,notes:["→ ref.Supplier"]},{name:"InvoiceNumber",type:"VARCHAR(40)",nullable:!1,notes:[]},{name:"InvoiceDate",type:"DATE",nullable:!1,notes:[]},{name:"ReceivedAt",type:"DATETIME2(0)",nullable:!1,notes:[]},{name:"DrugsAmount",type:"DECIMAL(12,2)",nullable:!1,notes:["check DrugsAmount >= 0"]},{name:"SuppliesAmount",type:"DECIMAL(12,2)",nullable:!1,notes:["default 0","check SuppliesAmount >= 0"]},{name:"SuppliesHst",type:"DECIMAL(12,2)",nullable:!1,notes:["default 0","check SuppliesHst >= 0"]},{name:"ReceivedBy",type:"NVARCHAR(100)",nullable:!1,notes:[]}],denies:[],uniques:["(SupplierId, InvoiceNumber)"]},{database:"PharmaFlow",schema:"inv",table:"StockLot",file:"database/040_inventory_dispensing.sql",line:25,columns:[{name:"LotId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"DrugId",type:"INT",nullable:!1,notes:["→ ref.Drug"]},{name:"LotNumber",type:"VARCHAR(30)",nullable:!1,notes:[]},{name:"ExpiryDate",type:"DATE",nullable:!1,notes:[]},{name:"QuantityReceived",type:"DECIMAL(12,2)",nullable:!1,notes:["check QuantityReceived > 0"]},{name:"QuantityOnHand",type:"DECIMAL(12,2)",nullable:!1,notes:[]},{name:"UnitCost",type:"DECIMAL(10,4)",nullable:!1,notes:["check UnitCost >= 0"]},{name:"PurchaseId",type:"INT",nullable:!0,notes:["→ inv.Purchase"]},{name:"ReceivedAt",type:"DATETIME2(0)",nullable:!1,notes:[]}],denies:[],checks:["QuantityOnHand >= 0 AND QuantityOnHand <= QuantityReceived"]},{database:"PharmaFlow",schema:"rx",table:"Dispense",file:"database/040_inventory_dispensing.sql",line:39,columns:[{name:"DispenseId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"ItemId",type:"INT",nullable:!1,notes:["→ rx.PrescriptionItem"]},{name:"DrugId",type:"INT",nullable:!1,notes:["→ ref.Drug"]},{name:"IsRefill",type:"BIT",nullable:!1,notes:[]},{name:"Quantity",type:"DECIMAL(10,2)",nullable:!1,notes:["check Quantity > 0"]},{name:"DispensedAt",type:"DATETIME2(0)",nullable:!1,notes:[]},{name:"DispensedBy",type:"NVARCHAR(100)",nullable:!1,notes:[]},{name:"PlanId",type:"INT",nullable:!0,notes:[]},{name:"DrugCost",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"Markup",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"DispensingFee",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"Total",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"PlanPays",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"PatientPays",type:"DECIMAL(10,2)",nullable:!1,notes:[]},{name:"PaymentMethod",type:"VARCHAR(10)",nullable:!0,notes:["check PaymentMethod IN ('Cash','Debit','Credit','Account')"]}],denies:[],checks:["Total = DrugCost + Markup + DispensingFee AND PlanPays + PatientPays = Total AND PlanPays >= 0 AND PatientPays >= 0","PatientPays = 0 OR PaymentMethod IS NOT NULL"]},{database:"PharmaFlow",schema:"rx",table:"DispenseLot",file:"database/040_inventory_dispensing.sql",line:61,columns:[{name:"DispenseId",type:"INT",nullable:!1,notes:["PK","→ rx.Dispense"]},{name:"LotId",type:"INT",nullable:!1,notes:["PK","→ inv.StockLot"]},{name:"Quantity",type:"DECIMAL(10,2)",nullable:!1,notes:["check Quantity > 0"]},{name:"UnitCost",type:"DECIMAL(10,4)",nullable:!1,notes:[]}],denies:[]},{database:"PharmaFlow",schema:"billing",table:"FinanceExport",file:"database/040_inventory_dispensing.sql",line:69,columns:[{name:"ExternalId",type:"VARCHAR(200)",nullable:!1,notes:["PK"]},{name:"SentAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]}],denies:[]}],r=[{path:"/",redirect:"/reception",guards:[]},{path:"/reception",component:"Reception",guards:[]},{path:"/people",component:"People",guards:[]},{path:"/stock",component:"Stock",guards:[]},{path:"/drugs",component:"Drugs",guards:[]},{path:"/definitions",component:"BaseDefinitions",guards:[]},{path:"*",redirect:"/reception",guards:[]}],o={project:e,repo:n,files:t,examples:a,endpoints:s,tables:i,routes:r};export{o as default,s as endpoints,a as examples,t as files,e as project,n as repo,r as routes,i as tables};
