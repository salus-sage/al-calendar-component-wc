import { formatDate } from '../../shared/format-date';
import { DateTimePickerPanel } from './date-time-picker-panel';
import { applyTokenDefaults } from '../../shared/token-defaults';

const clockIcon = `<svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v72h56A8,8,0,0,1,192,128Z"/>
</svg>`;

const style = applyTokenDefaults(`
:host {
  display: block;
  --font-size-sm: 13px;
}

.field {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--background);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-sans);
  font-size: 14px;
}

.field:hover:not([data-disabled]) {
  border-color: var(--cobalt-50);
}

.field:focus-within,
.field[aria-expanded="true"] {
  border-color: var(--cobalt-50);
}

.field[data-disabled] {
  cursor: not-allowed;
  pointer-events: none;
  opacity: 0.6;
  color: var(--text-disabled);
}

.field[data-error] {
  border-color: var(--error, #d32f2f);
}

.value {
  flex: 1;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.value[data-empty] {
  color: var(--text-dim);
}

.field[data-disabled] .value {
  // color: var(--text-disabled);
}

.icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--text-medium);
  display: flex;
  align-items: center;
  justify-content: center;
}

.error {
  margin-top: 6px;
  font-size: 12px;
  color: var(--error, #d32f2f);
  display: none;
}

.error[data-visible] {
  display: block;
}
`);

export class DateTimePickerField extends HTMLElement {
  private shadow: ShadowRoot;
  private fieldElement: HTMLElement;
  private valueElement: HTMLElement;
  private errorElement: HTMLElement;
  private panel: DateTimePickerPanel | null = null;
  private panelChangeListener: ((e: Event) => void) | null = null;
  private _minDate: Date | null = null;
  private _maxDate: Date | null = null;
  private _validationMessage: string | null = null;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.fieldElement = document.createElement('div');
    this.valueElement = document.createElement('span');
    this.errorElement = document.createElement('div');
  }

  private _rendered = false;

  connectedCallback() {
    if (this._rendered) return;
    this._rendered = true;
    this.render();
    this.setupEventListeners();
    this.updateState();
  }

  disconnectedCallback() {
    if (this.panel && this.panelChangeListener) {
      this.panel.removeEventListener('albert-change', this.panelChangeListener);
    }
  }

  private render() {
    const styleEl = document.createElement('style');
    styleEl.textContent = style;

    this.fieldElement.setAttribute('part', 'field');
    this.fieldElement.classList.add('field');
    this.fieldElement.setAttribute('tabindex', '0');
    this.fieldElement.setAttribute('role', 'button');
    this.fieldElement.setAttribute('aria-haspopup', 'dialog');

    this.valueElement.setAttribute('part', 'value');
    this.valueElement.classList.add('value');

    const iconEl = document.createElement('span');
    iconEl.setAttribute('part', 'icon');
    iconEl.classList.add('icon');
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.innerHTML = clockIcon;

    this.fieldElement.appendChild(this.valueElement);
    this.fieldElement.appendChild(iconEl);

    this.errorElement.setAttribute('part', 'error');
    this.errorElement.classList.add('error');
    this.errorElement.setAttribute('role', 'alert');

    this.shadow.appendChild(styleEl);
    this.shadow.appendChild(this.fieldElement);
    this.shadow.appendChild(this.errorElement);
  }

  private setupEventListeners() {
    this.fieldElement.addEventListener('click', (e) => {
      if (this.isEditable()) {
        this.dispatchOpenEvent();
      }
      e.stopPropagation();
    });

    this.fieldElement.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && this.isEditable()) {
        e.preventDefault();
        this.dispatchOpenEvent();
      }
    });
  }

  private dispatchOpenEvent() {
    const event = new CustomEvent('_albert-open', {
      bubbles: false,
      composed: false,
      detail: { field: this },
    });
    this.dispatchEvent(event);
    this.openPanel();
  }

  private setupPanelListeners() {
    this.panelChangeListener = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.value !== undefined) {
        this.setAttribute('value', customEvent.detail.value || '');
        this.updateState();
        // Re-dispatch on the field element so Angular CVA directives hear the event
        this.dispatchEvent(
          new CustomEvent('albert-change', {
            bubbles: true,
            composed: true,
            detail: customEvent.detail,
          })
        );
      }
    };
    this.panel!.addEventListener('albert-change', this.panelChangeListener);

    // S6 — reset aria-expanded when panel closes without selection
    this.panel!.addEventListener('_albert-close', () => {
      this.fieldElement.setAttribute('aria-expanded', 'false');
      // Re-dispatch on the host element so external listeners (e.g. Angular templates)
      // can detect panel dismissal and treat it as end of data entry.
      this.dispatchEvent(
        new CustomEvent('albert-panel-close', { bubbles: true, composed: true })
      );
    });
  }

  // Add after the private openPanel() method
  public open(): void {
    if (this.isEditable()) {
      this.openPanel();
    }
  }


  private openPanel() {
    if (!this.panel) {
      this.panel = new DateTimePickerPanel();
      this.setupPanelListeners();
    }
    const currentValue = this.getAttribute('value');
    // S6 — reflect open state immediately
    this.fieldElement.setAttribute('aria-expanded', 'true');
    this.panel.open(this, currentValue || undefined, {
      minDate: this._minDate,
      maxDate: this._maxDate,
      validationMessage: this._validationMessage,
    });
  }

  private updateState() {
    const value = this.getAttribute('value');
    const isRequired = this.hasAttribute('required');
    const isEditable = this.isEditable();

    // Update value display
    const displayValue = value ? formatDate(value) : '';
    this.valueElement.textContent = displayValue || this.getPlaceholder();
    this.valueElement.toggleAttribute('data-empty', !displayValue);

    // Update field state
    this.fieldElement.toggleAttribute('data-disabled', !isEditable);
    this.fieldElement.toggleAttribute('data-error', isRequired && !value);

    // Update error display
    if (isRequired && !value) {
      this.errorElement.textContent = 'This field is required';
      this.errorElement.setAttribute('data-visible', '');
    } else {
      this.errorElement.removeAttribute('data-visible');
      this.errorElement.textContent = '';
    }

    // Update ARIA attributes
    this.fieldElement.setAttribute('aria-expanded', 'false');
    this.fieldElement.setAttribute(
      'aria-label',
      `Date and time picker, current value: ${displayValue || 'none'}`
    );
  }

  private getPlaceholder(): string {
    return this.getAttribute('placeholder') || 'Select a date and time';
  }

  private isEditable(): boolean {
    const isEditable = this.getAttribute('is-editable');
    return isEditable !== 'false';
  }

  static get observedAttributes() {
    return ['value', 'required', 'placeholder', 'is-editable', 'min-date', 'max-date', 'validation-message'];
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
    switch (name) {
      case 'min-date': {
        const d = new Date(newValue ?? '');
        this._minDate = newValue && !isNaN(d.getTime()) ? d : null;
        break;
      }
      case 'max-date': {
        const d = new Date(newValue ?? '');
        this._maxDate = newValue && !isNaN(d.getTime()) ? d : null;
        break;
      }
      case 'validation-message': {
        this._validationMessage = newValue ?? null;
        break;
      }
    }
    this.updateState();
  }
}

customElements.define('albert-datetime-picker', DateTimePickerField);
