/**
 * Interfaces for the i18n.json file which contains localization strings
 * used throughout the application.
 */

/**
 * Main interface for the i18n.json file
 */
export interface I18nModel {
  /**
   * Version of the translations for tracking changes
   */
  version: string;
  
  /**
   * Last updated timestamp
   */
  lastUpdated: string;
  
  /**
   * Default locale to use when a translation is not available
   */
  defaultLocale: string;
  
  /**
   * Available locales in the application
   */
  availableLocales: LocaleInfo[];
  
  /**
   * Translation data organized by locale
   */
  translations: Record<string, TranslationSet>;
}

/**
 * Information about a locale
 */
export interface LocaleInfo {
  /**
   * Locale code (e.g., 'en-US', 'fr-FR')
   */
  code: string;
  
  /**
   * Display name of the locale
   */
  name: string;
  
  /**
   * Optional flag icon path
   */
  flagIcon?: string;
  
  /**
   * Direction of text (ltr or rtl)
   */
  direction: 'ltr' | 'rtl';
  
  /**
   * Whether the locale is active and available for selection
   */
  isActive: boolean;
}

/**
 * Set of translations for a specific locale
 */
export interface TranslationSet {
  /**
   * Common translations used across the application
   */
  common: Record<string, string>;
  
  /**
   * Translations for validation messages
   */
  validation: Record<string, string>;
  
  /**
   * Translations for error messages
   */
  errors: Record<string, string>;
  
  /**
   * Translations for specific features
   */
  features: Record<string, FeatureTranslations>;
  
  /**
   * Translations for specific pages
   */
  pages: Record<string, Record<string, string>>;
}

/**
 * Translations for a specific feature
 */
export interface FeatureTranslations {
  /**
   * Title of the feature
   */
  title: string;
  
  /**
   * Description of the feature
   */
  description?: string;
  
  /**
   * Other translations specific to the feature
   */
  [key: string]: string | undefined;
} 