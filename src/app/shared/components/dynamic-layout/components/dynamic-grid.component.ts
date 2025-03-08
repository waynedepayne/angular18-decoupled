import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Layout, LayoutComponent } from '../../../../core/models/design.model';
import { DynamicCardComponent } from './dynamic-card.component';

@Component({
  selector: 'app-dynamic-grid',
  standalone: true,
  imports: [CommonModule, DynamicCardComponent],
  template: `
    <div class="dynamic-grid" 
         [style.gridTemplateColumns]="getGridTemplateColumns()" 
         [style.gap]="layout.gap">
      <ng-container *ngFor="let component of layout.components">
        <app-dynamic-card [component]="component"></app-dynamic-card>
      </ng-container>
    </div>
  `,
  styles: [`
    .dynamic-grid {
      display: grid;
      width: 100%;
    }
  `]
})
export class DynamicGridComponent {
  @Input() layout!: Layout;
  
  getGridTemplateColumns(): string {
    if (!this.layout.columns) return 'repeat(1, 1fr)';
    return `repeat(${this.layout.columns}, 1fr)`;
  }
} 