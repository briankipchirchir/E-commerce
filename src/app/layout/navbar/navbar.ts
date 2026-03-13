import { Component, Output, EventEmitter, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

interface Category {
  label: string;
  icon: string;
  param: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatIconModule, MatBadgeModule, MatMenuModule,
    MatTooltipModule, MatDividerModule,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  @Output() searchChange = new EventEmitter<string>();

  searchQuery = '';
  searchFocused = signal(false);
  scrolled = signal(false);
  cartCount = signal(0);
  userName = signal('');
  userEmail = signal('');

  categories: Category[] = [
    { label: 'Electronics',   icon: 'devices',       param: 'Electronics' },
    { label: 'Clothing',      icon: 'checkroom',     param: 'Clothing'    },
    { label: 'Accessories',   icon: 'watch',         param: 'Accessories' },
    { label: 'Home & Living', icon: 'weekend',       param: 'Home'        },
    { label: 'Sports',        icon: 'sports_soccer', param: 'Sports'      },
  ];

  ngOnInit(): void {
    this.loadAuthState();
    this.loadCartCount();
  }

  private loadAuthState(): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Try reading stored user profile
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        this.userName.set(user.name || user.firstName + ' ' + user.lastName || '');
        this.userEmail.set(user.email || '');
      }
    } catch {
      // token exists but no profile stored yet — show generic
      this.userName.set('My Account');
    }
  }

  private loadCartCount(): void {
    try {
      const cart = localStorage.getItem('cart');
      if (cart) {
        const items = JSON.parse(cart);
        const count = Array.isArray(items)
          ? items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
          : 0;
        this.cartCount.set(count);
      }
    } catch {
      this.cartCount.set(0);
    }
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  get initials(): string {
    const name = this.userName();
    if (!name) return '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  get firstName(): string {
    return this.userName().split(' ')[0] || '';
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 10);
  }

  onSearch(): void {
    this.searchChange.emit(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchChange.emit('');
  }

  onLogout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    this.userName.set('');
    this.userEmail.set('');
    this.cartCount.set(0);
  }
}