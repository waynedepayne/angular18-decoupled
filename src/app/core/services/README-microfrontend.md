# Microfrontend Service

The `MicrofrontendService` is responsible for loading and managing micro-frontends in the Angular 18 Enterprise Application. It provides runtime configurability for micro-frontends through the `microfrontend.json` file.

## Features

- **Runtime Configuration**: Load micro-frontend configuration from JSON at startup
- **Dynamic Routing**: Create routes for micro-frontends based on configuration
- **Lazy Loading**: Support for lazy-loaded micro-frontend modules
- **Preloading Strategy**: Configurable preloading of micro-frontend modules
- **Error Handling**: Graceful fallbacks for loading failures
- **Access Control**: Integration with security for route protection

## Usage

### 1. Configuration File

The `microfrontend.json` file in the `assets` folder defines all micro-frontends:

```json
{
  "version": "1.0.0",
  "enabled": true,
  "settings": {
    "defaultTimeout": 10000,
    "preloadAll": false,
    "retryOnError": true
  },
  "remotes": {
    "dashboard": {
      "name": "dashboard",
      "url": "https://example.com/dashboard/remoteEntry.js",
      "exposedModules": [
        {
          "name": "DashboardModule",
          "type": "module",
          "path": "./DashboardModule",
          "enabled": true
        }
      ],
      "enabled": true
    }
  },
  "routes": [
    {
      "path": "dashboard",
      "remoteName": "dashboard",
      "exposedModule": "DashboardModule",
      "enabled": true,
      "lazy": true
    }
  ],
  "shared": {
    "singleton": true,
    "strictVersion": false,
    "libs": [
      {
        "name": "@angular/core",
        "singleton": true,
        "strictVersion": true
      }
    ]
  }
}
```

### 2. Service Integration

The service is initialized at application startup via `APP_INITIALIZER`:

```typescript
// In app.config.ts
export function initializeApp(
  // other services...
  microfrontendService: MicrofrontendService
) {
  return () => {
    return firstValueFrom(
      forkJoin([
        // other services...
        microfrontendService.loadMicrofrontendConfig()
      ])
    );
  };
}
```

### 3. Consuming the Service

Components can consume the service to access micro-frontend data:

```typescript
@Component({
  selector: 'app-example',
  template: `
    <div *ngIf="enabled$ | async">
      <div *ngFor="let remote of enabledRemotes$ | async">
        {{ remote.name }}
      </div>
    </div>
  `
})
export class ExampleComponent {
  enabled$ = this.microfrontendService.enabled$;
  enabledRemotes$ = this.microfrontendService.getEnabledRemotes();
  
  constructor(private microfrontendService: MicrofrontendService) {}
}
```

## Runtime Configurability

The following aspects can be modified at runtime by updating the `microfrontend.json` file:

1. **Add a Remote Module**: Add a new entry to the `remotes` object
2. **Switch Remote URL**: Update the `url` property of a remote
3. **Remove a Remote**: Set `enabled: false` for a remote
4. **Add a Route**: Add a new entry to the `routes` array
5. **Change Route Access**: Update `requiresAuth` and `roles` properties
6. **Disable a Route**: Set `enabled: false` for a route

## Implementation Details

The service uses Module Federation to load remote modules at runtime. It handles:

- Loading remote entry points
- Exposing modules from remotes
- Setting up dynamic routes
- Managing shared dependencies
- Handling loading errors

## Testing

Unit tests are available in `__tests__/microfrontend.service.spec.ts` and E2E tests in `e2e/microfrontend.spec.ts`. 