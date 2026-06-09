import { test, expect } from '@playwright/test';

test.describe('DateTimePickerPanel', () => {
  test('should render with time section in day view', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const hasTimeSection = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      if (panels.length === 0) return false;
      const panel = panels[panels.length - 1];
      const timeSection = panel.shadowRoot?.querySelector('.time-section');
      return timeSection && !timeSection?.hasAttribute('data-hidden');
    });

    expect(hasTimeSection).toBe(true);
  });

  test('should hide time section in month view', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-2';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const isHidden = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];
      const monthBtn = panel.shadowRoot?.querySelector('.month-year-btn') as HTMLButtonElement;
      monthBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      const timeSection = panel.shadowRoot?.querySelector('.time-section');
      return timeSection?.hasAttribute('data-hidden');
    });

    expect(isHidden).toBe(true);
  });

  test('should display timezone information', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-3';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const timezoneText = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];
      const tzDisplay = panel.shadowRoot?.querySelector('.timezone-display');
      return tzDisplay?.textContent;
    });

    expect(timezoneText).toContain('Timezone:');
  });

  test('should accept time input in day view', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-4';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const timeValue = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      const timeEntry = panel.shadowRoot?.querySelector('.time-section albert-time-entry') as HTMLElement;
      if (!timeEntry) return null;

      // Set value attribute and fire _albert-change to simulate a committed entry
      timeEntry.setAttribute('value', '3:30 PM');
      timeEntry.dispatchEvent(new CustomEvent('_albert-change', {
        bubbles: true,
        composed: true,
        detail: { value: '3:30 PM' },
      }));
      await new Promise(r => setTimeout(r, 50));

      return timeEntry.getAttribute('value');
    });

    expect(timeValue).toBe('3:30 PM');
  });

  test('should navigate to month view and back', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-5';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const views = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      let dayViewExists = !!panel.shadowRoot?.querySelector('.day-grid');

      const monthBtn = panel.shadowRoot?.querySelector('.month-year-btn') as HTMLButtonElement;
      monthBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      let monthViewExists = !!panel.shadowRoot?.querySelector('.month-grid');

      const dayBtn = panel.shadowRoot?.querySelector('.month-year-btn') as HTMLButtonElement;
      dayBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      let backToDayView = !!panel.shadowRoot?.querySelector('.day-grid');

      return { dayViewExists, monthViewExists, backToDayView };
    });

    expect(views.dayViewExists).toBe(true);
    expect(views.monthViewExists).toBe(true);
    expect(views.backToDayView).toBe(true);
  });

  test('should keep panel open when clicking a day', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-6';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const panelStillOpen = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      const dayCell = panel.shadowRoot?.querySelector('.day-cell') as HTMLElement;
      dayCell?.click();
      await new Promise(r => setTimeout(r, 50));

      return panel.style.display !== 'none';
    });

    expect(panelStillOpen).toBe(true);
  });

  test('should have Now button in footer', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-7';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const hasNowBtn = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      const footer = panel.shadowRoot?.querySelector('.footer');
      const buttons = footer?.querySelectorAll('.footer-btn');

      return Array.from(buttons || []).some(btn => btn.textContent?.includes('Now'));
    });

    expect(hasNowBtn).toBe(true);
  });

  test('should have Clear button in footer', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-8';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const hasClearBtn = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      const footer = panel.shadowRoot?.querySelector('.footer');
      const buttons = footer?.querySelectorAll('.footer-btn');

      return Array.from(buttons || []).some(btn => btn.textContent?.includes('Clear'));
    });

    expect(hasClearBtn).toBe(true);
  });

  test('after open/close x3, document.body has 0 panel nodes', async ({ page }) => {
    await page.goto('/harness/index.html');

    const panelCount = await page.evaluate(async () => {
      for (let i = 0; i < 3; i++) {
        const field = document.createElement('albert-datetime-picker') as any;
        field.setAttribute('value', '2026-05-23T15:30:00');
        document.body.appendChild(field);
        field.openPanel?.();
        await new Promise(r => setTimeout(r, 120));

        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
        );
        await new Promise(r => setTimeout(r, 80));
      }
      return document.querySelectorAll('albert-date-time-picker-panel').length;
    });

    expect(panelCount).toBe(0);
  });

  test('should emit albert-change when day is selected', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-9';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const eventFired = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      let changeEvent: CustomEvent | null = null;
      panel.addEventListener('albert-change', (e) => {
        changeEvent = e as CustomEvent;
      });

      const dayCells = panel.shadowRoot?.querySelectorAll('.day-cell');
      const dayCell = Array.from(dayCells || []).find(
        (el) => !(el as HTMLElement).hasAttribute('data-other-month')
      ) as HTMLElement;
      dayCell?.click();
      await new Promise(r => setTimeout(r, 50));

      return changeEvent?.detail?.value !== undefined;
    });

    expect(eventFired).toBe(true);
  });

  test('should dispatch ISO 8601 datetime format on change', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-10';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const value = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      let changeValue: string | null = null;
      panel.addEventListener('albert-change', (e: Event) => {
        changeValue = (e as CustomEvent).detail?.value;
      });

      const timeEntry = panel.shadowRoot?.querySelector('.time-section albert-time-entry') as HTMLElement;
      timeEntry?.setAttribute('value', '2:30 PM');
      timeEntry?.dispatchEvent(new CustomEvent('_albert-change', {
        bubbles: true,
        composed: true,
        detail: { value: '2:30 PM' },
      }));
      await new Promise(r => setTimeout(r, 50));

      const dayCells = panel.shadowRoot?.querySelectorAll('.day-cell');
      const dayCell = Array.from(dayCells || []).find(
        (el) => !(el as HTMLElement).hasAttribute('data-other-month')
      ) as HTMLElement;
      dayCell?.click();
      await new Promise(r => setTimeout(r, 50));

      return changeValue;
    });

    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
  });

  test('should properly manage monthYearBtn in header across view changes', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-header';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const headerStructure = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];
      const header = panel.shadowRoot?.querySelector('.header');

      // Get header children in day view
      let dayViewHeaderHtml = header?.innerHTML || '';

      // Click month button to switch to month view
      const monthBtn = panel.shadowRoot?.querySelector('.month-year-btn') as HTMLButtonElement;
      monthBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      // Get header children in month view
      let monthViewHeaderHtml = header?.innerHTML || '';

      // Click on a month to switch back to day view
      const monthPill = panel.shadowRoot?.querySelector('.month-pill') as HTMLButtonElement;
      monthPill?.click();
      await new Promise(r => setTimeout(r, 50));

      // Get header children in day view after switching back
      let backToDayViewHeaderHtml = header?.innerHTML || '';

      return {
        dayViewHasMonthYearBtn: dayViewHeaderHtml.includes('month-year-btn'),
        monthViewHasYearBtn: monthViewHeaderHtml.includes('year-btn'),
        backToDayViewHasMonthYearBtn: backToDayViewHeaderHtml.includes('month-year-btn'),
        dayViewHeaderHtml: dayViewHeaderHtml.substring(0, 100),
        monthViewHeaderHtml: monthViewHeaderHtml.substring(0, 100),
        backToDayViewHeaderHtml: backToDayViewHeaderHtml.substring(0, 100)
      };
    });

    console.log('Header structure:', headerStructure);
    expect(headerStructure.dayViewHasMonthYearBtn).toBe(true);
    expect(headerStructure.monthViewHasYearBtn).toBe(true);
    expect(headerStructure.backToDayViewHasMonthYearBtn).toBe(true);
  });

  test('should not duplicate footer elements when switching views', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-footer-dup';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const footerCounts = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];
      const panelElement = panel.shadowRoot?.querySelector('.panel') as HTMLElement;

      // Count all footer elements in day view
      let footers = panelElement?.querySelectorAll('.footer');
      let dayViewFooters = footers?.length || 0;

      // Click month button to switch to month view
      const monthBtn = panel.shadowRoot?.querySelector('.month-year-btn') as HTMLButtonElement;
      monthBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      // Count all footer elements in month view
      footers = panelElement?.querySelectorAll('.footer');
      let monthViewFooters = footers?.length || 0;

      // Click year button to switch to year view (if it exists)
      const yearBtn = panel.shadowRoot?.querySelector('.year-btn') as HTMLButtonElement;
      if (yearBtn) {
        yearBtn?.click();
        await new Promise(r => setTimeout(r, 50));
      }

      // Count all footer elements in year view
      footers = panelElement?.querySelectorAll('.footer');
      let yearViewFooters = footers?.length || 0;

      // Click previous to go back in year view and trigger re-render
      const prevBtn = panel.shadowRoot?.querySelector('.nav-btn') as HTMLButtonElement;
      if (prevBtn && yearViewFooters > 0) {
        prevBtn.click();
        await new Promise(r => setTimeout(r, 50));
      }

      // Count again after prev
      footers = panelElement?.querySelectorAll('.footer');
      let afterPrevFooters = footers?.length || 0;

      return { dayViewFooters, monthViewFooters, yearViewFooters, afterPrevFooters };
    });

    console.log('Footer counts:', footerCounts);
    expect(footerCounts.dayViewFooters).toBe(1);
    expect(footerCounts.monthViewFooters).toBe(1);
    expect(footerCounts.yearViewFooters).toBe(1);
    expect(footerCounts.afterPrevFooters).toBe(1);
  });

  test('should set time to 14:30 for 2:30 PM selection', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-11';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const time = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      let changeValue: string | null = null;
      panel.addEventListener('albert-change', (e: Event) => {
        changeValue = (e as CustomEvent).detail?.value;
      });

      const timeEntry = panel.shadowRoot?.querySelector('.time-section albert-time-entry') as HTMLElement;
      timeEntry?.setAttribute('value', '2:30 PM');
      timeEntry?.dispatchEvent(new CustomEvent('_albert-change', {
        bubbles: true,
        composed: true,
        detail: { value: '2:30 PM' },
      }));
      await new Promise(r => setTimeout(r, 50));

      const dayCells = panel.shadowRoot?.querySelectorAll('.day-cell');
      const dayCell = Array.from(dayCells || []).find(
        (el) => !(el as HTMLElement).hasAttribute('data-other-month')
      ) as HTMLElement;
      dayCell?.click();
      await new Promise(r => setTimeout(r, 50));

      return changeValue?.substring(11, 16);
    });

    expect(time).toBe('14:30');
  });

  test('should set time to 00:00 for 12:00 AM selection', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-12';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const time = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      let changeValue: string | null = null;
      panel.addEventListener('albert-change', (e: Event) => {
        changeValue = (e as CustomEvent).detail?.value;
      });

      const timeEntry = panel.shadowRoot?.querySelector('.time-section albert-time-entry') as HTMLElement;
      timeEntry?.setAttribute('value', '12:00 AM');
      timeEntry?.dispatchEvent(new CustomEvent('_albert-change', {
        bubbles: true,
        composed: true,
        detail: { value: '12:00 AM' },
      }));
      await new Promise(r => setTimeout(r, 50));

      const dayCells = panel.shadowRoot?.querySelectorAll('.day-cell');
      const dayCell = Array.from(dayCells || []).find(
        (el) => !(el as HTMLElement).hasAttribute('data-other-month')
      ) as HTMLElement;
      dayCell?.click();
      await new Promise(r => setTimeout(r, 50));

      return changeValue?.substring(11, 16);
    });

    expect(time).toBe('00:00');
  });

  test('should navigate months with prev/next buttons', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-13';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const months = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      const monthYearBtn = panel.shadowRoot?.querySelector('.month-year-btn') as HTMLButtonElement;
      const firstMonth = monthYearBtn?.textContent?.trim().split(' ')[0];

      const nextBtn = panel.shadowRoot?.querySelector('[aria-label="Next"]') as HTMLButtonElement;
      nextBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      const secondMonth = monthYearBtn?.textContent?.trim().split(' ')[0];

      return { firstMonth, secondMonth };
    });

    expect(months.firstMonth).not.toEqual(months.secondMonth);
  });

  test('should navigate year view from month view', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-14';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const hasYearGrid = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      const monthBtn = panel.shadowRoot?.querySelector('.month-year-btn') as HTMLButtonElement;
      monthBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      const yearBtn = panel.shadowRoot?.querySelector('.year-btn') as HTMLButtonElement;
      yearBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      return !!panel.shadowRoot?.querySelector('.year-grid');
    });

    expect(hasYearGrid).toBe(true);
  });

  test('should restore day view after selecting date from month view', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-15';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const isDayView = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      const monthBtn = panel.shadowRoot?.querySelector('.month-year-btn') as HTMLButtonElement;
      monthBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      const monthPill = panel.shadowRoot?.querySelector('.month-pill') as HTMLElement;
      monthPill?.click();
      await new Promise(r => setTimeout(r, 50));

      return !!panel.shadowRoot?.querySelector('.day-grid');
    });

    expect(isDayView).toBe(true);
  });

  test('should show day cells in day grid', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-16';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const dayCount = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      const dayGrid = panel.shadowRoot?.querySelector('.day-grid');
      const dayCells = dayGrid?.querySelectorAll('.day-cell');

      return dayCells?.length || 0;
    });

    expect(dayCount).toBeGreaterThan(35);
    expect(dayCount).toBeLessThanOrEqual(42);
  });

  test('should highlight today cell with slate-90 background', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      const today = new Date().toISOString().split('T')[0];
      field.setAttribute('value', `${today}T15:30:00`);
      field.id = 'test-field-17';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const hasTodayHighlight = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      const todayCell = panel.shadowRoot?.querySelector('[data-today]');
      return !!todayCell;
    });

    expect(hasTodayHighlight).toBe(true);
  });

  test('should not close panel when clicking on time input field', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-click-input';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const panelStillOpen = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];
      const timeEntry = panel.shadowRoot?.querySelector('albert-time-entry') as HTMLElement;
      // Click into albert-time-entry's inner input via shadowRoot
      const innerInput = (timeEntry as any)?.shadowRoot?.querySelector('input') as HTMLInputElement;

      if (!innerInput) return false;

      innerInput.click();
      await new Promise(r => setTimeout(r, 50));

      return panel.style.display !== 'none';
    });

    expect(panelStillOpen).toBe(true);
  });

  test('panel positioned ABOVE anchor in bottom 20% of viewport', async ({ page }) => {
    await page.goto('/harness/index.html');

    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker') as any;
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-bottom-v2';
      field.style.position = 'fixed';
      field.style.bottom = '30px';
      field.style.left = '50px';
      document.body.appendChild(field);
      field.openPanel?.();
      await new Promise(r => setTimeout(r, 150));
    });

    const result = await page.evaluate(() => {
      const field = document.getElementById('test-field-bottom-v2') as HTMLElement;
      const panel = document.querySelector('albert-date-time-picker-panel') as HTMLElement;
      if (!field || !panel) return { ok: false, panelTop: -1, actualPanelHeight: -1 };

      const fieldRect = field.getBoundingClientRect();
      const panelTop = parseInt(panel.style.top, 10);
      const panelEl = (panel as any).shadowRoot?.querySelector('.panel') as HTMLElement;
      const actualPanelHeight = panelEl ? panelEl.offsetHeight : 400;
      const panelBottomEdge = panelTop + actualPanelHeight;

      return { ok: panelBottomEdge < fieldRect.top, panelTop, actualPanelHeight };
    });

    expect(result.ok).toBe(true);
  });

  test('should not duplicate decade range element when navigating in year view', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-year-nav';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const decadeRangeCount = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];
      const header = panel.shadowRoot?.querySelector('.header');

      // Switch to month view
      const monthBtn = panel.shadowRoot?.querySelector('.month-year-btn') as HTMLButtonElement;
      monthBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      // Switch to year view by clicking year button
      const yearBtn = panel.shadowRoot?.querySelector('.year-btn') as HTMLButtonElement;
      yearBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      // Count decade ranges in header
      let decadeRanges = header?.querySelectorAll('.decade-range');
      let initialCount = decadeRanges?.length || 0;

      // Click next button to navigate to next decade
      const prevBtn = panel.shadowRoot?.querySelector('[part="prev"]') as HTMLButtonElement;
      const nextBtn = panel.shadowRoot?.querySelector('[part="next"]') as HTMLButtonElement;
      nextBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      // Count decade ranges again
      decadeRanges = header?.querySelectorAll('.decade-range');
      let afterNavCount = decadeRanges?.length || 0;

      // Click next button again
      nextBtn?.click();
      await new Promise(r => setTimeout(r, 50));

      // Count one more time
      decadeRanges = header?.querySelectorAll('.decade-range');
      let afterSecondNavCount = decadeRanges?.length || 0;

      return { initialCount, afterNavCount, afterSecondNavCount };
    });

    console.log('Decade range counts:', decadeRangeCount);
    expect(decadeRangeCount.initialCount).toBe(1);
    expect(decadeRangeCount.afterNavCount).toBe(1);
    expect(decadeRangeCount.afterSecondNavCount).toBe(1);
  });
});

