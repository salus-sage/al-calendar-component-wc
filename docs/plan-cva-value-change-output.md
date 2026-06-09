# Plan: Add `valueChange` Output to Angular CVA Wrappers

**Status:** Planned  
**Estimated effort:** ~1.5 hours  
**Author:** For manager review

---

## Background & Motivation

Consumer developers using dynamic backend-driven forms cannot pre-declare
`FormControl` instances at compile time. Their form structure is determined at
runtime from API responses (e.g. a list of parameter fields each with a type).

Currently, reacting to a value change from `albert-date-picker` or
`albert-datetime-picker` requires the consumer to know which Angular forms
pattern they are in — reactive (`valueChanges` subscription) or template-driven
(`(ngModelChange)` binding) — and set it up accordingly. This creates friction
in the most common dynamic-form scenario.

An explicit `@Output() valueChange` on the CVA directive/component gives
consumers a single, framework-agnostic event binding that works in all cases:
reactive forms, template-driven forms, or no form at all.

---

## Affected Files

| File | Type of Change |
|------|----------------|
| `src/angular/date-picker-field-cva.directive.ts` | Add `@Output() valueChange` + emit in listener |
| `src/angular/datetime-picker-field-cva.directive.ts` | Add `@Output() valueChange` + emit in listener |
| `src/angular/datetime-picker-field-cva.component.ts` | Add `@Output() valueChange` + emit in listener |
| `src/angular/datetime-picker.module.ts` | Fix: add missing `DateTimePickerFieldCvaDirective` to `declarations` + `exports` |
| `tests/angular-cva-output.spec.ts` | New Angular TestBed unit tests (9 cases) |

---

## Step-by-Step Implementation

### Step 1 — `date-picker-field-cva.directive.ts`

Add `Output` and `EventEmitter` to the Angular core import:

```typescript
import {
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
```

Declare the output after the existing `@Input()` setters:

```typescript
@Output() valueChange = new EventEmitter<string | null>();
```

Emit inside `setupEventListeners` alongside the existing CVA call:

```typescript
this.changeListener = (e: Event) => {
  const value = (e as CustomEvent).detail?.value || null;
  this.onChange(value);           // CVA path — untouched
  this.valueChange.emit(value);   // explicit consumer API
};
```

### Step 2 — `datetime-picker-field-cva.directive.ts`

Identical three-point change as Step 1 (`import`, `@Output`, `.emit()`).

### Step 3 — `datetime-picker-field-cva.component.ts`

Same `@Output() valueChange` declaration and `this.valueChange.emit(value)` call
inside `setupEventListeners`. Note: this component attaches its listener to
`this.pickerRef.nativeElement` (in `ngAfterViewInit`) rather than
`this.elementRef` — the change sits at the same logical location.

### Step 4 — Fix `DateTimePickerFieldCvaDirective` missing from NgModule

`DateTimePickerFieldCvaDirective` is exported from `src/angular/index.ts` but
absent from `DateTimePickerModule`, making it unusable for consumers who import
the module. Fix in `datetime-picker.module.ts`:

```typescript
import { DateTimePickerFieldCvaDirective } from './datetime-picker-field-cva.directive';

@NgModule({
  declarations: [DateTimePickerFieldCvaComponent, DateTimePickerFieldCvaDirective],
  exports:      [DateTimePickerFieldCvaComponent, DateTimePickerFieldCvaDirective],
  imports:      [CommonModule],
  schemas:      [CUSTOM_ELEMENTS_SCHEMA],
})
export class DateTimePickerModule {}
```

### Step 5 — Unit tests (`tests/angular-cva-output.spec.ts`)

New Angular TestBed spec file. Nine cases covering all three wrappers:

For **each** of the three wrappers (date directive, datetime directive, datetime component):

- ✓ emits `valueChange` with the date/datetime string when `albert-change` fires
- ✓ emits `valueChange` with `null` when Clear fires (empty `detail.value`)
- ✓ does **not** emit `valueChange` on `blur` (only `onTouched` fires on blur)

### Step 6 — Build & smoke check

```bash
npm run build
# verify dist/albert-date-picker-angular.js contains 'valueChange'
npm test
# all existing Playwright tests must still pass
```

---

## Consumer Usage After This Change

### Reactive form with dynamic `formControlName`

```html
<albert-date-picker
  [formControlName]="field.id"
  (valueChange)="onFieldChange(field.id, $event)">
</albert-date-picker>
```

### Template-driven with dynamic `ngModel`

```html
<albert-date-picker
  [ngModel]="formValues[field.id]"
  (valueChange)="onFieldChange(field.id, $event)">
</albert-date-picker>
```

### No form (standalone usage)

```html
<albert-date-picker
  (valueChange)="onValueChanged($event)">
</albert-date-picker>
```

---

## Backward Compatibility

- The CVA contract (`registerOnChange`, `writeValue`, `registerOnTouched`) is untouched.
- Directive selectors are unchanged.
- Existing consumers using `(ngModelChange)` or `.valueChanges` subscriptions are unaffected.
- `valueChange` is purely additive — no breaking changes.

---

## Out of Scope

- No changes to the web components themselves (`albert-date-picker`, `albert-datetime-picker`).
- No new `@Input` bindings or validation logic.
- No changes to `date-picker.module.ts` (already correct).
