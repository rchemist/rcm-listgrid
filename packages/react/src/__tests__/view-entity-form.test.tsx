// ViewEntityForm — JSDOM render test (task item 7). "Mini-College": two
// required StringFields + one defaulted BooleanField, driven through the real
// provider stack (UIProvider → AuthProvider → FormStoreProvider →
// ViewEntityForm) with @listgrid/ui-default's unstyled primitives — proving
// the renderer layer (registry dispatch, store subscription, validate-then-
// save) end to end without any host app.

import { useEffect, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BooleanField, EntityForm, StringField, type FormRuntime } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents, type TextInputProps, type UIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

// egov-cms deliberately commits string drafts on blur. Keep that host
// contract in the release audit instead of weakening the regression test to
// ui-default's per-keystroke primitive.
function BlurCommitTextInput({
  value,
  onChange,
  placeholder,
  type,
  readOnly,
  disabled,
  id,
  ariaLabel,
  required,
  invalid,
  describedBy,
}: TextInputProps) {
  const [draft, setDraft] = useState(value ?? '');
  useEffect(() => setDraft(value ?? ''), [value]);
  return (
    <input
      type={type ?? 'text'}
      id={id}
      value={draft}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-required={required || undefined}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => onChange?.(draft)}
    />
  );
}

const blurCommitUI: UIComponents = {
  ...defaultUIComponents,
  TextInput: BlurCommitTextInput,
};

function collegeForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college').addFields({
    items: [
      new StringField('name', 100).withRequired(true).withLabel('Name'),
      new StringField('englishName', 110).withRequired(true).withLabel('English Name'),
      new BooleanField('active', 900).withLabel('Active').withDefaultValue(true),
    ],
  });
}

// No DateField class exists in schema-core yet (only the 'date' FieldType
// vocabulary entry) — the renderer dispatches purely on `field.type`
// (FieldRenderer.tsx:70), so a StringField's `.type` is overridden to 'date'
// as the minimal meta vehicle for this render test, without touching
// schema-core.
function collegeFormWithFoundedDate(): EntityForm {
  const foundedDate = new StringField('foundedDate', 200).withLabel('Founded Date');
  foundedDate.type = 'date';
  return new EntityForm('CollegeEntityForm', '/college').addFields({
    items: [new StringField('name', 100).withRequired(true).withLabel('Name'), foundedDate],
  });
}

function twoTabForm(): EntityForm {
  return new EntityForm('TwoTabEntityForm', '/two-tab')
    .addFields({
      items: [new StringField('name', 100).withLabel('Name')],
      tab: { id: 'main', label: 'Main', order: 0 },
    })
    .addFields({
      items: [new StringField('englishName', 110).withRequired(true).withLabel('English Name')],
      tab: { id: 'details', label: 'Details', order: 1 },
    });
}

function twoStepWizardForm(): EntityForm {
  return new EntityForm('TwoStepWizardForm', '/two-step-wizard')
    .addFields({
      items: [
        new StringField('name', 100).withRequired(true).withLabel('Name'),
        new StringField('englishName', 110).withRequired(true).withLabel('English Name'),
      ],
    })
    .withSteps([
      { id: 'identity', label: 'Identity', order: 0, fields: ['name'] },
      { id: 'details', label: 'Details', order: 1, fields: ['englishName'] },
    ]);
}

