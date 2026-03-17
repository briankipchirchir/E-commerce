import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProductService, Category, CategoryRequest } from '../../../../core/services/ProductService';
import { ToastService } from '../../../../core/services/ToastService';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css'
})
export class AdminCategories implements OnInit {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  showForm = signal(false);
  editingId = signal<number | null>(null);
  deleteConfirmId = signal<number | null>(null);
  loading = signal(true);
  saving = signal(false);

  categories = signal<Category[]>([]);

  icons = ['devices', 'checkroom', 'watch', 'home', 'sports_soccer', 'local_offer', 'category'];

  form = { name: '', description: '', imageUrl: '', slug: '' };

  ngOnInit(): void { this.loadCategories(); }

  loadCategories(): void {
    this.loading.set(true);
    this.productService.getCategories().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) this.categories.set(res.data);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load categories.');
      }
    });
  }

  openAdd(): void {
    this.form = { name: '', description: '', imageUrl: '', slug: '' };
    this.editingId.set(null);
    this.showForm.set(true);
  }

  openEdit(c: Category): void {
    this.form = { name: c.name, description: c.description || '', imageUrl: c.imageUrl || '', slug: c.slug || '' };
    this.editingId.set(c.id);
    this.showForm.set(true);
  }

  save(): void {
    if (!this.form.name) return;
    this.saving.set(true);

    const request: CategoryRequest = {
      name: this.form.name,
      description: this.form.description,
      imageUrl: this.form.imageUrl,
      slug: this.form.slug || this.form.name.toLowerCase().replace(/\s+/g, '-')
    };

    const action$ = this.editingId()
      ? this.productService.updateCategory(this.editingId()!, request)
      : this.productService.createCategory(request);

    action$.subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.success) {
          this.toastService.success(this.editingId() ? 'Category updated!' : 'Category created!');
          this.showForm.set(false);
          this.loadCategories();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.toastService.error(err.error?.message || 'Failed to save category.');
      }
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId.set(id); }
  cancelDelete(): void { this.deleteConfirmId.set(null); }

  deleteCategory(): void {
    const id = this.deleteConfirmId();
    if (!id) return;
    this.productService.deleteCategory(id).subscribe({
      next: () => {
        this.toastService.success('Category deleted.');
        this.categories.update(list => list.filter(c => c.id !== id));
        this.deleteConfirmId.set(null);
      },
      error: () => this.toastService.error('Failed to delete category.')
    });
  }
}
