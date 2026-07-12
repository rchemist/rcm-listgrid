// Export CORE — client-side xlsx build + download (W6-2b; spec §2 `/excel`,
// entityform-api-implementation-waves.md W6-2 착수 노트). Ported from 0.3.x
// `src/listgrid/transfer/Provider/ExcelProvider.ts:71-219` (`ExcelDownload`):
// header cells `${label}\n[${name}]` (:92), `XLSX.utils.aoa_to_sheet`, forced
// text format for text/select/multiselect/phone cells (:139-148), header row
// styling (:155-172), col width 20 (:175), `XLSX.write(...,{type:'array'})`
// (:182), `FileSaver.saveAs` (:213).
//
// OMITTED (entityform-api-implementation-waves.md W6 decision 7 — charter C6
// "코어 밖", not ported): officecrypto/password encryption (:48-59),
// `logExcelDownload`/excelDownloadHistory POST (:20-37), the `skipHeader`
// json round-trip (:106-114 — no `excludeHeader` knob exists on the new
// minimal `DataFieldSpec`/`DataTransferInput` surface, spec §3.5, so there is
// nothing left to gate it on).
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import type { DataFieldSpec, EntityForm, FieldType } from '@listgrid/schema-core';
import { exportValue } from './value-transform';
import { filterFlatFields, getFieldSelectOptions } from './field-resolution';

/** Field types the old engine forces to Excel "text" format so leading zeros
 *  / option codes aren't mangled by Excel's general-number auto-detection
 *  (verbatim port of `ExcelProvider.ts:141-146`'s type list). */
const TEXT_FORMAT_TYPES: ReadonlySet<FieldType> = new Set<FieldType>([
  'text',
  'select',
  'multiselect',
  'phone',
]);

export interface ResolvedExportConfig {
  /** TIER-3-filtered field list (decision 5, `field-resolution.ts`). */
  fields: DataFieldSpec[];
  /** Download file name, WITHOUT the `.xlsx` extension (added at download time). */
  fileName: string;
}

/**
 * Resolve which fields to export + the download file name from the
 * `EntityForm`'s declared data-transfer config. `fileNameOverride` (a
 * `DataExporterProps.fileName` prop) wins over the declared
 * `getDataTransfer()?.export?.fileName`, which wins over `entityForm.name`
 * (always a non-empty string, `EntityForm` constructor-guaranteed).
 */
export function resolveExportConfig(
  entityForm: EntityForm,
  fileNameOverride?: string | undefined,
): ResolvedExportConfig {
  const exportSpec = entityForm.getDataTransfer()?.export;
  const fields = filterFlatFields(exportSpec?.fields ?? []);
  const fileName = fileNameOverride ?? exportSpec?.fileName ?? entityForm.name;
  return { fields, fileName };
}

/**
 * Bridge a `multiselect` field's runtime `string[]` value to the `'|||'`-
 * joined wire string `exportValue`'s TIER 1 switch expects (value-transform.ts
 * doc: "bridging that array to/from this string encoding is the export/
 * import CORE's job (W6-2b)"), then run the per-type transform.
 */
function bridgeExportValue(entityForm: EntityForm, spec: DataFieldSpec, raw: unknown): string {
  const type = spec.type ?? 'text';
  const value = type === 'multiselect' && Array.isArray(raw) ? raw.join('|||') : raw;
  const options = getFieldSelectOptions(entityForm, spec.name);
  return exportValue(type, value, options !== undefined ? { options } : undefined);
}

/**
 * Build the AOA (array-of-arrays) `XLSX.utils.aoa_to_sheet` expects: header
 * row = `${label}\n[${name}]` per column (`ExcelProvider.ts:92`), then one
 * row per `rows` entry with each cell run through `exportValue`.
 */
export function buildExportAoa(
  entityForm: EntityForm,
  fields: readonly DataFieldSpec[],
  rows: readonly Record<string, unknown>[],
): string[][] {
  const header = fields.map((f) => `${f.label ?? f.name}\n[${f.name}]`);
  const body = rows.map((row) => fields.map((f) => bridgeExportValue(entityForm, f, row[f.name])));
  return [header, ...body];
}

/**
 * Build the styled `XLSX.WorkSheet` from an AOA (`buildExportAoa`'s output) —
 * text-format for `TEXT_FORMAT_TYPES` cells, bold/filled/bordered header row,
 * fixed col width 20 (verbatim port of `ExcelProvider.ts:118-176`, minus the
 * `skipHeader` branch — see file header).
 */
export function buildExportWorksheet(
  fields: readonly DataFieldSpec[],
  aoa: readonly string[][],
): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(aoa as string[][]);
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

  // Force text format on data rows (header excluded — starts at R=1) for the
  // types listed in TEXT_FORMAT_TYPES (ExcelProvider.ts:126-148).
  for (let r = 1; r <= range.e.r; r++) {
    for (let c = 0; c <= range.e.c; c++) {
      const spec = fields[c];
      if (spec?.type === undefined || !TEXT_FORMAT_TYPES.has(spec.type)) continue;
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      if (!cell) continue;
      cell.t = 's';
      cell.z = '@';
    }
  }

  // Header row styling (ExcelProvider.ts:155-172).
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    const cell = ws[addr];
    if (!cell) continue;
    cell.s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'F1F5FE' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };
  }

  ws['!cols'] = Array.from({ length: range.e.c - range.s.c + 1 }, () => ({ wch: 20 }));
  return ws;
}

/**
 * Write the worksheet to an xlsx `Blob` and trigger the browser download via
 * `file-saver` (`ExcelProvider.ts:182,213`). `fileName` may or may not carry
 * the `.xlsx` extension already — it is appended when missing.
 */
export function downloadExportWorkbook(ws: XLSX.WorkSheet, fileName: string): void {
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const xlsx = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([xlsx], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const finalName = fileName.toLowerCase().endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  saveAs(blob, finalName);
}
