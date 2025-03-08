import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AnimateDirective } from '../animate.directive';
import { AnimationService } from '../../../core/services/animation.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AnimationFactory, AnimationPlayer } from '@angular/animations';

@Component({
  template: `
    <div [appAnimate]="animationName" [animateParams]="params"></div>
    <div [appAnimate]="animationName" [animateOnInit]="false" [animateTrigger]="trigger"></div>
  `
})
class TestComponent {
  animationName = 'fadeIn';
  params = { duration: 500 };
  trigger = 0;
}

describe('AnimateDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let elements: DebugElement[];
  let mockAnimationService: jasmine.SpyObj<AnimationService>;
  let mockAnimationFactory: jasmine.SpyObj<AnimationFactory>;
  let mockAnimationPlayer: jasmine.SpyObj<AnimationPlayer>;

  beforeEach(() => {
    // Create mock animation player
    mockAnimationPlayer = jasmine.createSpyObj('AnimationPlayer', ['play', 'destroy']);
    
    // Create mock animation factory
    mockAnimationFactory = jasmine.createSpyObj('AnimationFactory', ['create']);
    mockAnimationFactory.create.and.returnValue(mockAnimationPlayer);
    
    // Create mock animation service
    mockAnimationService = jasmine.createSpyObj('AnimationService', [
      'createAnimation', 
      'animationsEnabled'
    ]);
    mockAnimationService.createAnimation.and.returnValue(mockAnimationFactory);
    mockAnimationService.animationsEnabled.and.returnValue(true);
    
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [BrowserAnimationsModule, AnimateDirective],
      providers: [
        { provide: AnimationService, useValue: mockAnimationService }
      ]
    });
    
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    elements = fixture.debugElement.queryAll(By.directive(AnimateDirective));
  });

  it('should create an instance', () => {
    const directive = elements[0].injector.get(AnimateDirective);
    expect(directive).toBeTruthy();
  });

  it('should apply animation on init if animateOnInit is true', () => {
    fixture.detectChanges();
    
    // First element has animateOnInit=true (default)
    expect(mockAnimationService.createAnimation).toHaveBeenCalledWith('fadeIn', { duration: 500 });
    expect(mockAnimationFactory.create).toHaveBeenCalled();
    expect(mockAnimationPlayer.play).toHaveBeenCalled();
  });

  it('should not apply animation on init if animateOnInit is false', () => {
    fixture.detectChanges();
    
    // Reset call counts to check second element
    mockAnimationService.createAnimation.calls.reset();
    mockAnimationFactory.create.calls.reset();
    mockAnimationPlayer.play.calls.reset();
    
    // Second element has animateOnInit=false
    expect(mockAnimationService.createAnimation).not.toHaveBeenCalledWith('fadeIn', {});
    expect(mockAnimationFactory.create).not.toHaveBeenCalled();
    expect(mockAnimationPlayer.play).not.toHaveBeenCalled();
  });

  it('should apply animation when trigger changes', () => {
    fixture.detectChanges();
    
    // Reset call counts
    mockAnimationService.createAnimation.calls.reset();
    mockAnimationFactory.create.calls.reset();
    mockAnimationPlayer.play.calls.reset();
    
    // Change trigger value
    component.trigger = 1;
    fixture.detectChanges();
    
    // Second element should animate
    expect(mockAnimationService.createAnimation).toHaveBeenCalledWith('fadeIn', {});
    expect(mockAnimationFactory.create).toHaveBeenCalled();
    expect(mockAnimationPlayer.play).toHaveBeenCalled();
  });

  it('should apply animation when animation name changes', () => {
    fixture.detectChanges();
    
    // Reset call counts
    mockAnimationService.createAnimation.calls.reset();
    mockAnimationFactory.create.calls.reset();
    mockAnimationPlayer.play.calls.reset();
    
    // Change animation name
    component.animationName = 'slideInLeft';
    fixture.detectChanges();
    
    // Both elements should animate
    expect(mockAnimationService.createAnimation).toHaveBeenCalledWith('slideInLeft', { duration: 500 });
    expect(mockAnimationFactory.create).toHaveBeenCalled();
    expect(mockAnimationPlayer.play).toHaveBeenCalled();
  });

  it('should not apply animation if animations are disabled', () => {
    // Set animations to disabled
    mockAnimationService.animationsEnabled.and.returnValue(false);
    
    fixture.detectChanges();
    
    // No animations should be created or played
    expect(mockAnimationService.createAnimation).not.toHaveBeenCalled();
    expect(mockAnimationFactory.create).not.toHaveBeenCalled();
    expect(mockAnimationPlayer.play).not.toHaveBeenCalled();
  });
}); 