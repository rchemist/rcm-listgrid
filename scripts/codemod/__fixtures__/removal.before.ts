declare const ef: any;
declare const field: any;

// rule 5: withShouldReload(...) dropped — standalone statement removed entirely
ef.withShouldReload(true);

// rule 5: withShouldReload(...) dropped — mid-chain, receiver keeps chaining
ef.withLabel('x').withShouldReload(true).withRequired(true);

// rule 9: withFieldToLayout(...) dropped — standalone statement removed entirely
ef.withFieldToLayout('half');

// rule 9: withFieldToLayout(...) dropped — mid-chain
field.withLabel('y').withFieldToLayout('full').withOrder(1);
