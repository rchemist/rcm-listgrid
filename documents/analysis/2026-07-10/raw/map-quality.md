> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# 서브시스템 지도: 테스트·타입·품질 인프라

대상: `@rchemist/listgrid` v0.3.25 — vitest 설정, tsconfig, eslint, CI, 48개 테스트 파일, 타입 안전성 우회 밀도, 에러 처리 패턴, a11y 신호.
조사 방법: 정적 grep 분석 + **실제 `npx vitest run` 실행**(READ-ONLY, 파일 미수정) + `git`/파일 열람.

---

## 0. 실행 요약 (TL;DR)

- **테스트는 "논리 계층"에만 있고 "렌더 계층"에는 사실상 없다.** 48개 테스트 파일 중 React 컴포넌트를 실제로 렌더링하는 파일은 9개뿐이고, 42개의 구체 필드 컴포넌트(`StringField`, `NumberField`, `ManyToOneField` 등) 중 렌더 테스트가 있는 것은 **0개**다. `ViewEntityForm.tsx`, `ViewListGrid.tsx`, `RowItem.tsx`, `FieldRenderer.tsx` 등 핵심 렌더 경로도 전부 테스트가 없다.
- **테스트 스위트가 현재 이 저장소 checkout에서 그대로 실패한다.** `npx vitest run` 결과 **27개 테스트가 실패**(`902 passed, 27 failed, 1 todo` / 총 930). 원인은 `window.localStorage`가 jsdom 29.0.2 + Node 26 조합에서 `undefined`가 되는 환경 문제로 보이며, `package.json`에 `engines` 필드도 `.nvmrc`도 없어 이를 막을 안전장치가 전혀 없다.
- 타입 안전성: `tsconfig.json`은 `strict`/`noUncheckedIndexedAccess`/`exactOptionalPropertyTypes`까지 켠 **매우 엄격한 설정**이지만, `eslint.config.mjs`가 `@typescript-eslint/no-explicit-any: 'off'`로 명시적으로 꺼놨고, 실제로 `: any` 타입 주석이 338곳, `any` 토큰 전체 628곳 검출된다. "엄격한 tsconfig + any 무제한 허용 lint"는 정합성이 어긋난 조합이다.
- 에러 처리: `EntityForm.tsx`의 `onInitialize`/`onFetchData` 훅 콜백 실패가 다수 지점에서 `catch (e) { console.error(e); /* nothing to do */ }` 패턴으로 조용히 삼켜진다(예: `EntityForm.tsx:261`, `:708`). 폼 초기화 훅이 실패해도 사용자에게는 아무 신호가 없다.
- a11y: `aria-*` 속성 사용은 183개 tsx 파일 중 22개(12%)에만 존재, 전체 사용 횟수 35회. `role=` 속성은 4회뿐. CRUD 그리드/폼 라이브러리치고 접근성 계측이 매우 얇다.
- 테스트 품질 자체(있는 곳에 한해)는 나쁘지 않다: snapshot 테스트 0개, `it.skip`/`describe.skip` 0개(`it.todo` 1개만), 파일당 평균 `expect()` 31회로 실제 어서션 기반.

---

## 1. 빌드/품질 파이프라인 구성

### 1.1 `vitest.config.ts`
```ts
coverage: {
  include: ['src/listgrid/**/*.{ts,tsx}'],
  thresholds: { statements: 16, branches: 14, functions: 17, lines: 16 },
}
```
- 커버리지 하한선이 **16~17%**로 설정돼 있고, 주석에 스스로 "Baseline(v0.3 Task C) 525 tests 추가: 16.9%/14.98%/17.97%/16.81%, floor는 baseline보다 살짝 낮게" 라고 적어놨다(`vitest.config.ts:17-19`). 즉 이 프로젝트는 커버리지 임계값을 "달성 목표"가 아니라 "현재 얼마 안 되는 커버리지가 더 떨어지지만 않으면 통과"로 설계했다. 이 자체가 나쁜 건 아니지만(회귀 방지 장치는 있음), **커버리지를 늘리도록 강제하는 장치가 CI에 없다** — floor를 유지만 하면 영원히 17% 근처에 머물 수 있는 구조.

