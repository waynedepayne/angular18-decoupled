import { Directive, Input, OnChanges, OnDestroy, SimpleChanges, ViewContainerRef, ComponentRef, Type, Injector, OnInit } from '@angular/core';
import { MicrofrontendService } from '../../core/services/microfrontend.service';
import { Subject, takeUntil } from 'rxjs';

/**
 * Directive for dynamically loading remote components from micro-frontends
 * 
 * Usage:
 * <div appRemoteComponent
 *      remoteName="dashboard"
 *      componentName="DashboardComponent"
 *      [inputs]="{title: 'My Dashboard'}"
 *      (outputs)="handleOutputs($event)">
 * </div>
 */
@Directive({
  selector: '[appRemoteComponent]',
  standalone: true
})
export class RemoteComponentDirective implements OnInit, OnChanges, OnDestroy {
  @Input() remoteName!: string;
  @Input() componentName!: string;
  @Input() inputs: Record<string, any> = {};
  @Input() outputs: Record<string, (event: any) => void> = {};
  
  private componentRef: ComponentRef<any> | null = null;
  private destroy$ = new Subject<void>();
  private loading = false;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private microfrontendService: MicrofrontendService,
    private injector: Injector
  ) {}

  ngOnInit(): void {
    this.loadComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If remoteName or componentName changes, reload the component
    if ((changes['remoteName'] || changes['componentName']) && !changes['remoteName']?.firstChange && !changes['componentName']?.firstChange) {
      this.loadComponent();
    }
    
    // If inputs change, update the component inputs
    if (changes['inputs'] && this.componentRef) {
      this.updateComponentInputs();
    }
    
    // If outputs change, update the component outputs
    if (changes['outputs'] && this.componentRef) {
      this.updateComponentOutputs();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }

  private loadComponent(): void {
    if (!this.remoteName || !this.componentName || this.loading) {
      return;
    }
    
    this.loading = true;
    
    // Clear the container
    this.viewContainerRef.clear();
    
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
    
    // Get the remote module
    this.microfrontendService.getRemote(this.remoteName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(remote => {
        if (!remote) {
          console.error(`Remote module ${this.remoteName} not found`);
          this.loading = false;
          return;
        }
        
        if (!remote.enabled) {
          console.error(`Remote module ${this.remoteName} is disabled`);
          this.loading = false;
          return;
        }
        
        // Find the exposed module
        const exposedModule = remote.exposedModules.find(m => m.name === this.componentName);
        if (!exposedModule) {
          console.error(`Component ${this.componentName} not found in remote ${this.remoteName}`);
          this.loading = false;
          return;
        }
        
        if (!exposedModule.enabled) {
          console.error(`Component ${this.componentName} is disabled in remote ${this.remoteName}`);
          this.loading = false;
          return;
        }
        
        // Load the remote module
        this.microfrontendService['loadRemoteModule'](remote)
          .then(container => {
            return container[exposedModule.path]();
          })
          .then(module => {
            // Create the component
            const componentType = module.default as Type<any>;
            this.componentRef = this.viewContainerRef.createComponent(componentType, { injector: this.injector });
            
            // Set inputs and outputs
            this.updateComponentInputs();
            this.updateComponentOutputs();
            
            // Trigger change detection
            this.componentRef.changeDetectorRef.detectChanges();
            
            this.loading = false;
          })
          .catch(error => {
            console.error(`Error loading component ${this.componentName} from remote ${this.remoteName}:`, error);
            this.loading = false;
          });
      });
  }

  private updateComponentInputs(): void {
    if (!this.componentRef) return;
    
    // Set inputs
    Object.entries(this.inputs).forEach(([key, value]) => {
      this.componentRef!.setInput(key, value);
    });
    
    // Trigger change detection
    this.componentRef.changeDetectorRef.detectChanges();
  }

  private updateComponentOutputs(): void {
    if (!this.componentRef) return;
    
    // Set outputs
    Object.entries(this.outputs).forEach(([key, callback]) => {
      const eventEmitter = this.componentRef!.instance[key];
      if (eventEmitter && typeof eventEmitter.subscribe === 'function') {
        eventEmitter.pipe(takeUntil(this.destroy$)).subscribe((event: any) => {
          callback(event);
        });
      }
    });
  }
} 