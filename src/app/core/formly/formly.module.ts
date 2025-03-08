import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule as NgxFormlyModule, FormlyFieldConfig, FormlyConfig } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyPanelWrapperComponent } from './wrappers/panel-wrapper.component';
import { FormlyErrorWrapperComponent } from './wrappers/error-wrapper.component';
import { FormlyFieldFileComponent } from './types/file-type.component';
import { FormlyDatepickerComponent } from './types/datepicker-type.component';
import { RulesService } from '../services/rules.service';

/**
 * Factory function to initialize Formly with validation messages from RulesService
 */
export function initFormlyValidationMessages(rulesService: RulesService, formlyConfig: FormlyConfig) {
  // This will be executed during app initialization
  return () => {
    return new Promise<void>((resolve) => {
      // Set custom validation messages from RulesService
      const requiredMessage = rulesService.getValidationMessage('required');
      if (requiredMessage) {
        formlyConfig.addValidatorMessage('required', requiredMessage);
      }
      
      const emailMessage = rulesService.getValidationMessage('email');
      if (emailMessage) {
        formlyConfig.addValidatorMessage('email', emailMessage);
      }
      
      const patternMessage = rulesService.getValidationMessage('pattern');
      if (patternMessage) {
        formlyConfig.addValidatorMessage('pattern', patternMessage);
      }
      
      const minLengthMessage = rulesService.getValidationMessage('minLength');
      if (minLengthMessage) {
        formlyConfig.addValidatorMessage('minLength', (error, field) => 
          minLengthMessage.replace('{minLength}', field.templateOptions?.minLength?.toString() || ''));
      }
      
      const maxLengthMessage = rulesService.getValidationMessage('maxLength');
      if (maxLengthMessage) {
        formlyConfig.addValidatorMessage('maxLength', (error, field) => 
          maxLengthMessage.replace('{maxLength}', field.templateOptions?.maxLength?.toString() || ''));
      }
      
      resolve();
    });
  };
}

@NgModule({
  declarations: [
    FormlyPanelWrapperComponent,
    FormlyErrorWrapperComponent,
    FormlyFieldFileComponent,
    FormlyDatepickerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyBootstrapModule,
    NgxFormlyModule.forRoot({
      wrappers: [
        { name: 'panel', component: FormlyPanelWrapperComponent },
        { name: 'error', component: FormlyErrorWrapperComponent }
      ],
      types: [
        { name: 'file', component: FormlyFieldFileComponent },
        { name: 'datepicker', component: FormlyDatepickerComponent }
      ],
      validators: [
        { name: 'email', validation: (control) => control.value ? { email: true } : null },
        { name: 'required', validation: (control) => control.value ? null : { required: true } },
        { name: 'minLength', validation: (control, field: FormlyFieldConfig) => 
          !control.value || control.value.length >= field.templateOptions?.minLength ? null : { minlength: true } },
        { name: 'maxLength', validation: (control, field: FormlyFieldConfig) => 
          !control.value || control.value.length <= field.templateOptions?.maxLength ? null : { maxlength: true } },
        { name: 'min', validation: (control, field: FormlyFieldConfig) => 
          !control.value || control.value >= field.templateOptions?.min ? null : { min: true } },
        { name: 'max', validation: (control, field: FormlyFieldConfig) => 
          !control.value || control.value <= field.templateOptions?.max ? null : { max: true } },
        { name: 'pattern', validation: (control, field: FormlyFieldConfig) => 
          !control.value || new RegExp(field.templateOptions?.pattern || '').test(control.value) ? null : { pattern: true } }
      ],
      validationMessages: [
        { name: 'required', message: 'This field is required' },
        { name: 'email', message: 'Invalid email address' },
        { name: 'pattern', message: 'Invalid format' },
        { name: 'minLength', message: 'Should have at least {minLength} characters' },
        { name: 'maxLength', message: 'Should have no more than {maxLength} characters' },
        { name: 'min', message: 'Should be greater than or equal to {min}' },
        { name: 'max', message: 'Should be less than or equal to {max}' }
      ]
    }),
    NgxFormlyModule.forChild({ extras: { lazyRender: true } })
  ],
  exports: [
    NgxFormlyModule,
    FormlyBootstrapModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initFormlyValidationMessages,
      deps: [RulesService, FormlyConfig],
      multi: true
    }
  ]
})
export class FormlyModule { } 