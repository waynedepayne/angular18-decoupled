import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MicrofrontendService } from '../microfrontend.service';
import { MicrofrontendModel } from '../../models/microfrontend.model';

describe('MicrofrontendService', () => {
  let service: MicrofrontendService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        MicrofrontendService
      ]
    });

    service = TestBed.inject(MicrofrontendService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load microfrontend configuration', () => {
    const mockConfig: MicrofrontendModel = {
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      enabled: true,
      settings: {
        defaultTimeout: 10000,
        preloadAll: false,
        retryOnError: true,
        maxRetries: 3,
        showLoading: true,
        showErrors: true,
        containerClass: 'remote-container'
      },
      remotes: {
        dashboard: {
          name: 'dashboard',
          url: 'https://example.com/dashboard/remoteEntry.js',
          exposedModules: [
            {
              name: 'DashboardModule',
              type: 'module',
              path: './DashboardModule',
              enabled: true
            }
          ],
          enabled: true,
          preload: true
        }
      },
      routes: [
        {
          path: 'dashboard',
          remoteName: 'dashboard',
          exposedModule: 'DashboardModule',
          enabled: true,
          lazy: true,
          data: {
            title: 'Dashboard'
          }
        }
      ],
      shared: {
        singleton: true,
        strictVersion: false,
        libs: [
          {
            name: '@angular/core',
            singleton: true,
            strictVersion: true,
            eager: true
          }
        ]
      }
    };

    service.loadMicrofrontendConfig().subscribe(config => {
      expect(config).toEqual(mockConfig);
    });

    const req = httpMock.expectOne('assets/microfrontend.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockConfig);
  });

  it('should handle error when loading configuration', () => {
    service.loadMicrofrontendConfig().subscribe(config => {
      expect(config.enabled).toBeFalse();
      expect(config.remotes).toEqual({});
      expect(config.routes).toEqual([]);
    });

    const req = httpMock.expectOne('assets/microfrontend.json');
    req.error(new ErrorEvent('Network error'));
  });

  it('should get enabled remotes', (done) => {
    const mockConfig: MicrofrontendModel = {
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      enabled: true,
      settings: {
        defaultTimeout: 10000,
        preloadAll: false,
        retryOnError: true,
        maxRetries: 3,
        showLoading: true,
        showErrors: true
      },
      remotes: {
        dashboard: {
          name: 'dashboard',
          url: 'https://example.com/dashboard/remoteEntry.js',
          exposedModules: [],
          enabled: true
        },
        reports: {
          name: 'reports',
          url: 'https://example.com/reports/remoteEntry.js',
          exposedModules: [],
          enabled: false
        }
      },
      routes: [],
      shared: {
        singleton: true,
        strictVersion: false,
        libs: []
      }
    };

    service.loadMicrofrontendConfig().subscribe(() => {
      service.getEnabledRemotes().subscribe(remotes => {
        expect(remotes.length).toBe(1);
        expect(remotes[0].name).toBe('dashboard');
        done();
      });
    });

    const req = httpMock.expectOne('assets/microfrontend.json');
    req.flush(mockConfig);
  });

  it('should get enabled routes', (done) => {
    const mockConfig: MicrofrontendModel = {
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      enabled: true,
      settings: {
        defaultTimeout: 10000,
        preloadAll: false,
        retryOnError: true,
        maxRetries: 3,
        showLoading: true,
        showErrors: true
      },
      remotes: {},
      routes: [
        {
          path: 'dashboard',
          remoteName: 'dashboard',
          exposedModule: 'DashboardModule',
          enabled: true,
          lazy: true
        },
        {
          path: 'reports',
          remoteName: 'reports',
          exposedModule: 'ReportsModule',
          enabled: false,
          lazy: true
        }
      ],
      shared: {
        singleton: true,
        strictVersion: false,
        libs: []
      }
    };

    service.loadMicrofrontendConfig().subscribe(() => {
      service.getEnabledRoutes().subscribe(routes => {
        expect(routes.length).toBe(1);
        expect(routes[0].path).toBe('dashboard');
        done();
      });
    });

    const req = httpMock.expectOne('assets/microfrontend.json');
    req.flush(mockConfig);
  });
}); 