import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../../core/services/CartService';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout {
  cartService = inject(CartService);
  router = inject(Router);

  step = signal<1 | 2 | 3>(1);
  placing = signal(false);
  orderPlaced = signal(false);
  orderNumber = signal('');

  address = { firstName: '', lastName: '', email: '', phone: '', street: '', city: '', county: '', postalCode: '', country: 'Kenya' };
  payment = { method: 'card' as 'card' | 'mpesa' | 'cod', cardNumber: '', expiry: '', cvv: '', mpesaPhone: '' };

  readonly SHIPPING_THRESHOLD = 50;
  readonly SHIPPING_COST = 5.99;
  readonly TAX_RATE = 0.08;

  get shipping(): number { return this.cartService.subtotal() >= this.SHIPPING_THRESHOLD ? 0 : this.SHIPPING_COST; }
  get tax(): number { return this.cartService.subtotal() * this.TAX_RATE; }
  get total(): number { return this.cartService.subtotal() + this.shipping + this.tax; }

  get addressValid(): boolean {
    return !!(this.address.firstName && this.address.lastName && this.address.email && this.address.street && this.address.city);
  }

  get paymentValid(): boolean {
    if (this.payment.method === 'card') return !!(this.payment.cardNumber && this.payment.expiry && this.payment.cvv);
    if (this.payment.method === 'mpesa') return !!this.payment.mpesaPhone;
    return true;
  }

  nextStep(): void {
    if (this.step() === 1 && this.addressValid) this.step.set(2);
    else if (this.step() === 2 && this.paymentValid) this.step.set(3);
  }

  placeOrder(): void {
    this.placing.set(true);
    setTimeout(() => {
      this.orderNumber.set('ORD-' + Date.now().toString().slice(-8));
      this.cartService.clearCart();
      this.placing.set(false);
      this.orderPlaced.set(true);
    }, 1800);
  }

  formatCard(val: string): string {
    return val.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
  }

  iconMap: Record<string, string> = {
    headphones: 'headphones', watch: 'watch', shoes: 'directions_run',
    bag: 'shopping_bag', hub: 'hub', chair: 'chair', bottle: 'local_bar',
    keyboard: 'keyboard', shirt: 'checkroom', organizer: 'table_restaurant',
    charger: 'battery_charging_full', yoga: 'self_improvement'
  };
}