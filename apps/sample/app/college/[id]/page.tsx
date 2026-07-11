'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEntityForm, ViewEntityForm } from '@listgrid/react';
import { CollegeEntityForm } from '../../../lib/entities/college';
import { rcmAdapter } from '../../../lib/adapter';

// Edit an existing College — useEntityForm (W2-7, spec §7) runs the fetch ->
// BIND -> onInit -> REBIND -> build pipe (id set => update-mode renderType,
// spec §3.1) and bundles the FormRuntime controller; the built-in Save
// button now calls controller.save() directly (W3-3 button rewire — resolves
// the old double-validate) and `onSave` is a post-save success callback only
// (navigate back to the list).
export default function CollegeEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  // W3-4 — post-delete nav via onAfterDelete (spec §4.1; existing surface,
  // not a new onDelete prop): fires only after controller.delete() succeeds
  // (form-controller.ts del()), so a failed delete leaves the form mounted.
  const entityFormDecl = useMemo(
    () => CollegeEntityForm().onAfterDelete(() => router.push('/college')),
    [router],
  );
  const { store, entityForm, controller, loading } = useEntityForm({
    entityForm: entityFormDecl,
    adapter: rcmAdapter,
    id,
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
