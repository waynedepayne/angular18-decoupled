import { Injectable, inject, signal, computed, effect, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { ThemingModel, Theme } from '../models/theming.model';

/**
 * Service responsible for loading and managing themes from theming.json
 */
@Injectable({
  providedIn: 'root'
})
export class ThemingService {
  private themingSignal = signal<ThemingModel | null>(null);
  private activeThemeNameSignal = signal<string>('');
  private themeLoadedSignal = signal<boolean>(false);
  private cssLinkElements: HTMLLinkElement[] = [];

  // Public signals
  public readonly theming = computed(() => this.themingSignal());
  public readonly activeThemeName = this.activeThemeNameSignal.asReadonly();
  public readonly themeLoaded = this.themeLoadedSignal.asReadonly();
  
  public readonly activeTheme = computed(() => {
    const theming = this.themingSignal();
    const themeName = this.activeThemeNameSignal();
    
    if (!theming || !themeName || !theming.themes[themeName]) {
      return null;
    }
    
    return theming.themes[themeName];
  });
  
  public readonly isDarkTheme = computed(() => {
    const theme = this.activeTheme();
    return theme ? theme.isDark : false;
  });
  
  public readonly availableThemes = computed(() => {
    const theming = this.themingSignal();
    if (!theming) return [];
    
    return Object.keys(theming.themes).map(key => ({
      id: key,
      name: theming.themes[key].name,
      isDark: theming.themes[key].isDark
    }));
  });

  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {
    // Apply theme changes when the active theme changes
    effect(() => {
      const theme = this.activeTheme();
      if (theme && isPlatformBrowser(this.platformId)) {
        this.applyTheme(theme);
      }
    });
  }

  /**
   * Loads the theming configuration from theming.json
   */
  loadTheming(): Observable<ThemingModel> {
    return this.http.get<ThemingModel>('assets/theming.json').pipe(
      tap(theming => {
        this.themingSignal.set(theming);
        
        // Set initial theme based on user preference or default
        if (isPlatformBrowser(this.platformId) && theming.respectUserPreference) {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const themeToUse = prefersDark ? this.findDarkTheme(theming) : theming.defaultTheme;
          this.activeThemeNameSignal.set(themeToUse);
        } else {
          this.activeThemeNameSignal.set(theming.defaultTheme);
        }
        
        this.themeLoadedSignal.set(true);
      }),
      catchError(error => {
        console.error('Error loading theming.json:', error);
        const defaultTheming = this.getDefaultTheming();
        this.themingSignal.set(defaultTheming);
        this.activeThemeNameSignal.set(defaultTheming.defaultTheme);
        this.themeLoadedSignal.set(true);
        return of(defaultTheming);
      })
    );
  }

  /**
   * Sets the active theme by name
   */
  setTheme(themeName: string): void {
    const theming = this.themingSignal();
    if (!theming || !theming.themes[themeName]) {
      console.error(`Theme "${themeName}" not found`);
      return;
    }
    
    this.activeThemeNameSignal.set(themeName);
    
    // Save preference to localStorage if in browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('app-theme', themeName);
    }
  }

  /**
   * Toggles between light and dark themes
   */
  toggleDarkMode(): void {
    const theming = this.themingSignal();
    const currentTheme = this.activeTheme();
    
    if (!theming || !currentTheme) return;
    
    if (currentTheme.isDark) {
      // Find a light theme to switch to
      const lightTheme = Object.keys(theming.themes).find(key => !theming.themes[key].isDark);
      if (lightTheme) {
        this.setTheme(lightTheme);
      }
    } else {
      // Find a dark theme to switch to
      const darkTheme = Object.keys(theming.themes).find(key => theming.themes[key].isDark);
      if (darkTheme) {
        this.setTheme(darkTheme);
      }
    }
  }

  /**
   * Applies the theme to the document
   */
  private applyTheme(theme: Theme): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const theming = this.themingSignal();
    if (!theming) return;
    
    // Get the document root element
    const root = document.documentElement;
    
    // Apply global variables
    if (theming.globalVariables) {
      Object.entries(theming.globalVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
    
    // Apply font settings
    if (theming.fonts) {
      root.style.setProperty('--font-primary', theming.fonts.primaryFont);
      if (theming.fonts.secondaryFont) {
        root.style.setProperty('--font-secondary', theming.fonts.secondaryFont);
      }
      if (theming.fonts.monoFont) {
        root.style.setProperty('--font-mono', theming.fonts.monoFont);
      }
      root.style.setProperty('--font-size-base', theming.fonts.baseFontSize);
      
      // Apply font sizes
      Object.entries(theming.fonts.fontSizes).forEach(([key, value]) => {
        root.style.setProperty(`--font-size-${key}`, value);
      });
      
      // Apply font weights
      Object.entries(theming.fonts.fontWeights).forEach(([key, value]) => {
        root.style.setProperty(`--font-weight-${key}`, value.toString());
      });
      
      // Apply line heights
      Object.entries(theming.fonts.lineHeights).forEach(([key, value]) => {
        root.style.setProperty(`--line-height-${key}`, value.toString());
      });
      
      // Apply letter spacings
      if (theming.fonts.letterSpacings) {
        Object.entries(theming.fonts.letterSpacings).forEach(([key, value]) => {
          root.style.setProperty(`--letter-spacing-${key}`, value);
        });
      }
    }
    
    // Apply theme variables
    // First, check if the theme extends another theme
    if (theme.extends && theming.themes[theme.extends]) {
      const parentTheme = theming.themes[theme.extends];
      Object.entries(parentTheme.variables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
    
    // Then apply the theme's own variables (overriding parent theme if needed)
    Object.entries(theme.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Set dark mode class on body
    if (theme.isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    
    // Load external CSS file if specified
    this.loadExternalCssFile(theme);
  }

  /**
   * Loads an external CSS file for a theme if specified
   */
  private loadExternalCssFile(theme: Theme): void {
    // Remove any previously loaded theme CSS files
    this.cssLinkElements.forEach(link => {
      if (link && link.parentNode) {
        link.parentNode.removeChild(link);
      }
    });
    this.cssLinkElements = [];
    
    // If the theme has a CSS file, load it
    if (theme.cssFile) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = theme.cssFile;
      document.head.appendChild(link);
      this.cssLinkElements.push(link);
    }
  }

  /**
   * Finds a dark theme in the theming configuration
   */
  private findDarkTheme(theming: ThemingModel): string {
    // First check if the default theme is dark
    if (theming.themes[theming.defaultTheme]?.isDark) {
      return theming.defaultTheme;
    }
    
    // Otherwise find the first dark theme
    const darkTheme = Object.keys(theming.themes).find(key => theming.themes[key].isDark);
    return darkTheme || theming.defaultTheme;
  }

  /**
   * Returns default theming configuration in case loading fails
   */
  private getDefaultTheming(): ThemingModel {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      defaultTheme: 'light',
      respectUserPreference: true,
      themes: {
        light: {
          name: 'Light',
          description: 'Default light theme',
          isDark: false,
          variables: {
            '--color-primary': '#3f51b5',
            '--color-primary-contrast': '#ffffff',
            '--color-background': '#ffffff',
            '--color-surface': '#f5f5f5',
            '--color-text-primary': '#212121',
            '--color-text-secondary': '#757575'
          }
        },
        dark: {
          name: 'Dark',
          description: 'Default dark theme',
          isDark: true,
          variables: {
            '--color-primary': '#7986cb',
            '--color-primary-contrast': '#ffffff',
            '--color-background': '#121212',
            '--color-surface': '#1e1e1e',
            '--color-text-primary': '#ffffff',
            '--color-text-secondary': '#b0b0b0'
          }
        }
      },
      fonts: {
        primaryFont: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        baseFontSize: '16px',
        fontSizes: {
          md: '1rem',
          lg: '1.25rem'
        },
        fontWeights: {
          regular: 400,
          bold: 700
        },
        lineHeights: {
          normal: 1.5
        }
      },
      breakpoints: {
        xs: '0px',
        sm: '600px',
        md: '960px',
        lg: '1280px',
        xl: '1920px'
      },
      zIndexLayers: {
        base: 0,
        modal: 1000
      },
      animationDurations: {
        standard: '300ms'
      }
    };
  }
} 