export interface ConfigModel {
  environmentName: string;
  apiEndpoint: string;
  featureFlags: FeatureFlags;
  auth: Auth;
  performance: Performance;
  ui: UI;
  logging: Logging;
}

export interface FeatureFlags {
  enableServiceWorker: boolean;
  enableDarkMode: boolean;
  enableBetaFeatures: boolean;
  enableAnalytics: boolean;
}

export interface Auth {
  tokenExpiryMinutes: number;
  refreshTokenExpiryDays: number;
  authEndpoint: string;
}

export interface Performance {
  cacheTimeoutMinutes: number;
  maxConcurrentRequests: number;
  enablePrefetching: boolean;
}

export interface UI {
  defaultTheme: string;
  animationsEnabled: boolean;
  defaultLanguage: string;
}

export interface Logging {
  logLevel: string;
  enableRemoteLogging: boolean;
  remoteLogEndpoint: string;
} 