describe('ViewEntityForm (JSDOM render)', () => {
  it('renders inputs with labels, writes keystrokes to the store, validates required fields, and saves', async () => {
    const entityForm = collegeForm();
    const store = createFormStore(entityForm);
    const onSave = vi.fn();

    render(
      <UIProvider components={defaultUIComponents}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm entityForm={entityForm} store={store} onSave={onSave} />
          </FormStoreProvider>
        </AuthProvider>
      </UIProvider>,
    );

    // --- inputs render with labels ---
    const nameInput = await screen.findByLabelText(/^Name/);
    const englishNameInput = await screen.findByLabelText(/^English Name/);
    const activeInput = await screen.findByLabelText(/^Active/);
    expect(nameInput).toBeInTheDocument();
    expect(englishNameInput).toBeInTheDocument();
    expect(activeInput).toBeChecked(); // withDefaultValue(true)

    // --- typing updates the store ---
    fireEvent.change(nameInput, { target: { value: 'Engineering' } });
    expect(store.getState().getValue('name')).toBe('Engineering');

    // --- Save with englishName blank shows the required error ---
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    expect(await screen.findByText(/필수 값입니다/)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();

    // --- filling both required fields then Save calls onSave with toSaveData ---
    fireEvent.change(englishNameInput, { target: { value: 'College of Engineering' } });
    fireEvent.click(saveButton);

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Engineering',
        englishName: 'College of Engineering',
        active: true,
      }),
    );
  });

  it('renders a date field as a native date input and writes typed dates to the store', async () => {
    const entityForm = collegeFormWithFoundedDate();
    const store = createFormStore(entityForm);

    render(
      <UIProvider components={defaultUIComponents}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm entityForm={entityForm} store={store} onSave={vi.fn()} />
          </FormStoreProvider>
        </AuthProvider>
      </UIProvider>,
    );

    const dateInput = await screen.findByLabelText(/^Founded Date/);
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toHaveAttribute('type', 'date');

    fireEvent.change(dateInput, { target: { value: '2026-07-10' } });
    expect(store.getState().getValue('foundedDate')).toBe('2026-07-10');
  });

  it('renders a live collapsible error summary and scrolls/focuses the selected field', async () => {
    const entityForm = collegeForm();
    const store = createFormStore(entityForm);
    const scrollIntoView = vi.fn();
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    try {
      render(
        <UIProvider components={defaultUIComponents}>
          <AuthProvider session={undefined}>
            <FormStoreProvider store={store}>
              <ViewEntityForm entityForm={entityForm} store={store} onSave={vi.fn()} />
            </FormStoreProvider>
          </AuthProvider>
        </UIProvider>,
      );

      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      const summary = await waitFor(() => {
        const element = document.querySelector('[data-error-summary]');
        expect(element).not.toBeNull();
        return element as HTMLElement;
      });
      expect(summary).not.toHaveAttribute('data-expanded');
      expect(summary).toHaveClass('rcm-error-summary');
      expect(summary.querySelector('[data-error-summary-toggle]')).toHaveClass(
        'rcm-error-summary-toggle',
      );
      expect(summary.querySelector('[data-error-summary-title]')).toHaveClass(
        'rcm-error-summary-title',
      );
      expect(summary.querySelector('[data-error-summary-count]')).toHaveClass(
        'rcm-error-summary-count',
      );
      expect(summary.querySelector('[data-error-summary-title]')).toHaveTextContent(
        '작성하신 정보에 누락 또는 오류가 있습니다.',
      );
      expect(summary.querySelector('[data-error-summary-count]')).toHaveTextContent('2개 오류');
      expect(summary.querySelector('[data-error-summary-list]')).toBeNull();

      fireEvent.click(summary.querySelector('[data-error-summary-toggle]') as HTMLElement);
      expect(summary).toHaveAttribute('data-expanded', '');
      expect(summary.querySelector('[data-error-summary-title]')).toHaveTextContent(
        '누락(오류) 정보 목록을 확인해 주세요.',
      );
      expect(summary.querySelectorAll('[data-error-summary-item]')).toHaveLength(2);
      expect(summary.querySelector('[data-error-summary-list]')).toHaveClass(
        'rcm-error-summary-list',
      );
      expect(summary.querySelector('[data-error-summary-item]')).toHaveClass(
        'rcm-error-summary-item',
      );

      const englishItem = summary.querySelector(
        '[data-error-summary-item][data-field="englishName"]',
      ) as HTMLElement;
      expect(englishItem).toHaveTextContent('English Name: English Name는 필수 값입니다.');
      fireEvent.click(englishItem);
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
      expect(screen.getByLabelText(/^English Name/)).toHaveFocus();

      fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: 'Engineering' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() =>
        expect(summary.querySelector('[data-error-summary-count]')).toHaveTextContent('1개 오류'),
      );
      expect(
        summary.querySelector('[data-error-summary-item][data-field="name"]'),
      ).not.toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/^English Name/), {
        target: { value: 'College of Engineering' },
      });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() =>
        expect(document.querySelector('[data-error-summary]')).not.toBeInTheDocument(),
      );
    } finally {
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
        configurable: true,
        value: originalScrollIntoView,
      });
    }
  });

  it('live-decrements the error summary when a field is corrected through the store', async () => {
    const entityForm = collegeForm();
    const store = createFormStore(entityForm, { validateOnChange: { debounceMs: 0 } });

    render(
      <UIProvider components={defaultUIComponents}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm entityForm={entityForm} store={store} onSave={vi.fn()} />
          </FormStoreProvider>
        </AuthProvider>
      </UIProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    const summary = await waitFor(() => {
      const element = document.querySelector('[data-error-summary]');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    fireEvent.click(summary.querySelector('[data-error-summary-toggle]') as HTMLElement);
    expect(summary.querySelector('[data-error-summary-count]')).toHaveTextContent('2개 오류');

    act(() => store.getState().setValue('name', 'Engineering'));

    await waitFor(() =>
      expect(summary.querySelector('[data-error-summary-count]')).toHaveTextContent('1개 오류'),
    );
    expect(
      summary.querySelector('[data-error-summary-item][data-field="name"]'),
    ).not.toBeInTheDocument();
    expect(
      summary.querySelector('[data-error-summary-item][data-field="englishName"]'),
    ).toBeInTheDocument();
  });

  it('switches to an inactive tab before scrolling to an error-summary field', async () => {
    const entityForm = twoTabForm();
    const store = createFormStore(entityForm);
    const scrollIntoView = vi.fn();
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    try {
      render(
        <UIProvider components={defaultUIComponents}>
          <AuthProvider session={undefined}>
            <FormStoreProvider store={store}>
              <ViewEntityForm entityForm={entityForm} store={store} onSave={vi.fn()} />
            </FormStoreProvider>
          </AuthProvider>
        </UIProvider>,
      );

      expect(await screen.findByRole('tab', { name: 'Main' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.queryByLabelText(/^English Name/)).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      const summary = await waitFor(() => {
        const element = document.querySelector('[data-error-summary]');
        expect(element).not.toBeNull();
        return element as HTMLElement;
      });
      fireEvent.click(summary.querySelector('[data-error-summary-toggle]') as HTMLElement);
      fireEvent.click(
        summary.querySelector('[data-error-summary-item][data-field="englishName"]') as HTMLElement,
      );

      await waitFor(() =>
        expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute(
          'aria-selected',
          'true',
        ),
      );
      await waitFor(() =>
        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' }),
      );
    } finally {
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
        configurable: true,
        value: originalScrollIntoView,
      });
    }
  });

  it('switches wizard steps before scrolling to an error-summary field', async () => {
    const entityForm = twoStepWizardForm();
    const store = createFormStore(entityForm);
    const scrollIntoView = vi.fn();
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    try {
      render(
        <UIProvider components={defaultUIComponents}>
          <AuthProvider session={undefined}>
            <FormStoreProvider store={store}>
              <ViewEntityForm entityForm={entityForm} store={store} onSave={vi.fn()} />
            </FormStoreProvider>
          </AuthProvider>
        </UIProvider>,
      );

      await screen.findByLabelText(/^Name/);
      fireEvent.click(screen.getByRole('button', { name: '다음' }));
      await screen.findByLabelText(/^English Name/);
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() =>
        expect(document.querySelector('[data-step="identity"]')).toBeInTheDocument(),
      );
      expect(screen.queryByLabelText(/^English Name/)).not.toBeInTheDocument();

      const summary = document.querySelector('[data-error-summary]') as HTMLElement;
      expect(summary).not.toBeNull();
      fireEvent.click(summary.querySelector('[data-error-summary-toggle]') as HTMLElement);
      fireEvent.click(
        summary.querySelector('[data-error-summary-item][data-field="englishName"]') as HTMLElement,
      );

      await waitFor(() =>
        expect(document.querySelector('[data-step="details"]')).toBeInTheDocument(),
      );
      await waitFor(() =>
        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' }),
      );
      expect(screen.getByLabelText(/^English Name/)).toHaveFocus();
    } finally {
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
        configurable: true,
        value: originalScrollIntoView,
      });
    }
  });
});

