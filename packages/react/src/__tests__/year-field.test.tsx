// Year renderer integration test (EA-A, PART 2 §Year). Same harness style as
// field-a11y.test.tsx: real EntityForm -> createFormStore -> provider stack ->
// ViewEntityForm, own renderer registered directly here (default-renderers.tsx
// untouched — fan-out convention, briefing PART 1 "Test idioms").

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EntityForm } from '@listgrid/schema-core';
// NOTE: YearField is not yet re-exported from @listgrid/schema-core's barrel
// (packages/schema-core/src/index.ts) — that registration is the
// orchestrator's job (per-field manifest), not this fan-out task's (hard
// rule: do not edit index.ts). Import the class directly by relative path
// until the barrel is wired; the renderer file itself already uses the
// '@listgrid/schema-core' barrel form per convention, and will resolve once
// the orchestrator adds the export.
import { YearField } from '../../../schema-core/src/field/year-field';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { YearFieldRenderer } from '../registry/year-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('year', YearFieldRenderer);

function graduationForm(limit?: { min?: number; max?: number }): EntityForm {
  return new EntityForm('GraduationEntityForm', '/graduation').addFields({
    items: [new YearField('graduationYear', 100, limit).withRequired(true).withLabel('졸업년도')],
  });
}

function renderForm(entityForm: EntityForm) {
  const store = createFormStore(entityForm);
  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={() => {}} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store };
}

describe('YearFieldRenderer', () => {
  it('renders a labelled <select> with a descending year option list bounded by limit', async () => {
    renderForm(graduationForm({ min: 2018, max: 2020 }));
    const select = (await screen.findByLabelText(/^졸업년도/)) as HTMLSelectElement;
    expect(select.tagName).toBe('SELECT');

    const optionLabels = Array.from(select.options).map((o) => o.textContent);
    // descending order (0.3.x YearField.tsx:42 sort), bounded [min,max]
    expect(optionLabels).toEqual(['2020', '2019', '2018']);
  });

  it('editing the select writes the chosen year string into the form store', async () => {
    const { store } = renderForm(graduationForm({ min: 2018, max: 2020 }));
    const select = (await screen.findByLabelText(/^졸업년도/)) as HTMLSelectElement;

    fireEvent.change(select, { target: { value: '2019' } });

    await waitFor(() => expect(store.getState().fields['graduationYear']?.current).toBe('2019'));
  });

  it('DISTINCTIVE (briefing pitfall): with no limit passed, defaults eagerly to [1900, current year] — the option range is bounded, not open-ended', async () => {
    renderForm(graduationForm());
    const select = (await screen.findByLabelText(/^졸업년도/)) as HTMLSelectElement;
    const currentYear = new Date().getFullYear();

    const values = Array.from(select.options).map((o) => o.value);
    expect(values[0]).toBe(String(currentYear));
    expect(values[values.length - 1]).toBe('1900');
    expect(values).toHaveLength(currentYear - 1900 + 1);
  });

  it('a required empty YearField fails submit validation like any other required field', async () => {
    renderForm(graduationForm({ min: 2018, max: 2020 }));
    const saveButton = await screen.findByRole('button', { name: /save/i });

    fireEvent.click(saveButton);

    const select = (await screen.findByLabelText(/^졸업년도/)) as HTMLSelectElement;
    await waitFor(() => expect(select).toHaveAttribute('aria-invalid', 'true'));
  });
});
