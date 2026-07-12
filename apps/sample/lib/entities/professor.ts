import { EntityForm, StringField, SubCollectionField } from '@listgrid/schema-core';
import { DegreeEntityForm } from './degree';

// Professor — the ManyToOne target of College.dean (charter C3), now also
// carrying a `degrees` SubCollection (OneToMany) edited inline (charter C3).
export const professorFetchUrl = '/professor';

export function ProfessorEntityForm(): EntityForm {
  return new EntityForm('ProfessorEntityForm', professorFetchUrl).withTitle('교수').addFields({
    items: [
      // withList (spec §5.1; W5-2) — Professor's own list page passes no
      // explicit `columns` prop, AND ProfessorEntityForm is also rendered
      // implicit-columns as the College.dean / Collabo.professor / Major.
      // professors ManyToOne/XrefMapping PICKER target (many-to-one-
      // renderer.tsx / xref-mapping-renderer.tsx) — both derivation paths
      // now abolish the magic fallback, so `name` needs an explicit opt-in
      // for every one of those e2e flows to keep rendering.
      new StringField('name', 100).withRequired(true).withLabel('교수명').withList(),
      new StringField('email', 110).withLabel('이메일').withList(),
      new SubCollectionField('degrees', 120, {
        childEntityForm: () => DegreeEntityForm(),
      }).withLabel('학위'),
    ],
  });
}
