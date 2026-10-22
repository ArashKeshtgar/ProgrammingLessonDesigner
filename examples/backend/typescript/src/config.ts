const MIN_SECRET_LENGTH = 32;

// #region config
export function requireSecret(env: Record<string, string | undefined>, name: string): string {
  // No fallback value: a missing secret stops the app at startup, not on the first login.
  const value = env[name] ?? '';
  if (value.length < MIN_SECRET_LENGTH)
    throw new Error(`${name} must be set to a random value of at least ${MIN_SECRET_LENGTH} characters.`);
  return value;
}

export function loadSettings(env: Record<string, string | undefined> = process.env) {
  const jwtSecret = requireSecret(env, 'JWT_SECRET');
  const jwtRefreshSecret = requireSecret(env, 'JWT_REFRESH_SECRET');
  if (jwtSecret === jwtRefreshSecret) throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different values.');
  return { jwtSecret, jwtRefreshSecret, port: Number(env.PORT ?? 8080) };
}
// #endregion
