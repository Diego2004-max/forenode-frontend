import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({ selector: 'app-login', standalone: true, imports: [ReactiveFormsModule, RouterLink], templateUrl: './login.component.html' })
export class LoginComponent implements OnInit {
  readonly loading = signal(false);
  readonly error = signal('');
  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] })
  });
  constructor(private readonly auth: AuthService, private readonly router: Router) {}
  ngOnInit(): void { if (this.auth.captureOAuthCallback(location.hash)) void this.router.navigate(['/dashboard']); }
  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).pipe(timeout(20000), finalize(() => this.loading.set(false))).subscribe({
      next: () => void this.router.navigate(['/dashboard']),
      error: (error: HttpErrorResponse) => { this.error.set(error.error?.detail ?? 'No fue posible iniciar sesión.'); this.loading.set(false); }
    });
  }
  google(): void { this.auth.startGoogleOAuth(); }
}

