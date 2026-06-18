# Angular Integration

This package provides Angular wrappers for the native Web Components in `@albert/date-picker`.

> **Important:** You must always import the web component registration separately so the custom elements are defined in the browser:
> ```typescript
> import '@albert/date-picker'; // registers <albert-date-picker> and <albert-datetime-picker>
> ```

---

## Approach A — Component Wrapper (Angular 10+ / NgModule)

Use `DateTimePickerModule` or `DatePickerModule`. This wraps the web component in an Angular component, which is the safest option for Angular 10 and NgModule-based projects.

### Setup

```typescript
// app.module.ts (or any feature module)
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DateTimePickerModule } from '@albert/date-picker/angular';
import '@albert/date-picker'; // Register Web Components

@NgModule({
  imports: [
    ReactiveFormsModule,
    DateTimePickerModule,
  ],
})
export class AppModule {}
```

### Reactive Forms

```typescript
import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-example',
  template: `
    <form [formGroup]="form">
      <albert-datetime-picker-cva
        formControlName="dateTime"
        placeholder="Select a date and time"
      ></albert-datetime-picker-cva>
    </form>
  `,
})
export class ExampleComponent {
  form = new FormGroup({
    dateTime: new FormControl(null),
  });
}
```

### Template-Driven Forms

```typescript
@Component({
  selector: 'app-example',
  template: `
    <albert-datetime-picker-cva
      [(ngModel)]="selectedDateTime"
      placeholder="Select a date and time"
    ></albert-datetime-picker-cva>
  `,
})
export class ExampleComponent {
  selectedDateTime: string | null = null;
}
```

### Selector: `albert-datetime-picker-cva`

**Inputs:**
- `required: boolean` — Mark field as required (default: `false`)
- `placeholder: string` — Placeholder text (default: `"Select a date and time"`)
- `isEditable: boolean` — Enable/disable the picker (default: `true`)
- `minDate: string | null` — Optional. Earliest selectable date (`YYYY-MM-DD`). Disables all days, months, and years before this date in the panel.
- `maxDate: string | null` — Optional. Latest selectable date (`YYYY-MM-DD`). Disables all days, months, and years after this date in the panel.
- `validationMessage: string | null` — Optional. When non-null, a warning banner is shown inside the panel below the header. Automatically dismissed when the user picks a date.

**Outputs:**
- `valueChange: EventEmitter<string | null>` — Emits the selected ISO 8601 string whenever the value changes, or `null` when cleared. Fires in addition to the standard CVA path — works alongside `formControl`, `ngModel`, or with no form binding at all.

**Value format:** ISO 8601 datetime string (e.g. `2025-03-15T14:30:00`) or `null` when cleared.

---

## Approach B — Directive (Angular 9+ / NgModule or standalone)

Use `DatePickerModule` / `DateTimePickerModule` and apply the directive directly to the native custom element. No extra wrapper component in the DOM.

### Setup (NgModule — Angular 9/10/15)

```typescript
// app.module.ts (or any feature module)
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePickerModule, DateTimePickerModule } from '@albert/date-picker/angular';
import '@albert/date-picker'; // Register Web Components

@NgModule({
  imports: [
    ReactiveFormsModule,
    DatePickerModule,      // for <albert-date-picker>
    DateTimePickerModule,  // for <albert-datetime-picker>
  ],
})
export class AppModule {}
```

### Reactive Forms — date picker

```typescript
import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-example',
  template: `
    <form [formGroup]="form">
      <albert-date-picker
        formControlName="dueDate"
        placeholder="Pick a date"
      ></albert-date-picker>
    </form>
  `,
})
export class ExampleComponent {
  form = new FormGroup({
    dueDate: new FormControl(null),
  });
}
```

### Reactive Forms — datetime picker

```typescript
@Component({
  selector: 'app-example',
  template: `
    <form [formGroup]="form">
      <albert-datetime-picker
        formControlName="scheduledAt"
        placeholder="Select date and time"
      ></albert-datetime-picker>
    </form>
  `,
})
export class ExampleComponent {
  form = new FormGroup({
    scheduledAt: new FormControl(null),
  });
}
```

### Setup (Standalone — Angular 15+)

