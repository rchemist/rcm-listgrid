'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useEntityForm, ViewEntityForm } from '@listgrid/react';
import {
  EntityFormIdentityDiagnostics,
  EntityFormProofCase,
} from '../../lib/entities/entityform-proof';
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
    name: entityForm.name,
    url: entityForm.url,
    renderType: entityForm.getRenderType(),
    title: entityForm.getTitle(),
    id: entityForm.getId(),
    capabilities: entityForm.getCapabilities(),
    readOnly: entityForm.getReadOnly(),
    actions: entityForm.getActions().map((action) => action.id),
    fields: entityForm.getFields().map((field) => field.getName()),
    tabs: entityForm.getTabs().map((tab) => tab.id),
    groups: entityForm.getFieldGroups().map((group) => group.id),
    steps: entityForm.getSteps().map((step) => step.id),
    meta: entityForm.getMeta(),
    hooks: {
      init: entityForm.getInitHandlers().length,
      change: entityForm.getChangeHandlers().length,
      beforeSave: entityForm.getBeforeSaveHandlers().length,
      afterSave: entityForm.getAfterSaveHandlers().length,
      beforeDelete: entityForm.getBeforeDeleteHandlers().length,
      afterDelete: entityForm.getAfterDeleteHandlers().length,
      beforeListFetch: entityForm.getBeforeListFetchHandlers().length,
      afterListFetch: entityForm.getAfterListFetchHandlers().length,
    },
    transfer: entityForm.getDataTransfer(),
    queries: {
      field: entityForm.getField('name')?.getName(),
      hasField: [entityForm.hasField('name'), entityForm.hasField('missing')],
      tab: entityForm.getTab('default')?.id,
      hasTab: [entityForm.hasTab('default'), entityForm.hasTab('missing')],
      groupFields: entityForm.getGroupFields('default', 'default').map((field) => field.getName()),
      tabFields: entityForm.getTabFields('default').map((field) => field.getName()),
      revision: entityForm.getRevisionEntityName(),
      cloneClass: entityForm.clone() instanceof entityForm.constructor,
    },
    dirty: store.getState().isDirty(),
    clone: EntityFormIdentityDiagnostics(),
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
