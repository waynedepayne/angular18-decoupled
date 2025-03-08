import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ProductCatalogComponent } from './product-catalog.component';
import { DataService } from '../../core/services/data.service';
import { signal } from '@angular/core';
import { Product, Category } from '../../core/models/data.model';

describe('ProductCatalogComponent', () => {
  let component: ProductCatalogComponent;
  let fixture: ComponentFixture<ProductCatalogComponent>;
  let mockDataService: jasmine.SpyObj<DataService>;

  const mockProducts: Product[] = [
    {
      id: 'PROD-001',
      name: 'Test Product 1',
      description: 'Description 1',
      sku: 'SKU-001',
      price: 19.99,
      currency: 'USD',
      categoryId: 'CAT-001',
      isActive: true,
      attributes: {
        color: 'Red',
        size: 'Medium'
      }
    },
    {
      id: 'PROD-002',
      name: 'Test Product 2',
      description: 'Description 2',
      sku: 'SKU-002',
      price: 29.99,
      currency: 'EUR',
      categoryId: 'CAT-002',
      isActive: false
    }
  ];

  const mockCategories: Category[] = [
    {
      id: 'CAT-001',
      name: 'Category 1',
      isActive: true,
      displayOrder: 1
    },
    {
      id: 'CAT-002',
      name: 'Category 2',
      isActive: true,
      displayOrder: 2
    }
  ];

  beforeEach(async () => {
    mockDataService = jasmine.createSpyObj('DataService', [
      'getProductsByCategory',
      'getCategoryById',
      'getCurrencyByCode'
    ]);

    // Mock the signal properties
    Object.defineProperty(mockDataService, 'products', {
      value: signal(mockProducts)
    });

    Object.defineProperty(mockDataService, 'categories', {
      value: signal(mockCategories)
    });

    // Mock the method implementations
    mockDataService.getProductsByCategory.and.callFake((categoryId: string) => {
      return mockProducts.filter(p => p.categoryId === categoryId);
    });

    mockDataService.getCategoryById.and.callFake((id: string) => {
      return mockCategories.find(c => c.id === id);
    });

    mockDataService.getCurrencyByCode.and.callFake((code: string) => {
      if (code === 'USD') return { code: 'USD', name: 'US Dollar', symbol: '$' };
      if (code === 'EUR') return { code: 'EUR', name: 'Euro', symbol: '€' };
      return undefined;
    });

    await TestBed.configureTestingModule({
      imports: [ProductCatalogComponent],
      providers: [
        { provide: DataService, useValue: mockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all products initially', () => {
    const productElements = fixture.debugElement.queryAll(By.css('.grid > div'));
    expect(productElements.length).toBe(2);
    expect(productElements[0].nativeElement.textContent).toContain('Test Product 1');
    expect(productElements[1].nativeElement.textContent).toContain('Test Product 2');
  });

  it('should filter products when a category is selected', () => {
    // Click on the first category button
    const categoryButtons = fixture.debugElement.queryAll(By.css('.flex button'));
    categoryButtons[0].triggerEventHandler('click', null);
    fixture.detectChanges();

    // Verify that only products from the selected category are shown
    const productElements = fixture.debugElement.queryAll(By.css('.grid > div'));
    expect(productElements.length).toBe(1);
    expect(productElements[0].nativeElement.textContent).toContain('Test Product 1');
    expect(mockDataService.getProductsByCategory).toHaveBeenCalledWith('CAT-001');
  });

  it('should clear filter when clear button is clicked', () => {
    // First select a category
    component.filterByCategory('CAT-001');
    fixture.detectChanges();
    
    // Then clear the filter
    const clearButton = fixture.debugElement.query(By.css('.flex button:last-child'));
    clearButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Verify that all products are shown again
    const productElements = fixture.debugElement.queryAll(By.css('.grid > div'));
    expect(productElements.length).toBe(2);
  });

  it('should display product attributes when available', () => {
    const productWithAttributes = fixture.debugElement.queryAll(By.css('.grid > div'))[0];
    expect(productWithAttributes.nativeElement.textContent).toContain('Color');
    expect(productWithAttributes.nativeElement.textContent).toContain('Red');
    expect(productWithAttributes.nativeElement.textContent).toContain('Size');
    expect(productWithAttributes.nativeElement.textContent).toContain('Medium');
  });

  it('should display correct currency symbols', () => {
    const productElements = fixture.debugElement.queryAll(By.css('.grid > div'));
    expect(productElements[0].nativeElement.textContent).toContain('$19.99');
    expect(productElements[1].nativeElement.textContent).toContain('€29.99');
  });

  it('should display active/inactive status correctly', () => {
    const productElements = fixture.debugElement.queryAll(By.css('.grid > div'));
    expect(productElements[0].nativeElement.textContent).toContain('Active');
    expect(productElements[1].nativeElement.textContent).toContain('Inactive');
  });

  it('should format attribute names correctly', () => {
    expect(component.formatAttributeName('color')).toBe('Color');
    expect(component.formatAttributeName('productSize')).toBe('Product Size');
    expect(component.formatAttributeName('CPUModel')).toBe('CPU Model');
  });
}); 