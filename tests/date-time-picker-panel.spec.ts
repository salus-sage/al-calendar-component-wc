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

      const timeInput = panel.shadowRoot?.querySelector('.time-section input') as HTMLInputElement;
      if (!timeInput) return null;
      timeInput.value = '3:30pm';
      timeInput.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 50));

      return timeInput.value;
    });

    expect(timeValue).toBe('3:30pm');
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

  test('should emit _albert-change when day is selected', async ({ page }) => {
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
      panel.addEventListener('_albert-change', (e) => {
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
      panel.addEventListener('_albert-change', (e: Event) => {
        changeValue = (e as CustomEvent).detail?.value;
      });

      const timeInput = panel.shadowRoot?.querySelector('.time-section input') as HTMLInputElement;
      timeInput.value = '2:30pm';
      timeInput.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 50));

      const dayCells = panel.shadowRoot?.querySelectorAll('.day-cell');
      const dayCell = Array.from(dayCells || []).find(
        (el) => !(el as HTMLElement).hasAttribute('data-other-month')
      ) as HTMLElement;
      dayCell?.click();
      await new Promise(r => setTimeout(r, 50));

      return changeValue;
    });

    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
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
      panel.addEventListener('_albert-change', (e: Event) => {
        changeValue = (e as CustomEvent).detail?.value;
      });

      const timeInput = panel.shadowRoot?.querySelector('.time-section input') as HTMLInputElement;
      timeInput.value = '2:30pm';
      timeInput.dispatchEvent(new Event('input', { bubbles: true }));
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
      panel.addEventListener('_albert-change', (e: Event) => {
        changeValue = (e as CustomEvent).detail?.value;
      });

      const timeInput = panel.shadowRoot?.querySelector('.time-section input') as HTMLInputElement;
      timeInput.value = '12:00am';
      timeInput.dispatchEvent(new Event('input', { bubbles: true }));
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
      const timeInput = panel.shadowRoot?.querySelector('input[type="text"]') as HTMLInputElement;

      if (!timeInput) return false;

      // Click on the time input
      timeInput.click();
      await new Promise(r => setTimeout(r, 50));

      // Check if panel is still visible (for fixed positioned elements, offsetParent may be null)
      return panel.style.display !== 'none';
    });

    expect(panelStillOpen).toBe(true);
  });

  test('should position panel above field when there is not enough space below', async ({ page }) => {
    await page.goto('/harness/index.html');

    // Scroll to bottom and create field near bottom
    await page.evaluate(async () => {
      // Create a field near the bottom of the viewport
      const field = document.createElement('albert-datetime-picker');
      field.setAttribute('value', '2026-05-23T15:30:00');
      field.id = 'test-field-bottom';
      field.style.position = 'fixed';
      field.style.bottom = '50px';
      field.style.left = '50px';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
    });

    const positionIsAbove = await page.evaluate(async () => {
      const field = document.getElementById('test-field-bottom') as any;
      const panels = document.querySelectorAll('albert-date-time-picker-panel');
      const panel = panels[panels.length - 1];

      if (!field || !panel) return false;

      const fieldRect = field.getBoundingClientRect();
      const panelTop = parseInt(panel.style.top);

      // Panel should be positioned above the field (panel top + height < field top)
      // For a ~400px panel, if field is at bottom 50px, panel top should be negative or small
      // The key test: panel's bottom edge should be above field's top edge
      return panelTop + 400 < fieldRect.top || panelTop < fieldRect.top;
    });

    expect(positionIsAbove).toBe(true);
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
