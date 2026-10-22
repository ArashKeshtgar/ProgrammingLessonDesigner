using System.Collections.Concurrent;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Portfolio;

public record ProjectRow(string Key, string DisplayName, string AdapterBaseUrl);

// #region validation
// Unknown fields are an error, not silently dropped (like Nest's whitelist + forbid).
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class CreateProject
{
    [Required, RegularExpression("^[a-z0-9-]{1,40}$")]
    public string Key { get; init; } = "";

    [Required, StringLength(100, MinimumLength = 1)]
    public string DisplayName { get; init; } = "";

    [Required, Url]
    public string AdapterBaseUrl { get; init; } = "";
}
// #endregion

// SUM over no rows is NULL in SQL, so every count may arrive as null.
public record StatusCounts(int? Sent, int? Interviewing, int? FollowupsDue);

// #region ports
public interface IStatusQueries
{
    Task<StatusCounts> StatusAsync();
}

public interface IProjectRepository
{
    Task<ProjectRow?> FindAsync(string key);
    Task AddAsync(ProjectRow row);
}
// #endregion

public class InMemoryProjects : IProjectRepository
{
    private readonly ConcurrentDictionary<string, ProjectRow> rows = new();
    public virtual Task<ProjectRow?> FindAsync(string key) => Task.FromResult(rows.GetValueOrDefault(key));
    public Task AddAsync(ProjectRow row) => Task.FromResult(rows[row.Key] = row);
}
