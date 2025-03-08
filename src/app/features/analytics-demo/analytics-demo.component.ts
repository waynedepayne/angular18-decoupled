import { Component, OnInit, inject, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../core/services/analytics.service';
import { AnalyticsModel, AnalyticsProvider } from '../../core/models/analytics.model';

@Component({
  selector: 'app-analytics-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="analytics-demo">
      <h2>Analytics Demo</h2>
      <p>This demo shows how to use the AnalyticsService to track events and user interactions.</p>
      
      <div class="card mb-4">
        <div class="card-header">
          <h3>Analytics Configuration</h3>
        </div>
        <div class="card-body">
          <div *ngIf="analyticsConfig; else loading">
            <div class="mb-3">
              <strong>Status:</strong> 
              <span [class]="analyticsConfig.analyticsEnabled ? 'text-success' : 'text-danger'">
                {{ analyticsConfig.analyticsEnabled ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
            
            <div class="mb-3">
              <strong>Version:</strong> {{ analyticsConfig.version }}
            </div>
            
            <div class="mb-3">
              <strong>Last Updated:</strong> {{ analyticsConfig.lastUpdated | date:'medium' }}
            </div>
            
            <div class="mb-3">
              <strong>Debug Mode:</strong> {{ analyticsConfig.debugMode ? 'Enabled' : 'Disabled' }}
            </div>
            
            <div class="mb-3">
              <strong>Providers:</strong>
              <ul class="list-group mt-2">
                <li class="list-group-item" *ngFor="let provider of analyticsConfig.providers">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{{ provider.name }}</strong>
                      <span class="badge" [class]="provider.enabled ? 'bg-success' : 'bg-secondary'">
                        {{ provider.enabled ? 'Enabled' : 'Disabled' }}
                      </span>
                    </div>
                    <div>
                      <span *ngIf="provider.trackingId">ID: {{ provider.trackingId }}</span>
                      <span *ngIf="provider.token">Token: {{ provider.token }}</span>
                      <span *ngIf="provider.endpoint">Endpoint: {{ provider.endpoint }}</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <ng-template #loading>
            <p>Loading analytics configuration...</p>
          </ng-template>
        </div>
      </div>
      
      <div class="card mb-4">
        <div class="card-header">
          <h3>Track Events</h3>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="card">
                <div class="card-header">Button Click</div>
                <div class="card-body">
                  <div class="mb-3">
                    <label for="buttonId" class="form-label">Button ID</label>
                    <input type="text" class="form-control" id="buttonId" [(ngModel)]="buttonId">
                  </div>
                  <div class="mb-3">
                    <label for="buttonText" class="form-label">Button Text</label>
                    <input type="text" class="form-control" id="buttonText" [(ngModel)]="buttonText">
                  </div>
                  <button class="btn btn-primary" (click)="trackButtonClick()">
                    Track Button Click
                  </button>
                </div>
              </div>
            </div>
            
            <div class="col-md-6 mb-3">
              <div class="card">
                <div class="card-header">Form Submit</div>
                <div class="card-body">
                  <div class="mb-3">
                    <label for="formId" class="form-label">Form ID</label>
                    <input type="text" class="form-control" id="formId" [(ngModel)]="formId">
                  </div>
                  <div class="mb-3">
                    <label for="formName" class="form-label">Form Name</label>
                    <input type="text" class="form-control" id="formName" [(ngModel)]="formName">
                  </div>
                  <button class="btn btn-primary" (click)="trackFormSubmit()">
                    Track Form Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="card">
                <div class="card-header">Error</div>
                <div class="card-body">
                  <div class="mb-3">
                    <label for="errorMessage" class="form-label">Error Message</label>
                    <input type="text" class="form-control" id="errorMessage" [(ngModel)]="errorMessage">
                  </div>
                  <div class="mb-3">
                    <label for="errorType" class="form-label">Error Type</label>
                    <input type="text" class="form-control" id="errorType" [(ngModel)]="errorType">
                  </div>
                  <button class="btn btn-primary" (click)="trackError()">
                    Track Error
                  </button>
                </div>
              </div>
            </div>
            
            <div class="col-md-6 mb-3">
              <div class="card">
                <div class="card-header">Performance</div>
                <div class="card-body">
                  <div class="mb-3">
                    <label for="metricName" class="form-label">Metric Name</label>
                    <input type="text" class="form-control" id="metricName" [(ngModel)]="metricName">
                  </div>
                  <div class="mb-3">
                    <label for="metricValue" class="form-label">Metric Value</label>
                    <input type="number" class="form-control" id="metricValue" [(ngModel)]="metricValue">
                  </div>
                  <button class="btn btn-primary" (click)="trackPerformance()">
                    Track Performance
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="card">
                <div class="card-header">Custom Event</div>
                <div class="card-body">
                  <div class="mb-3">
                    <label for="customEventName" class="form-label">Event Name</label>
                    <input type="text" class="form-control" id="customEventName" [(ngModel)]="customEventName">
                  </div>
                  <div class="mb-3">
                    <label for="customEventProperties" class="form-label">Event Properties (JSON)</label>
                    <textarea class="form-control" id="customEventProperties" rows="3" [(ngModel)]="customEventProperties"></textarea>
                  </div>
                  <button class="btn btn-primary" (click)="trackCustomEvent()">
                    Track Custom Event
                  </button>
                </div>
              </div>
            </div>
            
            <div class="col-md-6 mb-3">
              <div class="card">
                <div class="card-header">Identify User</div>
                <div class="card-body">
                  <div class="mb-3">
                    <label for="userId" class="form-label">User ID</label>
                    <input type="text" class="form-control" id="userId" [(ngModel)]="userId">
                  </div>
                  <div class="mb-3">
                    <label for="userTraits" class="form-label">User Traits (JSON)</label>
                    <textarea class="form-control" id="userTraits" rows="3" [(ngModel)]="userTraits"></textarea>
                  </div>
                  <button class="btn btn-primary" (click)="identifyUser()">
                    Identify User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card mb-4">
        <div class="card-header">
          <h3>Event Log</h3>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <button class="btn btn-secondary" (click)="clearEventLog()">Clear Log</button>
          </div>
          <div class="event-log">
            <div *ngFor="let event of eventLog" class="event-log-item">
              <div class="event-log-timestamp">{{ event.timestamp | date:'medium' }}</div>
              <div class="event-log-type">{{ event.type }}</div>
              <div class="event-log-data">{{ event.data | json }}</div>
            </div>
            <div *ngIf="eventLog.length === 0" class="text-muted">
              No events logged yet. Try tracking an event above.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-demo {
      padding: 20px;
    }
    
    .event-log {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px;
    }
    
    .event-log-item {
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    
    .event-log-item:last-child {
      border-bottom: none;
    }
    
    .event-log-timestamp {
      font-size: 0.8rem;
      color: #666;
    }
    
    .event-log-type {
      font-weight: bold;
      margin: 5px 0;
    }
    
    .event-log-data {
      font-family: monospace;
      background-color: #f8f9fa;
      padding: 5px;
      border-radius: 4px;
      white-space: pre-wrap;
    }
  `]
})
export class AnalyticsDemoComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private isBrowser: boolean;
  
  // Analytics configuration
  analyticsConfig: AnalyticsModel | null = null;
  
  // Event tracking form fields
  buttonId: string = 'demo-button-1';
  buttonText: string = 'Demo Button';
  
  formId: string = 'demo-form-1';
  formName: string = 'Demo Form';
  
  errorMessage: string = 'Something went wrong';
  errorType: string = 'Error';
  
  metricName: string = 'page-load-time';
  metricValue: number = 1200;
  
  customEventName: string = 'custom-event';
  customEventProperties: string = '{\n  "property1": "value1",\n  "property2": "value2"\n}';
  
  userId: string = 'user-123';
  userTraits: string = '{\n  "userRole": "admin",\n  "userPreferences": {\n    "theme": "dark"\n  }\n}';
  
  // Event log
  eventLog: Array<{
    timestamp: Date;
    type: string;
    data: any;
  }> = [];
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
  
  ngOnInit(): void {
    // Get analytics configuration
    this.analyticsConfig = this.analyticsService.analyticsConfig();
    
    // Log page view (this is automatically tracked by the service)
    if (this.isBrowser) {
      this.logEvent('pageView', {
        pagePath: window.location.pathname,
        pageTitle: document.title
      });
    }
  }
  
  trackButtonClick(): void {
    this.analyticsService.trackButtonClick(this.buttonId, this.buttonText);
    this.logEvent('buttonClick', {
      buttonId: this.buttonId,
      buttonText: this.buttonText
    });
  }
  
  trackFormSubmit(): void {
    this.analyticsService.trackFormSubmit(this.formId, this.formName);
    this.logEvent('formSubmit', {
      formId: this.formId,
      formName: this.formName
    });
  }
  
  trackError(): void {
    this.analyticsService.trackError(this.errorMessage, this.errorType);
    this.logEvent('error', {
      errorMessage: this.errorMessage,
      errorType: this.errorType
    });
  }
  
  trackPerformance(): void {
    this.analyticsService.trackPerformance(this.metricName, this.metricValue);
    this.logEvent('performance', {
      metricName: this.metricName,
      metricValue: this.metricValue
    });
  }
  
  trackCustomEvent(): void {
    try {
      const properties = JSON.parse(this.customEventProperties);
      this.analyticsService.trackCustomEvent(this.customEventName, properties);
      this.logEvent('customEvent', {
        eventName: this.customEventName,
        properties
      });
    } catch (error) {
      alert('Invalid JSON for event properties');
    }
  }
  
  identifyUser(): void {
    try {
      const traits = JSON.parse(this.userTraits);
      this.analyticsService.identifyUser(this.userId, traits);
      this.logEvent('identifyUser', {
        userId: this.userId,
        traits
      });
    } catch (error) {
      alert('Invalid JSON for user traits');
    }
  }
  
  clearEventLog(): void {
    this.eventLog = [];
  }
  
  private logEvent(type: string, data: any): void {
    this.eventLog.unshift({
      timestamp: new Date(),
      type,
      data
    });
  }
} 