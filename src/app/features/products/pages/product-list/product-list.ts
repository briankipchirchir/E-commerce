import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../../core/services/CartService';
import { ProductService, Product, Category } from '../../../../core/services/ProductService';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit {
  readonly Math = Math;
  private cartService = inject(CartService);
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal('');

  search = '';
  selectedCategory = signal<number | null>(null);
  sortBy = 'createdAt';
  page = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  readonly size = 12;

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (res) => { if (res.success) this.categories.set(res.data); },
      error: () => {}
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set('');

    const categoryId = this.selectedCategory();

    const request$ = this.search
      ? this.productService.searchProducts(this.search, this.page(), this.size)
      : categoryId
        ? this.productService.getProductsByCategory(categoryId, this.page(), this.size)
        : this.productService.getProducts(this.page(), this.size, this.sortBy);

    request$.subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.products.set(res.data.content);
          this.totalPages.set(res.data.totalPages);
          this.totalElements.set(res.data.totalElements);
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load products. Please try again.');
      }
    });
  }

  onSearch(): void {
    this.page.set(0);
    this.loadProducts();
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategory.set(categoryId);
    this.page.set(0);
    this.loadProducts();
  }

  onSortChange(): void {
    this.page.set(0);
    this.loadProducts();
  }

  goToPage(p: number): void {
    this.page.set(p);
    this.loadProducts();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart({
      id: String(product.id),
      name: product.name,
      category: product.category?.name || '',
      price: product.price,
      image: product.images?.[0] || '',
    });
  }

  getCartCount(productId: number): number {
    return this.cartService.getItemCount(String(productId));
  }

  getFirstImage(product: Product): string {
    return product.images?.[0] || '';
  }

  stars(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => {
      if (i < Math.floor(rating)) return 'star';
      if (i === Math.floor(rating) && rating % 1 >= 0.5) return 'star_half';
      return 'star_border';
    });
  }

  discount(product: Product): number {
    if (!product.originalPrice) return 0;
    return Math.round((1 - product.price / product.originalPrice) * 100);
  }
}
