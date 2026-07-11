'use client';

import { useMemo } from 'react';
import { useEntityForm, ViewEntityForm } from '@listgrid/react';
import { ActionDemoEntityForm } from '../../../lib/entities/action-demo';
import { rcmAdapter } from '../../../lib/adapter';

// W3-3 E2E fixture page — see lib/entities/action-demo.ts header. useEntityForm
// (W2-7) supplies the FormRuntime `controller` so the declared `addAction`
// custom button gets a real ActionContext (spec §3.4) — the E2E never clicks
// Save/triggers a save, so `rcmAdapter`'s create/update routes are never hit
// even though no `/api/action-demo/*` route exists (college.ts precedent for
// adapter reuse; perm-demo.ts precedent for a dedicated isolated fixture).
export default function ActionDemoNewPage() {
  const entityFormDecl = useMemo(() => ActionDemoEntityForm(), []);
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
