import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PagedResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiGatewayUrl;

  get<T>(path: string, params?: Record<string, any>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http
      .get<T>(`${this.base}${path}`, { params: httpParams })
      .pipe(retry(1), catchError(this.handleError));
  }

  getPaged<T>(path: string, params?: Record<string, any>): Observable<PagedResponse<T>> {
    return this.get<PagedResponse<T>>(path, params);
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http
      .post<T>(`${this.base}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http
      .put<T>(`${this.base}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  patch<T>(path: string, body: any): Observable<T> {
    return this.http
      .patch<T>(`${this.base}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<T>(`${this.base}${path}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred';
    if      (error.status === 0)   message = 'Network error — check your connection';
    else if (error.status === 401) message = 'Unauthorized — please log in again';
    else if (error.status === 403) message = 'Forbidden — insufficient permissions';
    else if (error.status === 404) message = 'Resource not found';
    else if (error.status === 429) message = 'Too many requests — please slow down';
    else if (error.status >= 500)  message = 'Server error — please try again later';
    else if (error.error?.message) message = error.error.message;
    return throwError(() => ({ ...error, userMessage: message }));
  }
}