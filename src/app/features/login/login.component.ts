import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SecurityService } from '../../core/services/security.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Login</h2>
        <p class="subtitle">Select a role to login with</p>
        
        <div class="form-group">
          <label for="username">Role</label>
          <select id="username" [(ngModel)]="username" class="form-control">
            <option value="">Select a role</option>
            <option value="user">User</option>
            <option value="editor">Editor</option>
            <option value="manager">Manager</option>
            <option value="developer">Developer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            [(ngModel)]="password" 
            class="form-control" 
            placeholder="Any password will work"
          >
          <small class="form-text text-muted">For demo purposes, any password will work</small>
        </div>
        
        <div class="form-actions">
          <button 
            class="btn btn-primary" 
            (click)="login()" 
            [disabled]="!username || isLoggingIn"
          >
            {{ isLoggingIn ? 'Logging in...' : 'Login' }}
          </button>
          <button class="btn btn-secondary" (click)="goBack()">Cancel</button>
        </div>
        
        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
    </div>
    
    <style>
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 80vh;
        padding: 20px;
      }
      
      .login-card {
        background-color: var(--color-background, #ffffff);
        border-radius: var(--border-radius-large, 8px);
        box-shadow: var(--shadow-2, 0 3px 6px rgba(0, 0, 0, 0.15));
        padding: 32px;
        width: 100%;
        max-width: 400px;
      }
      
      h2 {
        color: var(--color-primary, #3f51b5);
        margin-top: 0;
        margin-bottom: 8px;
      }
      
      .subtitle {
        color: var(--color-text-secondary, #757575);
        margin-bottom: 24px;
      }
      
      .form-group {
        margin-bottom: 20px;
      }
      
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
      }
      
      .form-control {
        display: block;
        width: 100%;
        padding: 10px 12px;
        font-size: 1rem;
        border: 1px solid var(--color-divider, #e0e0e0);
        border-radius: var(--border-radius-medium, 4px);
        background-color: var(--color-background, #ffffff);
      }
      
      .form-text {
        display: block;
        margin-top: 4px;
        font-size: 0.875rem;
        color: var(--color-text-secondary, #757575);
      }
      
      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
      }
      
      .btn {
        padding: 10px 16px;
        border-radius: var(--border-radius-medium, 4px);
        border: none;
        font-weight: 500;
        cursor: pointer;
        flex: 1;
      }
      
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .btn-primary {
        background-color: var(--color-primary, #3f51b5);
        color: var(--color-primary-contrast, #ffffff);
      }
      
      .btn-secondary {
        background-color: var(--color-surface, #f5f5f5);
        color: var(--color-text-primary, #212121);
        border: 1px solid var(--color-divider, #e0e0e0);
      }
      
      .error-message {
        margin-top: 16px;
        padding: 12px;
        background-color: #ffebee;
        color: #d32f2f;
        border-radius: var(--border-radius-medium, 4px);
        font-size: 0.875rem;
      }
    </style>
  `
})
export class LoginComponent implements OnInit {
  private securityService = inject(SecurityService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  username: string = '';
  password: string = 'password'; // Default password for demo
  returnUrl: string = '/';
  errorMessage: string = '';
  isLoggingIn: boolean = false;
  
  ngOnInit(): void {
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/security-demo';
    
    // Store the return URL in localStorage for the security service to use
    localStorage.setItem('returnUrl', this.returnUrl);
    
    // Set a default password for demo purposes
    this.password = 'password';
    
    // If already authenticated, redirect to return URL
    if (this.securityService.isAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }
  
  login(): void {
    if (!this.username) {
      this.errorMessage = 'Please select a role';
      return;
    }
    
    this.errorMessage = '';
    this.isLoggingIn = true;
    
    // Store the username in localStorage for session restoration
    localStorage.setItem('username', this.username);
    
    this.securityService.login(this.username, this.password || 'password').subscribe({
      next: (response) => {
        this.isLoggingIn = false;
        // The security service will handle the navigation
      },
      error: (error) => {
        this.isLoggingIn = false;
        this.errorMessage = 'Login failed. Please try again.';
        console.error('Login error:', error);
      }
    });
  }
  
  goBack(): void {
    // Navigate back or to the home page
    this.router.navigate(['/']);
  }
} 