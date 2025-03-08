import { inject, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { SecurityService } from '../services/security.service';
import { isPlatformBrowser } from '@angular/common';

/**
 * Guard that protects routes based on security settings
 * Usage:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [authGuard]
 * }
 */
export function authGuard(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree {
  const securityService = inject(SecurityService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // In SSR, allow access for SEO purposes
  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  
  // Get the path from the route
  const path = state.url.split('?')[0]; // Remove query params
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Check if the user can access the route
  if (securityService.canAccessRoute(normalizedPath)) {
    return true;
  }
  
  // If not, redirect to login or home page
  const security = securityService.security();
  if (security && security.authentication.redirectToLogin) {
    // Store the current URL for later if configured
    if (security.authentication.storeReturnUrl) {
      localStorage.setItem('returnUrl', state.url);
    }
    
    // Find the route configuration to get the redirect path
    const routeConfig = securityService.findRouteConfig(normalizedPath);
    if (routeConfig && routeConfig.redirectTo) {
      return router.parseUrl(routeConfig.redirectTo);
    }
    
    // Default redirect to login
    return router.parseUrl('/login');
  }
  
  // Default redirect to home
  return router.parseUrl('/');
} 