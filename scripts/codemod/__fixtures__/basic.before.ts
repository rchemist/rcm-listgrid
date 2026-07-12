declare const ef: any;
declare const field: any;

// rule 1: useListField/withListConfig/useListFields -> withList
field.useListField();
field.withListConfig({ order: 1 });
field.useListFields();

// rule 2: withPlaceHolder -> withPlaceholder
field.withPlaceHolder('type here');

// rule 3: addCollections -> addFields, fieldGroup: -> group:
ef.addCollections({
  items: [field],
  fieldGroup: { id: 'g1', label: '그룹1' },
});
ef.addFields({
  items: [field],
  fieldGroup: { id: 'g2' },
});

// rule 4: getName()/getUrl() -> .name/.url
const n = ef.getName();
const u = ef.getUrl();

// rule 6: removeField -> withoutField, removeTab -> withoutTab
ef.removeField('legacy');
ef.removeTab('archived');

// rule 7: withSortable/withFilterable
field.withSortable();
field.withSortable(false);
field.withFilterable();
field.withFilterable(false);

// rule 8: withCreateStep -> withSteps (single object auto-wrapped)
ef.withCreateStep({ id: 'step1', label: 'Step 1', fields: ['a'] });
