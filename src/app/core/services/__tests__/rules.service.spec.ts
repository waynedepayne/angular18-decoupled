import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RulesService } from '../rules.service';
import { RulesModel } from '../../models/rules.model';

describe('RulesService', () => {
  let service: RulesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RulesService]
    });
    service = TestBed.inject(RulesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load rules configuration from assets/rules.json', () => {
    const mockRulesConfig: RulesModel = {
      forms: {
        testForm: {
          title: 'Test Form',
          description: 'Test form description',
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

    service.loadRulesConfig().subscribe(config => {
      expect(config).toEqual(mockRulesConfig);
      expect(service.rulesConfig()).toEqual(mockRulesConfig);
    });

    const req = httpMock.expectOne('assets/rules.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockRulesConfig);
  });

  it('should get a form by name', () => {
    const mockForm = {
      title: 'Test Form',
      description: 'Test form description',
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
        }
      ]
    };

    // Set the rules config
    service['rulesConfigSignal'].set({
      forms: {
        testForm: mockForm
      },
      validations: {
        patterns: {},
        messages: {}
      },
      wrappers: {}
    });

    const result = service.getForm('testForm');
    expect(result).toEqual(mockForm);
  });

  it('should get form names', () => {
    // Set the rules config
    service['rulesConfigSignal'].set({
      forms: {
        form1: {
          title: 'Form 1',
          submitButton: 'Submit',
          fields: []
        },
        form2: {
          title: 'Form 2',
          submitButton: 'Submit',
          fields: []
        }
      },
      validations: {
        patterns: {},
        messages: {}
      },
      wrappers: {}
    });

    const formNames = service.getFormNames();
    expect(formNames).toEqual(['form1', 'form2']);
  });

  it('should get form fields', () => {
    const mockFields = [
      {
        key: 'name',
        type: 'input',
        templateOptions: {
          label: 'Name',
          placeholder: 'Enter your name',
          required: true
        }
      }
    ];

    // Set the rules config
    service['rulesConfigSignal'].set({
      forms: {
        testForm: {
          title: 'Test Form',
          submitButton: 'Submit',
          fields: mockFields
        }
      },
      validations: {
        patterns: {},
        messages: {}
      },
      wrappers: {}
    });

    const fields = service.getFormFields('testForm');
    expect(fields).toEqual(mockFields);
  });

  it('should get a validation pattern', () => {
    // Set the rules config
    service['rulesConfigSignal'].set({
      forms: {},
      validations: {
        patterns: {
          email: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'
        },
        messages: {}
      },
      wrappers: {}
    });

    const pattern = service.getValidationPattern('email');
    expect(pattern).toBe('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$');
  });

  it('should get a validation message', () => {
    // Set the rules config
    service['rulesConfigSignal'].set({
      forms: {},
      validations: {
        patterns: {},
        messages: {
          required: '{0} is required'
        }
      },
      wrappers: {}
    });

    const message = service.getValidationMessage('required');
    expect(message).toBe('{0} is required');
  });

  it('should get a wrapper template', () => {
    const template = '<div class="card"><div class="card-body"><ng-container #fieldComponent></ng-container></div></div>';
    
    // Set the rules config
    service['rulesConfigSignal'].set({
      forms: {},
      validations: {
        patterns: {},
        messages: {}
      },
      wrappers: {
        panel: {
          template: template
        }
      }
    });

    const result = service.getWrapper('panel');
    expect(result).toBe(template);
  });

  it('should return null for non-existent form', () => {
    // Set the rules config
    service['rulesConfigSignal'].set({
      forms: {
        testForm: {
          title: 'Test Form',
          submitButton: 'Submit',
          fields: []
        }
      },
      validations: {
        patterns: {},
        messages: {}
      },
      wrappers: {}
    });

    const result = service.getForm('nonExistentForm');
    expect(result).toBeNull();
  });

  it('should return empty array for non-existent form fields', () => {
    // Set the rules config
    service['rulesConfigSignal'].set({
      forms: {},
      validations: {
        patterns: {},
        messages: {}
      },
      wrappers: {}
    });

    const fields = service.getFormFields('nonExistentForm');
    expect(fields).toEqual([]);
  });

  it('should return null for non-existent validation pattern', () => {
    // Set the rules config
    service['rulesConfigSignal'].set({
      forms: {},
      validations: {
        patterns: {},
        messages: {}
      },
      wrappers: {}
    });

    const pattern = service.getValidationPattern('nonExistentPattern');
    expect(pattern).toBeNull();
  });

  it('should return null for non-existent validation message', () => {
    // Set the rules config
    service['rulesConfigSignal'].set({
      forms: {},
      validations: {
        patterns: {},
        messages: {}
      },
      wrappers: {}
    });

    const message = service.getValidationMessage('nonExistentMessage');
    expect(message).toBeNull();
  });

  it('should return null for non-existent wrapper', () => {
    // Set the rules config
    service['rulesConfigSignal'].set({
      forms: {},
      validations: {
        patterns: {},
        messages: {}
      },
      wrappers: {}
    });

    const wrapper = service.getWrapper('nonExistentWrapper');
    expect(wrapper).toBeNull();
  });

  it('should use default config if loading fails', () => {
    service.loadRulesConfig().subscribe(config => {
      expect(config).toBeDefined();
      expect(config.forms).toBeDefined();
      expect(config.validations).toBeDefined();
      expect(config.wrappers).toBeDefined();
    });

    const req = httpMock.expectOne('assets/rules.json');
    req.error(new ErrorEvent('Network error'));
  });

  it('should process fields with validation patterns', () => {
    const mockRules = {
      forms: {
        'registration': {
          title: 'Registration Form',
          description: 'Create a new account',
          fields: [
            {
              key: 'email',
              type: 'input',
              templateOptions: {
                label: 'Email',
                required: true,
                pattern: 'emailPattern'
              }
            }
          ]
        }
      },
      validations: {
        patterns: {
          'emailPattern': '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        messages: {}
      },
      wrappers: {}
    };
    
    service.loadRulesConfig().subscribe();
    const req = httpMock.expectOne('assets/rules.json');
    req.flush(mockRules);
    
    const fields = service.getFormFields('registration');
    expect(fields.length).toBe(1);
    expect(fields[0].key).toBe('email');
    expect(fields[0].templateOptions?.pattern).toBe('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
  });
  
  it('should process fields with custom wrappers', () => {
    const mockRules = {
      forms: {
        'contact': {
          title: 'Contact Form',
          description: 'Send us a message',
          fields: [
            {
              key: 'message',
              type: 'textarea',
              wrappers: ['panel'],
              templateOptions: {
                label: 'Message'
              }
            }
          ]
        }
      },
      validations: {
        patterns: {},
        messages: {}
      },
      wrappers: {
        'panel': 'panel'
      }
    };
    
    service.loadRulesConfig().subscribe();
    const req = httpMock.expectOne('assets/rules.json');
    req.flush(mockRules);
    
    const fields = service.getFormFields('contact');
    expect(fields.length).toBe(1);
    expect(fields[0].key).toBe('message');
    expect(fields[0].wrappers).toContain('panel');
  });
  
  it('should process nested field groups recursively', () => {
    const mockRules = {
      forms: {
        'address': {
          title: 'Address Form',
          description: 'Enter your address',
          fields: [
            {
              key: 'address',
              fieldGroup: [
                {
                  key: 'street',
                  type: 'input',
                  templateOptions: {
                    label: 'Street',
                    pattern: 'streetPattern'
                  }
                },
                {
                  key: 'city',
                  type: 'input',
                  templateOptions: {
                    label: 'City'
                  }
                }
              ]
            }
          ]
        }
      },
      validations: {
        patterns: {
          'streetPattern': '^[0-9]+ [a-zA-Z ]+$'
        },
        messages: {}
      },
      wrappers: {}
    };
    
    service.loadRulesConfig().subscribe();
    const req = httpMock.expectOne('assets/rules.json');
    req.flush(mockRules);
    
    const fields = service.getFormFields('address');
    expect(fields.length).toBe(1);
    expect(fields[0].fieldGroup?.length).toBe(2);
    expect(fields[0].fieldGroup?.[0].key).toBe('street');
    expect(fields[0].fieldGroup?.[0].templateOptions?.pattern).toBe('^[0-9]+ [a-zA-Z ]+$');
  });
  
  it('should handle non-existent forms gracefully', () => {
    const mockRules = {
      forms: {},
      validations: {
        patterns: {},
        messages: {}
      },
      wrappers: {}
    };
    
    service.loadRulesConfig().subscribe();
    const req = httpMock.expectOne('assets/rules.json');
    req.flush(mockRules);
    
    const fields = service.getFormFields('nonexistent');
    expect(fields).toEqual([]);
  });
}); 