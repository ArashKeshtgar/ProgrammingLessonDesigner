using System.Text.Json;
using Microsoft.Data.Sqlite;

namespace Portfolio;

public static class Outbox
{
    public const int MaxAttempts = 12;

    public const string Schema = """
        CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, patient TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS outbox (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            payload TEXT NOT NULL,
            attempts INTEGER NOT NULL DEFAULT 0,
            next_attempt REAL,
            sent REAL,
            last_error TEXT
        );
        """;

    // #region save
    public static void PlaceOrder(SqliteConnection conn, string orderId, string patient)
    {
        // The order and its message commit together: either both exist or neither does.
        using var tx = conn.BeginTransaction();
        Execute(conn, tx, "INSERT INTO orders (id, patient) VALUES ($a, $b)", orderId, patient);
        Execute(conn, tx, "INSERT INTO outbox (payload) VALUES ($a)", JsonSerializer.Serialize(new { order = orderId }));
        tx.Commit(); // disposing without Commit rolls back
    }
    // #endregion

    // #region dispatch
    public static double BackoffSeconds(int attempts) => Math.Min(10 * Math.Pow(2, attempts - 1), 30 * 60); // 10 s, 20 s, 40 s ... 30 min

    public static async Task<int> DispatchAsync(SqliteConnection conn, Func<string, Task> send, double now)
    {
        var due = new List<(long Id, string Payload, int Attempts)>();
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = """
                SELECT id, payload, attempts FROM outbox
                WHERE sent IS NULL AND attempts < $max AND (next_attempt IS NULL OR next_attempt <= $now)
                ORDER BY id LIMIT 20
                """;
            cmd.Parameters.AddWithValue("$max", MaxAttempts);
            cmd.Parameters.AddWithValue("$now", now);
            using var r = cmd.ExecuteReader();
            while (r.Read()) due.Add((r.GetInt64(0), r.GetString(1), r.GetInt32(2)));
        }
        var delivered = 0;
        foreach (var (id, payload, prior) in due)
        {
            var attempts = prior + 1;
            try
            {
                await send(payload);
                Execute(conn, null, "UPDATE outbox SET attempts = $a, sent = $b, last_error = NULL WHERE id = $c", attempts, now, id);
                delivered++;
            }
            catch (Exception ex) // the receiver is down: keep the message, try later
            {
                Execute(conn, null, "UPDATE outbox SET attempts = $a, next_attempt = $b, last_error = $c WHERE id = $d",
                    attempts, now + BackoffSeconds(attempts), ex.Message, id);
            }
        }
        return delivered;
    }
    // #endregion

    private static void Execute(SqliteConnection conn, SqliteTransaction? tx, string sql, params object[] values)
    {
        using var cmd = conn.CreateCommand();
        cmd.Transaction = tx;
        cmd.CommandText = sql;
        for (var i = 0; i < values.Length; i++) cmd.Parameters.AddWithValue("$" + (char)('a' + i), values[i]);
        cmd.ExecuteNonQuery();
    }
}
