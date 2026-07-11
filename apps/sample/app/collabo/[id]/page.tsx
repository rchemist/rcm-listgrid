'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEntityFormInitializer, ViewEntityForm } from '@listgrid/react';
import { CollaboEntityForm, collaboFetchUrl } from '../../../lib/entities/collabo';
import { rcmAdapter } from '../../../lib/adapter';

// Edit an existing Collabo — the EF3 `useEntityFormInitializer` pipeline
// (fetch -> onFetchData -> onInitialize -> build -> hydrate), NOT the sync
// `createFormStore` + `useEffect(hydrate)` pattern college/student's edit
// pages use. Deliberate (EC2 plan §6 scenario 4, task item 3): Collabo's
// `withOnInitialize` branches (collaboratedAt visibility/required +
// contracted options swap on first paint, update-mode gated) only run
// inside this pipe — the sync path never calls onFetchData/onInitialize at
// all, so those effects would silently never fire.
export default function CollaboEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const entityFormDecl = useMemo(() => CollaboEntityForm(), []);
  const { store, entityForm, loading } = useEntityFormInitializer({
    entityForm: entityFormDecl,
    adapter: rcmAdapter,
    id,
  });

  async function handleSave(data: Record<string, unknown>): Promise<void> {
    await rcmAdapter.update(collaboFetchUrl, id, data);
    router.push('/collabo');
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
