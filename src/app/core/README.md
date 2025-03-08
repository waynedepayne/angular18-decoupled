# Core Module

This directory contains the core services, models, and utilities that are essential to the application's functionality.

## Services

### ConfigService

The `ConfigService` is responsible for loading and providing access to the application's configuration settings from `assets/config.json`. It uses Angular's HttpClient to fetch the configuration and exposes it through Signals.

#### Features:

- Loads configuration at application startup using APP_INITIALIZER
- Provides typed access to configuration through Signals
- Includes fallback to default configuration if loading fails
- Exposes helper methods like `isFeatureEnabled()` for common tasks

#### Usage:

```typescript
import { Component } from '@angular/core';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-my-component',
  template: `
    <div *ngIf="isFeatureEnabled('enableDarkMode')">
      Dark Mode is enabled!
    </div>
  `
})
export class MyComponent {
  constructor(private configService: ConfigService) {}
  
  // Access configuration values
  apiEndpoint = this.configService.apiEndpoint;
  
  // Check if a feature is enabled
  isFeatureEnabled(featureName: string): boolean {
    return this.configService.isFeatureEnabled(featureName as any);
  }
}
```

## Models

### ConfigModel

The `ConfigModel` interface defines the structure of the configuration data loaded from `assets/config.json`.

```typescript
export interface ConfigModel {
  environmentName: string;
  apiEndpoint: string;
  featureFlags: FeatureFlags;
  auth: Auth;
  performance: Performance;
  ui: UI;
  logging: Logging;
}
```

## Testing

Services are tested using Angular's testing utilities and HttpClientTestingModule for mocking HTTP requests.

Example:

```typescript
describe('ConfigService', () => {
  let service: ConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConfigService]
    });
    service = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should load configuration from assets/config.json', () => {
    // Test implementation
  });
});
``` 