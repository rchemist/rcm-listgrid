import { expect, test } from '@playwright/test';

// EC2 acceptance — the Collabo reproduction (ec2-collabo-briefing.md §6's 5
// scenarios, verbatim): EF2's onChanges cascade (dynamic option swap +
// multi-field mutual exclusion + M2O nested autofill) and EF3's
// onInitialize/useEntityFormInitializer pipe (update-mode first-paint
// effects), all driven through a real browser against the mock RCM backend
// (mock-backend/collabo.ts). No external network (contracted/promoterType
// are static option catalogs; no Daum postcode interaction — the address
// siblings are declared `required: false`, §6 gap③).

test('Scenario 1 — collaborated toggle swaps contracted options + readOnly, collaboratedAt visibility/required', async ({
  page,
}) => {
  await page.goto('/collabo/new');

  // initial (declared) state: 3-item contracted catalog, not disabled;
  // collaboratedAt is declared hidden — not in the DOM at all.
  await expect(page.locator('#contracted option')).toHaveCount(3);
  await expect(page.locator('#contracted')).not.toBeDisabled();
  await expect(page.locator('#collaboratedAt')).toHaveCount(0);

  // --- toggle ON: options swap to the 2-item Collaborated catalog, required ---
  await page.getByLabel(/협약 체결 여부/).check();
  await expect(page.locator('#contracted option')).toHaveCount(2);
  await expect(page.locator('#contracted option').allTextContents()).resolves.toEqual([
    '일반 협약',
    '위탁 협약',
  ]);
  await expect(page.locator('#contracted')).not.toBeDisabled();
  await expect(page.locator('#collaboratedAt')).toBeVisible();
  await expect(page.locator('#collaboratedAt')).toHaveAttribute('aria-required', 'true');

  // --- toggle OFF: options collapse to NONE-only + readOnly (disabled) flip ---
  await page.getByLabel(/협약 체결 여부/).uncheck();
  await expect(page.locator('#contracted option')).toHaveCount(1);
  await expect(page.locator('#contracted option').first()).toHaveText('비협약');
  await expect(page.locator('#contracted')).toBeDisabled();
  await expect(page.locator('#contracted')).toHaveValue('NONE');
  await expect(page.locator('#collaboratedAt')).toHaveCount(0);
});

test('Scenario 2 — promoterType mutual exclusion: STAFF value is cleared on switching to PROFESSOR', async ({
  page,
}) => {
  await page.goto('/collabo/new');

  await page.getByLabel(/추진자 유형/).selectOption('STAFF');
  await expect(page.locator('[data-field-name="staff"]')).toBeVisible();
  await expect(page.locator('[data-field-name="professor"]')).toHaveCount(0);
  await expect(page.locator('[data-field-name="promoterName"]')).toHaveCount(0);

  // pick a staff row via the ManyToOne picker
  await page.locator('[data-field-name="staff"]').getByRole('button', { name: '찾기' }).click();
  const staffDialog = page.getByRole('dialog');
  await expect(staffDialog).toBeVisible();
  await staffDialog.getByText('박준서').click();
  await expect(staffDialog).toBeHidden();
  await expect(page.locator('[data-m2o-value="staff"]')).toHaveText('박준서');

  // --- switch to PROFESSOR: mutual exclusion flips visibility ---
  await page.getByLabel(/추진자 유형/).selectOption('PROFESSOR');
  await expect(page.locator('[data-field-name="professor"]')).toBeVisible();
  await expect(page.locator('[data-field-name="staff"]')).toHaveCount(0);
  await expect(page.locator('[data-m2o-value="professor"]')).toHaveText('(선택 안 됨)');

  // --- switch back to STAFF: the value was actually CLEARED while hidden,
  //     not just visually suppressed ---
  await page.getByLabel(/추진자 유형/).selectOption('STAFF');
  await expect(page.locator('[data-m2o-value="staff"]')).toHaveText('(선택 안 됨)');
});

