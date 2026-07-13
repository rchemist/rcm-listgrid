import { expect, test } from '@playwright/test';

test('[EFS-18c] withGroup — open controls initial collapse', async ({ page }) => {
  await page.goto('/entityform-proof/with-group--efs-18c');

  const disclosure = page.getByRole('button', { name: 'Collapsible group' });
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByLabel('Collapsed field')).not.toBeVisible();

  await disclosure.click();
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByLabel('Collapsed field')).toBeVisible();
});
