# al-date-picker

Native Web Components for date and datetime selection. Works in Angular, Lit, React, and any other framework — or with no framework at all.

- **`<albert-date-picker>`** — date-only field with calendar panel
- **`<albert-datetime-picker>`** — date + time field with free-text time entry and 15-minute suggestions

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

## Package contents

| Entry point | Contents |
|---|---|
| `al-date-picker` | Bundled ESM web component — registers `<albert-date-picker>` and `<albert-datetime-picker>` |
| `al-date-picker/angular` | Angular modules and CVA directives for Angular 10+ |

---

## Browser support

Any browser that supports [Custom Elements v1](https://caniuse.com/custom-elementsv1) and [Shadow DOM](https://caniuse.com/shadowdomv1). The ESM bundle targets ES2015 so Webpack 4 (Angular 10) can parse it without additional transforms.

---

## License

MIT
