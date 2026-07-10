import { expect, test } from '@playwright/test';

// V2 acceptance — the SubCollection (charter C3 OneToMany): Professor.degrees
// edited inline. Each row is added/edited through the child (Degree) form in a
// Modal backed by its OWN isolated store (ADR-0002 §4); rows accumulate in the
// parent form's collection value and save with the parent.

test('Professor degrees SubCollection: add rows via the isolated child form, save', async ({
  page,
}) => {
  await page.goto('/professor/new');
  await page.getByLabel(/교수명/).fill('김철수');
  await page.getByLabel(/이메일/).fill('kim@example.ac.kr');

  // --- add a degree through the child form modal ---
  await page.getByRole('button', { name: '추가' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel(/학교/).fill('서울대학교');
  await dialog.getByLabel(/전공/).fill('컴퓨터공학');
  await dialog.getByLabel(/학위구분/).selectOption('DOCTOR');
  await dialog.getByLabel(/취득연도/).fill('2015');
  await dialog.getByRole('button', { name: 'Save' }).click(); // child save
  await expect(dialog).toBeHidden();

  // the row landed in the degrees table (parent collection value)
  await expect(page.getByText('서울대학교')).toBeVisible();
  await expect(page.getByText('컴퓨터공학')).toBeVisible();

  // --- add a second degree (a fresh isolated child store) ---
  await page.getByRole('button', { name: '추가' }).click();
  const dialog2 = page.getByRole('dialog');
  await dialog2.getByLabel(/학교/).fill('카이스트');
  await dialog2.getByLabel(/전공/).fill('전산학');
  await dialog2.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('카이스트')).toBeVisible();

  // --- remove the second row ---
  await page
    .locator('[data-subcollection="degrees"] tr', { hasText: '카이스트' })
    .getByRole('button', { name: '삭제' })
    .click();
  await expect(page.getByText('카이스트')).toBeHidden();
  await expect(page.getByText('서울대학교')).toBeVisible(); // first row survives

  // --- save the professor with its remaining degree ---
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/professor$/);
  await expect(page.getByText('김철수')).toBeVisible();
});
