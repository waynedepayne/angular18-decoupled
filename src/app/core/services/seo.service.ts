import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { BehaviorSubject, Observable, catchError, filter, map, of, shareReplay, tap } from 'rxjs';
import { SeoConfig, RouteSeoConfig, MetaTag } from '../models/seo.model';

/**
 * SEO Service
 * 
 * This service is responsible for loading and managing SEO configuration from seo.json.
 * It provides functionality to update meta tags, titles, and structured data based on routes.
 */
@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly jsonUrl = 'assets/seo.json';
  private seoConfig$ = new BehaviorSubject<SeoConfig | null>(null);
  private currentRoute: string | null = null;
  private structuredDataElements: HTMLScriptElement[] = [];

  /**
   * Constructor
   */
  constructor(
    private http: HttpClient,
    private meta: Meta,
    private title: Title,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Listen to route changes to update SEO
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects;
      this.updateSeoForCurrentRoute();
    });
  }

  /**
   * Load SEO configuration from JSON file
   */
  loadSeoConfig(): Observable<SeoConfig> {
    return this.http.get<SeoConfig>(this.jsonUrl).pipe(
      tap(config => {
        this.seoConfig$.next(config);
        // Initial update for the current route
        this.updateSeoForCurrentRoute();
      }),
      catchError(error => {
        console.error('Error loading SEO configuration:', error);
        // Return a minimal default configuration
        const defaultConfig: SeoConfig = {
          global: {
            siteName: 'Angular Enterprise App',
            titleSeparator: ' | ',
            appendSiteNameToTitle: true
          },
          routes: []
        };
        this.seoConfig$.next(defaultConfig);
        return of(defaultConfig);
      }),
      shareReplay(1)
    );
  }

  /**
   * Get the current SEO configuration
   */
  getSeoConfig(): Observable<SeoConfig | null> {
    return this.seoConfig$.asObservable();
  }

  /**
   * Update SEO for the current route
   */
  private updateSeoForCurrentRoute(): void {
    const config = this.seoConfig$.getValue();
    if (!config || !this.currentRoute) {
      return;
    }

    // Find the matching route configuration
    const routePath = this.normalizeRoutePath(this.currentRoute);
    const routeConfig = this.findRouteConfig(routePath, config);

    if (routeConfig) {
      this.updateTitle(routeConfig, config);
      this.updateMetaTags(routeConfig, config);
      this.updateCanonicalLink(routeConfig, config);
      this.updateStructuredData(routeConfig, config);
    } else if (config.defaultRoute) {
      // Apply default route configuration
      this.updateTitle(config.defaultRoute, config);
      this.updateMetaTags(config.defaultRoute, config);
      this.updateCanonicalLink(config.defaultRoute, config);
      this.updateStructuredData(config.defaultRoute, config);
    }
  }

  /**
   * Find the route configuration that matches the current path
   */
  private findRouteConfig(path: string, config: SeoConfig): RouteSeoConfig | null {
    // First try exact match
    let routeConfig = config.routes.find(route => this.normalizeRoutePath(route.path) === path);
    
    // If no exact match, try wildcard matching
    if (!routeConfig) {
      routeConfig = config.routes.find(route => {
        const routePath = this.normalizeRoutePath(route.path);
        return routePath.endsWith('*') && path.startsWith(routePath.slice(0, -1));
      });
    }

    return routeConfig || null;
  }

  /**
   * Normalize route path for comparison
   */
  private normalizeRoutePath(path: string): string {
    // Remove query parameters and hash
    let normalizedPath = path.split('?')[0].split('#')[0];
    
    // Remove trailing slash if present (except for root path)
    if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
      normalizedPath = normalizedPath.slice(0, -1);
    }
    
    // Ensure path starts with /
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath;
    }
    
    return normalizedPath;
  }

  /**
   * Update page title
   */
  private updateTitle(routeConfig: RouteSeoConfig, config: SeoConfig): void {
    let pageTitle = routeConfig.title;
    
    // Append site name if configured
    if (config.global.appendSiteNameToTitle) {
      pageTitle = `${pageTitle}${config.global.titleSeparator}${config.global.siteName}`;
    }
    
    this.title.setTitle(pageTitle);
  }

  /**
   * Update meta tags
   */
  private updateMetaTags(routeConfig: RouteSeoConfig, config: SeoConfig): void {
    // Clear existing meta tags (except charset and viewport)
    this.meta.removeTag('name="description"');
    this.meta.removeTag('name="keywords"');
    this.meta.removeTag('name="robots"');
    
    // Remove all og: and twitter: tags
    this.document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]').forEach(el => {
      el.parentNode?.removeChild(el);
    });
    
    // Set description
    if (routeConfig.meta?.find(tag => tag.name === 'description')) {
      // Use route-specific description
      const descTag = routeConfig.meta.find(tag => tag.name === 'description');
      if (descTag) {
        this.meta.updateTag({ name: 'description', content: descTag.content });
      }
    } else if (config.global.defaultDescription) {
      // Use global default description
      this.meta.updateTag({ name: 'description', content: config.global.defaultDescription });
    }
    
    // Set keywords
    if (routeConfig.meta?.find(tag => tag.name === 'keywords')) {
      // Use route-specific keywords
      const keywordsTag = routeConfig.meta.find(tag => tag.name === 'keywords');
      if (keywordsTag) {
        this.meta.updateTag({ name: 'keywords', content: keywordsTag.content });
      }
    } else if (config.global.defaultKeywords) {
      // Use global default keywords
      this.meta.updateTag({ name: 'keywords', content: config.global.defaultKeywords });
    }
    
    // Set robots
    if (routeConfig.robots) {
      this.meta.updateTag({ name: 'robots', content: routeConfig.robots });
    } else if (config.global.defaultRobots) {
      this.meta.updateTag({ name: 'robots', content: config.global.defaultRobots });
    }
    
    // Add all other meta tags
    if (routeConfig.meta) {
      routeConfig.meta.forEach(tag => {
        if (tag.name && tag.name !== 'description' && tag.name !== 'keywords' && tag.name !== 'robots') {
          this.meta.updateTag({ name: tag.name, content: tag.content });
        } else if (tag.property) {
          this.meta.updateTag({ property: tag.property, content: tag.content });
        } else if (tag.httpEquiv) {
          this.meta.updateTag({ httpEquiv: tag.httpEquiv, content: tag.content });
        }
      });
    }
    
    // Add Open Graph tags
    if (routeConfig.og) {
      const og = routeConfig.og;
      
      if (og.title) {
        this.meta.updateTag({ property: 'og:title', content: og.title });
      } else {
        this.meta.updateTag({ property: 'og:title', content: routeConfig.title });
      }
      
      if (og.description) {
        this.meta.updateTag({ property: 'og:description', content: og.description });
      }
      
      if (og.type) {
        this.meta.updateTag({ property: 'og:type', content: og.type });
      } else if (config.socialMedia?.facebook?.defaultType) {
        this.meta.updateTag({ property: 'og:type', content: config.socialMedia.facebook.defaultType });
      } else {
        this.meta.updateTag({ property: 'og:type', content: 'website' });
      }
      
      if (og.image) {
        this.meta.updateTag({ property: 'og:image', content: og.image });
      }
      
      if (og.url) {
        this.meta.updateTag({ property: 'og:url', content: og.url });
      } else if (isPlatformBrowser(this.platformId)) {
        this.meta.updateTag({ property: 'og:url', content: this.document.URL });
      }
      
      // Add Facebook app ID if available
      if (config.socialMedia?.facebook?.appId) {
        this.meta.updateTag({ property: 'fb:app_id', content: config.socialMedia.facebook.appId });
      }
      
      // Add custom OG tags
      if (og.custom) {
        og.custom.forEach(tag => {
          if (tag.property) {
            this.meta.updateTag({ property: tag.property, content: tag.content });
          }
        });
      }
    }
    
    // Add Twitter Card tags
    if (routeConfig.twitter) {
      const twitter = routeConfig.twitter;
      
      if (twitter.card) {
        this.meta.updateTag({ name: 'twitter:card', content: twitter.card });
      } else if (config.socialMedia?.twitter?.defaultCard) {
        this.meta.updateTag({ name: 'twitter:card', content: config.socialMedia.twitter.defaultCard });
      } else {
        this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
      }
      
      if (twitter.site) {
        this.meta.updateTag({ name: 'twitter:site', content: twitter.site });
      } else if (config.socialMedia?.twitter?.site) {
        this.meta.updateTag({ name: 'twitter:site', content: config.socialMedia.twitter.site });
      }
      
      if (twitter.creator) {
        this.meta.updateTag({ name: 'twitter:creator', content: twitter.creator });
      } else if (config.socialMedia?.twitter?.creator) {
        this.meta.updateTag({ name: 'twitter:creator', content: config.socialMedia.twitter.creator });
      }
      
      if (twitter.title) {
        this.meta.updateTag({ name: 'twitter:title', content: twitter.title });
      } else {
        this.meta.updateTag({ name: 'twitter:title', content: routeConfig.title });
      }
      
      if (twitter.description) {
        this.meta.updateTag({ name: 'twitter:description', content: twitter.description });
      }
      
      if (twitter.image) {
        this.meta.updateTag({ name: 'twitter:image', content: twitter.image });
      }
      
      // Add custom Twitter tags
      if (twitter.custom) {
        twitter.custom.forEach(tag => {
          if (tag.name) {
            this.meta.updateTag({ name: tag.name, content: tag.content });
          }
        });
      }
    }
  }

  /**
   * Update canonical link
   */
  private updateCanonicalLink(routeConfig: RouteSeoConfig, config: SeoConfig): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Remove existing canonical link
    const existingCanonical = this.document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.parentNode?.removeChild(existingCanonical);
    }
    
    // Determine canonical URL
    let canonicalUrl: string | null = null;
    
    if (routeConfig.canonicalUrl) {
      // Use route-specific canonical URL
      canonicalUrl = routeConfig.canonicalUrl;
    } else if (config.canonicalUrls) {
      // Build canonical URL from base URL and current path
      const baseUrl = config.canonicalUrls.baseUrl;
      const path = this.normalizeRoutePath(this.currentRoute || '');
      
      // Apply trailing slash setting
      let pathWithSlash = path;
      if (config.canonicalUrls.trailingSlash && !path.endsWith('/') && path !== '/') {
        pathWithSlash = path + '/';
      } else if (!config.canonicalUrls.trailingSlash && path.endsWith('/') && path !== '/') {
        pathWithSlash = path.slice(0, -1);
      }
      
      canonicalUrl = baseUrl + pathWithSlash;
      
      // Force HTTPS if configured
      if (config.canonicalUrls.forceHttps && canonicalUrl.startsWith('http:')) {
        canonicalUrl = canonicalUrl.replace('http:', 'https:');
      }
    }
    
    // Add canonical link if URL is determined
    if (canonicalUrl) {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', canonicalUrl);
      this.document.head.appendChild(link);
    }
  }

  /**
   * Update structured data (JSON-LD)
   */
  private updateStructuredData(routeConfig: RouteSeoConfig, config: SeoConfig): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Remove existing structured data scripts
    this.structuredDataElements.forEach(element => {
      element.parentNode?.removeChild(element);
    });
    this.structuredDataElements = [];
    
    // Add structured data if specified
    if (routeConfig.structuredData && config.structuredData) {
      routeConfig.structuredData.forEach(id => {
        const structuredData = config.structuredData?.find(sd => sd.id === id);
        if (structuredData) {
          const script = this.document.createElement('script');
          script.type = 'application/ld+json';
          script.text = structuredData.jsonLd;
          this.document.head.appendChild(script);
          this.structuredDataElements.push(script);
        }
      });
    }
  }

  /**
   * Manually update SEO for a specific route
   * Useful for dynamic content that isn't tied to route changes
   */
  updateSeoForRoute(path: string): void {
    const config = this.seoConfig$.getValue();
    if (!config) {
      return;
    }

    const normalizedPath = this.normalizeRoutePath(path);
    const routeConfig = this.findRouteConfig(normalizedPath, config);

    if (routeConfig) {
      this.updateTitle(routeConfig, config);
      this.updateMetaTags(routeConfig, config);
      this.updateCanonicalLink(routeConfig, config);
      this.updateStructuredData(routeConfig, config);
    }
  }

  /**
   * Manually set a dynamic title
   * Useful for dynamic content where the title isn't in the JSON
   */
  setDynamicTitle(title: string): void {
    const config = this.seoConfig$.getValue();
    if (!config) {
      this.title.setTitle(title);
      return;
    }

    if (config.global.appendSiteNameToTitle) {
      this.title.setTitle(`${title}${config.global.titleSeparator}${config.global.siteName}`);
    } else {
      this.title.setTitle(title);
    }
  }

  /**
   * Manually set a dynamic meta tag
   * Useful for dynamic content where the meta tags aren't in the JSON
   */
  setDynamicMetaTag(tag: MetaTag): void {
    if (tag.name) {
      this.meta.updateTag({ name: tag.name, content: tag.content });
    } else if (tag.property) {
      this.meta.updateTag({ property: tag.property, content: tag.content });
    } else if (tag.httpEquiv) {
      this.meta.updateTag({ httpEquiv: tag.httpEquiv, content: tag.content });
    }
  }

  /**
   * Check if a route should be prerendered
   * Used by SSR to determine which routes to prerender
   */
  shouldPrerender(path: string): boolean {
    const config = this.seoConfig$.getValue();
    if (!config) {
      return false;
    }

    const normalizedPath = this.normalizeRoutePath(path);
    const routeConfig = this.findRouteConfig(normalizedPath, config);

    return routeConfig?.prerender === true;
  }

  /**
   * Get all routes that should be prerendered
   * Used by SSR to determine which routes to prerender
   */
  getPrerenderRoutes(): string[] {
    const config = this.seoConfig$.getValue();
    if (!config) {
      return [];
    }

    return config.routes
      .filter(route => route.prerender === true)
      .map(route => route.path);
  }
} 