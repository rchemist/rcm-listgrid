'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEntityFormInitializer, ViewEntityForm } from '@listgrid/react';
import { MajorEntityForm, majorFetchUrl } from '../../../lib/entities/major';
import { rcmAdapter } from '../../../lib/adapter';

// Edit an existing Major — the EF3 useEntityFormInitializer pipeline (fetch
// -> onFetchData -> onInitialize -> build -> hydrate), same as collabo's
// edit page. `id` is threaded into the factory itself (`MajorEntityForm(id)`)
// so the parentMajor M2O's self-exclude filter can close over it — see
// major.ts's `parentMajorFilter` doc for why `entityForm.getId()` inside a
// field-declaration-time closure cannot observe the id `initializeFormStore`
// sets on its OWN clone later.
export default function MajorEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const entityFormDecl = useMemo(() => MajorEntityForm(id), [id]);
  const { store, entityForm, loading } = useEntityFormInitializer({
    entityForm: entityFormDecl,
    adapter: rcmAdapter,
    id,
  });

  async function handleSave(data: Record<string, unknown>): Promise<void> {
    await rcmAdapter.update(majorFetchUrl, id, data);
    router.push('/major');
  }

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      {loading || !store || !entityForm ? (
        <p>불러오는 중…</p>
      ) : (
        <ViewEntityForm entityForm={entityForm} store={store} onSave={handleSave} />
      )}
    </main>
  );
}
