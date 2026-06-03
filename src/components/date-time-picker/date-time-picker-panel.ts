import { parseTime, formatTime, timeToIso, generateTimeOptions, ParsedTime } from '../../shared/parse-time';
import { panelRegistry } from '../../shared/panel-registry';

const caretLeftIcon = `<svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"/>
</svg>`;

const caretRightIcon = `<svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66A8,8,0,0,1,101.66,42.34l80,80a8,8,0,0,1,0,11.32Z"/>
</svg>`;

const caretDownIcon = `<svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/>
</svg>`;

const style = `
:host {
  display: none;
  --panel-width: 268px;
  --cell-size: 30px;
  --radius-sm: 6px;
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
  padding: 12px;
  gap: 8px;
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
  border-radius: var(--radius-sm);
  transition: background 0.2s ease;
}

.nav-btn:hover {
  background: var(--cobalt-95);
}

.month-year-btn,
.year-btn {
  flex: 1;
  background: none;
  border: none;
  color: var(--text);
  font-size: 13px;
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
}

.decade-range {
  flex: 1;
  text-align: center;
  font-size: 13px;
  color: var(--text);
  font-weight: 500;
}

.day-grid {
  padding: 0 12px;
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
  font-size: 13px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  justify-self: center;
  font-weight: 500;
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
  background: var(--slate-90);
}

.footer {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--border);
}

.footer-btn {
  flex: 1;
  background: none;
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  font-weight: 500;
}

.footer-btn:hover {
  background: var(--cobalt-95);
  border-color: var(--cobalt-50);
}


.footer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;

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
  private timeEntryInput: HTMLInputElement | undefined;
  private timezoneDisplay: HTMLElement | undefined;

  private currentDate = new Date();
  private selectedDate: Date | null = null;
  private selectedTime: ParsedTime | null = null;
  private anchorElement: HTMLElement | null = null;
  private view: 'day' | 'month' | 'year' = 'day';
  private documentClickListener: ((e: Event) => void) | null = null;
  private documentKeyListener: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
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

    // Time section (shown only in day view)
    this.timeSectionElement = document.createElement('div');
    this.timeSectionElement.className = 'time-section';
    this.timeSectionElement.setAttribute('data-hidden', '');

    this.timeEntryInput = document.createElement('input');
    this.timeEntryInput.setAttribute('type', 'text');
    this.timeEntryInput.setAttribute('placeholder', 'Enter time');
    this.timeEntryInput.setAttribute('aria-label', 'Time entry');

    this.timezoneDisplay = document.createElement('div');
    this.timezoneDisplay.className = 'timezone-display';
    this.timezoneDisplay.textContent = `Timezone: ${this.getTimezone()}`;

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

    // Year view
    this.yearGridElement = document.createElement('div');
    this.yearGridElement.className = 'year-grid';

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

    this.panelElement.appendChild(this.timeSectionElement);
    this.panelElement.appendChild(this.headerElement);
    this.panelElement.appendChild(this.dayGridElement);
    this.panelElement.appendChild(this.monthGridElement);
    this.panelElement.appendChild(this.yearGridElement);
    this.panelElement.appendChild(footerElement);

    this.shadow.appendChild(styleEl);
    this.shadow.appendChild(this.panelElement);

    this.renderDay();
  }

  private renderDay() {
    this.dayGridElement.innerHTML = '';
    this.monthGridElement.innerHTML = '';
    this.yearGridElement.innerHTML = '';

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
  }

  private renderMonth() {
    this.dayGridElement.innerHTML = '';
    this.monthGridElement.innerHTML = '';
    this.yearGridElement.innerHTML = '';

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
      btn.className = 'month-pill';
      btn.textContent = month;

      if (this.selectedDate && this.selectedDate.getFullYear() === year && this.selectedDate.getMonth() === index) {
        btn.setAttribute('data-selected', '');
      }
      if (currentMonth === index && currentYear === year) {
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
      btn.className = 'year-pill';
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
    this.timeEntryInput.addEventListener('input', () => this.handleTimeInput());
    this.timeEntryInput.addEventListener('blur', () => this.commitTime());
    this.timeEntryInput.addEventListener('keydown', (e) => this.handleTimeKeydown(e));
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
      this.timeEntryInput.value = formatTime(this.selectedTime);
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
    this.timeEntryInput.value = formatTime(this.selectedTime);
    this.close();
  }

  private selectClear() {
    this.selectedDate = null;
    this.selectedTime = this.getCurrentTime();
    this.timeEntryInput.value = '';
    this.currentDate = new Date();
    this.renderDay();
    this.dispatchChangeEvent(null);
  }

  private handleTimeInput() {
    const parsed = parseTime(this.timeEntryInput.value);
    if (parsed) {
      this.selectedTime = parsed;
    }
  }

  private handleTimeKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.commitTime();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      this.timeEntryInput.value = this.selectedTime ? formatTime(this.selectedTime) : '';
    }
  }

  private commitTime() {
    if (this.selectedDate && this.timeEntryInput.value) {
      const parsed = parseTime(this.timeEntryInput.value);
      if (parsed) {
        this.selectedTime = parsed;
        this.timeEntryInput.value = formatTime(parsed);
      }
    }
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
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'UTC';
    }
  }

  private getCurrentTime(): ParsedTime {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();

    let hours12 = hours % 12;
    if (hours12 === 0) hours12 = 12;

    const meridiem = hours < 12 ? 'AM' : 'PM';

    return { hours: hours12, minutes, meridiem };
  }

  private dispatchChangeEvent(value: string | null) {
    const event = new CustomEvent('_albert-change', {
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
  }

  private close() {
    this.style.display = 'none';
    this.removeDocumentListeners();
    panelRegistry.unregister(this);
  }

  public open(anchorElement: HTMLElement, initialValue?: string) {
    this.anchorElement = anchorElement;

    if (initialValue) {
      const parts = initialValue.split('T');
      const [year, month, day] = parts[0].split('-').map(Number);
      this.selectedDate = new Date(year, month - 1, day);
      this.currentDate = new Date(year, month - 1, 1);
      if (parts[1]) {
        const [hours, minutes] = parts[1].split(':').map(Number);
        this.selectedTime = { hours: hours > 12 ? hours - 12 : hours === 0 ? 12 : hours, minutes, meridiem: hours >= 12 ? 'PM' : 'AM' };
      }
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
      this.timeEntryInput.value = this.selectedTime ? formatTime(this.selectedTime) : '';

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

      document.addEventListener('click', this.documentClickListener);
      document.addEventListener('keydown', this.documentKeyListener);

      const rect = anchorElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const gapSize = 8;

      // Use panel CSS width variable as default, measure if available
      const panelHeight = 400;
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
        // Panel would overflow right edge - shift left
        leftPosition = viewportWidth - panelWidth - gapSize;
      }
      if (leftPosition < 0) {
        // Panel would overflow left edge - shift right
        leftPosition = gapSize;
      }

      this.style.position = 'fixed';
      this.style.display = 'block';
      this.style.top = topPosition + 'px';
      this.style.left = leftPosition + 'px';
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
