import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { UpgradeBridgeService } from '../upgrade-bridge.service';
import { UpgradeModel } from '../../models/upgrade.model';

describe('UpgradeBridgeService', () => {
  let service: UpgradeBridgeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        UpgradeBridgeService,
        { provide: PLATFORM_ID, useValue: 'browser' } // Simulate browser environment
      ]
    });

    service = TestBed.inject(UpgradeBridgeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load upgrade bridge config from JSON file', () => {
    const mockUpgradeBridgeConfig: UpgradeModel = {
      version: '1.0.0',
      lastUpdated: '2023-10-15',
      enabled: true,
      description: 'Configuration for hybrid AngularJS/Angular application during migration',
      angularJSModules: ['legacyApp', 'legacyComponents'],
      bootstrapElement: 'legacy-app',
      strictDi: true,
      downgradeComponents: [
        {
          name: 'modernHeader',
          selector: 'app-modern-header',
          angularJSName: 'modernHeader'
        }
      ],
      upgradeComponents: [
        {
          name: 'legacyUserProfile',
          selector: 'legacy-user-profile',
          angularName: 'LegacyUserProfileComponent'
        }
      ],
      upgradeProviders: [
        {
          name: 'legacyUserService',
          useFactory: 'createLegacyUserService',
          deps: ['$http']
        }
      ],
      downgradeProviders: [
        {
          name: 'ModernApiService',
          angularJSName: 'modernApiService'
        }
      ],
      routes: [
        {
          path: '/legacy/dashboard',
          component: 'legacyDashboard',
          title: 'Legacy Dashboard'
        }
      ],
      aotMode: true,
      migrationProgress: {
        totalComponents: 25,
        migratedComponents: 18,
        remainingComponents: 7,
        completionPercentage: 72
      },
      deprecationNotices: {
        enabled: true,
        showInUI: true,
        message: 'This component is using legacy AngularJS code and will be upgraded soon.'
      }
    };

    service.loadUpgradeBridgeConfig().subscribe(config => {
      expect(config).toEqual(mockUpgradeBridgeConfig);
      expect(service.upgradeBridgeConfig()).toEqual(mockUpgradeBridgeConfig);
    });

    const req = httpMock.expectOne('assets/upgrade.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockUpgradeBridgeConfig);
  });

  it('should use default config if loading fails', () => {
    service.loadUpgradeBridgeConfig().subscribe(config => {
      expect(config).toBeDefined();
      expect(config.enabled).toBe(false);
      expect(config.angularJSModules).toEqual([]);
    });

    const req = httpMock.expectOne('assets/upgrade.json');
    req.error(new ErrorEvent('Network error'));
  });

  it('should get upgraded components', () => {
    const mockComponents = [
      {
        name: 'legacyUserProfile',
        selector: 'legacy-user-profile',
        angularName: 'LegacyUserProfileComponent'
      }
    ];
    
    service['upgradeBridgeConfigSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-10-15',
      enabled: true,
      description: 'Test',
      angularJSModules: [],
      bootstrapElement: 'legacy-app',
      strictDi: true,
      downgradeComponents: [],
      upgradeComponents: mockComponents,
      upgradeProviders: [],
      downgradeProviders: [],
      routes: [],
      aotMode: true,
      migrationProgress: {
        totalComponents: 0,
        migratedComponents: 0,
        remainingComponents: 0,
        completionPercentage: 0
      },
      deprecationNotices: {
        enabled: false,
        showInUI: false,
        message: ''
      }
    });

    const components = service.getUpgradedComponents();
    expect(components).toEqual(mockComponents);
  });

  it('should get downgraded components', () => {
    const mockComponents = [
      {
        name: 'modernHeader',
        selector: 'app-modern-header',
        angularJSName: 'modernHeader'
      }
    ];
    
    service['upgradeBridgeConfigSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-10-15',
      enabled: true,
      description: 'Test',
      angularJSModules: [],
      bootstrapElement: 'legacy-app',
      strictDi: true,
      downgradeComponents: mockComponents,
      upgradeComponents: [],
      upgradeProviders: [],
      downgradeProviders: [],
      routes: [],
      aotMode: true,
      migrationProgress: {
        totalComponents: 0,
        migratedComponents: 0,
        remainingComponents: 0,
        completionPercentage: 0
      },
      deprecationNotices: {
        enabled: false,
        showInUI: false,
        message: ''
      }
    });

    const components = service.getDowngradedComponents();
    expect(components).toEqual(mockComponents);
  });

  it('should check if a component is deprecated', () => {
    service['upgradeBridgeConfigSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-10-15',
      enabled: true,
      description: 'Test',
      angularJSModules: [],
      bootstrapElement: 'legacy-app',
      strictDi: true,
      downgradeComponents: [],
      upgradeComponents: [
        {
          name: 'legacyUserProfile',
          selector: 'legacy-user-profile',
          angularName: 'LegacyUserProfileComponent'
        }
      ],
      upgradeProviders: [],
      downgradeProviders: [],
      routes: [],
      aotMode: true,
      migrationProgress: {
        totalComponents: 0,
        migratedComponents: 0,
        remainingComponents: 0,
        completionPercentage: 0
      },
      deprecationNotices: {
        enabled: true,
        showInUI: true,
        message: 'This component is deprecated'
      }
    });

    expect(service.isComponentDeprecated('legacyUserProfile')).toBe(true);
    expect(service.isComponentDeprecated('nonExistentComponent')).toBe(false);
  });

  it('should get deprecation message for a component', () => {
    const message = 'This component is deprecated';
    
    service['upgradeBridgeConfigSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-10-15',
      enabled: true,
      description: 'Test',
      angularJSModules: [],
      bootstrapElement: 'legacy-app',
      strictDi: true,
      downgradeComponents: [],
      upgradeComponents: [
        {
          name: 'legacyUserProfile',
          selector: 'legacy-user-profile',
          angularName: 'LegacyUserProfileComponent'
        }
      ],
      upgradeProviders: [],
      downgradeProviders: [],
      routes: [],
      aotMode: true,
      migrationProgress: {
        totalComponents: 0,
        migratedComponents: 0,
        remainingComponents: 0,
        completionPercentage: 0
      },
      deprecationNotices: {
        enabled: true,
        showInUI: true,
        message: message
      }
    });

    expect(service.getDeprecationMessage('legacyUserProfile')).toBe(message);
    expect(service.getDeprecationMessage('nonExistentComponent')).toBeNull();
  });

  describe('Server-side rendering', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule
        ],
        providers: [
          UpgradeBridgeService,
          { provide: PLATFORM_ID, useValue: 'server' } // Simulate server environment
        ]
      });
  
      service = TestBed.inject(UpgradeBridgeService);
      httpMock = TestBed.inject(HttpTestingController);
    });
  
    it('should load config but not initialize upgrade bridge on server', () => {
      // Spy on initializeUpgradeBridge
      spyOn<any>(service, 'initializeUpgradeBridge');
      
      const mockUpgradeBridgeConfig: UpgradeModel = {
        version: '1.0.0',
        lastUpdated: '2023-10-15',
        enabled: true,
        description: 'Test',
        angularJSModules: [],
        bootstrapElement: 'legacy-app',
        strictDi: true,
        downgradeComponents: [],
        upgradeComponents: [],
        upgradeProviders: [],
        downgradeProviders: [],
        routes: [],
        aotMode: true,
        migrationProgress: {
          totalComponents: 0,
          migratedComponents: 0,
          remainingComponents: 0,
          completionPercentage: 0
        },
        deprecationNotices: {
          enabled: false,
          showInUI: false,
          message: ''
        }
      };
  
      service.loadUpgradeBridgeConfig().subscribe(config => {
        expect(config).toEqual(mockUpgradeBridgeConfig);
        expect(service.upgradeBridgeConfig()).toEqual(mockUpgradeBridgeConfig);
      });
  
      const req = httpMock.expectOne('assets/upgrade.json');
      req.flush(mockUpgradeBridgeConfig);
  
      // Verify initializeUpgradeBridge was not called on server
      expect(service['initializeUpgradeBridge']).not.toHaveBeenCalled();
    });
  });
}); 