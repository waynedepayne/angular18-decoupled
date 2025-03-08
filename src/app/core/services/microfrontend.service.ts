import { Injectable, Injector, NgModuleRef, Type, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { MicrofrontendModel, RemoteModule, RemoteRoute } from '../models/microfrontend.model';
import { Router, Routes, RouterOutlet } from '@angular/router';
import { MICROFRONTEND_AUTH_GUARD } from '../guards/microfrontend-auth.guard';

/**
 * Simple component that just renders a router-outlet
 * Used for parent routes that have children but no component
 */
@Component({
  template: '<router-outlet></router-outlet>',
  standalone: true,
  imports: [RouterOutlet]
})
export class OutletComponent {}

/**
 * Service responsible for loading and managing micro-frontends
 * from the microfrontend.json configuration file.
 */
@Injectable({
  providedIn: 'root'
})
export class MicrofrontendService {
  private readonly configUrl = 'assets/microfrontend.json';
  private configSubject = new BehaviorSubject<MicrofrontendModel | null>(null);
  private loadedRemotes = new Map<string, any>();
  private dynamicRoutes: Routes = [];

  /**
   * Observable of the micro-frontend configuration
   */
  public config$ = this.configSubject.asObservable();

  /**
   * Observable that emits true when micro-frontends are enabled
   */
  public enabled$ = this.config$.pipe(
    map(config => config?.enabled ?? false)
  );

  /**
   * Observable of all remote modules
   */
  public remotes$ = this.config$.pipe(
    map(config => config?.remotes ?? {})
  );

  /**
   * Observable of all remote routes
   */
  public routes$ = this.config$.pipe(
    map(config => config?.routes ?? [])
  );

  constructor(
    private http: HttpClient,
    private injector: Injector,
    private router: Router
  ) {}

  /**
   * Loads the micro-frontend configuration from the JSON file
   */
  public loadMicrofrontendConfig(): Observable<MicrofrontendModel> {
    return this.http.get<MicrofrontendModel>(this.configUrl).pipe(
      tap(config => {
        console.log('Loaded microfrontend configuration:', config);
        this.configSubject.next(config);
        
        if (config.enabled) {
          try {
            this.preloadRemotes(config);
          } catch (error) {
            console.error('Error preloading remotes:', error);
          }
          
          try {
            this.setupDynamicRoutes(config);
          } catch (error) {
            console.error('Error setting up dynamic routes:', error);
          }
        }
      }),
      catchError(error => {
        console.error('Error loading micro-frontend configuration:', error);
        // Return a default configuration with micro-frontends disabled
        const defaultConfig: MicrofrontendModel = {
          version: '1.0.0',
          lastUpdated: new Date().toISOString(),
          enabled: false,
          settings: {
            defaultTimeout: 10000,
            preloadAll: false,
            retryOnError: true,
            maxRetries: 3,
            showLoading: true,
            showErrors: true
          },
          remotes: {},
          routes: [],
          shared: {
            singleton: true,
            strictVersion: false,
            libs: []
          }
        };
        this.configSubject.next(defaultConfig);
        return of(defaultConfig);
      }),
      shareReplay(1)
    );
  }

  /**
   * Preloads remote modules based on configuration
   */
  private preloadRemotes(config: MicrofrontendModel): void {
    if (!config.settings.preloadAll) {
      // Only preload remotes that have preload=true
      Object.values(config.remotes)
        .filter(remote => remote.enabled && remote.preload)
        .forEach(remote => this.loadRemoteModule(remote));
    } else {
      // Preload all enabled remotes
      Object.values(config.remotes)
        .filter(remote => remote.enabled)
        .forEach(remote => this.loadRemoteModule(remote));
    }
  }

  /**
   * Sets up dynamic routes from remote modules
   */
  private setupDynamicRoutes(config: MicrofrontendModel): void {
    if (!config.enabled) return;

    try {
      // Filter enabled routes
      const enabledRoutes = config.routes.filter(route => route.enabled);
      
      // Convert to Angular routes
      this.dynamicRoutes = enabledRoutes.map(route => this.createRouteConfig(route));
      
      // Reset router configuration with new routes
      const currentRoutes = this.router.config;
      this.router.resetConfig([...currentRoutes, ...this.dynamicRoutes]);
      
      console.log('Dynamic routes configured successfully:', this.dynamicRoutes);
    } catch (error) {
      console.error('Error setting up dynamic routes:', error);
      // Continue with the application even if dynamic routes fail
    }
  }

  /**
   * Creates an Angular route configuration from a remote route
   */
  private createRouteConfig(route: RemoteRoute): any {
    const routeConfig: any = {
      path: route.path,
      data: route.data || {}
    };

    // Add authentication requirements if specified
    if (route.requiresAuth) {
      routeConfig.canActivate = [MICROFRONTEND_AUTH_GUARD];
      routeConfig.data.roles = route.roles || [];
    }

    // Handle child routes and lazy loading
    if (route.children && route.children.length > 0) {
      // If we have children, we can't use loadChildren (lazy loading)
      // even if the route has lazy: true
      
      // Process children recursively
      routeConfig.children = route.children
        .filter(childRoute => childRoute.enabled)
        .map(childRoute => this.createRouteConfig(childRoute));
      
      // For parent routes with children, we need a component
      if (route.exposedModule) {
        // If the parent route specifies a module/component, load it
        routeConfig.component = () => this.loadRemoteComponentForRoute(route);
      } else {
        // Otherwise, use the OutletComponent
        routeConfig.component = OutletComponent;
      }
    } else {
      // No children, so we can use lazy loading or component
      if (route.lazy) {
        routeConfig.loadChildren = () => this.loadRemoteModuleForRoute(route);
      } else {
        routeConfig.component = () => this.loadRemoteComponentForRoute(route);
      }
    }

    return routeConfig;
  }

  /**
   * Loads a remote module for a route
   */
  private loadRemoteModuleForRoute(route: RemoteRoute): Promise<Type<any>> {
    const remote = this.configSubject.value?.remotes[route.remoteName];
    if (!remote) {
      console.error(`Remote module ${route.remoteName} not found`);
      return Promise.reject(`Remote module ${route.remoteName} not found`);
    }

    return this.loadRemoteModule(remote)
      .then(container => {
        const exposedModule = remote.exposedModules.find(m => m.name === route.exposedModule);
        if (!exposedModule) {
          throw new Error(`Exposed module ${route.exposedModule} not found in remote ${route.remoteName}`);
        }
        return container[exposedModule.path]();
      })
      .then(module => module.default);
  }

  /**
   * Loads a remote component for a route
   */
  private loadRemoteComponentForRoute(route: RemoteRoute): Promise<Type<any>> {
    const remote = this.configSubject.value?.remotes[route.remoteName];
    if (!remote) {
      console.error(`Remote module ${route.remoteName} not found`);
      return Promise.reject(`Remote module ${route.remoteName} not found`);
    }

    return this.loadRemoteModule(remote)
      .then(container => {
        const exposedModule = remote.exposedModules.find(m => m.name === route.exposedModule);
        if (!exposedModule) {
          throw new Error(`Exposed module ${route.exposedModule} not found in remote ${route.remoteName}`);
        }
        return { container, exposedModule };
      })
      .then(({ container, exposedModule }) => {
        return container[exposedModule.path]().then(module => {
          // If it's a module, get the component from it
          if (exposedModule.type === 'module') {
            const moduleRef = this.createModuleRef(module.default);
            return moduleRef.instance.getComponent();
          }
          // Otherwise, return the component directly
          return module.default;
        });
      });
  }

  /**
   * Loads a remote module
   */
  private loadRemoteModule(remote: RemoteModule): Promise<any> {
    if (!remote.enabled) {
      return Promise.reject(`Remote module ${remote.name} is disabled`);
    }

    // Check if already loaded
    if (this.loadedRemotes.has(remote.name)) {
      return Promise.resolve(this.loadedRemotes.get(remote.name));
    }

    // Dynamically import the remote module
    // In a real implementation, this would use Module Federation APIs
    // For now, we'll simulate it with a placeholder
    return new Promise((resolve, reject) => {
      console.log(`Loading remote module: ${remote.name} from ${remote.url}`);
      
      // Simulate loading delay
      setTimeout(() => {
        // This is a placeholder for the actual Module Federation loading
        // In a real implementation, this would use something like:
        // return import(/* webpackIgnore: true */ remote.url)
        
        // For now, we'll just create a mock container
        const mockContainer = {
          // Mock the exposed modules
          ...remote.exposedModules.reduce((acc, module) => {
            acc[module.path] = () => Promise.resolve({
              default: this.createMockComponent(remote.name, module.name)
            });
            return acc;
          }, {} as Record<string, () => Promise<any>>)
        };
        
        this.loadedRemotes.set(remote.name, mockContainer);
        resolve(mockContainer);
      }, 500); // Simulate network delay
    });
  }

  /**
   * Creates a mock component for testing
   */
  private createMockComponent(remoteName: string, moduleName: string): Type<any> {
    // This is just a placeholder for testing
    // In a real implementation, this would be loaded from the remote
    return class MockComponent {
      static ɵfac = () => new MockComponent();
      static ɵcmp = {
        type: MockComponent,
        selectors: [['mock-component']],
        template: `<div>Mock Component: ${remoteName} - ${moduleName}</div>`
      };
    } as any;
  }

  /**
   * Creates a module reference from a module class
   */
  private createModuleRef(moduleType: Type<any>): NgModuleRef<any> {
    return this.injector.get(moduleType) as NgModuleRef<any>;
  }

  /**
   * Gets a remote module by name
   */
  public getRemote(name: string): Observable<RemoteModule | undefined> {
    return this.remotes$.pipe(
      map(remotes => remotes[name])
    );
  }

  /**
   * Gets all enabled remote modules
   */
  public getEnabledRemotes(): Observable<RemoteModule[]> {
    return this.remotes$.pipe(
      map(remotes => Object.values(remotes).filter(remote => remote.enabled))
    );
  }

  /**
   * Gets all enabled routes
   */
  public getEnabledRoutes(): Observable<RemoteRoute[]> {
    return this.routes$.pipe(
      map(routes => routes.filter(route => route.enabled))
    );
  }
} 