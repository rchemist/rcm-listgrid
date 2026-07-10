import { EntityForm, StringField } from '@listgrid/schema-core';

// Professor — the ManyToOne target of College.dean (charter C3). Minimal for
// V0.4b (the picker only needs name + a couple columns); the full Professor
// form with its own subcollections lands in V2.
export const professorFetchUrl = '/professor';

export function ProfessorEntityForm(): EntityForm {
  return new EntityForm('ProfessorEntityForm', professorFetchUrl).withTitle('교수').addFields({
    items: [
      new StringField('name', 100).withRequired(true).withLabel('교수명'),
      new StringField('email', 110).withLabel('이메일'),
    ],
  });
}
