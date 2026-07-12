declare const ef: any;

// rule 10: withDataTransferConfig -> withDataTransfer, export/import preserved
ef.withDataTransfer({
  export: { fields: ['name', 'email'] },
  import: { fields: ['name', 'email'] },
});

// rule 10: extra keys (urls/mode/sampleData/maxCount/description) are NOT
// silently dropped — left in place with a TODO marker comment.
/* TODO(0.4): withDataTransfer 최소표면 — 이 키는 수동 제거 (MIGRATION §data-transfer) */
ef.withDataTransfer({
  export: { fields: ['name'] },
  urls: { export: '/api/export' },
  mode: 'client',
});
