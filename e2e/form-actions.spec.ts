import { expect, test } from '@playwright/test';

// W3-3 acceptance — the addAction custom-action button (spec §3.4, CAP-09)
// through a real browser: renders, and clicking it runs its `run` handler
// with a real ActionContext (mutator writes back to the store, visible in
// the DOM). Dedicated `/action-demo` fixture (lib/entities/action-demo.ts) —
// isolated from college/major/etc. so it can never perturb their own E2E
// assertions (perm-demo.ts precedent).

test('addAction custom button renders and its run handler fires with a real ActionContext', async ({
  page,
}) => {
  await page.goto('/action-demo/new');

  const nameInput = page.getByLabel(/이름/);
  await expect(nameInput).toBeVisible();
  await expect(nameInput).toHaveValue('');

  const customButton = page.getByRole('button', { name: '커스텀' });
  await expect(customButton).toBeVisible();

  await customButton.click();
  await expect(nameInput).toHaveValue('clicked');
});
