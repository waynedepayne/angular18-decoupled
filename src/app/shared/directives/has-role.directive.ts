import { Directive, Input, OnInit, OnDestroy, TemplateRef, ViewContainerRef, inject, effect, PLATFORM_ID } from '@angular/core';
import { SecurityService } from '../../core/services/security.service';
import { isPlatformBrowser } from '@angular/common';

/**
 * Directive that conditionally shows or hides elements based on user roles
 * Usage:
 * <div *appHasRole="'admin'">Only visible to admins</div>
 * <div *appHasRole="['admin', 'editor']" [appHasRoleMode]="'any'">Visible if user has any of these roles</div>
 * <div *appHasRole="['admin', 'editor']" [appHasRoleMode]="'all'">Visible if user has all of these roles</div>
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private securityService = inject(SecurityService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private platformId = inject(PLATFORM_ID);
  
  // The role(s) required to view the element
  @Input('appHasRole') role: string | string[] = '';
  
  // The mode to use when checking multiple roles ('any' or 'all')
  @Input() appHasRoleMode: 'any' | 'all' = 'any';
  
  // Whether to show or hide the element when the user has the role
  @Input() appHasRoleElse: TemplateRef<any> | null = null;
  
  private hasView = false;
  private roleEffect: any = null;
  
  ngOnInit(): void {
    this.updateView();
    
    // Only set up the effect in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Use effect to watch for role changes
      this.roleEffect = effect(() => {
        // Reading the signal inside the effect will make it re-run when the signal changes
        const _ = this.securityService.currentUserRoles();
        this.updateView();
      });
    }
  }
  
  ngOnDestroy(): void {
    // Clean up the effect if it exists
    if (this.roleEffect) {
      // Note: Angular's effect cleanup is automatic, no explicit cleanup needed
    }
  }
  
  private updateView(): void {
    // In SSR, default to showing the content for SEO purposes
    if (!isPlatformBrowser(this.platformId)) {
      if (!this.hasView) {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      }
      return;
    }
    
    // Check if the user has the required role(s)
    const hasRole = this.checkRole();
    
    if (hasRole && !this.hasView) {
      // Show the element
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasRole && this.hasView) {
      // Hide the element
      this.viewContainer.clear();
      
      // Show the else template if provided
      if (this.appHasRoleElse) {
        this.viewContainer.createEmbeddedView(this.appHasRoleElse);
      }
      
      this.hasView = false;
    }
  }
  
  private checkRole(): boolean {
    // If no role is specified, allow access
    if (!this.role || (Array.isArray(this.role) && this.role.length === 0)) {
      return true;
    }
    
    // Check if the user has the required role(s)
    if (Array.isArray(this.role)) {
      if (this.appHasRoleMode === 'any') {
        return this.securityService.hasAnyRole(this.role);
      } else {
        return this.securityService.hasAllRoles(this.role);
      }
    } else {
      return this.securityService.hasRole(this.role);
    }
  }
} 