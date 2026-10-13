import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: var(--bg-primary); padding: 1rem;">
      <div style="max-width: 420px; width: 100%; background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1.5rem; padding: 2.5rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background-color: #4f46e5; color: white; font-weight: bold; border-radius: 1rem; font-size: 1.25rem; margin-bottom: 1rem; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);">F</div>
          <h2 style="font-size: 1.75rem; font-weight: 800; color: var(--text-main); margin: 0 0 0.5rem 0;">Forenode AI</h2>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin: 0;">Plataforma Global de Inteligencia Logística Agrícola</p>
        </div>

        <!-- Botón de Inicio de Sesión con Google -->
        <button (click)="loginWithGoogle()" style="width: 100%; padding: 0.75rem 1rem; background-color: #ffffff; color: #374151; font-weight: 600; border-radius: 0.75rem; border: 1px solid var(--border-color); cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 0.75rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); transition: background-color 0.2s; margin-bottom: 1.5rem;">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.23 24 12 24z"/>
            <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.18C.43 8.12 0 9.82 0 12s.43 3.88 1.18 5.4l4.09-3.16z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.15 2.68 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
          </svg>
          <span>Continuar con Google</span>
        </button>

        <div style="display: flex; align-items: center; text-align: center; margin-bottom: 1.5rem; color: var(--text-muted); font-size: 0.75rem;">
          <div style="flex: 1; border-bottom: 1px solid var(--border-color);"></div>
          <span style="padding: 0 0.75rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">O con correo</span>
          <div style="flex: 1; border-bottom: 1px solid var(--border-color);"></div>
        </div>

        <form (ngSubmit)="onLogin()" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.5rem;">Correo Electrónico</label>
            <input [(ngModel)]="email" name="email" type="email" required placeholder="analista@forenode.ai" 
              style="width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid var(--border-color); background-color: var(--bg-primary); color: var(--text-main); font-size: 0.875rem; outline: none; box-sizing: border-box;">
          </div>

          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.5rem;">Contraseña</label>
            <input [(ngModel)]="password" name="password" type="password" required placeholder="••••••••" 
              style="width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid var(--border-color); background-color: var(--bg-primary); color: var(--text-main); font-size: 0.875rem; outline: none; box-sizing: border-box;">
          </div>

          <div *ngIf="errorMessage" style="padding: 0.75rem; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 0.75rem; color: #ef4444; font-size: 0.875rem; text-align: center; font-weight: 500;">
            {{ errorMessage }}
          </div>

          <button type="submit" style="width: 100%; padding: 0.875rem; background-color: var(--primary-color); color: white; font-weight: 600; border-radius: 0.75rem; border: none; cursor: pointer; font-size: 0.95rem; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
            Iniciar Sesión
          </button>

          <div style="text-align: center; font-size: 0.875rem; margin-top: 0.5rem;">
            <span style="color: var(--text-muted);">¿No tienes cuenta? </span>
            <a routerLink="/register" style="color: var(--primary-color); font-weight: 600; text-decoration: none;">Regístrate aquí</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => this.errorMessage = err.error?.detail || 'Credenciales incorrectas'
    });
  }

  loginWithGoogle() {
    // Simulación corporativa fluida de autenticación OAuth con Google
    // O puedes enlazarlo al endpoint de Supabase Auth con Google si lo prefieres
    localStorage.setItem('forenode_token', 'google_oauth_mock_token_verified');
    localStorage.setItem('forenode_user', 'Analista Google');
    this.router.navigate(['/dashboard']);
  }
}