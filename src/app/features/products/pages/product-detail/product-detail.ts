import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../../core/services/CartService';
import { ProductService, Product } from '../../../../core/services/ProductService';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cartService = inject(CartService);
  private productService = inject(ProductService);

  product = signal<Product | null>(null);
  loading = signal(true);
  error = signal('');
  selectedTab = signal<'description' | 'specs' | 'reviews'>('description');
  quantity = signal(1);
  addedToCart = signal(false);
  selectedImageIndex = signal(0);

  specsList: any[] = [];

  mockReviews = [
    { name: 'Alice W.', rating: 5, date: 'Feb 2026', comment: 'Absolutely love it! Exceeded my expectations.' },
    { name: 'Brian O.', rating: 4, date: 'Jan 2026', comment: 'Really solid product. Works exactly as described.' },
    { name: 'Carol M.', rating: 5, date: 'Jan 2026', comment: 'Best purchase I\'ve made this year. Outstanding quality.' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/products']); return; }

    this.productService.getProductById(Number(id)).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.product.set(res.data);
        } else {
          this.router.navigate(['/products']);
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Product not found.');
        setTimeout(() => this.router.navigate(['/products']), 2000);
      }
    });
  }

  get discount(): number {
    const p = this.product();
    if (!p?.originalPrice) return 0;
    return Math.round((1 - p.price / p.originalPrice) * 100);
  }

  get images(): string[] {
    const p = this.product();
    return p?.images?.length ? p.images : [];
  }

  stars(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => {
      if (i < Math.floor(rating)) return 'star';
      if (i === Math.floor(rating) && rating % 1 >= 0.5) return 'star_half';
      return 'star_border';
    });
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    for (let i = 0; i < this.quantity(); i++) {
      this.cartService.addToCart({
        id: String(p.id),
        name: p.name,
        category: p.category?.name || '',
        price: p.price,
        image: p.images?.[0] || ''
      });
    }
    this.addedToCart.set(true);
    setTimeout(() => this.addedToCart.set(false), 2500);
  }

  changeQty(delta: number): void {
    const p = this.product();
    if (!p) return;
    this.quantity.update(q => Math.min(Math.max(1, q + delta), p.stockQuantity));
  }
}
