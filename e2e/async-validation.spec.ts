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

// W4-3a (D1) save-gating acceptance — Save is blocked until a DIRTY async
// field resolves 'valid' (spec §5.3/§6.2). All three cases exercise the
// BLOCKED path, so the fixture's missing /api/async-demo route is never hit
// (a blocked save returns before the adapter call — same reason the fixture
// header notes no backend round trip is exercised).

test('W4-3a: Save is blocked while the alias is unverified (dirty + unchecked)', async ({
  page,
}) => {
  await page.goto('/async-demo/new');

  await page.getByLabel(/^별칭/).fill('unique-alias'); // dirty, not yet confirmed
  await page.getByRole('button', { name: 'Save' }).click();

  // validateAll gates the unconfirmed async field → save never reaches the
  // adapter; the per-state gate message surfaces on the field.
  await expect(page.getByText('확인이 필요합니다.')).toBeVisible();
});

test('W4-3a: editing a confirmed alias re-blocks Save (a stale "valid" cannot survive an edit)', async ({
  page,
}) => {
  await page.goto('/async-demo/new');
  const aliasInput = page.getByLabel(/^별칭/);

  await aliasInput.fill('unique-alias');
  await page.getByRole('button', { name: '중복확인' }).click();
  await expect(page.getByText('사용 가능')).toBeVisible();

  // Editing the value invalidates the prior confirmation (asyncState → unchecked).
  await aliasInput.fill('unique-alias-edited');
  await expect(page.getByText('사용 가능')).not.toBeVisible();

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('확인이 필요합니다.')).toBeVisible();
});

test('W4-3a: Save is blocked for an alias confirmed INVALID (taken)', async ({ page }) => {
  await page.goto('/async-demo/new');

  await page.getByLabel(/^별칭/).fill('taken-alias');
  await page.getByRole('button', { name: '중복확인' }).click();
  await expect(page.getByText('이미 사용 중인 별칭입니다')).toBeVisible();

  await page.getByRole('button', { name: 'Save' }).click();
  // save-time gate re-marks the invalid field; the adapter is never called.
  await expect(page.getByText('확인에 실패했습니다.')).toBeVisible();
});
