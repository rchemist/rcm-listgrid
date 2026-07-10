// CheckboxField renderer integration test (EA-A fan-out — Checkbox). Same
// harness shape as field-a11y.test.tsx: real EntityForm + createFormStore +
// the full provider stack, rendered with @listgrid/ui-default's unstyled
// primitives. The Checkbox renderer is registered directly here via
// registerFieldRenderer('checkbox', ...) — default-renderers.tsx is
// untouched (briefing PART 1 fan-out rule).
//
// NOTE on the CheckboxField import: schema-core's barrel (`../index.ts`)
// does not yet re-export CheckboxField — barrel registration is done by the
// orchestrator from the fan-out manifest (task hard rule: fan-out agents may
// not edit index.ts). A relative cross-package import reaches the class
// directly so this suite is green NOW and keeps working unchanged once the
// barrel export lands (same file, either way).

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EntityForm } from '@listgrid/schema-core';
import { CheckboxField } from '../../../schema-core/src/field/checkbox-field';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { CheckboxFieldRenderer } from '../registry/checkbox-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('checkbox', CheckboxFieldRenderer);

const flagOptions = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C' },
];

function collegeForm(withMin?: number): EntityForm {
  const field = new CheckboxField('flags', 100, flagOptions).withLabel('Flags');
  if (withMin !== undefined) field.withRequired(true).withMin(withMin);
  return new EntityForm('CollegeEntityForm', '/college').addFields({ items: [field] });
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

describe('CheckboxFieldRenderer', () => {
  it('renders one checkbox per declared option, all unchecked with no store value', async () => {
    renderForm(collegeForm());
    const boxes = await screen.findAllByRole('checkbox');
    expect(boxes).toHaveLength(3);
    for (const box of boxes) {
      expect((box as HTMLInputElement).checked).toBe(false);
    }
    expect(boxes[0]).toHaveAttribute('id', 'flags');
  });

  it('pitfall: value is a string[] SET, not a boolean — checking one option writes ["a"], not true', async () => {
    const { store } = renderForm(collegeForm());
    const boxes = await screen.findAllByRole('checkbox');

    fireEvent.click(boxes[0]!);

    await waitFor(() => expect(store.getState().fields['flags']?.current).toEqual(['a']));
    expect(store.getState().fields['flags']?.current).not.toBe(true);
  });

  it('checking a second option appends to the array; unchecking the first removes only that entry', async () => {
    const { store } = renderForm(collegeForm());
    const boxes = await screen.findAllByRole('checkbox');

    fireEvent.click(boxes[0]!); // check 'a'
    await waitFor(() => expect(store.getState().fields['flags']?.current).toEqual(['a']));

    fireEvent.click(boxes[1]!); // check 'b'
    await waitFor(() => expect(store.getState().fields['flags']?.current).toEqual(['a', 'b']));

    fireEvent.click(boxes[0]!); // uncheck 'a'
    await waitFor(() => expect(store.getState().fields['flags']?.current).toEqual(['b']));

    expect((boxes[1] as HTMLInputElement).checked).toBe(true);
    expect((boxes[0] as HTMLInputElement).checked).toBe(false);
  });

  it('forwards required/invalid/describedBy for a11y onto every checkbox in the group', async () => {
    renderForm(collegeForm(1)); // required + min:1
    const boxes = await screen.findAllByRole('checkbox');
    const saveButton = screen.getByRole('button', { name: /save/i });

    await waitFor(() => expect(boxes[0]).toHaveAttribute('aria-required', 'true'));

    fireEvent.click(saveButton);

    await waitFor(() => expect(boxes[0]).toHaveAttribute('aria-invalid', 'true'));
    const describedBy = boxes[0]!.getAttribute('aria-describedby');
    expect(describedBy).toBe('flags-error');
    // every option in the group carries the same association, not just the first
    for (const box of boxes) {
      expect(box).toHaveAttribute('aria-invalid', 'true');
      expect(box).toHaveAttribute('aria-describedby', describedBy);
    }
    expect(document.getElementById(describedBy as string)).toHaveTextContent(/필수 값입니다/);
  });
});
