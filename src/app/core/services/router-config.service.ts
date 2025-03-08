import { Injectable, signal, computed, Signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { 
  RouterModel, 
  RouteDefinition, 
  GuardDefinition, 
  ResolverDefinition,
  ComponentRegistry,
  GuardRegistry,
  ResolverRegistry,
  ModuleRegistry
} from '../models/router.model';
import { Route, Routes } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouterConfigService {
  // Signal to hold the router configuration data
  private routerConfigSignal = signal<RouterModel | null>(null);
  
  // Public API for accessing the router config
  public readonly routerConfig: Signal<RouterModel | null> = this.routerConfigSignal.asReadonly();
  
  // Computed signals for commonly accessed router config sections
  public readonly routes = computed(() => this.routerConfigSignal()?.routes || []);
  public readonly guards = computed(() => this.routerConfigSignal()?.guards || {});
  public readonly resolvers = computed(() => this.routerConfigSignal()?.resolvers || {});
  public readonly defaultErrorRoute = computed(() => this.routerConfigSignal()?.defaultErrorRoute || '/not-found');
  public readonly defaultAuthRoute = computed(() => this.routerConfigSignal()?.defaultAuthRoute || '/login');
  public readonly defaultSuccessRoute = computed(() => this.routerConfigSignal()?.defaultSuccessRoute || '/');
  
  // Component registry for mapping string names to actual component classes
  private componentRegistry: ComponentRegistry = {};
  
  // Guard registry for mapping string names to actual guard classes
  private guardRegistry: GuardRegistry = {};
  
  // Resolver registry for mapping string names to actual resolver classes
  private resolverRegistry: ResolverRegistry = {};
  
  // Module registry for mapping string names to lazy-loaded modules
  private moduleRegistry: ModuleRegistry = {};
  
  constructor(private http: HttpClient) {}
  
  /**
   * Loads the router configuration from the JSON file
   * Used by APP_INITIALIZER to load router config at startup
   */
  loadRouterConfig(): Observable<RouterModel> {
    return this.http.get<RouterModel>('assets/router.json').pipe(
      tap(routerConfig => {
        console.log('Router configuration loaded successfully');
        this.routerConfigSignal.set(routerConfig);
      }),
      catchError(error => {
        console.error('Failed to load router configuration', error);
        // Return a default router config in case of error
        return of(this.getDefaultRouterConfig());
      })
    );
  }
  
  /**
   * Registers a component with the service
   * @param name The name of the component as used in the JSON
   * @param component The actual component class
   */
  registerComponent(name: string, component: any): void {
    this.componentRegistry[name] = component;
  }
  
  /**
   * Registers multiple components with the service
   * @param components An object mapping component names to component classes
   */
  registerComponents(components: ComponentRegistry): void {
    this.componentRegistry = { ...this.componentRegistry, ...components };
  }
  
  /**
   * Registers a guard with the service
   * @param name The name of the guard as used in the JSON
   * @param guard The actual guard class
   */
  registerGuard(name: string, guard: any): void {
    this.guardRegistry[name] = guard;
  }
  
  /**
   * Registers multiple guards with the service
   * @param guards An object mapping guard names to guard classes
   */
  registerGuards(guards: GuardRegistry): void {
    this.guardRegistry = { ...this.guardRegistry, ...guards };
  }
  
  /**
   * Registers a resolver with the service
   * @param name The name of the resolver as used in the JSON
   * @param resolver The actual resolver class
   */
  registerResolver(name: string, resolver: any): void {
    this.resolverRegistry[name] = resolver;
  }
  
  /**
   * Registers multiple resolvers with the service
   * @param resolvers An object mapping resolver names to resolver classes
   */
  registerResolvers(resolvers: ResolverRegistry): void {
    this.resolverRegistry = { ...this.resolverRegistry, ...resolvers };
  }
  
  /**
   * Registers a lazy-loaded module with the service
   * @param name The name of the module as used in the JSON
   * @param loadChildren A function that returns a Promise that resolves to the module
   */
  registerModule(name: string, loadChildren: () => Promise<any>): void {
    this.moduleRegistry[name] = loadChildren;
  }
  
  /**
   * Registers multiple lazy-loaded modules with the service
   * @param modules An object mapping module names to loadChildren functions
   */
  registerModules(modules: ModuleRegistry): void {
    this.moduleRegistry = { ...this.moduleRegistry, ...modules };
  }
  
  /**
   * Converts the JSON route definitions to Angular Routes
   * @returns An array of Angular Routes
   */
  getAngularRoutes(): Routes {
    const routeDefinitions = this.routes();
    if (!routeDefinitions.length) {
      return [];
    }
    
    return this.convertRouteDefinitions(routeDefinitions);
  }
  
  /**
   * Recursively converts RouteDefinition objects to Angular Route objects
   * @param routeDefinitions An array of RouteDefinition objects
   * @returns An array of Angular Route objects
   */
  private convertRouteDefinitions(routeDefinitions: RouteDefinition[]): Routes {
    return routeDefinitions.map(routeDef => {
      const route: Route = {
        path: routeDef.path,
        data: routeDef.data
      };
      
      // Handle component
      if (routeDef.component && this.componentRegistry[routeDef.component]) {
        route.component = this.componentRegistry[routeDef.component];
      }
      
      // Handle redirectTo
      if (routeDef.redirectTo) {
        route.redirectTo = routeDef.redirectTo;
        route.pathMatch = routeDef.pathMatch || 'full';
      }
      
      // Handle loadChildren
      if (routeDef.loadChildren && this.moduleRegistry[routeDef.loadChildren]) {
        route.loadChildren = this.moduleRegistry[routeDef.loadChildren];
      }
      
      // Handle canActivate
      if (routeDef.canActivate && routeDef.canActivate.length) {
        route.canActivate = routeDef.canActivate
          .map(guardName => this.guardRegistry[guardName])
          .filter(guard => !!guard);
      }
      
      // Handle canDeactivate
      if (routeDef.canDeactivate && routeDef.canDeactivate.length) {
        route.canDeactivate = routeDef.canDeactivate
          .map(guardName => this.guardRegistry[guardName])
          .filter(guard => !!guard);
      }
      
      // Handle resolve
      if (routeDef.resolve) {
        route.resolve = {};
        Object.entries(routeDef.resolve).forEach(([key, resolverName]) => {
          if (this.resolverRegistry[resolverName]) {
            route.resolve![key] = this.resolverRegistry[resolverName];
          }
        });
      }
      
      // Handle children
      if (routeDef.children && routeDef.children.length) {
        route.children = this.convertRouteDefinitions(routeDef.children);
      }
      
      return route;
    });
  }
  
  /**
   * Applies guards to routes based on the guard definitions
   * @param routes The routes to apply guards to
   */
  applyGuardsToRoutes(routes: Routes): Routes {
    const guardDefinitions = this.guards();
    if (!Object.keys(guardDefinitions).length) {
      return routes;
    }
    
    return this.applyGuardsRecursively(routes, guardDefinitions);
  }
  
  /**
   * Recursively applies guards to routes
   * @param routes The routes to apply guards to
   * @param guardDefinitions The guard definitions
   * @returns The routes with guards applied
   */
  private applyGuardsRecursively(routes: Routes, guardDefinitions: { [key: string]: GuardDefinition }): Routes {
    return routes.map(route => {
      const componentName = this.getComponentName(route.component);
      
      // Apply canActivate guards
      Object.entries(guardDefinitions).forEach(([guardName, guardDef]) => {
        if (guardDef.type === 'canActivate') {
          // Apply to all routes if no applyTo is specified
          if (!guardDef.applyTo || guardDef.applyTo.includes(componentName)) {
            if (!route.canActivate) {
              route.canActivate = [];
            }
            
            if (this.guardRegistry[guardName]) {
              route.canActivate.push(this.guardRegistry[guardName]);
            }
          }
        }
      });
      
      // Apply canDeactivate guards
      Object.entries(guardDefinitions).forEach(([guardName, guardDef]) => {
        if (guardDef.type === 'canDeactivate') {
          // Apply to specific components only
          if (guardDef.applyTo && guardDef.applyTo.includes(componentName)) {
            if (!route.canDeactivate) {
              route.canDeactivate = [];
            }
            
            if (this.guardRegistry[guardName]) {
              route.canDeactivate.push(this.guardRegistry[guardName]);
            }
          }
        }
      });
      
      // Recursively apply guards to children
      if (route.children) {
        route.children = this.applyGuardsRecursively(route.children, guardDefinitions);
      }
      
      return route;
    });
  }
  
  /**
   * Applies resolvers to routes based on the resolver definitions
   * @param routes The routes to apply resolvers to
   */
  applyResolversToRoutes(routes: Routes): Routes {
    const resolverDefinitions = this.resolvers();
    if (!Object.keys(resolverDefinitions).length) {
      return routes;
    }
    
    return this.applyResolversRecursively(routes, resolverDefinitions);
  }
  
  /**
   * Recursively applies resolvers to routes
   * @param routes The routes to apply resolvers to
   * @param resolverDefinitions The resolver definitions
   * @returns The routes with resolvers applied
   */
  private applyResolversRecursively(routes: Routes, resolverDefinitions: { [key: string]: ResolverDefinition }): Routes {
    return routes.map(route => {
      const componentName = this.getComponentName(route.component);
      
      // Apply resolvers
      Object.entries(resolverDefinitions).forEach(([resolverName, resolverDef]) => {
        // Apply to specific components only
        if (resolverDef.applyTo && resolverDef.applyTo.includes(componentName)) {
          if (!route.resolve) {
            route.resolve = {};
          }
          
          if (this.resolverRegistry[resolverName]) {
            route.resolve[resolverName] = this.resolverRegistry[resolverName];
          }
        }
      });
      
      // Recursively apply resolvers to children
      if (route.children) {
        route.children = this.applyResolversRecursively(route.children, resolverDefinitions);
      }
      
      return route;
    });
  }
  
  /**
   * Gets the name of a component class
   * @param component The component class
   * @returns The name of the component class
   */
  private getComponentName(component: any): string {
    if (!component) {
      return '';
    }
    
    // Try to get the name from the component class
    if (component.name) {
      return component.name;
    }
    
    // If that fails, try to get it from the constructor
    const constructorString = component.toString();
    const match = constructorString.match(/function\s+(\w+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    // If all else fails, return an empty string
    return '';
  }
  
  /**
   * Provides a default router configuration in case the router.json file cannot be loaded
   */
  private getDefaultRouterConfig(): RouterModel {
    return {
      routes: [
        {
          path: '',
          redirectTo: 'dashboard',
          pathMatch: 'full'
        },
        {
          path: 'dashboard',
          component: 'DashboardComponent',
          data: {
            title: 'Dashboard',
            icon: 'dashboard',
            permissions: ['user', 'admin']
          }
        },
        {
          path: '**',
          component: 'NotFoundComponent',
          data: {
            title: 'Page Not Found',
            hideNavigation: true,
            permissions: ['anonymous', 'user', 'admin']
          }
        }
      ],
      guards: {},
      resolvers: {},
      defaultErrorRoute: '/not-found',
      defaultAuthRoute: '/login',
      defaultSuccessRoute: '/dashboard',
      routeTrackingStrategy: 'PathStrategy'
    };
  }
} 