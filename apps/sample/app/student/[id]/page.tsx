'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createFormStore } from '@listgrid/state';
import { ViewEntityForm } from '@listgrid/react';
import { StudentEntityForm, studentFetchUrl } from '../../../lib/entities/student';
import { rcmAdapter } from '../../../lib/adapter';

// Edit an existing Student — fetch the record, hydrate the store (→ update
// mode; the flat address siblings hydrate straight from the fetched columns,
// no onFetchData needed — see applyFullAddressFields header), then
// ViewEntityForm validates and PUTs via the adapter.
export default function StudentEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const entityForm = useMemo(() => StudentEntityForm().clone().withId(id), [id]);
  const store = useMemo(() => createFormStore(entityForm, { renderType: 'update' }), [entityForm]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    rcmAdapter
      .getOne(studentFetchUrl, id)
      .then((data) => {
        if (!cancelled) {
          store.getState().hydrate(data as Record<string, unknown>);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id, store]);

  async function handleSave(data: Record<string, unknown>): Promise<void> {
    await rcmAdapter.update(studentFetchUrl, id, data);
    router.push('/student');
  }

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      {loaded ? (
        <ViewEntityForm entityForm={entityForm} store={store} onSave={handleSave} />
      ) : (
        <p>불러오는 중…</p>
      )}
    </main>
  );
}
