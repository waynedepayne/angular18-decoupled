import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from '../data.service';
import { DataModel } from '../../models/data.model';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load data from assets/data.json', () => {
    const mockData: DataModel = {
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      referenceData: {
        countries: [
          { code: 'US', name: 'United States' }
        ],
        currencies: [
          { code: 'USD', name: 'US Dollar', symbol: '$' }
        ],
        statuses: [
          { code: 'ACTIVE', name: 'Active', category: 'general' }
        ],
        paymentMethods: [
          { id: 'CREDIT', name: 'Credit Card', isActive: true }
        ],
        units: [
          { code: 'EA', name: 'Each', category: 'quantity' }
        ]
      },
      products: [
        {
          id: 'PROD-001',
          name: 'Test Product',
          description: 'A test product',
          sku: 'TEST-001',
          price: 19.99,
          currency: 'USD',
          categoryId: 'CAT-001',
          isActive: true
        }
      ],
      roles: [
        {
          id: 'USER',
          name: 'User',
          description: 'Standard user',
          isDefault: true,
          permissions: ['read']
        }
      ],
      organizations: [
        {
          id: 'ORG-001',
          name: 'Test Org',
          type: 'company',
          isActive: true
        }
      ],
      suppliers: [
        {
          id: 'SUP-001',
          name: 'Test Supplier',
          code: 'TS001',
          isActive: true
        }
      ],
      categories: [
        {
          id: 'CAT-001',
          name: 'Test Category',
          isActive: true,
          displayOrder: 1
        }
      ]
    };

    service.loadData().subscribe(data => {
      expect(data).toEqual(mockData);
      expect(service.products().length).toBe(1);
      expect(service.categories().length).toBe(1);
    });

    const req = httpMock.expectOne('assets/data.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should return default data when HTTP request fails', () => {
    service.loadData().subscribe(data => {
      expect(data).toBeTruthy();
      expect(service.products().length).toBeGreaterThan(0);
      expect(service.roles().length).toBeGreaterThan(0);
    });

    const req = httpMock.expectOne('assets/data.json');
    req.error(new ErrorEvent('Network error'));
  });

  it('should get product by ID', () => {
    // Manually set data for testing
    service['dataSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      referenceData: {
        countries: [],
        currencies: [],
        statuses: [],
        paymentMethods: [],
        units: []
      },
      products: [
        {
          id: 'PROD-001',
          name: 'Test Product',
          description: 'A test product',
          sku: 'TEST-001',
          price: 19.99,
          currency: 'USD',
          categoryId: 'CAT-001',
          isActive: true
        }
      ],
      roles: [],
      organizations: [],
      suppliers: [],
      categories: []
    });

    const product = service.getProductById('PROD-001');
    expect(product).toBeTruthy();
    expect(product?.name).toBe('Test Product');

    const nonExistentProduct = service.getProductById('NONEXISTENT');
    expect(nonExistentProduct).toBeUndefined();
  });

  it('should get products by category', () => {
    // Manually set data for testing
    service['dataSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      referenceData: {
        countries: [],
        currencies: [],
        statuses: [],
        paymentMethods: [],
        units: []
      },
      products: [
        {
          id: 'PROD-001',
          name: 'Product 1',
          description: 'Description 1',
          sku: 'SKU-001',
          price: 19.99,
          currency: 'USD',
          categoryId: 'CAT-001',
          isActive: true
        },
        {
          id: 'PROD-002',
          name: 'Product 2',
          description: 'Description 2',
          sku: 'SKU-002',
          price: 29.99,
          currency: 'USD',
          categoryId: 'CAT-001',
          isActive: true
        },
        {
          id: 'PROD-003',
          name: 'Product 3',
          description: 'Description 3',
          sku: 'SKU-003',
          price: 39.99,
          currency: 'USD',
          categoryId: 'CAT-002',
          isActive: true
        }
      ],
      roles: [],
      organizations: [],
      suppliers: [],
      categories: []
    });

    const cat1Products = service.getProductsByCategory('CAT-001');
    expect(cat1Products.length).toBe(2);
    expect(cat1Products[0].name).toBe('Product 1');
    expect(cat1Products[1].name).toBe('Product 2');

    const cat2Products = service.getProductsByCategory('CAT-002');
    expect(cat2Products.length).toBe(1);
    expect(cat2Products[0].name).toBe('Product 3');

    const nonExistentCatProducts = service.getProductsByCategory('NONEXISTENT');
    expect(nonExistentCatProducts.length).toBe(0);
  });

  it('should get country by code', () => {
    // Manually set data for testing
    service['dataSignal'].set({
      version: '1.0.0',
      lastUpdated: '2023-07-15T12:00:00Z',
      referenceData: {
        countries: [
          { code: 'US', name: 'United States' },
          { code: 'CA', name: 'Canada' }
        ],
        currencies: [],
        statuses: [],
        paymentMethods: [],
        units: []
      },
      products: [],
      roles: [],
      organizations: [],
      suppliers: [],
      categories: []
    });

    const country = service.getCountryByCode('US');
    expect(country).toBeTruthy();
    expect(country?.name).toBe('United States');

    const nonExistentCountry = service.getCountryByCode('NONEXISTENT');
    expect(nonExistentCountry).toBeUndefined();
  });
}); 