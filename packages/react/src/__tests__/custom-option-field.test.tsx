// CustomOptionField renderer integration test (EA-B fan-out — CustomOption).
// Same harness shape as field-a11y.test.tsx / multi-select-field.test.tsx:
// real EntityForm + createFormStore + the full provider stack, rendered with
// @listgrid/ui-default's unstyled primitives. The CustomOption renderer is
// registered directly here via registerFieldRenderer('customOption', ...) —
// default-renderers.tsx is untouched (briefing PART 1 fan-out rule). Wrapped
// in a <CustomOptionProvider fetchOptions={...}> with a fake fetchOptions
// (task instruction) — this exercises the real alias-fetch path, not a
// stubbed field.options.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { EntityForm } from '@listgrid/schema-core';
// NOTE: relative import — CustomOptionField is this port's own new file, not
// yet in the schema-core barrel (index.ts is a shared file this agent must
// not edit; see custom-option-renderer.tsx's matching note).
import { CustomOptionField } from '../../../schema-core/src/field/custom-option-field';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { CustomOptionProvider, type FetchCustomOptions } from '../providers/custom-option';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { CustomOptionFieldRenderer } from '../registry/custom-option-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('customOption', CustomOptionFieldRenderer);

const COLOR_OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

function fakeFetchOptions(calls: string[] = []): FetchCustomOptions {
  return vi.fn((alias: string) => {
    calls.push(alias);
    return Promise.resolve(COLOR_OPTIONS);
  });
}

function singleForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college').addFields({
    items: [
      new CustomOptionField('favoriteColor', 100, 'FAVORITE_COLOR')
        .withLabel('Favorite Color')
        .withRequired(true),
    ],
  });
}

function multipleForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college').addFields({
    items: [
      new CustomOptionField('favoriteColors', 100, 'FAVORITE_COLOR', true)
        .withLabel('Favorite Colors')
        .withRequired(true),
    ],
  });
}

function renderForm(entityForm: EntityForm, fetchOptions: FetchCustomOptions, onSave = vi.fn()) {
  const store = createFormStore(entityForm);
  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <CustomOptionProvider fetchOptions={fetchOptions}>
          <FormStoreProvider store={store}>
            <ViewEntityForm entityForm={entityForm} store={store} onSave={onSave} />
          </FormStoreProvider>
        </CustomOptionProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store, onSave };
}

describe('CustomOptionFieldRenderer — single (multiple=false → SelectBox)', () => {
  it('fetches the alias-backed options via CustomOptionProvider and renders a select', async () => {
    const calls: string[] = [];
    renderForm(singleForm(), fakeFetchOptions(calls));
    const select = (await screen.findByLabelText(/^Favorite Color/)) as HTMLSelectElement;

    await waitFor(() => expect(calls).toEqual(['FAVORITE_COLOR']));
    await waitFor(() =>
      expect(within(select).getAllByRole('option')).toHaveLength(COLOR_OPTIONS.length),
    );
  });

  it('selecting an option writes the scalar value to the store (never an array)', async () => {
    const { store } = renderForm(singleForm(), fakeFetchOptions());
    const select = (await screen.findByLabelText(/^Favorite Color/)) as HTMLSelectElement;
    await waitFor(() => expect(within(select).getAllByRole('option')).toHaveLength(3));

    fireEvent.change(select, { target: { value: 'green' } });
    await waitFor(() => expect(store.getState().fields['favoriteColor']?.current).toBe('green'));
  });

  it('forwards required/invalid/describedBy for a11y on the SelectBox', async () => {
    renderForm(singleForm(), fakeFetchOptions());
    const select = await screen.findByLabelText(/^Favorite Color/);
    const saveButton = screen.getByRole('button', { name: /save/i });

    await waitFor(() => expect(select).toHaveAttribute('aria-required', 'true'));

    fireEvent.click(saveButton);
    await waitFor(() => expect(select).toHaveAttribute('aria-invalid', 'true'));
    const describedBy = select.getAttribute('aria-describedby');
    expect(describedBy).toBe('favoriteColor-error');
    expect(document.getElementById(describedBy as string)).toHaveTextContent(/필수 값입니다/);
  });

  it('a declared (non-empty) options list is used as-is without triggering a fetch', async () => {
    const calls: string[] = [];
    const form = new EntityForm('CollegeEntityForm', '/college').addFields({
      items: [
        new CustomOptionField('favoriteColor', 100, 'FAVORITE_COLOR')
          .withLabel('Favorite Color')
          .withOptions(COLOR_OPTIONS),
      ],
    });
    renderForm(form, fakeFetchOptions(calls));
    const select = (await screen.findByLabelText(/^Favorite Color/)) as HTMLSelectElement;
    await waitFor(() => expect(within(select).getAllByRole('option')).toHaveLength(3));
    expect(calls).toEqual([]);
  });
});

