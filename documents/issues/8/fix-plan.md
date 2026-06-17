# Issue #8: NumberField 셀 포매터 formatPrice() 가 null 값에 toLocaleString 호출 → 런타임 크래시 (null-guard 부재)

## GitHub Issue Information
- **ID**: 8
- **Title**: NumberField 셀 포매터 formatPrice() 가 null 값에 toLocaleString 호출 → 런타임 크래시 (null-guard 부재)
- **Created**: 2026-06-16T16:22:00Z
- **Labels**: (없음)
- **Status**: OPEN
- **Assignee**: @me

## Issue Content (요약)
nullable 한 `NumberField` 컬럼을 가진 list 를 렌더할 때, 값이 `null` 인 행이 있으면
`TypeError: Cannot read properties of null (reading 'toLocaleString')` 로 페이지가 크래시한다.
제보자는 `misc/index.ts` 의 `formatPrice` 에 null-guard 가 없는 것을 원인으로 지목.

## 정당성 검증 (결론: **정당한 버그**)
- 제보된 증상/스택은 실제 코드와 일치. **다만 실제 크래시 진입점은 제보자가 지목한 `formatPrice` 보다 한 단계 위**다.
- 크래시 경로: list 셀 렌더러 `renderListItemInstance` 가 `null` 을 거른 적 없이 `formatPrice(null)` 을 호출 → `formatPrice` 내부 `value.toLocaleString()` 에서 throw.
- **상세/뷰 렌더러(`renderViewInstance`) 는 이미 null 을 정상 처리**(line 149) 하므로 "list 화면만 크래시" 라는 제보 증상이 정확히 설명된다.

## Problem Analysis
- **Symptoms**: nullable NumberField 컬럼에 `null` 행이 1건이라도 있으면 list 렌더 중 React throw → 에러 바운더리로 화면 전체 크래시.
- **Scope of Impact**: nullable number 컬럼을 쓰는 **모든 list 화면**(전 컨슈머). number 도메인에서 `null`(미설정/전체) 은 정상값이라 흔함.
- **Severity**: **HIGH** — try/catch 로 감싸지지 않는 렌더 throw, 회피 불가, 데이터에 따라 화면 전체 다운.

## Root Cause (코드 대조 확인)

### 1차 진입점 — `src/listgrid/components/fields/NumberField.tsx:130-138` `renderListItemInstance`
```ts
protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
  if (props.item[this.name] !== undefined) {     // ← null !== undefined → TRUE (null 통과)
    const numberValue = props.item[this.name];   // ← numberValue = null
    return Promise.resolve({ result: formatPrice(numberValue) }); // → formatPrice(null) → throw
  }
  const value = String(props.item[this.name] ?? '');
  return Promise.resolve({ result: value });
}
```
`!== undefined` 가드는 `null` 을 걸러내지 못한다. 같은 파일의 `renderViewInstance`(line 145-151) 는
`value === null || value === undefined || value === ''` 로 이미 정확히 처리 → **두 렌더러의 가드 비대칭이 근본 원인**.

### 2차(공유 util) — `src/listgrid/misc/index.ts:150-164` `formatPrice`
```ts
export function formatPrice(value: number, localeCode?: string): string {
  if (localeCode) { try { return new Intl.NumberFormat(...).format(value); } catch {} }
  const formattedNumber = value.toLocaleString('en-US');   // ← value 가 null/undefined 면 throw
  ...
}
```
public export(`index.ts:123`) 이기도 한 공유 util 이 null-guard 가 없다 → 어떤 호출부든 null 을 넘기면 깨진다.

## Code Analysis
### Frontend (이 라이브러리는 FE 전용)
- **Related Files**:
  - `src/listgrid/components/fields/NumberField.tsx` — `renderListItemInstance`(크래시 진입점), `renderViewInstance`(이미 정상)
  - `src/listgrid/misc/index.ts` — `formatPrice`(공유 util, public API)
  - `src/listgrid/misc/index.test.ts` — formatPrice 테스트 블록(line 168~)
- **Analysis**: `formatPrice` 호출부는 `renderListItemInstance`(line 133), `renderViewInstance`(line 159, 단 호출 전 null 가드 있음) 두 곳. Backend 변경 없음.

