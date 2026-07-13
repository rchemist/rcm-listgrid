import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  const response = await request.post('/api/sample-admin/reset', {
    data: { entities: ['entityform-proof'] },
  });
  expect(response.ok()).toBe(true);
});

async function diagnostics(page: Page): Promise<Record<string, any>> {
  return JSON.parse((await page.locator('[data-proof-diagnostics]').textContent()) ?? '{}');
}

async function trace(page: Page): Promise<string[]> {
  return ((await diagnostics(page)).meta?.lifecycleTrace ?? []) as string[];
}

async function expectTrace(page: Page, expected: string[]): Promise<void> {
  await expect.poll(() => trace(page)).toEqual(expected);
}

async function fillAndSave(page: Page, path: string, name = 'Lifecycle row') {
  await page.goto(path);
  await page.getByLabel('Name').fill(name);
  const response = page.waitForResponse(
    (candidate) =>
      candidate.url().includes('/api/entityform-proof') &&
      ['POST', 'PUT'].includes(candidate.request().method()),
  );
  await page.getByRole('button', { name: 'Save' }).click();
  const saved = await response;
  return { response: saved, body: saved.request().postDataJSON() as Record<string, unknown> };
}

async function acceptDelete(page: Page): Promise<void> {
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
}

const onChangeCases = [
  ['[EFS-06a] onChange — handlers run in registration order', 'on-change--efs-06a'],
  ['[EFS-06b] onChange — handler writes a derived field value', 'on-change--efs-06b'],
  ['[EFS-06c] onChange — handler writes reactive field meta', 'on-change--efs-06c'],
  ['[EFS-06d] onChange — handler adds a dynamic field', 'on-change--efs-06d'],
  ['[EFS-06e] onChange — nested writes do not duplicate the source cascade', 'on-change--efs-06e'],
] as const;

for (const [title, caseId] of onChangeCases) {
  test(title, async ({ page }) => {
    await page.goto(`/entityform-proof/${caseId}`);
    await page.getByLabel('Name').fill('Cascade');
    await expectTrace(page, ['change:first', 'change:second']);
    await expect(page.getByLabel('Note')).toHaveValue('changed:Cascade');
    await expect(page.getByLabel('Note')).toHaveAttribute('readonly', '');
    await expect(page.getByLabel('Dynamic field')).toBeVisible();
  });
}

const onInitCases = [
  ['[EFS-07a] onInit — create runs without fetched data', 'on-init--efs-07a'],
  ['[EFS-07b] onInit — update runs with fetched data', 'on-init--efs-07b'],
  ['[EFS-07c] onInit — values.set overrides fetched data and marks dirty', 'on-init--efs-07c'],
  ['[EFS-07d] onInit — values.setFetched establishes a clean baseline', 'on-init--efs-07d'],
  ['[EFS-07e] onInit — setMeta reaches first paint', 'on-init--efs-07e'],
  ['[EFS-07f] onInit — form structure mutation reaches first paint', 'on-init--efs-07f'],
  ['[EFS-07g] onInit — handlers run in registration order', 'on-init--efs-07g'],
] as const;

for (const [title, caseId] of onInitCases) {
  test(title, async ({ page }) => {
    const update = caseId === 'on-init--efs-07b' || caseId === 'on-init--efs-07c';
    await page.goto(`/entityform-proof/${caseId}${update ? '/1' : ''}`);
    await expectTrace(page, [`init:first:${update ? 'data' : 'empty'}`, 'init:second']);
    await expect(page.getByLabel('Init added field')).toBeVisible();
    await expect(page.getByLabel('Category')).toBeDisabled();
    if (update) {
      await expect(page.getByLabel('Note')).toHaveValue('init data override');
      expect((await diagnostics(page)).dirty).toBe(true);
    } else {
      await expect(page.getByLabel('Name')).toHaveValue('init clean baseline');
      expect((await diagnostics(page)).dirty).toBe(false);
    }
  });
}

const beforeTransformCases = [
  ['[EFS-08a] onBeforeSave — setData threads into the request body', 'on-before-save--efs-08a'],
  ['[EFS-08b] onBeforeSave — values is the validated snapshot', 'on-before-save--efs-08b'],
  ['[EFS-08f] onBeforeSave — handlers run in registration order', 'on-before-save--efs-08f'],
] as const;

for (const [title, caseId] of beforeTransformCases) {
  test(title, async ({ page }) => {
    const { body, response } = await fillAndSave(page, `/entityform-proof/${caseId}`);
    expect(response.status()).toBe(201);
    expect(body.note).toBe('first-second');
    await expectTrace(page, ['before:first:Lifecycle row:create', 'before:second:first']);
  });
}

test('[EFS-08c] onBeforeSave — cancel with reason blocks request and shows message', async ({
  page,
}) => {
  let calls = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/api/entityform-proof') && request.method() === 'POST') calls += 1;
  });
  await page.goto('/entityform-proof/on-before-save--efs-08c');
  await page.getByLabel('Name').fill('Cancelled');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('save cancelled by proof')).toBeVisible();
  await expectTrace(page, ['before:cancel-reason']);
  expect(calls).toBe(0);
});

