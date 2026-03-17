import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../../core/services/ProductService';
import { AuthService } from '../../../../core/services/AuthService';
import { OrderService, Order } from '../../../../core/services/OrderService';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, TitleCasePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  authService = inject(AuthService);

  selectedPeriod = signal<'7d' | '30d' | '90d'>('30d');
  topProducts = signal<any[]>([]);
  recentOrders = signal<Order[]>([]);
  loadingProducts = signal(true);
  loadingOrders = signal(true);

  stats = signal([
    { label: 'Total Revenue',   value: '...', sub: 'Loading...', trend: 'up',   icon: 'payments',     color: '#00529b', bg: 'rgba(0,82,155,0.1)'   },
    { label: 'Total Orders',    value: '...', sub: 'Loading...', trend: 'up',   icon: 'receipt_long', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Active Products', value: '...', sub: 'Loading...', trend: 'up',   icon: 'inventory_2',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Customers',       value: '...', sub: 'Loading...', trend: 'up',   icon: 'people',       color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  ]);

  ordersByStatus = signal([
    { label: 'Delivered',  count: 0, color: '#10b981', pct: 0 },
    { label: 'Processing', count: 0, color: '#00529b', pct: 0 },
    { label: 'Shipped',    count: 0, color: '#3b82f6', pct: 0 },
    { label: 'Pending',    count: 0, color: '#f59e0b', pct: 0 },
    { label: 'Cancelled',  count: 0, color: '#ef4444', pct: 0 },
  ]);

  chartBars = [
    { day: 'Mon', h: 45 }, { day: 'Tue', h: 62 }, { day: 'Wed', h: 38 },
    { day: 'Thu', h: 75 }, { day: 'Fri', h: 88 }, { day: 'Sat', h: 95 },
    { day: 'Sun', h: 52 }, { day: 'Mon', h: 67 }, { day: 'Tue', h: 71 },
    { day: 'Wed', h: 43 }, { day: 'Thu', h: 80 }, { day: 'Fri', h: 92 },
    { day: 'Sat', h: 100 }, { day: 'Sun', h: 58 },
  ];

  ngOnInit(): void {
    this.loadProductStats();
    this.loadOrderStats();
  }

  loadProductStats(): void {
    this.productService.getProducts(0, 100).subscribe({
      next: (res) => {
        if (res.success) {
          const products = res.data.content;
          const total = res.data.totalElements;
          const lowStock = products.filter(p => p.stockQuantity <= 10).length;

          this.stats.update(list => list.map(s =>
            s.label === 'Active Products'
              ? { ...s, value: String(total), sub: `${lowStock} low stock items` }
              : s
          ));

          const featured = products.filter(p => p.featured);
          const top = [...featured, ...products.filter(p => !p.featured)]
            .slice(0, 5)
            .map((p, i) => ({
              name: p.name,
              brand: p.brand,
              price: `$${p.price.toFixed(2)}`,
              stock: p.stockQuantity,
              image: p.images?.[0] || '',
              category: p.category?.name || '',
              pct: Math.max(30, 100 - (i * 12))
            }));

          this.topProducts.set(top);
          this.loadingProducts.set(false);
        }
      },
      error: () => this.loadingProducts.set(false)
    });
  }

  loadOrderStats(): void {
    this.loadingOrders.set(true);
    // Load recent orders
    this.orderService.getAllOrders(0, 6).subscribe({
      next: (res) => {
        if (res.success) {
          this.recentOrders.set(res.data.content);
          const total = res.data.totalElements;

          this.stats.update(list => list.map(s =>
            s.label === 'Total Orders'
              ? { ...s, value: String(total), sub: `${res.data.content.length} recent orders` }
              : s
          ));
        }
        this.loadingOrders.set(false);
      },
      error: () => this.loadingOrders.set(false)
    });

    // Load order stats
    this.orderService.getOrderStats().subscribe({
      next: (res) => {
        if (res.success) {
          const stats = res.data;
          const total = stats['TOTAL'] || 1;

          // Calculate total revenue from orders
          this.orderService.getAllOrders(0, 100).subscribe({
            next: (ordersRes) => {
              if (ordersRes.success) {
                const revenue = ordersRes.data.content
                  .filter(o => o.status !== 'CANCELLED')
                  .reduce((sum, o) => sum + o.total, 0);

                this.stats.update(list => list.map(s =>
                  s.label === 'Total Revenue'
                    ? { ...s, value: `$${revenue.toFixed(2)}`, sub: 'From all orders' }
                    : s
                ));
              }
            }
          });

          this.ordersByStatus.set([
            { label: 'Delivered',  count: stats['DELIVERED']  || 0, color: '#10b981', pct: Math.round(((stats['DELIVERED']  || 0) / total) * 100) },
            { label: 'Processing', count: stats['PROCESSING'] || 0, color: '#00529b', pct: Math.round(((stats['PROCESSING'] || 0) / total) * 100) },
            { label: 'Shipped',    count: stats['SHIPPED']    || 0, color: '#3b82f6', pct: Math.round(((stats['SHIPPED']    || 0) / total) * 100) },
            { label: 'Pending',    count: stats['PENDING']    || 0, color: '#f59e0b', pct: Math.round(((stats['PENDING']    || 0) / total) * 100) },
            { label: 'Cancelled',  count: stats['CANCELLED']  || 0, color: '#ef4444', pct: Math.round(((stats['CANCELLED']  || 0) / total) * 100) },
          ]);
        }
      }
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
      { month: 'short', day: 'numeric' });
  }

  statusColor(s: string): string {
    const m: Record<string, string> = {
      DELIVERED: '#10b981', SHIPPED: '#3b82f6',
      PROCESSING: '#00529b', PENDING: '#f59e0b', CANCELLED: '#ef4444'
    };
    return m[s] || '#94a3b8';
  }

  statusBg(s: string): string { return this.statusColor(s) + '18'; }
}