// egov-cms #70 release audit. The 0.3.x engine cloned a whole EntityForm
// asynchronously for every blur commit, then rebuilt fields/actions around
// those snapshots. The 0.4 engine writes the zustand store synchronously and
// derives structure only from structureVersion. These tests pin all five old
// failure modes while preserving egov-cms's host-owned blur-commit primitive.
describe('ViewEntityForm egov-cms #70 regressions on the 0.4 store architecture', () => {
  function renderBlurCommitForm(
    entityForm: EntityForm,
    onSave = vi.fn(),
    controller?: FormRuntime,
  ) {
    const store = createFormStore(entityForm);
    render(
      <UIProvider components={blurCommitUI}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm
              entityForm={entityForm}
              store={store}
              onSave={onSave}
              {...(controller !== undefined ? { controller } : {})}
            />
          </FormStoreProvider>
        </AuthProvider>
      </UIProvider>,
    );
    return { store, onSave };
  }

  it('#70-1: a blur immediately followed by Save submits the committed draft', async () => {
    const entityForm = new EntityForm('TenantEntityForm', '/tenants').addFields({
      items: [new StringField('name', 1).withRequired(true).withLabel('Name')],
    });
    const { store, onSave } = renderBlurCommitForm(entityForm);
    const input = await screen.findByLabelText(/^Name/);

    fireEvent.change(input, { target: { value: 'Tenant Alpha' } });
    expect(store.getState().getValue('name')).toBeUndefined();
    fireEvent.blur(input);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Tenant Alpha' }));
  });

  it('#70-2/#70-5: consecutive blur commits preserve both fields without an async commit queue', async () => {
    const entityForm = new EntityForm('TenantEntityForm', '/tenants').addFields({
      items: [
        new StringField('name', 1).withRequired(true).withLabel('Name'),
        new StringField('code', 2).withRequired(true).withLabel('Code'),
      ],
    });
    const { store, onSave } = renderBlurCommitForm(entityForm);
    const name = await screen.findByLabelText(/^Name/);
    const code = await screen.findByLabelText(/^Code/);

    fireEvent.change(name, { target: { value: 'Tenant Alpha' } });
    fireEvent.blur(name);
    fireEvent.change(code, { target: { value: 'TENANT_ALPHA' } });
    fireEvent.blur(code);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(store.getState().getValue('name')).toBe('Tenant Alpha');
    expect(store.getState().getValue('code')).toBe('TENANT_ALPHA');
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Tenant Alpha', code: 'TENANT_ALPHA' }),
    );
  });

  it('#70-3: action order and button node identity stay stable across rapid value commits', async () => {
    const entityForm = new EntityForm('TenantEntityForm', '/tenants')
      .addFields({ items: [new StringField('name', 1).withLabel('Name')] })
      .addAction({ id: 'first', label: 'First action', order: 10, run: vi.fn() })
      .addAction({ id: 'second', label: 'Second action', order: 20, run: vi.fn() });
    const controller: FormRuntime = {
      save: vi.fn(async () => ({ ok: true, result: {} })),
      delete: vi.fn(async () => ({ ok: true, result: undefined })),
      reload: vi.fn(async () => {}),
      validate: vi.fn(async () => true),
    };
    const { store } = renderBlurCommitForm(entityForm, vi.fn(), controller);
    await screen.findByLabelText(/^Name/);
    const first = screen.getByRole('button', { name: 'First action' });
    const second = screen.getByRole('button', { name: 'Second action' });

    store.getState().setValue('name', 'one');
    store.getState().setValue('name', 'two');
    store.getState().setValue('name', 'three');

    expect(screen.getByRole('button', { name: 'First action' })).toBe(first);
    expect(screen.getByRole('button', { name: 'Second action' })).toBe(second);
    expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
  });

  it('#70-4: a value commit does not remount the focused field subtree', async () => {
    const entityForm = new EntityForm('TenantEntityForm', '/tenants').addFields({
      items: [
        new StringField('name', 1).withLabel('Name'),
        new StringField('code', 2).withLabel('Code'),
      ],
    });
    const { store } = renderBlurCommitForm(entityForm);
    const code = await screen.findByLabelText(/^Code/);
    code.focus();
    expect(code).toHaveFocus();

    store.getState().setValue('name', 'Tenant Alpha');

    expect(screen.getByLabelText(/^Code/)).toBe(code);
    expect(code).toHaveFocus();
  });

  it('#70-5 validation path: failed Save preserves the committed input value', async () => {
    const entityForm = new EntityForm('TenantEntityForm', '/tenants').addFields({
      items: [
        new StringField('name', 1).withRequired(true).withLabel('Name'),
        new StringField('code', 2).withRequired(true).withLabel('Code'),
      ],
    });
    const { store, onSave } = renderBlurCommitForm(entityForm);
    const name = await screen.findByLabelText(/^Name/);

    fireEvent.change(name, { target: { value: 'Tenant Alpha' } });
    fireEvent.blur(name);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/필수 값입니다/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Name/)).toHaveValue('Tenant Alpha');
    expect(store.getState().getValue('name')).toBe('Tenant Alpha');
    expect(onSave).not.toHaveBeenCalled();
  });
});

