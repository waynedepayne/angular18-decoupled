/**
 * @fileoverview AnimationService is responsible for loading and providing access to animation
 * definitions from animations.json.
 * 
 * JSON Source: assets/animations.json
 * 
 * Data Structure:
 * - settings: Global animation settings
 * - animations: Animation definitions organized by name
 * - sequences: Animation sequences for complex animations
 * 
 * Transformation Logic:
 * - JSON is loaded at application startup via APP_INITIALIZER
 * - Data is exposed through Angular Signals for reactive access
 * - Animations are converted to Angular's AnimationMetadata format
 * - Respects user's reduced motion preference
 * - Provides methods to create and apply animations dynamically
 */
import { Injectable, signal, computed, Signal, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { 
  AnimationModel, 
  AnimationDefinition, 
  AnimationSequence,
  AnimationSettings
} from '../models/animation.model';
import { 
  AnimationBuilder, 
  AnimationFactory, 
  AnimationMetadata,
  style,
  animate,
  state,
  transition,
  trigger,
  group,
  sequence,
  query,
  stagger,
  keyframes
} from '@angular/animations';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  // Signal to hold the animation data
  private animationSignal = signal<AnimationModel | null>(null);
  
  // Public API for accessing the animation data
  public readonly animation: Signal<AnimationModel | null> = this.animationSignal.asReadonly();
  
  // Computed signals for commonly accessed animation sections
  public readonly settings = computed(() => this.animationSignal()?.settings || this.getDefaultSettings());
  public readonly animations = computed(() => this.animationSignal()?.animations || {});
  public readonly sequences = computed(() => this.animationSignal()?.sequences || {});
  
  // Computed signal for whether animations are enabled
  public readonly animationsEnabled = computed(() => {
    const settings = this.settings();
    
    // If animations are disabled globally, return false
    if (!settings.enabled) {
      return false;
    }
    
    // If we should respect the user's preference and they prefer reduced motion, return false
    if (settings.reducedMotion.respectUserPreference && this.prefersReducedMotion()) {
      return false;
    }
    
    return true;
  });
  
  private platformId = inject(PLATFORM_ID);
  private animationBuilder = inject(AnimationBuilder);
  
  constructor(private http: HttpClient) {}
  
  /**
   * Loads the animation data from the JSON file
   * Used by APP_INITIALIZER to load animations at startup
   * 
   * @returns Observable<AnimationModel> - The loaded animation data or default values
   */
  loadAnimations(): Observable<AnimationModel> {
    return this.http.get<AnimationModel>('assets/animations.json').pipe(
      tap(animation => {
        console.log('Animation data loaded successfully');
        this.animationSignal.set(animation);
      }),
      catchError(error => {
        console.error('Failed to load animation data', error);
        // Return default animation data in case of error
        const defaultAnimation = this.getDefaultAnimations();
        this.animationSignal.set(defaultAnimation);
        return of(defaultAnimation);
      })
    );
  }
  
  /**
   * Checks if the user prefers reduced motion
   * 
   * @returns boolean - Whether the user prefers reduced motion
   */
  private prefersReducedMotion(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }
  
  /**
   * Gets the duration for an animation, respecting reduced motion preferences
   * 
   * @param duration - The original duration in milliseconds
   * @returns number - The adjusted duration in milliseconds
   */
  getDuration(duration?: number): number {
    const settings = this.settings();
    const defaultDuration = settings.defaultDuration;
    
    // If no duration is provided, use the default
    if (duration === undefined) {
      duration = defaultDuration;
    }
    
    // If reduced motion is enabled and respected, use the alternative duration
    if (settings.reducedMotion.respectUserPreference && this.prefersReducedMotion()) {
      return settings.reducedMotion.alternativeDuration;
    }
    
    return duration;
  }
  
  /**
   * Gets an animation definition by name
   * 
   * @param name - The name of the animation
   * @returns AnimationDefinition | undefined - The animation definition
   */
  getAnimationDefinition(name: string): AnimationDefinition | undefined {
    return this.animations()[name];
  }
  
  /**
   * Gets an animation sequence by name
   * 
   * @param name - The name of the sequence
   * @returns AnimationSequence | undefined - The animation sequence
   */
  getAnimationSequence(name: string): AnimationSequence | undefined {
    return this.sequences()[name];
  }
  
  /**
   * Creates an Angular animation trigger from an animation definition
   * 
   * @param triggerName - The name of the trigger
   * @param animationName - The name of the animation definition to use
   * @returns AnimationMetadata - The Angular animation trigger
   */
  createTrigger(triggerName: string, animationName: string): AnimationMetadata {
    const animationDef = this.getAnimationDefinition(animationName);
    
    if (!animationDef) {
      console.warn(`Animation definition '${animationName}' not found`);
      return trigger(triggerName, []);
    }
    
    const states: any[] = [];
    const transitions: any[] = [];
    
    // Add states
    if (animationDef.states) {
      Object.entries(animationDef.states).forEach(([stateName, stateConfig]) => {
        states.push(state(stateName, style(stateConfig.styles)));
      });
    }
    
    // Add transitions
    if (animationDef.transitions) {
      animationDef.transitions.forEach(transitionConfig => {
        const transitionSteps: any[] = [];
        
        // Add steps if defined
        if (transitionConfig.steps) {
          transitionConfig.steps.forEach(step => {
            transitionSteps.push(this.createAnimationStep(step));
          });
        } else {
          // Default transition if no steps are defined
          transitionSteps.push(
            animate(
              `${this.getDuration(transitionConfig.duration)}ms ${transitionConfig.easing || this.settings().defaultEasing}`
            )
          );
        }
        
        transitions.push(
          transition(`${transitionConfig.fromState} => ${transitionConfig.toState}`, transitionSteps)
        );
      });
    } else {
      // Default transition if none are defined
      transitions.push(
        transition('* => *', [
          animate(
            `${this.getDuration(animationDef.duration)}ms ${animationDef.easing || this.settings().defaultEasing}`
          )
        ])
      );
    }
    
    return trigger(triggerName, [...states, ...transitions]);
  }
  
  /**
   * Creates an Angular animation step from an animation step definition
   * 
   * @param step - The animation step definition
   * @returns AnimationMetadata - The Angular animation step
   */
  private createAnimationStep(step: any): AnimationMetadata {
    switch (step.type) {
      case 'style':
        return style(step.styles || {});
      
      case 'animate':
        return animate(
          `${this.getDuration(step.duration)}ms ${step.delay ? step.delay + 'ms' : ''} ${step.easing || this.settings().defaultEasing}`,
          step.styles ? style(step.styles) : undefined
        );
      
      case 'group':
        return group(step.steps?.map(s => this.createAnimationStep(s)) || []);
      
      case 'sequence':
        return sequence(step.steps?.map(s => this.createAnimationStep(s)) || []);
      
      case 'query':
        return query(
          step.selector || '*',
          step.steps?.map(s => this.createAnimationStep(s)) || [],
          { optional: step.optional || false }
        );
      
      case 'stagger':
        return stagger(
          step.duration || 0,
          step.steps?.map(s => this.createAnimationStep(s)) || []
        );
      
      case 'keyframes':
        return keyframes(step.steps?.map(s => style(s.styles || {})) || []);
      
      default:
        console.warn(`Unknown animation step type: ${step.type}`);
        return animate('0ms');
    }
  }
  
  /**
   * Creates an animation factory for a specific element and animation
   * 
   * @param animationName - The name of the animation to use
   * @param params - Optional parameters for the animation
   * @returns AnimationFactory - The animation factory
   */
  createAnimation(animationName: string, params?: Record<string, any>): AnimationFactory {
    const animationDef = this.getAnimationDefinition(animationName);
    
    if (!animationDef) {
      console.warn(`Animation definition '${animationName}' not found`);
      return this.animationBuilder.build([]);
    }
    
    // Merge default parameters with provided parameters
    const mergedParams = { ...animationDef.params, ...params };
    
    // Create animation metadata based on the type
    let metadata: AnimationMetadata[] = [];
    
    switch (animationDef.type) {
      case 'fade':
        metadata = this.createFadeAnimation(animationDef, mergedParams);
        break;
      
      case 'slide':
        metadata = this.createSlideAnimation(animationDef, mergedParams);
        break;
      
      case 'scale':
        metadata = this.createScaleAnimation(animationDef, mergedParams);
        break;
      
      case 'rotate':
        metadata = this.createRotateAnimation(animationDef, mergedParams);
        break;
      
      default:
        console.warn(`Unknown animation type: ${animationDef.type}`);
        break;
    }
    
    return this.animationBuilder.build(metadata);
  }
  
  /**
   * Creates a fade animation
   * 
   * @param animationDef - The animation definition
   * @param params - Parameters for the animation
   * @returns AnimationMetadata[] - The animation metadata
   */
  private createFadeAnimation(animationDef: AnimationDefinition, params: Record<string, any>): AnimationMetadata[] {
    const duration = this.getDuration(animationDef.duration);
    const easing = animationDef.easing || this.settings().defaultEasing;
    const delay = animationDef.delay || 0;
    const reverse = animationDef.reverse || false;
    
    const fromOpacity = reverse ? 1 : 0;
    const toOpacity = reverse ? 0 : 1;
    
    return [
      style({ opacity: fromOpacity }),
      animate(`${duration}ms ${delay}ms ${easing}`, style({ opacity: toOpacity }))
    ];
  }
  
  /**
   * Creates a slide animation
   * 
   * @param animationDef - The animation definition
   * @param params - Parameters for the animation
   * @returns AnimationMetadata[] - The animation metadata
   */
  private createSlideAnimation(animationDef: AnimationDefinition, params: Record<string, any>): AnimationMetadata[] {
    const duration = this.getDuration(animationDef.duration);
    const easing = animationDef.easing || this.settings().defaultEasing;
    const delay = animationDef.delay || 0;
    const reverse = animationDef.reverse || false;
    
    const direction = params.direction || 'left';
    const distance = params.distance || '100%';
    
    let fromTransform = '';
    let toTransform = '';
    
    switch (direction) {
      case 'left':
        fromTransform = reverse ? 'translateX(0)' : `translateX(-${distance})`;
        toTransform = reverse ? `translateX(-${distance})` : 'translateX(0)';
        break;
      
      case 'right':
        fromTransform = reverse ? 'translateX(0)' : `translateX(${distance})`;
        toTransform = reverse ? `translateX(${distance})` : 'translateX(0)';
        break;
      
      case 'up':
        fromTransform = reverse ? 'translateY(0)' : `translateY(${distance})`;
        toTransform = reverse ? `translateY(${distance})` : 'translateY(0)';
        break;
      
      case 'down':
        fromTransform = reverse ? 'translateY(0)' : `translateY(-${distance})`;
        toTransform = reverse ? `translateY(-${distance})` : 'translateY(0)';
        break;
    }
    
    return [
      style({ transform: fromTransform }),
      animate(`${duration}ms ${delay}ms ${easing}`, style({ transform: toTransform }))
    ];
  }
  
  /**
   * Creates a scale animation
   * 
   * @param animationDef - The animation definition
   * @param params - Parameters for the animation
   * @returns AnimationMetadata[] - The animation metadata
   */
  private createScaleAnimation(animationDef: AnimationDefinition, params: Record<string, any>): AnimationMetadata[] {
    const duration = this.getDuration(animationDef.duration);
    const easing = animationDef.easing || this.settings().defaultEasing;
    const delay = animationDef.delay || 0;
    const reverse = animationDef.reverse || false;
    
    const fromScale = reverse ? 1 : (params.fromScale || 0);
    const toScale = reverse ? (params.fromScale || 0) : 1;
    
    return [
      style({ transform: `scale(${fromScale})` }),
      animate(`${duration}ms ${delay}ms ${easing}`, style({ transform: `scale(${toScale})` }))
    ];
  }
  
  /**
   * Creates a rotate animation
   * 
   * @param animationDef - The animation definition
   * @param params - Parameters for the animation
   * @returns AnimationMetadata[] - The animation metadata
   */
  private createRotateAnimation(animationDef: AnimationDefinition, params: Record<string, any>): AnimationMetadata[] {
    const duration = this.getDuration(animationDef.duration);
    const easing = animationDef.easing || this.settings().defaultEasing;
    const delay = animationDef.delay || 0;
    const reverse = animationDef.reverse || false;
    
    const fromDegrees = reverse ? 0 : (params.fromDegrees || -90);
    const toDegrees = reverse ? (params.fromDegrees || -90) : 0;
    
    return [
      style({ transform: `rotate(${fromDegrees}deg)` }),
      animate(`${duration}ms ${delay}ms ${easing}`, style({ transform: `rotate(${toDegrees}deg)` }))
    ];
  }
  
  /**
   * Provides default animation settings
   * 
   * @returns AnimationSettings - Default animation settings
   */
  private getDefaultSettings(): AnimationSettings {
    return {
      enabled: true,
      defaultDuration: 300,
      defaultEasing: 'ease-out',
      defaultDelay: 0,
      reducedMotion: {
        respectUserPreference: true,
        alternativeDuration: 0
      }
    };
  }
  
  /**
   * Provides default animations in case the animations file cannot be loaded
   * 
   * @returns AnimationModel - Default animation values
   */
  private getDefaultAnimations(): AnimationModel {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      settings: this.getDefaultSettings(),
      animations: {
        fadeIn: {
          type: 'fade',
          duration: 300,
          easing: 'ease-out',
          reverse: false
        },
        fadeOut: {
          type: 'fade',
          duration: 300,
          easing: 'ease-in',
          reverse: true
        },
        slideInLeft: {
          type: 'slide',
          duration: 300,
          easing: 'ease-out',
          params: {
            direction: 'left',
            distance: '100%'
          }
        },
        slideOutLeft: {
          type: 'slide',
          duration: 300,
          easing: 'ease-in',
          reverse: true,
          params: {
            direction: 'left',
            distance: '100%'
          }
        },
        scaleIn: {
          type: 'scale',
          duration: 300,
          easing: 'ease-out',
          params: {
            fromScale: 0.5
          }
        },
        scaleOut: {
          type: 'scale',
          duration: 300,
          easing: 'ease-in',
          reverse: true,
          params: {
            fromScale: 0.5
          }
        },
        rotateIn: {
          type: 'rotate',
          duration: 300,
          easing: 'ease-out',
          params: {
            fromDegrees: -90
          }
        },
        rotateOut: {
          type: 'rotate',
          duration: 300,
          easing: 'ease-in',
          reverse: true,
          params: {
            fromDegrees: -90
          }
        }
      },
      sequences: {
        pageEnter: {
          description: 'Animation sequence for page entry',
          steps: [
            {
              animation: 'fadeIn',
              target: '.page-container',
              duration: 500
            },
            {
              animation: 'slideInLeft',
              target: '.page-header',
              delay: 100
            },
            {
              animation: 'fadeIn',
              target: '.page-content',
              delay: 200
            }
          ]
        },
        pageExit: {
          description: 'Animation sequence for page exit',
          steps: [
            {
              animation: 'fadeOut',
              target: '.page-content',
              duration: 200
            },
            {
              animation: 'fadeOut',
              target: '.page-header',
              delay: 100
            },
            {
              animation: 'fadeOut',
              target: '.page-container',
              delay: 200,
              duration: 300
            }
          ]
        }
      }
    };
  }
} 