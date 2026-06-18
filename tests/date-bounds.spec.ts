import { test, expect } from '@playwright/test';

async function openWithBounds(
  page: any,
  tag: 'albert-date-picker' | 'albert-datetime-picker',
  id: string,
  value: string,
  minDate?: string,
  maxDate?: string,
) {
  await page.goto('/harness/index.html');
  await page.evaluate(async (opts: { tag: string; id: string; value: string; minDate?: string; maxDate?: string }) => {
    const field = document.createElement(opts.tag) as HTMLElement;
    field.setAttribute('value', opts.value);
    field.id = opts.id;
    if (opts.minDate) field.setAttribute('min-date', opts.minDate);
    if (opts.maxDate) field.setAttribute('max-date', opts.maxDate);
    document.body.appendChild(field);
    (field as any).openPanel?.();
    await new Promise(r => setTimeout(r, 120));
  }, { tag, id, value, minDate, maxDate });
}

test.describe('DatePickerPanel — date bounds', () => {
  test('D1 — days before min-date are disabled and carry data-out-of-range', async ({ page }) => {
    await openWithBounds(page, 'albert-date-picker', 'd1', '2026-06-15', '2026-06-10');

    const result = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const cell = Array.from(panel.shadowRoot?.querySelectorAll('.day-cell') || []).find(
        (el) =>
          (el as HTMLElement).textContent?.trim() === '9' &&
          !(el as HTMLElement).hasAttribute('data-adjacent'),
      ) as HTMLButtonElement | undefined;
      return {
        disabled: cell?.disabled ?? false,
        hasOutOfRange: cell?.hasAttribute('data-out-of-range') ?? false,
      };
    });

    expect(result.disabled).toBe(true);
    expect(result.hasOutOfRange).toBe(true);
  });

  test('D2 — days after max-date are disabled and carry data-out-of-range', async ({ page }) => {
    await openWithBounds(page, 'albert-date-picker', 'd2', '2026-06-15', undefined, '2026-06-20');

    const result = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const cell = Array.from(panel.shadowRoot?.querySelectorAll('.day-cell') || []).find(
        (el) =>
          (el as HTMLElement).textContent?.trim() === '21' &&
          !(el as HTMLElement).hasAttribute('data-adjacent'),
      ) as HTMLButtonElement | undefined;
      return {
        disabled: cell?.disabled ?? false,
        hasOutOfRange: cell?.hasAttribute('data-out-of-range') ?? false,
      };
    });

    expect(result.disabled).toBe(true);
    expect(result.hasOutOfRange).toBe(true);
  });

  test('D3 — days within the range are NOT disabled', async ({ page }) => {
    await openWithBounds(page, 'albert-date-picker', 'd3', '2026-06-15', '2026-06-10', '2026-06-20');

    const result = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const cell = Array.from(panel.shadowRoot?.querySelectorAll('.day-cell') || []).find(
        (el) =>
          (el as HTMLElement).textContent?.trim() === '15' &&
          !(el as HTMLElement).hasAttribute('data-adjacent'),
      ) as HTMLButtonElement | undefined;
      return {
        disabled: cell?.disabled ?? true,
        hasOutOfRange: cell?.hasAttribute('data-out-of-range') ?? false,
      };
    });

    expect(result.disabled).toBe(false);
    expect(result.hasOutOfRange).toBe(false);
  });

  test('D4 — no bounds → no cells carry data-out-of-range', async ({ page }) => {
    await openWithBounds(page, 'albert-date-picker', 'd4', '2026-06-15');

    const count = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      return panel.shadowRoot?.querySelectorAll('[data-out-of-range]').length ?? 0;
    });

    expect(count).toBe(0);
  });

  test('D5 — min-date === max-date → only that single day is not disabled', async ({ page }) => {
    await openWithBounds(page, 'albert-date-picker', 'd5', '2026-06-15', '2026-06-15', '2026-06-15');

    const result = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const findCell = (day: string) =>
        Array.from(panel.shadowRoot?.querySelectorAll('.day-cell') || []).find(
          (el) =>
            (el as HTMLElement).textContent?.trim() === day &&
            !(el as HTMLElement).hasAttribute('data-adjacent'),
        ) as HTMLButtonElement | undefined;

      const day14 = findCell('14');
      const day15 = findCell('15');
      const day16 = findCell('16');

      return {
        day14Disabled: day14?.disabled ?? false,
        day16Disabled: day16?.disabled ?? false,
        day15Disabled: day15?.disabled ?? true,
      };
    });

    expect(result.day14Disabled).toBe(true);
    expect(result.day16Disabled).toBe(true);
    expect(result.day15Disabled).toBe(false);
  });
});

