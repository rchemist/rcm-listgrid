// EA-A fan-out — PasswordFieldRenderer integration test. Registers the
// renderer directly (default-renderers.tsx is off-limits per fan-out
// convention) and drives it through the real UIProvider/FormStoreProvider/
// ViewEntityForm stack, same harness style as field-a11y.test.tsx.

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EntityForm } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { PasswordFieldRenderer } from '../registry/password-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';
// PasswordField is NOT yet re-exported from @listgrid/schema-core's barrel
// (fan-out convention — the orchestrator wires new field classes into
// schema-core/src/index.ts from each field's manifest), so it's imported
// directly from its own module, matching the sibling month-field/year-field
// renderer tests' `../../../schema-core/src/field/<name>-field` pattern.
import { PasswordField } from '../../../schema-core/src/field/password-field';

registerFieldRenderer('password', PasswordFieldRenderer);

// NOTE: strength is applied via `.withStrength()`, NOT the constructor's 4th
// arg — that distinction is load-bearing (briefing pitfall). The constructor
// APPENDS regex validations alongside the auto-attached default
// PasswordValidation; only `withStrength()` filters the id-tagged
// 'PasswordValidation' entry OUT first (schema-core unit test covers both
// paths directly). This helper exercises the filtering path so a
// strength-only-valid value can prove the default check was actually swapped.
function loginForm(
  strength?: NonNullable<InstanceType<typeof PasswordField>['strength']>,
): EntityForm {
  const field = new PasswordField('password', 1).withLabel('Password');
  return new EntityForm('LoginEntityForm', '/login').addFields({
    items: [strength ? field.withStrength(strength) : field],
  });
}

function renderForm(entityForm: EntityForm) {
  const store = createFormStore(entityForm);
  const onSave = () => {};
  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={onSave} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store };
}

describe('PasswordFieldRenderer', () => {
  it('renders a masked input (type="password") bound to the field label', async () => {
    renderForm(loginForm());
    const input = await screen.findByLabelText(/^Password/);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('typing writes through to the store (never local React state)', async () => {
    const { store } = renderForm(loginForm());
    const input = await screen.findByLabelText(/^Password/);
    fireEvent.change(input, { target: { value: 'Abcdef1!' } });
    await waitFor(() => expect(store.getState().fields['password']?.current).toBe('Abcdef1!'));
    expect((input as HTMLInputElement).value).toBe('Abcdef1!');
  });

  it('default PasswordValidation rejects a value missing a special character on Save', async () => {
    const { store } = renderForm(loginForm());
    const input = await screen.findByLabelText(/^Password/);
    fireEvent.change(input, { target: { value: 'Abcdefgh1' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    expect(store.getState().fields['password']?.errors?.length).toBeGreaterThan(0);
  });

  it('strength.regex swaps out the default check — a strength-only-valid value that fails RegexPasswordNormal now passes', async () => {
    // distinctive Password pitfall (briefing): withStrength id-tag-filters the
    // default 'PasswordValidation' entry OUT and replaces it with
    // 'passwordStrength-<name>' RegexValidation entries — so a value that
    // would fail the DEFAULT rule (no digit/special char) must now pass, once
    // the field only carries an uppercase-only strength rule.
    const { store } = renderForm(
      loginForm({ regex: [{ pattern: /^[A-Z]+$/, error: 'uppercase-only required' }] }),
    );
    const input = await screen.findByLabelText(/^Password/);
    fireEvent.change(input, { target: { value: 'ABCDEF' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(store.getState().saving).toBe(false));
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(store.getState().fields['password']?.errors ?? []).toEqual([]);
  });

  it('strength.regex failure surfaces the rule-specific error message via aria-describedby', async () => {
    const { store } = renderForm(
      loginForm({ regex: [{ pattern: /^[A-Z]+$/, error: 'uppercase-only required' }] }),
    );
    const input = await screen.findByLabelText(/^Password/);
    fireEvent.change(input, { target: { value: 'lowercase' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBe('password-error');
    expect(document.getElementById(describedBy as string)).toHaveTextContent(
      'uppercase-only required',
    );
    expect(store.getState().fields['password']?.errors?.[0]?.message).toBe(
      'uppercase-only required',
    );
  });
});
