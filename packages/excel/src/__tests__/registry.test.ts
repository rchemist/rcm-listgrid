import { beforeEach, describe, expect, it, vi } from 'vitest';

// registry.ts (W6-2a, ported from 0.3.x `src/listgrid/transfer/registry.ts`)
// holds its `_components` singleton at MODULE scope, so each test gets a
// fresh module instance via `vi.resetModules()` + dynamic import rather than
// relying on declaration order to keep the "null before configure" case
// first.

beforeEach(() => {
  vi.resetModules();
});

describe('getDataTransfer', () => {
  it('returns null before configureDataTransfer has ever been called', async () => {
    const { getDataTransfer } = await import('../registry');
    expect(getDataTransfer()).toBeNull();
  });
});

describe('configureDataTransfer / getDataTransfer round-trip', () => {
  it('returns the exact components object passed to configureDataTransfer', async () => {
    const { configureDataTransfer, getDataTransfer } = await import('../registry');
    const components = {
      Exporter: () => null,
      Importer: () => null,
    };

    configureDataTransfer(components);

    expect(getDataTransfer()).toBe(components);
  });

  it('a later configureDataTransfer call replaces the previously registered components', async () => {
    const { configureDataTransfer, getDataTransfer } = await import('../registry');
    const first = { Exporter: () => null, Importer: () => null };
    const second = { Exporter: () => null, Importer: () => null };

    configureDataTransfer(first);
    configureDataTransfer(second);

    expect(getDataTransfer()).toBe(second);
    expect(getDataTransfer()).not.toBe(first);
  });
});
