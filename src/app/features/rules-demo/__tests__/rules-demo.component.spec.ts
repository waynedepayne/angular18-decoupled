import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RulesDemoComponent } from '../rules-demo.component';
import { RulesService } from '../../../core/services/rules.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyModule as AppFormlyModule } from '../../../core/formly/formly.module';
import { FormDefinition, FormlyFieldConfig } from '../../../core/models/rules.model';

describe('RulesDemoComponent', () => {
  let component: RulesDemoComponent;
  let fixture: ComponentFixture<RulesDemoComponent>;
  let rulesServiceSpy: jasmine.SpyObj<RulesService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('RulesService', [
      'getFormNames',
      'getForm',
      'getFormFields'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FormlyModule.forRoot(),
        AppFormlyModule
      ],
      declarations: [RulesDemoComponent],
      providers: [
        { provide: RulesService, useValue: spy }
      ]
    }).compileComponents();

    rulesServiceSpy = TestBed.inject(RulesService) as jasmine.SpyObj<RulesService>;
  });

  beforeEach(() => {
    // Mock the service responses
    rulesServiceSpy.getFormNames.and.returnValue(['userProfile', 'contactForm']);
    
    const mockForm: FormDefinition = {
      title: 'User Profile',
      description: 'Manage your personal information',
      submitButton: 'Save Profile',
      cancelButton: 'Cancel',
      fields: [
        {
          key: 'name',
          type: 'input',
          templateOptions: {
            label: 'Name',
            placeholder: 'Enter your name',
            required: true
          }
        }
      ]
    };
    
    rulesServiceSpy.getForm.and.returnValue(mockForm);
    rulesServiceSpy.getFormFields.and.returnValue(mockForm.fields);

    fixture = TestBed.createComponent(RulesDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load form names on init', () => {
    expect(rulesServiceSpy.getFormNames).toHaveBeenCalled();
    expect(component.formNames).toEqual(['userProfile', 'contactForm']);
  });

  it('should select the first form by default', () => {
    expect(rulesServiceSpy.getForm).toHaveBeenCalledWith('userProfile');
    expect(rulesServiceSpy.getFormFields).toHaveBeenCalledWith('userProfile');
    expect(component.selectedForm).toBe('userProfile');
    expect(component.currentForm).toBeDefined();
    expect(component.fields.length).toBeGreaterThan(0);
  });

  it('should select a form when clicked', () => {
    // Reset the spy call counts
    rulesServiceSpy.getForm.calls.reset();
    rulesServiceSpy.getFormFields.calls.reset();
    
    // Select a different form
    component.selectForm('contactForm');
    
    expect(rulesServiceSpy.getForm).toHaveBeenCalledWith('contactForm');
    expect(rulesServiceSpy.getFormFields).toHaveBeenCalledWith('contactForm');
    expect(component.selectedForm).toBe('contactForm');
  });

  it('should reset the form on cancel', () => {
    // Set up the form with some data
    component.model = { name: 'Test User' };
    component.submitted = true;
    component.formData = '{"name":"Test User"}';
    
    // Call cancel
    component.onCancel();
    
    expect(component.model).toEqual({});
    expect(component.submitted).toBeFalse();
    expect(component.formData).toBe('');
  });

  it('should mark form as touched when invalid on submit', () => {
    // Spy on the private method
    spyOn<any>(component, 'markFormGroupTouched');
    
    // Make the form invalid
    component.form.setErrors({ invalid: true });
    
    // Try to submit
    component.onSubmit();
    
    expect(component.submitted).toBeFalse();
    expect(component['markFormGroupTouched']).toHaveBeenCalledWith(component.form);
  });

  it('should submit the form when valid', () => {
    // Set up the form with some data
    component.model = { name: 'Test User' };
    
    // Make the form valid
    component.form.setErrors(null);
    
    // Submit the form
    component.onSubmit();
    
    expect(component.submitted).toBeTrue();
    expect(component.formData).toBe(JSON.stringify(component.model, null, 2));
  });
}); 