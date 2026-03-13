import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface OrderItem { name: string; category: string; price: number; quantity: number; image: string; }
interface Order {
  id: string; orderNumber: string; status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  date: string; items: OrderItem[]; subtotal: number; shipping: number; tax: number; total: number;
  address: string; payment: string;
  timeline: { status: string; date: string; done: boolean; icon: string }[];
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css'
})
export class OrderDetail implements OnInit {
  private route = inject(ActivatedRoute);
  order = signal<Order | null>(null);

  iconMap: Record<string, string> = {
    headphones: 'headphones', watch: 'watch', shoes: 'directions_run',
    bag: 'shopping_bag', hub: 'hub', chair: 'chair', bottle: 'local_bar',
    keyboard: 'keyboard', shirt: 'checkroom', organizer: 'table_restaurant',
    charger: 'battery_charging_full', yoga: 'self_improvement'
  };

  private mockOrders: Order[] = [
    {
      id: '1', orderNumber: 'ORD-001', status: 'DELIVERED', date: 'March 5, 2026',
      items: [
        { name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', price: 79.99, quantity: 1, image: 'headphones' },
        { name: 'Wireless Charging Pad', category: 'Electronics', price: 19.99, quantity: 2, image: 'charger' },
      ],
      subtotal: 119.97, shipping: 0, tax: 9.60, total: 129.57,
      address: 'Alex Johnson, 123 Kenyatta Avenue, Nairobi, Kenya',
      payment: 'Visa card ending in 4242',
      timeline: [
        { status: 'Order Placed', date: 'Mar 1, 2026 – 10:32 AM', done: true, icon: 'shopping_bag' },
        { status: 'Payment Confirmed', date: 'Mar 1, 2026 – 10:33 AM', done: true, icon: 'verified' },
        { status: 'Processing', date: 'Mar 2, 2026 – 9:00 AM', done: true, icon: 'inventory' },
        { status: 'Shipped', date: 'Mar 3, 2026 – 2:15 PM', done: true, icon: 'local_shipping' },
        { status: 'Delivered', date: 'Mar 5, 2026 – 11:45 AM', done: true, icon: 'check_circle' },
      ]
    },
    {
      id: '2', orderNumber: 'ORD-002', status: 'SHIPPED', date: 'March 8, 2026',
      items: [
        { name: 'Smart Watch Series X', category: 'Electronics', price: 199.99, quantity: 1, image: 'watch' },
      ],
      subtotal: 199.99, shipping: 0, tax: 16.00, total: 215.99,
      address: 'Alex Johnson, 123 Kenyatta Avenue, Nairobi, Kenya',
      payment: 'M-Pesa',
      timeline: [
        { status: 'Order Placed', date: 'Mar 6, 2026 – 3:10 PM', done: true, icon: 'shopping_bag' },
        { status: 'Payment Confirmed', date: 'Mar 6, 2026 – 3:12 PM', done: true, icon: 'verified' },
        { status: 'Processing', date: 'Mar 7, 2026 – 8:00 AM', done: true, icon: 'inventory' },
        { status: 'Shipped', date: 'Mar 8, 2026 – 1:00 PM', done: true, icon: 'local_shipping' },
        { status: 'Delivered', date: 'Expected Mar 10, 2026', done: false, icon: 'check_circle' },
      ]
    },
    {
      id: '3', orderNumber: 'ORD-003', status: 'PROCESSING', date: 'March 10, 2026',
      items: [
        { name: 'Yoga Mat Premium', category: 'Accessories', price: 49.99, quantity: 1, image: 'yoga' },
        { name: 'Stainless Steel Water Bottle', category: 'Accessories', price: 24.99, quantity: 2, image: 'bottle' },
      ],
      subtotal: 99.97, shipping: 0, tax: 8.00, total: 107.97,
      address: 'Alex Johnson, 123 Kenyatta Avenue, Nairobi, Kenya',
      payment: 'Cash on Delivery',
      timeline: [
        { status: 'Order Placed', date: 'Mar 10, 2026 – 9:00 AM', done: true, icon: 'shopping_bag' },
        { status: 'Payment Confirmed', date: 'Mar 10, 2026 – 9:01 AM', done: true, icon: 'verified' },
        { status: 'Processing', date: 'Mar 10, 2026 – 10:00 AM', done: true, icon: 'inventory' },
        { status: 'Shipped', date: 'Expected Mar 11, 2026', done: false, icon: 'local_shipping' },
        { status: 'Delivered', date: 'Expected Mar 12, 2026', done: false, icon: 'check_circle' },
      ]
    },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.order.set(this.mockOrders.find(o => o.id === id) || this.mockOrders[0]);
  }

  get statusColor(): string {
    const map: Record<string, string> = {
      PENDING: '#f59e0b', PROCESSING: '#00529b', SHIPPED: '#3b82f6',
      DELIVERED: '#10b981', CANCELLED: '#ef4444'
    };
    return map[this.order()?.status || ''] || '#94a3b8';
  }

  get statusIcon(): string {
    const map: Record<string, string> = {
      PENDING: 'schedule', PROCESSING: 'inventory', SHIPPED: 'local_shipping',
      DELIVERED: 'check_circle', CANCELLED: 'cancel'
    };
    return map[this.order()?.status || ''] || 'help';
  }
}