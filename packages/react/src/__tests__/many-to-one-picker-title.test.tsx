// #532 — the picker modal title must come from the label catalog
// (pickerModalTitle) fed with the FIELD label, never the reference entity's
// labelField key ("name"). Assertions compare against the injected function's
// result, not copy literals.

import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { BackendAdapter, PageResult } from '@listgrid/schema-core';
import { EntityForm, ManyToOneField, StringField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { UIProvider } from '../providers/ui';
import { AdapterProvider } from '../providers/adapter';
import { FormStoreProvider } from '../providers/form-store';
import { ManyToOneRenderer } from '../registry/many-to-one-renderer';
import { configureLabels, getLabels } from '../labels';

const FIELD_LABEL = 'Fixture department';
const LABEL_FIELD_KEY = 'name';
const originalLabels = { ...getLabels() };

function targetForm(): EntityForm {
  return new EntityForm('TargetEntityForm', '/target').addFields({
    items: [new StringField(LABEL_FIELD_KEY, 1).withLabel('Name').withList()],
  });
}

function renderPicker() {
  const form = new EntityForm('OwnerEntityForm', '/owner').addFields({
    items: [
      new ManyToOneField('dept', 10, { entityForm: () => targetForm() }).withLabel(FIELD_LABEL),
    ],
  });
  const adapter = {
    list: async (): Promise<PageResult> => ({ content: [], totalElements: 0, totalPages: 1 }),
  } as unknown as BackendAdapter;
  const store = createFormStore(form);
  const field = form.getField('dept') as ManyToOneField;
  render(
    <UIProvider components={defaultUIComponents}>
      <AdapterProvider adapter={adapter}>
        <FormStoreProvider store={store}>
          <ManyToOneRenderer field={field} name="dept" />
        </FormStoreProvider>
      </AdapterProvider>
    </UIProvider>,
  );
}

afterEach(() => {
  configureLabels(originalLabels);
});

describe('ManyToOneRenderer — picker modal title (#532)', () => {
  it('titles the modal via pickerModalTitle(field label), not the labelField key', () => {
    const marker = 'catalog-title';
    configureLabels({ pickerModalTitle: (label) => `${marker}:${label}` });
    renderPicker();
    fireEvent.click(screen.getByRole('button', { name: '찾기' }));
    expect(screen.getByText(`${marker}:${FIELD_LABEL}`)).toBeTruthy();
    expect(screen.queryByText(`${marker}:${LABEL_FIELD_KEY}`)).toBeNull();
  });

  it('renders the empty value via the noSelection catalog entry', () => {
    const marker = 'catalog-none';
    configureLabels({ noSelection: marker });
    renderPicker();
    expect(screen.getByText(marker)).toBeTruthy();
  });
});
