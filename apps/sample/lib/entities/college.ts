import {
  BooleanField,
  EntityForm,
  ManyToOneField,
  StringField,
  TextareaField,
} from '@listgrid/schema-core';
import { ProfessorEntityForm } from './professor';

// College — reimplemented on the new @listgrid/* engine, faithful to the GJCU
// production CollegeEntityForm (packages/entities/Academic/University/
// CollegeEntityForm.tsx) minus the dean ManyToOne (added in V0.4b) and the
// alias/externalId/status presets (V1). The declaration is the walking-skeleton
// proof: one factory yields both the list and the form (charter C1).

export const collegeFetchUrl = '/college';

export function CollegeEntityForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', collegeFetchUrl)
    .withTitle('단과대학')
    .addFields({
      items: [
        new StringField('name', 100).withRequired(true).withLabel('명칭'),
        new StringField('englishName', 110).withRequired(true).withLabel('영문명'),
        // dean — a ManyToOne reference to Professor via a LAZY thunk (decision
        // D1). Selecting opens a Modal ViewListGrid picker; save flattens to
        // deanId (charter C3).
        new ManyToOneField('dean', 115, {
          entityForm: () => ProfessorEntityForm(),
          labelField: 'name',
        }).withLabel('학장'),
        new BooleanField('active', 120).withLabel('사용여부').withDefaultValue(true),
      ],
    })
    .addFields({
      fieldGroup: { id: 'additional', label: '부가 정보', order: 200 },
      items: [new TextareaField('description', 210, 4).withLabel('대학 소개')],
    });
}
