import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogicService } from '../services/logic.service';
import { ValidationHandler } from './handlers/validation-handler';
import { UiHandler } from './handlers/ui-handler';
import { ApiHandler } from './handlers/api-handler';
import { DataHandler } from './handlers/data-handler';

@NgModule({
  imports: [
    CommonModule
  ]
})
export class LogicHandlersModule {
  /**
   * Registers the logic handlers with the LogicService
   * @returns A module with providers
   */
  static forRoot(): ModuleWithProviders<LogicHandlersModule> {
    return {
      ngModule: LogicHandlersModule,
      providers: [
        ValidationHandler,
        UiHandler,
        ApiHandler,
        DataHandler
      ]
    };
  }
  
  constructor(
    private logicService: LogicService,
    private validationHandler: ValidationHandler,
    private uiHandler: UiHandler,
    private apiHandler: ApiHandler,
    private dataHandler: DataHandler
  ) {
    // Register the action handlers with the LogicService
    this.logicService.registerActionHandler('validation', this.validationHandler);
    this.logicService.registerActionHandler('ui', this.uiHandler);
    this.logicService.registerActionHandler('api', this.apiHandler);
    this.logicService.registerActionHandler('data', this.dataHandler);
    
    console.log('Logic handlers registered');
  }
} 