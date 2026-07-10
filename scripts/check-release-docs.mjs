#!/usr/bin/env node
// Release-docs gate: assert the top CHANGELOG entry matches package.json version.
// Prevents publishing a version whose changelog was not written. Wired into the
// publish pipeline (see .github/workflows/publish.yml) and runnable locally via
// `node scripts/check-release-docs.mjs`.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const pkgVersion = pkg.version;

const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
// First "## [x.y.z]" heading (ignores an "Unreleased" section if present).
const match = changelog.match(/^##\s*\[(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\]/m);

if (!match) {
  console.error('[check-release-docs] No "## [x.y.z]" version heading found in CHANGELOG.md');
  process.exit(1);
}

const changelogVersion = match[1];

if (changelogVersion !== pkgVersion) {
  console.error(
    `[check-release-docs] Version mismatch:\n` +
      `  package.json : ${pkgVersion}\n` +
      `  CHANGELOG top: ${changelogVersion}\n` +
      `Add a "## [${pkgVersion}]" entry at the top of CHANGELOG.md before releasing.`,
  );
  process.exit(1);
}

console.log(`[check-release-docs] OK — package.json and CHANGELOG agree on ${pkgVersion}`);
