// TagField renderer — JSDOM integration test (EA-A fan-out). Registers
// TagFieldRenderer directly (default-renderers.tsx is NOT touched — fan-out
// convention, briefing PART 1 "Test idioms"), then drives the real
// EntityForm -> createFormStore -> provider stack, same harness style as
// field-a11y.test.tsx / view-entity-form.test.tsx.
//
// NOTE on querying: FieldRenderer.tsx associates the field's <label
// htmlFor={fieldName}> with `id={fieldName}` on whatever the registered
// renderer puts that id on. The ui-default TagsInput primitive puts `id` on
// its wrapping <div>, which is not a "labelable" HTML element — so
// `screen.findByLabelText` throws ("non-labellable [...]") for this field.
// This is a pre-existing ui-default/primitives.tsx primitive (shared file,
// not owned by this task) — tests below query through the stable
// `[data-field-name="tags"]` wrapper FieldRenderer.tsx renders instead.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { EntityForm } from '@listgrid/schema-core';
// TagField is not yet re-exported from the @listgrid/schema-core barrel
// (shared file — registration is the fan-out orchestrator's job, per this
// task's hard rules); import the class straight from its module inside the
// sibling package so this suite is green standalone.
import { TagField } from '../../../schema-core/src/field/tag-field';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { TagFieldRenderer } from '../registry/tag-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('tag', TagFieldRenderer);

function tagsForm(field: TagField): EntityForm {
  return new EntityForm('SkillsEntityForm', '/skills').addFields({ items: [field] });
}

function renderForm(field: TagField, onSave = vi.fn()) {
  const entityForm = tagsForm(field);
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
  return { store };
}

/** The tag text input, scoped through the FieldRenderer wrapper. */
function tagTextInput(): HTMLInputElement {
  const wrapper = document.querySelector('[data-field-name="tags"]');
  if (!wrapper) throw new Error('tags field wrapper not found');
  return within(wrapper as HTMLElement).getByRole('textbox') as HTMLInputElement;
}

function addTag(raw: string) {
  const input = tagTextInput();
  fireEvent.change(input, { target: { value: raw } });
  fireEvent.keyDown(input, { key: 'Enter' });
}

describe('TagFieldRenderer (transplant of 0.3.x TagField.tsx:45-89)', () => {
  it('renders a label and a tag text input', async () => {
    renderForm(new TagField('tags', 100).withLabel('Tags'));
    expect(await screen.findByText('Tags')).toBeInTheDocument();
    expect(tagTextInput()).toBeInTheDocument();
  });

  it('adding a tag (Enter) writes it into the store as string[]', async () => {
    const { store } = renderForm(new TagField('tags', 100).withLabel('Tags'));
    await screen.findByText('Tags');

    addTag('react');
    await waitFor(() => expect(store.getState().getValue('tags')).toEqual(['react']));

    addTag('vue');
    await waitFor(() => expect(store.getState().getValue('tags')).toEqual(['react', 'vue']));
  });

  it('field.options are forwarded to the renderer as suggestions (datalist)', async () => {
    const field = new TagField('tags', 100).withLabel('Tags').withOptions([
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
    ]);
    renderForm(field);
    await screen.findByText('Tags');

    const wrapper = document.querySelector('[data-field-name="tags"]') as HTMLElement;
    const options = Array.from(wrapper.querySelectorAll('datalist option')).map(
      (o) => (o as HTMLOptionElement).value,
    );
    expect(options).toEqual(['react', 'vue']);
  });

  it('maxTags (field.limit.max) is forwarded and rejects a tag past the cap', async () => {
    const { store } = renderForm(new TagField('tags', 100).withLabel('Tags').withLimit({ max: 1 }));
    await screen.findByText('Tags');

    addTag('react');
    await waitFor(() => expect(store.getState().getValue('tags')).toEqual(['react']));

    addTag('vue');
    expect(await screen.findByRole('alert')).toHaveTextContent(/최대 1개/);
    // rejected tag never reaches the store
    expect(store.getState().getValue('tags')).toEqual(['react']);
  });

  it('distinctive TagField pitfall: field.tagValidation is a renderer-level per-tag async gate, passed through verbatim (not a Validation catalog entry)', async () => {
    const tagValidation = vi.fn(async (value: string) =>
      value === 'blocked' ? { valid: false, message: '금지된 태그입니다' } : { valid: true },
    );
    const field = new TagField('tags', 100).withLabel('Tags').withTagValidation(tagValidation);
    const { store } = renderForm(field);
    await screen.findByText('Tags');

    // rejected tag: onValidateTag fires, tag is kept out of the store, error surfaces
    addTag('blocked');
    expect(await screen.findByRole('alert')).toHaveTextContent('금지된 태그입니다');
    expect(store.getState().getValue('tags')).toBeUndefined();

    // accepted tag: passes through onValidateTag and lands in the store
    addTag('ok');
    await waitFor(() => expect(store.getState().getValue('tags')).toEqual(['ok']));
    expect(tagValidation).toHaveBeenCalledWith('blocked');
    expect(tagValidation).toHaveBeenCalledWith('ok');
  });

  it('a11y: required tag field carries aria-required; save validates min-count via inherited MultiOptionsField.validate()', async () => {
    const onSave = vi.fn();
    const field = new TagField('tags', 100)
      .withLabel('Tags')
      .withRequired(true)
      .withLimit({ min: 1 });
    renderForm(field, onSave);
    await screen.findByText('Tags');

    await waitFor(() => expect(tagTextInput()).toHaveAttribute('aria-required', 'true'));

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(await screen.findByText(/필수 값입니다/)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('EA-R1 #3: setMeta({options}) reshapes the suggestion datalist (EF1 meta-options override, same convention as MultiSelectRenderer)', async () => {
    const field = new TagField('tags', 100).withLabel('Tags').withOptions([
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
    ]);
    const { store } = renderForm(field);
    await screen.findByText('Tags');
    const wrapper = () => document.querySelector('[data-field-name="tags"]') as HTMLElement;
    const optionValues = () =>
      Array.from(wrapper().querySelectorAll('datalist option')).map(
        (o) => (o as HTMLOptionElement).value,
      );
    expect(optionValues()).toEqual(['react', 'vue']);

    store.getState().setMeta('tags', { options: [{ value: 'go', label: 'Go' }] });

    await waitFor(() => expect(optionValues()).toEqual(['go']));
  });
});
