/**
 * jscodeshift transform — 0.3.x → 0.4.0 MECHANICAL renames only.
 *
 * Scope (waves entityform-api-implementation-waves.md §W7 결정5 · spec §9):
 * covers exactly the `방식=codemod`/mechanical rows of the §9 migration
 * table (docs/MIGRATION.md §1). "수동"/value-semantic rows (hooks
 * `(ef)`→`(ctx/mutator)`, setValue/getValue, onSave, client-ext,
 * serializeValue, name-key sugar, wrappers, …) are DELIBERATELY NOT
 * handled here — see MIGRATION.md for their 1:1 guidance. Mixing them in
 * would risk 오변환 (mistranslation) on code this transform cannot safely
 * reason about (runtime semantics, not syntax).
 *
 * Rules (numbered to match the W7-4 briefing / MIGRATION.md §1 codemod
 * callouts):
 *   1. .useListField()/.withListConfig()/.useListFields() → .withList()
 *   2. .withPlaceHolder( → .withPlaceholder(
 *   3. .addCollections( → .addFields(  +  object key fieldGroup: → group:
 *   4. .getName() → .name ; .getUrl() → .url  (call → property access)
 *   5. .withShouldReload(...) → removed from the chain
 *   6. .removeField( → .withoutField( ; .removeTabs(/.removeTab( → .withoutTab(
 *   7. .withSortable(arg?) → .withList({sortable: <bool>})
 *      .withFilterable(arg?) → .withFilter() / .withFilter(false)
 *   8. .withCreateStep( → .withSteps(  (single-object arg auto-wrapped in [])
 *   9. .withFieldToLayout(...) → removed from the chain (per-field)
 *  10. .withDataTransferConfig({...}) → .withDataTransfer({...})
 *      (export/import keys preserved; other keys get a TODO marker comment)
 *
 * Usage (consumer repos, after installing @rchemist/listgrid 0.4):
 *   npx jscodeshift -t node_modules/@rchemist/listgrid/scripts/codemod/v0.4.cjs \
 *     --parser=tsx --extensions=ts,tsx <path-glob>
 *
 * Run --dry first (no `-d` here — add it yourself) to review the diff before
 * writing. This repo's own before/after fixtures are exercised by
 * `npm run codemod:test` (scripts/codemod/run-tests.cjs).
 */

'use strict';

// Method names that are simple 1:1 renames — same callee shape, same args,
// only the identifier changes. Handles multiple 0.3.x names collapsing onto
// one 0.4 name (rule 1).
const SIMPLE_RENAMES = {
  useListField: 'withList',
  withListConfig: 'withList',
  useListFields: 'withList',
  withPlaceHolder: 'withPlaceholder', // rule 2
  addCollections: 'addFields', // rule 3 (method half)
  removeField: 'withoutField', // rule 6
  removeTab: 'withoutTab', // rule 6
  withCreateStep: 'withSteps', // rule 8 (method half)
  withDataTransferConfig: 'withDataTransfer', // rule 10 (method half)
};

// Calls that become a property access instead of a call (rule 4).
const CALL_TO_PROPERTY = {
  getName: 'name',
  getUrl: 'url',
};

// Calls that are dropped from their chain entirely (rules 5, 9).
const REMOVED_CALLS = new Set(['withShouldReload', 'withFieldToLayout']);

const DATA_TRANSFER_TODO =
  ' TODO(0.4): withDataTransfer 최소표면 — 이 키는 수동 제거 (MIGRATION §data-transfer) ';

