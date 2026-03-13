import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface Order {
  id: string; orderNumber: string; date: string;
  items: { name: string; image: string }[];
  itemCount: number; total: number; status: OrderStatus;
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css'
})
export class OrderList {
  selectedStatus = signal('');

  orders = signal<Order[]>([
    {
      id: '1', orderNumber: 'ORD-001', date: 'March 5, 2026', itemCount: 3, total: 129.57, status: 'DELIVERED',
      items: [{ name: 'Wireless Headphones', image: 'headphones' }, { name: 'Wireless Charging Pad', image: 'charger' }]
    },
    {
      id: '2', orderNumber: 'ORD-002', date: 'March 8, 2026', itemCount: 1, total: 215.99, status: 'SHIPPED',
      items: [{ name: 'Smart Watch Series X', image: 'watch' }]
    },
    {
      id: '3', orderNumber: 'ORD-003', date: 'March 10, 2026', itemCount: 2, total: 107.97, status: 'PROCESSING',
      items: [{ name: 'Yoga Mat Premium', image: 'yoga' }, { name: 'Water Bottle', image: 'bottle' }]
    },
  ]);

  iconMap: Record<string, string> = {
    headphones: 'headphones', watch: 'watch', shoes: 'directions_run',
    bag: 'shopping_bag', hub: 'hub', chair: 'chair', bottle: 'local_bar',
    keyboard: 'keyboard', shirt: 'checkroom', organizer: 'table_restaurant',
    charger: 'battery_charging_full', yoga: 'self_improvement'
  };

  statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  filtered = computed(() => {
    const s = this.selectedStatus();
    return s ? this.orders().filter(o => o.status === s) : this.orders();
  });

  statusColor(s: string): string {
    const m: Record<string, string> = {
      PENDING: '#f59e0b', PROCESSING: '#00529b', SHIPPED: '#3b82f6',
      DELIVERED: '#10b981', CANCELLED: '#ef4444'
    };
    return m[s] || '#94a3b8';
  }

  statusIcon(s: string): string {
    const m: Record<string, string> = {
      PENDING: 'schedule', PROCESSING: 'inventory',
      SHIPPED: 'local_shipping', DELIVERED: 'check_circle', CANCELLED: 'cancel'
    };
    return m[s] || 'help';
  }
}