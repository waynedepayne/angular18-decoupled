import { Directive, ElementRef, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, inject, Renderer2, effect, PLATFORM_ID, Inject } from '@angular/core';
import { ThemingService } from '../../core/services/theming.service';
import { Subject, takeUntil } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

/**
 * Directive to apply theme-related functionality to components
 * Usage:
 * <div appTheme>Uses current theme</div>
 * <div [appTheme]="'dark'">Forces dark theme</div>
 * <div appTheme="light">Forces light theme</div>
 * <div [appTheme]="themeName" [themeVariant]="'primary'">Applies specific theme with variant</div>
 */
@Directive({
  selector: '[appTheme]',
  standalone: true
})
export class ThemeDirective implements OnInit, OnChanges, OnDestroy {
  private themingService = inject(ThemingService);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private destroy$ = new Subject<void>();
  private isBrowser: boolean;
  private themeEffect: ReturnType<typeof effect> | null = null;

  /**
   * Theme name to apply. If not provided, uses the current theme.
   */
  @Input('appTheme') themeName: string | null = null;

  /**
   * Theme variant to apply (e.g., 'primary', 'secondary', etc.)
   */
  @Input() themeVariant: string | null = null;

  /**
   * Whether to apply the theme as a container (creates a themed section)
   */
  @Input() themeContainer: boolean = false;

  /**
   * Whether to invert the current theme (light to dark or dark to light)
   */
  @Input() themeInvert: boolean = false;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Create the effect in the constructor (injection context)
    if (this.isBrowser) {
      this.themeEffect = effect(() => {
        // Reading the signal inside the effect will make it re-run when the signal changes
        const _ = this.themingService.activeTheme();
        if (this.el) { // Make sure element is available
          this.applyTheme();
        }
      });
    }
  }

  ngOnInit(): void {
    this.applyTheme();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['themeName'] || changes['themeVariant'] || changes['themeContainer'] || changes['themeInvert']) {
      this.applyTheme();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up the effect if it exists
    if (this.themeEffect) {
      this.themeEffect.destroy();
      this.themeEffect = null;
    }
  }

  /**
   * Applies the theme to the element
   */
  private applyTheme(): void {
    // Skip if not in browser environment
    if (!this.isBrowser) {
      return;
    }
    
    const element = this.el.nativeElement;
    
    // Clear existing theme classes
    this.clearThemeClasses(element);
    
    // Determine which theme to use
    let effectiveThemeName = this.themeName;
    let isDark = this.themingService.isDarkTheme();
    
    // If no theme specified, use current theme
    if (!effectiveThemeName) {
      // If inverting, switch between light and dark
      if (this.themeInvert) {
        isDark = !isDark;
      }
      
      // Add appropriate class based on dark/light status
      this.renderer.addClass(element, isDark ? 'theme-dark' : 'theme-light');
    } else {
      // Add class for specific theme
      this.renderer.addClass(element, `theme-${effectiveThemeName}`);
    }
    
    // Add variant class if specified
    if (this.themeVariant) {
      this.renderer.addClass(element, `theme-variant-${this.themeVariant}`);
    }
    
    // Add container class if this is a theme container
    if (this.themeContainer) {
      this.renderer.addClass(element, 'theme-container');
      
      // Apply container-specific styles
      if (isDark) {
        this.renderer.setStyle(element, 'background-color', 'var(--color-background, #121212)');
        this.renderer.setStyle(element, 'color', 'var(--color-text-primary, #ffffff)');
      } else {
        this.renderer.setStyle(element, 'background-color', 'var(--color-background, #ffffff)');
        this.renderer.setStyle(element, 'color', 'var(--color-text-primary, #212121)');
      }
    }
  }

  /**
   * Clears theme-related classes from the element
   */
  private clearThemeClasses(element: HTMLElement): void {
    const classList = element.classList;
    const classesToRemove: string[] = [];
    
    // Find all theme-related classes
    for (let i = 0; i < classList.length; i++) {
      const className = classList[i];
      if (
        className.startsWith('theme-') || 
        className.startsWith('theme-variant-')
      ) {
        classesToRemove.push(className);
      }
    }
    
    // Remove the classes
    classesToRemove.forEach(className => {
      this.renderer.removeClass(element, className);
    });
    
    // Clear container-specific styles if they were applied
    if (this.themeContainer) {
      this.renderer.removeStyle(element, 'background-color');
      this.renderer.removeStyle(element, 'color');
    }
  }
} 