import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Layout, LayoutComponent } from '../../../../core/models/design.model';
import { DynamicCardComponent } from './dynamic-card.component';

@Component({
  selector: 'app-dynamic-flex',
  standalone: true,
  imports: [CommonModule, DynamicCardComponent],
  template: `
    <div class="dynamic-flex" 
         [class.dynamic-flex-row]="layout.direction === 'row'"
         [style.flexDirection]="layout.direction || 'column'" 
         [style.gap]="layout.gap">
      <ng-container *ngFor="let component of layout.components">
        <app-dynamic-card [component]="component"></app-dynamic-card>
      </ng-container>
    </div>
  `,
  styles: [`
    .dynamic-flex {
      display: flex;
      width: 100%;
    }
    
    .dynamic-flex-row > * {
      flex: 1;
    }
  `]
})
export class DynamicFlexComponent {
  @Input() layout!: Layout;
} 