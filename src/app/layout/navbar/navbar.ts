import { Component, Output, EventEmitter, signal, HostListener, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/AuthService';
import { CartService } from '../../core/services/CartService';


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

  private authService = inject(AuthService);
  private cartService = inject(CartService);

  searchQuery = '';
  searchFocused = signal(false);
  scrolled = signal(false);

  // ── All auth state comes from AuthService signal ──
  isLoggedIn  = computed(() => this.authService.isLoggedIn());
  userName    = computed(() => {
    const u = this.authService.currentUser();
    if (!u) return '';
    return `${u.firstName || ''} ${u.lastName || ''}`.trim();
  });
  userEmail   = computed(() => this.authService.currentUser()?.email || '');
  firstName   = computed(() => this.authService.currentUser()?.firstName || '');
  initials    = computed(() => {
    const u = this.authService.currentUser();
    if (!u) return '';
    const f = u.firstName?.[0] || '';
    const l = u.lastName?.[0]  || '';
    return `${f}${l}`.toUpperCase();
  });

  // ── Cart count comes from CartService signal ──
  cartCount = computed(() => this.cartService.totalCount());

  categories: Category[] = [
    { label: 'Electronics',   icon: 'devices',       param: 'Electronics' },
    { label: 'Clothing',      icon: 'checkroom',     param: 'Clothing'    },
    { label: 'Accessories',   icon: 'watch',         param: 'Accessories' },
    { label: 'Home & Living', icon: 'weekend',       param: 'Home'        },
    { label: 'Sports',        icon: 'sports_soccer', param: 'Sports'      },
  ];

  ngOnInit(): void {
    // nothing needed — signals are reactive automatically
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

  // ── Delegate to AuthService — single source of truth ──
  onLogout(): void {
    this.authService.logout();
  }
}