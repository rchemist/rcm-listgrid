import { expect, test } from '@playwright/test';

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
