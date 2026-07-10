'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createListStore } from '@listgrid/state';
import { ViewListGrid } from '@listgrid/react';
import { SubjectEntityForm, subjectFetchUrl } from '../../lib/entities/subject';
import { rcmAdapter } from '../../lib/adapter';

export default function SubjectListPage() {
  const router = useRouter();
  const entityForm = useMemo(() => SubjectEntityForm(), []);
  const store = useMemo(() => createListStore({ url: subjectFetchUrl, adapter: rcmAdapter }), []);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>과목</h1>
        <button type="button" onClick={() => router.push('/subject/new')}>
          새로 만들기
        </button>
      </div>
      <ViewListGrid
        entityForm={entityForm}
        store={store}
        onRowClick={(row) => router.push(`/subject/${String(row.id)}`)}
      />
    </main>
  );
}
