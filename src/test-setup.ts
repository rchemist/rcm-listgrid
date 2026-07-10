import '@testing-library/jest-dom/vitest';

// --- Web Storage polyfill -------------------------------------------------
// Node 20+ exposes an experimental global `localStorage`/`sessionStorage`
// that is inert unless the process is started with `--localstorage-file`
// (Node 26 warns: "localStorage is not available because --localstorage-file
// was not provided"). That inert global shadows jsdom's implementation, so
// tests that exercise Web Storage fail with `Cannot read properties of
// undefined (reading 'clear')`. Install a deterministic in-memory Storage
// on both `globalThis` and `window` so storage behaves consistently across
// Node/jsdom versions regardless of runtime flags.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

function installStorage(name: 'localStorage' | 'sessionStorage'): void {
  const storage = new MemoryStorage();
  for (const target of [globalThis, globalThis.window].filter(Boolean) as object[]) {
    Object.defineProperty(target, name, {
      value: storage,
      configurable: true,
      writable: true,
      enumerable: true,
    });
  }
}

installStorage('localStorage');
installStorage('sessionStorage');
