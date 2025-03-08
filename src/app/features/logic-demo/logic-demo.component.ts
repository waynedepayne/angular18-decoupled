import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogicService } from '../../core/services/logic.service';
import { StateMachine, StateMachineContext, WorkflowDefinition } from '../../core/models/logic.model';

@Component({
  selector: 'app-logic-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="logic-demo">
      <h2>Business Logic Demo</h2>
      
      <div class="workflow-selector">
        <h3>Select a Workflow</h3>
        <div class="workflow-buttons">
          <button *ngFor="let workflow of workflowNames" 
                  (click)="selectWorkflow(workflow)"
                  [class.active]="selectedWorkflow === workflow">
            {{ workflow }}
          </button>
        </div>
      </div>
      
      <div class="workflow-details" *ngIf="workflowDefinition">
        <h3>Workflow: {{ selectedWorkflow }}</h3>
        <p><strong>Initial State:</strong> {{ workflowDefinition.initialState }}</p>
        
        <div class="state-diagram">
          <h4>State Diagram</h4>
          <div class="states">
            <div *ngFor="let state of getStateNames()" 
                 class="state-node" 
                 [class.active]="currentState === state">
              <div class="state-name">{{ state }}</div>
              <div class="state-transitions">
                <div *ngFor="let transition of getStateTransitions(state)" class="transition">
                  → {{ transition.target }} 
                  <small *ngIf="transition.event">({{ transition.event }})</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="workflow-simulator" *ngIf="stateMachine">
        <h3>Workflow Simulator</h3>
        
        <div class="current-state">
          <p><strong>Current State:</strong> {{ currentState }}</p>
        </div>
        
        <div class="context-viewer">
          <h4>Context</h4>
          <pre>{{ contextJson }}</pre>
        </div>
        
        <div class="available-events" *ngIf="availableEvents.length > 0">
          <h4>Available Events</h4>
          <div class="event-buttons">
            <button *ngFor="let event of availableEvents" 
                    (click)="sendEvent(event)">
              {{ event }}
            </button>
          </div>
        </div>
        
        <div class="cart-simulator" *ngIf="selectedWorkflow === 'checkout'">
          <h4>Cart Simulator</h4>
          <button (click)="addItemToCart()">Add Item to Cart</button>
          <button (click)="clearCart()">Clear Cart</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .logic-demo {
      padding: 20px;
    }
    
    h2, h3, h4 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
    }
    
    .workflow-selector, .workflow-details, .workflow-simulator {
      margin-bottom: 30px;
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .workflow-buttons, .event-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 15px;
    }
    
    button {
      padding: 8px 16px;
      background-color: #3f51b5;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    button:hover {
      background-color: #303f9f;
    }
    
    button.active {
      background-color: #7986cb;
    }
    
    .state-diagram {
      margin-top: 20px;
    }
    
    .states {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .state-node {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      min-width: 150px;
      background-color: white;
      transition: all 0.3s;
    }
    
    .state-node.active {
      border-color: #3f51b5;
      box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
    }
    
    .state-name {
      font-weight: bold;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #eee;
    }
    
    .state-transitions {
      font-size: 0.9em;
    }
    
    .transition {
      margin-bottom: 5px;
      color: #666;
    }
    
    .transition small {
      color: #999;
    }
    
    .context-viewer {
      margin: 15px 0;
    }
    
    .context-viewer pre {
      background-color: #f0f0f0;
      padding: 10px;
      border-radius: 4px;
      overflow: auto;
      max-height: 200px;
      font-size: 0.9em;
    }
    
    .cart-simulator {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }
  `]
})
export class LogicDemoComponent implements OnInit, OnDestroy {
  private logicService = inject(LogicService);
  
  // Workflow properties
  workflowNames: string[] = [];
  selectedWorkflow: string = '';
  workflowDefinition: WorkflowDefinition | null = null;
  
  // State machine properties
  stateMachine: StateMachine | null = null;
  currentState: string = '';
  context: StateMachineContext = {};
  contextJson: string = '{}';
  availableEvents: string[] = [];
  
  // Unsubscribe function for the state machine subscription
  private unsubscribe: (() => void) | null = null;
  
  ngOnInit(): void {
    // Get the available workflow names
    this.workflowNames = this.logicService.getWorkflowNames();
    
    // If there are workflows available, select the first one
    if (this.workflowNames.length > 0) {
      this.selectWorkflow(this.workflowNames[0]);
    }
  }
  
  ngOnDestroy(): void {
    // Unsubscribe from the state machine
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  
  /**
   * Selects a workflow and creates a state machine for it
   * @param workflowName The name of the workflow to select
   */
  selectWorkflow(workflowName: string): void {
    this.selectedWorkflow = workflowName;
    this.workflowDefinition = this.logicService.getWorkflow(workflowName);
    
    // Unsubscribe from the previous state machine
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    
    // Create a new state machine for the selected workflow
    try {
      // Initialize with some context data based on the workflow
      const initialContext = this.getInitialContext(workflowName);
      
      this.stateMachine = this.logicService.create(workflowName, initialContext);
      
      // Subscribe to state changes
      this.unsubscribe = this.stateMachine.subscribe((state, context) => {
        this.currentState = state;
        this.context = context;
        this.contextJson = JSON.stringify(context, null, 2);
        this.updateAvailableEvents();
      });
    } catch (error) {
      console.error(`Error creating state machine for workflow "${workflowName}":`, error);
      this.stateMachine = null;
      this.currentState = '';
      this.context = {};
      this.contextJson = '{}';
      this.availableEvents = [];
    }
  }
  
  /**
   * Gets the names of all states in the current workflow
   * @returns An array of state names
   */
  getStateNames(): string[] {
    if (!this.workflowDefinition) {
      return [];
    }
    
    return Object.keys(this.workflowDefinition.states);
  }
  
  /**
   * Gets the transitions for a specific state
   * @param stateName The name of the state
   * @returns An array of transitions
   */
  getStateTransitions(stateName: string): any[] {
    if (!this.workflowDefinition || !this.workflowDefinition.states[stateName]) {
      return [];
    }
    
    return this.workflowDefinition.states[stateName].transitions;
  }
  
  /**
   * Sends an event to the state machine
   * @param eventType The type of event to send
   */
  sendEvent(eventType: string): void {
    if (!this.stateMachine) {
      return;
    }
    
    this.stateMachine.send({ type: eventType });
  }
  
  /**
   * Updates the list of available events based on the current state
   */
  private updateAvailableEvents(): void {
    if (!this.workflowDefinition || !this.currentState) {
      this.availableEvents = [];
      return;
    }
    
    const stateDefinition = this.workflowDefinition.states[this.currentState];
    
    if (!stateDefinition) {
      this.availableEvents = [];
      return;
    }
    
    // Get all unique event types from the transitions
    this.availableEvents = stateDefinition.transitions
      .map(transition => transition.event)
      .filter((event, index, self) => event && self.indexOf(event) === index);
  }
  
  /**
   * Gets the initial context for a workflow
   * @param workflowName The name of the workflow
   * @returns The initial context
   */
  private getInitialContext(workflowName: string): StateMachineContext {
    switch (workflowName) {
      case 'checkout':
        return {
          cart: {
            items: [],
            itemCount: 0,
            total: 0
          },
          user: {
            email: 'user@example.com',
            address: {
              country: 'US'
            }
          }
        };
      case 'userRegistration':
        return {
          form: {
            email: '',
            password: '',
            name: '',
            isValid: false
          }
        };
      case 'productSearch':
        return {
          search: {
            query: '',
            filters: {}
          },
          selected: {
            category: null,
            product: null
          }
        };
      default:
        return {};
    }
  }
  
  /**
   * Adds an item to the cart (for the checkout workflow)
   */
  addItemToCart(): void {
    if (!this.stateMachine || this.selectedWorkflow !== 'checkout') {
      return;
    }
    
    // Create a sample product
    const product = {
      id: 'prod_' + Math.random().toString(36).substring(2, 10),
      name: 'Sample Product ' + Math.floor(Math.random() * 100),
      price: Math.floor(Math.random() * 100) + 1,
      description: 'This is a sample product'
    };
    
    // Add the product to the cart
    this.stateMachine.send({
      type: 'ADD_TO_CART',
      payload: {
        cart: {
          items: [
            ...(this.context.cart?.items || []),
            {
              product,
              quantity: 1,
              price: product.price,
              total: product.price
            }
          ]
        }
      }
    });
  }
  
  /**
   * Clears the cart (for the checkout workflow)
   */
  clearCart(): void {
    if (!this.stateMachine || this.selectedWorkflow !== 'checkout') {
      return;
    }
    
    // Clear the cart
    this.stateMachine.send({
      type: 'CLEAR_CART',
      payload: {
        cart: {
          items: [],
          itemCount: 0,
          total: 0
        }
      }
    });
  }
} 