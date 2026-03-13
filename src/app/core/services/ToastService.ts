import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  success(message: string, duration = 3000): void {
    this.show({ type: 'success', message, duration });
  }

  error(message: string, duration = 4000): void {
    this.show({ type: 'error', message, duration });
  }

  info(message: string, duration = 3000): void {
    this.show({ type: 'info', message, duration });
  }

  warning(message: string, duration = 3500): void {
    this.show({ type: 'warning', message, duration });
  }

  private show(toast: Omit<Toast, 'id'>): void {
    const id = Date.now().toString();
    this.toasts.update(t => [...t, { ...toast, id }]);
    setTimeout(() => this.dismiss(id), toast.duration || 3000);
  }

  dismiss(id: string): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
