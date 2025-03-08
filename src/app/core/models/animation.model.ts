/**
 * Interfaces for the animations.json file which contains animation definitions
 * used throughout the application.
 */

/**
 * Main interface for the animations.json file
 */
export interface AnimationModel {
  /**
   * Version of the animations for tracking changes
   */
  version: string;
  
  /**
   * Last updated timestamp
   */
  lastUpdated: string;
  
  /**
   * Global animation settings
   */
  settings: AnimationSettings;
  
  /**
   * Animation definitions organized by name
   */
  animations: Record<string, AnimationDefinition>;
  
  /**
   * Animation sequences for complex animations
   */
  sequences: Record<string, AnimationSequence>;
}

/**
 * Global animation settings
 */
export interface AnimationSettings {
  /**
   * Whether animations are enabled globally
   */
  enabled: boolean;
  
  /**
   * Default duration for animations in milliseconds
   */
  defaultDuration: number;
  
  /**
   * Default easing function for animations
   */
  defaultEasing: string;
  
  /**
   * Default delay for animations in milliseconds
   */
  defaultDelay: number;
  
  /**
   * Reduced motion settings for accessibility
   */
  reducedMotion: {
    /**
     * Whether to respect the user's reduced motion preference
     */
    respectUserPreference: boolean;
    
    /**
     * Alternative duration for reduced motion in milliseconds
     */
    alternativeDuration: number;
  };
}

/**
 * Animation definition
 */
export interface AnimationDefinition {
  /**
   * Type of animation (e.g., 'fade', 'slide', 'scale', etc.)
   */
  type: string;
  
  /**
   * Duration of the animation in milliseconds
   */
  duration?: number;
  
  /**
   * Easing function for the animation
   */
  easing?: string;
  
  /**
   * Delay before the animation starts in milliseconds
   */
  delay?: number;
  
  /**
   * Whether the animation should run in reverse
   */
  reverse?: boolean;
  
  /**
   * Animation-specific parameters
   */
  params?: Record<string, any>;
  
  /**
   * Animation states
   */
  states?: Record<string, AnimationState>;
  
  /**
   * Animation transitions
   */
  transitions?: AnimationTransition[];
}

/**
 * Animation state
 */
export interface AnimationState {
  /**
   * CSS styles for the state
   */
  styles: Record<string, string | number>;
}

/**
 * Animation transition
 */
export interface AnimationTransition {
  /**
   * Source state
   */
  fromState: string;
  
  /**
   * Target state
   */
  toState: string;
  
  /**
   * Duration of the transition in milliseconds
   */
  duration?: number;
  
  /**
   * Easing function for the transition
   */
  easing?: string;
  
  /**
   * Animation steps
   */
  steps?: AnimationStep[];
}

/**
 * Animation step
 */
export interface AnimationStep {
  /**
   * Type of step (e.g., 'style', 'animate', 'group', 'sequence', etc.)
   */
  type: string;
  
  /**
   * CSS styles for the step
   */
  styles?: Record<string, string | number>;
  
  /**
   * Duration of the step in milliseconds
   */
  duration?: number;
  
  /**
   * Easing function for the step
   */
  easing?: string;
  
  /**
   * Delay before the step starts in milliseconds
   */
  delay?: number;
  
  /**
   * Child steps for group or sequence
   */
  steps?: AnimationStep[];
}

/**
 * Animation sequence
 */
export interface AnimationSequence {
  /**
   * Description of the sequence
   */
  description?: string;
  
  /**
   * Animation steps in the sequence
   */
  steps: AnimationSequenceStep[];
}

/**
 * Animation sequence step
 */
export interface AnimationSequenceStep {
  /**
   * Name of the animation to use
   */
  animation: string;
  
  /**
   * Target elements to animate (selector or element description)
   */
  target: string;
  
  /**
   * Delay before the animation starts in milliseconds
   */
  delay?: number;
  
  /**
   * Duration override for the animation in milliseconds
   */
  duration?: number;
  
  /**
   * Whether to run the animation in parallel with the previous step
   */
  parallel?: boolean;
  
  /**
   * Custom parameters for the animation
   */
  params?: Record<string, any>;
} 