// Characterization test — P2-3 form logic: initialization (create vs update),
// save wire-format, reset, isDirty edge cases, and tab navigation state.
//
// Every import comes from the harness/fixtures indirection — never from
// '../../src/...' directly (see tests/characterization/harness.ts). This file
// pins CURRENT EntityForm behavior so a later P4/P5 transplant can be proven
// behavior-identical. Behavior assertions only — no snapshots.

import { afterEach, describe, expect, it } from 'vitest';
import { mockRcmFetch, bareEntity, type MockRcmFetchHandle } from './harness';
import { createEmployeeForm, createProjectForm } from './fixtures';

let mock: MockRcmFetchHandle | undefined;

afterEach(() => {
  mock?.restore();
  mock = undefined;
});

// ============================================================================
// INITIALIZATION — create mode (no id, no fetch) vs update mode (id + fetch).
// ============================================================================

describe('form-logic — initialization', () => {
  it('create mode: no id means isAbleFetch() is false and initialize() performs no network fetch, fields stay unset', async () => {
    const form = createEmployeeForm();

    expect(form.getRenderType()).toBe('create');
    expect(form.isAbleFetch()).toBe(false);

    // No mockRcmFetch route registered at all — if the engine attempted a
    // fetch here, configureApiClient would still be in whatever state the
    // previous test left it in the real app, but in this harness there is no
    // ambient client until mockRcmFetch() runs, so an unexpected fetch would
    // throw. Its absence characterizes create-mode initialize() as fetch-free.
    const result = await form.initialize({});

    expect(result.errors).toBeUndefined();
    expect(result.entityForm.getRenderType()).toBe('create');
    expect(result.entityForm.id).toBeUndefined();

    // Surprise: initialize() internally does `this.clone(true)`, and
    // FormField.clone(includeValue=true) always sets `this.value = {
    // ...origin.value }` — even when origin.value was undefined, spreading
    // undefined yields `{}`. So a never-touched field ends up with an empty
    // FieldValue OBJECT, not `undefined`, after going through initialize().
    const nameField = result.entityForm.getField('name');
    expect(nameField?.value).toEqual({});
    expect(await result.entityForm.getValue('name')).toBeUndefined();
  });

  it('update mode: initialize() GETs {url}/{id} and populates value.current + value.fetched from the response', async () => {
    const backendEmployee = {
      id: '42',
      name: '김철수',
      email: 'kim@example.com',
      salary: 5000,
      remoteEligible: true,
    };
    mock = mockRcmFetch([
      { method: 'GET', url: '/api/employee/42', handler: () => bareEntity(backendEmployee) },
    ]);

    const form = createEmployeeForm().withId('42');
    expect(form.getRenderType()).toBe('update');
    expect(form.isAbleFetch()).toBe(true);

    const result = await form.initialize({});

    expect(result.errors).toBeUndefined();
    expect(mock.requests).toEqual([{ url: '/api/employee/42', method: 'GET', body: undefined }]);
    expect(result.entityForm.id).toBe('42');

    // Fetched value populates BOTH current and fetched (not just fetched) —
    // setFetchedValues() seeds `current` too, see EntityForm.tsx setFetchedValues.
    const nameField = result.entityForm.getField('name');
    expect(nameField?.value).toEqual({ current: '김철수', fetched: '김철수', default: undefined });

    expect(await result.entityForm.getValue('salary')).toBe(5000);
    expect(await result.entityForm.getValue('remoteEligible')).toBe(true);

    // Surprise: a field NOT present in the backend payload (phone) does not
    // stay `undefined` — it gets an explicit FieldValue object with all three
    // slots undefined, distinct from "never touched".
    const phoneField = result.entityForm.getField('phone');
    expect(phoneField?.value).toEqual({
      current: undefined,
      fetched: undefined,
      default: undefined,
    });
    expect(await result.entityForm.getValue('phone')).toBeUndefined();
    // ...but that "all-undefined FieldValue" shape is still NOT dirty.
    expect(phoneField?.isDirty()).toBe(false);
  });
});

// ============================================================================
// SAVE — wire-format characterization: method/url/body for create vs update.
// ============================================================================

