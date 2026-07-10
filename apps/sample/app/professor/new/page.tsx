'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createFormStore } from '@listgrid/state';
import { ViewEntityForm } from '@listgrid/react';
import { ProfessorEntityForm, professorFetchUrl } from '../../../lib/entities/professor';
import { rcmAdapter } from '../../../lib/adapter';

export default function ProfessorNewPage() {
  const router = useRouter();
  const entityForm = useMemo(() => ProfessorEntityForm(), []);
  const store = useMemo(() => createFormStore(entityForm), [entityForm]);

  async function handleSave(data: Record<string, unknown>): Promise<void> {
    await rcmAdapter.create(professorFetchUrl, data);
    router.push('/professor');
  }

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      <ViewEntityForm entityForm={entityForm} store={store} onSave={handleSave} />
    </main>
  );
}
