export interface RulesModel {
  forms: {
    [key: string]: FormDefinition;
  };
  validations: ValidationDefinitions;
  wrappers: {
    [key: string]: WrapperDefinition;
  };
}

export interface FormDefinition {
  title: string;
  description?: string;
  submitButton: string;
  cancelButton?: string;
  fields: FormlyFieldConfig[];
}

export interface FormlyFieldConfig {
  key?: string;
  type?: string;
  className?: string;
  wrappers?: string[];
  templateOptions?: TemplateOptions;
  defaultValue?: any;
  validation?: ValidationConfig;
  expressionProperties?: {
    [key: string]: string | Function;
  };
  hideExpression?: string | Function | boolean;
  fieldGroup?: FormlyFieldConfig[];
  fieldArray?: FormlyFieldConfig;
}

export interface TemplateOptions {
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  options?: SelectOption[];
  rows?: number;
  cols?: number;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  type?: string;
  multiple?: boolean;
  accept?: string;
  [key: string]: any;
}

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  group?: string;
}

export interface ValidationConfig {
  messages?: {
    [key: string]: string;
  };
  validators?: {
    [key: string]: {
      expression: (formControl: any, field: FormlyFieldConfig) => boolean;
      message: string | ((error: any, field: FormlyFieldConfig) => string);
    };
  };
}

export interface ValidationDefinitions {
  patterns: {
    [key: string]: string;
  };
  messages: {
    [key: string]: string;
  };
}

export interface WrapperDefinition {
  template: string;
} 