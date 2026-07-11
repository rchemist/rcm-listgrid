import { expect, test } from '@playwright/test';

// W3-4 acceptance — the College create -> delete -> vanishes-from-list round
// trip (CAP-08) through a real browser: the built-in Delete button (W3-3)
// gated by a window.confirm dialog (messages registry showConfirm, wired in
// apps/sample/app/providers.tsx), then onAfterDelete (spec §4.1) navigating
// back to the list (apps/sample/app/college/[id]/page.tsx). A unique record
// name (Date.now()) keeps the "gone from the list" assertion unambiguous
// against the other College E2E specs' fixture rows (테스트대학 등) sharing
// this single-worker backend.

test('College create -> delete -> removed from list', async ({ page }) => {
  // window.confirm() gate (ViewEntityForm runBuiltinDelete, W3-4) — accept it
  // for the whole test so the Delete click below actually proceeds.
  page.on('dialog', (dialog) => dialog.accept());

  const name = `삭제대상대학-${Date.now()}`;

  // --- create ---
  await page.goto('/college/new');
  await page.getByLabel(/명칭/).fill(name);
  await page.getByLabel(/영문명/).fill('Delete Target College');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/college$/);

  const row = page.getByText(name, { exact: true });
  await expect(row).toBeVisible();

  // --- open the created record ---
  await row.click();
  await expect(page).toHaveURL(/\/college\/\d+$/);
  await expect(page.getByLabel(/영문명/)).toHaveValue('Delete Target College');

  // --- delete (confirm dialog accepted above) -> onAfterDelete -> back to list ---
  await page.getByRole('button', { name: /^Delete$/ }).click();
  await expect(page).toHaveURL(/\/college$/);

  // --- gone from the list ---
  await expect(page.getByText(name, { exact: true })).toHaveCount(0);
});
