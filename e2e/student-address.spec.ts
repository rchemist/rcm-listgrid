import { expect, Page, test } from '@playwright/test';

// EC1 acceptance — the FIRST real-browser exercise of the EB address stack
// (AddressField/applyFullAddressFields, schema-core; AddressFieldRenderer,
// @listgrid/react): required validation on the flat address1/postalCode
// siblings (EB-R1 focus-lands-on-a-suppressed-sibling behavior), the Daum
// 주소 찾기 → Modal → DaumPostcode picker flow, and flat-column persistence
// round-tripping through the mock RCM backend (create + edit).
//
// Daum contract stubbed (no external network — react-daum-postcode
// `DaumPostcodeEmbed`, node_modules/react-daum-postcode/lib/index.esm.js):
// the component appends a <script src={scriptUrl}> (default scriptUrl —
// AddressFieldRenderer never overrides it —
// 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js') to
// document.body, awaits its onload, then reads `window.daum.Postcode` (a
// constructor) and does
// `new window.daum.Postcode({...props, oncomplete}).embed(wrapperEl, {q, autoClose})`.
// The stub below fulfills that script request with a script defining
// `window.daum.Postcode` as a constructor whose `embed(container)` method
// synchronously invokes the `oncomplete` callback it was constructed with,
// carrying the fixture `{zonecode, roadAddress, sido, sigungu}` —
// AddressFieldRenderer's `handleComplete` maps those to
// postalCode/address1/state/city respectively (address-renderer.tsx
// `DaumPostcodeResult`/`handleComplete`).
const DAUM_SCRIPT_URL = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

// Deliberately distinct from both seed students' postal codes
// (mock-backend/academic.ts studentSeed: '06236' / '13494') so list/column
// assertions below can't accidentally match a seed row instead of the newly
// created one.
const DAUM_FIXTURE = {
  zonecode: '04524',
  roadAddress: '서울 중구 세종대로 110',
  sido: '서울',
  sigungu: '중구',
};

const DAUM_STUB_SCRIPT = `
window.daum = window.daum || {};
window.daum.Postcode = function Postcode(options) {
  this.embed = function embed() {
    if (options && typeof options.oncomplete === 'function') {
      options.oncomplete(${JSON.stringify(DAUM_FIXTURE)});
    }
  };
};
`;

// EC-F1 — the Daum-stub script-load race (student-address flake root cause):
// AddressFieldRenderer only mounts <DaumPostcode> once the picker Modal is open
// ({open && <DaumPostcode ... />} in address-renderer.tsx), so the
// react-daum-postcode script tag is injected — and `window.daum.Postcode`
// starts loading — AT THE SAME MOMENT the '주소 찾기' click opens the dialog,
// not before it. react-daum-postcode's `DaumPostcodeEmbed.componentDidMount`
// then chains scriptOnload → resolve → .then(initiate) → `new Postcode(...).embed()`
// → this stub's synchronous `oncomplete(...)` → handleComplete's `setOpen(false)`,
// all off ONE macrotask (the script tag's `onload` event) with no other
// scheduling boundary in between. Against a same-process `page.route` intercept
// (near-zero latency, unlike a real CDN fetch) that whole open→complete→close
// cycle can finish faster than the browser paints a frame, so Playwright's
// `getByRole('dialog').toBeVisible()` poll can observe "never existed" instead
// of "appeared then closed" — an intermittent, pre-existing flake, not
// something a bigger timeout fixes (the dialog really does close again before
// any poll interval elapses).
//
// Fix: restore a small, realistic network delay before fulfilling the script
// request. This changes ONLY the stub's timing, not its contract — same
// script body, same fixture, same synchronous oncomplete-on-embed behavior —
// but guarantees the Modal gets at least one paint while `open` is still true,
// which is exactly what a real (non-zero-latency) CDN fetch would have given
// it for free.
const DAUM_STUB_LATENCY_MS = 50;

async function stubDaumPostcode(page: Page): Promise<void> {
  await page.route(DAUM_SCRIPT_URL, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, DAUM_STUB_LATENCY_MS));
    await route.fulfill({ contentType: 'application/javascript', body: DAUM_STUB_SCRIPT });
  });
}

