import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InitiatePaymentRequest {
  orderNumber: string;
  amount: number;
  method: 'STRIPE' | 'MPESA' | 'COD';
  mpesaPhone?: string;
}

export interface PaymentResponse {
  id: number;
  orderNumber: string;
  amount: number;
  method: string;
  status: string;
  stripeClientSecret?: string;
  mpesaCheckoutRequestId?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private readonly PAYMENT_URL = `${environment.apiGatewayUrl}/api/payments`;

  initiatePayment(request: InitiatePaymentRequest): Observable<ApiResponse<PaymentResponse>> {
    return this.http.post<ApiResponse<PaymentResponse>>(`${this.PAYMENT_URL}/initiate`, request);
  }
}
