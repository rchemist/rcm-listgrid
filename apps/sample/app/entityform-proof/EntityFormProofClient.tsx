'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useEntityForm, ViewEntityForm } from '@listgrid/react';
import { EntityFormProofCase } from '../../lib/entities/entityform-proof';
import { rcmAdapter } from '../../lib/adapter';

export function EntityFormProofClient({ caseId, id }: { caseId: string; id?: string }) {
  const router = useRouter();
  const entityFormDecl = useMemo(
    () =>
      EntityFormProofCase(caseId)
        .clone()
        .withId(id)
        .onAfterDelete(() => router.push('/entityform-proof/list')),
    [caseId, id, router],
  );
  const { store, entityForm, controller, loading, error } = useEntityForm({
    entityForm: entityFormDecl,
    adapter: rcmAdapter,
    ...(id !== undefined ? { id } : {}),
  });

  if (loading || !store || !entityForm) return <p>불러오는 중…</p>;
  if (error) return <p role="alert">{error.message}</p>;

  const diagnostics = {
    caseId,
    member: 'baseline',
    renderType: entityForm.getRenderType(),
    title: entityForm.getTitle(),
    id: entityForm.getId(),
    fields: entityForm.getFields().map((field) => field.getName()),
    tabs: entityForm.getTabs().map((tab) => tab.id),
    groups: entityForm.getFieldGroups().map((group) => group.id),
    steps: entityForm.getSteps().map((step) => step.id),
    meta: entityForm.getMeta(),
    hooks: {
      init: entityForm.getInitHandlers().length,
      change: entityForm.getChangeHandlers().length,
    },
    transfer: entityForm.getDataTransfer(),
  };

  return (
    <main
      data-proof-case={caseId}
      style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem' }}
    >
      <p>
        <a href="/entityform-proof">← proof hub</a>
      </p>
      <pre data-proof-diagnostics>{JSON.stringify(diagnostics)}</pre>
      <ViewEntityForm
        entityForm={entityForm}
        store={store}
        controller={controller}
        onSave={() => router.push('/entityform-proof/list')}
      />
    </main>
  );
}
