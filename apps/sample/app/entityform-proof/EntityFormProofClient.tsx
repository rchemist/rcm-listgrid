'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from 'zustand';
import type { StoreApi } from 'zustand/vanilla';
import { useEntityForm, ViewEntityForm } from '@listgrid/react';
import type { FormStoreState } from '@listgrid/state';
import type { EntityForm } from '@listgrid/schema-core';
import {
  EntityFormIdentityDiagnostics,
  EntityFormProofCase,
} from '../../lib/entities/entityform-proof';
import { rcmAdapter } from '../../lib/adapter';

function ProofDiagnostics({
  caseId,
  entityForm,
  store,
  lifecycleVersion,
}: {
  caseId: string;
  entityForm: EntityForm;
  store: StoreApi<FormStoreState>;
  lifecycleVersion: number;
}) {
  useStore(store, (state) => state.saving);
  useStore(store, (state) => state.structureVersion);
  useStore(store, (state) => state.messages.length);
  useStore(store, (state) => state.globalErrors.length);

  const diagnostics = {
    caseId,
    lifecycleVersion,
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

  return <pre data-proof-diagnostics>{JSON.stringify(diagnostics)}</pre>;
}

export function EntityFormProofClient({ caseId, id }: { caseId: string; id?: string }) {
  const router = useRouter();
  const [lifecycleVersion, setLifecycleVersion] = useState(0);
  const staysForLifecycleProof =
    caseId.startsWith('on-') ||
    caseId.startsWith('with-revision--') ||
    caseId.startsWith('validation--');
  const entityFormDecl = useMemo(() => {
    const form = EntityFormProofCase(caseId).clone().withId(id);
    return staysForLifecycleProof
      ? form.onAfterDelete(() => setLifecycleVersion((value) => value + 1))
      : form.onAfterDelete(() => router.push('/entityform-proof/list'));
  }, [caseId, id, router, staysForLifecycleProof]);
  const { store, entityForm, controller, loading, error } = useEntityForm({
    entityForm: entityFormDecl,
    adapter: rcmAdapter,
    ...(id !== undefined ? { id } : {}),
  });

  if (loading || !store || !entityForm) return <p>불러오는 중…</p>;
  if (error) return <p role="alert">{error.message}</p>;

  return (
    <main
      data-proof-case={caseId}
      style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem' }}
    >
      <p>
        <a href="/entityform-proof">← proof hub</a>
      </p>
      <ProofDiagnostics
        caseId={caseId}
        entityForm={entityForm}
        store={store}
        lifecycleVersion={lifecycleVersion}
      />
      <ViewEntityForm
        entityForm={entityForm}
        store={store}
        controller={controller}
        onSave={() => {
          if (staysForLifecycleProof) setLifecycleVersion((value) => value + 1);
          else router.push('/entityform-proof/list');
        }}
      />
    </main>
  );
}
