import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AnalyticsService } from '../analytics.service';
import { AnalyticsModel } from '../../models/analytics.model';
import { PLATFORM_ID } from '@angular/core';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        AnalyticsService,
        { provide: PLATFORM_ID, useValue: 'browser' } // Simulate browser environment
      ]
    });

    service = TestBed.inject(AnalyticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load analytics config from JSON file', () => {
    const mockAnalyticsConfig: AnalyticsModel = {
      version: '1.0.0',
      lastUpdated: '2023-10-15',
      analyticsEnabled: true,
      providers: [
        {
          name: 'google-analytics',
          enabled: true,
          trackingId: 'UA-XXXXXXXXX-X',
          options: {
            anonymizeIp: true,
            sendPageView: true,
            trackExceptions: true
          }
        }
      ],
      eventSampling: {
        buttonClick: 1.0,
        pageView: 1.0
      },
      eventDefinitions: {
        buttonClick: {
          requiredProperties: ['buttonId', 'buttonText'],
          optionalProperties: ['pageContext']
        },
        pageView: {
          requiredProperties: ['pagePath', 'pageTitle'],
          optionalProperties: ['referrer']
        }
      },
      userProperties: {
        allowedProperties: ['userId', 'userRole'],
        identifyOnInit: true,
        anonymizeByDefault: false
      },
      privacySettings: {
        cookieConsent: true,
        dataRetentionDays: 90,
        allowDoNotTrack: true,
        respectGdpr: true
      },
      debugMode: false
    };

    service.loadAnalyticsConfig().subscribe(config => {
      expect(config).toEqual(mockAnalyticsConfig);
      expect(service.analyticsConfig()).toEqual(mockAnalyticsConfig);
    });

    const req = httpMock.expectOne('assets/analytics.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockAnalyticsConfig);
  });

  it('should use default config if loading fails', () => {
    service.loadAnalyticsConfig().subscribe(config => {
      expect(config).toBeDefined();
      expect(config.analyticsEnabled).toBe(false);
      expect(config.providers).toEqual([]);
    });

    const req = httpMock.expectOne('assets/analytics.json');
    req.error(new ErrorEvent('Network error'));
  });

  it('should track button click', () => {
    // Set up a spy on the private trackEvent method
    spyOn<any>(service, 'trackEvent');
    
    // Set up the analytics config
    service['analyticsConfigSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-10-15',
      analyticsEnabled: true,
      providers: [],
      eventSampling: { buttonClick: 1.0 },
      eventDefinitions: {
        buttonClick: {
          requiredProperties: ['buttonId', 'buttonText'],
          optionalProperties: []
        }
      },
      userProperties: {
        allowedProperties: [],
        identifyOnInit: false,
        anonymizeByDefault: false
      },
      privacySettings: {
        cookieConsent: false,
        dataRetentionDays: 90,
        allowDoNotTrack: false,
        respectGdpr: false
      },
      debugMode: false
    });

    // Track a button click
    service.trackButtonClick('test-button', 'Test Button');

    // Verify that trackEvent was called with the correct parameters
    expect(service['trackEvent']).toHaveBeenCalledWith('buttonClick', jasmine.objectContaining({
      buttonId: 'test-button',
      buttonText: 'Test Button'
    }));
  });

  it('should not track events when analytics is disabled', () => {
    // Set up a spy on the private trackEvent method
    spyOn<any>(service, 'trackEvent');
    
    // Set up the analytics config with analyticsEnabled = false
    service['analyticsConfigSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-10-15',
      analyticsEnabled: false,
      providers: [],
      eventSampling: { buttonClick: 1.0 },
      eventDefinitions: {
        buttonClick: {
          requiredProperties: ['buttonId', 'buttonText'],
          optionalProperties: []
        }
      },
      userProperties: {
        allowedProperties: [],
        identifyOnInit: false,
        anonymizeByDefault: false
      },
      privacySettings: {
        cookieConsent: false,
        dataRetentionDays: 90,
        allowDoNotTrack: false,
        respectGdpr: false
      },
      debugMode: false
    });

    // Track a button click
    service.trackButtonClick('test-button', 'Test Button');

    // Verify that trackEvent was not called
    expect(service['trackEvent']).not.toHaveBeenCalled();
  });

  it('should respect sampling rates', () => {
    // Set up a spy on the private trackEvent method
    spyOn<any>(service, 'trackEvent');
    
    // Set up the analytics config with sampling rate = 0 for buttonClick
    service['analyticsConfigSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-10-15',
      analyticsEnabled: true,
      providers: [],
      eventSampling: { buttonClick: 0 },
      eventDefinitions: {
        buttonClick: {
          requiredProperties: ['buttonId', 'buttonText'],
          optionalProperties: []
        }
      },
      userProperties: {
        allowedProperties: [],
        identifyOnInit: false,
        anonymizeByDefault: false
      },
      privacySettings: {
        cookieConsent: false,
        dataRetentionDays: 90,
        allowDoNotTrack: false,
        respectGdpr: false
      },
      debugMode: false
    });

    // Track a button click
    service.trackButtonClick('test-button', 'Test Button');

    // Verify that trackEvent was not called due to sampling
    expect(service['trackEvent']).not.toHaveBeenCalled();
  });

  it('should identify user with allowed properties only', () => {
    // Set up a spy on the private identifyUserWithProvider method
    const identifySpy = jasmine.createSpy('identifyUserWithProvider');
    service['identifyUserWithProvider'] = identifySpy;
    
    // Set up the analytics config
    service['analyticsConfigSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-10-15',
      analyticsEnabled: true,
      providers: [
        {
          name: 'google-analytics',
          enabled: true,
          trackingId: 'UA-XXXXXXXXX-X',
          options: {}
        }
      ],
      eventSampling: {},
      eventDefinitions: {},
      userProperties: {
        allowedProperties: ['userId', 'userRole'],
        identifyOnInit: false,
        anonymizeByDefault: false
      },
      privacySettings: {
        cookieConsent: false,
        dataRetentionDays: 90,
        allowDoNotTrack: false,
        respectGdpr: false
      },
      debugMode: false
    });

    // Identify a user with both allowed and disallowed properties
    service.identifyUser('user-123', {
      userId: 'user-123',
      userRole: 'admin',
      email: 'user@example.com', // This should be filtered out
      password: 'secret' // This should be filtered out
    });

    // Verify that identifyUserWithProvider was called with only allowed properties
    expect(identifySpy).toHaveBeenCalled();
    
    // Get the arguments from the spy
    const args = identifySpy.calls.argsFor(0);
    const provider = args[0];
    const userId = args[1];
    const traits = args[2];
    
    // Verify the arguments
    expect(provider.name).toBe('google-analytics');
    expect(userId).toBe('user-123');
    expect(traits.userId).toBe('user-123');
    expect(traits.userRole).toBe('admin');
    expect(traits.email).toBeUndefined();
    expect(traits.password).toBeUndefined();
  });

  describe('Server-side rendering', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule,
          RouterTestingModule
        ],
        providers: [
          AnalyticsService,
          { provide: PLATFORM_ID, useValue: 'server' } // Simulate server environment
        ]
      });
  
      service = TestBed.inject(AnalyticsService);
      httpMock = TestBed.inject(HttpTestingController);
    });
  
    it('should load config but not initialize analytics on server', () => {
      // Spy on initializeAnalytics
      spyOn<any>(service, 'initializeAnalytics');
      
      const mockAnalyticsConfig: AnalyticsModel = {
        version: '1.0.0',
        lastUpdated: '2023-10-15',
        analyticsEnabled: true,
        providers: [],
        eventSampling: {},
        eventDefinitions: {},
        userProperties: {
          allowedProperties: [],
          identifyOnInit: false,
          anonymizeByDefault: false
        },
        privacySettings: {
          cookieConsent: false,
          dataRetentionDays: 90,
          allowDoNotTrack: false,
          respectGdpr: false
        },
        debugMode: false
      };
  
      service.loadAnalyticsConfig().subscribe(config => {
        expect(config).toEqual(mockAnalyticsConfig);
        expect(service.analyticsConfig()).toEqual(mockAnalyticsConfig);
      });
  
      const req = httpMock.expectOne('assets/analytics.json');
      req.flush(mockAnalyticsConfig);
  
      // Verify initializeAnalytics was not called on server
      expect(service['initializeAnalytics']).not.toHaveBeenCalled();
    });
  
    it('should not track events on server', () => {
      // Set up a spy on the private trackEvent method
      spyOn<any>(service, 'trackEvent');
      
      // Set up the analytics config
      service['analyticsConfigSignal'].set({
        version: '1.0.0',
        lastUpdated: '2023-10-15',
        analyticsEnabled: true,
        providers: [],
        eventSampling: { buttonClick: 1.0 },
        eventDefinitions: {
          buttonClick: {
            requiredProperties: ['buttonId', 'buttonText'],
            optionalProperties: []
          }
        },
        userProperties: {
          allowedProperties: [],
          identifyOnInit: false,
          anonymizeByDefault: false
        },
        privacySettings: {
          cookieConsent: false,
          dataRetentionDays: 90,
          allowDoNotTrack: false,
          respectGdpr: false
        },
        debugMode: false
      });
  
      // Track a button click
      service.trackButtonClick('test-button', 'Test Button');
  
      // Verify that trackEvent was not called on server
      expect(service['trackEvent']).not.toHaveBeenCalled();
    });
  });
}); 