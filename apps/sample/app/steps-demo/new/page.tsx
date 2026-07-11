'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useEntityForm, ViewEntityForm } from '@listgrid/react';
import { StepsDemoEntityForm } from '../../../lib/entities/steps-demo';
import { rcmAdapter } from '../../../lib/adapter';

// W4-2 E2E fixture page — see lib/entities/steps-demo.ts header. useEntityForm
// (W2-7) supplies the FormRuntime `controller` so the built-in Save button
// (rendered on the wizard's LAST step, spec §3.2) calls controller.save()
// for a real POST /api/steps-demo round trip; `onSave` navigates to a plain
// confirmation page on success (college.tsx precedent: redirect is the E2E's
// save-succeeded proof).
export default function StepsDemoNewPage() {
  const router = useRouter();
  const entityFormDecl = useMemo(() => StepsDemoEntityForm(), []);
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
      <ViewEntityForm
        entityForm={entityForm}
        store={store}
        controller={controller}
        onSave={() => router.push('/steps-demo/done')}
      />
    </main>
  );
}
