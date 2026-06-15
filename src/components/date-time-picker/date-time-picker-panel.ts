import { parseTime, formatTime, timeToIso, dateToLocalTime, ParsedTime } from '../../shared/parse-time';
import { panelRegistry } from '../../shared/panel-registry';
import '../../components/time-entry/time-entry-field';
import { applyTokenDefaults } from '../../shared/token-defaults';

const caretLeftIcon = `<svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"/>
</svg>`;

const caretRightIcon = `<svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66A8,8,0,0,1,101.66,42.34l80,80a8,8,0,0,1,0,11.32Z"/>
</svg>`;

const caretDownIcon = `<svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/>
</svg>`;

const style = applyTokenDefaults(`
:host {
  display: none;
  --panel-width: 268px;
  --cell-size: 30px;
  --radius-sm: 6px;
  --font-size-sm: 13px;
}

.panel {
  position: fixed;
  width: var(--panel-width);
  display: flex;
  flex-direction: column;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-3);
  z-index: 1000;
  font-family: var(--font-sans);
}

.time-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--border);
}

.time-section[data-hidden] {
  display: none;
}

.timezone-display {
  font-size: 12px;
  color: var(--text-medium);
  padding: 0;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
}

.nav-btn {
  background: none;
  border: none;
  color: var(--text-medium);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.nav-btn:hover {
  background: var(--slate-90);
}

.month-year-btn,
.year-btn {
  background: none;
  border: none;
  color: var(--text);
  font-size: var(--font-size-sm);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-weight: 500;
}

.month-year-btn:hover,
.year-btn:hover {
  background: var(--cobalt-95);
  color: var(--cobalt-50);
}

.decade-range {
  flex: 1;
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text);
  font-weight: 500;
}

.day-grid {
  padding: 6px 10px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.weekdays {
  display: contents;
}

.weekday {
  text-align: center;
  font-size: 12px;
  color: var(--text);
  padding: 4px 0;
  font-weight: 500;
}

.day-cell {
  width: var(--cell-size);
  height: var(--cell-size);
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  border-radius: 50%;
  font-size: 13px;
  transition: all 0.2s ease;
}

.day-cell:hover:not(:disabled) {
  background: var(--cobalt-95);
}

.day-cell[data-other-month] {
  color: var(--text-dim);
}

.day-cell[data-selected] {
  background: var(--cobalt-50);
  color: white;
  font-weight: 500;
}
.day-cell[data-selected]:hover {
  background: var(--cobalt-50);
}
.day-cell[data-today] {
  background: var(--slate-90);
}

.day-cell[data-today][data-selected] {
  background: var(--cobalt-50);
}

.day-cell:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.month-grid,
.year-grid {
  padding: 12px;
  display: grid;
  gap: 8px;
}

.month-grid {
  grid-template-columns: repeat(3, 1fr);
}

.year-grid {
  grid-template-columns: repeat(2, 1fr);
}

.month-pill,
.year-pill {
  background: none;
  border: none;
  color: var(--text);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}
.py-1 {
  padding-block: calc(var(--spacing-sm) * 1);
}

.px-3 {
  padding-inline: calc(var(--spacing-sm) * 3);
}
.px-4 {
  padding-inline: calc(var(--spacing-sm) * 4);
}
.month-pill:hover,
.year-pill:hover {
  background: var(--cobalt-95);
}

.month-pill[data-selected],
.year-pill[data-selected] {
  background: var(--cobalt-50);
  color: white;
}

.month-pill[data-current],
.year-pill[data-current] {
  background: var(--cobalt-50);
  color: white;
}

.footer {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
}

.footer-btn {
  background: none;
  border: none;
  color: var(--cobalt-50);
  font-size: var(--font-size-sm);
  cursor: pointer;
  padding: 0;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.footer-btn:hover {
  opacity: 0.75;
}

.footer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

[hidden] {
  display: none !important;
}
`);

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export class DateTimePickerPanel extends HTMLElement {
  private shadow: ShadowRoot;
  private panelElement: HTMLElement | undefined;
  private dayGridElement: HTMLElement | undefined;
  private monthGridElement: HTMLElement | undefined;
  private yearGridElement: HTMLElement | undefined;
  private monthYearBtn: HTMLButtonElement | undefined;
  private yearBtn: HTMLButtonElement | undefined;
  private decadeRangeElement: HTMLElement | undefined;
  private prevBtn: HTMLButtonElement | undefined;
  private nextBtn: HTMLButtonElement | undefined;
  private nowBtn: HTMLButtonElement | undefined;
  private clearBtn: HTMLButtonElement | undefined;
  private headerElement: HTMLElement | undefined;
  private timeSectionElement: HTMLElement | undefined;
  private timeEntryInput: HTMLElement | undefined;   // albert-time-entry
  private timezoneDisplay: HTMLElement | undefined;

  private currentDate = new Date();
  private selectedDate: Date | null = null;
  private selectedTime: ParsedTime | null = null;
  private anchorElement: HTMLElement | null = null;
  private view: 'day' | 'month' | 'year' = 'day';
  private documentClickListener: ((e: Event) => void) | null = null;
  private documentKeyListener: ((e: KeyboardEvent) => void) | null = null;
  private scrollResizeListener: (() => void) | null = null;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  private _rendered = false;

  connectedCallback() {
    if (this._rendered) return;
    this._rendered = true;
    this.render();
    this.setupInternalListeners();
  }

  disconnectedCallback() {
    this.removeDocumentListeners();
    panelRegistry.unregister(this);
  }

  private render() {
    const styleEl = document.createElement('style');
    styleEl.textContent = style;

    this.panelElement = document.createElement('div');
    this.panelElement.setAttribute('part', 'panel');
    this.panelElement.className = 'panel';
    this.panelElement.setAttribute('role', 'dialog');
    this.panelElement.setAttribute('aria-modal', 'true');
    this.panelElement.setAttribute('aria-label', 'Date and time picker');

    // Time section (shown only in day view)
    this.timeSectionElement = document.createElement('div');
    this.timeSectionElement.className = 'time-section';
    this.timeSectionElement.setAttribute('data-hidden', '');

    this.timeEntryInput = document.createElement('albert-time-entry');
    this.timeEntryInput.setAttribute('placeholder', 'Enter time');
    // aria-label is handled inside albert-time-entry's own shadow DOM

    this.timezoneDisplay = document.createElement('div');
    this.timezoneDisplay.className = 'timezone-display';
    this.timezoneDisplay.textContent = this.getTimezone();

    this.timeSectionElement.appendChild(this.timeEntryInput);
    this.timeSectionElement.appendChild(this.timezoneDisplay);

    // Header
    this.headerElement = document.createElement('div');
    this.headerElement.setAttribute('part', 'header');
    this.headerElement.className = 'header';

    this.prevBtn = document.createElement('button');
    this.prevBtn.setAttribute('part', 'prev');
    this.prevBtn.className = 'nav-btn';
    this.prevBtn.setAttribute('aria-label', 'Previous');
    this.prevBtn.innerHTML = caretLeftIcon;

    this.monthYearBtn = document.createElement('button');
    this.monthYearBtn.setAttribute('part', 'month-year');
    this.monthYearBtn.className = 'month-year-btn';
    this.monthYearBtn.innerHTML = `${this.getMonthYear(this.currentDate)} ${caretDownIcon}`;

    this.nextBtn = document.createElement('button');
    this.nextBtn.setAttribute('part', 'next');
    this.nextBtn.className = 'nav-btn';
    this.nextBtn.setAttribute('aria-label', 'Next');
    this.nextBtn.innerHTML = caretRightIcon;

    this.headerElement.appendChild(this.prevBtn);
    this.headerElement.appendChild(this.monthYearBtn);
    this.headerElement.appendChild(this.nextBtn);

    // Day view
    this.dayGridElement = document.createElement('div');
    this.dayGridElement.className = 'day-grid';

    // Month view
    this.monthGridElement = document.createElement('div');
    this.monthGridElement.className = 'month-grid';
    this.monthGridElement.setAttribute('hidden', '');

    // Year view
    this.yearGridElement = document.createElement('div');
    this.yearGridElement.className = 'year-grid';
    this.yearGridElement.setAttribute('hidden', '');

    // Footer
    const footerElement = document.createElement('div');
    footerElement.className = 'footer';

    this.nowBtn = document.createElement('button');
    this.nowBtn.className = 'footer-btn';
    this.nowBtn.setAttribute('data-primary', '');
    this.nowBtn.textContent = 'Now';

    this.clearBtn = document.createElement('button');
    this.clearBtn.className = 'footer-btn';
    this.clearBtn.textContent = 'Clear';

    footerElement.appendChild(this.nowBtn);
    footerElement.appendChild(this.clearBtn);

    this.panelElement.appendChild(this.headerElement);
    this.panelElement.appendChild(this.dayGridElement);
    this.panelElement.appendChild(this.monthGridElement);
    this.panelElement.appendChild(this.yearGridElement);
    this.panelElement.appendChild(this.timeSectionElement);
    this.panelElement.appendChild(footerElement);

    this.shadow.appendChild(styleEl);
    this.shadow.appendChild(this.panelElement);

    this.renderDay();
  }

  private renderDay() {
    this.dayGridElement.innerHTML = '';
    this.monthGridElement.innerHTML = '';
    this.yearGridElement.innerHTML = '';

    this.dayGridElement.removeAttribute('hidden');
    this.monthGridElement.setAttribute('hidden', '');
    this.yearGridElement.setAttribute('hidden', '');

    this.timeSectionElement.removeAttribute('data-hidden');

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Ensure monthYearBtn is in the header (it may have been removed by renderMonth/renderYear)
    this.yearBtn?.remove();
    this.decadeRangeElement?.remove();
    if (!this.headerElement.contains(this.monthYearBtn)) {
      this.headerElement.insertBefore(this.monthYearBtn, this.nextBtn);
    }

    this.monthYearBtn.innerHTML = `${this.getMonthYear(this.currentDate)} ${caretDownIcon}`;

    // Weekday labels
    const weekdayContainer = document.createElement('div');
    weekdayContainer.className = 'weekdays';
    weekdays.forEach(day => {
      const label = document.createElement('div');
      label.className = 'weekday';
      label.textContent = day;
      weekdayContainer.appendChild(label);
    });
    this.dayGridElement.appendChild(weekdayContainer);

    // Day cells
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const btn = document.createElement('button');
      btn.className = 'day-cell';
      btn.setAttribute('data-other-month', '');
      btn.textContent = String(daysInPrevMonth - i);
      btn.disabled = true;
      this.dayGridElement.appendChild(btn);
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const btn = document.createElement('button');
      btn.className = 'day-cell';
      btn.textContent = String(day);

      const cellDate = new Date(year, month, day);
      if (this.isToday(cellDate)) {
        btn.setAttribute('data-today', '');
      }
      if (this.isSelected(cellDate)) {
        btn.setAttribute('data-selected', '');
      }

      btn.tabIndex = -1;
      btn.addEventListener('click', () => this.selectDate(cellDate));
      this.dayGridElement.appendChild(btn);
    }

    // Next month days
    const totalCells = firstDay + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let day = 1; day <= remainingCells; day++) {
      const btn = document.createElement('button');
      btn.className = 'day-cell';
      btn.setAttribute('data-other-month', '');
      btn.textContent = String(day);
      btn.disabled = true;
      this.dayGridElement.appendChild(btn);
    }

    this.initializeFocusedCell();
  }

  private renderMonth() {
    this.dayGridElement.innerHTML = '';
    this.monthGridElement.innerHTML = '';
    this.yearGridElement.innerHTML = '';

    this.dayGridElement.setAttribute('hidden', '');
    this.monthGridElement.removeAttribute('hidden');
    this.yearGridElement.setAttribute('hidden', '');

    this.timeSectionElement.setAttribute('data-hidden', '');

    const year = this.currentDate.getFullYear();
    this.yearBtn?.remove();
    this.decadeRangeElement?.remove();
    this.yearBtn = document.createElement('button');
    this.yearBtn.className = 'year-btn';
    this.yearBtn.innerHTML = `${year} ${caretDownIcon}`;
    this.yearBtn.addEventListener('click', () => this.switchToYear());

    this.monthYearBtn.remove();
    this.headerElement.insertBefore(this.yearBtn, this.nextBtn);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    months.forEach((month, index) => {
      const btn = document.createElement('button');
      btn.className = 'month-pill py-1 px-3';
      btn.textContent = month;

      if (this.selectedDate && this.selectedDate.getFullYear() === year && this.selectedDate.getMonth() === index) {
        btn.setAttribute('data-selected', '');
      }
      if (currentMonth === index) {
        btn.setAttribute('data-current', '');
      }

      btn.addEventListener('click', () => this.selectMonth(index));
      this.monthGridElement.appendChild(btn);
    });
  }

  private renderYear() {
    this.dayGridElement.innerHTML = '';
    this.monthGridElement.innerHTML = '';
    this.yearGridElement.innerHTML = '';

    this.dayGridElement.setAttribute('hidden', '');
    this.monthGridElement.setAttribute('hidden', '');
    this.yearGridElement.removeAttribute('hidden');

    this.timeSectionElement.setAttribute('data-hidden', '');

    const decade = Math.floor(this.currentDate.getFullYear() / 10) * 10;

    if (!this.decadeRangeElement || !this.headerElement.contains(this.decadeRangeElement)) {
      this.decadeRangeElement = document.createElement('div');
      this.decadeRangeElement.className = 'decade-range';
      this.yearBtn?.remove();
      this.headerElement.insertBefore(this.decadeRangeElement, this.nextBtn);
    }

    this.decadeRangeElement.textContent = `${decade}–${decade + 9}`;

    const currentYear = new Date().getFullYear();

    for (let year = decade; year < decade + 10; year++) {
      const btn = document.createElement('button');
      btn.className = 'year-pill py-1 px-4';
      btn.textContent = String(year);

      if (this.selectedDate && this.selectedDate.getFullYear() === year) {
        btn.setAttribute('data-selected', '');
      }
      if (year === currentYear) {
        btn.setAttribute('data-current', '');
      }

      btn.addEventListener('click', () => this.selectYear(year));
      this.yearGridElement.appendChild(btn);
    }
  }

  private setupInternalListeners() {
    this.prevBtn.addEventListener('click', () => this.handlePrev());
    this.nextBtn.addEventListener('click', () => this.handleNext());
    this.monthYearBtn.addEventListener('click', () => this.switchToMonth());
    this.nowBtn.addEventListener('click', () => this.selectNow());
    this.clearBtn.addEventListener('click', () => this.selectClear());

    // albert-time-entry handles its own input/blur/keydown internally.
    // We only need to listen for the committed change event it fires.
    this.timeEntryInput.addEventListener('_albert-change', (e: Event) => {
      this.onTimeEntryChange(e as CustomEvent);
    });

    this.setupDayKeyboard();
  }

  // S2 — arrow-key roving-tabindex navigation within the day grid
  private setupDayKeyboard(): void {
    this.panelElement!.addEventListener('keydown', (e: KeyboardEvent) => {
      const active = this.shadow.activeElement as HTMLButtonElement | null;
      if (!active?.classList.contains('day-cell')) return;

      // Skip disabled (other-month) cells during navigation
      const cells = Array.from(
        this.dayGridElement!.querySelectorAll<HTMLButtonElement>(
          '.day-cell:not(:disabled)',
        ),
      );
      const idx = cells.indexOf(active);
      if (idx === -1) return;

      let nextIdx: number;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextIdx = idx + 1;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIdx = idx - 1;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        nextIdx = idx + 7;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        nextIdx = idx - 7;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        active.click();
        return;
      } else {
        return;
      }

      if (nextIdx >= 0 && nextIdx < cells.length) {
        cells[idx].tabIndex = -1;
        cells[nextIdx].tabIndex = 0;
        cells[nextIdx].focus();
      }
    });
  }

  // S4 — set roving tabindex; called after renderDay()
  private initializeFocusedCell(): void {
    const cells = Array.from(
      this.dayGridElement!.querySelectorAll<HTMLButtonElement>(
        '.day-cell:not(:disabled)',
      ),
    );
    cells.forEach((c) => (c.tabIndex = -1));
    const selected = cells.find((c) => c.hasAttribute('data-selected'));
    const toFocus = selected ?? cells[0];
    if (toFocus) toFocus.tabIndex = 0;
  }

  private onTimeEntryChange(e: CustomEvent) {
    const raw = e.detail?.value as string;
    const parsed = raw ? parseTime(raw) : null;
    this.selectedTime = parsed ?? null;

    if (this.selectedDate && this.selectedTime) {
      const datetime = timeToIso(this.selectedDate, this.selectedTime);
      this.dispatchChangeEvent(datetime);
    }
  }

  private switchToYear() {
    if (this.view !== 'year') {
      this.view = 'year';
      this.renderYear();
    }
  }

  private handlePrev() {
    if (this.view === 'day') {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    } else if (this.view === 'month') {
      this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
    } else if (this.view === 'year') {
      this.currentDate.setFullYear(this.currentDate.getFullYear() - 10);
    }
    this.updateView();
  }

  private handleNext() {
    if (this.view === 'day') {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    } else if (this.view === 'month') {
      this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
    } else if (this.view === 'year') {
      this.currentDate.setFullYear(this.currentDate.getFullYear() + 10);
    }
    this.updateView();
  }

  private switchToMonth() {
    if (this.view !== 'month') {
      this.view = 'month';
      this.renderMonth();
    }
  }

  private selectMonth(monthIndex: number) {
    this.currentDate.setMonth(monthIndex);
    this.view = 'day';
    this.renderDay();
  }

  private selectYear(year: number) {
    this.currentDate.setFullYear(year);
    this.view = 'month';
    this.renderMonth();
  }

  private selectDate(date: Date) {
    this.selectedDate = new Date(date);
    this.currentDate = new Date(date);
    if (!this.selectedTime) {
      this.selectedTime = this.getCurrentTime();
      this.timeEntryInput.setAttribute('value', formatTime(this.selectedTime));
    }
    this.renderDay();
    const datetime = timeToIso(this.selectedDate, this.selectedTime!);
    this.dispatchChangeEvent(datetime);
  }

  private selectNow() {
    const now = new Date();
    this.selectedDate = new Date(now);
    this.currentDate = new Date(now);
    this.selectedTime = this.getCurrentTime();

    // setAttribute triggers albert-time-entry's attributeChangedCallback
    this.timeEntryInput.setAttribute('value', formatTime(this.selectedTime));

    const datetime = timeToIso(this.selectedDate, this.selectedTime);
    this.dispatchChangeEvent(datetime);
    this.close();
  }

  private selectClear() {
    this.selectedDate = null;
    this.selectedTime = null;
    this.currentDate = new Date();

    // removeAttribute clears albert-time-entry's input via attributeChangedCallback
    this.timeEntryInput.removeAttribute('value');

    this.renderDay();
    this.dispatchChangeEvent(null);
  }

  private updateView() {
    if (this.view === 'day') {
      this.renderDay();
    } else if (this.view === 'month') {
      this.renderMonth();
    } else if (this.view === 'year') {
      this.renderYear();
    }
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  private isSelected(date: Date): boolean {
    if (!this.selectedDate) return false;
    return date.getDate() === this.selectedDate.getDate() &&
           date.getMonth() === this.selectedDate.getMonth() &&
           date.getFullYear() === this.selectedDate.getFullYear();
  }

  private getMonthYear(date: Date): string {
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  private getTimezone(): string {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offsetMinutes = -new Date().getTimezoneOffset();
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const abs = Math.abs(offsetMinutes);
      const hh = String(Math.floor(abs / 60));
      const mm = String(abs % 60).padStart(2, '0');
      const offset = `GMT${sign}${hh}:${mm}`;
      return `${tz} · ${offset}`;
    } catch {
      return 'UTC';
    }
  }

  private getCurrentTime(): ParsedTime {
    return dateToLocalTime(new Date());
  }

  private dispatchChangeEvent(value: string | null) {
    const event = new CustomEvent('albert-change', {
      bubbles: true,
      composed: true,
      detail: { value },
    });
    this.dispatchEvent(event);
  }

  private removeDocumentListeners() {
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener);
    }
    if (this.documentKeyListener) {
      document.removeEventListener('keydown', this.documentKeyListener);
    }
    if (this.scrollResizeListener) {
      window.removeEventListener('scroll', this.scrollResizeListener, { capture: true });
      window.removeEventListener('resize', this.scrollResizeListener);
      this.scrollResizeListener = null;
    }
  }

  private close() {
    this.removeDocumentListeners();
    // S6 — notify field so it can reset aria-expanded
    this.dispatchEvent(
      new CustomEvent('_albert-close', { bubbles: false, composed: false }),
    );
    if (this.parentElement === document.body) {
      document.body.removeChild(this);
    }
    this.style.display = 'none';
    panelRegistry.unregister(this);
    this.anchorElement?.focus();
  }

  public open(anchorElement: HTMLElement, initialValue?: string) {
    this.anchorElement = anchorElement;
    if (initialValue) {
      // Parse via Date so the browser's timezone conversion applies, matching
      // how formatDate() (the field display) reads the same ISO string.
      const d = new Date(initialValue);
      const localYear = d.getFullYear();
      const localMonth = d.getMonth();
      const localDay = d.getDate();
      this.selectedDate = new Date(localYear, localMonth, localDay);
      this.currentDate = new Date(localYear, localMonth, 1);
      this.selectedTime = dateToLocalTime(d);
    } else {
      this.selectedDate = null;
      this.selectedTime = null;
      this.currentDate = new Date();
    }

    this.view = 'day';
    document.body.appendChild(this);
    this.style.display = 'block';

    requestAnimationFrame(() => {
      this.timeSectionElement.removeAttribute('data-hidden');
      if (this.selectedTime) {
        this.timeEntryInput.setAttribute('value', formatTime(this.selectedTime));
      } else {
        this.timeEntryInput.removeAttribute('value');
      }

      this.renderDay();

      this.documentClickListener = (e: Event) => {
        const composedPath = (e as any).composedPath?.() || [];
        const isClickInsidePanel = composedPath.includes(this) || composedPath.includes(this.panelElement);
        const isClickOnAnchor = composedPath.includes(anchorElement) || e.target === anchorElement;

        if (!isClickInsidePanel && !isClickOnAnchor) {
          this.close();
          if (this.selectedDate && this.selectedTime) {
            const datetime = timeToIso(this.selectedDate, this.selectedTime);
            this.dispatchChangeEvent(datetime);
          }
        }
      };

      this.documentKeyListener = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          this.close();
        }
      };

      this.scrollResizeListener = () => this.updatePosition();

      document.addEventListener('click', this.documentClickListener);
      document.addEventListener('keydown', this.documentKeyListener);
      window.addEventListener('scroll', this.scrollResizeListener, { capture: true, passive: true });
      window.addEventListener('resize', this.scrollResizeListener, { passive: true });

      // S4 — move focus into the day grid after first rAF renders content
      const focusTarget = this.dayGridElement?.querySelector<HTMLElement>(
        '[tabindex="0"]',
      );
      focusTarget?.focus();

      // Second rAF: layout is complete, safe to measure real panel height
      requestAnimationFrame(() => {
        const rect = anchorElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const gapSize = 8;

        // Measure actual rendered height — falls back only if layout hasn't run
        const panelHeight = this.panelElement?.offsetHeight ?? 400;
        const panelWidth = 268;

        // Determine vertical position: prefer above if field is in bottom half
        const midpoint = viewportHeight / 2;
        let topPosition: number;

        if (rect.top > midpoint) {
          // Field is in bottom half - try to position above
          topPosition = rect.top - panelHeight - gapSize;
          // If that goes off-screen, position below instead
          if (topPosition < 0) {
            topPosition = rect.bottom + gapSize;
          }
        } else {
          // Field is in top half - position below
          topPosition = rect.bottom + gapSize;
        }

        // Determine horizontal position: try to align with field left, but keep on screen
        let leftPosition = rect.left;
        if (leftPosition + panelWidth > viewportWidth) {
          leftPosition = viewportWidth - panelWidth - gapSize;
        }
        if (leftPosition < 0) {
          leftPosition = gapSize;
        }

        this.style.position = 'fixed';
        this.style.display = 'block';
        this.style.top = topPosition + 'px';
        this.style.left = leftPosition + 'px';
      });
    });

    panelRegistry.register(this);
  }

  public static open(anchorElement: HTMLElement, initialValue?: string) {
    let panel = document.querySelector('albert-date-time-picker-panel') as DateTimePickerPanel;
    if (!panel) {
      panel = new DateTimePickerPanel();
    }
    panel.open(anchorElement, initialValue);
  }

  public setSelectedDate(dateString: string | null) {
    if (dateString) {
      const parts = dateString.split('T')[0].split('-');
      this.selectedDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      this.selectedDate = null;
    }
  }

  public setSelectedTime(timeString: string) {
    if (timeString) {
      this.selectedTime = parseTime(timeString);
    } else {
      this.selectedTime = null;
    }
  }
}

customElements.define('albert-date-time-picker-panel', DateTimePickerPanel);
