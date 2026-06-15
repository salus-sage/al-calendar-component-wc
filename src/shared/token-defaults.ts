/**
 * Default values for the CSS custom properties used by the albert-date-picker
 * web components. These are the fallback values in every var(--token, fallback)
 * call so the components render correctly in host applications that do not
 * define the Albert design tokens.
 *
 * Keeping them here means every component picks up changes in one place.
 */
const DEFAULTS: Record<string, string> = {
  'border':       '#d3d9e5',
  'radius-sm':    '4px',
  'background':   '#ffffff',
  'font-sans':    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  'text':         '#1e1e29',
  'text-medium':  '#4d5e80',
  'text-dim':     '#9aaccf',
  'text-disabled':'#d1d5db',
  'cobalt-50':    '#0054b9',
  'cobalt-95':    '#D6E9FF',
  'secondary':    '#f0f2f6',
  'shadow-3':     '0 1px 3px 0 rgba(77, 94, 128, 0.30), 0 4px 8px 3px rgba(77, 94, 128, 0.15)',
  'slate-90':     '#F0F2F6',
  'slate-70':     '#D3D9E5',
  'cell-size':    '36px',
  'panel-width':  '280px',
  'error':        '#d32f2f',
  'font-size-sm': '13px',
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
