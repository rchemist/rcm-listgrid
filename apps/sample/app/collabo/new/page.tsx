'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createFormStore } from '@listgrid/state';
import { ViewEntityForm } from '@listgrid/react';
import { CollaboEntityForm, collaboFetchUrl } from '../../../lib/entities/collabo';
import { rcmAdapter } from '../../../lib/adapter';

// Create a new Collabo — ViewEntityForm validates then POSTs via the
// adapter. The §5 submit-transform (contracted string→boolean) is applied by
// toSaveData via CollaboEntityForm's .withSubmitTransform(...) (EF6) — no
// page-level workaround needed anymore.
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
