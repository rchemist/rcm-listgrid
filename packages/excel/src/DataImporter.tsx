// DataImporter — the import modal (W6-2b; spec §2 `/excel`). THIN by design
// (goal doc: "keep the modals THIN") — a file input + a Submit button; none
// of 0.3.x `DataImporter.tsx`'s preview/result/sample UI
// (DataImportSample/DataImportProcessor/DataImportResultView — decision 7,
// not ported).
//
// SUBMIT MECHANISM (W6 decision 6 — load-bearing): `onSubmit` is a
// HOST-SUPPLIED callback prop, `(rows) => Promise<void> | void`. This module
// never calls a BackendAdapter method and never hardcodes an upload
// endpoint — the host (W6-3 sample) owns the actual POST, same posture as
// `ViewListGridSelection.onConfirm` (@listgrid/react) already established
// for "host owns the call, this package owns the UI".
//
// UI PRIMITIVES: see DataExporter.tsx's file-header note — `useUI()`
// (`@listgrid/react`) for Modal/Button chrome. The upload widget itself is a
// plain `<input type="file">` rather than `@listgrid/ui-default`'s
// `FileInput` primitive: that primitive's contract is upload-then-URL
// (`onUpload: (file) => Promise<{url}>`, `types.ts` `FileInputProps`) for
// asset fields bound to a server-stored URL — it has no way to hand back the
// raw `File` this module's `FileReader`/`XLSX.read` client-side parse needs,
// so it does not fit and a native element is used instead (same fallback
// posture the brief allows: "otherwise render plain semantic elements").
import { useState, type ChangeEvent } from 'react';
import type { EntityForm } from '@listgrid/schema-core';
import { useUI } from '@listgrid/react';
import {
  buildImportRows,
  matchImportColumns,
  parseWorkbookArrayBuffer,
  resolveImportFields,
} from './import-core';

export interface DataImporterProps {
  entityForm: EntityForm;
  /** Host-supplied submit callback (decision 6) — receives the fully parsed
   *  + value-transformed rows, ready to POST. */
  onSubmit: (rows: Record<string, unknown>[]) => Promise<void> | void;
  onClose?: (() => void) | undefined;
}

const NO_FIELD_MATCH_ERROR = '업로드 대상 필드가 일치하지 않습니다.';
const NO_DATA_ERROR = '데이터가 존재하지 않습니다.';
const PARSE_ERROR = '엑셀 파일을 읽는 중 오류가 발생했습니다. 파일 형식(xlsx)을 확인하세요.';

export function DataImporter({ entityForm, onSubmit, onClose }: DataImporterProps) {
  const { Modal, Button } = useUI();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  function reset(): void {
    setRows([]);
    setError(undefined);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) return;
    reset();

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const buffer = loadEvent.target?.result;
        if (!(buffer instanceof ArrayBuffer)) {
          setError(PARSE_ERROR);
          return;
        }
        const { header, bodyRows } = parseWorkbookArrayBuffer(buffer);
        const fields = resolveImportFields(entityForm);
        const matched = matchImportColumns(header, fields);
        if (matched.length === 0) {
          setError(NO_FIELD_MATCH_ERROR);
          return;
        }
        const parsedRows = buildImportRows(entityForm, matched, bodyRows);
        if (parsedRows.length === 0) {
          setError(NO_DATA_ERROR);
          return;
        }
        setRows(parsedRows);
      } catch {
        setError(PARSE_ERROR);
      }
    };
    reader.onerror = () => setError(PARSE_ERROR);
    reader.readAsArrayBuffer(file);
  }

  async function handleSubmit(): Promise<void> {
    if (rows.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(rows);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open title="Import" {...(onClose !== undefined ? { onClose } : {})}>
      <input
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        onChange={handleFileChange}
      />
      {error !== undefined && <div role="alert">{error}</div>}
      <Button type="button" disabled={rows.length === 0 || submitting} onClick={handleSubmit}>
        Submit
      </Button>
    </Modal>
  );
}
