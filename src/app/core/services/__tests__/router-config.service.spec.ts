import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterConfigService } from '../router-config.service';
import { RouterModel } from '../../models/router.model';

describe('RouterConfigService', () => {
  let service: RouterConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RouterConfigService]
    });
    service = TestBed.inject(RouterConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load router configuration from assets/router.json', () => {
    const mockRouterConfig: RouterModel = {
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
        }
      ],
      guards: {
        auth: {
          type: 'canActivate',
          roles: ['user', 'admin']
        }
      },
      resolvers: {
        productData: {
          dataService: 'ProductService',
          method: 'getProduct',
          applyTo: ['ProductDetailComponent']
        }
      },
      defaultErrorRoute: '/not-found',
      defaultAuthRoute: '/login',
      defaultSuccessRoute: '/dashboard',
      routeTrackingStrategy: 'PathStrategy'
    };

    service.loadRouterConfig().subscribe(config => {
      expect(config).toEqual(mockRouterConfig);
      expect(service.routerConfig()).toEqual(mockRouterConfig);
      expect(service.routes()).toEqual(mockRouterConfig.routes);
      expect(service.guards()).toEqual(mockRouterConfig.guards);
      expect(service.resolvers()).toEqual(mockRouterConfig.resolvers);
      expect(service.defaultErrorRoute()).toEqual(mockRouterConfig.defaultErrorRoute);
      expect(service.defaultAuthRoute()).toEqual(mockRouterConfig.defaultAuthRoute);
      expect(service.defaultSuccessRoute()).toEqual(mockRouterConfig.defaultSuccessRoute);
    });

    const req = httpMock.expectOne('assets/router.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockRouterConfig);
  });

  it('should convert route definitions to Angular routes', () => {
    // Mock component registry
    const mockDashboardComponent = class DashboardComponent {};
    service.registerComponent('DashboardComponent', mockDashboardComponent);

    // Set router config
    service['routerConfigSignal'].set({
      routes: [
        {
          path: 'dashboard',
          component: 'DashboardComponent',
          data: {
            title: 'Dashboard'
          }
        }
      ],
      guards: {},
      resolvers: {},
      defaultErrorRoute: '/not-found',
      defaultAuthRoute: '/login',
      defaultSuccessRoute: '/dashboard',
      routeTrackingStrategy: 'PathStrategy'
    });

    const routes = service.getAngularRoutes();
    expect(routes.length).toBe(1);
    expect(routes[0].path).toBe('dashboard');
    expect(routes[0].component).toBe(mockDashboardComponent);
    expect(routes[0].data).toEqual({ title: 'Dashboard' });
  });

  it('should apply guards to routes', () => {
    // Mock guard registry
    const mockAuthGuard = class AuthGuard {};
    service.registerGuard('auth', mockAuthGuard);

    // Set router config
    service['routerConfigSignal'].set({
      routes: [
        {
          path: 'dashboard',
          component: 'DashboardComponent'
        }
      ],
      guards: {
        auth: {
          type: 'canActivate',
          roles: ['user', 'admin']
        }
      },
      resolvers: {},
      defaultErrorRoute: '/not-found',
      defaultAuthRoute: '/login',
      defaultSuccessRoute: '/dashboard',
      routeTrackingStrategy: 'PathStrategy'
    });

    const routes = [
      {
        path: 'dashboard',
        component: class DashboardComponent {}
      }
    ];

    const routesWithGuards = service.applyGuardsToRoutes(routes);
    expect(routesWithGuards[0].canActivate).toBeDefined();
    expect(routesWithGuards[0].canActivate![0]).toBe(mockAuthGuard);
  });

  it('should apply resolvers to routes', () => {
    // Mock resolver registry
    const mockDataResolver = class DataResolver {};
    service.registerResolver('productData', mockDataResolver);

    // Set router config
    service['routerConfigSignal'].set({
      routes: [
        {
          path: 'products/:id',
          component: 'ProductDetailComponent'
        }
      ],
      guards: {},
      resolvers: {
        productData: {
          dataService: 'ProductService',
          method: 'getProduct',
          applyTo: ['ProductDetailComponent']
        }
      },
      defaultErrorRoute: '/not-found',
      defaultAuthRoute: '/login',
      defaultSuccessRoute: '/dashboard',
      routeTrackingStrategy: 'PathStrategy'
    });

    const routes = [
      {
        path: 'products/:id',
        component: class ProductDetailComponent {}
      }
    ];

    const routesWithResolvers = service.applyResolversToRoutes(routes);
    expect(routesWithResolvers[0].resolve).toBeDefined();
    expect(routesWithResolvers[0].resolve!['productData']).toBe(mockDataResolver);
  });
}); 