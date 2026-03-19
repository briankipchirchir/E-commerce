import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  productBrand: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingStreet: string;
  shippingCity: string;
  shippingCounty: string;
  shippingPostalCode: string;
  shippingCountry: string;
  notes: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  items: {
    productId: number;
    productName: string;
    productImage: string;
    productBrand: string;
    quantity: number;
    unitPrice: number;
  }[];
  shippingStreet?: string;
  shippingCity?: string;
  shippingCounty?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
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

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private readonly ORDER_URL = `${environment.apiGatewayUrl}/api/orders`;
  

  createOrder(request: CreateOrderRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.ORDER_URL, request);
  }

  getMyOrders(page = 0, size = 10): Observable<ApiResponse<PagedResult<Order>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PagedResult<Order>>>(`${this.ORDER_URL}/my`, { params });
  }

  getOrderById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.ORDER_URL}/${id}`);
  }

  getOrderByNumber(orderNumber: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.ORDER_URL}/number/${orderNumber}`);
  }

  cancelOrder(id: number): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.ORDER_URL}/${id}/cancel`, {});
  }

  // Admin
  getAllOrders(page = 0, size = 20, status?: string): Observable<ApiResponse<PagedResult<Order>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<PagedResult<Order>>>(this.ORDER_URL, { params });
  }

  updateOrderStatus(id: number, status: string): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.ORDER_URL}/${id}/status`, { status });
  }

  getOrderStats(): Observable<ApiResponse<Record<string, number>>> {
    return this.http.get<ApiResponse<Record<string, number>>>(`${this.ORDER_URL}/stats`);
  }
}
