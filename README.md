# al-date-picker

Native Web Components for date and datetime selection. Works in Angular, Lit, React, and any other framework — or with no framework at all.

- **`<albert-date-picker>`** — date-only field with calendar panel
- **`<albert-datetime-picker>`** — date + time field with free-text time entry and 15-minute suggestions
- **`<albert-read-only-date-cell>`** — lightweight read-only display cell for date or datetime values

## Installation

```bash
npm install al-date-picker
```

---

## Usage

### Vanilla / Lit / any framework

```js
import 'al-date-picker'; // registers both custom elements
```

```html
<albert-date-picker placeholder="Pick a date"></albert-date-picker>
<albert-datetime-picker placeholder="Select date and time"></albert-datetime-picker>
```

Listen for changes:

```js
document.querySelector('albert-date-picker').addEventListener('albert-change', (e) => {
  console.log(e.detail.value); // "2025-05-23" or null on clear
});

document.querySelector('albert-datetime-picker').addEventListener('albert-change', (e) => {
  console.log(e.detail.value); // "2025-05-23T14:30:00+05:30" or null on clear
});
```

---

## Attributes

| Attribute | Type | Description |
|---|---|---|
| `value` | `string` | Pre-populate: `YYYY-MM-DD` for date, ISO 8601 for datetime |
| `placeholder` | `string` | Overrides default placeholder text |
| `required` | boolean (presence) | Marks the field as required |
| `is-editable` | `"false"` | When set to `"false"`, renders the field as read-only |

---

## Events

| Event | `detail` | Description |
|---|---|---|
| `albert-change` | `{ value: string \| null }` | Fired when user selects a date/time, clicks Now, or clears. `null` on clear. |

Events are dispatched with `bubbles: true` and `composed: true` so they cross the Shadow DOM boundary and are picked up by Angular Zone.js automatically.

---

## Value format

| Picker | Displayed | Stored |
|---|---|---|
| `albert-date-picker` | `May 23, 2025` | `YYYY-MM-DD` |
| `albert-datetime-picker` | `May 23, 2025 3:30 PM` | ISO 8601 with UTC offset |

---

## Read-only date cell

`<albert-read-only-date-cell>` renders a formatted, non-interactive date or datetime value. It is useful inside data grids or detail views where a picker is not needed.

```html
<albert-read-only-date-cell value="2025-05-23"></albert-read-only-date-cell>
<albert-read-only-date-cell value="2025-05-23T14:30:00+05:30"></albert-read-only-date-cell>
<albert-read-only-date-cell empty-state="N/A"></albert-read-only-date-cell>
```

| Attribute | Type | Description |
|---|---|---|
| `value` | `string` | `YYYY-MM-DD` or ISO 8601 datetime. Omit or leave empty to show the empty state. |
| `empty-state` | `string` | Text shown when `value` is absent. Defaults to `—`. |

The component exposes two CSS shadow parts for custom styling:

```css
albert-read-only-date-cell::part(cell)  { font-size: 12px; }
albert-read-only-date-cell::part(value) { color: var(--my-text-color); }
```

---

## CSS shadow parts

All picker components expose named shadow parts for targeted styling without `::ng-deep` or global overrides.

### `<albert-date-picker>` and `<albert-datetime-picker>` fields

Both field elements expose the same four parts:

| Part | Element | State attributes |
|---|---|---|
| `field` | Outer clickable wrapper | `[data-disabled]` when `is-editable="false"`, `[data-error]` when `required` and empty |
| `value` | Text / placeholder span | `[data-empty]` when no value is set |
| `icon` | Calendar (date) or clock (datetime) icon | — |
| `error` | Required-field error message below the field | Shown when `required` is set and value is empty |

```css
albert-date-picker::part(field) {
  border-radius: 8px;
  padding: 8px 10px;
}

/* State-based targeting */
albert-date-picker::part(field)[data-error] { border-color: red; }
albert-date-picker::part(field)[data-disabled] { background: #f5f5f5; }
albert-date-picker::part(value)[data-empty] { font-style: italic; }

albert-date-picker::part(icon) { color: cornflowerblue; }
albert-date-picker::part(error) { font-size: 11px; }
```

Apply the same selectors on `albert-datetime-picker`.

---

### `<albert-date-picker-panel>`

| Part | Element | Notes |
|---|---|---|
| `panel` | Outer panel container | |
| `header` | Header row (navigation bar) | |
| `prev` | Previous-navigation button | |
| `next` | Next-navigation button | |
| `month-year-btn` | "Month Year ▾" toggle button | Visible in day view |
| `year-btn` | Year toggle button | Visible in month view |
| `decade-range` | Decade label (e.g. "2020 – 2029") | Visible in year view |
| `day-grid` | Calendar day grid | |
| `month-grid` | Month picker grid | |
| `year-grid` | Year picker grid | |
| `footer` | Footer row | |
| `today-btn` | "Today" shortcut button | |
| `clear-btn` | "Clear" button | |
| `month-pill` | Each month button in the month grid | Carries `[data-selected]`, `[data-current]` |
| `year-pill` | Each year button in the year grid | Carries `[data-selected]`, `[data-current]` |