// CAP-06 (spec §3.4/§6.2; W3-2) — Save-button visibility derived from the
// declared create/update capability (sync approximation, getStaticConditionalBoolean).
describe('ViewEntityForm Save-button capability gating (CAP-06; W3-2)', () => {
  it('withCapabilities({ create: false }) in create mode: the Save button is not rendered', async () => {
    const entityForm = new EntityForm('WidgetEntityForm', '/widget')
      .withCapabilities({ create: false })
      .addFields({ items: [new StringField('name', 1).withLabel('Name')] });
    const store = createFormStore(entityForm);

    render(
      <UIProvider components={defaultUIComponents}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm entityForm={entityForm} store={store} onSave={vi.fn()} />
          </FormStoreProvider>
        </AuthProvider>
      </UIProvider>,
    );

    await screen.findByLabelText(/^Name/);
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  it('no capabilities declared (default): the Save button renders', async () => {
    const entityForm = new EntityForm('WidgetEntityForm', '/widget').addFields({
      items: [new StringField('name', 1).withLabel('Name')],
    });
    const store = createFormStore(entityForm);

    render(
      <UIProvider components={defaultUIComponents}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm entityForm={entityForm} store={store} onSave={vi.fn()} />
          </FormStoreProvider>
        </AuthProvider>
      </UIProvider>,
    );

    await screen.findByLabelText(/^Name/);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });
});

// spec §3.1 / W4-1 — the default (no slots.title) heading renders
// entityForm.getTitle(values), reading the STORE's live field values (not
// just the declared `text`) — proves the ViewEntityForm wiring, not just
// EntityForm.getTitle in isolation (that's covered by
// @listgrid/schema-core/src/__tests__/entity-form-title.test.ts).
describe('ViewEntityForm default title — wired to EntityForm.getTitle (spec §3.1; W4-1)', () => {
  it('withTitle({fromField}) resolves from the live store value, not just the declared text', async () => {
    const entityForm = new EntityForm('WidgetEntityForm', '/widget')
      .withTitle({ fromField: 'name' })
      .addFields({ items: [new StringField('name', 1).withLabel('Name')] });
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Acme Corp');

    render(
      <UIProvider components={defaultUIComponents}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm entityForm={entityForm} store={store} onSave={vi.fn()} />
          </FormStoreProvider>
        </AuthProvider>
      </UIProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Acme Corp' })).toBeInTheDocument();
  });
});
