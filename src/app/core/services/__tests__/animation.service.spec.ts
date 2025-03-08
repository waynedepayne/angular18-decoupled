import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnimationService } from '../animation.service';
import { AnimationModel } from '../../models/animation.model';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PLATFORM_ID } from '@angular/core';

describe('AnimationService', () => {
  let service: AnimationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, BrowserAnimationsModule],
      providers: [
        AnimationService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(AnimationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load animations from assets/animations.json', () => {
    const mockAnimations: AnimationModel = {
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      settings: {
        enabled: true,
        defaultDuration: 300,
        defaultEasing: 'ease-out',
        defaultDelay: 0,
        reducedMotion: {
          respectUserPreference: true,
          alternativeDuration: 0
        }
      },
      animations: {
        fadeIn: {
          type: 'fade',
          duration: 300,
          easing: 'ease-out',
          reverse: false
        }
      },
      sequences: {
        pageEnter: {
          description: 'Animation sequence for page entry',
          steps: [
            {
              animation: 'fadeIn',
              target: '.page-container',
              duration: 500
            }
          ]
        }
      }
    };

    service.loadAnimations().subscribe(animations => {
      expect(animations).toEqual(mockAnimations);
      expect(service.animations()['fadeIn']).toBeTruthy();
      expect(service.sequences()['pageEnter']).toBeTruthy();
    });

    const req = httpMock.expectOne('assets/animations.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockAnimations);
  });

  it('should return default animations when HTTP request fails', () => {
    service.loadAnimations().subscribe(animations => {
      expect(animations).toBeTruthy();
      expect(service.settings().enabled).toBe(true);
      expect(Object.keys(service.animations()).length).toBeGreaterThan(0);
      expect(Object.keys(service.sequences()).length).toBeGreaterThan(0);
    });

    const req = httpMock.expectOne('assets/animations.json');
    req.error(new ErrorEvent('Network error'));
  });

  it('should get animation definition by name', () => {
    // Manually set animation data for testing
    service['animationSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      settings: {
        enabled: true,
        defaultDuration: 300,
        defaultEasing: 'ease-out',
        defaultDelay: 0,
        reducedMotion: {
          respectUserPreference: true,
          alternativeDuration: 0
        }
      },
      animations: {
        fadeIn: {
          type: 'fade',
          duration: 300,
          easing: 'ease-out',
          reverse: false
        },
        slideInLeft: {
          type: 'slide',
          duration: 300,
          easing: 'ease-out',
          params: {
            direction: 'left',
            distance: '100%'
          }
        }
      },
      sequences: {}
    });

    const fadeIn = service.getAnimationDefinition('fadeIn');
    expect(fadeIn).toBeTruthy();
    expect(fadeIn?.type).toBe('fade');
    expect(fadeIn?.duration).toBe(300);

    const slideInLeft = service.getAnimationDefinition('slideInLeft');
    expect(slideInLeft).toBeTruthy();
    expect(slideInLeft?.type).toBe('slide');
    expect(slideInLeft?.params?.direction).toBe('left');

    const nonExistent = service.getAnimationDefinition('nonExistent');
    expect(nonExistent).toBeUndefined();
  });

  it('should get animation sequence by name', () => {
    // Manually set animation data for testing
    service['animationSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      settings: {
        enabled: true,
        defaultDuration: 300,
        defaultEasing: 'ease-out',
        defaultDelay: 0,
        reducedMotion: {
          respectUserPreference: true,
          alternativeDuration: 0
        }
      },
      animations: {},
      sequences: {
        pageEnter: {
          description: 'Animation sequence for page entry',
          steps: [
            {
              animation: 'fadeIn',
              target: '.page-container',
              duration: 500
            }
          ]
        },
        pageExit: {
          description: 'Animation sequence for page exit',
          steps: [
            {
              animation: 'fadeOut',
              target: '.page-container',
              duration: 300
            }
          ]
        }
      }
    });

    const pageEnter = service.getAnimationSequence('pageEnter');
    expect(pageEnter).toBeTruthy();
    expect(pageEnter?.description).toBe('Animation sequence for page entry');
    expect(pageEnter?.steps.length).toBe(1);
    expect(pageEnter?.steps[0].animation).toBe('fadeIn');

    const pageExit = service.getAnimationSequence('pageExit');
    expect(pageExit).toBeTruthy();
    expect(pageExit?.description).toBe('Animation sequence for page exit');
    expect(pageExit?.steps[0].animation).toBe('fadeOut');

    const nonExistent = service.getAnimationSequence('nonExistent');
    expect(nonExistent).toBeUndefined();
  });

  it('should create animation factory', () => {
    // Manually set animation data for testing
    service['animationSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      settings: {
        enabled: true,
        defaultDuration: 300,
        defaultEasing: 'ease-out',
        defaultDelay: 0,
        reducedMotion: {
          respectUserPreference: true,
          alternativeDuration: 0
        }
      },
      animations: {
        fadeIn: {
          type: 'fade',
          duration: 300,
          easing: 'ease-out',
          reverse: false
        }
      },
      sequences: {}
    });

    const factory = service.createAnimation('fadeIn');
    expect(factory).toBeTruthy();

    // Test with non-existent animation
    const nonExistentFactory = service.createAnimation('nonExistent');
    expect(nonExistentFactory).toBeTruthy(); // Should return an empty animation factory
  });

  it('should respect reduced motion preference', () => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: function mockMatchMedia(query: string) {
        return {
          matches: true, // Simulate user preferring reduced motion
          media: query,
          onchange: null,
          addListener: function() {},
          removeListener: function() {},
          addEventListener: function() {},
          removeEventListener: function() {},
          dispatchEvent: function() { return true; },
        };
      }
    });

    // Manually set animation data for testing
    service['animationSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      settings: {
        enabled: true,
        defaultDuration: 300,
        defaultEasing: 'ease-out',
        defaultDelay: 0,
        reducedMotion: {
          respectUserPreference: true,
          alternativeDuration: 0
        }
      },
      animations: {},
      sequences: {}
    });

    // Test if animations are disabled when user prefers reduced motion
    expect(service.animationsEnabled()).toBe(false);

    // Test if duration is adjusted for reduced motion
    expect(service.getDuration(500)).toBe(0);
  });
}); 