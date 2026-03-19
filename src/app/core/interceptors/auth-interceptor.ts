import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/AuthService';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const isAuthEndpoint =
          req.url.includes('/auth/login')    ||
          req.url.includes('/auth/register') ||
          req.url.includes('/auth/logout')   ||
          req.url.includes('/auth/refresh');

        // ← only logout if token is actually missing/expired
        // NOT on every 401 (some are permission errors, not auth errors)
        if (!isAuthEndpoint) {
          const token = authService.getAccessToken();
          if (!token) {
            authService.logout();
            router.navigate(['/auth/login']);
          }
        }
      }
      return throwError(() => error);
    })
  );
};