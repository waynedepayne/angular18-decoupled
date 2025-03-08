/**
 * Interfaces for the data.json file which contains domain data and reference lists
 * used throughout the application.
 */

/**
 * Main interface for the data.json file
 */
export interface DataModel {
  /**
   * Version of the data for tracking changes
   */
  version: string;
  
  /**
   * Last updated timestamp
   */
  lastUpdated: string;
  
  /**
   * Reference data for various entities
   */
  referenceData: ReferenceData;
  
  /**
   * Product catalog information
   */
  products: Product[];
  
  /**
   * User roles and permissions
   */
  roles: Role[];
  
  /**
   * Organization information
   */
  organizations: Organization[];
  
  /**
   * Supplier information
   */
  suppliers: Supplier[];
  
  /**
   * Categories for products and services
   */
  categories: Category[];
}

/**
 * Reference data for various entities
 */
export interface ReferenceData {
  /**
   * Country codes and names
   */
  countries: Country[];
  
  /**
   * Currency codes and symbols
   */
  currencies: Currency[];
  
  /**
   * Status codes and descriptions
   */
  statuses: Status[];
  
  /**
   * Payment methods
   */
  paymentMethods: PaymentMethod[];
  
  /**
   * Units of measurement
   */
  units: Unit[];
}

/**
 * Country information
 */
export interface Country {
  code: string;
  name: string;
  phoneCode?: string;
}

/**
 * Currency information
 */
export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

/**
 * Status information
 */
export interface Status {
  code: string;
  name: string;
  description?: string;
  category: string;
}

/**
 * Payment method information
 */
export interface PaymentMethod {
  id: string;
  name: string;
  isActive: boolean;
  processingFee?: number;
}

/**
 * Unit of measurement
 */
export interface Unit {
  code: string;
  name: string;
  category: string;
}

/**
 * Product information
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  currency: string;
  categoryId: string;
  isActive: boolean;
  attributes?: Record<string, any>;
  imageUrl?: string;
  inventoryLevel?: number;
}

/**
 * Role information
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  permissions: string[];
}

/**
 * Organization information
 */
export interface Organization {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  contactEmail?: string;
  contactPhone?: string;
  address?: Address;
}

/**
 * Address information
 */
export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

/**
 * Supplier information
 */
export interface Supplier {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  paymentTerms?: string;
  address?: Address;
}

/**
 * Category information
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  displayOrder?: number;
} 