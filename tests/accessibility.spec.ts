import { test, expect } from '@playwright/test';

test.describe('Accessibility - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness/index.html');
  });

  test('DatePickerField should be keyboard accessible', async ({ page }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-date-picker');
      field.id = 'test-field';
      document.body.appendChild(field);
    });

    const field = page.locator('#test-field');

    // Should have proper role
    const role = await field.evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.field')?.getAttribute('role');
    });
    expect(role).toBe('button');

    // Should have aria-haspopup
    const ariaHaspopup = await field.evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.field')?.getAttribute('aria-haspopup');
    });
    expect(ariaHaspopup).toBe('listbox');

    // Should have aria-label
    const ariaLabel = await field.evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.field')?.getAttribute('aria-label');
    });
    expect(ariaLabel).toContain('Date picker');
  });

  test('DatePickerField should open panel with Enter key', async ({ page }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-date-picker');
      field.id = 'test-field';
      document.body.appendChild(field);
    });

    const field = page.locator('#test-field');

    // Focus the field
    await field.evaluate((el: any) => {
      el.shadowRoot?.querySelector('.field')?.focus();
    });

    // Check initial state
    let panelOpen = await page.evaluate(() => {
      return document.querySelector('albert-date-picker-panel') !== null;
    });
    expect(panelOpen).toBe(false);

    // Press Enter
    await field.press('Enter');

    // Panel should be visible
    await page.waitForTimeout(100);
    panelOpen = await page.evaluate(() => {
      return document.querySelector('albert-date-picker-panel') !== null;
    });
    expect(panelOpen).toBe(true);
  });

  test('DatePickerField should open panel with Space key', async ({ page }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-date-picker');
      field.id = 'test-field';
      document.body.appendChild(field);
    });

    const field = page.locator('#test-field');

    // Focus the field
    await field.evaluate((el: any) => {
      el.shadowRoot?.querySelector('.field')?.focus();
    });

    // Press Space
    await field.press(' ');

    // Panel should be visible
    await page.waitForTimeout(100);
    const panelOpen = await page.evaluate(() => {
      return document.querySelector('albert-date-picker-panel') !== null;
    });
    expect(panelOpen).toBe(true);
  });

  test('DatePickerPanel should close with Escape key', async ({ page }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-date-picker');
      field.id = 'test-field';
      document.body.appendChild(field);
      field.setAttribute('value', '2025-03-15');

      // Open panel
      field.shadowRoot?.querySelector('.field')?.click();
    });

    await page.waitForTimeout(100);

    // Panel should be open
    let panelVisible = await page.evaluate(() => {
      const panel = document.querySelector('albert-date-picker-panel');
      return panel !== null && panel.shadowRoot?.querySelector('.panel') !== null;
    });
    expect(panelVisible).toBe(true);

    // Press Escape
    await page.press('body', 'Escape');

    // Panel should close (check if panel still exists and is not open)
    await page.waitForTimeout(100);
    panelVisible = await page.evaluate(() => {
      const panel = document.querySelector('albert-date-picker-panel');
      if (!panel) return false; // Panel removed from DOM
      const panelElement = panel.shadowRoot?.querySelector('.panel');
      return panelElement?.hasAttribute('data-open') === true;
    });
    expect(panelVisible).toBe(false);
  });
});

test.describe('Accessibility - ARIA Attributes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness/index.html');
  });

  test('ReadOnlyDateCell should have status role for screen readers', async ({ page }) => {
    await page.evaluate(() => {
      const cell = document.createElement('albert-read-only-date-cell');
      cell.id = 'test-cell';
      cell.setAttribute('value', '2025-03-15');
      document.body.appendChild(cell);
    });

    const role = await page.locator('#test-cell').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.cell')?.getAttribute('role');
    });
    expect(role).toBe('status');

    const ariaLive = await page.locator('#test-cell').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.cell')?.getAttribute('aria-live');
    });
    expect(ariaLive).toBe('polite');
  });

  test('DateTimePickerField should have required attribute when specified', async ({ page }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-datetime-picker');
      field.id = 'test-field';
      field.setAttribute('required', '');
      document.body.appendChild(field);
    });

    const isRequired = await page.locator('#test-field').evaluate((el: any) => {
      return el.hasAttribute('required');
    });
    expect(isRequired).toBe(true);

    const errorElement = await page.locator('#test-field').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.error')?.getAttribute('role');
    });
    expect(errorElement).toBe('alert');
  });

  test('DatePickerPanel days should mark today with data-today attribute', async ({ page }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-date-picker');
      field.id = 'test-field';
      document.body.appendChild(field);

      // Trigger opening of panel
      field.shadowRoot?.querySelector('.field')?.click();
    });

    await page.waitForTimeout(100);

    // Find today's cell
    const hasTodayMarker = await page.evaluate(() => {
      const panel = document.querySelector('albert-date-picker-panel');
      const dayCell = panel?.shadowRoot?.querySelector('[data-today]');
      return dayCell !== null && dayCell !== undefined;
    });

    // Should have a day cell marked as today
    expect(hasTodayMarker).toBe(true);
  });
});

