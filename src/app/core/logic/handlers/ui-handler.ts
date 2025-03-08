import { Injectable } from '@angular/core';
import { ActionHandler, StateMachineContext } from '../../models/logic.model';

@Injectable({
  providedIn: 'root'
})
export class UiHandler implements ActionHandler {
  /**
   * Executes a UI action
   * @param params The parameters for the UI action
   * @param context The current state machine context
   * @returns A promise that resolves to the UI action result
   */
  async execute(params: any, context: StateMachineContext): Promise<any> {
    console.log('Executing UI action with params:', params);
    
    // This is a simplified implementation. In a real application, you would
    // interact with a UI service to show notifications, modals, etc.
    
    // For demonstration purposes, we'll just log the message
    if (params.message) {
      console.log('UI Message:', params.message);
      
      // In a real application, you might use a notification service like this:
      // this.notificationService.show(params.message, params.type || 'info');
      
      return {
        ui: {
          displayed: true,
          message: params.message,
          type: params.type || 'info'
        }
      };
    }
    
    // If there's no message, return a default result
    return {
      ui: {
        displayed: false
      }
    };
  }
} 