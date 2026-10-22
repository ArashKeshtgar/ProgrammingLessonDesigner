using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Lessons.Blazor;

// #region client
// Blazor's version of an HttpInterceptor: a DelegatingHandler in the HttpClient pipeline.
// Attach the access token; on 401 refresh once and retry; if the refresh fails, sign out.
public class AuthHandler(ITokenStore tokens, Uri refreshUrl, Action onSignedOut) : DelegatingHandler
{
    // One refresh shared by every request that hit 401 at the same time.
    private Task<string>? refreshing;
    private readonly object gate = new();

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        Attach(request, tokens.Access);
        var response = await base.SendAsync(request, ct);
        if (response.StatusCode != HttpStatusCode.Unauthorized || tokens.Refresh is null) return response;

        string token;
        try
        {
            token = await SharedRefresh(ct);
        }
        catch (Exception)
        {
            tokens.Clear();
            onSignedOut();
            return response;
        }
        response.Dispose();
        // A request can be sent only once: send a copy (the bodies in this app are buffered JSON).
        using var retry = await Clone(request);
        Attach(retry, token);
        return await base.SendAsync(retry, ct);
    }

    private Task<string> SharedRefresh(CancellationToken ct)
    {
        lock (gate)
        {
            refreshing ??= RefreshAsync(ct).ContinueWith(t => { lock (gate) refreshing = null; return t; }, TaskScheduler.Default).Unwrap();
            return refreshing;
        }
    }

    private async Task<string> RefreshAsync(CancellationToken ct)
    {
        // Straight to the inner handler: the refresh call must not come back through this handler.
        using var req = new HttpRequestMessage(HttpMethod.Post, refreshUrl) { Content = JsonContent.Create(new { refreshToken = tokens.Refresh }) };
        using var res = await base.SendAsync(req, ct);
        res.EnsureSuccessStatusCode();
        var pair = (await res.Content.ReadFromJsonAsync<TokenPair>(ct))!;
        tokens.Save(pair.AccessToken, pair.RefreshToken);
        return pair.AccessToken;
    }

    private static void Attach(HttpRequestMessage request, string? token)
    {
        if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    private static async Task<HttpRequestMessage> Clone(HttpRequestMessage request)
    {
        var copy = new HttpRequestMessage(request.Method, request.RequestUri);
        if (request.Content is not null)
        {
            copy.Content = new ByteArrayContent(await request.Content.ReadAsByteArrayAsync());
            foreach (var h in request.Content.Headers) copy.Content.Headers.TryAddWithoutValidation(h.Key, h.Value);
        }
        return copy;
    }

    private record TokenPair(string AccessToken, string RefreshToken);
}
// #endregion
