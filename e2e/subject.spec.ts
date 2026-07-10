import { expect, test } from '@playwright/test';

// V1 acceptance — a validation-rich Subject form on the new engine (charter
// C4/C5): the declared-validation catalog (Regex/MinMax/Email) firing per
// field, and a CROSS-FIELD conditional (onlineUrl appears + becomes required
// only for the ONLINE category — the dependsOn/D4 cascade, charter C2).

test('Subject declared validations fire, then pass (regex / minmax / email)', async ({ page }) => {
  await page.goto('/subject');
  await expect(page.getByText('자료구조')).toBeVisible(); // seed row

  await page.getByRole('button', { name: '새로 만들기' }).click();
  await expect(page).toHaveURL(/\/subject\/new$/);

  await page.getByLabel(/과목명/).fill('알고리즘');
  await page.getByLabel(/과목코드/).fill('bad-code'); // fails the regex
  await page.getByLabel(/학점/).fill('9'); // out of [1,6]
  await page.getByLabel(/이메일/).fill('not-an-email'); // fails email
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText(/과목코드 형식/)).toBeVisible();
  await expect(page.getByText(/학점은 1~6/)).toBeVisible();
  await expect(page.getByText(/이메일 형식/)).toBeVisible();
  await expect(page).toHaveURL(/\/subject\/new$/); // blocked

  // fix all three → save succeeds
  await page.getByLabel(/과목코드/).fill('CS301');
  await page.getByLabel(/학점/).fill('3');
  await page.getByLabel(/이메일/).fill('algo@example.ac.kr');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/subject$/);
  await expect(page.getByText('알고리즘')).toBeVisible();
});

test('Subject cross-field conditional: onlineUrl shows + is required only for ONLINE', async ({
  page,
}) => {
  await page.goto('/subject/new');
  await page.getByLabel(/과목명/).fill('온라인특강');
  await page.getByLabel(/과목코드/).fill('ON101');
  await page.getByLabel(/학점/).fill('2');
  await page.getByLabel(/이메일/).fill('online@example.ac.kr');

  // default category (전공) → onlineUrl hidden
  await expect(page.getByLabel(/온라인 강의 URL/)).toBeHidden();

  // switch to 온라인 → the field appears (cross-field cascade over category)
  await page.getByLabel(/구분/).selectOption('ONLINE');
  await expect(page.getByLabel(/온라인 강의 URL/)).toBeVisible();

  // now required — blank save fails
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(/필수 값입니다/)).toBeVisible();
  await expect(page).toHaveURL(/\/subject\/new$/);

  // fill it → save succeeds
  await page.getByLabel(/온라인 강의 URL/).fill('https://lms.example.ac.kr/on101');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/subject$/);
  await expect(page.getByText('온라인특강')).toBeVisible();
});
