import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../../core/services/CartService';
import { OrderService } from '../../../../core/services/OrderService';
import { PaymentService } from '../../../../core/services/PaymentService';
import { AuthService } from '../../../../core/services/AuthService';
import { ToastService } from '../../../../core/services/ToastService';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  router = inject(Router);

  step = signal<1 | 2 | 3>(1);
  placing = signal(false);
  orderPlaced = signal(false);
  orderNumber = signal('');
  stripeClientSecret = signal('');
  iconMap: Record<string, string> = {};

  address = {
    firstName: '', lastName: '', email: '',
    phone: '', street: '', city: '',
    county: '', postalCode: '', country: 'Kenya'
  };

  payment = {
    method: 'card' as 'card' | 'mpesa' | 'cod',
    cardNumber: '', expiry: '', cvv: '', mpesaPhone: ''
  };

  readonly SHIPPING_THRESHOLD = 50;
  readonly SHIPPING_COST = 5.99;
  readonly TAX_RATE = 0.08;

  get shipping(): number { return this.cartService.subtotal() >= this.SHIPPING_THRESHOLD ? 0 : this.SHIPPING_COST; }
  get tax(): number { return this.cartService.subtotal() * this.TAX_RATE; }
  get total(): number { return this.cartService.subtotal() + this.shipping + this.tax; }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.address.firstName = user.firstName || '';
      this.address.lastName = user.lastName || '';
      this.address.email = user.email || '';
    }
    if (this.cartService.cartItems().length === 0) {
      this.router.navigate(['/products']);
    }
  }

  get addressValid(): boolean {
    return !!(this.address.firstName && this.address.lastName &&
              this.address.email && this.address.street && this.address.city);
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

    const orderRequest = {
      items: this.cartService.cartItems().map(item => ({
        productId: Number(item.id),
        productName: item.name,
        productImage: item.image,
        productBrand: '',
        quantity: item.quantity,
        unitPrice: item.price
      })),
      shippingStreet: this.address.street,
      shippingCity: this.address.city,
      shippingCounty: this.address.county,
      shippingPostalCode: this.address.postalCode,
      shippingCountry: this.address.country
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (res) => {
        if (res.success) {
          const orderNum = res.data.orderNumber;
          this.orderNumber.set(orderNum);

          // Initiate payment
          const paymentMethod = this.payment.method === 'card' ? 'STRIPE'
                              : this.payment.method === 'mpesa' ? 'MPESA' : 'COD';

          this.paymentService.initiatePayment({
            orderNumber: orderNum,
            amount: this.total,
            method: paymentMethod,
            mpesaPhone: this.payment.method === 'mpesa' ? this.payment.mpesaPhone : undefined
          }).subscribe({
            next: (payRes) => {
              this.placing.set(false);
              if (payRes.success) {
                this.cartService.clearCart();
                this.orderPlaced.set(true);

                if (paymentMethod === 'MPESA') {
                  this.toastService.success('Order placed! Check your phone for M-Pesa prompt.');
                } else if (paymentMethod === 'STRIPE') {
                  this.stripeClientSecret.set(payRes.data.stripeClientSecret || '');
                  this.toastService.success('Order placed! Complete your card payment.');
                } else {
                  this.toastService.success('Order placed successfully!');
                }
              }
            },
            error: () => {
              this.placing.set(false);
              // Order was created but payment initiation failed — still show success
              this.cartService.clearCart();
              this.orderPlaced.set(true);
              this.toastService.success('Order placed! Payment will be processed shortly.');
            }
          });
        }
      },
      error: (err) => {
        this.placing.set(false);
        this.toastService.error(err.error?.message || 'Failed to place order. Please try again.');
      }
    });
  }

  formatCard(val: string): string {
    return val.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
  }
}
