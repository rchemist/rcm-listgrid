// Month renderer — JSDOM render test (EA-A fan-out). Registers
// MonthFieldRenderer directly (default-renderers.tsx is off-limits to fan-out
// agents), then drives the real provider stack (UIProvider → AuthProvider →
// FormStoreProvider → ViewEntityForm), same harness style as
// field-a11y.test.tsx — proving the native `<input type="month">` renders,
// a user edit reaches the store, and MonthField's lexicographic limit bound
// (the field's distinctive pitfall, briefing PART 2 §Month) fires through
// save-time validation.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EntityForm } from '@listgrid/schema-core';
// MonthField is imported directly from its declaring module rather than the
// @listgrid/schema-core barrel: index.ts export wiring for the 12 EA-A
// fan-out field classes is the orchestrator's job (manifest-driven), not this
// agent's — see task hard rules ("Do NOT edit ... index.ts").
import { MonthField } from '../../../schema-core/src/field/month-field';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { MonthFieldRenderer } from '../registry/month-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('month', MonthFieldRenderer);

function collegeForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college').addFields({
    items: [
      new MonthField('graduationMonth', 100, { min: '2020-01', max: '2020-12' }).withLabel(
        'Graduation Month',
      ),
    ],
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

describe('MonthFieldRenderer (JSDOM render)', () => {
  it('renders a native month input, labeled, backed by the store', async () => {
    renderForm(collegeForm());
    const input = await screen.findByLabelText(/^Graduation Month/);
    expect(input).toHaveAttribute('type', 'month');
  });

  it('a user edit writes the YYYY-MM value to the store', async () => {
    const { store } = renderForm(collegeForm());
    const input = await screen.findByLabelText(/^Graduation Month/);

    fireEvent.change(input, { target: { value: '2020-06' } });

    await waitFor(() =>
      expect(store.getState().fields['graduationMonth']?.current).toBe('2020-06'),
    );
    expect((input as HTMLInputElement).value).toBe('2020-06');
  });

  it(
    "MonthField.limit is enforced lexicographically at save time (the field's " +
      'distinctive pitfall — YYYY-MM string comparison, not Date parsing)',
    async () => {
      const { store, onSave } = renderForm(collegeForm());
      const input = await screen.findByLabelText(/^Graduation Month/);
      const saveButton = screen.getByRole('button', { name: /save/i });

      // above the declared max ('2020-12')
      fireEvent.change(input, { target: { value: '2021-01' } });
      fireEvent.click(saveButton);

      await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBe('graduationMonth-error');
      expect(document.getElementById(describedBy as string)).toHaveTextContent('최대 2020-12');
      expect(onSave).not.toHaveBeenCalled();
    },
  );

  it('a value within [min,max] passes validation and reaches onSave', async () => {
    const { onSave } = renderForm(collegeForm());
    const input = await screen.findByLabelText(/^Graduation Month/);
    const saveButton = screen.getByRole('button', { name: /save/i });

    fireEvent.change(input, { target: { value: '2020-06' } });
    fireEvent.click(saveButton);

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(input).not.toHaveAttribute('aria-invalid');
  });
});
