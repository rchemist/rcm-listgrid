import { expect, test } from '@playwright/test';

// EC3 acceptance — the Major reproduction (ea-d2-xref-major-briefing.md §6's
// 4 scenarios): EC3-0's tab-self-hidden (graduate tab disappears/reappears
// with `type`) + the college/parentMajor required/hidden cascade + mutual
// exclusion (self-referencing ManyToOne, flat picker + NOT_EQUAL self-filter
// in edit mode) + EA-D2-1's XrefMappingField (professors unfiltered, staffs
// with an async domain filter `assistant=true`) driven through a real
// browser against the mock RCM backend (mock-backend/major.ts).

test('Scenario a — type toggle: graduate tab hide/show + college/parentMajor mutual exclusion + majorCode flip', async ({
  page,
}) => {
  await page.goto('/major/new');

  // default type='MAJOR' (withDefaultValue + onInitialize running even on
  // CREATE — MajorEntityForm.tsx's onInitialize is NOT update-gated, unlike
  // Collabo's; useEntityFormInitializer with no `id` is what makes it run at
  // all here — see major/new/page.tsx doc): parentMajor visible+required,
  // college absent, majorCode visible+required, graduate tab visible.
  await expect(page.locator('#type')).toHaveValue('MAJOR');
  await expect(page.locator('[data-field-name="parentMajor"]')).toBeVisible();
  await expect(page.locator('[data-field-name="college"]')).toHaveCount(0);
  await expect(page.locator('#majorCode')).toBeVisible();
  await expect(page.locator('#majorCode')).toHaveAttribute('aria-required', 'true');
  await expect(page.getByRole('tab', { name: '입학/졸업 설정' })).toBeVisible();

  // pick a parentMajor — also proves the pick is STABLE (not immediately
  // self-cleared by the college<->parentMajor cascade; see major.ts
  // majorOnChanges's DEVIATION doc — a literal 0.3.x port of these handlers
  // ping-pong-clears the field you just picked under this engine's EF2
  // sync-batch cascade).
  await page
    .locator('[data-field-name="parentMajor"]')
    .getByRole('button', { name: '찾기' })
    .click();
  let dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByText('공과대학').click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('[data-m2o-value="parentMajor"]')).toHaveText('공과대학');

  // --- toggle to DEPARTMENT ---
  await page.getByLabel(/유형/).selectOption('DEPARTMENT');

  // graduate tab BUTTON disappears entirely (EC3-0: only 1 visible tab left
  // -> ViewEntityForm's `tabs.length > 1` gate unmounts the whole tablist,
  // not just the one button).
  await expect(page.getByRole('tablist')).toHaveCount(0);
  await expect(page.getByRole('tab', { name: '입학/졸업 설정' })).toHaveCount(0);

  // college<->parentMajor flip
  await expect(page.locator('[data-field-name="college"]')).toBeVisible();
  await expect(page.locator('[data-field-name="parentMajor"]')).toHaveCount(0);

  // majorCode flip
  await expect(page.locator('#majorCode')).toHaveCount(0);

  // pick a college — same picker-stability proof as parentMajor above.
  await page.locator('[data-field-name="college"]').getByRole('button', { name: '찾기' }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByText('공과대학').click(); // college fixture also seeds a '공과대학'
  await expect(dialog).toBeHidden();
  await expect(page.locator('[data-m2o-value="college"]')).toHaveText('공과대학');

  // --- toggle back to MAJOR ---
  await page.getByLabel(/유형/).selectOption('MAJOR');

  await expect(page.getByRole('tablist')).toBeVisible();
  await expect(page.getByRole('tab', { name: '입학/졸업 설정' })).toBeVisible();
  await expect(page.locator('[data-field-name="college"]')).toHaveCount(0);
  await expect(page.locator('[data-field-name="parentMajor"]')).toBeVisible();
  // parentMajor's value was reset by the type handler's MAJOR-branch
  // (MajorEntityForm.tsx :208 resetValue, faithfully ported) — not still
  // showing the earlier '공과대학' pick.
  await expect(page.locator('[data-m2o-value="parentMajor"]')).toHaveText('(선택 안 됨)');
  await expect(page.locator('#majorCode')).toBeVisible();
});

