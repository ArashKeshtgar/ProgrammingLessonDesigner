namespace Portfolio;

public record Settings(string JwtSecret, string JwtRefreshSecret, string DbPath);

public static class Config
{
    private const int MinSecretLength = 32;

    // #region config
    public static string RequireSecret(IDictionary<string, string?> env, string name)
    {
        // No fallback value: a missing secret stops the app at startup, not on the first login.
        var value = env.TryGetValue(name, out var v) ? v ?? "" : "";
        if (value.Length < MinSecretLength)
            throw new InvalidOperationException($"{name} must be set to a random value of at least {MinSecretLength} characters.");
        return value;
    }

    public static Settings Load(IDictionary<string, string?> env)
    {
        var access = RequireSecret(env, "JWT_SECRET");
        var refresh = RequireSecret(env, "JWT_REFRESH_SECRET");
        if (access == refresh)
            throw new InvalidOperationException("JWT_SECRET and JWT_REFRESH_SECRET must be different values.");
        return new(access, refresh, env.TryGetValue("DB_PATH", out var db) && db is not null ? db : "portfolio.db");
    }
    // #endregion
}
