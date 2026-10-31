const e="wutility",n="wUtility",t={"README.md":34,"web/README.md":69,"wUtility.sln":25,"web/api/Program.cs":236,"web/api/Properties/launchSettings.json":14,"web/api/appsettings.json":13,"web/frontend/proxy.conf.js":17,"web/tools/DbSetup/Program.cs":100,"web/deploy/azure/deploy.ps1":139,"web/db/02-schemasync-target.sql":30,"wUtility/SimilarityDatabaseForm.xaml.cs":1762,"wUtility/Utils/DBHelper.cs":571,"wUtility/MainWindow.xaml.cs":168,"wUtility/Drug.cs":318,"wUtility/CommonClass.cs":662,"wUtility/Utils/CryptographyUtils.cs":197,"wUtility/Utils/AppSettingsManager.cs":50,"wService/Service1.cs":28,"web/api/SchemaReader.cs":63,"web/api/SqlReaderExtensions.cs":17,"web/api/Models.cs":56,"web/api/SchemaDiffer.cs":55,"web/db/01-schemasync-source.sql":35,"web/api/ScriptGenerator.cs":87,"web/api/ScriptExecutor.cs":47,"web/api/DemoMode.cs":96,"web/frontend/src/app/services/demo.service.ts":31,"web/api/ConnectionVault.cs":67,"web/api/SiteConnectionsService.cs":107,"web/db/04-dbconfig.sql":47,"web/frontend/src/app/pages/connections-page/connections-page.component.ts":98,"web/api/DoctorsService.cs":113,"web/api/DoctorsModels.cs":21,"wUtility/DoctorsPriceGroupsForm.xaml.cs":763,"web/db/03-totalsystem.sql":58,"web/frontend/src/app/pages/doctor-price-groups-page/doctor-price-groups-page.component.ts":101,"web/api/DbConfigService.cs":45,"web/api/ConnectionsModels.cs":18,"wUtility/Models/Tbl_dbConfigSetting.cs":34,"web/frontend/src/app/app.routes.ts":15,"web/frontend/src/app/app.config.ts":12,"web/frontend/src/app/app.component.html":10,"web/frontend/src/app/pages/schema-sync-page/schema-sync.service.ts":51,"web/frontend/src/app/pages/schema-sync-page/schema-sync-page.component.ts":92,"web/infra/main.bicep":157},a={"overview/what":{file:"README.md",start:13,end:18,code:`## What it does

- Connects to a source and a destination SQL Server database
- Detects structural differences: tables, columns, data types, indexes, views, stored procedures, functions
- Generates and applies the changes needed to bring the destination schema up to date with the source
- Provides a set of hospital-specific configuration forms used during HIS deployments`},"overview/ported":{file:"web/README.md",start:11,end:17,code:"| Original WPF form | Web equivalent | Notes |\n|---|---|---|\n| `MainWindow` | Top nav bar (Angular) | Menu shell only |\n| `SimilarityDatabaseForm` | `/schema-sync` page | Schema diff + generated T-SQL sync script, review-then-apply |\n| `DoctorsForm` | `/doctors` page | Read-only list from `Doctors` |\n| `DoctorsPriceGroupsForm` | `/doctor-price-groups` page | Full CRUD on `DoctorsPriceGroups`, joined with `Doctors`/`Works` |\n| `DatabasesForm` (top grid) | `/db-config` page | Read-only list from `Tbl_dbConfigSetting` |"},"run/commands":{file:"web/README.md",start:46,end:48,code:`# PowerShell: $env:WUTILITY_API_KEY = "<random 32+ chars>"
cd api && dotnet run                  # :5091
cd frontend && npm start              # :4300, same WUTILITY_API_KEY in the environment`},"run/key":{file:"web/api/Program.cs",start:14,end:20,code:`var apiKey = builder.Configuration["WUTILITY_API_KEY"];
if (string.IsNullOrEmpty(apiKey) || apiKey.Length < 32)
{
    throw new InvalidOperationException(
        "WUTILITY_API_KEY must be set to a random value of at least 32 characters.");
}
var apiKeyBytes = Encoding.UTF8.GetBytes(apiKey);`},"run/proxy":{file:"web/frontend/proxy.conf.js",start:5,end:17,code:`const apiKey = process.env.WUTILITY_API_KEY;
if (!apiKey) {
  throw new Error('WUTILITY_API_KEY must be set before running ng serve (same value as the API).');
}

module.exports = {
  '/api': {
    target: 'http://localhost:5091',
    secure: false,
    changeOrigin: true,
    headers: { 'X-Api-Key': apiKey },
  },
};`},"run/plan":{file:"web/tools/DbSetup/Program.cs",start:26,end:32,code:`var plan = new (string Script, string Database)[]
{
    ("01-schemasync-source.sql", prefix is null ? "SchemaSyncDemo_Source" : prefix + "Source"),
    ("02-schemasync-target.sql", prefix is null ? "SchemaSyncDemo_Target" : prefix + "Target"),
    ("03-totalsystem.sql",       prefix is null ? "TotalsystemDemo"       : prefix + "Totalsystem"),
    ("04-dbconfig.sql",          prefix is null ? "dbConfigDataBasesDemo" : prefix + "DbConfig"),
};`},"tests/tested":{file:"web/README.md",start:34,end:39,code:"## Testing performed\n\nAll of the above were tested against real SQL Server data on `(local)` (dedicated demo databases — `SchemaSyncDemo_Source/Target`, `TotalsystemDemo`, `dbConfigDataBasesDemo` — never the real hospital databases on the same instance):\n\n- Schema compare correctly detected a missing table, a missing column, and a column type mismatch; the generated script was executed and a re-compare confirmed zero remaining diffs.\n- Doctors → price-groups navigation, add, and edit were exercised end-to-end through the actual browser UI, with real inserts/updates verified in the database."},"tests/smoke":{file:"web/deploy/azure/deploy.ps1",start:130,end:138,code:`Step 'Smoke test'
$url = "https://$AppName.azurewebsites.net"
Invoke-RestMethod "$url/healthz" -TimeoutSec 120 | Out-Null
$demo = Invoke-RestMethod "$url/api/demo" -TimeoutSec 60
if (-not $demo.enabled) { throw 'Demo mode is not enabled on the deployed app.' }
# First SQL call may wait for a paused serverless database to resume.
$compare = Invoke-RestMethod "$url/api/compare" -Method Post -ContentType 'application/json' \`
    -Body '{"sourceConnectionString":"","targetConnectionString":""}' -TimeoutSec 180
Write-Host "healthz ok; demo on ($($demo.sourceDatabase) -> $($demo.targetDatabase)); compare found $($compare.diffs.Count) diff(s)."`},"wpf/sps":{file:"wUtility/SimilarityDatabaseForm.xaml.cs",start:714,end:716,code:`string query = @"SELECT ROW_NUMBER() OVER(ORDER BY ROUTINE_CATALOG) RowNumber, ROUTINE_CATALOG, ROUTINE_NAME, convert(nvarchar(max),object_definition(o.object_id))AS ROUTINE_DEFINITION
                FROM INFORMATION_SCHEMA.ROUTINES i
                inner join sys.procedures o on o.name = i.ROUTINE_NAME`},"wpf/views":{file:"wUtility/SimilarityDatabaseForm.xaml.cs",start:1415,end:1417,code:`discordResult = dataTable1.AsEnumerable().Where(o => !(result.Where
                      (os => os.q2 == o["TABLE_NAME"].ToString() 
                      )).Any()).ToList();`},"wpf/widen":{file:"wUtility/SimilarityDatabaseForm.xaml.cs",start:1168,end:1169,code:`if (characterMaximumLength == (10).ToString())
    characterMaximumLength = (50).ToString();`},"wpf/alter":{file:"wUtility/SimilarityDatabaseForm.xaml.cs",start:1192,end:1207,code:`if (dataTable.Rows.Count > 0)
{
    dropConstraint = "Alter Table " + tableName + " drop CONSTRAINT " + dataTable.Rows[0]["DCName"].ToString();
    createConstraint = @" alter table " + tableName + @" add constraint " + dataTable.Rows[0]["DCName"].ToString()
       + " default " + cOLUMN_DEFAULT+' ' + " for " + columnName;
    //@" CREATE INDEX "+ dataTable.Rows[0]["DCName"].ToString()+
    //                   @" ON "+tableName+" ("+columnName+@") ";
}

if (!string.IsNullOrEmpty(dropConstraint))
     dbh.ExecuteQuery(dropConstraint);

dbh.ExecuteQuery(script);

if (!string.IsNullOrEmpty(createConstraint))
    dbh.ExecuteQuery(createConstraint);`},"legacy-connections/modules":{file:"wUtility/CommonClass.cs",start:140,end:150,code:`static public List<string> ConnectedDatabases
{
    get
    {
        List<string> mylist = new List<string>(new string[] { "Totalsystem", "Lab", "Radio",
                                                                "Drug" , "Blood" , "OpRoom",
                                                                "Phisio", "Food", "Den",
                                                                 "Tasisat" , "Tajhizat" , "MDoc","Requests"});
        return mylist;
    }
}`},"legacy-connections/conn":{file:"wUtility/Drug.cs",start:69,end:86,code:`/// //// this property for save connectionString
/// </summary>
public string ConnectionString
{
    get
    {
        string encryptedValue = AppSettingsManager.GetSetting(ConnectionStringName);
        if (!string.IsNullOrEmpty(ConnectionStringName))
            return CryptographyUtils.AESCryptography.DecryptStringAES(encryptedValue, "452654645");
        else
            return null;
    }
    set
    {
        string encryptedValue = "";
        if (!string.IsNullOrEmpty(value))
            encryptedValue = CryptographyUtils.AESCryptography.EncryptStringAES(value, "452654645");
        AppSettingsManager.SetSetting(ConnectionStringName, encryptedValue);`},"legacy-connections/service":{file:"wService/Service1.cs",start:20,end:26,code:`protected override void OnStart(string[] args)
{
}

protected override void OnStop()
{
}`},"reader/sql":{file:"web/api/SchemaReader.cs",start:18,end:36,code:`const string sql = @"
    SELECT
        c.TABLE_NAME,
        c.COLUMN_NAME,
        c.DATA_TYPE,
        c.CHARACTER_MAXIMUM_LENGTH,
        c.NUMERIC_PRECISION,
        c.NUMERIC_SCALE,
        c.IS_NULLABLE,
        c.ORDINAL_POSITION,
        CASE WHEN ic.column_id IS NOT NULL THEN 1 ELSE 0 END AS IsIdentity
    FROM INFORMATION_SCHEMA.COLUMNS c
    JOIN INFORMATION_SCHEMA.TABLES t
        ON t.TABLE_NAME = c.TABLE_NAME AND t.TABLE_SCHEMA = c.TABLE_SCHEMA
    LEFT JOIN sys.identity_columns ic
        ON ic.object_id = OBJECT_ID(QUOTENAME(c.TABLE_SCHEMA) + '.' + QUOTENAME(c.TABLE_NAME))
       AND ic.name = c.COLUMN_NAME
    WHERE t.TABLE_TYPE = 'BASE TABLE' AND c.TABLE_SCHEMA = 'dbo'
    ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION";`},"reader/group":{file:"web/api/SchemaReader.cs",start:57,end:59,code:`var tables = flatRows
    .GroupBy(row => row.TableName)
    .Select(g => new TableInfo(g.Key, g.Select(row => row.Column).ToList()));`},"reader/tolist":{file:"web/api/SqlReaderExtensions.cs",start:10,end:16,code:`public static async Task<List<T>> ToListAsync<T>(this SqlDataReader reader, Func<SqlDataReader, T> map)
{
    var results = new List<T>();
    while (await reader.ReadAsync())
        results.Add(map(reader));
    return results;
}`},"reader/type":{file:"web/api/Models.cs",start:15,end:32,code:`public string SqlTypeExpression()
{
    var needsLength = DataType is "varchar" or "nvarchar" or "char" or "nchar" or "varbinary";
    var needsPrecisionScale = DataType is "decimal" or "numeric";

    if (needsLength && MaxLength is not null)
    {
        // INFORMATION_SCHEMA.COLUMNS.CHARACTER_MAXIMUM_LENGTH is already in
        // characters for nvarchar/nchar (SQL Server reports it pre-converted),
        // so no /2 adjustment is needed here.
        var len = MaxLength == -1 ? "MAX" : MaxLength.ToString();
        return $"{DataType}({len})";
    }
    if (needsPrecisionScale && Precision is not null)
    {
        return $"{DataType}({Precision},{Scale})";
    }
    return DataType;`},"differ/tables":{file:"web/api/SchemaDiffer.cs",start:12,end:22,code:`var targetTables = target.Tables.ToDictionary(t => t.Name, StringComparer.OrdinalIgnoreCase);

foreach (var sourceTable in source.Tables)
{
    if (!targetTables.TryGetValue(sourceTable.Name, out var targetTable))
    {
        diffs.Add(new DiffEntry(
            DiffKind.MissingTable, sourceTable.Name, null,
            $"Table '{sourceTable.Name}' exists in source but not in target."));
        continue;
    }`},"differ/columns":{file:"web/api/SchemaDiffer.cs",start:36,end:49,code:`if (!string.Equals(targetColumn.SqlTypeExpression(), sourceColumn.SqlTypeExpression(), StringComparison.OrdinalIgnoreCase))
{
    diffs.Add(new DiffEntry(
        DiffKind.ColumnTypeMismatch, sourceTable.Name, sourceColumn.Name,
        $"Column '{sourceTable.Name}.{sourceColumn.Name}' is {targetColumn.SqlTypeExpression()} in target, " +
        $"{sourceColumn.SqlTypeExpression()} in source."));
}
else if (targetColumn.IsNullable != sourceColumn.IsNullable)
{
    diffs.Add(new DiffEntry(
        DiffKind.ColumnNullabilityMismatch, sourceTable.Name, sourceColumn.Name,
        $"Column '{sourceTable.Name}.{sourceColumn.Name}' nullability differs " +
        $"(target: {(targetColumn.IsNullable ? "NULL" : "NOT NULL")}, source: {(sourceColumn.IsNullable ? "NULL" : "NOT NULL")})."));
}`},"differ/source":{file:"web/db/01-schemasync-source.sql",start:10,end:16,code:`CREATE TABLE dbo.Patients (
    PatientId    int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    FullName     nvarchar(150) NOT NULL,
    NationalCode nvarchar(20)  NOT NULL,
    BirthDate    date          NULL,
    Phone        nvarchar(20)  NULL
);`},"differ/target":{file:"web/db/02-schemasync-target.sql",start:11,end:16,code:`CREATE TABLE dbo.Patients (
    PatientId    int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    FullName     nvarchar(150) NOT NULL,
    NationalCode nvarchar(10)  NOT NULL,
    BirthDate    date          NOT NULL
);`},"generator/create":{file:"web/api/ScriptGenerator.cs",start:27,end:33,code:`if (missingTable is not null)
{
    sb.AppendLine(GenerateCreateTable(sourceTables[table]));
    sb.AppendLine("GO");
    sb.AppendLine();
    continue;
}`},"generator/add":{file:"web/api/ScriptGenerator.cs",start:35,end:42,code:`foreach (var diff in tableDiffs.Where(d => d.Kind == DiffKind.MissingColumn))
{
    var column = sourceTables[table].Columns.First(c => c.Name == diff.ColumnName);
    sb.AppendLine($"-- {diff.Description}");
    sb.AppendLine($"ALTER TABLE dbo.[{table}] ADD [{column.Name}] {column.SqlTypeExpression()} NULL;");
    sb.AppendLine("GO");
    sb.AppendLine();
}`},"generator/nulls":{file:"web/api/ScriptGenerator.cs",start:54,end:63,code:`foreach (var diff in tableDiffs.Where(d => d.Kind == DiffKind.ColumnNullabilityMismatch))
{
    var column = sourceTables[table].Columns.First(c => c.Name == diff.ColumnName);
    sb.AppendLine($"-- {diff.Description}");
    sb.AppendLine($"-- NOTE: widening to NULL regardless of source's nullability, to avoid failing " +
                  $"on existing rows. Tighten to NOT NULL manually after backfilling if the source requires it.");
    sb.AppendLine($"ALTER TABLE dbo.[{table}] ALTER COLUMN [{column.Name}] {column.SqlTypeExpression()} NULL;");
    sb.AppendLine("GO");
    sb.AppendLine();
}`},"executor/split":{file:"web/api/ScriptExecutor.cs",start:11,end:17,code:`private static readonly Regex GoSplitter = new(@"^\\s*GO\\s*$", RegexOptions.Multiline | RegexOptions.IgnoreCase);

// A batch is executable if it has at least one non-empty, non-comment line —
// a batch made up entirely of "-- ..." lines (like the script's header) is
// just documentation and should be skipped, not sent to SQL Server as-is.
private static bool HasExecutableContent(string batch) =>
    batch.Split('\\n').Any(line => line.Trim() is { Length: > 0 } t && !t.StartsWith("--"));`},"executor/loop":{file:"web/api/ScriptExecutor.cs",start:31,end:45,code:`foreach (var batch in batches)
{
    try
    {
        await using var cmd = new SqlCommand(batch, conn);
        await cmd.ExecuteNonQueryAsync();
        executed.Add(batch);
    }
    catch (Exception ex)
    {
        return new ExecuteResult(false, executed, $"Failed on batch:\\n{batch}\\n\\nError: {ex.Message}");
    }
}

return new ExecuteResult(true, executed, null);`},"executor/execute":{file:"web/api/Program.cs",start:123,end:141,code:`app.MapPost("/api/execute", async (ExecuteRequest req, IServiceProvider sp, SchemaReader reader, SchemaDiffer differ, ScriptGenerator generator, ScriptExecutor executor) =>
{
    if (demo.Enabled)
    {
        // Only the script the server would generate right now may run. The
        // client must send back exactly what it was shown, so "review, then
        // apply" still holds, but nothing caller-written ever executes.
        var dbs = sp.GetRequiredService<DemoDatabases>();
        var current = await CompareAsync(dbs.Source, dbs.Target, reader, differ, generator);
        if (!string.Equals(NormalizeScript(req.Script), NormalizeScript(current.Script), StringComparison.Ordinal))
        {
            return Results.Conflict(new { error = "In demo mode only the unmodified generated script can run. Compare again and apply it as shown." });
        }
        return Results.Ok(await executor.ExecuteAsync(dbs.Target, current.Script));
    }
    return Results.Ok(await executor.ExecuteAsync(req.TargetConnectionString, req.Script));
})
.WithName("ExecuteScript")
.RequireRateLimiting(HeavyPolicy);`},"apikey/middleware":{file:"web/api/Program.cs",start:85,end:100,code:`app.Use(async (context, next) =>
{
    // In demo mode the browser calls /api directly and can't hold a secret;
    // the dangerous routes are constrained instead (see DemoMode.cs).
    if (!demo.Enabled && context.Request.Path.StartsWithSegments("/api"))
    {
        var provided = Encoding.UTF8.GetBytes(context.Request.Headers["X-Api-Key"].ToString());
        // Constant-time comparison, so response timing doesn't leak the key.
        if (!CryptographicOperations.FixedTimeEquals(provided, apiKeyBytes))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { error = "Missing or invalid X-Api-Key header." });
            return;
        }
    }
    await next();`},"apikey/health":{file:"web/api/Program.cs",start:81,end:83,code:`// Liveness only (App Service health check). Deliberately doesn't touch SQL,
// so an auto-paused free-tier database doesn't mark the app unhealthy.
app.MapGet("/healthz", () => Results.Ok(new { status = "ok" }));`},"demo/execute":{file:"web/api/Program.cs",start:127,end:136,code:`// Only the script the server would generate right now may run. The
// client must send back exactly what it was shown, so "review, then
// apply" still holds, but nothing caller-written ever executes.
var dbs = sp.GetRequiredService<DemoDatabases>();
var current = await CompareAsync(dbs.Source, dbs.Target, reader, differ, generator);
if (!string.Equals(NormalizeScript(req.Script), NormalizeScript(current.Script), StringComparison.Ordinal))
{
    return Results.Conflict(new { error = "In demo mode only the unmodified generated script can run. Compare again and apply it as shown." });
}
return Results.Ok(await executor.ExecuteAsync(dbs.Target, current.Script));`},"demo/limits":{file:"web/api/Program.cs",start:45,end:57,code:`const string HeavyPolicy = "heavy";
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions { PermitLimit = 120, Window = TimeSpan.FromMinutes(1) }));
    options.AddPolicy(HeavyPolicy, ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1) }));
});`},"demo/reset":{file:"web/api/DemoMode.cs",start:49,end:60,code:`// The target's starting "drift": no Appointments table, Patients.Phone
// missing, NationalCode too short, BirthDate NOT NULL. One of each diff
// kind SchemaDiffer reports. Same statements as db/02-schemasync-target.sql.
private const string ResetTargetSql = @"
    IF OBJECT_ID('dbo.Appointments') IS NOT NULL DROP TABLE dbo.Appointments;
    IF OBJECT_ID('dbo.Patients') IS NOT NULL DROP TABLE dbo.Patients;
    CREATE TABLE dbo.Patients (
        PatientId    int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        FullName     nvarchar(150) NOT NULL,
        NationalCode nvarchar(10)  NOT NULL,
        BirthDate    date          NOT NULL
    );";`},"vault/key":{file:"web/api/ConnectionVault.cs",start:21,end:34,code:`    var envKey = Environment.GetEnvironmentVariable("CONNECTION_VAULT_KEY");
    if (!string.IsNullOrEmpty(envKey))
    {
        _key = Convert.FromBase64String(envKey);
    }
    else
    {
        _key = RandomNumberGenerator.GetBytes(32);
        logger.LogWarning(
            "CONNECTION_VAULT_KEY is not set — using a random per-process key. " +
            "Stored connections will become undecryptable after this process restarts. " +
            "Set CONNECTION_VAULT_KEY (base64, 32 bytes) for a real deployment.");
    }
}`},"vault/encrypt":{file:"web/api/ConnectionVault.cs",start:36,end:51,code:`public string Encrypt(string plaintext)
{
    var nonce = RandomNumberGenerator.GetBytes(NonceSize);
    var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
    var ciphertext = new byte[plaintextBytes.Length];
    var tag = new byte[TagSize];

    using var aesGcm = new AesGcm(_key, TagSize);
    aesGcm.Encrypt(nonce, plaintextBytes, ciphertext, tag);

    var payload = new byte[NonceSize + ciphertext.Length + TagSize];
    Buffer.BlockCopy(nonce, 0, payload, 0, NonceSize);
    Buffer.BlockCopy(ciphertext, 0, payload, NonceSize, ciphertext.Length);
    Buffer.BlockCopy(tag, 0, payload, NonceSize + ciphertext.Length, TagSize);

    return Convert.ToBase64String(payload);`},"vault/test":{file:"web/api/SiteConnectionsService.cs",start:58,end:84,code:`public async Task<TestConnectionResult> TestAsync(int id)
{
    var encrypted = await GetEncryptedAsync(id);
    if (encrypted is null) return new TestConnectionResult(false, "Connection not found.");

    string plaintext;
    try
    {
        plaintext = _vault.Decrypt(encrypted);
    }
    catch (Exception)
    {
        // Almost always means the process restarted since this row was
        // encrypted with a different ephemeral key — see ConnectionVault's
        // own comment. Not the target database's fault.
        return new TestConnectionResult(false, "Could not decrypt this connection (vault key changed since it was saved).");
    }

    try
    {
        await using var testConn = new SqlConnection(plaintext);
        await testConn.OpenAsync();
        return new TestConnectionResult(true, null);
    }
    catch (Exception ex)
    {
        return new TestConnectionResult(false, ex.Message);`},"doctors/wpf":{file:"wUtility/DoctorsPriceGroupsForm.xaml.cs",start:501,end:504,code:`select Dp.*, D.Name DrName,W.Name WName
from DoctorsPriceGroups Dp 
inner join Doctors D on D.Code = Dp.DrCode
left join Works W on W.Code = Dp.WCode";`},"doctors/web":{file:"web/api/DoctorsService.cs",start:45,end:50,code:`var sql = @"
    SELECT Dp.RowGD, Dp.DrCode, Dp.WCode, Dp.CenterSharePrice, Dp.Title, D.Name AS DrName, W.Name AS WName
    FROM dbo.DoctorsPriceGroups Dp
    INNER JOIN dbo.Doctors D ON D.Code = Dp.DrCode
    LEFT JOIN dbo.Works W ON W.Code = Dp.WCode";
if (drCode is not null) sql += " WHERE Dp.DrCode = @DrCode";`},"doctors/params":{file:"web/api/DoctorsService.cs",start:106,end:112,code:`private static void AddUpsertParams(SqlCommand cmd, UpsertDoctorPriceGroupRequest req)
{
    cmd.Parameters.AddWithValue("@DrCode", req.DrCode);
    cmd.Parameters.AddWithValue("@WCode", (object?)req.WCode ?? DBNull.Value);
    cmd.Parameters.AddWithValue("@CenterSharePrice", (object?)req.CenterSharePrice ?? DBNull.Value);
    cmd.Parameters.AddWithValue("@Title", (object?)req.Title ?? DBNull.Value);
}`},"dbconfig/port":{file:"web/api/DbConfigService.cs",start:10,end:12,code:`// Web port of DatabasesForm.xaml.cs's top grid (Tbl_dbConfigSetting) — see
// Models/Tbl_dbConfigSetting.cs in the WPF app. Read-only there and read-only
// here: the original app never writes to this table either.`},"dbconfig/rows":{file:"web/db/04-dbconfig.sql",start:30,end:35,code:`INSERT INTO dbo.Tbl_dbConfigSetting
    (fldMainDataBase, fldDataBaseName, fldDelphiConnectionName, fldPersianDescDataBase, fldIsActive, fldInstanceName, fldSecondInstance)
VALUES
    (N'Totalsystem', N'Totalsystem_ShafaHospital', N'ConnTotal1', N'بیمارستان شفا',             1, N'SHAFA-SQL01', NULL),
    (N'OpRoom',      N'OpRoom_DenaHospital',       N'ConnOR1',    N'اتاق عمل - بیمارستان دنا',  1, N'DENA-SQL01',  N'DENA-SQL02'),
    (N'Lab',         N'Lab_DenaHospital',          N'ConnLab1',   N'آزمایشگاه - بیمارستان دنا', 0, N'DENA-SQL01',  NULL);`},"dbconfig/modules":{file:"web/api/ConnectionsModels.cs",start:7,end:11,code:`public static readonly string[] All =
[
    "Totalsystem", "Lab", "Radio", "Drug", "Blood", "OpRoom",
    "Phisio", "Food", "Den", "Tasisat", "Tajhizat", "MDoc", "Requests"
];`},"frontend/labels":{file:"web/frontend/src/app/pages/schema-sync-page/schema-sync.service.ts",start:27,end:32,code:`export const DIFF_KIND_LABELS: Record<number, string> = {
  0: 'جدول موجود نیست',
  1: 'ستون موجود نیست',
  2: 'نوع ستون متفاوت است',
  3: 'nullability متفاوت است'
};`},"frontend/apply":{file:"web/frontend/src/app/pages/schema-sync-page/schema-sync-page.component.ts",start:70,end:84,code:`applyScript(): void {
  if (!this.result) return;
  this.executing = true;
  this.api.execute(this.targetConnectionString, this.result.script).subscribe({
    next: (res) => {
      this.executeResult = res;
      this.executing = false;
      if (res.success) this.compare(true);
    },
    error: (err) => {
      this.error = 'اجرای اسکریپت ناموفق بود — ' + errorText(err);
      this.executing = false;
    }
  });
}`},"frontend/demo":{file:"web/frontend/src/app/services/demo.service.ts",start:22,end:25,code:"this.info$ = this.http.get<DemoInfo>(`${API_BASE}/demo`).pipe(\n  catchError(() => of({ enabled: false, sourceDatabase: null, targetDatabase: null })),\n  shareReplay(1)\n);"},"azure/dbs":{file:"web/infra/main.bicep",start:40,end:45,code:`var databases = [
  { name: 'SchemaSyncDemo_Source', setting: 'SchemaSyncSource' }
  { name: 'SchemaSyncDemo_Target', setting: 'SchemaSyncTarget' }
  { name: 'TotalsystemDemo', setting: 'Totalsystem' }
  { name: 'dbConfigDataBasesDemo', setting: 'DbConfig' }
]`},"azure/free":{file:"web/infra/main.bicep",start:98,end:103,code:`useFreeLimit: true
freeLimitExhaustionBehavior: 'AutoPause'
autoPauseDelay: 60
minCapacity: json('0.5')
maxSizeBytes: 34359738368
requestedBackupStorageRedundancy: 'Local'`},"azure/conn":{file:"web/infra/main.bicep",start:149,end:149,code:"connectionString: 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Database=${d.name};Authentication=Active Directory Managed Identity;Encrypt=True;Connect Timeout=90;'"},"azure/grant":{file:"web/db/02-schemasync-target.sql",start:19,end:29,code:`-- The app applies generated scripts and resets the demo here, so it needs
-- DDL rights, but only in this database.
DECLARE @app sysname = N'$(AppIdentity)', @q nvarchar(300);
IF @app <> N''
BEGIN
    SET @q = QUOTENAME(@app);
    IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = @app)
        EXEC (N'CREATE USER ' + @q + N' FROM EXTERNAL PROVIDER');
    EXEC (N'ALTER ROLE db_datareader ADD MEMBER ' + @q);
    EXEC (N'ALTER ROLE db_ddladmin ADD MEMBER ' + @q);
END`}},s=[{area:"Program",method:"GET",path:"/healthz",access:"public",file:"web/api/Program.cs",line:83},{area:"Program",method:"POST",path:"/api/compare",access:"public",file:"web/api/Program.cs",line:111},{area:"Program",method:"POST",path:"/api/execute",access:"public",file:"web/api/Program.cs",line:123},{area:"Program",method:"GET",path:"/api/demo",access:"public",file:"web/api/Program.cs",line:145},{area:"Program",method:"POST",path:"/api/demo/reset",access:"public",file:"web/api/Program.cs",line:155},{area:"Program",method:"GET",path:"/api/doctors",access:"public",file:"web/api/Program.cs",line:164},{area:"Program",method:"GET",path:"/api/works",access:"public",file:"web/api/Program.cs",line:167},{area:"Program",method:"GET",path:"/api/doctor-price-groups",access:"public",file:"web/api/Program.cs",line:170},{area:"Program",method:"POST",path:"/api/doctor-price-groups",access:"public",file:"web/api/Program.cs",line:173},{area:"Program",method:"PUT",path:"/api/doctor-price-groups/{rowGd:int}",access:"public",file:"web/api/Program.cs",line:180},{area:"Program",method:"DELETE",path:"/api/doctor-price-groups/{rowGd:int}",access:"public",file:"web/api/Program.cs",line:187},{area:"Program",method:"GET",path:"/api/db-config-settings",access:"public",file:"web/api/Program.cs",line:194},{area:"Program",method:"GET",path:"/api/modules",access:"public",file:"web/api/Program.cs",line:197},{area:"Program",method:"GET",path:"/api/connections",access:"public",file:"web/api/Program.cs",line:200},{area:"Program",method:"POST",path:"/api/connections",access:"public",file:"web/api/Program.cs",line:209},{area:"Program",method:"POST",path:"/api/connections/{id:int}/test",access:"public",file:"web/api/Program.cs",line:217},{area:"Program",method:"DELETE",path:"/api/connections/{id:int}",access:"public",file:"web/api/Program.cs",line:221}],r=[{database:"demo",table:"Patients",file:"web/db/01-schemasync-source.sql",line:10,columns:[{name:"PatientId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"FullName",type:"NVARCHAR(150)",nullable:!1,notes:[]},{name:"NationalCode",type:"NVARCHAR(20)",nullable:!1,notes:[]},{name:"BirthDate",type:"DATE",nullable:!0,notes:[]},{name:"Phone",type:"NVARCHAR(20)",nullable:!0,notes:[]}],denies:[]},{database:"demo",table:"Appointments",file:"web/db/01-schemasync-source.sql",line:18,columns:[{name:"AppointmentId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"PatientId",type:"INT",nullable:!1,notes:[]},{name:"DoctorName",type:"NVARCHAR(100)",nullable:!1,notes:[]},{name:"ScheduledAt",type:"DATETIME2",nullable:!1,notes:[]}],denies:[]},{database:"demo",table:"Patients",file:"web/db/02-schemasync-target.sql",line:11,columns:[{name:"PatientId",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"FullName",type:"NVARCHAR(150)",nullable:!1,notes:[]},{name:"NationalCode",type:"NVARCHAR(10)",nullable:!1,notes:[]},{name:"BirthDate",type:"DATE",nullable:!1,notes:[]}],denies:[]},{database:"demo",table:"Doctors",file:"web/db/03-totalsystem.sql",line:9,columns:[{name:"Code",type:"INT",nullable:!1,notes:["PK"]},{name:"fName",type:"NVARCHAR(50)",nullable:!1,notes:[]},{name:"lName",type:"NVARCHAR(50)",nullable:!1,notes:[]},{name:"Name",type:"NVARCHAR(100)",nullable:!1,notes:[]},{name:"PostNo",type:"NVARCHAR(20)",nullable:!0,notes:[]}],denies:[]},{database:"demo",table:"Works",file:"web/db/03-totalsystem.sql",line:17,columns:[{name:"Code",type:"INT",nullable:!1,notes:["PK"]},{name:"Name",type:"NVARCHAR(100)",nullable:!1,notes:[]}],denies:[]},{database:"demo",table:"DoctorsPriceGroups",file:"web/db/03-totalsystem.sql",line:22,columns:[{name:"RowGD",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"DrCode",type:"INT",nullable:!1,notes:["→ Doctors"]},{name:"WCode",type:"INT",nullable:!0,notes:["→ Works"]},{name:"CenterSharePrice",type:"DECIMAL(12,2)",nullable:!0,notes:[]},{name:"Title",type:"NVARCHAR(150)",nullable:!0,notes:[]}],denies:[]},{database:"demo",table:"Tbl_dbConfigSetting",file:"web/db/04-dbconfig.sql",line:10,columns:[{name:"fldID",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"fldMainDataBase",type:"NVARCHAR(50)",nullable:!1,notes:[]},{name:"fldDataBaseName",type:"NVARCHAR(100)",nullable:!1,notes:[]},{name:"fldDelphiConnectionName",type:"NVARCHAR(100)",nullable:!0,notes:[]},{name:"fldPersianDescDataBase",type:"NVARCHAR(200)",nullable:!0,notes:[]},{name:"fldIsActive",type:"BIT",nullable:!1,notes:["default 1"]},{name:"fldInstanceName",type:"NVARCHAR(100)",nullable:!0,notes:[]},{name:"fldSecondInstance",type:"NVARCHAR(100)",nullable:!0,notes:[]}],denies:[]},{database:"demo",table:"SiteConnections",file:"web/db/04-dbconfig.sql",line:21,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"ModuleName",type:"NVARCHAR(50)",nullable:!1,notes:[]},{name:"DisplayName",type:"NVARCHAR(150)",nullable:!1,notes:[]},{name:"EncryptedConnectionString",type:"NVARCHAR(MAX)",nullable:!1,notes:[]},{name:"CreatedAt",type:"DATETIME2",nullable:!1,notes:["default sysutcdatetime()"]}],denies:[]}],o=[{path:"/",redirect:"/schema-sync",guards:[]},{path:"/schema-sync",component:"SchemaSyncPageComponent",guards:[]},{path:"/doctors",component:"DoctorsPageComponent",guards:[]},{path:"/doctor-price-groups",component:"DoctorPriceGroupsPageComponent",guards:[]},{path:"/db-config",component:"DbConfigPageComponent",guards:[]},{path:"/connections",component:"ConnectionsPageComponent",guards:[]}],i={project:e,repo:n,files:t,examples:a,endpoints:s,tables:r,routes:o};export{i as default,s as endpoints,a as examples,t as files,e as project,n as repo,o as routes,r as tables};
