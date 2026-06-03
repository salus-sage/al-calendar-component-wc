import { formatDate } from '../../shared/format-date';

const style = `
:host {
  display: block;
}

.cell {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--background);
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text);
  cursor: default;
  user-select: none;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.value[data-empty] {
  color: var(--text-dim);
}
`;

export class ReadOnlyDateCell extends HTMLElement {
  private shadow: ShadowRoot;
  private cellElement: HTMLElement;
  private valueElement: HTMLElement;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.cellElement = document.createElement('div');
    this.valueElement = document.createElement('span');
  }

  connectedCallback() {
    this.render();
    this.updateState();
  }

  private render() {
    const styleEl = document.createElement('style');
    styleEl.textContent = style;

    this.cellElement.setAttribute('part', 'cell');
    this.cellElement.classList.add('cell');
    this.cellElement.setAttribute('role', 'status');
    this.cellElement.setAttribute('aria-live', 'polite');

    this.valueElement.setAttribute('part', 'value');
    this.valueElement.classList.add('value');

    this.cellElement.appendChild(this.valueElement);

    this.shadow.appendChild(styleEl);
    this.shadow.appendChild(this.cellElement);
  }

  private updateState() {
    const value = this.getAttribute('value');
    const displayValue = value ? formatDate(value) : '';

    this.valueElement.textContent = displayValue || this.getEmptyState();
    this.valueElement.toggleAttribute('data-empty', !displayValue);
  }

  private getEmptyState(): string {
    return this.getAttribute('empty-state') || '—';
  }

  static get observedAttributes() {
    return ['value', 'empty-state'];
  }

  attributeChangedCallback() {
    this.updateState();
  }
}

customElements.define('albert-read-only-date-cell', ReadOnlyDateCell);
