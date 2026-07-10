'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createFormStore } from '@listgrid/state';
import { ViewEntityForm } from '@listgrid/react';
import { CollegeEntityForm, collegeFetchUrl } from '../../../lib/entities/college';
import { rcmAdapter } from '../../../lib/adapter';

// Create a new College — ViewEntityForm validates then POSTs via the adapter.
export default function CollegeNewPage() {
  const router = useRouter();
  const entityForm = useMemo(() => CollegeEntityForm(), []);
  const store = useMemo(() => createFormStore(entityForm), [entityForm]);

  async function handleSave(data: Record<string, unknown>): Promise<void> {
    await rcmAdapter.create(collegeFetchUrl, data);
    router.push('/college');
  }

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      <ViewEntityForm entityForm={entityForm} store={store} onSave={handleSave} />
    </main>
  );
}
