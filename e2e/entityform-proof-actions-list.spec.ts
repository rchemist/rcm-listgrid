import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  const response = await request.post('/api/sample-admin/reset', {
    data: { entities: ['entityform-proof'] },
  });
  expect(response.ok()).toBe(true);
});

async function diagnostics(page: Page, selector = '[data-proof-diagnostics]') {
  return JSON.parse((await page.locator(selector).textContent()) ?? '{}') as Record<string, any>;
}

const capabilityCases = [
  ['[EFS-02a] withCapabilities — create true renders Save', 'efs-02a', false, 'Save', true],
  ['[EFS-02b] withCapabilities — create false removes Save', 'efs-02b', false, 'Save', false],
  ['[EFS-02c] withCapabilities — update true renders Save', 'efs-02c', true, 'Save', true],
  ['[EFS-02d] withCapabilities — update false removes Save', 'efs-02d', true, 'Save', false],
  ['[EFS-02e] withCapabilities — delete true renders Delete', 'efs-02e', true, 'Delete', true],
  ['[EFS-02f] withCapabilities — delete false removes Delete', 'efs-02f', true, 'Delete', false],
] as const;

for (const [title, branch, update, button, visible] of capabilityCases) {
  test(title, async ({ page }) => {
    await page.goto(`/entityform-proof/with-capabilities--${branch}${update ? '/1' : ''}`);
    await expect(page.getByLabel('Name')).toBeVisible();
    const target = page.getByRole('button', { name: button, exact: true });
    if (visible) await expect(target).toBeVisible();
    else await expect(target).toHaveCount(0);
  });
}

test('[EFS-02g] withCapabilities — async predicate receives create context and ADMIN session', async ({
  page,
}) => {
  await page.goto('/entityform-proof/with-capabilities--efs-02g');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
  await page.getByLabel('Name').fill('Async capability row');
  const request = page.waitForRequest(
    (candidate) =>
      candidate.url().endsWith('/api/entityform-proof') && candidate.method() === 'POST',
  );
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  expect((await request).postDataJSON()).toMatchObject({ name: 'Async capability row' });
});

test('[EFS-02h] withCapabilities — async pending defaults true then resolves false', async ({
  page,
}) => {
  await page.goto('/entityform-proof/with-capabilities--efs-02h');
  const save = page.getByRole('button', { name: 'Save', exact: true });
  await expect(save).toBeVisible({ timeout: 1_000 });
  await expect(save).toHaveCount(0, { timeout: 6_000 });
});

test('[EFS-02i] withCapabilities — repeated calls shallow merge sibling keys', async ({ page }) => {
  await page.goto('/entityform-proof/with-capabilities--efs-02i');
  expect((await diagnostics(page)).capabilities).toEqual({
    create: false,
    update: true,
    delete: false,
  });
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toHaveCount(0);

  await page.goto('/entityform-proof/with-capabilities--efs-02i/1');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete', exact: true })).toHaveCount(0);
});

test('[EFS-04a] addAction — order controls action DOM order', async ({ page }) => {
  await page.goto('/entityform-proof/add-action--efs-04a');
  await expect(page.locator('[data-form-actions] button')).toHaveText([
    'Action early',
    'Action late',
    'Save',
  ]);
});

