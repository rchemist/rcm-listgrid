export type ProofKind = 'constructor' | 'property' | 'setting' | 'query';

export interface EntityFormProofBranch {
  id: `EFS-${string}`;
  status: 'planned' | 'implemented';
  sampleCase: string;
  sampleAnchor: string;
  e2eFile: `e2e/${string}.spec.ts`;
  testTitle: string;
  assertion: string;
}

export interface EntityFormProofEntry {
  member: string;
  kind: ProofKind;
  branches: readonly EntityFormProofBranch[];
}

export interface EntityFormIntegrationProof extends Omit<EntityFormProofBranch, 'id'> {
  id: `P-${string}`;
  members: readonly string[];
}

export interface EntityFormProofManifest {
  members: readonly EntityFormProofEntry[];
  integrations: readonly EntityFormIntegrationProof[];
}

const plannedIntegration = (id: `P-${string}`): EntityFormIntegrationProof => ({
  id,
  members: [],
  status: 'planned',
  sampleCase: 'baseline',
  sampleAnchor: 'apps/sample/lib/entities/entityform-proof.ts#EntityFormProofCase',
  e2eFile: 'e2e/entityform-proof-identity.spec.ts',
  testTitle: `[${id}] planned`,
  assertion: '후속 EFSP owner task에서 DOM/request/response 관찰로 교체',
});

// Deliberately static. The AST gate reads these literals independently of
// EntityForm so an added/removed public member cannot update both sides.
export const entityFormProofManifest = {
  members: [
    { member: 'name', kind: 'property', branches: [] },
    { member: 'url', kind: 'property', branches: [] },
    { member: 'constructor', kind: 'constructor', branches: [] },
    { member: 'withTitle', kind: 'setting', branches: [] },
    { member: 'withCapabilities', kind: 'setting', branches: [] },
    { member: 'withReadOnly', kind: 'setting', branches: [] },
    { member: 'addAction', kind: 'setting', branches: [] },
    { member: 'withId', kind: 'setting', branches: [] },
    { member: 'onChange', kind: 'setting', branches: [] },
    { member: 'onInit', kind: 'setting', branches: [] },
    { member: 'onBeforeSave', kind: 'setting', branches: [] },
    { member: 'onAfterSave', kind: 'setting', branches: [] },
    { member: 'onBeforeDelete', kind: 'setting', branches: [] },
    { member: 'onAfterDelete', kind: 'setting', branches: [] },
    { member: 'onBeforeListFetch', kind: 'setting', branches: [] },
    { member: 'onAfterListFetch', kind: 'setting', branches: [] },
    { member: 'addFields', kind: 'setting', branches: [] },
    { member: 'withoutField', kind: 'setting', branches: [] },
    { member: 'withoutTab', kind: 'setting', branches: [] },
    { member: 'withTab', kind: 'setting', branches: [] },
    { member: 'withGroup', kind: 'setting', branches: [] },
    { member: 'withSteps', kind: 'setting', branches: [] },
    { member: 'withMeta', kind: 'setting', branches: [] },
    { member: 'withRevision', kind: 'setting', branches: [] },
    { member: 'withDataTransfer', kind: 'setting', branches: [] },
    { member: 'getTitle', kind: 'query', branches: [] },
    { member: 'getId', kind: 'query', branches: [] },
    { member: 'getCapabilities', kind: 'query', branches: [] },
    { member: 'getReadOnly', kind: 'query', branches: [] },
    { member: 'getActions', kind: 'query', branches: [] },
    { member: 'getRenderType', kind: 'query', branches: [] },
    { member: 'getChangeHandlers', kind: 'query', branches: [] },
    { member: 'getInitHandlers', kind: 'query', branches: [] },
    { member: 'getBeforeSaveHandlers', kind: 'query', branches: [] },
    { member: 'getAfterSaveHandlers', kind: 'query', branches: [] },
    { member: 'getBeforeDeleteHandlers', kind: 'query', branches: [] },
    { member: 'getAfterDeleteHandlers', kind: 'query', branches: [] },
    { member: 'getBeforeListFetchHandlers', kind: 'query', branches: [] },
    { member: 'getAfterListFetchHandlers', kind: 'query', branches: [] },
    { member: 'getFields', kind: 'query', branches: [] },
    { member: 'getField', kind: 'query', branches: [] },
    { member: 'hasField', kind: 'query', branches: [] },
    { member: 'getTabs', kind: 'query', branches: [] },
    { member: 'getTab', kind: 'query', branches: [] },
    { member: 'hasTab', kind: 'query', branches: [] },
    { member: 'getFieldGroups', kind: 'query', branches: [] },
    { member: 'getGroupFields', kind: 'query', branches: [] },
    { member: 'getTabFields', kind: 'query', branches: [] },
    { member: 'getSteps', kind: 'query', branches: [] },
    { member: 'getMeta', kind: 'query', branches: [] },
    { member: 'getRevisionEntityName', kind: 'query', branches: [] },
    { member: 'getDataTransfer', kind: 'query', branches: [] },
    { member: 'clone', kind: 'query', branches: [] },
  ],
  integrations: [
    plannedIntegration('P-01'),
    plannedIntegration('P-02'),
    plannedIntegration('P-03'),
    plannedIntegration('P-04'),
    plannedIntegration('P-05'),
    plannedIntegration('P-06'),
    plannedIntegration('P-07'),
    plannedIntegration('P-08'),
    plannedIntegration('P-09'),
    plannedIntegration('P-10'),
    plannedIntegration('P-11'),
    plannedIntegration('P-12'),
    {
      id: 'P-13',
      members: [],
      status: 'implemented',
      sampleCase: 'baseline',
      sampleAnchor: 'apps/sample/lib/entities/entityform-proof.ts#EntityFormProofCase',
      e2eFile: 'e2e/entityform-proof-identity.spec.ts',
      testTitle: '[P-13] baseline CRUD uses generic routes and isolated SQLite',
      assertion:
        'Chromium create/update와 HTTP read/delete가 동일 SQLite DB의 세 차례 Next 기동 사이에 유지됨',
    },
    plannedIntegration('P-14'),
  ],
} as const satisfies EntityFormProofManifest;
