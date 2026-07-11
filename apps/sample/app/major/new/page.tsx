'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useEntityFormInitializer, ViewEntityForm } from '@listgrid/react';
import { MajorEntityForm, majorFetchUrl } from '../../../lib/entities/major';
import { rcmAdapter } from '../../../lib/adapter';

// Create a new Major — via the EF3 useEntityFormInitializer pipe (NOT the
// sync createFormStore + no-op pattern collabo/college/new use). Deliberate:
// MajorEntityForm's `withOnInitialize` runs UNCONDITIONALLY (re-verified
// against source — MajorEntityForm.tsx:248-266 has no update-mode gate,
// unlike Collabo's), so a freshly-created record (default type 'MAJOR')
// needs the pipe to run even with no `id` — plain createFormStore never
// calls onInitialize at all (initializeFormStore's step e runs "always,
// create mode too" — @listgrid/state doc). Without this, college would
// incorrectly show required+visible (its static declaration) instead of the
// type='MAJOR'-derived hidden+not-required state.
export default function MajorNewPage() {
  const router = useRouter();
  const entityFormDecl = useMemo(() => MajorEntityForm(), []);
  const { store, entityForm, loading } = useEntityFormInitializer({
    entityForm: entityFormDecl,
    adapter: rcmAdapter,
  });

  async function handleSave(data: Record<string, unknown>): Promise<void> {
    await rcmAdapter.create(majorFetchUrl, data);
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
