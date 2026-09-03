import { test, expect } from '@playwright/test';

test.describe('formatDate locale and invalid year handling', () => {
  test('should format valid ISO date in German locale when ljs-lang is de', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      localStorage.setItem('ljs-lang', 'de');
      const picker = document.querySelector('albert-date-picker');
      if (picker) picker.setAttribute('value', '2026-09-20');
    });

    const value = await page.locator('albert-date-picker').first().evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });

    expect(value).toBe('20. September 2026');
  });

  test('should show placeholder for corrupted leading-zero year (0326-09-20)', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      localStorage.setItem('ljs-lang', 'de');
      const picker = document.querySelector('#date-picker-optional');
      if (picker) picker.setAttribute('value', '0326-09-20');
    });

    const value = await page.locator('#date-picker-optional').evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });

    expect(value).toBe('Select a date');
  });

  test('should format valid ISO date in English locale when ljs-lang is en', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      localStorage.setItem('ljs-lang', 'en');
      const picker = document.querySelector('albert-date-picker');
      if (picker) picker.setAttribute('value', '2026-09-20');
    });

    const value = await page.locator('albert-date-picker').first().evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });

    expect(value).toBe('September 20, 2026');
  });
});
