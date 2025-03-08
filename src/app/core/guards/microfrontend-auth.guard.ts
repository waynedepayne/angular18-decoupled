import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SecurityService } from '../services/security.service';
import { MicrofrontendService } from '../services/microfrontend.service';
import { map, switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Guard for protecting micro-frontend routes based on security.json
 * 
 * This guard checks if the user is authenticated and has the required roles
 * for accessing a micro-frontend route.
 */
export const microfrontendAuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const securityService = inject(SecurityService);
  const microfrontendService = inject(MicrofrontendService);
  
  // Get the path from the route
  const path = route.routeConfig?.path || '';
  
  return microfrontendService.routes$.pipe(
    take(1),
    switchMap(routes => {
      // Find the route configuration for this path
      const routeConfig = routes.find(r => r.path === path);
      
      // If route not found or not enabled, deny access
      if (!routeConfig || !routeConfig.enabled) {
        console.warn(`Route ${path} not found or disabled in microfrontend.json`);
        return of(false);
      }
      
      // If route doesn't require authentication, allow access
      if (!routeConfig.requiresAuth) {
        return of(true);
      }
      
      // Check if user is authenticated
      const isAuthenticated = securityService.isAuthenticated();
      if (!isAuthenticated) {
        // Redirect to login page
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return of(false);
      }
      
      // If no specific roles required, allow access
      if (!routeConfig.roles || routeConfig.roles.length === 0) {
        return of(true);
      }
      
      // Check if user has required roles
      const hasRequiredRole = routeConfig.roles.some(role => 
        securityService.hasRole(role)
      );
      
      if (!hasRequiredRole) {
        console.warn(`User does not have required roles for route ${path}`);
        // Redirect to unauthorized page or home
        router.navigate(['/unauthorized']);
      }
      
      return of(hasRequiredRole);
    })
  );
};

// Export a token for the guard to be used in route configurations
export const MICROFRONTEND_AUTH_GUARD = 'microfrontendAuthGuard'; 