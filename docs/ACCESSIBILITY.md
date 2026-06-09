# Accessibility Features

This document describes the accessibility features implemented in `@albert/date-picker`.

## WCAG Compliance

All components are built with WCAG 2.1 Level AA compliance as a goal, with focus on:
- Keyboard navigation
- Screen reader support (ARIA)
- Focus management
- Color contrast
- Semantic HTML

## Keyboard Navigation

### DatePickerField / DateTimePickerField

- **Tab**: Focus the field
- **Enter / Space**: Open the date picker panel
- **Escape**: Close the panel (when panel has focus)

### DatePickerPanel

- **Arrow Keys (Up/Down/Left/Right)**: Navigate through calendar dates
- **Tab**: Move focus to buttons (Today, Clear, Next/Prev)
- **Enter**: Select a date
- **Escape**: Close the panel

### DateTimePickerPanel

- **All DatePickerPanel shortcuts** (for calendar navigation)
- **Tab**: Move between calendar and time input field
- **Arrow Keys (in time field)**: Navigate time suggestions (if available)

### TimeEntryField

- **Tab**: Focus the input field
- **Arrow Up/Down**: Navigate through time suggestions
- **Enter**: Select suggestion or commit value
- **Escape**: Close suggestions

## ARIA Attributes

### DatePickerField / DateTimePickerField

```
- role="button"
- aria-haspopup="listbox"
- aria-label="Date picker, current value: {formatted date}"
- aria-expanded="false" (when closed) / "true" (when open)
```

### DatePickerPanel

```
- aria-label="Calendar"
- Day cells marked with [data-today] for screen reader styling
```

### DateTimePickerPanel

```
- Combines DatePickerPanel ARIA with time field ARIA
- Time input field has proper input labels
```

### ReadOnlyDateCell

```
- role="status"
- aria-live="polite" (updates announced to screen readers)
```

### TimeEntryField

```
- role="combobox"
- aria-expanded="false" (when closed) / "true" (when open)
- aria-owns="suggestions-list" (links to suggestions dropdown)
```

## Focus Management

### Visual Focus Indicators

All interactive elements have visible focus indicators via:
- Border color change to `--cobalt-50`
- Outline with shadow effect (`0 0 0 3px var(--cobalt-95)`)
- Minimum 3px outline offset for visibility

### Focus Trapping

- When a panel is open, focus remains within the panel
- Tab/Shift+Tab cycles through available controls
- Escape returns focus to the triggering field

### Focus Restoration

- After closing a panel with a selection, focus returns to the field
- After closing without selection, focus remains on the field

## Error Handling

### Error Messages

- Error text displayed in element with `role="alert"`
- Error messages automatically announced to screen readers
- Error state indicated by:
  - Red border (`#d32f2f`)
  - `[data-error]` attribute on field
  - Visible error text below field

### Disabled State

- Disabled fields have:
  - `[data-disabled]` attribute
  - Reduced opacity
  - `is-editable="false"` attribute
  - No keyboard interaction

## Color Contrast

All components are designed with WCAG AA color contrast ratios:
- Text on background: ≥4.5:1
- UI components on background: ≥3:1
- Uses CSS custom properties from Albert Design System

## Empty State Announcements

### ReadOnlyDateCell

- Empty state shows "—" (em-dash)
- With `aria-live="polite"`, changes are announced
- Custom empty state can be set via `empty-state` attribute

### DatePickerField / DateTimePickerField

- Empty field shows placeholder text (default or custom)
- aria-label indicates "none" when empty
- Required fields show error message when empty

## Semantic HTML

- All controls use native HTML elements where possible
- Custom elements use semantic roles (button, status, etc.)
- Labels and descriptions provided via ARIA when needed

## Testing

Comprehensive accessibility tests are provided in `tests/accessibility.spec.ts` covering:
- Keyboard navigation for all components
- ARIA attributes presence and correctness
- Focus management and visibility
- Error messaging and announcements
- Disabled state accessibility

Run tests with:
```bash
npm test
```

All 133 tests include accessibility verification alongside functional tests.

## Screen Reader Compatibility

Components are tested for compatibility with:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

Key practices:
- All interactive elements have proper roles
- Dynamic content uses `aria-live="polite"`
- Status messages use `role="alert"`
- Hidden elements use `aria-hidden="true"`

## Known Limitations

- Color-blind mode: Components use shape/icons alongside color for important state changes
- High contrast mode: CSS custom properties may need overrides for some browsers
- Mobile screen readers: Tab navigation may vary on touch devices

## Future Improvements

- [ ] Add aria-labels to individual calendar day cells
- [ ] Support for arrow key time increment/decrement in DateTimePickerPanel
- [ ] Customizable keyboard shortcuts
- [ ] Enhanced mobile keyboard handling
