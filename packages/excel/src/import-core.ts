// Import CORE — parse an uploaded xlsx File client-side into
// `Record<string, unknown>[]` rows (W6-2b; spec §2 `/excel`). Ported from
// 0.3.x `src/listgrid/transfer/DataImporter.tsx:113-387`: `FileReader.
// readAsArrayBuffer` -> `XLSX.read(...,{type:'array'})` -> `sheet_to_json({
// header:1})` (:128-131), header-cell `[fieldName]` matching (:147-163),
// per-cell `getValueOnImport` (this module's `importValue`), all-blank-row
// drop (:66, gjcu #1478).
//
// OMITTED (W6 decision 6 — host-supplied upload, this module never calls a
// BackendAdapter method or hardcodes an endpoint; POST is `DataImporter.tsx`
// component's `onSubmit` prop, not this pure-parsing core) and decision 7
// (preview/result/sample UI — DataImportProcessor/DataImportResultView/
// DataImportSample, `overrideParseResult`/`renderAsyncResult` hooks — not
// ported).
import * as XLSX from 'xlsx-js-style';
import type { DataFieldSpec, EntityForm } from '@listgrid/schema-core';
import { importValue } from './value-transform';
import { filterFlatFields, getFieldSelectOptions } from './field-resolution';

export interface ParsedImportSheet {
  header: unknown[];
  bodyRows: unknown[][];
}

/**
 * Parse a raw xlsx `ArrayBuffer` (the result of `FileReader.
 * readAsArrayBuffer`) into a header row + body AOA — first sheet only
 * (`DataImporter.tsx:126-131`'s `wb.SheetNames[0]`).
 */
export function parseWorkbookArrayBuffer(buffer: ArrayBuffer): ParsedImportSheet {
  const wb: XLSX.WorkBook = XLSX.read(buffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const ws = sheetName !== undefined ? wb.Sheets[sheetName] : undefined;
  const aoa: unknown[][] = ws !== undefined ? XLSX.utils.sheet_to_json(ws, { header: 1 }) : [];
  const [header, ...bodyRows] = aoa;
  return { header: header ?? [], bodyRows };
}

export interface MatchedImportColumn {
  excelColIndex: number;
  field: DataFieldSpec;
}

/** Pulls `fieldName` out of a `"Label\n[fieldName]"` header cell (or, absent
 *  brackets, treats the whole trimmed cell text as the field name). */
const FIELD_TOKEN_RE = /\[([^[\]]+)]/;

/**
 * Match parsed header cells against the declared import `fields` via the
 * `[name]` embedded token (ported `DataImporter.tsx:147-163`). Resolves this
 * side's fields the same way `export-core.ts` does — `EntityForm.
 * getDataTransfer()?.import?.fields`, TIER-3-filtered (decision 5,
 * `field-resolution.ts`) — via {@link resolveImportFields}, called by the
 * `DataImporter` component before this function. Unmatched header cells (and
 * declared fields absent from the header) are simply absent from the result.
 */
export function matchImportColumns(
  header: readonly unknown[],
  fields: readonly DataFieldSpec[],
): MatchedImportColumn[] {
  const fieldByName = new Map(fields.map((f) => [f.name, f]));
  const matched: MatchedImportColumn[] = [];
  header.forEach((rawCell, excelColIndex) => {
    const cellText = String(rawCell ?? '');
    const token = FIELD_TOKEN_RE.exec(cellText);
    const fieldName = token?.[1] !== undefined ? token[1].trim() : cellText.trim();
    const field = fieldByName.get(fieldName);
    if (field) matched.push({ excelColIndex, field });
  });
  return matched;
}

/** Resolve this `EntityForm`'s import field list — `getDataTransfer()?.
 *  import?.fields`, TIER-3-filtered (decision 5). */
export function resolveImportFields(entityForm: EntityForm): DataFieldSpec[] {
  const importSpec = entityForm.getDataTransfer()?.import;
  return filterFlatFields(importSpec?.fields ?? []);
}

function isBlankCell(value: unknown): boolean {
  return value === undefined || value === null || String(value).trim() === '';
}

/**
 * Bridge an `importValue` result back to the field's runtime value shape —
 * the inverse of `export-core.ts`'s `bridgeExportValue`: `multiselect`'s
 * `'|||'`-joined wire string becomes a `string[]` (value-transform.ts doc,
 * "bridging ... is the export/import CORE's job").
 */
function bridgeImportValue(entityForm: EntityForm, spec: DataFieldSpec, raw: unknown): unknown {
  const type = spec.type ?? 'text';
  const options = getFieldSelectOptions(entityForm, spec.name);
  const value = importValue(type, raw, options !== undefined ? { options } : undefined);
  if (type === 'multiselect') {
    const joined = value === undefined || value === null ? '' : String(value);
    return joined === '' ? [] : joined.split('|||');
  }
  return value;
}

/**
 * Build imported rows from matched columns + the body AOA, dropping any row
 * whose matched cells are ALL blank (ported blank-row drop, `DataImporter.
 * tsx:66`, gjcu #1478 — a user deleting rows in Excel doesn't shrink the
 * sheet's `!ref` dimension, so `sheet_to_json` still yields trailing empty
 * rows that must not reach `onSubmit`).
 */
export function buildImportRows(
  entityForm: EntityForm,
  matched: readonly MatchedImportColumn[],
  bodyRows: readonly unknown[][],
): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  for (const rawRow of bodyRows) {
    const allBlank = matched.every((m) => isBlankCell(rawRow[m.excelColIndex]));
    if (allBlank) continue;
    const row: Record<string, unknown> = {};
    for (const m of matched) {
      row[m.field.name] = bridgeImportValue(entityForm, m.field, rawRow[m.excelColIndex]);
    }
    rows.push(row);
  }
  return rows;
}