test('[EFS-04b] addAction — visible gates custom actions', async ({ page }) => {
  await page.goto('/entityform-proof/add-action--efs-04b');
  await expect(page.getByRole('button', { name: 'Visible action' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hidden action' })).toHaveCount(0);
});

test('[EFS-04c] addAction — enabled controls disabled state', async ({ page }) => {
  await page.goto('/entityform-proof/add-action--efs-04c');
  await expect(page.getByRole('button', { name: 'Disabled action' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Enabled action' })).toBeEnabled();
});

test('[EFS-04d] addAction — run receives a live mutator', async ({ page }) => {
  await page.goto('/entityform-proof/add-action--efs-04d');
  await page.getByRole('button', { name: 'Run action' }).click();
  await expect(page.getByLabel('Note')).toHaveValue('action run');
});

test('[EFS-04e] addAction — render supplies the custom node', async ({ page }) => {
  await page.goto('/entityform-proof/add-action--efs-04e');
  const rendered = page.getByText('Custom rendered action', { exact: true });
  await expect(rendered).toBeVisible();
  await expect(rendered.locator('xpath=ancestor::button')).toHaveCount(0);
});

test('[EFS-04f] addAction — className reaches the action wrapper', async ({ page }) => {
  await page.goto('/entityform-proof/add-action--efs-04f');
  await expect(page.locator('span.proof-action-class').getByRole('button')).toHaveText(
    'Class action',
  );
});

test('[EFS-04g] addAction — variant reaches the host Button', async ({ page }) => {
  await page.goto('/entityform-proof/add-action--efs-04g');
  await expect(page.getByRole('button', { name: 'Danger action' })).toHaveAttribute(
    'data-variant',
    'danger',
  );
});

test('[EFS-04h] addAction — replaces save removes the builtin and runs the custom slot', async ({
  page,
}) => {
  await page.goto('/entityform-proof/add-action--efs-04h');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Replacement Save' }).click();
  await expect(page.getByLabel('Note')).toHaveValue('replacement save');
});

test('[EFS-04i] addAction — replaces delete removes the builtin in update mode', async ({
  page,
}) => {
  await page.goto('/entityform-proof/add-action--efs-04i/1');
  await expect(page.getByRole('button', { name: 'Delete', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Replacement Delete' })).toBeVisible();
});

test('[EFS-04j] addAction — id collision keeps the custom action and drops the builtin', async ({
  page,
}) => {
  await page.goto('/entityform-proof/add-action--efs-04j');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Collision Save' }).click();
  await expect(page.getByLabel('Note')).toHaveValue('collision save');
});

async function openListCase(page: Page, caseId: string) {
  const request = page.waitForRequest(
    (candidate) =>
      candidate.url().endsWith('/api/entityform-proof/search') && candidate.method() === 'POST',
  );
  await page.goto(`/entityform-proof/${caseId}`);
  const search = await request;
  await expect(page.locator('[data-list-grid="EntityFormProof"] tbody tr')).toHaveCount(1);
  return search;
}

test('[EFS-12a] onBeforeListFetch — setSearchForm threads into the search request', async ({
  page,
}) => {
  const request = await openListCase(page, 'on-before-list-fetch--efs-12a');
  expect(request.postDataJSON().filters.AND).toContainEqual({
    name: 'status',
    value: 'ACTIVE',
    queryConditionType: 'EQUAL',
  });
});

test('[EFS-12b] onBeforeListFetch — handlers run in registration order', async ({ page }) => {
  await openListCase(page, 'on-before-list-fetch--efs-12b');
  await expect
    .poll(async () => (await diagnostics(page, '[data-list-proof-diagnostics]')).trace)
    .toEqual([
      'before:first:0:0',
      'before:second:1:ADMIN',
      'before:throw',
      'before:after-throw:1',
      'after:first:1:1',
      'after:second:seed|after:first',
      'after:throw',
      'after:after-throw:1',
    ]);
});

test('[EFS-12c] onBeforeListFetch — thrown handler is skipped', async ({ page }) => {
  await openListCase(page, 'on-before-list-fetch--efs-12c');
  await expect
    .poll(async () => (await diagnostics(page, '[data-list-proof-diagnostics]')).trace)
    .toContain('before:after-throw:1');
});

test('[EFS-13a] onAfterListFetch — rows and totalElements expose the adapter page', async ({
  page,
}) => {
  await openListCase(page, 'on-after-list-fetch--efs-13a');
  const result = await diagnostics(page, '[data-list-proof-diagnostics]');
  expect(result.trace).toContain('after:first:1:1');
  expect(result.totalElements).toBe(1);
});

test('[EFS-13b] onAfterListFetch — setRows threads into the rendered list', async ({ page }) => {
  await openListCase(page, 'on-after-list-fetch--efs-13b');
  await expect(page.getByText('seed|after:first|after:second', { exact: true })).toBeVisible();
  expect((await diagnostics(page, '[data-list-proof-diagnostics]')).trace).toContain(
    'after:second:seed|after:first',
  );
});

test('[EFS-13c] onAfterListFetch — handlers run in registration order', async ({ page }) => {
  await openListCase(page, 'on-after-list-fetch--efs-13c');
  const trace = (await diagnostics(page, '[data-list-proof-diagnostics]')).trace as string[];
  expect(trace.indexOf('after:first:1:1')).toBeLessThan(
    trace.indexOf('after:second:seed|after:first'),
  );
});

test('[EFS-13d] onAfterListFetch — thrown handler is skipped', async ({ page }) => {
  await openListCase(page, 'on-after-list-fetch--efs-13d');
  await expect
    .poll(async () => (await diagnostics(page, '[data-list-proof-diagnostics]')).trace)
    .toContain('after:after-throw:1');
});

test('[P-09] before/after list × search mutation preserves host search and renders hooked rows', async ({
  page,
}) => {
  await openListCase(page, 'on-before-list-fetch--p-09');
  const response = page.waitForResponse((candidate) => {
    if (!candidate.url().endsWith('/api/entityform-proof/search')) return false;
    const body = candidate.request().postDataJSON() as Record<string, any> | null;
    return (
      body?.filters?.OR?.some((filter: { value?: unknown }) => filter.value === 'Proof') ?? false
    );
  });
  await page.getByLabel('Quick search').fill('Proof');
  const search = await response;
  const body = search.request().postDataJSON() as Record<string, any>;
  expect(body.quickSearchFields).toEqual(['name']);
  expect(body.filters.OR).toContainEqual({
    name: 'name',
    value: 'Proof',
    queryConditionType: 'LIKE',
  });
  expect(body.filters.AND).toContainEqual({
    name: 'status',
    value: 'ACTIVE',
    queryConditionType: 'EQUAL',
  });
  expect((await search.json()).content[0]).toMatchObject({ name: 'Proof One', note: 'seed' });
  await expect(page.getByText('seed|after:first|after:second', { exact: true })).toBeVisible();
});
