import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemingService } from '../../../core/services/theming.service';

/**
 * Component that provides a UI for toggling between themes
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="theme-toggle-container" [class.vertical]="vertical">
      <div class="theme-toggle-header" *ngIf="showLabel">
        <label>{{ label }}</label>
      </div>
      
      <ng-container *ngIf="toggleType === 'switch'">
        <div class="theme-toggle-switch">
          <input 
            type="checkbox" 
            id="theme-switch" 
            [checked]="themingService.isDarkTheme()" 
            (change)="themingService.toggleDarkMode()"
          />
          <label for="theme-switch" class="switch-label">
            <span class="switch-icon light">☀️</span>
            <span class="switch-icon dark">🌙</span>
          </label>
        </div>
      </ng-container>
      
      <ng-container *ngIf="toggleType === 'dropdown'">
        <div class="theme-dropdown">
          <select 
            [ngModel]="themingService.activeThemeName()" 
            (ngModelChange)="themingService.setTheme($event)"
          >
            <option 
              *ngFor="let theme of themingService.availableThemes()" 
              [value]="theme.id"
            >
              {{ theme.name }}
            </option>
          </select>
        </div>
      </ng-container>
      
      <ng-container *ngIf="toggleType === 'buttons'">
        <div class="theme-buttons">
          <button 
            *ngFor="let theme of themingService.availableThemes()" 
            [class.active]="themingService.activeThemeName() === theme.id"
            (click)="themingService.setTheme(theme.id)"
            [attr.aria-label]="'Switch to ' + theme.name + ' theme'"
          >
            <span class="theme-icon" [class.dark]="theme.isDark">
              {{ theme.isDark ? '🌙' : '☀️' }}
            </span>
            <span class="theme-name" *ngIf="showThemeNames">{{ theme.name }}</span>
          </button>
        </div>
      </ng-container>
    </div>
    
    <style>
      .theme-toggle-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
      }
      
      .theme-toggle-container.vertical {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .theme-toggle-header {
        font-weight: var(--font-weight-medium, 500);
        margin-bottom: 4px;
      }
      
      /* Switch style */
      .theme-toggle-switch {
        position: relative;
        display: inline-block;
      }
      
      .theme-toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .switch-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        width: 50px;
        height: 24px;
        background-color: var(--color-surface, #f5f5f5);
        border-radius: 24px;
        position: relative;
        transition: background-color 0.3s;
        padding: 0 4px;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      .switch-label::after {
        content: "";
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: var(--color-primary, #3f51b5);
        top: 2px;
        left: 2px;
        transition: transform 0.3s, background-color 0.3s;
      }
      
      .theme-toggle-switch input:checked + .switch-label {
        background-color: var(--color-surface, #1e1e1e);
      }
      
      .theme-toggle-switch input:checked + .switch-label::after {
        transform: translateX(26px);
      }
      
      .switch-icon {
        font-size: 12px;
        z-index: 1;
      }
      
      /* Dropdown style */
      .theme-dropdown select {
        padding: 8px 12px;
        border-radius: var(--border-radius-medium, 4px);
        border: 1px solid var(--color-divider, #e0e0e0);
        background-color: var(--color-surface, #f5f5f5);
        color: var(--color-text-primary, #212121);
        font-size: var(--font-size-sm, 0.875rem);
        cursor: pointer;
      }
      
      /* Buttons style */
      .theme-buttons {
        display: flex;
        gap: 8px;
      }
      
      .theme-buttons button {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border-radius: var(--border-radius-medium, 4px);
        border: 1px solid var(--color-divider, #e0e0e0);
        background-color: var(--color-surface, #f5f5f5);
        color: var(--color-text-primary, #212121);
        cursor: pointer;
        transition: background-color 0.2s, box-shadow 0.2s;
      }
      
      .theme-buttons button.active {
        background-color: var(--color-primary, #3f51b5);
        color: var(--color-primary-contrast, #ffffff);
        box-shadow: var(--shadow-1, 0 1px 3px rgba(0, 0, 0, 0.12));
      }
      
      .theme-buttons button:hover:not(.active) {
        background-color: var(--color-divider, #e0e0e0);
      }
      
      .theme-icon {
        font-size: 14px;
      }
    </style>
  `
})
export class ThemeToggleComponent implements OnInit {
  themingService = inject(ThemingService);

  /**
   * Type of toggle to display
   * - 'switch': Simple dark/light toggle switch
   * - 'dropdown': Dropdown with all available themes
   * - 'buttons': Button group with all available themes
   */
  @Input() toggleType: 'switch' | 'dropdown' | 'buttons' = 'switch';

  /**
   * Label to display above the toggle
   */
  @Input() label: string = 'Theme';

  /**
   * Whether to show the label
   */
  @Input() showLabel: boolean = true;

  /**
   * Whether to show theme names in button mode
   */
  @Input() showThemeNames: boolean = true;

  /**
   * Whether to display the toggle vertically
   */
  @Input() vertical: boolean = false;

  ngOnInit(): void {
    // If there are only two themes (light/dark), default to switch
    if (this.themingService.availableThemes().length <= 2) {
      this.toggleType = 'switch';
    }
  }
} 