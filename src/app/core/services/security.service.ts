import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap, BehaviorSubject } from 'rxjs';
import { SecurityModel, Role, Permission, RouteAccess, FeatureAccess, ApiAccess } from '../models/security.model';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

/**
 * Service responsible for loading and managing security settings from security.json
 */
@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private securitySignal = signal<SecurityModel | null>(null);
  private currentUserRolesSignal = signal<string[]>(['guest']);
  private isAuthenticatedSignal = signal<boolean>(false);
  private currentUserPermissionsSignal = signal<string[]>([]);
  private securityLoadedSignal = signal<boolean>(false);
  
  // Mock user data for demo purposes
  private mockUserSubject = new BehaviorSubject<any>(null);
  
  // Public signals
  public readonly security = computed(() => this.securitySignal());
  public readonly currentUserRoles = this.currentUserRolesSignal.asReadonly();
  public readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  public readonly currentUserPermissions = this.currentUserPermissionsSignal.asReadonly();
  public readonly securityLoaded = this.securityLoadedSignal.asReadonly();
  
  // Observable for mock user
  public readonly currentUser$ = this.mockUserSubject.asObservable();
  
  // Computed properties
  public readonly availableRoles = computed(() => {
    const security = this.securitySignal();
    if (!security) return [];
    
    return Object.entries(security.roles).map(([id, role]) => ({
      id,
      name: role.name,
      description: role.description
    }));
  });
  
  public readonly availablePermissions = computed(() => {
    const security = this.securitySignal();
    if (!security) return [];
    
    return Object.entries(security.permissions).map(([id, permission]) => ({
      id,
      name: permission.name,
      description: permission.description,
      resourceType: permission.resourceType
    }));
  });
  
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {
    // Only listen for route changes in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Listen for route changes to check access
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.checkCurrentRouteAccess();
      });
    }
  }

  /**
   * Loads the security configuration from security.json
   */
  loadSecurity(): Observable<SecurityModel> {
    return this.http.get<SecurityModel>('assets/security.json').pipe(
      tap(security => {
        this.securitySignal.set(security);
        this.securityLoadedSignal.set(true);
        
        // Initialize with default role
        if (security.defaultRole) {
          this.setCurrentUserRoles([security.defaultRole]);
        }
        
        // Check current route access after loading security
        if (isPlatformBrowser(this.platformId)) {
          this.checkCurrentRouteAccess();
        }
      }),
      catchError(error => {
        console.error('Error loading security.json:', error);
        const defaultSecurity = this.getDefaultSecurity();
        this.securitySignal.set(defaultSecurity);
        this.securityLoadedSignal.set(true);
        return of(defaultSecurity);
      })
    );
  }

  /**
   * Sets the current user's roles and updates permissions
   */
  setCurrentUserRoles(roles: string[]): void {
    console.log('Setting user roles:', roles);
    this.currentUserRolesSignal.set(roles);
    this.updateCurrentUserPermissions();
  }

  /**
   * Updates the current user's permissions based on their roles
   */
  private updateCurrentUserPermissions(): void {
    const security = this.securitySignal();
    if (!security) return;
    
    const roles = this.currentUserRolesSignal();
    const permissions: string[] = [];
    
    // Get permissions for each role
    roles.forEach(roleId => {
      const role = security.roles[roleId];
      if (role) {
        // Add direct permissions
        if (role.permissions) {
          permissions.push(...role.permissions);
        }
        
        // Add inherited permissions
        if (role.inherits) {
          role.inherits.forEach(inheritedRoleId => {
            const inheritedRole = security.roles[inheritedRoleId];
            if (inheritedRole && inheritedRole.permissions) {
              permissions.push(...inheritedRole.permissions);
            }
          });
        }
      }
    });
    
    // Remove duplicates
    this.currentUserPermissionsSignal.set([...new Set(permissions)]);
    console.log('Updated permissions:', [...new Set(permissions)]);
  }

  /**
   * Checks if the current user has a specific role
   */
  hasRole(role: string): boolean {
    return this.currentUserRolesSignal().includes(role);
  }

  /**
   * Checks if the current user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    return this.currentUserRolesSignal().some(role => roles.includes(role));
  }

  /**
   * Checks if the current user has all of the specified roles
   */
  hasAllRoles(roles: string[]): boolean {
    return roles.every(role => this.currentUserRolesSignal().includes(role));
  }

  /**
   * Checks if the current user has a specific permission
   */
  hasPermission(permission: string): boolean {
    // Admin always has all permissions
    if (this.hasRole('admin')) return true;
    
    // Check if user has the specific permission
    return this.currentUserPermissionsSignal().includes(permission);
  }

  /**
   * Checks if the current user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    // Admin always has all permissions
    if (this.hasRole('admin')) return true;
    
    // Check if user has any of the permissions
    return permissions.some(permission => this.currentUserPermissionsSignal().includes(permission));
  }

  /**
   * Checks if the current user has all of the specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    // Admin always has all permissions
    if (this.hasRole('admin')) return true;
    
    // Check if user has all of the permissions
    return permissions.every(permission => this.currentUserPermissionsSignal().includes(permission));
  }

  /**
   * Checks if the current user can access a specific route
   */
  canAccessRoute(path: string): boolean {
    const security = this.securitySignal();
    if (!security) return true; // If security is not loaded, allow access
    
    // Find the route configuration
    const routeConfig = this.findRouteConfig(path);
    if (!routeConfig) {
      // If no specific route config is found, use default behavior based on strictAccessControl
      return !security.strictAccessControl;
    }
    
    // Check roles
    if (routeConfig.allowedRoles && !this.hasAnyRole(routeConfig.allowedRoles)) {
      return false;
    }
    
    // Check denied roles (these override allowed roles)
    if (routeConfig.deniedRoles && this.hasAnyRole(routeConfig.deniedRoles)) {
      return false;
    }
    
    // Check permissions
    if (routeConfig.requiredPermissions && !this.hasAllPermissions(routeConfig.requiredPermissions)) {
      return false;
    }
    
    return true;
  }

  /**
   * Checks if the current user can access a specific feature
   */
  canAccessFeature(featureId: string): boolean {
    const security = this.securitySignal();
    if (!security) return true; // If security is not loaded, allow access
    
    // Find the feature configuration
    const featureConfig = security.features.find(f => f.featureId === featureId);
    if (!featureConfig) {
      // If no specific feature config is found, use default behavior based on strictAccessControl
      return !security.strictAccessControl;
    }
    
    // Check roles
    if (featureConfig.allowedRoles && !this.hasAnyRole(featureConfig.allowedRoles)) {
      return false;
    }
    
    // Check denied roles (these override allowed roles)
    if (featureConfig.deniedRoles && this.hasAnyRole(featureConfig.deniedRoles)) {
      return false;
    }
    
    // Check permissions
    if (featureConfig.requiredPermissions && !this.hasAllPermissions(featureConfig.requiredPermissions)) {
      return false;
    }
    
    return true;
  }

  /**
   * Checks if the current user can access a specific API endpoint
   */
  canAccessApi(url: string, method: string): boolean {
    const security = this.securitySignal();
    if (!security) return true; // If security is not loaded, allow access
    
    // Find the API configuration
    const apiConfig = this.findApiConfig(url, method);
    if (!apiConfig) {
      // If no specific API config is found, use default behavior based on strictAccessControl
      return !security.strictAccessControl;
    }
    
    // Check roles
    if (apiConfig.allowedRoles && !this.hasAnyRole(apiConfig.allowedRoles)) {
      return false;
    }
    
    // Check denied roles (these override allowed roles)
    if (apiConfig.deniedRoles && this.hasAnyRole(apiConfig.deniedRoles)) {
      return false;
    }
    
    // Check permissions
    if (apiConfig.requiredPermissions && !this.hasAllPermissions(apiConfig.requiredPermissions)) {
      return false;
    }
    
    return true;
  }

  /**
   * Finds the route configuration for a given path
   */
  public findRouteConfig(path: string): RouteAccess | null {
    const security = this.securitySignal();
    if (!security) return null;
    
    // Normalize path
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    
    // First, check for exact match
    let routeConfig = security.routes.find(r => r.path === normalizedPath);
    if (routeConfig) return routeConfig;
    
    // Check for parent routes with children
    for (const route of security.routes) {
      if (route.children) {
        // Check if the path starts with the parent path
        if (normalizedPath.startsWith(route.path)) {
          // Check for child routes
          const childPath = normalizedPath.substring(route.path.length).replace(/^\/+/, '');
          const childRoute = route.children.find(c => c.path === childPath);
          if (childRoute) {
            // Merge parent and child route configs
            return {
              ...route,
              ...childRoute,
              path: normalizedPath
            };
          }
        }
      }
    }
    
    // Check for wildcard route
    return security.routes.find(r => r.path === '**') || null;
  }

  /**
   * Finds the API configuration for a given URL and method
   */
  private findApiConfig(url: string, method: string): ApiAccess | null {
    const security = this.securitySignal();
    if (!security) return null;
    
    // Convert method to uppercase
    const upperMethod = method.toUpperCase();
    
    // Find matching API config
    for (const api of security.apis) {
      // Check if URL matches pattern
      if (this.matchUrlPattern(url, api.urlPattern)) {
        // Check if method is allowed
        if (!api.methods || api.methods.includes(upperMethod)) {
          return api;
        }
      }
    }
    
    return null;
  }

  /**
   * Matches a URL against a pattern with wildcards
   */
  private matchUrlPattern(url: string, pattern: string): boolean {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\//g, '\\/') // Escape slashes
      .replace(/\*\*/g, '.*') // ** matches any characters
      .replace(/\*/g, '[^/]*'); // * matches any characters except /
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(url);
  }

  /**
   * Checks if the current route is accessible and redirects if necessary
   */
  private checkCurrentRouteAccess(): void {
    const security = this.securitySignal();
    if (!security) return;
    
    const currentUrl = this.router.url.split('?')[0]; // Remove query params
    const normalizedUrl = currentUrl.startsWith('/') ? currentUrl.substring(1) : currentUrl;
    
    if (!this.canAccessRoute(normalizedUrl)) {
      const routeConfig = this.findRouteConfig(normalizedUrl);
      if (routeConfig && routeConfig.redirectTo) {
        // Store the current URL for later if configured
        if (isPlatformBrowser(this.platformId) && security.authentication.storeReturnUrl) {
          localStorage.setItem('returnUrl', currentUrl);
        }
        
        // Redirect to the specified path
        this.router.navigate([routeConfig.redirectTo]);
      }
    }
  }

  /**
   * Simulates a login for demo purposes
   */
  login(username: string, password: string): Observable<any> {
    console.log(`SecurityService: Login attempt for ${username}`);
    
    // This is a mock implementation for demo purposes
    // In a real application, this would call an API
    
    // Simulate API call
    return of({
      success: true,
      user: {
        id: '1',
        username: username,
        name: 'Demo User',
        roles: username === 'admin' ? ['admin'] : 
               username === 'editor' ? ['editor'] :
               username === 'manager' ? ['manager'] :
               username === 'developer' ? ['developer'] : ['user']
      },
      token: 'mock-jwt-token'
    }).pipe(
      tap(response => {
        if (response.success) {
          console.log('SecurityService: Login successful', response);
          
          // Store token in browser environment only
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.token);
          }
          
          // Update user state
          this.mockUserSubject.next(response.user);
          this.isAuthenticatedSignal.set(true);
          this.setCurrentUserRoles(response.user.roles);
          
          // Get return URL from localStorage in browser environment only
          let returnUrl = '/security-demo';
          if (isPlatformBrowser(this.platformId)) {
            const storedReturnUrl = localStorage.getItem('returnUrl');
            if (storedReturnUrl) {
              returnUrl = storedReturnUrl;
              localStorage.removeItem('returnUrl');
            }
          }
          
          // Navigate to return URL
          console.log(`SecurityService: Navigating to ${returnUrl}`);
          this.router.navigateByUrl(returnUrl);
        }
      })
    );
  }

  /**
   * Simulates a logout for demo purposes
   */
  logout(): void {
    console.log('SecurityService: Logging out');
    
    // Clear token in browser environment only
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    
    // Reset user state
    this.mockUserSubject.next(null);
    this.isAuthenticatedSignal.set(false);
    
    const security = this.securitySignal();
    if (security) {
      this.setCurrentUserRoles([security.defaultRole]);
    } else {
      this.setCurrentUserRoles(['guest']);
    }
    
    // Navigate to home
    this.router.navigate(['/security-demo']);
  }

  /**
   * Checks if the user is authenticated on application startup
   */
  checkAuth(): void {
    console.log('SecurityService: Checking authentication');
    
    // Only check authentication in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Check if token exists
    const token = localStorage.getItem('token');
    if (token) {
      console.log('SecurityService: Found token, restoring session');
      
      // In a real application, you would validate the token
      // For demo purposes, we'll just assume it's valid
      
      // Try to get the username from localStorage
      const username = localStorage.getItem('username') || 'user';
      
      // Mock user data
      const user = {
        id: '1',
        username: username,
        name: 'Demo User',
        roles: username === 'admin' ? ['admin'] : 
               username === 'editor' ? ['editor'] :
               username === 'manager' ? ['manager'] :
               username === 'developer' ? ['developer'] : ['user']
      };
      
      this.mockUserSubject.next(user);
      this.isAuthenticatedSignal.set(true);
      this.setCurrentUserRoles(user.roles);
    } else {
      console.log('SecurityService: No token found, user is not authenticated');
    }
  }

  /**
   * Returns default security configuration in case loading fails
   */
  private getDefaultSecurity(): SecurityModel {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      defaultRole: 'guest',
      strictAccessControl: false,
      roles: {
        guest: {
          name: 'Guest',
          description: 'Unauthenticated user',
          isSystem: true,
          permissions: []
        },
        user: {
          name: 'User',
          description: 'Standard user',
          isSystem: true,
          permissions: []
        },
        admin: {
          name: 'Administrator',
          description: 'Administrator with full access',
          isSystem: true,
          permissions: ['admin:all']
        }
      },
      permissions: {
        'admin:all': {
          name: 'Full Administration',
          description: 'Complete access to all system features'
        }
      },
      routes: [
        {
          path: '',
          allowedRoles: ['guest', 'user', 'admin']
        },
        {
          path: 'login',
          allowedRoles: ['guest']
        },
        {
          path: '**',
          redirectTo: ''
        }
      ],
      features: [],
      apis: [],
      authentication: {
        provider: 'jwt',
        loginUrl: '/api/auth/login',
        logoutUrl: '/api/auth/logout',
        tokenStorage: 'localStorage',
        tokenExpirationTime: 3600,
        autoRefreshToken: false,
        redirectToLogin: true,
        storeReturnUrl: true
      }
    };
  }
} 