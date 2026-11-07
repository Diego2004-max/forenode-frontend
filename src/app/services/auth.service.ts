import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { SessionResponse } from '../models/api.models';

interface StoredSession {
  token: string;
  expiresAt: number;
  fullName: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'forenode.session';

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  login(email: string, password: string): Observable<SessionResponse> {
    const body = new URLSearchParams({ username: email, password });
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post<SessionResponse>(`${environment.apiBaseUrl}/auth/login`, body.toString(), { headers })
      .pipe(tap((response) => this.saveApiSession(response)));
  }

  register(fullName: string, email: string, password: string): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(`${environment.apiBaseUrl}/auth/register`, {
      full_name: fullName,
      email,
      password
    }).pipe(tap((response) => this.saveApiSession(response)));
  }

  startGoogleOAuth(): void {
    const redirect = `${window.location.origin}/login`;
    window.location.assign(`${environment.supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirect)}`);
  }

  captureOAuthCallback(hash: string): boolean {
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const token = params.get('access_token');
    const expiresIn = Number(params.get('expires_in') ?? 3600);
    if (!token) return false;
    this.saveSession({ token, expiresAt: Date.now() + expiresIn * 1000, fullName: 'Analista', email: '' });
    history.replaceState(null, '', location.pathname);
    return true;
  }

  token(): string | null {
    const session = this.session();
    return session && session.expiresAt > Date.now() ? session.token : null;
  }

  isAuthenticated(): boolean {
    return this.token() !== null;
  }

  userName(): string {
    return this.session()?.fullName || 'Analista';
  }

  logout(redirect = true): void {
    sessionStorage.removeItem(this.storageKey);
    if (redirect) void this.router.navigate(['/login']);
  }

  private saveApiSession(response: SessionResponse): void {
    this.saveSession({
      token: response.access_token,
      expiresAt: Date.now() + response.expires_in * 1000,
      fullName: response.full_name,
      email: response.email
    });
  }

  private saveSession(session: StoredSession): void {
    sessionStorage.setItem(this.storageKey, JSON.stringify(session));
  }

  private session(): StoredSession | null {
    try {
      const value = sessionStorage.getItem(this.storageKey);
      return value ? JSON.parse(value) as StoredSession : null;
    } catch {
      sessionStorage.removeItem(this.storageKey);
      return null;
    }
  }
}

