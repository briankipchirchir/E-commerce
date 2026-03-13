import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProductService, Category, ProductRequest } from '../../../../core/services/ProductService';
import { ToastService } from '../../../../core/services/ToastService';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './admin-product-form.html',
  styleUrl: './admin-product-form.css'
})
export class AdminProductForm implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  isEdit = signal(false);
  saving = signal(false);
  saved = signal(false);
  loading = signal(false);
  editId = signal<number | null>(null);

  categories = signal<Category[]>([]);

  form = {
    name: '',
    categoryId: null as number | null,
    price: null as number | null,
    originalPrice: null as number | null,
    stockQuantity: null as number | null,
    description: '',
    sku: '',
    brand: '',
    featured: false,
    images: ['']
  };

  ngOnInit(): void {
    this.loadCategories();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.editId.set(Number(id));
      this.loadProduct(Number(id));
    }
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (res) => { if (res.success) this.categories.set(res.data); },
      error: () => this.toastService.error('Failed to load categories.')
    });
  }

  loadProduct(id: number): void {
    this.loading.set(true);
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          const p = res.data;
          this.form = {
            name: p.name,
            categoryId: p.category?.id || null,
            price: p.price,
            originalPrice: p.originalPrice || null,
            stockQuantity: p.stockQuantity,
            description: p.description,
            sku: p.sku || '',
            brand: p.brand || '',
            featured: p.featured,
            images: p.images?.length ? p.images : ['']
          };
        }
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load product.');
      }
    });
  }

  get discount(): number {
    if (!this.form.originalPrice || !this.form.price) return 0;
    return Math.round((1 - this.form.price / this.form.originalPrice) * 100);
  }

  get isValid(): boolean {
    return !!(this.form.name && this.form.categoryId &&
              this.form.price && this.form.stockQuantity !== null);
  }

  addImageField(): void { this.form.images = [...this.form.images, '']; }
  removeImageField(i: number): void {
    this.form.images = this.form.images.filter((_, idx) => idx !== i);
  }
  trackByIndex(index: number): number { return index; }

  save(): void {
    if (!this.isValid) return;
    this.saving.set(true);

    const request: ProductRequest = {
      name: this.form.name,
      description: this.form.description,
      price: this.form.price!,
      originalPrice: this.form.originalPrice || undefined,
      stockQuantity: this.form.stockQuantity!,
      sku: this.form.sku || undefined,
      images: this.form.images.filter(img => img.trim()),
      categoryId: this.form.categoryId!,
      featured: this.form.featured,
      brand: this.form.brand || undefined
    };

    const action$ = this.isEdit()
      ? this.productService.updateProduct(this.editId()!, request)
      : this.productService.createProduct(request);

    action$.subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.success) {
          this.saved.set(true);
          this.toastService.success(
            this.isEdit() ? 'Product updated successfully!' : 'Product created successfully!'
          );
          setTimeout(() => this.router.navigate(['/admin/products']), 1200);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.toastService.error(err.error?.message || 'Failed to save product.');
      }
    });
  }

  getCategoryName(): string {
    return this.categories().find(c => c.id === this.form.categoryId)?.name || "Category";
  }

  cancel(): void { this.router.navigate(['/admin/products']); }
}
