import { expect, test } from '@playwright/test';

// W4-3 acceptance — AsyncValidation's trigger:'button' 중복확인 flow (spec
// §5.3, CAP-05) through a real browser: the confirm button renders, clicking
// it shows the 'checking' state, then settles into 'invalid' (+ message) for
// a taken alias or 'valid' for a unique one. Dedicated `/async-demo` fixture
// (lib/entities/async-demo.ts) — isolated from college/major/etc. so it can
// never perturb their own E2E assertions (perm-demo.ts / action-demo.ts /
// steps-demo.ts precedent).

test('AsyncValidation 중복확인 button: unchecked → checking → invalid for a taken alias', async ({
  page,
}) => {
  await page.goto('/async-demo/new');
  await expect(page.getByRole('heading', { name: '중복확인 데모' })).toBeVisible();

  const aliasInput = page.getByLabel(/^별칭/);
  await expect(aliasInput).toBeVisible();

  const checkButton = page.getByRole('button', { name: '중복확인' });
  await expect(checkButton).toBeVisible();

  await aliasInput.fill('taken-alias');
  await checkButton.click();

  // 'checking' is observable (the fixture's `check` has an artificial 300ms
  // delay — see async-demo.ts) before the result settles.
  await expect(page.getByText('확인 중…')).toBeVisible();

  await expect(page.getByText('이미 사용 중인 별칭입니다')).toBeVisible();
});

test('AsyncValidation 중복확인 button: settles into valid for a unique alias', async ({ page }) => {
  await page.goto('/async-demo/new');

  const aliasInput = page.getByLabel(/^별칭/);
  await aliasInput.fill('unique-alias');
  await page.getByRole('button', { name: '중복확인' }).click();

  await expect(page.getByText('확인 중…')).toBeVisible();
  await expect(page.getByText('사용 가능')).toBeVisible();
  await expect(page.getByText('이미 사용 중인 별칭입니다')).not.toBeVisible();
});