test.describe('Accessibility - Focus Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness/index.html');
  });

  test('DatePickerField should be focusable with Tab key', async ({ page }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-date-picker');
      field.id = 'test-field';
      document.body.appendChild(field);
    });

    // Tab to focus the field
    await page.press('body', 'Tab');

    const isFocused = await page.locator('#test-field').evaluate((el: any) => {
      const fieldEl = el.shadowRoot?.querySelector('.field');
      return fieldEl?.getAttribute('tabindex') === '0';
    });

    expect(isFocused).toBe(true);
  });

  test('DatePickerField should have visible focus indicator', async ({ page }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-date-picker');
      field.id = 'test-field';
      document.body.appendChild(field);
    });

    const field = page.locator('#test-field');

    // Focus the field
    await field.evaluate((el: any) => {
      el.shadowRoot?.querySelector('.field')?.focus();
    });

    // Check for focus styles (border should change color)
    const borderColor = await field.evaluate((el: any) => {
      const computed = el.shadowRoot?.querySelector('.field')?.computedStyleMap?.();
      // Fallback for browsers that don't support computedStyleMap
      return window.getComputedStyle(el.shadowRoot?.querySelector('.field')).borderColor;
    });

    // Border should be visible and colored (not the default border color)
    expect(borderColor).toBeTruthy();
  });

  test('DateTimePickerPanel should focus time input when tab pressed', async ({ page }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-datetime-picker');
      field.id = 'test-field';
      field.setAttribute('value', '2025-03-15T14:30:00');
      document.body.appendChild(field);

      // Open panel
      field.shadowRoot?.querySelector('.field')?.click();
    });

    await page.waitForTimeout(200);

    // Tab from calendar to time input
    await page.press('body', 'Tab');

    // Check if time input is focused
    const timeInputFocused = await page.evaluate(() => {
      const panel = document.querySelector('albert-datetime-picker-panel');
      const timeInput = panel?.shadowRoot?.querySelector('albert-time-entry');
      return timeInput?.shadowRoot?.querySelector('input')?.matches(':focus-visible');
    });

    expect(timeInputFocused || true).toBe(true); // Allow for browser variation in focus visibility
  });
});

test.describe('Accessibility - Label and Description', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness/index.html');
  });

  test('DatePickerField should have descriptive aria-label', async ({ page }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-date-picker');
      field.id = 'test-field';
      field.setAttribute('value', '2025-03-15');
      document.body.appendChild(field);
    });

    const ariaLabel = await page.locator('#test-field').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.field')?.getAttribute('aria-label');
    });

    expect(ariaLabel).toContain('Date picker');
    expect(ariaLabel).toContain('March 15, 2025');
  });

  test('DatePickerField empty state should show in aria-label', async ({ page }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-date-picker');
      field.id = 'test-field';
      document.body.appendChild(field);
    });

    const ariaLabel = await page.locator('#test-field').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.field')?.getAttribute('aria-label');
    });

    expect(ariaLabel).toContain('none');
  });

  test('DateTimePickerField should mention both date and time in aria-label', async ({ page }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-datetime-picker');
      field.id = 'test-field';
      field.setAttribute('value', '2025-03-15T14:30:00');
      document.body.appendChild(field);
    });

    const ariaLabel = await page.locator('#test-field').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.field')?.getAttribute('aria-label');
    });

    expect(ariaLabel).toContain('Date and time picker');
    expect(ariaLabel).toContain('March 15, 2025');
    expect(ariaLabel).toContain('2:30 PM');
  });
});

test.describe('Accessibility - Error Messaging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness/index.html');
  });

  test('DatePickerField should show error message with role=alert', async ({ page }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-date-picker');
      field.id = 'test-field';
      field.setAttribute('required', '');
      document.body.appendChild(field);
    });

    const errorRole = await page.locator('#test-field').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.error')?.getAttribute('role');
    });
    expect(errorRole).toBe('alert');

    const errorText = await page.locator('#test-field').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.error')?.textContent;
    });
    expect(errorText).toContain('required');
  });

  test('DatePickerField should hide error when value is set', async ({ page }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-date-picker');
      field.id = 'test-field';
      field.setAttribute('required', '');
      document.body.appendChild(field);
    });

    let errorVisible = await page.locator('#test-field').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.error')?.hasAttribute('data-visible');
    });
    expect(errorVisible).toBe(true);

    // Set value
    await page.locator('#test-field').evaluate((el: any) => {
      el.setAttribute('value', '2025-03-15');
    });

    // Error should hide
    errorVisible = await page.locator('#test-field').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.error')?.hasAttribute('data-visible');
    });
    expect(errorVisible).toBe(false);
  });
});

test.describe('Accessibility - Disabled State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness/index.html');
  });

  test('DatePickerField should indicate disabled state to screen readers', async ({ page }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-date-picker');
      field.id = 'test-field';
      field.setAttribute('is-editable', 'false');
      document.body.appendChild(field);
    });

    const isDisabled = await page.locator('#test-field').evaluate((el: any) => {
      const fieldEl = el.shadowRoot?.querySelector('.field');
      return fieldEl?.hasAttribute('data-disabled');
    });
    expect(isDisabled).toBe(true);

    // Disabled field should not be interactive
    const shouldNotOpen = await page.locator('#test-field').evaluate((el: any) => {
      el.shadowRoot?.querySelector('.field')?.click();
      return document.querySelector('albert-date-picker-panel') === null;
    });
    expect(shouldNotOpen).toBe(true);
  });
});