## Feature Surface Map
| Layer | What changes | How verified | Shared/Hot? |
|-------|--------------|--------------|-------------|
| `formatPrice` (misc, public export) | null/undefined → `''` 조기 반환 | 단위 테스트 (`formatPrice(null)===''`) | **YES — 공유 util/public API** |
| `NumberField.renderListItemInstance` | `!== undefined` → `!= null` (null 도 빈 셀로) | 단위 테스트 + list 렌더 수동 확인 | NO |
| `NumberField.renderViewInstance` | 변경 없음 (이미 null 처리) | 회귀 확인만 | NO |
| 기존 정상 number 셀 (non-null) | 동작 불변 (regression 0) | 기존 테스트 통과 | NO |

## Concrete Fix Plan

> Design note — **explicit guard over silent pass-through**: 두 곳을 모두 고친다. ① 공유 util `formatPrice` 에 nullish 조기 반환(방어선/ public API 보강), ② 실제 진입점 call-site 가드를 `renderViewInstance` 와 동일 의미(`!= null`)로 맞춰 비대칭 제거. null number 셀 표시값은 **빈 셀('')** 로 합의 — `renderViewInstance` 가 null 을 빈 값으로 처리하는 것과 일관.

### Step 1: `formatPrice` nullish 가드 (1차 방어선 + public API 보강)
**파일**: `src/listgrid/misc/index.ts`

#### Current (line 150-164)
```ts
export function formatPrice(value: number, localeCode?: string): string {
  if (localeCode) {
    try { return new Intl.NumberFormat(localeCode, { style: 'currency', currency: 'KRW' }).format(value); }
    catch { /* fall through */ }
  }
  const formattedNumber = value.toLocaleString('en-US');
  if (localeCode === '원') return `${formattedNumber} 원`;
  if (localeCode) return `${localeCode}${formattedNumber}`;
  return formattedNumber;
}
```

#### After
```ts
export function formatPrice(value: number | null | undefined, localeCode?: string): string {
  // nullish 값은 포맷 대상이 아니다 — 빈 문자열로 graceful 반환.
  // (number 도메인에서 null/undefined 는 "미설정/전체" 의 정상값이며,
  //  toLocaleString 호출 전에 걸러 런타임 throw 를 방지한다.)
  if (value == null) return '';
  if (localeCode) {
    try { return new Intl.NumberFormat(localeCode, { style: 'currency', currency: 'KRW' }).format(value); }
    catch { /* fall through */ }
  }
  const formattedNumber = value.toLocaleString('en-US');
  if (localeCode === '원') return `${formattedNumber} 원`;
  if (localeCode) return `${localeCode}${formattedNumber}`;
  return formattedNumber;
}
```
(시그니처를 `number | null | undefined` 로 넓혀 타입 레벨에서도 nullish 입력을 인정.)

### Step 2: list 셀 렌더러 가드 비대칭 제거 (실제 진입점)
**파일**: `src/listgrid/components/fields/NumberField.tsx`

#### Current (line 130-138)
```ts
protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
  if (props.item[this.name] !== undefined) {
    const numberValue = props.item[this.name];
    return Promise.resolve({ result: formatPrice(numberValue) });
  }
  const value = String(props.item[this.name] ?? '');
  return Promise.resolve({ result: value });
}
```

#### After
```ts
protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
  // null 도 undefined 와 동일하게 "값 없음" 으로 처리 (renderViewInstance 와 일관).
  // `!= null` 은 null 과 undefined 를 모두 포괄한다.
  if (props.item[this.name] != null) {
    const numberValue = props.item[this.name];
    return Promise.resolve({ result: formatPrice(numberValue) });
  }
  const value = String(props.item[this.name] ?? '');
  return Promise.resolve({ result: value });
}
```
Step 1 만으로도 크래시는 막히지만(=`formatPrice(null)→''`), call-site 가드를 함께 정리해 의도를
명확히 하고 `renderViewInstance` 와의 비대칭을 없앤다.

### Step 3: 회귀 테스트 추가
**파일**: `src/listgrid/misc/index.test.ts` — `describe('formatPrice', ...)`(line 168) 블록에 추가
```ts
it('returns empty string for null / undefined (no throw)', () => {
  expect(formatPrice(null as unknown as number)).toBe('');
  expect(formatPrice(undefined as unknown as number)).toBe('');
  expect(formatPrice(null as unknown as number, '원')).toBe('');
});
it('still formats 0 (falsy but valid number)', () => {
  expect(formatPrice(0)).toBe('0');
});
```
> 주의: `0` 은 nullish 가 아니므로 정상 포맷되어야 한다(`value == null` 로 걸러야지 `!value` 로 거르면 0 이 사라진다). 위 테스트가 이를 고정한다.

