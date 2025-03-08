import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ThemingService } from '../theming.service';
import { ThemingModel } from '../../models/theming.model';
import { PLATFORM_ID } from '@angular/core';

describe('ThemingService', () => {
  let service: ThemingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ThemingService,
        { provide: PLATFORM_ID, useValue: 'browser' } // Mock browser platform
      ]
    });
    
    service = TestBed.inject(ThemingService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Mock localStorage
    const localStorageMock = {
      getItem: function(key: string) { return null; },
      setItem: function(key: string, value: string) {},
      clear: function() {}
    };
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: function mockMatchMedia(query: string) {
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: function() {},
          removeListener: function() {},
          addEventListener: function() {},
          removeEventListener: function() {},
          dispatchEvent: function() { return true; }
        };
      }
    });
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load theming from JSON file', () => {
    const mockThemingData: ThemingModel = {
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      defaultTheme: 'light',
      respectUserPreference: true,
      themes: {
        light: {
          name: 'Light',
          description: 'Default light theme',
          isDark: false,
          variables: {
            '--color-primary': '#3f51b5',
            '--color-background': '#ffffff'
          }
        },
        dark: {
          name: 'Dark',
          description: 'Default dark theme',
          isDark: true,
          variables: {
            '--color-primary': '#7986cb',
            '--color-background': '#121212'
          }
        }
      },
      fonts: {
        primaryFont: "'Segoe UI', Roboto, sans-serif",
        baseFontSize: '16px',
        fontSizes: {
          md: '1rem',
          lg: '1.25rem'
        },
        fontWeights: {
          regular: 400,
          bold: 700
        },
        lineHeights: {
          normal: 1.5
        }
      },
      breakpoints: {
        xs: '0px',
        sm: '600px',
        md: '960px',
        lg: '1280px',
        xl: '1920px'
      },
      zIndexLayers: {
        base: 0,
        modal: 1000
      },
      animationDurations: {
        standard: '300ms'
      }
    };

    service.loadTheming().subscribe(data => {
      expect(data).toEqual(mockThemingData);
      expect(service.theming()).toEqual(mockThemingData);
      expect(service.activeThemeName()).toEqual('light');
      expect(service.themeLoaded()).toBeTrue();
    });

    const req = httpMock.expectOne('assets/theming.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockThemingData);
  });

  it('should handle HTTP error and return default theming', () => {
    service.loadTheming().subscribe(data => {
      expect(data).toBeTruthy();
      expect(service.theming()).toBeTruthy();
      expect(service.activeThemeName()).toBeTruthy();
      expect(service.themeLoaded()).toBeTrue();
    });

    const req = httpMock.expectOne('assets/theming.json');
    req.error(new ErrorEvent('Network error'));
  });

  it('should set theme correctly', () => {
    // First load the theming data
    service.loadTheming().subscribe();
    
    const mockThemingData: ThemingModel = {
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      defaultTheme: 'light',
      respectUserPreference: true,
      themes: {
        light: {
          name: 'Light',
          isDark: false,
          variables: {}
        },
        dark: {
          name: 'Dark',
          isDark: true,
          variables: {}
        }
      },
      fonts: {
        primaryFont: "'Segoe UI', Roboto, sans-serif",
        baseFontSize: '16px',
        fontSizes: {
          md: '1rem'
        },
        fontWeights: {
          regular: 400
        },
        lineHeights: {
          normal: 1.5
        }
      },
      breakpoints: {
        md: '960px'
      },
      zIndexLayers: {
        base: 0
      },
      animationDurations: {
        standard: '300ms'
      }
    };
    
    const req = httpMock.expectOne('assets/theming.json');
    req.flush(mockThemingData);
    
    // Now test setting the theme
    service.setTheme('dark');
    expect(service.activeThemeName()).toBe('dark');
    expect(service.isDarkTheme()).toBeTrue();
    
    // Test setting an invalid theme
    spyOn(console, 'error');
    service.setTheme('nonexistent');
    expect(console.error).toHaveBeenCalled();
    expect(service.activeThemeName()).toBe('dark'); // Should not change
  });

  it('should toggle dark mode correctly', () => {
    // First load the theming data
    service.loadTheming().subscribe();
    
    const mockThemingData: ThemingModel = {
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      defaultTheme: 'light',
      respectUserPreference: true,
      themes: {
        light: {
          name: 'Light',
          isDark: false,
          variables: {}
        },
        dark: {
          name: 'Dark',
          isDark: true,
          variables: {}
        }
      },
      fonts: {
        primaryFont: "'Segoe UI', Roboto, sans-serif",
        baseFontSize: '16px',
        fontSizes: {
          md: '1rem'
        },
        fontWeights: {
          regular: 400
        },
        lineHeights: {
          normal: 1.5
        }
      },
      breakpoints: {
        md: '960px'
      },
      zIndexLayers: {
        base: 0
      },
      animationDurations: {
        standard: '300ms'
      }
    };
    
    const req = httpMock.expectOne('assets/theming.json');
    req.flush(mockThemingData);
    
    // Initial state should be light
    expect(service.isDarkTheme()).toBeFalse();
    
    // Toggle to dark
    service.toggleDarkMode();
    expect(service.isDarkTheme()).toBeTrue();
    
    // Toggle back to light
    service.toggleDarkMode();
    expect(service.isDarkTheme()).toBeFalse();
  });

  it('should respect user preference when loading themes', () => {
    // Mock matchMedia to return true for dark mode preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: function mockMatchMedia(query: string) {
        return {
          matches: query.includes('dark'),
          media: query,
          onchange: null,
          addListener: function() {},
          removeListener: function() {},
          addEventListener: function() {},
          removeEventListener: function() {},
          dispatchEvent: function() { return true; }
        };
      }
    });
    
    // First load the theming data
    service.loadTheming().subscribe();
    
    const mockThemingData: ThemingModel = {
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      defaultTheme: 'light',
      respectUserPreference: true,
      themes: {
        light: {
          name: 'Light',
          isDark: false,
          variables: {}
        },
        dark: {
          name: 'Dark',
          isDark: true,
          variables: {}
        }
      },
      fonts: {
        primaryFont: "'Segoe UI', Roboto, sans-serif",
        baseFontSize: '16px',
        fontSizes: {
          md: '1rem'
        },
        fontWeights: {
          regular: 400
        },
        lineHeights: {
          normal: 1.5
        }
      },
      breakpoints: {
        md: '960px'
      },
      zIndexLayers: {
        base: 0
      },
      animationDurations: {
        standard: '300ms'
      }
    };
    
    const req = httpMock.expectOne('assets/theming.json');
    req.flush(mockThemingData);
    
    // Should have selected dark theme based on user preference
    expect(service.isDarkTheme()).toBeTrue();
  });
}); 