```typescript
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DatePickerFieldCvaDirective } from '@albert/date-picker/angular';
import '@albert/date-picker';

@Component({
  selector: 'app-example',
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

### Directive selectors

| Directive | Selector |
|---|---|
| `DatePickerFieldCvaDirective` | `albert-date-picker[formControl]`, `[ngModel]`, `[formControlName]` |
| `DateTimePickerFieldCvaDirective` | `albert-datetime-picker[formControl]`, `[ngModel]`, `[formControlName]` |

**Inputs (both directives):**
- `required: boolean`
- `placeholder: string`
- `isEditable: boolean`
- `minDate: string | null` — Optional. Earliest selectable date (`YYYY-MM-DD`).
- `maxDate: string | null` — Optional. Latest selectable date (`YYYY-MM-DD`).
- `validationMessage: string | null` — Optional. When non-null, a warning banner is shown inside the panel. Automatically dismissed on date selection.

**Outputs (both directives):**
- `valueChange: EventEmitter<string | null>` — Emits the selected value string on every change, or `null` when cleared. Fires alongside the CVA `onChange` path so it works with `formControlName`, `formControl`, `ngModel`, or no form binding.

---

## Reacting to Value Changes

All three wrappers expose a `(valueChange)` output that emits every time the user selects or clears a date. It works in every form scenario:

### Alongside a reactive form control

```html
<albert-date-picker
  [formControl]="dueDateControl"
  (valueChange)="onDueDateChanged($event)">
</albert-date-picker>
```

### Alongside `ngModel`

```html
<albert-date-picker
  [(ngModel)]="selectedDate"
  (valueChange)="onDateChanged($event)">
</albert-date-picker>
```

### Without any form binding

```html
<albert-date-picker
  (valueChange)="onDateChanged($event)">
</albert-date-picker>
```

### Dynamic backend-driven forms

When the form structure is determined at runtime from an API response and `FormControl` instances cannot be pre-declared, `(valueChange)` is the recommended pattern. Build a plain value map keyed by the field ID and update it on each change:

```typescript
// Fields driven by backend data
fields: { id: string; type: string; label: string }[] = [];
formValues: Record<string, string | null> = {};

onFieldsLoaded(fields: Field[]) {
  this.fields = fields;
  this.formValues = Object.fromEntries(fields.map(f => [f.id, null]));
}

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

> **Note:** `(valueChange)` does not replace `formControl` / `ngModel`. When you need Angular form validation, dirty/touched state, or `form.value` snapshots, combine it with a dynamic `FormGroup` using `addControl()`.

---

---

## Date bounds / validation

Both `minDate` and `maxDate` accept a `YYYY-MM-DD` string. When set, the calendar panel:

- Dims and disables day cells outside the range (carries `[data-out-of-range]` on the DOM element).
- Disables month pills where the entire month is outside the range.
- Disables year pills outside the range.
- Disables the prev/next navigation arrows when the calendar reaches the boundary month or decade.

### Approach A — component wrapper

```typescript
@Component({
  selector: 'app-task-form',
  template: `
    <form [formGroup]="form">
      <albert-datetime-picker-cva
        formControlName="scheduledAt"
        [minDate]="today"
        [maxDate]="deadline"
        placeholder="Select date and time"
      ></albert-datetime-picker-cva>
    </form>
  `,
})
export class TaskFormComponent {
  today = new Date().toISOString().split('T')[0]; // "2026-06-18"
  deadline = '2026-12-31';

  form = new FormGroup({
    scheduledAt: new FormControl(null),
  });
}
```

### Approach B — directive on native element

```typescript
@Component({
  selector: 'app-booking-form',
  template: `
    <form [formGroup]="form">
      <!-- Date picker: only future dates within the project window -->
      <albert-date-picker
        formControlName="dueDate"
        [minDate]="projectStart"
        [maxDate]="projectEnd"
        placeholder="Pick a due date"
      ></albert-date-picker>

      <!-- DateTime picker: no upper bound, only future datetimes -->
      <albert-datetime-picker
        formControlName="scheduledAt"
        [minDate]="today"
        placeholder="Select date and time"
      ></albert-datetime-picker>
    </form>
  `,
})
export class BookingFormComponent {
  today = new Date().toISOString().split('T')[0];
  projectStart = '2026-07-01';
  projectEnd = '2026-09-30';

  form = new FormGroup({
    dueDate: new FormControl(null),
    scheduledAt: new FormControl(null),
  });
}
```

### Dynamic bounds

Bind to component properties that change at runtime — the attribute is updated reactively via the setter:

```typescript
@Component({
  template: `
    <albert-date-picker
      formControlName="endDate"
      [minDate]="startDateControl.value"
    ></albert-date-picker>
  `,
})
export class DateRangeComponent {
  form = new FormGroup({
    startDate: new FormControl('2026-07-01'),
    endDate: new FormControl(null),
  });

  get startDateControl() {
    return this.form.get('startDate') as FormControl;
  }
}
```

### Edge cases

