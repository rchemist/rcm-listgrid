'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createListStore } from '@listgrid/state';
import { ViewListGrid } from '@listgrid/react';
import { ProfessorEntityForm, professorFetchUrl } from '../../lib/entities/professor';
import { rcmAdapter } from '../../lib/adapter';

export default function ProfessorListPage() {
  const router = useRouter();
  const entityForm = useMemo(() => ProfessorEntityForm(), []);
  const store = useMemo(() => createListStore({ url: professorFetchUrl, adapter: rcmAdapter }), []);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>교수</h1>
        <button type="button" onClick={() => router.push('/professor/new')}>
          새로 만들기
        </button>
      </div>
      <ViewListGrid
        entityForm={entityForm}
        store={store}
        onRowClick={(row) => router.push(`/professor/${String(row.id)}`)}
      />
    </main>
  );
}