```css
albert-date-picker-panel::part(panel) {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

albert-date-picker-panel::part(today-btn) { font-weight: 600; }
albert-date-picker-panel::part(month-pill)[data-selected] { border-radius: 6px; }
```

---

### `<albert-date-time-picker-panel>`

| Part | Element | Notes |
|---|---|---|
| `panel` | Outer panel container | |
| `header` | Header row (navigation bar) | |
| `prev` | Previous-navigation button | |
| `next` | Next-navigation button | |
| `month-year` | "Month Year ▾" toggle button | Note: named `month-year`, not `month-year-btn` |

```css
albert-date-time-picker-panel::part(panel) {
  border-radius: 12px;
}

albert-date-time-picker-panel::part(header) {
  background: #f8f9fa;
}
```

---

## Angular integration

The package ships a pre-built Angular wrapper at `al-date-picker/angular`. It provides Angular modules and directives with full `ControlValueAccessor` support (reactive forms and `ngModel`).

> **Required:** Always import the web component registration separately so the custom elements are defined in the browser:
> ```typescript
> import 'al-date-picker';
> ```

### Angular 10 — NgModule (Approach A: Component wrapper)

Easiest for Angular 10 projects. Wraps the web component in an Angular component.

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DateTimePickerModule } from 'al-date-picker/angular';
import 'al-date-picker';

@NgModule({
  imports: [ReactiveFormsModule, DateTimePickerModule],
})
export class AppModule {}
```

```typescript
// your.component.ts
import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-example',
  template: `
    <form [formGroup]="form">
      <albert-datetime-picker-cva
        formControlName="scheduledAt"
        placeholder="Select date and time"
      ></albert-datetime-picker-cva>
    </form>
  `,
})
export class ExampleComponent {
  form = new FormGroup({ scheduledAt: new FormControl(null) });
}
```

**`albert-datetime-picker-cva` inputs:** `required`, `placeholder`, `isEditable`  
**`albert-datetime-picker-cva` outputs:** `(valueChange)` — emits `string | null` on every change

### Angular 10 — NgModule (Approach B: Directive on native element)

No extra wrapper element in the DOM. Apply the directive directly on the web component element.

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePickerModule, DateTimePickerModule } from 'al-date-picker/angular';
import 'al-date-picker';

@NgModule({
  imports: [ReactiveFormsModule, DatePickerModule, DateTimePickerModule],
})
export class AppModule {}
```

```html
<!-- Reactive forms -->
<albert-date-picker formControlName="dueDate" placeholder="Pick a date"></albert-date-picker>
<albert-datetime-picker formControlName="scheduledAt" placeholder="Select date and time"></albert-datetime-picker>

<!-- Template-driven -->
<albert-date-picker [(ngModel)]="selectedDate"></albert-date-picker>

<!-- Output-only (no form binding) -->
<albert-date-picker (valueChange)="onDateChanged($event)"></albert-date-picker>
```

### Angular 15+ — Standalone components

```typescript
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DatePickerFieldCvaDirective } from 'al-date-picker/angular';
import 'al-date-picker';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, DatePickerFieldCvaDirective],
  template: `
    <albert-date-picker
      [formControl]="control"
      placeholder="Pick a date"
    ></albert-date-picker>
  `,
})
export class ExampleComponent {
  control = new FormControl<string | null>(null);
}
```

### Dynamic / backend-driven forms

When `FormControl` instances can't be pre-declared, use `(valueChange)`:

```typescript
fields: { id: string; type: string; label: string }[] = [];
formValues: Record<string, string | null> = {};

onFieldChange(fieldId: string, value: string | null) {
  this.formValues[fieldId] = value;
}
```

```html
<ng-container *ngFor="let field of fields">
  <albert-date-picker
    *ngIf="field.type === 'date'"
    [placeholder]="field.label"
    (valueChange)="onFieldChange(field.id, $event)">
  </albert-date-picker>
  <albert-datetime-picker
    *ngIf="field.type === 'datetime'"
    [placeholder]="field.label"
    (valueChange)="onFieldChange(field.id, $event)">
  </albert-datetime-picker>
</ng-container>
```

### Approach comparison

| Feature | Approach A (Component) | Approach B (Directive) |
|---|---|---|
| Selector | `<albert-datetime-picker-cva>` | `<albert-date-picker>` / `<albert-datetime-picker>` |
| Module | `DateTimePickerModule` | `DatePickerModule` / `DateTimePickerModule` |
| Standalone (Angular 15+) | No | Yes |
| Extra DOM element | Yes | No |
| `(valueChange)` output | Yes | Yes |
| Best for | Angular 10, NgModule projects | Angular 9+, standalone projects |

---

## Angular SSR / Universal

The component uses browser-only APIs (`customElements.define`, `document.body`). Guard the import if you use Angular Universal:

```typescript
// main.ts
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

if (isPlatformBrowser(inject(PLATFORM_ID))) {
  import('al-date-picker');
}
```

---

## Peer dependencies

```json
{
  "@angular/core": "^10 || ^15",
  "@angular/forms": "^10 || ^15"
}
```

