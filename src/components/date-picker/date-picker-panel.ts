import { panelRegistry } from '../../shared/panel-registry';
import { applyTokenDefaults } from '../../shared/token-defaults';
import {
  PANEL_CONTAINER_CSS,
  PANEL_HEADER_CSS,
  NAV_BTN_CSS,
  HEADER_TOGGLE_BTNS_CSS,
  DAY_GRID_LAYOUT_CSS,
  DAY_CELL_BASE_CSS,
  MONTH_YEAR_GRIDS_CSS,
  UTILITY_SPACING_CSS,
  HIDDEN_CSS,
  VALIDATION_BANNER_CSS,
} from '../../shared/panel-styles';
import { dateToIsoString } from '../../shared/parse-time';

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

${PANEL_CONTAINER_CSS}
${PANEL_HEADER_CSS}
${NAV_BTN_CSS}
${HEADER_TOGGLE_BTNS_CSS}
${DAY_GRID_LAYOUT_CSS}

.days {
  display: contents;
}

${DAY_CELL_BASE_CSS}

.day-cell {
  margin: 0 auto;
}

.day-cell:hover:not([data-adjacent]):not(:disabled) {
  background: var(--cobalt-95);
}

.day-cell[data-today]:not([data-selected]) {
  background: var(--slate-90);
}

.day-cell[data-adjacent] {
  color: var(--text-dim);
}

${MONTH_YEAR_GRIDS_CSS}
${UTILITY_SPACING_CSS}

.footer {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  border-top: 1px solid var(--border);
}

