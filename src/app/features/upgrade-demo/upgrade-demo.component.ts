import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpgradeBridgeService } from '../../core/services/upgrade-bridge.service';
import { UpgradeModel, UpgradeComponent, DowngradeComponent, UpgradeProvider, DowngradeProvider, LegacyRoute, MigrationProgress } from '../../core/models/upgrade.model';

@Component({
  selector: 'app-upgrade-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upgrade-demo">
      <h2>Upgrade Bridge Demo</h2>
      <p>This demo shows how to use the UpgradeBridgeService to bridge between AngularJS and Angular components and services.</p>
      
      <div class="card mb-4">
        <div class="card-header">
          <h3>Upgrade Bridge Configuration</h3>
        </div>
        <div class="card-body">
          <div *ngIf="upgradeBridgeConfig; else loading">
            <div class="mb-3">
              <strong>Status:</strong> 
              <span [class]="upgradeBridgeConfig.enabled ? 'text-success' : 'text-danger'">
                {{ upgradeBridgeConfig.enabled ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
            
            <div class="mb-3">
              <strong>Version:</strong> {{ upgradeBridgeConfig.version }}
            </div>
            
            <div class="mb-3">
              <strong>Last Updated:</strong> {{ upgradeBridgeConfig.lastUpdated | date:'medium' }}
            </div>
            
            <div class="mb-3">
              <strong>Description:</strong> {{ upgradeBridgeConfig.description }}
            </div>
            
            <div class="mb-3">
              <strong>AngularJS Modules:</strong>
              <ul class="list-group mt-2">
                <li class="list-group-item" *ngFor="let module of upgradeBridgeConfig.angularJSModules">
                  {{ module }}
                </li>
              </ul>
            </div>
            
            <div class="mb-3">
              <strong>Bootstrap Element:</strong> {{ upgradeBridgeConfig.bootstrapElement }}
            </div>
            
            <div class="mb-3">
              <strong>Strict DI:</strong> {{ upgradeBridgeConfig.strictDi ? 'Yes' : 'No' }}
            </div>
            
            <div class="mb-3">
              <strong>AOT Mode:</strong> {{ upgradeBridgeConfig.aotMode ? 'Yes' : 'No' }}
            </div>
          </div>
          <ng-template #loading>
            <p>Loading upgrade bridge configuration...</p>
          </ng-template>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-6">
          <div class="card mb-4">
            <div class="card-header">
              <h3>Downgraded Components</h3>
              <p class="text-muted">Angular components used in AngularJS</p>
            </div>
            <div class="card-body">
              <div *ngIf="downgradedComponents.length > 0; else noDowngradedComponents">
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Selector</th>
                        <th>AngularJS Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let component of downgradedComponents">
                        <td>{{ component.name }}</td>
                        <td><code>{{ component.selector }}</code></td>
                        <td><code>{{ component.angularJSName }}</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <ng-template #noDowngradedComponents>
                <p class="text-muted">No downgraded components configured.</p>
              </ng-template>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card mb-4">
            <div class="card-header">
              <h3>Upgraded Components</h3>
              <p class="text-muted">AngularJS components used in Angular</p>
            </div>
            <div class="card-body">
              <div *ngIf="upgradedComponents.length > 0; else noUpgradedComponents">
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Selector</th>
                        <th>Angular Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let component of upgradedComponents">
                        <td>{{ component.name }}</td>
                        <td><code>{{ component.selector }}</code></td>
                        <td><code>{{ component.angularName }}</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <ng-template #noUpgradedComponents>
                <p class="text-muted">No upgraded components configured.</p>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-6">
          <div class="card mb-4">
            <div class="card-header">
              <h3>Downgraded Providers</h3>
              <p class="text-muted">Angular services used in AngularJS</p>
            </div>
            <div class="card-body">
              <div *ngIf="downgradedProviders.length > 0; else noDowngradedProviders">
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>AngularJS Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let provider of downgradedProviders">
                        <td>{{ provider.name }}</td>
                        <td><code>{{ provider.angularJSName }}</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <ng-template #noDowngradedProviders>
                <p class="text-muted">No downgraded providers configured.</p>
              </ng-template>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card mb-4">
            <div class="card-header">
              <h3>Upgraded Providers</h3>
              <p class="text-muted">AngularJS services used in Angular</p>
            </div>
            <div class="card-body">
              <div *ngIf="upgradedProviders.length > 0; else noUpgradedProviders">
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Factory</th>
                        <th>Dependencies</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let provider of upgradedProviders">
                        <td>{{ provider.name }}</td>
                        <td><code>{{ provider.useFactory }}</code></td>
                        <td><code>{{ provider.deps.join(', ') }}</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <ng-template #noUpgradedProviders>
                <p class="text-muted">No upgraded providers configured.</p>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card mb-4">
        <div class="card-header">
          <h3>Legacy Routes</h3>
        </div>
        <div class="card-body">
          <div *ngIf="legacyRoutes.length > 0; else noLegacyRoutes">
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Path</th>
                    <th>Component</th>
                    <th>Title</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let route of legacyRoutes">
                    <td><code>{{ route.path }}</code></td>
                    <td>{{ route.component }}</td>
                    <td>{{ route.title }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <ng-template #noLegacyRoutes>
            <p class="text-muted">No legacy routes configured.</p>
          </ng-template>
        </div>
      </div>
      
      <div class="card mb-4" *ngIf="migrationProgress">
        <div class="card-header">
          <h3>Migration Progress</h3>
        </div>
        <div class="card-body">
          <div class="progress mb-3">
            <div 
              class="progress-bar" 
              role="progressbar" 
              [style.width.%]="migrationProgress.completionPercentage"
              [attr.aria-valuenow]="migrationProgress.completionPercentage" 
              aria-valuemin="0" 
              aria-valuemax="100">
              {{ migrationProgress.completionPercentage }}%
            </div>
          </div>
          
          <div class="row text-center">
            <div class="col-md-4">
              <div class="card bg-light">
                <div class="card-body">
                  <h5>Total Components</h5>
                  <h2>{{ migrationProgress.totalComponents }}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card bg-success text-white">
                <div class="card-body">
                  <h5>Migrated</h5>
                  <h2>{{ migrationProgress.migratedComponents }}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card bg-warning text-dark">
                <div class="card-body">
                  <h5>Remaining</h5>
                  <h2>{{ migrationProgress.remainingComponents }}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card mb-4" *ngIf="upgradeBridgeConfig?.deprecationNotices?.enabled">
        <div class="card-header">
          <h3>Deprecation Notices</h3>
        </div>
        <div class="card-body">
          <div class="alert" [class.alert-warning]="upgradeBridgeConfig.deprecationNotices.showInUI" [class.alert-info]="!upgradeBridgeConfig.deprecationNotices.showInUI">
            <strong>Message:</strong> {{ upgradeBridgeConfig.deprecationNotices.message }}
          </div>
          <p>
            <strong>Show in UI:</strong> {{ upgradeBridgeConfig.deprecationNotices.showInUI ? 'Yes' : 'No' }}
          </p>
          
          <div class="card bg-light mt-3">
            <div class="card-header">Example Usage</div>
            <div class="card-body">
              <pre><code>
// In your component
constructor(private upgradeBridgeService: UpgradeBridgeService) {{ '{' }}{{ '}' }}

ngOnInit() {{ '{' }}
  if (this.upgradeBridgeService.isComponentDeprecated('legacyUserProfile')) {{ '{' }}
    console.warn(this.upgradeBridgeService.getDeprecationMessage('legacyUserProfile'));
  {{ '}' }}
{{ '}' }}
              </code></pre>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card mb-4">
        <div class="card-header">
          <h3>Legacy Component Example</h3>
        </div>
        <div class="card-body">
          <div class="alert alert-info">
            <strong>Note:</strong> This is a simulated example of how a legacy AngularJS component would be rendered in Angular.
          </div>
          
          <div class="legacy-component-example">
            <div class="card">
              <div class="card-header bg-secondary text-white">
                Legacy User Profile
                <span class="badge bg-warning text-dark float-end" *ngIf="upgradeBridgeConfig?.deprecationNotices?.showInUI">
                  Legacy
                </span>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-3">
                    <img src="https://via.placeholder.com/150" class="img-fluid rounded-circle" alt="User Avatar">
                  </div>
                  <div class="col-md-9">
                    <h4>John Doe</h4>
                    <p class="text-muted">Software Engineer</p>
                    <div class="mb-3">
                      <strong>Email:</strong> john.doe&#64;example.com
                    </div>
                    <div class="mb-3">
                      <strong>Phone:</strong> (555) 123-4567
                    </div>
                    <div class="mb-3">
                      <strong>Location:</strong> San Francisco, CA
                    </div>
                    <button class="btn btn-primary">Edit Profile</button>
                  </div>
                </div>
              </div>
              <div class="card-footer text-muted" *ngIf="upgradeBridgeConfig?.deprecationNotices?.showInUI">
                {{ upgradeBridgeConfig.deprecationNotices.message }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upgrade-demo {
      padding: 20px;
    }
    
    .legacy-component-example {
      border: 2px dashed #ccc;
      padding: 20px;
      border-radius: 4px;
      background-color: #f8f9fa;
    }
    
    pre {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      overflow: auto;
    }
    
    code {
      color: #d63384;
    }
  `]
})
export class UpgradeDemoComponent implements OnInit {
  private upgradeBridgeService = inject(UpgradeBridgeService);
  
  // Configuration
  upgradeBridgeConfig: UpgradeModel | null = null;
  
  // Component lists
  upgradedComponents: UpgradeComponent[] = [];
  downgradedComponents: DowngradeComponent[] = [];
  
  // Provider lists
  upgradedProviders: UpgradeProvider[] = [];
  downgradedProviders: DowngradeProvider[] = [];
  
  // Routes
  legacyRoutes: LegacyRoute[] = [];
  
  // Migration progress
  migrationProgress: MigrationProgress | null = null;
  
  ngOnInit(): void {
    // Get upgrade bridge configuration
    this.upgradeBridgeConfig = this.upgradeBridgeService.upgradeBridgeConfig();
    
    // Get component lists
    this.upgradedComponents = this.upgradeBridgeService.getUpgradedComponents();
    this.downgradedComponents = this.upgradeBridgeService.getDowngradedComponents();
    
    // Get provider lists
    this.upgradedProviders = this.upgradeBridgeService.getUpgradedProviders();
    this.downgradedProviders = this.upgradeBridgeService.getDowngradedProviders();
    
    // Get routes
    this.legacyRoutes = this.upgradeBridgeService.getLegacyRoutes();
    
    // Get migration progress
    this.migrationProgress = this.upgradeBridgeService.getMigrationProgress();
  }
} 