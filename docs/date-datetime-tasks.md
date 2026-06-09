# Date & DateTime Picker — Task Breakdown

**Team:** Frontend
**Sizing:** T-shirt (XS / S / M / L / XL)
**Testing:** Playwright — standard browser mode against dev harness; unit + integration; co-located per ticket
**Package name:** `@albert/date-picker`
**Spec:** `date-datetime-component-spec.md`

---

## Decisions log

| Decision | Choice |
|----------|--------|
| Bundler | esbuild |
| Playwright mode | Standard browser mode against a dev harness HTML page |
| Single-panel enforcement | Global registry on `window.__albertPickerRegistry` |
| `parseTime` export | Named export from `@albert/date-picker` |
| Angular CVA distribution | Same package — `@albert/date-picker/angular` |
| Adjacent-month days | Clickable — navigates to that month and selects the day |
| Field label | Out of scope — handled by surrounding form layout |

---

## Sequencing overview

```
FE-1 → FE-2 → FE-4 → FE-6
         ↘         ↗
          FE-3   FE-5
FE-7 (parallel from FE-1)
FE-8 (after FE-4 + FE-6)
FE-9 (after FE-4 + FE-6)
FE-10 (last — after all components exist)
```

---

## FE-1 — Project scaffold, build setup & Playwright config `S`

**What:** Set up the full repo structure, esbuild pipeline, dev harness, and Playwright test infrastructure. Every subsequent ticket depends on this being correct.

**Repo / package structure:**
```
@albert/date-picker
├── src/
│   ├── components/
│   │   ├── date-picker/          # DatePickerField + DatePickerPanel
│   │   └── datetime-picker/      # DateTimePickerField + DateTimePickerPanel
│   ├── shared/
│   │   ├── parse-time.ts         # exported parseTime utility
│   │   ├── format-date.ts        # date/timestamp formatting helpers
│   │   ├── panel-registry.ts     # window.__albertPickerRegistry singleton
│   │   └── tokens.ts             # DS token constant references (string literals)
│   └── index.ts                  # re-exports all components + parseTime
├── angular/
│   ├── date-picker-wrapper.ts    # Angular 10 CVA wrapper component
│   ├── datetime-picker-wrapper.ts
│   ├── date-picker-cva.directive.ts   # Angular 15 CVA directive
│   ├── datetime-picker-cva.directive.ts
│   └── index.ts                  # entry point for @albert/date-picker/angular
├── dist/                         # esbuild output (gitignored)
├── harness/
│   ├── index.html                # dev harness — loads both components via <script type="module">
│   ├── tokens.css                # local stub of Albert DS tokens for harness + tests
│   └── harness.ts                # minimal JS to wire up harness interactions
├── tests/
│   └── smoke.spec.ts
├── build.mjs                     # esbuild build script
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

**esbuild config (`build.mjs`):**
```js
import { build } from 'esbuild';

