import { readFileSync } from 'node:fs';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import XLSX from 'xlsx-js-style';

test.beforeEach(async ({ request }) => {
  const response = await request.post('/api/sample-admin/reset', {
    data: { entities: ['entityform-proof'] },
  });
  expect(response.ok()).toBe(true);
});

async function transferDiagnostics(page: Page) {
  return JSON.parse(
    (await page.locator('[data-list-proof-diagnostics]').textContent()) ?? '{}',
  ) as {
    transfer: { export?: string[]; import?: string[]; fileName?: string };
  };
}

async function findPersistedRow(request: APIRequestContext, name: string) {
  const search = await request.post('/api/entityform-proof/search', {
    data: { page: 0, pageSize: 100 },
  });
  expect(search.ok()).toBe(true);
  const body = (await search.json()) as { content: Array<Record<string, unknown>> };
  const row = body.content.find((candidate) => candidate.name === name);
  expect(row).toBeDefined();
  const read = await request.get(`/api/entityform-proof/${String(row?.id)}`);
  expect(read.ok()).toBe(true);
  return (await read.json()) as Record<string, unknown>;
}

function workbookBuffer(aoa: unknown[][]): Buffer {
  const worksheet = XLSX.utils.aoa_to_sheet(aoa);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'EntityForm Proof');
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }) as Buffer;
}

test('[EFS-22a] withDataTransfer — export/import omitted fields auto-derive at query time', async ({
  page,
}) => {
  await page.goto('/entityform-proof/with-data-transfer--efs-22a');
  expect((await transferDiagnostics(page)).transfer).toEqual({
    export: ['name', 'status', 'category', 'note'],
    import: ['name', 'status', 'category', 'note'],
  });
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Export' }).locator('label')).toHaveText([
    'Name',
    'Status',
    'Category',
    'Note',
  ]);
});

test('[EFS-22b] withDataTransfer — explicit fields drive export and import verbatim', async ({
  page,
}) => {
  await page.goto('/entityform-proof/with-data-transfer--efs-22b');
  expect((await transferDiagnostics(page)).transfer).toEqual({
    export: ['id', 'name', 'status', 'category', 'note'],
    import: ['id', 'name', 'status', 'category', 'note'],
  });
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Export' }).locator('label')).toHaveText([
    'ID',
    'Name',
    'Status',
    'Category',
    'Note',
  ]);
});

test('[EFS-22c] withDataTransfer — fileName names a real workbook that round-trips into SQLite', async ({
  page,
  request,
}) => {
  await page.goto('/entityform-proof/with-data-transfer--efs-22c');
  await expect(page.locator('td', { hasText: 'Proof One' })).toBeVisible();
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Export' });
  const downloadPromise = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Download' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('EntityForm Proof.xlsx');

  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  const workbook = XLSX.read(readFileSync(filePath as string), { type: 'buffer' });
  expect(workbook.SheetNames).toEqual(['EntityForm Proof']);
  const worksheet = workbook.Sheets['EntityForm Proof'];
  expect(worksheet).toBeDefined();
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet!, { header: 1 });
  expect(rows[0]).toEqual([
    'ID\n[id]',
    'Name\n[name]',
    'Status\n[status]',
    'Category\n[category]',
    'Note\n[note]',
  ]);
  expect(rows[1]).toEqual(['1', 'Proof One', 'Active', 'Category A', 'seed']);

  XLSX.utils.sheet_add_aoa(
    worksheet!,
    [['88', 'Proof Workbook Roundtrip', 'Inactive', 'Category B', 'xlsx roundtrip']],
    { origin: 'A2' },
  );
  const roundTripBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }) as Buffer;

  await page.goto('/entityform-proof/with-data-transfer--efs-22c');
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  const importDialog = page.getByRole('dialog', { name: 'Import' });
  await importDialog.locator('input[type="file"]').setInputFiles({
    name: 'EntityForm Proof.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: roundTripBuffer,
  });
  await importDialog.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('td', { hasText: 'Proof Workbook Roundtrip' })).toBeVisible();

  const persisted = await request.get('/api/entityform-proof/88');
  expect(persisted.ok()).toBe(true);
  expect(await persisted.json()).toMatchObject({
    id: '88',
    name: 'Proof Workbook Roundtrip',
    status: 'INACTIVE',
    category: 'B',
    note: 'xlsx roundtrip',
  });
});

test('[EFS-22d] withDataTransfer — repeated calls replace the complete prior config', async ({
  page,
}) => {
  await page.goto('/entityform-proof/with-data-transfer--efs-22d');
  expect((await transferDiagnostics(page)).transfer).toEqual({
    import: ['name'],
  });
  await expect(page.getByRole('button', { name: 'Export', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Import', exact: true })).toBeVisible();
});

test('[EFS-22e] withDataTransfer — export and import resolve only their own declarations', async ({
  page,
}) => {
  await page.goto('/entityform-proof/with-data-transfer--efs-22e');
  expect((await transferDiagnostics(page)).transfer).toEqual({
    export: ['id'],
    import: ['name', 'status', 'category', 'note'],
  });
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Export' }).locator('label')).toHaveText([
    'Export ID',
  ]);
});

test('[P-11] withDataTransfer × field add/remove — auto-derived fields use the live form', async ({
  page,
  request,
}) => {
  await page.goto('/entityform-proof/with-data-transfer--p-11');
  expect((await transferDiagnostics(page)).transfer).toEqual({
    export: ['name', 'status', 'category', 'late'],
    import: ['name', 'status', 'category', 'late'],
  });

  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const exportDialog = page.getByRole('dialog', { name: 'Export' });
  const downloadPromise = page.waitForEvent('download');
  await exportDialog.getByRole('button', { name: 'Download' }).click();
  const download = await downloadPromise;
  const downloadedPath = await download.path();
  const exported = XLSX.read(readFileSync(downloadedPath as string), { type: 'buffer' });
  const exportedSheet = exported.Sheets[exported.SheetNames[0] as string];
  const exportedRows = XLSX.utils.sheet_to_json<unknown[]>(exportedSheet!, { header: 1 });
  expect(exportedRows[0]).toEqual([
    'Name\n[name]',
    'Status\n[status]',
    'Category\n[category]',
    'Late field\n[late]',
  ]);

  const name = `Live transfer fields ${Date.now()}`;
  await page.goto('/entityform-proof/with-data-transfer--p-11');
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  const importDialog = page.getByRole('dialog', { name: 'Import' });
  await importDialog.locator('input[type="file"]').setInputFiles({
    name: 'live-fields.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: workbookBuffer([
      ['Name\n[name]', 'Status\n[status]', 'Category\n[category]', 'Late field\n[late]'],
      [name, 'Active', 'Category A', 'added after transfer config'],
    ]),
  });
  await importDialog.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('td', { hasText: name })).toBeVisible();
  expect(await findPersistedRow(request, name)).toMatchObject({
    name,
    status: 'ACTIVE',
    category: 'A',
    late: 'added after transfer config',
  });
});
