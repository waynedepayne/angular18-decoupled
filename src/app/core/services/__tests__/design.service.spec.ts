import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DesignService } from '../design.service';
import { DesignModel } from '../../models/design.model';

describe('DesignService', () => {
  let service: DesignService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DesignService]
    });
    service = TestBed.inject(DesignService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load design configuration from assets/design.json', () => {
    const mockDesign: DesignModel = {
      layouts: {
        default: {
          header: {
            type: 'header',
            height: '64px',
            components: [
              {
                type: 'logo',
                position: 'left',
                text: 'Test App'
              }
            ]
          },
          footer: {
            type: 'footer',
            height: '50px',
            components: [
              {
                type: 'text',
                position: 'center',
                content: 'Test Footer'
              }
            ]
          }
        }
      },
      themes: {
        light: {
          colors: {
            primary: '#3f51b5',
            secondary: '#f50057',
            background: '#ffffff',
            surface: '#f5f5f5',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3',
            success: '#4caf50',
            text: {
              primary: 'rgba(0, 0, 0, 0.87)',
              secondary: 'rgba(0, 0, 0, 0.6)',
              disabled: 'rgba(0, 0, 0, 0.38)'
            }
          },
          typography: {
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: {
              small: '0.875rem',
              medium: '1rem',
              large: '1.25rem',
              xlarge: '1.5rem',
              xxlarge: '2rem'
            }
          },
          spacing: {
            xs: '4px',
            sm: '8px',
            md: '16px',
            lg: '24px',
            xl: '32px',
            xxl: '48px'
          },
          borderRadius: {
            small: '4px',
            medium: '8px',
            large: '16px',
            circle: '50%'
          }
        }
      },
      components: {
        button: {
          variants: {
            primary: {
              borderRadius: '4px',
              padding: '8px 16px'
            }
          }
        }
      }
    };

    service.loadDesign().subscribe(design => {
      expect(design).toEqual(mockDesign);
      expect(service.design()).toEqual(mockDesign);
      expect(service.layouts()).toEqual(mockDesign.layouts);
      expect(service.themes()).toEqual(mockDesign.themes);
      expect(service.components()).toEqual(mockDesign.components);
    });

    const req = httpMock.expectOne('assets/design.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockDesign);
  });

  it('should get a specific layout by name', () => {
    const mockLayout = {
      header: {
        type: 'header',
        height: '64px',
        components: []
      }
    };

    // Set the design data manually
    service['designSignal'].set({
      layouts: {
        testLayout: mockLayout
      },
      themes: {},
      components: {}
    });

    const layout = service.getLayout('testLayout');
    expect(layout).toEqual(mockLayout);
  });

  it('should toggle between light and dark themes', () => {
    // Set the design data manually
    service['designSignal'].set({
      layouts: {},
      themes: {
        light: {
          colors: { primary: '#fff', secondary: '#000', background: '#fff', surface: '#fff', error: '#f00', warning: '#ff0', info: '#00f', success: '#0f0', text: { primary: '#000', secondary: '#000', disabled: '#000' } },
          typography: { fontFamily: 'Arial', fontSize: { small: '12px', medium: '14px', large: '16px', xlarge: '18px', xxlarge: '24px' } },
          spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px' },
          borderRadius: { small: '4px', medium: '8px', large: '16px', circle: '50%' }
        },
        dark: {
          colors: { primary: '#000', secondary: '#fff', background: '#000', surface: '#000', error: '#f00', warning: '#ff0', info: '#00f', success: '#0f0', text: { primary: '#fff', secondary: '#fff', disabled: '#fff' } },
          typography: { fontFamily: 'Arial', fontSize: { small: '12px', medium: '14px', large: '16px', xlarge: '18px', xxlarge: '24px' } },
          spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px' },
          borderRadius: { small: '4px', medium: '8px', large: '16px', circle: '50%' }
        }
      },
      components: {}
    });

    // Initial theme should be light
    expect(service.activeThemeName()).toBe('light');

    // Toggle to dark
    service.toggleTheme();
    expect(service.activeThemeName()).toBe('dark');

    // Toggle back to light
    service.toggleTheme();
    expect(service.activeThemeName()).toBe('light');
  });

  it('should handle error when loading design configuration fails', () => {
    // Spy on console.error to verify it's called
    spyOn(console, 'error');
    
    service.loadDesign().subscribe(design => {
      // Should return default design
      expect(design).toBeTruthy();
      expect(service.design()).toBeTruthy();
      expect(service.activeThemeName()).toBe('light');
      expect(console.error).toHaveBeenCalled();
    });

    const req = httpMock.expectOne('assets/design.json');
    req.error(new ErrorEvent('Network error'));
  });
  
  it('should set active theme correctly', () => {
    const mockDesign = {
      layouts: {},
      themes: {
        light: {
          colors: { primary: '#ffffff' },
          typography: {},
          spacing: {},
          borderRadius: {}
        },
        dark: {
          colors: { primary: '#000000' },
          typography: {},
          spacing: {},
          borderRadius: {}
        }
      },
      components: {}
    };
    
    // Load mock design
    service.loadDesign().subscribe();
    const req = httpMock.expectOne('assets/design.json');
    req.flush(mockDesign);
    
    // Test theme switching
    service.setActiveTheme('dark');
    expect(service.activeThemeName()).toBe('dark');
    expect(service.colors()?.primary).toBe('#000000');
    
    service.setActiveTheme('light');
    expect(service.activeThemeName()).toBe('light');
    expect(service.colors()?.primary).toBe('#ffffff');
  });
  
  it('should toggle between light and dark themes', () => {
    const mockDesign = {
      layouts: {},
      themes: {
        light: { colors: {} },
        dark: { colors: {} }
      },
      components: {}
    };
    
    // Load mock design
    service.loadDesign().subscribe();
    const req = httpMock.expectOne('assets/design.json');
    req.flush(mockDesign);
    
    // Start with light theme
    service.setActiveTheme('light');
    expect(service.activeThemeName()).toBe('light');
    
    // Toggle to dark
    service.toggleTheme();
    expect(service.activeThemeName()).toBe('dark');
    
    // Toggle back to light
    service.toggleTheme();
    expect(service.activeThemeName()).toBe('light');
  });
  
  it('should retrieve layout by name', () => {
    const mockDesign = {
      layouts: {
        dashboard: { type: 'grid', columns: 3 },
        profile: { type: 'flex', direction: 'column' }
      },
      themes: {},
      components: {}
    };
    
    // Load mock design
    service.loadDesign().subscribe();
    const req = httpMock.expectOne('assets/design.json');
    req.flush(mockDesign);
    
    // Test layout retrieval
    const dashboardLayout = service.getLayout('dashboard');
    expect(dashboardLayout).toBeTruthy();
    expect(dashboardLayout?.type).toBe('grid');
    expect(dashboardLayout?.columns).toBe(3);
    
    const profileLayout = service.getLayout('profile');
    expect(profileLayout).toBeTruthy();
    expect(profileLayout?.type).toBe('flex');
    
    // Test non-existent layout
    const nonExistentLayout = service.getLayout('nonexistent');
    expect(nonExistentLayout).toBeNull();
  });
  
  it('should retrieve component definition by name', () => {
    const mockDesign = {
      layouts: {},
      themes: {},
      components: {
        button: { type: 'button', variants: ['primary', 'secondary'] },
        card: { type: 'container', shadow: true }
      }
    };
    
    // Load mock design
    service.loadDesign().subscribe();
    const req = httpMock.expectOne('assets/design.json');
    req.flush(mockDesign);
    
    // Test component retrieval
    const buttonComponent = service.getComponentDefinition('button');
    expect(buttonComponent).toBeTruthy();
    expect(buttonComponent?.type).toBe('button');
    expect(buttonComponent?.variants).toContain('primary');
    
    const cardComponent = service.getComponentDefinition('card');
    expect(cardComponent).toBeTruthy();
    expect(cardComponent?.type).toBe('container');
    expect(cardComponent?.shadow).toBeTrue();
    
    // Test non-existent component
    const nonExistentComponent = service.getComponentDefinition('nonexistent');
    expect(nonExistentComponent).toBeNull();
  });
}); 