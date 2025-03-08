import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../../../core/models/design.model';

@Component({
  selector: 'app-dynamic-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dynamic-card" [style.gridArea]="component.gridArea">
      <div class="card-header" *ngIf="component.title">
        <h3 class="card-title">{{ component.title }}</h3>
      </div>
      <div class="card-content">
        <!-- This would be expanded to handle different content types -->
        <ng-container [ngSwitch]="component.content?.type">
          <div *ngSwitchCase="'status-widget'" class="status-widget">
            Status Widget Placeholder
          </div>
          <div *ngSwitchCase="'action-buttons'" class="action-buttons">
            Action Buttons Placeholder
          </div>
          <div *ngSwitchCase="'activity-feed'" class="activity-feed">
            Activity Feed Placeholder
          </div>
          <div *ngSwitchCase="'chart'" class="chart">
            Chart Placeholder ({{ component.content?.chartType }})
          </div>
          <div *ngSwitchDefault>
            {{ component.content | json }}
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .dynamic-card {
      background-color: white;
      border-radius: var(--border-radius-medium, 8px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin-bottom: var(--spacing-md, 16px);
    }
    
    .card-header {
      padding: var(--spacing-md, 16px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    
    .card-title {
      margin: 0;
      font-size: var(--font-size-large, 1.25rem);
      font-weight: 500;
      color: var(--text-primary-color, rgba(0, 0, 0, 0.87));
    }
    
    .card-content {
      padding: var(--spacing-md, 16px);
      color: var(--text-primary-color, rgba(0, 0, 0, 0.87));
    }
    
    /* Placeholder styles for content types */
    .status-widget, .action-buttons, .activity-feed, .chart {
      min-height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.04);
      border-radius: var(--border-radius-small, 4px);
      color: var(--text-secondary-color, rgba(0, 0, 0, 0.6));
    }
  `]
})
export class DynamicCardComponent {
  @Input() component!: LayoutComponent;
} 