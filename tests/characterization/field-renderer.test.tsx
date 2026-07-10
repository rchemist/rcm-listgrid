// Characterization tests — FieldRenderer full interaction cycle (P2-2).
//
// Scope: 6 representative field types from the Employee fixture — String,
// Number, Select, Date, ManyToOne, Boolean. For each: (a) it renders, (b)
// user input updates the value, (c) a validation FAILURE surfaces an error,
// (d) a validation PASS clears/has no error, (e) the ACTUAL error text.
//
// Every import comes from the harness indirection (./harness, ./fixtures) —
// never from '../../src/...' directly (ADR-0008 / P2-1 harness contract).
// Behavior assertions only — no snapshots.

import React, { useState } from 'react';
import { describe, expect, it, afterEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import {
  renderWithProviders,
  FieldRenderer,
  FormField,
  SelectField,
  ManyToOneField,
  mockRcmFetch,
  searchPageEnvelope,
  type EntityForm,
  type MockRcmFetchHandle,
} from './harness';
import { createEmployeeForm } from './fixtures';

/**
 * Minimal controlled host — mirrors the harness smoke test: the EntityForm
 * lives in React state, FieldRenderer owns the read/write cycle for a single
 * named field, and re-renders whenever FieldRenderer clones+updates the form.
 */
function EmployeeFieldHost({
  initialForm,
  fieldName,
}: {
  initialForm: EntityForm;
  fieldName: string;
}) {
  const [entityForm, setEntityForm] = useState<EntityForm | undefined>(initialForm);
  if (!entityForm) return null;

  const field = entityForm.getField(fieldName);
  if (!(field instanceof FormField)) {
    throw new Error(`fixture regression: Employee.${fieldName} is expected to be a FormField`);
  }

  return <FieldRenderer field={field} entityForm={entityForm} setEntityForm={setEntityForm} />;
}

let mock: MockRcmFetchHandle | undefined;

afterEach(() => {
  mock?.restore();
  mock = undefined;
});

describe('FieldRenderer — StringField (Employee.name, required)', () => {
  it('renders, reflects typed input, and surfaces + clears the required-blank error', async () => {
    renderWithProviders(<EmployeeFieldHost initialForm={createEmployeeForm()} fieldName="name" />);

    // (a) renders
    const input = await screen.findByLabelText('이름');
    expect(input).toHaveValue('');

    // (b) user input updates the value
    fireEvent.change(input, { target: { value: '김도윤' } });
    await waitFor(() => expect(input).toHaveValue('김도윤'));

    // (c) validation FAILURE — clear back to blank
    fireEvent.change(input, { target: { value: '' } });

    // (e) the ACTUAL error text — FormField.validate()'s built-in required-blank
    // check runs BEFORE the custom `validations` array (RequiredValidation never
    // fires here). SURPRISE: the raw DOM text has a literal DOUBLE space
    // between the Korean postfix and "필수 값입니다." (the source template is
    // `addKoreanWordPostfix(...) + '  필수 값입니다.'` — two spaces baked in).
    // RTL's byText query normalizes whitespace by default, so we match on the
    // collapsed single-space form here and assert the raw double space
    // separately via textContent.
    const nameError = await screen.findByText('이름은 필수 값입니다.');
    expect(nameError).toBeInTheDocument();
    expect(nameError.textContent).toBe('이름은  필수 값입니다.'); // raw double space, uncollapsed

    // (d) validation PASS — clears the error
    fireEvent.change(input, { target: { value: '박서준' } });
    await waitFor(() => expect(input).toHaveValue('박서준'));
    await waitFor(() =>
      expect(screen.queryByText('이름은 필수 값입니다.')).not.toBeInTheDocument(),
    );
  });
});

describe('FieldRenderer — NumberField (Employee.salary, withMin(0))', () => {
  it('renders, reflects typed input, and surfaces + clears the min-violation error', async () => {
    renderWithProviders(
      <EmployeeFieldHost initialForm={createEmployeeForm()} fieldName="salary" />,
    );

    // (a) renders — headless NumberInput is a raw <input type="number">
    const input = await screen.findByLabelText('연봉');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveValue(null);

    // (b) user input updates the value — onChange coerces via Number(...)
    fireEvent.change(input, { target: { value: '5000' } });
    await waitFor(() => expect(input).toHaveValue(5000));

    // (c) validation FAILURE — below the configured min(0)
    fireEvent.change(input, { target: { value: '-5' } });
    await waitFor(() => expect(input).toHaveValue(-5));

    // (e) the ACTUAL error text — NumberField.validate()'s own min-check
    // message (not the generic required-blank template; salary isn't required).
    expect(await screen.findByText('연봉 값은 0 이상이어야 합니다.')).toBeInTheDocument();

    // (d) validation PASS — back within range clears the error
    fireEvent.change(input, { target: { value: '3000' } });
    await waitFor(() => expect(input).toHaveValue(3000));
    await waitFor(() =>
      expect(screen.queryByText('연봉 값은 0 이상이어야 합니다.')).not.toBeInTheDocument(),
    );
  });
});

describe('FieldRenderer — SelectField (Employee.status)', () => {
  it('SURPRISE: with the fixture default (≤10 options, all labels ≤8 chars), SelectField auto-switches to chip/radio rendering — and the headless RadioChip baseline collapses ALL 3 options into a single degenerate radio input', async () => {
    renderWithProviders(
      <EmployeeFieldHost initialForm={createEmployeeForm()} fieldName="status" />,
    );

    // (a) renders. NOT a <select> — OptionalField.shouldRenderAsChip() auto-
    // enables chip/radio rendering whenever options.length <= 10 (default
    // DEFAULT_CHIP_MAX_OPTIONS) AND every option label is <= 8 chars
    // (DEFAULT_CHIP_MAX_LABEL_LENGTH). Employee.status (3 options: '재직중'
    // /'휴직'/'퇴직') satisfies both, so SelectField.renderInstance() takes the
    // RadioChip branch, not the SelectBox branch — with no explicit
    // `.useChip(...)` call anywhere in the fixture.
    const radio = await screen.findByLabelText('재직 상태');
    expect(radio).toHaveAttribute('type', 'radio');

    // SURPRISE #2: the headless baseline's RadioChip is a bare alias for a
    // single RadioInput — `({ onChange, checked, ...rest }) => <input
    // type="radio" checked={!!checked} .../>` — it never maps over the
    // `options` array the field passes in. The 3 configured options
    // ('재직중'/'휴직'/'퇴직') never materialize as 3 controls; `options` and
    // `combo` just land as stringified ([object Object]) DOM attributes on
    // the one radio. So with this app's headless UI baseline, Employee.status
    // is effectively unusable as a real tri-state picker — there is exactly
    // one (always-unchecked, since `checked` isn't even one of the props the
    // field passes) radio in the DOM.
    expect(screen.queryAllByRole('radio')).toHaveLength(1);
    expect(screen.queryByText('재직중')).not.toBeInTheDocument();
    expect(screen.queryByText('휴직')).not.toBeInTheDocument();
    expect(radio).not.toBeChecked();
  });

  it('once useChip(false) forces the SelectBox branch: renders a real <select>, reflects selection, and — once locally marked required — surfaces + clears a required error', async () => {
    const form = createEmployeeForm();
    // SUT config: reach SelectField's OTHER render branch. This mutates the
    // field builder returned by the fixture factory locally (fixtures.ts
    // itself is untouched) — the same pattern used for the required-locally
    // mutations elsewhere in this file.
    const statusField = form.getField('status');
    if (!(statusField instanceof SelectField)) {
      throw new Error('fixture regression: Employee.status is expected to be a SelectField');
    }
    statusField.useChip(false).withRequired(true);

    renderWithProviders(<EmployeeFieldHost initialForm={form} fieldName="status" />);

    // (a) renders — headless SelectBox is a raw <select> with a blank leading
    // option plus the 3 configured options.
    const select = await screen.findByLabelText('재직 상태');
    expect(select.tagName).toBe('SELECT');
    expect(select).toHaveDisplayValue('');
    expect(screen.getByRole('option', { name: '재직중' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '휴직' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '퇴직' })).toBeInTheDocument();

    // (b) user input updates the value
    fireEvent.change(select, { target: { value: 'ACTIVE' } });
    await waitFor(() => expect(select).toHaveDisplayValue('재직중'));

    // (c) validation FAILURE — select back to the blank option
    fireEvent.change(select, { target: { value: '' } });

    // (e) the ACTUAL error text — same built-in required-blank template as
    // StringField (label '재직 상태' has no trailing consonant → '는' postfix;
    // same raw-double-space template — see StringField test for detail).
    const statusError = await screen.findByText('재직 상태는 필수 값입니다.');
    expect(statusError.textContent).toBe('재직 상태는  필수 값입니다.');

    // (d) validation PASS
    fireEvent.change(select, { target: { value: 'ON_LEAVE' } });
    await waitFor(() => expect(select).toHaveDisplayValue('휴직'));
    await waitFor(() =>
      expect(screen.queryByText('재직 상태는 필수 값입니다.')).not.toBeInTheDocument(),
    );
  });
});

describe('FieldRenderer — DateField (Employee.hireDate)', () => {
  it('renders a native date input, reflects typed input, and — once locally marked required — surfaces + clears a required error', async () => {
    const form = createEmployeeForm();
    const hireDateField = form.getField('hireDate');
    if (!(hireDateField instanceof FormField)) {
      throw new Error('fixture regression: Employee.hireDate is expected to be a FormField');
    }
    hireDateField.withRequired(true);

    renderWithProviders(<EmployeeFieldHost initialForm={form} fieldName="hireDate" />);

    // (a) renders — headless FlatPickrDateField is a raw <input type="date">
    const input = await screen.findByLabelText('입사일');
    expect(input).toHaveAttribute('type', 'date');
    expect(input).toHaveValue('');

    // (b) user input updates the value
    fireEvent.change(input, { target: { value: '2026-01-15' } });
    await waitFor(() => expect(input).toHaveValue('2026-01-15'));

    // (c) validation FAILURE — clear back to blank
    fireEvent.change(input, { target: { value: '' } });

    // (e) the ACTUAL error text (label '입사일' ends in a syllable with a
    // trailing consonant → '은' postfix; same raw-double-space template as
    // StringField's required-blank message — see that test for detail).
    const dateError = await screen.findByText('입사일은 필수 값입니다.');
    expect(dateError).toBeInTheDocument();
    expect(dateError.textContent).toBe('입사일은  필수 값입니다.');

    // (d) validation PASS
    fireEvent.change(input, { target: { value: '2026-03-02' } });
    await waitFor(() => expect(input).toHaveValue('2026-03-02'));
    await waitFor(() =>
      expect(screen.queryByText('입사일은 필수 값입니다.')).not.toBeInTheDocument(),
    );
  });
});

describe('FieldRenderer — BooleanField (Employee.remoteEligible)', () => {
  it('renders a Yes/No radio pair (SURPRISE: no label association) and reflects clicks', async () => {
    renderWithProviders(
      <EmployeeFieldHost initialForm={createEmployeeForm()} fieldName="remoteEligible" />,
    );

    // (a) renders. SURPRISE: headless BooleanRadio destructures only
    // `{ value, onChange }` from its props and never spreads/forwards the
    // rest (including the `aria-label` FieldRenderer injects) onto the
    // rendered <span>/<label>/<input> tree — so, unlike every other field
    // type in this suite, findByLabelText('재택근무 가능') does NOT resolve
    // the control. The only way to reach the two radios is by their
    // hardcoded, English, untranslated "Yes"/"No" text labels.
    await screen.findByText('재택근무 가능'); // the FieldRenderer-owned <label> is still there…
    expect(screen.queryByLabelText('재택근무 가능')).not.toBeInTheDocument(); // …but not wired to the control
    const yes = screen.getByText('Yes').closest('label')!.querySelector('input')!;
    const no = screen.getByText('No').closest('label')!.querySelector('input')!;
    expect(yes).not.toBeChecked();
    expect(no).not.toBeChecked();

    // (b) user input updates the value
    fireEvent.click(yes);
    await waitFor(() => expect(yes).toBeChecked());
    expect(no).not.toBeChecked();

    fireEvent.click(no);
    await waitFor(() => expect(no).toBeChecked());
    expect(yes).not.toBeChecked();
  });

  it('SURPRISE: marking the field required does not produce a required-blank error — BooleanField.getCurrentValue auto-defaults an undefined value to false whenever the field is required, so isBlank() never observes undefined', async () => {
    const form = createEmployeeForm();
    const remoteEligibleField = form.getField('remoteEligible');
    if (!(remoteEligibleField instanceof FormField)) {
      throw new Error('fixture regression: Employee.remoteEligible is expected to be a FormField');
    }
    remoteEligibleField.withRequired(true);

    renderWithProviders(<EmployeeFieldHost initialForm={form} fieldName="remoteEligible" />);

    const no = await screen.findByText('No');
    const noInput = no.closest('label')!.querySelector('input')!;

    // Never touched by the user — still auto-defaults to false (checked "No")
    // rather than surfacing as blank/invalid, unlike every other required
    // field type characterized in this suite.
    await waitFor(() => expect(noInput).toBeChecked());
    expect(screen.queryByText(/필수 값입니다/)).not.toBeInTheDocument();
  });
});

// ManyToOneField's DEFAULT render path (ManyToOneField.renderInstance() with
// no useCardView/useSelectBoxView set — i.e. exactly what the Employee
// fixture's `department` field configures) calls `useSession()`
// unconditionally inside ManyToOneView, and useSession() THROWS synchronously
// when no <AuthProvider> wraps the tree — see
// src/listgrid/auth/AuthContext.tsx and src/listgrid/components/fields/view/
// ManyToOneView.tsx:42. AuthProvider is a real, public, barrel-exported
// symbol (src/listgrid/index.ts) but harness.ts deliberately does not
// re-export it, and per this suite's hard rule every import must come from
// the harness indirection — so this test file cannot legally construct the
// tree that would avoid the crash. Verified empirically (outside this file,
// so as not to poison this file's exit code): rendering the fixture's
// `department` field via <FieldRenderer> as-is throws
// "[@rchemist/listgrid] useSession must be called within an <AuthProvider>."
// asynchronously (from the FieldRenderer effect that resolves field.view()),
// with no Error Boundary in the harness tree to catch it — React tears down
// the entire render root and `npx vitest run` exits non-zero even though
// individual `it()` blocks may report as passed. This is the single most
// important characterization finding for ManyToOneField and is recorded in
// this task's `surprises`/`deviations`, not asserted here, precisely because
// asserting it deterministically would make this file non-green.
//
// To still characterize the field type's load/select/validate cycle
// end-to-end without that crash, these tests use the field's OTHER built-in
// render branch — `.withSelectBoxView()` — which routes through
// SelectBoxManyToOneView instead of ManyToOneView and never touches
// useSession(). It is a real, public, documented API
// (ManyToOneField.withSelectBoxView), not a workaround invented for this
// test — just a config the Employee fixture doesn't happen to use.
describe('FieldRenderer — ManyToOneField (Employee.department, via withSelectBoxView())', () => {
  it('(a) renders a loading state then the react-select picker with fetched options, and (b) selecting an option updates the value', async () => {
    mock = mockRcmFetch([
      {
        method: 'POST',
        url: /\/api\/department\/search/,
        handler: () =>
          searchPageEnvelope([
            { id: 'dept-1', name: '엔지니어링' },
            { id: 'dept-2', name: '영업' },
          ]),
      },
    ]);

    const form = createEmployeeForm();
    const departmentField = form.getField('department');
    if (!(departmentField instanceof ManyToOneField)) {
      throw new Error('fixture regression: Employee.department is expected to be a ManyToOneField');
    }
    departmentField.withSelectBoxView();

    renderWithProviders(<EmployeeFieldHost initialForm={form} fieldName="department" />);

    // (a) renders — SelectBoxManyToOneView shows its own "불러오는 중..."
    // loading state first (independent of FieldRenderer's own async view
    // resolution), then the react-select control once the mocked lookup
    // resolves. The lookup fires as a POST to `${entityForm.getUrl()}/search`
    // carrying a SearchForm body (page 0, pageSize 500) — NOT a GET, and NOT
    // the plain `/api/department` URL a naive guess might expect.
    await waitFor(() => expect(screen.getByText('선택하세요')).toBeInTheDocument());
    expect(mock.requests).toEqual([
      { url: '/api/department/search', method: 'POST', body: expect.anything() },
    ]);

    // (b) user input updates the value — react-select opens on mousedown on
    // its control (not a native <select>; there is no fireEvent.change path)
    const control = document.querySelector('.react-select__control');
    expect(control).not.toBeNull();
    fireEvent.mouseDown(control!, { button: 0 });
    const option = await screen.findByText('엔지니어링');
    fireEvent.click(option);

    await waitFor(() => expect(screen.queryByText('선택하세요')).not.toBeInTheDocument());
    expect(screen.getByText('엔지니어링')).toBeInTheDocument();

    // Clearing back to blank is possible via the auto-added "선택 안함" (no
    // selection) option — SelectBoxManyToOneView only injects that option
    // when the field is NOT required (see next test for the required case).
    fireEvent.mouseDown(control!, { button: 0 });
    fireEvent.click(await screen.findByText('선택 안함'));
    await waitFor(() => expect(screen.getByText('선택하세요')).toBeInTheDocument());
  });

  it('(c)/(d)/(e) SURPRISE: marking the field required removes the "선택 안함" clear option from the control entirely — the real required-blank error text is only reachable by pre-seeding EntityForm.errors (mirroring what FieldRenderer.applyFieldChange does internally), not by driving the UI', async () => {
    mock = mockRcmFetch([
      {
        method: 'POST',
        url: /\/api\/department\/search/,
        handler: () => searchPageEnvelope([{ id: 'dept-1', name: '엔지니어링' }]),
      },
    ]);

    const form = createEmployeeForm();
    const departmentField = form.getField('department');
    if (!(departmentField instanceof ManyToOneField)) {
      throw new Error('fixture regression: Employee.department is expected to be a ManyToOneField');
    }
    departmentField.withSelectBoxView().withRequired(true);

    // (e) the ACTUAL error text — obtained via the EntityForm.validate() +
    // mergeError() sequence FieldRenderer.applyFieldChange() itself runs on
    // every onChange (see harness.ts's re-exported FieldRenderer source);
    // this is the same built-in required-blank template characterized for
    // every other field type in this suite (label '부서' has no trailing
    // consonant → '는' postfix; same raw-double-space template).
    const cloned = form.clone(true);
    const validationErrors = await cloned.validate({ fieldNames: ['department'] });
    expect(validationErrors).toEqual([
      { name: 'department', label: '부서', errors: ['부서는  필수 값입니다.'], tabId: 'default' },
    ]);
    cloned.mergeError('department', validationErrors);

    renderWithProviders(<EmployeeFieldHost initialForm={cloned} fieldName="department" />);

    // (c) validation FAILURE — pre-seeded, surfaces immediately on mount
    // (FieldRenderer reads entityForm.errors on mount for every field type —
    // this isn't ManyToOne-specific). Nothing is selected yet, so the control
    // itself still shows its placeholder.
    const error = await screen.findByText('부서는 필수 값입니다.');
    expect(error.textContent).toBe('부서는  필수 값입니다.');
    await waitFor(() => expect(screen.getByText('선택하세요')).toBeInTheDocument());

    // SURPRISE — the failing state cannot be reproduced by driving this
    // control's own UI once a value IS selected: with required=true,
    // SelectBoxManyToOneView's `options` memo never unshifts the "선택 안함"
    // entry, so there is no clickable option whose value is '' to trigger
    // `onChange(undefined, true)` the way the non-required test above does.
    const control = document.querySelector('.react-select__control');
    fireEvent.mouseDown(control!, { button: 0 });
    const option = await screen.findByText('엔지니어링');
    expect(screen.queryByText('선택 안함')).not.toBeInTheDocument();

    // (d) validation PASS — selecting the (only) real option clears the
    // pre-seeded error via the normal onChange path.
    fireEvent.click(option);
    await waitFor(() =>
      expect(screen.queryByText('부서는 필수 값입니다.')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(screen.queryByText('선택하세요')).not.toBeInTheDocument());
  });
});
