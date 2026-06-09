import { parseTime, formatTime, generateTimeOptions, ParsedTime } from '../../shared/parse-time';
import { applyTokenDefaults } from '../../shared/token-defaults';

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

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--background);
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text);
  transition: all 0.2s ease;
}

input:hover:not([data-disabled]) {
  border-color: var(--text-medium);
}

input:focus {
  border-color: var(--cobalt-50);
  outline: 2px solid var(--cobalt-50);
  outline-offset: -1px;
  box-shadow: 0 0 0 3px var(--cobalt-95);
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
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
}

.dropdown[data-placement="above"] {
  border-bottom: none;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

.suggestion {
  padding: 8px 12px;
  cursor: pointer;
  color: var(--text);
  transition: background 0.15s ease;
}

.suggestion:hover {
  background: var(--cobalt-95);
}

.suggestion[data-selected] {
  background: var(--slate-90);
  color: var(--text);
}

.suggestion[data-active] {
  background: var(--cobalt-50);
  color: white;
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

  connectedCallback() {
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

    this.dropdown.classList.add('dropdown');
    this.suggestionsContainer.classList.add('suggestions-container');
    this.dropdown.appendChild(this.suggestionsContainer);

    const errorEl = document.createElement('div');
    errorEl.classList.add('error');

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

    const width = inputRect.width;

    if (spaceBelow >= dropdownMaxHeight || spaceBelow >= spaceAbove) {
      // Position below the input
      this.dropdown.setAttribute('data-placement', 'below');
      this.dropdown.style.top = (inputRect.bottom - 1) + 'px';
      this.dropdown.style.bottom = 'auto';
      this.dropdown.style.maxHeight = Math.min(dropdownMaxHeight, spaceBelow) + 'px';
    } else {
      // Position above the input — more room above
      this.dropdown.setAttribute('data-placement', 'above');
      this.dropdown.style.bottom = (viewportHeight - inputRect.top - 1) + 'px';
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
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();

    let hours12 = hours % 12;
    if (hours12 === 0) hours12 = 12;

    const meridiem = hours < 12 ? 'AM' : 'PM';

    return { hours: hours12, minutes, meridiem };
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
