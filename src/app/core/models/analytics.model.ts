/**
 * @fileoverview Defines the interfaces for analytics.json configuration
 * These interfaces provide type safety for the analytics configuration
 */

/**
 * Main interface for analytics configuration
 */
export interface AnalyticsModel {
  /**
   * Version of the analytics configuration
   */
  version: string;
  
  /**
   * Last updated timestamp
   */
  lastUpdated: string;
  
  /**
   * Whether analytics tracking is enabled globally
   */
  analyticsEnabled: boolean;
  
  /**
   * List of analytics providers
   */
  providers: AnalyticsProvider[];
  
  /**
   * Sampling rates for different event types (0.0 to 1.0)
   */
  eventSampling: Record<string, number>;
  
  /**
   * Definitions for tracked events
   */
  eventDefinitions: Record<string, EventDefinition>;
  
  /**
   * User property settings
   */
  userProperties: UserProperties;
  
  /**
   * Privacy-related settings
   */
  privacySettings: PrivacySettings;
  
  /**
   * Whether debug mode is enabled
   */
  debugMode: boolean;
}

/**
 * Interface for an analytics provider configuration
 */
export interface AnalyticsProvider {
  /**
   * Name of the provider (e.g., 'google-analytics', 'mixpanel')
   */
  name: string;
  
  /**
   * Whether this provider is enabled
   */
  enabled: boolean;
  
  /**
   * Tracking ID or token for the provider
   */
  trackingId?: string;
  token?: string;
  endpoint?: string;
  
  /**
   * Provider-specific options
   */
  options: Record<string, any>;
}

/**
 * Interface for event definition
 */
export interface EventDefinition {
  /**
   * Properties that must be included when tracking this event
   */
  requiredProperties: string[];
  
  /**
   * Optional properties that may be included when tracking this event
   */
  optionalProperties: string[];
}

/**
 * Interface for user property settings
 */
export interface UserProperties {
  /**
   * List of allowed user properties
   */
  allowedProperties: string[];
  
  /**
   * Whether to identify the user on initialization
   */
  identifyOnInit: boolean;
  
  /**
   * Whether to anonymize user data by default
   */
  anonymizeByDefault: boolean;
}

/**
 * Interface for privacy settings
 */
export interface PrivacySettings {
  /**
   * Whether cookie consent is required
   */
  cookieConsent: boolean;
  
  /**
   * Number of days to retain data
   */
  dataRetentionDays: number;
  
  /**
   * Whether to respect Do Not Track browser setting
   */
  allowDoNotTrack: boolean;
  
  /**
   * Whether to respect GDPR regulations
   */
  respectGdpr: boolean;
} 