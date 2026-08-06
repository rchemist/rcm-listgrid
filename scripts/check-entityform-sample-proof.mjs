#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function parse(relPath) {
  const path = join(root, relPath);
  return ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
}

function unwrap(node) {
  while (
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isParenthesizedExpression(node)
  ) {
    node = node.expression;
  }
  return node;
}

function entityFormMembers() {
  const source = parse('packages/schema-core/src/entity-form.ts');
  const declaration = source.statements.find(
    (node) => ts.isClassDeclaration(node) && node.name?.text === 'EntityForm',
  );
  if (!declaration) throw new Error('EntityForm class not found');
  const names = [];
  for (const member of declaration.members) {
    const flags = ts.getCombinedModifierFlags(member);
    if (flags & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected | ts.ModifierFlags.Static))
      continue;
    if (ts.isConstructorDeclaration(member)) names.push('constructor');
    else if (
      ts.isMethodDeclaration(member) ||
      ts.isPropertyDeclaration(member) ||
      ts.isGetAccessorDeclaration(member) ||
      ts.isSetAccessorDeclaration(member)
    ) {
      if (member.name && ts.isIdentifier(member.name)) names.push(member.name.text);
    }
  }
  return names;
}

function manifestMembers() {
  const source = parse('apps/sample/lib/entities/entityform-proof-manifest.ts');
  let initializer;
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === 'entityFormProofManifest'
      ) {
        initializer = declaration.initializer;
      }
    }
  }
  const object = initializer && unwrap(initializer);
  if (!object || !ts.isObjectLiteralExpression(object))
    throw new Error('static manifest object not found');
  const membersProperty = object.properties.find(
    (property) => ts.isPropertyAssignment(property) && property.name.getText(source) === 'members',
  );
  const array =
    membersProperty &&
    ts.isPropertyAssignment(membersProperty) &&
    unwrap(membersProperty.initializer);
  if (!array || !ts.isArrayLiteralExpression(array))
    throw new Error('manifest.members must be a static array');
  return array.elements.map((element) => {
    const entry = unwrap(element);
    if (!ts.isObjectLiteralExpression(entry))
      throw new Error('every manifest member must be a static object');
    const property = entry.properties.find(
      (candidate) =>
        ts.isPropertyAssignment(candidate) && candidate.name.getText(source) === 'member',
    );
    if (
      !property ||
      !ts.isPropertyAssignment(property) ||
      !ts.isStringLiteral(property.initializer)
    ) {
      throw new Error('every manifest member must carry a static string member');
    }
    return property.initializer.text;
  });
}

function stringProperty(object, source, name) {
  const property = object.properties.find(
    (candidate) => ts.isPropertyAssignment(candidate) && candidate.name.getText(source) === name,
  );
  return property && ts.isPropertyAssignment(property) && ts.isStringLiteral(property.initializer)
    ? property.initializer.text
    : undefined;
}

