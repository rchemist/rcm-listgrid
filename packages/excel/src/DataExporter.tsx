// DataExporter — the export modal (W6-2b; spec §2 `/excel`). THIN by design
// (goal doc: "keep the modals THIN") — a field-selection checklist + a
// Download button; none of 0.3.x `DataExporter.tsx`'s
// password field (ExcelPasswordField) or `DataExportProcessor`
// paged-fetch-from-backend flow (decision 7 — export here is 100% client-side
// off already-fetched `rows`, W6-3 hard E2E gate: "클라 100%·백엛 불요").
//
// UI PRIMITIVES: reuses `@listgrid/react`'s `useUI()` seam (Modal/Button from
// the host's injected `UIComponents`, charter C7) rather than inventing new
// chrome — `DataExporter`/`DataImporter` are always rendered from a host's
// `ViewListGrid` `toolbar` render-prop (W6 decision 4), which itself only
// renders inside a `<UIProvider>` ancestor (`ViewListGrid` calls `useUI()`
// internally), so a `<UIProvider>` ancestor is guaranteed at the one call
// site this wave wires up (W6-3). The field checklist itself (no
// UIComponents equivalent exists) is a plain `<input type="checkbox">` list,
// same posture as `@listgrid/react`'s own renderers falling back to native
// elements where no primitive fits.
import { useMemo, useState } from 'react';
import type { EntityForm } from '@listgrid/schema-core';
import { useUI } from '@listgrid/react';
import {
  buildExportAoa,
  buildExportWorksheet,
  downloadExportWorkbook,
  resolveExportConfig,
} from './export-core';

export interface DataExporterProps {
  entityForm: EntityForm;
  /** Rows to export — host-supplied (already fetched/filtered list rows).
   *  Export never queries a backend itself (W6-3 hard gate: 100% client-side). */
  rows: Record<string, unknown>[];
  /** Overrides `entityForm.getDataTransfer()?.export?.fileName`. */
  fileName?: string | undefined;
  onClose?: (() => void) | undefined;
}

export function DataExporter({ entityForm, rows, fileName, onClose }: DataExporterProps) {
  const { Modal, Button } = useUI();
  const resolved = useMemo(() => resolveExportConfig(entityForm, fileName), [entityForm, fileName]);
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () => new Set(resolved.fields.map((f) => f.name)),
  );

  function toggle(name: string): void {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function handleDownload(): void {
    const activeFields = resolved.fields.filter((f) => selected.has(f.name));
    if (activeFields.length === 0) return;
    const aoa = buildExportAoa(entityForm, activeFields, rows);
    const ws = buildExportWorksheet(activeFields, aoa);
    downloadExportWorkbook(ws, resolved.fileName);
  }

  return (
    <Modal open title="Export" {...(onClose !== undefined ? { onClose } : {})}>
      <ul>
        {resolved.fields.map((field) => (
          <li key={field.name}>
            <label>
              <input
                type="checkbox"
                checked={selected.has(field.name)}
                onChange={() => toggle(field.name)}
              />
              {field.label ?? field.name}
            </label>
          </li>
        ))}
      </ul>
      <Button type="button" disabled={selected.size === 0} onClick={handleDownload}>
        Download
      </Button>
    </Modal>
  );
}
