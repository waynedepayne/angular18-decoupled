import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ThemeDirective } from '../theme.directive';
import { ThemingService } from '../../../core/services/theming.service';
import { of } from 'rxjs';

@Component({
  template: `
    <div id="default" appTheme>Default theme</div>
    <div id="light" appTheme="light">Light theme</div>
    <div id="dark" appTheme="dark">Dark theme</div>
    <div id="inverted" [appTheme]="null" [themeInvert]="true">Inverted theme</div>
    <div id="container" [appTheme]="'brand'" [themeContainer]="true">Container theme</div>
    <div id="variant" [appTheme]="'light'" [themeVariant]="'primary'">Variant theme</div>
  `
})
class TestComponent {}

describe('ThemeDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let themingServiceMock: jasmine.SpyObj<ThemingService>;
  
  beforeEach(() => {
    // Create a mock ThemingService
    themingServiceMock = jasmine.createSpyObj('ThemingService', [
      'activeTheme',
      'isDarkTheme',
      'availableThemes'
    ]);
    
    // Set up default return values
    themingServiceMock.isDarkTheme.and.returnValue(false);
    themingServiceMock.activeTheme.and.returnValue({
      name: 'Light',
      isDark: false,
      variables: {
        '--color-primary': '#3f51b5',
        '--color-background': '#ffffff'
      }
    });
    
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [ThemeDirective],
      providers: [
        { provide: ThemingService, useValue: themingServiceMock }
      ]
    });
    
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should create an instance', () => {
    const directive = fixture.debugElement.query(By.directive(ThemeDirective));
    expect(directive).not.toBeNull();
  });
  
  it('should apply theme-light class to default element when current theme is light', () => {
    const defaultElement = fixture.debugElement.query(By.css('#default')).nativeElement;
    expect(defaultElement.classList.contains('theme-light')).toBeTrue();
  });
  
  it('should apply theme-dark class to default element when current theme is dark', () => {
    // Change the mock to return dark theme
    themingServiceMock.isDarkTheme.and.returnValue(true);
    
    // Re-render the component
    fixture.detectChanges();
    
    const defaultElement = fixture.debugElement.query(By.css('#default')).nativeElement;
    expect(defaultElement.classList.contains('theme-dark')).toBeTrue();
  });
  
  it('should apply specific theme class when theme name is provided', () => {
    const lightElement = fixture.debugElement.query(By.css('#light')).nativeElement;
    const darkElement = fixture.debugElement.query(By.css('#dark')).nativeElement;
    
    expect(lightElement.classList.contains('theme-light')).toBeTrue();
    expect(darkElement.classList.contains('theme-dark')).toBeTrue();
  });
  
  it('should invert the theme when themeInvert is true', () => {
    // Default theme is light, so inverted should be dark
    const invertedElement = fixture.debugElement.query(By.css('#inverted')).nativeElement;
    expect(invertedElement.classList.contains('theme-dark')).toBeTrue();
    
    // Change the mock to return dark theme
    themingServiceMock.isDarkTheme.and.returnValue(true);
    
    // Re-render the component
    fixture.detectChanges();
    
    // Now inverted should be light
    expect(invertedElement.classList.contains('theme-light')).toBeTrue();
  });
  
  it('should apply theme-container class when themeContainer is true', () => {
    const containerElement = fixture.debugElement.query(By.css('#container')).nativeElement;
    expect(containerElement.classList.contains('theme-container')).toBeTrue();
    expect(containerElement.classList.contains('theme-brand')).toBeTrue();
    
    // Should have background and color styles
    expect(containerElement.style.backgroundColor).toBeTruthy();
    expect(containerElement.style.color).toBeTruthy();
  });
  
  it('should apply theme variant class when themeVariant is provided', () => {
    const variantElement = fixture.debugElement.query(By.css('#variant')).nativeElement;
    expect(variantElement.classList.contains('theme-light')).toBeTrue();
    expect(variantElement.classList.contains('theme-variant-primary')).toBeTrue();
  });
}); 