await build({
  entryPoints: {
    'albert-date-picker':    'src/index.ts',
    'albert-date-picker-angular': 'angular/index.ts',
  },
  bundle: true,
  format: 'esm',
  outdir: 'dist',
  splitting: true,       // shared chunks (panel-registry, parse-time) deduplicated
  sourcemap: true,
  target: ['es2020'],
  external: ['@angular/core', '@angular/forms'],  // Angular peers — not bundled
});
```

**`tsconfig.json` requirements:**
- `"target": "ES2020"`, `"module": "ESNext"`, `"moduleResolution": "bundler"`
- `"strict": true`, `"exactOptionalPropertyTypes": true`
- `"lib": ["ES2020", "DOM", "DOM.Iterable"]`

**`package.json` exports map:**
```json
{
  "name": "@albert/date-picker",
  "type": "module",
  "exports": {
    ".":        { "import": "./dist/albert-date-picker.js" },
    "./angular": { "import": "./dist/albert-date-picker-angular.js" }
  }
}
```

**Dev harness (`harness/index.html`):**
- Loads `tokens.css` (stub of Albert DS tokens — all CSS custom properties with placeholder values so layout and spacing are realistic in tests)
- Loads `dist/albert-date-picker.js` via `<script type="module">`
- Renders one `<albert-date-picker>` and one `<albert-datetime-picker>` in a simple form layout
- Renders a `<albert-date-picker required>` for error state testing
- Renders a `<albert-date-picker is-editable="false">` for disabled state testing
- No framework — plain HTML only

**`tokens.css` stub** must define at minimum:
`--font-sans`, `--text`, `--text-medium`, `--text-dim`, `--text-disabled`,
`--cobalt-50`, `--cobalt-95`, `--slate-90`, `--slate-70`,
`--background`, `--border`, `--radius-sm`, `--shadow-3`

**Playwright config (`playwright.config.ts`):**
```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',   // harness served by esbuild serve or a static server
    headless: true,
  },
  webServer: {
    command: 'npm run serve',           // serves /harness on port 3000
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

**`npm` scripts:**
```json
{
  "build":  "node build.mjs",
  "serve":  "esbuild --servedir=. --serve=3000",
  "test":   "npm run build && playwright test",
  "test:watch": "playwright test --ui"
}
```

**Tests (`tests/smoke.spec.ts`):**
- Navigate to harness; assert no console errors on load
- Assert `customElements.get('albert-date-picker')` is defined
- Assert `customElements.get('albert-datetime-picker')` is defined
- Assert both elements are present in the DOM

**Acceptance criteria:**
- `npm run build` produces `dist/albert-date-picker.js` and `dist/albert-date-picker-angular.js` as valid ESM with sourcemaps
- `npm run test` runs Playwright suite headlessly and exits 0
- TypeScript compiles with zero errors in strict mode
- Harness loads both components with no console errors

---

## FE-2 — `DatePickerField` — field chrome & states `S`

**What:** The `<albert-date-picker>` custom element. Full-width clickable field with calendar icon and all visual states. Panel logic is not part of this ticket — clicking the field dispatches an internal open request only.

**Element tag:** `albert-date-picker`
**File:** `src/components/date-picker/date-picker-field.ts`

**Shadow DOM structure:**
```html
<div part="field" class="field">
  <span part="value" class="value"><!-- formatted date or placeholder --></span>
  <span part="icon" class="icon" aria-hidden="true"><!-- Phosphor calendar SVG --></span>
</div>
<div part="error" class="error" role="alert" hidden><!-- InlineError message --></div>
```

**Observed attributes:**

| Attribute | Type | Behaviour |
|-----------|------|-----------|
| `value` | `string` — `YYYY-MM-DD` | Displays as `Month D, YYYY`. Absent or empty = placeholder shown. |
| `required` | boolean (presence) | Shows required asterisk appended to label (consumer-provided); enables error state. |
| `placeholder` | `string` | Default: `"Select a date"`. Shown when `value` is absent. |
| `is-editable` | `string` `"false"` | When `"false"`: field is non-interactive; `pointer-events: none`; no focus ring. Any other value or absent = editable. |

**Visual states (all via CSS on `part="field"`):**
- **Empty:** placeholder text in `var(--text-dim)`
- **Filled:** formatted date in `var(--text)`
- **Focused:** focus ring using `var(--cobalt-50)`
- **Disabled** (`is-editable="false"`): `var(--text-disabled)`; no pointer events
- **Error** (required + no value): `part="error"` unhidden; border in error token

**Icon:** Phosphor `CalendarBlank` SVG inlined in shadow DOM. `aria-hidden="true"`. Right-aligned via flexbox.

**`::part()` surface exposed:**
`field`, `value`, `icon`, `error`

**Internal event:** On click (when editable), dispatch a non-bubbling internal `_albert-open` CustomEvent on `this` — `DatePickerPanel` listens for this on its anchored field reference. Do not dispatch `albert-change` from this element directly.

**DS tokens used:**
`--font-sans`, `--text`, `--text-dim`, `--text-disabled`, `--cobalt-50`, `--background`, `--border`, `--radius-sm`, `--shadow-3`

**No label element is rendered by this component.** Label is handled by the surrounding form layout.

**Tests (`tests/date-picker-field.spec.ts`):**
- `value="2026-05-23"` → `part="value"` text content is `May 23, 2026`
- `value="2026-01-01"` → displays `January 1, 2026`
- `value` attribute removed after being set → placeholder text reappears
- No `value` attribute → `part="value"` shows `"Select a date"`
- `placeholder="Pick a date"` → `part="value"` shows `"Pick a date"` when no value
- `required` attribute present → `part="error"` is visible when no `value` is set
- `required` attribute present + `value` set → `part="error"` is hidden
- `is-editable="false"` → clicking field emits no `_albert-open` event
- `is-editable="false"` → field has `pointer-events: none` (computed style)
- Clicking field when editable → `_albert-open` CustomEvent fires on the element
- `part="icon"` has `aria-hidden="true"`

**Acceptance criteria:**
- All tests pass
- All DS tokens resolve (no computed style falls back to browser default for colour/radius)

**Blocked by:** FE-1

---

## FE-3 — `DateTimePickerField` — field chrome & states `XS`

**What:** `<albert-datetime-picker>` — clock-icon variant of `DatePickerField`. Shares the same structure; differences are icon, placeholder, and value format only.

**Element tag:** `albert-datetime-picker`
**File:** `src/components/datetime-picker/datetime-picker-field.ts`

**Differences from `DatePickerField`:**

| Concern | DatePickerField | DateTimePickerField |
|---------|----------------|---------------------|
| Icon | Phosphor `CalendarBlank` | Phosphor `Clock` |
| Default placeholder | `"Select a date"` | `"Select a date and time"` |
| `value` format accepted | `YYYY-MM-DD` | ISO 8601 with UTC offset: `YYYY-MM-DDTHH:MM:SS+HH:MM` |
| `value` display format | `Month D, YYYY` | `Month D, YYYY H:MM AM/PM` |
| Internal event on click | `_albert-open` | `_albert-open` (same — panel type determined by element tag) |

Everything else (observed attributes, `::part()` surface, DS tokens, error state, label handling) is identical to `DatePickerField`. Extend or compose from it — do not duplicate.

**Tests (`tests/datetime-picker-field.spec.ts`):**
- `value="2026-05-23T15:30:00+10:00"` → displays `May 23, 2026 3:30 PM`
- `value="2026-05-23T00:00:00+00:00"` → displays `May 23, 2026 12:00 AM`
- `value="2026-05-23T12:00:00+05:30"` → displays `May 23, 2026 12:00 PM`
- No `value` → shows `"Select a date and time"`
- Phosphor `Clock` SVG present in shadow DOM; `CalendarBlank` absent
- `is-editable="false"` → no `_albert-open` on click

**Acceptance criteria:**
- All tests pass
- Zero code duplication with `DatePickerField` — shared logic extracted to base class or composed util

**Blocked by:** FE-2

---

## FE-4 — `DatePickerPanel` — calendar panel with 3-level navigation `L`

**What:** `<albert-date-picker-panel>` — the calendar popover for the date-only picker. Three-level drill-down, panel positioning, global registry, and dismissal.

**Element tag:** `albert-date-picker-panel` (internal — not used directly by consumers)
**File:** `src/components/date-picker/date-picker-panel.ts`

---

### Panel registry (`src/shared/panel-registry.ts`)

Implement before the panel itself. Manages the single-open-at-a-time rule.

```ts
// Exposed on window for cross-instance coordination
declare global {
  interface Window {
    __albertPickerRegistry: AlbertPickerRegistry;
  }
}

class AlbertPickerRegistry {
  private current: HTMLElement | null = null;

  register(panel: HTMLElement): void {
    if (this.current && this.current !== panel) {
      (this.current as any).close?.();
    }
    this.current = panel;
  }

  unregister(panel: HTMLElement): void {
    if (this.current === panel) this.current = null;
  }
}

window.__albertPickerRegistry ??= new AlbertPickerRegistry();
export const panelRegistry = window.__albertPickerRegistry;
```

---

### Panel mounting

- On open: create panel element, append to `document.body`, call `panelRegistry.register(this)`
- On close: remove from `document.body`, call `panelRegistry.unregister(this)`
- `position: fixed` — never `absolute`
- Positioning algorithm:
  1. Get anchor field's `getBoundingClientRect()`
  2. Panel height: measure after inserting into DOM with `visibility: hidden`
  3. Space below = `window.innerHeight - fieldRect.bottom`
  4. If space below ≥ panel height + 8px gap → open below (`top = fieldRect.bottom + 8px`)
  5. Else → open above (`top = fieldRect.top - panelHeight - 8px`)
  6. `left = fieldRect.left`; clamp so panel never overflows viewport right edge
  7. Set `visibility: visible` after position is applied

---

### Shadow DOM structure

```html
<div part="panel" class="panel">
  <div part="header" class="header">
    <button part="prev" class="nav-btn" aria-label="Previous"><!-- Phosphor CaretLeft --></button>
    <!-- Day view: -->
    <button part="month-year-btn" class="month-year-btn">May 2026 <svg/></button>
    <!-- Month view: -->
    <button part="year-btn" class="year-btn">2026 <svg/></button>
    <!-- Year view: -->
    <span part="decade-range" class="decade-range">2020 – 2029</span>
    <button part="next" class="nav-btn" aria-label="Next"><!-- Phosphor CaretRight --></button>
  </div>

  <!-- Day view grid -->
  <div part="day-grid" class="day-grid" role="grid" aria-label="Calendar">
    <div class="weekdays"><!-- Su Mo Tu We Th Fr Sa --></div>
    <div class="days"><!-- 42 day cells --></div>
  </div>

  <!-- Month view grid -->
  <div part="month-grid" class="month-grid" hidden>
    <!-- 12 month pills -->
  </div>

  <!-- Year view grid -->
  <div part="year-grid" class="year-grid" hidden>
    <!-- 10 year pills -->
  </div>

  <div part="footer" class="footer">
    <button part="today-btn" class="today-btn">Today</button>
    <button part="clear-btn" class="clear-btn">Clear</button>
  </div>
</div>
```

---

### Day view

- Weekday labels (Su–Sa): `var(--text)` — same colour and weight as date numbers, not dimmed
- Day cells: `30×30px`, `border-radius: 50%`
  - Selected: `background: var(--cobalt-50)`, `color: white`
  - Today (and not selected): `background: var(--slate-90)`
  - Adjacent-month days: `color: var(--text-dim)` — **clickable**: clicking navigates to that month and selects the day; dispatches `albert-change` and closes panel
  - Current-month days: `color: var(--text)`
- Clicking a day → dispatch `albert-change` with `{ value: "YYYY-MM-DD" }`, `{ bubbles: true, composed: true }` → close panel

### Month view

- 3-column × 4-row grid of abbreviated month names (Jan–Dec)
- Each month is a `<button>` with `part="month-pill"`
- Selected pill (committed value's month, current year only): `background: var(--cobalt-50)`, `color: white`, `border-radius: 6px`; width hugs text — achieved via `display: inline-flex; justify-self: center; padding: 4px 12px`
- Current month (regardless of selection): `background: var(--slate-90)`, `border-radius: 6px`
- **Highlight rule:** selected pill shown only when the committed value's year matches the currently displayed year. If browsing to a different year → no selected pill shown. The `slate-90` current-month highlight is always shown regardless.
- Clicking a month → switch to day view for that month; do not dispatch `albert-change`

### Year view

- 2-column × 5-row grid of years for the current decade
- Decade header: static `"2020 – 2029"` — not a button
- Each year is a `<button>` with `part="year-pill"`
- Selected pill (committed value's year only): same cobalt-50 styling as month pills, `border-radius: 6px`
- Current year: `background: var(--slate-90)`, `border-radius: 6px`
- **Highlight rule:** selected pill shown only for the exact committed year. Browsing to a decade that doesn't contain the committed year → no selected pill.
- Clicking a year → switch to month view for that year; do not dispatch `albert-change`

### Navigation arrows

- Day view prev/next → navigate months (Jan → Dec wraps to prior/next year)
- Month view prev/next → navigate years
- Year view prev/next → navigate decades (step by 10)

### Footer

- `Today` → set value to today's ISO date, dispatch `albert-change`, close panel
- `Clear` → dispatch `albert-change` with `{ value: null }`, close panel
- Footer visible in all three views

### Dismissal

- **Closes:** day cell click, adjacent-month day click, Today, Clear, outside click, `Esc`
- **Does not close:** click on panel's own whitespace (non-interactive area)
- Implementation: document-level `pointerdown` listener on open; panel root calls `event.stopPropagation()` to swallow interior clicks; `Esc` handled via `keydown` on `document`

### `::part()` surface exposed:
`panel`, `header`, `prev`, `next`, `month-year-btn`, `year-btn`, `decade-range`, `day-grid`, `month-grid`, `year-grid`, `month-pill`, `year-pill`, `footer`, `today-btn`, `clear-btn`

---

**Tests (`tests/date-picker-panel.spec.ts`):**

*Navigation*
- Default view is day view; month-grid and year-grid are hidden
- Clicking `part="month-year-btn"` → day-grid hidden, month-grid visible
- Clicking `part="year-btn"` from month view → month-grid hidden, year-grid visible
- Clicking a month pill → year-grid hidden, day-grid visible; header shows that month + year
- Clicking a year pill → year-grid hidden, month-grid visible; header shows that year
- Prev arrow in day view → month decrements; wraps Dec→Jan and year decrements
- Next arrow in day view → month increments; wraps Dec→Jan and year increments
- Prev/next in month view → year changes
- Prev/next in year view → decade changes by 10

*Selection*
- Clicking May 23 → `albert-change` fires with `{ value: "2026-05-23" }`
- Clicking adjacent-month day (e.g. Jun 1 shown in May grid) → `albert-change` fires with `{ value: "2026-06-01" }`; panel closes
- `Today` → `albert-change` fires with today's date in `YYYY-MM-DD`; panel closes
- `Clear` → `albert-change` fires with `{ value: null }`; panel closes

*Highlight correctness*
- Select May 23 2026; navigate to month view → May pill has cobalt-50 background
- Select May 23 2026; navigate to month view; prev arrow to 2025 → no cobalt-50 pill; May pill absent cobalt-50
- Select May 23 2026; navigate to year view → 2026 pill has cobalt-50 background
- Select May 23 2026; navigate to year view; prev arrow to 2010–2019 decade → no cobalt-50 pill
- Today's date cell has `slate-90` background regardless of selected value
- Current month has `slate-90` in month view regardless of selected value
- Current year has `slate-90` in year view regardless of selected value

*Dismissal*
- Clicking a day closes the panel (element removed from `document.body`)
- Clicking panel whitespace (`part="panel"` directly) → panel remains in DOM
- Clicking outside panel → panel removed from `document.body`
- `Esc` keypress → panel removed; `document.activeElement` is the anchor field
- `Today` closes; `Clear` closes

*Positioning*
- Panel opens below field when field is near top of viewport
- Panel opens above field when field is near bottom of viewport (set viewport height to 400px, place field at bottom)
- Panel `left` is clamped — does not overflow right edge of a narrow viewport

*Registry*
- Opening a second `albert-date-picker` while first panel is open → first panel removed from DOM before second opens

**Acceptance criteria:**
- All tests pass
- `albert-change` payload is always `{ value: "YYYY-MM-DD" }` or `{ value: null }`
- Highlight correctness: no stale cobalt-50 pills when browsing away from committed year/month

**Blocked by:** FE-2

---

## FE-5 — `TimeEntryField` — free-text time input + suggestion dropdown `L`

**What:** `<albert-time-entry>` — single free-text time input with AM/PM heuristic parsing and 15-minute suggestion dropdown. `parseTime` is also exported as a named utility.

**Element tag:** `albert-time-entry`
**File:** `src/components/datetime-picker/time-entry-field.ts`
**Utility export:** `src/shared/parse-time.ts` → exported from `src/index.ts` as `parseTime`

---

### `parseTime(input: string): string | null`

Pure function. Returns normalised `"H:MM AM/PM"` string or `null` for invalid input. No DOM dependency — fully unit testable in isolation.

**Full rule set:**

| Input | Output | Rule |
|-------|--------|------|
| `"3"` | `"3:00 PM"` | Bare hour 1–6 → PM |
| `"6"` | `"6:00 PM"` | Bare hour 1–6 → PM |
| `"7"` | `"7:00 AM"` | Bare hour 7–11 → AM |
| `"11"` | `"11:00 AM"` | Bare hour 7–11 → AM |
| `"12"` | `"12:00 PM"` | 12 → noon |
| `"0"` | `"12:00 AM"` | 0 → midnight |
| `"330"` | `"3:30 PM"` | 3 digits → h + mm, heuristic |
| `"1530"` | `"3:30 PM"` | 4 digits → HH + mm, 24h |
| `"0000"` | `"12:00 AM"` | 4-digit midnight |
| `"1200"` | `"12:00 PM"` | 4-digit noon |
| `"3:30"` | `"3:30 PM"` | Separator, heuristic |
| `"3.30"` | `"3:30 PM"` | Dot separator, heuristic |
| `"15"` | `"3:00 PM"` | 24h unambiguous (13–23) |
| `"15:00"` | `"3:00 PM"` | 24h with separator |
| `"1500"` | `"3:00 PM"` | 4-digit 24h |
| `"3pm"` | `"3:00 PM"` | Explicit meridiem |
| `"3 p"` | `"3:00 PM"` | Explicit meridiem, partial |
| `"3am"` | `"3:00 AM"` | Explicit AM |
| `"1145pm"` | `"11:45 PM"` | Compact + meridiem |
| `"3:37"` | `"3:37 PM"` | Free minute, heuristic AM/PM |
| `"12:30"` | `"12:30 PM"` | 12h with minutes |
| `"0:30"` | `"12:30 AM"` | Midnight with minutes |
| `"13pm"` | `null` | Hour >12 with meridiem → invalid |
| `"25:99"` | `null` | Out of range → invalid |
| `"25"` | `null` | Hour >23 → invalid |
| `"noon"` | `null` | Natural language → not supported |
| `""` | `null` | Empty → invalid |
| `"abc"` | `null` | Junk → invalid |

---

### Shadow DOM structure

```html
<div part="wrapper" class="wrapper">
  <input
    part="input"
    type="text"
    role="combobox"
    aria-autocomplete="list"
    aria-expanded="false"
    aria-controls="suggestions"
    autocomplete="off"
    spellcheck="false"
  />
  <ul
    part="suggestions"
    id="suggestions"
    role="listbox"
    aria-label="Time suggestions"
    hidden
  >
    <!-- 96 x <li role="option"> items -->
  </ul>
</div>
```

---

### Suggestion dropdown

- 96 `<li role="option">` items, `12:00 AM` through `11:45 PM` at 15-minute intervals
- Generated once at construction; not re-rendered on each open
- **On open:** set `aria-expanded="true"`; remove `hidden`; scroll to the item nearest the current value by time distance (find the 15-min slot closest to current parsed value; if no current value, scroll to current time rounded to nearest 15 min)
- **Scroll-to-nearest algorithm:** for each option compute `Math.abs(optionMinutes - currentMinutes)` where minutes = hours×60+minutes; select minimum; call `item.scrollIntoView({ block: 'nearest' })`
- **Typing:** does not filter the list; recomputes nearest match on each `input` event and scrolls to it
- **Active option:** tracked via `aria-activedescendant` on input; active `<li>` gets `aria-selected="true"` and `background: var(--slate-90)`
- **Keyboard:**
  - `↑` / `↓` → move active option; mirror option text into input; wrap at ends
  - `Enter` → commit active option
  - `Esc` → revert input to last valid value; close dropdown
- **Click on option** → commit that option
- **Hover on option** → set as active (updates `aria-activedescendant`)

---

### Commit & validation

- **Commit triggers:** `Enter`, option click, `blur`
- On commit: call `parseTime(inputValue)`; if valid → normalise input to result, store as `lastValidValue`, dispatch `albert-time-change`; if invalid → revert input to `lastValidValue` (never store null)
- `blur` also closes dropdown (`hidden = true`, `aria-expanded = "false"`) — in the same event, no second interaction required
- `lastValidValue` initialised to exact current time on construction: `new Date()` formatted as `H:MM AM/PM` (no rounding)

---

### Event

`albert-time-change` — `{ bubbles: true, composed: true }` — `detail: { value: "H:MM AM/PM" }`

---

### `::part()` surface: `wrapper`, `input`, `suggestions`

---

**Tests (`tests/time-entry.spec.ts`):**

*Unit — `parseTime` (imported directly, no DOM)*
All rows in the parsing table above as individual `expect(parseTime(input)).toBe(output)` assertions.

*Integration — component behaviour*
- On focus → dropdown opens (no `hidden` attr); has 96 `li` items
- On focus → dropdown scrolled to item nearest current value (active item visible in scrollport)
- Typing `3` → input value is `"3"`; dropdown still has 96 items (not filtered); list scrolled toward 3:xx
- `↓` key → active option advances; input value mirrors option text
- `↑` key → active option retreats; input value mirrors option text
- `↑` at first option → wraps to last option
- `↓` at last option → wraps to first option
- `Enter` with active option → `albert-time-change` fires with `{ value: <option text> }`; dropdown closes
- Clicking `3:30 PM` option → `albert-time-change` fires with `{ value: "3:30 PM" }`; dropdown closes
- `Esc` → input reverts to last valid value; dropdown closes
- Blur with valid input `"3"` → input normalised to `"3:00 PM"`; `albert-time-change` fires; dropdown closes
- Blur with invalid input `"25:99"` → input reverts; no `albert-time-change` fired
- Blur with empty input → input reverts; no `albert-time-change` fired
- Blur closes dropdown in one step — no second interaction needed
- `albert-time-change` has `bubbles: true` and `composed: true` (check via event listener on parent)
- `aria-expanded="true"` on input when dropdown open; `"false"` when closed
- Active option has `aria-selected="true"`; inactive options have `aria-selected="false"`

**Acceptance criteria:**
- All unit tests pass (parseTime)
- All integration tests pass
- No `setTimeout` or artificial delay in any test
- `parseTime` importable as `import { parseTime } from '@albert/date-picker'`

**Blocked by:** FE-1

---

## FE-6 — `DateTimePickerPanel` — extends calendar with time + timezone `M`

**What:** `<albert-datetime-picker-panel>` — timestamp variant of the panel. Composes `DatePickerPanel` + `TimeEntryField`, adds read-only timezone, changes footer (Now/Clear), and changes dismissal (stays open on inside clicks).

**Element tag:** `albert-datetime-picker-panel`
**File:** `src/components/datetime-picker/datetime-picker-panel.ts`

---

### Structure

Extend `DatePickerPanel`. Override or augment:

1. **Time + timezone row** — rendered between the calendar grid and footer; shown in day view only:
   ```html
   <div part="time-row" class="time-row">
     <albert-time-entry part="time-entry"></albert-time-entry>
     <span part="timezone" class="timezone" aria-label="Timezone">
       <!-- Intl.DateTimeFormat().resolvedOptions().timeZone — e.g. "America/New_York" -->
     </span>
   </div>
   ```
   - `time-row` has `hidden` attribute added when switching to month or year view; removed on return to day view
   - Timezone string is read-only — no user interaction; not a form control

2. **Footer** — replaces `Today/Clear` with `Now/Clear`:
   - `Now` → set date to today + time to exact `new Date()` (no rounding) → dispatch `albert-change` with ISO 8601 value → close panel
   - `Clear` → dispatch `albert-change` with `{ value: null }` → reset internal time state to exact current time (so next open shows current time) → close panel

3. **Dismissal** — overrides parent: panel stays open on **any** click inside it (calendar days, whitespace, time field, suggestion list). Only outside click, `Esc`, or Now/Clear close it. Implementation: remove the parent's `close on day-click` handler; document-level `pointerdown` still handles outside click.

4. **Value assembly** — when both a date and time are committed:
   - Date from calendar selection stored as `YYYY-MM-DD`
   - Time from `albert-time-change` stored as `H:MM AM/PM`
   - On either changing: if both present, assemble ISO 8601 string:
     ```ts
     // Convert local date + time to ISO with UTC offset
     const dt = new Date(`${date} ${time}`);
     const offset = -dt.getTimezoneOffset(); // minutes
     const sign = offset >= 0 ? '+' : '-';
     const hh = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
     const mm = String(Math.abs(offset) % 60).padStart(2, '0');
     const iso = `${dt.getFullYear()}-${...}-${...}T${...}:${...}:00${sign}${hh}:${mm}`;
     ```
   - Dispatch `albert-change` with `{ value: isoString }`
   - A date must be selected before `albert-change` fires — entering a time before selecting a date stores the time in internal state silently; `albert-change` fires only once a date is also selected

---

**Tests (`tests/datetime-picker-panel.spec.ts`):**

*Time row visibility*
- Day view: `part="time-row"` is visible (no `hidden` attr)
- Click `month-year-btn` → `part="time-row"` has `hidden` attr
- Return to day view → `part="time-row"` visible again
- Click to year view → `part="time-row"` has `hidden` attr
- Return to day view → `part="time-row"` visible again

*Footer across views*
- `Now` button visible in day view, month view, and year view (no `hidden` attr)
- `Clear` button visible in day view, month view, and year view

*Dismissal*
- Clicking a day cell → panel remains in DOM (does NOT close)
- Clicking panel whitespace → panel remains in DOM
- Clicking inside `albert-time-entry` → panel remains in DOM
- Clicking a suggestion in the time dropdown → panel remains in DOM
- `Now` → panel removed from DOM
- `Clear` → panel removed from DOM
- Outside click → panel removed from DOM
- `Esc` → panel removed from DOM

*Now button*
- `albert-change` fires; `detail.value` is a valid ISO 8601 string parseable by `new Date()`
- Date portion of fired value matches today's date
- Panel closes after `Now`

*Clear button*
- `albert-change` fires with `{ value: null }`
- Panel closes
- Re-open panel → time entry shows current time (not previously selected time)

*Value assembly*
- Select May 23; enter `3:30 PM` in time field → `albert-change` fires with value matching `2026-05-23T15:30:00±HH:MM`
- `new Date(firedValue)` does not throw and represents the correct local time
- Enter time before selecting date → no `albert-change` fires
- Select date after entering time → `albert-change` fires with assembled value

*Timezone display*
- `part="timezone"` text content equals `Intl.DateTimeFormat().resolvedOptions().timeZone`
- `aria-label="Timezone"` present on timezone element
- Element is not focusable (`tabindex` absent or `-1`)

**Acceptance criteria:**
- All tests pass
- Panel never closes prematurely on inside clicks
- ISO 8601 output is always parseable by `new Date()`

**Blocked by:** FE-4, FE-5

---

## FE-7 — `ReadOnlyDateCell` `XS`

**What:** `<albert-date-cell>` — read-only grid cell rendering a formatted date or timestamp string.

**Element tag:** `albert-date-cell`
**File:** `src/components/date-picker/date-cell.ts`

**Observed attributes:**

| Attribute | Renders as |
|-----------|-----------|
| `value="2026-05-23"` | `May 23, 2026` |
| `value="2026-05-23T15:30:00+10:00"` | `May 23, 2026 3:30 PM` |
| absent / empty | Empty — no text, no placeholder |

**Implementation notes:**
- Detect value type: if contains `T` → timestamp format; else → date format
- Use `format-date.ts` shared utility (same function used by field chrome in FE-2/FE-3)
- No Shadow DOM required — follows existing read-only cell pattern (light DOM, inherits host styles)
- Not focusable; emits no events; no pointer interaction

**Tests (`tests/date-cell.spec.ts`):**
- `value="2026-05-23"` → text content is `May 23, 2026`
- `value="2026-01-01"` → text content is `January 1, 2026`
- `value="2026-05-23T15:30:00+10:00"` → text content is `May 23, 2026 3:30 PM`
- `value="2026-05-23T00:00:00+00:00"` → text content is `May 23, 2026 12:00 AM`
- No `value` attribute → element text content is empty string
- `value=""` → element text content is empty string
- Element is not focusable — `tabIndex` is `-1` or element has no focus behaviour
- Clicking element → no event dispatched

**Acceptance criteria:**
- All tests pass
- Uses `format-date.ts` shared utility — no duplicated formatting logic

**Blocked by:** FE-1

---

## FE-8 — Angular integration — wrapper module + `ControlValueAccessor` (Angular 10) `M`

**What:** Angular 10 CVA wrapper components for `<albert-date-picker>` and `<albert-datetime-picker>`. Distributed as `@albert/date-picker/angular`.

**Files:**
```
angular/
├── date-picker-wrapper.ts       # DatePickerWrapperComponent
├── datetime-picker-wrapper.ts   # DateTimePickerWrapperComponent
└── index.ts                     # exports both + their modules
```

**`DatePickerWrapperComponent`:**
```ts
@Component({
  selector: 'albert-date-picker-ng',
  template: `<albert-date-picker
    [attr.value]="value || null"
    [attr.required]="required || null"
    [attr.is-editable]="disabled ? 'false' : null"
    (albert-change)="onPickerChange($event)"
  ></albert-date-picker>`,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePickerWrapperComponent),
    multi: true,
  }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerWrapperComponent implements ControlValueAccessor {
  value: string | null = null;
  required = false;
  disabled = false;
  private onChange: (v: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  onPickerChange(e: CustomEvent) {
    this.value = e.detail.value;
    this.onChange(this.value);
    this.onTouched();
    this.cdr.markForCheck();
  }
  writeValue(v: string | null) { this.value = v; this.cdr.markForCheck(); }
  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }
  setDisabledState(d: boolean) { this.disabled = d; this.cdr.markForCheck(); }
  constructor(private cdr: ChangeDetectorRef) {}
}

@NgModule({
  declarations: [DatePickerWrapperComponent],
  exports: [DatePickerWrapperComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // scoped here only
})
export class DatePickerWrapperModule {}
```

`DateTimePickerWrapperComponent` follows identical pattern — `albert-datetime-picker` tag, ISO 8601 value format.

**Distribution:** consumers import:
```ts
import { DatePickerWrapperModule } from '@albert/date-picker/angular';
```
No `CUSTOM_ELEMENTS_SCHEMA` needed in any consuming module.

**Web component registration** — consumers must also import the web component once:
```ts
// main.ts
import '@albert/date-picker';
```

---

**Tests (`tests/angular10-integration.spec.ts`):**

> These tests bootstrap a minimal Angular 10 `TestBed` environment inside Playwright's browser context. Use `@angular/core/testing` and `@angular/platform-browser/testing`.

- `writeValue('2026-05-23')` → `albert-date-picker` attribute `value` is `"2026-05-23"`
- `writeValue(null)` → `value` attribute absent on element
- Picker `albert-change` event with `{ value: '2026-05-23' }` → wrapper's `onChange` called with `"2026-05-23"`
- `[(ngModel)]` round-trip: set model → field displays value; picker commit → model updates
- `[formControl]` round-trip: `control.setValue('2026-05-23')` → field displays `May 23, 2026`; picker commit → `control.value` updates
- `control.disable()` → `is-editable="false"` on element
- `control.enable()` → `is-editable` attribute absent
- `OnPush` host: `albert-change` triggers change detection (assert view updates without manual `detectChanges()` call)
- Consuming `FeatureModule` does NOT have `CUSTOM_ELEMENTS_SCHEMA` in its `@NgModule` — test confirms no schema on feature module

**Acceptance criteria:**
- All tests pass in Angular 10 test environment
- `CUSTOM_ELEMENTS_SCHEMA` present only in `DatePickerWrapperModule` — not leaking to consumers

**Blocked by:** FE-4, FE-6

---

## FE-9 — Angular integration — CVA directive (Angular 15) `S`

**What:** Angular 15 standalone CVA directives. No wrapper components — consumers use `<albert-date-picker>` directly with `[formControl]` or `[(ngModel)]`.

**Files:**
```
angular/
├── date-picker-cva.directive.ts      # DatePickerCvaDirective
└── datetime-picker-cva.directive.ts  # DateTimeCvaDirective
```

**`DatePickerCvaDirective`:**
```ts
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
  private el = inject(ElementRef<HTMLElement>);
  private cdr = inject(ChangeDetectorRef);
  private onChange: (v: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  @HostListener('albert-change', ['$event'])
  onPickerChange(e: CustomEvent) {
    this.onChange(e.detail.value);
    this.onTouched();
    this.cdr.markForCheck();
  }

  writeValue(v: string | null) {
    v ? this.el.nativeElement.setAttribute('value', v)
      : this.el.nativeElement.removeAttribute('value');
  }
  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }
  setDisabledState(d: boolean) {
    d ? this.el.nativeElement.setAttribute('is-editable', 'false')
      : this.el.nativeElement.removeAttribute('is-editable');
  }
}
```

`DateTimeCvaDirective` is identical but selects `albert-datetime-picker[formControl...]`.

Both directives are exported from `angular/index.ts` alongside the v10 wrapper modules.

---

**Tests (`tests/angular15-integration.spec.ts`):**

- `[formControl]` on `<albert-date-picker>` directly: `control.setValue('2026-05-23')` → `value` attribute set on element
- Picker commit → `control.value` is `"2026-05-23"`
- `control.disable()` → `is-editable="false"` on element
- `control.enable()` → `is-editable` attribute absent
- `OnPush` host: change detection triggered without manual `detectChanges()`
- No `NgModule` needed — standalone component test confirms directive works with `imports: [DatePickerCvaDirective, ReactiveFormsModule]` only
- `[(ngModel)]` round-trip works with `imports: [DatePickerCvaDirective, FormsModule]`

**Acceptance criteria:**
- All tests pass in Angular 15 standalone test environment
- Zero NgModule boilerplate required in consumer — directive + `ReactiveFormsModule` import is sufficient

**Blocked by:** FE-4, FE-6

---

## FE-10 — Accessibility audit & keyboard QA `M`

**What:** Dedicated a11y pass. Shadow DOM and ARIA combobox patterns require deliberate verification after all components exist — not a "do it as you go" task.

**Setup:** Install `@axe-core/playwright`. Add helper `injectAxe` + `checkA11y` to a shared test util file.

**Tests (`tests/a11y.spec.ts`):**

*Field keyboard activation*
- `Tab` to `albert-date-picker` → element receives focus
- `Enter` on focused field → panel opens
- `Space` on focused field → panel opens

*Day view keyboard navigation*
- `Tab` from field → focus moves to first interactive element in panel (prev arrow)
- Arrow keys navigate day cells: `→` next day, `←` prev day, `↓` next week, `↑` prev week
- `Enter` on focused day cell → `albert-change` fires; panel closes; focus returns to field
- `Tab` from last day cell → focus moves to `Today` button; next `Tab` → `Clear` button

*Month/year drill-down keyboard*
- `Enter` on `month-year-btn` → month view opens
- `Space` on `month-year-btn` → month view opens
- `Enter` on `year-btn` → year view opens
- `Esc` from any view → panel closes; `document.activeElement` is the anchor field

*Focus management*
- Panel open → focus trapped inside panel (Tab does not leave panel)
- Panel close → focus returns to anchor field (verified via `document.activeElement`)

*TimeEntryField keyboard (in DateTimePickerPanel)*
- `Tab` into `albert-time-entry` → input receives focus; dropdown opens
- `↑`/`↓` navigate suggestions; active option `aria-selected="true"`
- `Enter` commits active option
- `Esc` reverts input; dropdown closes

*ARIA attributes*
- `albert-date-picker-panel`: `role="dialog"` and `aria-modal="true"` when open
- Calendar icon on both field variants: `aria-hidden="true"`
- `part="timezone"`: `aria-label="Timezone"`; not focusable
- `albert-time-entry` input: `role="combobox"`, `aria-expanded` correct per dropdown state, `aria-controls` points to suggestion listbox id
- Suggestion `<ul>`: `role="listbox"`; each `<li>`: `role="option"`; active item: `aria-selected="true"`

*axe-core scans — run `checkA11y()` for each state:*
- `albert-date-picker` — empty state
- `albert-date-picker` — filled state (`value` set)
- `albert-date-picker` — error state (`required`, no value)
- `albert-date-picker-panel` — day view open
- `albert-date-picker-panel` — month view open
- `albert-date-picker-panel` — year view open
- `albert-datetime-picker` — empty state
- `albert-datetime-picker-panel` — day view with time dropdown open

**Pass/fail criteria for manual screen reader note:**
The following is a checklist for manual VoiceOver/NVDA verification (not automated). Document results in PR description:
- [ ] Opening picker announces panel role ("dialog")
- [ ] Navigating days announces day + month (e.g. "23 May")
- [ ] Selecting a day announces the committed value
- [ ] Month/year view transitions are announced
- [ ] Time entry: typing announces current input; `↑`/`↓` announces active suggestion
- [ ] Panel close announces focus returning to field

**Acceptance criteria:**
- Zero axe-core violations across all scanned states
- All automated keyboard tests pass
- Manual screen reader checklist completed and documented in PR

**Blocked by:** FE-4, FE-5, FE-6

---

## Summary

| Ticket | Title | Size | Blocked by |
|--------|-------|------|------------|
| FE-1 | Scaffold, esbuild, Playwright config | S | — |
| FE-2 | `DatePickerField` — field chrome & states | S | FE-1 |
| FE-3 | `DateTimePickerField` — field chrome & states | XS | FE-2 |
| FE-4 | `DatePickerPanel` — 3-level calendar | L | FE-2 |
| FE-5 | `TimeEntryField` + `parseTime` export | L | FE-1 |
| FE-6 | `DateTimePickerPanel` — time + timezone | M | FE-4, FE-5 |
| FE-7 | `ReadOnlyDateCell` | XS | FE-1 |
| FE-8 | Angular 10 — wrapper module + CVA | M | FE-4, FE-6 |
| FE-9 | Angular 15 — CVA directive | S | FE-4, FE-6 |
| FE-10 | Accessibility audit & keyboard QA | M | FE-4, FE-5, FE-6 |
