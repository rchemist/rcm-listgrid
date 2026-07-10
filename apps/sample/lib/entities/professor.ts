import { EntityForm, StringField, SubCollectionField } from '@listgrid/schema-core';
import { DegreeEntityForm } from './degree';

// Professor — the ManyToOne target of College.dean (charter C3), now also
// carrying a `degrees` SubCollection (OneToMany) edited inline (charter C3).
export const professorFetchUrl = '/professor';

export function ProfessorEntityForm(): EntityForm {
  return new EntityForm('ProfessorEntityForm', professorFetchUrl).withTitle('교수').addFields({
    items: [
      new StringField('name', 100).withRequired(true).withLabel('교수명'),
      new StringField('email', 110).withLabel('이메일'),
      new SubCollectionField('degrees', 120, {
        childEntityForm: () => DegreeEntityForm(),
      }).withLabel('학위'),
    ],
  });
}
