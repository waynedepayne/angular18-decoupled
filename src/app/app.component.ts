import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { SecurityService } from './core/services/security.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <header class="app-header" [class.scrolled]="isScrolled">
        <div class="logo">
          <h1>Angular 18 Enterprise</h1>
        </div>
        
        <button class="mobile-menu-toggle" (click)="toggleMobileMenu()" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <nav class="main-nav" [class.mobile-open]="isMobileMenuOpen">
          <div class="nav-group">
            <div class="nav-group-title" (click)="toggleDropdown('config')">
              Configuration
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6"/>
              </svg>
            </div>
            <ul class="dropdown-menu" [class.open]="activeDropdown === 'config'">
              <li><a routerLink="/config-demo" routerLinkActive="active" (click)="closeMobileMenu()">Config</a></li>
              <li><a routerLink="/design-demo" routerLinkActive="active" (click)="closeMobileMenu()">Design</a></li>
              <li><a routerLink="/router-demo" routerLinkActive="active" (click)="closeMobileMenu()">Router</a></li>
              <li><a routerLink="/logic-demo" routerLinkActive="active" (click)="closeMobileMenu()">Logic</a></li>
              <li><a routerLink="/rules-demo" routerLinkActive="active" (click)="closeMobileMenu()">Rules</a></li>
            </ul>
          </div>
          
          <div class="nav-group">
            <div class="nav-group-title" (click)="toggleDropdown('features')">
              Features
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6"/>
              </svg>
            </div>
            <ul class="dropdown-menu" [class.open]="activeDropdown === 'features'">
              <li><a routerLink="/product-catalog" routerLinkActive="active" (click)="closeMobileMenu()">Product Catalog</a></li>
              <li><a routerLink="/i18n-demo" routerLinkActive="active" (click)="closeMobileMenu()">I18n</a></li>
              <li><a routerLink="/animation-demo" routerLinkActive="active" (click)="closeMobileMenu()">Animations</a></li>
              <li><a routerLink="/theming-demo" routerLinkActive="active" (click)="closeMobileMenu()">Theming</a></li>
            </ul>
          </div>
          
          <div class="nav-group">
            <div class="nav-group-title" (click)="toggleDropdown('advanced')">
              Advanced
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6"/>
              </svg>
            </div>
            <ul class="dropdown-menu" [class.open]="activeDropdown === 'advanced'">
              <li><a routerLink="/security-demo" routerLinkActive="active" (click)="closeMobileMenu()">Security</a></li>
              <li><a routerLink="/microfrontend-demo" routerLinkActive="active" (click)="closeMobileMenu()">Microfrontends</a></li>
              <li><a routerLink="/analytics-demo" routerLinkActive="active" (click)="closeMobileMenu()">Analytics</a></li>
              <li><a routerLink="/upgrade-demo" routerLinkActive="active" (click)="closeMobileMenu()">Upgrade Bridge</a></li>
            </ul>
          </div>
        </nav>
        
        <div class="auth-actions">
          <ng-container *ngIf="securityService.isAuthenticated(); else loginButton">
            <div class="user-profile" (click)="toggleDropdown('user')">
              <div class="avatar">{{ getUserInitials() }}</div>
              <span class="user-name">{{ (securityService.currentUser$ | async)?.username }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6"/>
              </svg>
              <ul class="dropdown-menu user-menu" [class.open]="activeDropdown === 'user'">
                <li><a routerLink="/profile">Profile</a></li>
                <li><a routerLink="/settings">Settings</a></li>
                <li><button class="logout-btn" (click)="logout()">Logout</button></li>
              </ul>
            </div>
          </ng-container>
          <ng-template #loginButton>
            <a routerLink="/login" class="login-btn">Login</a>
          </ng-template>
        </div>
      </header>

      <main class="app-content">
        <router-outlet></router-outlet>
      </main>

      <footer class="app-footer">
        <p>&copy; 2025 Angular 18 Enterprise App - JSON-Driven Runtime Configurability</p>
      </footer>
    </div>

    <style>
      :host {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #333;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        --primary-color: #3f51b5;
        --primary-dark: #303f9f;
        --primary-light: #c5cae9;
        --accent-color: #ff4081;
        --text-light: #ffffff;
        --text-dark: #333333;
        --gray-light: #f5f5f5;
        --gray-medium: #e0e0e0;
        --gray-dark: #9e9e9e;
        --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
        --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
        --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15);
        --transition-speed: 0.3s;
        --border-radius: 4px;
      }

      .app-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .app-header {
        background-color: var(--primary-color);
        color: var(--text-light);
        padding: 0.75rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: var(--shadow-md);
        position: sticky;
        top: 0;
        z-index: 1000;
        transition: all var(--transition-speed);
      }
      
      .app-header.scrolled {
        padding: 0.5rem 1.5rem;
        box-shadow: var(--shadow-lg);
        background-color: var(--primary-dark);
      }

      .logo h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        letter-spacing: 0.5px;
      }

      .mobile-menu-toggle {
        display: none;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        z-index: 1001;
      }

      .mobile-menu-toggle span {
        display: block;
        width: 24px;
        height: 2px;
        margin: 5px 0;
        background-color: var(--text-light);
        transition: all var(--transition-speed);
      }

      .main-nav {
        display: flex;
        align-items: center;
      }

      .nav-group {
        position: relative;
        margin: 0 0.5rem;
      }

      .nav-group-title {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        cursor: pointer;
        border-radius: var(--border-radius);
        transition: background-color var(--transition-speed);
        font-weight: 500;
      }

      .nav-group-title:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .nav-group-title svg {
        margin-left: 0.5rem;
        transition: transform var(--transition-speed);
      }

      .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        background-color: white;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-md);
        min-width: 180px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: all var(--transition-speed);
        z-index: 1000;
        list-style: none;
        padding: 0.5rem 0;
        margin: 0;
      }

      .dropdown-menu.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .dropdown-menu li {
        margin: 0;
      }

      .dropdown-menu a, 
      .dropdown-menu button {
        display: block;
        padding: 0.75rem 1.25rem;
        color: var(--text-dark);
        text-decoration: none;
        transition: background-color var(--transition-speed);
        text-align: left;
        width: 100%;
        border: none;
        background: none;
        font-size: 1rem;
        cursor: pointer;
      }

      .dropdown-menu a:hover, 
      .dropdown-menu button:hover,
      .dropdown-menu a.active {
        background-color: var(--gray-light);
        color: var(--primary-color);
      }

      .auth-actions {
        display: flex;
        align-items: center;
      }

      .user-profile {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: var(--border-radius);
        transition: background-color var(--transition-speed);
        position: relative;
      }

      .user-profile:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: var(--accent-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        margin-right: 0.75rem;
      }

      .user-name {
        margin-right: 0.5rem;
        font-weight: 500;
      }

      .user-menu {
        right: 0;
        left: auto;
      }

      .login-btn {
        padding: 0.5rem 1.25rem;
        border-radius: var(--border-radius);
        background-color: rgba(255, 255, 255, 0.15);
        color: var(--text-light);
        text-decoration: none;
        transition: background-color var(--transition-speed);
        font-weight: 500;
      }

      .login-btn:hover {
        background-color: rgba(255, 255, 255, 0.25);
      }

      .logout-btn {
        color: #f44336;
      }

      .app-content {
        flex: 1;
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
      }

      .app-footer {
        background-color: var(--gray-light);
        padding: 1.5rem;
        text-align: center;
        font-size: 0.9rem;
        color: var(--gray-dark);
        border-top: 1px solid var(--gray-medium);
      }

      @media (max-width: 1024px) {
        .nav-group-title {
          padding: 0.75rem 0.75rem;
        }
      }

      @media (max-width: 768px) {
        .mobile-menu-toggle {
          display: block;
        }

        .main-nav {
          position: fixed;
          top: 0;
          right: -300px;
          width: 300px;
          height: 100vh;
          background-color: white;
          flex-direction: column;
          align-items: flex-start;
          padding: 5rem 1rem 2rem;
          box-shadow: var(--shadow-lg);
          transition: right var(--transition-speed);
          overflow-y: auto;
        }

        .main-nav.mobile-open {
          right: 0;
        }

        .nav-group {
          width: 100%;
          margin: 0 0 1rem;
        }

        .nav-group-title {
          color: var(--text-dark);
          justify-content: space-between;
          width: 100%;
        }

        .dropdown-menu {
          position: static;
          box-shadow: none;
          opacity: 1;
          visibility: visible;
          transform: none;
          max-height: 0;
          overflow: hidden;
          transition: max-height var(--transition-speed);
        }

        .dropdown-menu.open {
          max-height: 500px;
        }
      }
    </style>
  `
})
export class AppComponent {
  securityService = inject(SecurityService);
  
  isScrolled = false;
  isMobileMenuOpen = false;
  activeDropdown: string | null = null;
  
  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 10;
  }
  
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (!this.isMobileMenuOpen) {
      this.activeDropdown = null;
    }
  }
  
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.activeDropdown = null;
  }
  
  toggleDropdown(dropdown: string) {
    if (this.activeDropdown === dropdown) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = dropdown;
    }
  }
  
  getUserInitials(): string {
    // We'll just return a default value since we can't synchronously access the currentUser$ observable
    // The actual username will be displayed in the template using the async pipe
    return 'U';
  }
  
  logout(): void {
    this.securityService.logout();
    this.closeMobileMenu();
  }
}