Both are optional — only required when using the `al-date-picker/angular` entry point.

---

## Time entry (DateTimePicker)

The datetime picker uses a free-text time field modelled on Google Calendar:

| Typed | Result |
|---|---|
| `3` | 3:00 PM |
| `9` | 9:00 AM |
| `1530` | 3:30 PM |
| `3:30` | 3:30 (AM/PM heuristic) |
| `3pm` | 3:00 PM |
| `1145pm` | 11:45 PM |

A scrollable 15-minute suggestion dropdown assists entry. Free-text values (e.g. `3:37`) are preserved exactly.

---

## Utility functions

The main `al-date-picker` entry point exports standalone utility functions alongside the custom elements. They are useful for formatting picker output values, building custom time UIs, or working with time data without rendering a component.

```typescript
import {
  formatDate,
  parseTime,
  formatTime,
  timeToIso,
  generateTimeOptions,
} from 'al-date-picker';
import type { ParsedTime } from 'al-date-picker';
```

### `ParsedTime`

The common type used by all time utilities.

```typescript
interface ParsedTime {
  hours: number;       // 1–12
  minutes: number;     // 0–59
  meridiem: 'AM' | 'PM';
}
```

---

### `formatDate(value)`

Formats a `YYYY-MM-DD` date string or ISO 8601 datetime string into a locale-aware display string. Returns `''` for falsy input — safe to call with `null` and `undefined`.

```typescript
formatDate('2025-05-23')                    // "May 23, 2025"
formatDate('2025-05-23T14:30:00+05:30')    // "May 23, 2025 2:30 PM"
formatDate(null)                             // ""
formatDate(undefined)                        // ""
```

---

### `parseTime(input)`

Parses a free-text time string into a `ParsedTime` object. Returns `null` if the input is unrecognisable. This is the same parser used internally by `<albert-datetime-picker>`.

```typescript
parseTime('3')       // { hours: 3,  minutes: 0,  meridiem: 'PM' }  (PM heuristic)
parseTime('9')       // { hours: 9,  minutes: 0,  meridiem: 'AM' }  (AM heuristic)
parseTime('3pm')     // { hours: 3,  minutes: 0,  meridiem: 'PM' }
parseTime('1530')    // { hours: 3,  minutes: 30, meridiem: 'PM' }
parseTime('9:30')    // { hours: 9,  minutes: 30, meridiem: 'AM' }
parseTime('1145pm')  // { hours: 11, minutes: 45, meridiem: 'PM' }
parseTime('abc')     // null
```

AM/PM heuristic when no meridiem is supplied: hours 1–6 → PM, hours 7–11 → AM (mirrors the table in [Time entry](#time-entry-datetimepicker) above).

---

### `formatTime(time)`

Converts a `ParsedTime` object back into a display string. Returns `''` for `null` input.

```typescript
formatTime({ hours: 3,  minutes: 30, meridiem: 'PM' })  // "3:30 PM"
formatTime({ hours: 12, minutes: 0,  meridiem: 'AM' })  // "12:00 AM"
formatTime(null)                                          // ""
```

---

### `timeToIso(date, time)`

Combines a `Date` object and a `ParsedTime` into a full ISO 8601 string with the viewer's local UTC offset. The offset is computed from the specific date and time so DST transitions are handled correctly.

```typescript
const date = new Date(2025, 4, 23); // May 23 2025 (month is 0-indexed)
const time = parseTime('3:30pm');   // { hours: 3, minutes: 30, meridiem: 'PM' }

timeToIso(date, time);
// "2025-05-23T15:30:00+05:30"  (UTC offset varies by the viewer's locale)
```

---

### `generateTimeOptions()`

Returns an array of 96 `ParsedTime` objects covering a full 24-hour day in 15-minute intervals (12:00 AM through 11:45 PM). Useful for populating a custom time-selection dropdown.

```typescript
const options = generateTimeOptions(); // 96 entries

options[0];   // { hours: 12, minutes: 0,  meridiem: 'AM' }  — midnight
options[4];   // { hours: 1,  minutes: 0,  meridiem: 'AM' }  — 1:00 AM
options[48];  // { hours: 12, minutes: 0,  meridiem: 'PM' }  — noon
options[95];  // { hours: 11, minutes: 45, meridiem: 'PM' }  — last slot
```

---

## Package contents

| Entry point | Contents |
|---|---|
| `al-date-picker` | Bundled ESM — registers `<albert-date-picker>`, `<albert-datetime-picker>`, and `<albert-read-only-date-cell>`; exports utility functions (`formatDate`, `parseTime`, `formatTime`, `timeToIso`, `generateTimeOptions`) and the `ParsedTime` type |
| `al-date-picker/angular` | Angular modules and CVA directives for Angular 10+ |

---

## Browser support

Any browser that supports [Custom Elements v1](https://caniuse.com/custom-elementsv1) and [Shadow DOM](https://caniuse.com/shadowdomv1). The ESM bundle targets ES2015 so Webpack 4 (Angular 10) can parse it without additional transforms.

---

## License

Apache-2.0