test.describe('DatePickerPanel — month view bounds', () => {
  test('M1 — month before min-date month is disabled', async ({ page }) => {
    await openWithBounds(page, 'albert-date-picker', 'm1', '2026-06-15', '2026-06-01');

    const disabled = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const monthBtn = panel.shadowRoot?.querySelector('[part="month-year-btn"]') as HTMLElement;
      monthBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      const mayPill = Array.from(
        panel.shadowRoot?.querySelectorAll('[part="month-pill"]') || [],
      ).find((el) => (el as HTMLElement).textContent?.includes('May')) as HTMLButtonElement | undefined;

      return mayPill?.disabled ?? false;
    });

    expect(disabled).toBe(true);
  });

  test('M2 — month after max-date month is disabled', async ({ page }) => {
    await openWithBounds(page, 'albert-date-picker', 'm2', '2026-06-15', undefined, '2026-06-30');

    const disabled = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const monthBtn = panel.shadowRoot?.querySelector('[part="month-year-btn"]') as HTMLElement;
      monthBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      const julPill = Array.from(
        panel.shadowRoot?.querySelectorAll('[part="month-pill"]') || [],
      ).find((el) => (el as HTMLElement).textContent?.includes('Jul')) as HTMLButtonElement | undefined;

      return julPill?.disabled ?? false;
    });

    expect(disabled).toBe(true);
  });

  test('M3 — month within range is NOT disabled', async ({ page }) => {
    await openWithBounds(page, 'albert-date-picker', 'm3', '2026-06-15', '2026-05-01', '2026-08-31');

    const disabled = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const monthBtn = panel.shadowRoot?.querySelector('[part="month-year-btn"]') as HTMLElement;
      monthBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      const junPill = Array.from(
        panel.shadowRoot?.querySelectorAll('[part="month-pill"]') || [],
      ).find((el) => (el as HTMLElement).textContent?.includes('Jun')) as HTMLButtonElement | undefined;

      return junPill?.disabled ?? true;
    });

    expect(disabled).toBe(false);
  });
});

