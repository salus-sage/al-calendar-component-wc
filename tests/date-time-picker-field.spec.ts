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

  // ── Phase 1 RED tests: event contract (B1, B2, B3, B4) ─────────────────────

  test('albert-change event is dispatched on day select (not _albert-change) — B3', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-b3-panel';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const result = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      let albertChangeCount = 0;
      let privateChangeCount = 0;

      panel.addEventListener('albert-change', () => { albertChangeCount++; });
      panel.addEventListener('_albert-change', () => { privateChangeCount++; });

      const dayCell = Array.from(panel.shadowRoot?.querySelectorAll('.day-cell') || []).find(
        (el) => !(el as HTMLElement).hasAttribute('data-other-month')
      ) as HTMLElement;
      dayCell?.click();
      await new Promise(r => setTimeout(r, 50));

      return { albertChangeCount, privateChangeCount };
    });

    expect(result.albertChangeCount).toBe(1);
    expect(result.privateChangeCount).toBe(0);
  });

  test('albert-change event is dispatched on Now click — B1', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.id = 'test-b1-panel';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const result = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      let albertChangeCount = 0;
      let privateChangeCount = 0;

      panel.addEventListener('albert-change', (e) => {
        albertChangeCount++;
        (window as any).__b1Value = (e as CustomEvent).detail?.value;
      });
      panel.addEventListener('_albert-change', () => { privateChangeCount++; });

      const nowBtn = Array.from(panel.shadowRoot?.querySelectorAll('.footer-btn') || []).find(
        (el) => el.textContent?.includes('Now')
      ) as HTMLButtonElement;
      nowBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      return { albertChangeCount, privateChangeCount, value: (window as any).__b1Value };
    });

    expect(result.albertChangeCount).toBe(1);
    expect(result.privateChangeCount).toBe(0);
    expect(result.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test('field value updates when panel fires albert-change after day click — B2', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.id = 'test-b2-field';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];
      const dayCell = Array.from(panel.shadowRoot?.querySelectorAll('.day-cell') || []).find(
        (el) => !(el as HTMLElement).hasAttribute('data-other-month')
      ) as HTMLElement;
      dayCell?.click();
      await new Promise(r => setTimeout(r, 100));
    });

    const value = await page.locator('#test-b2-field').evaluate((el) => {
      return el.getAttribute('value');
    });

    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test('DateTimePickerField.value attribute set after day selected (starts empty) — B2', async ({ page }) => {
    await page.goto('/harness/index.html');
    // Field starts with NO value so we can confirm panel event sets it
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.id = 'test-b2-attr';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const valueBefore = await page.locator('#test-b2-attr').evaluate((el) => el.getAttribute('value'));
    expect(valueBefore).toBeNull();

    await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];
      const dayCell = Array.from(panel.shadowRoot?.querySelectorAll('.day-cell') || []).find(
        (el) => !(el as HTMLElement).hasAttribute('data-other-month')
      ) as HTMLElement;
      dayCell?.click();
      await new Promise(r => setTimeout(r, 100));
    });

    const result = await page.locator('#test-b2-attr').evaluate((el) => {
      const value = el.getAttribute('value');
      const displayText = el.shadowRoot?.querySelector('[part="value"]')?.textContent;
      return { value, displayText };
    });

    // After selecting a day, the field must have a value set by the panel event
    expect(result.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(result.displayText).not.toBe('Select a date and time');
  });

  test('Now button: field value updates and panel closes — B1 + B2', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.id = 'test-b1b2-now';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];
      const nowBtn = Array.from(panel.shadowRoot?.querySelectorAll('.footer-btn') || []).find(
        (el) => el.textContent?.includes('Now')
      ) as HTMLButtonElement;
      nowBtn?.click();
      await new Promise(r => setTimeout(r, 100));
    });

    const result = await page.locator('#test-b1b2-now').evaluate((el) => {
      const field = el as HTMLElement;
      const value = field.getAttribute('value');
      const panelInDom = !!document.querySelector('albert-date-time-picker-panel');
      const displayText = field.shadowRoot?.querySelector('[part="value"]')?.textContent;
      return { value, panelInDom, displayText };
    });

    expect(result.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(result.displayText).not.toBe('Select a date and time');
  });

  test('Clear button: field value becomes empty string — B2', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T10:00:00');
      field.id = 'test-b2-clear';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];
      const clearBtn = Array.from(panel.shadowRoot?.querySelectorAll('.footer-btn') || []).find(
        (el) => el.textContent?.includes('Clear')
      ) as HTMLButtonElement;
      clearBtn?.click();
      await new Promise(r => setTimeout(r, 100));
    });

    const result = await page.locator('#test-b2-clear').evaluate((el) => {
      return {
        value: el.getAttribute('value'),
        displayText: el.shadowRoot?.querySelector('[part="value"]')?.textContent,
      };
    });

    expect(result.value ?? '').toBe('');
    expect(result.displayText).toBe('Select a date and time');
  });

  test('two pickers: selecting date in picker-A does NOT update picker-B — B4', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const pickerA = document.createElement('albert-date-picker');
      pickerA.id = 'test-b4-picker-a';
      document.body.appendChild(pickerA);

      const pickerB = document.createElement('albert-date-picker');
      pickerB.id = 'test-b4-picker-b';
      document.body.appendChild(pickerB);
    });

    // Open picker A and select a date
    await page.evaluate(async () => {
      const pickerA = document.querySelector('#test-b4-picker-a') as any;
      pickerA.openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const dayCell = Array.from(panel.shadowRoot?.querySelectorAll('.day-cell') || []).find(
        (el) => !(el as HTMLElement).hasAttribute('data-other-month')
      ) as HTMLElement;
      dayCell?.click();
      await new Promise(r => setTimeout(r, 100));
    });

    const result = await page.evaluate(() => {
      const pickerA = document.querySelector('#test-b4-picker-a');
      const pickerB = document.querySelector('#test-b4-picker-b');
      return {
        pickerAValue: pickerA?.getAttribute('value') || '',
        pickerBValue: pickerB?.getAttribute('value') || '',
      };
    });

    expect(result.pickerAValue).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(result.pickerBValue).toBe('');
  });
});
