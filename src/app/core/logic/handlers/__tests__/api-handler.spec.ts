import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiHandler } from '../api-handler';
import { StateMachineContext } from '../../../models/logic.model';

describe('ApiHandler', () => {
  let handler: ApiHandler;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiHandler]
    });
    handler = TestBed.inject(ApiHandler);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  it('should make a GET request', async () => {
    const params = {
      method: 'GET',
      url: '/api/users',
      resultKey: 'users'
    };
    const context: StateMachineContext = {};
    const mockResponse = { data: [{ id: 1, name: 'John' }] };

    const promise = handler.execute(params, context);
    
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
    expect(context.users).toEqual(mockResponse);
  });

  it('should make a POST request with body from context', async () => {
    const params = {
      method: 'POST',
      url: '/api/users',
      bodyFrom: 'userData',
      resultKey: 'createdUser'
    };
    const context: StateMachineContext = {
      userData: { name: 'John', email: 'john@example.com' }
    };
    const mockResponse = { id: 1, name: 'John', email: 'john@example.com' };

    const promise = handler.execute(params, context);
    
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(context.userData);
    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
    expect(context.createdUser).toEqual(mockResponse);
  });

  it('should make a PUT request with direct body', async () => {
    const params = {
      method: 'PUT',
      url: '/api/users/1',
      body: { name: 'John Updated', email: 'john@example.com' },
      resultKey: 'updatedUser'
    };
    const context: StateMachineContext = {};
    const mockResponse = { id: 1, name: 'John Updated', email: 'john@example.com' };

    const promise = handler.execute(params, context);
    
    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(params.body);
    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
    expect(context.updatedUser).toEqual(mockResponse);
  });

  it('should make a DELETE request', async () => {
    const params = {
      method: 'DELETE',
      url: '/api/users/1',
      resultKey: 'deleteResult'
    };
    const context: StateMachineContext = {};
    const mockResponse = { success: true };

    const promise = handler.execute(params, context);
    
    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
    expect(context.deleteResult).toEqual(mockResponse);
  });

  it('should handle URL with path parameters', async () => {
    const params = {
      method: 'GET',
      url: '/api/users/:userId/posts/:postId',
      pathParams: {
        userId: 'userIdValue',
        postId: 'postIdValue'
      },
      resultKey: 'post'
    };
    const context: StateMachineContext = {};
    const mockResponse = { id: 'postIdValue', title: 'Test Post', content: 'Test Content' };

    const promise = handler.execute(params, context);
    
    const req = httpMock.expectOne('/api/users/userIdValue/posts/postIdValue');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
    expect(context.post).toEqual(mockResponse);
  });

  it('should handle URL with path parameters from context', async () => {
    const params = {
      method: 'GET',
      url: '/api/users/:userId/posts/:postId',
      resultKey: 'post'
    };
    const context: StateMachineContext = {
      userId: 123,
      postId: 456
    };
    const mockResponse = { id: 456, title: 'Test Post', content: 'Test Content' };

    const promise = handler.execute(params, context);
    
    const req = httpMock.expectOne('/api/users/123/posts/456');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
    expect(context.post).toEqual(mockResponse);
  });

  it('should handle query parameters', async () => {
    const params = {
      method: 'GET',
      url: '/api/users',
      queryParams: {
        page: 1,
        limit: 10,
        search: 'John'
      },
      resultKey: 'users'
    };
    const context: StateMachineContext = {};
    const mockResponse = { data: [{ id: 1, name: 'John' }], total: 1 };

    const promise = handler.execute(params, context);
    
    const req = httpMock.expectOne('/api/users?page=1&limit=10&search=John');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
    expect(context.users).toEqual(mockResponse);
  });

  it('should handle query parameters from context', async () => {
    const params = {
      method: 'GET',
      url: '/api/users',
      queryParamsFrom: 'searchParams',
      resultKey: 'users'
    };
    const context: StateMachineContext = {
      searchParams: {
        page: 2,
        limit: 20,
        search: 'Doe'
      }
    };
    const mockResponse = { data: [{ id: 2, name: 'Jane Doe' }], total: 1 };

    const promise = handler.execute(params, context);
    
    const req = httpMock.expectOne('/api/users?page=2&limit=20&search=Doe');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
    expect(context.users).toEqual(mockResponse);
  });

  it('should handle error responses', async () => {
    const params = {
      method: 'GET',
      url: '/api/users/999',
      resultKey: 'user',
      errorKey: 'apiError'
    };
    const context: StateMachineContext = {};
    const errorResponse = { status: 404, statusText: 'Not Found' };

    const promise = handler.execute(params, context);
    
    const req = httpMock.expectOne('/api/users/999');
    expect(req.request.method).toBe('GET');
    req.flush('User not found', errorResponse);

    try {
      await promise;
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(context.apiError).toBeDefined();
      expect(context.apiError.status).toBe(404);
    }
  });
}); 