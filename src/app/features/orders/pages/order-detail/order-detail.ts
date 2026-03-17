import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { OrderService, Order } from '../../../../core/services/OrderService';
import { ToastService } from '../../../../core/services/ToastService';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css'
})
export class OrderDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  order = signal<Order | null>(null);
  loading = signal(true);
  cancelling = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/orders']); return; }

    this.orderService.getOrderById(Number(id)).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) this.order.set(res.data);
        else this.router.navigate(['/orders']);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Order not found.');
        this.router.navigate(['/orders']);
      }
    });
  }

  cancelOrder(): void {
    const o = this.order();
    if (!o) return;
    this.cancelling.set(true);
    this.orderService.cancelOrder(o.id).subscribe({
      next: (res) => {
        this.cancelling.set(false);
        if (res.success) {
          this.order.set(res.data);
          this.toastService.success('Order cancelled successfully.');
        }
      },
      error: (err) => {
        this.cancelling.set(false);
        this.toastService.error(err.error?.message || 'Failed to cancel order.');
      }
    });
  }

  get timeline(): { status: string; date: string; done: boolean; icon: string }[] {
    const o = this.order();
    if (!o) return [];
    const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(o.status);
    const icons: Record<string, string> = {
      PENDING: 'shopping_bag', PROCESSING: 'inventory',
      SHIPPED: 'local_shipping', DELIVERED: 'check_circle'
    };
    const labels: Record<string, string> = {
      PENDING: 'Order Placed', PROCESSING: 'Processing',
      SHIPPED: 'Shipped', DELIVERED: 'Delivered'
    };
    if (o.status === 'CANCELLED') {
      return [
        { status: 'Order Placed', date: this.formatDate(o.createdAt), done: true, icon: 'shopping_bag' },
        { status: 'Cancelled', date: this.formatDate(o.updatedAt), done: true, icon: 'cancel' }
      ];
    }
    return statusOrder.map((s, i) => ({
      status: labels[s],
      date: i <= currentIndex ? (i === 0 ? this.formatDate(o.createdAt) : this.formatDate(o.updatedAt)) : 'Pending',
      done: i <= currentIndex,
      icon: icons[s]
    }));
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US',
      { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  get statusColor(): string {
    const map: Record<string, string> = {
      PENDING: '#f59e0b', PROCESSING: '#00529b',
      SHIPPED: '#3b82f6', DELIVERED: '#10b981', CANCELLED: '#ef4444'
    };
    return map[this.order()?.status || ''] || '#94a3b8';
  }

  get statusIcon(): string {
    const map: Record<string, string> = {
      PENDING: 'schedule', PROCESSING: 'inventory',
      SHIPPED: 'local_shipping', DELIVERED: 'check_circle', CANCELLED: 'cancel'
    };
    return map[this.order()?.status || ''] || 'help';
  }

  get shippingAddress(): string {
    const o = this.order();
    if (!o) return '';
    const parts = [
      `${o.customerFirstName} ${o.customerLastName}`,
      o.shippingStreet, o.shippingCity,
      o.shippingCounty, o.shippingCountry
    ].filter(Boolean);
    return parts.join(', ');
  }
}
