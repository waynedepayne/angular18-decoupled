import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LogicService } from '../logic.service';
import { LogicModel, ActionHandler, ActionType } from '../../models/logic.model';

describe('LogicService', () => {
  let service: LogicService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LogicService]
    });
    service = TestBed.inject(LogicService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load logic configuration from assets/logic.json', () => {
    const mockLogicConfig: LogicModel = {
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
      actions: {
        testAction: {
          type: 'validation',
          handler: 'TestService.testAction'
        }
      },
      services: {
        TestService: {
          methods: ['testAction']
        }
      }
    };

    service.loadLogicConfig().subscribe(config => {
      expect(config).toEqual(mockLogicConfig);
      expect(service.logicConfig()).toEqual(mockLogicConfig);
      expect(service.workflows()).toEqual(mockLogicConfig.workflows);
      expect(service.actions()).toEqual(mockLogicConfig.actions);
      expect(service.services()).toEqual(mockLogicConfig.services);
    });

    const req = httpMock.expectOne('assets/logic.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockLogicConfig);
  });

  it('should create a state machine for a workflow', () => {
    // Set the logic config
    service['logicConfigSignal'].set({
      workflows: {
        test: {
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
    });

    const stateMachine = service.create('test');
    expect(stateMachine).toBeDefined();
    expect(stateMachine.currentState).toBe('start');
  });

  it('should register and use action handlers', () => {
    // Create a mock action handler
    const mockHandler: ActionHandler = {
      execute: jasmine.createSpy('execute').and.returnValue(Promise.resolve({ result: 'success' }))
    };

    // Register the action handler
    service.registerActionHandler('validation', mockHandler);

    // Set the logic config
    service['logicConfigSignal'].set({
      workflows: {
        test: {
          initialState: 'start',
          states: {
            start: {
              actions: [
                {
                  type: 'testAction',
                  params: {
                    param1: 'value1'
                  }
                }
              ],
              transitions: []
            }
          }
        }
      },
      actions: {
        testAction: {
          type: 'validation' as ActionType,
          handler: 'TestService.testAction'
        }
      },
      services: {}
    });

    // Create a state machine
    const stateMachine = service.create('test');
    expect(stateMachine).toBeDefined();

    // The action should have been executed during state machine initialization
    expect(mockHandler.execute).toHaveBeenCalled();
  });

  it('should get workflow names', () => {
    // Set the logic config
    service['logicConfigSignal'].set({
      workflows: {
        workflow1: {
          initialState: 'start',
          states: {
            start: {
              actions: [],
              transitions: []
            }
          }
        },
        workflow2: {
          initialState: 'start',
          states: {
            start: {
              actions: [],
              transitions: []
            }
          }
        }
      },
      actions: {},
      services: {}
    });

    const workflowNames = service.getWorkflowNames();
    expect(workflowNames).toEqual(['workflow1', 'workflow2']);
  });

  it('should get a workflow by name', () => {
    const workflow = {
      initialState: 'start',
      states: {
        start: {
          actions: [],
          transitions: []
        }
      }
    };

    // Set the logic config
    service['logicConfigSignal'].set({
      workflows: {
        test: workflow
      },
      actions: {},
      services: {}
    });

    const result = service.getWorkflow('test');
    expect(result).toEqual(workflow);
  });

  it('should get an action by name', () => {
    const action = {
      type: 'validation' as ActionType,
      handler: 'TestService.testAction'
    };

    // Set the logic config
    service['logicConfigSignal'].set({
      workflows: {},
      actions: {
        testAction: action
      },
      services: {}
    });

    const result = service.getAction('testAction');
    expect(result).toEqual(action);
  });

  it('should get a service by name', () => {
    const serviceDefinition = {
      methods: ['testAction']
    };

    // Set the logic config
    service['logicConfigSignal'].set({
      workflows: {},
      actions: {},
      services: {
        TestService: serviceDefinition
      }
    });

    const result = service.getService('TestService');
    expect(result).toEqual(serviceDefinition);
  });
}); 