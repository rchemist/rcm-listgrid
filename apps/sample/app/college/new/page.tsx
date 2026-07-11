'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useEntityForm, ViewEntityForm } from '@listgrid/react';
import { CollegeEntityForm } from '../../../lib/entities/college';
import { rcmAdapter } from '../../../lib/adapter';

// Create a new College — useEntityForm (W2-7, spec §7) bundles the
// createFormStore init pipe + FormRuntime controller; the built-in Save
// button now calls controller.save() directly (W3-3 button rewire — resolves
// the old double-validate) and `onSave` is a post-save success callback only
// (navigate back to the list).
export default function CollegeNewPage() {
  const router = useRouter();
  const entityFormDecl = useMemo(() => CollegeEntityForm(), []);
  const { store, entityForm, controller, loading } = useEntityForm({
    entityForm: entityFormDecl,
    adapter: rcmAdapter,
  });

  if (loading || !store || !entityForm) {
    return (
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
        <p>불러오는 중…</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      <ViewEntityForm
        entityForm={entityForm}
        store={store}
        controller={controller}
        onSave={() => router.push('/college')}
      />
    </main>
  );
}
