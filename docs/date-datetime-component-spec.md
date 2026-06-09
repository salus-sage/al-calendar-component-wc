# Date & DateTime Picker — Component Development Spec

**Project:** Date and DateTime canonical components
**Status:** In development
**Type:** Native Web Components (`customElements.define`)
**Scope:** New — not framework-specific; must work in Angular, Lit, and React

---

## 1. Background & Rationale

Albert's UI spans three frontend frameworks (Angular, Lit, React). A single native Web Component implementation avoids maintaining three separate picker implementations and guarantees identical behavior and appearance across all surfaces. Each framework can bind to the standard DOM API (attributes, events, slots) natively.

The interaction model is based on:
- **PrimeNG Calendar** — behavioral reference for date drill-down navigation
- **Google Calendar time field** — reference for the free-text time entry UX

---

## 2. Stack Decision

| Concern | Choice | Rationale |
|---------|--------|-----------|
| **Language** | TypeScript | Type safety for the date/time domain logic (parsing, validation, ISO formatting); consistent with Albert's existing frontend codebase |
| **Component model** | Vanilla Web Components (`customElements.define`) | Zero runtime dependencies; maximum portability across Angular, Lit, and React without adaptation layers |
| **Styling** | CSS custom properties + Shadow DOM | Scoped styles via Shadow DOM; Albert DS tokens exposed through `::part` and CSS variables for host-level theming |
| **Build output** | ESM bundle (single file per component) | Tree-shakeable; importable directly in any framework or via a `<script type="module">` tag |
| **No framework** | Explicitly no Lit, Stencil, or similar | Avoids any compile-time or runtime dependency; the component is the artifact, not the build output of a framework |

### Shadow DOM strategy

Each component uses an **open** Shadow DOM (`attachShadow({ mode: 'open' })`):
- Styles are scoped and won't leak into or from the host document
- Albert DS tokens (CSS custom properties) inherit through the shadow boundary automatically — no special handling needed
- `::part()` selectors expose named parts for host-level style overrides where needed (e.g. `::part(panel)`, `::part(day-cell)`)

### Framework integration notes

| Framework | Integration pattern |
|-----------|-------------------|
| **Angular** | Use `CUSTOM_ELEMENTS_SCHEMA`; bind via `[attr]` and `(eventName)` listeners |
| **Lit** | Import and use directly as HTML tags; Lit's property binding works natively with web component attributes |
| **React** | Wrap in a thin React adapter component that maps props → attributes and synthetic events → DOM events (standard React + web component pattern) |

---

## 2. Component Inventory

| Component | Description | Status |
|-----------|-------------|--------|
| `DatePickerField` | Full-width clickable field with calendar icon (right-aligned). Entire field area is clickable. Opens `DatePickerPanel` on click. | New |
| `DateTimePickerField` | Same as `DatePickerField` but with a clock icon. Opens `DateTimePickerPanel`. | New |
| `DatePickerPanel` | Calendar popover with 3-level navigation (day / month / year). Mounts on `document.body` via `position: fixed` to escape modal/panel overflow clipping. Opens above or below the field based on available viewport space. | New |
| `DateTimePickerPanel` | Extends `DatePickerPanel` with a single free-text time entry field + 15-minute suggestion dropdown, and a read-only timezone display. Time + timezone row hidden during month/year navigation; Now/Clear footer persists across all views. | New |
| `TimeEntryField` | Single editable text input that parses free-text time entry and offers a scrollable 15-minute suggestion dropdown. Replaces earlier hour/minute combo boxes + AM/PM dropdown. | New |
| `ReadOnlyDateCell` | Grid cell rendering a formatted date/timestamp string or empty state. | Follows existing read-only cell pattern |
| `InlineError` | Field-level validation message for required empty state. | Follows existing InlineError pattern |

---

## 3. Design Tokens

All components must use Albert DS tokens. No hardcoded values.