test('[EFS-08d] onBeforeSave — cancel without reason blocks request silently', async ({ page }) => {
  let calls = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/api/entityform-proof') && request.method() === 'POST') calls += 1;
  });
  await page.goto('/entityform-proof/on-before-save--efs-08d');
  await page.getByLabel('Name').fill('Cancelled');
  await page.getByRole('button', { name: 'Save' }).click();
  await expectTrace(page, ['before:cancel-empty']);
  await expect(page.locator('[data-form-errors]')).toHaveCount(0);
  expect(calls).toBe(0);
});

test('[EFS-08e] onBeforeSave — thrown handler is skipped and later handler saves', async ({
  page,
}) => {
  const { body, response } = await fillAndSave(page, '/entityform-proof/on-before-save--efs-08e');
  expect(response.status()).toBe(201);
  expect(body.note).toBe('after throw');
  await expectTrace(page, ['before:throw', 'before:after-throw']);
});

const afterSaveCases = [
  ['[EFS-09a] onAfterSave — handlers run only after adapter success', 'on-after-save--efs-09a'],
  ['[EFS-09b] onAfterSave — handlers run in registration order', 'on-after-save--efs-09b'],
  ['[EFS-09c] onAfterSave — thrown handler is skipped', 'on-after-save--efs-09c'],
  ['[EFS-09d] onAfterSave — result and mutator reach later handlers', 'on-after-save--efs-09d'],
] as const;

for (const [title, caseId] of afterSaveCases) {
  test(title, async ({ page }) => {
    const { response } = await fillAndSave(page, `/entityform-proof/${caseId}`);
    expect(response.status()).toBe(201);
    const body = (await response.json()) as { id: string };
    await expectTrace(page, [
      `after:first:${body.id}:create`,
      'after:throw',
      `after:last:saved:${body.id}`,
    ]);
    await expect(page.getByLabel('Note')).toHaveValue(`saved:${body.id}`);
  });
}

const beforeDeleteCases = [
  ['[EFS-10a] onBeforeDelete — context carries exact ids', 'on-before-delete--efs-10a'],
  [
    '[EFS-10e] onBeforeDelete — successful hooks precede the adapter request',
    'on-before-delete--efs-10e',
  ],
] as const;

for (const [title, caseId] of beforeDeleteCases) {
  test(title, async ({ page }) => {
    await page.goto(`/entityform-proof/${caseId}/1`);
    const response = page.waitForResponse(
      (candidate) =>
        candidate.url().endsWith('/api/entityform-proof') &&
        candidate.request().method() === 'DELETE',
    );
    await acceptDelete(page);
    expect((await response).status()).toBe(204);
    await expectTrace(page, ['delete:first:1', 'delete:second']);
  });
}

test('[EFS-10b] onBeforeDelete — cancel with reason blocks adapter and shows message', async ({
  page,
}) => {
  let calls = 0;
  page.on('request', (request) => {
    if (request.method() === 'DELETE') calls += 1;
  });
  await page.goto('/entityform-proof/on-before-delete--efs-10b/1');
  await acceptDelete(page);
  await expect(page.getByText('delete cancelled by proof')).toBeVisible();
  await expectTrace(page, ['delete:cancel-reason:1']);
  expect(calls).toBe(0);
});

test('[EFS-10c] onBeforeDelete — cancel without reason blocks adapter silently', async ({
  page,
}) => {
  let calls = 0;
  page.on('request', (request) => {
    if (request.method() === 'DELETE') calls += 1;
  });
  await page.goto('/entityform-proof/on-before-delete--efs-10c/1');
  expect((await diagnostics(page)).hooks.beforeDelete).toBe(1);
  await acceptDelete(page);
  expect(calls).toBe(0);
});

test('[EFS-10d] onBeforeDelete — thrown handler is skipped and delete continues', async ({
  page,
}) => {
  await page.goto('/entityform-proof/on-before-delete--efs-10d/1');
  const response = page.waitForResponse((candidate) => candidate.request().method() === 'DELETE');
  await acceptDelete(page);
  expect((await response).status()).toBe(204);
  await expectTrace(page, ['delete:throw', 'delete:after-throw:1']);
});

const afterDeleteCases = [
  ['[EFS-11a] onAfterDelete — handlers run only after adapter success', 'on-after-delete--efs-11a'],
  ['[EFS-11b] onAfterDelete — handlers run in registration order', 'on-after-delete--efs-11b'],
  ['[EFS-11c] onAfterDelete — thrown handler is skipped', 'on-after-delete--efs-11c'],
] as const;

for (const [title, caseId] of afterDeleteCases) {
  test(title, async ({ page }) => {
    await page.goto(`/entityform-proof/${caseId}/1`);
    const response = page.waitForResponse((candidate) => candidate.request().method() === 'DELETE');
    await acceptDelete(page);
    expect((await response).status()).toBe(204);
    await expectTrace(page, ['deleted:first:1', 'deleted:throw', 'deleted:last']);
  });
}

