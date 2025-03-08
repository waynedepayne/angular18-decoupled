/**
 * @fileoverview RulesService is responsible for loading and providing access to the application's
 * form definitions and validation rules from rules.json. It integrates with Formly to generate
 * dynamic forms at runtime.
 * 
 * JSON Source: assets/rules.json
 * 
 * Data Structure:
 * - forms: Collection of form definitions
 *   - [formName]: Form definition object
 *     - title: Form title
 *     - description: Form description
 *     - fields: Array of Formly field configurations
 * - validations: Validation rules
 *   - patterns: Regular expression patterns for validation
 *   - messages: Validation error messages
 * - wrappers: Custom Formly field wrappers
 * 
 * Transformation Logic:
 * - JSON is loaded at application startup via APP_INITIALIZER
 * - Form definitions are transformed into Formly field configurations
 * - Validation patterns and messages are applied to form fields
 * - Custom wrappers can be applied to form fields
 */
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { RulesModel, FormDefinition, FormlyFieldConfig } from '../models/rules.model';

@Injectable({
  providedIn: 'root'
})
export class RulesService {
  private rulesConfigSignal = signal<RulesModel | null>(null);
  
  // Public signals for components to consume
  public readonly rulesConfig = this.rulesConfigSignal.asReadonly();
  
  constructor(private http: HttpClient) {}

  /**
   * Loads the rules configuration from the JSON file
   * Used by APP_INITIALIZER to load rules at startup
   * 
   * @returns Observable<RulesModel> - The loaded rules configuration or default values
   */
  loadRulesConfig(): Observable<RulesModel> {
    return this.http.get<RulesModel>('assets/rules.json').pipe(
      tap(config => {
        console.log('Rules config loaded successfully');
        this.rulesConfigSignal.set(config);
      }),
      catchError(error => {
        console.error('Error loading rules config:', error);
        const defaultConfig = this.getDefaultRulesConfig();
        this.rulesConfigSignal.set(defaultConfig);
        return of(defaultConfig);
      })
    );
  }

  /**
   * Gets a form definition by name
   * 
   * @param formName - The name of the form to get
   * @returns FormDefinition | null - The form definition or null if not found
   */
  getForm(formName: string): FormDefinition | null {
    const config = this.rulesConfigSignal();
    return config?.forms[formName] || null;
  }

  /**
   * Gets all available form names
   * 
   * @returns string[] - An array of form names
   */
  getFormNames(): string[] {
    const config = this.rulesConfigSignal();
    return config ? Object.keys(config.forms) : [];
  }

  /**
   * Gets Formly field configurations for a form
   * Processes the fields to apply validation patterns and messages
   * 
   * @param formName - The name of the form to get fields for
   * @returns FormlyFieldConfig[] - Array of Formly field configurations
   */
  getFormFields(formName: string): FormlyFieldConfig[] {
    const form = this.getForm(formName);
    if (!form) return [];
    
    // Process fields to apply validation patterns and messages
    return form.fields.map(field => this.processField(field));
  }

  /**
   * Processes a field to apply validation patterns and messages
   * 
   * @param field - The field to process
   * @returns FormlyFieldConfig - The processed field
   */
  private processField(field: FormlyFieldConfig): FormlyFieldConfig {
    // Deep clone the field to avoid modifying the original
    const processedField = JSON.parse(JSON.stringify(field));
    
    // Apply validation patterns to templateOptions
    if (processedField.templateOptions && processedField.templateOptions.pattern) {
      const patternName = processedField.templateOptions.pattern;
      const pattern = this.getValidationPattern(patternName);
      if (pattern) {
        processedField.templateOptions.pattern = pattern;
      }
    }
    
    // Apply custom wrappers - DO NOT replace wrapper names with templates
    // Just keep the wrapper names as they are - Formly will look them up by name
    // No need to modify this section as wrappers should remain as names
    
    // Process nested fields recursively
    if (processedField.fieldGroup && Array.isArray(processedField.fieldGroup)) {
      processedField.fieldGroup = processedField.fieldGroup.map(nestedField => 
        this.processField(nestedField)
      );
    }
    
    return processedField;
  }

  /**
   * Gets a validation pattern by name
   * 
   * @param patternName - The name of the pattern
   * @returns string | null - The pattern or null if not found
   */
  getValidationPattern(patternName: string): string | null {
    const config = this.rulesConfigSignal();
    return config?.validations.patterns[patternName] || null;
  }

  /**
   * Gets a validation message by key
   * 
   * @param messageKey - The key of the message
   * @returns string | null - The message or null if not found
   */
  getValidationMessage(messageKey: string): string | null {
    const config = this.rulesConfigSignal();
    return config?.validations.messages[messageKey] || null;
  }

  /**
   * Gets a wrapper definition by name
   * @param wrapperName The name of the wrapper
   * @returns The wrapper name itself, not the template
   */
  getWrapper(wrapperName: string): string {
    // Always return the wrapper name as is - don't return the template
    return wrapperName;
  }

  /**
   * Provides a default rules configuration in case the JSON file cannot be loaded
   * @returns A default rules configuration
   */
  private getDefaultRulesConfig(): RulesModel {
    return {
      forms: {
        default: {
          title: 'Default Form',
          description: 'This is a default form',
          submitButton: 'Submit',
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
            },
            {
              key: 'email',
              type: 'input',
              templateOptions: {
                type: 'email',
                label: 'Email',
                placeholder: 'Enter your email',
                required: true
              }
            }
          ]
        }
      },
      validations: {
        patterns: {
          email: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'
        },
        messages: {
          required: '{0} is required'
        }
      },
      wrappers: {
        panel: {
          template: '<div class="card"><div class="card-body"><ng-container #fieldComponent></ng-container></div></div>'
        }
      }
    };
  }
} 