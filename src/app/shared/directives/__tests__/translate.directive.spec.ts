import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateDirective } from '../translate.directive';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  template: `
    <p [appTranslate]="key"></p>
    <p [appTranslate]="keyWithParams" [translateParams]="params"></p>
  `
})
class TestComponent {
  key = 'test.key';
  keyWithParams = 'test.greeting';
  params = { name: 'John' };
}

describe('TranslateDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let mockI18nService: jasmine.SpyObj<I18nService>;
  let elements: DebugElement[];

  beforeEach(() => {
    mockI18nService = jasmine.createSpyObj('I18nService', ['translate']);
    
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [TranslateDirective],
      providers: [
        { provide: I18nService, useValue: mockI18nService }
      ]
    });
    
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    elements = fixture.debugElement.queryAll(By.directive(TranslateDirective));
  });

  it('should create an instance', () => {
    const directive = elements[0].injector.get(TranslateDirective);
    expect(directive).toBeTruthy();
  });

  it('should call translate method of I18nService and update element text content', () => {
    mockI18nService.translate.and.returnValue('Translated Text');
    
    fixture.detectChanges();
    
    expect(elements[0].nativeElement.textContent).toBe('Translated Text');
    expect(mockI18nService.translate).toHaveBeenCalledWith('test.key', {});
  });

  it('should pass parameters to translate method', () => {
    mockI18nService.translate.and.returnValues('Translated Text', 'Hello John');
    
    fixture.detectChanges();
    
    expect(elements[1].nativeElement.textContent).toBe('Hello John');
    expect(mockI18nService.translate).toHaveBeenCalledWith('test.greeting', { name: 'John' });
  });

  it('should update translation when key changes', () => {
    mockI18nService.translate.and.returnValue('Translated Text');
    
    fixture.detectChanges();
    
    component.key = 'test.newKey';
    mockI18nService.translate.and.returnValue('New Translated Text');
    
    fixture.detectChanges();
    
    expect(elements[0].nativeElement.textContent).toBe('New Translated Text');
    expect(mockI18nService.translate).toHaveBeenCalledWith('test.newKey', {});
  });

  it('should update translation when params change', () => {
    mockI18nService.translate.and.returnValues('Translated Text', 'Hello John');
    
    fixture.detectChanges();
    
    component.params = { name: 'Jane' };
    mockI18nService.translate.and.returnValue('Hello Jane');
    
    fixture.detectChanges();
    
    expect(elements[1].nativeElement.textContent).toBe('Hello Jane');
    expect(mockI18nService.translate).toHaveBeenCalledWith('test.greeting', { name: 'Jane' });
  });
}); 