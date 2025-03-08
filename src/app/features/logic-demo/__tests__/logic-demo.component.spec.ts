import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogicDemoComponent } from '../logic-demo.component';
import { LogicService } from '../../../core/services/logic.service';
import { FormsModule } from '@angular/forms';
import { StateMachine, StateMachineContext } from '../../../core/models/logic.model';
import { of } from 'rxjs';

describe('LogicDemoComponent', () => {
  let component: LogicDemoComponent;
  let fixture: ComponentFixture<LogicDemoComponent>;
  let logicServiceSpy: jasmine.SpyObj<LogicService>;
  let mockStateMachine: jasmine.SpyObj<StateMachine>;

  beforeEach(async () => {
    // Create a mock state machine
    mockStateMachine = jasmine.createSpyObj('StateMachine', [
      'send', 
      'getState', 
      'getContext', 
      'subscribe'
    ]);
    mockStateMachine.currentState = 'initial';
    mockStateMachine.context = {};
    mockStateMachine.subscribe.and.returnValue(() => {});

    // Create a mock LogicService
    const logicSpy = jasmine.createSpyObj('LogicService', [
      'getWorkflowNames',
      'getWorkflow',
      'create'
    ]);
    logicSpy.getWorkflowNames.and.returnValue(['checkout', 'registration']);
    logicSpy.getWorkflow.and.returnValue({
      initialState: 'initial',
      states: {
        initial: {
          actions: [],
          transitions: [
            { event: 'NEXT', target: 'processing' }
          ]
        },
        processing: {
          actions: [],
          transitions: [
            { event: 'COMPLETE', target: 'completed' }
          ]
        },
        completed: {
          actions: [],
          transitions: []
        }
      }
    });
    logicSpy.create.and.returnValue(mockStateMachine);

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [LogicDemoComponent],
      providers: [
        { provide: LogicService, useValue: logicSpy }
      ]
    }).compileComponents();

    logicServiceSpy = TestBed.inject(LogicService) as jasmine.SpyObj<LogicService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogicDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load workflow names on init', () => {
    expect(logicServiceSpy.getWorkflowNames).toHaveBeenCalled();
    expect(component.workflowNames).toEqual(['checkout', 'registration']);
  });

  it('should select a workflow', () => {
    component.selectWorkflow('checkout');

    expect(logicServiceSpy.getWorkflow).toHaveBeenCalledWith('checkout');
    expect(logicServiceSpy.create).toHaveBeenCalled();
    expect(component.stateMachine).toBe(mockStateMachine);
    expect(component.currentState).toBe('initial');
  });

  it('should send an event to the state machine', () => {
    // First select a workflow
    component.selectWorkflow('checkout');
    
    // Then send an event
    component.sendEvent('NEXT');
    
    expect(mockStateMachine.send).toHaveBeenCalledWith({ type: 'NEXT' });
  });

  it('should add an item to the cart', () => {
    // First select the checkout workflow
    component.selectWorkflow('checkout');
    
    // Set up the context
    mockStateMachine.context = { cart: [] };
    mockStateMachine.getContext.and.returnValue(mockStateMachine.context);
    
    // Call the addItemToCart method
    component.addItemToCart();
    
    // Verify the cart has been updated
    expect(mockStateMachine.context.cart.length).toBeGreaterThan(0);
  });

  it('should clear the cart', () => {
    // First select the checkout workflow
    component.selectWorkflow('checkout');
    
    // Set up the context with items
    mockStateMachine.context = { 
      cart: [
        { name: 'Item 1', price: 10 },
        { name: 'Item 2', price: 20 }
      ] 
    };
    mockStateMachine.getContext.and.returnValue(mockStateMachine.context);
    
    // Clear the cart
    component.clearCart();
    
    expect(mockStateMachine.context.cart.length).toBe(0);
  });

  it('should unsubscribe on destroy', () => {
    const unsubscribeSpy = jasmine.createSpy('unsubscribe');
    (component as any).unsubscribe = unsubscribeSpy;
    
    component.ngOnDestroy();
    
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should update current state when state machine emits', () => {
    // First select a workflow
    component.selectWorkflow('checkout');
    
    // Get the subscribe callback
    const subscribeCallback = mockStateMachine.subscribe.calls.mostRecent().args[0];
    
    // Simulate state change
    subscribeCallback('processing', { someData: 'value' });
    
    expect(component.currentState).toBe('processing');
    expect(component.context).toEqual({ someData: 'value' });
  });
}); 