| Category | Tokens |
|----------|--------|
| Font | `var(--font-sans)` |
| Text | `var(--text)`, `var(--text-medium)`, `var(--text-dim)`, `var(--text-disabled)` |
| Brand/interactive | `var(--cobalt-50)` — selected state, focus ring, footer buttons |
| Backgrounds | `var(--background)` (panel), `var(--cobalt-95)` (hover/selected option), `var(--slate-90)` (today/current + active suggestion) |
| Borders | `var(--border)`, `var(--slate-70)` |
| Radius | `6px` — panel, month/year pills; `var(--radius-sm)` — controls |
| Shadows | `var(--shadow-3)` — panel + dropdown drop shadow |
| Icons | Phosphor — calendar, clock, caret-down; consistent with Albert icon system |
| Field chrome | Reuse existing `.date-wrap` field pattern |

**Density:** Panel is `268px` wide with `6px` corner radius. Day cells are `30×30px`. Month/year pills hug text (`justify-self: center` + padding). Type sizes: 14px calendar/day, 13px month/year pills.

---

## 4. Calendar Navigation

Three-level drill-down. All views share the same panel chrome (header with prev/next arrows, footer).

### 4.1 Day View (default)

- Header: single `Month Year ▾` clickable button → switches to Month view
- Prev/next arrows: navigate months
- Weekday labels: same color and weight as date numbers (not dimmed)
- Day cells: `30×30px` circles
  - Selected day: cobalt-50 filled circle
  - Today: slate-90 background
  - Adjacent-month days: dimmed (`var(--text-dim)`)
- Clicking a day → **close panel** (date picker) or **stay open** (datetime picker); display `Month D, YYYY`; store as `YYYY-MM-DD`

### 4.2 Month View

- Header: `Year ▾` clickable button → switches to Year view; prev/next navigate years
- Grid: 3 columns × 4 rows of abbreviated month names (Jan–Dec)
- Selected pill: cobalt-50 fill, `6px` radius, hugs text width (not full-width column)
- Current month: slate-90 background
- Clicking a month → returns to Day view for that month

### 4.3 Year View

- Header: static decade range (e.g. `2020 – 2029`); prev/next step by decade
- Grid: 2 columns × 5 rows of years
- Selected pill: cobalt-50 fill, `6px` radius, hugs text width
- Current year: slate-90 background
- Clicking a year → goes to Month view for that year

### 4.4 Highlight Behavior (Important)

The cobalt-50 selected pill in month and year views reflects the **committed selection only** — not the navigation cursor. Navigating to a year or decade where nothing is selected shows no pill. This prevents the defect where selecting May 2026 caused May to appear selected when later browsing to 2025 or 2027. The slate-90 "current" highlight still marks today's month/year for orientation regardless of selection.

### 4.5 Deviations from PrimeNG defaults

| Customization | Albert behavior |
|---------------|----------------|
| Header entry point | Single `Month Year ▾` button opens month view |
| Chevron icon | Phosphor `caret-down` SVG |
| Weekday labels | Same color/weight as date numbers |
| Month/year pill sizing | Hugs text; does not stretch to fill column |
| Pill border-radius | `6px` |
| Highlight timing | Committed selection only — not navigation cursor |

---

## 5. Time Entry (DateTimePicker only)

### 5.1 Component

Single free-text `TimeEntryField` — replaces hour/minute spinners and separate AM/PM dropdown. Modeled on Google Calendar's time field.

### 5.2 Parsing Rules

| Typed | Result | Rule |
|-------|--------|------|
| `3` | 3:00 PM | Bare hour → heuristic |
| `9` | 9:00 AM | Bare hour → heuristic |
| `12` | 12:00 PM | 12 → noon |
| `0` | 12:00 AM | 0 → midnight |
| `330` | 3:30 PM | 3 digits → 1-digit hour + 2-digit minute |
| `1530` | 3:30 PM | 4 digits → 24h hour + minute |
| `3:30`, `3.30` | 3:30 (heuristic AM/PM) | Explicit separator |
| `15`, `15:00`, `1500` | 3:00 PM | 24h unambiguous |
| `3pm`, `3 p` | 3:00 PM | Explicit meridiem |
| `1145pm` | 11:45 PM | Compact + meridiem |

