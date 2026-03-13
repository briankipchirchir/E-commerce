import { Component, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs/operators';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {
  private router = inject(Router);

  sidebarCollapsed = signal(false);
  currentRoute = signal('');

  navItems: NavItem[] = [
    { label: 'Dashboard',  icon: 'dashboard',       route: '/admin' },
    { label: 'Products',   icon: 'inventory_2',     route: '/admin/products' },
    { label: 'Orders',     icon: 'receipt_long',    route: '/admin/orders',   badge: 4 },
    { label: 'Customers',  icon: 'people',          route: '/admin/customers' },
    { label: 'Categories', icon: 'category',        route: '/admin/categories' },
  ];

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => this.currentRoute.set(e.urlAfterRedirects));
    this.currentRoute.set(this.router.url);
  }

  isActive(route: string): boolean {
    const cur = this.currentRoute();
    if (route === '/admin') return cur === '/admin' || cur === '/admin/';
    return cur.startsWith(route);
  }

  get adminName(): string {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.name || u.firstName || 'Admin';
    } catch { return 'Admin'; }
  }

  get adminInitials(): string {
    return this.adminName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  }

  toggleSidebar() { this.sidebarCollapsed.update(v => !v); }

  goToStore() { this.router.navigate(['/products']); }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }
}