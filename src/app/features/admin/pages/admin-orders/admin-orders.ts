import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface Order {
  id: string; orderNumber: string; customer: string; avatar: string;
  email: string; items: number; total: number; status: OrderStatus; date: string;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrders {
  search = signal('');
  selectedStatus = signal('');
  selectedOrder = signal<Order | null>(null);

  orders = signal<Order[]>([
    { id:'1',  orderNumber:'ORD-001', customer:'Alice Wanjiku',  avatar:'AW', email:'alice@email.com',  items:3, total:129.57, status:'DELIVERED',  date:'Mar 9, 2026'  },
    { id:'2',  orderNumber:'ORD-002', customer:'Brian Otieno',   avatar:'BO', email:'brian@email.com',  items:1, total:215.99, status:'SHIPPED',     date:'Mar 8, 2026'  },
    { id:'3',  orderNumber:'ORD-003', customer:'Carol Muthoni',  avatar:'CM', email:'carol@email.com',  items:2, total:107.97, status:'PROCESSING',  date:'Mar 10, 2026' },
    { id:'4',  orderNumber:'ORD-004', customer:'David Kimani',   avatar:'DK', email:'david@email.com',  items:4, total:342.50, status:'PENDING',     date:'Mar 10, 2026' },
    { id:'5',  orderNumber:'ORD-005', customer:'Esther Achieng', avatar:'EA', email:'esther@email.com', items:1, total:79.99,  status:'DELIVERED',   date:'Mar 7, 2026'  },
    { id:'6',  orderNumber:'ORD-006', customer:'Felix Odhiambo', avatar:'FO', email:'felix@email.com',  items:2, total:189.98, status:'CANCELLED',   date:'Mar 6, 2026'  },
    { id:'7',  orderNumber:'ORD-007', customer:'Grace Njeri',    avatar:'GN', email:'grace@email.com',  items:3, total:224.97, status:'SHIPPED',     date:'Mar 5, 2026'  },
    { id:'8',  orderNumber:'ORD-008', customer:'Hassan Abdi',    avatar:'HA', email:'hassan@email.com', items:1, total:349.99, status:'PROCESSING',  date:'Mar 4, 2026'  },
  ]);

  statuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  filtered = computed(() => {
    let list = this.orders();
    const q = this.search().toLowerCase();
    if (q) list = list.filter(o => o.customer.toLowerCase().includes(q) || o.orderNumber.toLowerCase().includes(q) || o.email.toLowerCase().includes(q));
    if (this.selectedStatus()) list = list.filter(o => o.status === this.selectedStatus());
    return list;
  });

  statusColor(s: string): string {
    const m: Record<string, string> = { DELIVERED:'#10b981', SHIPPED:'#3b82f6', PROCESSING:'#00529b', PENDING:'#f59e0b', CANCELLED:'#ef4444' };
    return m[s] || '#94a3b8';
  }

  updateStatus(id: string, status: OrderStatus) {
    this.orders.update(list => list.map(o => o.id === id ? { ...o, status } : o));
    if (this.selectedOrder()?.id === id) {
      this.selectedOrder.update(o => o ? { ...o, status } : null);
    }
  }

  countByStatus(s: string) { return this.orders().filter(o => o.status === s).length; }
  get totalRevenue() { return this.orders().filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.total, 0); }
}