**AM/PM heuristic** (only for ambiguous bare 12-hour input, no meridiem, hour ≤ 12):
- `1`–`6` → PM
- `7`–`11` → AM
- `12` → PM (noon), `0` → AM (midnight)
- Two-digit 24h input (`13`–`23`) is unambiguous — bypasses heuristic
- Explicit `am`/`pm` always wins; constrains hour to 1–12
- Natural language ("noon", "midnight") is **not** supported

### 5.3 Suggestion Dropdown

- 96 options at 15-minute intervals (`12:00 AM` … `11:45 PM`)
- Opens on focus/click and while typing
- Opening always shows the full list, scrolled to and highlighting the nearest option to current value (no premature filtering on open)
- Typing scrolls to nearest matching suggestion (scroll target, not a hard filter)
- Keyboard: `↑`/`↓` move active suggestion and mirror it into the input; `Enter` commits; `Esc` reverts; clicking an option commits
- Free-minute values (e.g. `3:37`) are preserved exactly — the dropdown is a convenience, not a constraint

### 5.4 Commit & Validation

- **Commit** triggers: `Enter`, selecting a suggestion, or **blur** (focus leaving the field)
- On commit: parse → normalize to `H:MM AM/PM` → write back to input
- **Invalid or empty** input (e.g. `25:99`, `13pm`, junk): revert to last valid value on blur — never store malformed time
- **Blur both commits and closes** the suggestion dropdown — no second click required to dismiss

### 5.5 Defaults

- Time defaults to the **exact current time** (no rounding to nearest 15 min)
- AM/PM derived from system time
- Same exact-now default applies on first open, after **Clear**, and via **Now** button

### 5.6 Timezone Display

- Read-only display of browser/OS timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Shown below the time entry field in day view
- Hidden during month/year navigation; restored in day view
- Not user-editable; exposed to assistive tech as a labeled non-interactive value (`"Timezone"`)

---

## 6. Panel Footer

Both `DatePickerPanel` and `DateTimePickerPanel` have a footer.

| Button | Date Picker | DateTime Picker |
|--------|-------------|-----------------|
| **Today** | Selects today's date; closes panel | — |
| **Now** | — | Sets current date + exact current time; closes panel |
| **Clear** | Reverts to empty/placeholder; disables Create/Save if required | Same + resets internal time to current time |

Footer is **always visible** across day, month, and year views.

---

## 7. Panel Dismissal

Intentionally asymmetric — the two pickers have different job counts.

| Event | DatePickerPanel | DateTimePickerPanel |
|-------|-----------------|---------------------|
| Day cell selected | ✅ Close | ❌ Stay open |
| Today / Now clicked | ✅ Close | ✅ Close |
| Clear clicked | ✅ Close | ✅ Close |
| Click inside panel (whitespace, calendar) | ❌ No-op | ❌ No-op (stay open) |
| Click outside panel | ✅ Close | ✅ Close |
| `Esc` key | ✅ Close | ✅ Close |

**Implementation:** Panels mount on `document.body`. A document-level click handler closes panels; each panel root calls `stopPropagation()` so interior clicks never reach that handler. The date picker's day/Today/Clear handlers call `close()` explicitly.

---

## 8. Panel Positioning

- Mounts on `document.body` via `position: fixed` — escapes modal and panel overflow clipping
- Opens **below** the field if sufficient space; opens **above** if not
- Panel never overlaps the field itself
- **Only one picker panel open at a time** — opening one closes any other

---

## 9. State Definitions

| State | Trigger | UI Behavior |
|-------|---------|-------------|
| **Empty — Optional** | No value; field is optional | Placeholder: "Select a date" / "Select a date and time" |
| **Empty — Required** | No value; field is required | Label shows required asterisk; placeholder shown; Create/Save disabled |
| **Focused / Open** | User clicks field or icon | Panel opens; field renders in focused state |
| **Filled** | User selects date (+ time for datetime) | Field displays formatted value; date picker closes, datetime picker stays open |
| **Filled — Reopened** | User clicks a filled field | Panel reopens with current value pre-selected |
| **Filled — Cleared** | User clicks Clear | Field returns to empty/placeholder; internal time resets to current time; required field disables Create/Save |
| **Read-only — Filled (Grid)** | Grid cell with value | Displays formatted value as plain text; no interaction |
| **Read-only — Empty (Grid)** | Grid cell with no value | Empty cell per existing grid convention |
| **Non-editable** | `isEditable: false` | Field locked (follows existing `isEditable: false` pattern) |
| **Error — Required** | Required field left empty after interaction | Inline error below field; follows existing `InlineError` pattern |

