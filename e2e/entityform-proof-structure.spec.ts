import { expect, test } from '@playwright/test';

test('[EFS-18c] withGroup — open controls initial collapse', async ({ page }) => {
  await page.goto('/entityform-proof/with-group--efs-18c');

  const disclosure = page.locator('details').filter({ hasText: 'Collapsible group' });
  await expect(disclosure).not.toHaveAttribute('open', '');
  await expect(page.getByLabel('Collapsed field')).not.toBeVisible();

  await disclosure.locator('summary').click();
  await expect(page.getByLabel('Collapsed field')).toBeVisible();
});
