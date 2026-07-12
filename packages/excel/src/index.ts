// @listgrid/excel — Excel data-transfer runtime (opt-in `/excel` subpath,
// spec §2/§3.5, CAP-17). W6-2a ships the FOUNDATION only: the registry DI
// seam (`configureDataTransfer`/`getDataTransfer`) and the per-type
// value-transform switch (`exportValue`/`importValue`/`isAutoDeriveExcluded`).
// `registerExcelDataTransfer` and the concrete `DataExporter`/`DataImporter`
// components (the xlsx/file-saver-backed core + thin modals) are W6-2b — not
// stubbed here.

export type { DataTransferComponents } from './registry';
export { configureDataTransfer, getDataTransfer } from './registry';

export { exportValue, importValue, isAutoDeriveExcluded } from './value-transform';
