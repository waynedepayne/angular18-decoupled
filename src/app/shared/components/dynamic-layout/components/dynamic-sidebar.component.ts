import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarLayout, LayoutComponent } from '../../../../core/models/design.model';

@Component({
  selector: 'app-dynamic-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="dynamic-sidebar" 
           [class.collapsed]="isCollapsed()" 
           [style.width]="isCollapsed() ? '64px' : sidebar.width">
      
      <!-- Collapse toggle button -->
      <button *ngIf="sidebar.collapsible" 
              class="collapse-toggle" 
              (click)="toggleCollapse()">
        <i class="material-icons">
          {{ isCollapsed() ? 'chevron_right' : 'chevron_left' }}
        </i>
      </button>
      
      <!-- Sidebar components -->
      <ng-container *ngFor="let component of sidebar.components">
        <!-- Menu component -->
        <nav *ngIf="component.type === 'menu'" class="sidebar-menu">
          <ul>
            <li *ngFor="let item of component.items">
              <a [routerLink]="[item.route]" routerLinkActive="active">
                <i *ngIf="item.icon" class="material-icons">{{ item.icon }}</i>
                <span *ngIf="!isCollapsed()">{{ item.label }}</span>
              </a>
            </li>
          </ul>
        </nav>
      </ng-container>
    </aside>
  `,
  styles: [`
    .dynamic-sidebar {
      height: 100%;
      background-color: var(--surface-color, #f5f5f5);
      border-right: 1px solid rgba(0, 0, 0, 0.12);
      transition: width 0.3s ease;
      position: relative;
      overflow-x: hidden;
    }
    
    .collapse-toggle {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }
    
    .collapse-toggle:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
    
    .sidebar-menu {
      padding: var(--spacing-md, 16px) 0;
    }
    
    .sidebar-menu ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .sidebar-menu li {
      margin-bottom: var(--spacing-xs, 4px);
    }
    
    .sidebar-menu a {
      display: flex;
      align-items: center;
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      text-decoration: none;
      color: var(--text-primary-color, rgba(0, 0, 0, 0.87));
      border-radius: 0 var(--border-radius-large, 16px) var(--border-radius-large, 16px) 0;
      margin-right: var(--spacing-md, 16px);
      transition: background-color 0.3s;
      white-space: nowrap;
    }
    
    .sidebar-menu a:hover, .sidebar-menu a.active {
      background-color: rgba(0, 0, 0, 0.04);
      color: var(--primary-color, #3f51b5);
    }
    
    .sidebar-menu a.active {
      background-color: rgba(63, 81, 181, 0.08);
    }
    
    .sidebar-menu i {
      margin-right: var(--spacing-md, 16px);
    }
    
    .collapsed .sidebar-menu a {
      justify-content: center;
      padding: var(--spacing-sm, 8px);
      margin-right: var(--spacing-xs, 4px);
    }
    
    .collapsed .sidebar-menu i {
      margin-right: 0;
    }
  `]
})
export class DynamicSidebarComponent {
  @Input() sidebar!: SidebarLayout;
  
  private isCollapsedSignal = signal<boolean>(false);
  
  isCollapsed = this.isCollapsedSignal.asReadonly();
  
  ngOnInit(): void {
    // Initialize collapsed state from the sidebar configuration
    if (this.sidebar.defaultCollapsed) {
      this.isCollapsedSignal.set(true);
    }
  }
  
  toggleCollapse(): void {
    this.isCollapsedSignal.update(value => !value);
  }
} 