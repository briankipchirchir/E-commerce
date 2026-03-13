import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, UpdateProfileRequest, UpdatePasswordRequest } from '../../../../core/services/AuthService';
import { ToastService } from '../../../../core/services/ToastService';

type Tab = 'profile' | 'password' | 'addresses' | 'preferences';

interface Address {
  id: string; label: string; street: string; city: string;
  county: string; postalCode: string; country: string; isDefault: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  activeTab = signal<Tab>('profile');
  savedProfile = signal(false);
  savedPassword = signal(false);
  showCurrentPwd = signal(false);
  showNewPwd = signal(false);
  showConfirmPwd = signal(false);
  addingAddress = signal(false);
  pwdError = signal('');
  loadingProfile = signal(false);
  loadingPassword = signal(false);

  profile = {
    firstName: this.authService.currentUser()?.firstName || '',
    lastName: this.authService.currentUser()?.lastName || '',
    email: this.authService.currentUser()?.email || '',
    phone: ''
  };

  passwords = { current: '', newPwd: '', confirm: '' };

  addresses = signal<Address[]>([
    { id: '1', label: 'Home', street: '123 Kenyatta Avenue, Apt 4B', city: 'Nairobi',
      county: 'Nairobi County', postalCode: '00100', country: 'Kenya', isDefault: true },
  ]);

  newAddress: Address = { id: '', label: '', street: '', city: '', county: '',
    postalCode: '', country: 'Kenya', isDefault: false };
  preferences = { newsletter: true, orderUpdates: true, promotions: false, smsAlerts: true };

  ngOnInit(): void {
    // Load fresh profile data from backend
    this.authService.getProfile().subscribe({
      next: (response) => {
        if (response.success) {
          this.profile.firstName = response.data.firstName;
          this.profile.lastName = response.data.lastName;
          this.profile.email = response.data.email;
          this.profile.phone = response.data.phone || '';
        }
      },
      error: () => {}
    });
  }

  get initials(): string {
    const f = this.profile.firstName?.[0] || '';
    const l = this.profile.lastName?.[0] || '';
    return (f + l).toUpperCase() || '?';
  }

  saveProfile(): void {
    if (!this.profile.firstName || !this.profile.lastName) {
      this.toastService.warning('First name and last name are required.');
      return;
    }

    this.loadingProfile.set(true);
    const request: UpdateProfileRequest = {
      firstName: this.profile.firstName,
      lastName: this.profile.lastName,
      phone: this.profile.phone
    };

    this.authService.updateProfile(request).subscribe({
      next: (response) => {
        this.loadingProfile.set(false);
        if (response.success) {
          this.savedProfile.set(true);
          this.toastService.success('Profile updated successfully!');
          setTimeout(() => this.savedProfile.set(false), 2500);
        }
      },
      error: (err) => {
        this.loadingProfile.set(false);
        this.toastService.error(err.error?.message || 'Failed to update profile.');
      }
    });
  }

  savePassword(): void {
    this.pwdError.set('');
    if (!this.passwords.current) {
      this.pwdError.set('Enter your current password.');
      this.toastService.error('Enter your current password.');
      return;
    }
    if (this.passwords.newPwd.length < 6) {
      this.pwdError.set('New password must be at least 6 characters.');
      this.toastService.error('New password must be at least 6 characters.');
      return;
    }
    if (this.passwords.newPwd !== this.passwords.confirm) {
      this.pwdError.set('Passwords do not match.');
      this.toastService.error('Passwords do not match.');
      return;
    }

    this.loadingPassword.set(true);
    const request: UpdatePasswordRequest = {
      currentPassword: this.passwords.current,
      newPassword: this.passwords.newPwd
    };

    this.authService.updatePassword(request).subscribe({
      next: (response) => {
        this.loadingPassword.set(false);
        if (response.success) {
          this.passwords = { current: '', newPwd: '', confirm: '' };
          this.savedPassword.set(true);
          this.toastService.success('Password updated successfully!');
          setTimeout(() => this.savedPassword.set(false), 2500);
        }
      },
      error: (err) => {
        this.loadingPassword.set(false);
        const msg = err.error?.message || 'Failed to update password.';
        this.pwdError.set(msg);
        this.toastService.error(msg);
      }
    });
  }

  savePreferences(): void {
    this.toastService.success('Notification preferences saved!');
  }

  logout(): void {
    this.authService.logout();
    this.toastService.info('You have been logged out.');
  }

  get pwdStrength(): { label: string; color: string; width: string } {
    const p = this.passwords.newPwd;
    if (!p) return { label: '', color: '#e2e8f0', width: '0%' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const map = [
      { label: 'Weak',   color: '#ef4444', width: '25%'  },
      { label: 'Fair',   color: '#f59e0b', width: '50%'  },
      { label: 'Good',   color: '#3b82f6', width: '75%'  },
      { label: 'Strong', color: '#10b981', width: '100%' },
    ];
    return map[Math.max(0, score - 1)];
  }

  setDefault(id: string): void {
    this.addresses.update(list => list.map(a => ({ ...a, isDefault: a.id === id })));
    this.toastService.success('Default address updated!');
  }

  removeAddress(id: string): void {
    this.addresses.update(list => list.filter(a => a.id !== id));
    this.toastService.info('Address removed.');
  }

  addAddress(): void {
    if (!this.newAddress.street || !this.newAddress.city) {
      this.toastService.warning('Please fill in street and city.');
      return;
    }
    this.addresses.update(list => [...list, {
      ...this.newAddress,
      id: Date.now().toString(),
      isDefault: list.length === 0
    }]);
    this.newAddress = { id: '', label: '', street: '', city: '', county: '',
      postalCode: '', country: 'Kenya', isDefault: false };
    this.addingAddress.set(false);
    this.toastService.success('Address added successfully!');
  }
}
