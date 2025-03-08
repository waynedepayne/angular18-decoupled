/**
 * Interfaces for the microfrontend.json file which contains configuration
 * for Module Federation and remote modules.
 */

/**
 * Main interface for the microfrontend.json file
 */
export interface MicrofrontendModel {
  /**
   * Version of the microfrontend configuration for tracking changes
   */
  version: string;
  
  /**
   * Last updated timestamp
   */
  lastUpdated: string;
  
  /**
   * Whether microfrontends are enabled
   */
  enabled: boolean;
  
  /**
   * Global settings for all microfrontends
   */
  settings: MicrofrontendSettings;
  
  /**
   * Remote modules configuration
   */
  remotes: Record<string, RemoteModule>;
  
  /**
   * Route mappings for remote modules
   */
  routes: RemoteRoute[];
  
  /**
   * Shared dependencies configuration
   */
  shared: SharedDependencies;
}

/**
 * Global settings for microfrontends
 */
export interface MicrofrontendSettings {
  /**
   * Default timeout for loading remote modules in milliseconds
   */
  defaultTimeout: number;
  
  /**
   * Whether to preload all remote modules at startup
   */
  preloadAll: boolean;
  
  /**
   * Whether to retry loading remote modules on failure
   */
  retryOnError: boolean;
  
  /**
   * Number of retries before giving up
   */
  maxRetries?: number;
  
  /**
   * Whether to show loading indicators when loading remote modules
   */
  showLoading: boolean;
  
  /**
   * Whether to show error messages when loading remote modules fails
   */
  showErrors: boolean;
  
  /**
   * Custom CSS class to apply to remote module containers
   */
  containerClass?: string;
}

/**
 * Remote module configuration
 */
export interface RemoteModule {
  /**
   * Name of the remote module
   */
  name: string;
  
  /**
   * URL of the remote module entry point
   */
  url: string;
  
  /**
   * Exposed modules from the remote
   */
  exposedModules: ExposedModule[];
  
  /**
   * Whether the remote module is enabled
   */
  enabled: boolean;
  
  /**
   * Custom timeout for this remote module in milliseconds
   */
  timeout?: number;
  
  /**
   * Whether to preload this remote module at startup
   */
  preload?: boolean;
  
  /**
   * Custom error handling for this remote module
   */
  errorHandling?: {
    /**
     * Whether to retry loading this remote module on failure
     */
    retry?: boolean;
    
    /**
     * Number of retries before giving up
     */
    maxRetries?: number;
    
    /**
     * Fallback component to show when loading fails
     */
    fallback?: string;
  };
}

/**
 * Exposed module from a remote
 */
export interface ExposedModule {
  /**
   * Name of the exposed module
   */
  name: string;
  
  /**
   * Type of the exposed module (e.g., 'component', 'module', 'service')
   */
  type: 'component' | 'module' | 'service' | 'standalone';
  
  /**
   * Path to the exposed module
   */
  path: string;
  
  /**
   * Whether the exposed module is enabled
   */
  enabled: boolean;
}

/**
 * Route mapping for a remote module
 */
export interface RemoteRoute {
  /**
   * Path for the route
   */
  path: string;
  
  /**
   * Name of the remote module
   */
  remoteName: string;
  
  /**
   * Name of the exposed module to load
   */
  exposedModule: string;
  
  /**
   * Whether the route is enabled
   */
  enabled: boolean;
  
  /**
   * Whether to lazy load the route
   */
  lazy: boolean;
  
  /**
   * Data to pass to the route
   */
  data?: Record<string, any>;
  
  /**
   * Child routes
   */
  children?: RemoteRoute[];
  
  /**
   * Whether the route requires authentication
   */
  requiresAuth?: boolean;
  
  /**
   * Roles required to access the route
   */
  roles?: string[];
}

/**
 * Shared dependencies configuration
 */
export interface SharedDependencies {
  /**
   * Whether to share singleton instances of dependencies
   */
  singleton: boolean;
  
  /**
   * Whether to require the same version of dependencies
   */
  strictVersion: boolean;
  
  /**
   * List of dependencies to share
   */
  libs: SharedLib[];
}

/**
 * Shared library configuration
 */
export interface SharedLib {
  /**
   * Name of the library
   */
  name: string;
  
  /**
   * Version of the library
   */
  version?: string;
  
  /**
   * Whether the library is a singleton
   */
  singleton?: boolean;
  
  /**
   * Whether to require the same version of the library
   */
  strictVersion?: boolean;
  
  /**
   * Whether to eagerly load the library
   */
  eager?: boolean;
} 