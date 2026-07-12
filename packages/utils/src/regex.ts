// Regex constants — transplanted verbatim from src/listgrid/misc/index.ts
// (0.3.x, `RegexKoreanName`..`RegexNumber`). GX-3 (w7-post-seal-gap-analysis.md
// §GX-3). React-free.
//
// The email/phone/telephone/password patterns (`RegexEmailAddress`,
// `RegexPhoneNumber`, `RegexTelephoneNumber`, `RegexPasswordNormal`) are
// deliberately NOT here — they already live publicly at
// `@listgrid/schema-core`'s `util/regex.ts` (consumed by the validations
// catalog). Import them from `@rchemist/listgrid/schema` instead of
// duplicating a second copy here.

export const RegexKoreanName: RegExp = /^[가-힣]{2,5}$/;
export const RegexLoginName: RegExp = /^[a-z][a-z0-9]{4,23}$/;
export const RegexLoginNameForSignIn: RegExp = /^[a-zA-Z][a-zA-Z0-9._-]{1,23}$/;
export const RegexStudentLoginName: RegExp = /^\d{10}$/;
export const RegexAlias: RegExp = /^[a-z0-9-_]{3,24}$/;
export const RegexUrlBody: RegExp = /^[a-zA-Z0-9-\/가-힣]{2,100}$/;
export const RegexDomain: RegExp = /^(https?:\/\/)[^\s\/$.?#].[^\s]*[^\/?]$/;
export const RegexLowerEnglish: RegExp = /^[a-z]{1,100}$/;
export const RegexLowerEnglishNumber: RegExp = /^[a-z0-9]{1,100}$/;
export const RegexEnglishNumber: RegExp = /^[a-zA-Z0-9]{1,100}$/;
export const RegexNumber: RegExp = /^[0-9]{1,100}$/;
