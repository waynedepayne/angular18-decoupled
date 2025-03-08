import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-field-file',
  template: `
    <div class="mb-3">
      <label [for]="id" class="form-label">{{ to.label }}</label>
      <input
        [id]="id"
        type="file"
        class="form-control"
        [formControl]="formControl"
        [formlyAttributes]="field"
        [multiple]="to.multiple"
        [accept]="to.accept"
        (change)="onChange($event)"
      />
      <small *ngIf="to.description" class="form-text text-muted">{{ to.description }}</small>
    </div>
  `
})
export class FormlyFieldFileComponent extends FieldType {
  onChange(event: any) {
    const files = event.target.files;
    this.formControl.setValue(files);
  }
} 