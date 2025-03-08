import { Injectable, signal, computed, Signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { 
  LogicModel, 
  WorkflowDefinition, 
  ActionDefinition, 
  ServiceDefinition,
  StateMachine,
  StateMachineContext,
  StateMachineEvent,
  ActionHandler,
  ActionHandlerRegistry,
  ConditionEvaluator,
  StateMachineFactory
} from '../models/logic.model';

@Injectable({
  providedIn: 'root'
})
export class LogicService implements StateMachineFactory {
  // Signal to hold the logic configuration data
  private logicConfigSignal = signal<LogicModel | null>(null);
  
  // Public API for accessing the logic config
  public readonly logicConfig: Signal<LogicModel | null> = this.logicConfigSignal.asReadonly();
  
  // Computed signals for commonly accessed logic config sections
  public readonly workflows = computed(() => this.logicConfigSignal()?.workflows || {});
  public readonly actions = computed(() => this.logicConfigSignal()?.actions || {});
  public readonly services = computed(() => this.logicConfigSignal()?.services || {});
  
  // Registry of action handlers
  private actionHandlers: ActionHandlerRegistry = {};
  
  // Condition evaluator
  private conditionEvaluator: ConditionEvaluator = {
    evaluate: (condition: string, context: StateMachineContext): boolean => {
      if (!condition) return true;
      
      try {
        // Create a function that evaluates the condition with the context as its scope
        const evaluator = new Function(...Object.keys(context), `return ${condition};`);
        return evaluator(...Object.values(context));
      } catch (error) {
        console.error(`Error evaluating condition "${condition}":`, error);
        return false;
      }
    }
  };
  
  constructor(private http: HttpClient) {}
  
  /**
   * Loads the logic configuration from the JSON file
   * Used by APP_INITIALIZER to load logic config at startup
   */
  loadLogicConfig(): Observable<LogicModel> {
    return this.http.get<LogicModel>('assets/logic.json').pipe(
      tap(logicConfig => {
        console.log('Logic configuration loaded successfully');
        this.logicConfigSignal.set(logicConfig);
      }),
      catchError(error => {
        console.error('Failed to load logic configuration', error);
        // Return a default logic config in case of error
        return of(this.getDefaultLogicConfig());
      })
    );
  }
  
  /**
   * Registers an action handler
   * @param actionType The type of action
   * @param handler The action handler
   */
  registerActionHandler(actionType: string, handler: ActionHandler): void {
    this.actionHandlers[actionType] = handler;
  }
  
  /**
   * Creates a new state machine for the specified workflow
   * @param workflowName The name of the workflow
   * @param initialContext The initial context for the state machine
   * @returns A new state machine
   */
  create(workflowName: string, initialContext: StateMachineContext = {}): StateMachine {
    const workflows = this.workflows();
    const workflow = workflows[workflowName];
    
    if (!workflow) {
      throw new Error(`Workflow "${workflowName}" not found`);
    }
    
    return new StateMachineImpl(
      workflow,
      this.actions(),
      initialContext,
      this.actionHandlers,
      this.conditionEvaluator
    );
  }
  
  /**
   * Gets all available workflow names
   * @returns An array of workflow names
   */
  getWorkflowNames(): string[] {
    return Object.keys(this.workflows());
  }
  
  /**
   * Gets a workflow definition by name
   * @param workflowName The name of the workflow
   * @returns The workflow definition
   */
  getWorkflow(workflowName: string): WorkflowDefinition | null {
    return this.workflows()[workflowName] || null;
  }
  
  /**
   * Gets an action definition by name
   * @param actionName The name of the action
   * @returns The action definition
   */
  getAction(actionName: string): ActionDefinition | null {
    return this.actions()[actionName] || null;
  }
  
  /**
   * Gets a service definition by name
   * @param serviceName The name of the service
   * @returns The service definition
   */
  getService(serviceName: string): ServiceDefinition | null {
    return this.services()[serviceName] || null;
  }
  
  /**
   * Provides a default logic configuration in case the logic.json file cannot be loaded
   */
  private getDefaultLogicConfig(): LogicModel {
    return {
      workflows: {
        simple: {
          initialState: 'start',
          states: {
            start: {
              actions: [],
              transitions: [
                {
                  target: 'end',
                  event: 'FINISH'
                }
              ]
            },
            end: {
              actions: [],
              transitions: []
            }
          }
        }
      },
      actions: {},
      services: {}
    };
  }
}

/**
 * Implementation of the StateMachine interface
 */
class StateMachineImpl implements StateMachine {
  private stateSubject = new BehaviorSubject<string>('');
  private contextSubject = new BehaviorSubject<StateMachineContext>({});
  private listeners: ((state: string, context: StateMachineContext) => void)[] = [];
  
  constructor(
    private workflow: WorkflowDefinition,
    private actions: { [key: string]: ActionDefinition },
    initialContext: StateMachineContext,
    private actionHandlers: ActionHandlerRegistry,
    private conditionEvaluator: ConditionEvaluator
  ) {
    // Initialize the state machine
    this.stateSubject.next(workflow.initialState);
    this.contextSubject.next(initialContext);
    
    // Subscribe to state changes
    this.stateSubject.subscribe(state => {
      this.notifyListeners();
    });
  }
  
  get currentState(): string {
    return this.stateSubject.value;
  }
  
  get context(): StateMachineContext {
    return this.contextSubject.value;
  }
  
  /**
   * Sends an event to the state machine
   * @param event The event to send
   */
  send(event: StateMachineEvent): void {
    const currentState = this.stateSubject.value;
    const stateDefinition = this.workflow.states[currentState];
    
    if (!stateDefinition) {
      console.error(`State "${currentState}" not found in workflow`);
      return;
    }
    
    // Find the transition that matches the event
    const transition = stateDefinition.transitions.find(t => 
      t.event === event.type && 
      this.conditionEvaluator.evaluate(t.condition || '', this.context)
    );
    
    if (!transition) {
      console.warn(`No valid transition found for event "${event.type}" in state "${currentState}"`);
      return;
    }
    
    // Execute transition actions
    if (transition.actions && transition.actions.length > 0) {
      this.executeActions(transition.actions, event.payload);
    }
    
    // Update the context with the event payload
    if (event.payload) {
      this.updateContext(event.payload);
    }
    
    // Transition to the target state
    this.stateSubject.next(transition.target);
    
    // Execute entry actions for the new state
    const targetStateDefinition = this.workflow.states[transition.target];
    if (targetStateDefinition && targetStateDefinition.actions.length > 0) {
      this.executeActions(targetStateDefinition.actions, event.payload);
    }
  }
  
  /**
   * Gets the current state
   * @returns The current state
   */
  getState(): string {
    return this.stateSubject.value;
  }
  
  /**
   * Gets the current context
   * @returns The current context
   */
  getContext(): StateMachineContext {
    return this.contextSubject.value;
  }
  
  /**
   * Subscribes to state changes
   * @param listener The listener function
   * @returns A function to unsubscribe
   */
  subscribe(listener: (state: string, context: StateMachineContext) => void): () => void {
    this.listeners.push(listener);
    
    // Immediately notify the listener of the current state
    listener(this.currentState, this.context);
    
    // Return an unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Executes a list of actions
   * @param actions The actions to execute
   * @param payload The event payload
   */
  private async executeActions(actions: any[], payload?: any): Promise<void> {
    for (const action of actions) {
      await this.executeAction(action, payload);
    }
  }
  
  /**
   * Executes a single action
   * @param action The action to execute
   * @param payload The event payload
   */
  private async executeAction(action: any, payload?: any): Promise<void> {
    const actionDefinition = this.actions[action.type];
    
    if (!actionDefinition) {
      console.error(`Action "${action.type}" not found`);
      return;
    }
    
    const handler = this.actionHandlers[actionDefinition.type];
    
    if (!handler) {
      console.error(`No handler registered for action type "${actionDefinition.type}"`);
      return;
    }
    
    try {
      // Resolve parameter values from the context
      const resolvedParams = this.resolveParams(action.params || {});
      
      // Execute the action
      const result = await handler.execute(resolvedParams, this.context);
      
      // Update the context with the result
      if (result) {
        this.updateContext(result);
      }
    } catch (error) {
      console.error(`Error executing action "${action.type}":`, error);
    }
  }
  
  /**
   * Resolves parameter values from the context
   * @param params The parameters to resolve
   * @returns The resolved parameters
   */
  private resolveParams(params: { [key: string]: any }): { [key: string]: any } {
    const resolvedParams: { [key: string]: any } = {};
    
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && value.includes('.')) {
        // Resolve the value from the context
        resolvedParams[key] = this.getValueFromPath(value, this.context);
      } else {
        resolvedParams[key] = value;
      }
    }
    
    return resolvedParams;
  }
  
  /**
   * Gets a value from a path in an object
   * @param path The path to the value
   * @param obj The object to get the value from
   * @returns The value at the path
   */
  private getValueFromPath(path: string, obj: any): any {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : undefined;
    }, obj);
  }
  
  /**
   * Updates the context with new values
   * @param newValues The new values to add to the context
   */
  private updateContext(newValues: { [key: string]: any }): void {
    this.contextSubject.next({
      ...this.context,
      ...newValues
    });
    
    this.notifyListeners();
  }
  
  /**
   * Notifies all listeners of the current state and context
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.currentState, this.context);
    }
  }
} 