### 1.2 `tsconfig.json` — 엄격도는 상급
```json
"strict": true, "noImplicitAny": true, "noImplicitReturns": true,
"noFallthroughCasesInSwitch": true, "noUncheckedIndexedAccess": true,
"exactOptionalPropertyTypes": true
```
(`tsconfig.json:2-14`) `noUncheckedIndexedAccess`와 `exactOptionalPropertyTypes`까지 켠 설정은 라이브러리 코드에서 보기 드물게 엄격한 편이다. 다만 이 엄격함은 **명시적 `any`에는 아무 힘을 못 쓴다** — TS는 `noImplicitAny`만으로는 사용자가 직접 쓴 `: any`를 막지 못하고, eslint의 `no-explicit-any` 규칙이 그 역할을 해야 하는데 아래처럼 꺼져 있다.

### 1.3 `eslint.config.mjs` — any 게이트가 완전히 열려 있음
```js
'@typescript-eslint/no-explicit-any': 'off',
```
(`eslint.config.mjs:44`) 주석 설명도 없이 꺼져 있다. 결과: `: any` 타입 주석 338곳, `any` 토큰(단어경계 기준) 628곳이 `src/listgrid/**`에 존재(테스트 파일 제외, grep 집계). `tsconfig`가 표방하는 "엄격한 타입 안전성"과 실제 코드베이스의 타입 안전성 사이에 큰 괴리가 있다는 뜻이다. tsconfig strict 설정은 사실상 "새 명시적 버그"만 막고, 기존/신규 `any` 남발은 아무도 제지하지 않는다.

같은 파일에 `no-empty: ['warn', { allowEmptyCatch: true }]`(`eslint.config.mjs:60`)도 있어 **빈 catch 블록이 lint 통과 대상으로 명시적으로 허용**된다. (실제 빈 catch 블록 자체는 grep으로 찾지 못했지만, 정책적으로 열어둔 것 자체가 신호.)

### 1.4 CI (`​.github/workflows/ci.yml`)
- `npm ci --legacy-peer-deps` → `type-check` → `lint` → `format:check` → `test:coverage` → `build` → 산출물 존재 확인, 순서가 합리적이다. `--legacy-peer-deps`가 필요하다는 것 자체가 의존성 트리에 peer dep 충돌이 있다는 신호(React 19 계열과 `react-select`/`sortablejs` 계열 조합 추정).
- **Node 버전은 20으로 고정**(`ci.yml:14`)되어 있으나, `package.json`에는 `engines` 필드가 없고 `.nvmrc`도 없다 — 로컬 개발자가 CI와 다른 Node로 작업하면(§2에서 실증하듯) 테스트가 조용히 깨질 수 있는데 이를 막을 장치가 리포에 없다.
- `publish.yml`은 태그 push 시 `prepublishOnly`(clean+type-check+test+build)를 신뢰해서 바로 `npm publish`. 별도 승인/수동 게이트 없이 태그만 찍으면 배포되는 구조 — 상용 라이브러리치고 배포 게이트가 얇다(리뷰 없는 태그 push = 즉시 공개 배포).

---

## 2. 실증: 테스트 스위트가 현재 checkout에서 실패한다

`npx vitest run`(읽기전용 실행, 파일 미수정)을 리포 루트에서 그대로 실행한 결과:

```
Test Files  3 failed | 45 passed (48)
     Tests  27 failed | 902 passed | 1 todo (930)
```

실패 3개 파일 전부 `window.localStorage` 접근에서 동일하게 죽는다:
```
TypeError: Cannot read properties of undefined (reading 'clear')
 ❯ src/listgrid/misc/index.test.ts:332:25
    331|   beforeEach(() => {
    332|     window.localStorage.clear();
```
- `src/listgrid/misc/index.test.ts` — 6 실패
- `src/listgrid/config/AdvancedSearchOpenCache.test.ts` — 10 실패
- `src/listgrid/config/ListGridViewFieldCache.test.ts` — 11 실패

해당 파일을 단독 실행해도(`npx vitest run src/listgrid/misc/index.test.ts`) 동일하게 재현되어 테스트 간 오염 문제가 아니라 **jsdom 환경 자체에서 `localStorage`가 없는** 문제다.

**원인 추정과 한계**: 이 세션의 실행 환경은 Node **v26.4.0**이고, `package-lock.json`에 정확히 고정된 `jsdom@29.0.2`(`package-lock.json` node_modules/jsdom)가 설치돼 있다. CI(`ci.yml:14`)는 Node **20**을 쓴다 — 즉 이 실패가 "Node 26 + jsdom 29" 조합에서만 나타나는 환경 이슈이고 CI(Node 20)에서는 통과할 가능성이 있다. **이를 CI 상에서 직접 재현/반증하지는 못했다**(GH Actions 미실행) — 검증 못함, 로컬 재현 결과만 확실한 사실이다.

