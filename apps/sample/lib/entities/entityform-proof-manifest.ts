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

const identityTestFile = 'e2e/entityform-proof-identity.spec.ts' as const;
const structureTestFile = 'e2e/entityform-proof-structure.spec.ts' as const;
const lifecycleTestFile = 'e2e/entityform-proof-lifecycle.spec.ts' as const;
const actionsListTestFile = 'e2e/entityform-proof-actions-list.spec.ts' as const;
const transferTestFile = 'e2e/entityform-proof-transfer.spec.ts' as const;
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

const structureProof = (
  id: `EFS-${string}`,
  memberKebab: string,
  testTitle: string,
  assertion: string,
): EntityFormProofBranch => ({
  id,
  status: 'implemented',
  sampleCase: `${memberKebab}--${id.toLowerCase()}`,
  sampleAnchor: identityAnchor,
  e2eFile: structureTestFile,
  testTitle,
  assertion,
});

const lifecycleProof = (
  id: `EFS-${string}`,
  memberKebab: string,
  testTitle: string,
  assertion: string,
): EntityFormProofBranch => ({
  id,
  status: 'implemented',
  sampleCase: `${memberKebab}--${id.toLowerCase()}`,
  sampleAnchor: identityAnchor,
  e2eFile: lifecycleTestFile,
  testTitle,
  assertion,
});

const actionsListProof = (
  id: `EFS-${string}`,
  memberKebab: string,
  testTitle: string,
  assertion: string,
): EntityFormProofBranch => ({
  id,
  status: 'implemented',
  sampleCase: `${memberKebab}--${id.toLowerCase()}`,
  sampleAnchor: identityAnchor,
  e2eFile: actionsListTestFile,
  testTitle,
  assertion,
});