describe('form-logic — save payload shape', () => {
  it('create: internalSave() POSTs to the bare collection url with only fields that have a value', async () => {
    mock = mockRcmFetch([
      {
        method: 'POST',
        url: '/api/employee',
        handler: (options) =>
          bareEntity({ ...(options.formData as Record<string, unknown>), id: 'new-1' }),
      },
    ]);

    const form = createEmployeeForm();
    form.setValue('name', '홍길동');
    form.setValue('email', 'hong@example.com');
    form.setValue('salary', 0);

    const result = await form.internalSave();

    expect(result.errors).toEqual([]);
    expect(mock.requests).toHaveLength(1);
    expect(mock.requests[0]?.url).toBe('/api/employee');
    expect(mock.requests[0]?.method).toBe('POST');

    // Wire-format: revisionEntityName is always injected; fields with no
    // touched value are absent (department/hireDate/etc. were never set, so
    // they don't appear at all — not sent as null/undefined). No
    // `modifiedFields` key on create (that's update-only, see below).
    //
    // Surprise: `phone` shows up anyway, as `''`, even though it was never
    // touched. PhoneNumberField.getSaveValue() unconditionally pipes
    // getCurrentValue() (undefined, since untouched) through
    // removePhoneNumberHyphens(), which coerces null/undefined to `''`
    // (`if (!phoneNumber) return ''`). Since '' !== undefined, the field
    // counts as "has a value" on create and is submitted — a field-specific
    // quirk that doesn't apply to plain StringField/NumberField.
    expect(mock.requests[0]?.body).toEqual({
      revisionEntityName: 'employee',
      name: '홍길동',
      email: 'hong@example.com',
      salary: 0,
      phone: '',
    });

    expect(result.entityForm.id).toBe('new-1');
  });

  it('update: internalSave() PUTs to {url}/{id} with only dirty fields, plus an explicit modifiedFields list', async () => {
    const backendEmployee = { id: '42', name: '김철수', salary: 5000 };
    mock = mockRcmFetch([
      { method: 'GET', url: '/api/employee/42', handler: () => bareEntity(backendEmployee) },
      {
        method: 'PUT',
        url: '/api/employee/42',
        handler: (options) =>
          bareEntity({ ...backendEmployee, ...(options.formData as Record<string, unknown>) }),
      },
    ]);

    const initialized = await createEmployeeForm().withId('42').initialize({});
    const form = initialized.entityForm;
    form.changeValue('salary', 9000);

    const result = await form.internalSave();

    expect(result.errors).toEqual([]);
    const putRequest = mock.requests.find((r) => r.method === 'PUT');
    expect(putRequest?.url).toBe('/api/employee/42');
    expect(putRequest?.body).toEqual({
      revisionEntityName: 'employee',
      salary: 9000,
      modifiedFields: ['salary'],
    });
  });

  it('update: internalSave() with no dirty fields is rejected before any network call', async () => {
    const backendEmployee = { id: '42', name: '김철수', salary: 5000 };
    mock = mockRcmFetch([
      { method: 'GET', url: '/api/employee/42', handler: () => bareEntity(backendEmployee) },
    ]);

    const initialized = await createEmployeeForm().withId('42').initialize({});
    const form = initialized.entityForm;

    const result = await form.internalSave();

    // '수정된 항목이 없습니다.' = "nothing was changed" — a client-side guard,
    // no PUT is ever sent.
    expect(result.errors).toEqual(['수정된 항목이 없습니다.']);
    expect(mock.requests).toHaveLength(1); // only the GET from initialize()
  });

  it('create: a required field left blank is rejected client-side without any network call', async () => {
    mock = mockRcmFetch([
      { method: 'POST', url: '/api/employee', handler: () => bareEntity({ id: 'x' }) },
    ]);

    const form = createEmployeeForm(); // name is required, never set

    const result = await form.internalSave();

    expect(result.errors).toEqual(['입력 값이 올바르지 않습니다.']);
    expect(result.entityForm.errors?.[0]?.name).toBe('name');
    expect(mock.requests).toHaveLength(0);
  });
});

// ============================================================================
// RESET — resetValue() reverts to `fetched` in update mode, `default` in
// create mode (and to "unset" when no default exists).
// ============================================================================

