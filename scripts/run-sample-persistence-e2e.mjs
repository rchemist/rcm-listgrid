#!/usr/bin/env node
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createProofRow,
  deleteProofRow,
  resetProof,
  startSample,
  stopSample,
  updateProofRow,
  withBrowser,
} from './sample-proof-runner-lib.mjs';

const directory = mkdtempSync(join(tmpdir(), `listgrid-persistence-${process.pid}-`));
const databasePath = join(directory, 'listgrid-sample.sqlite');
const port = 3101;
let server;

try {
  server = await startSample({ mode: 'dev', port, databasePath });
  await resetProof(server.baseURL);
  const seeded = await fetch(`${server.baseURL}/api/entityform-proof/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: 0, pageSize: 100, filters: { AND: [], OR: [] } }),
  }).then((response) => response.json());
  if (seeded.totalElements !== 1)
    throw new Error(`reset did not produce one seed row: ${seeded.totalElements}`);
  const created = await withBrowser(server.baseURL, async (page) => {
    const row = await createProofRow(page, 'Restart Persistent Row', 'created-before-restart');
    await page.reload();
    await updateProofRow(page, row.id, 'updated-before-restart');
    return row;
  });
  await stopSample(server);

  server = await startSample({ mode: 'dev', port, databasePath });
  await withBrowser(server.baseURL, async (page) => {
    await page.goto(`/entityform-proof/baseline/${created.id}`);
    await page.getByLabel('Name').waitFor();
    if ((await page.getByLabel('Name').inputValue()) !== 'Restart Persistent Row') {
      throw new Error('created row did not survive restart');
    }
    if ((await page.getByLabel('Note').inputValue()) !== 'updated-before-restart') {
      throw new Error('updated value did not survive restart');
    }
    await deleteProofRow(page, created.id);
  });
  await stopSample(server);

  server = await startSample({ mode: 'dev', port, databasePath });
  const missing = await fetch(`${server.baseURL}/api/entityform-proof/${created.id}`);
  if (missing.status !== 404)
    throw new Error(`deleted row revived after restart: ${missing.status}`);
  const search = await fetch(`${server.baseURL}/api/entityform-proof/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: 0, pageSize: 100, filters: { AND: [], OR: [] } }),
  });
  const payload = await search.json();
  if (payload.content.some((row) => String(row.id) === created.id)) {
    throw new Error('deleted row remained in search after restart');
  }
  const deleteSeed = await fetch(`${server.baseURL}/api/entityform-proof`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: ['1'] }),
  });
  if (!deleteSeed.ok) throw new Error(`seed delete failed: ${deleteSeed.status}`);
  await stopSample(server);

  server = await startSample({ mode: 'dev', port, databasePath });
  const empty = await fetch(`${server.baseURL}/api/entityform-proof/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: 0, pageSize: 100, filters: { AND: [], OR: [] } }),
  }).then((response) => response.json());
  if (empty.totalElements !== 0)
    throw new Error(`seed revived after deleting all rows: ${empty.totalElements}`);
  console.log(
    `[persistence-e2e] PASS id=${created.id} create/update survived; delete stayed 404; empty namespace stayed empty`,
  );
} finally {
  if (server) await stopSample(server);
  rmSync(directory, { recursive: true, force: true });
}
