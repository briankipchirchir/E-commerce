import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ToastService, Toast } from '../../core/services/ToastService';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast--{{ toast.type }}" (click)="toastService.dismiss(toast.id)">
          <mat-icon class="toast-icon">{{ iconMap[toast.type] }}</mat-icon>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="toastService.dismiss(toast.id)">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
      width: 100%;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      cursor: pointer;
      animation: slideIn 0.3s ease;
      border-left: 4px solid transparent;
    }
    @keyframes slideIn {
      from { transform: translateX(110%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    .toast--success { background: #f0fdf4; color: #15803d; border-left-color: #22c55e; }
    .toast--error   { background: #fff1f2; color: #be123c; border-left-color: #f43f5e; }
    .toast--info    { background: #eff6ff; color: #1d4ed8; border-left-color: #3b82f6; }
    .toast--warning { background: #fffbeb; color: #b45309; border-left-color: #f59e0b; }
    .toast-icon { font-size: 20px; flex-shrink: 0; }
    .toast-message { flex: 1; line-height: 1.4; }
    .toast-close { background: none; border: none; cursor: pointer; display: flex; align-items: center; opacity: 0.5; padding: 0; }
    .toast-close:hover { opacity: 1; }
    .toast-close mat-icon { font-size: 16px; }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
  iconMap: Record<string, string> = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning'
  };
}
