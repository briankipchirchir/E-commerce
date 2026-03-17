import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { OrderService, Order } from '../../../../core/services/OrderService';
import { ToastService } from '../../../../core/services/ToastService';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrders implements OnInit {
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  search = signal('');
  selectedStatus = signal('');
  selectedOrder = signal<Order | null>(null);
  loading = signal(true);
  orders = signal<Order[]>([]);
  page = signal(0);
  totalPages = signal(0);
  readonly size = 20;

  statuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.loading.set(true);
    const status = this.selectedStatus() || undefined;
    this.orderService.getAllOrders(this.page(), this.size, status).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.orders.set(res.data.content);
          this.totalPages.set(res.data.totalPages);
        }
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load orders.');
      }
    });
  }

  filtered = computed(() => {
    let list = this.orders();
    const q = this.search().toLowerCase();
    if (q) list = list.filter(o =>
      o.customerFirstName?.toLowerCase().includes(q) ||
      o.customerLastName?.toLowerCase().includes(q) ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customerEmail?.toLowerCase().includes(q)
    );
    return list;
  });

  onStatusFilterChange(): void {
    this.page.set(0);
    this.loadOrders();
  }

  selectOrder(order: Order): void {
    this.selectedOrder.set(order);
  }

  closeDetail(): void { this.selectedOrder.set(null); }

  updateStatus(id: number, status: OrderStatus): void {
    this.orderService.updateOrderStatus(id, status).subscribe({
      next: (res) => {
        if (res.success) {
          this.orders.update(list => list.map(o => o.id === id ? res.data : o));
          if (this.selectedOrder()?.id === id) this.selectedOrder.set(res.data);
          this.toastService.success('Order status updated!');
        }
      },
      error: () => this.toastService.error('Failed to update status.')
    });
  }

  getInitials(order: Order): string {
    return ((order.customerFirstName?.[0] || '') +
            (order.customerLastName?.[0] || '')).toUpperCase() || '?';
  }

  getCustomerName(order: Order): string {
    return `${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim() ||
           order.customerEmail || 'Unknown';
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

  countByStatus(s: string): number {
    return this.orders().filter(o => o.status === s).length;
  }

  get totalRevenue(): number {
    return this.orders()
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0);
  }
}
