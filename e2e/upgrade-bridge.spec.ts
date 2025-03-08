import { test, expect } from '@playwright/test';

test.describe('Upgrade Bridge Demo', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the upgrade bridge demo page
    await page.goto('/upgrade-demo');
  });

  test('should display upgrade bridge configuration', async ({ page }) => {
    // Wait for the upgrade bridge configuration to load
    await page.waitForSelector('.card:has-text("Upgrade Bridge Configuration")');

    // Check that the configuration is displayed
    const configSection = await page.locator('.card:has-text("Upgrade Bridge Configuration")');
    await expect(configSection).toBeVisible();

    // Check for status
    const status = await page.locator('.card-body .mb-3:has-text("Status:")');
    await expect(status).toBeVisible();

    // Check for AngularJS modules
    const modules = await page.locator('.card-body .mb-3:has-text("AngularJS Modules:")');
    await expect(modules).toBeVisible();
    
    // Check for bootstrap element
    const bootstrapElement = await page.locator('.card-body .mb-3:has-text("Bootstrap Element:")');
    await expect(bootstrapElement).toBeVisible();
  });

  test('should display downgraded components', async ({ page }) => {
    // Check that the downgraded components section is displayed
    const downgradedSection = await page.locator('.card:has-text("Downgraded Components")');
    await expect(downgradedSection).toBeVisible();

    // Check for table or no components message
    const hasComponents = await page.locator('.table-responsive').isVisible();
    if (hasComponents) {
      // Check that the table has headers
      const headers = await page.locator('.card:has-text("Downgraded Components") th');
      await expect(headers).toHaveCount(3);
      
      // Check that the table has at least one row
      const rows = await page.locator('.card:has-text("Downgraded Components") tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(1);
    } else {
      // Check for no components message
      const noComponentsMessage = await page.locator('.card:has-text("Downgraded Components") .text-muted');
      await expect(noComponentsMessage).toBeVisible();
      await expect(noComponentsMessage).toHaveText('No downgraded components configured.');
    }
  });

  test('should display upgraded components', async ({ page }) => {
    // Check that the upgraded components section is displayed
    const upgradedSection = await page.locator('.card:has-text("Upgraded Components")');
    await expect(upgradedSection).toBeVisible();

    // Check for table or no components message
    const hasComponents = await page.locator('.card:has-text("Upgraded Components") .table-responsive').isVisible();
    if (hasComponents) {
      // Check that the table has headers
      const headers = await page.locator('.card:has-text("Upgraded Components") th');
      await expect(headers).toHaveCount(3);
      
      // Check that the table has at least one row
      const rows = await page.locator('.card:has-text("Upgraded Components") tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(1);
    } else {
      // Check for no components message
      const noComponentsMessage = await page.locator('.card:has-text("Upgraded Components") .text-muted');
      await expect(noComponentsMessage).toBeVisible();
      await expect(noComponentsMessage).toHaveText('No upgraded components configured.');
    }
  });

  test('should display migration progress', async ({ page }) => {
    // Check if migration progress section exists
    const migrationProgressExists = await page.locator('.card:has-text("Migration Progress")').isVisible();
    
    if (migrationProgressExists) {
      // Check that the progress bar is displayed
      const progressBar = await page.locator('.progress-bar');
      await expect(progressBar).toBeVisible();
      
      // Check that the progress cards are displayed
      const progressCards = await page.locator('.card:has-text("Migration Progress") .card');
      await expect(progressCards).toHaveCount(3);
      
      // Check that the total components card is displayed
      const totalCard = await page.locator('.card:has-text("Total Components")');
      await expect(totalCard).toBeVisible();
      
      // Check that the migrated components card is displayed
      const migratedCard = await page.locator('.card:has-text("Migrated")');
      await expect(migratedCard).toBeVisible();
      
      // Check that the remaining components card is displayed
      const remainingCard = await page.locator('.card:has-text("Remaining")');
      await expect(remainingCard).toBeVisible();
    }
  });

  test('should display legacy component example', async ({ page }) => {
    // Check that the legacy component example is displayed
    const legacyComponentSection = await page.locator('.card:has-text("Legacy Component Example")');
    await expect(legacyComponentSection).toBeVisible();
    
    // Check that the legacy component is displayed
    const legacyComponent = await page.locator('.legacy-component-example .card');
    await expect(legacyComponent).toBeVisible();
    
    // Check that the legacy component has a header
    const legacyComponentHeader = await page.locator('.legacy-component-example .card-header');
    await expect(legacyComponentHeader).toBeVisible();
    await expect(legacyComponentHeader).toContainText('Legacy User Profile');
    
    // Check that the legacy component has content
    const legacyComponentBody = await page.locator('.legacy-component-example .card-body');
    await expect(legacyComponentBody).toBeVisible();
    await expect(legacyComponentBody).toContainText('John Doe');
  });

  test('should display deprecation notices if enabled', async ({ page }) => {
    // Check if deprecation notices section exists
    const deprecationNoticesExists = await page.locator('.card:has-text("Deprecation Notices")').isVisible();
    
    if (deprecationNoticesExists) {
      // Check that the deprecation message is displayed
      const deprecationMessage = await page.locator('.alert');
      await expect(deprecationMessage).toBeVisible();
      
      // Check that the example usage is displayed
      const exampleUsage = await page.locator('.card:has-text("Example Usage")');
      await expect(exampleUsage).toBeVisible();
      
      // Check that the code example is displayed
      const codeExample = await page.locator('pre code');
      await expect(codeExample).toBeVisible();
    }
  });
}); 