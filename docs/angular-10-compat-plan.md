# Angular 10 Compatibility — Build Infrastructure Update Plan

**Package:** `@albert/date-picker`  
**Goal:** Make the Angular wrapper consumable in both Angular 10 (TypeScript 3.9, Webpack 4) and Angular 15+ (Webpack 5, standalone), without changing the public API.  
**Status:** Ready for review — no code changes made yet.

---

## Background & Root Cause

The Angular wrapper currently uses **esbuild** for its build. esbuild has two fundamental incompatibilities with Angular 10:

| Problem | Effect |
|---|---|
| esbuild cannot emit `Reflect.metadata` (Angular decorator metadata) | Angular's DI system cannot resolve constructor injections at runtime → `Can't resolve all parameters` crash |
| esbuild outputs ES2020 ESM | Angular 10 / Webpack 4 does not downlevel `node_modules`; optional chaining (`?.`) and other ES2020+ syntax reaches the browser untranspiled |
| `package.json` only has `exports` field, no `main` field | Webpack 4 ignores `exports`; falls back to the filesystem and finds `angular/index.ts` (TypeScript source) which it cannot compile |

The native web component bundle is unaffected and stays on esbuild. Only the Angular wrapper build changes.

---

## Scope of Changes

| File | Action |
|---|---|
| `tsconfig.angular.json` | **Create** — separate tsc config for Angular wrapper build |
| `build.mjs` | **Update** — add `tsc` step; remove Angular wrapper from esbuild |
| `angular/index.ts` | **Replace with `angular/index.js`** — Webpack 4 needs compiled JS, not TS source |
| `package.json` | **Update** — add `main`, `module`, `types`; remove `"type":"module"`; update `exports` |
| `src/angular/datetime-picker-field-cva.directive.ts` | **Update** — add `formControlName` to selector; fix `onTouched` |
| `src/angular/date-picker-field-cva.directive.ts` | **Update** — fix `onTouched` |
| `src/angular/datetime-picker-field-cva.component.ts` | **Update** — buffer `writeValue`; fix `onTouched`; add `AfterViewInit` to `implements` |
| `ANGULAR.md` | **Update** — correct Angular 10 vs 15 guidance |

**No changes** to native web component source (`src/index.ts`, `src/components/`).

---

## Step 1 — Create `tsconfig.angular.json`

**Create** a new file `tsconfig.angular.json` alongside the existing `tsconfig.json`.

The existing `tsconfig.json` is tuned for the native web component build (`ES2020`, `moduleResolution: bundler`, `exactOptionalPropertyTypes`). The Angular wrapper needs a separate, more conservative config.

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "ES2015",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist/angular",
    "lib": ["ES2018", "DOM"],
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/angular/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Key differences from `tsconfig.json`:

| Option | `tsconfig.json` (WC build) | `tsconfig.angular.json` (Angular build) |
|---|---|---|
| `target` | `ES2020` | `ES2015` — downlevels `?.`, class fields, etc. |
| `module` | `ESNext` | `ES2015` — `import`/`export` Webpack 4 can process |
| `moduleResolution` | `bundler` (TS 5.0+ only) | `node` — compatible with Webpack 4 and 5 |
| `emitDecoratorMetadata` | absent | `true` — **critical**; Angular DI requires this |
| `experimentalDecorators` | absent | `true` — required for `@Component`, `@Directive` |
| `exactOptionalPropertyTypes` | `true` (TS 4.4+ only) | absent |
| `outDir` | `./dist` | `./dist/angular` |

---

## Step 2 — Update `build.mjs`

**Current `build.mjs`** runs a single esbuild call that processes both the native web component and the Angular wrapper together.

**Updated `build.mjs`:**

```js
import { build } from 'esbuild';
import { execSync } from 'child_process';

