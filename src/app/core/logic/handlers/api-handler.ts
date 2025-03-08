import { Injectable } from '@angular/core';
import { ActionHandler, StateMachineContext } from '../../models/logic.model';

@Injectable({
  providedIn: 'root'
})
export class ApiHandler implements ActionHandler {
  /**
   * Executes an API action
   * @param params The parameters for the API action
   * @param context The current state machine context
   * @returns A promise that resolves to the API action result
   */
  async execute(params: any, context: StateMachineContext): Promise<any> {
    console.log('Executing API action with params:', params);
    
    // This is a simplified implementation. In a real application, you would
    // make actual API calls here.
    
    // For demonstration purposes, we'll simulate different API calls based on the action type
    switch (params.apiAction) {
      case 'loadShippingOptions':
        return this.simulateLoadShippingOptions(params, context);
      case 'loadPaymentMethods':
        return this.simulateLoadPaymentMethods(params, context);
      case 'processPayment':
        return this.simulateProcessPayment(params, context);
      case 'createOrder':
        return this.simulateCreateOrder(params, context);
      default:
        // For any other API action, return a generic success response
        return {
          api: {
            success: true,
            data: { message: 'API call completed successfully' }
          }
        };
    }
  }
  
  /**
   * Simulates loading shipping options
   * @param params The parameters for the API action
   * @param context The current state machine context
   * @returns A promise that resolves to the shipping options
   */
  private async simulateLoadShippingOptions(params: any, context: StateMachineContext): Promise<any> {
    // Simulate an API delay
    await this.delay(500);
    
    // Return mock shipping options
    return {
      shipping: {
        options: [
          { id: 'standard', name: 'Standard Shipping', price: 5.99, estimatedDays: '3-5' },
          { id: 'express', name: 'Express Shipping', price: 12.99, estimatedDays: '1-2' },
          { id: 'overnight', name: 'Overnight Shipping', price: 19.99, estimatedDays: '1' }
        ]
      }
    };
  }
  
  /**
   * Simulates loading payment methods
   * @param params The parameters for the API action
   * @param context The current state machine context
   * @returns A promise that resolves to the payment methods
   */
  private async simulateLoadPaymentMethods(params: any, context: StateMachineContext): Promise<any> {
    // Simulate an API delay
    await this.delay(500);
    
    // Return mock payment methods
    return {
      payment: {
        methods: [
          { id: 'credit_card', name: 'Credit Card' },
          { id: 'paypal', name: 'PayPal' },
          { id: 'apple_pay', name: 'Apple Pay' }
        ]
      }
    };
  }
  
  /**
   * Simulates processing a payment
   * @param params The parameters for the API action
   * @param context The current state machine context
   * @returns A promise that resolves to the payment result
   */
  private async simulateProcessPayment(params: any, context: StateMachineContext): Promise<any> {
    // Simulate an API delay
    await this.delay(1000);
    
    // Return a mock payment result
    return {
      payment: {
        result: {
          success: true,
          transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
          amount: context.order?.total || 0,
          date: new Date().toISOString()
        }
      }
    };
  }
  
  /**
   * Simulates creating an order
   * @param params The parameters for the API action
   * @param context The current state machine context
   * @returns A promise that resolves to the order result
   */
  private async simulateCreateOrder(params: any, context: StateMachineContext): Promise<any> {
    // Simulate an API delay
    await this.delay(800);
    
    // Return a mock order result
    return {
      order: {
        id: 'order_' + Math.random().toString(36).substring(2, 10),
        items: context.cart?.items || [],
        shipping: context.shipping?.selected || {},
        payment: context.payment?.method || {},
        total: context.order?.total || 0,
        status: 'created',
        date: new Date().toISOString()
      }
    };
  }
  
  /**
   * Helper method to simulate an API delay
   * @param ms The number of milliseconds to delay
   * @returns A promise that resolves after the specified delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 