'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createListStore } from '@listgrid/state';
import { ViewListGrid } from '@listgrid/react';
import { MajorEntityForm, majorFetchUrl } from '../../lib/entities/major';
import { rcmAdapter } from '../../lib/adapter';

// Major list page — charter C1: the SAME MajorEntityForm declaration drives
// this list and the form pages (EC3).
export default function MajorListPage() {
  const router = useRouter();
  const entityForm = useMemo(() => MajorEntityForm(), []);
  const store = useMemo(() => createListStore({ url: majorFetchUrl, adapter: rcmAdapter }), []);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>학부/학과</h1>
        <button type="button" onClick={() => router.push('/major/new')}>
          새로 만들기
        </button>
      </div>
      <ViewListGrid
        entityForm={entityForm}
        store={store}
        columns={['name', 'type', 'majorCode']}
        onRowClick={(row) => router.push(`/major/${String(row.id)}`)}
      />
    </main>
  );
}
