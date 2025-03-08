import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from '../translate.pipe';
import { I18nService } from '../../../core/services/i18n.service';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let mockI18nService: jasmine.SpyObj<I18nService>;

  beforeEach(() => {
    mockI18nService = jasmine.createSpyObj('I18nService', ['translate']);
    
    TestBed.configureTestingModule({
      providers: [
        TranslatePipe,
        { provide: I18nService, useValue: mockI18nService }
      ]
    });
    
    pipe = TestBed.inject(TranslatePipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should call translate method of I18nService', () => {
    mockI18nService.translate.and.returnValue('Translated Text');
    
    const result = pipe.transform('test.key');
    
    expect(result).toBe('Translated Text');
    expect(mockI18nService.translate).toHaveBeenCalledWith('test.key', undefined);
  });

  it('should pass parameters to translate method', () => {
    mockI18nService.translate.and.returnValue('Hello John');
    
    const params = { name: 'John' };
    const result = pipe.transform('test.greeting', params);
    
    expect(result).toBe('Hello John');
    expect(mockI18nService.translate).toHaveBeenCalledWith('test.greeting', params);
  });

  it('should return empty string for empty key', () => {
    const result = pipe.transform('');
    
    expect(result).toBe('');
    expect(mockI18nService.translate).not.toHaveBeenCalled();
  });
}); 