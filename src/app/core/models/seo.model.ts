/**
 * SEO Configuration Model
 * 
 * This model defines the structure for the seo.json file which controls
 * route-based SEO metadata, meta tags, and SSR-related configurations.
 */

export interface SeoConfig {
  /**
   * Global SEO settings applied to all routes unless overridden
   */
  global: GlobalSeoSettings;
  
  /**
   * Route-specific SEO configurations
   */
  routes: RouteSeoConfig[];
  
  /**
   * Default settings for routes without specific configurations
   */
  defaultRoute?: RouteSeoConfig;
  
  /**
   * Social media sharing configuration
   */
  socialMedia?: SocialMediaConfig;
  
  /**
   * Structured data (JSON-LD) templates
   */
  structuredData?: StructuredDataConfig[];
  
  /**
   * Canonical URL settings
   */
  canonicalUrls?: CanonicalUrlConfig;
}

/**
 * Social media configuration
 */
export interface SocialMediaConfig {
  /**
   * Facebook configuration
   */
  facebook?: {
    /**
     * Facebook App ID
     */
    appId?: string;
    
    /**
     * Default OG type
     */
    defaultType?: string;
  };
  
  /**
   * Twitter configuration
   */
  twitter?: {
    /**
     * Default Twitter card type
     */
    defaultCard?: string;
    
    /**
     * Twitter site handle
     */
    site?: string;
    
    /**
     * Twitter creator handle
     */
    creator?: string;
  };
}

/**
 * Global SEO settings applied to all routes
 */
export interface GlobalSeoSettings {
  /**
   * Site name to append to titles
   */
  siteName: string;
  
  /**
   * Title separator (e.g., " | ", " - ")
   */
  titleSeparator: string;
  
  /**
   * Default meta description
   */
  defaultDescription?: string;
  
  /**
   * Default meta keywords
   */
  defaultKeywords?: string;
  
  /**
   * Default robots directive
   */
  defaultRobots?: string;
  
  /**
   * Whether to append site name to page titles
   */
  appendSiteNameToTitle?: boolean;
}

/**
 * SEO configuration for a specific route
 */
export interface RouteSeoConfig {
  /**
   * Route path this configuration applies to
   */
  path: string;
  
  /**
   * Page title
   */
  title: string;
  
  /**
   * Meta tags for this route
   */
  meta?: MetaTag[];
  
  /**
   * Open Graph tags for social sharing
   */
  og?: OpenGraphTags;
  
  /**
   * Twitter card tags
   */
  twitter?: TwitterCardTags;
  
  /**
   * Structured data (JSON-LD) for this route
   */
  structuredData?: string[];
  
  /**
   * Canonical URL for this route (overrides global setting)
   */
  canonicalUrl?: string;
  
  /**
   * Whether this route should be prerendered in SSR
   */
  prerender?: boolean;
  
  /**
   * Custom robots directive for this route
   */
  robots?: string;
}

/**
 * Meta tag definition
 */
export interface MetaTag {
  /**
   * Meta tag name
   */
  name?: string;
  
  /**
   * Meta tag property (for Open Graph)
   */
  property?: string;
  
  /**
   * Meta tag http-equiv
   */
  httpEquiv?: string;
  
  /**
   * Meta tag content
   */
  content: string;
}

/**
 * Open Graph tags for social sharing
 */
export interface OpenGraphTags {
  /**
   * OG title
   */
  title?: string;
  
  /**
   * OG description
   */
  description?: string;
  
  /**
   * OG type (e.g., website, article)
   */
  type?: string;
  
  /**
   * OG image URL
   */
  image?: string;
  
  /**
   * OG URL
   */
  url?: string;
  
  /**
   * Additional custom OG tags
   */
  custom?: MetaTag[];
}

/**
 * Twitter card tags
 */
export interface TwitterCardTags {
  /**
   * Twitter card type
   */
  card?: string;
  
  /**
   * Twitter site username
   */
  site?: string;
  
  /**
   * Twitter creator username
   */
  creator?: string;
  
  /**
   * Twitter title
   */
  title?: string;
  
  /**
   * Twitter description
   */
  description?: string;
  
  /**
   * Twitter image URL
   */
  image?: string;
  
  /**
   * Additional custom Twitter tags
   */
  custom?: MetaTag[];
}

/**
 * Structured data configuration
 */
export interface StructuredDataConfig {
  /**
   * Unique identifier for this structured data template
   */
  id: string;
  
  /**
   * JSON-LD content as a string
   */
  jsonLd: string;
}

/**
 * Canonical URL configuration
 */
export interface CanonicalUrlConfig {
  /**
   * Base URL for canonical links
   */
  baseUrl: string;
  
  /**
   * Whether to append trailing slash
   */
  trailingSlash?: boolean;
  
  /**
   * Whether to force HTTPS
   */
  forceHttps?: boolean;
  
  /**
   * Whether to include query parameters in canonical URLs
   */
  includeQueryParams?: boolean;
} 