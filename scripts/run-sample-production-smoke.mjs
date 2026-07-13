#!/usr/bin/env node
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createProofRow,
  deleteProofRow,
  freePort,
  resetProof,
  runCommand,
  startSample,
  stopSample,
  updateProofRow,
  withBrowser,
} from './sample-proof-runner-lib.mjs';

const directory = mkdtempSync(join(tmpdir(), `listgrid-production-${process.pid}-`));
const databasePath = join(directory, 'listgrid-sample.sqlite');
const port = await freePort();
let server;

try {
  await runCommand(['--prefix', 'apps/sample', 'run', 'build'], {
    env: { ...process.env, LISTGRID_SAMPLE_DB_PATH: databasePath },
  });
  server = await startSample({ mode: 'start', port, databasePath });
  await resetProof(server.baseURL);
  const created = await withBrowser(server.baseURL, async (page) => {
    const row = await createProofRow(page, 'Production Chromium Row', 'production-create');
    await page.goto('/entityform-proof/list');
    await page.getByText('Production Chromium Row').waitFor();
    await updateProofRow(page, row.id, 'production-update');
    await page.goto(`/entityform-proof/baseline/${row.id}`);
    if ((await page.getByLabel('Note').inputValue()) !== 'production-update') {
      throw new Error('production update was not rendered');
    }
    await deleteProofRow(page, row.id);
    return row;
  });
  const missing = await fetch(`${server.baseURL}/api/entityform-proof/${created.id}`);
  if (missing.status !== 404)
    throw new Error(`production delete did not persist: ${missing.status}`);
  console.log(`[production-smoke] PASS port=${port} id=${created.id} Chromium CRUD + 404`);
} finally {
  if (server) await stopSample(server);
  rmSync(directory, { recursive: true, force: true });
}
