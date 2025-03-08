/**
 * @fileoverview Defines the interfaces for upgrade.json configuration
 * These interfaces provide type safety for the hybrid AngularJS/Angular application
 */

/**
 * Main interface for upgrade configuration
 */
export interface UpgradeModel {
  /**
   * Version of the upgrade configuration
   */
  version: string;
  
  /**
   * Last updated timestamp
   */
  lastUpdated: string;
  
  /**
   * Whether the hybrid mode is enabled
   */
  enabled: boolean;
  
  /**
   * Description of the upgrade configuration
   */
  description: string;
  
  /**
   * List of AngularJS modules to load
   */
  angularJSModules: string[];
  
  /**
   * Element ID where AngularJS app is bootstrapped
   */
  bootstrapElement: string;
  
  /**
   * Whether to use strict dependency injection
   */
  strictDi: boolean;
  
  /**
   * Angular components to downgrade for use in AngularJS
   */
  downgradeComponents: DowngradeComponent[];
  
  /**
   * AngularJS components to upgrade for use in Angular
   */
  upgradeComponents: UpgradeComponent[];
  
  /**
   * AngularJS providers to upgrade for use in Angular
   */
  upgradeProviders: UpgradeProvider[];
  
  /**
   * Angular providers to downgrade for use in AngularJS
   */
  downgradeProviders: DowngradeProvider[];
  
  /**
   * Legacy routes configuration
   */
  routes: LegacyRoute[];
  
  /**
   * Whether to use AOT compilation
   */
  aotMode: boolean;
  
  /**
   * Migration progress information
   */
  migrationProgress: MigrationProgress;
  
  /**
   * Deprecation notices configuration
   */
  deprecationNotices: DeprecationNotices;
}

/**
 * Interface for downgraded Angular components
 */
export interface DowngradeComponent {
  /**
   * Name of the Angular component
   */
  name: string;
  
  /**
   * CSS selector for the Angular component
   */
  selector: string;
  
  /**
   * Name to use in AngularJS templates
   */
  angularJSName: string;
}

/**
 * Interface for upgraded AngularJS components
 */
export interface UpgradeComponent {
  /**
   * Name of the AngularJS component
   */
  name: string;
  
  /**
   * CSS selector for the AngularJS component
   */
  selector: string;
  
  /**
   * Name to use in Angular
   */
  angularName: string;
}

/**
 * Interface for upgraded AngularJS providers
 */
export interface UpgradeProvider {
  /**
   * Name of the AngularJS provider
   */
  name: string;
  
  /**
   * Factory function name to create the provider
   */
  useFactory: string;
  
  /**
   * Dependencies for the factory function
   */
  deps: string[];
}

/**
 * Interface for downgraded Angular providers
 */
export interface DowngradeProvider {
  /**
   * Name of the Angular provider
   */
  name: string;
  
  /**
   * Name to use in AngularJS
   */
  angularJSName: string;
}

/**
 * Interface for legacy routes
 */
export interface LegacyRoute {
  /**
   * Path for the route
   */
  path: string;
  
  /**
   * Component to use for the route
   */
  component: string;
  
  /**
   * Title for the route
   */
  title: string;
}

/**
 * Interface for migration progress
 */
export interface MigrationProgress {
  /**
   * Total number of components to migrate
   */
  totalComponents: number;
  
  /**
   * Number of components already migrated
   */
  migratedComponents: number;
  
  /**
   * Number of components remaining to migrate
   */
  remainingComponents: number;
  
  /**
   * Percentage of migration completion
   */
  completionPercentage: number;
}

/**
 * Interface for deprecation notices
 */
export interface DeprecationNotices {
  /**
   * Whether deprecation notices are enabled
   */
  enabled: boolean;
  
  /**
   * Whether to show deprecation notices in the UI
   */
  showInUI: boolean;
  
  /**
   * Message to display for deprecated components
   */
  message: string;
} 