---

## 10. Stored & Displayed Values

| Type | Displayed as | Stored as |
|------|-------------|-----------|
| Date | `Month D, YYYY` (e.g. `May 23, 2026`) | `YYYY-MM-DD` |
| Timestamp | `Month D, YYYY H:MM AM/PM` (e.g. `May 23, 2026 3:30 PM`) | ISO 8601 with UTC offset `YYYY-MM-DDTHH:MM:SS+HH:MM` |

---

## 11. Interaction Contracts

### DatePickerField

- Click anywhere on field or calendar icon → open `DatePickerPanel` in day view
- `Month Year ▾` button → switch to month view
- `Year ▾` button → switch to year view
- Month cell clicked → return to day view for that month
- Year cell clicked → go to month view for that year
- Prev/next in day view → navigate months; in month view → navigate years; in year view → navigate decades
- Day cell clicked → close panel; display formatted date; store as `YYYY-MM-DD`
- Today → select today; close panel
- Clear → revert to empty; disable Create/Save if required
- Panel whitespace click → no-op

### DateTimePickerField

- Click anywhere on field or clock icon → open `DateTimePickerPanel` in day view
- Same month/year navigation as above
- During month/year navigation → time + timezone row hidden; Now/Clear footer stays visible
- A date must be selected from the calendar for the field value to populate
- Time field: free-text entry + 15-minute suggestion dropdown (see §5)
- AM/PM expressed through typed/parsed value — no separate AM/PM control
- Timezone: read-only display, not editable
- Click anywhere inside panel → panel stays open
- Date + time selected → display as `Month D, YYYY H:MM AM/PM`; store as ISO 8601 with UTC offset
- Now → set current date + exact time; close panel
- Clear → revert to empty; reset internal time to current time; disable Create/Save if required

---

## 12. Accessibility

Follow existing Albert accessibility patterns for form fields. Additional picker-specific patterns:

| Requirement | Specification |
|-------------|---------------|
| Field keyboard activation | Focusable via `Tab`; openable via `Enter` or `Space` |
| Calendar keyboard nav | Arrow keys navigate days; `Tab` moves between month/year controls and footer; `Enter` selects a day |
| Month/year drill-down | `Enter` or `Space` on `Month Year ▾` / `Year ▾` opens next view; `Esc` closes panel and returns focus to field |
| Popover role | `role="dialog"` + `aria-modal="true"` when open; focus moves into panel on open; returns to field on close |
| Decorative icon | `aria-hidden="true"` on calendar/clock icon; field element carries accessible label |
| Timezone display | Exposed as labeled, non-interactive value (`"Timezone"`), not a control |
| Time entry | ARIA combobox pattern: text input owns `role="listbox"` of 15-minute options; typing updates active suggestion; `↑`/`↓` move it; `Enter`/click commit; free-text entry accepted; committed value announced |

---

## 13. Angular Integration Guide

Albert runs both **Angular 10** and **Angular 15** in production. These versions differ meaningfully in how they consume web components. Both are supported — but developers must follow the correct pattern for their version.

---

### 13.1 Version differences at a glance

| Concern | Angular 10 | Angular 15 |
|---------|-----------|-----------|
| Component model | NgModule-based only | NgModule **or** standalone components (stable in v15) |
| `CUSTOM_ELEMENTS_SCHEMA` location | Must be on the `@NgModule` | Can be on `@NgModule` **or** on a standalone `@Component({ schemas: [...] })` |
| Standalone components | ❌ Not available | ✅ Available and stable |
| Directive composition API | ❌ Not available | ✅ Available — cleaner `ControlValueAccessor` pattern |
| `ControlValueAccessor` for forms | Manual boilerplate on a wrapper component | Can be extracted into a standalone directive via directive composition API |

