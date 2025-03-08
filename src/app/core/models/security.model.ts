/**
 * Interfaces for the security.json file which contains role-based access control
 * and security settings for the application.
 */

/**
 * Main interface for the security.json file
 */
export interface SecurityModel {
  /**
   * Version of the security configuration for tracking changes
   */
  version: string;
  
  /**
   * Last updated timestamp
   */
  lastUpdated: string;
  
  /**
   * Default role to use for unauthenticated users
   */
  defaultRole: string;
  
  /**
   * Whether to enforce strict access control
   * If true, access is denied by default unless explicitly granted
   * If false, access is granted by default unless explicitly denied
   */
  strictAccessControl: boolean;
  
  /**
   * Available roles in the application
   */
  roles: Record<string, Role>;
  
  /**
   * Permission definitions
   */
  permissions: Record<string, Permission>;
  
  /**
   * Route access control
   */
  routes: RouteAccess[];
  
  /**
   * Feature access control
   */
  features: FeatureAccess[];
  
  /**
   * API endpoint access control
   */
  apis: ApiAccess[];
  
  /**
   * Authentication settings
   */
  authentication: AuthenticationSettings;
}

/**
 * Role definition
 */
export interface Role {
  /**
   * Name of the role
   */
  name: string;
  
  /**
   * Description of the role
   */
  description?: string;
  
  /**
   * Whether this is a system role that cannot be modified
   */
  isSystem?: boolean;
  
  /**
   * Parent roles that this role inherits permissions from
   */
  inherits?: string[];
  
  /**
   * Permissions granted to this role
   */
  permissions?: string[];
}

/**
 * Permission definition
 */
export interface Permission {
  /**
   * Name of the permission
   */
  name: string;
  
  /**
   * Description of the permission
   */
  description?: string;
  
  /**
   * Resource type this permission applies to (e.g., 'route', 'feature', 'api')
   */
  resourceType?: string;
  
  /**
   * Actions allowed by this permission (e.g., 'view', 'edit', 'delete')
   */
  actions?: string[];
}

/**
 * Route access control
 */
export interface RouteAccess {
  /**
   * Path of the route
   */
  path: string;
  
  /**
   * Roles that can access this route
   */
  allowedRoles?: string[];
  
  /**
   * Roles that cannot access this route (overrides allowedRoles)
   */
  deniedRoles?: string[];
  
  /**
   * Permissions required to access this route
   */
  requiredPermissions?: string[];
  
  /**
   * Redirect path if access is denied
   */
  redirectTo?: string;
  
  /**
   * Whether to hide this route from navigation if not accessible
   */
  hideIfNotAccessible?: boolean;
  
  /**
   * Child routes
   */
  children?: RouteAccess[];
}

/**
 * Feature access control
 */
export interface FeatureAccess {
  /**
   * ID of the feature
   */
  featureId: string;
  
  /**
   * Roles that can access this feature
   */
  allowedRoles?: string[];
  
  /**
   * Roles that cannot access this feature (overrides allowedRoles)
   */
  deniedRoles?: string[];
  
  /**
   * Permissions required to access this feature
   */
  requiredPermissions?: string[];
  
  /**
   * Whether to hide this feature if not accessible
   */
  hideIfNotAccessible?: boolean;
}

/**
 * API endpoint access control
 */
export interface ApiAccess {
  /**
   * URL pattern of the API endpoint
   */
  urlPattern: string;
  
  /**
   * HTTP methods this access control applies to
   */
  methods?: string[];
  
  /**
   * Roles that can access this API
   */
  allowedRoles?: string[];
  
  /**
   * Roles that cannot access this API (overrides allowedRoles)
   */
  deniedRoles?: string[];
  
  /**
   * Permissions required to access this API
   */
  requiredPermissions?: string[];
}

/**
 * Authentication settings
 */
export interface AuthenticationSettings {
  /**
   * Authentication provider type (e.g., 'jwt', 'oauth', 'oidc')
   */
  provider: string;
  
  /**
   * Login URL
   */
  loginUrl: string;
  
  /**
   * Logout URL
   */
  logoutUrl: string;
  
  /**
   * Token storage type (e.g., 'localStorage', 'sessionStorage', 'cookie')
   */
  tokenStorage: string;
  
  /**
   * Token expiration time in seconds
   */
  tokenExpirationTime: number;
  
  /**
   * Whether to refresh tokens automatically
   */
  autoRefreshToken: boolean;
  
  /**
   * URL for refreshing tokens
   */
  refreshTokenUrl?: string;
  
  /**
   * Whether to redirect to login page on unauthorized access
   */
  redirectToLogin: boolean;
  
  /**
   * Whether to store the return URL when redirecting to login
   */
  storeReturnUrl: boolean;
} 