#!/usr/bin/env node
// Public-surface count gate (documents/plans/entityform-public-api-spec.md
// §10 게이트 2 / §2): counts the EntityForm class's atomic public members and
// the deduped set of exported symbols from the root (react) and `/schema`
// (schema-core) barrels, then fails if any surface exceeds its FIXED
// threshold. Thresholds are a design contract (spec §10 item 2) — do NOT
// relax them here to make numbers fit; reduce the surface instead.
// Wired into CI (.github/workflows/ci.yml, `quality` job) and runnable
// locally via `node scripts/count-public-surface.mjs` / `npm run check:surface`.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function parse(relPath) {
  const filePath = join(root, relPath);
  const text = readFileSync(filePath, 'utf8');
  return ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

/**
 * EntityForm class-member count (spec §10 게이트 2: *atomic public member* =
 * public instance method / getter / public property, each 1 — constructor
 * included). Excludes `private`/`protected` members and ECMAScript `#private`
 * fields.
 */
function countEntityFormMembers(relPath) {
  const sourceFile = parse(relPath);
  let classNode;
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name?.text === 'EntityForm') {
      classNode = node;
    }
  });
  if (!classNode) {
    throw new Error(`[count-public-surface] class EntityForm not found in ${relPath}`);
  }

  const names = [];
  for (const member of classNode.members) {
    const name = member.name && ts.isIdentifier(member.name) ? member.name.text : undefined;
    if (name?.startsWith('#')) continue; // ECMAScript private field — never public

    const isConstructor = ts.isConstructorDeclaration(member);
    const isCountedKind =
      isConstructor ||
      ts.isMethodDeclaration(member) ||
      ts.isGetAccessorDeclaration(member) ||
      ts.isSetAccessorDeclaration(member) ||
      ts.isPropertyDeclaration(member);
    if (!isCountedKind) continue;

    const flags = ts.getCombinedModifierFlags(member);
    if (flags & ts.ModifierFlags.Private) continue;
    if (flags & ts.ModifierFlags.Protected) continue;

    names.push(isConstructor ? 'constructor' : (name ?? '<anonymous>'));
  }
  return { count: names.length, names };
}

/**
 * Barrel symbol count (spec §2 "공개 심볼 수" / §10 게이트 2): every exported
 * NAME, deduped in a Set. Types and values both count. Sources:
 *   - named re-exports `export { A, B } from '...'` — each element = 1,
 *     including `export type { T } from '...'` and per-specifier
 *     `export { a, type B } from '...'`.
 *   - exported declarations `export const/function/class/interface/type/enum`
 *     — the declared name.
 * `export * from '...'` is intentionally unsupported (deep re-export
 * resolution) — neither barrel uses it today (spec assumption); if one
 * appears, this throws rather than silently under-counting.
 */
function countBarrelSymbols(relPath) {
  const sourceFile = parse(relPath);
  const names = new Set();

  for (const stmt of sourceFile.statements) {
    if (ts.isExportDeclaration(stmt)) {
      if (!stmt.exportClause) {
        throw new Error(
          `[count-public-surface] unsupported "export * from" in ${relPath} — ` +
            'this script assumes no barrel uses star re-exports (spec §10 게이트 2 assumption); update the script if this changes.',
        );
      }
      if (ts.isNamedExports(stmt.exportClause)) {
        for (const el of stmt.exportClause.elements) {
          names.add(el.name.text);
        }
      }
      continue;
    }

    const flags = ts.getCombinedModifierFlags(stmt);
    if (!(flags & ts.ModifierFlags.Export)) continue;

    if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) names.add(decl.name.text);
      }
    } else if (
      ts.isFunctionDeclaration(stmt) ||
      ts.isClassDeclaration(stmt) ||
      ts.isInterfaceDeclaration(stmt) ||
      ts.isTypeAliasDeclaration(stmt) ||
      ts.isEnumDeclaration(stmt)
    ) {
      if (stmt.name) names.add(stmt.name.text);
    }
  }

  return { count: names.size, names: [...names] };
}

const entityForm = countEntityFormMembers('packages/schema-core/src/entity-form.ts');
const rootBarrel = countBarrelSymbols('packages/react/src/index.ts');
const schemaBarrel = countBarrelSymbols('packages/schema-core/src/index.ts');

// Thresholds recomputed 2026-07-11 (pre-W4) against the final design inventory —
// see spec §10-A for the derivation (EntityForm 53→55, /schema 186→190, root ~55→120).
// The counting RULE is fixed; thresholds track the final inventory + small margin.
const surfaces = [
  { label: 'EntityForm', ...entityForm, threshold: 55 },
  { label: 'root', ...rootBarrel, threshold: 120 },
  { label: '/schema', ...schemaBarrel, threshold: 190 },
];

let ok = true;
for (const s of surfaces) {
  const pass = s.count <= s.threshold;
  if (!pass) ok = false;
  console.log(`${s.label}: ${s.count} / ${s.threshold}  ${pass ? 'PASS' : 'FAIL'}`);
}

if (!ok) {
  console.error(
    '\n[count-public-surface] one or more surfaces exceed their fixed threshold ' +
      '(documents/plans/entityform-public-api-spec.md §10 게이트 2). ' +
      'Thresholds are fixed by design — do NOT relax them; reduce the public surface instead.',
  );
  process.exit(1);
}

console.log('\n[count-public-surface] OK — all surfaces within threshold');
process.exit(0);
