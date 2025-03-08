import { test, expect } from '@playwright/test';

test.describe('Microfrontend Demo', () => {
  test('should display microfrontend configuration', async ({ page }) => {
    // Navigate to the microfrontend demo page
    await page.goto('/microfrontend-demo');
    
    // Check that the page title is displayed
    await expect(page.locator('h2')).toHaveText('Micro-Frontend Configuration');
    
    // Check that the version is displayed
    await expect(page.locator('.config-info p:first-child')).toContainText('Version:');
    
    // Check that the last updated date is displayed
    await expect(page.locator('.config-info p:nth-child(2)')).toContainText('Last Updated:');
    
    // Check that the remote modules section is displayed
    await expect(page.locator('h3:first-of-type')).toHaveText('Remote Modules');
    
    // Check that at least one remote module is displayed
    await expect(page.locator('.remote-card')).toHaveCount({ min: 1 });
    
    // Check that the routes section is displayed
    await expect(page.locator('h3:nth-of-type(2)')).toHaveText('Routes');
    
    // Check that at least one route is displayed
    await expect(page.locator('.route-card')).toHaveCount({ min: 1 });
  });
  
  test('should display disabled message when microfrontends are disabled', async ({ page, request }) => {
    // Intercept the request to microfrontend.json and return a modified version with enabled=false
    await page.route('**/assets/microfrontend.json', async (route) => {
      const json = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        enabled: false,
        settings: {
          defaultTimeout: 10000,
          preloadAll: false,
          retryOnError: true,
          maxRetries: 3,
          showLoading: true,
          showErrors: true
        },
        remotes: {},
        routes: [],
        shared: {
          singleton: true,
          strictVersion: false,
          libs: []
        }
      };
      await route.fulfill({ json });
    });
    
    // Navigate to the microfrontend demo page
    await page.goto('/microfrontend-demo');
    
    // Check that the disabled message is displayed
    await expect(page.locator('.disabled-message')).toBeVisible();
    await expect(page.locator('.disabled-message p:first-child')).toHaveText('Micro-Frontends are currently disabled in the configuration.');
  });
  
  test('should display remote modules correctly', async ({ page }) => {
    // Navigate to the microfrontend demo page
    await page.goto('/microfrontend-demo');
    
    // Get the first remote module card
    const firstRemoteCard = page.locator('.remote-card').first();
    
    // Check that it has a name
    await expect(firstRemoteCard.locator('h4')).toBeVisible();
    
    // Check that it has a URL
    await expect(firstRemoteCard.locator('p:has-text("URL:")')).toBeVisible();
    
    // Check that it has a status
    await expect(firstRemoteCard.locator('p:has-text("Status:")')).toBeVisible();
    
    // Check that it has exposed modules
    await expect(firstRemoteCard.locator('h5')).toHaveText('Exposed Modules');
    await expect(firstRemoteCard.locator('ul li')).toHaveCount({ min: 1 });
  });
}); 