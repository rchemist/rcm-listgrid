'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createListStore } from '@listgrid/state';
import { ViewListGrid } from '@listgrid/react';
import { StudentEntityForm, studentFetchUrl } from '../../lib/entities/student';
import { rcmAdapter } from '../../lib/adapter';

// Student list page — EC1 (plan §EC). `columns` is explicit (name +
// postalCode) rather than the default first-4-fields derivation: without it
// ViewListGrid would also surface the composite `address` field and the
// state/city siblings as raw (mostly-empty, own-store-slice) columns —
// `AddressField.exceptOnSave` keeps its slot out of saves but says nothing
// about list-column derivation, so this is a page-level choice, not a
// library one.
export default function StudentListPage() {
  const router = useRouter();
  const entityForm = useMemo(() => StudentEntityForm(), []);
  const store = useMemo(() => createListStore({ url: studentFetchUrl, adapter: rcmAdapter }), []);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>학생</h1>
        <button type="button" onClick={() => router.push('/student/new')}>
          새로 만들기
        </button>
      </div>
      <ViewListGrid
        entityForm={entityForm}
        store={store}
        columns={['name', 'postalCode']}
        onRowClick={(row) => router.push(`/student/${String(row.id)}`)}
      />
    </main>
  );
}