test.describe('DatePickerPanel — year view bounds', () => {
  test('Y1 — year before min-date year is disabled', async ({ page }) => {
    await openWithBounds(page, 'albert-date-picker', 'y1', '2025-06-15', '2025-01-01');

    const disabled = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const monthBtn = panel.shadowRoot?.querySelector('[part="month-year-btn"]') as HTMLElement;
      monthBtn?.click();
      await new Promise(r => setTimeout(r, 50));
      const yearBtn = panel.shadowRoot?.querySelector('[part="year-btn"]') as HTMLElement;
      yearBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      const year2024 = Array.from(
        panel.shadowRoot?.querySelectorAll('[part="year-pill"]') || [],
      ).find((el) => (el as HTMLElement).textContent?.trim() === '2024') as HTMLButtonElement | undefined;

      return year2024?.disabled ?? false;
    });

    expect(disabled).toBe(true);
  });

  test('Y2 — year after max-date year is disabled', async ({ page }) => {
    await openWithBounds(page, 'albert-date-picker', 'y2', '2025-06-15', undefined, '2025-12-31');

    const disabled = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const monthBtn = panel.shadowRoot?.querySelector('[part="month-year-btn"]') as HTMLElement;
      monthBtn?.click();
      await new Promise(r => setTimeout(r, 50));
      const yearBtn = panel.shadowRoot?.querySelector('[part="year-btn"]') as HTMLElement;
      yearBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      const year2026 = Array.from(
        panel.shadowRoot?.querySelectorAll('[part="year-pill"]') || [],
      ).find((el) => (el as HTMLElement).textContent?.trim() === '2026') as HTMLButtonElement | undefined;

      return year2026?.disabled ?? false;
    });

    expect(disabled).toBe(true);
  });

  test('Y3 — year within range is NOT disabled', async ({ page }) => {
    await openWithBounds(page, 'albert-date-picker', 'y3', '2025-06-15', '2024-01-01', '2026-12-31');

    const disabled = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const monthBtn = panel.shadowRoot?.querySelector('[part="month-year-btn"]') as HTMLElement;
      monthBtn?.click();
      await new Promise(r => setTimeout(r, 50));
      const yearBtn = panel.shadowRoot?.querySelector('[part="year-btn"]') as HTMLElement;
      yearBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      const year2025 = Array.from(
        panel.shadowRoot?.querySelectorAll('[part="year-pill"]') || [],
      ).find((el) => (el as HTMLElement).textContent?.trim() === '2025') as HTMLButtonElement | undefined;

      return year2025?.disabled ?? true;
    });

    expect(disabled).toBe(false);
  });
});

test.describe('DatePickerPanel — navigation clamping', () => {
  test('N1 — prev disabled when viewing the min-date month', async ({ page }) => {
    await openWithBounds(page, 'albert-date-picker', 'n1', '2026-06-15', '2026-06-01');

    const disabled = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const prevBtn = panel.shadowRoot?.querySelector('[part="prev"]') as HTMLButtonElement;
      return prevBtn?.disabled ?? false;
    });

    expect(disabled).toBe(true);
  });

  test('N2 — prev NOT disabled when one month after min-date', async ({ page }) => {
    await openWithBounds(page, 'albert-date-picker', 'n2', '2026-06-15', '2026-05-01');

    const disabled = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const prevBtn = panel.shadowRoot?.querySelector('[part="prev"]') as HTMLButtonElement;
      return prevBtn?.disabled ?? true;
    });

    expect(disabled).toBe(false);
  });

  test('N3 — next disabled when viewing the max-date month', async ({ page }) => {
    await openWithBounds(page, 'albert-date-picker', 'n3', '2026-06-15', undefined, '2026-06-30');

    const disabled = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const nextBtn = panel.shadowRoot?.querySelector('[part="next"]') as HTMLButtonElement;
      return nextBtn?.disabled ?? false;
    });

    expect(disabled).toBe(true);
  });

  test('N4 — next NOT disabled when one month before max-date', async ({ page }) => {
    await openWithBounds(page, 'albert-date-picker', 'n4', '2026-06-15', undefined, '2026-07-31');

    const disabled = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const nextBtn = panel.shadowRoot?.querySelector('[part="next"]') as HTMLButtonElement;
      return nextBtn?.disabled ?? true;
    });

    expect(disabled).toBe(false);
  });
});

