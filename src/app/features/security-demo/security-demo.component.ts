import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SecurityService } from '../../core/services/security.service';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';

/**
 * Demo component for showcasing security functionality
 */
@Component({
  selector: 'app-security-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, HasRoleDirective, HasPermissionDirective],
  template: `
    <div class="security-demo">
      <header class="demo-header">
        <h1>Security Demo</h1>
        <p>This demo showcases the runtime security capabilities using security.json</p>
      </header>

      <section class="login-section">
        <h2>Authentication</h2>
        
        <div class="auth-status">
          <div *ngIf="isBrowser && securityService.isAuthenticated(); else notAuthenticated">
            <p class="status-text authenticated">
              <span class="status-icon">✓</span>
              You are authenticated as <strong>{{ (securityService.currentUser$ | async)?.username }}</strong>
            </p>
            <p>
              Roles: 
              <span class="role-badge" *ngFor="let role of securityService.currentUserRoles()">
                {{ role }}
              </span>
            </p>
            <p>
              Permissions: 
              <span class="permission-badge" *ngFor="let permission of securityService.currentUserPermissions()">
                {{ permission }}
              </span>
            </p>
            <button class="btn btn-danger" (click)="logout()">Logout</button>
          </div>
          
          <ng-template #notAuthenticated>
            <p class="status-text not-authenticated">
              <span class="status-icon">✗</span>
              You are not authenticated
            </p>
            <div class="login-form" *ngIf="isBrowser">
              <div class="form-group">
                <label for="username">Username</label>
                <select id="username" [(ngModel)]="username" class="form-control">
                  <option value="">Select a role</option>
                  <option value="user">User</option>
                  <option value="editor">Editor</option>
                  <option value="manager">Manager</option>
                  <option value="developer">Developer</option>
                  <option value="admin">Admin</option>
                </select>
                <small class="form-text text-muted">Select a role to login as</small>
              </div>
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" [(ngModel)]="password" class="form-control" placeholder="Any password will work">
              </div>
              <button class="btn btn-primary" (click)="login()" [disabled]="!username">Login</button>
            </div>
          </ng-template>
        </div>
      </section>

      <section class="role-based-section">
        <h2>Role-Based Access Control</h2>
        
        <div class="card-grid">
          <div class="access-card guest-card">
            <h3>Guest Access</h3>
            <div class="card-content">
              <p>This content is visible to everyone, including guests.</p>
            </div>
          </div>
          
          <div class="access-card user-card" *appHasRole="'user'">
            <h3>User Access</h3>
            <div class="card-content">
              <p>This content is only visible to authenticated users.</p>
              <p>You need the <code>user</code> role to see this.</p>
            </div>
          </div>
          
          <div class="access-card editor-card" *appHasRole="'editor'">
            <h3>Editor Access</h3>
            <div class="card-content">
              <p>This content is only visible to editors.</p>
              <p>You need the <code>editor</code> role to see this.</p>
            </div>
          </div>
          
          <div class="access-card manager-card" *appHasRole="'manager'">
            <h3>Manager Access</h3>
            <div class="card-content">
              <p>This content is only visible to managers.</p>
              <p>You need the <code>manager</code> role to see this.</p>
            </div>
          </div>
          
          <div class="access-card developer-card" *appHasRole="'developer'">
            <h3>Developer Access</h3>
            <div class="card-content">
              <p>This content is only visible to developers.</p>
              <p>You need the <code>developer</code> role to see this.</p>
            </div>
          </div>
          
          <div class="access-card admin-card" *appHasRole="'admin'">
            <h3>Admin Access</h3>
            <div class="card-content">
              <p>This content is only visible to administrators.</p>
              <p>You need the <code>admin</code> role to see this.</p>
            </div>
          </div>
          
          <div class="access-card multi-role-card" *appHasRole="['editor', 'manager']">
            <h3>Multi-Role Access</h3>
            <div class="card-content">
              <p>This content is visible to editors OR managers.</p>
              <p>You need either the <code>editor</code> or <code>manager</code> role to see this.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="permission-based-section">
        <h2>Permission-Based Access Control</h2>
        
        <div class="card-grid">
          <div class="access-card" *appHasPermission="'view:public'">
            <h3>Public Content</h3>
            <div class="card-content">
              <p>This content requires the <code>view:public</code> permission.</p>
              <p>All users, including guests, have this permission.</p>
            </div>
          </div>
          
          <div class="access-card" *appHasPermission="'edit:profile'">
            <h3>Profile Editing</h3>
            <div class="card-content">
              <p>This content requires the <code>edit:profile</code> permission.</p>
              <p>Users, editors, managers, and admins have this permission.</p>
              <button class="btn btn-primary">Edit Profile</button>
            </div>
          </div>
          
          <div class="access-card" *appHasPermission="'edit:content'">
            <h3>Content Management</h3>
            <div class="card-content">
              <p>This content requires the <code>edit:content</code> permission.</p>
              <p>Editors and admins have this permission.</p>
              <button class="btn btn-primary">Create Content</button>
              <button class="btn btn-secondary">Edit Content</button>
            </div>
          </div>
          
          <div class="access-card" *appHasPermission="'publish:content'">
            <h3>Content Publishing</h3>
            <div class="card-content">
              <p>This content requires the <code>publish:content</code> permission.</p>
              <p>Editors and admins have this permission.</p>
              <button class="btn btn-success">Publish Content</button>
              <button class="btn btn-warning">Unpublish Content</button>
            </div>
          </div>
          
          <div class="access-card" *appHasPermission="'view:reports'">
            <h3>Reports Viewing</h3>
            <div class="card-content">
              <p>This content requires the <code>view:reports</code> permission.</p>
              <p>Managers and admins have this permission.</p>
              <button class="btn btn-info">View Reports</button>
            </div>
          </div>
          
          <div class="access-card" *appHasPermission="'manage:users'">
            <h3>User Management</h3>
            <div class="card-content">
              <p>This content requires the <code>manage:users</code> permission.</p>
              <p>Managers and admins have this permission.</p>
              <button class="btn btn-primary">Manage Users</button>
            </div>
          </div>
          
          <div class="access-card" *appHasPermission="'admin:all'">
            <h3>Admin Panel</h3>
            <div class="card-content">
              <p>This content requires the <code>admin:all</code> permission.</p>
              <p>Only admins have this permission.</p>
              <button class="btn btn-danger">Admin Settings</button>
            </div>
          </div>
          
          <div class="access-card" *appHasPermission="['view:logs', 'view:system']" [appHasPermissionMode]="'any'">
            <h3>System Access</h3>
            <div class="card-content">
              <p>This content requires either <code>view:logs</code> OR <code>view:system</code> permission.</p>
              <p>Developers and admins have these permissions.</p>
              <button class="btn btn-secondary">View System</button>
            </div>
          </div>
        </div>
      </section>

      <section class="security-info">
        <h2>Security Configuration</h2>
        
        <div class="info-tabs">
          <div class="tab-buttons">
            <button 
              class="tab-button" 
              [class.active]="activeTab === 'roles'"
              (click)="activeTab = 'roles'"
            >
              Roles
            </button>
            <button 
              class="tab-button" 
              [class.active]="activeTab === 'permissions'"
              (click)="activeTab = 'permissions'"
            >
              Permissions
            </button>
            <button 
              class="tab-button" 
              [class.active]="activeTab === 'routes'"
              (click)="activeTab = 'routes'"
            >
              Routes
            </button>
            <button 
              class="tab-button" 
              [class.active]="activeTab === 'features'"
              (click)="activeTab = 'features'"
            >
              Features
            </button>
          </div>
          
          <div class="tab-content">
            <div *ngIf="activeTab === 'roles'" class="roles-tab">
              <h3>Available Roles</h3>
              <div class="roles-list">
                <div class="role-item" *ngFor="let role of securityService.availableRoles()">
                  <h4>{{ role.name }} <code>({{ role.id }})</code></h4>
                  <p *ngIf="role.description">{{ role.description }}</p>
                </div>
              </div>
            </div>
            
            <div *ngIf="activeTab === 'permissions'" class="permissions-tab">
              <h3>Available Permissions</h3>
              <div class="permissions-list">
                <div class="permission-item" *ngFor="let permission of securityService.availablePermissions()">
                  <h4>{{ permission.name }} <code>({{ permission.id }})</code></h4>
                  <p *ngIf="permission.description">{{ permission.description }}</p>
                  <p *ngIf="permission.resourceType">Resource Type: <code>{{ permission.resourceType }}</code></p>
                </div>
              </div>
            </div>
            
            <div *ngIf="activeTab === 'routes'" class="routes-tab">
              <h3>Protected Routes</h3>
              <div class="routes-list">
                <div class="route-item" *ngFor="let route of getRoutes()">
                  <h4>{{ route.path || '/' }}</h4>
                  <p *ngIf="route.allowedRoles?.length">
                    Allowed Roles: 
                    <span class="role-badge" *ngFor="let role of route.allowedRoles">{{ role }}</span>
                  </p>
                  <p *ngIf="route.requiredPermissions?.length">
                    Required Permissions: 
                    <span class="permission-badge" *ngFor="let permission of route.requiredPermissions">{{ permission }}</span>
                  </p>
                  <p *ngIf="route.redirectTo">Redirect To: <code>{{ route.redirectTo }}</code></p>
                </div>
              </div>
            </div>
            
            <div *ngIf="activeTab === 'features'" class="features-tab">
              <h3>Protected Features</h3>
              <div class="features-list">
                <div class="feature-item" *ngFor="let feature of getFeatures()">
                  <h4>{{ feature.featureId }}</h4>
                  <p *ngIf="feature.allowedRoles?.length">
                    Allowed Roles: 
                    <span class="role-badge" *ngFor="let role of feature.allowedRoles">{{ role }}</span>
                  </p>
                  <p *ngIf="feature.requiredPermissions?.length">
                    Required Permissions: 
                    <span class="permission-badge" *ngFor="let permission of feature.requiredPermissions">{{ permission }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    
    <style>
      .security-demo {
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
      
      .auth-status {
        background-color: var(--color-background, #ffffff);
        padding: 20px;
        border-radius: var(--border-radius-medium, 4px);
        margin-bottom: 20px;
      }
      
      .status-text {
        font-size: 1.2rem;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
      }
      
      .status-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        margin-right: 8px;
        font-weight: bold;
      }
      
      .authenticated .status-icon {
        background-color: var(--color-success, #4caf50);
        color: white;
      }
      
      .not-authenticated .status-icon {
        background-color: var(--color-error, #f44336);
        color: white;
      }
      
      .login-form {
        max-width: 400px;
      }
      
      .form-group {
        margin-bottom: 16px;
      }
      
      .form-control {
        display: block;
        width: 100%;
        padding: 8px 12px;
        font-size: 1rem;
        border: 1px solid var(--color-divider, #e0e0e0);
        border-radius: var(--border-radius-medium, 4px);
        background-color: var(--color-background, #ffffff);
      }
      
      .btn {
        padding: 8px 16px;
        border-radius: var(--border-radius-medium, 4px);
        border: none;
        font-weight: var(--font-weight-medium, 500);
        cursor: pointer;
        margin-right: 8px;
        margin-bottom: 8px;
      }
      
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .btn-primary {
        background-color: var(--color-primary, #3f51b5);
        color: var(--color-primary-contrast, #ffffff);
      }
      
      .btn-secondary {
        background-color: var(--color-secondary, #f50057);
        color: var(--color-secondary-contrast, #ffffff);
      }
      
      .btn-success {
        background-color: var(--color-success, #4caf50);
        color: white;
      }
      
      .btn-warning {
        background-color: var(--color-warning, #ff9800);
        color: white;
      }
      
      .btn-danger {
        background-color: var(--color-error, #f44336);
        color: white;
      }
      
      .btn-info {
        background-color: var(--color-info, #2196f3);
        color: white;
      }
      
      .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }
      
      .access-card {
        background-color: var(--color-background, #ffffff);
        border-radius: var(--border-radius-medium, 4px);
        padding: 20px;
        box-shadow: var(--shadow-1, 0 1px 3px rgba(0, 0, 0, 0.12));
      }
      
      .card-content {
        margin-top: 16px;
      }
      
      .role-badge, .permission-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 16px;
        font-size: 0.8rem;
        margin-right: 4px;
        margin-bottom: 4px;
      }
      
      .role-badge {
        background-color: var(--color-primary-light, #757de8);
        color: var(--color-primary-contrast, #ffffff);
      }
      
      .permission-badge {
        background-color: var(--color-secondary-light, #ff5983);
        color: var(--color-secondary-contrast, #ffffff);
      }
      
      code {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 2px 4px;
        border-radius: 4px;
        font-family: monospace;
      }
      
      .info-tabs {
        background-color: var(--color-background, #ffffff);
        border-radius: var(--border-radius-medium, 4px);
        overflow: hidden;
      }
      
      .tab-buttons {
        display: flex;
        border-bottom: 1px solid var(--color-divider, #e0e0e0);
        overflow-x: auto;
      }
      
      .tab-button {
        padding: 12px 20px;
        background: none;
        border: none;
        cursor: pointer;
        font-weight: var(--font-weight-medium, 500);
        color: var(--color-text-secondary, #757575);
        border-bottom: 2px solid transparent;
      }
      
      .tab-button.active {
        color: var(--color-primary, #3f51b5);
        border-bottom-color: var(--color-primary, #3f51b5);
      }
      
      .tab-content {
        padding: 20px;
      }
      
      .roles-list, .permissions-list, .routes-list, .features-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }
      
      .role-item, .permission-item, .route-item, .feature-item {
        background-color: rgba(0, 0, 0, 0.02);
        padding: 16px;
        border-radius: var(--border-radius-medium, 4px);
        border-left: 4px solid var(--color-primary, #3f51b5);
      }
      
      .permission-item {
        border-left-color: var(--color-secondary, #f50057);
      }
      
      .route-item {
        border-left-color: var(--color-info, #2196f3);
      }
      
      .feature-item {
        border-left-color: var(--color-success, #4caf50);
      }
    </style>
  `
})
export class SecurityDemoComponent implements OnInit {
  securityService = inject(SecurityService);
  private platformId = inject(PLATFORM_ID);
  
  // Flag to check if we're in a browser environment
  isBrowser = isPlatformBrowser(this.platformId);
  
  // Login form
  username: string = '';
  password: string = 'password'; // Default password for demo
  
  // Tabs
  activeTab: 'roles' | 'permissions' | 'routes' | 'features' = 'roles';
  
  ngOnInit(): void {
    // Set a default password for demo purposes
    this.password = 'password';
    
    // Check if we're already authenticated (e.g., from a previous session)
    if (this.isBrowser) {
      this.securityService.checkAuth();
    }
  }
  
  login(): void {
    if (this.isBrowser && this.username) {
      console.log(`Attempting to login as ${this.username}`);
      this.securityService.login(this.username, this.password || 'password').subscribe({
        next: (response) => {
          console.log('Login successful:', response);
        },
        error: (error) => {
          console.error('Login failed:', error);
        }
      });
    }
  }
  
  logout(): void {
    if (this.isBrowser) {
      console.log('Logging out');
      this.securityService.logout();
    }
  }
  
  getRoutes(): any[] {
    const security = this.securityService.security();
    return security ? security.routes : [];
  }
  
  getFeatures(): any[] {
    const security = this.securityService.security();
    return security ? security.features : [];
  }
} 