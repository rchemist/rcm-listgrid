import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
// Default import, NOT `import * as XLSX` — the repo's root package.json is
// `"type": "module"`, so Playwright's Node-side (ESM) test runtime resolves
// `xlsx-js-style` (a CJS bundle Node's cjs-module-lexer cannot statically
// analyze for named exports) to a namespace with only a `default` property;
// `XLSX.utils` is undefined off that namespace and only reachable through
// `.default`. `packages/excel/src/export-core.ts`'s `import * as XLSX` works
// because THAT file is bundled by tsup (esbuild's CJS-interop synthesizes the
// namespace at build time), not run directly by Node's ESM loader like this
// spec file is.
import XLSX from 'xlsx-js-style';

// W6-3 acceptance — the `@listgrid/excel` runtime wired into the College list
// via ViewListGrid's `toolbar` render-prop (apps/sample/app/college/page.tsx;
// decision 4/C7, ViewListGrid.tsx :82/:437). This is the "빌드 통과 ≠ 작동"
// proof for the whole wave: a real xlsx file actually downloads from the
// browser, and a real xlsx file actually uploads and round-trips into the
// list.
//
// EXPORT is the HARD gate (decision 7 — 100% client-side, no backend call):
// DataExporter builds the workbook off the store's already-fetched `rows`
// and downloads it via file-saver's `saveAs` (a real `<a download>` click,
// Playwright-observable through `page.waitForEvent('download')`).
//
// IMPORT builds its `.xlsx` fixture in Node with the SAME `xlsx-js-style`
// peer `@listgrid/excel` uses (not a committed binary fixture) so the header
// format (`${label}\n[${name}]`, `import-core.ts` `FIELD_TOKEN_RE`) can't
// drift from what the runtime actually expects. Only College's scalar fields
// (name/englishName/active) are populated — `dean` (manyToOne) and
// `description` are auto-derived into the declared import field list too
// (college.ts `withDataTransfer({ import: {} })`) but are simply absent from
// this fixture's header row, which `matchImportColumns` tolerates (unmatched
// declared fields are dropped, not required) — this keeps the round-trip
// deterministic without a manyToOne relation or textarea value in play.

test('College export downloads an .xlsx file (client-side, no backend)', async ({ page }) => {
  await page.goto('/college');
  await expect(page.getByText('공과대학')).toBeVisible();

  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Export' });
  await expect(dialog).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Download' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  const bytes = readFileSync(filePath as string);
  expect(bytes.byteLength).toBeGreaterThan(0);
});

test('College import uploads an .xlsx fixture and the new row appears in the list', async ({
  page,
}) => {
  const name = `엑셀업로드대학-${Date.now()}`;
  const aoa = [
    ['명칭\n[name]', '영문명\n[englishName]', '사용여부\n[active]'],
    [name, 'Excel Uploaded College', '예'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }) as Buffer;

  await page.goto('/college');
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Import' });
  await expect(dialog).toBeVisible();

  await dialog.locator('input[type="file"]').setInputFiles({
    name: 'college-import.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer,
  });

  await dialog.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText(name)).toBeVisible();
});
