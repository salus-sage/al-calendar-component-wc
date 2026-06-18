/**
 * Shared CSS fragment strings for the calendar panel components.
 *
 * Each export is a raw CSS string (no applyTokenDefaults applied here).
 * Panels import the fragments they need and compose them into a single
 * template string that is passed to applyTokenDefaults once:
 *
 *   import { NAV_BTN_CSS, MONTH_YEAR_GRIDS_CSS, ... } from '../../shared/panel-styles';
 *   const style = applyTokenDefaults(`
 *     :host { ... }
 *     ${PANEL_CONTAINER_CSS}
 *     ${NAV_BTN_CSS}
 *     ...panel-specific rules...
 *   `);
 *
 * Keeping shared rules here means a single edit fixes both panels.
 */

export const PANEL_CONTAINER_CSS = `
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
`;

export const PANEL_HEADER_CSS = `
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
}
`;

export const NAV_BTN_CSS = `
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

.nav-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
`;

export const HEADER_TOGGLE_BTNS_CSS = `
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
`;

export const DAY_GRID_LAYOUT_CSS = `
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
`;

/**
 * Base day cell rules shared by both panels.
 * Hover and today/adjacent variants differ between panels and are defined locally.
 */
export const DAY_CELL_BASE_CSS = `
.day-cell {
  width: var(--cell-size);
  height: var(--cell-size);
  border-radius: 50%;
  background: none;
  border: none;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-cell:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.day-cell[data-selected] {
  background: var(--cobalt-50);
  color: white;
  font-weight: 500;
}

.day-cell[data-selected]:hover {
  background: var(--cobalt-50);
}
`;

export const MONTH_YEAR_GRIDS_CSS = `
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

.month-pill:hover:not(:disabled),
.year-pill:hover:not(:disabled) {
  background: var(--cobalt-95);
}

.month-pill:disabled,
.year-pill:disabled {
  cursor: not-allowed;
  opacity: 0.35;
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
`;

export const UTILITY_SPACING_CSS = `
.py-1 {
  padding-block: calc(var(--spacing-sm) * 1);
}

.px-3 {
  padding-inline: calc(var(--spacing-sm) * 3);
}

.px-4 {
  padding-inline: calc(var(--spacing-sm) * 4);
}
`;

export const HIDDEN_CSS = `
[hidden] {
  display: none !important;
}
`;

export const VALIDATION_BANNER_CSS = `
.validation-banner {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.4;
  color: inherit;
  border-bottom: 1px solid var(--border, #d3d9e5);
}

.validation-banner[data-hidden] {
  display: none;
}

.validation-banner-icon {
  flex-shrink: 0;
  margin-top: 1px;
}
`;
