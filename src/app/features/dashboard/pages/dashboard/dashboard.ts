import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface StatCard {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: string;
  color: string;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: string;
  status: string;
  css: string;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  stats: StatCard[] = [
    { label: 'Total Revenue',    value: '$48,295', change: '+12.5% this month', up: true,  icon: 'payments',     color: '#00529b' },
    { label: 'Total Orders',     value: '1,284',   change: '+8.2% this month',  up: true,  icon: 'receipt_long', color: '#10b981' },
    { label: 'Products',         value: '342',     change: '+3 this week',      up: true,  icon: 'inventory_2',  color: '#f59e0b' },
    { label: 'Active Customers', value: '8,741',   change: '-1.4% this month',  up: false, icon: 'people',       color: '#3b82f6' },
  ];

  recentOrders: RecentOrder[] = [
    { id: '#ORD-001', customer: 'Alice Wanjiru',  amount: '$240.00', status: 'Delivered',  css: 'success' },
    { id: '#ORD-002', customer: 'Brian Otieno',   amount: '$85.50',  status: 'Processing', css: 'info'    },
    { id: '#ORD-003', customer: 'Carol Muthoni',  amount: '$512.00', status: 'Shipped',    css: 'warning' },
    { id: '#ORD-004', customer: 'David Kipchoge', amount: '$33.00',  status: 'Pending',    css: 'warning' },
    { id: '#ORD-005', customer: 'Eve Achieng',    amount: '$198.75', status: 'Cancelled',  css: 'danger'  },
  ];

  topProducts: TopProduct[] = [
    { name: 'Wireless Headphones', sales: 234, revenue: '$23,400' },
    { name: 'Smart Watch Pro',     sales: 187, revenue: '$18,700' },
    { name: 'USB-C Hub 7-in-1',   sales: 156, revenue: '$7,800'  },
    { name: 'Laptop Stand',        sales: 142, revenue: '$5,680'  },
    { name: 'Mechanical Keyboard', sales: 98,  revenue: '$9,800'  },
  ];
}