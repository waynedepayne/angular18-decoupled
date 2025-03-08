import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

/**
 * Pipe to translate text in templates
 * Usage: {{ 'key.path' | translate }}
 * With params: {{ 'key.path' | translate:{ param: 'value' } }}
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Make it impure to update when the locale changes
})
export class TranslatePipe implements PipeTransform {
  private i18nService = inject(I18nService);
  
  transform(key: string, params?: Record<string, string>): string {
    if (!key) {
      return '';
    }
    
    return this.i18nService.translate(key, params);
  }
} 