/**
 * @fileoverview UpgradeBridgeService is responsible for loading and providing access to the application's
 * hybrid AngularJS/Angular configuration from upgrade.json. It integrates with NgUpgrade to bridge
 * between AngularJS and Angular components and services.
 * 
 * JSON Source: assets/upgrade.json
 * 
 * Data Structure:
 * - version: Version of the upgrade configuration
 * - enabled: Whether the hybrid mode is enabled
 * - angularJSModules: List of AngularJS modules to load
 * - bootstrapElement: Element ID where AngularJS app is bootstrapped
 * - downgradeComponents: Angular components to downgrade for use in AngularJS
 * - upgradeComponents: AngularJS components to upgrade for use in Angular
 * - upgradeProviders: AngularJS providers to upgrade for use in Angular
 * - downgradeProviders: Angular providers to downgrade for use in AngularJS
 * - routes: Legacy routes configuration
 * - migrationProgress: Migration progress information
 * 
 * Transformation Logic:
 * - JSON is loaded at application startup via APP_INITIALIZER
 * - Configuration is used to set up NgUpgrade bridge
 * - Components and services are upgraded/downgraded based on configuration
 */
import { Injectable, signal, inject, Injector, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { UpgradeModel, UpgradeComponent, DowngradeComponent, UpgradeProvider, DowngradeProvider } from '../models/upgrade.model';

@Injectable({
  providedIn: 'root'
})
export class UpgradeBridgeService {
  private upgradeBridgeConfigSignal = signal<UpgradeModel | null>(null);
  private isBrowser: boolean;
  
  // Public signals for components to consume
  public readonly upgradeBridgeConfig = this.upgradeBridgeConfigSignal.asReadonly();
  
  // Inject dependencies
  private http = inject(HttpClient);
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Loads the upgrade bridge configuration from the JSON file
   * Used by APP_INITIALIZER to load upgrade bridge at startup
   * 
   * @returns Observable<UpgradeModel> - The loaded upgrade bridge configuration or default values
   */
  loadUpgradeBridgeConfig(): Observable<UpgradeModel> {
    return this.http.get<UpgradeModel>('assets/upgrade.json').pipe(
      tap(config => {
        console.log('Upgrade bridge config loaded successfully');
        this.upgradeBridgeConfigSignal.set(config);
        
        // Only initialize upgrade bridge in the browser
        if (this.isBrowser && config.enabled) {
          this.initializeUpgradeBridge(config);
        }
      }),
      catchError(error => {
        console.error('Error loading upgrade bridge config:', error);
        const defaultConfig = this.getDefaultUpgradeBridgeConfig();
        this.upgradeBridgeConfigSignal.set(defaultConfig);
        return of(defaultConfig);
      })
    );
  }

  /**
   * Initializes the upgrade bridge based on configuration
   * 
   * @param config - The upgrade bridge configuration
   */
  private initializeUpgradeBridge(config: UpgradeModel): void {
    if (!config.enabled) {
      console.log('Upgrade bridge is disabled');
      return;
    }

    console.log('Initializing upgrade bridge with modules:', config.angularJSModules.join(', '));
    
    // In a real implementation, this would initialize the NgUpgrade bridge
    // For demonstration purposes, we'll just log the initialization
    
    // Example of what would happen in a real implementation:
    // 1. Create an UpgradeModule
    // 2. Bootstrap the AngularJS application
    // 3. Register upgraded/downgraded components and services
  }

  /**
   * Gets all upgraded components
   * 
   * @returns UpgradeComponent[] - Array of upgraded components
   */
  getUpgradedComponents(): UpgradeComponent[] {
    const config = this.upgradeBridgeConfigSignal();
    return config?.upgradeComponents || [];
  }

  /**
   * Gets all downgraded components
   * 
   * @returns DowngradeComponent[] - Array of downgraded components
   */
  getDowngradedComponents(): DowngradeComponent[] {
    const config = this.upgradeBridgeConfigSignal();
    return config?.downgradeComponents || [];
  }

  /**
   * Gets all upgraded providers
   * 
   * @returns UpgradeProvider[] - Array of upgraded providers
   */
  getUpgradedProviders(): UpgradeProvider[] {
    const config = this.upgradeBridgeConfigSignal();
    return config?.upgradeProviders || [];
  }

  /**
   * Gets all downgraded providers
   * 
   * @returns DowngradeProvider[] - Array of downgraded providers
   */
  getDowngradedProviders(): DowngradeProvider[] {
    const config = this.upgradeBridgeConfigSignal();
    return config?.downgradeProviders || [];
  }

  /**
   * Gets all legacy routes
   * 
   * @returns LegacyRoute[] - Array of legacy routes
   */
  getLegacyRoutes() {
    const config = this.upgradeBridgeConfigSignal();
    return config?.routes || [];
  }

  /**
   * Gets the migration progress
   * 
   * @returns MigrationProgress | null - Migration progress information
   */
  getMigrationProgress() {
    const config = this.upgradeBridgeConfigSignal();
    return config?.migrationProgress || null;
  }

  /**
   * Checks if a component is deprecated
   * 
   * @param componentName - The name of the component to check
   * @returns boolean - Whether the component is deprecated
   */
  isComponentDeprecated(componentName: string): boolean {
    const config = this.upgradeBridgeConfigSignal();
    if (!config || !config.enabled || !config.deprecationNotices.enabled) {
      return false;
    }
    
    // Check if the component is in the list of upgraded components
    return config.upgradeComponents.some(component => component.name === componentName);
  }

  /**
   * Gets the deprecation message for a component
   * 
   * @param componentName - The name of the component to get the message for
   * @returns string | null - The deprecation message or null if not deprecated
   */
  getDeprecationMessage(componentName: string): string | null {
    const config = this.upgradeBridgeConfigSignal();
    if (!config || !config.enabled || !config.deprecationNotices.enabled) {
      return null;
    }
    
    // Check if the component is in the list of upgraded components
    const isDeprecated = config.upgradeComponents.some(component => component.name === componentName);
    
    return isDeprecated ? config.deprecationNotices.message : null;
  }

  /**
   * Provides a default upgrade bridge configuration in case the JSON file cannot be loaded
   * 
   * @returns UpgradeModel - The default upgrade bridge configuration
   */
  private getDefaultUpgradeBridgeConfig(): UpgradeModel {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      enabled: false,
      description: 'Default upgrade bridge configuration',
      angularJSModules: [],
      bootstrapElement: 'legacy-app',
      strictDi: true,
      downgradeComponents: [],
      upgradeComponents: [],
      upgradeProviders: [],
      downgradeProviders: [],
      routes: [],
      aotMode: true,
      migrationProgress: {
        totalComponents: 0,
        migratedComponents: 0,
        remainingComponents: 0,
        completionPercentage: 0
      },
      deprecationNotices: {
        enabled: false,
        showInUI: false,
        message: 'This component is using legacy AngularJS code and will be upgraded soon.'
      }
    };
  }
} 