import jwt from 'jsonwebtoken';

export const ACCESS_TTL = '15m';
export const REFRESH_TTL = '7d';
const MIN_SECRET_LENGTH = 32;

export interface User {
  id: number;
  username: string;
  role: 'Admin' | 'Viewer';
  tokenVersion: number;
}

export interface AccessClaims {
  sub: string;
  role: User['role'];
  typ: 'access';
}

export class AuthError extends Error {}

// #region tokens
export class TokenService {
  // Two secrets: a refresh token can never verify as an access token, even before `typ` is read.
  constructor(
    private readonly accessSecret: string,
    private readonly refreshSecret: string,
    private readonly findUser: (id: number) => User | undefined,
  ) {
    if (Math.min(accessSecret.length, refreshSecret.length) < MIN_SECRET_LENGTH)
      throw new Error(`JWT secrets must be at least ${MIN_SECRET_LENGTH} characters.`);
    if (accessSecret === refreshSecret) throw new Error('The access and refresh secrets must be different.');
  }

  issue(user: User) {
    return {
      accessToken: jwt.sign({ sub: String(user.id), role: user.role, typ: 'access' }, this.accessSecret, {
        expiresIn: ACCESS_TTL,
        algorithm: 'HS256',
      }),
      refreshToken: jwt.sign({ sub: String(user.id), typ: 'refresh', tv: user.tokenVersion }, this.refreshSecret, {
        expiresIn: REFRESH_TTL,
        algorithm: 'HS256',
      }),
    };
  }

  verifyAccess(token: string): AccessClaims {
    let claims: jwt.JwtPayload;
    try {
      // algorithms is required: never let the token choose its own algorithm.
      claims = jwt.verify(token, this.accessSecret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    } catch {
      throw new AuthError('Invalid or expired token.');
    }
    if (claims.typ !== 'access') throw new AuthError('Not an access token.');
    return claims as unknown as AccessClaims;
  }

  refresh(token: string) {
    let claims: jwt.JwtPayload;
    try {
      claims = jwt.verify(token, this.refreshSecret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    } catch {
      throw new AuthError('Invalid or expired refresh token.');
    }
    if (claims.typ !== 'refresh') throw new AuthError('Not a refresh token.');
    // Re-read the user: a deleted user, a new role or a logout (tokenVersion bump) applies now.
    const user = this.findUser(Number(claims.sub));
    if (!user || user.tokenVersion !== claims.tv) throw new AuthError('Refresh token has been revoked.');
    return this.issue(user);
  }
}
// #endregion
