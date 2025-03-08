import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SeoService } from '../seo.service';
import { Meta, Title } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { DOCUMENT } from '@angular/common';

describe('SeoService', () => {
  let service: SeoService;
  let httpMock: HttpTestingController;
  let titleService: Title;
  let metaService: Meta;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        SeoService,
        Title,
        Meta,
        { provide: DOCUMENT, useValue: document }
      ]
    });

    service = TestBed.inject(SeoService);
    httpMock = TestBed.inject(HttpTestingController);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
    document = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load SEO configuration from JSON file', () => {
    const mockSeoConfig = {
      global: {
        siteName: 'Test Site',
        titleSeparator: ' | ',
        defaultDescription: 'Test description',
        appendSiteNameToTitle: true
      },
      routes: [
        {
          path: '/',
          title: 'Home',
          meta: [
            { name: 'description', content: 'Home description' }
          ]
        }
      ]
    };

    service.loadSeoConfig().subscribe(config => {
      expect(config).toEqual(mockSeoConfig);
    });

    const req = httpMock.expectOne('assets/seo.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockSeoConfig);
  });

  it('should handle error when loading SEO configuration', () => {
    spyOn(console, 'error');

    service.loadSeoConfig().subscribe(config => {
      expect(config).toBeDefined();
      expect(config.global.siteName).toBe('Angular Enterprise App');
    });

    const req = httpMock.expectOne('assets/seo.json');
    req.error(new ErrorEvent('Network error'));
  });

  it('should set dynamic title', () => {
    const mockSeoConfig = {
      global: {
        siteName: 'Test Site',
        titleSeparator: ' | ',
        appendSiteNameToTitle: true
      },
      routes: []
    };

    spyOn(titleService, 'setTitle');

    // Set mock config
    service['seoConfig$'].next(mockSeoConfig);

    // Call the method
    service.setDynamicTitle('Dynamic Title');

    // Verify title was set with site name
    expect(titleService.setTitle).toHaveBeenCalledWith('Dynamic Title | Test Site');
  });

  it('should set dynamic meta tag', () => {
    spyOn(metaService, 'updateTag');

    // Call the method
    service.setDynamicMetaTag({ name: 'description', content: 'Dynamic description' });

    // Verify meta tag was set
    expect(metaService.updateTag).toHaveBeenCalledWith({ 
      name: 'description', 
      content: 'Dynamic description' 
    });
  });

  it('should get prerender routes', () => {
    const mockSeoConfig = {
      global: {
        siteName: 'Test Site',
        titleSeparator: ' | '
      },
      routes: [
        { path: '/', title: 'Home', prerender: true },
        { path: '/about', title: 'About', prerender: true },
        { path: '/contact', title: 'Contact', prerender: false }
      ]
    };

    // Set mock config
    service['seoConfig$'].next(mockSeoConfig);

    // Call the method
    const prerenderRoutes = service.getPrerenderRoutes();

    // Verify prerender routes
    expect(prerenderRoutes).toEqual(['/', '/about']);
  });

  it('should normalize route paths correctly', () => {
    // Access private method for testing
    const normalizeRoutePath = (service as any).normalizeRoutePath.bind(service);

    // Test various path formats
    expect(normalizeRoutePath('/path')).toBe('/path');
    expect(normalizeRoutePath('path')).toBe('/path');
    expect(normalizeRoutePath('/path/')).toBe('/path');
    expect(normalizeRoutePath('/path?query=test')).toBe('/path');
    expect(normalizeRoutePath('/path#hash')).toBe('/path');
    expect(normalizeRoutePath('/')).toBe('/');
  });
}); 