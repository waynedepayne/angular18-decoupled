import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-panel-wrapper',
  template: `
    <div class="card mb-3">
      <div class="card-header">{{ to.label }}</div>
      <div class="card-body">
        <ng-container #fieldComponent></ng-container>
      </div>
    </div>
  `,
  styles: [`
    .card {
      margin-bottom: 1rem;
    }
    .card-header {
      background-color: #f8f9fa;
      font-weight: 500;
    }
  `]
})
export class FormlyPanelWrapperComponent extends FieldWrapper {
} 