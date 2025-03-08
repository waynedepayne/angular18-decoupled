import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../core/services/config.service';
import { ConfigModel } from '../../core/models/config.model';

@Component({
  selector: 'app-config-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="config-demo">
      <h2>Configuration Demo</h2>
      
      <div class="environment-info">
        <h3>Environment Information</h3>
        <p><strong>Environment:</strong> {{ environmentName() }}</p>
        <p><strong>API Endpoint:</strong> {{ apiEndpoint() }}</p>
      </div>
      
      <div class="feature-flags">
        <h3>Feature Flags</h3>
        <ul>
          <li>
            <strong>Service Worker:</strong> 
            <span [class.enabled]="isFeatureEnabled('enableServiceWorker')">
              {{ isFeatureEnabled('enableServiceWorker') ? 'Enabled' : 'Disabled' }}
            </span>
          </li>
          <li>
            <strong>Dark Mode:</strong> 
            <span [class.enabled]="isFeatureEnabled('enableDarkMode')">
              {{ isFeatureEnabled('enableDarkMode') ? 'Enabled' : 'Disabled' }}
            </span>
          </li>
          <li>
            <strong>Beta Features:</strong> 
            <span [class.enabled]="isFeatureEnabled('enableBetaFeatures')">
              {{ isFeatureEnabled('enableBetaFeatures') ? 'Enabled' : 'Disabled' }}
            </span>
          </li>
          <li>
            <strong>Analytics:</strong> 
            <span [class.enabled]="isFeatureEnabled('enableAnalytics')">
              {{ isFeatureEnabled('enableAnalytics') ? 'Enabled' : 'Disabled' }}
            </span>
          </li>
        </ul>
      </div>
      
      <div class="auth-settings">
        <h3>Auth Settings</h3>
        <p><strong>Token Expiry:</strong> {{ auth()?.tokenExpiryMinutes }} minutes</p>
        <p><strong>Refresh Token Expiry:</strong> {{ auth()?.refreshTokenExpiryDays }} days</p>
        <p><strong>Auth Endpoint:</strong> {{ auth()?.authEndpoint }}</p>
      </div>
      
      <div class="ui-settings">
        <h3>UI Settings</h3>
        <p><strong>Default Theme:</strong> {{ ui()?.defaultTheme }}</p>
        <p><strong>Animations:</strong> {{ ui()?.animationsEnabled ? 'Enabled' : 'Disabled' }}</p>
        <p><strong>Default Language:</strong> {{ ui()?.defaultLanguage }}</p>
      </div>
    </div>
  `,
  styles: [`
    .config-demo {
      padding: 20px;
      border-radius: 8px;
      background-color: #f5f5f5;
      max-width: 800px;
      margin: 0 auto;
    }
    
    h2 {
      color: #333;
      border-bottom: 2px solid #ddd;
      padding-bottom: 10px;
    }
    
    h3 {
      color: #555;
      margin-top: 20px;
    }
    
    .environment-info, .feature-flags, .auth-settings, .ui-settings {
      margin-bottom: 20px;
      padding: 15px;
      background-color: white;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    ul {
      list-style-type: none;
      padding-left: 0;
    }
    
    li {
      margin-bottom: 8px;
    }
    
    .enabled {
      color: green;
      font-weight: bold;
    }
    
    span:not(.enabled) {
      color: #999;
    }
  `]
})
export class ConfigDemoComponent {
  private configService = inject(ConfigService);
  
  // Using the computed signals from the ConfigService
  environmentName = this.configService.environmentName;
  apiEndpoint = this.configService.apiEndpoint;
  auth = this.configService.auth;
  ui = this.configService.ui;
  
  // Method to check if a feature is enabled
  isFeatureEnabled(featureName: keyof ConfigModel['featureFlags']): boolean {
    return this.configService.isFeatureEnabled(featureName);
  }
} 