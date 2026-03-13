import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return true;
    }
  } catch {}

  // Logged in but not admin — send back to storefront
  router.navigate(['/products']);
  return false;
};