import { expect, test } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  const response = await request.post('/api/sample-admin/reset', {
    data: { entities: ['entityform-proof'] },
  });
  expect(response.ok()).toBe(true);
});

async function diagnostics(page: import('@playwright/test').Page): Promise<Record<string, any>> {
  return JSON.parse((await page.locator('[data-proof-diagnostics]').textContent()) ?? '{}');
}

test('[P-13] baseline CRUD uses generic routes and isolated SQLite', async ({ page, request }) => {
  await page.goto('/entityform-proof');
  await expect(page.getByRole('heading', { name: 'EntityForm proof lab' })).toBeVisible();
  await expect(page.getByText('Public member inventory (53)')).toBeVisible();
  await expect(page.locator('[data-proof-member]')).toHaveCount(53);
  await expect(page.locator('[data-proof-integration="P-13"]')).toContainText('implemented');

  const reset = await request.post('/api/sample-admin/reset', {
    data: { entities: ['entityform-proof'] },
  });
  expect(reset.ok()).toBe(true);

  await page.goto('/entityform-proof/baseline');
  await expect(page.locator('[data-proof-case="baseline"]')).toBeVisible();
  await page.getByLabel('Name').fill('Persistent Browser Row');
  await page.getByLabel('Note').fill('created-before-restart');
  const createResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/entityform-proof') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Save' }).click();
  const created = (await (await createResponse).json()) as { id: string };
  await expect(page).toHaveURL(/\/entityform-proof\/list$/);

  await page.goto(`/entityform-proof/baseline/${created.id}`);
  await expect(page.getByLabel('Name')).toHaveValue('Persistent Browser Row');
  await page.getByLabel('Note').fill('updated-before-restart');
  const updateResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/entityform-proof/${created.id}`) &&
      response.request().method() === 'PUT',
  );
  await page.getByRole('button', { name: 'Save' }).click();
  expect((await updateResponse).ok()).toBe(true);

  const read = await request.get(`/api/entityform-proof/${created.id}`);
  expect(read.ok()).toBe(true);
  expect((await read.json()) as { note: string }).toMatchObject({ note: 'updated-before-restart' });
});

test('[EFS-01] withTitle resolves every fallback and replace branch in the rendered h2', async ({
  page,
}) => {
  const cases = [
    ['/entityform-proof/title-string', 'String title'],
    ['/entityform-proof/title-text', 'Object text title'],
    ['/entityform-proof/title-from-field', 'From field title'],
    ['/entityform-proof/title-name', 'Name field title'],
    ['/entityform-proof/title-id/1', '1'],
    ['/entityform-proof/title-entity', 'EntityFormProof'],
    ['/entityform-proof/title-replace', 'Replacement title'],
  ] as const;
  for (const [path, title] of cases) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  }
});

test('[EFS-03][P-02] readOnly hides Save slots but keeps Delete and normal actions', async ({
  page,
}) => {
  await page.goto('/entityform-proof/readonly-all/1');
  await expect(page.getByLabel('Name')).toHaveAttribute('readonly', '');
  await expect(page.getByRole('button', { name: 'Save' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Replacement Save' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Normal action' })).toBeVisible();

  await page.goto('/entityform-proof/readonly-undefined/1');
  await expect(page.getByLabel('Name')).toHaveAttribute('readonly', '');
  await page.goto('/entityform-proof/readonly-clear/1');
  await expect(page.getByLabel('Name')).not.toHaveAttribute('readonly', '');
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
});

test('[EFS-05][P-01] id controls create/update transport and capability selection', async ({
  page,
}) => {
  await page.goto('/entityform-proof/capability-id');
  await expect(page.getByRole('button', { name: 'Save' })).toHaveCount(0);
  await page.goto('/entityform-proof/capability-id/1');
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();

  await page.goto('/entityform-proof/id-clear');
  await page.getByLabel('Name').fill('Cleared id row');
  const create = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/entityform-proof') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Save' }).click();
  expect((await create).status()).toBe(201);

  await page.goto('/entityform-proof/baseline/1');
  await page.getByLabel('Note').fill('id-update');
  const update = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/entityform-proof/1') && response.request().method() === 'PUT',
  );
  await page.getByRole('button', { name: 'Save' }).click();
  expect((await update).ok()).toBe(true);
});

test('[EFS-20][EFS-23][P-12] meta and clone isolation match the declared reference contract', async ({
  page,
}) => {
  await page.goto('/entityform-proof/meta');
  const result = await diagnostics(page);
  expect(result.meta).toEqual({ alpha: 1, replaced: 'new', nested: { stable: true }, beta: 2 });
  expect(result.clone.values).toEqual({ with: 'clone-value' });
  expect(result.clone.isolation.topMeta).toEqual(['original', 'clone']);
  expect(result.clone.isolation.nestedShared).toBe(true);
  expect(result.clone.isolation.steps).toEqual([['name'], ['name', 'note']]);
  expect(result.clone.isolation.actions).toEqual(['Original action', 'Clone action']);
  expect(result.clone.isolation.hookArraysDistinct).toBe(true);
  expect(result.clone.subclassPreserved).toBe(true);
});

test('[EFS-24] constructor and every query surface are anchored to a rendered wizard form', async ({
  page,
}) => {
  await page.goto('/entityform-proof/query-wizard');
  await expect(page.getByRole('heading', { name: 'Query wizard' })).toBeVisible();
  await expect(page.getByLabel('Name')).toBeVisible();
  const result = await diagnostics(page);
  expect(result).toMatchObject({
    name: 'EntityFormProof',
    url: '/entityform-proof',
    renderType: 'create',
    title: 'Query wizard',
    capabilities: {},
    readOnly: false,
    actions: [],
    hooks: {
      init: 0,
      change: 0,
      beforeSave: 0,
      afterSave: 0,
      beforeDelete: 0,
      afterDelete: 1,
      beforeListFetch: 0,
      afterListFetch: 0,
    },
  });
  expect(result.fields).toEqual(['name', 'status', 'category', 'note']);
  expect(result.steps).toEqual(['identity']);
  expect(result.queries.hasField).toEqual([true, false]);
  expect(result.queries.hasTab).toEqual([true, false]);
  expect(result.queries.tabFields).toEqual(['name', 'status', 'category', 'note']);
  expect(result.queries.cloneClass).toBe(true);
});

test('[P-03] fetched data plus clone with id runs onInit and marks the override dirty', async ({
  page,
}) => {
  await page.goto('/entityform-proof/init-fetched/1');
  await expect(page.getByLabel('Name')).toHaveValue('Proof One');
  await expect(page.getByLabel('Note')).toHaveValue('onInit fetched override');
  expect((await diagnostics(page)).dirty).toBe(true);
});
