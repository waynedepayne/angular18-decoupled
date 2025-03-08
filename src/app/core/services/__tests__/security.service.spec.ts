import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SecurityService } from '../security.service';
import { SecurityModel } from '../../models/security.model';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('SecurityService', () => {
  let service: SecurityService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        SecurityService
      ]
    });
    
    service = TestBed.inject(SecurityService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    
    // Mock localStorage
    const localStorageMock = {
      getItem: function(key: string) { return null; },
      setItem: function(key: string, value: string) {},
      removeItem: function(key: string) {},
      clear: function() {}
    };
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
    
    // Spy on router navigate
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load security from JSON file', () => {
    const mockSecurityData: SecurityModel = {
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      defaultRole: 'guest',
      strictAccessControl: true,
      roles: {
        guest: {
          name: 'Guest',
          description: 'Unauthenticated user',
          isSystem: true,
          permissions: ['view:public']
        },
        user: {
          name: 'User',
          description: 'Standard user',
          isSystem: true,
          permissions: ['view:user', 'edit:profile']
        }
      },
      permissions: {
        'view:public': {
          name: 'View Public Content',
          description: 'Access to public pages and content'
        },
        'view:user': {
          name: 'View User Content',
          description: 'Access to user-specific content'
        },
        'edit:profile': {
          name: 'Edit Profile',
          description: 'Edit own user profile'
        }
      },
      routes: [
        {
          path: '',
          allowedRoles: ['guest', 'user']
        },
        {
          path: 'profile',
          allowedRoles: ['user'],
          requiredPermissions: ['edit:profile'],
          redirectTo: 'login'
        }
      ],
      features: [
        {
          featureId: 'profile-edit',
          allowedRoles: ['user'],
          requiredPermissions: ['edit:profile']
        }
      ],
      apis: [
        {
          urlPattern: '/api/public/**',
          methods: ['GET'],
          allowedRoles: ['guest', 'user']
        }
      ],
      authentication: {
        provider: 'jwt',
        loginUrl: '/api/auth/login',
        logoutUrl: '/api/auth/logout',
        tokenStorage: 'localStorage',
        tokenExpirationTime: 3600,
        autoRefreshToken: true,
        refreshTokenUrl: '/api/auth/refresh',
        redirectToLogin: true,
        storeReturnUrl: true
      }
    };

    service.loadSecurity().subscribe(data => {
      expect(data).toEqual(mockSecurityData);
      expect(service.security()).toEqual(mockSecurityData);
      expect(service.currentUserRoles()).toEqual(['guest']);
      expect(service.securityLoaded()).toBeTrue();
    });

    const req = httpMock.expectOne('assets/security.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockSecurityData);
  });

  it('should handle HTTP error and return default security', () => {
    service.loadSecurity().subscribe(data => {
      expect(data).toBeTruthy();
      expect(service.security()).toBeTruthy();
      expect(service.currentUserRoles()).toEqual(['guest']);
      expect(service.securityLoaded()).toBeTrue();
    });

    const req = httpMock.expectOne('assets/security.json');
    req.error(new ErrorEvent('Network error'));
  });

  it('should set user roles and update permissions', () => {
    // First load the security data
    service.loadSecurity().subscribe();
    
    const mockSecurityData: SecurityModel = {
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      defaultRole: 'guest',
      strictAccessControl: true,
      roles: {
        guest: {
          name: 'Guest',
          permissions: ['view:public']
        },
        user: {
          name: 'User',
          inherits: ['guest'],
          permissions: ['view:user', 'edit:profile']
        },
        admin: {
          name: 'Admin',
          permissions: ['admin:all']
        }
      },
      permissions: {
        'view:public': { name: 'View Public' },
        'view:user': { name: 'View User' },
        'edit:profile': { name: 'Edit Profile' },
        'admin:all': { name: 'Admin All' }
      },
      routes: [],
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
    
    const req = httpMock.expectOne('assets/security.json');
    req.flush(mockSecurityData);
    
    // Set user role
    service.setCurrentUserRoles(['user']);
    expect(service.currentUserRoles()).toEqual(['user']);
    expect(service.currentUserPermissions()).toContain('view:user');
    expect(service.currentUserPermissions()).toContain('edit:profile');
    expect(service.currentUserPermissions()).toContain('view:public'); // Inherited from guest
    
    // Set admin role
    service.setCurrentUserRoles(['admin']);
    expect(service.currentUserRoles()).toEqual(['admin']);
    expect(service.currentUserPermissions()).toContain('admin:all');
    expect(service.currentUserPermissions()).not.toContain('view:user');
  });

  it('should check if user has specific role', () => {
    // First load the security data
    service.loadSecurity().subscribe();
    
    const mockSecurityData: SecurityModel = {
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      defaultRole: 'guest',
      strictAccessControl: true,
      roles: {
        guest: { name: 'Guest' },
        user: { name: 'User' },
        admin: { name: 'Admin' }
      },
      permissions: {},
      routes: [],
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
    
    const req = httpMock.expectOne('assets/security.json');
    req.flush(mockSecurityData);
    
    // Default role is guest
    expect(service.hasRole('guest')).toBeTrue();
    expect(service.hasRole('user')).toBeFalse();
    
    // Set user role
    service.setCurrentUserRoles(['user']);
    expect(service.hasRole('guest')).toBeFalse();
    expect(service.hasRole('user')).toBeTrue();
    expect(service.hasRole('admin')).toBeFalse();
    
    // Check multiple roles
    expect(service.hasAnyRole(['guest', 'user'])).toBeTrue();
    expect(service.hasAnyRole(['admin', 'editor'])).toBeFalse();
    expect(service.hasAllRoles(['user'])).toBeTrue();
    expect(service.hasAllRoles(['user', 'admin'])).toBeFalse();
  });

  it('should check if user has specific permission', () => {
    // First load the security data
    service.loadSecurity().subscribe();
    
    const mockSecurityData: SecurityModel = {
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      defaultRole: 'guest',
      strictAccessControl: true,
      roles: {
        guest: {
          name: 'Guest',
          permissions: ['view:public']
        },
        user: {
          name: 'User',
          permissions: ['view:user', 'edit:profile']
        },
        admin: {
          name: 'Admin',
          permissions: ['admin:all']
        }
      },
      permissions: {
        'view:public': { name: 'View Public' },
        'view:user': { name: 'View User' },
        'edit:profile': { name: 'Edit Profile' },
        'admin:all': { name: 'Admin All' }
      },
      routes: [],
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
    
    const req = httpMock.expectOne('assets/security.json');
    req.flush(mockSecurityData);
    
    // Default role is guest
    expect(service.hasPermission('view:public')).toBeTrue();
    expect(service.hasPermission('view:user')).toBeFalse();
    
    // Set user role
    service.setCurrentUserRoles(['user']);
    expect(service.hasPermission('view:public')).toBeFalse(); // No inheritance in this test
    expect(service.hasPermission('view:user')).toBeTrue();
    expect(service.hasPermission('edit:profile')).toBeTrue();
    expect(service.hasPermission('admin:all')).toBeFalse();
    
    // Admin has all permissions
    service.setCurrentUserRoles(['admin']);
    expect(service.hasPermission('admin:all')).toBeTrue();
    expect(service.hasPermission('view:user')).toBeTrue(); // Admin has all permissions
    
    // Check multiple permissions
    service.setCurrentUserRoles(['user']);
    expect(service.hasAnyPermission(['view:user', 'admin:all'])).toBeTrue();
    expect(service.hasAnyPermission(['admin:all', 'view:system'])).toBeFalse();
    expect(service.hasAllPermissions(['view:user', 'edit:profile'])).toBeTrue();
    expect(service.hasAllPermissions(['view:user', 'admin:all'])).toBeFalse();
  });

  it('should check if user can access a route', () => {
    // First load the security data
    service.loadSecurity().subscribe();
    
    const mockSecurityData: SecurityModel = {
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      defaultRole: 'guest',
      strictAccessControl: true,
      roles: {
        guest: {
          name: 'Guest',
          permissions: ['view:public']
        },
        user: {
          name: 'User',
          permissions: ['view:user', 'edit:profile']
        }
      },
      permissions: {
        'view:public': { name: 'View Public' },
        'view:user': { name: 'View User' },
        'edit:profile': { name: 'Edit Profile' }
      },
      routes: [
        {
          path: '',
          allowedRoles: ['guest', 'user']
        },
        {
          path: 'profile',
          allowedRoles: ['user'],
          requiredPermissions: ['edit:profile']
        },
        {
          path: 'admin',
          allowedRoles: ['admin']
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
    
    const req = httpMock.expectOne('assets/security.json');
    req.flush(mockSecurityData);
    
    // Default role is guest
    expect(service.canAccessRoute('')).toBeTrue();
    expect(service.canAccessRoute('profile')).toBeFalse();
    
    // Set user role
    service.setCurrentUserRoles(['user']);
    expect(service.canAccessRoute('')).toBeTrue();
    expect(service.canAccessRoute('profile')).toBeTrue();
    expect(service.canAccessRoute('admin')).toBeFalse();
  });

  it('should simulate login and logout', () => {
    // First load the security data
    service.loadSecurity().subscribe();
    
    const mockSecurityData: SecurityModel = {
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      defaultRole: 'guest',
      strictAccessControl: true,
      roles: {
        guest: { name: 'Guest' },
        user: { name: 'User' }
      },
      permissions: {},
      routes: [],
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
    
    const req = httpMock.expectOne('assets/security.json');
    req.flush(mockSecurityData);
    
    // Default state
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUserRoles()).toEqual(['guest']);
    
    // Login
    service.login('user', 'password').subscribe(response => {
      expect(response.success).toBeTrue();
      expect(response.user.username).toBe('user');
    });
    
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUserRoles()).toEqual(['user']);
    expect(router.navigateByUrl).toHaveBeenCalled();
    
    // Logout
    service.logout();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUserRoles()).toEqual(['guest']);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
}); 