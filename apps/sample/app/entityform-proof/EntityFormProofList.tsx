'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from 'zustand';
import { createListStore } from '@listgrid/state';
import { useSession, ViewListGrid } from '@listgrid/react';
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
  const diagnostics = {
    caseId,
    loading,
    totalElements,
    rows: rows.map((row) => ({ id: row.id, name: row.name, note: row.note })),
    trace: entityForm.getMeta().lifecycleTrace ?? [],
  };
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
      />
    </main>
  );
}