---

### 13.2 Step 1 — Register the web component

Import and register the component **once** at app bootstrap, before Angular initialises. Placing it in `main.ts` or an early-loaded module ensures it is defined before any template references it.

```typescript
// main.ts (Angular 10 and 15)
import '@albert/date-picker'; // registers <albert-date-picker> and <albert-datetime-picker>
```

The import executes `customElements.define(...)` as a side effect. No further registration is needed.

---

### 13.3 Step 2 — Add `CUSTOM_ELEMENTS_SCHEMA`

Angular's template compiler will error on unknown element tags without this. Scope it as narrowly as possible — **do not add it to `AppModule`**.

**Angular 10 — NgModule approach (only option in v10)**

```typescript
// date-picker-wrapper.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatePickerWrapperComponent } from './date-picker-wrapper.component';

@NgModule({
  declarations: [DatePickerWrapperComponent],
  exports: [DatePickerWrapperComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // scoped to this module only
})
export class DatePickerWrapperModule {}
```

Other modules import `DatePickerWrapperModule` and use `<albert-date-picker-wrapper>` — they never need `CUSTOM_ELEMENTS_SCHEMA` themselves, and Angular's template checking remains intact everywhere else.

**Angular 15 — Standalone component approach**

```typescript
// date-picker-wrapper.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  standalone: true,
  selector: 'albert-date-picker-wrapper',
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // scoped to this component only
  template: `<albert-date-picker ...></albert-date-picker>`,
})
export class DatePickerWrapperComponent { ... }
```

> ⚠️ **Why scope matters:** `CUSTOM_ELEMENTS_SCHEMA` disables Angular's unknown-element and unknown-property template checks across the entire module/component it is applied to — including typos. Isolating it to a dedicated wrapper module/component is the correct pattern; do not add it to feature modules or `AppModule`.

---

### 13.4 Step 3 — Attribute and property binding

The web component accepts string attributes only. Angular's `[attr.value]` syntax sets attributes; use it for passing values.

```html
<!-- Angular 10 and 15 template syntax -->
<albert-date-picker
  [attr.value]="selectedDate"
  [attr.required]="isRequired"
  [attr.placeholder]="'Select a date'"
  (albert-change)="onDateChange($event)"
></albert-date-picker>
```

**Attribute contract:**

| Attribute | Type | Description |
|-----------|------|-------------|
| `value` | `string` — `YYYY-MM-DD` for date, ISO 8601 for datetime | Current value; set externally to pre-populate |
| `required` | boolean attribute (presence = true) | Marks field required |
| `placeholder` | `string` | Overrides default placeholder text |
| `is-editable` | boolean attribute | When absent or `"false"`, renders field as non-editable |

**Event contract — always dispatched with `{ bubbles: true, composed: true }`:**

| Event | `detail` payload | Description |
|-------|-----------------|-------------|
| `albert-change` | `{ value: string \| null }` | Fired on commit (day selected, Now/Clear clicked). `null` on Clear. |

The `composed: true` flag is **required** — without it, events do not cross the Shadow DOM boundary and Zone.js will not pick them up for change detection.

---

### 13.5 Step 4 — Angular forms integration (`ControlValueAccessor`)

To use the picker with `ngModel` or reactive forms (`formControl`), a `ControlValueAccessor` wrapper is required. Without it, Angular's form API cannot read or write the picker's value.

**Angular 10 — wrapper component pattern**

```typescript
// date-picker-wrapper.component.ts
import { Component, forwardRef, ElementRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  template: `<albert-date-picker></albert-date-picker>`,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePickerWrapperComponent),
    multi: true,
  }],
})
export class DatePickerWrapperComponent implements ControlValueAccessor, OnInit {
  private onChange: (val: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const picker = this.el.nativeElement.querySelector('albert-date-picker');
    picker.addEventListener('albert-change', (e: CustomEvent) => {
      this.onChange(e.detail.value);
      this.onTouched();
    });
  }

  writeValue(value: string | null): void {
    const picker = this.el.nativeElement.querySelector('albert-date-picker');
    if (picker) value ? picker.setAttribute('value', value) : picker.removeAttribute('value');
  }

  registerOnChange(fn: (val: string | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    const picker = this.el.nativeElement.querySelector('albert-date-picker');
    if (picker) isDisabled
      ? picker.setAttribute('is-editable', 'false')
      : picker.removeAttribute('is-editable');
  }
}
```

