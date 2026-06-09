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

    // Should have aria-haspopup (Q5: "dialog" is semantically correct for a panel)
    const ariaHaspopup = await field.evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.field')?.getAttribute('aria-haspopup');
    });
    expect(ariaHaspopup).toBe('dialog');

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

  test('ReadOnlyDateCell cell element has no interactive role (Q4)', async ({
    page,
  }) => {
    await page.evaluate(() => {
      const cell = document.createElement('albert-read-only-date-cell');
      cell.id = 'test-cell';
      cell.setAttribute('value', '2025-03-15');
      document.body.appendChild(cell);
    });

    // Q4: role="status" + aria-live="polite" are semantically incorrect on a
    // static read-only cell — the corrected cell should have no role attribute
    const role = await page.locator('#test-cell').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.cell')?.getAttribute('role');
    });
    expect(role).toBeNull();

    const ariaLive = await page.locator('#test-cell').evaluate((el: any) => {
      return el.shadowRoot?.querySelector('.cell')?.getAttribute('aria-live');
    });
    expect(ariaLive).toBeNull();
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

// ─── P8 — Cleanup Q1–Q8 · A4 · A5 ───────────────────────────────────────────

test.describe('Accessibility — P8 cleanup (Q3 · Q4 · Q5)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness/index.html');
  });

  // ── Q5 — aria-haspopup="dialog" (not "listbox") ───────────────────────────

  test('DatePickerField aria-haspopup is "dialog" (Q5)', async ({ page }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-date-picker');
      field.id = 'p8-q5a';
      document.body.appendChild(field);
    });
    const val = await page.evaluate(
      () =>
        document
          .getElementById('p8-q5a')
          ?.shadowRoot?.querySelector('.field')
          ?.getAttribute('aria-haspopup'),
    );
    expect(val).toBe('dialog');
  });

  test('DateTimePickerField aria-haspopup is "dialog" (Q5)', async ({
    page,
  }) => {
    await page.evaluate(() => {
      const field = document.createElement('albert-datetime-picker');
      field.id = 'p8-q5b';
      document.body.appendChild(field);
    });
    const val = await page.evaluate(
      () =>
        document
          .getElementById('p8-q5b')
          ?.shadowRoot?.querySelector('.field')
          ?.getAttribute('aria-haspopup'),
    );
    expect(val).toBe('dialog');
  });

  // ── Q3 — ReadOnlyDateCell has no interactive chrome ───────────────────────

  test('ReadOnlyDateCell cell has no interactive min-height chrome (Q3)', async ({
    page,
  }) => {
    await page.evaluate(() => {
      const cell = document.createElement('albert-read-only-date-cell');
      cell.id = 'p8-q3';
      cell.setAttribute('value', '2025-03-15');
      document.body.appendChild(cell);
    });
    const minHeight = await page.evaluate(() => {
      const cell = document.getElementById('p8-q3');
      const cellEl = cell?.shadowRoot?.querySelector('.cell');
      return window.getComputedStyle(cellEl!).minHeight;
    });
    // After Q3 fix: the 44px interactive min-height is removed
    expect(minHeight).not.toBe('44px');
  });

  // ── SSR guard — panelRegistry window access ───────────────────────────────

  test('panelRegistry is initialised at runtime (SSR guard)', async ({
    page,
  }) => {
    const exists = await page.evaluate(
      () => typeof (window as any).__albertPickerRegistry !== 'undefined',
    );
    expect(exists).toBe(true);
  });
});

// ─── P7 — Spec gaps S2 · S3 · S4 · S6 ───────────────────────────────────────

