import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-field-datepicker',
  template: `
    <div class="mb-3">
      <label [for]="id" class="form-label">{{ to.label }}</label>
      <input
        [id]="id"
        type="date"
        class="form-control"
        [formControl]="formControl"
        [formlyAttributes]="field"
        [min]="to.min ? formatDate(to.min) : null"
        [max]="to.max ? formatDate(to.max) : null"
        [placeholder]="to.placeholder"
      />
      <small *ngIf="to.description" class="form-text text-muted">{{ to.description }}</small>
    </div>
  `
})
export class FormlyDatepickerComponent extends FieldType {
  formatDate(date: Date | string | number): string {
    if (typeof date === 'string') {
      return date;
    }
    
    if (typeof date === 'number') {
      // If it's a timestamp, convert to Date
      return this.formatDate(new Date(date));
    }
    
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }
} 