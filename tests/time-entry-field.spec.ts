import { test, expect } from '@playwright/test';

test.describe('TimeEntryField', () => {
  test('should render with default placeholder', async ({ page }) => {
    await page.goto('/harness/index.html');
    const placeholder = await page.evaluate(() => {
      const field = document.createElement('albert-time-entry');
      document.body.appendChild(field);
      const input = field.shadowRoot?.querySelector('input') as HTMLInputElement;
      return input?.placeholder;
    });

    expect(placeholder).toBe('Enter time');
  });

  test('should use custom placeholder', async ({ page }) => {
    await page.goto('/harness/index.html');
    const placeholder = await page.evaluate(() => {
      const field = document.createElement('albert-time-entry');
      field.setAttribute('placeholder', 'What time?');
      document.body.appendChild(field);
      const input = field.shadowRoot?.querySelector('input') as HTMLInputElement;
      return input?.placeholder;
    });

    expect(placeholder).toBe('What time?');
  });

  test('should show dropdown on focus', async ({ page }) => {
    await page.goto('/harness/index.html');
    const isOpen = await page.evaluate(async () => {
      const field = document.createElement('albert-time-entry');
      document.body.appendChild(field);
      const input = field.shadowRoot?.querySelector('input') as HTMLInputElement;
      const dropdown = field.shadowRoot?.querySelector('.dropdown') as HTMLElement;

      input?.focus();
      await new Promise(r => setTimeout(r, 50));

      return dropdown?.hasAttribute('data-open');
    });

    expect(isOpen).toBe(true);
  });

  test('should show dropdown on click', async ({ page }) => {
    await page.goto('/harness/index.html');
    const isOpen = await page.evaluate(async () => {
      const field = document.createElement('albert-time-entry');
      document.body.appendChild(field);
      const input = field.shadowRoot?.querySelector('input') as HTMLInputElement;
      const dropdown = field.shadowRoot?.querySelector('.dropdown') as HTMLElement;

      input?.click();
      await new Promise(r => setTimeout(r, 50));

      return dropdown?.hasAttribute('data-open');
    });

    expect(isOpen).toBe(true);
  });

  test('should render 96 time suggestions', async ({ page }) => {
    await page.goto('/harness/index.html');
    const count = await page.evaluate(async () => {
      const field = document.createElement('albert-time-entry');
      document.body.appendChild(field);
      const input = field.shadowRoot?.querySelector('input') as HTMLInputElement;

      input?.click();
      await new Promise(r => setTimeout(r, 50));

      const suggestions = field.shadowRoot?.querySelectorAll('.suggestion');
      return suggestions?.length || 0;
    });

    expect(count).toBe(96);
  });

  test('should navigate suggestions with arrow keys', async ({ page }) => {
    await page.goto('/harness/index.html');
    const activeText = await page.evaluate(async () => {
      const field = document.createElement('albert-time-entry');
      document.body.appendChild(field);
      const input = field.shadowRoot?.querySelector('input') as HTMLInputElement;

      input?.click();
      await new Promise(r => setTimeout(r, 50));

      // Press down arrow to move to next suggestion
      input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      await new Promise(r => setTimeout(r, 50));

      const activeSuggestion = field.shadowRoot?.querySelector('.suggestion[data-active]');
      return activeSuggestion?.textContent;
    });

    expect(activeText).toBe('12:15 AM');
  });

  test('should select suggestion on Enter key', async ({ page }) => {
    await page.goto('/harness/index.html');
    const inputValue = await page.evaluate(async () => {
      const field = document.createElement('albert-time-entry');
      document.body.appendChild(field);
      const input = field.shadowRoot?.querySelector('input') as HTMLInputElement;

      input?.click();
      await new Promise(r => setTimeout(r, 50));

      input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      await new Promise(r => setTimeout(r, 50));

      input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await new Promise(r => setTimeout(r, 50));

      return input?.value;
    });

    expect(inputValue).toBe('12:15 AM');
  });

  test('should close dropdown on blur', async ({ page }) => {
    await page.goto('/harness/index.html');
    const isOpen = await page.evaluate(async () => {
      const field = document.createElement('albert-time-entry');
      document.body.appendChild(field);
      const input = field.shadowRoot?.querySelector('input') as HTMLInputElement;
      const dropdown = field.shadowRoot?.querySelector('.dropdown') as HTMLElement;

      input?.focus();
      await new Promise(r => setTimeout(r, 50));

      input?.blur();
      await new Promise(r => setTimeout(r, 150));

      return dropdown?.hasAttribute('data-open');
    });

    expect(isOpen).toBe(false);
  });

  test('should close dropdown on Escape key', async ({ page }) => {
    await page.goto('/harness/index.html');
    const isOpen = await page.evaluate(async () => {
      const field = document.createElement('albert-time-entry');
      document.body.appendChild(field);
      const input = field.shadowRoot?.querySelector('input') as HTMLInputElement;
      const dropdown = field.shadowRoot?.querySelector('.dropdown') as HTMLElement;

      input?.click();
      await new Promise(r => setTimeout(r, 50));

      input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await new Promise(r => setTimeout(r, 50));

      return dropdown?.hasAttribute('data-open');
    });

    expect(isOpen).toBe(false);
  });

  test('should commit value on blur', async ({ page }) => {
    await page.goto('/harness/index.html');
    const result = await page.evaluate(async () => {
      const field = document.createElement('albert-time-entry');
      document.body.appendChild(field);
      const input = field.shadowRoot?.querySelector('input') as HTMLInputElement;

      input?.focus();
      input.value = '3pm';
      input?.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 50));

      input?.blur();
      await new Promise(r => setTimeout(r, 150));

      return { inputValue: input?.value, fieldValue: field.getAttribute('value') };
    });

    expect(result.inputValue).toBe('3:00 PM');
    expect(result.fieldValue).toBe('3:00 PM');
  });

  test('should revert invalid input on blur', async ({ page }) => {
    await page.goto('/harness/index.html');
    const inputValue = await page.evaluate(async () => {
      const field = document.createElement('albert-time-entry');
      field.setAttribute('value', '9:00 AM');
      document.body.appendChild(field);
      const input = field.shadowRoot?.querySelector('input') as HTMLInputElement;

      input?.focus();
      input.value = '25:99';
      input?.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 50));

      input?.blur();
      await new Promise(r => setTimeout(r, 150));

      return input?.value;
    });

    expect(inputValue).toBe('9:00 AM');
  });

  test('should emit _albert-change event on commit', async ({ page }) => {
    await page.goto('/harness/index.html');
    const fired = await page.evaluate(async () => {
      const field = document.createElement('albert-time-entry');
      document.body.appendChild(field);

      let changeEvent: CustomEvent | null = null;
      field.addEventListener('_albert-change', (e) => {
        changeEvent = e as CustomEvent;
      });

      const input = field.shadowRoot?.querySelector('input') as HTMLInputElement;
      input?.focus();
      input.value = '2:30pm';
      input?.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 50));

      input?.blur();
      await new Promise(r => setTimeout(r, 150));

      return changeEvent?.detail?.value;
    });

    expect(fired).toBe('2:30 PM');
  });

  test('should highlight nearest matching suggestion', async ({ page }) => {
    await page.goto('/harness/index.html');
    const activeText = await page.evaluate(async () => {
      const field = document.createElement('albert-time-entry');
      document.body.appendChild(field);
      const input = field.shadowRoot?.querySelector('input') as HTMLInputElement;

      input?.focus();
      input.value = '3:25pm';
      input?.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 50));

      input?.click();
      await new Promise(r => setTimeout(r, 50));

      const activeSuggestion = field.shadowRoot?.querySelector('.suggestion[data-active]');
      return activeSuggestion?.textContent;
    });

    // 3:25 PM should match to 3:30 PM (nearest 15-min interval)
    expect(activeText).toBe('3:30 PM');
  });

  test('should select suggestion on click', async ({ page }) => {
    await page.goto('/harness/index.html');
    const inputValue = await page.evaluate(async () => {
      const field = document.createElement('albert-time-entry');
      document.body.appendChild(field);
      const input = field.shadowRoot?.querySelector('input') as HTMLInputElement;

      input?.click();
      await new Promise(r => setTimeout(r, 50));

      const suggestion = field.shadowRoot?.querySelector('.suggestion:nth-child(5)') as HTMLElement;
      suggestion?.click();
      await new Promise(r => setTimeout(r, 50));

      return input?.value;
    });

    expect(inputValue).toBe('1:00 AM');
  });

  test('should update input from active suggestion with arrow keys', async ({ page }) => {
    await page.goto('/harness/index.html');
    const inputValue = await page.evaluate(async () => {
      const field = document.createElement('albert-time-entry');
      document.body.appendChild(field);
      const input = field.shadowRoot?.querySelector('input') as HTMLInputElement;

      input?.click();
      await new Promise(r => setTimeout(r, 50));

      // Press down arrow 3 times
      input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      await new Promise(r => setTimeout(r, 30));
      input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      await new Promise(r => setTimeout(r, 30));
      input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      await new Promise(r => setTimeout(r, 30));

      return input?.value;
    });

    expect(inputValue).toBe('12:45 AM');
  });
});