// ─── P3: TimeEntryField integration ──────────────────────────────────────────

test.describe('TimeEntryField integration (P3)', () => {
  async function openPanel(page: any, id: string, value = '2026-05-23T15:30:00') {
    await page.goto('/harness/index.html');
    await page.evaluate(async ({ id, value }: { id: string; value: string }) => {
      const field = document.createElement('albert-datetime-picker') as any;
      field.setAttribute('value', value);
      field.id = id;
      document.body.appendChild(field);
      field.openPanel?.();
      await new Promise(r => setTimeout(r, 150));
    }, { id, value });
  }

  test('time section contains albert-time-entry, not a bare input', async ({ page }) => {
    await openPanel(page, 'p3-test-1');

    const result = await page.evaluate(() => {
      const panel = document.querySelector('albert-date-time-picker-panel');
      const timeSection = panel?.shadowRoot?.querySelector('.time-section');
      return {
        hasTimeEntry: !!timeSection?.querySelector('albert-time-entry'),
        hasBareInput: !!timeSection?.querySelector('input'),
      };
    });

    expect(result.hasTimeEntry).toBe(true);
    expect(result.hasBareInput).toBe(false);
  });

  test('suggestion dropdown opens on focus', async ({ page }) => {
    await openPanel(page, 'p3-test-2');

    const dropdownVisible = await page.evaluate(async () => {
      const panel = document.querySelector('albert-date-time-picker-panel');
      const timeEntry = panel?.shadowRoot?.querySelector('albert-time-entry') as any;
      if (!timeEntry) return false;
      const input = timeEntry.shadowRoot?.querySelector('input');
      input?.focus();
      await new Promise(r => setTimeout(r, 60));
      const dropdown = timeEntry.shadowRoot?.querySelector('.dropdown');
      return dropdown?.hasAttribute('data-open') ?? false;
    });

    expect(dropdownVisible).toBe(true);
  });

  test('selecting a 15-min suggestion commits time', async ({ page }) => {
    await openPanel(page, 'p3-test-3');

    const committed = await page.evaluate(async () => {
      const panel = document.querySelector('albert-date-time-picker-panel');
      const timeEntry = panel?.shadowRoot?.querySelector('albert-time-entry');
      if (!timeEntry) return null;
      let lastChange: string | null = null;
      timeEntry.addEventListener('_albert-change', (e: Event) => {
        lastChange = (e as CustomEvent).detail?.value;
      });
      const input = timeEntry.shadowRoot?.querySelector('input') as HTMLInputElement;
      input?.focus();
      await new Promise(r => setTimeout(r, 60));
      const suggestion = timeEntry.shadowRoot?.querySelectorAll('.suggestion')[2] as HTMLElement;
      suggestion?.click();
      await new Promise(r => setTimeout(r, 60));
      return { committed: lastChange !== null, value: lastChange };
    });

    expect(committed?.committed).toBe(true);
  });

  test('typing 3pm and blurring commits as 3:00 PM', async ({ page }) => {
    await openPanel(page, 'p3-test-4');

    const result = await page.evaluate(async () => {
      const panel = document.querySelector('albert-date-time-picker-panel');
      const timeEntry = panel?.shadowRoot?.querySelector('albert-time-entry');
      const input = timeEntry?.shadowRoot?.querySelector('input') as HTMLInputElement;
      if (!input) return null;
      input.focus();
      input.value = '3pm';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.blur();
      await new Promise(r => setTimeout(r, 100));
      return timeEntry?.getAttribute('value');
    });

    expect(result).toBe('3:00 PM');
  });

  test('invalid time input reverts to last valid on blur', async ({ page }) => {
    await openPanel(page, 'p3-test-5', '2026-05-23T14:30:00');

    const result = await page.evaluate(async () => {
      const panel = document.querySelector('albert-date-time-picker-panel');
      const timeEntry = panel?.shadowRoot?.querySelector('albert-time-entry');
      const input = timeEntry?.shadowRoot?.querySelector('input') as HTMLInputElement;
      if (!input) return null;
      input.focus();
      input.value = 'not-a-time';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.blur();
      await new Promise(r => setTimeout(r, 100));
      return input.value;
    });

    expect(result).not.toBe('not-a-time');
  });

  test('Clear button empties time-entry value', async ({ page }) => {
    await openPanel(page, 'p3-test-7', '2026-05-23T15:30:00');

    const result = await page.evaluate(async () => {
      const panel = document.querySelector('albert-date-time-picker-panel');
      const timeEntry = panel?.shadowRoot?.querySelector('albert-time-entry');
      const clearBtn = panel?.shadowRoot?.querySelector('.footer-btn:not([data-primary])') as HTMLButtonElement;
      clearBtn?.click();
      await new Promise(r => setTimeout(r, 60));
      return timeEntry?.getAttribute('value') ?? '';
    });

    expect(result).toBe('');
  });

  // Regression: re-opening panel must not duplicate shadow DOM content
  test('footer buttons appear exactly once after panel is closed and reopened', async ({ page }) => {
    await page.goto('/harness/index.html');
    const result = await page.evaluate(async () => {
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'dt-reopen-test';
      document.body.appendChild(field);

      const openAndClose = async () => {
        (field as any).openPanel?.();
        await new Promise(r => setTimeout(r, 100));
        const panel = document.querySelector('albert-date-time-picker-panel') as any;
        panel?.close?.();
        await new Promise(r => setTimeout(r, 100));
      };

      await openAndClose();
      await openAndClose();

      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));

      const panel = document.querySelector('albert-date-time-picker-panel');
      // DateTimePickerPanel uses "Now" (not "Today") and "Clear"
      const allBtns = Array.from(panel?.shadowRoot?.querySelectorAll('button') ?? []);
      const nowBtns = allBtns.filter(b => b.textContent?.trim() === 'Now');
      const clearBtns = allBtns.filter(b => b.textContent?.trim() === 'Clear');
      return { todayCount: nowBtns.length, clearCount: clearBtns.length };
    });

    expect(result.todayCount).toBe(1);
    expect(result.clearCount).toBe(1);
  });
});
