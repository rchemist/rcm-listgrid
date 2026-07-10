'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createListStore } from '@listgrid/state';
import { ViewListGrid } from '@listgrid/react';
import { CollegeEntityForm, collegeFetchUrl } from '../../lib/entities/college';
import { rcmAdapter } from '../../lib/adapter';

// College list page — charter C1: the SAME CollegeEntityForm declaration drives
// this list and the form pages. ViewListGrid fetches through the RCM adapter.
export default function CollegeListPage() {
  const router = useRouter();
  const entityForm = useMemo(() => CollegeEntityForm(), []);
  const store = useMemo(() => createListStore({ url: collegeFetchUrl, adapter: rcmAdapter }), []);

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
      />
    </main>
  );
}
