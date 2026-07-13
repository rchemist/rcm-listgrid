'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from 'zustand';
import { createListStore } from '@listgrid/state';
import { useSession, ViewListGrid } from '@listgrid/react';
import { getDataTransfer } from '@listgrid/excel';
import { EntityFormProofCase } from '../../lib/entities/entityform-proof';
import { rcmAdapter } from '../../lib/adapter';

export function EntityFormProofList({ caseId = 'baseline' }: { caseId?: string }) {
  const router = useRouter();
  const session = useSession();
  const entityForm = useMemo(() => EntityFormProofCase(caseId), [caseId]);
  const store = useMemo(
    () =>
      createListStore({
        url: entityForm.url,
        adapter: rcmAdapter,
        entityForm,
        ...(session !== undefined ? { session } : {}),
      }),
    [entityForm, session],
  );
  const rows = useStore(store, (state) => state.rows);
  const totalElements = useStore(store, (state) => state.totalElements);
  const loading = useStore(store, (state) => state.loading);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const transferComponents = getDataTransfer();
  const transfer = entityForm.getDataTransfer();
  const diagnostics = {
    caseId,
    loading,
    totalElements,
    rows: rows.map((row) => ({ id: row.id, name: row.name, note: row.note })),
    trace: entityForm.getMeta().lifecycleTrace ?? [],
    transfer: {
      export: transfer?.export?.fields.map((field) => field.name),
      import: transfer?.import?.fields.map((field) => field.name),
      fileName: transfer?.export?.fileName,
    },
  };

  async function handleImportSubmit(importedRows: Record<string, unknown>[]): Promise<void> {
    const response = await fetch('/api/entityform-proof/excel-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: importedRows }),
    });
    if (!response.ok) throw new Error('EntityForm proof Excel import failed');
    await store.getState().fetch();
    setImportOpen(false);
  }
  return (
    <main
      data-proof-case={caseId}
      style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}
    >
      <p>
        <a href="/entityform-proof">← proof hub</a>
      </p>
      <h1>EntityForm proof rows</h1>
      <pre data-list-proof-diagnostics>{JSON.stringify(diagnostics)}</pre>
      <button type="button" onClick={() => router.push('/entityform-proof/baseline')}>
        새로 만들기
      </button>
      <ViewListGrid
        entityForm={entityForm}
        store={store}
        onRowClick={(row) => router.push(`/entityform-proof/baseline/${String(row.id)}`)}
        toolbar={() => (
          <>
            {transfer?.export !== undefined && (
              <button type="button" onClick={() => setExportOpen(true)}>
                Export
              </button>
            )}
            {transfer?.import !== undefined && (
              <button type="button" onClick={() => setImportOpen(true)}>
                Import
              </button>
            )}
            {transferComponents && transfer?.export !== undefined && exportOpen && (
              <transferComponents.Exporter
                entityForm={entityForm}
                rows={rows}
                onClose={() => setExportOpen(false)}
              />
            )}
            {transferComponents && transfer?.import !== undefined && importOpen && (
              <transferComponents.Importer
                entityForm={entityForm}
                onSubmit={handleImportSubmit}
                onClose={() => setImportOpen(false)}
              />
            )}
          </>
        )}
      />
    </main>
  );
}