다만 이 사실 자체가 하나의 **구조적 결함을 실증한다**: `package.json`에 `engines` 필드도 `.nvmrc`도 없어서, "919 tests 전부 통과"라는 유지보수자의 인식이 **Node 버전에 암묵적으로 의존**하고 있고 그 의존성이 문서화·강제되지 않는다. 최신 LTS(또는 이후 버전)로 로컬 개발/배포하는 사람은 아무 코드 변경 없이 27개 테스트가 깨지는 걸 마주치게 된다. 커밋 로그(`919+ tests`라는 유지보수자 진술)와 실측치(902 passed + 27 failed = 929, +1 todo = 930)도 정확히 일치하지 않는다 — 카운트가 최신화되지 않았거나 실행 환경에 따라 달라진다는 뜻.

---

## 3. 테스트 커버리지의 실체 — "919 tests, 17%"의 지형

### 3.1 렌더 테스트 vs 로직 테스트
48개 테스트 파일 중 `@testing-library/react`를 임포트해 실제로 컴포넌트를 렌더링하는 파일은 **9개뿐**:
```
src/listgrid/ui/headless.test.tsx
src/listgrid/urlState/UrlStateProvider.test.tsx
src/listgrid/components/list/ui/EntireChecker.test.tsx
src/listgrid/components/list/ui/__tests__/InlineSubCollectionView.test.tsx
src/listgrid/components/list/ui/__tests__/CardSubCollectionView.test.tsx
src/listgrid/components/list/context/EntityFormScopeContext.test.tsx
src/listgrid/components/list/hooks/useSubCollectionExpansion.test.ts
src/listgrid/components/list/hooks/__tests__/useCardSubCollectionData.test.ts
src/listgrid/router/RouterProvider.test.tsx
```
나머지 39개 파일은 클래스 메서드·순수 함수·config 객체를 단위 테스트하는 것으로, "919 tests"의 대부분은 **UI 렌더링을 한 번도 실행하지 않는다.**

### 3.2 42개 구체 필드 컴포넌트 — 렌더 테스트 0개
`src/listgrid/components/fields/*.tsx`에 42개 필드 컴포넌트(`StringField.tsx`, `NumberField.tsx`, `DateField.tsx`, `SelectField.tsx`, `ManyToOneField.tsx`, `ImageField.tsx`, `FileField.tsx`, `RuleField.tsx` 등)가 있다. 테스트가 존재하는 것은:
```
components/fields/__tests__/InlineMapField.test.ts
components/fields/abstract/__tests__/{AbstractManyToOneField,AbstractDateField,FormField,CheckButtonValidationField,OptionalField,ListableFormField}.test.ts
```
전부 **`abstract/` 하위(베이스 클래스 로직)** 이거나, `InlineMapField.test.ts`조차 실제로는 컴포넌트가 아니라 순수 헬퍼 함수 `isInlineMapValueBlank`만 테스트한다(`components/fields/__tests__/InlineMapField.test.ts:1-27`, `import { InlineMapField, isInlineMapValueBlank } ...` 해놓고 실제 `describe`는 전부 `isInlineMapValueBlank`).

즉 **42개 필드 컴포넌트 중 렌더/상호작용 테스트가 있는 것은 0개**다. `AbstractDateField`/`AbstractManyToOneField` 등 베이스 클래스의 "값 파싱/직렬화" 로직은 테스트되지만, 그 로직을 소비하는 실제 React 컴포넌트(포커스, 클릭, onChange 발생 시 실제 DOM에 반영되는지)는 어디에서도 검증되지 않는다.

### 3.3 핵심 렌더 경로 — 전부 테스트 없음
아래 파일들은 그 자체로 이 라이브러리의 "제품"인데 대응 테스트 파일이 하나도 없다:
- `src/listgrid/components/form/ViewEntityForm.tsx` (맨테이너가 지적한 recursion 진앙지)
- `src/listgrid/components/form/FieldRenderer.tsx`, `SubCollectionRenderer.tsx`
- `src/listgrid/components/form/ui/*.tsx` (13개 파일: `ViewEntityFormButtons`, `ViewEntityFormFields`, `ViewEntityFormErrors`, `CreateStepView` 등)
- `src/listgrid/components/list/ViewListGrid.tsx`, `RowItem.tsx`, `AdvancedSearchForm.tsx`, `AdvancedSearchFormV2.tsx`, `QuickSearchBar.tsx`, `ListGridHeader.tsx`, `ViewFieldSelector.tsx`

