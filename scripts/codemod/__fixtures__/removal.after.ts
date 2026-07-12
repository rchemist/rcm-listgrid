declare const ef: any;
declare const field: any;

// rule 5: withShouldReload(...) dropped — mid-chain, receiver keeps chaining
ef.withLabel('x').withRequired(true);

// rule 9: withFieldToLayout(...) dropped — mid-chain
field.withLabel('y').withOrder(1);