// Step A: Native web component — unchanged, stays on esbuild
await build({
  entryPoints: {
    'albert-date-picker': 'src/index.ts',
  },
  bundle: true,
  format: 'esm',
  outdir: 'dist',
  splitting: false,        // no longer needed; Angular is not in this build
  sourcemap: true,
  target: ['es2020'],
  minify: false,
});

// Step B: Angular wrapper — compiled with tsc
// tsc emits ES2015, experimentalDecorators, emitDecoratorMetadata,
// and Reflect.metadata calls required by Angular's DI system.
// Output goes to dist/angular/
execSync('npx tsc -p tsconfig.angular.json', { stdio: 'inherit' });

console.log('Build complete ✓');
```

**What changes:**
- `albert-date-picker-angular` entry removed from esbuild
- `splitting: true` removed (was only needed for the shared chunk between the two esbuild entries)
- `execSync` tsc call added for the Angular wrapper

**`dist/` folder after this build:**

```
dist/
  albert-date-picker.js              ← native WC (esbuild, ESM, ES2020) — unchanged
  albert-date-picker.js.map
  angular/
    index.js                         ← Angular wrapper entry (tsc, ES2015 import/export)
    index.d.ts                       ← TypeScript declarations for Angular 15 consumers
    index.d.ts.map
    datetime-picker-field-cva.component.js
    datetime-picker-field-cva.component.d.ts
    datetime-picker-field-cva.directive.js
    datetime-picker-field-cva.directive.d.ts
    date-picker-field-cva.directive.js
    date-picker-field-cva.directive.d.ts
    datetime-picker.module.js
    datetime-picker.module.d.ts
    date-picker.module.js
    date-picker.module.d.ts
```

The `chunk-CBEIUQ5X.js` shared chunk disappears — it was an esbuild artifact from bundling two entries together.

---

## Step 3 — Replace `angular/index.ts` with `angular/index.js`

**Why:** Webpack 4 ignores `package.json#exports` entirely. When resolving `@albert/date-picker/angular`, it walks the filesystem and finds `angular/index.ts` — a TypeScript source file it cannot compile (since `node_modules` is excluded from the Angular project's TypeScript compilation).

**Action:** Delete `angular/index.ts`. Replace it with `angular/index.js`:

```js
// angular/index.js
// Webpack 4 fallback entry point.
// Webpack 4 does not support package.json "exports" field and resolves
// @albert/date-picker/angular by finding this file on the filesystem.
// Re-exports from the tsc-compiled dist/angular/ output.
export * from '../dist/angular/index.js';
```

This file is **committed to source** (not generated). It is a permanent redirect from the Webpack 4 fallback path to the compiled output.

---

## Step 4 — Update `package.json`

Three targeted changes.

### 4A — Remove `"type": "module"`

```diff
-  "type": "module",
```

With `"type": "module"`, every `.js` file in the package is treated as ESM by Node.js. This prevents reliable CJS-compatible fallback resolution for Webpack 4 and causes issues at package boundaries. The esbuild output uses `import`/`export` internally and works correctly in browser bundler contexts without this field.

### 4B — Add `main`, `module`, and `types` fields

```json
"main": "angular/index.js",
"module": "dist/angular/index.js",
"types": "dist/angular/index.d.ts",
```

- `main` — Webpack 4 CJS fallback. Points to `angular/index.js` (the redirect file from Step 3).
- `module` — ESM entry for bundlers that respect this field (Angular CLI 10 uses `resolve.mainFields: ['module', 'main']` by default in its Webpack config).
- `types` — TypeScript declaration entry for IDE support.

### 4C — Update `exports` field

```json
"exports": {
  ".": {
    "import": "./dist/albert-date-picker.js"
  },
  "./angular": {
    "import": "./dist/angular/index.js",
    "default": "./angular/index.js",
    "types": "./dist/angular/index.d.ts"
  }
}
```

