using System.ComponentModel.DataAnnotations;
using System.Net.Http.Json;

namespace Lessons.Blazor;

public record ProjectStatus(string Key, string DisplayName, bool Healthy, string? Summary = null, string? Error = null);

// The backend's rules, on the client for instant feedback. The server still checks.
public class CreateProjectModel
{
    [Required, RegularExpression("^[a-z0-9-]{1,40}$", ErrorMessage = "Lowercase letters, digits and dashes, up to 40.")]
    public string Key { get; set; } = "";

    [Required, StringLength(100)]
    public string DisplayName { get; set; } = "";

    [Required, RegularExpression(@"^https?://\S+$", ErrorMessage = "An http(s) URL.")]
    public string AdapterBaseUrl { get; set; } = "";
}

// A typed HttpClient: registered with AddHttpClient<ProjectsClient>().AddHttpMessageHandler<AuthHandler>().
public class ProjectsClient(HttpClient http)
{
    public async Task<List<ProjectStatus>> ListAsync() => await http.GetFromJsonAsync<List<ProjectStatus>>("projects") ?? [];

    public async Task<ProjectStatus> StatusAsync(string key) =>
        (await http.GetFromJsonAsync<ProjectStatus>($"projects/{Uri.EscapeDataString(key)}"))!;

    public async Task CreateAsync(CreateProjectModel p)
    {
        using var res = await http.PostAsJsonAsync("projects", p);
        if (!res.IsSuccessStatusCode)
            throw new InvalidOperationException((await res.Content.ReadFromJsonAsync<ApiError>())?.Error ?? $"HTTP {(int)res.StatusCode}");
    }

    private record ApiError(string? Error);
}

public interface ITokenStore
{
    string? Access { get; }
    string? Refresh { get; }
    void Save(string access, string refresh);
    void Clear();
}
