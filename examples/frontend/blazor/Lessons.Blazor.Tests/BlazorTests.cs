using System.Net;
using System.Net.Http.Json;
using Bunit;
using Lessons.Blazor;

namespace Lessons.Blazor.Tests;

public class BlazorTests
{
    [Fact]
    public void Card_shows_status_and_raises_refresh()
    {
        using var ctx = new BunitContext();
        string? clicked = null;
        var cut = ctx.Render<StatusCard>(p => p
            .Add(c => c.Project, new ProjectStatus("lab", "LabFlow", false, Error: "Adapter unreachable."))
            .Add(c => c.OnRefresh, (string key) => clicked = key));

        Assert.Contains("Adapter unreachable.", cut.Find("p").TextContent);
        cut.Find("button").Click();
        Assert.Equal("lab", clicked);
    }

    private class Tokens(string? access, string? refresh) : ITokenStore
    {
        public string? Access { get; private set; } = access;
        public string? Refresh { get; private set; } = refresh;
        public bool Cleared { get; private set; }
        public void Save(string a, string r) => (Access, Refresh) = (a, r);
        public void Clear() => (Access, Refresh, Cleared) = (null, null, true);
    }

    // Plays the server: 401 unless the request carries the new token; a slow refresh endpoint.
    private class FakeServer(bool refreshWorks) : HttpMessageHandler
    {
        public int Refreshes;

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            if (request.RequestUri!.AbsolutePath == "/auth/refresh")
            {
                Interlocked.Increment(ref Refreshes);
                await Task.Delay(20, ct); // still in flight when the second 401 arrives
                return refreshWorks
                    ? new HttpResponseMessage(HttpStatusCode.OK) { Content = JsonContent.Create(new { accessToken = "new", refreshToken = "r2" }) }
                    : new HttpResponseMessage(HttpStatusCode.Unauthorized);
            }
            return request.Headers.Authorization?.Parameter == "new"
                ? new HttpResponseMessage(HttpStatusCode.OK) { Content = JsonContent.Create(new { path = request.RequestUri.AbsolutePath }) }
                : new HttpResponseMessage(HttpStatusCode.Unauthorized);
        }
    }

    private static HttpClient Client(ITokenStore tokens, FakeServer server, Action onSignedOut) =>
        new(new AuthHandler(tokens, new Uri("http://api/auth/refresh"), onSignedOut) { InnerHandler = server })
        {
            BaseAddress = new Uri("http://api/"),
        };

    [Fact]
    public async Task Parallel_401s_share_one_refresh_and_retry()
    {
        var tokens = new Tokens("old", "r1");
        var server = new FakeServer(refreshWorks: true);
        var http = Client(tokens, server, () => Assert.Fail("should stay signed in"));

        var responses = await Task.WhenAll(http.GetAsync("projects"), http.GetAsync("status"));

        Assert.All(responses, r => Assert.Equal(HttpStatusCode.OK, r.StatusCode));
        Assert.Equal(1, server.Refreshes);
        Assert.Equal("r2", tokens.Refresh);
    }

    [Fact]
    public async Task Failed_refresh_signs_out()
    {
        var tokens = new Tokens("old", "revoked");
        var signedOut = false;
        var http = Client(tokens, new FakeServer(refreshWorks: false), () => signedOut = true);

        var response = await http.GetAsync("projects");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.True(signedOut);
        Assert.True(tokens.Cleared);
    }
}
