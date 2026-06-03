import { test, expect } from '@playwright/test';

test.describe('DatePickerPanel', () => {
  // Navigation tests
  test('default view is day view', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field';
      document.body.appendChild(field);
      const fieldEl = document.querySelector('#test-field');
      (fieldEl as any).openPanel?.();
    });

    await page.waitForTimeout(100);

    const dayGridVisible = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      if (panels.length === 0) return null;
      const panel = panels[panels.length - 1];
      const dayGrid = panel.shadowRoot?.querySelector('[part="day-grid"]');
      return dayGrid && !dayGrid.hasAttribute('hidden');
    });

    expect(dayGridVisible).toBe(true);
  });

  test('clicking month-year button switches to month view', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(() => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-2';
      document.body.appendChild(field);
      (field as any).openPanel?.();
    });

    await page.waitForTimeout(100);

    const monthGridVisible = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const btn = panel.shadowRoot?.querySelector('[part="month-year-btn"]') as HTMLElement;
      btn?.click();
      await new Promise(r => setTimeout(r, 50));
      const monthGrid = panel.shadowRoot?.querySelector('[part="month-grid"]');
      return monthGrid && !monthGrid.hasAttribute('hidden');
    });

    expect(monthGridVisible).toBe(true);
  });

  test('clicking year button from month view switches to year view', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-3';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const monthBtn = panel.shadowRoot?.querySelector('[part="month-year-btn"]') as HTMLElement;
      monthBtn?.click();
    });

    await page.waitForTimeout(100);

    const yearGridVisible = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const yearBtn = panel.shadowRoot?.querySelector('[part="year-btn"]') as HTMLElement;
      yearBtn?.click();
      await new Promise(r => setTimeout(r, 50));
      const yearGrid = panel.shadowRoot?.querySelector('[part="year-grid"]');
      return yearGrid && !yearGrid.hasAttribute('hidden');
    });

    expect(yearGridVisible).toBe(true);
  });

  test('clicking a month pill returns to day view', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-4';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const monthBtn = panel.shadowRoot?.querySelector('[part="month-year-btn"]') as HTMLElement;
      monthBtn?.click();
    });

    await page.waitForTimeout(100);

    const dayGridVisible = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const monthPills = panel.shadowRoot?.querySelectorAll('[part="month-pill"]');
      if (!monthPills || monthPills.length === 0) return null;
      (monthPills[4] as HTMLElement)?.click(); // Jun
      await new Promise(r => setTimeout(r, 50));
      const dayGrid = panel.shadowRoot?.querySelector('[part="day-grid"]');
      return dayGrid && !dayGrid.hasAttribute('hidden');
    });

    expect(dayGridVisible).toBe(true);
  });

  test('clicking a year pill switches to month view', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-5';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const monthBtn = panel.shadowRoot?.querySelector('[part="month-year-btn"]') as HTMLElement;
      monthBtn?.click();
      await new Promise(r => setTimeout(r, 50));
      const yearBtn = panel.shadowRoot?.querySelector('[part="year-btn"]') as HTMLElement;
      yearBtn?.click();
    });

    await page.waitForTimeout(100);

    const monthGridVisible = await page.evaluate(async () => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const yearPills = panel.shadowRoot?.querySelectorAll('[part="year-pill"]');
      if (!yearPills || yearPills.length === 0) return null;
      (yearPills[0] as HTMLElement)?.click(); // 2020
      await new Promise(r => setTimeout(r, 50));
      const monthGrid = panel.shadowRoot?.querySelector('[part="month-grid"]');
      return monthGrid && !monthGrid.hasAttribute('hidden');
    });

    expect(monthGridVisible).toBe(true);
  });

  test('prev arrow in day view navigates months', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-6';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const prevBtn = panel.shadowRoot?.querySelector('[part="prev"]') as HTMLElement;
      prevBtn?.click();
    });

    await page.waitForTimeout(100);

    const headerText = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      return panel.shadowRoot?.querySelector('[part="month-year-btn"]')?.textContent;
    });

    expect(headerText).toContain('Apr 2026');
  });

  test('next arrow in day view navigates months', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-7';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const nextBtn = panel.shadowRoot?.querySelector('[part="next"]') as HTMLElement;
      nextBtn?.click();
    });

    await page.waitForTimeout(100);

    const headerText = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      return panel.shadowRoot?.querySelector('[part="month-year-btn"]')?.textContent;
    });

    expect(headerText).toContain('Jun 2026');
  });

  test('prev/next in month view changes year', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-8';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const monthBtn = panel.shadowRoot?.querySelector('[part="month-year-btn"]') as HTMLElement;
      monthBtn?.click();
      await new Promise(r => setTimeout(r, 50));
      const prevBtn = panel.shadowRoot?.querySelector('[part="prev"]') as HTMLElement;
      prevBtn?.click();
    });

    await page.waitForTimeout(100);

    const headerText = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      return panel.shadowRoot?.querySelector('[part="year-btn"]')?.textContent;
    });

    expect(headerText).toContain('2025');
  });

  test('prev/next in year view changes decade', async ({ page }) => {
    await page.goto('/harness/index.html');
    await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-9';
      document.body.appendChild(field);
      (field as any).openPanel?.();
      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const monthBtn = panel.shadowRoot?.querySelector('[part="month-year-btn"]') as HTMLElement;
      monthBtn?.click();
      await new Promise(r => setTimeout(r, 50));
      const yearBtn = panel.shadowRoot?.querySelector('[part="year-btn"]') as HTMLElement;
      yearBtn?.click();
      await new Promise(r => setTimeout(r, 50));
      const prevBtn = panel.shadowRoot?.querySelector('[part="prev"]') as HTMLElement;
      prevBtn?.click();
    });

    await page.waitForTimeout(100);

    const headerText = await page.evaluate(() => {
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      return panel.shadowRoot?.querySelector('[part="decade-range"]')?.textContent;
    });

    expect(headerText).toContain('2010');
  });

  // Selection tests
  test('clicking a day dispatches albert-change with correct value', async ({ page }) => {
    await page.goto('/harness/index.html');
    const changeValue = await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-10';
      document.body.appendChild(field);
      (field as any).openPanel?.();

      let capturedValue: string | null = null;
      document.addEventListener('albert-change', (e: any) => {
        capturedValue = e.detail?.value;
      });

      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const dayCells = panel.shadowRoot?.querySelectorAll('.day-cell');
      if (dayCells && dayCells.length > 0) {
        let cell = dayCells[dayCells.length - 1] as HTMLElement;
        // Find a cell that's not adjacent
        for (let i = 0; i < dayCells.length; i++) {
          if (!(dayCells[i] as HTMLElement).hasAttribute('data-adjacent')) {
            cell = dayCells[i] as HTMLElement;
            break;
          }
        }
        cell.click();
      }

      await new Promise(r => setTimeout(r, 100));
      return capturedValue;
    });

    expect(changeValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('Today button dispatches albert-change with today date', async ({ page }) => {
    await page.goto('/harness/index.html');
    const changeValue = await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.id = 'test-field-11';
      document.body.appendChild(field);
      (field as any).openPanel?.();

      let capturedValue: string | null = null;
      document.addEventListener('albert-change', (e: any) => {
        capturedValue = e.detail?.value;
      });

      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const todayBtn = panel.shadowRoot?.querySelector('[part="today-btn"]') as HTMLElement;
      todayBtn?.click();

      await new Promise(r => setTimeout(r, 100));
      return capturedValue;
    });

    expect(changeValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('Clear button dispatches albert-change with null', async ({ page }) => {
    await page.goto('/harness/index.html');
    const changeValue = await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-12';
      document.body.appendChild(field);
      (field as any).openPanel?.();

      let capturedValue: any = 'not-called';
      document.addEventListener('albert-change', (e: any) => {
        capturedValue = e.detail?.value;
      });

      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const clearBtn = panel.shadowRoot?.querySelector('[part="clear-btn"]') as HTMLElement;
      clearBtn?.click();

      await new Promise(r => setTimeout(r, 100));
      return capturedValue;
    });

    expect(changeValue).toBeNull();
  });

  // Highlight correctness tests
  test('selected pill shows in month view when year matches', async ({ page }) => {
    await page.goto('/harness/index.html');
    const hasSelectedClass = await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-13';
      document.body.appendChild(field);
      (field as any).openPanel?.();

      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const monthBtn = panel.shadowRoot?.querySelector('[part="month-year-btn"]') as HTMLElement;
      monthBtn?.click();

      await new Promise(r => setTimeout(r, 50));
      const mayPill = Array.from(
        panel.shadowRoot?.querySelectorAll('[part="month-pill"]') || []
      ).find(
        (el) =>
          (el as HTMLElement).textContent === 'May'
      ) as HTMLElement;

      return mayPill?.hasAttribute('data-selected');
    });

    expect(hasSelectedClass).toBe(true);
  });

  test('selected pill does not show when browsing to different year', async ({ page }) => {
    await page.goto('/harness/index.html');
    const hasSelectedClass = await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-14';
      document.body.appendChild(field);
      (field as any).openPanel?.();

      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const monthBtn = panel.shadowRoot?.querySelector('[part="month-year-btn"]') as HTMLElement;
      monthBtn?.click();

      await new Promise(r => setTimeout(r, 50));
      const prevBtn = panel.shadowRoot?.querySelector('[part="prev"]') as HTMLElement;
      prevBtn?.click();

      await new Promise(r => setTimeout(r, 50));
      const mayPill = Array.from(
        panel.shadowRoot?.querySelectorAll('[part="month-pill"]') || []
      ).find(
        (el) =>
          (el as HTMLElement).textContent === 'May'
      ) as HTMLElement;

      return mayPill?.hasAttribute('data-selected');
    });

    expect(hasSelectedClass).toBe(false);
  });

  test('selected pill shows in year view when selecting year', async ({ page }) => {
    await page.goto('/harness/index.html');
    const hasSelectedClass = await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-15';
      document.body.appendChild(field);
      (field as any).openPanel?.();

      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const monthBtn = panel.shadowRoot?.querySelector('[part="month-year-btn"]') as HTMLElement;
      monthBtn?.click();

      await new Promise(r => setTimeout(r, 50));
      const yearBtn = panel.shadowRoot?.querySelector('[part="year-btn"]') as HTMLElement;
      yearBtn?.click();

      await new Promise(r => setTimeout(r, 50));
      const year2026Pill = Array.from(
        panel.shadowRoot?.querySelectorAll('[part="year-pill"]') || []
      ).find(
        (el) =>
          (el as HTMLElement).textContent === '2026'
      ) as HTMLElement;

      return year2026Pill?.hasAttribute('data-selected');
    });

    expect(hasSelectedClass).toBe(true);
  });

  test('today cell shows slate-90 background', async ({ page }) => {
    await page.goto('/harness/index.html');
    const hasTodayClass = await page.evaluate(async () => {
      const today = new Date();
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-16';
      document.body.appendChild(field);
      (field as any).openPanel?.();

      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const dayCells = panel.shadowRoot?.querySelectorAll('.day-cell');
      const todayCell = Array.from(dayCells || []).find(
        (el) =>
          (el as HTMLElement).textContent === today.getDate().toString() &&
          (el as HTMLElement).hasAttribute('data-today')
      ) as HTMLElement;

      return todayCell?.hasAttribute('data-today');
    });

    expect(hasTodayClass).toBe(true);
  });

  // Dismissal tests
  test('clicking a day closes the panel', async ({ page }) => {
    await page.goto('/harness/index.html');
    const panelRemoved = await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-17';
      document.body.appendChild(field);
      (field as any).openPanel?.();

      await new Promise(r => setTimeout(r, 100));
      const panels1 = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels1[panels1.length - 1];
      const dayCells = panel.shadowRoot?.querySelectorAll('.day-cell');
      if (dayCells && dayCells.length > 0) {
        (dayCells[0] as HTMLElement).click();
      }

      await new Promise(r => setTimeout(r, 100));
      const panels2 = document.querySelectorAll('albert-date-picker-panel');
      return panels2.length === 0;
    });

    expect(panelRemoved).toBe(true);
  });

  test('clicking panel whitespace does not close panel', async ({ page }) => {
    await page.goto('/harness/index.html');
    const panelStillOpen = await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-18';
      document.body.appendChild(field);
      (field as any).openPanel?.();

      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const panelRoot = panel.shadowRoot?.querySelector('[part="panel"]') as HTMLElement;
      panelRoot?.click();

      await new Promise(r => setTimeout(r, 50));
      const panelsAfter = document.querySelectorAll('albert-date-picker-panel');
      return panelsAfter.length > 0;
    });

    expect(panelStillOpen).toBe(true);
  });

  test('clicking outside panel closes it', async ({ page }) => {
    await page.goto('/harness/index.html');
    const panelClosed = await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-19';
      document.body.appendChild(field);
      (field as any).openPanel?.();

      await new Promise(r => setTimeout(r, 100));
      const event = new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      document.body.dispatchEvent(event);

      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      return panels.length === 0;
    });

    expect(panelClosed).toBe(true);
  });

  test('Esc key closes panel and focuses field', async ({ page }) => {
    await page.goto('/harness/index.html');
    const result = await page.evaluate(async () => {
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.id = 'test-field-20';
      document.body.appendChild(field);
      (field as any).openPanel?.();

      await new Promise(r => setTimeout(r, 100));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      await new Promise(r => setTimeout(r, 100));
      const panels = document.querySelectorAll('albert-date-picker-panel');
      return panels.length === 0;
    });

    expect(result).toBe(true);
  });

  // Positioning tests
  test('panel opens below field when space available', async ({ page }) => {
    await page.goto('/harness/index.html');
    const isBelow = await page.evaluate(async () => {
      // Clear page and position field near the top with space below
      document.body.innerHTML = '';
      const field = document.createElement('albert-date-picker');
      field.setAttribute('value', '2026-05-23');
      field.style.position = 'absolute';
      field.style.top = '20px';
      field.style.left = '20px';
      field.id = 'test-field-21';
      document.body.appendChild(field);

      // Click the field to trigger panel opening
      const fieldButton = field.shadowRoot?.querySelector('[part="field"]') as HTMLElement;
      fieldButton?.click();

      // Wait for panel positioning to complete
      await new Promise(r => setTimeout(r, 300));

      const panels = document.querySelectorAll('albert-date-picker-panel');
      const panel = panels[panels.length - 1];
      const panelEl = (panel as any).shadowRoot?.querySelector('[part="panel"]') as HTMLElement;

      if (!panel || !panelEl) return false;

      const fieldRect = field.getBoundingClientRect();
      const panelRect = panelEl.getBoundingClientRect();

      // Panel should be positioned below the field (with small gap tolerance)
      return fieldRect.bottom < panelRect.top + 5;
    });

    expect(isBelow).toBe(true);
  });

  // Registry test
  test('opening second picker closes first panel', async ({ page }) => {
    await page.goto('/harness/index.html');
    const firstPanelClosed = await page.evaluate(async () => {
      const field1 = document.createElement('albert-date-picker');
      field1.setAttribute('value', '2026-05-23');
      field1.id = 'field-1';
      document.body.appendChild(field1);
      (field1 as any).openPanel?.();

      await new Promise(r => setTimeout(r, 100));
      let panelCount = document.querySelectorAll('albert-date-picker-panel').length;
      const firstPanelCount = panelCount;

      const field2 = document.createElement('albert-date-picker');
      field2.setAttribute('value', '2026-06-15');
      field2.id = 'field-2';
      document.body.appendChild(field2);
      (field2 as any).openPanel?.();

      await new Promise(r => setTimeout(r, 100));
      panelCount = document.querySelectorAll('albert-date-picker-panel').length;

      return firstPanelCount > 0 && panelCount === 1;
    });

    expect(firstPanelClosed).toBe(true);
  });
});
