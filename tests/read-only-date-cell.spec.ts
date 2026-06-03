import { test, expect } from '@playwright/test';

test.describe('ReadOnlyDateCell', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const cell = document.createElement('albert-read-only-date-cell');
      cell.id = 'test-cell';
      document.body.appendChild(cell);
    });
    await page.waitForTimeout(100);
  });

  test('should render date-only value in "Month D, YYYY" format', async ({ page }) => {
    await page.locator('#test-cell').evaluate((el: any) => {
      el.setAttribute('value', '2025-03-15');
    });

    const value = await page.locator('#test-cell').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.value')?.textContent;
    });

    expect(value).toBe('March 15, 2025');
  });

  test('should render timestamp value with time in "Month D, YYYY H:MM AM/PM" format', async ({ page }) => {
    await page.locator('#test-cell').evaluate((el: any) => {
      el.setAttribute('value', '2025-03-15T14:30:00');
    });

    const value = await page.locator('#test-cell').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.value')?.textContent;
    });

    expect(value).toBe('March 15, 2025 2:30 PM');
  });

  test('should display empty state when value is not set', async ({ page }) => {
    const value = await page.locator('#test-cell').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.value')?.textContent;
    });

    expect(value).toBe('—');
  });

  test('should display custom empty state text when provided', async ({ page }) => {
    await page.locator('#test-cell').evaluate((el: any) => {
      el.setAttribute('empty-state', 'No date');
    });

    const value = await page.locator('#test-cell').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.value')?.textContent;
    });

    expect(value).toBe('No date');
  });

  test('should update display when value attribute changes', async ({ page }) => {
    await page.locator('#test-cell').evaluate((el: any) => {
      el.setAttribute('value', '2025-01-01');
    });

    let value = await page.locator('#test-cell').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.value')?.textContent;
    });

    expect(value).toBe('January 1, 2025');

    await page.locator('#test-cell').evaluate((el: any) => {
      el.setAttribute('value', '2025-12-31T23:59:00');
    });

    value = await page.locator('#test-cell').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.value')?.textContent;
    });

    expect(value).toBe('December 31, 2025 11:59 PM');
  });

  test('should have data-empty attribute when value is empty', async ({ page }) => {
    const hasEmptyAttr = await page.locator('#test-cell').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.value')?.hasAttribute('data-empty');
    });

    expect(hasEmptyAttr).toBe(true);
  });

  test('should not have data-empty attribute when value is set', async ({ page }) => {
    await page.locator('#test-cell').evaluate((el: any) => {
      el.setAttribute('value', '2025-06-15');
    });

    const hasEmptyAttr = await page.locator('#test-cell').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.value')?.hasAttribute('data-empty');
    });

    expect(hasEmptyAttr).toBe(false);
  });

  test('should have role="status" on cell element', async ({ page }) => {
    const role = await page.locator('#test-cell').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.cell')?.getAttribute('role');
    });

    expect(role).toBe('status');
  });

  test('should handle 12:00 AM (midnight) correctly', async ({ page }) => {
    await page.locator('#test-cell').evaluate((el: any) => {
      el.setAttribute('value', '2025-03-15T00:00:00');
    });

    const value = await page.locator('#test-cell').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.value')?.textContent;
    });

    expect(value).toBe('March 15, 2025 12:00 AM');
  });

  test('should handle 12:00 PM (noon) correctly', async ({ page }) => {
    await page.locator('#test-cell').evaluate((el: any) => {
      el.setAttribute('value', '2025-03-15T12:00:00');
    });

    const value = await page.locator('#test-cell').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.value')?.textContent;
    });

    expect(value).toBe('March 15, 2025 12:00 PM');
  });
});
