// Characterization tests — ViewEntityForm structural characterization (P2-5).
//
// SCOPE (per task): full-render field/button/tab characterization, step/
// wizard progression, subcollection display + modal re-entry, and button
// placement rules, using ViewEntityForm + createProjectForm/createEmployeeForm.
//
// ---------------------------------------------------------------------------
// HARNESS UPDATE: renderWithProviders() now wraps `ui` in RouterProvider +
// AuthProvider + UIProvider (previously UIProvider only — see harness.ts).
// ViewEntityForm's logic hook (useEntityFormLogic) calls useRouter()/
// useSession() unconditionally (src/listgrid/components/form/hooks/
// useEntityFormLogic.ts), which used to throw synchronously with no
// <RouterProvider> ancestor. That gap is closed: ViewEntityForm (and the
// default ManyToOneView, which calls useSession()) now mount cleanly through
// renderWithProviders — see the "ViewEntityForm — full render via harness"
// describe block below, which renders the real component tree and asserts
// on actual DOM (fields, buttons, tabs), not a re-implementation of the
// render logic.
//
// The STEP/WIZARD and SUBCOLLECTION describe blocks further down still drive
// their scenarios through the real EntityForm API (getCreateStep/validate/
// getViewableTabs, TableSubCollectionField.render() called directly) rather
// than a full ViewEntityForm mount — kept that way on purpose even after the
// harness fix, since those blocks isolate one concern at a time (step-gating
// math, table column derivation) without needing a live full-form render.
//
// One full-mount gap remains, noted again at its describe block below:
// rendering an active createStep wizard through ViewEntityForm crashes under
// headlessUIComponents — CreateStepView renders <Stepper.Step>, and the
// headless baseline's Stepper (src/listgrid/ui/headless.tsx) has no `.Step`
// compound component, so UIProvider's compound-component proxy
// (src/listgrid/ui/UIProvider.tsx `makeWrapper`) throws `Compound
// "Stepper.Step" missing on host component.` at render time. That is a real
// gap in the headless UI baseline, not a ViewEntityForm defect, so this
// suite does not attempt a live-DOM wizard render — the STEP/WIZARD block
// keeps characterizing wizard gating through the real EntityForm createStep
// API instead.
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
  bareEntity,
  type MockRcmFetchHandle,
} from './harness';
import { createProjectForm, createEmployeeForm } from './fixtures';

let activeMock: MockRcmFetchHandle | undefined;

afterEach(() => {
  activeMock?.restore();
  activeMock = undefined;
});

// ============================================================================
// ViewEntityForm — full render via harness. renderWithProviders() now
// supplies RouterProvider + AuthProvider (see harness.ts), so the real
// component tree mounts: useEntityFormLogic's useRouter()/useSession() calls
// resolve instead of throwing, and every assertion below is against actual
// rendered DOM — not a re-implementation of the render logic.
// ============================================================================

