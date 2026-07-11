// ViewEntityForm action bar (spec §3.4/§7, CAP-09; W3-3) — addAction/
// getActions merge with the built-in Save/Delete (capability-derived),
// `replaces` slot takeover, visible/enabled resolution, and the fully custom
// `render` escape hatch. Also covers the Save rewire to `controller.save()`
// (W2-7 hand-off) and the controller-absent Needs-Review deviation (§설계
// 결정 6 — only the legacy built-in Save renders without a controller).
// Driven through the real provider stack (UIProvider → AuthProvider →
// ViewEntityForm's own FormStoreProvider), same harness as
// view-entity-form.test.tsx.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EntityForm, StringField, type FormRuntime } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

/** Minimal FormRuntime double — every method is a vi.fn(); tests override only what they exercise. */
function fakeController(overrides: Partial<FormRuntime> = {}): FormRuntime {
  return {
    save: vi.fn(async () => ({ ok: true, result: {} })),
    delete: vi.fn(async () => ({ ok: true, result: undefined })),
    reload: vi.fn(async () => {}),
    validate: vi.fn(async () => true),
    ...overrides,
  };
}

function WidgetForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [new StringField('name', 1).withLabel('Name')],
  });
}

function renderForm(
  entityForm: EntityForm,
  opts: { controller?: FormRuntime; onSave?: (data: Record<string, unknown>) => void } = {},
) {
  const store = createFormStore(entityForm);
  return render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <ViewEntityForm
          entityForm={entityForm}
          store={store}
          {...(opts.controller !== undefined ? { controller: opts.controller } : {})}
          {...(opts.onSave !== undefined ? { onSave: opts.onSave } : {})}
        />
      </AuthProvider>
    </UIProvider>,
  );
}

describe("ViewEntityForm action bar — replaces:'save' (spec §3.4; W3-3)", () => {
  it('a custom action with replaces:save takes over the built-in slot — the built-in Save button is absent, the custom one renders', async () => {
    const run = vi.fn();
    const entityForm = WidgetForm().addAction({
      id: 'save-custom',
      replaces: 'save',
      label: '커스텀저장',
      run,
    });
    renderForm(entityForm, { controller: fakeController() });

    await screen.findByLabelText(/^Name/);
    expect(screen.queryByRole('button', { name: /^Save$/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '커스텀저장' })).toBeInTheDocument();
  });

  it('clicking the replacing custom action calls its own run — not the built-in save path', async () => {
    const run = vi.fn();
    const entityForm = WidgetForm().addAction({
      id: 'save-custom',
      replaces: 'save',
      label: '커스텀저장',
      run,
    });
    renderForm(entityForm, { controller: fakeController() });

    await screen.findByLabelText(/^Name/);
    fireEvent.click(screen.getByRole('button', { name: '커스텀저장' }));
    await waitFor(() => expect(run).toHaveBeenCalledTimes(1));
  });
});

