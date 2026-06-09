/**
 * Global panel registry for enforcing single-open-at-a-time rule across picker panels.
 * Exposed on window for cross-instance coordination.
 */
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
    if (this.current === panel) {
      this.current = null;
    }
  }
}

// SSR guard: only access `window` in browser environments
if (typeof window !== 'undefined') {
  window.__albertPickerRegistry ??= new AlbertPickerRegistry();
}

export const panelRegistry: AlbertPickerRegistry =
  typeof window !== 'undefined'
    ? window.__albertPickerRegistry
    : new AlbertPickerRegistry();