.today-btn,
.clear-btn {
  background: none;
  border: none;
  color: var(--cobalt-50);
  padding: 0;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.today-btn:hover,
.clear-btn:hover {
  opacity: 0.75;
}

.today-btn:active,
.clear-btn:active {
  opacity: 0.6;
}

${HIDDEN_CSS}
${VALIDATION_BANNER_CSS}
`);

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export class DatePickerPanel extends HTMLElement {
  private shadow: ShadowRoot;
  private dayGridElement: HTMLElement | undefined;
  private panelElement: HTMLElement | undefined;
  private monthGridElement: HTMLElement | undefined;
  private yearGridElement: HTMLElement | undefined;
  private monthYearBtn: HTMLButtonElement | undefined;
  private yearBtn: HTMLButtonElement | undefined;
  private decadeRangeElement: HTMLElement | undefined;
  private prevBtn: HTMLButtonElement | undefined;
  private nextBtn: HTMLButtonElement | undefined;
  private todayBtn: HTMLButtonElement | undefined;
  private clearBtn: HTMLButtonElement | undefined;
  private headerElement: HTMLElement | undefined;
  private validationBannerElement: HTMLElement | undefined;

  private currentDate = new Date();
  private selectedDate: Date | null = null;
  private minDate: Date | null = null;
  private maxDate: Date | null = null;
  private validationMessage: string | null = null;
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
    this.panelElement.setAttribute('aria-label', 'Date picker');

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
    this.monthYearBtn.setAttribute('part', 'month-year-btn');
    this.monthYearBtn.className = 'month-year-btn';

    this.yearBtn = document.createElement('button');
    this.yearBtn.setAttribute('part', 'year-btn');
    this.yearBtn.className = 'year-btn';

    this.decadeRangeElement = document.createElement('span');
    this.decadeRangeElement.setAttribute('part', 'decade-range');
    this.decadeRangeElement.className = 'decade-range';

    this.nextBtn = document.createElement('button');
    this.nextBtn.setAttribute('part', 'next');
    this.nextBtn.className = 'nav-btn';
    this.nextBtn.setAttribute('aria-label', 'Next');
    this.nextBtn.innerHTML = caretRightIcon;

    this.headerElement.appendChild(this.prevBtn);
    this.headerElement.appendChild(this.monthYearBtn);
    this.headerElement.appendChild(this.yearBtn);
    this.headerElement.appendChild(this.decadeRangeElement);
    this.headerElement.appendChild(this.nextBtn);

    // Day grid
    this.dayGridElement = document.createElement('div');
    this.dayGridElement.setAttribute('part', 'day-grid');
    this.dayGridElement.className = 'day-grid';
    this.dayGridElement.setAttribute('role', 'grid');
    this.dayGridElement.setAttribute('aria-label', 'Calendar');

    // Month grid
    this.monthGridElement = document.createElement('div');
    this.monthGridElement.setAttribute('part', 'month-grid');
    this.monthGridElement.className = 'month-grid';
    this.monthGridElement.setAttribute('hidden', '');

    // Year grid
    this.yearGridElement = document.createElement('div');
    this.yearGridElement.setAttribute('part', 'year-grid');
    this.yearGridElement.className = 'year-grid';
    this.yearGridElement.setAttribute('hidden', '');

    // Footer
    const footerElement = document.createElement('div');
    footerElement.setAttribute('part', 'footer');
    footerElement.className = 'footer';

    this.todayBtn = document.createElement('button');
    this.todayBtn.setAttribute('part', 'today-btn');
    this.todayBtn.className = 'today-btn';
    this.todayBtn.textContent = 'Today';

    this.clearBtn = document.createElement('button');
    this.clearBtn.setAttribute('part', 'clear-btn');
    this.clearBtn.className = 'clear-btn';
    this.clearBtn.textContent = 'Clear';

    footerElement.appendChild(this.todayBtn);
    footerElement.appendChild(this.clearBtn);

    // Validation banner (hidden by default)
    this.validationBannerElement = document.createElement('div');
    this.validationBannerElement.setAttribute('part', 'validation-banner');
    this.validationBannerElement.className = 'validation-banner';
    this.validationBannerElement.setAttribute('data-hidden', '');
    this.validationBannerElement.setAttribute('role', 'alert');
    this.validationBannerElement.setAttribute('aria-live', 'polite');

    this.panelElement.appendChild(this.headerElement);
    this.panelElement.appendChild(this.validationBannerElement);
    this.panelElement.appendChild(this.dayGridElement);
    this.panelElement.appendChild(this.monthGridElement);
    this.panelElement.appendChild(this.yearGridElement);
    this.panelElement.appendChild(footerElement);

    this.panelElement.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    this.panelElement.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });

    this.shadow.appendChild(styleEl);
    this.shadow.appendChild(this.panelElement);

    this.renderDayView();
    // Flush any validationMessage that arrived via open() before the DOM existed.
    this.updateValidationBanner();
  }

  private setupInternalListeners() {
    this.prevBtn.addEventListener('click', () => this.handlePrevClick());
    this.nextBtn.addEventListener('click', () => this.handleNextClick());
    this.monthYearBtn.addEventListener('click', () => this.switchToMonthView());
    this.yearBtn.addEventListener('click', () => this.switchToYearView());
    this.todayBtn.addEventListener('click', () => this.handleTodayClick());
    this.clearBtn.addEventListener('click', () => this.handleClearClick());
    this.setupDayKeyboard();
  }

  // S2 — arrow-key roving-tabindex navigation within the day grid
  private setupDayKeyboard(): void {
    this.panelElement!.addEventListener('keydown', (e: KeyboardEvent) => {
      const active = this.shadow.activeElement as HTMLButtonElement | null;
      if (!active?.classList.contains('day-cell')) return;

      const cells = Array.from(
        this.dayGridElement!.querySelectorAll<HTMLButtonElement>('.day-cell'),
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

  // S4 — set roving tabindex on day cells; called after every renderDayView()
  private initializeFocusedCell(): void {
    const cells = Array.from(
      this.dayGridElement!.querySelectorAll<HTMLButtonElement>('.day-cell'),
    );
    cells.forEach((c) => (c.tabIndex = -1));
    const selected = cells.find((c) => c.hasAttribute('data-selected'));
    const firstNonAdjacent = cells.find((c) => !c.hasAttribute('data-adjacent'));
    const toFocus = selected ?? firstNonAdjacent ?? cells[0];
    if (toFocus) toFocus.tabIndex = 0;
  }

  private renderDayView() {
    this.dayGridElement.innerHTML = '';

    // Add weekday headers
    const weekdaysContainer = document.createElement('div');
    weekdaysContainer.className = 'weekdays';
    weekdays.forEach((day) => {
      const weekdayEl = document.createElement('div');
      weekdayEl.className = 'weekday';
      weekdayEl.textContent = day;
      weekdaysContainer.appendChild(weekdayEl);
    });
    this.dayGridElement.appendChild(weekdaysContainer);

    // Get first day of month and number of days
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const daysContainer = document.createElement('div');
    daysContainer.className = 'days';

    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      const btn = this.createDayCell(date, true);
      daysContainer.appendChild(btn);
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const btn = this.createDayCell(date, false);
      daysContainer.appendChild(btn);
    }

    // Next month's days
    const remainingCells = 42 - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      const btn = this.createDayCell(date, true);
      daysContainer.appendChild(btn);
    }

    this.dayGridElement.appendChild(daysContainer);
    this.updateHeaderForDay();
    this.initializeFocusedCell();
    this.updateNavButtons();
  }

  private createDayCell(date: Date, isAdjacent: boolean) {
    const btn = document.createElement('button');
    btn.className = 'day-cell';
    btn.textContent = date.getDate().toString();

    const isToday =
      date.toDateString() === new Date().toDateString();
    const isSelected =
      this.selectedDate &&
      date.toDateString() === this.selectedDate.toDateString();

    if (isSelected) {
      btn.setAttribute('data-selected', '');
    }
    if (isToday) {
      btn.setAttribute('data-today', '');
    }
    if (isAdjacent) {
      btn.setAttribute('data-adjacent', '');
    }

    btn.addEventListener('click', () => {
      this.selectDate(date);
      this.dispatchChange(dateToIsoString(date));
      this.close();
    });

    const cellMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const isBeforeMin = this.minDate !== null && cellMidnight < this.minDate;
    const isAfterMax = this.maxDate !== null && cellMidnight > this.maxDate;
    if (isBeforeMin || isAfterMax) {
      btn.disabled = true;
      btn.setAttribute('data-out-of-range', '');
    }

    return btn;
  }

  private renderMonthView() {
    this.monthGridElement.innerHTML = '';
    const year = this.currentDate.getFullYear();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    months.forEach((monthName, index) => {
      const btn = document.createElement('button');
      btn.className = 'month-pill py-1 px-3';
      btn.setAttribute('part', 'month-pill');
      btn.textContent = monthName;

      const isCurrentMonth = index === currentMonth;
      const isSelected =
        this.selectedDate &&
        index === this.selectedDate.getMonth() &&
        year === this.selectedDate.getFullYear();

      if (isSelected) {
        btn.setAttribute('data-selected', '');
      }
      if (isCurrentMonth) {
        btn.setAttribute('data-current', '');
      }

      const firstOfMonth = new Date(year, index, 1);
      const lastOfMonth = new Date(year, index + 1, 0);
      const isBeforeMin = this.minDate !== null && lastOfMonth < this.minDate;
      const isAfterMax = this.maxDate !== null && firstOfMonth > this.maxDate;
      if (isBeforeMin || isAfterMax) {
        btn.disabled = true;
      }

      btn.addEventListener('click', () => {
        this.currentDate = new Date(year, index, 1);
        this.view = 'day';
        this.updateVisibleViews();
        this.renderDayView();
      });

      this.monthGridElement.appendChild(btn);
    });

    this.updateHeaderForMonth();
    this.updateNavButtons();
  }

  private renderYearView() {
    this.yearGridElement.innerHTML = '';
    const decade = Math.floor(this.currentDate.getFullYear() / 10) * 10;
    const startYear = decade;
    const endYear = decade + 9;

    this.decadeRangeElement.textContent = `${startYear} – ${endYear}`;

    const currentYear = new Date().getFullYear();

    for (let year = startYear; year <= endYear; year++) {
      const btn = document.createElement('button');
      btn.className = 'year-pill py-1 px-4';
      btn.setAttribute('part', 'year-pill');
      btn.textContent = year.toString();

      const isCurrentYear = year === currentYear;
      const isSelected =
        this.selectedDate &&
        year === this.selectedDate.getFullYear();

      if (isSelected) {
        btn.setAttribute('data-selected', '');
      }
      if (isCurrentYear) {
        btn.setAttribute('data-current', '');
      }

      const isBeforeMin = this.minDate !== null && year < this.minDate.getFullYear();
      const isAfterMax = this.maxDate !== null && year > this.maxDate.getFullYear();
      if (isBeforeMin || isAfterMax) {
        btn.disabled = true;
      }

      btn.addEventListener('click', () => {
        this.currentDate = new Date(year, this.currentDate.getMonth(), 1);
        this.view = 'month';
        this.updateVisibleViews();
        this.renderMonthView();
      });

      this.yearGridElement.appendChild(btn);
    }

    this.updateNavButtons();
  }

  private updateHeaderForDay() {
    const monthName = months[this.currentDate.getMonth()];
    const year = this.currentDate.getFullYear();
    this.monthYearBtn.innerHTML = `${monthName} ${year} ${caretDownIcon}`;
  }

  private updateHeaderForMonth() {
    const year = this.currentDate.getFullYear();
    this.yearBtn.innerHTML = `${year} ${caretDownIcon}`;
  }

  private updateNavButtons(): void {
    const prevBtn = this.prevBtn
      ?? this.shadowRoot?.querySelector('[part="prev"]') as HTMLButtonElement | null;
    const nextBtn = this.nextBtn
      ?? this.shadowRoot?.querySelector('[part="next"]') as HTMLButtonElement | null;

    if (!prevBtn || !nextBtn) return;

    const y = this.currentDate.getFullYear();
    const m = this.currentDate.getMonth();

    if (this.view === 'day') {
      prevBtn.disabled = this.minDate !== null
        && y === this.minDate.getFullYear()
        && m <= this.minDate.getMonth();
      nextBtn.disabled = this.maxDate !== null
        && y === this.maxDate.getFullYear()
        && m >= this.maxDate.getMonth();
    } else if (this.view === 'month') {
      prevBtn.disabled = this.minDate !== null && y <= this.minDate.getFullYear();
      nextBtn.disabled = this.maxDate !== null && y >= this.maxDate.getFullYear();
    } else if (this.view === 'year') {
      const decade = Math.floor(y / 10) * 10;
      prevBtn.disabled = this.minDate !== null && decade <= Math.floor(this.minDate.getFullYear() / 10) * 10;
      nextBtn.disabled = this.maxDate !== null && (decade + 9) >= this.maxDate.getFullYear()
        && decade >= Math.floor(this.maxDate.getFullYear() / 10) * 10;
    }
  }

  private updateVisibleViews() {
    const isDayView = this.view === 'day';
    const isMonthView = this.view === 'month';
    const isYearView = this.view === 'year';

    if (this.dayGridElement) this.dayGridElement.toggleAttribute('hidden', !isDayView);
    if (this.monthGridElement) this.monthGridElement.toggleAttribute('hidden', !isMonthView);
    if (this.yearGridElement) this.yearGridElement.toggleAttribute('hidden', !isYearView);

    if (this.monthYearBtn) this.monthYearBtn.style.display = isDayView ? 'flex' : 'none';
    if (this.yearBtn) this.yearBtn.style.display = isMonthView ? 'flex' : 'none';
    if (this.decadeRangeElement) this.decadeRangeElement.style.display = isYearView ? 'block' : 'none';
  }

  private handlePrevClick() {
    if (this.view === 'day') {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1
      );
      this.renderDayView();
    } else if (this.view === 'month') {
      this.currentDate = new Date(
        this.currentDate.getFullYear() - 1,
        this.currentDate.getMonth(),
        1
      );
      this.renderMonthView();
    } else if (this.view === 'year') {
      this.currentDate = new Date(
        this.currentDate.getFullYear() - 10,
        this.currentDate.getMonth(),
        1
      );
      this.renderYearView();
    }
  }

  private handleNextClick() {
    if (this.view === 'day') {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1
      );
      this.renderDayView();
    } else if (this.view === 'month') {
      this.currentDate = new Date(
        this.currentDate.getFullYear() + 1,
        this.currentDate.getMonth(),
        1
      );
      this.renderMonthView();
    } else if (this.view === 'year') {
      this.currentDate = new Date(
        this.currentDate.getFullYear() + 10,
        this.currentDate.getMonth(),
        1
      );
      this.renderYearView();
    }
  }

  private switchToMonthView() {
    this.view = 'month';
    this.updateVisibleViews();
    this.renderMonthView();
  }

  private switchToYearView() {
    this.view = 'year';
    this.updateVisibleViews();
    this.renderYearView();
  }

  private handleTodayClick() {
    const today = new Date();
    this.selectDate(today);
    this.dispatchChange(dateToIsoString(today));
    this.close();
  }

  private handleClearClick() {
    this.selectedDate = null;
    this.dispatchChange(null);
    this.close();
  }

  private selectDate(date: Date) {
    this.selectedDate = new Date(date);
    this.validationMessage = null;
    this.updateValidationBanner();
  }

  private updateValidationBanner() {
    if (!this.validationBannerElement) return;
    if (this.validationMessage) {
      this.validationBannerElement.innerHTML = `
        <svg class="validation-banner-icon" width="14" height="14" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M236.8,188.09,149.35,36.22a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z"/>
        </svg>
        <span>${this.validationMessage}</span>`;
      this.validationBannerElement.removeAttribute('data-hidden');
    } else {
      this.validationBannerElement.setAttribute('data-hidden', '');
      this.validationBannerElement.textContent = '';
    }
  }

  private dispatchChange(value: string | null) {
    const event = new CustomEvent('albert-change', {
      bubbles: true,
      composed: true,
      detail: { value },
    });
    this.dispatchEvent(event);
  }

  private updatePosition() {
    if (!this.anchorElement) return;

    const rect = this.anchorElement.getBoundingClientRect();
    const panelHeight = this.panelElement.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const gap = 8;

    let top: number;
    if (spaceBelow >= panelHeight + gap) {
      top = rect.bottom + gap;
    } else {
      top = rect.top - panelHeight - gap;
    }

    let left = rect.left;
    const panelWidth = this.panelElement.offsetWidth;
    if (left + panelWidth > window.innerWidth) {
      left = window.innerWidth - panelWidth - 8;
    }

    this.panelElement.style.top = `${top}px`;
    this.panelElement.style.left = `${Math.max(0, left)}px`;
  }

  open(
    anchorElement: HTMLElement,
    initialValue?: string,
    options?: { minDate?: Date | null; maxDate?: Date | null; validationMessage?: string | null },
  ) {
    const rawMin = options?.minDate ?? null;
    const rawMax = options?.maxDate ?? null;
    this.minDate = rawMin && !isNaN(rawMin.getTime()) ? rawMin : null;
    this.maxDate = rawMax && !isNaN(rawMax.getTime()) ? rawMax : null;
    if (this.minDate) {
      this.minDate = new Date(this.minDate.getFullYear(), this.minDate.getMonth(), this.minDate.getDate());
    }
    if (this.maxDate) {
      this.maxDate = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), this.maxDate.getDate());
    }
    this.validationMessage = options?.validationMessage ?? null;
    this.updateValidationBanner();

    this.anchorElement = anchorElement;

    if (initialValue) {
      const [year, month, day] = initialValue.split('-').map(Number);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        this.selectedDate = new Date(year, month - 1, day);
        this.currentDate = new Date(year, month - 1, 1);
      } else {
        this.selectedDate = null;
        this.currentDate = new Date();
      }
    } else {
      this.selectedDate = null;
      this.currentDate = new Date();
    }

    this.view = 'day';
    document.body.appendChild(this);
    this.style.display = 'block';

    requestAnimationFrame(() => {
      this.updateVisibleViews();
      this.renderDayView();

      // S4 — focus the day cell before visibility is hidden for positioning
      const focusTarget = this.dayGridElement?.querySelector<HTMLElement>(
        '[tabindex="0"]',
      );
      focusTarget?.focus();

      this.panelElement.style.visibility = 'hidden';
      requestAnimationFrame(() => {
        this.updatePosition();
        this.panelElement.style.visibility = 'visible';
      });
    });

    panelRegistry.register(this);
    this.addDocumentListeners();
  }

  close() {
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

    if (this.anchorElement) {
      (this.anchorElement as any).focus?.();
    }
  }

  private addDocumentListeners() {
    this.documentClickListener = (e: Event) => {
      const target = e.target as Node;
      const isClickInsidePanel = this.shadow.contains(target) || this.contains(target);
      if (!isClickInsidePanel) {
        this.close();
      }
    };

    this.documentKeyListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      }
    };

    this.scrollResizeListener = () => this.updatePosition();

    document.addEventListener('pointerdown', this.documentClickListener);
    document.addEventListener('keydown', this.documentKeyListener);
    window.addEventListener('scroll', () => this.close(), { capture: true, passive: true });
    window.addEventListener('resize', this.scrollResizeListener, { passive: true });
  }

  private removeDocumentListeners() {
    if (this.documentClickListener) {
      document.removeEventListener('pointerdown', this.documentClickListener);
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
}

customElements.define('albert-date-picker-panel', DatePickerPanel);
