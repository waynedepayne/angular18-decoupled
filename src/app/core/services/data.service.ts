/**
 * @fileoverview DataService is responsible for loading and providing access to domain data
 * and reference lists from data.json.
 * 
 * JSON Source: assets/data.json
 * 
 * Data Structure:
 * - referenceData: Common lookup data (countries, currencies, statuses, etc.)
 * - products: Product catalog information
 * - roles: User roles and permissions
 * - organizations: Organization information
 * - suppliers: Supplier information
 * - categories: Categories for products and services
 * 
 * Transformation Logic:
 * - JSON is loaded at application startup via APP_INITIALIZER
 * - Data is exposed through Angular Signals for reactive access
 * - Computed signals provide easy access to commonly used data sections
 * - Caching mechanisms are implemented for performance optimization
 * - Fallback data is provided in case of loading errors
 */
import { Injectable, signal, computed, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { 
  DataModel, 
  ReferenceData, 
  Country, 
  Currency, 
  Status, 
  PaymentMethod, 
  Unit, 
  Product, 
  Role, 
  Organization, 
  Supplier, 
  Category 
} from '../models/data.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Signal to hold the data
  private dataSignal = signal<DataModel | null>(null);
  
  // Public API for accessing the data
  public readonly data: Signal<DataModel | null> = this.dataSignal.asReadonly();
  
  // Computed signals for commonly accessed data sections
  public readonly referenceData = computed(() => this.dataSignal()?.referenceData);
  public readonly products = computed(() => this.dataSignal()?.products || []);
  public readonly roles = computed(() => this.dataSignal()?.roles || []);
  public readonly organizations = computed(() => this.dataSignal()?.organizations || []);
  public readonly suppliers = computed(() => this.dataSignal()?.suppliers || []);
  public readonly categories = computed(() => this.dataSignal()?.categories || []);
  
  // Computed signals for commonly accessed reference data
  public readonly countries = computed(() => this.referenceData()?.countries || []);
  public readonly currencies = computed(() => this.referenceData()?.currencies || []);
  public readonly statuses = computed(() => this.referenceData()?.statuses || []);
  public readonly paymentMethods = computed(() => this.referenceData()?.paymentMethods || []);
  public readonly units = computed(() => this.referenceData()?.units || []);
  
  constructor(private http: HttpClient) {}
  
  /**
   * Loads the data from the JSON file
   * Used by APP_INITIALIZER to load data at startup
   * 
   * @returns Observable<DataModel> - The loaded data or default values
   */
  loadData(): Observable<DataModel> {
    return this.http.get<DataModel>('assets/data.json').pipe(
      tap(data => {
        console.log('Domain data loaded successfully');
        this.dataSignal.set(data);
      }),
      catchError(error => {
        console.error('Failed to load domain data', error);
        // Return default data in case of error
        return of(this.getDefaultData());
      })
    );
  }
  
  /**
   * Provides default data in case the data file cannot be loaded
   * This ensures the application can still function with minimal data
   * 
   * @returns DataModel - Default data values
   */
  private getDefaultData(): DataModel {
    const defaultData: DataModel = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      referenceData: {
        countries: [
          { code: 'US', name: 'United States' },
          { code: 'CA', name: 'Canada' },
          { code: 'GB', name: 'United Kingdom' }
        ],
        currencies: [
          { code: 'USD', name: 'US Dollar', symbol: '$' },
          { code: 'EUR', name: 'Euro', symbol: '€' },
          { code: 'GBP', name: 'British Pound', symbol: '£' }
        ],
        statuses: [
          { code: 'ACTIVE', name: 'Active', category: 'general' },
          { code: 'INACTIVE', name: 'Inactive', category: 'general' },
          { code: 'PENDING', name: 'Pending', category: 'general' }
        ],
        paymentMethods: [
          { id: 'CREDIT', name: 'Credit Card', isActive: true },
          { id: 'DEBIT', name: 'Debit Card', isActive: true },
          { id: 'BANK', name: 'Bank Transfer', isActive: true }
        ],
        units: [
          { code: 'EA', name: 'Each', category: 'quantity' },
          { code: 'KG', name: 'Kilogram', category: 'weight' },
          { code: 'L', name: 'Liter', category: 'volume' }
        ]
      },
      products: [
        {
          id: 'PROD-001',
          name: 'Sample Product',
          description: 'A sample product for testing',
          sku: 'SKU001',
          price: 19.99,
          currency: 'USD',
          categoryId: 'CAT-001',
          isActive: true
        }
      ],
      roles: [
        {
          id: 'ADMIN',
          name: 'Administrator',
          description: 'Full system access',
          isDefault: false,
          permissions: ['read', 'write', 'delete', 'admin']
        },
        {
          id: 'USER',
          name: 'Standard User',
          description: 'Regular user access',
          isDefault: true,
          permissions: ['read', 'write']
        }
      ],
      organizations: [
        {
          id: 'ORG-001',
          name: 'Default Organization',
          type: 'company',
          isActive: true
        }
      ],
      suppliers: [
        {
          id: 'SUP-001',
          name: 'Default Supplier',
          code: 'DS001',
          isActive: true
        }
      ],
      categories: [
        {
          id: 'CAT-001',
          name: 'General',
          isActive: true,
          displayOrder: 1
        }
      ]
    };
    
    return defaultData;
  }
  
  /**
   * Gets a product by ID
   * 
   * @param id - The product ID to find
   * @returns Product | undefined - The found product or undefined
   */
  getProductById(id: string): Product | undefined {
    return this.products().find(product => product.id === id);
  }
  
  /**
   * Gets products by category ID
   * 
   * @param categoryId - The category ID to filter by
   * @returns Product[] - Products in the specified category
   */
  getProductsByCategory(categoryId: string): Product[] {
    return this.products().filter(product => product.categoryId === categoryId);
  }
  
  /**
   * Gets a role by ID
   * 
   * @param id - The role ID to find
   * @returns Role | undefined - The found role or undefined
   */
  getRoleById(id: string): Role | undefined {
    return this.roles().find(role => role.id === id);
  }
  
  /**
   * Gets the default role
   * 
   * @returns Role | undefined - The default role or undefined
   */
  getDefaultRole(): Role | undefined {
    return this.roles().find(role => role.isDefault);
  }
  
  /**
   * Gets a supplier by ID
   * 
   * @param id - The supplier ID to find
   * @returns Supplier | undefined - The found supplier or undefined
   */
  getSupplierById(id: string): Supplier | undefined {
    return this.suppliers().find(supplier => supplier.id === id);
  }
  
  /**
   * Gets a category by ID
   * 
   * @param id - The category ID to find
   * @returns Category | undefined - The found category or undefined
   */
  getCategoryById(id: string): Category | undefined {
    return this.categories().find(category => category.id === id);
  }
  
  /**
   * Gets child categories for a parent category
   * 
   * @param parentId - The parent category ID
   * @returns Category[] - Child categories
   */
  getChildCategories(parentId: string): Category[] {
    return this.categories().filter(category => category.parentId === parentId);
  }
  
  /**
   * Gets a country by code
   * 
   * @param code - The country code to find
   * @returns Country | undefined - The found country or undefined
   */
  getCountryByCode(code: string): Country | undefined {
    return this.countries().find(country => country.code === code);
  }
  
  /**
   * Gets a currency by code
   * 
   * @param code - The currency code to find
   * @returns Currency | undefined - The found currency or undefined
   */
  getCurrencyByCode(code: string): Currency | undefined {
    return this.currencies().find(currency => currency.code === code);
  }
  
  /**
   * Gets statuses by category
   * 
   * @param category - The status category to filter by
   * @returns Status[] - Statuses in the specified category
   */
  getStatusesByCategory(category: string): Status[] {
    return this.statuses().filter(status => status.category === category);
  }
} 