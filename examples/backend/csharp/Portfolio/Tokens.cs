using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Portfolio;

public record User(int Id, string Username, string Role)
{
    public int TokenVersion { get; set; }
}

public record TokenPair(string AccessToken, string RefreshToken);

public class AuthException(string message) : Exception(message);

// #region tokens
public class TokenService
{
    private const int MinSecretLength = 32;
    private static readonly TimeSpan AccessTtl = TimeSpan.FromMinutes(15);
    private static readonly TimeSpan RefreshTtl = TimeSpan.FromDays(7);

    private readonly SymmetricSecurityKey access, refresh;
    private readonly Func<int, User?> findUser;
    // MapInboundClaims = false keeps "role" as "role" instead of the long ClaimTypes.Role URI.
    private readonly JwtSecurityTokenHandler handler = new() { MapInboundClaims = false };

    // Two secrets: a refresh token can never verify as an access token, even before `typ` is read.
    public TokenService(string accessSecret, string refreshSecret, Func<int, User?> findUser)
    {
        if (Math.Min(accessSecret.Length, refreshSecret.Length) < MinSecretLength)
            throw new ArgumentException($"JWT secrets must be at least {MinSecretLength} characters.");
        if (accessSecret == refreshSecret)
            throw new ArgumentException("The access and refresh secrets must be different.");
        access = new(Encoding.UTF8.GetBytes(accessSecret));
        refresh = new(Encoding.UTF8.GetBytes(refreshSecret));
        this.findUser = findUser;
    }

    public TokenPair Issue(User user) => new(
        Write(access, AccessTtl, new("sub", user.Id.ToString()), new("role", user.Role), new("typ", "access")),
        Write(refresh, RefreshTtl, new("sub", user.Id.ToString()), new("typ", "refresh"),
            new("tv", user.TokenVersion.ToString(), ClaimValueTypes.Integer32)));

    public ClaimsPrincipal VerifyAccess(string token)
    {
        var principal = Verify(token, access, "Invalid or expired token.");
        if (principal.FindFirstValue("typ") != "access") throw new AuthException("Not an access token.");
        return principal;
    }

    public TokenPair Refresh(string token)
    {
        var principal = Verify(token, refresh, "Invalid or expired refresh token.");
        if (principal.FindFirstValue("typ") != "refresh") throw new AuthException("Not a refresh token.");
        // Re-read the user: a deleted user, a new role or a logout (TokenVersion bump) applies now.
        var user = findUser(int.Parse(principal.FindFirstValue("sub")!));
        if (user is null || user.TokenVersion.ToString() != principal.FindFirstValue("tv"))
            throw new AuthException("Refresh token has been revoked.");
        return Issue(user);
    }

    private string Write(SecurityKey key, TimeSpan ttl, params Claim[] claims) =>
        handler.WriteToken(new JwtSecurityToken(claims: claims, expires: DateTime.UtcNow.Add(ttl),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)));

    private ClaimsPrincipal Verify(string token, SecurityKey key, string error)
    {
        try
        {
            return handler.ValidateToken(token, new TokenValidationParameters
            {
                IssuerSigningKey = key,
                ValidAlgorithms = [SecurityAlgorithms.HmacSha256], // never let the token choose its algorithm
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero,
            }, out _);
        }
        catch (Exception ex) when (ex is SecurityTokenException or ArgumentException)
        {
            throw new AuthException(error);
        }
    }
}
// #endregion
