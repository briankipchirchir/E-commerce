import { Routes } from '@angular/router';
import { AdminLayout } from '../../layout/admin-layout/admin-layout';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/admin-products/admin-products').then(m => m.AdminProducts)
      },
      {
        path: 'products/new',
        loadComponent: () => import('./pages/admin-product-form/admin-product-form').then(m => m.AdminProductForm)
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./pages/admin-product-form/admin-product-form').then(m => m.AdminProductForm)
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/admin-orders/admin-orders').then(m => m.AdminOrders)
      },
      {
        path: 'customers',
        loadComponent: () => import('./pages/admin-customers/admin-customers').then(m => m.AdminCustomers)
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/admin-categories/admin-categories').then(m => m.AdminCategories)
      },
    ]
  }
];