import { 
  Directive, 
  ElementRef, 
  Input, 
  OnInit, 
  OnChanges, 
  OnDestroy,
  SimpleChanges, 
  inject, 
  Renderer2,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AnimationService } from '../../core/services/animation.service';
import { AnimationPlayer } from '@angular/animations';

/**
 * Directive to apply animations to elements in templates
 * Usage: <element [appAnimate]="'animationName'" [animateParams]="{param: 'value'}"></element>
 * With trigger: <element [appAnimate]="'animationName'" [animateTrigger]="triggerValue"></element>
 */
@Directive({
  selector: '[appAnimate]',
  standalone: true
})
export class AnimateDirective implements OnInit, OnChanges, OnDestroy {
  private animationService = inject(AnimationService);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);
  
  @Input('appAnimate') animationName: string = '';
  @Input() animateParams: Record<string, any> = {};
  @Input() animateTrigger: any = null;
  @Input() animateOnInit: boolean = true;
  @Input() animateOnScroll: boolean = false;
  @Input() animateDelay: number = 0;
  
  private player: AnimationPlayer | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private animationTimeout: any = null;
  
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Apply animation on init if enabled
    if (this.animateOnInit) {
      this.applyAnimation();
    }
    
    // Set up intersection observer for scroll-based animations
    if (this.animateOnScroll) {
      this.setupScrollAnimation();
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Apply animation when trigger changes
    if (changes['animateTrigger'] && !changes['animateTrigger'].firstChange) {
      this.applyAnimation();
    }
    
    // Apply animation when animation name changes
    if (changes['animationName'] && !changes['animationName'].firstChange) {
      this.applyAnimation();
    }
  }
  
  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Clean up player
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    
    // Clean up intersection observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    
    // Clean up timeout
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }
  }
  
  /**
   * Applies the animation to the element
   */
  private applyAnimation(): void {
    // Check if animations are enabled
    if (!this.animationService.animationsEnabled()) {
      return;
    }
    
    // Clean up previous animation
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    
    // Clear previous timeout
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }
    
    // Apply animation with delay if specified
    if (this.animateDelay > 0) {
      this.animationTimeout = setTimeout(() => {
        this.createAndPlayAnimation();
      }, this.animateDelay);
    } else {
      this.createAndPlayAnimation();
    }
  }
  
  /**
   * Creates and plays the animation
   */
  private createAndPlayAnimation(): void {
    if (!this.animationName) {
      return;
    }
    
    // Create animation factory
    const factory = this.animationService.createAnimation(this.animationName, this.animateParams);
    
    // Create player
    this.player = factory.create(this.el.nativeElement);
    
    // Play animation
    this.player.play();
  }
  
  /**
   * Sets up the intersection observer for scroll-based animations
   */
  private setupScrollAnimation(): void {
    if (!isPlatformBrowser(this.platformId) || !window.IntersectionObserver) {
      return;
    }
    
    // Create intersection observer
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.applyAnimation();
          
          // Disconnect observer after animation is triggered
          if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
          }
        }
      });
    }, {
      threshold: 0.1 // Trigger when 10% of the element is visible
    });
    
    // Start observing the element
    this.intersectionObserver.observe(this.el.nativeElement);
  }
} 