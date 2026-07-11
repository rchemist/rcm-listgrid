'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useEntityForm, ViewEntityForm } from '@listgrid/react';
import { CollegeEntityForm } from '../../../lib/entities/college';
import { rcmAdapter } from '../../../lib/adapter';

// Create a new College — useEntityForm (W2-7, spec §7) bundles the
// createFormStore init pipe + FormRuntime controller; ViewEntityForm still
// validates then calls onSave (button rewire to controller.save directly is
// W3-3) — handleSave here just forwards to controller.save(), proving the
// controller end-to-end.
export default function CollegeNewPage() {
  const router = useRouter();
  const entityFormDecl = useMemo(() => CollegeEntityForm(), []);
  const { store, entityForm, controller, loading } = useEntityForm({
    entityForm: entityFormDecl,
    adapter: rcmAdapter,
  });

  async function handleSave(): Promise<void> {
    const outcome = await controller?.save();
    if (outcome?.ok) router.push('/college');
  }

  if (loading || !store || !entityForm) {
    return (
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
        <p>불러오는 중…</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      <ViewEntityForm entityForm={entityForm} store={store} onSave={handleSave} />
    </main>
  );
}
