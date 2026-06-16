import type { ComponentType } from 'react';

/**
 * Injection seam for the data export / import UI.
 *
 * The concrete export/import components statically import the heavy
 * `xlsx-js-style` / `file-saver` peers. Rendering them directly from the core
 * list header (`DataTransferModals`) would pull those peers into the main
 * barrel graph and force every consumer to install them — defeating their
 * `optional: true` declaration.
 *
 * Instead the core list renders whatever the host registered here. The concrete
 * implementations ship in the opt-in `@rchemist/listgrid/excel` entry, which the
 * host wires up at bootstrap via `registerExcelDataTransfer()` (or by calling
 * `configureDataTransfer(...)` directly). When nothing is registered the list's
 * export/import actions degrade gracefully (the modal renders nothing).
 *
 * Mirrors the existing DI pattern used by `configureApiClient` / `UIProvider`
 * (`ComponentType<any>` is the house style for injected components).
 */
export interface DataTransferComponents {
  /** Export modal. Props: `{ config?, searchForm, fileName, onClose }`. */
  Exporter: ComponentType<any>;
  /** Import modal. Props: `{ config?, sampleFileName, onClose }`. */
  Importer: ComponentType<any>;
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
