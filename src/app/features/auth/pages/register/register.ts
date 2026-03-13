import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, RegisterRequest } from '../../../../core/services/AuthService';
import { ToastService } from '../../../../core/services/ToastService';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  showPassword = false;
  agreedToTerms = false;
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  get strengthScore(): number {
    const p = this.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8)           score++;
    if (/[A-Z]/.test(p))         score++;
    if (/[0-9]/.test(p))         score++;
    if (/[^A-Za-z0-9]/.test(p))  score++;
    return score;
  }
  get strengthPercent(): number { return (this.strengthScore / 4) * 100; }
  get strengthClass(): string {
    return ['', 'weak', 'fair', 'good', 'strong'][this.strengthScore] || 'weak';
  }
  get strengthLabel(): string {
    return ['', 'Weak', 'Fair', 'Good', 'Strong'][this.strengthScore] || 'Weak';
  }

  onSubmit(): void {
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.error = 'Please fill in all fields.';
      this.toastService.warning('Please fill in all fields.');
      return;
    }
    if (!this.agreedToTerms) {
      this.error = 'Please agree to the Terms of Service to continue.';
      this.toastService.warning('Please agree to the Terms of Service.');
      return;
    }
    if (this.strengthScore < 2) {
      this.error = 'Please choose a stronger password.';
      this.toastService.warning('Please choose a stronger password.');
      return;
    }

    this.loading = true;
    this.error = '';

    const request: RegisterRequest = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    };

    this.authService.register(request).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.toastService.success('Account created successfully!');
          setTimeout(() => this.router.navigate(['/auth/login']), 1500);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed. Please try again.';
        this.toastService.error(this.error);
      }
    });
  }
}