**Angular 15 — directive composition pattern (preferred for v15)**

```typescript
// date-picker-cva.directive.ts
import { Directive, forwardRef, HostListener, inject, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  standalone: true,
  selector: 'albert-date-picker[formControlName], albert-date-picker[formControl], albert-date-picker[ngModel]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePickerCvaDirective),
    multi: true,
  }],
})
export class DatePickerCvaDirective implements ControlValueAccessor {
  private el = inject(ElementRef);
  private onChange: (val: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  @HostListener('albert-change', ['$event'])
  onPickerChange(e: CustomEvent) {
    this.onChange(e.detail.value);
    this.onTouched();
  }

  writeValue(value: string | null): void {
    value
      ? this.el.nativeElement.setAttribute('value', value)
      : this.el.nativeElement.removeAttribute('value');
  }

  registerOnChange(fn: (val: string | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    isDisabled
      ? this.el.nativeElement.setAttribute('is-editable', 'false')
      : this.el.nativeElement.removeAttribute('is-editable');
  }
}
```

Usage in Angular 15 template (no wrapper component needed):

```html
<albert-date-picker [formControl]="myDateControl"></albert-date-picker>
```

---

### 13.6 Change detection

Angular uses Zone.js to patch async operations and trigger change detection. Two rules must hold for events to propagate correctly into Angular:

1. **`composed: true` on all `CustomEvent` dispatches** — without this, events are swallowed at the Shadow DOM boundary and Zone.js never sees them
2. **`bubbles: true`** — required for Angular's host listener and `@HostListener` to catch the event from inside the shadow root

These are set in the web component itself (not the consumer's responsibility), but consumers should know to verify them when debugging missing change detection updates.

If using `ChangeDetectionStrategy.OnPush` in a wrapper component, call `ChangeDetectorRef.markForCheck()` inside the `albert-change` handler to trigger the check cycle.

---

### 13.7 SSR / Angular Universal

If any Albert surface uses Angular Universal (server-side rendering), the following APIs used by the picker are **browser-only** and will throw at SSR time:

| API | Risk |
|-----|------|
| `customElements.define` | Not available in Node.js |
| `document.body.appendChild` | Panel mounting on `document.body` |
| `position: fixed` panel | Layout API — browser only |
| `Intl.DateTimeFormat().resolvedOptions().timeZone` | Available in Node 13+, safe in most cases |

**Guard pattern for the component import:**

```typescript
// main.ts or a lazy-loaded module
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

if (isPlatformBrowser(inject(PLATFORM_ID))) {
  import('@albert/date-picker'); // deferred, browser-only
}
```

If SSR is not currently in use on any Albert surface, this is low priority — but worth noting for future-proofing.

---

### 13.8 Quick reference — which pattern to use

| Scenario | Angular 10 | Angular 15 |
|----------|-----------|-----------|
| Template-only (no forms) | `DatePickerWrapperModule` + `CUSTOM_ELEMENTS_SCHEMA` on that module | Standalone wrapper component with `schemas` |
| `ngModel` / reactive forms | `ControlValueAccessor` wrapper component | `DatePickerCvaDirective` via directive composition |
| `OnPush` component | Call `markForCheck()` in `albert-change` handler | Same |
| SSR (Universal) | Guard import with `isPlatformBrowser` | Same |

---

## 14. Out of Scope

- Natural language parsing ("noon", "tomorrow", etc.) in time entry
- User-editable timezone selection
- Multi-date or date-range selection
- Time entry in the date-only picker (`DatePickerField`)
- AG Charts time axis date input UX — AG Grid's native defaults are used there; this component does not apply
