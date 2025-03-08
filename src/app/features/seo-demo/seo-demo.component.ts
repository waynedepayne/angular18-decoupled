import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../core/services/seo.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seo-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="seo-demo-container">
      <h1>SEO Configuration Demo</h1>
      
      <div class="card">
        <h2>Current SEO Configuration</h2>
        <div *ngIf="seoConfig">
          <h3>Global Settings</h3>
          <pre>{{ seoConfig.global | json }}</pre>
          
          <h3>Routes ({{ seoConfig.routes.length }})</h3>
          <div class="route-list">
            <div *ngFor="let route of seoConfig.routes" class="route-item">
              <h4>{{ route.path }}</h4>
              <p><strong>Title:</strong> {{ route.title }}</p>
              <p *ngIf="route.meta && route.meta.length">
                <strong>Meta Tags:</strong> {{ route.meta.length }}
              </p>
              <p *ngIf="route.prerender">
                <strong>Prerender:</strong> {{ route.prerender ? 'Yes' : 'No' }}
              </p>
              <button (click)="updateSeoForRoute(route.path)">Apply This Route's SEO</button>
            </div>
          </div>
        </div>
        <div *ngIf="!seoConfig">Loading SEO configuration...</div>
      </div>
      
      <div class="card">
        <h2>Dynamic SEO Updates</h2>
        <div class="form-group">
          <label for="dynamicTitle">Dynamic Title:</label>
          <input type="text" id="dynamicTitle" [(ngModel)]="dynamicTitle" class="form-control">
        </div>
        <div class="form-group">
          <label for="dynamicDescription">Dynamic Description:</label>
          <input type="text" id="dynamicDescription" [(ngModel)]="dynamicDescription" class="form-control">
        </div>
        <button (click)="applyDynamicSeo()">Apply Dynamic SEO</button>
      </div>
      
      <div class="card">
        <h2>Current Page Metadata</h2>
        <p><strong>Title:</strong> {{ currentTitle }}</p>
        <p><strong>Description:</strong> {{ currentDescription }}</p>
        <p><strong>Canonical URL:</strong> {{ currentCanonical }}</p>
        <button (click)="refreshCurrentMetadata()">Refresh Metadata</button>
      </div>
    </div>
  `,
  styles: [`
    .seo-demo-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 20px;
      margin-bottom: 20px;
    }
    
    h1 {
      color: #333;
      margin-bottom: 20px;
    }
    
    h2 {
      color: #555;
      margin-bottom: 15px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    
    pre {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow: auto;
      max-height: 200px;
    }
    
    .route-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    
    .route-item {
      background: #f9f9f9;
      border-radius: 4px;
      padding: 15px;
      border: 1px solid #eee;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .form-control {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    button {
      background: #4285f4;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }
    
    button:hover {
      background: #3367d6;
    }
  `]
})
export class SeoDemoComponent implements OnInit, OnDestroy {
  seoConfig: any = null;
  dynamicTitle = 'Custom Dynamic Title';
  dynamicDescription = 'This is a custom dynamic description set via the SEO service.';
  currentTitle = '';
  currentDescription = '';
  currentCanonical = '';
  
  private subscription = new Subscription();
  
  constructor(
    private seoService: SeoService,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    // Get the SEO configuration
    this.subscription.add(
      this.seoService.getSeoConfig().subscribe(config => {
        this.seoConfig = config;
        this.refreshCurrentMetadata();
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  updateSeoForRoute(path: string): void {
    this.seoService.updateSeoForRoute(path);
    setTimeout(() => this.refreshCurrentMetadata(), 100);
  }
  
  applyDynamicSeo(): void {
    // Set dynamic title
    this.seoService.setDynamicTitle(this.dynamicTitle);
    
    // Set dynamic description
    this.seoService.setDynamicMetaTag({
      name: 'description',
      content: this.dynamicDescription
    });
    
    // Refresh displayed metadata
    this.refreshCurrentMetadata();
  }
  
  refreshCurrentMetadata(): void {
    // Get current title from document
    this.currentTitle = document.title;
    
    // Get current description from meta tag
    const descriptionMeta = document.querySelector('meta[name="description"]');
    this.currentDescription = descriptionMeta ? descriptionMeta.getAttribute('content') || '' : 'No description found';
    
    // Get current canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    this.currentCanonical = canonicalLink ? canonicalLink.getAttribute('href') || '' : 'No canonical URL found';
  }
} 