test('[EFS-21a] withRevision — undefined omits revision from create payload', async ({ page }) => {
  const { body } = await fillAndSave(page, '/entityform-proof/with-revision--efs-21a');
  expect(body).not.toHaveProperty('revisionEntityName');
});

test('[EFS-21b] withRevision — create injects exact revisionEntityName', async ({ page }) => {
  const { body } = await fillAndSave(page, '/entityform-proof/with-revision--efs-21b');
  expect(body.revisionEntityName).toBe('EntityFormProofRevision');
});

test('[EFS-21c] withRevision — update injects exact revisionEntityName', async ({ page }) => {
  const { body } = await fillAndSave(page, '/entityform-proof/with-revision--efs-21c/1');
  expect(body.revisionEntityName).toBe('EntityFormProofRevision');
});

test('[EFS-21d] withRevision — delete injects exact revisionEntityName', async ({ page }) => {
  await page.goto('/entityform-proof/with-revision--efs-21d/1');
  const response = page.waitForResponse((candidate) => candidate.request().method() === 'DELETE');
  await acceptDelete(page);
  const deleted = await response;
  expect(deleted.request().postDataJSON()).toEqual({
    ids: ['1'],
    revisionEntityName: 'EntityFormProofRevision',
  });
});

test('[EFS-21e] withRevision — undefined clears a previous revision', async ({ page }) => {
  const { body } = await fillAndSave(page, '/entityform-proof/with-revision--efs-21e');
  expect(body).not.toHaveProperty('revisionEntityName');
});

test('[P-04] onChange × dynamic meta/field — one edit updates both without duplicate cascade', async ({
  page,
}) => {
  await page.goto('/entityform-proof/on-change--p-04');
  await page.getByLabel('Name').fill('Pairwise');
  await expect(page.getByLabel('Dynamic field')).toBeVisible();
  await expect(page.getByLabel('Note')).toHaveAttribute('readonly', '');
  await expectTrace(page, ['change:first', 'change:second']);
});

test('[P-07] before/after save × cancel/throw/order — transformed request precedes success hooks', async ({
  page,
}) => {
  const { body } = await fillAndSave(page, '/entityform-proof/on-before-save--p-07');
  expect(body.note).toBe('pair transformed');
  await expectTrace(page, ['pair:before', 'pair:after:pair transformed']);
});

test('[P-08] before/after delete × confirm/cancel/throw — dismiss skips hooks and request', async ({
  page,
}) => {
  let calls = 0;
  page.on('request', (request) => {
    if (request.method() === 'DELETE') calls += 1;
  });
  await page.goto('/entityform-proof/on-before-delete--p-08/1');
  page.once('dialog', (dialog) => void dialog.dismiss());
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect.poll(() => trace(page)).toEqual([]);
  expect(calls).toBe(0);

  const response = page.waitForResponse((candidate) => candidate.request().method() === 'DELETE');
  await acceptDelete(page);
  expect((await response).status()).toBe(204);
  await expectTrace(page, ['pair:before-delete:1', 'pair:after-delete:1']);
});

test('[P-10] withRevision × create/update/delete — every transport receives the exact name', async ({
  page,
}) => {
  const create = await fillAndSave(page, '/entityform-proof/with-revision--p-10');
  expect(create.body.revisionEntityName).toBe('EntityFormProofRevision');
  const update = await fillAndSave(page, '/entityform-proof/with-revision--p-10/1');
  expect(update.body.revisionEntityName).toBe('EntityFormProofRevision');
  await page.goto('/entityform-proof/with-revision--p-10/1');
  const response = page.waitForResponse((candidate) => candidate.request().method() === 'DELETE');
  await acceptDelete(page);
  expect((await response).request().postDataJSON()).toEqual({
    ids: ['1'],
    revisionEntityName: 'EntityFormProofRevision',
  });
});

test('[P-14] backend validation × plural UI — field and global errors stay separate', async ({
  page,
  request,
}) => {
  const before = await request.post('/api/entityform-proof/search', {
    data: { page: 0, pageSize: 20 },
  });
  const beforeTotal = ((await before.json()) as { totalElements: number }).totalElements;
  await page.goto('/entityform-proof/validation--p-14');
  await page.getByLabel('Name').fill('VALIDATION_PROOF');
  const response = page.waitForResponse(
    (candidate) => candidate.request().method() === 'POST' && candidate.status() === 400,
  );
  await page.getByRole('button', { name: 'Save' }).click();
  await response;
  await expect(page.getByText('too short', { exact: true })).toBeVisible();
  await expect(page.getByText('reserved', { exact: true })).toBeVisible();
  await expect(page.locator('[data-global-errors]')).toContainText('date range is invalid');
  await expect(page.locator('[data-global-errors]')).toContainText(
    'form combination is not allowed',
  );
  const after = await request.post('/api/entityform-proof/search', {
    data: { page: 0, pageSize: 20 },
  });
  expect(((await after.json()) as { totalElements: number }).totalElements).toBe(beforeTotal);
});
