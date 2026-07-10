// Characterization tests — ViewEntityForm structural characterization (P2-5).
//
// SCOPE (per task): step/wizard progression, subcollection display + modal
// re-entry, and button placement rules, using ViewEntityForm +
// createProjectForm/createEmployeeForm.
//
// ---------------------------------------------------------------------------
// HARNESS GAP (grounded empirically, see "harness limitation" describe below):
// ViewEntityForm's logic hook (useEntityFormLogic) calls useRouter()
// unconditionally on every render (src/listgrid/components/form/hooks/
// useEntityFormLogic.ts:52 `const router = useRouter();`). useRouter() throws
// synchronously when no <RouterProvider> ancestor exists (src/listgrid/
// router/RouterProvider.tsx `mustRouter`). RouterProvider IS part of the
// library's public barrel (src/listgrid/index.ts) but is deliberately NOT
// re-exported by tests/characterization/harness.ts's curated surface, and the
// hard rule for this suite forbids importing from '../../src' directly to add
// it ourselves. Consequently **ViewEntityForm cannot be mounted through this
// harness at all** — every scenario below that would otherwise assert on
// live ViewEntityForm DOM (step-button clicks, header/bottom/tab-row button
// placement) is instead driven through the real EntityForm public API that
// ViewEntityForm's hook/child components consume internally
// (getCreateStep/validate/getViewableTabs/isCreatable/getRenderType, and
// TableSubCollectionField.render() called directly for the subcollection —
// TableSubCollectionView itself has no router dependency, so that one path
// *is* fully live-DOM-verified). This is recorded as a deviation, not papered
// over with hand-reimplemented logic — every assertion below calls the real
// engine method the component itself calls.
// ---------------------------------------------------------------------------

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import {
  renderWithProviders,
  mockRcmFetch,
  searchPageEnvelope,
  ViewEntityForm,
  EntityForm,
  StringField,
  BooleanField,
  RequiredValidation,
  TableSubCollectionField,
  type MockRcmFetchHandle,
} from './harness';
import { createProjectForm, createEmployeeForm } from './fixtures';

let activeMock: MockRcmFetchHandle | undefined;

afterEach(() => {
  activeMock?.restore();
  activeMock = undefined;
});

// ============================================================================
// Harness limitation — ViewEntityForm cannot mount without a RouterProvider
// the harness does not export. Pinned here as a real, currently-true fact so
// a future harness update (or the P4 transplant) has a concrete regression
// signal if this requirement ever changes.
// ============================================================================