test('Scenario 3 — M2O nested autofill: picking a staff row fills promoterDepartment with zero extra pick', async ({
  page,
}) => {
  await page.goto('/collabo/new');
  await page.getByLabel(/추진자 유형/).selectOption('STAFF');
  // promoterDepartment stays hidden until a staff with an organization is chosen.
  await expect(page.locator('[data-field-name="promoterDepartment"]')).toHaveCount(0);

  await page.locator('[data-field-name="staff"]').getByRole('button', { name: '찾기' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  // 박준서 (mock-backend/collabo.ts staffSeed) embeds organization:{id:'2',
  // name:'연구지원팀'} — the picker row itself carries the relation, no
  // extra fetch (ec2-collabo-briefing.md §4).
  await dialog.getByText('박준서').click();
  await expect(dialog).toBeHidden();

  // promoterDepartment appears and resolves to '연구지원팀' WITHOUT its own
  // picker ever being opened — proving the nested autofill end-to-end, not
  // a coincidence of a shared default.
  await expect(page.locator('[data-field-name="promoterDepartment"]')).toBeVisible();
  await expect(page.locator('[data-m2o-value="promoterDepartment"]')).toHaveText('연구지원팀');
});

test('Scenario 4 — onInitialize effects land on first paint in edit mode (no interaction)', async ({
  page,
}) => {
  await page.goto('/collabo');
  await expect(page.getByRole('heading', { name: '산학협력기관' })).toBeVisible();

  // seeded collaborated:true row (mock-backend/collabo.ts collaboSeed id '2').
  await page.getByText('라마바연구소').click();
  await expect(page).toHaveURL(/\/collabo\/2$/);

  // zero interaction beyond the click above — everything below is the
  // useEntityFormInitializer pipe's onInitialize output on first paint.
  await expect(page.getByLabel(/기관명/)).toHaveValue('라마바연구소');
  await expect(page.locator('#collaboratedAt')).toBeVisible();
  await expect(page.locator('#collaboratedAt')).toHaveAttribute('aria-required', 'true');
  await expect(page.locator('#collaboratedAt')).toHaveValue('2025-03-01');
  await expect(page.locator('#contracted option')).toHaveCount(2);
  await expect(page.locator('#contracted option').allTextContents()).resolves.toEqual([
    '일반 협약',
    '위탁 협약',
  ]);
  await expect(page.locator('#contracted')).toHaveValue('CONTRACTED');
});

test('Scenario 5 — the type cascade flips representative required, gating save', async ({
  page,
}) => {
  // --- Phase A: type=ETC -> representative required OFF -> blank save succeeds ---
  await page.goto('/collabo/new');
  await page.getByLabel(/기관명/).fill('세이브테스트기관A');
  await page.getByLabel(/담당자명/).fill('김담당');
  await page.getByLabel(/지원서 검색 가능 여부/).check();
  await page.getByLabel(/중분류/).selectOption('ETC');
  // representative ('대표자명') deliberately left blank.
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/collabo$/);
  await expect(page.getByText('세이브테스트기관A')).toBeVisible();

  // --- Phase B: a non-ETC type -> representative required ON again -> blocked ---
  await page.goto('/collabo/new');
  await page.getByLabel(/기관명/).fill('세이브테스트기관B');
  await page.getByLabel(/담당자명/).fill('박담당');
  await page.getByLabel(/지원서 검색 가능 여부/).check();
  await page.getByLabel(/중분류/).selectOption('PUBLIC');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(/필수 값입니다/)).toBeVisible();
  await expect(page).toHaveURL(/\/collabo\/new$/); // blocked — did NOT navigate

  // fill representative -> save succeeds
  await page.getByLabel(/대표자명/).fill('이대표');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/collabo$/);
  await expect(page.getByText('세이브테스트기관B')).toBeVisible();
});
