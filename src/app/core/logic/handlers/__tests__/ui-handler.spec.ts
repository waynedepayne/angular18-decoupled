import { TestBed } from '@angular/core/testing';
import { UiHandler } from '../ui-handler';
import { StateMachineContext } from '../../../models/logic.model';
import { InjectionToken } from '@angular/core';

describe('UiHandler', () => {
  let handler: UiHandler;
  let toastServiceSpy: jasmine.SpyObj<any>;
  let dialogServiceSpy: jasmine.SpyObj<any>;
  let routerSpy: jasmine.SpyObj<any>;

  // Create injection tokens for the services
  const TOAST_SERVICE = new InjectionToken<any>('ToastService');
  const DIALOG_SERVICE = new InjectionToken<any>('DialogService');
  const ROUTER = new InjectionToken<any>('Router');

  beforeEach(() => {
    const toastSpy = jasmine.createSpyObj('ToastService', ['show']);
    const dialogSpy = jasmine.createSpyObj('DialogService', ['open', 'confirm']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        UiHandler,
        { provide: TOAST_SERVICE, useValue: toastSpy },
        { provide: DIALOG_SERVICE, useValue: dialogSpy },
        { provide: ROUTER, useValue: routerSpyObj }
      ]
    });

    handler = TestBed.inject(UiHandler);
    toastServiceSpy = TestBed.inject(TOAST_SERVICE) as jasmine.SpyObj<any>;
    dialogServiceSpy = TestBed.inject(DIALOG_SERVICE) as jasmine.SpyObj<any>;
    routerSpy = TestBed.inject(ROUTER) as jasmine.SpyObj<any>;
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  it('should show a toast notification', async () => {
    const params = {
      action: 'toast',
      message: 'Operation successful',
      type: 'success',
      duration: 3000
    };
    const context: StateMachineContext = {};

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true });
    expect(toastServiceSpy.show).toHaveBeenCalledWith({
      message: 'Operation successful',
      type: 'success',
      duration: 3000
    });
  });

  it('should show a toast with message from context', async () => {
    const params = {
      action: 'toast',
      messageFrom: 'successMessage',
      type: 'success'
    };
    const context: StateMachineContext = {
      successMessage: 'Data saved successfully'
    };

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true });
    expect(toastServiceSpy.show).toHaveBeenCalledWith({
      message: 'Data saved successfully',
      type: 'success',
      duration: jasmine.any(Number)
    });
  });

  it('should open a dialog', async () => {
    const params = {
      action: 'dialog',
      component: 'UserFormComponent',
      data: {
        userId: 123
      },
      resultKey: 'dialogResult'
    };
    const context: StateMachineContext = {};
    const mockDialogRef = {
      afterClosed: () => Promise.resolve({ success: true, data: { name: 'Updated User' } })
    };
    dialogServiceSpy.open.and.returnValue(mockDialogRef);

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true, data: { name: 'Updated User' } });
    expect(dialogServiceSpy.open).toHaveBeenCalledWith('UserFormComponent', {
      data: {
        userId: 123
      }
    });
    expect(context.dialogResult).toEqual({ success: true, data: { name: 'Updated User' } });
  });

  it('should open a dialog with data from context', async () => {
    const params = {
      action: 'dialog',
      component: 'UserFormComponent',
      dataFrom: 'userData',
      resultKey: 'dialogResult'
    };
    const context: StateMachineContext = {
      userData: {
        userId: 456,
        role: 'admin'
      }
    };
    const mockDialogRef = {
      afterClosed: () => Promise.resolve({ success: true })
    };
    dialogServiceSpy.open.and.returnValue(mockDialogRef);

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true });
    expect(dialogServiceSpy.open).toHaveBeenCalledWith('UserFormComponent', {
      data: {
        userId: 456,
        role: 'admin'
      }
    });
  });

  it('should show a confirmation dialog', async () => {
    const params = {
      action: 'confirm',
      title: 'Delete Confirmation',
      message: 'Are you sure you want to delete this item?',
      resultKey: 'confirmResult'
    };
    const context: StateMachineContext = {};
    dialogServiceSpy.confirm.and.returnValue(Promise.resolve(true));

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true, confirmed: true });
    expect(dialogServiceSpy.confirm).toHaveBeenCalledWith({
      title: 'Delete Confirmation',
      message: 'Are you sure you want to delete this item?'
    });
    expect(context.confirmResult).toEqual({ success: true, confirmed: true });
  });

  it('should navigate to a route', async () => {
    const params = {
      action: 'navigate',
      route: ['/users', 123],
      queryParams: {
        tab: 'profile'
      }
    };
    const context: StateMachineContext = {};

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/users', 123], {
      queryParams: {
        tab: 'profile'
      }
    });
  });

  it('should navigate to a route with parameters from context', async () => {
    const params = {
      action: 'navigate',
      route: ['/users', ':userId'],
      queryParamsFrom: 'navParams'
    };
    const context: StateMachineContext = {
      userId: 789,
      navParams: {
        view: 'details',
        edit: true
      }
    };

    const result = await handler.execute(params, context);
    
    expect(result).toEqual({ success: true });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/users', 789], {
      queryParams: {
        view: 'details',
        edit: true
      }
    });
  });
}); 