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
    <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div class="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
        <div>
          <h2 class="text-center text-3xl font-extrabold text-slate-900 dark:text-white">Crear Cuenta</h2>
          <p class="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">Únete al motor analítico de Forenode AI</p>
        </div>
        <form class="mt-8 space-y-6" (ngSubmit)="onRegister()">
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre Completo</label>
              <input [(ngModel)]="fullName" name="fullName" type="text" required class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white dark:bg-slate-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Diego Mallama">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico</label>
              <input [(ngModel)]="email" name="email" type="email" required class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white dark:bg-slate-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="analista@forenode.ai">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
              <input [(ngModel)]="password" name="password" type="password" required class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white dark:bg-slate-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="••••••••">
            </div>
          </div>
          <div *ngIf="errorMessage" class="text-red-500 text-sm text-center font-medium">{{ errorMessage }}</div>
          <div>
            <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md">Registrarse</button>
          </div>
          <div class="text-center text-sm">
            <span class="text-slate-600 dark:text-slate-400">¿Ya tienes cuenta? </span>
            <a routerLink="/login" class="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Inicia sesión</a>
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