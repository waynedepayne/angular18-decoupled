import { Routes } from '@angular/router';
import { ConfigDemoComponent } from './features/config-demo/config-demo.component';
import { DesignDemoComponent } from './features/design-demo/design-demo.component';
import { RouterDemoComponent } from './features/router-demo/router-demo.component';
import { LogicDemoComponent } from './features/logic-demo/logic-demo.component';
import { RulesDemoComponent } from './features/rules-demo/rules-demo.component';
import { ProductCatalogComponent } from './features/product-catalog/product-catalog.component';
import { I18nDemoComponent } from './features/i18n-demo/i18n-demo.component';
import { AnimationDemoComponent } from './features/animation-demo/animation-demo.component';
import { ThemingDemoComponent } from './features/theming-demo/theming-demo.component';
import { SecurityDemoComponent } from './features/security-demo/security-demo.component';
import { MicrofrontendDemoComponent } from './features/microfrontend-demo/microfrontend-demo.component';
import { AnalyticsDemoComponent } from './features/analytics-demo/analytics-demo.component';
import { UpgradeDemoComponent } from './features/upgrade-demo/upgrade-demo.component';
import { SeoDemoComponent } from './features/seo-demo/seo-demo.component';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { microfrontendAuthGuard } from './core/guards/microfrontend-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'config-demo', pathMatch: 'full' },
  { path: 'config-demo', component: ConfigDemoComponent },
  { path: 'design-demo', component: DesignDemoComponent },
  { path: 'router-demo', component: RouterDemoComponent },
  { path: 'logic-demo', component: LogicDemoComponent },
  { path: 'rules-demo', component: RulesDemoComponent },
  { path: 'product-catalog', component: ProductCatalogComponent },
  { path: 'i18n-demo', component: I18nDemoComponent },
  { path: 'animation-demo', component: AnimationDemoComponent },
  { path: 'theming-demo', component: ThemingDemoComponent },
  { path: 'security-demo', component: SecurityDemoComponent },
  { 
    path: 'microfrontend-demo', 
    component: MicrofrontendDemoComponent,
    // We're not using the guard here to make it easier to access the demo
    // canActivate: [microfrontendAuthGuard]
  },
  { path: 'analytics-demo', component: AnalyticsDemoComponent },
  { path: 'upgrade-demo', component: UpgradeDemoComponent },
  { path: 'seo-demo', component: SeoDemoComponent },
  { path: 'login', component: LoginComponent },
  // Fallback route for dynamic routes that aren't found
  { path: '**', redirectTo: 'config-demo' }
];
