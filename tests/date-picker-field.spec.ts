import { test, expect } from '@playwright/test';

test.describe('DatePickerField', () => {
  test('should format date value as "Month D, YYYY"', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const picker = document.querySelector('albert-date-picker');
      if (picker) picker.setAttribute('value', '2026-05-23');
    });

    const value = await page.locator('albert-date-picker').first().evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });

    expect(value).toBe('May 23, 2026');
  });

  test('should format January 1 correctly', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const picker = document.querySelector('albert-date-picker');
      if (picker) picker.setAttribute('value', '2026-01-01');
    });

    const value = await page.locator('albert-date-picker').first().evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });

    expect(value).toBe('January 1, 2026');
  });

  test('should show placeholder when no value', async ({ page }) => {
    await page.goto('/harness/index.html');
    const value = await page.locator('#date-picker-optional').evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });

    expect(value).toBe('Select a date');
  });

  test('should use custom placeholder', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const picker = document.createElement('albert-date-picker');
      picker.setAttribute('placeholder', 'Pick a date');
      picker.id = 'custom-placeholder';
      document.body.appendChild(picker);
    });

    const value = await page.locator('#custom-placeholder').evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });

    expect(value).toBe('Pick a date');
  });

  test('should show error when required and no value', async ({ page }) => {
    await page.goto('/harness/index.html');
    const errorVisible = await page
      .locator('#date-picker-required')
      .evaluate((el) => {
        const error = el.shadowRoot?.querySelector('[part="error"]');
        return error?.hasAttribute('data-visible');
      });

    expect(errorVisible).toBe(true);
  });

  test('should hide error when value is set', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const picker = document.querySelector('#date-picker-required');
      if (picker) picker.setAttribute('value', '2026-05-23');
    });

    const errorVisible = await page
      .locator('#date-picker-required')
      .evaluate((el) => {
        const error = el.shadowRoot?.querySelector('[part="error"]');
        return error?.hasAttribute('data-visible');
      });

    expect(errorVisible).toBe(false);
  });

  test('should not emit _albert-open when is-editable="false"', async ({
    page,
  }) => {
    await page.goto('/harness/index.html');
    const eventFired = await page.evaluate(async () => {
      const picker = document.querySelector('#date-picker-disabled');
      let fired = false;

      picker?.addEventListener('_albert-open', () => {
        fired = true;
      });

      const field = picker?.shadowRoot?.querySelector('[part="field"]');
      (field as HTMLElement)?.click();

      return fired;
    });

    expect(eventFired).toBe(false);
  });

  test('should have pointer-events: none when disabled', async ({ page }) => {
    await page.goto('/harness/index.html');
    const pointerEvents = await page
      .locator('#date-picker-disabled')
      .evaluate((el) => {
        const field = el.shadowRoot?.querySelector('[part="field"]');
        return window.getComputedStyle(field!).pointerEvents;
      });

    expect(pointerEvents).toBe('none');
  });

  test('should emit _albert-open on click when editable', async ({ page }) => {
    await page.goto('/harness/index.html');
    const eventFired = await page.evaluate(async () => {
      const picker = document.querySelector('#date-picker-optional');
      let fired = false;

      picker?.addEventListener('_albert-open', () => {
        fired = true;
      });

      const field = picker?.shadowRoot?.querySelector('[part="field"]');
      (field as HTMLElement)?.click();

      return fired;
    });

    expect(eventFired).toBe(true);
  });

  test('should have aria-hidden on icon', async ({ page }) => {
    await page.goto('/harness/index.html');
    const ariaHidden = await page
      .locator('albert-date-picker')
      .first()
      .evaluate((el) => {
        const icon = el.shadowRoot?.querySelector('[part="icon"]');
        return icon?.getAttribute('aria-hidden');
      });

    expect(ariaHidden).toBe('true');
  });

  test('should update display when value attribute changes', async ({
    page,
  }) => {
    await page.goto('/harness/index.html');

    // Check initial
    let value = await page.locator('#date-picker-with-value').evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });
    expect(value).toBe('June 15, 2026');

    // Change value
    await page.evaluate(() => {
      const picker = document.querySelector('#date-picker-with-value');
      if (picker) picker.setAttribute('value', '2026-12-25');
    });

    value = await page.locator('#date-picker-with-value').evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });
    expect(value).toBe('December 25, 2026');
  });

  test('should clear display when value is removed', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const picker = document.querySelector('#date-picker-with-value');
      if (picker) picker.removeAttribute('value');
    });

    const value = await page.locator('#date-picker-with-value').evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });

    expect(value).toBe('Select a date');
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/harness/index.html');
    const eventFired = await page.evaluate(async () => {
      const picker = document.querySelector('#date-picker-optional');
      let fired = false;

      picker?.addEventListener('_albert-open', () => {
        fired = true;
      });

      const field = picker?.shadowRoot?.querySelector('[part="field"]');
      (field as HTMLElement)?.focus();

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      field?.dispatchEvent(event);

      return fired;
    });

    expect(eventFired).toBe(true);
  });
});
