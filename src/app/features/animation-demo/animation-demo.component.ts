import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimationService } from '../../core/services/animation.service';
import { AnimateDirective } from '../../shared/directives/animate.directive';
import { trigger, transition, useAnimation } from '@angular/animations';

@Component({
  selector: 'app-animation-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AnimateDirective
  ],
  template: `
    <div class="animation-demo">
      <div class="demo-header">
        <h1 [appAnimate]="'fadeIn'" [animateDelay]="100">Animation Demo</h1>
        <p [appAnimate]="'fadeIn'" [animateDelay]="300">
          This demo showcases the animations loaded from animations.json.
        </p>
        
        <div class="animation-controls" [appAnimate]="'fadeIn'" [animateDelay]="500">
          <div class="form-group">
            <label for="animationSelect">Select Animation:</label>
            <select 
              id="animationSelect" 
              [(ngModel)]="selectedAnimation" 
              (change)="resetAnimation()"
              class="form-control"
            >
              <option *ngFor="let anim of availableAnimations" [value]="anim">{{ anim }}</option>
            </select>
          </div>
          
          <button (click)="playAnimation()" class="btn">Play Animation</button>
          
          <div class="form-check">
            <input 
              type="checkbox" 
              id="enableAnimations" 
              [checked]="animationsEnabled()" 
              (change)="toggleAnimations()"
              class="form-check-input"
            >
            <label for="enableAnimations" class="form-check-label">Enable Animations</label>
          </div>
        </div>
      </div>
      
      <div class="demo-section">
        <h2>Animation Playground</h2>
        
        <div class="animation-playground">
          <div 
            class="animation-target"
            [appAnimate]="selectedAnimation"
            [animateOnInit]="false"
            [animateTrigger]="animationTrigger"
          >
            <div class="animation-content">
              <span class="animation-icon">🚀</span>
              <span class="animation-text">{{ selectedAnimation }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="demo-section">
        <h2>Animation Sequences</h2>
        
        <div class="sequence-controls">
          <div class="form-group">
            <label for="sequenceSelect">Select Sequence:</label>
            <select 
              id="sequenceSelect" 
              [(ngModel)]="selectedSequence" 
              class="form-control"
            >
              <option *ngFor="let seq of availableSequences" [value]="seq">{{ seq }}</option>
            </select>
          </div>
          
          <button (click)="playSequence()" class="btn">Play Sequence</button>
        </div>
        
        <div class="sequence-playground">
          <div class="page-container" #pageContainer>
            <div class="page-header" #pageHeader>
              <h3>Sequence Demo</h3>
            </div>
            <div class="page-content" #pageContent>
              <p>This demonstrates an animation sequence.</p>
              <p>Sequences can animate multiple elements with different animations and timings.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="demo-section">
        <h2>Scroll Animations</h2>
        <p>Scroll down to see elements animate as they enter the viewport.</p>
        
        <div class="scroll-container">
          <div 
            *ngFor="let item of scrollItems; let i = index" 
            class="scroll-item"
            [appAnimate]="scrollAnimations[i % scrollAnimations.length]"
            [animateOnInit]="false"
            [animateOnScroll]="true"
          >
            <div class="scroll-content">
              <h3>Scroll Item {{ i + 1 }}</h3>
              <p>This item uses the {{ scrollAnimations[i % scrollAnimations.length] }} animation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animation-demo {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .demo-header {
      margin-bottom: 30px;
    }
    
    .demo-section {
      margin-bottom: 40px;
      padding: 20px;
      border-radius: 8px;
      background-color: #f9f9f9;
    }
    
    .animation-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      align-items: center;
      margin-top: 20px;
    }
    
    .form-group {
      margin-bottom: 15px;
      min-width: 200px;
    }
    
    .form-control {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    
    .btn {
      padding: 8px 16px;
      background-color: #3f51b5;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    
    .btn:hover {
      background-color: #303f9f;
    }
    
    .form-check {
      display: flex;
      align-items: center;
      margin-left: 20px;
    }
    
    .form-check-input {
      margin-right: 8px;
    }
    
    .animation-playground {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
      background-color: #f0f0f0;
      border-radius: 8px;
      margin-top: 20px;
    }
    
    .animation-target {
      width: 200px;
      height: 200px;
      background-color: #3f51b5;
      border-radius: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .animation-content {
      text-align: center;
    }
    
    .animation-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 10px;
    }
    
    .animation-text {
      font-size: 18px;
      font-weight: 500;
    }
    
    .sequence-controls {
      display: flex;
      gap: 15px;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .sequence-playground {
      background-color: #f0f0f0;
      border-radius: 8px;
      padding: 20px;
      min-height: 200px;
    }
    
    .page-container {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .page-header {
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    
    .page-content {
      line-height: 1.6;
    }
    
    .scroll-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 30px;
    }
    
    .scroll-item {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .scroll-content {
      line-height: 1.6;
    }
  `]
})
export class AnimationDemoComponent implements OnInit {
  private animationService = inject(AnimationService);
  private platformId = inject(PLATFORM_ID);
  
