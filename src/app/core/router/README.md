# Dynamic Router System

This directory contains components and services for implementing a dynamic routing system based on JSON configuration. The system allows for runtime configuration of routes, guards, and resolvers without requiring code changes or recompilation.

## Components

### DynamicRouterModule

A module that provides the necessary providers for the dynamic router system. It can be imported into the application's root module to enable dynamic routing.

```typescript
@NgModule({
  imports: [
    DynamicRouterModule.forRoot(
      // Component registry
      {
        DashboardComponent,
        ProductListComponent,
        // ...
      },
      // Guard registry
      {
        auth: AuthGuard,
        admin: AdminGuard,
        // ...
      },
      // Resolver registry
      {
        productData: ProductDataResolver,
        // ...
      },
      // Module registry
      {
        ReportsModule: () => import('./features/reports/reports.module').then(m => m.ReportsModule),
        // ...
      }
    )
  ]
})
export class AppModule {}
```

## Usage

To use the dynamic router system, you need to:

1. Define your routes in the `router.json` file
2. Register your components, guards, and resolvers with the `RouterConfigService`
3. Import the `DynamicRouterModule` into your application's root module

### Example router.json

```json
{
  "routes": [
    {
      "path": "",
      "redirectTo": "dashboard",
      "pathMatch": "full"
    },
    {
      "path": "dashboard",
      "component": "DashboardComponent",
      "data": {
        "title": "Dashboard",
        "icon": "dashboard",
        "permissions": ["user", "admin"]
      }
    },
    {
      "path": "products",
      "data": {
        "title": "Products",
        "icon": "inventory_2",
        "permissions": ["user", "admin"]
      },
      "children": [
        {
          "path": "",
          "component": "ProductListComponent",
          "data": {
            "title": "Product List",
            "permissions": ["user", "admin"]
          }
        },
        {
          "path": ":id",
          "component": "ProductDetailComponent",
          "data": {
            "title": "Product Detail",
            "permissions": ["user", "admin"]
          }
        }
      ]
    }
  ],
  "guards": {
    "auth": {
      "type": "canActivate",
      "roles": ["user", "admin"]
    }
  },
  "resolvers": {
    "productData": {
      "dataService": "ProductService",
      "method": "getProduct",
      "applyTo": ["ProductDetailComponent"]
    }
  },
  "defaultErrorRoute": "/not-found",
  "defaultAuthRoute": "/login",
  "defaultSuccessRoute": "/dashboard",
  "routeTrackingStrategy": "PathStrategy"
}
```

## Benefits

- **Runtime Configuration**: Routes can be changed without recompiling the application
- **Centralized Configuration**: All routing configuration is in one place
- **Decoupled Architecture**: Components don't need to know about the routing system
- **Type Safety**: TypeScript interfaces ensure type safety for the router configuration
- **Testability**: The router configuration can be easily tested

## Extending

To add support for new route features:

1. Update the `RouterModel` interface to include the new feature
2. Update the `RouterConfigService` to handle the new feature
3. Update the `DynamicRouterModule` to apply the new feature to routes 