test('Student create: required fires on empty address, Daum stub fills it, save round-trips flat columns', async ({
  page,
}) => {
  await stubDaumPostcode(page);

  await page.goto('/student/new');
  await expect(page).toHaveURL(/\/student\/new$/);

  // name filled up front so the ONLY invalid fields on save are the
  // suppressed address siblings (EB-R1: focus-first-invalid must scan the
  // unfiltered field list, landing on a renderedBy sibling, not just skip
  // past it because name — lower declaration order — is also blank).
  await page.getByLabel(/이름/).fill('홍길동');

  // --- required fires on save with empty address ---
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('#postalCode-error')).toBeVisible();
  await expect(page.locator('#address1-error')).toBeVisible();
  await expect(page.getByText(/필수 값입니다/).first()).toBeVisible();
  await expect(page).toHaveURL(/\/student\/new$/); // did NOT navigate

  // focus-first-invalid landed on one of the (renderedBy-suppressed) address
  // siblings, not silently nowhere (EB-R1 finding 1).
  const focusedId = await page.evaluate(() => document.activeElement?.id);
  expect(['postalCode', 'address1']).toContain(focusedId);

  // --- 주소 찾기 → Modal → stubbed DaumPostcode completes ---
  await page.getByRole('button', { name: '주소 찾기' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await expect(page.locator('#postalCode')).toHaveValue(DAUM_FIXTURE.zonecode);
  await expect(page.locator('#address1')).toHaveValue(DAUM_FIXTURE.roadAddress);
  await expect(page.getByText(`${DAUM_FIXTURE.sido} ${DAUM_FIXTURE.sigungu}`)).toBeVisible();
  await expect(dialog).toBeHidden(); // handleComplete closes the modal

  // postalCode/address1 are read-only displays (Daum-populated, not
  // hand-typed) — errors are gone now that they're filled.
  await expect(page.locator('#postalCode')).toHaveAttribute('readonly', '');
  await expect(page.locator('#address1')).toHaveAttribute('readonly', '');

  // --- address2 is the one editable field; fill it, then save ---
  await page.locator('#address2').fill('101동 202호');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/student$/);

  // --- the created row is in the list ---
  const newRow = page.getByText('홍길동');
  await expect(newRow).toBeVisible();
  await expect(page.getByText(DAUM_FIXTURE.zonecode)).toBeVisible(); // postalCode column

  // --- the mock backend recorded the POST with flat columns: reopen and
  //     read them back (same round-trip proof college.spec.ts uses) ---
  await newRow.click();
  await expect(page.locator('#postalCode')).toHaveValue(DAUM_FIXTURE.zonecode);
  await expect(page.locator('#address1')).toHaveValue(DAUM_FIXTURE.roadAddress);
  await expect(page.locator('#address2')).toHaveValue('101동 202호');
  await expect(page.getByText(`${DAUM_FIXTURE.sido} ${DAUM_FIXTURE.sigungu}`)).toBeVisible();
});

test('Student edit: flat columns hydrate the composite display, changing address2 alone persists', async ({
  page,
}) => {
  await page.goto('/student');
  await expect(page.getByRole('heading', { name: '학생' })).toBeVisible();

  // seeded student '김민준' (mock-backend/academic.ts studentSeed) carries
  // full flat address columns.
  const seedRow = page.getByText('김민준');
  await expect(seedRow).toBeVisible();
  await seedRow.click();
  await expect(page).toHaveURL(/\/student\/1$/);

  // --- flat columns hydrated into the composite display ---
  await expect(page.getByLabel(/이름/)).toHaveValue('김민준');
  await expect(page.locator('#postalCode')).toHaveValue('06236');
  await expect(page.locator('#address1')).toHaveValue('테헤란로 152');
  await expect(page.locator('#address2')).toHaveValue('3층');
  await expect(page.getByText('서울 강남구')).toBeVisible();

  // --- change address2 only ---
  await page.locator('#address2').fill('5층');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/student$/);

  // --- persisted: reopen and read it back, everything else unchanged ---
  await page.getByText('김민준').click();
  await expect(page).toHaveURL(/\/student\/1$/);
  await expect(page.locator('#address2')).toHaveValue('5층');
  await expect(page.locator('#postalCode')).toHaveValue('06236');
  await expect(page.locator('#address1')).toHaveValue('테헤란로 152');
  await expect(page.getByLabel(/이름/)).toHaveValue('김민준');
});