- `import` — used by Webpack 5 / Angular 15 (ESM consumers)
- `default` — fallback for tooling that reads `exports` but doesn't match `import`
- `types` — used by TypeScript 4.7+ for subpath type resolution

### 4D — Update `files`

```diff
-  "files": ["dist", "src/angular", "angular"],
+  "files": ["dist", "angular"],
```

`src/angular` TypeScript source no longer needs to ship in the package. Consumers use the compiled output.

**Full updated `package.json`:**

```json
{
  "name": "@albert/date-picker",
  "version": "0.1.0",
  "description": "Native Web Components for date and datetime selection across Angular, Lit, and React",
  "files": ["dist", "angular"],
  "main": "angular/index.js",
  "module": "dist/angular/index.js",
  "types": "dist/angular/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/albert-date-picker.js"
    },
    "./angular": {
      "import": "./dist/angular/index.js",
      "default": "./angular/index.js",
      "types": "./dist/angular/index.d.ts"
    }
  },
  "scripts": {
    "build": "node build.mjs",
    "serve": "esbuild --servedir=. --serve=3000",
    "test": "npm run build && playwright test",
    "test:watch": "playwright test --ui"
  },
  "devDependencies": {
    "@playwright/test": "1.36.0",
    "@types/node": "^16.0.0",
    "esbuild": "0.17.0",
    "typescript": "^5.3.0"
  },
  "peerDependencies": {
    "@angular/core": "^10 || ^15",
    "@angular/forms": "^10 || ^15"
  },
  "peerDependenciesMeta": {
    "@angular/core": { "optional": true },
    "@angular/forms": { "optional": true }
  }
}
```

---

## Step 5 — Fix Source-Level Bugs

These are small, targeted changes in the Angular wrapper source files. They are independent of the build pipeline but should be included in the same release.

### 5A — `datetime-picker-field-cva.directive.ts`: add `formControlName` to selector

The directive is not activated when used inside a `FormGroup` with `formControlName`. `DatePickerFieldCvaDirective` already has this; `DateTimePickerFieldCvaDirective` is missing it.

```diff
- selector: 'albert-datetime-picker[formControl], albert-datetime-picker[ngModel]',
+ selector: 'albert-datetime-picker[formControl], albert-datetime-picker[ngModel], albert-datetime-picker[formControlName]',
```

### 5B — Both directives + component: move `onTouched` from `change` to `blur`

`onTouched()` is currently called on every value change. This marks the field as "touched" immediately on first selection, causing validation error messages to appear while the user is still interacting. Angular convention is: `onTouched` fires on blur.

In `setupEventListener()` in all three files:

```typescript
// Before — onTouched on every change (incorrect):
this.changeListener = (e: Event) => {
  const value = (e as CustomEvent).detail?.value || null;
  this.onChange(value);
  this.onTouched();   // ← wrong
};
nativeEl.addEventListener('albert-change', this.changeListener);

// After — onTouched on blur only (correct):
private blurListener: (() => void) | null = null;

// in setupEventListener():
this.changeListener = (e: Event) => {
  const value = (e as CustomEvent).detail?.value || null;
  this.onChange(value);
};
nativeEl.addEventListener('albert-change', this.changeListener);

this.blurListener = () => this.onTouched();
nativeEl.addEventListener('blur', this.blurListener);

// in ngOnDestroy(), add cleanup:
if (this.blurListener) {
  nativeEl.removeEventListener('blur', this.blurListener);
}
```

Applies to:
- `src/angular/datetime-picker-field-cva.directive.ts`
- `src/angular/date-picker-field-cva.directive.ts`
- `src/angular/datetime-picker-field-cva.component.ts`

### 5C — `datetime-picker-field-cva.component.ts`: buffer `writeValue` until view is ready

Angular forms calls `writeValue()` to set the initial control value **before** `ngAfterViewInit`. The `pickerRef` ViewChild is `static: false`, so it is null at that point. The current `if (this.pickerRef)` guard silently discards the initial value — meaning pre-populated edit forms will show a blank picker.

