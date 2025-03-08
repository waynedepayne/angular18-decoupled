import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { RulesService } from '../../core/services/rules.service';
import { FormDefinition, FormlyFieldConfig } from '../../core/models/rules.model';
import { FormlyModule as AppFormlyModule } from '../../core/formly/formly.module';

@Component({
  selector: 'app-rules-demo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyBootstrapModule,
    AppFormlyModule
  ],
  template: `
    <div class="rules-demo">
      <h2>Dynamic Forms Demo</h2>
      <p>This demo shows how to use the RulesService to create dynamic forms from JSON configuration.</p>
      
      <div class="form-selector mb-4">
        <h3>Select a Form</h3>
        <div class="btn-group" role="group">
          <button 
            *ngFor="let formName of formNames" 
            type="button" 
            class="btn" 
            [class.btn-primary]="selectedForm === formName"
            [class.btn-outline-primary]="selectedForm !== formName"
            (click)="selectForm(formName)">
            {{ formName }}
          </button>
        </div>
      </div>
      
      <div *ngIf="currentForm" class="dynamic-form-container">
        <div class="card">
          <div class="card-header">
            <h3>{{ currentForm.title }}</h3>
            <p *ngIf="currentForm.description">{{ currentForm.description }}</p>
          </div>
          <div class="card-body">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <formly-form [form]="form" [fields]="fields" [model]="model"></formly-form>
              
              <div class="form-buttons mt-4">
                <button type="submit" class="btn btn-primary me-2" [disabled]="!form.valid">
                  {{ currentForm.submitButton }}
                </button>
                <button type="button" class="btn btn-secondary" (click)="onCancel()">
                  {{ currentForm.cancelButton || 'Cancel' }}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div class="form-data mt-4" *ngIf="submitted">
          <div class="card">
            <div class="card-header">
              <h4>Form Data</h4>
            </div>
            <div class="card-body">
              <pre>{{ formData }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rules-demo {
      padding: 20px;
    }
    
    .form-selector {
      margin-bottom: 2rem;
    }
    
    .dynamic-form-container {
      max-width: 800px;
    }
    
    .form-buttons {
      display: flex;
      justify-content: flex-start;
      gap: 10px;
    }
    
    pre {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      overflow: auto;
    }
  `]
})
export class RulesDemoComponent implements OnInit {
  private rulesService = inject(RulesService);
  
  // Form properties
  form = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = [];
  
  // UI state
  formNames: string[] = [];
  selectedForm: string = '';
  currentForm: FormDefinition | null = null;
  submitted = false;
  formData = '';
  
  ngOnInit(): void {
    // Get all available form names
    this.formNames = this.rulesService.getFormNames();
    
    // Select the first form by default if available
    if (this.formNames.length > 0) {
      this.selectForm(this.formNames[0]);
    }
  }
  
  /**
   * Selects a form by name and loads its configuration
   * @param formName The name of the form to select
   */
  selectForm(formName: string): void {
    this.selectedForm = formName;
    this.currentForm = this.rulesService.getForm(formName);
    this.fields = this.rulesService.getFormFields(formName);
    
    // Reset the form
    this.form = new FormGroup({});
    this.model = {};
    this.submitted = false;
    this.formData = '';
  }
  
  /**
   * Handles form submission
   */
  onSubmit(): void {
    if (this.form.valid) {
      this.submitted = true;
      this.formData = JSON.stringify(this.model, null, 2);
      console.log('Form submitted:', this.model);
    } else {
      this.markFormGroupTouched(this.form);
    }
  }
  
  /**
   * Handles form cancellation
   */
  onCancel(): void {
    this.form.reset();
    this.model = {};
    this.submitted = false;
    this.formData = '';
  }
  
  /**
   * Marks all controls in a form group as touched
   * @param formGroup The form group to mark as touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
} 