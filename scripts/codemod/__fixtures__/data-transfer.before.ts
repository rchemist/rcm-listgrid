declare const ef: any;

// rule 10: withDataTransferConfig -> withDataTransfer, export/import preserved
ef.withDataTransferConfig({
  export: { fields: ['name', 'email'] },
  import: { fields: ['name', 'email'] },
});

// rule 10: extra keys (urls/mode/sampleData/maxCount/description) are NOT
// silently dropped — left in place with a TODO marker comment.
ef.withDataTransferConfig({
  export: { fields: ['name'] },
  urls: { export: '/api/export' },
  mode: 'client',
});
