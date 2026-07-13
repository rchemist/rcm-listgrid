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

const identityTestFile = 'e2e/entityform-proof-identity.spec.ts' as const;
const identityAnchor = 'apps/sample/lib/entities/entityform-proof.ts#EntityFormProofCase';
const diagnosticsAnchor =
  'apps/sample/lib/entities/entityform-proof.ts#EntityFormIdentityDiagnostics';

const proof = (
  id: `EFS-${string}`,
  sampleCase: string,
  testTitle: string,
  assertion: string,
): EntityFormProofBranch => ({
  id,
  status: 'implemented',
  sampleCase,
  sampleAnchor: identityAnchor,
  e2eFile: identityTestFile,
  testTitle,
  assertion,
});

const diagnosticProof = (
  id: `EFS-${string}`,
  sampleCase: string,
  testTitle: string,
  assertion: string,
): EntityFormProofBranch => ({
  id,
  status: 'implemented',
  sampleCase,
  sampleAnchor: diagnosticsAnchor,
  e2eFile: identityTestFile,
  testTitle,
  assertion,
});

const titleTest =
  '[EFS-01] withTitle resolves every fallback and replace branch in the rendered h2';
const readOnlyTest = '[EFS-03][P-02] readOnly hides Save slots but keeps Delete and normal actions';
const idTest = '[EFS-05][P-01] id controls create/update transport and capability selection';
const cloneTest =
  '[EFS-20][EFS-23][P-12] meta and clone isolation match the declared reference contract';
const queryTest =
  '[EFS-24] constructor and every query surface are anchored to a rendered wizard form';

