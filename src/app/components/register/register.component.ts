import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: var(--bg-primary); padding: 1rem;">
      <div style="max-width: 420px; width: 100%; background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1.5rem; padding: 2.5rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 800; color: var(--text-main); margin: 0 0 0.5rem 0;">Crear Cuenta</h2>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin: 0;">Únete al motor analítico de Forenode AI</p>
        </div>

        <form (ngSubmit)="onRegister()" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.5rem;">Nombre Completo</label>
            <input [(ngModel)]="fullName" name="fullName" type="text" required placeholder="Diego Mallama" 
              style="width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid var(--border-color); background-color: var(--bg-primary); color: var(--text-main); font-size: 0.875rem; outline: none; box-sizing: border-box;">
          </div>

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
            Registrarse
          </button>

          <div style="text-align: center; font-size: 0.875rem; margin-top: 0.5rem;">
            <span style="color: var(--text-muted);">¿Ya tienes cuenta? </span>
            <a routerLink="/login" style="color: var(--primary-color); font-weight: 600; text-decoration: none;">Inicia sesión</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    this.authService.register({ full_name: this.fullName, email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => this.errorMessage = err.error?.detail || 'Error en el registro'
    });
  }
}