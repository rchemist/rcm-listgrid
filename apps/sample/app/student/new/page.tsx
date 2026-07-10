'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createFormStore } from '@listgrid/state';
import { ViewEntityForm } from '@listgrid/react';
import { StudentEntityForm, studentFetchUrl } from '../../../lib/entities/student';
import { rcmAdapter } from '../../../lib/adapter';

// Create a new Student — ViewEntityForm validates then POSTs via the adapter.
export default function StudentNewPage() {
  const router = useRouter();
  const entityForm = useMemo(() => StudentEntityForm(), []);
  const store = useMemo(() => createFormStore(entityForm), [entityForm]);

  async function handleSave(data: Record<string, unknown>): Promise<void> {
    await rcmAdapter.create(studentFetchUrl, data);
    router.push('/student');
  }

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      <ViewEntityForm entityForm={entityForm} store={store} onSave={handleSave} />
    </main>
  );
}
