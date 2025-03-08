import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigService } from '../config.service';
import { ConfigModel } from '../../models/config.model';

describe('ConfigService', () => {
  let service: ConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConfigService]
    });
    service = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load configuration from assets/config.json', () => {
    const mockConfig: ConfigModel = {
      environmentName: 'test',
      apiEndpoint: 'https://api.test.example.com',
      featureFlags: {
        enableServiceWorker: false,
        enableDarkMode: true,
        enableBetaFeatures: true,
        enableAnalytics: false
      },
      auth: {
        tokenExpiryMinutes: 30,
        refreshTokenExpiryDays: 7,
        authEndpoint: 'https://auth.test.example.com'
      },
      performance: {
        cacheTimeoutMinutes: 10,
        maxConcurrentRequests: 3,
        enablePrefetching: true
      },
      ui: {
        defaultTheme: 'dark',
        animationsEnabled: true,
        defaultLanguage: 'en'
      },
      logging: {
        logLevel: 'debug',
        enableRemoteLogging: false,
        remoteLogEndpoint: 'https://logs.test.example.com'
      }
    };

    service.loadConfig().subscribe(config => {
      expect(config).toEqual(mockConfig);
      expect(service.config()).toEqual(mockConfig);
      expect(service.environmentName()).toEqual('test');
      expect(service.apiEndpoint()).toEqual('https://api.test.example.com');
      expect(service.featureFlags()?.enableDarkMode).toBeTrue();
      expect(service.isFeatureEnabled('enableDarkMode')).toBeTrue();
      expect(service.isFeatureEnabled('enableServiceWorker')).toBeFalse();
    });

    const req = httpMock.expectOne('assets/config.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockConfig);
  });

  it('should return default config when HTTP request fails', () => {
    service.loadConfig().subscribe(config => {
      expect(config).toBeTruthy();
      expect(service.config()).toBeTruthy();
      expect(service.environmentName()).toBe('development');
    });

    const req = httpMock.expectOne('assets/config.json');
    req.error(new ErrorEvent('Network error'));
  });
}); 