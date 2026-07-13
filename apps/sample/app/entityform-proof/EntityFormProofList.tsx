'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createListStore } from '@listgrid/state';
import { ViewListGrid } from '@listgrid/react';
import { EntityFormProofCase } from '../../lib/entities/entityform-proof';
import { rcmAdapter } from '../../lib/adapter';

export function EntityFormProofList() {
  const router = useRouter();
  const entityForm = useMemo(() => EntityFormProofCase('baseline'), []);
  const store = useMemo(
    () => createListStore({ url: entityForm.url, adapter: rcmAdapter }),
    [entityForm],
  );
  return (
    <main data-proof-case="list" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <p>
        <a href="/entityform-proof">← proof hub</a>
      </p>
      <h1>EntityForm proof rows</h1>
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