test.describe('DateTimePickerPanel — date bounds', () => {
  test('DT-D1 — days before min-date are disabled and carry data-out-of-range', async ({ page }) => {
    await openWithBounds(page, 'albert-datetime-picker', 'dt-d1', '2026-06-15T12:00:00', '2026-06-10');

    const result = await page.evaluate(() => {
      const panel = document.querySelector('albert-date-time-picker-panel');
      if (!panel) return { disabled: false, hasOutOfRange: false };
      const cell = Array.from(panel.shadowRoot?.querySelectorAll('.day-cell') || []).find(
        (el) =>
          (el as HTMLElement).textContent?.trim() === '9' &&
          !(el as HTMLElement).hasAttribute('data-other-month'),
      ) as HTMLButtonElement | undefined;
      return {
        disabled: cell?.disabled ?? false,
        hasOutOfRange: cell?.hasAttribute('data-out-of-range') ?? false,
      };
    });

    expect(result.disabled).toBe(true);
    expect(result.hasOutOfRange).toBe(true);
  });

  test('DT-D2 — days after max-date are disabled and carry data-out-of-range', async ({ page }) => {
    await openWithBounds(page, 'albert-datetime-picker', 'dt-d2', '2026-06-15T12:00:00', undefined, '2026-06-20');

    const result = await page.evaluate(() => {
      const panel = document.querySelector('albert-date-time-picker-panel');
      if (!panel) return { disabled: false, hasOutOfRange: false };
      const cell = Array.from(panel.shadowRoot?.querySelectorAll('.day-cell') || []).find(
        (el) =>
          (el as HTMLElement).textContent?.trim() === '21' &&
          !(el as HTMLElement).hasAttribute('data-other-month'),
      ) as HTMLButtonElement | undefined;
      return {
        disabled: cell?.disabled ?? false,
        hasOutOfRange: cell?.hasAttribute('data-out-of-range') ?? false,
      };
    });

    expect(result.disabled).toBe(true);
    expect(result.hasOutOfRange).toBe(true);
  });

  test('DT-D3 — days within the range are NOT disabled', async ({ page }) => {
    await openWithBounds(
      page,
      'albert-datetime-picker',
      'dt-d3',
      '2026-06-15T12:00:00',
      '2026-06-10',
      '2026-06-20',
    );

    const result = await page.evaluate(() => {
      const panel = document.querySelector('albert-date-time-picker-panel');
      if (!panel) return { disabled: true, hasOutOfRange: false };
      const cell = Array.from(panel.shadowRoot?.querySelectorAll('.day-cell') || []).find(
        (el) =>
          (el as HTMLElement).textContent?.trim() === '15' &&
          !(el as HTMLElement).hasAttribute('data-other-month'),
      ) as HTMLButtonElement | undefined;
      return {
        disabled: cell?.disabled ?? true,
        hasOutOfRange: cell?.hasAttribute('data-out-of-range') ?? false,
      };
    });

    expect(result.disabled).toBe(false);
    expect(result.hasOutOfRange).toBe(false);
  });

  test('DT-D4 — no bounds → no cells carry data-out-of-range', async ({ page }) => {
    await openWithBounds(page, 'albert-datetime-picker', 'dt-d4', '2026-06-15T12:00:00');

    const count = await page.evaluate(() => {
      const panel = document.querySelector('albert-date-time-picker-panel');
      return panel?.shadowRoot?.querySelectorAll('[data-out-of-range]').length ?? 0;
    });

    expect(count).toBe(0);
  });

  test('DT-N1 — prev disabled when viewing the min-date month', async ({ page }) => {
    await openWithBounds(page, 'albert-datetime-picker', 'dt-n1', '2026-06-15T12:00:00', '2026-06-01');

    const disabled = await page.evaluate(() => {
      const panel = document.querySelector('albert-date-time-picker-panel');
      const prevBtn = panel?.shadowRoot?.querySelector('[aria-label="Previous"]') as HTMLButtonElement;
      return prevBtn?.disabled ?? false;
    });

    expect(disabled).toBe(true);
  });

  test('DT-N2 — prev NOT disabled when one month after min-date', async ({ page }) => {
    await openWithBounds(page, 'albert-datetime-picker', 'dt-n2', '2026-06-15T12:00:00', '2026-05-01');

    const disabled = await page.evaluate(() => {
      const panel = document.querySelector('albert-date-time-picker-panel');
      const prevBtn = panel?.shadowRoot?.querySelector('[aria-label="Previous"]') as HTMLButtonElement;
      return prevBtn?.disabled ?? true;
    });

    expect(disabled).toBe(false);
  });

  test('DT-N3 — next disabled when viewing the max-date month', async ({ page }) => {
    await openWithBounds(
      page,
      'albert-datetime-picker',
      'dt-n3',
      '2026-06-15T12:00:00',
      undefined,
      '2026-06-30',
    );

    const disabled = await page.evaluate(() => {
      const panel = document.querySelector('albert-date-time-picker-panel');
      const nextBtn = panel?.shadowRoot?.querySelector('[aria-label="Next"]') as HTMLButtonElement;
      return nextBtn?.disabled ?? false;
    });

    expect(disabled).toBe(true);
  });

  test('DT-N4 — next NOT disabled when one month before max-date', async ({ page }) => {
    await openWithBounds(
      page,
      'albert-datetime-picker',
      'dt-n4',
      '2026-06-15T12:00:00',
      undefined,
      '2026-07-31',
    );

    const disabled = await page.evaluate(() => {
      const panel = document.querySelector('albert-date-time-picker-panel');
      const nextBtn = panel?.shadowRoot?.querySelector('[aria-label="Next"]') as HTMLButtonElement;
      return nextBtn?.disabled ?? true;
    });

    expect(disabled).toBe(false);
  });
});

