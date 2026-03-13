import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  @Input() collapsed = false;

  sections: NavSection[] = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', icon: 'dashboard',            route: '/dashboard' },
        { label: 'Products',  icon: 'inventory_2',          route: '/products'  },
        { label: 'Orders',    icon: 'receipt_long',         route: '/orders',  badge: 4 },
        { label: 'Cart',      icon: 'shopping_cart',        route: '/cart',    badge: 3 },
      ]
    },
    {
      title: 'Management',
      items: [
        { label: 'Customers', icon: 'people',               route: '/customers' },
        { label: 'Analytics', icon: 'bar_chart',            route: '/analytics' },
        { label: 'Admin',     icon: 'admin_panel_settings', route: '/admin'     },
      ]
    },
    {
      title: 'System',
      items: [
        { label: 'Settings',  icon: 'settings',             route: '/settings'  },
      ]
    }
  ];
}