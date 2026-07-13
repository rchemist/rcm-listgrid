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

function AddFieldsStructureForm(): EntityForm {
  return BaseProofForm()
    .withTitle('addFields structure proof')
    .addFields({
      items: [new StringField('explicit', 50).withLabel('Explicit field')],
      tab: { id: 'explicit', label: 'Explicit tab', order: 20 },
      group: { id: 'explicit-group', label: 'Explicit group', order: 20 },
    })
    .addFields({
      items: [new StringField('earlier', 60).withLabel('Earlier field')],
      tab: { id: 'earlier', label: 'Earlier tab', order: 10 },
      group: { id: 'earlier-group', label: 'Earlier group', order: 10 },
    })
    .addFields({
      items: [new StringField('hiddenTabField', 70).withLabel('Hidden tab field')],
      tab: { id: 'hidden', label: 'Hidden tab', order: 30, hidden: true },
    })
    .addFields({
      items: [new StringField('adminTabField', 80).withLabel('Admin tab field')],
      tab: { id: 'admin', label: 'Admin tab', order: 40, requiredPermissions: ['ADMIN'] },
    })
    .addFields({
      items: [new StringField('deniedTabField', 90).withLabel('Denied tab field')],
      tab: {
        id: 'denied',
        label: 'Denied tab',
        order: 50,
        requiredPermissions: ['SUPERADMIN'],
      },
    })
    .addFields({
      items: [new StringField('adminGroupField', 100).withLabel('Admin group field')],
      tab: { id: 'default' },
      group: {
        id: 'admin-group',
        label: 'Admin group',
        order: 10,
        requiredPermissions: ['ADMIN'],
      },
    })
    .addFields({
      items: [new StringField('deniedGroupField', 110).withLabel('Denied group field')],
      tab: { id: 'default' },
      group: {
        id: 'denied-group',
        label: 'Denied group',
        order: 20,
        requiredPermissions: ['SUPERADMIN'],
      },
    });
}

function WithoutFieldStructureForm(): EntityForm {
  return BaseProofForm()
    .withTitle('withoutField structure proof')
    .withoutField('note')
    .withoutField('missing');
}

function WithoutTabStructureForm(): EntityForm {
  return BaseProofForm()
    .withTitle('withoutTab structure proof')
    .addFields({
      items: [new StringField('removedTabField', 50).withLabel('Removed tab field')],
      tab: { id: 'removed', label: 'Removed tab', order: 10 },
    })
    .withoutTab('removed')
    .withoutTab('missing');
}

function WithTabStructureForm(): EntityForm {
  return BaseProofForm()
    .withTitle('withTab structure proof')
    .addFields({
      items: [new StringField('patchedTabField', 50).withLabel('Patched tab field')],
      tab: { id: 'patched', label: 'Old tab', order: 20 },
    })
    .addFields({
      items: [new StringField('anchorTabField', 60).withLabel('Anchor tab field')],
      tab: { id: 'anchor', label: 'Anchor tab', order: 10 },
    })
    .addFields({
      items: [new StringField('staticHiddenField', 70).withLabel('Static hidden field')],
      tab: { id: 'static-hidden', label: 'Static hidden tab', order: 30 },
    })
    .addFields({
      items: [new StringField('conditionalHiddenField', 80).withLabel('Conditional field')],
      tab: { id: 'conditional-hidden', label: 'Conditional tab', order: 40 },
    })
    .addFields({
      items: [new StringField('deniedPatchedField', 90).withLabel('Denied patched field')],
      tab: { id: 'denied-patched', label: 'Denied old', order: 50 },
    })
    .withTab('patched', { label: 'Patched tab' })
    .withTab('patched', { order: 5 })
    .withTab('static-hidden', { hidden: true })
    .withTab('static-hidden', { label: 'Static hidden patched' })
    .withTab('conditional-hidden', { hidden: { onCreate: true, onUpdate: false } })
    .withTab('denied-patched', { requiredPermissions: ['SUPERADMIN'] })
    .withTab('denied-patched', { label: 'Denied patched' });
}

