using System.Net.Http.Json;

namespace Portfolio;

public record Project(string Key, string AdapterBaseUrl);
public record AdapterStatus(bool Healthy, string? Error = null);
public record ProjectWithStatus(Project Project, AdapterStatus Status);

public class StatusFanout(HttpClient http)
{
    // #region fanout
    public async Task<IReadOnlyList<ProjectWithStatus>> ListWithStatusAsync(IEnumerable<Project> registry, CancellationToken ct)
    {
        // Each element starts immediately; WhenAll keeps the input order.
        return await Task.WhenAll(registry.Select(async p =>
            new ProjectWithStatus(p, await FetchStatusAsync(p, ct))));
    }

    // Never throws for an adapter problem: a down adapter becomes Healthy = false.
    private async Task<AdapterStatus> FetchStatusAsync(Project p, CancellationToken ct)
    {
        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(3));

            using var res = await http.GetAsync($"{p.AdapterBaseUrl}/status", cts.Token);
            if (!res.IsSuccessStatusCode)
                return new(false, $"Adapter returned HTTP {(int)res.StatusCode}");

            return (await res.Content.ReadFromJsonAsync<AdapterStatus>(cts.Token))!;
        }
        catch (Exception) when (!ct.IsCancellationRequested)
        {
            // timeout, refused connection, bad JSON: all the same to the dashboard
            return new(false, "Adapter unreachable.");
        }
    }
    // #endregion
}

// #region worker
public class PollingWorker(Func<CancellationToken, Task> dispatch, TimeSpan poll, ILogger<PollingWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested && poll > TimeSpan.Zero)
        {
            try
            {
                await dispatch(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "The outbox pass failed; trying again on the next one.");
            }
            // Delay throws OperationCanceledException on shutdown, which ends ExecuteAsync.
            await Task.Delay(poll, stoppingToken);
        }
    }
}
// #endregion
