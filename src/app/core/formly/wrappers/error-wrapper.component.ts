import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-error-wrapper',
  template: `
    <div>
      <ng-container #fieldComponent></ng-container>
      <div class="invalid-feedback d-block" *ngIf="showError">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .invalid-feedback {
      display: block;
      width: 100%;
      margin-top: 0.25rem;
      font-size: 0.875em;
      color: #dc3545;
    }
  `]
})
export class FormlyErrorWrapperComponent extends FieldWrapper {
  get errorMessage() {
    const formControl = this.formControl;
    for (const error in formControl.errors) {
      if (formControl.errors.hasOwnProperty(error)) {
        return this.formControl.errors[error];
      }
    }
    return '';
  }
} 