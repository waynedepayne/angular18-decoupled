import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MicrofrontendService } from '../../core/services/microfrontend.service';
import { Observable } from 'rxjs';
import { MicrofrontendModel, RemoteModule, RemoteRoute } from '../../core/models/microfrontend.model';
import { RemoteComponentDirective } from '../../shared/directives/remote-component.directive';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-microfrontend-demo',
  standalone: true,
  imports: [CommonModule, RemoteComponentDirective, FormsModule],
  template: `
    <div class="microfrontend-demo">
      <h2>Micro-Frontend Configuration</h2>
      
      <div *ngIf="enabled$ | async; else disabled">
        <div class="config-info">
          <p><strong>Version:</strong> {{ (config$ | async)?.version }}</p>
          <p><strong>Last Updated:</strong> {{ (config$ | async)?.lastUpdated | date:'medium' }}</p>
        </div>

        <h3>Remote Modules</h3>
        <div class="remotes-list">
          <div *ngFor="let remote of enabledRemotes$ | async" class="remote-card">
            <h4>{{ remote.name }}</h4>
            <p><strong>URL:</strong> {{ remote.url }}</p>
            <p><strong>Status:</strong> <span [class.enabled]="remote.enabled">{{ remote.enabled ? 'Enabled' : 'Disabled' }}</span></p>
            <p><strong>Preload:</strong> {{ remote.preload ? 'Yes' : 'No' }}</p>
            
            <h5>Exposed Modules</h5>
            <ul>
              <li *ngFor="let module of remote.exposedModules">
                {{ module.name }} ({{ module.type }})
              </li>
            </ul>
          </div>
        </div>

        <h3>Routes</h3>
        <div class="routes-list">
          <div *ngFor="let route of enabledRoutes$ | async" class="route-card">
            <h4>{{ route.path }}</h4>
            <p><strong>Remote:</strong> {{ route.remoteName }}</p>
            <p><strong>Module:</strong> {{ route.exposedModule }}</p>
            <p><strong>Lazy:</strong> {{ route.lazy ? 'Yes' : 'No' }}</p>
            <p *ngIf="route.requiresAuth"><strong>Auth Required:</strong> Yes</p>
            <p *ngIf="route.roles && route.roles.length">
              <strong>Roles:</strong> {{ route.roles.join(', ') }}
            </p>
          </div>
        </div>

        <h3>Dynamic Component Loader</h3>
        <div class="component-loader">
          <div class="form-group">
            <label for="remoteSelect">Select Remote:</label>
            <select id="remoteSelect" [(ngModel)]="selectedRemote" (change)="onRemoteChange()">
              <option value="">-- Select Remote --</option>
              <option *ngFor="let remote of enabledRemotes$ | async" [value]="remote.name">
                {{ remote.name }}
              </option>
            </select>
          </div>

          <div class="form-group" *ngIf="selectedRemote">
            <label for="componentSelect">Select Component:</label>
            <select id="componentSelect" [(ngModel)]="selectedComponent">
              <option value="">-- Select Component --</option>
              <option *ngFor="let module of availableComponents" [value]="module.name">
                {{ module.name }}
              </option>
            </select>
          </div>

          <div class="form-group" *ngIf="selectedRemote && selectedComponent">
            <label for="componentProps">Component Props (JSON):</label>
            <textarea id="componentProps" [(ngModel)]="componentProps" rows="4" 
                      placeholder='{"title": "My Title", "showHeader": true}'></textarea>
          </div>

          <button *ngIf="selectedRemote && selectedComponent" 
                  (click)="loadComponent()" 
                  class="load-button">
            Load Component
          </button>

          <div *ngIf="isComponentLoaded" class="component-container">
            <h4>Loaded Component: {{ selectedRemote }}/{{ selectedComponent }}</h4>
            <div appRemoteComponent
                 [remoteName]="selectedRemote"
                 [componentName]="selectedComponent"
                 [inputs]="parsedProps"
                 [outputs]="componentOutputs">
            </div>
          </div>
        </div>
      </div>

      <ng-template #disabled>
        <div class="disabled-message">
          <p>Micro-Frontends are currently disabled in the configuration.</p>
          <p>To enable them, set <code>"enabled": true</code> in <code>microfrontend.json</code>.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .microfrontend-demo {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .config-info {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    
    .remotes-list, .routes-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .remote-card, .route-card {
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .enabled {
      color: green;
      font-weight: bold;
    }
    
    .disabled-message {
      background-color: #fff3cd;
      color: #856404;
      padding: 20px;
      border-radius: 5px;
      border-left: 5px solid #ffeeba;
    }
    
    h2, h3 {
      color: #333;
      margin-bottom: 20px;
    }
    
    h4 {
      color: #0066cc;
      margin-bottom: 10px;
    }
    
    ul {
      padding-left: 20px;
    }

    .component-loader {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    select, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      font-size: 14px;
    }

    textarea {
      resize: vertical;
    }

    .load-button {
      background-color: #3f51b5;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 15px;
    }

    .load-button:hover {
      background-color: #303f9f;
    }

    .component-container {
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 20px;
      margin-top: 20px;
    }
  `]
})
export class MicrofrontendDemoComponent implements OnInit {
  config$: Observable<MicrofrontendModel | null>;
  enabled$: Observable<boolean>;
  enabledRemotes$: Observable<RemoteModule[]>;
  enabledRoutes$: Observable<RemoteRoute[]>;

  // Dynamic component loader
  selectedRemote: string = '';
  selectedComponent: string = '';
  componentProps: string = '{}';
  parsedProps: Record<string, any> = {};
  availableComponents: Array<{name: string, type: string}> = [];
  isComponentLoaded: boolean = false;

  componentOutputs: Record<string, (event: any) => void> = {
    onClick: (event: any) => console.log('Component clicked:', event),
    onAction: (event: any) => console.log('Component action:', event),
    onSubmit: (event: any) => console.log('Component submitted:', event)
  };

  constructor(private microfrontendService: MicrofrontendService) {
    this.config$ = this.microfrontendService.config$;
    this.enabled$ = this.microfrontendService.enabled$;
    this.enabledRemotes$ = this.microfrontendService.getEnabledRemotes();
    this.enabledRoutes$ = this.microfrontendService.getEnabledRoutes();
  }

  ngOnInit(): void {
    // The service is already initialized via APP_INITIALIZER
  }

  onRemoteChange(): void {
    this.selectedComponent = '';
    this.isComponentLoaded = false;
    this.availableComponents = [];

    if (this.selectedRemote) {
      this.microfrontendService.getRemote(this.selectedRemote).subscribe(remote => {
        if (remote) {
          // Filter for components that are enabled and of type 'component' or 'standalone'
          this.availableComponents = remote.exposedModules
            .filter(module => module.enabled && 
                   (module.type === 'component' || 
                    module.type === 'standalone' || 
                    module.type === 'module'))
            .map(module => ({
              name: module.name,
              type: module.type
            }));
          
          if (this.availableComponents.length === 0) {
            console.warn(`No available components found in remote ${this.selectedRemote}`);
          }
        } else {
          console.warn(`Remote ${this.selectedRemote} not found or not enabled`);
        }
      });
    }
  }

  loadComponent(): void {
    try {
      this.parsedProps = JSON.parse(this.componentProps);
      this.isComponentLoaded = true;
    } catch (error) {
      console.error('Invalid JSON for component props:', error);
      alert('Invalid JSON format for component properties. Please check your input.');
      this.isComponentLoaded = false;
    }
  }
} 