  // Animation properties
  availableAnimations: string[] = [];
  selectedAnimation: string = 'fadeIn';
  animationTrigger: number = 0;
  
  // Sequence properties
  availableSequences: string[] = [];
  selectedSequence: string = 'pageEnter';
  
  // Scroll animation properties
  scrollItems: number[] = Array(10).fill(0).map((_, i) => i);
  scrollAnimations: string[] = ['fadeIn', 'slideInLeft', 'slideInRight', 'scaleIn'];
  
  // Animation settings
  animationsEnabled = this.animationService.animationsEnabled;
  
  ngOnInit(): void {
    // Get available animations
    this.availableAnimations = Object.keys(this.animationService.animations());
    
    // Get available sequences
    this.availableSequences = Object.keys(this.animationService.sequences());
  }
  
  /**
   * Plays the selected animation
   */
  playAnimation(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Increment the trigger to replay the animation
    this.animationTrigger++;
  }
  
  /**
   * Resets the animation
   */
  resetAnimation(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Reset the trigger to prepare for a new animation
    this.animationTrigger = 0;
    
    // Trigger the animation after a short delay
    setTimeout(() => {
      this.animationTrigger++;
    }, 50);
  }
  
  /**
   * Plays the selected sequence
   */
  playSequence(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const sequence = this.animationService.getAnimationSequence(this.selectedSequence);
    
    if (!sequence) {
      console.warn(`Sequence '${this.selectedSequence}' not found`);
      return;
    }
    
    // Reset elements
    const pageContainer = document.querySelector('.page-container');
    const pageHeader = document.querySelector('.page-header');
    const pageContent = document.querySelector('.page-content');
    
    if (!pageContainer || !pageHeader || !pageContent) {
      return;
    }
    
    // Reset styles
    pageContainer.setAttribute('style', 'opacity: 0');
    pageHeader.setAttribute('style', 'opacity: 0; transform: translateX(-50px)');
    pageContent.setAttribute('style', 'opacity: 0');
    
    // Play sequence
    sequence.steps.forEach(step => {
      const target = document.querySelector(step.target);
      
      if (!target) {
        return;
      }
      
      const animation = this.animationService.getAnimationDefinition(step.animation);
      
      if (!animation) {
        return;
      }
      
      // Create animation factory
      const factory = this.animationService.createAnimation(
        step.animation, 
        { ...animation.params, ...step.params }
      );
      
      // Create player
      const player = factory.create(target);
      
      // Set delay
      if (step.delay) {
        setTimeout(() => {
          player.play();
        }, step.delay);
      } else {
        player.play();
      }
    });
  }
  
  /**
   * Toggles animations on/off
   */
  toggleAnimations(): void {
    // This is just a demo - in a real app, you would update the settings in the JSON
    // and reload the animations
    alert('In a real application, this would update the animations.json file and reload the animations.');
  }
} 