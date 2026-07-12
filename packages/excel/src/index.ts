// @listgrid/excel — Excel data-transfer runtime (opt-in `/excel` subpath,
// spec §2/§3.5, CAP-17). W6-2a shipped the FOUNDATION: the registry DI seam
// (`configureDataTransfer`/`getDataTransfer`) and the per-type value-
// transform switch (`exportValue`/`importValue`/`isAutoDeriveExcluded`).
// W6-2b adds the CLIENT runtime: `DataExporter` (build xlsx + download),
// `DataImporter` (parse uploaded xlsx + host-supplied `onSubmit`), and
// `registerExcelDataTransfer()` wiring both into the registry — the one-line
// bootstrap call ported from 0.3.x `src/excel.ts:29-31`.

export type { DataTransferComponents } from './registry';
export { configureDataTransfer, getDataTransfer } from './registry';

export { exportValue, importValue, isAutoDeriveExcluded } from './value-transform';

export { DataExporter } from './DataExporter';
export type { DataExporterProps } from './DataExporter';

export { DataImporter } from './DataImporter';
export type { DataImporterProps } from './DataImporter';

import { configureDataTransfer } from './registry';
import { DataExporter } from './DataExporter';
import { DataImporter } from './DataImporter';

/**
 * Register the Excel-backed export/import components into the core list's
 * data-transfer seam (`configureDataTransfer`, `registry.ts`). Call once at
 * app bootstrap. Requires `xlsx-js-style` and `file-saver` to be installed
 * (optional peers of this package).
 *
 * @example
 * import { registerExcelDataTransfer } from '@listgrid/excel';
 * registerExcelDataTransfer();
 */
export function registerExcelDataTransfer(): void {
  configureDataTransfer({ Exporter: DataExporter, Importer: DataImporter });
}
