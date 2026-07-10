// MappedJoin renderer integration (0.3.x MappedJoinField.tsx:15-25) — locks
// two things: (1) MappedJoinFieldRenderer itself renders a real
// `<input type="hidden">` mirroring the store value, and (2) the field's
// distinctive behavior from the briefing (conductor decision ⑥): even though
// MappedJoinField.isHidden() always resolves true — so FieldRenderer never
// mounts ANY renderer for it inside a live form — the value written to the
// store still reaches `toSaveData()`. Registers MappedJoinFieldRenderer via
// registerFieldRenderer('mappedJoin', ...) directly here; default-renderers.tsx
// is not touched.

import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { EntityForm, MappedJoinField, StringField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { MappedJoinFieldRenderer } from '../registry/mapped-join-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();
registerFieldRenderer('mappedJoin', MappedJoinFieldRenderer);

function collaboForm(): EntityForm {
  return new EntityForm('CollaboEntityForm', '/collabo').addFields({
    items: [
      new StringField('title', 100).withRequired(true).withLabel('Title'),
      new MappedJoinField('collegeId', 200).withDefaultValue('college-7'),
    ],
  });
}

describe('MappedJoinFieldRenderer — direct render', () => {
  it('renders a real <input type="hidden"> mirroring the store value', () => {
    const entityForm = collaboForm();
    const store = createFormStore(entityForm);
    const field = entityForm.getField('collegeId') as MappedJoinField;

    render(
      <UIProvider components={defaultUIComponents}>
        <FormStoreProvider store={store}>
          <MappedJoinFieldRenderer field={field} name="collegeId" />
        </FormStoreProvider>
      </UIProvider>,
    );

    const input = document.getElementById('collegeId') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.type).toBe('hidden');
    expect(input.value).toBe('college-7');
  });

  it('re-renders with the updated value when the store slice changes', () => {
    const entityForm = collaboForm();
    const store = createFormStore(entityForm);
    const field = entityForm.getField('collegeId') as MappedJoinField;

    render(
      <UIProvider components={defaultUIComponents}>
        <FormStoreProvider store={store}>
          <MappedJoinFieldRenderer field={field} name="collegeId" />
        </FormStoreProvider>
      </UIProvider>,
    );

    act(() => {
      store.getState().setValue('collegeId', 'college-42');
    });

    const input = document.getElementById('collegeId') as HTMLInputElement;
    expect(input.value).toBe('college-42');
  });
});

describe('MappedJoinField inside a live form (conductor decision ⑥: isHidden() override + toSaveData)', () => {
  it('is never mounted by FieldRenderer (always-hidden override wins over the field wrapper)', async () => {
    const entityForm = collaboForm();
    const store = createFormStore(entityForm);

    render(
      <UIProvider components={defaultUIComponents}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm entityForm={entityForm} store={store} />
          </FormStoreProvider>
        </AuthProvider>
      </UIProvider>,
    );

    // the sibling visible field mounts normally...
    await screen.findByLabelText(/^Title/);
    // ...but the MappedJoin field's wrapper never appears: FieldRenderer
    // returns null before dispatching to any registered renderer once
    // isHidden() resolves true (react/src/components/FieldRenderer.tsx:88).
    await waitFor(() => {
      expect(document.querySelector('[data-field-name="collegeId"]')).toBeNull();
    });
    expect(document.getElementById('collegeId')).toBeNull();
  });

  it('still reaches toSaveData() despite never being rendered', async () => {
    const entityForm = collaboForm();
    const store = createFormStore(entityForm);

    render(
      <UIProvider components={defaultUIComponents}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm entityForm={entityForm} store={store} />
          </FormStoreProvider>
        </AuthProvider>
      </UIProvider>,
    );

    await screen.findByLabelText(/^Title/);

    // the declared withDefaultValue seed survives round-trip through the
    // store even though nothing ever rendered it.
    expect(store.getState().toSaveData().collegeId).toBe('college-7');

    // a programmatic write (e.g. a sibling field's onChanges cascade writing
    // the join key) also survives — this is the field's whole reason to
    // exist: carry a key the user never directly edits.
    act(() => {
      store.getState().setValue('collegeId', 'college-99');
    });
    expect(store.getState().toSaveData().collegeId).toBe('college-99');
  });
});
