import {
  EntityForm,
  SelectField,
  StringField,
  TextareaField,
  type SelectOption,
} from '@listgrid/schema-core';

export interface EntityFormProofRow {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  category: 'A' | 'B';
  note: string;
  [key: string]: unknown;
}

const statuses: SelectOption[] = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
];

const categories: SelectOption[] = [
  { label: 'Category A', value: 'A' },
  { label: 'Category B', value: 'B' },
];

export function EntityFormProofCase(caseId: string, id?: string): EntityForm {
  return new EntityForm('EntityFormProof', '/entityform-proof')
    .withTitle(`EntityForm proof — ${caseId}`)
    .withId(id)
    .addFields({
      items: [
        new StringField('name', 10).withLabel('Name').withRequired(true).withList(),
        new SelectField('status', 20, statuses)
          .withLabel('Status')
          .withDefaultValue('ACTIVE')
          .withList(),
        new SelectField('category', 30, categories)
          .withLabel('Category')
          .withDefaultValue('A')
          .withList(),
        new TextareaField('note', 40, 3).withLabel('Note').withList(),
      ],
    });
}