function verifyImplementedAnchors() {
  const source = parse('apps/sample/lib/entities/entityform-proof-manifest.ts');
  const constants = new Map();
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const value = declaration.initializer && unwrap(declaration.initializer);
      if (ts.isIdentifier(declaration.name) && value && ts.isStringLiteral(value)) {
        constants.set(declaration.name.text, value.text);
      }
    }
  }
  const resolveString = (node) =>
    ts.isStringLiteral(node)
      ? node.text
      : ts.isIdentifier(node)
        ? constants.get(node.text)
        : undefined;
  const resolvedProperty = (object, name) => {
    const property = object.properties.find(
      (candidate) => ts.isPropertyAssignment(candidate) && candidate.name.getText(source) === name,
    );
    return property && ts.isPropertyAssignment(property)
      ? resolveString(property.initializer)
      : undefined;
  };
  let count = 0;
  function verify(e2eFile, testTitle, sampleAnchor) {
    if (!e2eFile || !testTitle || !sampleAnchor)
      throw new Error('implemented proof has a non-static anchor');
    const e2ePath = join(root, e2eFile);
    if (!existsSync(e2ePath) || !readFileSync(e2ePath, 'utf8').includes(testTitle)) {
      throw new Error(`implemented proof test anchor missing: ${e2eFile}#${testTitle}`);
    }
    const [sampleFile, symbol] = sampleAnchor.split('#');
    const samplePath = join(root, sampleFile);
    if (
      !existsSync(samplePath) ||
      !symbol ||
      !readFileSync(samplePath, 'utf8').includes(`export function ${symbol}`)
    ) {
      throw new Error(`implemented proof sample anchor missing: ${sampleAnchor}`);
    }
    count += 1;
  }
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      (node.expression.text === 'proof' ||
        node.expression.text === 'diagnosticProof' ||
        node.expression.text === 'structureProof' ||
        node.expression.text === 'lifecycleProof' ||
        node.expression.text === 'actionsListProof' ||
        node.expression.text === 'transferProof')
    ) {
      const structure = node.expression.text === 'structureProof';
      const lifecycle = node.expression.text === 'lifecycleProof';
      const actionsList = node.expression.text === 'actionsListProof';
      const transfer = node.expression.text === 'transferProof';
      verify(
        transfer
          ? 'e2e/entityform-proof-transfer.spec.ts'
          : actionsList
            ? 'e2e/entityform-proof-actions-list.spec.ts'
            : lifecycle
              ? 'e2e/entityform-proof-lifecycle.spec.ts'
              : structure
                ? 'e2e/entityform-proof-structure.spec.ts'
                : 'e2e/entityform-proof-identity.spec.ts',
        resolveString(node.arguments[2]),
        node.expression.text === 'diagnosticProof'
          ? 'apps/sample/lib/entities/entityform-proof.ts#EntityFormIdentityDiagnostics'
          : 'apps/sample/lib/entities/entityform-proof.ts#EntityFormProofCase',
      );
    }
    if (
      ts.isObjectLiteralExpression(node) &&
      stringProperty(node, source, 'status') === 'implemented'
    ) {
      const e2eFile = resolvedProperty(node, 'e2eFile');
      const testTitle = resolvedProperty(node, 'testTitle');
      const sampleAnchor = resolvedProperty(node, 'sampleAnchor');
      // The generic proof() helper body is parameterized; its static calls
      // are verified above. Direct integration objects are verified here.
      if (e2eFile && testTitle && sampleAnchor) verify(e2eFile, testTitle, sampleAnchor);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return count;
}

function compare(actual, manifest) {
  const duplicates = manifest.filter((name, index) => manifest.indexOf(name) !== index);
  const missing = actual.filter((name) => !manifest.includes(name));
  const extra = manifest.filter((name) => !actual.includes(name));
  return { duplicates: [...new Set(duplicates)], missing, extra };
}

function assertExact(actual, manifest, label) {
  const result = compare(actual, manifest);
  if (result.duplicates.length || result.missing.length || result.extra.length) {
    throw new Error(
      `${label}: duplicates=[${result.duplicates}] missing=[${result.missing}] extra=[${result.extra}]`,
    );
  }
}

const actual = entityFormMembers();
const manifest = manifestMembers();
assertExact(actual, manifest, 'EntityForm ↔ proof manifest mismatch');
if (actual.length !== 54) throw new Error(`expected 54 EntityForm members, found ${actual.length}`);
const manifestSource = readFileSync(
  join(root, 'apps/sample/lib/entities/entityform-proof-manifest.ts'),
  'utf8',
);
const integrationIds = [...manifestSource.matchAll(/['"](P-\d{2})['"]/g)].map((match) => match[1]);
const expectedIntegrations = Array.from(
  { length: 14 },
  (_, index) => `P-${String(index + 1).padStart(2, '0')}`,
);
assertExact(expectedIntegrations, integrationIds, 'P integration inventory mismatch');
const implementedAnchors = verifyImplementedAnchors();
console.log(
  `[entityform-proof] exact public inventory ${actual.length}/${manifest.length} PASS; P ${integrationIds.length}/14; implemented anchors ${implementedAnchors}`,
);

if (process.argv.includes('--self-test')) {
  let missingRed = false;
  let addedRed = false;
  try {
    assertExact(actual, manifest.slice(1), 'synthetic manifest deletion');
  } catch {
    missingRed = true;
  }
  try {
    assertExact([...actual, '__syntheticPublicMethod'], manifest, 'synthetic public API addition');
  } catch {
    addedRed = true;
  }
  if (!missingRed || !addedRed) throw new Error('AST discriminator self-test did not turn red');
  console.log(
    '[entityform-proof] discriminator PASS — manifest deletion RED; public API addition RED',
  );
}
