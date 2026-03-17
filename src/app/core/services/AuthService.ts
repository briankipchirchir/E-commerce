import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UserProfileResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
  timestamp: string;
}

export interface CurrentUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly AUTH_URL = `${environment.apiGatewayUrl}/api/auth`;

  private _currentUser = signal<CurrentUser | null>(this.loadUserFromStorage());
  private _isLoggedIn = computed(() => this._currentUser() !== null);

  currentUser = this._currentUser.asReadonly();
  isLoggedIn = this._isLoggedIn;

  constructor(private http: HttpClient, private router: Router) {}

  register(request: RegisterRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.AUTH_URL}/register`, request);
  }

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.AUTH_URL}/login`, request)
      .pipe(tap(response => {
        if (response.success && response.data) {
          this.saveSession(response.data);
        }
      }));
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      this.http.post(`${this.AUTH_URL}/logout?refreshToken=${refreshToken}`, {})
        .subscribe({ error: () => {} });
    }
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  getProfile(): Observable<ApiResponse<UserProfileResponse>> {
    const userId = this._currentUser()?.userId;
    return this.http.get<ApiResponse<UserProfileResponse>>(`${this.AUTH_URL}/me/${userId}`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<ApiResponse<UserProfileResponse>> {
    const userId = this._currentUser()?.userId;
    return this.http.put<ApiResponse<UserProfileResponse>>(
      `${this.AUTH_URL}/profile/${userId}`, request
    ).pipe(tap(response => {
      if (response.success && response.data) {
        const current = this._currentUser();
        if (current) {
          const updated: CurrentUser = {
            ...current,
            firstName: response.data.firstName,
            lastName: response.data.lastName
          };
          localStorage.setItem('user', JSON.stringify(updated));
          this._currentUser.set(updated);
        }
      }
    }));
  }

  updatePassword(request: UpdatePasswordRequest): Observable<ApiResponse<void>> {
    const userId = this._currentUser()?.userId;
    return this.http.put<ApiResponse<void>>(
      `${this.AUTH_URL}/password/${userId}`, request
    );
    
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAdmin(): boolean {
    return this._currentUser()?.role === 'ADMIN';
  }

  private saveSession(data: AuthResponse): void {
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    const user: CurrentUser = {
      userId: data.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role
    };
    localStorage.setItem('user', JSON.stringify(user));
    this._currentUser.set(user);
  }

  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this._currentUser.set(null);
  }

  private loadUserFromStorage(): CurrentUser | null {
    if (typeof window === "undefined") return null;
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  getUsers(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.AUTH_URL}/users`);
  }
}

