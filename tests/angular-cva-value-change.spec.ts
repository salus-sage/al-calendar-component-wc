/**
 * angular-cva-value-change.spec.ts
 *
 * Tests for the @Output() valueChange EventEmitter added to all three Angular
 * CVA wrappers:
 *   - DatePickerFieldCvaDirective     (albert-date-picker + [ngModel/formControl])
 *   - DateTimePickerFieldCvaDirective (albert-datetime-picker + [ngModel/formControl])
 *   - DateTimePickerFieldCvaComponent (albert-datetime-picker-cva + [formControl])
 *
 * Two layers of coverage:
 *
 *   1. Structural — the compiled Angular output in angular/*.js must contain
 *      'valueChange' and 'emit', confirming the @Output was compiled in.
 *      Also verifies DateTimePickerFieldCvaDirective is now declared in
 *      DateTimePickerModule (the pre-existing gap fixed in Step 4).
 *
 *   2. Behavioural — the underlying albert-change custom event that the
 *      directive/component listens to and forwards as valueChange.emit().
 *      Since valueChange is an Angular EventEmitter (not a DOM event) it
 *      cannot be observed directly in a Playwright browser test; verifying
 *      the albert-change mechanism is the equivalent contract.
 *      Key cases:
 *        - fires with a date string on day selection
 *        - fires with null/empty on Clear
 *        - does NOT fire on blur (only onTouched fires on blur)
 */

import { test, expect } from '@playwright/test';

// ─── 1. Structural: compiled Angular output ──────────────────────────────────

test('date-picker directive compiled output contains valueChange emitter', async ({ page }) => {
  await page.goto('/harness/index.html');

  const result = await page.evaluate(async () => {
    const res = await fetch('/angular/date-picker-field-cva.directive.js').catch(() => null);
    if (!res || !res.ok) return { found: false };
    const text = await res.text();
    return {
      hasValueChange: text.includes('valueChange'),
      hasEmit: text.includes('.emit('),
    };
  });

  expect(result).toMatchObject({ hasValueChange: true, hasEmit: true });
});

test('datetime-picker directive compiled output contains valueChange emitter', async ({ page }) => {
  await page.goto('/harness/index.html');

  const result = await page.evaluate(async () => {
    const res = await fetch('/angular/datetime-picker-field-cva.directive.js').catch(() => null);
    if (!res || !res.ok) return { found: false };
    const text = await res.text();
    return {
      hasValueChange: text.includes('valueChange'),
      hasEmit: text.includes('.emit('),
    };
  });

  expect(result).toMatchObject({ hasValueChange: true, hasEmit: true });
});

test('datetime-picker component compiled output contains valueChange emitter', async ({ page }) => {
  await page.goto('/harness/index.html');

  const result = await page.evaluate(async () => {
    const res = await fetch('/angular/datetime-picker-field-cva.component.js').catch(() => null);
    if (!res || !res.ok) return { found: false };
    const text = await res.text();
    return {
      hasValueChange: text.includes('valueChange'),
      hasEmit: text.includes('.emit('),
    };
  });

  expect(result).toMatchObject({ hasValueChange: true, hasEmit: true });
});

test('DateTimePickerModule compiled output now declares DateTimePickerFieldCvaDirective', async ({ page }) => {
  await page.goto('/harness/index.html');

  const result = await page.evaluate(async () => {
    const res = await fetch('/angular/datetime-picker.module.js').catch(() => null);
    if (!res || !res.ok) return { found: false };
    const text = await res.text();
    return {
      hasComponent: text.includes('DateTimePickerFieldCvaComponent'),
      hasDirective: text.includes('DateTimePickerFieldCvaDirective'),
    };
  });

  expect(result).toMatchObject({ hasComponent: true, hasDirective: true });
});

// ─── 2. Behavioural: albert-change is the source of valueChange.emit() ───────

