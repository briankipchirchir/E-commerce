import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface Category { id: string; name: string; slug: string; description: string; productCount: number; isActive: boolean; icon: string; }

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css'
})
export class AdminCategories {
  showForm = signal(false);
  editingId = signal<string | null>(null);
  deleteConfirmId = signal<string | null>(null);

  form = { name: '', description: '', icon: 'category', isActive: true };
  icons = ['devices', 'checkroom', 'watch', 'home', 'sports_soccer', 'local_offer', 'category'];

  categories = signal<Category[]>([
    { id:'1', name:'Electronics',  slug:'electronics',  description:'Gadgets, devices and tech accessories', productCount:48, isActive:true,  icon:'devices'      },
    { id:'2', name:'Clothing',     slug:'clothing',     description:'Fashion, apparel and accessories',      productCount:32, isActive:true,  icon:'checkroom'    },
    { id:'3', name:'Accessories',  slug:'accessories',  description:'Bags, watches, jewelry and more',       productCount:27, isActive:true,  icon:'watch'        },
    { id:'4', name:'Home',         slug:'home',         description:'Furniture, decor and home essentials',  productCount:19, isActive:true,  icon:'home'         },
    { id:'5', name:'Sports',       slug:'sports',       description:'Fitness, outdoor and sports gear',      productCount:14, isActive:false, icon:'sports_soccer'},
  ]);

  openAdd() { this.form = { name:'', description:'', icon:'category', isActive:true }; this.editingId.set(null); this.showForm.set(true); }

  openEdit(c: Category) {
    this.form = { name: c.name, description: c.description, icon: c.icon, isActive: c.isActive };
    this.editingId.set(c.id);
    this.showForm.set(true);
  }

  save() {
    if (!this.form.name) return;
    const slug = this.form.name.toLowerCase().replace(/\s+/g, '-');
    if (this.editingId()) {
      this.categories.update(list => list.map(c => c.id === this.editingId() ? { ...c, ...this.form, slug } : c));
    } else {
      this.categories.update(list => [...list, { id: Date.now().toString(), ...this.form, slug, productCount: 0 }]);
    }
    this.showForm.set(false);
  }

  toggleActive(id: string) { this.categories.update(list => list.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c)); }
  confirmDelete(id: string) { this.deleteConfirmId.set(id); }
  deleteCategory() { this.categories.update(list => list.filter(c => c.id !== this.deleteConfirmId())); this.deleteConfirmId.set(null); }
}