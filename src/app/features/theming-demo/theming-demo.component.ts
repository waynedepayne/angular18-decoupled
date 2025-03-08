import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemingService } from '../../core/services/theming.service';
import { ThemeDirective } from '../../shared/directives/theme.directive';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

/**
 * Demo component for showcasing theming functionality
 */
@Component({
  selector: 'app-theming-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeDirective, ThemeToggleComponent],
  template: `
    <div class="theming-demo">
      <header class="demo-header">
        <h1>Theming Demo</h1>
        <p>This demo showcases the runtime theming capabilities using theming.json</p>
      </header>

      <section class="theme-controls">
        <h2>Theme Controls</h2>
        
        <div class="control-group">
          <h3>Theme Switcher</h3>
          <div class="toggle-options">
            <app-theme-toggle 
              [toggleType]="'switch'" 
              label="Dark Mode Toggle"
            ></app-theme-toggle>
            
            <app-theme-toggle 
              [toggleType]="'dropdown'" 
              label="Theme Selector"
            ></app-theme-toggle>
            
            <app-theme-toggle 
              [toggleType]="'buttons'" 
              label="Theme Buttons"
            ></app-theme-toggle>
          </div>
        </div>
        
        <div class="theme-info">
          <h3>Current Theme</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">{{ themingService.activeTheme()?.name || 'None' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Dark Mode:</span>
              <span class="info-value">{{ themingService.isDarkTheme() ? 'Yes' : 'No' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Available Themes:</span>
              <span class="info-value">{{ themingService.availableThemes().length }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="theme-showcase">
        <h2>Theme Showcase</h2>
        
        <div class="showcase-grid">
          <!-- Default theme (current) -->
          <div class="showcase-card">
            <h3>Current Theme</h3>
            <div class="card-content">
              <p>This card uses the current application theme.</p>
              <button class="btn btn-primary">Primary Button</button>
              <button class="btn btn-secondary">Secondary Button</button>
            </div>
          </div>
          
          <!-- Inverted theme -->
          <div class="showcase-card" appTheme [themeInvert]="true">
            <h3>Inverted Theme</h3>
            <div class="card-content">
              <p>This card uses the inverted theme (light ↔ dark).</p>
              <button class="btn btn-primary">Primary Button</button>
              <button class="btn btn-secondary">Secondary Button</button>
            </div>
          </div>
          
          <!-- Theme containers for each available theme -->
          <div 
            *ngFor="let theme of themingService.availableThemes()" 
            class="showcase-card" 
            [appTheme]="theme.id" 
            [themeContainer]="true"
          >
            <h3>{{ theme.name }} Theme</h3>
            <div class="card-content">
              <p>This card uses the {{ theme.name }} theme.</p>
              <button class="btn btn-primary">Primary Button</button>
              <button class="btn btn-secondary">Secondary Button</button>
            </div>
          </div>
        </div>
      </section>

      <section class="theme-variables">
        <h2>Theme Variables</h2>
        
        <div class="variables-grid">
          <div class="variable-group">
            <h3>Colors</h3>
            <div class="color-swatches">
              <div 
                *ngFor="let color of colorVariables" 
                class="color-swatch"
                [style.background-color]="'var(' + color + ')'"
              >
                <span class="color-name">{{ color }}</span>
              </div>
            </div>
          </div>
          
          <div class="variable-group">
            <h3>Typography</h3>
            <div class="typography-samples">
              <div 
                *ngFor="let size of fontSizes" 
                class="font-sample"
                [style.font-size]="'var(--font-size-' + size + ')'"
              >
                {{ size }}: The quick brown fox jumps over the lazy dog
              </div>
            </div>
          </div>
          
          <div class="variable-group">
            <h3>Spacing</h3>
            <div class="spacing-samples">
              <div 
                *ngFor="let space of spacingVariables" 
                class="spacing-sample"
              >
                <div 
                  class="spacing-box"
                  [style.width]="'var(' + space + ')'"
                  [style.height]="'var(' + space + ')'"
                ></div>
                <span class="spacing-name">{{ space }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    
    <style>
      .theming-demo {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .demo-header {
        margin-bottom: 32px;
      }
      
      .demo-header h1 {
        font-size: var(--font-size-h1, 2.5rem);
        margin-bottom: 8px;
        color: var(--color-primary, #3f51b5);
      }
      
      section {
        margin-bottom: 40px;
        padding: 24px;
        border-radius: var(--border-radius-large, 8px);
        background-color: var(--color-surface, #f5f5f5);
        box-shadow: var(--shadow-1, 0 1px 3px rgba(0, 0, 0, 0.12));
      }
      
      h2 {
        font-size: var(--font-size-h2, 2rem);
        margin-bottom: 20px;
        color: var(--color-primary, #3f51b5);
      }
      
      h3 {
        font-size: var(--font-size-h3, 1.75rem);
        margin-bottom: 16px;
        color: var(--color-text-primary, #212121);
      }
      
      .control-group {
        margin-bottom: 24px;
      }
      
      .toggle-options {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
      }
      
      .theme-info {
        background-color: var(--color-background, #ffffff);
        padding: 16px;
        border-radius: var(--border-radius-medium, 4px);
      }
      
      .info-grid {
        display: grid;
        gap: 8px;
      }
      
      .info-row {
        display: flex;
      }
      
      .info-label {
        font-weight: var(--font-weight-medium, 500);
        min-width: 150px;
      }
      
      .showcase-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
      }
      
      .showcase-card {
        padding: 16px;
        border-radius: var(--border-radius-medium, 4px);
        background-color: var(--color-background, #ffffff);
        box-shadow: var(--shadow-1, 0 1px 3px rgba(0, 0, 0, 0.12));
      }
      
      .card-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .btn {
        padding: 8px 16px;
        border-radius: var(--border-radius-medium, 4px);
        border: none;
        font-weight: var(--font-weight-medium, 500);
        cursor: pointer;
      }
      
      .btn-primary {
        background-color: var(--color-primary, #3f51b5);
        color: var(--color-primary-contrast, #ffffff);
      }
      
      .btn-secondary {
        background-color: var(--color-secondary, #f50057);
        color: var(--color-secondary-contrast, #ffffff);
      }
      
      .variables-grid {
        display: grid;
        gap: 32px;
      }
      
      .color-swatches {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 16px;
      }
      
      .color-swatch {
        height: 80px;
        border-radius: var(--border-radius-medium, 4px);
        display: flex;
        align-items: flex-end;
        padding: 8px;
        box-shadow: var(--shadow-1, 0 1px 3px rgba(0, 0, 0, 0.12));
      }
      
      .color-name {
        font-size: var(--font-size-xs, 0.75rem);
        background-color: rgba(255, 255, 255, 0.8);
        padding: 2px 6px;
        border-radius: var(--border-radius-small, 2px);
        color: #000;
      }
      
      .typography-samples {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .spacing-samples {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        align-items: flex-end;
      }
      
      .spacing-sample {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      
      .spacing-box {
        background-color: var(--color-primary, #3f51b5);
        border-radius: var(--border-radius-small, 2px);
      }
      
      .spacing-name {
        font-size: var(--font-size-xs, 0.75rem);
      }
    </style>
  `
})
export class ThemingDemoComponent implements OnInit {
  themingService = inject(ThemingService);
  
  // Sample variables to display
  colorVariables = [
    '--color-primary',
    '--color-primary-light',
    '--color-primary-dark',
    '--color-secondary',
    '--color-background',
    '--color-surface',
    '--color-error',
    '--color-success',
    '--color-warning',
    '--color-info',
    '--color-text-primary',
    '--color-text-secondary'
  ];
  
  fontSizes = [
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
    'xxl',
    'h1',
    'h2',
    'h3'
  ];
  
  spacingVariables = [
    '--spacing-xs',
    '--spacing-sm',
    '--spacing-md',
    '--spacing-lg',
    '--spacing-xl',
    '--spacing-xxl'
  ];
  
  ngOnInit(): void {
    // Component initialization logic
  }
} 