// Deliberately static. The AST gate reads these literals independently of
// EntityForm so an added/removed public member cannot update both sides.
export const entityFormProofManifest = {
  members: [
    {
      member: 'name',
      kind: 'property',
      branches: [proof('EFS-24a', 'query-wizard', queryTest, 'diagnostics name')],
    },
    {
      member: 'url',
      kind: 'property',
      branches: [proof('EFS-24b', 'query-wizard', queryTest, 'diagnostics url')],
    },
    {
      member: 'constructor',
      kind: 'constructor',
      branches: [
        proof('EFS-24ae', 'query-wizard', queryTest, 'constructor name/url normalization'),
      ],
    },
    {
      member: 'withTitle',
      kind: 'setting',
      branches: [
        proof('EFS-01a', 'title-string', titleTest, 'string title h2'),
        proof('EFS-01b', 'title-text', titleTest, 'object text h2'),
        proof('EFS-01c', 'title-from-field', titleTest, 'fromField h2'),
        proof('EFS-01d', 'title-name', titleTest, 'name field fallback h2'),
        proof('EFS-01e', 'title-id', titleTest, 'id fallback h2'),
        proof('EFS-01f', 'title-entity', titleTest, 'entity name fallback h2'),
        proof('EFS-01g', 'title-replace', titleTest, 'second withTitle replaces h2'),
      ],
    },
    { member: 'withCapabilities', kind: 'setting', branches: [] },
    {
      member: 'withReadOnly',
      kind: 'setting',
      branches: [
        proof('EFS-03a', 'readonly-all', readOnlyTest, 'no-arg makes inputs readonly'),
        proof('EFS-03b', 'readonly-undefined', readOnlyTest, 'explicit undefined is true'),
        proof('EFS-03c', 'readonly-clear', readOnlyTest, 'false clears readonly'),
        proof('EFS-03d', 'readonly-all', readOnlyTest, 'Save slots hidden; Delete/action remain'),
      ],
    },
    { member: 'addAction', kind: 'setting', branches: [] },
    {
      member: 'withId',
      kind: 'setting',
      branches: [
        proof('EFS-05a', 'baseline', idTest, 'undefined id sends POST'),
        proof('EFS-05b', 'baseline', idTest, 'string id sends PUT'),
        proof('EFS-05c', 'id-clear', idTest, 'string then undefined returns to POST'),
      ],
    },
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
    {
      member: 'withMeta',
      kind: 'setting',
      branches: [
        proof('EFS-20a', 'meta', cloneTest, 'shallow merge retains alpha/beta'),
        proof('EFS-20b', 'meta', cloneTest, 'last write replaces key'),
        proof('EFS-20c', 'meta', cloneTest, 'undefined removes key'),
        proof('EFS-20d', 'meta', cloneTest, 'clone top-level meta isolation'),
      ],
    },
    { member: 'withRevision', kind: 'setting', branches: [] },
    { member: 'withDataTransfer', kind: 'setting', branches: [] },
    {
      member: 'getTitle',
      kind: 'query',
      branches: [proof('EFS-24c', 'query-wizard', queryTest, 'rendered h2 and diagnostics')],
    },
    {
      member: 'getId',
      kind: 'query',
      branches: [proof('EFS-24d', 'query-wizard', queryTest, 'diagnostics id')],
    },
    {
      member: 'getCapabilities',
      kind: 'query',
      branches: [proof('EFS-24e', 'query-wizard', queryTest, 'diagnostics capabilities')],
    },
    {
      member: 'getReadOnly',
      kind: 'query',
      branches: [proof('EFS-24f', 'query-wizard', queryTest, 'diagnostics readOnly')],
    },
    {
      member: 'getActions',
      kind: 'query',
      branches: [proof('EFS-24g', 'query-wizard', queryTest, 'diagnostics actions')],
    },
    {
      member: 'getRenderType',
      kind: 'query',
      branches: [proof('EFS-24h', 'query-wizard', queryTest, 'diagnostics renderType')],
    },
    {
      member: 'getChangeHandlers',
      kind: 'query',
      branches: [proof('EFS-24i', 'query-wizard', queryTest, 'diagnostics change hooks')],
    },
    {
      member: 'getInitHandlers',
      kind: 'query',
      branches: [proof('EFS-24j', 'query-wizard', queryTest, 'diagnostics init hooks')],
    },
    {
      member: 'getBeforeSaveHandlers',
      kind: 'query',
      branches: [proof('EFS-24k', 'query-wizard', queryTest, 'diagnostics before-save hooks')],
    },
    {
      member: 'getAfterSaveHandlers',
      kind: 'query',
      branches: [proof('EFS-24l', 'query-wizard', queryTest, 'diagnostics after-save hooks')],
    },
    {
      member: 'getBeforeDeleteHandlers',
      kind: 'query',
      branches: [proof('EFS-24m', 'query-wizard', queryTest, 'diagnostics before-delete hooks')],
    },
    {
      member: 'getAfterDeleteHandlers',
      kind: 'query',
      branches: [proof('EFS-24n', 'query-wizard', queryTest, 'diagnostics after-delete hooks')],
    },
    {
      member: 'getBeforeListFetchHandlers',
      kind: 'query',
      branches: [proof('EFS-24o', 'query-wizard', queryTest, 'diagnostics before-list hooks')],
    },
    {
      member: 'getAfterListFetchHandlers',
      kind: 'query',
      branches: [proof('EFS-24p', 'query-wizard', queryTest, 'diagnostics after-list hooks')],
    },
    {
      member: 'getFields',
      kind: 'query',
      branches: [proof('EFS-24q', 'query-wizard', queryTest, 'ordered field diagnostics and DOM')],
    },
    {
      member: 'getField',
      kind: 'query',
      branches: [proof('EFS-24r', 'query-wizard', queryTest, 'found field diagnostics')],
    },
    {
      member: 'hasField',
      kind: 'query',
      branches: [proof('EFS-24s', 'query-wizard', queryTest, 'found/missing field diagnostics')],
    },
    {
      member: 'getTabs',
      kind: 'query',
      branches: [proof('EFS-24t', 'query-wizard', queryTest, 'tab diagnostics')],
    },
    {
      member: 'getTab',
      kind: 'query',
      branches: [proof('EFS-24u', 'query-wizard', queryTest, 'found tab diagnostics')],
    },
    {
      member: 'hasTab',
      kind: 'query',
      branches: [proof('EFS-24v', 'query-wizard', queryTest, 'found/missing tab diagnostics')],
    },
    {
      member: 'getFieldGroups',
      kind: 'query',
      branches: [proof('EFS-24w', 'query-wizard', queryTest, 'group diagnostics')],
    },
    {
      member: 'getGroupFields',
      kind: 'query',
      branches: [proof('EFS-24x', 'query-wizard', queryTest, 'group field diagnostics')],
    },
    {
      member: 'getTabFields',
      kind: 'query',
      branches: [proof('EFS-24y', 'query-wizard', queryTest, 'tab field order diagnostics')],
    },
    {
      member: 'getSteps',
      kind: 'query',
      branches: [
        proof('EFS-24z', 'query-wizard', queryTest, 'wizard declaration and rendered fields'),
      ],
    },
    {
      member: 'getMeta',
      kind: 'query',
      branches: [proof('EFS-24aa', 'query-wizard', queryTest, 'meta diagnostics')],
    },
    {
      member: 'getRevisionEntityName',
      kind: 'query',
      branches: [proof('EFS-24ab', 'query-wizard', queryTest, 'revision diagnostics')],
    },
    {
      member: 'getDataTransfer',
      kind: 'query',
      branches: [proof('EFS-24ac', 'query-wizard', queryTest, 'transfer diagnostics')],
    },
    {
      member: 'clone',
      kind: 'query',
      branches: [
        diagnosticProof('EFS-23a', 'meta', cloneTest, 'clone(false) excludes values'),
        diagnosticProof('EFS-23b', 'meta', cloneTest, 'clone(true) carries values'),
        diagnosticProof('EFS-23c', 'meta', cloneTest, 'hook/step/action structures isolate'),
        diagnosticProof(
          'EFS-23d',
          'meta',
          cloneTest,
          'top meta isolates and nested reference shares',
        ),
        diagnosticProof('EFS-23e', 'meta', cloneTest, 'subclass this is preserved'),
        proof('EFS-24ad', 'query-wizard', queryTest, 'clone query keeps runtime class'),
      ],
    },
  ],
  integrations: [
    {
      id: 'P-01',
      members: ['withId', 'withCapabilities'],
      status: 'implemented',
      sampleCase: 'capability-id',
      sampleAnchor: identityAnchor,
      e2eFile: identityTestFile,
      testTitle: idTest,
      assertion: 'id create/update 모드에 따라 capability와 POST/PUT가 일치',
    },
    {
      id: 'P-02',
      members: ['withReadOnly', 'addAction'],
      status: 'implemented',
      sampleCase: 'readonly-all',
      sampleAnchor: identityAnchor,
      e2eFile: identityTestFile,
      testTitle: readOnlyTest,
      assertion: 'readOnly가 builtin/custom Save 슬롯만 숨기고 Delete/일반 action 유지',
    },
    {
      id: 'P-03',
      members: ['onInit', 'clone', 'withId'],
      status: 'implemented',
      sampleCase: 'init-fetched',
      sampleAnchor: identityAnchor,
      e2eFile: identityTestFile,
      testTitle: '[P-03] fetched data plus clone with id runs onInit and marks the override dirty',
      assertion: 'fetched row가 clone().withId() 뒤 onInit override와 dirty DOM으로 관찰',
    },
    plannedIntegration('P-04'),
    plannedIntegration('P-05'),
    plannedIntegration('P-06'),
    plannedIntegration('P-07'),
    plannedIntegration('P-08'),
    plannedIntegration('P-09'),
    plannedIntegration('P-10'),
    plannedIntegration('P-11'),
    {
      id: 'P-12',
      members: ['clone'],
      status: 'implemented',
      sampleCase: 'meta',
      sampleAnchor: diagnosticsAnchor,
      e2eFile: identityTestFile,
      testTitle: cloneTest,
      assertion: 'hooks/meta/steps/actions/values의 계약별 공유·격리를 diagnostics로 대조',
    },
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
