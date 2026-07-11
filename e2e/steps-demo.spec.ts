import { expect, test } from '@playwright/test';

// W4-2 acceptance — withSteps' create-mode wizard (spec §3.2, C6) through a
// real browser: 3 steps, one required field each, 다음/이전 navigation, and
// a real Save round trip (POST /api/steps-demo) on the last step. Dedicated
// `/steps-demo` fixture (lib/entities/steps-demo.ts) — isolated from
// college/major/etc. so it can never perturb their own E2E assertions
// (perm-demo.ts / action-demo.ts precedent).

test('withSteps create wizard walks 3 steps, retains cross-step values, and saves', async ({
  page,
}) => {
  await page.goto('/steps-demo/new');
  await expect(page.getByRole('heading', { name: '단계 데모' })).toBeVisible();

  // --- step 1 (이름) — only firstName is visible ---
  const firstNameInput = page.getByLabel(/^이름/);
  await expect(firstNameInput).toBeVisible();
  await expect(page.getByLabel(/^성/)).not.toBeVisible();
  await expect(page.getByLabel(/^이메일/)).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Save' })).not.toBeVisible();

  await firstNameInput.fill('길동');
  await page.getByRole('button', { name: '다음' }).click();

  // --- step 2 (성) — only lastName is visible; firstName's value persists off-screen ---
  const lastNameInput = page.getByLabel(/^성/);
  await expect(lastNameInput).toBeVisible();
  await expect(page.getByLabel(/^이름/)).not.toBeVisible();
  await lastNameInput.fill('홍');
  await page.getByRole('button', { name: '다음' }).click();

  // --- step 3 (연락처) — only email is visible; the built-in Save affordance appears ---
  const emailInput = page.getByLabel(/^이메일/);
  await expect(emailInput).toBeVisible();
  await expect(page.getByLabel(/^성/)).not.toBeVisible();
  await expect(page.getByRole('button', { name: '다음' })).not.toBeVisible();
  await emailInput.fill('hong@example.com');

  // save requires ALL THREE fields (validateAll runs over every declared
  // field, not just this step's) — proves step1/step2's values survived
  // their <FieldRenderer> unmounting when the wizard moved on.
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/steps-demo\/done$/);
});

test('다음 does not validate the current step — the wizard advances even with a blank required field', async ({
  page,
}) => {
  await page.goto('/steps-demo/new');
  await page.getByRole('button', { name: '다음' }).click(); // firstName left blank
  await expect(page.getByLabel(/^성/)).toBeVisible();
});
