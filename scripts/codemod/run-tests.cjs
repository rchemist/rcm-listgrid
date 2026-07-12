#!/usr/bin/env node
/**
 * Runnable before/after fixture check for scripts/codemod/v0.4.ts (W7-4,
 * waves §W7 결정5). For every `<name>.before.ts` in __fixtures__/, applies
 * the transform and asserts the result equals `<name>.after.ts` byte-for-
 * byte (after a trailing-whitespace-tolerant trim per line — recast's
 * printer, not this repo's formatting convention, owns exact spacing).
 *
 * Usage:
 *   node scripts/codemod/run-tests.cjs            # assert (CI mode)
 *   node scripts/codemod/run-tests.cjs --update    # rewrite .after.ts to
 *                                                   # match actual output
 *                                                   # (use after reviewing
 *                                                   # the diff — dev only)
 *
 * Wired as `npm run codemod:test`.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { applyTransform } = require('jscodeshift/src/testUtils');

const transform = require('./v0.4.cjs');
const FIXTURES_DIR = path.join(__dirname, '__fixtures__');
const UPDATE = process.argv.includes('--update');

function normalize(source) {
  return source
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .trim();
}

function main() {
  const files = fs.readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.before.ts'));
  if (files.length === 0) {
    console.error(`[codemod:test] no *.before.ts fixtures found in ${FIXTURES_DIR}`);
    process.exit(1);
  }

  let failures = 0;
  for (const beforeFile of files.sort()) {
    const name = beforeFile.replace(/\.before\.ts$/, '');
    const beforePath = path.join(FIXTURES_DIR, beforeFile);
    const afterPath = path.join(FIXTURES_DIR, `${name}.after.ts`);
    const beforeSource = fs.readFileSync(beforePath, 'utf8');

    const actual = normalize(
      applyTransform(transform, {}, { path: beforePath, source: beforeSource }, { parser: 'tsx' }),
    );

    if (UPDATE) {
      fs.writeFileSync(afterPath, actual + '\n');
      console.log(`[codemod:test] wrote ${name}.after.ts`);
      continue;
    }

    if (!fs.existsSync(afterPath)) {
      console.error(`[codemod:test] FAIL ${name} — missing ${name}.after.ts`);
      failures += 1;
      continue;
    }
    const expected = normalize(fs.readFileSync(afterPath, 'utf8'));

    if (actual === expected) {
      console.log(`[codemod:test] PASS ${name}`);
    } else {
      failures += 1;
      console.error(`[codemod:test] FAIL ${name}`);
      console.error('--- expected ---');
      console.error(expected);
      console.error('--- actual ---');
      console.error(actual);
    }
  }

  if (failures > 0) {
    console.error(`[codemod:test] ${failures}/${files.length} fixture(s) failed`);
    process.exit(1);
  }
  console.log(`[codemod:test] all ${files.length} fixture(s) passed`);
}

main();
