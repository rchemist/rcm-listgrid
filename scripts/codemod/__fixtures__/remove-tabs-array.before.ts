declare const ef: any;
declare const tabIds: string[];

// rule 6 special case: removeTabs([...]) array literal expands into a
// .withoutTab(x) chain (arity mismatch — withoutTab(tabId: string) takes one).
ef.removeTabs(['archived', 'draft']);

// rule 6 special case: non-literal argument — renamed with a TODO marker,
// NOT expanded (can't safely spread a variable at codemod time).
ef.removeTabs(tabIds);
