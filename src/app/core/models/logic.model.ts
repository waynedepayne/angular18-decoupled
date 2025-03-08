export interface LogicModel {
  workflows: {
    [key: string]: WorkflowDefinition;
  };
  actions: {
    [key: string]: ActionDefinition;
  };
  services: {
    [key: string]: ServiceDefinition;
  };
}

export interface WorkflowDefinition {
  initialState: string;
  states: {
    [key: string]: StateDefinition;
  };
}

export interface StateDefinition {
  actions: StateActionDefinition[];
  transitions: TransitionDefinition[];
}

export interface StateActionDefinition {
  type: string;
  params?: {
    [key: string]: any;
  };
}

export interface TransitionDefinition {
  target: string;
  event: string;
  condition?: string;
  actions?: StateActionDefinition[];
}

export interface ActionDefinition {
  type: ActionType;
  handler: string;
  description?: string;
}

export type ActionType = 'validation' | 'ui' | 'api' | 'calculation' | 'notification' | 'data';

export interface ServiceDefinition {
  methods: string[];
  description?: string;
}

// State machine context interface
export interface StateMachineContext {
  [key: string]: any;
}

// Event interface
export interface StateMachineEvent {
  type: string;
  payload?: any;
}

// State machine interface
export interface StateMachine {
  currentState: string;
  context: StateMachineContext;
  send(event: StateMachineEvent): void;
  getState(): string;
  getContext(): StateMachineContext;
  subscribe(listener: (state: string, context: StateMachineContext) => void): () => void;
}

// Action handler interface
export interface ActionHandler {
  execute(params: any, context: StateMachineContext): Promise<any>;
}

// Action handler registry
export interface ActionHandlerRegistry {
  [key: string]: ActionHandler;
}

// Condition evaluator interface
export interface ConditionEvaluator {
  evaluate(condition: string, context: StateMachineContext): boolean;
}

// State machine factory interface
export interface StateMachineFactory {
  create(workflowName: string, initialContext?: StateMachineContext): StateMachine;
} 