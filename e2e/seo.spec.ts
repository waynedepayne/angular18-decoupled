import { test, expect } from '@playwright/test';

test.describe('SEO Functionality', () => {
  test('should load SEO configuration and update meta tags', async ({ page }) => {
    // Navigate to the SEO demo page
    await page.goto('/seo-demo');
    
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("SEO Configuration Demo")');
    
    // Check that the page title includes the site name
    const title = await page.title();
    expect(title).toContain('Angular Enterprise App');
    
    // Check that the meta description is set
    const metaDescription = await page.getAttribute('meta[name="description"]', 'content');
    expect(metaDescription).toBeTruthy();
    
    // Test dynamic title update
    await page.fill('#dynamicTitle', 'Custom E2E Test Title');
    await page.fill('#dynamicDescription', 'This is a custom description set during E2E testing');
    await page.click('button:has-text("Apply Dynamic SEO")');
    
    // Wait for the title to update
    await page.waitForTimeout(500); // Small delay to ensure updates are applied
    
    // Check that the title has been updated
    const updatedTitle = await page.title();
    expect(updatedTitle).toContain('Custom E2E Test Title');
    
    // Check that the meta description has been updated
    const updatedMetaDescription = await page.getAttribute('meta[name="description"]', 'content');
    expect(updatedMetaDescription).toBe('This is a custom description set during E2E testing');
  });
  
  test('should apply route-specific SEO settings', async ({ page }) => {
    // Navigate to the SEO demo page
    await page.goto('/seo-demo');
    
    // Wait for the page to load
    await page.waitForSelector('.route-list');
    
    // Find and click the button to apply the Home route's SEO settings
    await page.click('.route-item:has-text("/") button');
    
    // Wait for the title to update
    await page.waitForTimeout(500);
    
    // Check that the title has been updated to the Home page title
    const homeTitle = await page.title();
    expect(homeTitle).toContain('Home');
    
    // Check that the meta description has been updated to the Home page description
    const homeMetaDescription = await page.getAttribute('meta[name="description"]', 'content');
    expect(homeMetaDescription).toContain('Welcome to our Angular 18 Enterprise Application');
    
    // Check for Open Graph tags
    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
    expect(ogTitle).toContain('Angular Enterprise App - Home');
  });
  
  test('should display current metadata correctly', async ({ page }) => {
    // Navigate to the SEO demo page
    await page.goto('/seo-demo');
    
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("SEO Configuration Demo")');
    
    // Click the refresh metadata button
    await page.click('button:has-text("Refresh Metadata")');
    
    // Check that the current title is displayed
    const displayedTitle = await page.textContent('p:has-text("Title:") >> nth=1');
    expect(displayedTitle).toContain('SEO Demo');
    
    // Check that the current description is displayed
    const displayedDescription = await page.textContent('p:has-text("Description:") >> nth=1');
    expect(displayedDescription).toBeTruthy();
  });
}); 