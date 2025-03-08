import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterConfigService } from '../../core/services/router-config.service';
import { Router, Routes, RouterModule } from '@angular/router';
import { RouteDefinition } from '../../core/models/router.model';

@Component({
  selector: 'app-router-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="router-demo">
      <h2>Dynamic Router Demo</h2>
      
      <div class="router-info">
        <h3>Current Router Configuration</h3>
        
        <div class="route-tree">
          <div class="route-tree-header">
            <span class="path">Path</span>
            <span class="component">Component</span>
            <span class="data">Data</span>
            <span class="guards">Guards</span>
          </div>
          
          <div class="route-tree-body">
            <ng-container *ngFor="let route of flattenedRoutes">
              <div class="route-item" [style.paddingLeft.px]="route.level * 20">
                <span class="path">{{ route.path || '/' }}</span>
                <span class="component">{{ route.component || (route.redirectTo ? 'Redirect to ' + route.redirectTo : '') }}</span>
                <span class="data">
                  <span *ngIf="route.data?.title">{{ route.data.title }}</span>
                  <span *ngIf="route.data?.permissions" class="permissions">
                    [{{ route.data.permissions.join(', ') }}]
                  </span>
                </span>
                <span class="guards">
                  <span *ngIf="route.canActivate?.length" class="guard">CanActivate</span>
                  <span *ngIf="route.canDeactivate?.length" class="guard">CanDeactivate</span>
                </span>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
      
      <div class="router-config">
        <h3>Router Configuration Details</h3>
        
        <div class="config-section">
          <h4>Default Routes</h4>
          <p><strong>Default Error Route:</strong> {{ defaultErrorRoute() }}</p>
          <p><strong>Default Auth Route:</strong> {{ defaultAuthRoute() }}</p>
          <p><strong>Default Success Route:</strong> {{ defaultSuccessRoute() }}</p>
        </div>
        
        <div class="config-section">
          <h4>Guards</h4>
          <div *ngFor="let guard of guardEntries()" class="guard-item">
            <h5>{{ guard[0] }}</h5>
            <p><strong>Type:</strong> {{ guard[1].type }}</p>
            <p *ngIf="guard[1].roles"><strong>Roles:</strong> {{ guard[1].roles.join(', ') }}</p>
            <p *ngIf="guard[1].applyTo"><strong>Applied To:</strong> {{ guard[1].applyTo.join(', ') }}</p>
          </div>
        </div>
        
        <div class="config-section">
          <h4>Resolvers</h4>
          <div *ngFor="let resolver of resolverEntries()" class="resolver-item">
            <h5>{{ resolver[0] }}</h5>
            <p><strong>Data Service:</strong> {{ resolver[1].dataService }}</p>
            <p><strong>Method:</strong> {{ resolver[1].method }}</p>
            <p *ngIf="resolver[1].applyTo"><strong>Applied To:</strong> {{ resolver[1].applyTo.join(', ') }}</p>
          </div>
        </div>
      </div>
      
      <div class="router-actions">
        <h3>Router Actions</h3>
        
        <div class="action-buttons">
          <button (click)="navigateToRoute('/dashboard')">Go to Dashboard</button>
          <button (click)="navigateToRoute('/config-demo')">Go to Config Demo</button>
          <button (click)="navigateToRoute('/design-demo')">Go to Design Demo</button>
          <button (click)="navigateToRoute('/router-demo')">Go to Router Demo</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .router-demo {
      padding: 20px;
    }
    
    h2, h3, h4, h5 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
    }
    
    .router-info, .router-config, .router-actions {
      margin-bottom: 30px;
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .route-tree {
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .route-tree-header {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      background-color: #f0f0f0;
      padding: 10px;
      font-weight: bold;
      border-bottom: 1px solid #ddd;
    }
    
    .route-tree-body {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .route-item {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      padding: 8px 10px;
      border-bottom: 1px solid #eee;
      transition: background-color 0.2s;
    }
    
    .route-item:hover {
      background-color: #f0f0f0;
    }
    
    .path {
      font-family: monospace;
      color: #0066cc;
    }
    
    .component {
      color: #009900;
    }
    
    .permissions {
      font-size: 0.85em;
      color: #666;
      margin-left: 5px;
    }
    
    .guard {
      display: inline-block;
      background-color: #e6f7ff;
      color: #0066cc;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.85em;
      margin-right: 5px;
    }
    
    .config-section {
      margin-bottom: 20px;
      padding: 15px;
      background-color: white;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .guard-item, .resolver-item {
      margin-bottom: 15px;
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .guard-item h5, .resolver-item h5 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #0066cc;
    }
    
    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    button {
      padding: 8px 16px;
      background-color: #3f51b5;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    button:hover {
      background-color: #303f9f;
    }
  `]
})
export class RouterDemoComponent implements OnInit {
  private routerConfigService = inject(RouterConfigService);
  private router = inject(Router);
  
  // Flattened routes for display
  flattenedRoutes: (RouteDefinition & { level: number })[] = [];
  
  // Computed values from the RouterConfigService
  defaultErrorRoute = this.routerConfigService.defaultErrorRoute;
  defaultAuthRoute = this.routerConfigService.defaultAuthRoute;
  defaultSuccessRoute = this.routerConfigService.defaultSuccessRoute;
  
  ngOnInit(): void {
    // Flatten the routes for display
    this.flattenRoutes();
  }
  
  // Helper method to get guard entries for display
  guardEntries(): [string, any][] {
    return Object.entries(this.routerConfigService.guards());
  }
  
  // Helper method to get resolver entries for display
  resolverEntries(): [string, any][] {
    return Object.entries(this.routerConfigService.resolvers());
  }
  
  // Navigate to a route
  navigateToRoute(path: string): void {
    this.router.navigateByUrl(path);
  }
  
  // Flatten the routes for display
  private flattenRoutes(): void {
    const routes = this.routerConfigService.routes();
    this.flattenedRoutes = this.flattenRoutesRecursively(routes);
  }
  
  // Recursively flatten routes
  private flattenRoutesRecursively(routes: RouteDefinition[], level: number = 0): (RouteDefinition & { level: number })[] {
    let result: (RouteDefinition & { level: number })[] = [];
    
    routes.forEach(route => {
      // Add the current route with its level
      result.push({ ...route, level });
      
      // Recursively add children
      if (route.children && route.children.length) {
        result = result.concat(this.flattenRoutesRecursively(route.children, level + 1));
      }
    });
    
    return result;
  }
} 