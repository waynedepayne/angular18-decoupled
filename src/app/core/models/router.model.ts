export interface RouterModel {
  routes: RouteDefinition[];
  guards: {
    [key: string]: GuardDefinition;
  };
  resolvers: {
    [key: string]: ResolverDefinition;
  };
  defaultErrorRoute: string;
  defaultAuthRoute: string;
  defaultSuccessRoute: string;
  routeTrackingStrategy: 'PathStrategy' | 'HashStrategy';
}

export interface RouteDefinition {
  path: string;
  component?: string;
  redirectTo?: string;
  pathMatch?: 'full' | 'prefix';
  loadChildren?: string;
  canActivate?: string[];
  canDeactivate?: string[];
  resolve?: {
    [key: string]: string;
  };
  data?: RouteData;
  children?: RouteDefinition[];
}

export interface RouteData {
  title?: string;
  icon?: string;
  permissions?: string[];
  hideNavigation?: boolean;
  [key: string]: any;
}

export interface GuardDefinition {
  type: 'canActivate' | 'canDeactivate' | 'canActivateChild' | 'canLoad';
  roles?: string[];
  applyTo?: string[];
  redirectTo?: string;
  [key: string]: any;
}

export interface ResolverDefinition {
  dataService: string;
  method: string;
  applyTo?: string[];
  [key: string]: any;
}

// Type for the component registry
export interface ComponentRegistry {
  [key: string]: any;
}

// Type for the guard registry
export interface GuardRegistry {
  [key: string]: any;
}

// Type for the resolver registry
export interface ResolverRegistry {
  [key: string]: any;
}

// Type for the module registry
export interface ModuleRegistry {
  [key: string]: () => Promise<any>;
} 