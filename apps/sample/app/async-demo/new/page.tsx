'use client';

import { useMemo } from 'react';
import { useEntityForm, ViewEntityForm } from '@listgrid/react';
import { AsyncDemoEntityForm } from '../../../lib/entities/async-demo';
import { rcmAdapter } from '../../../lib/adapter';

// W4-3 E2E fixture page — see lib/entities/async-demo.ts header. useEntityForm
// (W2-7) supplies the FormRuntime `controller`, but the E2E never
// clicks Save/triggers a save — it only exercises the AsyncValidation button
// affordance — so `rcmAdapter`'s create/update routes are never hit even
// though no `/api/async-demo/*` route exists (action-demo.ts precedent).
export default function AsyncDemoNewPage() {
  const entityFormDecl = useMemo(() => AsyncDemoEntityForm(), []);
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
      <ViewEntityForm entityForm={entityForm} store={store} controller={controller} />
    </main>
  );
}
