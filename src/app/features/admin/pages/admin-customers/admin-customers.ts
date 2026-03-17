import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/AuthService';
import { ToastService } from '../../../../core/services/ToastService';

interface Customer {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  enabled: boolean;
  createdAt: number;
}

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './admin-customers.html',
  styleUrl: './admin-customers.css'
})
export class AdminCustomers implements OnInit {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  search = signal('');
  selectedRole = signal('');
  selectedStatus = signal('');
  loading = signal(true);

  customers = signal<Customer[]>([]);

  ngOnInit(): void { this.loadCustomers(); }

  loadCustomers(): void {
    this.loading.set(true);
    this.authService.getUsers().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) this.customers.set(res.data);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load customers.');
      }
    });
  }

  filtered = computed(() => {
    let list = this.customers();
    const q = this.search().toLowerCase();
    if (q) list = list.filter(c =>
      c.email?.toLowerCase().includes(q) ||
      c.firstName?.toLowerCase().includes(q) ||
      c.lastName?.toLowerCase().includes(q)
    );
    if (this.selectedRole()) list = list.filter(c => c.role === this.selectedRole());
    if (this.selectedStatus() === 'active')   list = list.filter(c => c.enabled);
    if (this.selectedStatus() === 'inactive') list = list.filter(c => !c.enabled);
    return list;
  });

  getInitials(c: Customer): string {
    return ((c.firstName?.[0] || '') + (c.lastName?.[0] || '')).toUpperCase() || c.email?.[0]?.toUpperCase() || '?';
  }

  getFullName(c: Customer): string {
    return `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email;
  }

  getJoinDate(c: Customer): string {
    if (!c.createdAt) return 'N/A';
    return new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  get totalCustomers() { return this.customers().length; }
  get activeCount()    { return this.customers().filter(c => c.enabled).length; }
  get adminCount()     { return this.customers().filter(c => c.role === 'ADMIN').length; }
}
