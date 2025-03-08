import { NgModule, ModuleWithProviders, APP_INITIALIZER, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, Router, ExtraOptions } from '@angular/router';
import { RouterConfigService } from '../services/router-config.service';
import { ComponentRegistry, GuardRegistry, ResolverRegistry, ModuleRegistry } from '../models/router.model';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    RouterModule
  ]
})
export class DynamicRouterModule {
  /**
   * Configures the dynamic router module with the provided components, guards, resolvers, and modules
   * @param components The components to register with the RouterConfigService
   * @param guards The guards to register with the RouterConfigService
   * @param resolvers The resolvers to register with the RouterConfigService
   * @param modules The lazy-loaded modules to register with the RouterConfigService
   * @param routerOptions The router options to use
   * @returns A module with providers
   */
  static forRoot(
    components: ComponentRegistry = {},
    guards: GuardRegistry = {},
    resolvers: ResolverRegistry = {},
    modules: ModuleRegistry = {},
    routerOptions: ExtraOptions = {}
  ): ModuleWithProviders<DynamicRouterModule> {
    return {
      ngModule: DynamicRouterModule,
      providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: (routerConfigService: RouterConfigService, router: Router) => {
            return () => {
              // Register components, guards, resolvers, and modules
              routerConfigService.registerComponents(components);
              routerConfigService.registerGuards(guards);
              routerConfigService.registerResolvers(resolvers);
              routerConfigService.registerModules(modules);
              
              // Get the routes from the RouterConfigService
              const routes = routerConfigService.getAngularRoutes();
              
              // Apply guards and resolvers to the routes
              const routesWithGuards = routerConfigService.applyGuardsToRoutes(routes);
              const routesWithGuardsAndResolvers = routerConfigService.applyResolversToRoutes(routesWithGuards);
              
              // Reset the router configuration with the new routes
              router.resetConfig(routesWithGuardsAndResolvers);
              
              // Return a resolved promise
              return Promise.resolve();
            };
          },
          deps: [RouterConfigService, Router],
          multi: true
        }
      ]
    };
  }
} 