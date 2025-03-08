import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterLayout } from '../../../../core/models/design.model';

@Component({
  selector: 'app-dynamic-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="dynamic-footer" [style.height]="footer.height">
      <ng-container *ngFor="let component of footer.components">
        <!-- Text component -->
        <div *ngIf="component.type === 'text'" 
             class="footer-component text" 
             [class.left]="component.position === 'left'"
             [class.center]="component.position === 'center'"
             [class.right]="component.position === 'right'">
          {{ component.content }}
        </div>
      </ng-container>
    </footer>
  `,
  styles: [`
    .dynamic-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--spacing-md, 16px);
      background-color: var(--surface-color, #f5f5f5);
      color: var(--text-secondary-color, rgba(0, 0, 0, 0.6));
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }
    
    .footer-component {
      display: flex;
      align-items: center;
    }
    
    .footer-component.left {
      margin-right: auto;
    }
    
    .footer-component.center {
      margin: 0 auto;
    }
    
    .footer-component.right {
      margin-left: auto;
    }
  `]
})
export class DynamicFooterComponent {
  @Input() footer!: FooterLayout;
} 