function WithGroupStructureForm(): EntityForm {
  return BaseProofForm()
    .withTitle('withGroup structure proof')
    .addFields({
      items: [new StringField('lateGroupField', 50).withLabel('Late group field')],
      tab: { id: 'default' },
      group: { id: 'late', label: 'Late old', order: 30 },
    })
    .addFields({
      items: [new StringField('earlyGroupField', 60).withLabel('Early group field')],
      tab: { id: 'default' },
      group: { id: 'early', label: 'Early old', order: 20 },
    })
    .addFields({
      items: [new StringField('allowedGroupField', 70).withLabel('Allowed group field')],
      tab: { id: 'default' },
      group: { id: 'allowed', label: 'Allowed group', order: 40 },
    })
    .addFields({
      items: [new StringField('groupDeniedField', 80).withLabel('Group denied field')],
      tab: { id: 'default' },
      group: { id: 'group-denied', label: 'Group denied', order: 50 },
    })
    .withGroup('wrong-tab', 'early', { label: 'Early patched' })
    .withGroup('another-wrong-tab', 'early', { order: 5 })
    .withGroup('default', 'late', { label: 'Late patched' })
    .withGroup('default', 'late', { order: 10 })
    .withGroup('default', 'allowed', { requiredPermissions: ['ADMIN'] })
    .withGroup('default', 'group-denied', { requiredPermissions: ['SUPERADMIN'] });
}

function WithStepsStructureForm(allHidden = false): EntityForm {
  const form = BaseProofForm().withTitle('withSteps structure proof');
  form.withSteps([{ id: 'old', label: 'Old step', fields: ['name'] }]);
  if (allHidden) {
    return form.withSteps([
      { id: 'hidden-one', label: 'Hidden one', order: 1, fields: ['name'], hidden: true },
      {
        id: 'hidden-two',
        label: 'Hidden two',
        order: 2,
        fields: ['note'],
        hidden: { onCreate: true },
      },
    ]);
  }
  return form.withSteps([
    {
      id: 'details',
      label: 'Details step',
      order: 20,
      fields: ['category', 'note'],
      description: 'Details description',
    },
    {
      id: 'static-hidden',
      label: 'Static hidden step',
      order: 15,
      fields: ['status'],
      hidden: true,
    },
    {
      id: 'conditional-hidden',
      label: 'Conditional hidden step',
      order: 16,
      fields: ['status'],
      hidden: { onCreate: true },
    },
    { id: 'identity', label: 'Identity step', order: 10, fields: ['name', 'status'] },
  ]);
}

function WithStepsValidationForm(): EntityForm {
  return BaseProofForm()
    .withTitle('withSteps validation proof')
    .withSteps([
      { id: 'identity', label: 'Identity step', order: 10, fields: ['name'] },
      { id: 'details', label: 'Details step', order: 20, fields: ['note'] },
    ]);
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
    case 'add-fields--efs-14a':
    case 'add-fields--efs-14b':
    case 'add-fields--efs-14c':
    case 'add-fields--efs-14d':
    case 'add-fields--efs-14e':
    case 'add-fields--efs-14f':
      return AddFieldsStructureForm().withId(id);
    case 'without-field--efs-15a':
    case 'without-field--efs-15b':
      return WithoutFieldStructureForm().withId(id);
    case 'without-tab--efs-16a':
    case 'without-tab--efs-16b':
      return WithoutTabStructureForm().withId(id);
    case 'with-tab--efs-17a':
    case 'with-tab--efs-17b':
    case 'with-tab--efs-17c':
    case 'with-tab--efs-17d':
    case 'with-tab--efs-17e':
    case 'with-tab--efs-17f':
    case 'with-tab--p-05':
      return WithTabStructureForm().withId(id);
    case 'with-group--efs-18a':
    case 'with-group--efs-18b':
    case 'with-group--efs-18d':
    case 'with-group--efs-18e':
    case 'with-group--efs-18f':
      return WithGroupStructureForm().withId(id);
    case 'with-steps--efs-19a':
    case 'with-steps--efs-19b':
    case 'with-steps--efs-19c':
    case 'with-steps--efs-19d':
    case 'with-steps--efs-19e':
    case 'with-steps--efs-19g':
      return WithStepsStructureForm().withId(id);
    case 'with-steps--efs-19f':
      return WithStepsStructureForm(true).withId(id);
    case 'with-steps--p-06':
      return WithStepsValidationForm().withId(id);
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
