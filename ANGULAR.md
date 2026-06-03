# Angular Integration

This package provides Angular wrappers for the native Web Components in `@albert/date-picker`.

## Angular 10 CVA Wrapper

### Installation

```bash
npm install @albert/date-picker
```

### Usage

**In your NgModule:**

```typescript
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

**In your component (Reactive Forms):**

```typescript
import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-example',
  template: `
    <form [formGroup]="form">
      <albert-datetime-picker-cva
        [formControl]="form.get('dateTime')"
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

**In your component (Template-driven Forms):**

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

### Component API

**Selector:** `albert-datetime-picker-cva`

**Inputs:**
- `required: boolean` — Mark field as required (default: false)
- `placeholder: string` — Placeholder text (default: "Select a date and time")
- `isEditable: boolean` — Enable/disable the picker (default: true)

**Value Format:**
- Accepts and emits ISO 8601 datetime strings (e.g., `2025-03-15T14:30:00`)
- Returns `null` when cleared

**Features:**
- Full ControlValueAccessor support (works with Reactive Forms and Template-driven Forms)
- Integrates with Angular form validation
- Properly handles disabled state

## Angular 15 Directive (Standalone)

The Angular 15 approach uses a standalone directive that can be applied directly to the native Web Component. This is simpler and more composable than the component wrapper.

### Installation

```bash
npm install @albert/date-picker
```

### Usage

**In a standalone component:**

```typescript
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DateTimePickerFieldCvaDirective } from '@albert/date-picker/angular';
import '@albert/date-picker'; // Register Web Components

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ReactiveFormsModule, DateTimePickerFieldCvaDirective],
  template: `
    <albert-datetime-picker
      [formControl]="control"
      placeholder="Select a date and time"
    ></albert-datetime-picker>
  `,
})
export class ExampleComponent {
  control = new FormControl<string | null>(null);
}
```

**In NgModule-based component:**

```typescript
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DateTimePickerFieldCvaDirective } from '@albert/date-picker/angular';

@NgModule({
  imports: [
    ReactiveFormsModule,
    DateTimePickerFieldCvaDirective,
  ],
})
export class MyModule {}
```

### Directive API

**Selector:** `albert-datetime-picker[formControl], albert-datetime-picker[ngModel]`

**Inputs:**
- `required: boolean` — Mark field as required
- `placeholder: string` — Placeholder text
- `isEditable: boolean` — Enable/disable the picker

**Features:**
- Works directly on the native Web Component
- Standalone directive (no module wrapper needed)
- Full ControlValueAccessor support
- Compatible with both Reactive Forms and Template-driven Forms
- Works with both ngModel and formControl bindings

### Comparison: Angular 10 Component vs Angular 15 Directive

| Feature | Angular 10 (Component) | Angular 15 (Directive) |
|---------|----------------------|----------------------|
| Usage | `<albert-datetime-picker-cva>` | `<albert-datetime-picker>` |
| Module required | Yes (DateTimePickerModule) | No (standalone directive) |
| Bundle size | Slightly larger | Smaller |
| Complexity | Component wrapper | Direct binding |
| Best for | NgModule projects | Standalone projects |

## Build Output

The Angular wrappers are built to `dist/albert-date-picker-angular.js` with external dependencies on `@angular/core`, `@angular/forms`, and `@angular/common`.
