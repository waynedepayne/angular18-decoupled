import { Injectable } from '@angular/core';
import { ActionHandler, StateMachineContext } from '../../models/logic.model';

@Injectable({
  providedIn: 'root'
})
export class DataHandler implements ActionHandler {
  /**
   * Executes a data action
   * @param params The parameters for the data action
   * @param context The current state machine context
   * @returns A promise that resolves to the data action result
   */
  async execute(params: any, context: StateMachineContext): Promise<any> {
    console.log('Executing data action with params:', params);
    
    // This is a simplified implementation. In a real application, you would
    // interact with a data service to manipulate data.
    
    // For demonstration purposes, we'll simulate different data actions based on the action type
    switch (params.dataAction) {
      case 'clearCart':
        return this.simulateClearCart(params, context);
      case 'addToCart':
        return this.simulateAddToCart(params, context);
      default:
        // For any other data action, return a generic success response
        return {
          data: {
            success: true,
            message: 'Data action completed successfully'
          }
        };
    }
  }
  
  /**
   * Simulates clearing the cart
   * @param params The parameters for the data action
   * @param context The current state machine context
   * @returns A promise that resolves to the clear cart result
   */
  private async simulateClearCart(params: any, context: StateMachineContext): Promise<any> {
    // Return an empty cart
    return {
      cart: {
        items: [],
        itemCount: 0,
        total: 0
      }
    };
  }
  
  /**
   * Simulates adding an item to the cart
   * @param params The parameters for the data action
   * @param context The current state machine context
   * @returns A promise that resolves to the add to cart result
   */
  private async simulateAddToCart(params: any, context: StateMachineContext): Promise<any> {
    // Get the current cart from the context or create a new one
    const cart = context.cart || { items: [], itemCount: 0, total: 0 };
    
    // Get the product and quantity from the params
    const product = params.product;
    const quantity = params.quantity || 1;
    
    if (!product) {
      return {
        error: {
          message: 'Product is required'
        }
      };
    }
    
    // Check if the product is already in the cart
    const existingItemIndex = cart.items.findIndex((item: any) => item.product.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update the quantity of the existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add the new item to the cart
      cart.items.push({
        product,
        quantity,
        price: product.price,
        total: product.price * quantity
      });
    }
    
    // Update the cart totals
    cart.itemCount = cart.items.reduce((count: number, item: any) => count + item.quantity, 0);
    cart.total = cart.items.reduce((total: number, item: any) => total + item.total, 0);
    
    // Return the updated cart
    return {
      cart
    };
  }
} 