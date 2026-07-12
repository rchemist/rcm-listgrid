import { beforeEach, describe, expect, it, vi } from 'vitest';

// Same module-scope-singleton posture as registry.test.ts (W6-2a) —
// `configureDataTransfer`'s `_components` lives at module scope, so each
// test gets a fresh module instance via `vi.resetModules()` + dynamic import.

beforeEach(() => {
  vi.resetModules();
});

describe('registerExcelDataTransfer', () => {
  it('wires DataExporter/DataImporter into the registry — getDataTransfer() returns both', async () => {
    const { registerExcelDataTransfer, getDataTransfer, DataExporter, DataImporter } =
      await import('../index');

    registerExcelDataTransfer();

    const components = getDataTransfer();
    expect(components?.Exporter).toBe(DataExporter);
    expect(components?.Importer).toBe(DataImporter);
  });

  it('getDataTransfer() is null before registerExcelDataTransfer has been called', async () => {
    const { getDataTransfer } = await import('../index');
    expect(getDataTransfer()).toBeNull();
  });
});
