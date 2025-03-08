import { Directive, Input, OnInit, OnDestroy, TemplateRef, ViewContainerRef, inject, effect, PLATFORM_ID } from '@angular/core';
import { SecurityService } from '../../core/services/security.service';
import { isPlatformBrowser } from '@angular/common';

/**
 * Directive that conditionally shows or hides elements based on user permissions
 * Usage:
 * <div *appHasPermission="'edit:content'">Only visible to users with edit:content permission</div>
 * <div *appHasPermission="['edit:content', 'publish:content']" [appHasPermissionMode]="'any'">Visible if user has any of these permissions</div>
 * <div *appHasPermission="['edit:content', 'publish:content']" [appHasPermissionMode]="'all'">Visible if user has all of these permissions</div>
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private securityService = inject(SecurityService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private platformId = inject(PLATFORM_ID);
  
  // The permission(s) required to view the element
  @Input('appHasPermission') permission: string | string[] = '';
  
  // The mode to use when checking multiple permissions ('any' or 'all')
  @Input() appHasPermissionMode: 'any' | 'all' = 'all';
  
  // Whether to show or hide the element when the user has the permission
  @Input() appHasPermissionElse: TemplateRef<any> | null = null;
  
  private hasView = false;
  private permissionEffect: any = null;
  
  ngOnInit(): void {
    this.updateView();
    
    // Only set up the effect in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Use effect to watch for role changes
      this.permissionEffect = effect(() => {
        // Reading the signal inside the effect will make it re-run when the signal changes
        const _ = this.securityService.currentUserRoles();
        this.updateView();
      });
    }
  }
  
  ngOnDestroy(): void {
    // Clean up the effect if it exists
    if (this.permissionEffect) {
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
    
    // Check if the user has the required permission(s)
    const hasPermission = this.checkPermission();
    
    if (hasPermission && !this.hasView) {
      // Show the element
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      // Hide the element
      this.viewContainer.clear();
      
      // Show the else template if provided
      if (this.appHasPermissionElse) {
        this.viewContainer.createEmbeddedView(this.appHasPermissionElse);
      }
      
      this.hasView = false;
    }
  }
  
  private checkPermission(): boolean {
    // If no permission is specified, allow access
    if (!this.permission || (Array.isArray(this.permission) && this.permission.length === 0)) {
      return true;
    }
    
    // Check if the user has the required permission(s)
    if (Array.isArray(this.permission)) {
      if (this.appHasPermissionMode === 'any') {
        return this.securityService.hasAnyPermission(this.permission);
      } else {
        return this.securityService.hasAllPermissions(this.permission);
      }
    } else {
      return this.securityService.hasPermission(this.permission);
    }
  }
} 