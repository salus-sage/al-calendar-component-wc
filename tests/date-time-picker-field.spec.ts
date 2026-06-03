import { test, expect } from '@playwright/test';

test.describe('DateTimePickerField', () => {
  test('should format datetime value as "Month D, YYYY H:MM AM/PM"', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const picker = document.querySelector('albert-datetime-picker');
      if (picker) picker.setAttribute('value', '2026-05-23T15:30:00');
    });

    const value = await page.locator('albert-datetime-picker').first().evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });

    expect(value).toBe('May 23, 2026 3:30 PM');
  });

  test('should format midnight correctly', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const picker = document.querySelector('albert-datetime-picker');
      if (picker) picker.setAttribute('value', '2026-01-01T00:00:00');
    });

    const value = await page.locator('albert-datetime-picker').first().evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });

    expect(value).toBe('January 1, 2026 12:00 AM');
  });

  test('should format noon correctly', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const picker = document.querySelector('albert-datetime-picker');
      if (picker) picker.setAttribute('value', '2026-06-15T12:00:00');
    });

    const value = await page.locator('albert-datetime-picker').first().evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });

    expect(value).toBe('June 15, 2026 12:00 PM');
  });

  test('should show placeholder when no value', async ({ page }) => {
    await page.goto('/harness/index.html');
    const value = await page.locator('#datetime-picker').evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });

    expect(value).toBe('Select a date and time');
  });

  test('should use custom placeholder', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const picker = document.createElement('albert-datetime-picker');
      picker.setAttribute('placeholder', 'Pick a date and time');
      picker.id = 'custom-datetime-placeholder';
      document.body.appendChild(picker);
    });

    const value = await page.locator('#custom-datetime-placeholder').evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });

    expect(value).toBe('Pick a date and time');
  });

  test('should show error when required and no value', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const picker = document.createElement('albert-datetime-picker');
      picker.setAttribute('required', '');
      picker.id = 'datetime-picker-required';
      document.body.appendChild(picker);
    });

    const errorVisible = await page
      .locator('#datetime-picker-required')
      .evaluate((el) => {
        const error = el.shadowRoot?.querySelector('[part="error"]');
        return error?.hasAttribute('data-visible');
      });

    expect(errorVisible).toBe(true);
  });

  test('should hide error when value is set', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const picker = document.createElement('albert-datetime-picker');
      picker.setAttribute('required', '');
      picker.id = 'datetime-picker-required-2';
      document.body.appendChild(picker);
    });

    await page.evaluate(() => {
      const picker = document.querySelector('#datetime-picker-required-2');
      if (picker) picker.setAttribute('value', '2026-05-23T15:30:00');
    });

    const errorVisible = await page
      .locator('#datetime-picker-required-2')
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
      const picker = document.createElement('albert-datetime-picker');
      picker.setAttribute('value', '2026-05-23T15:30:00');
      picker.setAttribute('is-editable', 'false');
      picker.id = 'datetime-picker-disabled';
      document.body.appendChild(picker);

      let fired = false;

      picker.addEventListener('_albert-open', () => {
        fired = true;
      });

      const field = picker.shadowRoot?.querySelector('[part="field"]');
      (field as HTMLElement)?.click();

      return fired;
    });

    expect(eventFired).toBe(false);
  });

  test('should have pointer-events: none when disabled', async ({ page }) => {
    await page.goto('/harness/index.html');
    const pointerEvents = await page.evaluate(() => {
      const picker = document.createElement('albert-datetime-picker');
      picker.setAttribute('value', '2026-05-23T15:30:00');
      picker.setAttribute('is-editable', 'false');
      picker.id = 'datetime-picker-disabled-2';
      document.body.appendChild(picker);

      const field = picker.shadowRoot?.querySelector('[part="field"]');
      return window.getComputedStyle(field!).pointerEvents;
    });

    expect(pointerEvents).toBe('none');
  });

  test('should emit _albert-open on click when editable', async ({ page }) => {
    await page.goto('/harness/index.html');
    const eventFired = await page.evaluate(async () => {
      const picker = document.querySelector('#datetime-picker');
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
      .locator('albert-datetime-picker')
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
    let value = await page.locator('#datetime-picker').evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });
    expect(value).toBe('Select a date and time');

    // Change value
    await page.evaluate(() => {
      const picker = document.querySelector('#datetime-picker');
      if (picker) picker.setAttribute('value', '2026-12-25T20:45:00');
    });

    value = await page.locator('#datetime-picker').evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });
    expect(value).toBe('December 25, 2026 8:45 PM');
  });

  test('should clear display when value is removed', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const picker = document.querySelector('#datetime-picker');
      if (picker) picker.setAttribute('value', '2026-06-15T14:30:00');
    });

    await page.evaluate(() => {
      const picker = document.querySelector('#datetime-picker');
      if (picker) picker.removeAttribute('value');
    });

    const value = await page.locator('#datetime-picker').evaluate((el) => {
      return el.shadowRoot?.querySelector('[part="value"]')?.textContent;
    });

    expect(value).toBe('Select a date and time');
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/harness/index.html');
    const eventFired = await page.evaluate(async () => {
      const picker = document.querySelector('#datetime-picker');
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

  test('should use clock icon instead of calendar', async ({ page }) => {
    await page.goto('/harness/index.html');
    const iconSvgContent = await page
      .locator('#datetime-picker')
      .evaluate((el) => {
        const iconEl = el.shadowRoot?.querySelector('[part="icon"]');
        return iconEl?.innerHTML;
      });

    expect(iconSvgContent).toContain('path');
    expect(iconSvgContent).toContain('M128,24A104');
  });
});