test('albert-date-picker: albert-change fires with date string on day select (valueChange source)', async ({ page }) => {
  await page.goto('/harness/index.html');

  await page.evaluate(async () => {
    const field = document.createElement('albert-date-picker');
    field.id = 'vc-date-select';
    document.body.appendChild(field);
    (field as any).openPanel?.();
    await new Promise(r => setTimeout(r, 100));
  });

  const result = await page.evaluate(async () => {
    const field = document.querySelector('#vc-date-select')!;
    let emitCount = 0;
    let emitValue: string | null = null;

    field.addEventListener('albert-change', (e) => {
      emitCount++;
      emitValue = (e as CustomEvent).detail?.value ?? null;
    });

    const panels = document.querySelectorAll('albert-date-picker-panel');
    const panel = panels[panels.length - 1];
    const dayCell = Array.from(panel.shadowRoot?.querySelectorAll('.day-cell') || []).find(
      (el) => !(el as HTMLElement).hasAttribute('data-other-month'),
    ) as HTMLElement;
    dayCell?.click();
    await new Promise(r => setTimeout(r, 100));

    return { emitCount, emitValue };
  });

  expect(result.emitCount).toBe(1);
  expect(result.emitValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

test('albert-date-picker: albert-change fires with empty value on Clear (valueChange null case)', async ({ page }) => {
  await page.goto('/harness/index.html');

  await page.evaluate(async () => {
    const field = document.createElement('albert-date-picker');
    field.setAttribute('value', '2026-05-23');
    field.id = 'vc-date-clear';
    document.body.appendChild(field);
    (field as any).openPanel?.();
    await new Promise(r => setTimeout(r, 100));
  });

  const result = await page.evaluate(async () => {
    const field = document.querySelector('#vc-date-clear')!;
    let emitCount = 0;
    let emitValue: string | undefined;

    field.addEventListener('albert-change', (e) => {
      emitCount++;
      emitValue = (e as CustomEvent).detail?.value;
    });

    const panels = document.querySelectorAll('albert-date-picker-panel');
    const panel = panels[panels.length - 1];
    const clearBtn = panel.shadowRoot?.querySelector('.clear-btn') as HTMLButtonElement;
    clearBtn?.click();
    await new Promise(r => setTimeout(r, 100));

    return { emitCount, emitValue };
  });

  expect(result.emitCount).toBe(1);
  expect(result.emitValue ?? '').toBe('');
});

test('albert-date-picker: blur does NOT fire albert-change (valueChange not emitted on blur)', async ({ page }) => {
  await page.goto('/harness/index.html');

  const result = await page.evaluate(async () => {
    const field = document.createElement('albert-date-picker');
    field.id = 'vc-date-blur';
    document.body.appendChild(field);

    let changeCount = 0;
    field.addEventListener('albert-change', () => { changeCount++; });

    field.dispatchEvent(new Event('blur', { bubbles: true }));
    await new Promise(r => setTimeout(r, 50));

    return { changeCount };
  });

  // blur must not trigger albert-change — only onTouched fires on blur
  expect(result.changeCount).toBe(0);
});

test('albert-datetime-picker: albert-change fires with ISO timestamp on day select (valueChange source)', async ({ page }) => {
  await page.goto('/harness/index.html');

  await page.evaluate(async () => {
    const field = document.createElement('albert-datetime-picker');
    field.id = 'vc-dt-select';
    document.body.appendChild(field);
    (field as any).openPanel?.();
    await new Promise(r => setTimeout(r, 100));
  });

  const result = await page.evaluate(async () => {
    const field = document.querySelector('#vc-dt-select')!;
    let emitCount = 0;
    let emitValue: string | null = null;

    field.addEventListener('albert-change', (e) => {
      emitCount++;
      emitValue = (e as CustomEvent).detail?.value ?? null;
    });

    const panels = document.querySelectorAll('albert-date-time-picker-panel');
    const panel = panels[panels.length - 1];
    const dayCell = Array.from(panel.shadowRoot?.querySelectorAll('.day-cell') || []).find(
      (el) => !(el as HTMLElement).hasAttribute('data-other-month'),
    ) as HTMLElement;
    dayCell?.click();
    await new Promise(r => setTimeout(r, 100));

    return { emitCount, emitValue };
  });

  expect(result.emitCount).toBe(1);
  expect(result.emitValue).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
});

test('albert-datetime-picker: blur does NOT fire albert-change (valueChange not emitted on blur)', async ({ page }) => {
  await page.goto('/harness/index.html');

  const result = await page.evaluate(async () => {
    const field = document.createElement('albert-datetime-picker');
    field.id = 'vc-dt-blur';
    document.body.appendChild(field);

    let changeCount = 0;
    field.addEventListener('albert-change', () => { changeCount++; });

    field.dispatchEvent(new Event('blur', { bubbles: true }));
    await new Promise(r => setTimeout(r, 50));

    return { changeCount };
  });

  // blur must not trigger albert-change — only onTouched fires on blur
  expect(result.changeCount).toBe(0);
});
