# 다음 세션 실행 가이드 — v0.3 backlog (coverage + exactOpt + generic refactor)

> 목표: v0.3 backlog 3 개 항목을 순차적으로 소진. 세션 1~3 에 걸쳐 완료 가능.
> 전제: alpha.45 배포 완료 + 후속 정비(#66~#67) 완료. CI 4 게이트 강제 상태.
> 스타일: 메인 context 보호 + 에이전트 병렬 dispatch (alpha.36/45 패턴 유지).

---

## 0. 세션 시작 시 메인이 먼저 할 일

1. **이 문서 끝까지 읽기**.
2. `STATUS.md` 0 섹션 + `DECISIONS.md` #65~#67 훑기 (최근 세션 맥락).
3. "§ 5 권장 순서" 중 어느 Task 를 진행할지 결정 (세션당 1 개 권장).
4. 해당 Task 의 "에이전트 dispatch 플랜" 그대로 실행.

**메인 세션 context 보호 원칙** (DECISIONS #62, 재확인):
- 큰 파일 (EntityForm.tsx, FormField.tsx, CardManyToOneView.tsx) 은 메인이 직접 읽지 말 것
- 에이전트가 읽고 고정 포맷 리포트 반환
- 메인은 **집계 + 빌드 + 커밋 + 배포** 만 담당
- 블록별 commit 분리로 롤백 가능성 유지

---

## 1. 현재 상태 요약 (alpha.45 + 후속 정비 기준, 2026-04-19)

### 완료된 품질 게이트 (CI 에서 모두 hard-enforced)
- `npm run type-check`: strict + noImplicitAny + noImplicitReturns + noFallthroughCasesInSwitch + noUncheckedIndexedAccess
- `npm run lint`: 0 errors (ESLint v10 flat config, React Compiler 룰 비활성)
- `npm run format:check`: 0 drift (Prettier)
- `npm run test:coverage`: thresholds 8%/6%/6%/8% 강제
- `npm run build`: dist 검증

### 수치 baseline
- 테스트: **375 passing, 19 files**
- Coverage: **8.1%** statements (utils 93%, common 94%)
- `any`: **306** non-test (전체 329 — 대부분 의도적, DECISIONS #21/#65)
- strict 옵션: 4 개 승격 완료. `exactOptionalPropertyTypes` 만 미승격 (430 errors)

### v0.3 backlog (이 문서의 범위)
- **Task C** — Coverage 8.1% → 20%+ (config/form/fields 영역 테스트 확장)
- **Task D** — `exactOptionalPropertyTypes: true` 승격 (430 errors)
- **Task E** — `EntityForm<T>` / `FieldValue<T>` generic refactor (breaking change, v0.2 major bump 검토)

### v0.3 외 (보류/참고)
- 시각 회귀 수동 검증 + Playwright 스냅샷 suite (DECISIONS #63)
- `any` 추가 감축은 Task E (generic refactor) 후에만 의미 있음
- CSS 리팩토링은 alpha.40 에서 완료 상태 (framework-free 달성)

---

## 2. Task C — Coverage 8.1% → 20%+ (config/form/fields 테스트 확장)

### 전제
- utils/common 은 이미 93~94% (Task C 대상 제외)
- 현재 커버리지 영역별:
  - `components/list/utils`: 35.71%
  - `listgrid/ui`: 27.06%
  - `listgrid/config`: 11.54%
  - `listgrid/form`: 6.97%
  - `listgrid/misc`: 6.78%
  - `listgrid/store`: 18.18%
  - `listgrid/message`: 15%
  - 나머지 대부분 0~10%

### 목표 배분 (병렬 3 에이전트)

- **에이전트 C-1**: `config/` (Config.ts, EntityField.ts, EntityTab.ts, EntityFieldGroup.ts, EntityFormButton.ts, AdvancedSearchOpenCache.ts, ListGridViewFieldCache.ts, EntityItem.ts 등 순수 모델)
- **에이전트 C-2**: `form/` + `misc/` + `message/` + `store/` + `menu/` + `router/` + `urlState/` (순수 로직 영역)
- **에이전트 C-3**: `components/fields/abstract/` (FormField, OptionalField, ListableFormField, CheckButtonValidationField, AbstractDateField 의 비 UI 로직)

**React 컴포넌트 렌더 테스트는 최소화**. 순수 로직 / 클래스 메소드 우선. `render()` 는 꼭 필요한 경우에만.

### 공통 에이전트 프롬프트 (영역만 교체)

```
@rcm/listgrid 의 **테스트 커버리지 상향**. 담당 영역: [X].

**레포**: /Users/kunner/IdeaProjects/rcm-listgrid
**전제**:
- 8 files / 133 tests 였던 상태에서 utils/common 에 242 tests 추가되어 현재 375 passing
- 전체 coverage 8.1%. utils/common 은 이미 90%+ (대상 제외)
- vitest.config.ts 임계치: statements 8 / branches 6 / functions 6 / lines 8

**이 영역의 현재 커버리지**: [X]%  (아래 대상 파일 나열)

**대상 파일** (존재하는 것만):
- [영역별 파일 목록]

**테스트 작성 규칙**:
1. 각 파일에 대응하는 `*.test.ts` (또는 `__tests__/*.test.ts`)
2. vitest + @testing-library (이미 설치). 상단:
   ```ts
   import { describe, it, expect } from 'vitest';
   ```
3. 각 export 함수/클래스 메소드에 대해:
   - happy path 1~2 개
   - edge case (빈 값, null, undefined, 경계) 1~2 개
4. **입출력 계약** 테스트. 구현 상세 아님
5. React 렌더 테스트는 최소화. 순수 로직 우선
6. Mock 은 반드시 필요한 외부 의존성만. UIProvider / Session 등은 없어도 되면 생략
7. 각 파일 5~15 tests, 합계 이 영역에서 80~150 tests 목표
8. 기존 구현 코드는 수정 금지. 버그 의심 시 테스트에 TODO 주석만

**제약**:
- 새 외부 의존성 추가 금지
- public export 만 테스트
- 스냅샷 지양. 실제 값 assertion 선호
- `npm test` + `npm run test:coverage` + `npm run lint` + `npm run type-check` 모두 PASS 유지

**반환 포맷**:
```
## Task C-[N] — 테스트 추가 완료 (영역: [X])

### Files created
- ...

### Tests per file
- Config: N tests
- ...

### Coverage before / after (이 영역)
- [X]: before% → after%
- 전체: 8.1% → K% (예상)

### Build status
- npm test: PASS / 375 → N tests
- npm run test:coverage: PASS
- npm run lint: PASS (0 errors)
- npm run type-check: PASS
```

끝. 다른 영역 건드리지 말 것.
```

### 메인 집계 후
- `npx vitest run --coverage` 전체 재측정
- `vitest.config.ts` 임계치 새 baseline 바로 아래로 상향 (예: 20 / 15 / 15 / 20)
- 블록별 commit (C-1 / C-2 / C-3 각각 또는 합친 1 개)

### 완료 기준
- 전체 coverage 20%+ (statements)
- `npm test` + lint + type-check 모두 PASS

---

## 3. Task D — `exactOptionalPropertyTypes: true` 승격

### 현재 상태
- 승격 시 430 errors (측정: 2026-04-19)
- 에러 타입 분포:
  - TS2412 (201): 옵셔널 프로퍼티에 `undefined` 명시 대입
  - TS2375 (122): 객체 리터럴에 `undefined` 포함
  - TS2379 (94): 함수 인자에 `undefined` 포함
  - TS2532/2769/2345/2322 (13): 기타 narrow 이슈

### 에러 분포 by 디렉토리
- `components/fields`: 190 (전체의 44%)
- `components/list`: 45
- `components/form`: 37
- `config/EntityForm.tsx`: 29
- `config/InlineSubCollectionField.tsx`: 18
- `config/form/`: 18
- `transfer/Type.ts`: 17
- `config/SubCollectionField.tsx`: 15
- `config/{TableSubCollectionField,CardSubCollectionField}.tsx`: 각 8

### Fix 전략 (에러 타입별)

- **TS2412** (`x?: T` 인데 `T | undefined` 할당): 원본 타입을 `x?: T | undefined` 로 수정하거나 호출처에서 `if (x !== undefined)` narrow
- **TS2375** (object literal `{ ...spread, x: undefined }` 문제):
  - `{ x: undefined }` 제거 (없어도 옵셔널 동작 동일)
  - 또는 interface 에 `x?: T | undefined` 추가
- **TS2379** (함수 인자 `undefined` 포함): 함수 signature 에 `arg?: T | undefined` 명시

### 목표 배분 (병렬 3 에이전트)

- **에이전트 D-1**: `config/*` + `transfer/*` (약 90 에러)
  - EntityForm.tsx 29, Inline/Sub/Table/CardSubCollectionField 49, transfer/Type 17, config/form 18
- **에이전트 D-2**: `components/fields/*` (약 190 에러)
  - FormField 25, SelectField 14, OptionalField 12, ManyToOneField 11, NumberField 10, ApplyFullAddressFields 8, ListableFormField 7, 그 외
- **에이전트 D-3**: `components/list/*` + `components/form/*` + 나머지 (약 85 에러)

### 공통 에이전트 프롬프트 (영역만 교체)

```
@rcm/listgrid 에서 `exactOptionalPropertyTypes: true` 승격 중. 담당 영역: [X].

**레포**: /Users/kunner/IdeaProjects/rcm-listgrid
**상태**: tsconfig.json 의 `exactOptionalPropertyTypes` 는 아직 false. 에러 측정만 먼저. 완료 후 메인이 true 승격 + build 검증.

**담당 파일 / 디렉토리** (존재하는 것만):
- [영역별 목록]

**예상 에러 수**: [N]

**Fix 가이드 (에러 타입별)**:

1. **TS2412 — 옵셔널 타입 불일치**
   - `interface Foo { x?: string }` 이 `{ x: string | undefined }` 를 받을 때 발생
   - 옵션 A (권장): `interface Foo { x?: string | undefined }` 로 정의 수정
   - 옵션 B: 할당 측에서 `if (val !== undefined) target.x = val` narrow
   - public 인터페이스면 A, internal 이면 B 선호

2. **TS2375 — 객체 리터럴 `undefined` 포함**
   - `{ foo: bar, x: undefined }` 패턴
   - 옵션 A (권장): `const o: Foo = { foo: bar }` — undefined 프로퍼티 제거
   - 옵션 B: `{ x: undefined } as Foo` 캐스트 (최후의 수단)

3. **TS2379 — 함수 인자 `undefined` 포함**
   - 함수 호출 시 옵션 인자에 undefined 를 명시 전달
   - 옵션 A: 호출에서 undefined 전달 제거 (생략)
   - 옵션 B: 함수 signature 에 `arg?: T | undefined`

**작업 규칙**:
1. `cd /Users/kunner/IdeaProjects/rcm-listgrid && npx tsc --noEmit --exactOptionalPropertyTypes 2>&1 | grep "error TS" | grep <영역>` 으로 에러 확인
2. 각 에러의 실제 맥락 읽고 A/B/C 옵션 선택
3. **담당 영역 밖 파일은 절대 수정 금지**. scope 밖 에러는 다른 에이전트가 처리
4. public API 시그니처 변경 시 소비자 (gjcu) 영향 주석으로 기록
5. 완료 후 (해당 영역 에러만 0 이면 OK) — 전체는 3 에이전트 합산 후 0

**검증 (영역별)**:
- 담당 파일의 수정 후 `npx tsc --noEmit --exactOptionalPropertyTypes 2>&1 | grep <영역> | wc -l` → 0
- `npm test` 375 pass 유지
- `npm run lint` 0 errors 유지

**반환 포맷**:
```
## Task D-[N] — exactOptionalPropertyTypes 영역 [X]

### Files modified
- ...

### Error count before / after (per file)
- config/EntityForm.tsx: 29 → 0
- ...
- 합계: N → 0 (이 영역)

### Patterns applied
- TS2412 — interface 에 `| undefined` 추가: M 곳
- TS2412 — 할당측 narrow: K 곳
- TS2375 — 객체 리터럴에서 undefined 제거: L 곳
- TS2379 — 호출에서 undefined 제거: P 곳
- public API 시그니처 변경: Q 곳 (소비자 영향 노트 포함)

### Build status
- npx tsc --noEmit --exactOptionalPropertyTypes (이 영역만): PASS
- npm test: PASS / 375 tests
- npm run lint: PASS (0 errors)
```

끝. 다른 영역 건드리지 말 것.
```

### 메인 집계 + 승격
- 3 에이전트 완료 후 `npx tsc --noEmit --exactOptionalPropertyTypes` 전체 재확인 (0 errors)
- `tsconfig.json`: `exactOptionalPropertyTypes: true` 추가
- `npm run type-check` + `npm test` + `npm run lint` + `npm run format:check` 전체 PASS 확인
- 블록별 commit (D-1 / D-2 / D-3 각 + 최종 tsconfig commit 1 개)

### 완료 기준
- `exactOptionalPropertyTypes: true` 활성 상태에서 전체 type-check PASS
- 모든 품질 게이트 PASS
- public API 변경 사항 DECISIONS.md 에 기록

### 배포 판단
- API 시그니처 변경이 생기면 → alpha.46 배포 + gjcu 호스트 검증 필수
- 순수 internal narrow 만이면 → 배포 불필요

---

## 4. Task E — `EntityForm<T>` / `FieldValue<T>` generic refactor

### Why
- 현재 `EntityForm.tsx`, `FormField.tsx` 등에 `any` 가 의도적으로 남아있음 (DECISIONS #21, #65) — 임의 entity 스키마 지원을 위해
- `EntityForm<T>` 로 제네릭화하면 의도된 any 를 concrete type 으로 승격 가능
- 소비자 (gjcu) 는 `EntityForm<User>`, `EntityForm<Order>` 처럼 타입 안전하게 사용 가능

### Why caution
- **Breaking change**. 기존 `new EntityForm(...)` 는 `EntityForm<any>` 로 암묵 유지할 수 있지만 public API 시그니처가 근본적으로 변경됨
- v0.2 → v0.3 major bump 검토 필요
- 소비자 마이그레이션 가이드 필수

### 권장 진행 (세션 1~2 에 걸쳐)

**세션 E-1: 설계 + prototype**
1. 메인이 `EntityForm.tsx` 와 `FormField.tsx` public API 섹션 만 읽고 generic 후보 지점 식별
2. 설계 문서 작성: `docs/GENERIC_DESIGN.md`
   - 어떤 type parameter 를 어디에 넣을지 (`EntityForm<T extends object = any>`)
   - 기본 타입을 `any` 로 두어 backward-compat 보장할지
   - `FieldValue<T>` 또는 `FormField<TField, TForm>` 구조 결정
3. gjcu 에서 사용 패턴 sample 수집 (메인이 `~/dev/gjcu-experiment/gjcu-academic-front/apps/admin` 에서 grep)
4. 설계 문서 리뷰 + 세션 종료

**세션 E-2: 구현**
1. 에이전트 1 개 (메인 context 보호). 아래 프롬프트 참고:

```
@rcm/listgrid 의 EntityForm / FormField 를 generic 으로 리팩터링.

**설계 문서**: /Users/kunner/IdeaProjects/rcm-listgrid/docs/GENERIC_DESIGN.md (먼저 읽기)

**작업 범위**:
1. `src/listgrid/config/EntityForm.tsx` — `class EntityForm<T extends object = any> extends EntityFormExtensions`
2. `src/listgrid/components/fields/abstract/FormField.tsx` — `FormField<TValue = any, TForm = any>`
3. 주요 config 클래스 (EntityField, OnChangeEntityForm, EntityFormTypes) 에 generic 파라미터 전파
4. public API 변경사항 README.md 및 DECISIONS.md 에 기록

**규칙**:
- 기본 타입을 `any` 로 두어 backward-compat 유지 (기존 `new EntityForm(...)` 컴파일)
- 의도된 any (DECISIONS #21/#65) 중 generic 으로 치환 가능한 것만 concrete 하게 승격
- `any` 수치가 의미있게 줄어야 함 (306 → 200 미만 목표)
- 소비자 마이그레이션 가이드 README 섹션 추가

**검증**:
- npm run type-check + test + lint + format:check 모두 PASS
- gjcu 호스트 설치 + HTTP 303 확인 (메인이 수행)

**반환 포맷**: 설계 문서에 정의된 대로
```

2. 메인: alpha.46 또는 v0.2.0 배포. gjcu 재설치. API breakage 있으면 가이드 업데이트.

### 완료 기준
- `EntityForm<T>`, `FormField<TValue, TForm>` 공식화
- 의도된 any 300+ 중 최소 100 감소 (concrete generic 으로 승격)
- README.md 에 소비자 마이그레이션 섹션
- gjcu HTTP 303 유지
- DECISIONS 새 엔트리 (#68 예상)

### 위험
- `FormField` 의 generic 확장이 UIProvider `ComponentType<any>` wrapper 와 충돌 가능 (DECISIONS #21)
- `any` 잔재 중 UIProvider wrapper 는 유지 필요 — generic 으로 해결 안 됨
- 세션 중 막히면 설계만 저장하고 구현은 다음 세션으로 분할

---

## 5. 권장 순서 + 배포 플랜

| 순서 | Task | 세션 수 | 배포 | 주 효과 |
|---|---|---|---|---|
| 1 | **C** Coverage 20%+ | 1 | 없음 (dev-only) | 회귀 안전망 |
| 2 | **D** exactOpt | 1 | 조건부 (API 변경 있으면 alpha.46) | 타입 엄격성 |
| 3 | **E** Generic | 2 | alpha.46 또는 v0.2.0 | API 엄격성 + any 감축 |

**왜 C 먼저**: 테스트 커버리지가 높을수록 D/E 의 리팩터링 안전. utils/common 은 이미 높으므로 config/form 을 올려놓으면 D/E 에서 회귀 감지력이 올라감.

**C 건너뛰고 D/E 진행도 가능**: CI 임계치 (statements 8%) 가 회귀를 차단하므로 긴급하면 D 우선.

---

## 6. 세션 진입 프롬프트 (Task 별)

### Task C 세션 시작:
```
@rcm/listgrid v0.3 Task C — coverage 8.1% → 20%+.

docs/NEXT_SESSION.md § 2 (Task C) 그대로 실행:
1. 에이전트 3 개 병렬 dispatch (C-1 config / C-2 form+misc+store+message+menu+router+urlState / C-3 components/fields/abstract)
2. 집계 + test + lint + type-check + coverage
3. vitest.config.ts 임계치 새 baseline 바로 아래로 상향 (20 / 15 / 15 / 20 예상)
4. commit (블록별 또는 합친 1 개)
5. STATUS.md + DECISIONS.md 업데이트

배포 없음 (dev-only). 메인 컨텍스트 보호 + 블록별 commit.
```

### Task D 세션 시작:
```
@rcm/listgrid v0.3 Task D — exactOptionalPropertyTypes 승격 (430 errors).

docs/NEXT_SESSION.md § 3 (Task D) 그대로 실행:
1. 에이전트 3 개 병렬 dispatch (D-1 config+transfer / D-2 components/fields / D-3 components/list+form)
2. 각 영역의 에러 0 달성 후 메인이 tsconfig.json 에 exactOptionalPropertyTypes: true 추가
3. 전체 type-check + test + lint + format PASS 확인
4. public API 변경 시 gjcu 호스트 재설치 + HTTP 303. 없으면 배포 skip
5. commit 블록별 (D-1/D-2/D-3 + tsconfig)
6. STATUS.md + DECISIONS.md #68 예상

메인 컨텍스트 보호 + 영역 분리 엄수 (다른 영역 건드리지 말 것).
```

### Task E 세션 시작 (2 세션 권장):
```
@rcm/listgrid v0.3 Task E 세션 1 — EntityForm<T> 설계.

docs/NEXT_SESSION.md § 4 (Task E) 그대로 실행:
1. 메인이 config/EntityForm.tsx public API 섹션만 읽기 (큰 파일이므로 구현부 skip)
2. gjcu 샘플 사용 패턴 grep
3. docs/GENERIC_DESIGN.md 작성 — type param 위치 / 기본값 / 소비자 영향
4. 세션 종료. 구현은 다음 세션

breaking change 이므로 설계 리뷰 필수. 배포는 구현 후.
```

---

## 7. 위험 요소

1. **Task D 에서 public API 시그니처 바뀌면 gjcu 재빌드 깨질 수 있음** — 각 interface 변경마다 gjcu grep 으로 소비자 영향 확인
2. **Task C 의 React 컴포넌트 렌더 테스트가 깨지기 쉬움** (UIProvider 주입, Session 의존성) — 순수 로직 우선, 렌더 테스트는 최소화
3. **Task E 의 generic refactor 가 `ComponentType<any>` (UIProvider) 와 충돌** — 해당 부분은 의도된 any 유지
4. **에이전트 3 개 병렬이 같은 파일을 건드리면 충돌** — 영역 분리 프롬프트에 엄격 명시
5. **coverage 상승이 불충분하면 임계치 상향 후 CI fail** — 임계치는 항상 baseline 바로 아래

---

## 8. 롤백

각 Task 는 블록별 commit:
```bash
# Task C 롤백
git reset --hard <commit_of_alpha.45_후속_정비>

# Task D 롤백 (tsconfig 되돌리기)
git revert <commit_of_tsconfig_exactOpt>

# Task E 롤백 (major bump 되돌리기) — 필요 시 git reset + gjcu package.json 되돌림
```

---

## 9. 메모

- 이 문서는 alpha.45 + 후속 정비 완료 직후 (2026-04-19) 작성
- v0.3 완료 조건은 **3 Task 모두 소진** + 전체 alpha 배포 (E 완료 시 v0.2.0 또는 alpha.46 중 선택)
- 막히면 `STATUS.md` + `DECISIONS.md` #65~#67 참조
- v0.2 major bump 시 `package.json` version + `README.md` migration 섹션 업데이트 필수
