'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createFormStore } from '@listgrid/state';
import { ViewEntityForm } from '@listgrid/react';
import { CollegeEntityForm, collegeFetchUrl } from '../../../lib/entities/college';
import { rcmAdapter } from '../../../lib/adapter';

// Edit an existing College — fetch the record, hydrate the store (→ update
// mode), then ViewEntityForm validates and PUTs via the adapter.
export default function CollegeEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const entityForm = useMemo(() => CollegeEntityForm().clone().withId(id), [id]);
  const store = useMemo(() => createFormStore(entityForm, { renderType: 'update' }), [entityForm]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    rcmAdapter
      .getOne(collegeFetchUrl, id)
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
    await rcmAdapter.update(collegeFetchUrl, id, data);
    router.push('/college');
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
