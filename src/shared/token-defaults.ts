/**
 * Default values for the CSS custom properties used by the albert-date-picker
 * web components. These are the fallback values in every var(--token, fallback)
 * call so the components render correctly in host applications that do not
 * define the Albert design tokens.
 *
 * Keeping them here means every component picks up changes in one place.
 */
const DEFAULTS: Record<string, string> = {
  'border':       '#d1d5db',
  'radius-sm':    '6px',
  'background':   '#ffffff',
  'font-sans':    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  'text':         '#111827',
  'text-medium':  '#6b7280',
  'text-dim':     '#9ca3af',
  'text-disabled':'#d1d5db',
  'cobalt-50':    '#0054b9',
  'cobalt-95':    '#eff6ff',
  'secondary': '#f0f2f6',
  'shadow-3':     '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
  'slate-90':     '#f1f5f9',
  'cell-size':    '36px',
  'panel-width':  '280px',
  'error':        '#d32f2f',
  'font-size-sm': '0.75rem',
  'spacing-sm':   '0.25rem',
};

/**
 * Replace every var(--token) (no existing fallback) in a shadow-DOM style
 * string with var(--token, <default>) using the table above.
 * Calls that already have a fallback are left untouched.
 */
export function applyTokenDefaults(css: string): string {
  return css.replace(
    /var\(--([a-zA-Z0-9-]+)\)/g,
    (_match, name) => {
      const fallback = DEFAULTS[name];
      return fallback ? `var(--${name}, ${fallback})` : `var(--${name})`;
    }
  );
}
