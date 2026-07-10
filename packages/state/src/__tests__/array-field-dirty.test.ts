import { describe, expect, it } from 'vitest';
import { CheckboxField, EntityForm, MultiSelectField, TagField } from '@listgrid/schema-core';
import { createFormStore } from '../form-store';

// EA-B0 PART D item 6 (EA-B1) — the shared normalizeEmptyValue fix, exercised
// through the actual store + EA-A array-valued field classes (not just the
// raw value.ts slice), since these are the real consumers of the systemic
// gap: create-mode current=[] with no declared default used to be
// misjudged dirty=true.

function ArrayFieldsForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [
      new CheckboxField('tags1', 1).withOptions([
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
      ]),
      new MultiSelectField('tags2', 2).withOptions([
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
      ]),
      new TagField('tags3', 3),
    ],
  });
}

describe.each([
  ['CheckboxField', 'tags1'],
  ['MultiSelectField', 'tags2'],
  ['TagField', 'tags3'],
])('%s array isDirty (EA-B1 regression)', (_label, fieldName) => {
  it('create mode: current=[] with no declared default -> not dirty', () => {
    const store = createFormStore(ArrayFieldsForm());
    store.getState().setValue(fieldName, []);
    expect(store.getState().fields[fieldName].dirty).toBe(false);
    expect(store.getState().isDirty()).toBe(false);
  });

  it('create mode: current with >=1 item -> dirty', () => {
    const store = createFormStore(ArrayFieldsForm());
    store.getState().setValue(fieldName, ['a']);
    expect(store.getState().fields[fieldName].dirty).toBe(true);
    expect(store.getState().isDirty()).toBe(true);
  });

  it('update mode: fetched=["a"] then edited back to ["a"] -> not dirty', () => {
    const store = createFormStore(ArrayFieldsForm());
    store.getState().hydrate({ [fieldName]: ['a'] });
    store.getState().setValue(fieldName, ['b']); // dirty in between
    expect(store.getState().fields[fieldName].dirty).toBe(true);
    store.getState().setValue(fieldName, ['a']); // back to fetched baseline
    expect(store.getState().fields[fieldName].dirty).toBe(false);
    expect(store.getState().isDirty()).toBe(false);
  });
});
