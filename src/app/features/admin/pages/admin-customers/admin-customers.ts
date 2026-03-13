import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface Customer {
  id: string; name: string; email: string; phone: string;
  orders: number; totalSpent: number; role: 'CUSTOMER' | 'ADMIN';
  isActive: boolean; joinDate: string; avatar: string;
}

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './admin-customers.html',
  styleUrl: './admin-customers.css'
})
export class AdminCustomers {
  search = signal('');
  selectedRole = signal('');
  selectedStatus = signal('');

  customers = signal<Customer[]>([
    { id:'1', name:'Alice Wanjiku',  email:'alice@email.com',  phone:'+254 712 001 001', orders:12, totalSpent:1245.80, role:'CUSTOMER', isActive:true,  joinDate:'Jan 2025',  avatar:'AW' },
    { id:'2', name:'Brian Otieno',   email:'brian@email.com',  phone:'+254 712 002 002', orders:4,  totalSpent:342.50,  role:'CUSTOMER', isActive:true,  joinDate:'Feb 2025',  avatar:'BO' },
    { id:'3', name:'Carol Muthoni',  email:'carol@email.com',  phone:'+254 712 003 003', orders:7,  totalSpent:876.25,  role:'CUSTOMER', isActive:false, joinDate:'Mar 2025',  avatar:'CM' },
    { id:'4', name:'David Kimani',   email:'david@email.com',  phone:'+254 712 004 004', orders:2,  totalSpent:189.98,  role:'CUSTOMER', isActive:true,  joinDate:'Apr 2025',  avatar:'DK' },
    { id:'5', name:'Esther Achieng', email:'esther@email.com', phone:'+254 712 005 005', orders:19, totalSpent:2340.00, role:'ADMIN',    isActive:true,  joinDate:'Jan 2024',  avatar:'EA' },
    { id:'6', name:'Felix Odhiambo', email:'felix@email.com',  phone:'+254 712 006 006', orders:3,  totalSpent:214.97,  role:'CUSTOMER', isActive:true,  joinDate:'Jun 2025',  avatar:'FO' },
    { id:'7', name:'Grace Njeri',    email:'grace@email.com',  phone:'+254 712 007 007', orders:8,  totalSpent:987.60,  role:'CUSTOMER', isActive:false, joinDate:'Jul 2025',  avatar:'GN' },
    { id:'8', name:'Hassan Abdi',    email:'hassan@email.com', phone:'+254 712 008 008', orders:1,  totalSpent:349.99,  role:'CUSTOMER', isActive:true,  joinDate:'Aug 2025',  avatar:'HA' },
  ]);

  filtered = computed(() => {
    let list = this.customers();
    const q = this.search().toLowerCase();
    if (q) list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    if (this.selectedRole()) list = list.filter(c => c.role === this.selectedRole());
    if (this.selectedStatus() === 'active') list = list.filter(c => c.isActive);
    if (this.selectedStatus() === 'inactive') list = list.filter(c => !c.isActive);
    return list;
  });

  toggleActive(id: string) {
    this.customers.update(list => list.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  }

  toggleRole(id: string) {
    this.customers.update(list => list.map(c => c.id === id ? { ...c, role: c.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN' } : c));
  }

  get totalCustomers() { return this.customers().length; }
  get activeCount() { return this.customers().filter(c => c.isActive).length; }
  get adminCount() { return this.customers().filter(c => c.role === 'ADMIN').length; }
  get totalRevenue() { return this.customers().reduce((s, c) => s + c.totalSpent, 0); }
}