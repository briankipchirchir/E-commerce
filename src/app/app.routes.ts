import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { adminGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      {
        path: 'products',
        loadComponent: () => import('./features/products/pages/product-list/product-list').then(m => m.ProductList)
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./features/products/pages/product-detail/product-detail').then(m => m.ProductDetail)
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/pages/cart/cart').then(m => m.Cart)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/pages/checkout/checkout').then(m => m.Checkout)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/orders/pages/order-list/order-list').then(m => m.OrderList)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./features/orders/pages/order-detail/order-detail').then(m => m.OrderDetail)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/pages/profile/profile').then(m => m.Profile)
      },
    ]
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login/login').then(m => m.Login)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/pages/register/register').then(m => m.Register)
      },
    ]
  },
  // ── Admin (separate layout, admin guard) ───────────────────
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },

  // ── 404 ────────────────────────────────────────────────────
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFound)
  },
  { path: '**', redirectTo: 'products' }
];