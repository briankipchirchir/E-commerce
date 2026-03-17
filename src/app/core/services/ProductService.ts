import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  slug: string;
  active: boolean;
  productCount: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  sku: string;
  images: string[];
  category: Category;
  active: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  brand: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  sku?: string;
  images?: string[];
  categoryId: number;
  featured?: boolean;
  brand?: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  slug?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private readonly PRODUCT_URL = `${environment.productServiceUrl}/api/products`;
  private readonly CATEGORY_URL = `${environment.productServiceUrl}/api/categories`;

  // ── Products ──────────────────────────────────────────
  getProducts(page = 0, size = 12, sortBy = 'createdAt'): Observable<ApiResponse<PagedResult<Product>>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy);
    return this.http.get<ApiResponse<PagedResult<Product>>>(this.PRODUCT_URL, { params });
  }

  getProductById(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.PRODUCT_URL}/${id}`);
  }

  getProductsByCategory(categoryId: number, page = 0, size = 12): Observable<ApiResponse<PagedResult<Product>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PagedResult<Product>>>(
      `${this.PRODUCT_URL}/category/${categoryId}`, { params });
  }

  searchProducts(query: string, page = 0, size = 12): Observable<ApiResponse<PagedResult<Product>>> {
    const params = new HttpParams().set('query', query).set('page', page).set('size', size);
    return this.http.get<ApiResponse<PagedResult<Product>>>(`${this.PRODUCT_URL}/search`, { params });
  }

  getFeaturedProducts(page = 0, size = 8): Observable<ApiResponse<PagedResult<Product>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PagedResult<Product>>>(`${this.PRODUCT_URL}/featured`, { params });
  }

  createProduct(request: ProductRequest): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.PRODUCT_URL, request);
  }

  updateProduct(id: number, request: ProductRequest): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.PRODUCT_URL}/${id}`, request);
  }

  deleteProduct(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.PRODUCT_URL}/${id}`);
  }

  // ── Categories ────────────────────────────────────────
  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(this.CATEGORY_URL);
  }

  getCategoryById(id: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.CATEGORY_URL}/${id}`);
  }

  createCategory(request: CategoryRequest): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(this.CATEGORY_URL, request);
  }

  updateCategory(id: number, request: CategoryRequest): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${this.CATEGORY_URL}/${id}`, request);
  }

  deleteCategory(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.CATEGORY_URL}/${id}`);
  }
}
