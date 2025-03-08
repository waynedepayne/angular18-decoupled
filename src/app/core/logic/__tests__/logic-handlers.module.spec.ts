import { TestBed } from '@angular/core/testing';
import { LogicHandlersModule } from '../logic-handlers.module';
import { LogicService } from '../../services/logic.service';
import { ValidationHandler } from '../handlers/validation-handler';
import { UiHandler } from '../handlers/ui-handler';
import { ApiHandler } from '../handlers/api-handler';
import { DataHandler } from '../handlers/data-handler';

describe('LogicHandlersModule', () => {
  let logicService: LogicService;
  let validationHandlerSpy: jasmine.SpyObj<ValidationHandler>;
  let uiHandlerSpy: jasmine.SpyObj<UiHandler>;
  let apiHandlerSpy: jasmine.SpyObj<ApiHandler>;
  let dataHandlerSpy: jasmine.SpyObj<DataHandler>;

  beforeEach(() => {
    // Create spies for the handlers
    const validationSpy = jasmine.createSpyObj('ValidationHandler', ['execute']);
    const uiSpy = jasmine.createSpyObj('UiHandler', ['execute']);
    const apiSpy = jasmine.createSpyObj('ApiHandler', ['execute']);
    const dataSpy = jasmine.createSpyObj('DataHandler', ['execute']);

    // Create a spy for the LogicService
    const logicServiceSpy = jasmine.createSpyObj('LogicService', ['registerActionHandler']);

    TestBed.configureTestingModule({
      imports: [LogicHandlersModule],
      providers: [
        { provide: LogicService, useValue: logicServiceSpy },
        { provide: ValidationHandler, useValue: validationSpy },
        { provide: UiHandler, useValue: uiSpy },
        { provide: ApiHandler, useValue: apiSpy },
        { provide: DataHandler, useValue: dataSpy }
      ]
    });

    logicService = TestBed.inject(LogicService);
    validationHandlerSpy = TestBed.inject(ValidationHandler) as jasmine.SpyObj<ValidationHandler>;
    uiHandlerSpy = TestBed.inject(UiHandler) as jasmine.SpyObj<UiHandler>;
    apiHandlerSpy = TestBed.inject(ApiHandler) as jasmine.SpyObj<ApiHandler>;
    dataHandlerSpy = TestBed.inject(DataHandler) as jasmine.SpyObj<DataHandler>;
  });

  it('should register all handlers with the LogicService', () => {
    // The constructor of LogicHandlersModule should have registered all handlers
    expect(logicService.registerActionHandler).toHaveBeenCalledWith('validation', validationHandlerSpy);
    expect(logicService.registerActionHandler).toHaveBeenCalledWith('ui', uiHandlerSpy);
    expect(logicService.registerActionHandler).toHaveBeenCalledWith('api', apiHandlerSpy);
    expect(logicService.registerActionHandler).toHaveBeenCalledWith('data', dataHandlerSpy);
  });

  it('should provide the module with forRoot method', () => {
    const moduleWithProviders = LogicHandlersModule.forRoot();
    expect(moduleWithProviders).toBeDefined();
    expect(moduleWithProviders.ngModule).toBe(LogicHandlersModule);
    expect(moduleWithProviders.providers).toBeDefined();
  });
}); 