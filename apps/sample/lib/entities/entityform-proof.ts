import {
  EntityForm,
  SelectField,
  StringField,
  TextareaField,
  getCurrentValue,
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

function BaseProofForm(): EntityForm {
  return new EntityForm('EntityFormProof', '/entityform-proof/').addFields({
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

export function EntityFormProofCase(caseId: string, id?: string): EntityForm {
  const form = BaseProofForm().withId(id);
  switch (caseId) {
    case 'title-string':
      return form.withTitle('String title');
    case 'title-text':
      return form.withTitle({ text: 'Object text title' });
    case 'title-from-field':
      return form
        .withTitle({ text: ' ', fromField: 'note' })
        .onInit((ctx) => ctx.values.set('note', 'From field title'));
    case 'title-name':
      return form.onInit((ctx) => ctx.values.set('name', 'Name field title'));
    case 'title-id':
      return form.withoutField('name').withId(id ?? 'title-id-7');
    case 'title-entity':
      return form.withoutField('name');
    case 'title-replace':
      return form.withTitle('Old title').withTitle('Replacement title');
    case 'readonly-all':
      return form
        .withReadOnly()
        .addAction({
          id: 'replace-save',
          label: 'Replacement Save',
          replaces: 'save',
          run: () => {},
        })
        .addAction({ id: 'normal', label: 'Normal action', run: () => {} });
    case 'readonly-undefined':
      return form.withReadOnly(undefined);
    case 'readonly-clear':
      return form.withReadOnly(true).withReadOnly(false);
    case 'id-clear':
      return form.withId('stale-id').withId(undefined).withTitle('Cleared id create');
    case 'meta':
      return form
        .withTitle('Meta proof')
        .withMeta({ alpha: 1, replaced: 'old', removed: true, nested: { stable: true } })
        .withMeta({ beta: 2, replaced: 'new', removed: undefined });
    case 'query-wizard':
      return form.withTitle('Query wizard').withSteps([
        {
          id: 'identity',
          label: 'Identity step',
          fields: ['name', 'status', 'category', 'note'],
        },
      ]);
    case 'capability-id':
      return form.withTitle('Capability by id').withCapabilities({ create: false, update: true });
    case 'init-fetched':
      return form.withTitle('Init fetched clone').onInit((ctx) => {
        if (ctx.data) ctx.values.set('note', 'onInit fetched override');
      });
    case 'with-group--efs-18c':
      return form
        .withTitle('Collapsible group proof')
        .addFields({
          items: [new StringField('collapsed', 50).withLabel('Collapsed field')],
          tab: { id: 'default' },
          group: { id: 'collapsible', label: 'Collapsible group', order: 1 },
        })
        .withGroup('ignored-tab', 'collapsible', { open: false });
    default:
      return form.withTitle(`EntityForm proof — ${caseId}`);
  }
}

class ProofEntityFormSubclass extends EntityForm {}

export function EntityFormIdentityDiagnostics(): Record<string, unknown> {
  const original = BaseProofForm()
    .withMeta({ top: 'original', nested: { shared: true } })
    .withSteps([{ id: 'one', label: 'One', fields: ['name'] }])
    .addAction({ id: 'action', label: 'Original action', run: () => {} })
    .onChange(() => {});
  original.getField('name')?.withValue('clone-value');
  const withoutValues = original.clone(false);
  const withValues = original.clone(true);
  const clone = original.clone();
  clone.withMeta({ top: 'clone' });
  clone.getSteps()[0]?.fields.push('note');
  const cloneAction = clone.getActions()[0];
  if (cloneAction) cloneAction.label = 'Clone action';

  const originalNested = original.getMeta().nested;
  const cloneNested = clone.getMeta().nested;
  const subclass = new ProofEntityFormSubclass('ProofSubclass', '/subclass').clone();

  return {
    values: {
      without: getCurrentValue(withoutValues.getField('name')?.value),
      with: getCurrentValue(withValues.getField('name')?.value),
    },
    isolation: {
      topMeta: [original.getMeta().top, clone.getMeta().top],
      nestedShared: originalNested === cloneNested,
      steps: [original.getSteps()[0]?.fields, clone.getSteps()[0]?.fields],
      actions: [original.getActions()[0]?.label, clone.getActions()[0]?.label],
      hookArraysDistinct: original.getChangeHandlers() !== clone.getChangeHandlers(),
    },
    subclassPreserved: subclass instanceof ProofEntityFormSubclass,
  };
}
