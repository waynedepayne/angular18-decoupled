import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

/**
 * Directive to translate text content in templates
 * Usage: <element [appTranslate]="'key.path'"></element>
 * With params: <element [appTranslate]="'key.path'" [translateParams]="{param: 'value'}"></element>
 */
@Directive({
  selector: '[appTranslate]',
  standalone: true
})
export class TranslateDirective implements OnInit, OnChanges {
  private i18nService = inject(I18nService);
  private el = inject(ElementRef);
  
  @Input('appTranslate') key: string = '';
  @Input() translateParams: Record<string, string> = {};
  
  ngOnInit(): void {
    this.updateTranslation();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['key'] || changes['translateParams']) {
      this.updateTranslation();
    }
  }
  
  private updateTranslation(): void {
    if (this.key) {
      this.el.nativeElement.textContent = this.i18nService.translate(this.key, this.translateParams);
    }
  }
} 