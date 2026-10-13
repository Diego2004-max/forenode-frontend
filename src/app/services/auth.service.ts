import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = '(https://forenode-backend-odh7.onrender.com/api/v1/';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any): Observable<any> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    return this.http.post<any>(`${this.API_URL}/login`, formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap(res => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('user_name', res.full_name);
        localStorage.setItem('user_email', res.email);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/register`, data).pipe(
      tap(res => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('user_name', res.full_name);
        localStorage.setItem('user_email', res.email);
      })
    );
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserName(): string {
    return localStorage.getItem('user_name') || 'Analista Agrónomo';
  }
}