describe('ViewEntityForm action bar — visible/enabled resolution (spec §3.4; W3-3)', () => {
  it('visible:false suppresses a custom action; visible:true (control) renders it', async () => {
    const entityForm = WidgetForm()
      .addAction({ id: 'x', label: 'X', visible: false })
      .addAction({ id: 'y', label: 'Y', visible: true });
    renderForm(entityForm, { controller: fakeController() });

    await screen.findByLabelText(/^Name/);
    expect(screen.queryByRole('button', { name: 'X' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Y' })).toBeInTheDocument();
  });

  it('enabled:false disables the rendered button', async () => {
    const entityForm = WidgetForm().addAction({ id: 'z', label: 'Z', enabled: false });
    renderForm(entityForm, { controller: fakeController() });

    await screen.findByLabelText(/^Name/);
    expect(screen.getByRole('button', { name: 'Z' })).toBeDisabled();
  });
});

describe('ViewEntityForm action bar — render custom node (spec §3.4; W3-3)', () => {
  it('render renders the fully custom node instead of the default <Button>', async () => {
    const entityForm = WidgetForm().addAction({
      id: 'r',
      render: () => <span data-testid="custom">C</span>,
    });
    renderForm(entityForm, { controller: fakeController() });

    await screen.findByLabelText(/^Name/);
    const custom = await screen.findByTestId('custom');
    expect(custom).toBeInTheDocument();
    expect(custom.closest('button')).toBeNull();
  });
});

describe('ViewEntityForm built-in Delete — update-mode-only (spec §3.4 §설계 결정 1; W3-3)', () => {
  it('update mode + capability delete (default) + controller: the Delete button renders', async () => {
    const entityForm = WidgetForm().withId('7');
    renderForm(entityForm, { controller: fakeController() });

    await screen.findByLabelText(/^Name/);
    expect(screen.getByRole('button', { name: /^Delete$/ })).toBeInTheDocument();
  });

  it('create mode: the Delete button is absent even with a controller', async () => {
    const entityForm = WidgetForm();
    renderForm(entityForm, { controller: fakeController() });

    await screen.findByLabelText(/^Name/);
    expect(screen.queryByRole('button', { name: /^Delete$/ })).not.toBeInTheDocument();
  });

  it('clicking Delete calls controller.delete()', async () => {
    const controller = fakeController();
    const entityForm = WidgetForm().withId('7');
    renderForm(entityForm, { controller });

    await screen.findByLabelText(/^Name/);
    fireEvent.click(screen.getByRole('button', { name: /^Delete$/ }));
    await waitFor(() => expect(controller.delete).toHaveBeenCalledTimes(1));
  });
});

describe('ViewEntityForm built-in Save rewire — controller.save (spec §3.4 §설계 결정 2; W3-3)', () => {
  it('clicking Save calls controller.save(); on success, onSave is called with the post-save snapshot', async () => {
    const controller = fakeController();
    const onSave = vi.fn();
    const entityForm = WidgetForm();
    renderForm(entityForm, { controller, onSave });

    const nameInput = await screen.findByLabelText(/^Name/);
    fireEvent.change(nameInput, { target: { value: 'Widget A' } });
    fireEvent.click(screen.getByRole('button', { name: /^Save$/ }));

    await waitFor(() => expect(controller.save).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Widget A' }));
  });

  it('controller.save resolving ok:false (validation failure): onSave is NOT called (single validate — no double-validate)', async () => {
    const controller = fakeController({ save: vi.fn(async () => ({ ok: false })) });
    const onSave = vi.fn();
    const entityForm = WidgetForm();
    renderForm(entityForm, { controller, onSave });

    await screen.findByLabelText(/^Name/);
    fireEvent.click(screen.getByRole('button', { name: /^Save$/ }));

    await waitFor(() => expect(controller.save).toHaveBeenCalledTimes(1));
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe('ViewEntityForm action bar — controller-absent (spec §3.4 §설계 결정 6 / Needs-Review; W3-3)', () => {
  it('without a controller, only the legacy built-in Save renders — custom actions and Delete are omitted', async () => {
    const entityForm = WidgetForm().withId('7').addAction({ id: 'custom', label: 'Custom' });
    renderForm(entityForm); // no controller

    await screen.findByLabelText(/^Name/);
    expect(screen.getByRole('button', { name: /^Save$/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Custom' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Delete$/ })).not.toBeInTheDocument();
  });

  it('without a controller, the legacy Save path still validates and calls onSave(data) directly', async () => {
    const onSave = vi.fn();
    const entityForm = WidgetForm();
    renderForm(entityForm, { onSave });

    const nameInput = await screen.findByLabelText(/^Name/);
    fireEvent.change(nameInput, { target: { value: 'Legacy Widget' } });
    fireEvent.click(screen.getByRole('button', { name: /^Save$/ }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Legacy Widget' }));
  });
});
