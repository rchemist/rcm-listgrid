// LinkField renderer integration test (EA-A fan-out — Link). Same harness
// shape as field-a11y.test.tsx: real EntityForm + createFormStore + the full
// provider stack, rendered with @listgrid/ui-default's unstyled primitives.
// The Link renderer is registered directly here via registerFieldRenderer
// ('link', ...) — default-renderers.tsx is untouched (briefing PART 1 fan-out
// rule).

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EntityForm, LinkField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { LinkFieldRenderer } from '../registry/link-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('link', LinkFieldRenderer);

function collegeForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college').addFields({
    items: [new LinkField('homepage', 100).withLabel('Homepage').withRequired(true)],
  });
}

function renderForm(entityForm: EntityForm, onSave = vi.fn()) {
  const store = createFormStore(entityForm);
  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={onSave} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store, onSave };
}

describe('LinkFieldRenderer', () => {
  it('renders a plain text input bound to the field value', async () => {
    renderForm(collegeForm());
    const input = await screen.findByLabelText(/^Homepage/);
    expect(input).toHaveAttribute('id', 'homepage');
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('user edit writes through the store (never local React state)', async () => {
    const { store } = renderForm(collegeForm());
    const input = await screen.findByLabelText(/^Homepage/);

    fireEvent.change(input, { target: { value: 'https://example.com' } });

    expect(store.getState().fields['homepage']?.current).toBe('https://example.com');
    await waitFor(() => expect((input as HTMLInputElement).value).toBe('https://example.com'));
  });

  it('forwards required/invalid/describedBy for a11y — CheckButtonValidation descope (decision ⑧) means no extra "중복확인" button is rendered', async () => {
    renderForm(collegeForm());
    const input = await screen.findByLabelText(/^Homepage/);
    const saveButton = screen.getByRole('button', { name: /save/i });

    // required forwarding (base FormField predicate, resolved async)
    await waitFor(() => expect(input).toHaveAttribute('aria-required', 'true'));

    // submitting blank triggers required-blank validation -> invalid + describedBy
    fireEvent.click(saveButton);
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBe('homepage-error');
    expect(document.getElementById(describedBy as string)).toHaveTextContent(/필수 값입니다/);

    // the descoped CheckButtonValidation flow (0.3.x CheckButtonValidationInput)
    // is NOT reproduced: only the Save button exists, no per-field check button.
    expect(screen.queryByRole('button', { name: /중복확인|check/i })).toBeNull();
  });
});
