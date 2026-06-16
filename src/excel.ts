// Opt-in subpath: `@rchemist/listgrid/excel`
//
// Bundles the `xlsx-js-style` / `file-saver`-backed data export & import surface
// that was pulled OUT of the main barrel, plus the one-line
// `registerExcelDataTransfer()` that wires it into the core list header via the
// `configureDataTransfer` injection seam. Importing from here requires the
// optional peers `xlsx-js-style` and `file-saver` to be installed.
import { configureDataTransfer } from './listgrid/transfer/registry';
import { DataExporter } from './listgrid/transfer/DataExporter';
import { DataImporter } from './listgrid/transfer/DataImporter';

export { DataExporter } from './listgrid/transfer/DataExporter';
export { DataImporter } from './listgrid/transfer/DataImporter';
export { DataExportProcessor } from './listgrid/transfer/DataExportProcessor';
export { DataImportSample } from './listgrid/transfer/DataImportSample';
export { default as DynamicDataImporter } from './listgrid/transfer/DynamicDataImporter';
export * from './listgrid/transfer/DynamicDataImporter';
export * from './listgrid/transfer/Provider/ExcelProvider';

/**
 * Register the Excel-backed export/import components into the core list's data
 * transfer seam. Call once at app bootstrap. Requires `xlsx-js-style` and
 * `file-saver` to be installed.
 *
 * @example
 * import { registerExcelDataTransfer } from '@rchemist/listgrid/excel';
 * registerExcelDataTransfer();
 */
export function registerExcelDataTransfer(): void {
  configureDataTransfer({ Exporter: DataExporter, Importer: DataImporter });
}
