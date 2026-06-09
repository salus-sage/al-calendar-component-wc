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

---

## Comparison

| Feature | Approach A (Component) | Approach B (Directive) |
|---|---|---|
| Selector | `<albert-datetime-picker-cva>` | `<albert-date-picker>` / `<albert-datetime-picker>` |
| Module required | `DateTimePickerModule` | `DatePickerModule` / `DateTimePickerModule` |
| Standalone | No | Yes (Angular 15+) |
| Extra DOM element | Yes (wrapper component) | No (direct on WC) |
| Best for | Angular 10, NgModule projects | Angular 9+, standalone projects |

---

## Build Output

The Angular wrappers are compiled by `tsc` (not esbuild) with:
- `target: ES2015` — downlevels optional chaining and class fields for Webpack 4
- `emitDecoratorMetadata: true` — required by Angular's DI system
- `module: ES2015` — `import`/`export` syntax Webpack 4 can process

Output is written to `dist/angular/`. The `angular/index.js` file in the package root is a Webpack 4 filesystem fallback (Webpack 4 ignores `package.json#exports`).
