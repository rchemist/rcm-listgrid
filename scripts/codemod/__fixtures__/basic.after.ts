declare const ef: any;
declare const field: any;

// rule 1: useListField/withListConfig/useListFields -> withList
field.withList();
field.withList({ order: 1 });
ef.withList('name', 'status');

// rule 2: withPlaceHolder -> withPlaceholder
field.withPlaceholder('type here');

// rule 3: addCollections -> addFields, fieldGroup: -> group:
ef.addFields({
  items: [field],
  group: { id: 'g1', label: '그룹1' },
});
ef.addFields({
  items: [field],
  group: { id: 'g2' },
});

// rule 4: getName()/getUrl() -> .name/.url
const n = ef.name;
const u = ef.url;

// rule 6: removeField -> withoutField, removeTab -> withoutTab
ef.withoutField('legacy');
ef.withoutTab('archived');

// rule 7: withSortable/withFilterable
field.withList({
  sortable: true
});
field.withList({
  sortable: false
});
field.withFilter();
field.withFilter(false);

// rule 8: withCreateStep -> withSteps (single object auto-wrapped)
ef.withSteps([{ id: 'step1', label: 'Step 1', fields: ['a'] }]);
