import { parseTime, formatTime, generateTimeOptions, dateToLocalTime, ParsedTime } from '../../shared/parse-time';
import { applyTokenDefaults } from '../../shared/token-defaults';

const clockIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor"><path d="M528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"/></svg>`;

const style = applyTokenDefaults(`
:host {
  display: block;
}

.field {
  position: relative;
  display: flex;
  flex-direction: column;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 10px;
  width: 16px;
  height: 16px;
  color: var(--text-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  flex-shrink: 0;
}

.input-icon svg {
  width: 16px;
  height: 16px;
}

input {
  width: 100%;
  padding: 7px 10px 7px 34px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--background);
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text);
  transition: all 0.2s ease;
  outline: none;
}

// input:hover:not([data-disabled]) {
//   border-color: var(--border);
// }

input:focus {
  border-color: var(--cobalt-50);

}
input[data-disabled] {
  cursor: not-allowed;
  opacity: 0.6;
  color: var(--text-disabled);
}

.dropdown {
  position: fixed;
  max-height: 240px;
  overflow-y: auto;
  background: var(--background);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-3);
  display: none;
  z-index: 2000;
}

.dropdown[data-open] {
  display: block;
}

.dropdown[data-placement="below"] {
  border-top: none;
  border-radius: var(--radius-sm);
}

.dropdown[data-placement="above"] {
  border-bottom: none;
  border-radius: var(--radius-sm);
}

.suggestion {
  padding: 8px 12px;
  cursor: pointer;
  color: var(--text);
  transition: background 0.15s ease;
}

.suggestion:hover {
  background: var(--slate-90);
}

.suggestion[data-selected] {
  background: var(--slate-90);
  color: var(--text);
}

.suggestion[data-active] {
  background: var(--cobalt-95);
  color: var(--cobalt-50);
}

.error {
  margin-top: 6px;
  font-size: 12px;
  color: #d32f2f;
  display: none;
}

.error[data-visible] {
  display: block;
}
`);