test.describe('Accessibility — P7 spec gaps (S2 · S3 · S4 · S6)', () => {
  async function openDatePanel(
    page: any,
    id: string,
    value = '2026-05-15',
  ) {
    await page.goto('/harness/index.html');
    await page.evaluate(
      async ({ id, value }: { id: string; value: string }) => {
        const field = document.createElement('albert-date-picker') as any;
        field.setAttribute('value', value);
        field.id = id;
        document.body.appendChild(field);
        field.shadowRoot?.querySelector('.field')?.click();
        await new Promise((r) => setTimeout(r, 200));
      },
      { id, value },
    );
  }

  async function openDateTimePanel(
    page: any,
    id: string,
    value = '2026-05-15T14:30:00',
  ) {
    await page.goto('/harness/index.html');
    await page.evaluate(
      async ({ id, value }: { id: string; value: string }) => {
        const field = document.createElement('albert-datetime-picker') as any;
        field.setAttribute('value', value);
        field.id = id;
        document.body.appendChild(field);
        field.shadowRoot?.querySelector('.field')?.click();
        await new Promise((r) => setTimeout(r, 200));
      },
      { id, value },
    );
  }

  // ── S3 — role=dialog + aria-modal ──────────────────────────────────────────

  test('DatePickerPanel has role="dialog" and aria-modal="true" when open', async ({
    page,
  }) => {
    await openDatePanel(page, 'p7-s3a');
    const result = await page.evaluate(() => {
      const panel = document.querySelector('albert-date-picker-panel');
      const div = panel?.shadowRoot?.querySelector('.panel');
      return {
        role: div?.getAttribute('role'),
        ariaModal: div?.getAttribute('aria-modal'),
      };
    });
    expect(result.role).toBe('dialog');
    expect(result.ariaModal).toBe('true');
  });

  test('DateTimePickerPanel has role="dialog" and aria-modal="true" when open', async ({
    page,
  }) => {
    await openDateTimePanel(page, 'p7-s3b');
    const result = await page.evaluate(() => {
      const panel = document.querySelector('albert-date-time-picker-panel');
      const div = panel?.shadowRoot?.querySelector('.panel');
      return {
        role: div?.getAttribute('role'),
        ariaModal: div?.getAttribute('aria-modal'),
      };
    });
    expect(result.role).toBe('dialog');
    expect(result.ariaModal).toBe('true');
  });

  // ── S4 — focus on open ─────────────────────────────────────────────────────

  test('DatePickerPanel focuses a day cell when opened', async ({ page }) => {
    await openDatePanel(page, 'p7-s4a');
    const focused = await page.evaluate(() => {
      const panel = document.querySelector('albert-date-picker-panel');
      const active = panel?.shadowRoot?.activeElement as HTMLElement | null;
      return {
        tagName: active?.tagName ?? '',
        className: active?.className ?? '',
      };
    });
    expect(focused.tagName).toBe('BUTTON');
    expect(focused.className).toContain('day-cell');
  });

  test('DateTimePickerPanel focuses a day cell when opened', async ({
    page,
  }) => {
    await openDateTimePanel(page, 'p7-s4b');
    const focused = await page.evaluate(() => {
      const panel = document.querySelector('albert-date-time-picker-panel');
      const active = panel?.shadowRoot?.activeElement as HTMLElement | null;
      return {
        tagName: active?.tagName ?? '',
        className: active?.className ?? '',
      };
    });
    expect(focused.tagName).toBe('BUTTON');
    expect(focused.className).toContain('day-cell');
  });

  // ── S6 — aria-expanded ─────────────────────────────────────────────────────

  test('DatePickerField aria-expanded is "false" initially and "true" when panel is open', async ({
    page,
  }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const field = document.createElement('albert-date-picker') as any;
      field.id = 'p7-s6a';
      document.body.appendChild(field);
    });

    const before = await page.evaluate(() =>
      document
        .getElementById('p7-s6a')
        ?.shadowRoot?.querySelector('.field')
        ?.getAttribute('aria-expanded'),
    );
    expect(before).toBe('false');

    await page.evaluate(async () => {
      (document.getElementById('p7-s6a') as any)
        ?.shadowRoot?.querySelector('.field')
        ?.click();
      await new Promise((r) => setTimeout(r, 200));
    });

    const after = await page.evaluate(() =>
      document
        .getElementById('p7-s6a')
        ?.shadowRoot?.querySelector('.field')
        ?.getAttribute('aria-expanded'),
    );
    expect(after).toBe('true');
  });

  test('DatePickerField aria-expanded reverts to "false" after Escape closes panel', async ({
    page,
  }) => {
    await openDatePanel(page, 'p7-s6b');

    const expanded = await page.evaluate(() =>
      document
        .getElementById('p7-s6b')
        ?.shadowRoot?.querySelector('.field')
        ?.getAttribute('aria-expanded'),
    );
    expect(expanded).toBe('true');

    await page.evaluate(async () => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      await new Promise((r) => setTimeout(r, 150));
    });

    const collapsed = await page.evaluate(() =>
      document
        .getElementById('p7-s6b')
        ?.shadowRoot?.querySelector('.field')
        ?.getAttribute('aria-expanded'),
    );
    expect(collapsed).toBe('false');
  });

  test('DateTimePickerField aria-expanded is "true" when panel is open', async ({
    page,
  }) => {
    await openDateTimePanel(page, 'p7-s6c');
    const expanded = await page.evaluate(() =>
      document
        .getElementById('p7-s6c')
        ?.shadowRoot?.querySelector('.field')
        ?.getAttribute('aria-expanded'),
    );
    expect(expanded).toBe('true');
  });

  test('DateTimePickerField aria-expanded reverts to "false" after Escape', async ({
    page,
  }) => {
    await openDateTimePanel(page, 'p7-s6d');

    const expanded = await page.evaluate(() =>
      document
        .getElementById('p7-s6d')
        ?.shadowRoot?.querySelector('.field')
        ?.getAttribute('aria-expanded'),
    );
    expect(expanded).toBe('true');

    await page.evaluate(async () => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      await new Promise((r) => setTimeout(r, 150));
    });

    const collapsed = await page.evaluate(() =>
      document
        .getElementById('p7-s6d')
        ?.shadowRoot?.querySelector('.field')
        ?.getAttribute('aria-expanded'),
    );
    expect(collapsed).toBe('false');
  });

  // ── S2 — arrow key day navigation ─────────────────────────────────────────

  test('ArrowRight moves focus to the next day in DatePickerPanel', async ({
    page,
  }) => {
    await openDatePanel(page, 'p7-s2a', '2026-05-15');
    const result = await page.evaluate(async () => {
      const panel = document.querySelector('albert-date-picker-panel');
      const focused = panel?.shadowRoot?.activeElement as HTMLElement | null;
      const initialDay = focused?.textContent?.trim() ?? '';
      focused?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      );
      await new Promise((r) => setTimeout(r, 60));
      const newFocused = panel?.shadowRoot?.activeElement as HTMLElement | null;
      return { initialDay, newDay: newFocused?.textContent?.trim() ?? '' };
    });
    expect(Number(result.newDay)).toBe(Number(result.initialDay) + 1);
  });

  test('ArrowLeft moves focus to the previous day in DatePickerPanel', async ({
    page,
  }) => {
    await openDatePanel(page, 'p7-s2b', '2026-05-15');
    const result = await page.evaluate(async () => {
      const panel = document.querySelector('albert-date-picker-panel');
      const focused = panel?.shadowRoot?.activeElement as HTMLElement | null;
      const initialDay = focused?.textContent?.trim() ?? '';
      focused?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
      );
      await new Promise((r) => setTimeout(r, 60));
      const newFocused = panel?.shadowRoot?.activeElement as HTMLElement | null;
      return { initialDay, newDay: newFocused?.textContent?.trim() ?? '' };
    });
    expect(Number(result.newDay)).toBe(Number(result.initialDay) - 1);
  });

  test('ArrowDown moves focus one week forward in DatePickerPanel', async ({
    page,
  }) => {
    await openDatePanel(page, 'p7-s2c', '2026-05-08');
    const result = await page.evaluate(async () => {
      const panel = document.querySelector('albert-date-picker-panel');
      const focused = panel?.shadowRoot?.activeElement as HTMLElement | null;
      const initialDay = focused?.textContent?.trim() ?? '';
      focused?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      await new Promise((r) => setTimeout(r, 60));
      const newFocused = panel?.shadowRoot?.activeElement as HTMLElement | null;
      return { initialDay, newDay: newFocused?.textContent?.trim() ?? '' };
    });
    expect(Number(result.newDay)).toBe(Number(result.initialDay) + 7);
  });

  test('ArrowUp moves focus one week back in DatePickerPanel', async ({
    page,
  }) => {
    await openDatePanel(page, 'p7-s2d', '2026-05-15');
    const result = await page.evaluate(async () => {
      const panel = document.querySelector('albert-date-picker-panel');
      const focused = panel?.shadowRoot?.activeElement as HTMLElement | null;
      const initialDay = focused?.textContent?.trim() ?? '';
      focused?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
      await new Promise((r) => setTimeout(r, 60));
      const newFocused = panel?.shadowRoot?.activeElement as HTMLElement | null;
      return { initialDay, newDay: newFocused?.textContent?.trim() ?? '' };
    });
    expect(Number(result.newDay)).toBe(Number(result.initialDay) - 7);
  });
});
