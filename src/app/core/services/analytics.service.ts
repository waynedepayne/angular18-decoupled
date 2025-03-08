/**
 * @fileoverview AnalyticsService is responsible for loading and providing access to the application's
 * analytics configuration from analytics.json. It integrates with analytics providers to track events
 * and user interactions.
 * 
 * JSON Source: assets/analytics.json
 * 
 * Data Structure:
 * - version: Version of the analytics configuration
 * - analyticsEnabled: Whether analytics tracking is enabled globally
 * - providers: List of analytics providers (Google Analytics, Mixpanel, etc.)
 * - eventSampling: Sampling rates for different event types
 * - eventDefinitions: Definitions for tracked events
 * - userProperties: User property settings
 * - privacySettings: Privacy-related settings
 * - debugMode: Whether debug mode is enabled
 * 
 * Transformation Logic:
 * - JSON is loaded at application startup via APP_INITIALIZER
 * - Analytics providers are initialized based on configuration
 * - Events are tracked according to sampling rates and definitions
 */
import { Injectable, signal, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { AnalyticsModel, AnalyticsProvider, EventDefinition } from '../models/analytics.model';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private analyticsConfigSignal = signal<AnalyticsModel | null>(null);
  private initializedProviders = new Set<string>();
  private userIdentified = false;
  private isBrowser: boolean;
  
  // Public signals for components to consume
  public readonly analyticsConfig = this.analyticsConfigSignal.asReadonly();
  
  // Inject dependencies
  private http = inject(HttpClient);
  private router = inject(Router);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Only subscribe to router events in the browser
    if (this.isBrowser) {
      // Listen for router events to track page views
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: any) => {
        this.trackPageView(event.urlAfterRedirects, document.title);
      });
    }
  }

  /**
   * Loads the analytics configuration from the JSON file
   * Used by APP_INITIALIZER to load analytics at startup
   * 
   * @returns Observable<AnalyticsModel> - The loaded analytics configuration or default values
   */
  loadAnalyticsConfig(): Observable<AnalyticsModel> {
    return this.http.get<AnalyticsModel>('assets/analytics.json').pipe(
      tap(config => {
        console.log('Analytics config loaded successfully');
        this.analyticsConfigSignal.set(config);
        
        // Only initialize analytics in the browser
        if (this.isBrowser) {
          this.initializeAnalytics(config);
        }
      }),
      catchError(error => {
        console.error('Error loading analytics config:', error);
        const defaultConfig = this.getDefaultAnalyticsConfig();
        this.analyticsConfigSignal.set(defaultConfig);
        return of(defaultConfig);
      })
    );
  }

  /**
   * Initializes analytics providers based on configuration
   * 
   * @param config - The analytics configuration
   */
  private initializeAnalytics(config: AnalyticsModel): void {
    if (!config.analyticsEnabled) {
      console.log('Analytics tracking is disabled globally');
      return;
    }

    // Check for Do Not Track browser setting
    if (config.privacySettings.allowDoNotTrack && this.isDoNotTrackEnabled()) {
      console.log('Respecting Do Not Track browser setting - analytics disabled');
      return;
    }

    // Initialize enabled providers
    config.providers.forEach(provider => {
      if (provider.enabled) {
        this.initializeProvider(provider);
      }
    });

    // Identify user if configured
    if (config.userProperties.identifyOnInit && !config.userProperties.anonymizeByDefault) {
      this.identifyUser();
    }

    console.log('Analytics initialized with providers:', 
      config.providers.filter(p => p.enabled).map(p => p.name).join(', '));
  }

  /**
   * Initializes a specific analytics provider
   * 
   * @param provider - The provider configuration
   */
  private initializeProvider(provider: AnalyticsProvider): void {
    if (this.initializedProviders.has(provider.name)) {
      return;
    }

    switch (provider.name) {
      case 'google-analytics':
        this.initializeGoogleAnalytics(provider);
        break;
      case 'mixpanel':
        this.initializeMixpanel(provider);
        break;
      case 'custom-logger':
        this.initializeCustomLogger(provider);
        break;
      default:
        console.warn(`Unknown analytics provider: ${provider.name}`);
    }

    this.initializedProviders.add(provider.name);
  }

  /**
   * Initializes Google Analytics
   * 
   * @param provider - The Google Analytics provider configuration
   */
  private initializeGoogleAnalytics(provider: AnalyticsProvider): void {
    // In a real implementation, this would initialize Google Analytics
    // For demonstration purposes, we'll just log the initialization
    console.log(`Initializing Google Analytics with tracking ID: ${provider.trackingId}`);
    console.log('Options:', provider.options);

    // In a real implementation, you would include the Google Analytics script
    // and initialize it with the tracking ID and options
    // Example:
    // (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    // (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    // m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    // })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    // ga('create', provider.trackingId, 'auto');
    // if (provider.options.anonymizeIp) {
    //   ga('set', 'anonymizeIp', true);
    // }
  }

  /**
   * Initializes Mixpanel
   * 
   * @param provider - The Mixpanel provider configuration
   */
  private initializeMixpanel(provider: AnalyticsProvider): void {
    // In a real implementation, this would initialize Mixpanel
    // For demonstration purposes, we'll just log the initialization
    console.log(`Initializing Mixpanel with token: ${provider.token}`);
    console.log('Options:', provider.options);

    // In a real implementation, you would include the Mixpanel script
    // and initialize it with the token and options
    // Example:
    // (function(e,a){if(!a.__SV){var b=window;try{var c,l,i,j=b.location,g=j.hash;c=function(a,b){return(l=a.match(RegExp(b+"=([^&]*)")))?l[1]:null};g&&c(g,"state")&&(i=JSON.parse(decodeURIComponent(c(g,"state"))),"mpeditor"===i.action&&(b.sessionStorage.setItem("_mpcehash",g),history.replaceState(i.desiredHash||"",e.title,j.pathname+j.search)))}catch(m){}var k,h;window.mixpanel=a;a._i=[];a.init=function(b,c,f){function e(b,a){var c=a.split(".");2==c.length&&(b=b[c[0]],a=c[1]);b[a]=function(){b.push([a].concat(Array.prototype.slice.call(arguments,0)))}}var d=a;"undefined"!==typeof f?d=a[f]=[]:f="mixpanel";d.people=d.people||[];d.toString=function(b){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);b||(a+=" (stub)");return a};d.people.toString=function(){return d.toString(1)+".people (stub)"};k="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
    // for(h=0;h<k.length;h++)e(d,k[h]);a._i.push([b,c,f])};a.__SV=1.2;b=e.createElement("script");b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";c=e.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c)}})(document,window.mixpanel||[]);
    // mixpanel.init(provider.token, provider.options);
  }

  /**
   * Initializes custom logger
   * 
   * @param provider - The custom logger provider configuration
   */
  private initializeCustomLogger(provider: AnalyticsProvider): void {
    // In a real implementation, this would initialize a custom logger
    // For demonstration purposes, we'll just log the initialization
    console.log(`Initializing custom logger with endpoint: ${provider.endpoint}`);
    console.log('Options:', provider.options);
  }

  /**
   * Tracks a page view
   * 
   * @param path - The page path
   * @param title - The page title
   */
  trackPageView(path: string, title: string): void {
    // Skip if not in browser
    if (!this.isBrowser) {
      return;
    }
    
    const config = this.analyticsConfigSignal();
    if (!config || !config.analyticsEnabled) {
      return;
    }

    // Check if this event should be sampled
    if (!this.shouldTrackEvent('pageView')) {
      return;
    }

    // Validate required properties
    const eventDef = config.eventDefinitions['pageView'];
    if (!eventDef || !path || !title) {
      console.warn('Missing required properties for pageView event');
      return;
    }

    const eventData = {
      pagePath: path,
      pageTitle: title,
      timestamp: new Date().toISOString()
    };

    this.trackEvent('pageView', eventData);
  }

  /**
   * Tracks a button click
   * 
   * @param buttonId - The button ID
   * @param buttonText - The button text
   * @param properties - Additional properties
   */
  trackButtonClick(buttonId: string, buttonText: string, properties: Record<string, any> = {}): void {
    // Skip if not in browser
    if (!this.isBrowser) {
      return;
    }
    
    const config = this.analyticsConfigSignal();
    if (!config || !config.analyticsEnabled) {
      return;
    }

    // Check if this event should be sampled
    if (!this.shouldTrackEvent('buttonClick')) {
      return;
    }

    // Validate required properties
    const eventDef = config.eventDefinitions['buttonClick'];
    if (!eventDef || !buttonId || !buttonText) {
      console.warn('Missing required properties for buttonClick event');
      return;
    }

    const eventData = {
      buttonId,
      buttonText,
      timestamp: new Date().toISOString(),
      ...properties
    };

    this.trackEvent('buttonClick', eventData);
  }

  /**
   * Tracks a form submission
   * 
   * @param formId - The form ID
   * @param formName - The form name
   * @param properties - Additional properties
   */
  trackFormSubmit(formId: string, formName: string, properties: Record<string, any> = {}): void {
    // Skip if not in browser
    if (!this.isBrowser) {
      return;
    }
    
    const config = this.analyticsConfigSignal();
    if (!config || !config.analyticsEnabled) {
      return;
    }

    // Check if this event should be sampled
    if (!this.shouldTrackEvent('formSubmit')) {
      return;
    }

    // Validate required properties
    const eventDef = config.eventDefinitions['formSubmit'];
    if (!eventDef || !formId || !formName) {
      console.warn('Missing required properties for formSubmit event');
      return;
    }

    const eventData = {
      formId,
      formName,
      timestamp: new Date().toISOString(),
      ...properties
    };

    this.trackEvent('formSubmit', eventData);
  }

  /**
   * Tracks an error
   * 
   * @param errorMessage - The error message
   * @param errorType - The error type
   * @param properties - Additional properties
   */
  trackError(errorMessage: string, errorType: string, properties: Record<string, any> = {}): void {
    // Skip if not in browser
    if (!this.isBrowser) {
      return;
    }
    
    const config = this.analyticsConfigSignal();
    if (!config || !config.analyticsEnabled) {
      return;
    }

    // Check if this event should be sampled
    if (!this.shouldTrackEvent('error')) {
      return;
    }

    // Validate required properties
    const eventDef = config.eventDefinitions['error'];
    if (!eventDef || !errorMessage || !errorType) {
      console.warn('Missing required properties for error event');
      return;
    }

    const eventData = {
      errorMessage,
      errorType,
      timestamp: new Date().toISOString(),
      ...properties
    };

    this.trackEvent('error', eventData);
  }

  /**
   * Tracks a performance metric
   * 
   * @param metricName - The metric name
   * @param metricValue - The metric value
   * @param properties - Additional properties
   */
  trackPerformance(metricName: string, metricValue: number, properties: Record<string, any> = {}): void {
    // Skip if not in browser
    if (!this.isBrowser) {
      return;
    }
    
    const config = this.analyticsConfigSignal();
    if (!config || !config.analyticsEnabled) {
      return;
    }

    // Check if this event should be sampled
    if (!this.shouldTrackEvent('performance')) {
      return;
    }

    // Validate required properties
    const eventDef = config.eventDefinitions['performance'];
    if (!eventDef || !metricName || metricValue === undefined) {
      console.warn('Missing required properties for performance event');
      return;
    }

    const eventData = {
      metricName,
      metricValue,
      timestamp: new Date().toISOString(),
      ...properties
    };

    this.trackEvent('performance', eventData);
  }

  /**
   * Tracks a custom event
   * 
   * @param eventName - The event name
   * @param properties - The event properties
   */
  trackCustomEvent(eventName: string, properties: Record<string, any> = {}): void {
    // Skip if not in browser
    if (!this.isBrowser) {
      return;
    }
    
    const config = this.analyticsConfigSignal();
    if (!config || !config.analyticsEnabled) {
      return;
    }

    // Check if this event should be sampled
    if (!this.shouldTrackEvent(eventName)) {
      return;
    }

    const eventData = {
      ...properties,
      timestamp: new Date().toISOString()
    };

    this.trackEvent(eventName, eventData);
  }

  /**
   * Tracks an event across all enabled providers
   * 
   * @param eventName - The event name
   * @param eventData - The event data
   */
  private trackEvent(eventName: string, eventData: Record<string, any>): void {
    const config = this.analyticsConfigSignal();
    if (!config) {
      return;
    }

    // Track event across all enabled providers
    config.providers.forEach(provider => {
      if (provider.enabled) {
        this.trackEventWithProvider(provider, eventName, eventData);
      }
    });

    // Log event in debug mode
    if (config.debugMode) {
      console.log(`[Analytics] ${eventName}:`, eventData);
    }
  }

  /**
   * Tracks an event with a specific provider
   * 
   * @param provider - The provider
   * @param eventName - The event name
   * @param eventData - The event data
   */
  private trackEventWithProvider(
    provider: AnalyticsProvider, 
    eventName: string, 
    eventData: Record<string, any>
  ): void {
    switch (provider.name) {
      case 'google-analytics':
        // In a real implementation, this would track the event with Google Analytics
        // Example: ga('send', 'event', eventCategory, eventName, eventData);
        break;
      case 'mixpanel':
        // In a real implementation, this would track the event with Mixpanel
        // Example: mixpanel.track(eventName, eventData);
        break;
      case 'custom-logger':
        // In a real implementation, this would track the event with a custom logger
        // Example: send event data to the configured endpoint
        break;
    }
  }

  /**
   * Identifies the current user
   * 
   * @param userId - The user ID
   * @param traits - User traits
   */
  identifyUser(userId?: string, traits: Record<string, any> = {}): void {
    // Skip if not in browser
    if (!this.isBrowser) {
      return;
    }
    
    const config = this.analyticsConfigSignal();
    if (!config || !config.analyticsEnabled) {
      return;
    }

    // Skip if already identified or anonymized by default
    if (this.userIdentified || config.userProperties.anonymizeByDefault) {
      return;
    }

    // Filter traits to only include allowed properties
    const allowedTraits: Record<string, any> = {};
    const allowedProperties = config.userProperties.allowedProperties;
    
    Object.keys(traits).forEach(key => {
      if (allowedProperties.includes(key)) {
        allowedTraits[key] = traits[key];
      }
    });

    // Identify user across all enabled providers
    config.providers.forEach(provider => {
      if (provider.enabled) {
        this.identifyUserWithProvider(provider, userId, allowedTraits);
      }
    });

    this.userIdentified = true;

    // Log identification in debug mode
    if (config.debugMode) {
      console.log(`[Analytics] Identified user:`, { userId, traits: allowedTraits });
    }
  }

  /**
   * Identifies the current user with a specific provider
   * 
   * @param provider - The provider
   * @param userId - The user ID
   * @param traits - User traits
   */
  private identifyUserWithProvider(
    provider: AnalyticsProvider, 
    userId?: string, 
    traits: Record<string, any> = {}
  ): void {
    switch (provider.name) {
      case 'google-analytics':
        // In a real implementation, this would identify the user with Google Analytics
        // Example: ga('set', 'userId', userId);
        break;
      case 'mixpanel':
        // In a real implementation, this would identify the user with Mixpanel
        // Example: mixpanel.identify(userId); mixpanel.people.set(traits);
        break;
      case 'custom-logger':
        // In a real implementation, this would identify the user with a custom logger
        break;
    }
  }

  /**
   * Determines if an event should be tracked based on sampling rate
   * 
   * @param eventName - The event name
   * @returns boolean - Whether the event should be tracked
   */
  private shouldTrackEvent(eventName: string): boolean {
    const config = this.analyticsConfigSignal();
    if (!config) {
      return false;
    }

    // Get sampling rate for this event (default to 1.0 if not specified)
    const samplingRate = config.eventSampling[eventName] ?? 1.0;
    
    // If sampling rate is 0, never track
    if (samplingRate <= 0) {
      return false;
    }
    
    // If sampling rate is 1, always track
    if (samplingRate >= 1) {
      return true;
    }
    
    // Otherwise, randomly sample based on rate
    return Math.random() < samplingRate;
  }

  /**
   * Checks if Do Not Track is enabled in the browser
   * 
   * @returns boolean - Whether Do Not Track is enabled
   */
  private isDoNotTrackEnabled(): boolean {
    // Skip if not in browser
    if (!this.isBrowser) {
      return false;
    }
    
    const dnt = navigator.doNotTrack || 
                (window as any).doNotTrack || 
                (navigator as any).msDoNotTrack;
                
    return dnt === '1' || dnt === 'yes' || dnt === true;
  }

  /**
   * Provides a default analytics configuration in case the JSON file cannot be loaded
   * 
   * @returns AnalyticsModel - The default analytics configuration
   */
  private getDefaultAnalyticsConfig(): AnalyticsModel {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      analyticsEnabled: false,
      providers: [],
      eventSampling: {
        buttonClick: 1.0,
        pageView: 1.0,
        formSubmit: 1.0,
        error: 1.0,
        performance: 0.5
      },
      eventDefinitions: {
        buttonClick: {
          requiredProperties: ['buttonId', 'buttonText'],
          optionalProperties: ['pageContext']
        },
        pageView: {
          requiredProperties: ['pagePath', 'pageTitle'],
          optionalProperties: ['referrer']
        },
        formSubmit: {
          requiredProperties: ['formId', 'formName'],
          optionalProperties: ['formFields']
        },
        error: {
          requiredProperties: ['errorMessage', 'errorType'],
          optionalProperties: ['stackTrace']
        },
        performance: {
          requiredProperties: ['metricName', 'metricValue'],
          optionalProperties: ['metricUnit']
        }
      },
      userProperties: {
        allowedProperties: ['userId', 'userRole'],
        identifyOnInit: false,
        anonymizeByDefault: true
      },
      privacySettings: {
        cookieConsent: true,
        dataRetentionDays: 90,
        allowDoNotTrack: true,
        respectGdpr: true
      },
      debugMode: false
    };
  }
} 