| Scenario | Behaviour |
|---|---|
| `minDate` only | All dates before `minDate` are disabled; no upper bound |
| `maxDate` only | All dates after `maxDate` are disabled; no lower bound |
| `minDate > maxDate` | Every day is disabled — consumer must ensure a valid window |
| `minDate === maxDate` | Only that single day is selectable |
| Invalid string (e.g. `"not-a-date"`) | Silently ignored — no constraint applied |
| `null` / `undefined` | Clears the constraint |

---

## Validation message banner

Use `validationMessage` to display a contextual warning banner inside the calendar panel. The banner appears below the header and above the calendar grid, and is automatically dismissed when the user selects a date.

This is distinct from Angular form validation — it is a **UX hint from the consumer** (e.g. "Date must be within the project timeline") surfaced directly inside the picker, before the user has made a choice.

### Approach A — component wrapper

```typescript
@Component({
  selector: 'app-task-form',
  template: `
    <form [formGroup]="form">
      <albert-datetime-picker-cva
        formControlName="scheduledAt"
        [minDate]="today"
        [validationMessage]="scheduledAtMessage"
        placeholder="Select date and time"
      ></albert-datetime-picker-cva>
    </form>
  `,
})
export class TaskFormComponent {
  today = new Date().toISOString().split('T')[0];

  form = new FormGroup({
    scheduledAt: new FormControl(null),
  });

  get scheduledAtMessage(): string | null {
    const ctrl = this.form.get('scheduledAt');
    if (ctrl?.touched && ctrl.invalid) {
      return 'Please select a future date and time.';
    }
    return null;
  }
}
```

### Approach B — directive on native element

```typescript
@Component({
  selector: 'app-booking-form',
  template: `
    <form [formGroup]="form">
      <albert-date-picker
        formControlName="dueDate"
        [minDate]="projectStart"
        [maxDate]="projectEnd"
        [validationMessage]="dueDateMessage"
        placeholder="Pick a due date"
      ></albert-date-picker>
    </form>
  `,
})
export class BookingFormComponent {
  projectStart = '2026-07-01';
  projectEnd   = '2026-09-30';

  form = new FormGroup({
    dueDate: new FormControl(null),
  });

  get dueDateMessage(): string | null {
    return this.form.get('dueDate')?.touched && !this.form.get('dueDate')?.value
      ? 'Due date must fall within the project window.'
      : null;
  }
}
```

### Dynamic / backend-driven forms

When the message is driven by API data or changes at runtime, bind it like any other property — the attribute is updated reactively:

```html
<albert-date-picker
  *ngFor="let field of fields"
  [placeholder]="field.label"
  [minDate]="field.minDate"
  [maxDate]="field.maxDate"
  [validationMessage]="fieldErrors[field.id]"
  (valueChange)="onFieldChange(field.id, $event)">
</albert-date-picker>
```

```typescript
fieldErrors: Record<string, string | null> = {};

onValidate(fieldId: string, serverMessage: string | null) {
  this.fieldErrors[fieldId] = serverMessage;
}
```

### Behaviour reference

| Scenario | Behaviour |
|---|---|
| `validationMessage` is set when panel opens | Banner shown immediately below header |
| User picks a date | Banner dismissed; `albert-change` fires normally |
| User clicks Clear | Panel closes; banner reappears on the next open if still set |
| `validationMessage` set to `null` / removed | No banner on next open |
| Banner appears alongside `minDate`/`maxDate` | Both constraints and the banner are active simultaneously |

---

## Comparison

| Feature | Approach A (Component) | Approach B (Directive) |
|---|---|---|
| Selector | `<albert-datetime-picker-cva>` | `<albert-date-picker>` / `<albert-datetime-picker>` |
| Module required | `DateTimePickerModule` | `DatePickerModule` / `DateTimePickerModule` |
| Standalone | No | Yes (Angular 15+) |
| Extra DOM element | Yes (wrapper component) | No (direct on WC) |
| `(valueChange)` output | Yes | Yes |
| `minDate` / `maxDate` inputs | Yes | Yes |
| `validationMessage` input | Yes | Yes |
| Best for | Angular 10, NgModule projects | Angular 9+, standalone projects |

---

## Build Output

The Angular wrappers are compiled by `tsc` (not esbuild) with:
- `target: ES2015` — downlevels optional chaining and class fields for Webpack 4
- `emitDecoratorMetadata: true` — required by Angular's DI system
- `module: ES2015` — `import`/`export` syntax Webpack 4 can process

Output is written to `dist/angular/`. The `angular/index.js` file in the package root is a Webpack 4 filesystem fallback (Webpack 4 ignores `package.json#exports`).