describe('form-logic — resetValue', () => {
  it('update mode: resetValue() reverts an edited field back to its fetched value', async () => {
    mock = mockRcmFetch([
      {
        method: 'GET',
        url: '/api/employee/42',
        handler: () => bareEntity({ id: '42', name: '김철수', salary: 5000 }),
      },
    ]);

    const initialized = await createEmployeeForm().withId('42').initialize({});
    const form = initialized.entityForm;

    form.changeValue('salary', 9999);
    expect(form.isDirtyField('salary')).toBe(true);
    expect(await form.getValue('salary')).toBe(9999);

    form.resetValue('salary');

    expect(form.isDirtyField('salary')).toBe(false);
    expect(await form.getValue('salary')).toBe(5000);
  });

  it('create mode: resetValue() on a field with no default clears `current` back to unset (not to 0/""/null)', async () => {
    const form = createEmployeeForm();

    form.setValue('name', 'temp value');
    expect(form.isDirtyField('name')).toBe(true);

    form.resetValue('name');

    // resetTo is `default` in create mode; StringField never had a default,
    // so resetValue() DELETES the `current` key entirely rather than setting
    // it to a falsy sentinel.
    expect(
      Object.prototype.hasOwnProperty.call(form.getField('name')?.value ?? {}, 'current'),
    ).toBe(false);
    expect(await form.getValue('name')).toBeUndefined();
    expect(form.isDirtyField('name')).toBe(false);
  });
});

// ============================================================================
// DIRTY edge cases — falsy-value semantics of isDirty()/isDirtyField().
// ============================================================================

describe('form-logic — isDirty falsy/edge semantics', () => {
  it('create mode: setting an empty string is normalized away — NOT dirty', () => {
    const form = createEmployeeForm();
    form.setValue('name', '');
    // Surprise: '' round-trips through normalizeEmptyValue() to `undefined`
    // and compares equal to the (also undefined) default — not dirty, even
    // though value.current is explicitly the string ''.
    expect(form.getField('name')?.value).toEqual({ current: '' });
    expect(form.isDirtyField('name')).toBe(false);
  });

  it('update mode: reverting a fetched non-empty string to empty string IS dirty', async () => {
    mock = mockRcmFetch([
      {
        method: 'GET',
        url: '/api/employee/42',
        handler: () => bareEntity({ id: '42', name: '김철수' }),
      },
    ]);
    const initialized = await createEmployeeForm().withId('42').initialize({});
    const form = initialized.entityForm;

    form.setValue('name', '');

    // Unlike create mode, update-mode dirty checking does not normalize '' —
    // it compares fetched ('김철수') against current ('') with plain equality,
    // so this IS dirty.
    expect(form.isDirtyField('name')).toBe(true);
  });

  it('create mode: setting the number 0 is NOT normalized away — IS dirty (unlike empty string)', () => {
    const form = createEmployeeForm();
    form.setValue('salary', 0);
    // 0 is falsy but normalizeEmptyValue() only special-cases '', null,
    // undefined and {} — the literal number 0 survives normalization and
    // compares unequal to the undefined default.
    expect(form.isDirtyField('salary')).toBe(true);
    expect(form.getField('salary')?.isDirty()).toBe(true);
  });

  it('create mode: setting an empty array against an unset default IS dirty', () => {
    const form = createEmployeeForm();
    // No array-typed field in the Employee fixture — isDirty()'s array/object
    // normalization is generic FormField logic, so we exercise it directly
    // through a scalar-typed field's setValue (the engine does not enforce
    // field-type/value-type coupling at this layer).
    form.setValue('name', []);
    // normalizeEmptyValue() explicitly excludes arrays from the "empty ⇒
    // undefined" collapse (`!Array.isArray(value)` guard), so `[]` is left
    // as-is and compared against the undefined default — unequal ⇒ dirty.
    // This is the asymmetric counterpart to the empty-string case above.
    expect(form.isDirtyField('name')).toBe(true);
  });

  it('update mode: an empty array unchanged from a fetched empty array is NOT dirty', async () => {
    mock = mockRcmFetch([
      { method: 'GET', url: '/api/employee/42', handler: () => bareEntity({ id: '42', name: [] }) },
    ]);
    const initialized = await createEmployeeForm().withId('42').initialize({});
    const form = initialized.entityForm;

    // fetched === current === [] (both empty arrays) — isEqualCollection([],[])
    // treats these as equal, so this is the "unchanged" baseline.
    expect(form.isDirtyField('name')).toBe(false);

    form.changeValue('name', ['a']);
    expect(form.isDirtyField('name')).toBe(true);

    form.changeValue('name', []);
    expect(form.isDirtyField('name')).toBe(false);
  });

  it('re-setting an unchanged value (no-op set) is NOT dirty, in both create and update mode', async () => {
    const createForm = createEmployeeForm();
    createForm.setValue('salary', 0);
    expect(createForm.isDirtyField('salary')).toBe(true);
    createForm.setValue('salary', 0); // setting the SAME value again
    expect(createForm.isDirtyField('salary')).toBe(true); // still dirty vs. the unset default — "unchanged" here means vs. its own current, which is a no-op

    mock = mockRcmFetch([
      {
        method: 'GET',
        url: '/api/employee/42',
        handler: () => bareEntity({ id: '42', salary: 5000 }),
      },
    ]);
    const initialized = await createEmployeeForm().withId('42').initialize({});
    const updateForm = initialized.entityForm;
    expect(updateForm.isDirtyField('salary')).toBe(false); // never touched after fetch
    updateForm.setValue('salary', 5000); // re-set to the SAME fetched value
    expect(updateForm.isDirtyField('salary')).toBe(false); // still equal to fetched ⇒ not dirty
  });

  it('a brand-new field that was never touched is NOT dirty (value is {}, not undefined — see addFields()/clone() note above)', () => {
    const form = createEmployeeForm();
    // fixtures.ts builds forms via addFields(), which internally clones each
    // field with includeValue defaulting to true — so even a field that was
    // never assigned a value ends up with value = {} rather than undefined.
    expect(form.getField('email')?.value).toEqual({});
    expect(form.isDirtyField('email')).toBe(false);
  });
});

