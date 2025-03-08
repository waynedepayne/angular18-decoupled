import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataResolver implements Resolve<any> {
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    // This is a simplified example. In a real application, you would fetch data from a service.
    
    // Get the ID from the route parameters
    const id = route.paramMap.get('id');
    
    // Simulate an API call with a delay
    return of({
      id,
      name: `Item ${id}`,
      description: `This is item ${id}`,
      createdAt: new Date().toISOString()
    }).pipe(
      delay(500) // Simulate network delay
    );
  }
} 