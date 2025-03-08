import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../core/services/i18n.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslateDirective } from '../../shared/directives/translate.directive';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';

@Component({
  selector: 'app-i18n-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    TranslateDirective,
    LanguageSelectorComponent
  ],
  template: `
    <div class="i18n-demo" [dir]="textDirection">
      <div class="demo-header">
        <h1>{{ 'features.dashboard.title' | translate }}</h1>
        <p>{{ 'features.dashboard.description' | translate }}</p>
        
        <div class="language-control">
          <app-language-selector></app-language-selector>
        </div>
      </div>
      
      <div class="demo-section">
        <h2>{{ 'common.language' | translate }}</h2>
        <p>{{ 'common.currentLanguage' | translate }}: <strong>{{ currentLocaleInfo?.name }}</strong></p>
        <p>{{ 'common.textDirection' | translate }}: <strong>{{ textDirection }}</strong></p>
      </div>
      
      <div class="demo-section">
        <h2>{{ 'common.translationMethods' | translate }}</h2>
        
        <div class="method-example">
          <h3>1. {{ 'common.usingPipe' | translate }}</h3>
          <p>{{ 'common.welcome' | translate }}</p>
          <p>{{ 'validation.required' | translate }}</p>
          <p>{{ 'errors.notFound' | translate }}</p>
        </div>
        
        <div class="method-example">
          <h3>2. {{ 'common.usingDirective' | translate }}</h3>
          <p [appTranslate]="'common.loading'"></p>
          <p [appTranslate]="'validation.email'"></p>
          <p [appTranslate]="'errors.unauthorized'"></p>
        </div>
        
        <div class="method-example">
          <h3>3. {{ 'common.usingService' | translate }}</h3>
          <p>{{ serviceTranslation1 }}</p>
          <p>{{ serviceTranslation2 }}</p>
          <p>{{ serviceTranslation3 }}</p>
        </div>
      </div>
      
      <div class="demo-section">
        <h2>{{ 'common.parameterizedTranslations' | translate }}</h2>
        
        <div class="method-example">
          <h3>{{ 'common.withPipe' | translate }}</h3>
          <p>{{ 'validation.minLength' | translate:{ min: '8' } }}</p>
          <p>{{ 'validation.maxLength' | translate:{ max: '100' } }}</p>
        </div>
        
        <div class="method-example">
          <h3>{{ 'common.withDirective' | translate }}</h3>
          <p 
            [appTranslate]="'validation.minDate'" 
            [translateParams]="{ date: '2023-01-01' }"
          ></p>
          <p 
            [appTranslate]="'validation.maxDate'" 
            [translateParams]="{ date: '2023-12-31' }"
          ></p>
        </div>
        
        <div class="method-example">
          <h3>{{ 'common.withService' | translate }}</h3>
          <p>{{ paramServiceTranslation1 }}</p>
          <p>{{ paramServiceTranslation2 }}</p>
        </div>
      </div>
      
      <div class="demo-section">
        <h2>{{ 'common.translationExplorer' | translate }}</h2>
        
        <div class="explorer">
          <div class="form-group">
            <label for="translationKey">{{ 'common.translationKey' | translate }}:</label>
            <input 
              type="text" 
              id="translationKey" 
              [(ngModel)]="explorerKey" 
              placeholder="common.welcome"
              class="form-control"
            >
          </div>
          
          <div class="form-group">
            <label for="translationParams">{{ 'common.parameters' | translate }} (JSON):</label>
            <input 
              type="text" 
              id="translationParams" 
              [(ngModel)]="explorerParamsJson" 
              placeholder='{"param": "value"}'
              class="form-control"
            >
          </div>
          
          <button (click)="translateExplorerKey()" class="btn">
            {{ 'common.translate' | translate }}
          </button>
          
          <div class="result" *ngIf="explorerResult">
            <h4>{{ 'common.result' | translate }}:</h4>
            <p class="translation-result">{{ explorerResult }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .i18n-demo {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .demo-header {
      margin-bottom: 30px;
      position: relative;
    }
    
    .language-control {
      position: absolute;
      top: 0;
      right: 0;
    }
    
    .demo-section {
      margin-bottom: 30px;
      padding: 20px;
      border-radius: 8px;
      background-color: #f9f9f9;
    }
    
    .method-example {
      margin-bottom: 20px;
      padding: 15px;
      border-radius: 4px;
      background-color: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .method-example h3 {
      margin-top: 0;
      font-size: 18px;
      color: #3f51b5;
    }
    
    .explorer {
      padding: 15px;
      border-radius: 4px;
      background-color: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-control {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    
    .btn {
      padding: 8px 16px;
      background-color: #3f51b5;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    
    .btn:hover {
      background-color: #303f9f;
    }
    
    .result {
      margin-top: 15px;
      padding: 15px;
      border-radius: 4px;
      background-color: #f0f0f0;
    }
    
    .translation-result {
      font-size: 18px;
      font-weight: 500;
    }
    
    [dir="rtl"] .language-control {
      right: auto;
      left: 0;
    }
  `]
})
export class I18nDemoComponent implements OnInit, OnDestroy {
  private i18nService = inject(I18nService);
  private platformId = inject(PLATFORM_ID);
  
  // Properties for the demo
  currentLocaleInfo = this.i18nService.getCurrentLocaleInfo();
  textDirection = this.i18nService.getTextDirection();
  
  // Service translation examples
  serviceTranslation1 = '';
  serviceTranslation2 = '';
  serviceTranslation3 = '';
  
  // Parameterized service translation examples
  paramServiceTranslation1 = '';
  paramServiceTranslation2 = '';
  
  // Explorer
  explorerKey = 'common.welcome';
  explorerParamsJson = '';
  explorerResult = '';
  
  // For cleanup
  private intervalId: number | null = null;
  
  ngOnInit(): void {
    // Update translations using the service
    this.updateServiceTranslations();
    
    // Set up an interval to update the direction and locale info when they change
    // Only in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = window.setInterval(() => {
        const newDirection = this.i18nService.getTextDirection();
        const newLocaleInfo = this.i18nService.getCurrentLocaleInfo();
        
        if (this.textDirection !== newDirection) {
          this.textDirection = newDirection;
        }
        
        if (this.currentLocaleInfo?.code !== newLocaleInfo?.code) {
          this.currentLocaleInfo = newLocaleInfo;
          this.updateServiceTranslations();
        }
      }, 100);
    }
  }
  
  ngOnDestroy(): void {
    // Clean up the interval
    if (isPlatformBrowser(this.platformId) && this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  updateServiceTranslations(): void {
    // Basic translations
    this.serviceTranslation1 = this.i18nService.translate('common.save');
    this.serviceTranslation2 = this.i18nService.translate('validation.pattern');
    this.serviceTranslation3 = this.i18nService.translate('errors.serverError');
    
    // Parameterized translations
    this.paramServiceTranslation1 = this.i18nService.translate('validation.min', { min: '5' });
    this.paramServiceTranslation2 = this.i18nService.translate('validation.max', { max: '100' });
  }
  
  translateExplorerKey(): void {
    try {
      const params = this.explorerParamsJson ? JSON.parse(this.explorerParamsJson) : undefined;
      this.explorerResult = this.i18nService.translate(this.explorerKey, params);
    } catch (error) {
      this.explorerResult = `Error parsing parameters: ${error}`;
    }
  }
} 