module.exports = function transform(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let dirty = false;

  function calleeProp(node) {
    return node.callee &&
      node.callee.type === 'MemberExpression' &&
      !node.callee.computed &&
      node.callee.property.type === 'Identifier'
      ? node.callee.property.name
      : undefined;
  }

  // -- rule 3b: object key `fieldGroup:` -> `group:` inside
  // addFields()/addCollections() call arguments (top-level key only —
  // AddFieldsInput.group is a top-level field, spec §3.2). Runs BEFORE the
  // method rename below so it matches both the pre- and post-rename callee
  // name (order-independent).
  root
    .find(j.CallExpression)
    .filter((p) => {
      const name = calleeProp(p.node);
      return name === 'addFields' || name === 'addCollections';
    })
    .forEach((p) => {
      p.node.arguments.forEach((arg) => {
        if (arg.type !== 'ObjectExpression') return;
        arg.properties.forEach((prop) => {
          if (prop.type !== 'ObjectProperty' && prop.type !== 'Property') return;
          const key = prop.key;
          const isFieldGroup =
            (key.type === 'Identifier' && key.name === 'fieldGroup') ||
            (key.type === 'StringLiteral' && key.value === 'fieldGroup');
          if (!isFieldGroup) return;
          if (key.type === 'Identifier') {
            key.name = 'group';
          } else {
            key.value = 'group';
          }
          dirty = true;
        });
      });
    });

  // -- rule 6 special case: .removeTabs([...]) with an ARRAY LITERAL
  // argument expands into a .withoutTab(x) chain (arity mismatch — new
  // withoutTab(tabId: string) takes one id, old removeTabs took an array).
  // A non-literal argument (variable, spread, …) is left as a rename with a
  // TODO marker — safe expansion isn't possible without runtime info.
  root
    .find(j.CallExpression)
    .filter((p) => calleeProp(p.node) === 'removeTabs')
    .forEach((p) => {
      const [arg] = p.node.arguments;
      const receiver = p.node.callee.object;
      if (arg && arg.type === 'ArrayExpression' && arg.elements.every(Boolean)) {
        let chain = receiver;
        for (const el of arg.elements) {
          chain = j.callExpression(j.memberExpression(chain, j.identifier('withoutTab')), [el]);
        }
        j(p).replaceWith(chain);
      } else {
        p.node.callee.property.name = 'withoutTab';
        const stmt = j(p).closest(j.ExpressionStatement);
        if (stmt.size() > 0) {
          stmt.get(0).node.comments = (stmt.get(0).node.comments || []).concat(
            j.commentBlock(
              ' TODO(0.4): removeTabs 배열 인자 — 개별 withoutTab 호출로 수동 전개 ',
              true,
              false,
            ),
          );
        }
      }
      dirty = true;
    });

  // -- rule 6: .removeTab( -> .withoutTab( (single tab, same arity, plain rename)
  root
    .find(j.CallExpression)
    .filter((p) => calleeProp(p.node) === 'removeTab')
    .forEach((p) => {
      p.node.callee.property.name = 'withoutTab';
      dirty = true;
    });

  // -- rules 1, 2, 3a, 6 (removeField), 8a, 10a: plain method-name renames.
  root
    .find(j.CallExpression)
    .filter((p) => Object.prototype.hasOwnProperty.call(SIMPLE_RENAMES, calleeProp(p.node) || ''))
    .forEach((p) => {
      const oldName = calleeProp(p.node);
      p.node.callee.property.name = SIMPLE_RENAMES[oldName];
      dirty = true;
    });

  // -- rule 4: .getName() / .getUrl() -> .name / .url (call -> property access).
  root
    .find(j.CallExpression)
    .filter((p) => Object.prototype.hasOwnProperty.call(CALL_TO_PROPERTY, calleeProp(p.node) || ''))
    .forEach((p) => {
      const propName = CALL_TO_PROPERTY[calleeProp(p.node)];
      j(p).replaceWith(j.memberExpression(p.node.callee.object, j.identifier(propName)));
      dirty = true;
    });

  // -- rules 5, 9: drop the call from its chain entirely.
  //    - if it's the outermost expression of a standalone statement, drop
  //      the whole statement (nothing left to observe).
  //    - otherwise replace the CallExpression with its receiver, so a
  //      further .foo() chained after it (or before it, as the receiver)
  //      still works.
  root
    .find(j.CallExpression)
    .filter((p) => REMOVED_CALLS.has(calleeProp(p.node) || ''))
    .forEach((p) => {
      const receiver = p.node.callee.object;
      const isStatementExpr =
        p.parent.node.type === 'ExpressionStatement' && p.parent.node.expression === p.node;
      if (isStatementExpr) {
        j(p.parent).remove();
      } else {
        j(p).replaceWith(receiver);
      }
      dirty = true;
    });

  // -- rule 7a: .withSortable(arg?) -> .withList({ sortable: <bool> }).
  root
    .find(j.CallExpression)
    .filter((p) => calleeProp(p.node) === 'withSortable')
    .forEach((p) => {
      const [arg] = p.node.arguments;
      const boolLiteral =
        arg === undefined
          ? j.booleanLiteral(true)
          : arg.type === 'BooleanLiteral' || arg.type === 'Literal'
            ? arg
            : arg; // non-literal expression: pass through as the value (still valid)
      p.node.callee.property.name = 'withList';
      p.node.arguments = [
        j.objectExpression([j.objectProperty(j.identifier('sortable'), boolLiteral)]),
      ];
      dirty = true;
    });

  // -- rule 7b: .withFilterable(arg?) -> .withFilter() / .withFilter(false).
  root
    .find(j.CallExpression)
    .filter((p) => calleeProp(p.node) === 'withFilterable')
    .forEach((p) => {
      const [arg] = p.node.arguments;
      const isExplicitFalse =
        arg !== undefined &&
        ((arg.type === 'BooleanLiteral' && arg.value === false) ||
          (arg.type === 'Literal' && arg.value === false));
      p.node.callee.property.name = 'withFilter';
      p.node.arguments = isExplicitFalse ? [j.booleanLiteral(false)] : [];
      dirty = true;
    });

  // -- rule 8b: .withCreateStep(stepObj) -> .withSteps([stepObj]) — the
  // rename already happened above (SIMPLE_RENAMES); this pass only wraps a
  // lone non-array argument so the arity matches withSteps(steps: StepDef[]).
  root
    .find(j.CallExpression)
    .filter((p) => calleeProp(p.node) === 'withSteps')
    .forEach((p) => {
      if (p.node.arguments.length === 1 && p.node.arguments[0].type !== 'ArrayExpression') {
        p.node.arguments = [j.arrayExpression([p.node.arguments[0]])];
        dirty = true;
      }
    });

  // -- rule 10b: withDataTransfer({...}) — preserve export/import keys;
  // flag any OTHER key with a TODO marker comment instead of dropping it.
  root
    .find(j.CallExpression)
    .filter((p) => calleeProp(p.node) === 'withDataTransfer')
    .forEach((p) => {
      const [arg] = p.node.arguments;
      if (!arg || arg.type !== 'ObjectExpression') return;
      const extraKeys = arg.properties.filter((prop) => {
        if (prop.type !== 'ObjectProperty' && prop.type !== 'Property') return false;
        const key = prop.key;
        const name = key.type === 'Identifier' ? key.name : key.type === 'StringLiteral' ? key.value : undefined;
        return name !== 'export' && name !== 'import';
      });
      if (extraKeys.length > 0) {
        const stmt = j(p).closest(j.ExpressionStatement);
        const target = stmt.size() > 0 ? stmt.get(0).node : p.node;
        target.comments = (target.comments || []).concat(
          j.commentBlock(DATA_TRANSFER_TODO, true, false),
        );
        dirty = true;
      }
    });

  return dirty ? root.toSource({ quote: 'single' }) : fileInfo.source;
};
