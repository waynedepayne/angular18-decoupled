import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { ConfigService } from './core/services/config.service';
import { DesignService } from './core/services/design.service';
import { RouterConfigService } from './core/services/router-config.service';
import { LogicService } from './core/services/logic.service';
import { RulesService } from './core/services/rules.service';
import { DataService } from './core/services/data.service';
import { I18nService } from './core/services/i18n.service';
import { AnimationService } from './core/services/animation.service';
import { ThemingService } from './core/services/theming.service';
import { SecurityService } from './core/services/security.service';
import { MicrofrontendService, OutletComponent } from './core/services/microfrontend.service';
import { AnalyticsService } from './core/services/analytics.service';
import { UpgradeBridgeService } from './core/services/upgrade-bridge.service';
import { SeoService } from './core/services/seo.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { LogicHandlersModule } from './core/logic/logic-handlers.module';
import { MICROFRONTEND_AUTH_GUARD, microfrontendAuthGuard } from './core/guards/microfrontend-auth.guard';

// Factory function for APP_INITIALIZER
export function initializeApp(
  configService: ConfigService, 
  designService: DesignService,
  routerConfigService: RouterConfigService,
  logicService: LogicService,
  rulesService: RulesService,
  dataService: DataService,
  i18nService: I18nService,
  animationService: AnimationService,
  themingService: ThemingService,
  securityService: SecurityService,
  microfrontendService: MicrofrontendService,
  analyticsService: AnalyticsService,
  upgradeBridgeService: UpgradeBridgeService,
  seoService: SeoService
) {
  return () => {
    // Load all configurations
    return firstValueFrom(
      forkJoin([
        configService.loadConfig(),
        designService.loadDesign(),
        routerConfigService.loadRouterConfig(),
        logicService.loadLogicConfig(),
        rulesService.loadRulesConfig(),
        dataService.loadData(),
        i18nService.loadI18n(),
        animationService.loadAnimations(),
        themingService.loadTheming(),
        securityService.loadSecurity(),
        microfrontendService.loadMicrofrontendConfig(),
        analyticsService.loadAnalyticsConfig(),
        upgradeBridgeService.loadUpgradeBridgeConfig(),
        seoService.loadSeoConfig()
      ])
    ).then(() => {
      // Check authentication status after all configurations are loaded
      // This is now safe because we've added platform checks in the service
      securityService.checkAuth();
      return true;
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [
        ConfigService, 
        DesignService, 
        RouterConfigService, 
        LogicService, 
        RulesService, 
        DataService, 
        I18nService,
        AnimationService,
        ThemingService,
        SecurityService,
        MicrofrontendService,
        AnalyticsService,
        UpgradeBridgeService,
        SeoService
      ],
      multi: true
    },
    // Provide the microfrontendAuthGuard
    {
      provide: MICROFRONTEND_AUTH_GUARD,
      useValue: microfrontendAuthGuard
    },
    importProvidersFrom(LogicHandlersModule.forRoot()),
    OutletComponent
  ]
};
