import { test, expect } from '@playwright/test';

test.describe('Analytics Demo', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the analytics demo page
    await page.goto('/analytics-demo');
  });

  test('should display analytics configuration', async ({ page }) => {
    // Wait for the analytics configuration to load
    await page.waitForSelector('.card:has-text("Analytics Configuration")');

    // Check that the configuration is displayed
    const configSection = await page.locator('.card:has-text("Analytics Configuration")');
    await expect(configSection).toBeVisible();

    // Check for providers
    const providers = await page.locator('.list-group-item');
    const count = await providers.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should track button click event', async ({ page }) => {
    // Fill in the button click form
    await page.fill('#buttonId', 'test-button-id');
    await page.fill('#buttonText', 'Test Button Text');

    // Click the track button
    await page.click('button:has-text("Track Button Click")');

    // Check that the event is logged
    const eventLog = await page.locator('.event-log-item:first-child');
    await expect(eventLog).toBeVisible();
    await expect(eventLog.locator('.event-log-type')).toHaveText('buttonClick');
    await expect(eventLog.locator('.event-log-data')).toContainText('test-button-id');
    await expect(eventLog.locator('.event-log-data')).toContainText('Test Button Text');
  });

  test('should track form submit event', async ({ page }) => {
    // Fill in the form submit form
    await page.fill('#formId', 'test-form-id');
    await page.fill('#formName', 'Test Form Name');

    // Click the track button
    await page.click('button:has-text("Track Form Submit")');

    // Check that the event is logged
    const eventLog = await page.locator('.event-log-item:first-child');
    await expect(eventLog).toBeVisible();
    await expect(eventLog.locator('.event-log-type')).toHaveText('formSubmit');
    await expect(eventLog.locator('.event-log-data')).toContainText('test-form-id');
    await expect(eventLog.locator('.event-log-data')).toContainText('Test Form Name');
  });

  test('should track error event', async ({ page }) => {
    // Fill in the error form
    await page.fill('#errorMessage', 'Test Error Message');
    await page.fill('#errorType', 'Test Error Type');

    // Click the track button
    await page.click('button:has-text("Track Error")');

    // Check that the event is logged
    const eventLog = await page.locator('.event-log-item:first-child');
    await expect(eventLog).toBeVisible();
    await expect(eventLog.locator('.event-log-type')).toHaveText('error');
    await expect(eventLog.locator('.event-log-data')).toContainText('Test Error Message');
    await expect(eventLog.locator('.event-log-data')).toContainText('Test Error Type');
  });

  test('should track performance event', async ({ page }) => {
    // Fill in the performance form
    await page.fill('#metricName', 'test-metric');
    await page.fill('#metricValue', '1234');

    // Click the track button
    await page.click('button:has-text("Track Performance")');

    // Check that the event is logged
    const eventLog = await page.locator('.event-log-item:first-child');
    await expect(eventLog).toBeVisible();
    await expect(eventLog.locator('.event-log-type')).toHaveText('performance');
    await expect(eventLog.locator('.event-log-data')).toContainText('test-metric');
    await expect(eventLog.locator('.event-log-data')).toContainText('1234');
  });

  test('should track custom event', async ({ page }) => {
    // Fill in the custom event form
    await page.fill('#customEventName', 'test-custom-event');
    await page.fill('#customEventProperties', '{"prop1": "value1", "prop2": 123}');

    // Click the track button
    await page.click('button:has-text("Track Custom Event")');

    // Check that the event is logged
    const eventLog = await page.locator('.event-log-item:first-child');
    await expect(eventLog).toBeVisible();
    await expect(eventLog.locator('.event-log-type')).toHaveText('customEvent');
    await expect(eventLog.locator('.event-log-data')).toContainText('test-custom-event');
    await expect(eventLog.locator('.event-log-data')).toContainText('value1');
    await expect(eventLog.locator('.event-log-data')).toContainText('123');
  });

  test('should identify user', async ({ page }) => {
    // Fill in the identify user form
    await page.fill('#userId', 'test-user-id');
    await page.fill('#userTraits', '{"userRole": "admin", "userPreferences": {"theme": "dark"}}');

    // Click the identify button
    await page.click('button:has-text("Identify User")');

    // Check that the event is logged
    const eventLog = await page.locator('.event-log-item:first-child');
    await expect(eventLog).toBeVisible();
    await expect(eventLog.locator('.event-log-type')).toHaveText('identifyUser');
    await expect(eventLog.locator('.event-log-data')).toContainText('test-user-id');
    await expect(eventLog.locator('.event-log-data')).toContainText('admin');
    await expect(eventLog.locator('.event-log-data')).toContainText('dark');
  });

  test('should clear event log', async ({ page }) => {
    // Track an event to ensure there's something in the log
    await page.fill('#buttonId', 'test-button-id');
    await page.fill('#buttonText', 'Test Button Text');
    await page.click('button:has-text("Track Button Click")');

    // Verify the event is logged
    const eventLogItems = await page.locator('.event-log-item');
    const count = await eventLogItems.count();
    expect(count).toBeGreaterThan(0);

    // Clear the log
    await page.click('button:has-text("Clear Log")');

    // Verify the log is cleared
    await expect(page.locator('.event-log-item')).toHaveCount(0);
    await expect(page.locator('.event-log .text-muted')).toBeVisible();
  });
}); 