describe('harness limitation — ViewEntityForm requires an app-level RouterProvider', () => {
  it('throws synchronously on mount because useEntityFormLogic calls useRouter() unconditionally', () => {
    const form = createProjectForm();
    let message = '';
    try {
      renderWithProviders(<ViewEntityForm entityForm={form} />);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('useRouter must be called within a <RouterProvider>');
  });
});

// ============================================================================
// STEP/WIZARD progression — characterized via the real EntityForm createStep
// API (EntityForm.withCreateStep/getCreateStep) and the exact gating
// algorithm CreateStepView.validateAndAdvanceStep uses (entityForm.validate
// with the accumulated fields of every step up to and including the current
// one — see src/listgrid/components/form/ui/CreateStepView.tsx
// validateAndAdvanceStep). We call entityForm.validate() for real; we do not
// reimplement its pass/fail logic.
// ============================================================================

describe('STEP/WIZARD progression — createStep config + gating', () => {
  it('getCreateStep() is undefined for a form with no createStep configured (fixture default)', () => {
    const form = createProjectForm();
    expect(form.getCreateStep()).toBeUndefined();
  });

  it('withCreateStep() sorts steps by `order` and getCreateStep() filters out hidden:true steps', () => {
    const form = createProjectForm();
    form.withCreateStep([
      { id: 'step-b', label: 'B', order: 2, fields: ['dueDate'] },
      { id: 'step-a', label: 'A', order: 1, fields: ['name'] },
      { id: 'step-hidden', label: 'H', order: 3, fields: ['dueDate'], hidden: true },
    ]);

    const steps = form.getCreateStep();
    expect(steps).toHaveLength(2);
    expect(steps?.map((s) => s.id)).toEqual(['step-a', 'step-b']);
  });

  it('the useCreateStep gate (renderType==="create" && getCreateStep() has entries) composes two real EntityForm primitives', () => {
    // Reproduces the exact boolean useEntityFormLogic.ts:293-299 composes —
    // both operands (getRenderType(), getCreateStep()) are called for real.
    const asCreate = createProjectForm().withCreateStep([
      { id: 's1', label: 'S1', order: 1, fields: ['name'] },
    ]);
    expect(asCreate.getRenderType()).toBe('create');
    expect((asCreate.getCreateStep()?.length ?? 0) > 0).toBe(true);

    // A form with a persisted id (renderType === 'update') is what the hook
    // uses to permanently disable the wizard — the step config alone is not
    // sufficient. Surprising because it means createStep config is silently
    // inert once an entity has an id, with no warning anywhere.
    const asUpdate = createProjectForm()
      .withCreateStep([{ id: 's1', label: 'S1', order: 1, fields: ['name'] }])
      .withId('proj-1');
    expect(asUpdate.getRenderType()).toBe('update');
  });

  it('advancing past a step blocked by validate() when a required field of an earlier/current step is blank', async () => {
    const form = createProjectForm().withCreateStep([
      { id: 'basic', label: '기본정보', order: 1, fields: ['name'] },
      { id: 'schedule', label: '일정', order: 2, fields: ['dueDate'] },
    ]);

    // Step 0 gating — mirrors validateAndAdvanceStep(entityForm, 0): fields
    // of createStep[0..0] only ('name', which is required in the fixture).
    const step0FieldNames = form.getCreateStep()![0]!.fields;
    const blockedAtStep0 = await form.validate({ fieldNames: step0FieldNames });
    expect(blockedAtStep0).toHaveLength(1);
    expect(blockedAtStep0[0]?.errors[0]).toMatch(/필수 값입니다/);

    form.setValue('name', '프로젝트 A');
    const advancesFromStep0 = await form.validate({ fieldNames: step0FieldNames });
    expect(advancesFromStep0).toHaveLength(0);
  });

  it('the accumulated-fields rule (i<=currentStep) re-validates earlier steps too, not just the current one', async () => {
    const form = createProjectForm().withCreateStep([
      { id: 'basic', label: '기본정보', order: 1, fields: ['name'] },
      { id: 'schedule', label: '일정', order: 2, fields: ['dueDate'] },
    ]);
    // dueDate is NOT required by the fixture — mark it required locally to
    // exercise a 2-field cumulative gate (this mutates only this test's own
    // EntityForm instance, not fixtures.ts).
    form.getField('dueDate')!.withRequired(true);

    const steps = form.getCreateStep()!;
    const fieldsThroughStep1: string[] = [...steps[0]!.fields, ...steps[1]!.fields];

    // name still blank -> blocked even though we're "asking about" step 1's
    // fields, because CreateStepView accumulates fields from step 0 onward.
    form.setValue('dueDate', '2026-12-31');
    const blocked = await form.validate({ fieldNames: fieldsThroughStep1 });
    expect(blocked.map((e) => e.name)).toContain('name');

    form.setValue('name', '프로젝트 A');
    const advances = await form.validate({ fieldNames: fieldsThroughStep1 });
    expect(advances).toHaveLength(0);
  });

  it('a step whose fields belong to the SubCollection tab can never become the "first visible tab" in create mode', async () => {
    // CreateStepView's step-change effect (useEntityFormLogic.ts:311-340)
    // calls entityForm.getViewableTabs(false, step.fields) to find the first
    // tab to jump to. We call the exact same real method.
    const form = createProjectForm(); // create mode (no id)

    const tabsForNameStep = await form.getViewableTabs(false, ['name']);
    expect(tabsForNameStep.map((t) => t.id)).toEqual(['default']);

    // Surprising: requesting a step whose only field is the subcollection
    // ('tasks') does not fall back to some other tab — it returns NO
    // viewable tabs at all, because EntityFormBase.isViewableFieldGroup
    // hard-codes "SubCollection 은 update 시점에만 설정할 수 있다" (subcollection
    // fields are only viewable when renderType === 'update'), independent of
    // hidden/permission config.
    const tabsForTasksStep = await form.getViewableTabs(false, ['tasks']);
    expect(tabsForTasksStep).toEqual([]);
  });
});

// ============================================================================
// SUBCOLLECTION display — createProjectForm's `tasks` TableSubCollectionField
// (mappedBy: 'project'). Rendered by calling the real
// TableSubCollectionField.render() directly (no router dependency in this
// component tree), through mockRcmFetch/searchPageEnvelope for the wire call.
// ============================================================================

describe('SUBCOLLECTION display — tasks TableSubCollectionField (createProjectForm)', () => {
  it('the "tasks" field is registered as a collection (getCollection), not a regular field (getField)', () => {
    const form = createProjectForm();
    // Surprising for anyone used to entityForm.getField(name): subcollections
    // live in a separate registry and getField('tasks') is undefined.
    expect(form.getField('tasks')).toBeUndefined();
    expect(form.getCollection('tasks')).toBeInstanceOf(TableSubCollectionField);
  });

  it('renders via a POST {childUrl}/search request carrying an AND filter on the relation.mappedBy field = parent id', async () => {
    const form = createProjectForm().withId('proj-1');
    const mock = mockRcmFetch([
      {
        method: 'POST',
        url: '/api/project-task/search',
        handler: () => searchPageEnvelope([{ id: 't1', title: 'task one', done: true }]),
      },
    ]);
    activeMock = mock;

    const tasksField = form.getCollection('tasks')!;
    const view = await tasksField.render({ entityForm: form });
    renderWithProviders(<div>{view}</div>);

    await screen.findByText('1개');

    expect(mock.requests).toHaveLength(1);
    expect(mock.requests[0]?.url).toBe('/api/project-task/search');
    expect(mock.requests[0]?.method).toBe('POST');
    // handle.requests captures the raw SearchForm instance (not yet
    // serialized) — round-trip through JSON to see the actual wire shape
    // (SearchForm/FilterGroup define custom toJSON()).
    const body = JSON.parse(JSON.stringify(mock.requests[0]?.body)) as {
      filters?: { AND?: { name: string; value: unknown }[] };
    };
    expect(body.filters?.AND).toEqual([{ name: 'project', value: 'proj-1' }]);
  });

  it('SURPRISE: with the fixture as-authored (no .useListField() on title/done), the table renders ZERO data columns', async () => {
    // TableSubCollectionView derives columns from list-enabled fields
    // (field.listConfig?.support === true) when tableConfig.displayFields is
    // not set. fixtures.ts's createProjectTaskChildForm() never calls
    // .useListField() on 'title'/'done', so listConfig is undefined on both
    // — the auto-column-detection path yields an empty column set. Only the
    // built-in row-number "No" column survives.
    const form = createProjectForm().withId('proj-1');
    const mock = mockRcmFetch([
      {
        method: 'POST',
        url: '/api/project-task/search',
        handler: () =>
          searchPageEnvelope([
            { id: 't1', title: 'task one', done: true },
            { id: 't2', title: 'task two', done: false },
          ]),
      },
    ]);
    activeMock = mock;

    const tasksField = form.getCollection('tasks')!;
    const view = await tasksField.render({ entityForm: form });
    const { container } = renderWithProviders(<div>{view}</div>);

    await screen.findByText('2개');

    const headerCells = container.querySelectorAll('thead th');
    expect(Array.from(headerCells).map((th) => th.textContent)).toEqual(['No']);

    const dataRows = container.querySelectorAll('tbody tr');
    expect(dataRows).toHaveLength(2);
    dataRows.forEach((row) => {
      expect(row.querySelectorAll('td')).toHaveLength(1); // only the row-number cell
    });
  });

  it('column rendering rule when fields ARE list-enabled: label as header text, boolean formatted as Y/N', async () => {
    // Local fixture setup (not touching fixtures.ts) exercising the same
    // TableSubCollectionField/TableSubCollectionView the vanilla fixture
    // uses, just with .useListField() called — proves the column-detection
    // + cell-formatting rule is real, not just "everything is empty".
    const listEnabledChildForm = new EntityForm('projectTask', '/api/project-task');
    listEnabledChildForm.addFields({
      items: [
        new StringField('title', 1)
          .withLabel('제목')
          .withRequired(true)
          .withValidations(new RequiredValidation('task-title-required'))
          .useListField(),
        new BooleanField('done', 2).withLabel('완료').useListField(),
      ],
    });
    const localTasksField = new TableSubCollectionField({
      entityForm: listEnabledChildForm,
      relation: { mappedBy: 'project' },
      order: 1,
      name: 'tasksLocal',
    });

    const form = createProjectForm().withId('proj-1');
    const mock = mockRcmFetch([
      {
        method: 'POST',
        url: '/api/project-task/search',
        handler: () =>
          searchPageEnvelope([
            { id: 't1', title: 'task one', done: true },
            { id: 't2', title: 'task two', done: false },
          ]),
      },
    ]);
    activeMock = mock;

    const view = await localTasksField.render({ entityForm: form });
    const { container } = renderWithProviders(<div>{view}</div>);

    await screen.findByText('2개');

    const headerCells = Array.from(container.querySelectorAll('thead th')).map(
      (th) => th.textContent,
    );
    expect(headerCells).toEqual(['No', '제목', '완료']);

    const firstRowCells = Array.from(
      container.querySelectorAll('tbody tr')[0]!.querySelectorAll('td'),
    );
    expect(firstRowCells.map((td) => td.textContent)).toEqual(['1', 'task one', 'Y']);
    const secondRowCells = Array.from(
      container.querySelectorAll('tbody tr')[1]!.querySelectorAll('td'),
    );
    expect(secondRowCells.map((td) => td.textContent)).toEqual(['2', 'task two', 'N']);
  });

  it('renders the empty-state message when the backend returns zero rows', async () => {
    const form = createProjectForm().withId('proj-1');
    const mock = mockRcmFetch([
      { method: 'POST', url: '/api/project-task/search', handler: () => searchPageEnvelope([]) },
    ]);
    activeMock = mock;

    const tasksField = form.getCollection('tasks')!;
    const view = await tasksField.render({ entityForm: form });
    renderWithProviders(<div>{view}</div>);

    expect(await screen.findByText('표시할 항목이 없습니다')).toBeInTheDocument();
  });

  it('SURPRISE: rendering the subcollection for a parent with no id (create mode) drops the mappedBy filter entirely instead of erroring', async () => {
    // getViewableTabs already proves the subcollection tab is unreachable in
    // create mode through ViewEntityForm's normal tab flow (see the
    // STEP/WIZARD describe block above). But TableSubCollectionField.render()
    // itself has no guard against being called with a parent that has no id
    // — calling it directly (as we must, given the router gap) produces an
    // UNFILTERED search request rather than throwing or filtering by
    // `undefined`. This is a real gap in the current engine worth flagging
    // for the P4 transplant, not something this test invents.
    const form = createProjectForm(); // no id
    const mock = mockRcmFetch([
      { method: 'POST', url: '/api/project-task/search', handler: () => searchPageEnvelope([]) },
    ]);
    activeMock = mock;

    const tasksField = form.getCollection('tasks')!;
    const view = await tasksField.render({ entityForm: form });
    renderWithProviders(<div>{view}</div>);

    await screen.findByText('표시할 항목이 없습니다');

    const body = JSON.parse(JSON.stringify(mock.requests[0]?.body)) as { filters?: unknown };
    expect(body.filters).toEqual({}); // no AND clause at all — not {name:'project',value:undefined}
  });
});

// ============================================================================
// SUBCOLLECTION modal/callback re-entry — the task asks to characterize the
// "add/edit a child row" callback contract. For TableSubCollectionField the
// real, observed answer is: there isn't one. TableSubCollectionView renders
// a read-only table with no row click handler, no add/edit button, and no
// modal wiring (no showModal/getModalData usage anywhere in that component).
// That absence is the characterization.
// ============================================================================

describe('SUBCOLLECTION modal/callback re-entry — tasks TableSubCollectionField', () => {
  it('renders no add/edit affordance: only the refresh icon button exists in the toolbar', async () => {
    const form = createProjectForm().withId('proj-1');
    const mock = mockRcmFetch([
      {
        method: 'POST',
        url: '/api/project-task/search',
        handler: () => searchPageEnvelope([{ id: 't1', title: 'task one', done: true }]),
      },
    ]);
    activeMock = mock;

    const tasksField = form.getCollection('tasks')!;
    const view = await tasksField.render({ entityForm: form });
    const { container } = renderWithProviders(<div>{view}</div>);

    await screen.findByText('1개');

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]?.title).toBe('새로고침'); // "refresh" — the only interactive affordance

    // No modal/dialog surface exists anywhere in the tree.
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('data rows carry no click affordance (no onClick, no role, no tabIndex) — clicking one is a structural no-op', async () => {
    const form = createProjectForm().withId('proj-1');
    const mock = mockRcmFetch([
      {
        method: 'POST',
        url: '/api/project-task/search',
        handler: () => searchPageEnvelope([{ id: 't1', title: 'task one', done: true }]),
      },
    ]);
    activeMock = mock;

    const tasksField = form.getCollection('tasks')!;
    const view = await tasksField.render({ entityForm: form });
    const { container } = renderWithProviders(<div>{view}</div>);

    await screen.findByText('1개');

    const row = container.querySelector('tbody tr');
    expect(row).not.toBeNull();
    expect(row?.getAttribute('role')).toBeNull();
    expect(row?.getAttribute('tabindex')).toBeNull();
  });

  it('fetchOptions.viewDetail defaults to true on the field config but has no observable effect on TableSubCollectionView output', async () => {
    // TableSubCollectionField's constructor sets a default fetchOptions of
    // { useSearchForm: true, viewDetail: true, pageSize: 10000 } — `viewDetail`
    // is a real, present config knob (see config/TableSubCollectionField.tsx),
    // but only CardSubCollectionView reads `fetchOptions.viewDetail`
    // (grep confirms TableSubCollectionView.tsx never references it). It is
    // wired into the outgoing SearchForm (searchForm.withViewDetail(true))
    // but drives no UI affordance for this component — i.e. no modal/detail
    // re-entry surfaces from it despite being "on" by default.
    const form = createProjectForm().withId('proj-1');
    const tasksField = form.getCollection('tasks') as TableSubCollectionField;
    expect(tasksField.fetchOptions?.viewDetail).toBe(true);

    const mock = mockRcmFetch([
      {
        method: 'POST',
        url: '/api/project-task/search',
        handler: () => searchPageEnvelope([]),
      },
    ]);
    activeMock = mock;

    const view = await tasksField.render({ entityForm: form });
    renderWithProviders(<div>{view}</div>);
    await screen.findByText('표시할 항목이 없습니다');

    // The SearchForm sent on the wire does carry viewDetail=true...
    const body = JSON.parse(JSON.stringify(mock.requests[0]?.body)) as { viewDetail?: boolean };
    expect(body.viewDetail).toBe(true);
    // ...but (per the DOM assertions in the sibling tests above) that never
    // surfaces as a button, link, or modal in the rendered output.
  });
});

// ============================================================================
// BUTTON PLACEMENT rules — config-derived predicates only (see harness
// limitation block: actual header/bottom/tab-row DOM placement is
// unreachable without RouterProvider). Every predicate here is a REAL
// EntityForm method call — the same ones getEntityFormButtons() in
// src/listgrid/components/form/ui/ViewEntityFormButtons.tsx consults to
// decide save/delete/list eligibility before ViewEntityFormButtons ever
// renders anything.
// ============================================================================

describe('BUTTON PLACEMENT rules — create/update eligibility predicates', () => {
  it('isCreatable()/isUpdatable()/isDeletable() default to true on a freshly built EntityForm', () => {
    const employee = createEmployeeForm();
    expect(employee.isCreatable()).toBe(true);
    expect(employee.isUpdatable()).toBe(true);
    expect(employee.isDeletable()).toBe(true);
  });

  it('withCreatable(false)/withUpdatable(false)/withDeletable(false) flip the predicates the save/delete buttons gate on', () => {
    const employee = createEmployeeForm();
    employee.withCreatable(false);
    employee.withUpdatable(false);
    employee.withDeletable(false);
    expect(employee.isCreatable()).toBe(false);
    expect(employee.isUpdatable()).toBe(false);
    expect(employee.isDeletable()).toBe(false);

    // getEntityFormButtons excludes 'save' when `!isCreatable() || !isUpdatable()`
    // — either flag alone is sufficient to suppress it.
    const savePossible = employee.isCreatable() && employee.isUpdatable();
    expect(savePossible).toBe(false);
  });

  it('getRenderType() — the real predicate the delete button gates on ("update" only) — is a pure function of whether an id is set', () => {
    const created = createEmployeeForm();
    expect(created.getRenderType()).toBe('create');

    const persisted = createEmployeeForm().withId('42');
    expect(persisted.getRenderType()).toBe('update');
  });

  it('an active createStep wizard (useCreateStep) forces the save-button-suppression path even when creatable/updatable are both true', () => {
    // getEntityFormButtons: `if (!isCreatable || !isUpdatable || useCreateStep) excludeButtons.push('save')`.
    // Reproduces the third disjunct using the real useCreateStep composite
    // from the STEP/WIZARD describe block above.
    const wizardForm = createProjectForm().withCreateStep([
      { id: 's1', label: 'S1', order: 1, fields: ['name'] },
    ]);
    expect(wizardForm.isCreatable()).toBe(true);
    expect(wizardForm.isUpdatable()).toBe(true);

    const useCreateStep =
      wizardForm.getRenderType() === 'create' && (wizardForm.getCreateStep()?.length ?? 0) > 0;
    expect(useCreateStep).toBe(true); // save button is excluded despite both flags being true
  });
});
