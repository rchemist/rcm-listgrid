'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createFormStore } from '@listgrid/state';
import { ViewEntityForm } from '@listgrid/react';
import { CollaboEntityForm, collaboFetchUrl } from '../../../lib/entities/collabo';
import { rcmAdapter } from '../../../lib/adapter';

// Create a new Collabo — ViewEntityForm validates then POSTs via the
// adapter. CollaboEntityForm's §5 .onBeforeSave(...) hook (spec §4.1/§6.2;
// W2-5 — successor to EF6 withSubmitTransform) is dispatched by
// createFormController.save, not by ViewEntityForm's current toSaveData()-
// direct Save button (controller rewiring is W3/W7) — inert for this page's
// E2E today (see the collabo.ts NOTE at the hook's declaration), no
// page-level workaround needed either way.
export default function CollaboNewPage() {
  const router = useRouter();
  const entityForm = useMemo(() => CollaboEntityForm(), []);
  const store = useMemo(() => createFormStore(entityForm), [entityForm]);

  async function handleSave(data: Record<string, unknown>): Promise<void> {
    await rcmAdapter.create(collaboFetchUrl, data);
    router.push('/collabo');
  }

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      <ViewEntityForm entityForm={entityForm} store={store} onSave={handleSave} />
    </main>
  );
}
