using Microsoft.Data.Sqlite;

namespace Portfolio;

// #region repository
public class SqliteProjects : IProjectRepository
{
    private readonly SqliteConnection conn;

    public SqliteProjects(SqliteConnection conn)
    {
        this.conn = conn;
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "CREATE TABLE IF NOT EXISTS projects (key TEXT PRIMARY KEY, display_name TEXT NOT NULL, adapter_base_url TEXT NOT NULL)";
        cmd.ExecuteNonQuery();
    }

    public async Task<ProjectRow?> FindAsync(string key)
    {
        await using var cmd = conn.CreateCommand();
        // $key is a parameter: the driver sends the value separately, never as SQL text.
        cmd.CommandText = "SELECT key, display_name, adapter_base_url FROM projects WHERE key = $key";
        cmd.Parameters.AddWithValue("$key", key);
        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? new(reader.GetString(0), reader.GetString(1), reader.GetString(2)) : null;
    }

    public async Task AddAsync(ProjectRow row)
    {
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = "INSERT INTO projects (key, display_name, adapter_base_url) VALUES ($key, $name, $url)";
        cmd.Parameters.AddWithValue("$key", row.Key);
        cmd.Parameters.AddWithValue("$name", row.DisplayName);
        cmd.Parameters.AddWithValue("$url", row.AdapterBaseUrl);
        await cmd.ExecuteNonQueryAsync();
    }
}
// #endregion
