import type { ComponentType } from 'react';

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
 * The 0.3.x original typed both members `ComponentType<any>` ("house style
 * for injected components") — this package's lint config runs
 * `@typescript-eslint/no-explicit-any` as an error with no grandfather entry
 * for new `packages/*` code (unlike the legacy `src/` allowlist), so the
 * props are typed as `Record<string, unknown>` here: a minimal placeholder
 * that is exactly as untyped at the call site as `any` was, but does not
 * trip the lint gate. W6-2b's concrete `DataExporter`/`DataImporter`
 * components refine this to their real props shape (this package has no
 * React runtime dependency yet in W6-2a — only the type-only `react` import
 * below, which resolves without the `react` package installed).
 */
export interface DataTransferComponents {
  /** Export modal. Props: `{ config?, searchForm, fileName, onClose }`. */
  Exporter: ComponentType<Record<string, unknown>>;
  /** Import modal. Props: `{ config?, sampleFileName, onClose }`. */
  Importer: ComponentType<Record<string, unknown>>;
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
