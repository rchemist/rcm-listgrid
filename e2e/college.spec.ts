import { expect, test } from '@playwright/test';

// V0.4a acceptance — the College vertical slice on the NEW @listgrid/* engine,
// end to end in a real browser: list (fetch from the RCM mock backend) → create
// (required validation → POST → redirect) → the new row appears (refetch) →
// edit (fetch → PUT). This is the "actually works" proof the whole re-foundation
// is judged by (charter §보존검증 3, ADR-0008 abort gate), brought forward.

test('College CRUD round-trips through the new engine', async ({ page }) => {
  // --- list renders seeded rows fetched from the backend ---
  await page.goto('/college');
  await expect(page.getByRole('heading', { name: '단과대학' })).toBeVisible();
  await expect(page.getByText('공과대학')).toBeVisible();
  await expect(page.getByText('인문대학')).toBeVisible();

  // --- create: required validation fires on blank save ---
  await page.getByRole('button', { name: '새로 만들기' }).click();
  await expect(page).toHaveURL(/\/college\/new$/);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(/필수 값입니다/).first()).toBeVisible();
  await expect(page).toHaveURL(/\/college\/new$/); // did NOT navigate

  // --- fill + save → POST → redirect to list ---
  await page.getByLabel(/명칭/).fill('테스트대학');
  await page.getByLabel(/영문명/).fill('Test College');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/college$/);

  // --- the created row is now in the list (create round-tripped + refetched) ---
  const newRow = page.getByText('테스트대학');
  await expect(newRow).toBeVisible();

  // --- edit: open the row, change the english name, save (PUT) ---
  await newRow.click();
  await expect(page).toHaveURL(/\/college\/\d+$/);
  await expect(page.getByLabel(/영문명/)).toHaveValue('Test College');
  await page.getByLabel(/영문명/).fill('Test College (updated)');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/college$/);

  // --- the update persisted (reopen and read it back) ---
  await page.getByText('테스트대학').click();
  await expect(page.getByLabel(/영문명/)).toHaveValue('Test College (updated)');
});
