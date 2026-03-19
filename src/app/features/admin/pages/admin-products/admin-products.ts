import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProductService, Product } from '../../../../core/services/ProductService';
import { ToastService } from '../../../../core/services/ToastService';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css'
})
export class AdminProducts implements OnInit {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  categoriesList = signal<any[]>([]);

  products = signal<Product[]>([]);
  loading = signal(true);
  search = signal('');
  selectedCategory = signal('');
  selectedStatus = signal('');
  sortBy = signal('newest');
  deleteConfirmId = signal<number | null>(null);
  page = signal(0);
  totalPages = signal(0);
  readonly size = 20;

  ngOnInit(): void { this.loadProducts(); this.loadCategories(); }

  loadCategories(): void {
    this.productService.getCategories().subscribe({ next: 
      (res) => { if (res.success) this.categoriesList.set(res.data); } });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts(this.page(), this.size).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.products.set(res.data.content);
          this.totalPages.set(res.data.totalPages);
        }
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load products.');
      }
    });
  }

  filtered = computed(() => {
    let list = this.products();
    const q = this.search().toLowerCase();
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q));
    if (this.selectedCategory()) list = list.filter(p =>
      p.category?.name === this.selectedCategory());
    if (this.selectedStatus() === 'active')   list = list.filter(p => p.active);
    if (this.selectedStatus() === 'inactive') list = list.filter(p => !p.active);
    if (this.selectedStatus() === 'low')      list = list.filter(p => p.stockQuantity <= 10);
    if (this.sortBy() === 'price-asc')  list = [...list].sort((a,b) => a.price - b.price);
    if (this.sortBy() === 'price-desc') list = [...list].sort((a,b) => b.price - a.price);
    if (this.sortBy() === 'stock')      list = [...list].sort((a,b) => a.stockQuantity - b.stockQuantity);
    if (this.sortBy() === 'rating')     list = [...list].sort((a,b) => b.rating - a.rating);
    return list;
  });

  confirmDelete(id: number) { this.deleteConfirmId.set(id); }
  cancelDelete() { this.deleteConfirmId.set(null); }

  deleteProduct(): void {
    const id = this.deleteConfirmId();
    if (!id) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products.update(list => list.filter(p => p.id !== id));
        this.toastService.success('Product deleted successfully.');
        this.deleteConfirmId.set(null);
      },
      error: () => this.toastService.error('Failed to delete product.')
    });
  }

  getFirstImage(product: Product): string {
    return product.images?.[0] || '';
  }

  get activeCount()   { return this.products().filter(p => p.active).length; }
  get inactiveCount() { return this.products().filter(p => !p.active).length; }
  get lowStockCount() { return this.products().filter(p => p.stockQuantity <= 10).length; }

  toggleStatus(product: Product): void {
    // Soft toggle - in future call PATCH /api/products/:id/status
    this.products.update(list => list.map(p => p.id === product.id ? { ...p, active: !p.active } : p));
  }
}
