/**
 * @fileoverview I18nService is responsible for loading and providing access to localization
 * strings from i18n.json.
 * 
 * JSON Source: assets/i18n.json
 * 
 * Data Structure:
 * - defaultLocale: Default locale to use when a translation is not available
 * - availableLocales: List of available locales with metadata
 * - translations: Translation strings organized by locale and category
 * 
 * Transformation Logic:
 * - JSON is loaded at application startup via APP_INITIALIZER
 * - Data is exposed through Angular Signals for reactive access
 * - Current locale can be changed at runtime
 * - Translation keys are accessed through a simple API
 * - Fallback to default locale when a translation is missing
 */
import { Injectable, signal, computed, Signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { I18nModel, LocaleInfo, TranslationSet } from '../models/i18n.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  // Signal to hold the i18n data
  private i18nSignal = signal<I18nModel | null>(null);
  
  // Signal for the current locale
  private currentLocaleSignal = signal<string>('');
  
  // Public API for accessing the i18n data
  public readonly i18n: Signal<I18nModel | null> = this.i18nSignal.asReadonly();
  
  // Public API for the current locale
  public readonly currentLocale: Signal<string> = this.currentLocaleSignal.asReadonly();
  
  // Computed signals for commonly accessed i18n sections
  public readonly availableLocales = computed(() => this.i18nSignal()?.availableLocales || []);
  public readonly defaultLocale = computed(() => this.i18nSignal()?.defaultLocale || 'en-US');
  
  // Computed signal for the current translation set
  public readonly currentTranslations = computed(() => {
    const i18n = this.i18nSignal();
    if (!i18n) return null;
    
    const locale = this.currentLocaleSignal();
    // If translations for the current locale exist, use them
    if (i18n.translations[locale]) {
      return i18n.translations[locale];
    }
    
    // Otherwise, fall back to the default locale
    return i18n.translations[i18n.defaultLocale] || null;
  });
  
  private platformId = inject(PLATFORM_ID);
  
  constructor(private http: HttpClient) {
    // Initialize the current locale from localStorage or use the browser's language
    // Only access localStorage in the browser environment
    if (isPlatformBrowser(this.platformId)) {
      const savedLocale = localStorage.getItem('appLocale');
      if (savedLocale) {
        this.currentLocaleSignal.set(savedLocale);
      } else {
        // Use browser language or fall back to 'en-US'
        const browserLang = navigator.language;
        this.currentLocaleSignal.set(browserLang || 'en-US');
      }
      
      // Set up an effect to save the locale to localStorage when it changes
      // This effect only runs in the browser
      effect(() => {
        const locale = this.currentLocaleSignal();
        if (locale) {
          localStorage.setItem('appLocale', locale);
        }
      });
    } else {
      // In SSR, just set a default locale
      this.currentLocaleSignal.set('en-US');
    }
  }
  
  /**
   * Loads the i18n data from the JSON file
   * Used by APP_INITIALIZER to load i18n at startup
   * 
   * @returns Observable<I18nModel> - The loaded i18n data or default values
   */
  loadI18n(): Observable<I18nModel> {
    return this.http.get<I18nModel>('assets/i18n.json').pipe(
      tap(i18n => {
        console.log('I18n data loaded successfully');
        this.i18nSignal.set(i18n);
        
        // Ensure the current locale is valid
        this.validateAndSetLocale();
      }),
      catchError(error => {
        console.error('Failed to load i18n data', error);
        // Return default i18n data in case of error
        const defaultI18n = this.getDefaultI18n();
        this.i18nSignal.set(defaultI18n);
        return of(defaultI18n);
      })
    );
  }
  
  /**
   * Validates the current locale and sets it to a valid one if needed
   */
  private validateAndSetLocale(): void {
    const i18n = this.i18nSignal();
    if (!i18n) return;
    
    const currentLocale = this.currentLocaleSignal();
    
    // Check if the current locale is available and active
    const isValidLocale = i18n.availableLocales.some(
      locale => locale.code === currentLocale && locale.isActive
    );
    
    // If not valid, set to default locale
    if (!isValidLocale) {
      this.currentLocaleSignal.set(i18n.defaultLocale);
    }
  }
  
  /**
   * Changes the current locale
   * 
   * @param locale - The locale code to switch to
   * @returns boolean - Whether the locale was changed successfully
   */
  changeLocale(locale: string): boolean {
    const i18n = this.i18nSignal();
    if (!i18n) return false;
    
    // Check if the locale is available and active
    const isValidLocale = i18n.availableLocales.some(
      l => l.code === locale && l.isActive
    );
    
    if (isValidLocale) {
      this.currentLocaleSignal.set(locale);
      return true;
    }
    
    return false;
  }
  
  /**
   * Gets a translation by key
   * 
   * @param key - The translation key in dot notation (e.g., 'common.welcome')
   * @param params - Optional parameters to replace placeholders in the translation
   * @returns string - The translated string or the key if not found
   */
  translate(key: string, params?: Record<string, string>): string {
    const translations = this.currentTranslations();
    if (!translations) return key;
    
    // Split the key by dots to navigate the translation object
    const parts = key.split('.');
    let result: any = translations;
    
    // Navigate through the parts to find the translation
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        // If any part is not found, return the key
        return key;
      }
    }
    
    // If the result is not a string, return the key
    if (typeof result !== 'string') {
      return key;
    }
    
    // Replace parameters in the translation if provided
    if (params) {
      return this.replaceParams(result, params);
    }
    
    return result;
  }
  
  /**
   * Replaces parameters in a translation string
   * 
   * @param text - The translation string with placeholders
   * @param params - The parameters to replace
   * @returns string - The translation with replaced parameters
   */
  private replaceParams(text: string, params: Record<string, string>): string {
    return text.replace(/{{([^{}]*)}}/g, (_, paramName) => {
      const trimmedName = paramName.trim();
      return params[trimmedName] !== undefined ? params[trimmedName] : `{{${trimmedName}}}`;
    });
  }
  
  /**
   * Gets the text direction for the current locale
   * 
   * @returns 'ltr' | 'rtl' - The text direction
   */
  getTextDirection(): 'ltr' | 'rtl' {
    const i18n = this.i18nSignal();
    if (!i18n) return 'ltr';
    
    const currentLocale = this.currentLocaleSignal();
    const localeInfo = i18n.availableLocales.find(l => l.code === currentLocale);
    
    return localeInfo?.direction || 'ltr';
  }
  
  /**
   * Gets information about the current locale
   * 
   * @returns LocaleInfo | null - Information about the current locale
   */
  getCurrentLocaleInfo(): LocaleInfo | null {
    const i18n = this.i18nSignal();
    if (!i18n) return null;
    
    const currentLocale = this.currentLocaleSignal();
    return i18n.availableLocales.find(l => l.code === currentLocale) || null;
  }
  
  /**
   * Provides default i18n data in case the i18n file cannot be loaded
   * This ensures the application can still function with basic translations
   * 
   * @returns I18nModel - Default i18n values
   */
  private getDefaultI18n(): I18nModel {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      defaultLocale: 'en-US',
      availableLocales: [
        {
          code: 'en-US',
          name: 'English (US)',
          direction: 'ltr',
          isActive: true
        }
      ],
      translations: {
        'en-US': {
          common: {
            welcome: 'Welcome',
            login: 'Login',
            logout: 'Logout',
            save: 'Save',
            cancel: 'Cancel',
            confirm: 'Confirm',
            loading: 'Loading...',
            search: 'Search',
            noResults: 'No results found',
            back: 'Back',
            next: 'Next',
            previous: 'Previous'
          },
          validation: {
            required: 'This field is required',
            email: 'Please enter a valid email address',
            minLength: 'This field must be at least {{min}} characters long',
            maxLength: 'This field cannot be longer than {{max}} characters',
            pattern: 'This field contains invalid characters'
          },
          errors: {
            general: 'An error occurred',
            notFound: 'The requested resource was not found',
            unauthorized: 'You are not authorized to access this resource',
            serverError: 'A server error occurred'
          },
          features: {
            dashboard: {
              title: 'Dashboard',
              description: 'Overview of your account'
            },
            settings: {
              title: 'Settings',
              description: 'Manage your account settings'
            }
          },
          pages: {
            home: {
              title: 'Home',
              subtitle: 'Welcome to our application'
            },
            about: {
              title: 'About',
              subtitle: 'Learn more about us'
            }
          }
        }
      }
    };
  }
} 