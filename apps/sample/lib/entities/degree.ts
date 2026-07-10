import { EntityForm, NumberField, SelectField, StringField } from '@listgrid/schema-core';

// Degree — the child entity of Professor.degrees (charter C3 OneToMany). Edited
// inline inside the Professor form via the SubCollection table + an isolated
// child form store.
export function DegreeEntityForm(): EntityForm {
  return new EntityForm('DegreeEntityForm', '/degree').withTitle('학위').addFields({
    items: [
      new StringField('school', 100).withRequired(true).withLabel('학교'),
      new StringField('major', 110).withRequired(true).withLabel('전공'),
      new SelectField('degreeType', 120, [
        { value: 'BACHELOR', label: '학사' },
        { value: 'MASTER', label: '석사' },
        { value: 'DOCTOR', label: '박사' },
      ])
        .withLabel('학위구분')
        .withDefaultValue('DOCTOR'),
      new NumberField('year', 130).withLabel('취득연도'),
    ],
  });
}
