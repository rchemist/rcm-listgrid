// MultiSelectField renderer integration test (EA-A fan-out — MultiSelect).
// Same harness shape as field-a11y.test.tsx / link-field.test.tsx: real
// EntityForm + createFormStore + the full provider stack, rendered with
// @listgrid/ui-default's unstyled primitives. The MultiSelect renderer is
// registered directly here via registerFieldRenderer('multiselect', ...) —
// default-renderers.tsx is untouched (briefing PART 1 fan-out rule).

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { EntityForm, MultiSelectField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { MultiSelectFieldRenderer } from '../registry/multi-select-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('multiselect', MultiSelectFieldRenderer);

const colorOptions = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

function collegeForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college').addFields({
    items: [
      new MultiSelectField('colors', 100, colorOptions, { max: 2 })
        .withLabel('Colors')
        .withRequired(true),
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

describe('MultiSelectFieldRenderer', () => {
  function getGroup(): HTMLElement {
    // scope to THIS field's wrapper — the outer <fieldset> ViewEntityForm
    // renders around the whole form ALSO carries an implicit role="group",
    // so an unscoped getByRole('group') is ambiguous (2 matches).
    const wrapper = document.querySelector('[data-field-name="colors"]') as HTMLElement;
    return within(wrapper).getByRole('group');
  }

  it('renders one checkbox per declared option, all unchecked with no value', async () => {
    renderForm(collegeForm());
    await screen.findByText('Colors');
    const group = getGroup();
    const red = within(group).getByLabelText('Red') as HTMLInputElement;
    const green = within(group).getByLabelText('Green') as HTMLInputElement;
    const blue = within(group).getByLabelText('Blue') as HTMLInputElement;

    expect(red.checked).toBe(false);
    expect(green.checked).toBe(false);
    expect(blue.checked).toBe(false);
  });

  it('checking multiple options accumulates a string[] in the store (never a single value, MultipleOptionalField semantics)', async () => {
    const { store } = renderForm(collegeForm());
    await screen.findByText('Colors');
    const group = getGroup();
    const red = within(group).getByLabelText('Red');
    const blue = within(group).getByLabelText('Blue');

    fireEvent.click(red);
    await waitFor(() => expect(store.getState().fields['colors']?.current).toEqual(['red']));

    fireEvent.click(blue);
    await waitFor(() =>
      expect(store.getState().fields['colors']?.current).toEqual(['red', 'blue']),
    );

    // unchecking removes just that option, preserving the rest (array semantics,
    // not a Boolean toggle — briefing pitfall: "MultipleOptionalField 배열
    // 처리에 전부 위임, Boolean처럼 만들지 말 것").
    fireEvent.click(red);
    await waitFor(() => expect(store.getState().fields['colors']?.current).toEqual(['blue']));
  });

  it('forwards required/invalid/describedBy onto the group for a11y', async () => {
    renderForm(collegeForm());
    await screen.findByText('Colors');
    const group = getGroup();
    const saveButton = screen.getByRole('button', { name: /save/i });

    await waitFor(() => expect(group).toHaveAttribute('aria-required', 'true'));

    // submitting blank (required, no selection) triggers the required-blank
    // failure from the base FormField.validate (inherited by MultiOptionsField).
    fireEvent.click(saveButton);
    await waitFor(() => expect(group).toHaveAttribute('aria-invalid', 'true'));
    const describedBy = group.getAttribute('aria-describedby');
    expect(describedBy).toBe('colors-error');
    expect(document.getElementById(describedBy as string)).toHaveTextContent(/필수 값입니다/);
  });

  it('the status-change trio (decision ④ descope) has no rendered affordance — only Save exists', async () => {
    renderForm(collegeForm());
    await screen.findByText('Colors');
    getGroup();
    expect(screen.queryByRole('button', { name: /즉시 변경|사유|reason/i })).toBeNull();
  });
});
