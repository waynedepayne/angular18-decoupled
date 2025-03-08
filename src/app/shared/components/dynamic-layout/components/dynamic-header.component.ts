import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderLayout, LayoutComponent } from '../../../../core/models/design.model';

@Component({
  selector: 'app-dynamic-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="dynamic-header" [style.height]="header.height">
      <ng-container *ngFor="let component of header.components">
        <!-- Logo component -->
        <div *ngIf="component.type === 'logo'" 
             class="header-component logo" 
             [class.left]="component.position === 'left'"
             [class.center]="component.position === 'center'"
             [class.right]="component.position === 'right'">
          <a [routerLink]="['/']">
            <img *ngIf="component.imageUrl" [src]="component.imageUrl" alt="Logo">
            <span *ngIf="component.text">{{ component.text }}</span>
          </a>
        </div>
        
        <!-- Navigation component -->
        <nav *ngIf="component.type === 'navigation'" 
             class="header-component navigation" 
             [class.left]="component.position === 'left'"
             [class.center]="component.position === 'center'"
             [class.right]="component.position === 'right'">
          <ul>
            <li *ngFor="let item of component.items">
              <a [routerLink]="[item.route]" routerLinkActive="active">
                <i *ngIf="item.icon" class="material-icons">{{ item.icon }}</i>
                <span>{{ item.label }}</span>
              </a>
            </li>
          </ul>
        </nav>
        
        <!-- User menu component -->
        <div *ngIf="component.type === 'user-menu'" 
             class="header-component user-menu" 
             [class.left]="component.position === 'left'"
             [class.center]="component.position === 'center'"
             [class.right]="component.position === 'right'">
          <button class="user-menu-button">
            <div *ngIf="component.avatar" class="avatar">
              <!-- Placeholder avatar, would be replaced with actual user avatar -->
              <div class="avatar-placeholder">U</div>
            </div>
            <i class="material-icons">arrow_drop_down</i>
          </button>
          <!-- User menu dropdown would be implemented here -->
        </div>
      </ng-container>
    </header>
  `,
  styles: [`
    .dynamic-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--spacing-md, 16px);
      background-color: var(--primary-color, #3f51b5);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .header-component {
      display: flex;
      align-items: center;
    }
    
    .header-component.left {
      margin-right: auto;
    }
    
    .header-component.center {
      margin: 0 auto;
    }
    
    .header-component.right {
      margin-left: auto;
    }
    
    .logo a {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: white;
      font-weight: bold;
      font-size: var(--font-size-large, 1.25rem);
    }
    
    .logo img {
      height: 40px;
      margin-right: var(--spacing-sm, 8px);
    }
    
    .navigation ul {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .navigation li {
      margin: 0 var(--spacing-sm, 8px);
    }
    
    .navigation a {
      display: flex;
      align-items: center;
      color: white;
      text-decoration: none;
      padding: var(--spacing-sm, 8px);
      border-radius: var(--border-radius-small, 4px);
      transition: background-color 0.3s;
    }
    
    .navigation a:hover, .navigation a.active {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .navigation i {
      margin-right: var(--spacing-xs, 4px);
    }
    
    .user-menu-button {
      display: flex;
      align-items: center;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: var(--spacing-xs, 4px);
      border-radius: var(--border-radius-small, 4px);
    }
    
    .user-menu-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: var(--spacing-xs, 4px);
    }
    
    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
  `]
})
export class DynamicHeaderComponent {
  @Input() header!: HeaderLayout;
} 