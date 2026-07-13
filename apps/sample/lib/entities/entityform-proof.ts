import {
  EntityForm,
  SelectField,
  StringField,
  TextareaField,
  getCurrentValue,
  type DataFieldSpec,
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

function ExplicitTransferFields(): DataFieldSpec[] {
  return [
    { name: 'id', label: 'ID', type: 'text' },
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'status', label: 'Status', type: 'select' },
    { name: 'category', label: 'Category', type: 'select' },
    { name: 'note', label: 'Note', type: 'textarea' },
  ];
}

function DataTransferProofForm(
  mode: 'auto' | 'explicit' | 'file-name' | 'replace' | 'independent' | 'field-mutation',
): EntityForm {
  if (mode === 'auto') {
    return BaseProofForm().withDataTransfer({ export: {}, import: {} });
  }
  if (mode === 'explicit') {
    return BaseProofForm().withDataTransfer({
      export: { fields: ExplicitTransferFields() },
      import: { fields: ExplicitTransferFields() },
    });
  }
  if (mode === 'file-name') {
    return BaseProofForm().withDataTransfer({
      export: { fields: ExplicitTransferFields(), fileName: 'EntityForm Proof' },
      import: { fields: ExplicitTransferFields() },
    });
  }
  if (mode === 'replace') {
    return BaseProofForm()
      .withDataTransfer({ export: { fields: [{ name: 'id', label: 'Old ID', type: 'text' }] } })
      .withDataTransfer({ import: { fields: [{ name: 'name', label: 'Replacement Name' }] } });
  }
  if (mode === 'independent') {
    return BaseProofForm().withDataTransfer({
      export: { fields: [{ name: 'id', label: 'Export ID', type: 'text' }] },
      import: {},
    });
  }
  return BaseProofForm()
    .withDataTransfer({ export: {}, import: {} })
    .addFields({ items: [new StringField('late', 50).withLabel('Late field').withList()] })
    .withoutField('note');
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

function TracedLifecycleForm(title: string): { form: EntityForm; trace: string[] } {
  const trace: string[] = [];
  return {
    form: BaseProofForm().withTitle(title).withMeta({ lifecycleTrace: trace }),
    trace,
  };
}

function OnChangeLifecycleForm(): EntityForm {
  const { form, trace } = TracedLifecycleForm('onChange lifecycle proof');
  return form
    .onChange((mutator, changedField) => {
      if (changedField !== 'name') return;
      trace.push('change:first');
      mutator.setValue('note', `changed:${String(mutator.getValue('name'))}`);
      mutator.setMeta('note', { readOnly: true });
      mutator.addField(new StringField('dynamic', 50).withLabel('Dynamic field'));
    })
    .onChange((_mutator, changedField) => {
      if (changedField === 'name') trace.push('change:second');
    });
}

function OnInitLifecycleForm(): EntityForm {
  const { form, trace } = TracedLifecycleForm('onInit lifecycle proof');
  return form
    .onInit((ctx) => {
      trace.push(`init:first:${ctx.data ? 'data' : 'empty'}`);
      if (ctx.data) ctx.values.set('note', 'init data override');
      else ctx.values.setFetched('name', 'init clean baseline');
      ctx.setMeta('category', { readOnly: true });
      ctx.form.addFields({
        items: [new StringField('initAdded', 50).withLabel('Init added field')],
      });
    })
    .onInit(() => {
      trace.push('init:second');
    });
}

function BeforeSaveLifecycleForm(mode: 'transform' | 'cancel-reason' | 'cancel-empty' | 'throw') {
  const { form, trace } = TracedLifecycleForm(`onBeforeSave ${mode} proof`);
  if (mode === 'cancel-reason') {
    return form.onBeforeSave((ctx) => {
      trace.push('before:cancel-reason');
      ctx.cancel('save cancelled by proof');
    });
  }
  if (mode === 'cancel-empty') {
    return form.onBeforeSave((ctx) => {
      trace.push('before:cancel-empty');
      ctx.cancel();
    });
  }
  if (mode === 'throw') {
    return form
      .onBeforeSave(() => {
        trace.push('before:throw');
        throw new Error('before-save proof throw');
      })
      .onBeforeSave((ctx) => {
        trace.push('before:after-throw');
        ctx.setData({ ...ctx.data, note: 'after throw' });
      });
  }
  return form
    .onBeforeSave((ctx) => {
      trace.push(`before:first:${String(ctx.values.name)}:${ctx.renderType}`);
      ctx.setData({ ...ctx.data, note: 'first' });
    })
    .onBeforeSave((ctx) => {
      trace.push(`before:second:${String(ctx.data.note)}`);
      ctx.setData({ ...ctx.data, note: `${String(ctx.data.note)}-second` });
    });
}

function AfterSaveLifecycleForm(): EntityForm {
  const { form, trace } = TracedLifecycleForm('onAfterSave lifecycle proof');
  return form
    .onAfterSave((ctx) => {
      const result = ctx.result as { id?: string };
      trace.push(`after:first:${result.id ?? 'missing'}:${ctx.renderType}`);
      ctx.mutator.setValue('note', `saved:${result.id ?? 'missing'}`);
    })
    .onAfterSave(() => {
      trace.push('after:throw');
      throw new Error('after-save proof throw');
    })
    .onAfterSave((ctx) => {
      trace.push(`after:last:${String(ctx.mutator.getValue('note'))}`);
    });
}

function SavePairLifecycleForm(): EntityForm {
  const { form, trace } = TracedLifecycleForm('save pairwise lifecycle proof');
  return form
    .onBeforeSave((ctx) => {
      trace.push('pair:before');
      ctx.setData({ ...ctx.data, note: 'pair transformed' });
    })
    .onAfterSave((ctx) => {
      trace.push(`pair:after:${String(ctx.data.note)}`);
    });
}

function BeforeDeleteLifecycleForm(mode: 'observe' | 'cancel-reason' | 'cancel-empty' | 'throw') {
  const { form, trace } = TracedLifecycleForm(`onBeforeDelete ${mode} proof`);
  if (mode === 'cancel-reason') {
    return form.onBeforeDelete((ctx) => {
      trace.push(`delete:cancel-reason:${ctx.ids.join(',')}`);
      ctx.cancel('delete cancelled by proof');
    });
  }
  if (mode === 'cancel-empty') {
    return form.onBeforeDelete((ctx) => {
      trace.push(`delete:cancel-empty:${ctx.ids.join(',')}`);
      ctx.cancel();
    });
  }
  if (mode === 'throw') {
    return form
      .onBeforeDelete(() => {
        trace.push('delete:throw');
        throw new Error('before-delete proof throw');
      })
      .onBeforeDelete((ctx) => {
        trace.push(`delete:after-throw:${ctx.ids.join(',')}`);
      });
  }
  return form
    .onBeforeDelete((ctx) => {
      trace.push(`delete:first:${ctx.ids.join(',')}`);
    })
    .onBeforeDelete(() => {
      trace.push('delete:second');
    });
}

function AfterDeleteLifecycleForm(): EntityForm {
  const { form, trace } = TracedLifecycleForm('onAfterDelete lifecycle proof');
  return form
    .onAfterDelete((ctx) => {
      trace.push(`deleted:first:${ctx.ids.join(',')}`);
    })
    .onAfterDelete(() => {
      trace.push('deleted:throw');
      throw new Error('after-delete proof throw');
    })
    .onAfterDelete(() => {
      trace.push('deleted:last');
    });
}

function DeletePairLifecycleForm(): EntityForm {
  const { form, trace } = TracedLifecycleForm('delete pairwise lifecycle proof');
  return form
    .onBeforeDelete((ctx) => {
      trace.push(`pair:before-delete:${ctx.ids.join(',')}`);
    })
    .onAfterDelete((ctx) => {
      trace.push(`pair:after-delete:${ctx.ids.join(',')}`);
    });
}

function RevisionLifecycleForm(enabled: boolean): EntityForm {
  const form = BaseProofForm().withTitle('revision lifecycle proof');
  return enabled
    ? form.withRevision('EntityFormProofRevision')
    : form.withRevision('stale-revision').withRevision(undefined);
}

function CapabilityProofForm(caseId: string): EntityForm {
  const form = BaseProofForm().withTitle('capability proof');
  switch (caseId) {
    case 'with-capabilities--efs-02a':
      return form.withCapabilities({ create: true });
    case 'with-capabilities--efs-02b':
      return form.withCapabilities({ create: false });
    case 'with-capabilities--efs-02c':
      return form.withCapabilities({ update: true });
    case 'with-capabilities--efs-02d':
      return form.withCapabilities({ update: false });
    case 'with-capabilities--efs-02e':
      return form.withCapabilities({ delete: true });
    case 'with-capabilities--efs-02f':
      return form.withCapabilities({ delete: false });
    case 'with-capabilities--efs-02g':
      return form.withCapabilities({
        create: async (ctx) =>
          ctx.renderType === 'create' && (ctx.session?.roles?.includes('ADMIN') ?? false),
      });
    case 'with-capabilities--efs-02h':
      return form.withCapabilities({
        create: async () => {
          await new Promise((resolve) => setTimeout(resolve, 2_000));
          return false;
        },
      });
    case 'with-capabilities--efs-02i':
      return form
        .withCapabilities({ create: false })
        .withCapabilities({ update: true, delete: false });
    default:
      return form;
  }
}

function ActionProofForm(caseId: string): EntityForm {
  const form = BaseProofForm().withTitle('action proof');
  switch (caseId) {
    case 'add-action--efs-04a':
      return form
        .addAction({ id: 'late', label: 'Action late', order: 20 })
        .addAction({ id: 'early', label: 'Action early', order: 10 });
    case 'add-action--efs-04b':
      return form
        .addAction({ id: 'hidden', label: 'Hidden action', visible: false })
        .addAction({ id: 'visible', label: 'Visible action', visible: true });
    case 'add-action--efs-04c':
      return form
        .addAction({ id: 'disabled', label: 'Disabled action', enabled: false })
        .addAction({ id: 'enabled', label: 'Enabled action', enabled: true });
    case 'add-action--efs-04d':
      return form.addAction({
        id: 'run',
        label: 'Run action',
        run: (ctx) => {
          ctx.mutator.setValue('note', 'action run');
        },
      });
    case 'add-action--efs-04e':
      return form.addAction({ id: 'render', render: () => 'Custom rendered action' });
    case 'add-action--efs-04f':
      return form.addAction({
        id: 'class',
        label: 'Class action',
        className: 'proof-action-class',
      });
    case 'add-action--efs-04g':
      return form.addAction({ id: 'variant', label: 'Danger action', variant: 'danger' });
    case 'add-action--efs-04h':
      return form.addAction({
        id: 'replacement-save',
        label: 'Replacement Save',
        replaces: 'save',
        run: (ctx) => {
          ctx.mutator.setValue('note', 'replacement save');
        },
      });
    case 'add-action--efs-04i':
      return form.addAction({
        id: 'replacement-delete',
        label: 'Replacement Delete',
        replaces: 'delete',
      });
    case 'add-action--efs-04j':
      return form.addAction({
        id: 'save',
        label: 'Collision Save',
        run: (ctx) => {
          ctx.mutator.setValue('note', 'collision save');
        },
      });
    default:
      return form;
  }
}

function ListLifecycleProofForm(): EntityForm {
  const { form, trace } = TracedLifecycleForm('list lifecycle proof');
  return form
    .onBeforeListFetch((ctx) => {
      trace.length = 0;
      const search = ctx.searchForm.toJSON();
      trace.push(
        `before:first:${search.filters.AND?.length ?? 0}:${search.filters.OR?.length ?? 0}`,
      );
      ctx.setSearchForm(
        ctx.searchForm.addAndFilter({
          name: 'status',
          value: 'ACTIVE',
          queryConditionType: 'EQUAL',
        }),
      );
    })
    .onBeforeListFetch((ctx) => {
      trace.push(
        `before:second:${ctx.searchForm.toJSON().filters.AND?.length ?? 0}:${ctx.session?.roles?.join(',') ?? 'none'}`,
      );
    })
    .onBeforeListFetch(() => {
      trace.push('before:throw');
      throw new Error('before-list proof throw');
    })
    .onBeforeListFetch((ctx) => {
      trace.push(`before:after-throw:${ctx.searchForm.toJSON().filters.AND?.length ?? 0}`);
    })
    .onAfterListFetch((ctx) => {
      trace.push(`after:first:${ctx.rows.length}:${ctx.totalElements}`);
      ctx.setRows(
        ctx.rows.map((row) => {
          const item = row as Record<string, unknown>;
          return { ...item, note: `${String(item.note)}|after:first` };
        }),
      );
    })
    .onAfterListFetch((ctx) => {
      const first = ctx.rows[0] as Record<string, unknown> | undefined;
      trace.push(`after:second:${String(first?.note)}`);
      ctx.setRows(
        ctx.rows.map((row) => {
          const item = row as Record<string, unknown>;
          return { ...item, note: `${String(item.note)}|after:second` };
        }),
      );
    })
    .onAfterListFetch(() => {
      trace.push('after:throw');
      throw new Error('after-list proof throw');
    })
    .onAfterListFetch((ctx) => {
      trace.push(`after:after-throw:${ctx.rows.length}`);
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
    case 'on-change--efs-06a':
    case 'on-change--efs-06b':
    case 'on-change--efs-06c':
    case 'on-change--efs-06d':
    case 'on-change--efs-06e':
    case 'on-change--p-04':
      return OnChangeLifecycleForm().withId(id);
    case 'on-init--efs-07a':
    case 'on-init--efs-07b':
    case 'on-init--efs-07c':
    case 'on-init--efs-07d':
    case 'on-init--efs-07e':
    case 'on-init--efs-07f':
    case 'on-init--efs-07g':
      return OnInitLifecycleForm().withId(id);
    case 'on-before-save--efs-08a':
    case 'on-before-save--efs-08b':
    case 'on-before-save--efs-08f':
      return BeforeSaveLifecycleForm('transform').withId(id);
    case 'on-before-save--p-07':
      return SavePairLifecycleForm().withId(id);
    case 'on-before-save--efs-08c':
      return BeforeSaveLifecycleForm('cancel-reason').withId(id);
    case 'on-before-save--efs-08d':
      return BeforeSaveLifecycleForm('cancel-empty').withId(id);
    case 'on-before-save--efs-08e':
      return BeforeSaveLifecycleForm('throw').withId(id);
    case 'on-after-save--efs-09a':
    case 'on-after-save--efs-09b':
    case 'on-after-save--efs-09c':
    case 'on-after-save--efs-09d':
      return AfterSaveLifecycleForm().withId(id);
    case 'on-before-delete--efs-10a':
      return BeforeDeleteLifecycleForm('observe').withId(id);
    case 'on-before-delete--efs-10b':
      return BeforeDeleteLifecycleForm('cancel-reason').withId(id);
    case 'on-before-delete--efs-10c':
      return BeforeDeleteLifecycleForm('cancel-empty').withId(id);
    case 'on-before-delete--efs-10d':
      return BeforeDeleteLifecycleForm('throw').withId(id);
    case 'on-before-delete--efs-10e':
      return BeforeDeleteLifecycleForm('observe').withId(id);
    case 'on-before-delete--p-08':
      return DeletePairLifecycleForm().withId(id);
    case 'on-after-delete--efs-11a':
    case 'on-after-delete--efs-11b':
    case 'on-after-delete--efs-11c':
      return AfterDeleteLifecycleForm().withId(id);
    case 'with-revision--efs-21a':
    case 'with-revision--efs-21e':
      return RevisionLifecycleForm(false).withId(id);
    case 'with-revision--efs-21b':
    case 'with-revision--efs-21c':
    case 'with-revision--efs-21d':
    case 'with-revision--p-10':
      return RevisionLifecycleForm(true).withId(id);
    case 'with-data-transfer--efs-22a':
      return DataTransferProofForm('auto').withId(id);
    case 'with-data-transfer--efs-22b':
      return DataTransferProofForm('explicit').withId(id);
    case 'with-data-transfer--efs-22c':
      return DataTransferProofForm('file-name').withId(id);
    case 'with-data-transfer--efs-22d':
      return DataTransferProofForm('replace').withId(id);
    case 'with-data-transfer--efs-22e':
      return DataTransferProofForm('independent').withId(id);
    case 'with-data-transfer--p-11':
      return DataTransferProofForm('field-mutation').withId(id);
    case 'validation--p-14':
      return BaseProofForm().withTitle('plural validation proof').withId(id);
    default:
      if (caseId.startsWith('with-capabilities--')) {
        return CapabilityProofForm(caseId).withId(id);
      }
      if (caseId.startsWith('add-action--')) {
        return ActionProofForm(caseId).withId(id);
      }
      if (
        caseId.startsWith('on-before-list-fetch--') ||
        caseId.startsWith('on-after-list-fetch--')
      ) {
        return ListLifecycleProofForm().withId(id);
      }
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