const transferProof = (
  id: `EFS-${string}`,
  memberKebab: string,
  testTitle: string,
  assertion: string,
): EntityFormProofBranch => ({
  id,
  status: 'implemented',
  sampleCase: `${memberKebab}--${id.toLowerCase()}`,
  sampleAnchor: identityAnchor,
  e2eFile: transferTestFile,
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
    {
      member: 'withCapabilities',
      kind: 'setting',
      branches: [
        actionsListProof(
          'EFS-02a',
          'with-capabilities',
          '[EFS-02a] withCapabilities — create true renders Save',
          'create Save button visible',
        ),
        actionsListProof(
          'EFS-02b',
          'with-capabilities',
          '[EFS-02b] withCapabilities — create false removes Save',
          'create Save button absent',
        ),
        actionsListProof(
          'EFS-02c',
          'with-capabilities',
          '[EFS-02c] withCapabilities — update true renders Save',
          'update Save button visible',
        ),
        actionsListProof(
          'EFS-02d',
          'with-capabilities',
          '[EFS-02d] withCapabilities — update false removes Save',
          'update Save button absent',
        ),
        actionsListProof(
          'EFS-02e',
          'with-capabilities',
          '[EFS-02e] withCapabilities — delete true renders Delete',
          'update Delete button visible',
        ),
        actionsListProof(
          'EFS-02f',
          'with-capabilities',
          '[EFS-02f] withCapabilities — delete false removes Delete',
          'update Delete button absent',
        ),
        actionsListProof(
          'EFS-02g',
          'with-capabilities',
          '[EFS-02g] withCapabilities — async predicate receives create context and ADMIN session',
          'async capability permits real POST for ADMIN create context',
        ),
        actionsListProof(
          'EFS-02h',
          'with-capabilities',
          '[EFS-02h] withCapabilities — async pending defaults true then resolves false',
          'Save visible while pending then absent after resolution',
        ),
        actionsListProof(
          'EFS-02i',
          'with-capabilities',
          '[EFS-02i] withCapabilities — repeated calls shallow merge sibling keys',
          'merged create/update/delete buttons and diagnostics',
        ),
      ],
    },
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
    {
      member: 'addAction',
      kind: 'setting',
      branches: [
        actionsListProof(
          'EFS-04a',
          'add-action',
          '[EFS-04a] addAction — order controls action DOM order',
          'ordered action bar buttons',
        ),
        actionsListProof(
          'EFS-04b',
          'add-action',
          '[EFS-04b] addAction — visible gates custom actions',
          'visible and absent action buttons',
        ),
        actionsListProof(
          'EFS-04c',
          'add-action',
          '[EFS-04c] addAction — enabled controls disabled state',
          'enabled and disabled action buttons',
        ),
        actionsListProof(
          'EFS-04d',
          'add-action',
          '[EFS-04d] addAction — run receives a live mutator',
          'click mutates the rendered Note field',
        ),
        actionsListProof(
          'EFS-04e',
          'add-action',
          '[EFS-04e] addAction — render supplies the custom node',
          'custom non-button render node visible',
        ),
        actionsListProof(
          'EFS-04f',
          'add-action',
          '[EFS-04f] addAction — className reaches the action wrapper',
          'wrapper class visible in DOM',
        ),
        actionsListProof(
          'EFS-04g',
          'add-action',
          '[EFS-04g] addAction — variant reaches the host Button',
          'host button data-variant is danger',
        ),
        actionsListProof(
          'EFS-04h',
          'add-action',
          '[EFS-04h] addAction — replaces save removes the builtin and runs the custom slot',
          'custom save slot runs with builtin absent',
        ),
        actionsListProof(
          'EFS-04i',
          'add-action',
          '[EFS-04i] addAction — replaces delete removes the builtin in update mode',
          'custom delete slot visible with builtin absent',
        ),
        actionsListProof(
          'EFS-04j',
          'add-action',
          '[EFS-04j] addAction — id collision keeps the custom action and drops the builtin',
          'same-id custom action runs with builtin absent',
        ),
      ],
    },
    {
      member: 'withId',
      kind: 'setting',
      branches: [
        proof('EFS-05a', 'baseline', idTest, 'undefined id sends POST'),
        proof('EFS-05b', 'baseline', idTest, 'string id sends PUT'),
        proof('EFS-05c', 'id-clear', idTest, 'string then undefined returns to POST'),
      ],
    },
    {
      member: 'onChange',
      kind: 'setting',
      branches: [
        lifecycleProof(
          'EFS-06a',
          'on-change',
          '[EFS-06a] onChange — handlers run in registration order',
          'ordered trace',
        ),
        lifecycleProof(
          'EFS-06b',
          'on-change',
          '[EFS-06b] onChange — handler writes a derived field value',
          'derived note DOM',
        ),
        lifecycleProof(
          'EFS-06c',
          'on-change',
          '[EFS-06c] onChange — handler writes reactive field meta',
          'readonly note DOM',
        ),
        lifecycleProof(
          'EFS-06d',
          'on-change',
          '[EFS-06d] onChange — handler adds a dynamic field',
          'dynamic field DOM',
        ),
        lifecycleProof(
          'EFS-06e',
          'on-change',
          '[EFS-06e] onChange — nested writes do not duplicate the source cascade',
          'single source cascade trace',
        ),
      ],
    },
    {
      member: 'onInit',
      kind: 'setting',
      branches: [
        lifecycleProof(
          'EFS-07a',
          'on-init',
          '[EFS-07a] onInit — create runs without fetched data',
          'create empty-data trace',
        ),
        lifecycleProof(
          'EFS-07b',
          'on-init',
          '[EFS-07b] onInit — update runs with fetched data',
          'update data trace',
        ),
        lifecycleProof(
          'EFS-07c',
          'on-init',
          '[EFS-07c] onInit — values.set overrides fetched data and marks dirty',
          'override dirty DOM',
        ),
        lifecycleProof(
          'EFS-07d',
          'on-init',
          '[EFS-07d] onInit — values.setFetched establishes a clean baseline',
          'clean baseline DOM',
        ),
        lifecycleProof(
          'EFS-07e',
          'on-init',
          '[EFS-07e] onInit — setMeta reaches first paint',
          'readonly first paint',
        ),
        lifecycleProof(
          'EFS-07f',
          'on-init',
          '[EFS-07f] onInit — form structure mutation reaches first paint',
          'added field first paint',
        ),
        lifecycleProof(
          'EFS-07g',
          'on-init',
          '[EFS-07g] onInit — handlers run in registration order',
          'ordered init trace',
        ),
      ],
    },
    {
      member: 'onBeforeSave',
      kind: 'setting',
      branches: [
        lifecycleProof(
          'EFS-08a',
          'on-before-save',
          '[EFS-08a] onBeforeSave — setData threads into the request body',
          'transformed POST body',
        ),
        lifecycleProof(
          'EFS-08b',
          'on-before-save',
          '[EFS-08b] onBeforeSave — values is the validated snapshot',
          'snapshot trace',
        ),
        lifecycleProof(
          'EFS-08c',
          'on-before-save',
          '[EFS-08c] onBeforeSave — cancel with reason blocks request and shows message',
          'message and no request',
        ),
        lifecycleProof(
          'EFS-08d',
          'on-before-save',
          '[EFS-08d] onBeforeSave — cancel without reason blocks request silently',
          'silent no request',
        ),
        lifecycleProof(
          'EFS-08e',
          'on-before-save',
          '[EFS-08e] onBeforeSave — thrown handler is skipped and later handler saves',
          'throw skip POST',
        ),
        lifecycleProof(
          'EFS-08f',
          'on-before-save',
          '[EFS-08f] onBeforeSave — handlers run in registration order',
          'ordered transform trace',
        ),
      ],
    },
    {
      member: 'onAfterSave',
      kind: 'setting',
      branches: [
        lifecycleProof(
          'EFS-09a',
          'on-after-save',
          '[EFS-09a] onAfterSave — handlers run only after adapter success',
          'success response then trace',
        ),
        lifecycleProof(
          'EFS-09b',
          'on-after-save',
          '[EFS-09b] onAfterSave — handlers run in registration order',
          'ordered after trace',
        ),
        lifecycleProof(
          'EFS-09c',
          'on-after-save',
          '[EFS-09c] onAfterSave — thrown handler is skipped',
          'throw skip trace',
        ),
        lifecycleProof(
          'EFS-09d',
          'on-after-save',
          '[EFS-09d] onAfterSave — result and mutator reach later handlers',
          'result id and note DOM',
        ),
      ],
    },
    {
      member: 'onBeforeDelete',
      kind: 'setting',
      branches: [
        lifecycleProof(
          'EFS-10a',
          'on-before-delete',
          '[EFS-10a] onBeforeDelete — context carries exact ids',
          'exact id trace',
        ),
        lifecycleProof(
          'EFS-10b',
          'on-before-delete',
          '[EFS-10b] onBeforeDelete — cancel with reason blocks adapter and shows message',
          'message and no DELETE',
        ),
        lifecycleProof(
          'EFS-10c',
          'on-before-delete',
          '[EFS-10c] onBeforeDelete — cancel without reason blocks adapter silently',
          'silent no DELETE',
        ),
        lifecycleProof(
          'EFS-10d',
          'on-before-delete',
          '[EFS-10d] onBeforeDelete — thrown handler is skipped and delete continues',
          'throw skip DELETE',
        ),
        lifecycleProof(
          'EFS-10e',
          'on-before-delete',
          '[EFS-10e] onBeforeDelete — successful hooks precede the adapter request',
          'trace and 204',
        ),
      ],
    },
    {
      member: 'onAfterDelete',
      kind: 'setting',
      branches: [
        lifecycleProof(
          'EFS-11a',
          'on-after-delete',
          '[EFS-11a] onAfterDelete — handlers run only after adapter success',
          '204 then trace',
        ),
        lifecycleProof(
          'EFS-11b',
          'on-after-delete',
          '[EFS-11b] onAfterDelete — handlers run in registration order',
          'ordered delete trace',
        ),
        lifecycleProof(
          'EFS-11c',
          'on-after-delete',
          '[EFS-11c] onAfterDelete — thrown handler is skipped',
          'throw skip trace',
        ),
      ],
    },
    {
      member: 'onBeforeListFetch',
      kind: 'setting',
      branches: [
        actionsListProof(
          'EFS-12a',
          'on-before-list-fetch',
          '[EFS-12a] onBeforeListFetch — setSearchForm threads into the search request',
          'status AND in real search request body',
        ),
        actionsListProof(
          'EFS-12b',
          'on-before-list-fetch',
          '[EFS-12b] onBeforeListFetch — handlers run in registration order',
          'ordered list diagnostics trace',
        ),
        actionsListProof(
          'EFS-12c',
          'on-before-list-fetch',
          '[EFS-12c] onBeforeListFetch — thrown handler is skipped',
          'post-throw handler and search still complete',
        ),
      ],
    },
    {
      member: 'onAfterListFetch',
      kind: 'setting',
      branches: [
        actionsListProof(
          'EFS-13a',
          'on-after-list-fetch',
          '[EFS-13a] onAfterListFetch — rows and totalElements expose the adapter page',
          'adapter row count and total in diagnostics',
        ),
        actionsListProof(
          'EFS-13b',
          'on-after-list-fetch',
          '[EFS-13b] onAfterListFetch — setRows threads into the rendered list',
          'threaded note appears in actual table row',
        ),
        actionsListProof(
          'EFS-13c',
          'on-after-list-fetch',
          '[EFS-13c] onAfterListFetch — handlers run in registration order',
          'ordered after-fetch trace',
        ),
        actionsListProof(
          'EFS-13d',
          'on-after-list-fetch',
          '[EFS-13d] onAfterListFetch — thrown handler is skipped',
          'post-throw handler and table render complete',
        ),
      ],
    },
    {
      member: 'addFields',
      kind: 'setting',
      branches: [
        structureProof(
          'EFS-14a',
          'add-fields',
          '[EFS-14a] addFields — default tab and group render their fields',
          'default tab/group field DOM',
        ),
        structureProof(
          'EFS-14b',
          'add-fields',
          '[EFS-14b] addFields — explicit tab and group render their labels',
          'explicit tab/group label DOM',
        ),
        structureProof(
          'EFS-14c',
          'add-fields',
          '[EFS-14c] addFields — label and order control tab DOM order',
          'tab labels and ordered buttons',
        ),
        structureProof(
          'EFS-14d',
          'add-fields',
          '[EFS-14d] addFields — hidden tab is absent from the tab bar',
          'hidden tab/field absent',
        ),
        structureProof(
          'EFS-14e',
          'add-fields',
          '[EFS-14e] addFields — tab requiredPermissions uses the ADMIN session',
          'allowed/denied tab DOM',
        ),
        structureProof(
          'EFS-14f',
          'add-fields',
          '[EFS-14f] addFields — group requiredPermissions gates legend and field',
          'allowed/denied group DOM',
        ),
      ],
    },
    {
      member: 'withoutField',
      kind: 'setting',
      branches: [
        structureProof(
          'EFS-15a',
          'without-field',
          '[EFS-15a] withoutField — existing field is absent from DOM and payload',
          'removed field absent from POST payload',
        ),
        structureProof(
          'EFS-15b',
          'without-field',
          '[EFS-15b] withoutField — missing field removal is a no-op',
          'remaining fields save normally',
        ),
      ],
    },
    {
      member: 'withoutTab',
      kind: 'setting',
      branches: [
        structureProof(
          'EFS-16a',
          'without-tab',
          '[EFS-16a] withoutTab — tab fields disappear from DOM and payload',
          'removed tab field absent from POST payload',
        ),
        structureProof(
          'EFS-16b',
          'without-tab',
          '[EFS-16b] withoutTab — missing tab removal is a no-op',
          'remaining default tab saves normally',
        ),
      ],
    },
    {
      member: 'withTab',
      kind: 'setting',
      branches: [
        structureProof(
          'EFS-17a',
          'with-tab',
          '[EFS-17a] withTab — label patch replaces the rendered tab label',
          'patched tab label DOM',
        ),
        structureProof(
          'EFS-17b',
          'with-tab',
          '[EFS-17b] withTab — order patch reorders tab buttons',
          'patched order DOM',
        ),
        structureProof(
          'EFS-17c',
          'with-tab',
          '[EFS-17c] withTab — static hidden patch removes the tab',
          'static hidden tab absent',
        ),
        structureProof(
          'EFS-17d',
          'with-tab',
          '[EFS-17d] withTab — conditional hidden resolves by render type',
          'create hidden/update visible',
        ),
        structureProof(
          'EFS-17e',
          'with-tab',
          '[EFS-17e] withTab — requiredPermissions hides a denied tab',
          'permission denied tab absent',
        ),
        structureProof(
          'EFS-17f',
          'with-tab',
          '[EFS-17f] withTab — repeated patches preserve earlier keys',
          'label/order/hidden patch composition',
        ),
      ],
    },
    {
      member: 'withGroup',
      kind: 'setting',
      branches: [
        structureProof(
          'EFS-18a',
          'with-group',
          '[EFS-18a] withGroup — label patch replaces the group legend',
          'patched legend DOM',
        ),
        structureProof(
          'EFS-18b',
          'with-group',
          '[EFS-18b] withGroup — order patch reorders group panels',
          'group fieldset DOM order',
        ),
        structureProof(
          'EFS-18c',
          'with-group',
          '[EFS-18c] withGroup — open controls initial collapse',
          'collapsed then expanded field DOM',
        ),
        structureProof(
          'EFS-18d',
          'with-group',
          '[EFS-18d] withGroup — requiredPermissions gates group content',
          'allowed/denied group DOM',
        ),
        structureProof(
          'EFS-18e',
          'with-group',
          '[EFS-18e] withGroup — repeated patches preserve label and order',
          'group patch composition',
        ),
        structureProof(
          'EFS-18f',
          'with-group',
          '[EFS-18f] withGroup — groupId is global and tabId is not a lookup key',
          'wrong tabId still patches global group',
        ),
      ],
    },
    {
      member: 'withSteps',
      kind: 'setting',
      branches: [
        structureProof(
          'EFS-19a',
          'with-steps',
          '[EFS-19a] withSteps — second declaration replaces the first',
          'old step absent and replacement visible',
        ),
        structureProof(
          'EFS-19b',
          'with-steps',
          '[EFS-19b] withSteps — order sorts the rendered indicator',
          'indicator order DOM',
        ),
        structureProof(
          'EFS-19c',
          'with-steps',
          '[EFS-19c] withSteps — description renders on its owning step',
          'step description DOM',
        ),
        structureProof(
          'EFS-19d',
          'with-steps',
          '[EFS-19d] withSteps — conditional hidden excludes its step',
          'conditional hidden step absent',
        ),
        structureProof(
          'EFS-19e',
          'with-steps',
          '[EFS-19e] withSteps — partially hidden steps leave visible navigation',
          'visible subset retains navigation',
        ),
        structureProof(
          'EFS-19f',
          'with-steps',
          '[EFS-19f] withSteps — all hidden steps degrade to a stable empty wizard',
          'empty wizard does not crash',
        ),
        structureProof(
          'EFS-19g',
          'with-steps',
          '[EFS-19g] withSteps — values survive forward and backward navigation',
          'cross-step value retention',
        ),
      ],
    },
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
    {
      member: 'withRevision',
      kind: 'setting',
      branches: [
        lifecycleProof(
          'EFS-21a',
          'with-revision',
          '[EFS-21a] withRevision — undefined omits revision from create payload',
          'create body omission',
        ),
        lifecycleProof(
          'EFS-21b',
          'with-revision',
          '[EFS-21b] withRevision — create injects exact revisionEntityName',
          'create body revision',
        ),
        lifecycleProof(
          'EFS-21c',
          'with-revision',
          '[EFS-21c] withRevision — update injects exact revisionEntityName',
          'update body revision',
        ),
        lifecycleProof(
          'EFS-21d',
          'with-revision',
          '[EFS-21d] withRevision — delete injects exact revisionEntityName',
          'delete body revision',
        ),
        lifecycleProof(
          'EFS-21e',
          'with-revision',
          '[EFS-21e] withRevision — undefined clears a previous revision',
          'cleared body omission',
        ),
      ],
    },
    {
      member: 'withDataTransfer',
      kind: 'setting',
      branches: [
        transferProof(
          'EFS-22a',
          'with-data-transfer',
          '[EFS-22a] withDataTransfer — export/import omitted fields auto-derive at query time',
          'export/import diagnostics와 checklist가 현재 선언 fields를 사용',
        ),
        transferProof(
          'EFS-22b',
          'with-data-transfer',
          '[EFS-22b] withDataTransfer — explicit fields drive export and import verbatim',
          'id/name/status/category/note 명시 순서가 양쪽에 유지',
        ),
        transferProof(
          'EFS-22c',
          'with-data-transfer',
          '[EFS-22c] withDataTransfer — fileName names a real workbook that round-trips into SQLite',
          'EntityForm Proof.xlsx sheet/cell을 수정 import하고 SQLite row 확인',
        ),
        transferProof(
          'EFS-22d',
          'with-data-transfer',
          '[EFS-22d] withDataTransfer — repeated calls replace the complete prior config',
          '두 번째 import-only 설정 뒤 이전 Export UI가 없음',
        ),
        transferProof(
          'EFS-22e',
          'with-data-transfer',
          '[EFS-22e] withDataTransfer — export and import resolve only their own declarations',
          'export explicit id와 import auto-derived fields가 교차 오염 없음',
        ),
      ],
    },
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
    {
      id: 'P-04',
      members: ['onChange'],
      status: 'implemented',
      sampleCase: 'on-change--p-04',
      sampleAnchor: identityAnchor,
      e2eFile: lifecycleTestFile,
      testTitle:
        '[P-04] onChange × dynamic meta/field — one edit updates both without duplicate cascade',
      assertion: '한 입력이 meta/field DOM을 갱신하고 source cascade는 한 번만 실행',
    },
    {
      id: 'P-05',
      members: ['withTab', 'withGroup'],
      status: 'implemented',
      sampleCase: 'with-tab--p-05',
      sampleAnchor: identityAnchor,
      e2eFile: structureTestFile,
      testTitle: '[P-05] withTab/withGroup × hidden/permission — patches do not resurrect gates',
      assertion: 'hidden/permission gate가 후속 patch 뒤에도 DOM에서 유지',
    },
    {
      id: 'P-06',
      members: ['withSteps'],
      status: 'implemented',
      sampleCase: 'with-steps--p-06',
      sampleAnchor: identityAnchor,
      e2eFile: structureTestFile,
      testTitle: '[P-06] withSteps × validation — invalid owner step restores field and focus',
      assertion: '마지막 step 저장 실패가 첫 invalid field의 step·오류·focus를 복원',
    },
    {
      id: 'P-07',
      members: ['onBeforeSave', 'onAfterSave'],
      status: 'implemented',
      sampleCase: 'on-before-save--p-07',
      sampleAnchor: identityAnchor,
      e2eFile: lifecycleTestFile,
      testTitle:
        '[P-07] before/after save × cancel/throw/order — transformed request precedes success hooks',
      assertion: 'before transform POST 뒤 after success trace 순서',
    },
    {
      id: 'P-08',
      members: ['onBeforeDelete', 'onAfterDelete'],
      status: 'implemented',
      sampleCase: 'on-before-delete--p-08',
      sampleAnchor: identityAnchor,
      e2eFile: lifecycleTestFile,
      testTitle:
        '[P-08] before/after delete × confirm/cancel/throw — dismiss skips hooks and request',
      assertion: 'confirm dismiss는 무실행, accept는 before→DELETE→after',
    },
    {
      id: 'P-09',
      members: ['onBeforeListFetch', 'onAfterListFetch'],
      status: 'implemented',
      sampleCase: 'on-before-list-fetch--p-09',
      sampleAnchor: identityAnchor,
      e2eFile: actionsListTestFile,
      testTitle:
        '[P-09] before/after list × search mutation preserves host search and renders hooked rows',
      assertion: 'host quick-search OR와 hook status AND가 같은 request를 거쳐 hooked rows로 렌더',
    },
    {
      id: 'P-10',
      members: ['withRevision'],
      status: 'implemented',
      sampleCase: 'with-revision--p-10',
      sampleAnchor: identityAnchor,
      e2eFile: lifecycleTestFile,
      testTitle:
        '[P-10] withRevision × create/update/delete — every transport receives the exact name',
      assertion: 'POST/PUT/DELETE 세 body에 exact revisionEntityName',
    },
    {
      id: 'P-11',
      members: ['withDataTransfer', 'addFields', 'withoutField'],
      status: 'implemented',
      sampleCase: 'with-data-transfer--p-11',
      sampleAnchor: identityAnchor,
      e2eFile: transferTestFile,
      testTitle:
        '[P-11] withDataTransfer × field add/remove — auto-derived fields use the live form',
      assertion: '설정 뒤 add late/remove note가 실제 export header와 import SQLite row에 반영',
    },
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
    {
      id: 'P-14',
      members: ['onBeforeSave'],
      status: 'implemented',
      sampleCase: 'validation--p-14',
      sampleAnchor: identityAnchor,
      e2eFile: lifecycleTestFile,
      testTitle: '[P-14] backend validation × plural UI — field and global errors stay separate',
      assertion: 'field 2/global 2 오류가 분리 렌더되고 SQLite row count 불변',
    },
  ],
} as const satisfies EntityFormProofManifest;
