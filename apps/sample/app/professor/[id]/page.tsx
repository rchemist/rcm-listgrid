'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createFormStore } from '@listgrid/state';
import { ViewEntityForm } from '@listgrid/react';
import { ProfessorEntityForm, professorFetchUrl } from '../../../lib/entities/professor';
import { rcmAdapter } from '../../../lib/adapter';

export default function ProfessorEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const entityForm = useMemo(() => ProfessorEntityForm().clone().withId(id), [id]);
  const store = useMemo(() => createFormStore(entityForm, { renderType: 'update' }), [entityForm]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    rcmAdapter
      .getOne(professorFetchUrl, id)
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
    await rcmAdapter.update(professorFetchUrl, id, data);
    router.push('/professor');
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