```typescript
// Add buffer property:
private pendingValue: string | null | undefined = undefined;

// Replace writeValue:
writeValue(value: string | null) {
  if (this.pickerRef) {
    this.applyValue(value);
  } else {
    this.pendingValue = value;
  }
}

// Update ngAfterViewInit:
ngAfterViewInit() {
  this.applyInputs();
  this.setupEventListener();
  if (this.pendingValue !== undefined) {
    this.applyValue(this.pendingValue);
  }
}

// Add shared private method:
private applyValue(value: string | null) {
  const el = this.pickerRef.nativeElement;
  value ? el.setAttribute('value', value) : el.removeAttribute('value');
}
```

### 5D — `datetime-picker-field-cva.component.ts`: add `AfterViewInit` to `implements`

The class uses `ngAfterViewInit()` but does not declare it in the `implements` clause. TypeScript won't catch signature drift.

```diff
- import { Component, ElementRef, forwardRef, Input, OnDestroy, ViewChild } from '@angular/core';
+ import { AfterViewInit, Component, ElementRef, forwardRef, Input, OnDestroy, ViewChild } from '@angular/core';

- export class DateTimePickerFieldCvaComponent implements ControlValueAccessor, OnDestroy {
+ export class DateTimePickerFieldCvaComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
```

---

## Step 6 — Update `ANGULAR.md`

The current documentation implies the directive-based approach is "Angular 15 only (standalone)". This is inaccurate. Both directives work from Angular 9+ when imported through `DatePickerModule` / `DateTimePickerModule`.

Updates needed:
- Rename "Angular 15 Directive (Standalone)" section to "Directive Approach (Angular 9+)"
- Add NgModule usage example for the directive (import `DatePickerModule` instead of the directive directly)
- Correct the comparison table's "Best for" column
- Add a note that `import '@albert/date-picker'` (web component registration) is required in both Angular 10 and 15

---

## Step 7 — Local Verification (before publishing)

Run this sequence after all changes are made:

```bash
# 1. Build the package
cd calendar-component
npm run build

# 2. Pack it
npm pack
# produces albert-date-picker-0.x.x.tgz

# 3. Install in the Angular 10 project
cd ../mfe-module-wc/mfe-alinventory-wc
npm install ../../calendar-component/albert-date-picker-0.x.x.tgz

# 4. Build the Angular 10 project
ng build --configuration=production
```

### Verification Checklist

- [ ] Build completes without `Module not found: @albert/date-picker/angular`
- [ ] No `Can't resolve all parameters for DateTimePickerFieldCvaComponent` at runtime
- [ ] No JavaScript syntax errors in browser console (confirms ES2015 downlevel worked)
- [ ] `formControlName` binding works inside `[formGroup]`
- [ ] A pre-populated `FormControl` with an initial value displays the value in the picker
- [ ] Validation error messages only appear after the user leaves the field (blur), not on first selection
- [ ] Angular 15 project (if available): `ng build` still passes with the updated package

---

## Resolution Map

| Original Problem | Fixed By |
|---|---|
| `Can't resolve all parameters` (Angular DI crash) | Step 1 + 2 (`emitDecoratorMetadata: true` via tsc) |
| `Module not found: @albert/date-picker/angular` (Webpack 4) | Step 3 + 4 (`angular/index.js` + `main` field) |
| Optional chaining in bundle not downleveled | Step 1 + 2 (`target: ES2015` in tsc) |
| ESM bundle incompatible with Webpack 4 | Step 2 (tsc `module: ES2015` output) |
| Initial form value not shown in picker | Step 5C (buffer `writeValue`) |
| Validation errors appear too early | Step 5B (move `onTouched` to blur) |
| `formControlName` binding ignored for datetime picker | Step 5A (add to selector) |
| `AfterViewInit` not declared in `implements` | Step 5D |
