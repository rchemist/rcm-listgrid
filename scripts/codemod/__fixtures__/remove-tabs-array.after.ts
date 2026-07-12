declare const ef: any;
declare const tabIds: string[];

// rule 6 special case: removeTabs([...]) array literal expands into a
// .withoutTab(x) chain (arity mismatch — withoutTab(tabId: string) takes one).
ef.withoutTab('archived').withoutTab('draft');

// rule 6 special case: non-literal argument — renamed with a TODO marker,
// NOT expanded (can't safely spread a variable at codemod time).
/* TODO(0.4): removeTabs 배열 인자 — 개별 withoutTab 호출로 수동 전개 */
ef.withoutTab(tabIds);
