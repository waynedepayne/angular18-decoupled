import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { Product, Category } from '../../core/models/data.model';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Product Catalog</h1>
      
      <!-- Category Filter -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-2">Categories</h2>
        <div class="flex flex-wrap gap-2">
          <button 
            *ngFor="let category of categories()"
            (click)="filterByCategory(category.id)"
            class="px-3 py-1 rounded-full text-sm"
            [class.bg-blue-500]="selectedCategoryId === category.id"
            [class.text-white]="selectedCategoryId === category.id"
            [class.bg-gray-200]="selectedCategoryId !== category.id"
          >
            {{ category.name }}
          </button>
          <button 
            (click)="clearFilter()"
            class="px-3 py-1 rounded-full text-sm bg-gray-300"
          >
            Clear Filter
          </button>
        </div>
      </div>
      
      <!-- Products Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          *ngFor="let product of filteredProducts()"
          class="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
        >
          <div class="p-4">
            <h3 class="text-xl font-semibold mb-2">{{ product.name }}</h3>
            <p class="text-gray-600 mb-4">{{ product.description }}</p>
            <div class="flex justify-between items-center">
              <span class="text-lg font-bold">
                {{ getCurrencySymbol(product.currency) }}{{ product.price.toFixed(2) }}
              </span>
              <span 
                class="px-2 py-1 rounded text-xs"
                [class.bg-green-100]="product.isActive"
                [class.text-green-800]="product.isActive"
                [class.bg-red-100]="!product.isActive"
                [class.text-red-800]="!product.isActive"
              >
                {{ product.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="mt-4 text-sm text-gray-500">
              <p>SKU: {{ product.sku }}</p>
              <p>Category: {{ getCategoryName(product.categoryId) }}</p>
              <p *ngIf="product.inventoryLevel !== undefined">
                Stock: {{ product.inventoryLevel }} units
              </p>
            </div>
            <div *ngIf="product.attributes" class="mt-4 pt-4 border-t border-gray-200">
              <h4 class="font-semibold mb-2">Specifications</h4>
              <ul class="text-sm">
                <li *ngFor="let attr of getAttributeEntries(product)">
                  <span class="font-medium">{{ formatAttributeName(attr[0]) }}:</span> {{ attr[1] }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div *ngIf="filteredProducts().length === 0" class="text-center py-12">
        <p class="text-gray-500">No products found.</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProductCatalogComponent implements OnInit {
  private dataService = inject(DataService);
  
  // Use signals from the data service
  products = this.dataService.products;
  categories = this.dataService.categories;
  
  // Local state
  selectedCategoryId: string | null = null;
  
  ngOnInit(): void {
    // Component initialization logic if needed
  }
  
  // Filter products by category
  filterByCategory(categoryId: string): void {
    this.selectedCategoryId = categoryId;
  }
  
  // Clear category filter
  clearFilter(): void {
    this.selectedCategoryId = null;
  }
  
  // Get filtered products based on selected category
  filteredProducts(): Product[] {
    if (!this.selectedCategoryId) {
      return this.products();
    }
    
    return this.dataService.getProductsByCategory(this.selectedCategoryId);
  }
  
  // Get category name by ID
  getCategoryName(categoryId: string): string {
    const category = this.dataService.getCategoryById(categoryId);
    return category ? category.name : 'Unknown';
  }
  
  // Get currency symbol
  getCurrencySymbol(currencyCode: string): string {
    const currency = this.dataService.getCurrencyByCode(currencyCode);
    return currency ? currency.symbol : '$';
  }
  
  // Format attribute name (convert camelCase to Title Case with spaces)
  formatAttributeName(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }
  
  // Get attribute entries for display
  getAttributeEntries(product: Product): [string, any][] {
    if (!product.attributes) {
      return [];
    }
    
    return Object.entries(product.attributes);
  }
} 