import { expect, test } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  const response = await request.post('/api/sample-admin/reset', {
    data: { entities: ['entityform-proof'] },
  });
  expect(response.ok()).toBe(true);
});

async function saveCreatePayload(
  page: import('@playwright/test').Page,
  path: string,
  absentLabel?: string,
): Promise<Record<string, unknown>> {
  await page.goto(path);
  if (absentLabel) await expect(page.getByLabel(absentLabel)).toHaveCount(0);
  await page.getByLabel('Name').fill('Structure row');
  const response = page.waitForResponse(
    (candidate) =>
      candidate.url().endsWith('/api/entityform-proof') && candidate.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Save' }).click();
  const saved = await response;
  expect(saved.status()).toBe(201);
  return saved.request().postDataJSON() as Record<string, unknown>;
}

test('[EFS-14a] addFields — default tab and group render their fields', async ({ page }) => {
  await page.goto('/entityform-proof/add-fields--efs-14a');
  await expect(page.getByRole('tab', { name: 'default' })).toBeVisible();
  await expect(page.getByLabel('Name')).toBeVisible();
  await expect(page.locator('fieldset[data-field-group="default"]')).toBeVisible();
});

test('[EFS-14b] addFields — explicit tab and group render their labels', async ({ page }) => {
  await page.goto('/entityform-proof/add-fields--efs-14b');
  await page.getByRole('tab', { name: 'Explicit tab' }).click();
  await expect(page.getByText('Explicit group', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Explicit field')).toBeVisible();
});

test('[EFS-14c] addFields — label and order control tab DOM order', async ({ page }) => {
  await page.goto('/entityform-proof/add-fields--efs-14c');
  await expect(page.getByRole('tab')).toHaveText([
    'default',
    'Earlier tab',
    'Explicit tab',
    'Admin tab',
  ]);
});

test('[EFS-14d] addFields — hidden tab is absent from the tab bar', async ({ page }) => {
  await page.goto('/entityform-proof/add-fields--efs-14d');
  await expect(page.getByRole('tab', { name: 'Hidden tab' })).toHaveCount(0);
  await expect(page.getByLabel('Hidden tab field')).toHaveCount(0);
});

test('[EFS-14e] addFields — tab requiredPermissions uses the ADMIN session', async ({ page }) => {
  await page.goto('/entityform-proof/add-fields--efs-14e');
  await expect(page.getByRole('tab', { name: 'Admin tab' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Denied tab' })).toHaveCount(0);
});

test('[EFS-14f] addFields — group requiredPermissions gates legend and field', async ({ page }) => {
  await page.goto('/entityform-proof/add-fields--efs-14f');
  await expect(page.getByText('Admin group', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Admin group field')).toBeVisible();
  await expect(page.getByText('Denied group', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Denied group field')).toHaveCount(0);
});

test('[EFS-15a] withoutField — existing field is absent from DOM and payload', async ({ page }) => {
  const payload = await saveCreatePayload(page, '/entityform-proof/without-field--efs-15a', 'Note');
  expect(payload).not.toHaveProperty('note');
});

test('[EFS-15b] withoutField — missing field removal is a no-op', async ({ page }) => {
  const payload = await saveCreatePayload(page, '/entityform-proof/without-field--efs-15b');
  expect(payload.name).toBe('Structure row');
});

test('[EFS-16a] withoutTab — tab fields disappear from DOM and payload', async ({ page }) => {
  const payload = await saveCreatePayload(
    page,
    '/entityform-proof/without-tab--efs-16a',
    'Removed tab field',
  );
  expect(payload).not.toHaveProperty('removedTabField');
  await expect(page.getByRole('tab', { name: 'Removed tab' })).toHaveCount(0);
});

test('[EFS-16b] withoutTab — missing tab removal is a no-op', async ({ page }) => {
  const payload = await saveCreatePayload(page, '/entityform-proof/without-tab--efs-16b');
  expect(payload.name).toBe('Structure row');
});

test('[EFS-17a] withTab — label patch replaces the rendered tab label', async ({ page }) => {
  await page.goto('/entityform-proof/with-tab--efs-17a');
  await expect(page.getByRole('tab', { name: 'Patched tab' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Old tab' })).toHaveCount(0);
});

test('[EFS-17b] withTab — order patch reorders tab buttons', async ({ page }) => {
  await page.goto('/entityform-proof/with-tab--efs-17b');
  await expect(page.getByRole('tab')).toHaveText(['default', 'Patched tab', 'Anchor tab']);
});

test('[EFS-17c] withTab — static hidden patch removes the tab', async ({ page }) => {
  await page.goto('/entityform-proof/with-tab--efs-17c');
  await expect(page.getByRole('tab', { name: 'Static hidden patched' })).toHaveCount(0);
});

test('[EFS-17d] withTab — conditional hidden resolves by render type', async ({ page }) => {
  await page.goto('/entityform-proof/with-tab--efs-17d');
  await expect(page.getByRole('tab', { name: 'Conditional tab' })).toHaveCount(0);
  await page.goto('/entityform-proof/with-tab--efs-17d/1');
  await expect(page.getByRole('tab', { name: 'Conditional tab' })).toBeVisible();
});

test('[EFS-17e] withTab — requiredPermissions hides a denied tab', async ({ page }) => {
  await page.goto('/entityform-proof/with-tab--efs-17e');
  await expect(page.getByRole('tab', { name: 'Denied patched' })).toHaveCount(0);
});

test('[EFS-17f] withTab — repeated patches preserve earlier keys', async ({ page }) => {
  await page.goto('/entityform-proof/with-tab--efs-17f');
  await expect(page.getByRole('tab', { name: 'Patched tab' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Static hidden patched' })).toHaveCount(0);
});

test('[EFS-18a] withGroup — label patch replaces the group legend', async ({ page }) => {
  await page.goto('/entityform-proof/with-group--efs-18a');
  await expect(page.getByText('Early patched', { exact: true })).toBeVisible();
  await expect(page.getByText('Early old', { exact: true })).toHaveCount(0);
});

test('[EFS-18b] withGroup — order patch reorders group panels', async ({ page }) => {
  await page.goto('/entityform-proof/with-group--efs-18b');
  const groups = await page
    .locator('fieldset[data-field-group]')
    .first()
    .getAttribute('data-field-group');
  expect(groups).toBe('default');
  const ids = await page
    .locator('fieldset[data-field-group]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-field-group')));
  expect(ids.indexOf('early')).toBeLessThan(ids.indexOf('late'));
});

test('[EFS-18c] withGroup — open controls initial collapse', async ({ page }) => {
  await page.goto('/entityform-proof/with-group--efs-18c');

  const disclosure = page.getByRole('button', { name: 'Collapsible group' });
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByLabel('Collapsed field')).not.toBeVisible();

  await disclosure.click();
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByLabel('Collapsed field')).toBeVisible();
});

test('[EFS-18d] withGroup — requiredPermissions gates group content', async ({ page }) => {
  await page.goto('/entityform-proof/with-group--efs-18d');
  await expect(page.getByText('Allowed group', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Allowed group field')).toBeVisible();
  await expect(page.getByText('Group denied', { exact: true })).toHaveCount(0);
});

test('[EFS-18e] withGroup — repeated patches preserve label and order', async ({ page }) => {
  await page.goto('/entityform-proof/with-group--efs-18e');
  await expect(page.getByText('Late patched', { exact: true })).toBeVisible();
  const ids = await page
    .locator('fieldset[data-field-group]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-field-group')));
  expect(ids.indexOf('early')).toBeLessThan(ids.indexOf('late'));
});

test('[EFS-18f] withGroup — groupId is global and tabId is not a lookup key', async ({ page }) => {
  await page.goto('/entityform-proof/with-group--efs-18f');
  await expect(page.getByText('Early patched', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Early group field')).toBeVisible();
});

test('[EFS-19a] withSteps — second declaration replaces the first', async ({ page }) => {
  await page.goto('/entityform-proof/with-steps--efs-19a');
  await expect(page.getByText('Old step', { exact: false })).toHaveCount(0);
  await expect(page.getByText('1. Identity step')).toBeVisible();
});

test('[EFS-19b] withSteps — order sorts the rendered indicator', async ({ page }) => {
  await page.goto('/entityform-proof/with-steps--efs-19b');
  await expect(page.getByRole('listitem')).toHaveText(['1. Identity step', '2. Details step']);
});

test('[EFS-19c] withSteps — description renders on its owning step', async ({ page }) => {
  await page.goto('/entityform-proof/with-steps--efs-19c');
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page.getByText('Details description', { exact: true })).toBeVisible();
});

test('[EFS-19d] withSteps — conditional hidden excludes its step', async ({ page }) => {
  await page.goto('/entityform-proof/with-steps--efs-19d');
  await expect(page.getByText(/Conditional hidden step/)).toHaveCount(0);
});

test('[EFS-19e] withSteps — partially hidden steps leave visible navigation', async ({ page }) => {
  await page.goto('/entityform-proof/with-steps--efs-19e');
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('button', { name: '다음' })).toBeVisible();
});

test('[EFS-19f] withSteps — all hidden steps degrade to a stable empty wizard', async ({
  page,
}) => {
  await page.goto('/entityform-proof/with-steps--efs-19f');
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await expect(page.getByLabel('Name')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
});

test('[EFS-19g] withSteps — values survive forward and backward navigation', async ({ page }) => {
  await page.goto('/entityform-proof/with-steps--efs-19g');
  await page.getByLabel('Name').fill('Retained name');
  await page.getByRole('button', { name: '다음' }).click();
  await page.getByRole('button', { name: '이전' }).click();
  await expect(page.getByLabel('Name')).toHaveValue('Retained name');
});

test('[P-05] withTab/withGroup × hidden/permission — patches do not resurrect gates', async ({
  page,
}) => {
  await page.goto('/entityform-proof/with-tab--p-05');
  await expect(page.getByRole('tab', { name: 'Static hidden patched' })).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'Denied patched' })).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'Patched tab' })).toBeVisible();
});

test('[P-06] withSteps × validation — invalid owner step restores field and focus', async ({
  page,
}) => {
  await page.goto('/entityform-proof/with-steps--p-06');
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page.getByText('Details step', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save' }).click();
  const name = page.getByLabel('Name');
  await expect(name).toBeVisible();
  await expect(name).toBeFocused();
});
