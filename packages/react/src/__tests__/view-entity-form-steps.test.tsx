// withSteps create-mode wizard (spec §3.2, C6; W4-2) — JSDOM render tests.
// Covers: wizard render in create mode (only the current step's fields
// visible), 다음/이전 navigation, the last step showing the existing Save
// affordance, update mode falling back to the normal (non-wizard) layout
// even with steps declared, and hidden-step exclusion (both the sync
// literal branch and the async function branch — W3-6 Fix#1 hybrid
// pattern, per this task's Do-NOT: getStaticConditionalBoolean must never
// be used for a function-typed StepDef.hidden).

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EntityForm, StringField, type StepDef } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

function defaultSteps(): StepDef[] {
  return [
    { id: 'step1', label: 'Step 1', order: 0, fields: ['a'] },
    { id: 'step2', label: 'Step 2', order: 1, fields: ['b'] },
    { id: 'step3', label: 'Step 3', order: 2, fields: ['c'] },
  ];
}

function stepsForm(steps: StepDef[] = defaultSteps()): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget')
    .addFields({
      items: [
        new StringField('a', 1).withLabel('A'),
        new StringField('b', 2).withLabel('B'),
        new StringField('c', 3).withLabel('C'),
      ],
    })
    .withSteps(steps);
}

function renderForm(entityForm: EntityForm, store: ReturnType<typeof createFormStore>) {
  return render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={vi.fn()} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
}

describe('create-mode wizard (spec §3.2, C6; W4-2) — render gate', () => {
  it("create mode + declared steps renders the wizard: only the CURRENT step's fields are visible", async () => {
    const entityForm = stepsForm();
    const store = createFormStore(entityForm);
    renderForm(entityForm, store);

    expect(await screen.findByLabelText(/^A/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^B/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^C/)).not.toBeInTheDocument();

    // step indicator lists every visible step
    expect(screen.getByText('1. Step 1')).toBeInTheDocument();
    expect(screen.getByText('2. Step 2')).toBeInTheDocument();
    expect(screen.getByText('3. Step 3')).toBeInTheDocument();

    // non-last step: 다음 only, no Save/이전 yet
    expect(screen.getByRole('button', { name: '다음' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '이전' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  it('update mode (withId) with declared steps renders the NORMAL layout, not the wizard', async () => {
    const entityForm = stepsForm().withId('1');
    const store = createFormStore(entityForm);
    renderForm(entityForm, store);

    // all three fields render together — no step-scoped filtering
    expect(await screen.findByLabelText(/^A/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^B/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^C/)).toBeInTheDocument();

    // no wizard chrome
    expect(screen.queryByText('1. Step 1')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '다음' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('no declared steps in create mode renders the NORMAL layout unchanged (no regression)', async () => {
    const entityForm = new EntityForm('WidgetEntityForm', '/widget').addFields({
      items: [new StringField('a', 1).withLabel('A'), new StringField('b', 2).withLabel('B')],
    });
    const store = createFormStore(entityForm);
    renderForm(entityForm, store);

    expect(await screen.findByLabelText(/^A/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^B/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '다음' })).not.toBeInTheDocument();
  });
});

describe('create-mode wizard — 다음/이전 navigation', () => {
  it('다음 advances one step at a time; the LAST step shows the existing Save affordance instead of 다음', async () => {
    const entityForm = stepsForm();
    const store = createFormStore(entityForm);
    renderForm(entityForm, store);

    await screen.findByLabelText(/^A/);
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    expect(await screen.findByLabelText(/^B/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^A/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '이전' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    expect(await screen.findByLabelText(/^C/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^B/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '다음' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    // 이전 still available on the last step (minimal back-nav, spec is
    // silent on this — see this task's DEVIATIONS).
    expect(screen.getByRole('button', { name: '이전' })).toBeInTheDocument();
  });

  it('이전 steps back and cross-step values are retained (store-backed, not local input state)', async () => {
    const entityForm = stepsForm();
    const store = createFormStore(entityForm);
    renderForm(entityForm, store);

    const aInput = await screen.findByLabelText(/^A/);
    fireEvent.change(aInput, { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    await screen.findByLabelText(/^B/);
    fireEvent.click(screen.getByRole('button', { name: '이전' }));

    const aInputAgain = await screen.findByLabelText(/^A/);
    expect(aInputAgain).toHaveValue('hello');
    expect(store.getState().getValue('a')).toBe('hello');
  });
});

describe('create-mode wizard — hidden-step exclusion (W3-6 Fix#1 hybrid pattern)', () => {
  it('a literal hidden:true step is excluded from the indicator and skipped when navigating (sync path)', async () => {
    const entityForm = stepsForm([
      { id: 'step1', label: 'Step 1', order: 0, fields: ['a'] },
      { id: 'step2', label: 'Step 2', order: 1, fields: ['b'], hidden: true },
      { id: 'step3', label: 'Step 3', order: 2, fields: ['c'] },
    ]);
    const store = createFormStore(entityForm);
    renderForm(entityForm, store);

    await screen.findByLabelText(/^A/);
    expect(screen.queryByText(/Step 2/)).not.toBeInTheDocument();
    expect(screen.getByText('1. Step 1')).toBeInTheDocument();
    expect(screen.getByText('2. Step 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    // jumps straight to step3 — the hidden step2 (field B) is never shown
    expect(await screen.findByLabelText(/^C/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^B/)).not.toBeInTheDocument();
  });

  it('a function-typed hidden step resolves ASYNCHRONOUSLY and is excluded once resolved (async path — Do-NOT: getStaticConditionalBoolean would always show it)', async () => {
    const entityForm = stepsForm([
      { id: 'step1', label: 'Step 1', order: 0, fields: ['a'] },
      {
        id: 'step2',
        label: 'Step 2',
        order: 1,
        fields: ['b'],
        hidden: () => Promise.resolve(true),
      },
      { id: 'step3', label: 'Step 3', order: 2, fields: ['c'] },
    ]);
    const store = createFormStore(entityForm);
    renderForm(entityForm, store);

    await screen.findByLabelText(/^A/);
    await waitFor(() => {
      expect(screen.queryByText(/Step 2/)).not.toBeInTheDocument();
    });
    expect(screen.getByText('1. Step 1')).toBeInTheDocument();
    expect(screen.getByText('2. Step 3')).toBeInTheDocument();
  });

  it('a function-typed hidden step resolving to false stays visible (async path, permissive result)', async () => {
    const entityForm = stepsForm([
      { id: 'step1', label: 'Step 1', order: 0, fields: ['a'] },
      {
        id: 'step2',
        label: 'Step 2',
        order: 1,
        fields: ['b'],
        hidden: () => Promise.resolve(false),
      },
      { id: 'step3', label: 'Step 3', order: 2, fields: ['c'] },
    ]);
    const store = createFormStore(entityForm);
    renderForm(entityForm, store);

    await screen.findByLabelText(/^A/);
    await waitFor(() => {
      expect(screen.getByText('2. Step 2')).toBeInTheDocument();
    });
  });
});
