import { HttpClient, HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { CanActivateFn, Router, Routes } from '@angular/router'
import { Observable, catchError, finalize, map, shareReplay, switchMap, tap, throwError } from 'rxjs'
import type { Role } from '../shared/model'
import { API_BASE } from './projects.service'

interface TokenPair {
  accessToken: string
  refreshToken: string
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient)
  // One refresh shared by every request that hit 401 at the same time.
  private refreshInFlight: Observable<string> | null = null
  role: Role | null = null

  get token() {
    return localStorage.getItem('access')
  }

  get hasRefreshToken() {
    return !!localStorage.getItem('refresh')
  }

  refreshAccessToken(): Observable<string> {
    this.refreshInFlight ??= this.http
      .post<TokenPair>(`${API_BASE}/auth/refresh`, { refreshToken: localStorage.getItem('refresh') })
      .pipe(
        tap((pair) => (localStorage.setItem('access', pair.accessToken), localStorage.setItem('refresh', pair.refreshToken))),
        map((pair) => pair.accessToken),
        finalize(() => (this.refreshInFlight = null)),
        shareReplay(1), // late subscribers get the same result instead of starting a new request
      )
    return this.refreshInFlight
  }

  clearSession() {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    this.role = null
  }
}

// #region interceptor
const isAuthEndpoint = (req: HttpRequest<unknown>) => req.url.startsWith(`${API_BASE}/auth/`)
const withToken = (req: HttpRequest<unknown>, token: string) => req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })

// Registered once with provideHttpClient(withInterceptors([authInterceptor])); every HttpClient call passes through.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService)
  const router = inject(Router)
  // login/refresh must never trigger another refresh (that would loop).
  if (isAuthEndpoint(req) || !auth.token) return next(req)

  return next(withToken(req, auth.token)).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401 || !auth.hasRefreshToken) return throwError(() => err)
      return auth.refreshAccessToken().pipe(
        switchMap((token) => next(withToken(req, token))),
        catchError((refreshErr) => {
          auth.clearSession()
          router.navigate(['/login'])
          return throwError(() => refreshErr)
        }),
      )
    }),
  )
}
// #endregion

// #region guard
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService)
  // Returning a UrlTree redirects; the page never renders for a Viewer.
  return auth.role === 'Admin' ? true : inject(Router).createUrlTree(['/dashboard'])
}

export const routes: Routes = [
  { path: 'dashboard', loadComponent: () => import('./status-card.component').then((m) => m.StatusListComponent) },
  {
    path: 'projects/new',
    canActivate: [adminGuard],
    loadComponent: () => import('./project-form.component').then((m) => m.ProjectFormComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
]
// #endregion
