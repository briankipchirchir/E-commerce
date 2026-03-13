import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, LoginRequest } from '../../../../core/services/AuthService';
import { ToastService } from '../../../../core/services/ToastService';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  showPassword = signal(false);
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields.';
      this.toastService.warning('Please fill in all fields.');
      return;
    }
    this.loading = true;
    this.error = '';

    const request: LoginRequest = { email: this.email, password: this.password };

    this.authService.login(request).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.toastService.success(`Welcome back, ${response.data.firstName}!`);
          setTimeout(() => {
            response.data.role === 'ADMIN'
              ? this.router.navigate(['/admin'])
              : this.router.navigate(['/']);
          }, 1000);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Invalid email or password.';
        this.toastService.error(this.error);
      }
    });
  }
}