## Acceptance Scenario (executable — definition of done)
1. (단위) `formatPrice(null)` / `formatPrice(undefined)` → `''` 반환, throw 없음 → **PASS**
2. (단위) `formatPrice(0)` → `'0'`, `formatPrice(1234567)` → `'1,234,567'` (기존 동작 불변) → **PASS**
3. (렌더) nullable `NumberField` 컬럼 + `null` 행이 포함된 데이터로 `ViewListGrid` 렌더 → 크래시 없이 해당 셀이 **빈 셀**로 표시, 나머지 행은 정상 포맷 → **PASS**
4. (회귀) 기존 number list/뷰 화면 표시값 변화 없음 → **PASS**

## Environment & Temporal Preconditions
- **Test data needed**: nullable number 컬럼에 `null` 인 행 1건 이상 (예: edustack lms-admin `/ai-quota` 의 `providerCapabilityId NULL=전체`).
- **Temporal**: 무관.
- **Needs restart/redeploy to take effect**: 컨슈머는 `@rchemist/listgrid` 새 patch(0.3.22) 로 **재설치/재빌드** 필요. 라이브러리 내부 런타임 캐시/스키마 없음.
- **Target env / DB**: 무관 (순수 프런트 포맷 로직).

## Validation and Test Plan
1. `npm run type-check` — PASS (시그니처 확장 포함)
2. `npm test` — 기존 + 신규 formatPrice 테스트 PASS
3. `npm run lint` / `npm run format:check` — 0 errors
4. `npm run build` — dist 생성 OK
5. **Acceptance Scenario 3번(실 렌더)** 을 컨슈머 또는 스토리/픽스처로 실제 확인

## Risk Factors and Mitigation
- **Risk**: `0` 같은 falsy-but-valid number 가 빈 셀로 사라질 수 있음. → **Mitigation**: `!value` 가 아니라 `value == null` 로만 거른다. 전용 테스트로 고정(Step 3).
- **Risk**: public API 시그니처 확장이 다운스트림 타입에 영향. → **Mitigation**: `number` → `number | null | undefined` 는 입력 확장(공변적으로 안전), 기존 호출부 깨짐 없음.

## Success Criteria
1. nullable number 컬럼에 null 행이 있어도 list 가 크래시하지 않고 빈 셀로 렌더된다(Acceptance #3).
2. `formatPrice(0)` 등 기존 정상값 포맷이 그대로 유지된다(regression 0).
3. type-check / test / lint / build 전부 통과.

## Implementation Results

**상태: 구현 완료 + 라이브러리 레벨 검증 green (릴리스 0.3.22)**

### 변경 파일
- `src/listgrid/misc/index.ts` — `formatPrice` 에 `if (value == null) return ''` 가드 추가, 시그니처 `number | null | undefined` 로 확장 (0 은 유효값으로 보존).
- `src/listgrid/components/fields/NumberField.tsx` — `renderListItemInstance` 가드 `!== undefined` → `!= null` 로 정정 (`renderViewInstance` 와 일관).
- `src/listgrid/misc/index.test.ts` — null/undefined→'' (with `원` localeCode 포함) + `formatPrice(0)==='0'` 회귀 테스트 추가.

### 검증 결과
- `npm run type-check` — **PASS**
- `npm test` — **929 passed / 1 todo / 0 fail** (신규 formatPrice 테스트 포함)
- `npm run lint` — **0 errors** (기존 warning 만)
- `npm run format:check` — **PASS** (변경 파일)
- `npm run build` — **PASS**, 빌드된 `dist/listgrid/misc/index.js`·`dist/.../NumberField.js` 에 수정 반영 확인.

### Acceptance Scenario 실행 결과
- #1 `formatPrice(null|undefined)→''`, throw 없음 — **PASS (단위 테스트)**
- #2 `formatPrice(0)→'0'`, `formatPrice(1234567)→'1,234,567'` — **PASS (단위 테스트)**
- #3 nullable number list 에 null 행 렌더 → 빈 셀 — 라이브러리 레벨 가드로 보장(크래시 경로 제거). **컨슈머 실화면 최종 확인 권장.**
- #4 기존 number 화면 회귀 0 — **PASS (전체 스위트 green)**
