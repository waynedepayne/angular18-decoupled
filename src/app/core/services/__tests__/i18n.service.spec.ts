import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { I18nService } from '../i18n.service';
import { I18nModel, TranslationSet } from '../../models/i18n.model';

describe('I18nService', () => {
  let service: I18nService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [I18nService]
    });
    service = TestBed.inject(I18nService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load i18n data from assets/i18n.json', () => {
    const mockI18n: I18nModel = {
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      defaultLocale: 'en-US',
      availableLocales: [
        {
          code: 'en-US',
          name: 'English (US)',
          direction: 'ltr',
          isActive: true
        }
      ],
      translations: {
        'en-US': {
          common: {
            welcome: 'Welcome'
          },
          validation: {
            required: 'This field is required'
          },
          errors: {
            general: 'An error occurred'
          },
          features: {
            dashboard: {
              title: 'Dashboard',
              description: 'Overview of your account'
            }
          },
          pages: {
            home: {
              title: 'Home',
              subtitle: 'Welcome to our application'
            }
          }
        }
      }
    };

    service.loadI18n().subscribe(i18n => {
      expect(i18n).toEqual(mockI18n);
      expect(service.defaultLocale()).toBe('en-US');
      expect(service.availableLocales().length).toBe(1);
    });

    const req = httpMock.expectOne('assets/i18n.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockI18n);
  });

  it('should return default i18n data when HTTP request fails', () => {
    service.loadI18n().subscribe(i18n => {
      expect(i18n).toBeTruthy();
      expect(service.defaultLocale()).toBe('en-US');
      expect(service.availableLocales().length).toBeGreaterThan(0);
    });

    const req = httpMock.expectOne('assets/i18n.json');
    req.error(new ErrorEvent('Network error'));
  });

  it('should translate keys correctly', () => {
    // Manually set i18n data for testing
    const mockTranslations: Record<string, TranslationSet> = {
      'en-US': {
        common: {
          welcome: 'Welcome',
          hello: 'Hello {{name}}'
        },
        validation: {
          required: 'This field is required',
          minLength: 'This field must be at least {{min}} characters long'
        },
        errors: {
          general: 'An error occurred'
        },
        features: {
          dashboard: {
            title: 'Dashboard'
          }
        },
        pages: {
          home: {
            title: 'Home'
          }
        }
      }
    };
    
    service['i18nSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      defaultLocale: 'en-US',
      availableLocales: [
        {
          code: 'en-US',
          name: 'English (US)',
          direction: 'ltr',
          isActive: true
        }
      ],
      translations: mockTranslations
    });

    // Set current locale
    service['currentLocaleSignal'].set('en-US');

    // Test simple translation
    expect(service.translate('common.welcome')).toBe('Welcome');
    expect(service.translate('validation.required')).toBe('This field is required');
    expect(service.translate('features.dashboard.title')).toBe('Dashboard');

    // Test nested translation
    expect(service.translate('common.hello', { name: 'John' })).toBe('Hello John');
    expect(service.translate('validation.minLength', { min: '8' })).toBe('This field must be at least 8 characters long');

    // Test non-existent key
    expect(service.translate('common.nonexistent')).toBe('common.nonexistent');
    expect(service.translate('nonexistent.key')).toBe('nonexistent.key');
  });

  it('should change locale correctly', () => {
    // Create mock translation sets
    const mockEnTranslation: TranslationSet = {
      common: { welcome: 'Welcome' },
      validation: { required: 'Required' },
      errors: { general: 'Error' },
      features: { dashboard: { title: 'Dashboard' } },
      pages: { home: { title: 'Home' } }
    };
    
    const mockEsTranslation: TranslationSet = {
      common: { welcome: 'Bienvenido' },
      validation: { required: 'Requerido' },
      errors: { general: 'Error' },
      features: { dashboard: { title: 'Panel' } },
      pages: { home: { title: 'Inicio' } }
    };
    
    const mockFrTranslation: TranslationSet = {
      common: { welcome: 'Bienvenue' },
      validation: { required: 'Requis' },
      errors: { general: 'Erreur' },
      features: { dashboard: { title: 'Tableau de bord' } },
      pages: { home: { title: 'Accueil' } }
    };
    
    // Manually set i18n data for testing
    service['i18nSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      defaultLocale: 'en-US',
      availableLocales: [
        {
          code: 'en-US',
          name: 'English (US)',
          direction: 'ltr',
          isActive: true
        },
        {
          code: 'es-ES',
          name: 'Español',
          direction: 'ltr',
          isActive: true
        },
        {
          code: 'fr-FR',
          name: 'Français',
          direction: 'ltr',
          isActive: false
        }
      ],
      translations: {
        'en-US': mockEnTranslation,
        'es-ES': mockEsTranslation,
        'fr-FR': mockFrTranslation
      }
    });

    // Set initial locale
    service['currentLocaleSignal'].set('en-US');
    expect(service.currentLocale()).toBe('en-US');
    expect(service.translate('common.welcome')).toBe('Welcome');

    // Change to valid locale
    const result1 = service.changeLocale('es-ES');
    expect(result1).toBe(true);
    expect(service.currentLocale()).toBe('es-ES');
    expect(service.translate('common.welcome')).toBe('Bienvenido');

    // Try to change to inactive locale
    const result2 = service.changeLocale('fr-FR');
    expect(result2).toBe(false);
    expect(service.currentLocale()).toBe('es-ES'); // Should not change

    // Try to change to non-existent locale
    const result3 = service.changeLocale('de-DE');
    expect(result3).toBe(false);
    expect(service.currentLocale()).toBe('es-ES'); // Should not change
  });

  it('should get text direction correctly', () => {
    // Create minimal translation sets
    const emptyTranslation: TranslationSet = {
      common: {},
      validation: {},
      errors: {},
      features: {},
      pages: {}
    };
    
    // Manually set i18n data for testing
    service['i18nSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      defaultLocale: 'en-US',
      availableLocales: [
        {
          code: 'en-US',
          name: 'English (US)',
          direction: 'ltr',
          isActive: true
        },
        {
          code: 'ar-SA',
          name: 'العربية',
          direction: 'rtl',
          isActive: true
        }
      ],
      translations: {
        'en-US': emptyTranslation,
        'ar-SA': emptyTranslation
      }
    });

    // Set locale to LTR
    service['currentLocaleSignal'].set('en-US');
    expect(service.getTextDirection()).toBe('ltr');

    // Set locale to RTL
    service['currentLocaleSignal'].set('ar-SA');
    expect(service.getTextDirection()).toBe('rtl');
  });

  it('should get current locale info correctly', () => {
    // Create minimal translation sets
    const emptyTranslation: TranslationSet = {
      common: {},
      validation: {},
      errors: {},
      features: {},
      pages: {}
    };
    
    // Manually set i18n data for testing
    service['i18nSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      defaultLocale: 'en-US',
      availableLocales: [
        {
          code: 'en-US',
          name: 'English (US)',
          direction: 'ltr',
          isActive: true
        },
        {
          code: 'es-ES',
          name: 'Español',
          direction: 'ltr',
          isActive: true
        }
      ],
      translations: {
        'en-US': emptyTranslation,
        'es-ES': emptyTranslation
      }
    });

    // Set locale
    service['currentLocaleSignal'].set('es-ES');
    const localeInfo = service.getCurrentLocaleInfo();
    expect(localeInfo).toBeTruthy();
    expect(localeInfo?.code).toBe('es-ES');
    expect(localeInfo?.name).toBe('Español');
    expect(localeInfo?.direction).toBe('ltr');
  });
}); 