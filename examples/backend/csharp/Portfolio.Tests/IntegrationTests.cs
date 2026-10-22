using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Anthropic;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Logging.Abstractions;
using MongoDB.Driver;
using Portfolio;

namespace Portfolio.Tests;

public class IntegrationTests
{
    // A real local HTTP server: the code under test uses a real HttpClient / SDK client against it.
    private static async Task<(WebApplication App, string Url)> Serve(RequestDelegate handler)
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        var app = builder.Build();
        app.Run(handler);
        await app.StartAsync();
        return (app, app.Urls.First());
    }

    [Fact]
    public async Task Fanout_keeps_order_and_never_throws()
    {
        var (app, url) = await Serve(async ctx =>
        {
            if (ctx.Request.Path == "/up/status") await ctx.Response.WriteAsync("""{"healthy":true}""");
            else ctx.Response.StatusCode = 500;
        });
        await using var _ = app;
        var result = await new StatusFanout(new HttpClient()).ListWithStatusAsync(
        [
            new("up", $"{url}/up"), new("broken", $"{url}/broken"), new("down", "http://127.0.0.1:1"),
        ], CancellationToken.None);
        Assert.Equal(["up", "broken", "down"], result.Select(r => r.Project.Key));
        Assert.Equal(new AdapterStatus(true), result[0].Status);
        Assert.Equal(new AdapterStatus(false, "Adapter returned HTTP 500"), result[1].Status);
        Assert.Equal(new AdapterStatus(false, "Adapter unreachable."), result[2].Status);
    }

    [Fact]
    public async Task Worker_survives_a_failing_pass_and_stops()
    {
        var calls = 0;
        using var stop = new CancellationTokenSource();
        var worker = new PollingWorker(_ =>
        {
            if (++calls == 1) throw new InvalidOperationException("database down");
            stop.Cancel();
            return Task.CompletedTask;
        }, TimeSpan.FromMilliseconds(10), NullLogger<PollingWorker>.Instance);
        await worker.StartAsync(stop.Token);
        await (worker.ExecuteTask ?? Task.CompletedTask).ContinueWith(_ => { });
        Assert.Equal(2, calls);
    }

    private const string Secret = "whsec_test";

    private static async Task<HttpClient> WebhookClient(List<JsonElement> handled, HashSet<string> seen)
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseTestServer();
        var app = builder.Build();
        app.MapPaymentsWebhook(["other", Secret], e => { handled.Add(e); return Task.CompletedTask; }, seen, () => 1_000_000);
        await app.StartAsync();
        return app.GetTestClient();
    }

    private static HttpRequestMessage Signed(string json, long t, Func<string, string>? tamper = null)
    {
        var raw = Encoding.UTF8.GetBytes(json);
        var req = new HttpRequestMessage(HttpMethod.Post, "/webhooks/payments")
        {
            Content = new StringContent(tamper?.Invoke(json) ?? json, Encoding.UTF8, "application/json"),
        };
        req.Headers.Add("Stripe-Signature", $"t={t},v1={Webhook.Sign(Secret, t, raw)}");
        return req;
    }

    [Fact]
    public async Task Webhook_accepts_a_valid_event_once()
    {
        List<JsonElement> handled = [];
        var client = await WebhookClient(handled, []);
        Assert.Equal("""{"received":true}""", await (await client.SendAsync(Signed("""{"id":"evt_1"}""", 1_000_000))).Content.ReadAsStringAsync());
        Assert.Contains("duplicate", await (await client.SendAsync(Signed("""{"id":"evt_1"}""", 1_000_000))).Content.ReadAsStringAsync());
        Assert.Single(handled);
    }

    [Fact]
    public async Task Webhook_rejects_tampered_and_old_events()
    {
        var client = await WebhookClient([], []);
        var tampered = await client.SendAsync(Signed("""{"id":"evt_2","amount":100}""", 1_000_000, j => j.Replace("100", "999")));
        Assert.Equal(HttpStatusCode.BadRequest, tampered.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.SendAsync(Signed("""{"id":"evt_3"}""", 1_000_000 - 301))).StatusCode);
    }

    private static SqliteConnection OutboxDb()
    {
        var conn = new SqliteConnection("Data Source=:memory:");
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = Outbox.Schema;
        cmd.ExecuteNonQuery();
        return conn;
    }

    private static (long, double?) Row(SqliteConnection conn)
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT attempts, next_attempt FROM outbox";
        using var r = cmd.ExecuteReader();
        r.Read();
        return (r.GetInt64(0), r.IsDBNull(1) ? null : r.GetDouble(1));
    }

    [Fact]
    public async Task Outbox_retries_with_backoff_then_delivers()
    {
        using var conn = OutboxDb();
        Outbox.PlaceOrder(conn, "o1", "Jane");
        List<string> sent = [];
        var down = true;
        Task Send(string p)
        {
            if (down) throw new HttpRequestException("lab system down");
            sent.Add(p);
            return Task.CompletedTask;
        }
        Assert.Equal(0, await Outbox.DispatchAsync(conn, Send, 0));
        Assert.Equal((1L, 10.0), Row(conn));
        Assert.Equal(0, await Outbox.DispatchAsync(conn, Send, 5));
        Assert.Equal(0, await Outbox.DispatchAsync(conn, Send, 10));
        Assert.Equal((2L, 30.0), Row(conn));
        down = false;
        Assert.Equal(1, await Outbox.DispatchAsync(conn, Send, 30));
        Assert.Equal(["""{"order":"o1"}"""], sent);
    }

    [Fact]
    public void Order_and_message_commit_together()
    {
        using var conn = OutboxDb();
        Outbox.PlaceOrder(conn, "o1", "Jane");
        Assert.Throws<SqliteException>(() => Outbox.PlaceOrder(conn, "o1", "Jane again"));
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT COUNT(*) FROM outbox";
        Assert.Equal(1L, cmd.ExecuteScalar());
    }

    [Fact]
    public void Backoff_is_capped()
    {
        Assert.Equal([10.0, 20, 40], new[] { 1, 2, 3 }.Select(Outbox.BackoffSeconds));
        Assert.Equal(1800, Outbox.BackoffSeconds(12));
    }

    private static string Reply(string stopReason, object[] content) => JsonSerializer.Serialize(new
    {
        id = "msg_1", type = "message", role = "assistant", model = "claude-opus-5-5", content,
        stop_reason = stopReason, stop_sequence = (string?)null, usage = new { input_tokens = 1, output_tokens = 1 },
    });

    [Fact]
    public async Task Assistant_runs_tools_then_answers()
    {
        var replies = new Queue<string>([
            Reply("tool_use", [
                new { type = "tool_use", id = "t1", name = "get_project_status", input = new { key = "ledgerdash" } },
                new { type = "tool_use", id = "t2", name = "get_project_status", input = new { key = "missing" } },
            ]),
            Reply("end_turn", [new { type = "text", text = "LedgerDash is healthy." }]),
        ]);
        List<JsonNode> requests = [];
        var (app, url) = await Serve(async ctx =>
        {
            requests.Add((await JsonNode.ParseAsync(ctx.Request.Body))!);
            ctx.Response.ContentType = "application/json";
            await ctx.Response.WriteAsync(replies.Dequeue());
        });
        await using var _ = app;
        var client = new AnthropicClient { ApiKey = "test", BaseUrl = url };

        var answer = await Assistant.AskAsync(client, Assistant.PortfolioTool(new Dictionary<string, object> { ["ledgerdash"] = new { healthy = true } }), "Is ledger ok?");

        Assert.Equal("LedgerDash is healthy.", answer);
        var results = requests[1]["messages"]!.AsArray()[^1]!["content"]!.AsArray(); // both results in ONE user message
        Assert.Equal(2, results.Count);
        Assert.True(results[1]!["is_error"]!.GetValue<bool>());
    }

    [Fact]
    public async Task Only_one_concurrent_finalize_wins()
    {
        var mongoUrl = Environment.GetEnvironmentVariable("MONGO_URL");
        if (string.IsNullOrEmpty(mongoUrl)) return; // needs MONGO_URL
        var orders = new MongoClient(mongoUrl).GetDatabase("lessons").GetCollection<OrderDoc>("orders_cs");
        await orders.DeleteManyAsync(FilterDefinition<OrderDoc>.Empty);
        await orders.InsertOneAsync(new OrderDoc { Id = "o1", Status = "pending" });
        var results = await Task.WhenAll(Enumerable.Range(0, 10).Select(_ => Task.Run(() => Orders.FinalizeOrderAsync(orders, "o1"))));
        Assert.Single(results, r => r == "won");
        Assert.Equal(9, results.Count(r => r == "processing"));
    }
}