test.describe('Date bounds — field attribute passthrough', () => {
  test('F1 — min-date set after field is added to DOM is observed on next open', async ({ page }) => {
    await page.goto('/harness/index.html');

    await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker') as HTMLElement;
      field.setAttribute('value', '2026-06-15');
      field.id = 'f1';
      document.body.appendChild(field);
      await new Promise(r => setTimeout(r, 50));
      field.setAttribute('min-date', '2026-06-10');
      await new Promise(r => setTimeout(r, 50));
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 120));
    });

    const disabled = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const cell = Array.from(panel.shadowRoot?.querySelectorAll('.day-cell') || []).find(
        (el) =>
          (el as HTMLElement).textContent?.trim() === '9' &&
          !(el as HTMLElement).hasAttribute('data-adjacent'),
      ) as HTMLButtonElement | undefined;
      return cell?.disabled ?? false;
    });

    expect(disabled).toBe(true);
  });

  test('F2 — removing min-date clears the constraint on next open', async ({ page }) => {
    await page.goto('/harness/index.html');

    const result = await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker') as HTMLElement;
      field.setAttribute('value', '2026-06-15');
      field.setAttribute('min-date', '2026-06-10');
      field.id = 'f2';
      document.body.appendChild(field);

      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 120));

      const panels1 = document.querySelectorAll('albert-date-picker-panel');
      const panel1 = panels1[panels1.length - 1] as any;
      const findCell = (panel: Element) =>
        Array.from(panel.shadowRoot?.querySelectorAll('.day-cell') || []).find(
          (el) =>
            (el as HTMLElement).textContent?.trim() === '9' &&
            !(el as HTMLElement).hasAttribute('data-adjacent'),
        ) as HTMLButtonElement | undefined;

      const cellBefore = findCell(panel1);
      const disabledBefore = cellBefore?.disabled ?? false;

      if (typeof panel1.close === 'function') {
        panel1.close();
      } else {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      }
      await new Promise(r => setTimeout(r, 80));

      field.removeAttribute('min-date');
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 120));

      const panels2 = document.querySelectorAll('albert-date-picker-panel');
      const panel2 = panels2[panels2.length - 1];
      const cellAfter = findCell(panel2);

      return {
        disabledBefore,
        disabledAfter: cellAfter?.disabled ?? true,
        hasOutOfRangeAfter: cellAfter?.hasAttribute('data-out-of-range') ?? false,
      };
    });

    expect(result.disabledBefore).toBe(true);
    expect(result.disabledAfter).toBe(false);
    expect(result.hasOutOfRangeAfter).toBe(false);
  });

  test('F3 — invalid min-date string is silently ignored', async ({ page }) => {
    await openWithBounds(page, 'albert-date-picker', 'f3', '2026-06-15', 'not-a-date');

    const count = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      return panel.shadowRoot?.querySelectorAll('[data-out-of-range]').length ?? 0;
    });

    expect(count).toBe(0);
  });
});
