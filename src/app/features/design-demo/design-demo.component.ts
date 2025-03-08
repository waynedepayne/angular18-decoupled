import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DesignService } from '../../core/services/design.service';
import { DynamicLayoutComponent } from '../../shared/components/dynamic-layout/dynamic-layout.component';
import { DynamicHeaderComponent } from '../../shared/components/dynamic-layout/components/dynamic-header.component';
import { DynamicSidebarComponent } from '../../shared/components/dynamic-layout/components/dynamic-sidebar.component';
import { DynamicFooterComponent } from '../../shared/components/dynamic-layout/components/dynamic-footer.component';
import { DynamicCardComponent } from '../../shared/components/dynamic-layout/components/dynamic-card.component';
import { DynamicGridComponent } from '../../shared/components/dynamic-layout/components/dynamic-grid.component';
import { DynamicFlexComponent } from '../../shared/components/dynamic-layout/components/dynamic-flex.component';

@Component({
  selector: 'app-design-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DynamicLayoutComponent,
    DynamicHeaderComponent,
    DynamicSidebarComponent,
    DynamicFooterComponent,
    DynamicCardComponent,
    DynamicGridComponent,
    DynamicFlexComponent
  ],
  template: `
    <div class="design-demo">
      <div class="controls">
        <h2>Design System Demo</h2>
        
        <div class="control-group">
          <label>Select Layout:</label>
          <select [(ngModel)]="selectedLayout">
            <option *ngFor="let layout of availableLayouts" [value]="layout">{{ layout }}</option>
          </select>
        </div>
        
        <div class="control-group">
          <label>Select Theme:</label>
          <select [(ngModel)]="selectedTheme" (change)="changeTheme()">
            <option *ngFor="let theme of availableThemes" [value]="theme">{{ theme }}</option>
          </select>
        </div>
        
        <div class="theme-preview">
          <h3>Current Theme: {{ selectedTheme }}</h3>
          
          <div class="color-swatches">
            <div class="color-swatch primary" [style.backgroundColor]="colors()?.primary">Primary</div>
            <div class="color-swatch secondary" [style.backgroundColor]="colors()?.secondary">Secondary</div>
            <div class="color-swatch background" [style.backgroundColor]="colors()?.background">Background</div>
            <div class="color-swatch surface" [style.backgroundColor]="colors()?.surface">Surface</div>
          </div>
          
          <div class="typography-preview">
            <h1 [style.fontFamily]="typography()?.fontFamily" [style.fontSize]="typography()?.fontSize.xxlarge">Heading 1</h1>
            <h2 [style.fontFamily]="typography()?.fontFamily" [style.fontSize]="typography()?.fontSize.xlarge">Heading 2</h2>
            <h3 [style.fontFamily]="typography()?.fontFamily" [style.fontSize]="typography()?.fontSize.large">Heading 3</h3>
            <p [style.fontFamily]="typography()?.fontFamily" [style.fontSize]="typography()?.fontSize.medium">
              This is a paragraph of text that demonstrates the typography settings of the current theme.
            </p>
            <small [style.fontFamily]="typography()?.fontFamily" [style.fontSize]="typography()?.fontSize.small">
              This is smaller text.
            </small>
          </div>
          
          <div class="component-preview">
            <h3>Component Styles</h3>
            
            <div class="buttons">
              <button class="primary">Primary Button</button>
              <button class="secondary">Secondary Button</button>
              <button class="text">Text Button</button>
            </div>
            
            <div class="cards">
              <div class="card default">
                <div class="card-header">Default Card</div>
                <div class="card-content">Card content goes here.</div>
              </div>
              
              <div class="card elevated">
                <div class="card-header">Elevated Card</div>
                <div class="card-content">Card content goes here.</div>
              </div>
              
              <div class="card outlined">
                <div class="card-header">Outlined Card</div>
                <div class="card-content">Card content goes here.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="layout-preview">
        <h3>Layout Preview: {{ selectedLayout }}</h3>
        <app-dynamic-layout [layoutName]="selectedLayout"></app-dynamic-layout>
      </div>
    </div>
  `,
  styles: [`
    .design-demo {
      padding: 20px;
    }
    
    .controls {
      margin-bottom: 30px;
    }
    
    .control-group {
      margin-bottom: 15px;
    }
    
    .control-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    select {
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #ccc;
      width: 200px;
    }
    
    .theme-preview {
      margin-top: 20px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
    }
    
    .color-swatches {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .color-swatch {
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }
    
    .typography-preview {
      margin-bottom: 20px;
    }
    
    .component-preview {
      margin-bottom: 20px;
    }
    
    .buttons {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .buttons button {
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .buttons button.primary {
      background-color: var(--primary-color, #3f51b5);
      color: white;
      border: none;
    }
    
    .buttons button.secondary {
      background-color: var(--secondary-color, #f50057);
      color: white;
      border: none;
    }
    
    .buttons button.text {
      background-color: transparent;
      color: var(--primary-color, #3f51b5);
      border: none;
    }
    
    .cards {
      display: flex;
      gap: 20px;
    }
    
    .card {
      width: 200px;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .card.default {
      background-color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .card.elevated {
      background-color: white;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }
    
    .card.outlined {
      background-color: white;
      border: 1px solid rgba(0, 0, 0, 0.12);
    }
    
    .card-header {
      padding: 15px;
      font-weight: bold;
      border-bottom: 1px solid #eee;
    }
    
    .card-content {
      padding: 15px;
    }
    
    .layout-preview {
      margin-top: 30px;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
    }
  `]
})
export class DesignDemoComponent implements OnInit {
  private designService = inject(DesignService);
  
  // Available layouts and themes
  availableLayouts: string[] = [];
  availableThemes: string[] = [];
  
  // Selected layout and theme
  selectedLayout: string = 'default';
  selectedTheme: string = 'light';
  
  // Theme properties
  colors = this.designService.colors;
  typography = this.designService.typography;
  spacing = this.designService.spacing;
  borderRadius = this.designService.borderRadius;
  
  ngOnInit(): void {
    // Get available layouts and themes
    this.availableLayouts = Object.keys(this.designService.layouts());
    this.availableThemes = Object.keys(this.designService.themes());
    
    // Set initial theme
    this.selectedTheme = this.designService.activeThemeName();
  }
  
  changeTheme(): void {
    this.designService.setActiveTheme(this.selectedTheme);
  }
} 