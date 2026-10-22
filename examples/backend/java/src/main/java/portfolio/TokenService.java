package portfolio;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Objects;
import java.util.function.IntFunction;
import javax.crypto.SecretKey;

public class TokenService {
    public static final class User {
        public final int id;
        public final String username;
        public final String role;
        public int tokenVersion;

        public User(int id, String username, String role) {
            this.id = id;
            this.username = username;
            this.role = role;
        }
    }

    public record TokenPair(String accessToken, String refreshToken) {}

    public static class AuthException extends RuntimeException {
        public AuthException(String message) {
            super(message);
        }
    }

    // #region tokens
    private static final int MIN_SECRET_LENGTH = 32;
    private static final Duration ACCESS_TTL = Duration.ofMinutes(15);
    private static final Duration REFRESH_TTL = Duration.ofDays(7);

    private final SecretKey access;
    private final SecretKey refresh;
    private final IntFunction<User> findUser;

    // Two secrets: a refresh token can never verify as an access token, even before `typ` is read.
    public TokenService(String accessSecret, String refreshSecret, IntFunction<User> findUser) {
        if (Math.min(accessSecret.length(), refreshSecret.length()) < MIN_SECRET_LENGTH)
            throw new IllegalArgumentException("JWT secrets must be at least " + MIN_SECRET_LENGTH + " characters.");
        if (accessSecret.equals(refreshSecret))
            throw new IllegalArgumentException("The access and refresh secrets must be different.");
        this.access = Keys.hmacShaKeyFor(accessSecret.getBytes(StandardCharsets.UTF_8));
        this.refresh = Keys.hmacShaKeyFor(refreshSecret.getBytes(StandardCharsets.UTF_8));
        this.findUser = findUser;
    }

    public TokenPair issue(User user) {
        var now = Instant.now();
        var accessToken = Jwts.builder().subject(String.valueOf(user.id))
                .claim("role", user.role).claim("typ", "access")
                .expiration(Date.from(now.plus(ACCESS_TTL))).signWith(access).compact();
        var refreshToken = Jwts.builder().subject(String.valueOf(user.id))
                .claim("typ", "refresh").claim("tv", user.tokenVersion)
                .expiration(Date.from(now.plus(REFRESH_TTL))).signWith(refresh).compact();
        return new TokenPair(accessToken, refreshToken);
    }

    public Claims verifyAccess(String token) {
        var claims = parse(token, access, "Invalid or expired token.");
        if (!"access".equals(claims.get("typ"))) throw new AuthException("Not an access token.");
        return claims;
    }

    public TokenPair refresh(String token) {
        var claims = parse(token, refresh, "Invalid or expired refresh token.");
        if (!"refresh".equals(claims.get("typ"))) throw new AuthException("Not a refresh token.");
        // Re-read the user: a deleted user, a new role or a logout (tokenVersion bump) applies now.
        var user = findUser.apply(Integer.parseInt(claims.getSubject()));
        if (user == null || !Objects.equals(user.tokenVersion, claims.get("tv", Integer.class)))
            throw new AuthException("Refresh token has been revoked.");
        return issue(user);
    }

    private static Claims parse(String token, SecretKey key, String error) {
        try {
            // verifyWith(SecretKey) only accepts HMAC-signed tokens: the token can't choose "none" or RSA.
            return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new AuthException(error);
        }
    }
    // #endregion
}
