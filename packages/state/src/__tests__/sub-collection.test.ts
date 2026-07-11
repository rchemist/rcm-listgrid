import { describe, expect, it } from 'vitest';
import { EntityForm, NumberField, StringField, SubCollectionField } from '@listgrid/schema-core';
import { createFormStore } from '../form-store';

// V2 oracle (D5) — the SubCollectionField declaration + how its array value
// flows through the form store (charter C3 OneToMany). The renderer-level
// behavior (child modal / isolated child store) is proven by e2e/professor.spec.

function DegreeForm(): EntityForm {
  return new EntityForm('DegreeEntityForm', '/degree').addFields({
    items: [new StringField('school', 100).withRequired(true), new NumberField('year', 110)],
  });
}
function ProfessorForm(): EntityForm {
  return new EntityForm('ProfessorEntityForm', '/professor').addFields({
    items: [
      new StringField('name', 100).withRequired(true),
      new SubCollectionField('degrees', 120, { childEntityForm: () => DegreeForm() }),
    ],
  });
}

describe('SubCollectionField declaration (charter C3)', () => {
  it('is a subCollection-typed field with a lazy child-form thunk (D1)', () => {
    const field = ProfessorForm().getField('degrees') as SubCollectionField;
    expect(field.type).toBe('subCollection');
    expect(field.getVariant()).toBe('table');
    const child = field.getChildEntityForm();
    expect(child.name).toBe('DegreeEntityForm');
    expect(child.getFields().map((f) => f.getName())).toEqual(['school', 'year']);
  });
});

describe('SubCollection value in the form store', () => {
  it('holds an array and includes it verbatim in the save payload (not flattened)', () => {
    const store = createFormStore(ProfessorForm());
    store.getState().setValue('name', '김철수');
    store.getState().setValue('degrees', [
      { school: '서울대학교', year: 2015 },
      { school: '카이스트', year: 2018 },
    ]);

    expect(store.getState().getValue('degrees')).toHaveLength(2);
    expect(store.getState().isDirty()).toBe(true);

    const save = store.getState().toSaveData();
    expect(save.name).toBe('김철수');
    expect(save.degrees).toEqual([
      { school: '서울대학교', year: 2015 },
      { school: '카이스트', year: 2018 },
    ]);
    // subCollection is NOT id-flattened (only manyToOne is)
    expect(save.degreesId).toBeUndefined();
  });

  it('an added-then-emptied collection round-trips', () => {
    const store = createFormStore(ProfessorForm());
    store.getState().setValue('degrees', [{ school: 'A', year: 2000 }]);
    store.getState().setValue('degrees', []);
    expect(store.getState().getValue('degrees')).toEqual([]);
    expect(store.getState().toSaveData().degrees).toEqual([]);
  });
});
