// ViewEntityForm action bar (spec §3.4/§7, CAP-09; W3-3) — addAction/
// getActions merge with the built-in Save/Delete (capability-derived),
// `replaces` slot takeover, visible/enabled resolution, and the fully custom
// `render` escape hatch. Also covers the Save rewire to `controller.save()`
// (W2-7 hand-off) and the controller-absent Needs-Review deviation (§설계
// 결정 6 — only the legacy built-in Save renders without a controller).
// Driven through the real provider stack (UIProvider → AuthProvider →
// ViewEntityForm's own FormStoreProvider), same harness as
// view-entity-form.test.tsx.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  EntityForm,
  StringField,
  type ActionContext,
  type FieldEvalContext,
  type FormRuntime,
  type Session,
} from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';
import { configureMessages, resetMessages } from '../messages';
import { configureLabels } from '../labels';

registerDefaultRenderers();

// every test that calls configureMessages() must not leak its mock into a
// later test — resetMessages() restores the console-fallback registry
// (messages.ts) unconditionally after each test (no-op if unused).
afterEach(() => {
  resetMessages();
  configureLabels({
    save: 'Save',
    delete: 'Delete',
    deleteConfirm: '정말 삭제하시겠습니까?',
  });
});

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
  opts: {
    controller?: FormRuntime;
    onSave?: (data: Record<string, unknown>) => void;
    /** W3-6 Fix#1 — role-gated function-conditional tests thread a session through. */
    session?: Session;
    /** W3-6 Fix#3 — lets a test seed a pre-built store (e.g. `fetchedData`, prefill-create). */
    store?: ReturnType<typeof createFormStore>;
  } = {},
) {
  const store = opts.store ?? createFormStore(entityForm);
  return render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={opts.session}>
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

// CAP-06 pattern (form-controller.test.ts:345-346) — a role-gated function
// conditional, the SAME FieldEvalContext (renderType/session/values) shape
// every conditional (field predicate, capability, W3-6 action visible/
// enabled) resolves against.
const isAdmin = async (ctx: FieldEvalContext): Promise<boolean> =>
  ctx.session?.roles?.includes('ADMIN') ?? false;

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

  it('enabled:false disables a custom rendered button and blocks its click', async () => {
    const onClick = vi.fn();
    const entityForm = WidgetForm().addAction({
      id: 'custom-disabled',
      enabled: false,
      render: () => <button onClick={onClick}>Custom disabled</button>,
    });
    renderForm(entityForm, { controller: fakeController() });

    const button = await screen.findByRole('button', { name: 'Custom disabled' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('ViewEntityForm built-in Delete — update-mode-only (spec §3.4 §설계 결정 1; W3-3)', () => {
  it('reads configured built-in Save/Delete labels and delete confirmation at render/click time', async () => {
    const showConfirm = vi.fn(async () => false);
    configureLabels({ save: '저장하기', delete: '지우기', deleteConfirm: '지울까요?' });
    configureMessages({ showConfirm });
    renderForm(WidgetForm().withId('7'), { controller: fakeController() });

    await screen.findByLabelText(/^Name/);
    expect(screen.getByRole('button', { name: '저장하기' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '지우기' }));
    await waitFor(() => expect(showConfirm).toHaveBeenCalledWith('지울까요?'));
  });

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

  it('clicking Delete calls controller.delete() (confirmed via messages registry)', async () => {
    configureMessages({ showConfirm: async () => true });
    const controller = fakeController();
    const entityForm = WidgetForm().withId('7');
    renderForm(entityForm, { controller });

    await screen.findByLabelText(/^Name/);
    fireEvent.click(screen.getByRole('button', { name: /^Delete$/ }));
    await waitFor(() => expect(controller.delete).toHaveBeenCalledTimes(1));
  });
});

describe('ViewEntityForm built-in Delete — confirm gate (spec §7 messages registry; W3-4, CAP-08)', () => {
  it('showConfirm resolving true: clicking Delete calls controller.delete()', async () => {
    const showConfirm = vi.fn(async () => true);
    configureMessages({ showConfirm });
    const controller = fakeController();
    const entityForm = WidgetForm().withId('7');
    renderForm(entityForm, { controller });

    await screen.findByLabelText(/^Name/);
    fireEvent.click(screen.getByRole('button', { name: /^Delete$/ }));

    await waitFor(() => expect(controller.delete).toHaveBeenCalledTimes(1));
    expect(showConfirm).toHaveBeenCalledTimes(1);
  });

  it('showConfirm resolving false: clicking Delete does NOT call controller.delete() (cancel = no-op)', async () => {
    const showConfirm = vi.fn(async () => false);
    configureMessages({ showConfirm });
    const controller = fakeController();
    const entityForm = WidgetForm().withId('7');
    renderForm(entityForm, { controller });

    await screen.findByLabelText(/^Name/);
    fireEvent.click(screen.getByRole('button', { name: /^Delete$/ }));

    await waitFor(() => expect(showConfirm).toHaveBeenCalledTimes(1));
    expect(controller.delete).not.toHaveBeenCalled();
  });
});

describe('ViewEntityForm built-in Save rewire — controller.save (spec §3.4 §설계 결정 2; W3-3)', () => {
  it('locks fields, tabs, and actions while the shared store saving flag is true', async () => {
    const entityForm = WidgetForm().addAction({ id: 'other', label: 'Other' });
    const store = createFormStore(entityForm);
    renderForm(entityForm, { controller: fakeController(), store });

    const input = await screen.findByLabelText(/^Name/);
    store.getState().setSaving(true);

    await waitFor(() => expect(input).toHaveAttribute('readonly'));
    expect(screen.getByRole('button', { name: /^Save$/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Other' })).toBeDisabled();
  });

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
    const controller = fakeController({
      save: vi.fn(async () => ({ ok: false, reason: 'validation' as const })),
    });
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

// W3-6 — hardening fix for 4 confirmed cross-sub-task action-bar composition
// bugs from the W3 phase-end review. Each describe block below is a
// red→green lock for exactly one of the 4 findings.

describe('ViewEntityForm action bar — function-conditional visible/enabled resolve async (W3-6 Fix#1)', () => {
  it('passes EntityForm identity to action predicates without declaring an id field', async () => {
    const visible = vi.fn((ctx: FieldEvalContext) => ctx.entityId === 'widget-42');
    const entityForm = WidgetForm().withId('widget-42').addAction({
      id: 'identity',
      label: 'Identity action',
      visible,
    });

    renderForm(entityForm, { controller: fakeController() });

    expect(await screen.findByRole('button', { name: 'Identity action' })).toBeInTheDocument();
    expect(visible).toHaveBeenCalledWith(expect.objectContaining({ entityId: 'widget-42' }));
    expect(entityForm.getFields().some((field) => field.getName() === 'id')).toBe(false);
  });

  it('a function-typed Delete capability renders Delete for an ADMIN session (was ALWAYS hidden — the sync getStaticConditionalBoolean fallback resolves any function to false)', async () => {
    const entityForm = WidgetForm().withId('7').withCapabilities({ delete: isAdmin });
    renderForm(entityForm, { controller: fakeController(), session: { roles: ['ADMIN'] } });

    await screen.findByLabelText(/^Name/);
    expect(await screen.findByRole('button', { name: /^Delete$/ })).toBeInTheDocument();
  });

  it('the same function-typed Delete capability stays absent for a non-ADMIN session', async () => {
    const entityForm = WidgetForm().withId('7').withCapabilities({ delete: isAdmin });
    renderForm(entityForm, { controller: fakeController(), session: { roles: ['USER'] } });

    await screen.findByLabelText(/^Name/);
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /^Delete$/ })).not.toBeInTheDocument(),
    );
  });

  it('a custom action with a function-typed `visible` renders for an ADMIN session', async () => {
    const entityForm = WidgetForm().addAction({ id: 'x', label: 'X', visible: isAdmin });
    renderForm(entityForm, { controller: fakeController(), session: { roles: ['ADMIN'] } });

    await screen.findByLabelText(/^Name/);
    expect(await screen.findByRole('button', { name: 'X' })).toBeInTheDocument();
  });

  it('the same custom action with a function-typed `visible` stays absent for a non-ADMIN session', async () => {
    const entityForm = WidgetForm().addAction({ id: 'x', label: 'X', visible: isAdmin });
    renderForm(entityForm, { controller: fakeController(), session: { roles: ['USER'] } });

    await screen.findByLabelText(/^Name/);
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'X' })).not.toBeInTheDocument(),
    );
  });

  it('literal visible:false stays sync (no flash) — unaffected by the async function-branch fix (regression lock)', async () => {
    const entityForm = WidgetForm()
      .addAction({ id: 'x', label: 'X', visible: false })
      .addAction({ id: 'y', label: 'Y', visible: true });
    renderForm(entityForm, { controller: fakeController() });

    await screen.findByLabelText(/^Name/);
    // synchronous — no `await`/`findBy` needed, proving no flash/async detour
    // for the literal branch (getStaticConditionalBoolean, unchanged path).
    expect(screen.queryByRole('button', { name: 'X' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Y' })).toBeInTheDocument();
  });
});

describe('ViewEntityForm action bar — fresh ActionContext at click time (W3-6 Fix#2)', () => {
  it('passes EntityForm identity separately from values without declaring an id field', async () => {
    let captured: ActionContext | undefined;
    const entityForm = WidgetForm()
      .withId('widget-42')
      .addAction({
        id: 'identity',
        label: 'Identity action',
        run: (ctx) => {
          captured = ctx;
        },
      });

    renderForm(entityForm, { controller: fakeController() });
    fireEvent.click(await screen.findByRole('button', { name: 'Identity action' }));

    await waitFor(() => expect(captured?.entityId).toBe('widget-42'));
    expect(captured?.values).not.toHaveProperty('id');
    expect(entityForm.getFields().some((field) => field.getName() === 'id')).toBe(false);
  });

  it("a custom action's run receives the value typed AFTER the last render — not a stale render-time snapshot (D4: a keystroke doesn't re-render ViewEntityFormInner)", async () => {
    let captured: unknown;
    const entityForm = WidgetForm().addAction({
      id: 'v',
      label: 'V',
      run: (ctx) => {
        captured = ctx.values.name;
      },
    });
    renderForm(entityForm, { controller: fakeController() });

    const nameInput = await screen.findByLabelText(/^Name/);
    fireEvent.change(nameInput, { target: { value: 'typed' } });
    fireEvent.click(screen.getByRole('button', { name: 'V' }));

    await waitFor(() => expect(captured).toBe('typed'));
  });
});

describe('ViewEntityForm action bar — action-bar CRUD decisions use id-based renderType, not store.renderType (W3-6 Fix#3)', () => {
  it('a prefill-create store (fetchedData seeded → store.renderType flips to "update") with NO id set (entityForm.getRenderType() stays "create") suppresses the Delete candidate and resolves saveCap off the CREATE capability', async () => {
    // create: true / update: false makes the create-vs-update branch
    // observable — if saveCap wrongly read the store's (flipped) renderType,
    // Save would resolve `update: false` and disappear entirely.
    const entityForm = WidgetForm().withCapabilities({ create: true, update: false });
    const store = createFormStore(entityForm, { fetchedData: { name: 'Prefilled' } });
    // sanity on the two renderType sources actually diverging here:
    expect(store.getState().renderType).toBe('update'); // EF7 flip
    expect(entityForm.getRenderType()).toBe('create'); // id-based — no withId()

    renderForm(entityForm, { controller: fakeController(), store });

    await screen.findByLabelText(/^Name/);
    // Delete candidate: getId()-based (actionRenderType), not store.renderType.
    expect(screen.queryByRole('button', { name: /^Delete$/ })).not.toBeInTheDocument();
    // saveCap: create branch (visible), not the update branch (would hide it).
    expect(screen.getByRole('button', { name: /^Save$/ })).toBeInTheDocument();
  });
});

describe('ViewEntityForm action bar — controller-absent identity filter, not id string (W3-6 Fix#4)', () => {
  it('a custom action reusing id "save" (no `replaces`) never renders without a controller — the identity filter (`a === saveBuiltin`) rejects it even though `a.id === \'save\'`; no crash on the click path (nothing to click)', async () => {
    const run = vi.fn((ctx: ActionContext) => {
      // would throw (Cannot read properties of undefined) if this ever ran
      // with `ctx` undefined — proof the click path was never reached.
      ctx.mutator.setValue('name', 'x');
    });
    const entityForm = WidgetForm().addAction({ id: 'save', label: 'Dup', run });
    renderForm(entityForm); // no controller

    await screen.findByLabelText(/^Name/);
    // the id-collision merge (pre-existing, unrelated to this fix) already
    // drops the built-in Save candidate once a custom action claims id
    // 'save' — so neither renders:
    expect(screen.queryByRole('button', { name: /^Save$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Dup' })).not.toBeInTheDocument();
    expect(run).not.toHaveBeenCalled();
  });
});