`EntityForm.tsx`(1074줄, config 클래스 본체)는 예외적으로 `EntityForm.initialize.test.ts`, `EntityFormMethod.test.ts`가 있으나, 이는 "Issue #9: 단건 fetch 2-depth 언랩 버그 회귀 방지" 같은 **좁은 회귀 테스트**이지 클래스 전체(1074줄, `submit`/`validate`/`fetchData`/훅 파이프라인 등)를 포괄하는 커버리지가 아니다(`config/EntityForm.initialize.test.ts:1-13` 주석 참고).

### 3.4 테스트 품질 자체는 양호
- snapshot 테스트: **0건** (`toMatchSnapshot` grep 결과 없음) — 스냅샷으로 커버리지를 부풀리는 흔한 안티패턴이 없다는 점은 긍정적.
- `it.skip`/`describe.skip`: **0건**. `it.todo`는 1건뿐(`AbstractDateField.test.ts:97`, "clone should preserve limit and range (behavioural fix pending)" — 알려진 미해결 버그를 정직하게 todo로 남겨둔 것으로 은폐가 아님).
- 어서션 밀도: 48개 파일에 `expect()` 총 1491회, 파일당 평균 31회 — 있는 테스트는 실제로 여러 케이스를 검증하며 얕지 않다.

**결론**: 17% 커버리지의 정체는 "얕은 테스트가 넓게 퍼져 있는" 문제가 아니라, **"로직 계층(class/util)은 꽤 꼼꼼히 다뤄지고, 렌더 계층(실제 화면에 그려지는 42개 필드 + 핵심 폼/그리드 컴포넌트)은 통째로 비어 있는" 이분법적 구조**다. 상용화 관점에서는 사용자가 실제로 만나는 표면(필드 렌더링, 폼 제출 UX, 그리드 상호작용)이 정확히 테스트되지 않은 영역과 겹친다는 게 문제.

---

## 4. 타입 안전성 우회 지표

| 지표 | 개수 | 근거 |
|---|---|---|
| `as any` (테스트 제외) | 13 | grep |
| `: any` 타입 주석 (테스트 제외) | 338 | grep |
| `any` 토큰 전체 | 628 | grep |
| `@ts-ignore`/`@ts-expect-error` | 0 | grep — 없음. 우회 대신 `any`로 뚫는 문화 |
| `eslint-disable` 주석 | 17 | grep |
| `no-explicit-any` lint 규칙 | **off** | `eslint.config.mjs:44` |

`@ts-ignore`/`@ts-expect-error`가 0건인 것은 얼핏 좋아 보이지만 실제로는 "타입 에러를 줄 세워 억제하는 대신, 애초에 `any`로 타입 체크 자체를 우회"하는 패턴이 지배적이라는 뜻이다(억제 주석보다 `any` 638건이 훨씬 흔함). `noUncheckedIndexedAccess`/`exactOptionalPropertyTypes`까지 켠 strict tsconfig의 실효성이 `any` 628곳만큼 깎여나간다.

---

## 5. 에러 처리 패턴 — 조용히 삼키는 catch

`src/listgrid/config/EntityForm.tsx`에서 훅 콜백 실패를 다루는 대표 패턴:
```ts
// EntityForm.tsx:255-262 (onInitialize 콜백 루프)
for (const init of [...entityForm.onInitialize]) {
  try {
    entityForm = await init(entityForm, props.session);
  } catch (e) {
    // nothing to do
    console.error(e);
  }
}
```
```ts
// EntityForm.tsx:700-712 (onFetchData 콜백 루프, 위와 동일 패턴 반복)
for (const postFetch of [...this.onFetchData]) {
  try {
    entityForm = await postFetch(this as unknown as EntityForm<T>, entity);
  } catch (e) {
    // nothing to do
    console.error(e);
  }
}
```
같은 파일 안에서 이 "`// nothing to do` + `console.error`" 패턴이 최소 3곳 반복된다(`:261`, `:708`, `:757` 부근). 호스트 앱이 등록한 `onInitialize`/`onFetchData` 커스텀 훅이 던지는 예외는 콘솔에만 남고 **호출자(폼을 렌더링하는 화면)에는 어떤 신호도 전달되지 않는다** — 폼이 부분적으로만 초기화된 채 조용히 렌더링될 수 있다는 뜻이고, 이는 "왜 이 필드에 값이 안 들어왔지"류의 재현이 어려운 버그를 양산하는 전형적 구조다.

