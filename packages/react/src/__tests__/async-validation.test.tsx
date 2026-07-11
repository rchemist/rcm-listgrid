// FieldRenderer — AsyncValidation button affordance (W4-3, spec §5.3,
// CAP-05). Same harness shape as field-a11y.test.tsx / link-field.test.tsx:
// real EntityForm + createFormStore + the full provider stack. Covers: the
// confirm button (label=buttonLabel) for a trigger:'button' field, NO button
// for a trigger:'change' field (link-field.test.tsx precedent — asserting a
// button's ABSENCE, not just presence), click -> store.runAsyncValidation,
// and the checking/valid/invalid asyncState display (invalid reuses the
// existing per-field `errors` list — see FieldRenderer.tsx's async block
// comment).

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AsyncValidation, EntityForm, StringField, ValidateResult } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

type Check = (value: unknown, ctx?: unknown) => Promise<ValidateResult>;

// 'alias' — trigger:'button' + a custom label (실제 사용 시나리오: 중복확인).
// 'name' — trigger:'change' (the default), no `opts` at all, so it also
// proves the default-trigger field never grows a button.
function AsyncDemoForm(check: Check): EntityForm {
  return new EntityForm('AsyncFieldEntityForm', '/async-field').addFields({
    items: [
      new StringField('alias', 100)
        .withLabel('별칭')
        .withValidations(
          new AsyncValidation(check, { trigger: 'button', buttonLabel: '중복확인' }),
        ),
      new StringField('name', 110).withLabel('이름').withValidations(new AsyncValidation(check)),
    ],
  });
}

function renderForm(entityForm: EntityForm) {
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
  return { store };
}

describe('FieldRenderer — AsyncValidation button affordance', () => {
  it('renders a confirm button labeled with buttonLabel for a trigger:"button" field', async () => {
    renderForm(AsyncDemoForm(async () => ValidateResult.success()));
    await screen.findByLabelText(/^별칭/);
    expect(screen.getByRole('button', { name: '중복확인' })).toBeInTheDocument();
  });

  it('renders NO button for a trigger:"change" field (default trigger, buttonLabel would be "확인")', async () => {
    renderForm(AsyncDemoForm(async () => ValidateResult.success()));
    await screen.findByLabelText(/^이름/);
    expect(screen.queryByRole('button', { name: '확인' })).not.toBeInTheDocument();
  });

  it('clicking the confirm button calls store.runAsyncValidation and shows checking → valid', async () => {
    let resolveCheck!: (r: ValidateResult) => void;
    const check = vi.fn(
      () =>
        new Promise<ValidateResult>((resolve) => {
          resolveCheck = resolve;
        }),
    );
    const { store } = renderForm(AsyncDemoForm(check));

    const aliasInput = await screen.findByLabelText(/^별칭/);
    fireEvent.change(aliasInput, { target: { value: 'unique-alias' } });
    fireEvent.click(screen.getByRole('button', { name: '중복확인' }));

    await waitFor(() => expect(screen.getByText('확인 중…')).toBeInTheDocument());
    expect(check).toHaveBeenCalledTimes(1);

    resolveCheck(ValidateResult.success());
    await waitFor(() => expect(screen.getByText('사용 가능')).toBeInTheDocument());
    expect(store.getState().fields.alias?.asyncState).toBe('valid');
  });

  it('an invalid check result surfaces the ValidateResult message through the existing field error list', async () => {
    const check = vi.fn(async () => ValidateResult.fail('이미 사용 중인 별칭입니다'));
    const { store } = renderForm(AsyncDemoForm(check));

    const aliasInput = await screen.findByLabelText(/^별칭/);
    fireEvent.change(aliasInput, { target: { value: 'taken' } });
    fireEvent.click(screen.getByRole('button', { name: '중복확인' }));

    await waitFor(() => expect(screen.getByText('이미 사용 중인 별칭입니다')).toBeInTheDocument());
    expect(store.getState().fields.alias?.asyncState).toBe('invalid');
  });
});
