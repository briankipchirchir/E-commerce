import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {

  private items = signal<CartItem[]>(this.loadFromStorage());

  // Public readable signals
  readonly cartItems = this.items.asReadonly();

  readonly totalCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  // ── Add or increment ──────────────────────
  addToCart(product: { id: string; name: string; category: string; price: number; image: string }): void {
    this.items.update(items => {
      const existing = items.find(i => i.id === product.id);
      if (existing) {
        return items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...items, { ...product, quantity: 1 }];
    });
    this.saveToStorage();
  }

  // ── Remove one ────────────────────────────
  removeItem(id: string): void {
    this.items.update(items => items.filter(i => i.id !== id));
    this.saveToStorage();
  }

  // ── Update quantity ───────────────────────
  updateQuantity(id: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }
    this.items.update(items =>
      items.map(i => i.id === id ? { ...i, quantity } : i)
    );
    this.saveToStorage();
  }

  // ── Clear cart ────────────────────────────
  clearCart(): void {
    this.items.set([]);
    this.saveToStorage();
  }

  // ── Get count for a specific product ──────
  getItemCount(id: string): number {
    return this.items().find(i => i.id === id)?.quantity || 0;
  }

  // ── Persist to localStorage ───────────────
  private saveToStorage(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem('cart', JSON.stringify(this.items()));
    } catch {}
  }

  private loadFromStorage(): CartItem[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}