describe('CustomOptionFieldRenderer — multiple (multiple=true → checkbox group, MultiSelect precedent)', () => {
  function getGroup(): HTMLElement {
    const wrapper = document.querySelector('[data-field-name="favoriteColors"]') as HTMLElement;
    return within(wrapper).getByRole('group');
  }

  it('renders one checkbox per fetched option, all unchecked with no value', async () => {
    renderForm(multipleForm(), fakeFetchOptions());
    await screen.findByText('Favorite Colors');
    await waitFor(() => {
      const group = getGroup();
      expect(within(group).getAllByRole('checkbox')).toHaveLength(3);
    });
    const group = getGroup();
    expect((within(group).getByLabelText('Red') as HTMLInputElement).checked).toBe(false);
  });

  it('checking multiple options accumulates a string[] in the store', async () => {
    const { store } = renderForm(multipleForm(), fakeFetchOptions());
    await screen.findByText('Favorite Colors');
    await waitFor(() => expect(getGroup()).not.toBeNull());
    await waitFor(() => expect(within(getGroup()).getAllByRole('checkbox')).toHaveLength(3));

    const group = getGroup();
    fireEvent.click(within(group).getByLabelText('Red'));
    await waitFor(() =>
      expect(store.getState().fields['favoriteColors']?.current).toEqual(['red']),
    );

    fireEvent.click(within(group).getByLabelText('Blue'));
    await waitFor(() =>
      expect(store.getState().fields['favoriteColors']?.current).toEqual(['red', 'blue']),
    );

    fireEvent.click(within(group).getByLabelText('Red'));
    await waitFor(() =>
      expect(store.getState().fields['favoriteColors']?.current).toEqual(['blue']),
    );
  });

  it('forwards required/invalid/describedBy onto the group for a11y', async () => {
    renderForm(multipleForm(), fakeFetchOptions());
    await screen.findByText('Favorite Colors');
    await waitFor(() => expect(within(getGroup()).getAllByRole('checkbox')).toHaveLength(3));
    const saveButton = screen.getByRole('button', { name: /save/i });

    await waitFor(() => expect(getGroup()).toHaveAttribute('aria-required', 'true'));

    fireEvent.click(saveButton);
    await waitFor(() => expect(getGroup()).toHaveAttribute('aria-invalid', 'true'));
    const describedBy = getGroup().getAttribute('aria-describedby');
    expect(describedBy).toBe('favoriteColors-error');
    expect(document.getElementById(describedBy as string)).toHaveTextContent(/필수 값입니다/);
  });
});

describe('CustomOptionFieldRenderer — CustomOptionProvider in-flight dedup (EA-B0 PART D item 4)', () => {
  it('two mounted instances of the same alias resolve through one host fetchOptions call', async () => {
    const calls: string[] = [];
    const fetchOptions = fakeFetchOptions(calls);
    const form = new EntityForm('CollegeEntityForm', '/college').addFields({
      items: [
        new CustomOptionField('colorA', 100, 'FAVORITE_COLOR').withLabel('Color A'),
        new CustomOptionField('colorB', 110, 'FAVORITE_COLOR').withLabel('Color B'),
      ],
    });
    renderForm(form, fetchOptions);
    const selectA = (await screen.findByLabelText(/^Color A/)) as HTMLSelectElement;
    const selectB = (await screen.findByLabelText(/^Color B/)) as HTMLSelectElement;
    await waitFor(() => expect(within(selectA).getAllByRole('option')).toHaveLength(3));
    await waitFor(() => expect(within(selectB).getAllByRole('option')).toHaveLength(3));

    expect(calls).toEqual(['FAVORITE_COLOR']);
  });
});
