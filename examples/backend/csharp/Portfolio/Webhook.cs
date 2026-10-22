using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Portfolio;

public class SignatureException(string message) : Exception(message);

public static class Webhook
{
    private const int ToleranceSeconds = 300;

    // #region verify
    public static string Sign(string secret, long timestamp, byte[] body)
    {
        // Stripe-style: HMAC-SHA256 over "<timestamp>.<raw body>".
        byte[] payload = [.. Encoding.UTF8.GetBytes($"{timestamp}."), .. body];
        return Convert.ToHexStringLower(HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), payload));
    }

    public static JsonElement Verify(byte[] body, string header, IEnumerable<string> secrets, long now)
    {
        var parts = header.Split(',').Select(p => p.Split('=', 2)).Where(p => p.Length == 2).ToDictionary(p => p[0], p => p[1]);
        if (!long.TryParse(parts.GetValueOrDefault("t"), out var timestamp))
            throw new SignatureException("No timestamp in the signature header.");
        if (Math.Abs(now - timestamp) > ToleranceSeconds)
            throw new SignatureException("Timestamp outside the tolerance (replayed?).");
        var given = Encoding.UTF8.GetBytes(parts.GetValueOrDefault("v1") ?? "");
        foreach (var secret in secrets) // two endpoints, two secrets: accept either
        {
            // FixedTimeEquals takes the same time whatever matches, so timing leaks nothing.
            if (CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(Sign(secret, timestamp, body)), given))
                return JsonDocument.Parse(body).RootElement.Clone();
        }
        throw new SignatureException("No matching signature.");
    }
    // #endregion

    // #region route
    public static void MapPaymentsWebhook(this WebApplication app, string[] secrets, Func<JsonElement, Task> handle,
        ISet<string> seen, Func<long>? clock = null)
    {
        clock ??= () => DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        app.MapPost("/webhooks/payments", async (HttpRequest request) =>
        {
            // The raw bytes: binding to a typed object first would change what was signed.
            using var buffer = new MemoryStream();
            await request.Body.CopyToAsync(buffer);
            JsonElement evt;
            try
            {
                evt = Verify(buffer.ToArray(), request.Headers["Stripe-Signature"].ToString(), secrets, clock());
            }
            catch (SignatureException ex)
            {
                return Results.BadRequest(new { error = $"Signature verification failed: {ex.Message}" });
            }
            // Providers retry: the same event can arrive twice. Handle it once.
            var id = evt.GetProperty("id").GetString()!;
            if (seen.Contains(id)) return Results.Ok(new { received = true, duplicate = true });
            await handle(evt);
            seen.Add(id);
            return Results.Ok(new { received = true });
        });
    }
    // #endregion
}