// ============================================================================
// TAB SWITCH — createProjectForm() has a subcollection-only "tasks" tab.
// ============================================================================

describe('form-logic — tab navigation state (Project: default + tasks tabs)', () => {
  it('getTabs() lists both tabs sorted by order regardless of registration order', () => {
    const form = createProjectForm();

    // 'tasks' tab (order 10) was registered AFTER 'default' (DEFAULT_TAB_INFO,
    // order 1) — getTabs() sorts by .order, not insertion order.
    expect(form.getTabs().map((t) => t.id)).toEqual(['default', 'tasks']);
    expect(form.hasTab('tasks')).toBe(true);
    expect(form.hasTab('default')).toBe(true);
  });

  it('create mode: the subcollection-only "tasks" tab is NOT viewable (subcollections require update mode)', async () => {
    const form = createProjectForm();
    expect(form.getRenderType()).toBe('create');

    const viewableTabs = await form.getViewableTabs();

    // Surprise: a tab whose only content is a SubCollectionField is entirely
    // excluded from getViewableTabs() in create mode — the engine's own
    // comment says "SubCollection 은 update 시점에만 설정할 수 있다" (subcollections
    // can only be set at update time), enforced inside isViewableFieldGroup().
    expect(viewableTabs.map((t) => t.id)).toEqual(['default']);
  });

  it('update mode (id present): the "tasks" tab becomes viewable', async () => {
    const form = createProjectForm().withId('99');
    expect(form.getRenderType()).toBe('update');

    const viewableTabs = await form.getViewableTabs();

    expect(viewableTabs.map((t) => t.id)).toEqual(['default', 'tasks']);
  });

  it('getTabFields("tasks") is empty — subcollections live in .collections, not .fields', () => {
    const form = createProjectForm();

    // The tasks tab's only content is the `tasks` TableSubCollectionField,
    // which addFields() routes into `this.collections`, NOT `this.fields` —
    // getTabFields() only walks FormField entries, so it reports empty even
    // though the tab is real and has a registered field group.
    expect(form.getTabFields('tasks')).toEqual([]);
    expect(form.getCollection('tasks')).toBeDefined();
    expect(form.getCollection('tasks')?.getName()).toBe('tasks');
  });
});
