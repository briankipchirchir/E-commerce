import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { OrderService, Order } from '../../../../core/services/OrderService';
import { ToastService } from '../../../../core/services/ToastService';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css'
})
export class OrderList implements OnInit {
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  selectedStatus = signal('');
  page = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  readonly size = 10;

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.getMyOrders(this.page(), this.size).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.orders.set(res.data.content);
          this.totalPages.set(res.data.totalPages);
          this.totalElements.set(res.data.totalElements);
        }
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load orders.');
      }
    });
  }

  filtered = computed(() => {
    const status = this.selectedStatus();
    if (!status) return this.orders();
    return this.orders().filter(o => o.status === status);
  });

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }

  goToPage(p: number): void {
    this.page.set(p);
    this.loadOrders();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US',
      { month: 'short', day: 'numeric', year: 'numeric' });
  }

  statusColor(s: string): string {
    const m: Record<string, string> = {
      DELIVERED: '#10b981', SHIPPED: '#3b82f6',
      PROCESSING: '#00529b', PENDING: '#f59e0b', CANCELLED: '#ef4444'
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

  getFirstImage(order: Order): string {
    return order.items?.[0]?.productImage || '';
  }
}
