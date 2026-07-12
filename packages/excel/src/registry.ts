import type { ComponentType } from 'react';
import type { DataExporterProps } from './DataExporter';
import type { DataImporterProps } from './DataImporter';

/**
 * Injection seam for the data export / import UI (ported from 0.3.x
 * `src/listgrid/transfer/registry.ts`, 38 LOC — verbatim shape, W6-2a).
 *
 * The concrete export/import components statically import the heavy
 * `xlsx-js-style` / `file-saver` peers. Rendering them directly from the core
 * list header (`DataTransferModals`) would pull those peers into the main
 * barrel graph and force every consumer to install them — defeating their
 * `optional: true` declaration.
 *
 * Instead the core list renders whatever the host registered here. The
 * concrete implementations ship in this opt-in `@listgrid/excel` package
 * (subpath `/excel`), which the host wires up at bootstrap via
 * `registerExcelDataTransfer()` (W6-2b) or by calling `configureDataTransfer`
 * directly. When nothing is registered the list's export/import actions
 * degrade gracefully (the modal renders nothing).
 *
 * Mirrors the existing DI pattern used by `configureApiClient` / `UIProvider`.
 * W6-2a typed both members `ComponentType<Record<string, unknown>>` (a
 * placeholder — this package had no concrete components yet). W6-2b refines
 * this to the REAL prop types (`DataExporterProps`/`DataImporterProps`,
 * `./DataExporter` / `./DataImporter`) now that they exist — a same-package
 * sibling import, not a new external dependency, so no circularity risk.
 */
export interface DataTransferComponents {
  /** Export modal — see `DataExporterProps` (`./DataExporter.tsx`). */
  Exporter: ComponentType<DataExporterProps>;
  /** Import modal — see `DataImporterProps` (`./DataImporter.tsx`). */
  Importer: ComponentType<DataImporterProps>;
}

let _components: DataTransferComponents | null = null;

/** Register concrete export/import components. Call once at app bootstrap. */
export function configureDataTransfer(components: DataTransferComponents): void {
  _components = components;
}

/** Registered components, or `null` when the host has not opted into data transfer. */
export function getDataTransfer(): DataTransferComponents | null {
  return _components;
}
