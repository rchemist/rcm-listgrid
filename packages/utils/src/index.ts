// @listgrid/utils — regex/date/compare/URL/storage/asset-URL utilities ported
// from the 0.3.x `./misc` subpath (src/listgrid/misc/index.ts). GX-3
// (documents/analysis/2026-07-12/w7-post-seal-gap-analysis.md §GX-3).
//
// Zero runtime dependencies (no `date-fns`, no `@listgrid/*` workspace deps).
// React-free. May use browser globals (`window`/`localStorage`/
// `sessionStorage`), always guarded for SSR safety.
//
// Deliberately excluded (dead 0.3.x placeholders, `any`-typed even there):
// `RequestUtil`, `EntityError`.

// --- regex constants (the 11 NOT already public at @listgrid/schema-core —
// see ./regex.ts doc for the email/phone/telephone/password split) ---
export {
  RegexKoreanName,
  RegexLoginName,
  RegexLoginNameForSignIn,
  RegexStudentLoginName,
  RegexAlias,
  RegexUrlBody,
  RegexDomain,
  RegexLowerEnglish,
  RegexLowerEnglishNumber,
  RegexEnglishNumber,
  RegexNumber,
} from './regex';

// --- date formatters (self-implemented, zero-dependency — see ./date.ts doc) ---
export {
  fDate,
  fDateTime,
  fTimestamp,
  fToNow,
  formatYearMonth,
  getCurrentYear,
  getCurrentMonth,
  getCurrentYearMonth,
  getCurrentHour,
  getFormattedTime,
  getDefinedDates,
} from './date';
export type { FToNowOptions, DefinedDateType } from './date';

// --- comparison utilities (isEquals/isEqualCollection hosted here, not
// re-exported from schema-core's barrel — see ./compare.ts doc) ---
export {
  isNulls,
  isEquals,
  isEqualsIgnoreCase,
  isEqualCollection,
  isEmpty,
  isPositive,
  isNegative,
} from './compare';

// --- URL helpers ---
export { normalizeUrl, removeTrailingSeparator, isExternalUrl } from './url';

// --- JSON + storage helpers ---
export {
  stringify,
  parse,
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
  getLocalStorageObject,
  getSessionStorageItem,
  setSessionStorageItem,
  removeSessionStorageItem,
  getSessionStorageObject,
} from './storage';

// --- asset-server URL helpers (adapter-injected base ?? global fallback —
// see ./asset-url.ts doc) ---
export {
  ASSET_SERVER_URL,
  ASSET_PREFIX,
  setAssetServerBase,
  configureAssetServerUrl,
  configureAssetPrefix,
  getAccessableAssetUrl,
  removeAssetServerPrefix,
  validatedAssetFileName,
} from './asset-url';

// --- price formatting ---
export { formatPrice } from './format-price';
