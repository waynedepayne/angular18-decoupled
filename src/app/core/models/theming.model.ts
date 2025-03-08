/**
 * Interfaces for the theming.json file which contains theme settings
 * used throughout the application.
 */

/**
 * Main interface for the theming.json file
 */
export interface ThemingModel {
  /**
   * Version of the theming for tracking changes
   */
  version: string;
  
  /**
   * Last updated timestamp
   */
  lastUpdated: string;
  
  /**
   * Default theme to use
   */
  defaultTheme: string;
  
  /**
   * Whether to respect the user's preferred color scheme
   */
  respectUserPreference: boolean;
  
  /**
   * Available themes in the application
   */
  themes: Record<string, Theme>;
  
  /**
   * Global CSS variables that apply to all themes
   */
  globalVariables?: Record<string, string>;
  
  /**
   * Font settings
   */
  fonts: FontSettings;
  
  /**
   * Breakpoints for responsive design
   */
  breakpoints: Record<string, string>;
  
  /**
   * Z-index layers
   */
  zIndexLayers: Record<string, number>;
  
  /**
   * Animation durations
   */
  animationDurations: Record<string, string>;
}

/**
 * Theme definition
 */
export interface Theme {
  /**
   * Name of the theme
   */
  name: string;
  
  /**
   * Description of the theme
   */
  description?: string;
  
  /**
   * Whether the theme is dark
   */
  isDark: boolean;
  
  /**
   * CSS variables for the theme
   */
  variables: Record<string, string>;
  
  /**
   * Optional external CSS file to load
   */
  cssFile?: string;
  
  /**
   * Optional parent theme to extend
   */
  extends?: string;
}

/**
 * Font settings
 */
export interface FontSettings {
  /**
   * Primary font family
   */
  primaryFont: string;
  
  /**
   * Secondary font family
   */
  secondaryFont?: string;
  
  /**
   * Monospace font family
   */
  monoFont?: string;
  
  /**
   * Base font size
   */
  baseFontSize: string;
  
  /**
   * Font sizes for different elements
   */
  fontSizes: Record<string, string>;
  
  /**
   * Font weights
   */
  fontWeights: Record<string, number>;
  
  /**
   * Line heights
   */
  lineHeights: Record<string, string | number>;
  
  /**
   * Letter spacings
   */
  letterSpacings?: Record<string, string>;
} 