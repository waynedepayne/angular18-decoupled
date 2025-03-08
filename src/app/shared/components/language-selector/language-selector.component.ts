import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { I18nService } from '../../../core/services/i18n.service';
import { LocaleInfo } from '../../../core/models/i18n.model';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="language-selector" [class.rtl]="isRtl">
      <div class="selected-language" (click)="toggleDropdown($event)">
        <img 
          *ngIf="currentLocaleInfo?.flagIcon" 
          [src]="currentLocaleInfo?.flagIcon" 
          [alt]="currentLocaleInfo?.name" 
          class="flag-icon"
        />
        <span class="language-name">{{ currentLocaleInfo?.name || 'Language' }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" class="dropdown-icon">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6"/>
        </svg>
      </div>
      
      <div class="language-dropdown" *ngIf="isDropdownOpen">
        <div 
          *ngFor="let locale of availableLocales()"
          class="language-option"
          [class.active]="locale.code === currentLocale()"
          [class.rtl]="locale.direction === 'rtl'"
          (click)="selectLanguage(locale.code)"
        >
          <img 
            *ngIf="locale.flagIcon" 
            [src]="locale.flagIcon" 
            [alt]="locale.name" 
            class="flag-icon"
          />
          <span class="language-name">{{ locale.name }}</span>
          <svg *ngIf="locale.code === currentLocale()" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" class="check-icon">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12l5 5 9-9"/>
          </svg>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .language-selector {
      position: relative;
      display: inline-block;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .selected-language {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 4px;
      background-color: rgba(255, 255, 255, 0.1);
      transition: background-color 0.2s, box-shadow 0.2s;
      min-width: 120px;
    }
    
    .selected-language:hover {
      background-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    .dropdown-icon {
      margin-left: auto;
      transition: transform 0.2s;
    }
    
    .language-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      z-index: 100;
      min-width: 180px;
      overflow: hidden;
      animation: fadeIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .language-option {
      display: flex;
      align-items: center;
      padding: 10px 15px;
      cursor: pointer;
      transition: background-color 0.2s;
      color: #333;
      position: relative;
    }
    
    .language-option:hover {
      background-color: #f5f5f5;
    }
    
    .language-option.active {
      background-color: #f0f7ff;
      font-weight: 500;
      color: #3f51b5;
    }
    
    .flag-icon {
      width: 20px;
      height: 15px;
      margin-right: 10px;
      object-fit: cover;
      border-radius: 2px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    .language-name {
      flex: 1;
    }
    
    .check-icon {
      color: #3f51b5;
      margin-left: 5px;
    }
    
    /* RTL Support */
    .rtl .selected-language,
    .language-option.rtl {
      direction: rtl;
      text-align: right;
    }
    
    .rtl .flag-icon {
      margin-right: 0;
      margin-left: 10px;
    }
    
    .rtl .dropdown-icon {
      margin-left: 0;
      margin-right: auto;
    }
    
    .rtl .check-icon {
      margin-left: 0;
      margin-right: 5px;
    }
    
    .rtl.language-selector .language-dropdown {
      right: auto;
      left: 0;
    }
  `]
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
  private i18nService = inject(I18nService);
  private platformId = inject(PLATFORM_ID);
  
  // Use signals from the i18n service
  availableLocales = this.i18nService.availableLocales;
  currentLocale = this.i18nService.currentLocale;
  
  // Component state
  isDropdownOpen = false;
  currentLocaleInfo: LocaleInfo | null = null;
  isRtl = false;
  
  // Store document click handler for cleanup
  private documentClickHandler: ((event: MouseEvent) => void) | null = null;
  
  ngOnInit(): void {
    // Get the current locale info
    this.updateCurrentLocaleInfo();
    
    // Only add event listeners in the browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Close dropdown when clicking outside
      this.documentClickHandler = this.onDocumentClick.bind(this);
      document.addEventListener('click', this.documentClickHandler);
      
      // Set up an interval to update the locale info when it changes
      const intervalId = setInterval(() => {
        const newLocale = this.i18nService.currentLocale();
        if (newLocale !== this.currentLocale()) {
          this.updateCurrentLocaleInfo();
        }
      }, 500);
      
      // Store the interval ID for cleanup
      (this as any).intervalId = intervalId;
    }
  }
  
  ngOnDestroy(): void {
    // Clean up event listeners
    if (isPlatformBrowser(this.platformId)) {
      if (this.documentClickHandler) {
        document.removeEventListener('click', this.documentClickHandler);
        this.documentClickHandler = null;
      }
      
      // Clear the interval
      if ((this as any).intervalId) {
        clearInterval((this as any).intervalId);
      }
    }
  }
  
  toggleDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  
  selectLanguage(localeCode: string): void {
    this.i18nService.changeLocale(localeCode);
    this.updateCurrentLocaleInfo();
    this.isDropdownOpen = false;
  }
  
  private updateCurrentLocaleInfo(): void {
    this.currentLocaleInfo = this.i18nService.getCurrentLocaleInfo();
    this.isRtl = this.i18nService.getTextDirection() === 'rtl';
  }
  
  private onDocumentClick(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.language-selector');
    
    if (dropdown && !dropdown.contains(target)) {
      this.isDropdownOpen = false;
    }
  }
} 