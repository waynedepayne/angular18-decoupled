import { TestBed } from '@angular/core/testing';
import { ValidationHandler } from '../validation-handler';
import { StateMachineContext } from '../../../models/logic.model';

describe('ValidationHandler', () => {
  let handler: ValidationHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ValidationHandler]
    });
    handler = TestBed.inject(ValidationHandler);
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  it('should validate required fields', async () => {
    const params = {
      fields: ['name', 'email'],
      message: 'Please fill in all required fields'
    };
    const context: StateMachineContext = {
      formData: {
        name: '',
        email: 'test@example.com'
      }
    };

    const result = await handler.execute(params, context);
    
    expect(result.valid).toBeFalse();
    expect(result.errors).toContain('name');
    expect(result.message).toBe('Please fill in all required fields');
  });

  it('should validate all fields are valid', async () => {
    const params = {
      fields: ['name', 'email'],
      message: 'Please fill in all required fields'
    };
    const context: StateMachineContext = {
      formData: {
        name: 'John Doe',
        email: 'test@example.com'
      }
    };

    const result = await handler.execute(params, context);
    
    expect(result.valid).toBeTrue();
    expect(result.errors).toEqual([]);
    expect(result.message).toBe('');
  });

  it('should validate email format', async () => {
    const params = {
      type: 'email',
      field: 'email',
      message: 'Please enter a valid email address'
    };
    const context: StateMachineContext = {
      formData: {
        email: 'invalid-email'
      }
    };

    const result = await handler.execute(params, context);
    
    expect(result.valid).toBeFalse();
    expect(result.errors).toContain('email');
    expect(result.message).toBe('Please enter a valid email address');
  });

  it('should validate numeric values', async () => {
    const params = {
      type: 'numeric',
      field: 'age',
      message: 'Age must be a number'
    };
    const context: StateMachineContext = {
      formData: {
        age: 'thirty'
      }
    };

    const result = await handler.execute(params, context);
    
    expect(result.valid).toBeFalse();
    expect(result.errors).toContain('age');
    expect(result.message).toBe('Age must be a number');
  });

  it('should validate minimum value', async () => {
    const params = {
      type: 'min',
      field: 'age',
      value: 18,
      message: 'You must be at least 18 years old'
    };
    const context: StateMachineContext = {
      formData: {
        age: 16
      }
    };

    const result = await handler.execute(params, context);
    
    expect(result.valid).toBeFalse();
    expect(result.errors).toContain('age');
    expect(result.message).toBe('You must be at least 18 years old');
  });

  it('should validate maximum value', async () => {
    const params = {
      type: 'max',
      field: 'age',
      value: 65,
      message: 'Age must be less than 65'
    };
    const context: StateMachineContext = {
      formData: {
        age: 70
      }
    };

    const result = await handler.execute(params, context);
    
    expect(result.valid).toBeFalse();
    expect(result.errors).toContain('age');
    expect(result.message).toBe('Age must be less than 65');
  });

  it('should validate string length', async () => {
    const params = {
      type: 'length',
      field: 'password',
      min: 8,
      message: 'Password must be at least 8 characters long'
    };
    const context: StateMachineContext = {
      formData: {
        password: 'pass'
      }
    };

    const result = await handler.execute(params, context);
    
    expect(result.valid).toBeFalse();
    expect(result.errors).toContain('password');
    expect(result.message).toBe('Password must be at least 8 characters long');
  });

  it('should validate pattern match', async () => {
    const params = {
      type: 'pattern',
      field: 'zipCode',
      pattern: '^\\d{5}$',
      message: 'Zip code must be 5 digits'
    };
    const context: StateMachineContext = {
      formData: {
        zipCode: 'ABC12'
      }
    };

    const result = await handler.execute(params, context);
    
    expect(result.valid).toBeFalse();
    expect(result.errors).toContain('zipCode');
    expect(result.message).toBe('Zip code must be 5 digits');
  });
}); 