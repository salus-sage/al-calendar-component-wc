import { test, expect } from '@playwright/test';

test('should load harness without critical errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('customElements')) {
      errors.push(msg.text());
    }
  });

  await page.goto('/harness/index.html');
  // Allow "undefined" errors for components not yet implemented
  const criticalErrors = errors.filter(
    (e) => !e.includes('Failed to define')
  );
  expect(criticalErrors).toHaveLength(0);
});

test('should have both picker elements in DOM (not yet defined)', async ({
  page,
}) => {
  await page.goto('/harness/index.html');
  const datePickerCount = await page.locator('albert-date-picker').count();
  const dateTimePickerCount = await page
    .locator('albert-datetime-picker')
    .count();

  expect(datePickerCount).toBeGreaterThan(0);
  expect(dateTimePickerCount).toBeGreaterThan(0);
});

test('should have build artifacts', async ({ page }) => {
  const response = await page.request.get('/dist/albert-date-picker.js');
  expect(response.ok()).toBe(true);
  expect(response.status()).toBe(200);

  const text = await response.text();
  expect(text.length).toBeGreaterThan(0);
});
