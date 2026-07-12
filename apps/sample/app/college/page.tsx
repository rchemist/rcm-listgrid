'use client';

import { useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { useRouter } from 'next/navigation';
import { createListStore } from '@listgrid/state';
import { ViewListGrid } from '@listgrid/react';
import { getDataTransfer } from '@listgrid/excel';
import { CollegeEntityForm, collegeFetchUrl } from '../../lib/entities/college';
import { rcmAdapter } from '../../lib/adapter';

// College list page — charter C1: the SAME CollegeEntityForm declaration drives
// this list and the form pages. ViewListGrid fetches through the RCM adapter.
//
// W6-3 — Export/Import wired through ViewListGrid's `toolbar` render-prop
// (the ONLY UI seam, decision 4/C7 — no new ViewListGrid prop). The
// registered `@listgrid/excel` components (`getDataTransfer()`,
// registered once at bootstrap in `app/providers.tsx`) are rendered from
// here, host-supplied: export reads the store's already-fetched `rows`
// directly (100% client-side, no backend call — decision 7); import's
// `onSubmit` POSTs the parsed rows to this app's own
// `/api/college/excel-upload` route (decision 6, host owns the endpoint),
// then refetches the list so the new rows appear.
export default function CollegeListPage() {
  const router = useRouter();
  const entityForm = useMemo(() => CollegeEntityForm(), []);
  const store = useMemo(() => createListStore({ url: collegeFetchUrl, adapter: rcmAdapter }), []);
  const rows = useStore(store, (s) => s.rows);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const dataTransfer = getDataTransfer();

  async function handleImportSubmit(importedRows: Record<string, unknown>[]): Promise<void> {
    const res = await fetch('/api/college/excel-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: importedRows }),
    });
    if (!res.ok) throw new Error('엑셀 업로드에 실패했습니다.');
    await store.getState().fetch();
    setImportOpen(false);
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>단과대학</h1>
        <button type="button" onClick={() => router.push('/college/new')}>
          새로 만들기
        </button>
      </div>
      <ViewListGrid
        entityForm={entityForm}
        store={store}
        onRowClick={(row) => router.push(`/college/${String(row.id)}`)}
        toolbar={() => (
          <>
            <button type="button" onClick={() => setExportOpen(true)}>
              Export
            </button>
            <button type="button" onClick={() => setImportOpen(true)}>
              Import
            </button>
            {dataTransfer && exportOpen && (
              <dataTransfer.Exporter
                entityForm={entityForm}
                rows={rows}
                onClose={() => setExportOpen(false)}
              />
            )}
            {dataTransfer && importOpen && (
              <dataTransfer.Importer
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