export class TimeEntryField extends HTMLElement {
  private shadow: ShadowRoot;
  private input: HTMLInputElement;
  private dropdown: HTMLElement;
  private suggestionsContainer: HTMLElement;
  private lastValidValue: string = '';
  private options: ParsedTime[] = generateTimeOptions();
  private activeIndex: number = -1;
  private isOpen: boolean = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.input = document.createElement('input');
    this.dropdown = document.createElement('div');
    this.suggestionsContainer = document.createElement('div');
  }

  private _rendered = false;

  connectedCallback() {
    if (this._rendered) return;
    this._rendered = true;
    this.render();
    this.setupEventListeners();
  }

  private render() {
    const styleEl = document.createElement('style');
    styleEl.textContent = style;

    const field = document.createElement('div');
    field.classList.add('field');

    const inputWrapper = document.createElement('div');
    inputWrapper.classList.add('input-wrapper');

    this.input.setAttribute('type', 'text');
    this.input.setAttribute('placeholder', this.getPlaceholder());
    this.input.setAttribute('aria-label', 'Time entry field');
    this.updateInputValue();

    const iconEl = document.createElement('span');
    iconEl.classList.add('input-icon');
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.innerHTML = clockIcon;

    this.dropdown.classList.add('dropdown');
    this.suggestionsContainer.classList.add('suggestions-container');
    this.dropdown.appendChild(this.suggestionsContainer);

    const errorEl = document.createElement('div');
    errorEl.classList.add('error');

    inputWrapper.appendChild(iconEl);
    inputWrapper.appendChild(this.input);
    inputWrapper.appendChild(this.dropdown);

    field.appendChild(inputWrapper);
    field.appendChild(errorEl);

    this.shadow.appendChild(styleEl);
    this.shadow.appendChild(field);

    this.renderSuggestions();
  }

  private renderSuggestions() {
    this.suggestionsContainer.innerHTML = '';
    this.options.forEach((option, index) => {
      const suggestion = document.createElement('div');
      suggestion.classList.add('suggestion');
      suggestion.textContent = formatTime(option);
      suggestion.setAttribute('role', 'option');
      suggestion.setAttribute('data-index', String(index));

      if (this.isOptionSelected(option)) {
        suggestion.setAttribute('data-selected', '');
      }

      if (index === this.activeIndex) {
        suggestion.setAttribute('data-active', '');
      }

      suggestion.addEventListener('click', () => this.selectOption(index));

      this.suggestionsContainer.appendChild(suggestion);
    });
  }

  private setupEventListeners() {
    this.input.addEventListener('focus', () => this.openDropdown());
    this.input.addEventListener('input', () => this.handleInput());
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.input.addEventListener('blur', () => this.handleBlur());
    this.input.addEventListener('click', () => this.openDropdown());
  }

  private handleInput() {
    const parsed = parseTime(this.input.value);
    this.activeIndex = parsed ? this.findNearestOptionIndex(parsed) : -1;
    this.renderSuggestions();
  }

  private handleKeydown(e: KeyboardEvent) {
    if (!this.isOpen) {
      if (e.key === 'Enter') {
        this.openDropdown();
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.moveActiveIndex(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.moveActiveIndex(-1);
        break;
      case 'Enter':
        e.preventDefault();
        if (this.activeIndex >= 0) {
          this.selectOption(this.activeIndex);
        } else {
          this.commit();
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.revert();
        this.closeDropdown();
        break;
    }
  }

  private handleBlur() {
    this.commit();
    setTimeout(() => this.closeDropdown(), 100);
  }

  private moveActiveIndex(delta: number) {
    const newIndex = this.activeIndex + delta;
    if (newIndex >= 0 && newIndex < this.options.length) {
      this.activeIndex = newIndex;
      this.renderSuggestions();
      this.scrollToActive();
      this.updateInputFromActive();
    }
  }

  private scrollToActive() {
    if (this.activeIndex < 0) return;
    const suggestions = this.suggestionsContainer.querySelectorAll('.suggestion');
    const activeSuggestion = suggestions[this.activeIndex];
    if (activeSuggestion) {
      activeSuggestion.scrollIntoView({ block: 'nearest' });
    }
  }

  private updateInputFromActive() {
    if (this.activeIndex >= 0) {
      this.input.value = formatTime(this.options[this.activeIndex]);
    }
  }

  private selectOption(index: number) {
    this.activeIndex = index;
    this.updateInputFromActive();
    this.commit();
    this.closeDropdown();
  }

  private positionDropdown() {
    const inputRect = this.input.getBoundingClientRect();
    const dropdownMaxHeight = 240;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;
    const offset = 3;

    const width = inputRect.width;

    if (spaceBelow >= dropdownMaxHeight || spaceBelow >= spaceAbove) {
      // Position below the input
      this.dropdown.setAttribute('data-placement', 'below');
      this.dropdown.style.top = (inputRect.bottom + offset) + 'px';
      this.dropdown.style.bottom = 'auto';
      this.dropdown.style.maxHeight = Math.min(dropdownMaxHeight, spaceBelow) + 'px';
    } else {
      // Position above the input — more room above
      this.dropdown.setAttribute('data-placement', 'above');
      this.dropdown.style.bottom = (viewportHeight - inputRect.top + offset) + 'px';
      this.dropdown.style.top = 'auto';
      this.dropdown.style.maxHeight = Math.min(dropdownMaxHeight, spaceAbove) + 'px';
    }

    this.dropdown.style.left = inputRect.left + 'px';
    this.dropdown.style.width = width + 'px';
  }

  private openDropdown() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.positionDropdown();
    this.dropdown.setAttribute('data-open', '');

    // Find nearest option to current input value; if no input, start at first
    const parsed = parseTime(this.input.value);
    if (parsed) {
      this.activeIndex = this.findNearestOptionIndex(parsed);
    } else {
      this.activeIndex = 0;
    }
    this.renderSuggestions();
    this.scrollToActive();
  }

  private closeDropdown() {
    this.isOpen = false;
    this.dropdown.removeAttribute('data-open');
    this.dropdown.removeAttribute('data-placement');
    this.activeIndex = -1;
  }

  private commit() {
    const parsed = parseTime(this.input.value);
    if (parsed) {
      this.lastValidValue = formatTime(parsed);
      this.input.value = this.lastValidValue;
      this.setAttribute('value', this.lastValidValue);
      this.dispatchChangeEvent();
    } else if (this.input.value.trim() === '') {
      this.lastValidValue = '';
      this.setAttribute('value', '');
      this.dispatchChangeEvent();
    } else {
      // Invalid input: revert
      this.revert();
    }
  }

  private revert() {
    this.input.value = this.lastValidValue;
  }

  private dispatchChangeEvent() {
    const event = new CustomEvent('_albert-change', {
      bubbles: true,
      composed: true,
      detail: { value: this.input.value },
    });
    this.dispatchEvent(event);
  }

  private isOptionSelected(option: ParsedTime): boolean {
    const currentValue = this.getAttribute('value');
    if (!currentValue) return false;
    return formatTime(option) === currentValue;
  }

  private findNearestOptionIndex(time: ParsedTime): number {
    let minDiff = Infinity;
    let nearestIndex = 0;

    const timeMinutes = time.hours * 60 + time.minutes + (time.meridiem === 'PM' && time.hours !== 12 ? 12 * 60 : 0) - (time.meridiem === 'AM' && time.hours === 12 ? 12 * 60 : 0);

    this.options.forEach((option, index) => {
      let optionMinutes = option.hours * 60 + option.minutes + (option.meridiem === 'PM' && option.hours !== 12 ? 12 * 60 : 0) - (option.meridiem === 'AM' && option.hours === 12 ? 12 * 60 : 0);
      const diff = Math.abs(timeMinutes - optionMinutes);
      if (diff < minDiff) {
        minDiff = diff;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  }

  private getCurrentTime(): ParsedTime {
    return dateToLocalTime(new Date());
  }

  private updateInputValue() {
    const value = this.getAttribute('value');
    if (value) {
      this.input.value = value;
      this.lastValidValue = value;
    } else {
      this.input.value = '';
      this.lastValidValue = '';
    }
  }

  private getPlaceholder(): string {
    return this.getAttribute('placeholder') || 'Enter time';
  }

  static get observedAttributes() {
    return ['value', 'placeholder'];
  }

  attributeChangedCallback() {
    if (this.input) {
      this.updateInputValue();
    }
  }
}

customElements.define('albert-time-entry', TimeEntryField);
