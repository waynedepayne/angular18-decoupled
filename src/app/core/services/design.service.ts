/**
 * @fileoverview DesignService is responsible for loading and providing access to the application's
 * UI design configuration from design.json, including layouts, themes, and component definitions.
 * 
 * JSON Source: assets/design.json
 * 
 * Data Structure:
 * - layouts: Predefined page layouts (dashboard, landing, etc.)
 * - themes: Theme definitions (light, dark, custom, etc.)
 *   - colors: Color palette for the theme
 *   - typography: Font families, sizes, weights
 *   - spacing: Margin and padding values
 *   - borderRadius: Border radius values
 * - components: Reusable UI component definitions
 * 
 * Transformation Logic:
 * - JSON is loaded at application startup via APP_INITIALIZER
 * - Data is exposed through Angular Signals for reactive access
 * - Theme is applied to the document by setting CSS variables
 * - Default theme is determined from ConfigService
 * - Provides methods for theme switching and layout retrieval
 */
import { Injectable, signal, computed, Signal, inject, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { DesignModel, Layout, Theme, ComponentDefinition } from '../models/design.model';
import { ConfigService } from './config.service';
import { PLATFORM_ID, Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DesignService {
  private configService = inject(ConfigService);
  private isBrowser: boolean;
  
  // Signal to hold the design data
  private designSignal = signal<DesignModel | null>(null);
  
  // Signal to track the current active theme
  private activeThemeSignal = signal<string>('light');
  
  // Public API for accessing the design
  public readonly design: Signal<DesignModel | null> = this.designSignal.asReadonly();
  
  // Computed signals for commonly accessed design sections
  public readonly layouts = computed(() => this.designSignal()?.layouts || {});
  public readonly themes = computed(() => this.designSignal()?.themes || {});
  public readonly components = computed(() => this.designSignal()?.components || {});
  
  // Active theme related signals
  public readonly activeThemeName = this.activeThemeSignal.asReadonly();
  public readonly activeTheme = computed(() => {
    const themeName = this.activeThemeSignal();
    return this.designSignal()?.themes[themeName] || null;
  });
  
  // Computed signals for theme properties
  public readonly colors = computed(() => this.activeTheme()?.colors);
  public readonly typography = computed(() => this.activeTheme()?.typography);
  public readonly spacing = computed(() => this.activeTheme()?.spacing);
  public readonly borderRadius = computed(() => this.activeTheme()?.borderRadius);
  
  constructor(private http: HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Initialize theme from config if available using effect with allowSignalWrites
    effect(() => {
      const ui = this.configService.ui();
      const design = this.designSignal();
      
      // Only set the theme if both the config and design data are loaded
      if (ui?.defaultTheme && design && design.themes) {
        this.setActiveTheme(ui.defaultTheme);
      }
    }, { allowSignalWrites: true });
  }
  
  /**
   * Loads the design configuration from the JSON file
   * Used by APP_INITIALIZER to load design at startup
   * 
   * @returns Observable<DesignModel> - The loaded design configuration or default values
   */
  loadDesign(): Observable<DesignModel> {
    return this.http.get<DesignModel>('assets/design.json').pipe(
      tap(design => {
        console.log('Design configuration loaded successfully');
        this.designSignal.set(design);
        
        // Initialize theme based on config or default to 'light'
        const defaultTheme = this.configService.ui()?.defaultTheme || 'light';
        this.setActiveTheme(defaultTheme);
      }),
      catchError(error => {
        console.error('Failed to load design configuration', error);
        const defaultDesign = this.getDefaultDesign();
        this.designSignal.set(defaultDesign);
        this.setActiveTheme('light'); // Set default theme on error
        return of(defaultDesign);
      })
    );
  }
  
  /**
   * Sets the active theme and applies it to the document
   * 
   * @param themeName - The name of the theme to activate
   */
  setActiveTheme(themeName: string): void {
    const themes = this.designSignal()?.themes;
    if (themes && themes[themeName]) {
      this.activeThemeSignal.set(themeName);
      this.applyThemeToDocument(themeName);
    } else {
      console.warn(`Theme "${themeName}" not found, using current theme`);
    }
  }
  
  /**
   * Toggles between light and dark themes
   */
  toggleTheme(): void {
    const currentTheme = this.activeThemeSignal();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setActiveTheme(newTheme);
  }
  
  /**
   * Gets a specific layout by name
   */
  getLayout(layoutName: string): Layout | null {
    return this.designSignal()?.layouts[layoutName] || null;
  }
  
  /**
   * Gets a specific component definition by name
   */
  getComponentDefinition(componentName: string): ComponentDefinition | null {
    return this.designSignal()?.components[componentName] || null;
  }
  
  /**
   * Applies the theme to the document by setting CSS variables
   */
  private applyThemeToDocument(themeName: string): void {
    // Skip if not in browser environment
    if (!this.isBrowser) return;
    
    const theme = this.designSignal()?.themes[themeName];
    if (!theme) return;
    
    const root = document.documentElement;
    
    // Apply colors
    root.style.setProperty('--primary-color', theme.colors.primary);
    root.style.setProperty('--secondary-color', theme.colors.secondary);
    root.style.setProperty('--background-color', theme.colors.background);
    root.style.setProperty('--surface-color', theme.colors.surface);
    root.style.setProperty('--error-color', theme.colors.error);
    root.style.setProperty('--warning-color', theme.colors.warning);
    root.style.setProperty('--info-color', theme.colors.info);
    root.style.setProperty('--success-color', theme.colors.success);
    root.style.setProperty('--text-primary-color', theme.colors.text.primary);
    root.style.setProperty('--text-secondary-color', theme.colors.text.secondary);
    root.style.setProperty('--text-disabled-color', theme.colors.text.disabled);
    
    // Apply typography
    root.style.setProperty('--font-family', theme.typography.fontFamily);
    root.style.setProperty('--font-size-small', theme.typography.fontSize.small);
    root.style.setProperty('--font-size-medium', theme.typography.fontSize.medium);
    root.style.setProperty('--font-size-large', theme.typography.fontSize.large);
    root.style.setProperty('--font-size-xlarge', theme.typography.fontSize.xlarge);
    root.style.setProperty('--font-size-xxlarge', theme.typography.fontSize.xxlarge);
    
    // Apply spacing
    root.style.setProperty('--spacing-xs', theme.spacing.xs);
    root.style.setProperty('--spacing-sm', theme.spacing.sm);
    root.style.setProperty('--spacing-md', theme.spacing.md);
    root.style.setProperty('--spacing-lg', theme.spacing.lg);
    root.style.setProperty('--spacing-xl', theme.spacing.xl);
    root.style.setProperty('--spacing-xxl', theme.spacing.xxl);
    
    // Apply border radius
    root.style.setProperty('--border-radius-small', theme.borderRadius.small);
    root.style.setProperty('--border-radius-medium', theme.borderRadius.medium);
    root.style.setProperty('--border-radius-large', theme.borderRadius.large);
    root.style.setProperty('--border-radius-circle', theme.borderRadius.circle);
    
    // Add a data attribute to the body for theme-specific selectors
    document.body.setAttribute('data-theme', themeName);
  }
  
  /**
   * Provides a default design configuration in case the design file cannot be loaded
   */
  private getDefaultDesign(): DesignModel {
    return {
      layouts: {
        default: {
          header: {
            type: 'header',
            height: '64px',
            components: [
              {
                type: 'logo',
                position: 'left',
                text: 'Angular 18 Enterprise App'
              },
              {
                type: 'navigation',
                position: 'center',
                items: [
                  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
                  { label: 'Config', route: '/config-demo', icon: 'settings' }
                ]
              }
            ]
          },
          footer: {
            type: 'footer',
            height: '50px',
            components: [
              {
                type: 'text',
                position: 'center',
                content: '© 2025 Angular 18 Enterprise App'
              }
            ]
          }
        }
      },
      themes: {
        light: {
          colors: {
            primary: '#3f51b5',
            secondary: '#f50057',
            background: '#ffffff',
            surface: '#f5f5f5',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3',
            success: '#4caf50',
            text: {
              primary: 'rgba(0, 0, 0, 0.87)',
              secondary: 'rgba(0, 0, 0, 0.6)',
              disabled: 'rgba(0, 0, 0, 0.38)'
            }
          },
          typography: {
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: {
              small: '0.875rem',
              medium: '1rem',
              large: '1.25rem',
              xlarge: '1.5rem',
              xxlarge: '2rem'
            }
          },
          spacing: {
            xs: '4px',
            sm: '8px',
            md: '16px',
            lg: '24px',
            xl: '32px',
            xxl: '48px'
          },
          borderRadius: {
            small: '4px',
            medium: '8px',
            large: '16px',
            circle: '50%'
          }
        },
        dark: {
          colors: {
            primary: '#7986cb',
            secondary: '#ff4081',
            background: '#121212',
            surface: '#1e1e1e',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3',
            success: '#4caf50',
            text: {
              primary: 'rgba(255, 255, 255, 0.87)',
              secondary: 'rgba(255, 255, 255, 0.6)',
              disabled: 'rgba(255, 255, 255, 0.38)'
            }
          },
          typography: {
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: {
              small: '0.875rem',
              medium: '1rem',
              large: '1.25rem',
              xlarge: '1.5rem',
              xxlarge: '2rem'
            }
          },
          spacing: {
            xs: '4px',
            sm: '8px',
            md: '16px',
            lg: '24px',
            xl: '32px',
            xxl: '48px'
          },
          borderRadius: {
            small: '4px',
            medium: '8px',
            large: '16px',
            circle: '50%'
          }
        }
      },
      components: {
        button: {
          variants: {
            primary: {
              borderRadius: '4px',
              padding: '8px 16px',
              fontSize: '1rem',
              fontWeight: '500'
            },
            secondary: {
              borderRadius: '4px',
              padding: '8px 16px',
              fontSize: '1rem',
              fontWeight: '400'
            }
          }
        },
        card: {
          variants: {
            default: {
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }
          }
        }
      }
    };
  }
} 