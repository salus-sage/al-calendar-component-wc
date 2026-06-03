// Albert DS token constant references
// These are CSS custom property names used throughout the components

export const tokens = {
  font: {
    sans: 'var(--font-sans)',
  },
  text: {
    base: 'var(--text)',
    medium: 'var(--text-medium)',
    dim: 'var(--text-dim)',
    disabled: 'var(--text-disabled)',
  },
  brand: {
    cobalt50: 'var(--cobalt-50)',
    cobalt95: 'var(--cobalt-95)',
  },
  background: {
    base: 'var(--background)',
    slate90: 'var(--slate-90)',
    slate70: 'var(--slate-70)',
  },
  border: {
    base: 'var(--border)',
    slate70: 'var(--slate-70)',
  },
  radius: {
    sm: 'var(--radius-sm)',
    md: '6px',
  },
  shadow: {
    lg: 'var(--shadow-3)',
  },
} as const;