test('Scenario b/c — professors XrefMapping: multi-select picker -> display grid -> save round-trip -> delete -> save', async ({
  page,
}) => {
  await page.goto('/major/new');
  await page.getByLabel(/학과명/).fill('신설학과');
  // type stays the default MAJOR -> parentMajor required (picked below);
  // majorCode required too.
  await page
    .locator('[data-field-name="parentMajor"]')
    .getByRole('button', { name: '찾기' })
    .click();
  let dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByText('공과대학').click();
  await expect(dialog).toBeHidden();
  await page.locator('#majorCode').fill('NEWCS');

  // --- (b) professors: multi-select via checkboxes -> "선택 완료" ---
  await page
    .locator('[data-field-name="professors"]')
    .getByRole('button', { name: '선택' })
    .click();
  dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.locator('tr', { hasText: '김태윤' }).getByRole('checkbox').check();
  await dialog.locator('tr', { hasText: '이하은' }).getByRole('checkbox').check();
  await dialog.getByRole('button', { name: '선택 완료' }).click();
  await expect(dialog).toBeHidden();

  // display grid reflects the picks immediately (client-side, before save)
  const professorsGrid = page.locator('[data-field-name="professors"]');
  await expect(professorsGrid.getByText('김태윤')).toBeVisible();
  await expect(professorsGrid.getByText('이하은')).toBeVisible();

  // --- save -> POST /api/major, payload professors:{mapped:['1','2']} ---
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/major$/);

  // --- reopen: the mock backend's {mapped,deleted} xref application
  // (mock-backend/major.ts fromWire/toWire) round-tripped the mapping, AND
  // the professor search endpoint's IN(mapped ids) filter (store.ts
  // matchesFilterGroup) actually narrowed the display grid to just these two. ---
  await page.getByText('신설학과').click();
  await expect(page).toHaveURL(/\/major\/\d+$/);
  const reopenedGrid = page.locator('[data-field-name="professors"]');
  await expect(reopenedGrid.getByText('김태윤')).toBeVisible();
  await expect(reopenedGrid.getByText('이하은')).toBeVisible();

  // --- (c) display grid check -> "삭제" -> save -> deleted array honored ---
  await reopenedGrid.locator('tr', { hasText: '김태윤' }).getByRole('checkbox').check();
  await reopenedGrid.getByRole('button', { name: '삭제' }).click();
  await expect(reopenedGrid.getByText('김태윤')).toHaveCount(0);
  await expect(reopenedGrid.getByText('이하은')).toBeVisible();

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/major$/);

  // reopen again — the deletion persisted server-side, not just client-side.
  await page.getByText('신설학과').click();
  const finalGrid = page.locator('[data-field-name="professors"]');
  await expect(finalGrid.getByText('이하은')).toBeVisible();
  await expect(finalGrid.getByText('김태윤')).toHaveCount(0);
});

test('Scenario d — staffs XrefMapping picker only shows rows passing the async filter (assistant=true)', async ({
  page,
}) => {
  await page.goto('/major/new');

  await page.locator('[data-field-name="staffs"]').getByRole('button', { name: '선택' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // mock-backend/collabo.ts staffSeed: 이서연/최윤아 assistant:true, 박준서
  // assistant:false — a real discriminating proof (not "everything passes").
  await expect(dialog.getByText('이서연')).toBeVisible();
  await expect(dialog.getByText('최윤아')).toBeVisible();
  await expect(dialog.getByText('박준서')).toHaveCount(0);
});

test('Scenario e — edit mode: parentMajor picker self-excludes the open major (NOT_EQUAL self-filter)', async ({
  page,
}) => {
  // EC-R1 — the file header claims edit-mode NOT_EQUAL self-filter coverage,
  // but every prior scenario only opens /major/new (parentMajorFilter is
  // only built when MajorEntityForm(currentId) has a truthy id — major.ts
  // ~line 140). Seed row id '1' 컴퓨터공학과 (type MAJOR, parentMajorId '2')
  // — mock-backend/major.ts majorSeed — is a MAJOR-type row so parentMajor
  // stays visible (DEPARTMENT-type rows hide it via the type cascade).
  await page.goto('/major/1');
  await expect(page.getByLabel(/학과명/)).toHaveValue('컴퓨터공학과');
  await expect(page.locator('#type')).toHaveValue('MAJOR');
  await expect(page.locator('[data-field-name="parentMajor"]')).toBeVisible();

  await page
    .locator('[data-field-name="parentMajor"]')
    .getByRole('button', { name: '찾기' })
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // the mock backend's server-side NOT_EQUAL application (EC3, store.ts
  // matchesFilterGroup) actually excludes the open major's OWN row — a
  // different major (id '2', 공과대학) stays pickable, proving this is a
  // real exclusion and not an accidentally-empty picker.
  await expect(dialog.getByText('공과대학')).toBeVisible();
  await expect(dialog.getByText('컴퓨터공학과')).toHaveCount(0);
});
