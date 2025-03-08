/**
 * @fileoverview ConfigService is responsible for loading and providing access to the application's
 * global configuration settings from config.json.
 * 
 * JSON Source: assets/config.json
 * 
 * Data Structure:
 * - environmentName: Current environment (development, production, etc.)
 * - apiEndpoint: Base URL for API calls
 * - featureFlags: Toggle switches for various features
 * - auth: Authentication-related settings
 * - performance: Performance optimization settings
 * - ui: User interface preferences
 * - logging: Logging configuration
 * 
 * Transformation Logic:
 * - JSON is loaded at application startup via APP_INITIALIZER
 * - Data is exposed through Angular Signals for reactive access
 * - Computed signals provide easy access to commonly used config sections
 * - Fallback configuration is provided in case of loading errors
 */
import { Injectable, signal, computed, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ConfigModel } from '../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  // Signal to hold the configuration data
  private configSignal = signal<ConfigModel | null>(null);
  
  // Public API for accessing the config
  public readonly config: Signal<ConfigModel | null> = this.configSignal.asReadonly();
  
  // Computed signals for commonly accessed config sections
  public readonly featureFlags = computed(() => this.configSignal()?.featureFlags);
  public readonly apiEndpoint = computed(() => this.configSignal()?.apiEndpoint);
  public readonly environmentName = computed(() => this.configSignal()?.environmentName);
  public readonly auth = computed(() => this.configSignal()?.auth);
  public readonly ui = computed(() => this.configSignal()?.ui);
  
  constructor(private http: HttpClient) {}
  
  /**
   * Loads the configuration from the JSON file
   * Used by APP_INITIALIZER to load config at startup
   * 
   * @returns Observable<ConfigModel> - The loaded configuration or default values
   */
  loadConfig(): Observable<ConfigModel> {
    return this.http.get<ConfigModel>('assets/config.json').pipe(
      tap(config => {
        console.log('Configuration loaded successfully');
        this.configSignal.set(config);
      }),
      catchError(error => {
        console.error('Failed to load configuration', error);
        // Return a default config in case of error
        return of(this.getDefaultConfig());
      })
    );
  }
  
  /**
   * Provides a default configuration in case the config file cannot be loaded
   * This ensures the application can still function with reasonable defaults
   * 
   * @returns ConfigModel - Default configuration values
   */
  private getDefaultConfig(): ConfigModel {
    const defaultConfig: ConfigModel = {
      environmentName: 'development',
      apiEndpoint: 'https://api.fallback.example.com',
      featureFlags: {
        enableServiceWorker: false,
        enableDarkMode: false,
        enableBetaFeatures: false,
        enableAnalytics: false
      },
      auth: {
        tokenExpiryMinutes: 30,
        refreshTokenExpiryDays: 1,
        authEndpoint: 'https://auth.fallback.example.com'
      },
      performance: {
        cacheTimeoutMinutes: 5,
        maxConcurrentRequests: 3,
        enablePrefetching: false
      },
      ui: {
        defaultTheme: 'light',
        animationsEnabled: false,
        defaultLanguage: 'en'
      },
      logging: {
        logLevel: 'error',
        enableRemoteLogging: false,
        remoteLogEndpoint: 'https://logs.fallback.example.com'
      }
    };
    
    return defaultConfig;
  }
  
  /**
   * Checks if a specific feature flag is enabled
   * 
   * @param featureName - The name of the feature flag to check
   * @returns boolean - Whether the feature is enabled
   */
  isFeatureEnabled(featureName: keyof ConfigModel['featureFlags']): boolean {
    return this.configSignal()?.featureFlags[featureName] || false;
  }
} 