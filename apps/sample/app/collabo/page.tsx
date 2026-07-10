'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createListStore } from '@listgrid/state';
import { ViewListGrid } from '@listgrid/react';
import { CollaboEntityForm, collaboFetchUrl } from '../../lib/entities/collabo';
import { rcmAdapter } from '../../lib/adapter';

// Collabo list page — EC2 (plan §EC). `columns` is explicit rather than the
// default first-4-fields derivation: several of Collabo's fields share the
// same declared `order` across field groups (name-parity with the GJCU
// source, which numbers each field group's fields from 100 independently),
// so the default derivation's tie-break (declaration order) would produce a
// column set that's correct but not obviously intentional — explicit here
// picks the fields that actually identify/triage a row.
export default function CollaboListPage() {
  const router = useRouter();
  const entityForm = useMemo(() => CollaboEntityForm(), []);
  const store = useMemo(() => createListStore({ url: collaboFetchUrl, adapter: rcmAdapter }), []);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>산학협력기관</h1>
        <button type="button" onClick={() => router.push('/collabo/new')}>
          새로 만들기
        </button>
      </div>
      <ViewListGrid
        entityForm={entityForm}
        store={store}
        columns={['name', 'representative', 'officer', 'type']}
        onRowClick={(row) => router.push(`/collabo/${String(row.id)}`)}
      />
    </main>
  );
}