반대로 `misc/index.ts`의 캐시/포맷터 계열 함수들의 빈 `catch {}`(`:53,62,70,96,160,403`)는 대부분 "포맷 실패 시 빈 문자열/undefined로 graceful fallback"이라는 의도가 주석으로 명시돼 있어(`:150-152` 참고) 상대적으로 정당화된 사용이다. 문제는 **의도된 fallback(misc)과 의도치 않은 침묵(EntityForm 훅 파이프라인)이 코드 스타일상 구분되지 않는다**는 점 — 둘 다 똑같이 `catch (e) { console.error(e); }`로 보인다.

---

## 6. 접근성(a11y) 신호

- `aria-*` 속성: 183개 tsx 파일 중 **22개(12%)**에서만 사용, 총 **35회**.
- `role=` 속성: **4회**.
- CRUD 그리드/폼을 다루는 라이브러리로서 키보드 네비게이션, 스크린리더 라벨링, 라이브 리전(에러 메시지 알림 등) 계측이 구조적으로 얇다. (참고: 최근 커밋 `a43104e fix(a11y): readonly textarea uses body text color (WCAG AA contrast)`가 있어 색상 대비 이슈는 개별적으로 픽스된 적은 있으나, 이는 시각 대비 문제이지 aria 시맨틱 문제가 아니다.)

---

## 7. 성능 관련 — 실측 가능한 구조적 이슈만

지시에 따라 "memo 누락"류는 스멀로 잡지 않고, 구조적으로 O(n²)가 될 수 있는 지점만 확인했다:
- `components/list/ui/TableSubCollectionView.tsx:220-221`:
  ```ts
  return data.filter((item) =>
    quickSearchFields.some((field) => searchValue(getFieldValue(item, field.getName()), query)),
  );
  ```
  행 배열(`data`) × 검색필드(`quickSearchFields`) 이중 순회이지만 `quickSearchFields`는 설정값(보통 수개)이라 실질적으로 O(n)에 가깝다 — **구조적 O(n²) 문제로 보긴 어렵다** (측정도 안 했으므로 스멀로 등재하지 않음).
- `RowItem.tsx:52,129` — `list.map`, `items.filter` 각각 단일 순회, 문제 없음.
전반적으로 grep 범위 내에서 "측정된/구조적" O(n²) 렌더 이슈는 발견하지 못했다 — 이 항목은 스멀 리스트에 넣지 않는다(허위 긍정 방지).

---

## 8. 강점으로 짚을 것

- tsconfig가 `noUncheckedIndexedAccess`/`exactOptionalPropertyTypes`까지 켠 것은 실제로 드물게 엄격한 설정이며, `any` 남용 문제만 없으면 타입 안전성 기반은 탄탄하다.
- CI 파이프라인 순서(type-check → lint → format → test+coverage → build → 산출물 검증)는 정석적이고 빠짐이 없다.
- 있는 테스트의 품질은 실제로 좋다 — snapshot 남용 없음, skip 없음, 회귀 재현 테스트(`EntityForm.initialize.test.ts`)는 실제 프로덕션 버그(#9)를 정확히 문서화하며 근거를 남긴 모범 사례.
- 커버리지 threshold를 "현재값보다 떨어지면 fail"로 설계한 것은 미흡하지만 최소한의 회귀 방지 장치는 갖춘 것으로, 완전히 무방비인 것보다는 낫다.

---

## 9. 근거 파일 목록

- `vitest.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.github/workflows/ci.yml`, `.github/workflows/publish.yml`
- `src/listgrid/config/EntityForm.tsx` (255-262, 700-715, 757, 966 등)
- `src/listgrid/misc/index.ts` (53-160, 288-300, 358-368, 398-408)
- `src/listgrid/config/EntityForm.initialize.test.ts`, `src/listgrid/config/EntityFormMethod.test.ts`
- `src/listgrid/components/fields/__tests__/InlineMapField.test.ts`
- `src/listgrid/components/fields/abstract/__tests__/*.test.ts`
- `src/listgrid/components/list/ui/TableSubCollectionView.tsx`
- 실행 로그: `npx vitest run` (본 세션에서 직접 실행, 902 passed / 27 failed / 1 todo)
