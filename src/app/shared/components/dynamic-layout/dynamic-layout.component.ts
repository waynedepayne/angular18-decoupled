import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewContainerRef, ComponentRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortalModule, ComponentPortal, PortalOutlet } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';
import { RouterModule } from '@angular/router';
import { DesignService } from '../../../core/services/design.service';
import { Layout, LayoutComponent } from '../../../core/models/design.model';

// Import dynamic components
import { DynamicHeaderComponent } from './components/dynamic-header.component';
import { DynamicSidebarComponent } from './components/dynamic-sidebar.component';
import { DynamicFooterComponent } from './components/dynamic-footer.component';
import { DynamicCardComponent } from './components/dynamic-card.component';
import { DynamicGridComponent } from './components/dynamic-grid.component';
import { DynamicFlexComponent } from './components/dynamic-flex.component';

@Component({
  selector: 'app-dynamic-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PortalModule,
    OverlayModule
  ],
  template: `
    <div class="dynamic-layout" [ngClass]="layoutName">
      <ng-container *ngIf="layout">
        <!-- Header -->
        <app-dynamic-header 
          *ngIf="layout.header" 
          [header]="layout.header">
        </app-dynamic-header>
        
        <!-- Main content area with optional sidebar -->
        <div class="main-content-area">
          <app-dynamic-sidebar 
            *ngIf="layout.sidebar" 
            [sidebar]="layout.sidebar">
          </app-dynamic-sidebar>
          
          <main class="main-content">
            <ng-content></ng-content>
            
            <!-- Render dynamic components based on layout type -->
            <ng-container [ngSwitch]="layout.type">
              <app-dynamic-grid 
                *ngSwitchCase="'grid'" 
                [layout]="layout">
              </app-dynamic-grid>
              
              <app-dynamic-flex 
                *ngSwitchCase="'flex'" 
                [layout]="layout">
              </app-dynamic-flex>
              
              <!-- Default case - just render the components in order -->
              <ng-container *ngSwitchDefault>
                <div *ngFor="let component of layout.components">
                  <app-dynamic-card 
                    *ngIf="component.type === 'card'" 
                    [component]="component">
                  </app-dynamic-card>
                  
                  <!-- Add more component types as needed -->
                </div>
              </ng-container>
            </ng-container>
          </main>
        </div>
        
        <!-- Footer -->
        <app-dynamic-footer 
          *ngIf="layout.footer" 
          [footer]="layout.footer">
        </app-dynamic-footer>
      </ng-container>
    </div>
  `,
  styles: [`
    .dynamic-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .main-content-area {
      display: flex;
      flex: 1;
    }
    
    .main-content {
      flex: 1;
      padding: var(--spacing-md, 16px);
    }
  `]
})
export class DynamicLayoutComponent implements OnInit, OnChanges {
  private designService = inject(DesignService);
  
  @Input() layoutName: string = 'default';
  
  layout: Layout | null = null;
  
  ngOnInit(): void {
    this.loadLayout();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['layoutName']) {
      this.loadLayout();
    }
  }
  
  private loadLayout(): void {
    this.layout = this.designService.getLayout(this.layoutName);
    
    if (!this.layout) {
      console.warn(`Layout "${this.layoutName}" not found, using default layout`);
      this.layout = this.designService.getLayout('default');
    }
  }
} 