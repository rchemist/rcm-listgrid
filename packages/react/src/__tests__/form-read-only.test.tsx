// W3-5 (spec §3.1/§6.1, CAP-27) — EntityForm.withReadOnly() → store
// formReadOnly seed → (a) FieldRenderer ORs formReadOnly into every field's
// effective readOnly regardless of the field's own declared/meta readOnly
// (b) that propagates automatically into the ManyToOne picker (no M2O
// renderer change — it already respects the `readOnly` prop) (c) the
// built-in Save affordance is hidden — Delete stays capability-governed,
// unaffected by formReadOnly (spec §6.1 names Save only). Driven through the
// real provider stack, same harness as field-meta-reactive.test.tsx /
// form-actions.test.tsx. The absence of a save/delete hard-gate is proven
// separately in @listgrid/state's form-controller.test.ts (controller layer,
// not this view/render layer).

import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import {
  EntityForm,
  ManyToOneField,
  StringField,
  type BackendAdapter,
  type FormRuntime,
} from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { AdapterProvider } from '../providers/adapter';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

/** Minimal FormRuntime double (same shape as form-actions.test.tsx's fakeController). */
function fakeController(overrides: Partial<FormRuntime> = {}): FormRuntime {
  return {
    save: vi.fn(async () => ({ ok: true, result: {} })),
    delete: vi.fn(async () => ({ ok: true, result: undefined })),
    reload: vi.fn(async () => {}),
    validate: vi.fn(async () => true),
    ...overrides,
  };
}

/** Minimal BackendAdapter double — ManyToOneRenderer calls useAdapter() unconditionally at mount, even when the picker is never opened. */
function fakeAdapter(): BackendAdapter {
  return {
    list: vi.fn(async () => ({ content: [], totalElements: 0, totalPages: 0 })),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

function professorForm(): EntityForm {
  return new EntityForm('ProfessorEntityForm', '/professor').addFields({
    items: [new StringField('name', 1).withRequired(true).withLabel('Name')],
  });
}

// 'name' is NOT declared readOnly — isolating the formReadOnly OR from any
// field-level declared/meta readOnly. 'dean' is a ManyToOne so the picker
// 찾기 button's absence proves the M2O propagation-is-automatic decision.
function widgetForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [
      new StringField('name', 1).withLabel('Name'),
      new ManyToOneField('dean', 2, { entityForm: () => professorForm() }).withLabel('Dean'),
    ],
  });
}

function renderForm(entityForm: EntityForm, opts: { controller?: FormRuntime } = {}) {
  const store = createFormStore(entityForm);
  render(
    <UIProvider components={defaultUIComponents}>
      <AdapterProvider adapter={fakeAdapter()}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm
              entityForm={entityForm}
              store={store}
              onSave={() => {}}
              {...(opts.controller !== undefined ? { controller: opts.controller } : {})}
            />
          </FormStoreProvider>
        </AuthProvider>
      </AdapterProvider>
    </UIProvider>,
  );
  return { store };
}

describe('FieldRenderer — formReadOnly OR (spec §3.1; W3-5)', () => {
  it('withReadOnly(true): a field that is NOT itself declared readOnly still renders readOnly', async () => {
    renderForm(widgetForm().withReadOnly(true));
    const nameInput = await screen.findByLabelText(/^Name/);
    await waitFor(() => expect(nameInput).toHaveAttribute('readonly'));
  });

  it('no withReadOnly declared: the field renders editable (control)', async () => {
    renderForm(widgetForm());
    const nameInput = await screen.findByLabelText(/^Name/);
    await waitFor(() => expect(nameInput).not.toHaveAttribute('readonly'));
  });

  it('M2O propagation: withReadOnly(true) hides the 찾기 picker button (no many-to-one-renderer change needed)', async () => {
    renderForm(widgetForm().withReadOnly(true));
    await screen.findByLabelText(/^Name/);
    expect(screen.queryByRole('button', { name: '찾기' })).not.toBeInTheDocument();
  });

  it('M2O control: without withReadOnly, the 찾기 picker button renders', async () => {
    renderForm(widgetForm());
    await screen.findByLabelText(/^Name/);
    expect(screen.getByRole('button', { name: '찾기' })).toBeInTheDocument();
  });
});

describe('ViewEntityForm — formReadOnly hides built-in Save only (spec §6.1; W3-5)', () => {
  it('withReadOnly(true): the built-in Save button is absent', async () => {
    renderForm(widgetForm().withReadOnly(true));
    await screen.findByLabelText(/^Name/);
    expect(screen.queryByRole('button', { name: /^Save$/ })).not.toBeInTheDocument();
  });

  it('control: without withReadOnly, the built-in Save button renders', async () => {
    renderForm(widgetForm());
    await screen.findByLabelText(/^Name/);
    expect(screen.getByRole('button', { name: /^Save$/ })).toBeInTheDocument();
  });

  it('withReadOnly(true) + update mode + controller + capability delete (default): Delete is UNAFFECTED (spec §6.1 — Save only) while Save is absent', async () => {
    renderForm(widgetForm().withId('7').withReadOnly(true), { controller: fakeController() });
    await screen.findByLabelText(/^Name/);
    expect(screen.queryByRole('button', { name: /^Save$/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Delete$/ })).toBeInTheDocument();
  });
});
