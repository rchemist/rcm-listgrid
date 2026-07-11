import { expect, test } from '@playwright/test';

// W3-1 acceptance — CAP-02 (tab/group requiredPermissions gate the view) +
// CAP-03 (hasVisibleContent suppresses an empty tab/group), driven through a
// real browser. apps/sample's session (providers.tsx) is fixed to
// `roles: ['ADMIN']` — the dedicated perm-demo fixture (lib/entities/
// perm-demo.ts) proves: an 'ADMIN'-gated tab stays visible, a
// 'SUPERADMIN'-gated tab/group is suppressed, and the always-visible 'main'
// tab/'basic' group are unaffected.

test('tab/group requiredPermissions gate the ViewEntityForm for the fixed ADMIN session', async ({
  page,
}) => {
  await page.goto('/perm-demo/new');

  // control — the always-visible 'main' tab's field renders.
  await expect(page.getByLabel(/이름/)).toBeVisible();

  // CAP-02 tab gate — the session HOLDS 'ADMIN' -> the '관리자' tab button renders.
  await expect(page.getByRole('tab', { name: '관리자' })).toBeVisible();

  // CAP-02 tab gate — the session LACKS 'SUPERADMIN' -> the '최고관리자' tab is suppressed.
  await expect(page.getByRole('tab', { name: '최고관리자' })).toHaveCount(0);

  // CAP-03 hasVisibleContent — '비밀그룹' carries no group-level
  // requiredPermissions of its own, but its sole field requires
  // 'SUPERADMIN' (which the session lacks) -> the group has zero visible
  // content and is suppressed entirely (neither its legend nor its field render).
  await expect(page.getByText('비밀그룹')).toHaveCount(0);
  await expect(page.getByLabel(/비밀필드/)).toHaveCount(0);

  // switching to the visible '관리자' tab shows its (permitted) field.
  await page.getByRole('tab', { name: '관리자' }).click();
  await expect(page.getByLabel(/관리자전용필드/)).toBeVisible();
});
