import { Injectable } from '@angular/core';
import { ActionHandler, StateMachineContext } from '../../models/logic.model';

@Injectable({
  providedIn: 'root'
})
export class ValidationHandler implements ActionHandler {
  /**
   * Executes a validation action
   * @param params The parameters for the validation
   * @param context The current state machine context
   * @returns A promise that resolves to the validation result
   */
  async execute(params: any, context: StateMachineContext): Promise<any> {
    console.log('Executing validation action with params:', params);
    
    // This is a simplified implementation. In a real application, you would
    // perform actual validation logic here.
    
    // For demonstration purposes, we'll just check if the params have a minItems property
    // and if the context has a cart property with an items array
    if (params.minItems && context.cart && Array.isArray(context.cart.items)) {
      const isValid = context.cart.items.length >= params.minItems;
      
      return {
        validation: {
          isValid,
          errors: isValid ? [] : [`Cart must have at least ${params.minItems} item(s)`]
        }
      };
    }
    
    // If we can't validate, return a default result
    return {
      validation: {
        isValid: true,
        errors: []
      }
    };
  }
} 