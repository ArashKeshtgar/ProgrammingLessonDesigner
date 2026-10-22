using System.Collections;
using Microsoft.Data.Sqlite;
using Portfolio;

// Composition root: the only place that knows which real implementations are used.
var env = Environment.GetEnvironmentVariables().Cast<DictionaryEntry>()
    .ToDictionary(e => (string)e.Key, e => (string?)e.Value);
var settings = Config.Load(env);
var conn = new SqliteConnection($"Data Source={settings.DbPath}");
conn.Open();
var projects = new SqliteProjects(conn);
var tokens = new TokenService(settings.JwtSecret, settings.JwtRefreshSecret, _ => null);

var app = PortfolioApp.Build(new CountQueries(conn), projects, tokens);
app.Run();

class CountQueries(SqliteConnection conn) : IStatusQueries
{
    public async Task<StatusCounts> StatusAsync()
    {
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT COUNT(*) FROM projects";
        return new((int)(long)(await cmd.ExecuteScalarAsync())!, 0, 0);
    }
}
