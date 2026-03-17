import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../../core/services/CartService';
import { AuthService } from '../../../../core/services/AuthService';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {
  cartService = inject(CartService);
  authService = inject(AuthService);

  readonly SHIPPING_THRESHOLD = 50;
  readonly SHIPPING_COST = 5.99;
  readonly TAX_RATE = 0.08;

  get shipping(): number {
    return this.cartService.subtotal() >= this.SHIPPING_THRESHOLD ? 0 : this.SHIPPING_COST;
  }

  get tax(): number {
    return this.cartService.subtotal() * this.TAX_RATE;
  }

  get total(): number {
    return this.cartService.subtotal() + this.shipping + this.tax;
  }

  get shippingProgress(): number {
    return Math.min((this.cartService.subtotal() / this.SHIPPING_THRESHOLD) * 100, 100);
  }

  get amountToFreeShipping(): number {
    return Math.max(0, this.SHIPPING_THRESHOLD - this.cartService.subtotal());
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