describe('ViewEntityForm — full render via harness', () => {
  it('CREATE mode (createEmployeeForm, no id): shows a loading skeleton synchronously, then mounts the real fields', async () => {
    const employee = createEmployeeForm();
    const { container } = renderWithProviders(<ViewEntityForm entityForm={employee} />);

    // Immediately after render(), useEntityFormLogic's mount effect has
    // fired but its `await entityForm.initialize(...)` has not resolved yet
    // — even in CREATE mode, EntityForm.initialize() awaits a 100ms
    // delay() when isAbleFetch() is false (see EntityForm.tsx). So the real
    // "이름" field is not on screen yet; only ViewEntityFormSkeleton is.
    expect(screen.queryByLabelText('이름')).not.toBeInTheDocument();

    // findBy* polls (RTL default up to 1000ms) until the async initialize
    // settles and the real fields mount.
    expect(await screen.findByLabelText('이름')).toBeInTheDocument();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();

    // SURPRISE: getByLabelText('전화번호') does NOT find the phone input.
    // FieldRenderer only clones an `aria-label` onto the field's view element
    // when that element IS the form control (React.isValidElement(view) —
    // see FieldRenderer.tsx). PhoneNumberField's view wraps its <input> in
    // extra "rcm-input-group-*" container divs, so the aria-label lands on
    // that wrapper div, not on the <input> — leaving the input with no
    // accessible name. Falls back to a plain DOM query instead.
    expect(screen.queryByLabelText('전화번호')).not.toBeInTheDocument();
    expect(container.querySelector('input#phone')).not.toBeNull();
  });

  it('CREATE mode buttons: Save + List render, Delete does not — getRenderType() === "create" is the real predicate DeleteButton is gated on', async () => {
    const employee = createEmployeeForm();
    renderWithProviders(<ViewEntityForm entityForm={employee} />);

    expect(await screen.findByRole('button', { name: '저장' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '목록' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument();
  });

  it('UPDATE mode (createEmployeeForm().withId(...)): fetches the entity via GET {url}/{id} and renders the fetched value', async () => {
    const employee = createEmployeeForm().withId('emp-1');
    const mock = mockRcmFetch([
      {
        method: 'GET',
        url: '/api/employee/emp-1',
        handler: () => bareEntity({ id: 'emp-1', name: '홍길동' }),
      },
    ]);
    activeMock = mock;

    renderWithProviders(<ViewEntityForm entityForm={employee} />);

    expect(await screen.findByDisplayValue('홍길동')).toBeInTheDocument();
    expect(mock.requests).toHaveLength(1);
    expect(mock.requests[0]?.url).toBe('/api/employee/emp-1');
    expect(mock.requests[0]?.method).toBe('GET');
  });

  it('UPDATE mode buttons: Save + List + Delete all render — isDeletable() defaults true and getRenderType() === "update" gates Delete on', async () => {
    const employee = createEmployeeForm().withId('emp-1');
    const mock = mockRcmFetch([
      {
        method: 'GET',
        url: '/api/employee/emp-1',
        handler: () => bareEntity({ id: 'emp-1', name: '홍길동' }),
      },
    ]);
    activeMock = mock;

    renderWithProviders(<ViewEntityForm entityForm={employee} />);

    expect(await screen.findByRole('button', { name: '저장' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '목록' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
  });

  it('SURPRISE: CREATE-mode createProjectForm() has exactly 1 viewable tab (tasks is update-only) — ViewEntityForm renders no tab BUTTON chrome at all, only the field-group heading remains', async () => {
    const project = createProjectForm();
    const { container } = renderWithProviders(<ViewEntityForm entityForm={project} />);

    expect(await screen.findByLabelText('프로젝트명')).toBeInTheDocument();

    // ViewEntityForm only renders <Tab.List> (the clickable tab buttons)
    // when `tabs.length > 1` (see ViewEntityForm.tsx) — with a single
    // viewable tab there is no ".rcm-tab" button anywhere. "기본 정보" itself
    // still appears once, though — it is also the default field-group
    // heading (DEFAULT_FIELD_GROUP_INFO.label), which ViewFieldGroup renders
    // regardless of tab count. So "no tab chrome" means no tab BUTTONS, not
    // "no occurrence of the tab's label text".
    expect(container.querySelectorAll('.rcm-tab')).toHaveLength(0);
    expect(container.querySelectorAll('[role="tab"]')).toHaveLength(0);
    expect(screen.getAllByText('기본 정보')).toHaveLength(1);
    expect(screen.queryByText('작업')).not.toBeInTheDocument();
  });

  it('UPDATE-mode createProjectForm() reveals a second "작업" tab, and BOTH tab panels mount at once (ViewTabPanel uses unmount={false}) — the tasks subcollection fetches even though "기본 정보" is the selected tab', async () => {
    const project = createProjectForm().withId('proj-1');
    const mock = mockRcmFetch([
      {
        method: 'GET',
        url: '/api/project/proj-1',
        handler: () => bareEntity({ id: 'proj-1', name: '프로젝트 A' }),
      },
      {
        method: 'POST',
        url: '/api/project-task/search',
        handler: () => searchPageEnvelope([]),
      },
    ]);
    activeMock = mock;

    const { container } = renderWithProviders(<ViewEntityForm entityForm={project} />);

    // The "작업" tab panel is not the selected one (index 0, "기본 정보", is),
    // yet its TableSubCollectionField still issued its search request and
    // rendered the empty-state message — proof both panels are live-mounted
    // simultaneously, not lazily mounted on tab activation.
    expect(await screen.findByText('표시할 항목이 없습니다')).toBeInTheDocument();

    // SURPRISE: "기본 정보" is not a reliable way to find "the default tab" —
    // it is ALSO the default field-group heading (DEFAULT_FIELD_GROUP_INFO
    // .label), and both tabs' field groups fall back to that same default
    // (createProjectForm() never passes an explicit `fieldGroup` to
    // addFields — see EntityFormActions.tsx addFields). Once everything
    // settles, "기본 정보" appears 3 times (1 tab label + 2 field-group <h5>
    // headings, one per tab panel) — querying by that text alone is
    // ambiguous. The ViewTab-specific ".rcm-tab" class is what actually
    // identifies the 2 real tab buttons, in tab order.
    expect(screen.getAllByText('기본 정보')).toHaveLength(3);
    expect(screen.getAllByText('작업')).toHaveLength(1);
    const tabLabels = Array.from(container.querySelectorAll<HTMLElement>('.rcm-tab')).map(
      (el) => el.textContent,
    );
    expect(tabLabels).toEqual(['기본 정보', '작업']);

    const urls = mock.requests.map((r) => r.url);
    expect(urls).toContain('/api/project/proj-1');
    expect(urls).toContain('/api/project-task/search');
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
