import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {
  selectedPeriod = signal<'7d' | '30d' | '90d'>('30d');

  stats = [
    { label: 'Total Revenue',   value: '$48,295',  sub: '+12.5% vs last month', trend: 'up',   icon: 'payments',       color: '#00529b', bg: 'rgba(0,82,155,0.1)'  },
    { label: 'Total Orders',    value: '1,284',    sub: '+8.2% vs last month',  trend: 'up',   icon: 'receipt_long',   color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
    { label: 'Active Products', value: '318',      sub: '3 added this week',    trend: 'up',   icon: 'inventory_2',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
    { label: 'Customers',       value: '8,741',    sub: '-1.4% vs last month',  trend: 'down', icon: 'people',         color: '#3b82f6', bg: 'rgba(59,130,246,0.1)'  },
  ];

  recentOrders = [
    { id: 'ORD-001', customer: 'Alice Wanjiku',    items: 3, total: '$129.57', status: 'DELIVERED',  date: 'Mar 9',  avatar: 'AW' },
    { id: 'ORD-002', customer: 'Brian Otieno',     items: 1, total: '$215.99', status: 'SHIPPED',    date: 'Mar 8',  avatar: 'BO' },
    { id: 'ORD-003', customer: 'Carol Muthoni',    items: 2, total: '$107.97', status: 'PROCESSING', date: 'Mar 10', avatar: 'CM' },
    { id: 'ORD-004', customer: 'David Kimani',     items: 4, total: '$342.50', status: 'PENDING',    date: 'Mar 10', avatar: 'DK' },
    { id: 'ORD-005', customer: 'Esther Achieng',   items: 1, total: '$79.99',  status: 'DELIVERED',  date: 'Mar 7',  avatar: 'EA' },
    { id: 'ORD-006', customer: 'Felix Odhiambo',   items: 2, total: '$189.98', status: 'CANCELLED',  date: 'Mar 6',  avatar: 'FO' },
  ];

  topProducts = [
    { name: 'Wireless Headphones',   sales: 234, revenue: '$18,724', icon: 'headphones',            pct: 92 },
    { name: 'Ergonomic Chair',        sales: 87,  revenue: '$30,449', icon: 'chair',                 pct: 78 },
    { name: 'Smart Watch Series X',   sales: 156, revenue: '$31,199', icon: 'watch',                 pct: 85 },
    { name: 'Running Sneakers Pro',   sales: 198, revenue: '$17,820', icon: 'directions_run',        pct: 70 },
    { name: 'USB-C Hub 7-in-1',       sales: 312, revenue: '$12,477', icon: 'hub',                   pct: 60 },
  ];

  chartBars = [
    { day: 'Mon', h: 45 }, { day: 'Tue', h: 62 }, { day: 'Wed', h: 38 },
    { day: 'Thu', h: 75 }, { day: 'Fri', h: 88 }, { day: 'Sat', h: 95 },
    { day: 'Sun', h: 52 }, { day: 'Mon', h: 67 }, { day: 'Tue', h: 71 },
    { day: 'Wed', h: 43 }, { day: 'Thu', h: 80 }, { day: 'Fri', h: 92 },
    { day: 'Sat', h: 100 }, { day: 'Sun', h: 58 },
  ];

  ordersByStatus = [
    { label: 'Delivered',  count: 842, color: '#10b981', pct: 65 },
    { label: 'Processing', count: 234, color: '#00529b', pct: 18 },
    { label: 'Shipped',    count: 143, color: '#3b82f6', pct: 11 },
    { label: 'Pending',    count: 52,  color: '#f59e0b', pct: 4  },
    { label: 'Cancelled',  count: 13,  color: '#ef4444', pct: 1  },
  ];

  statusColor(s: string): string {
    const m: Record<string, string> = {
      DELIVERED: '#10b981', SHIPPED: '#3b82f6', PROCESSING: '#00529b',
      PENDING: '#f59e0b', CANCELLED: '#ef4444'
    };
    return m[s] || '#94a3b8';
  }

  statusBg(s: string): string {
    return this.statusColor(s) + '18';
  }
}