'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEntityForm, ViewEntityForm } from '@listgrid/react';
import { CollegeEntityForm } from '../../../lib/entities/college';
import { rcmAdapter } from '../../../lib/adapter';

// Edit an existing College — useEntityForm (W2-7, spec §7) runs the fetch ->
// BIND -> onInit -> REBIND -> build pipe (id set => update-mode renderType,
// spec §3.1) and bundles the FormRuntime controller; ViewEntityForm still
// validates then calls onSave (button rewire to controller.save directly is
// W3-3) — handleSave here just forwards to controller.save().
export default function CollegeEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const entityFormDecl = useMemo(() => CollegeEntityForm(), []);
  const { store, entityForm, controller, loading } = useEntityForm({
    entityForm: entityFormDecl,
    adapter: rcmAdapter,
    id,
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
