package portfolio;

import java.util.Map;

public final class Config {
    private static final int MIN_SECRET_LENGTH = 32;

    public record Settings(String jwtSecret, String jwtRefreshSecret, String dbPath) {}

    private Config() {}

    // #region config
    public static String requireSecret(Map<String, String> env, String name) {
        // No fallback value: a missing secret stops the app at startup, not on the first login.
        var value = env.getOrDefault(name, "");
        if (value.length() < MIN_SECRET_LENGTH)
            throw new IllegalStateException(name + " must be set to a random value of at least " + MIN_SECRET_LENGTH + " characters.");
        return value;
    }

    public static Settings load(Map<String, String> env) {
        var access = requireSecret(env, "JWT_SECRET");
        var refresh = requireSecret(env, "JWT_REFRESH_SECRET");
        if (access.equals(refresh))
            throw new IllegalStateException("JWT_SECRET and JWT_REFRESH_SECRET must be different values.");
        return new Settings(access, refresh, env.getOrDefault("DB_PATH", "portfolio.db"));
    }
    // #endregion
}
