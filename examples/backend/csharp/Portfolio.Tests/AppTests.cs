using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Portfolio;

namespace Portfolio.Tests;

public class AppTests
{
    private const string A = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    private const string R = "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr";
    private static readonly Dictionary<int, User> Users = new()
    {
        [1] = new(1, "admin", "Admin"),
        [2] = new(2, "viewer", "Viewer"),
    };

    private class FakeQueries(StatusCounts? counts = null, bool fail = false) : IStatusQueries
    {
        public Task<StatusCounts> StatusAsync() => fail
            ? throw new InvalidOperationException("Login failed for user ledger_reader")
            : Task.FromResult(counts ?? new StatusCounts(36, 0, 11));
    }

    private static TokenService Tokens() => new(A, R, id => Users.GetValueOrDefault(id));

    // #region test
    // The real ASP.NET pipeline in memory (TestServer); only the database is faked.
    private static async Task<HttpClient> Client(IStatusQueries? queries = null, IProjectRepository? projects = null)
    {
        var app = PortfolioApp.Build(queries ?? new FakeQueries(), projects ?? new InMemoryProjects(), Tokens(),
            b => b.WebHost.UseTestServer());
        await app.StartAsync();
        return app.GetTestClient();
    }

    [Fact]
    public async Task Status_reports_counts()
    {
        var body = await (await Client()).GetFromJsonAsync<JsonElement>("/status");
        Assert.Equal("36 sent, 0 interviewing, 11 follow-up(s) due", body.GetProperty("summary").GetString());
    }

    [Fact]
    public async Task Null_sums_count_as_zero()
    {
        var body = await (await Client(new FakeQueries(new StatusCounts(null, null, null)))).GetFromJsonAsync<JsonElement>("/status");
        Assert.Equal("0 sent, 0 interviewing, 0 follow-up(s) due", body.GetProperty("summary").GetString());
    }

    [Fact]
    public async Task Unhealthy_without_leaking_the_database_error()
    {
        var text = await (await Client(new FakeQueries(fail: true))).GetStringAsync("/status");
        Assert.Equal("""{"healthy":false,"error":"Database unreachable."}""", text);
    }
    // #endregion

    private static HttpRequestMessage Post(int? userId, object body)
    {
        var req = new HttpRequestMessage(HttpMethod.Post, "/projects") { Content = JsonContent.Create(body) };
        if (userId is { } id) req.Headers.Authorization = new("Bearer", Tokens().Issue(Users[id]).AccessToken);
        return req;
    }

    [Fact]
    public async Task Unknown_project_is_404()
    {
        var res = await (await Client()).GetAsync("/projects/nope");
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
        Assert.Equal("""{"error":"Unknown project: nope"}""", await res.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Create_returns_201_with_location()
    {
        var res = await (await Client()).SendAsync(Post(1, new { key = "lab-flow", displayName = "LabFlow", adapterBaseUrl = "http://localhost:4005" }));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        Assert.Equal("/projects/lab-flow", res.Headers.Location?.ToString());
    }

    [Fact]
    public async Task Invalid_body_is_400_with_field_errors()
    {
        var res = await (await Client()).SendAsync(Post(1, new { key = "Bad Key!", displayName = "", adapterBaseUrl = "not a url" }));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        var errors = (await res.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("errors");
        Assert.Equal(["adapterBaseUrl", "displayName", "key"], errors.EnumerateObject().Select(p => p.Name).Order());
    }

    [Fact]
    public async Task Unknown_field_is_rejected()
    {
        var res = await (await Client()).SendAsync(Post(1, new { key = "x", displayName = "X", adapterBaseUrl = "http://x", isAdmin = true }));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        Assert.True((await res.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("errors").TryGetProperty("isAdmin", out _));
    }

    [Fact]
    public async Task Roles_are_checked()
    {
        var body = new { key = "x", displayName = "X", adapterBaseUrl = "http://x" };
        var client = await Client();
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.SendAsync(Post(null, body))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.SendAsync(Post(2, body))).StatusCode);
    }

    private class Broken : InMemoryProjects
    {
        public override Task<ProjectRow?> FindAsync(string key) => throw new InvalidOperationException("SQL Server 10.0.0.5 login failed for sa");
    }

    [Fact]
    public async Task Unexpected_error_is_500_without_details()
    {
        var res = await (await Client(projects: new Broken())).GetAsync("/projects/x");
        Assert.Equal(HttpStatusCode.InternalServerError, res.StatusCode);
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Something went wrong.", body.GetProperty("error").GetString());
        Assert.DoesNotContain("10.0.0.5", body.ToString());
    }

    [Fact]
    public void Refresh_token_is_not_an_access_token_and_logout_revokes_it()
    {
        var tokens = Tokens();
        var pair = tokens.Issue(Users[1]);
        Assert.Throws<AuthException>(() => tokens.VerifyAccess(pair.RefreshToken));
        Assert.NotEmpty(tokens.Refresh(pair.RefreshToken).AccessToken);
        Users[1].TokenVersion++;
        try
        {
            Assert.Contains("revoked", Assert.Throws<AuthException>(() => tokens.Refresh(pair.RefreshToken)).Message);
        }
        finally
        {
            Users[1].TokenVersion--;
        }
    }

    [Fact]
    public void Secrets_must_be_long_and_different()
    {
        Assert.Throws<ArgumentException>(() => new TokenService("short", R, _ => null));
        Assert.Throws<ArgumentException>(() => new TokenService(A, A, _ => null));
        Assert.Throws<InvalidOperationException>(() => Config.Load(new Dictionary<string, string?> { ["JWT_SECRET"] = A }));
    }

    [Fact]
    public async Task Parameters_keep_an_injection_attempt_as_plain_text()
    {
        using var conn = new SqliteConnection("Data Source=:memory:");
        conn.Open();
        var repo = new SqliteProjects(conn);
        const string evil = "x'; DROP TABLE projects; --";
        await repo.AddAsync(new ProjectRow(evil, "Evil", "http://x"));
        Assert.Equal("Evil", (await repo.FindAsync(evil))?.DisplayName);
        Assert.Null(await repo.FindAsync("x"));
    }
}
