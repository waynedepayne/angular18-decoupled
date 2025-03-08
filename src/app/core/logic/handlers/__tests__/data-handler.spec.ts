import { TestBed } from '@angular/core/testing';
import { DataHandler } from '../data-handler';
import { StateMachineContext } from '../../../models/logic.model';

describe('DataHandler', () => {
  let handler: DataHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataHandler]
    });
    handler = TestBed.inject(DataHandler);
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  it('should set a value in the context', async () => {
    const params = {
      operation: 'set',
      key: 'username',
      value: 'john.doe'
    };
    const context: StateMachineContext = {};

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true, key: 'username', value: 'john.doe' });
    expect(context.username).toBe('john.doe');
  });

  it('should set a value from another context property', async () => {
    const params = {
      operation: 'set',
      key: 'displayName',
      from: 'user.fullName'
    };
    const context: StateMachineContext = {
      user: {
        fullName: 'John Doe'
      }
    };

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true, key: 'displayName', value: 'John Doe' });
    expect(context.displayName).toBe('John Doe');
  });

  it('should get a value from the context', async () => {
    const params = {
      operation: 'get',
      key: 'user.email'
    };
    const context: StateMachineContext = {
      user: {
        email: 'john@example.com'
      }
    };

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true, key: 'user.email', value: 'john@example.com' });
  });

  it('should delete a property from the context', async () => {
    const params = {
      operation: 'delete',
      key: 'tempData'
    };
    const context: StateMachineContext = {
      tempData: {
        someValue: 'to be deleted'
      }
    };

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true, key: 'tempData' });
    expect(context.tempData).toBeUndefined();
  });

  it('should merge objects in the context', async () => {
    const params = {
      operation: 'merge',
      target: 'user',
      source: 'userUpdate'
    };
    const context: StateMachineContext = {
      user: {
        id: 1,
        name: 'John',
        email: 'john@example.com'
      },
      userUpdate: {
        name: 'John Doe',
        phone: '555-1234'
      }
    };

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true });
    expect(context.user).toEqual({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234'
    });
  });

  it('should push an item to an array in the context', async () => {
    const params = {
      operation: 'push',
      key: 'items',
      value: { id: 3, name: 'Item 3' }
    };
    const context: StateMachineContext = {
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ]
    };

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true, key: 'items' });
    expect(context.items.length).toBe(3);
    expect(context.items[2]).toEqual({ id: 3, name: 'Item 3' });
  });

  it('should remove an item from an array in the context', async () => {
    const params = {
      operation: 'remove',
      key: 'items',
      predicate: { id: 2 }
    };
    const context: StateMachineContext = {
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ]
    };

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true, key: 'items' });
    expect(context.items.length).toBe(2);
    expect(context.items[0]).toEqual({ id: 1, name: 'Item 1' });
    expect(context.items[1]).toEqual({ id: 3, name: 'Item 3' });
  });

  it('should filter an array in the context', async () => {
    const params = {
      operation: 'filter',
      key: 'items',
      predicate: { category: 'electronics' }
    };
    const context: StateMachineContext = {
      items: [
        { id: 1, name: 'Laptop', category: 'electronics' },
        { id: 2, name: 'Book', category: 'books' },
        { id: 3, name: 'Phone', category: 'electronics' }
      ]
    };

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true, key: 'filteredItems' });
    expect(context.filteredItems.length).toBe(2);
    expect(context.filteredItems[0]).toEqual({ id: 1, name: 'Laptop', category: 'electronics' });
    expect(context.filteredItems[1]).toEqual({ id: 3, name: 'Phone', category: 'electronics' });
  });

  it('should map an array in the context', async () => {
    const params = {
      operation: 'map',
      key: 'users',
      resultKey: 'userNames',
      mapTo: 'name'
    };
    const context: StateMachineContext = {
      users: [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' }
      ]
    };

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true, key: 'userNames' });
    expect(context.userNames).toEqual(['John', 'Jane']);
  });

  it('should sort an array in the context', async () => {
    const params = {
      operation: 'sort',
      key: 'users',
      sortBy: 'name',
      direction: 'asc'
    };
    const context: StateMachineContext = {
      users: [
        { id: 2, name: 'Jane', age: 25 },
        { id: 3, name: 'Bob', age: 30 },
        { id: 1, name: 'Alice', age: 28 }
      ]
    };

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true, key: 'users' });
    expect(context.users[0].name).toBe('Alice');
    expect(context.users[1].name).toBe('Bob');
    expect(context.users[2].name).toBe('Jane');
  });

  it('should calculate a value and store it in the context', async () => {
    const params = {
      operation: 'calculate',
      expression: 'items.reduce((sum, item) => sum + item.price * item.quantity, 0)',
      resultKey: 'totalPrice'
    };
    const context: StateMachineContext = {
      items: [
        { id: 1, name: 'Item 1', price: 10, quantity: 2 },
        { id: 2, name: 'Item 2', price: 15, quantity: 1 },
        { id: 3, name: 'Item 3', price: 5, quantity: 3 }
      ]
    };

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true, key: 'totalPrice', value: 55 });
    expect(context.totalPrice).toBe(55);
  });
}); 