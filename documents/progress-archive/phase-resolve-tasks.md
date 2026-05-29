# Phase resolve — Task Detail Log

**Parent PROGRESS**: [../PROGRESS.md](../PROGRESS.md)

## #1 SearchForm.sorts wire 직렬화 정합 ✅ 2026-05-29

**commit**: (see git log — bundled with this archive)
**GitHub Issue**: #1

**Changed files**:
- `src/listgrid/form/SearchForm.ts`
  - `toJSON()` 신규 (~L900) — `JSON.stringify(searchForm)` 진입점. sorts Map → `[{field,direction}]` 객체 배열(backend `SortInfo`), filters Map → `{AND:[...],OR:[...]}` 객체. cacheKey/page/pageSize/ignoreCache/viewDetail/shouldReturnEmpty/preservedFilters/quickSearchFields 동시 방출(기존 enumerable 직렬화 무회귀).
  - `filterItemToWire()` private static 신규 — FilterItem.subFilters Map 재귀 변환.
  - `createByObject()` sorts 복원부 (~L251) — backend `[{field,direction}]` 객체 배열 인식 추가 + 구 튜플/객체 형태 하위호환 유지 + **역순 적용으로 다중정렬 순서(앞=primary) 보존**.
- `src/listgrid/form/SearchForm.test.ts` — +7 테스트(object-array 복원, 다중정렬 순서, toJSON sorts 배열, 빈 sorts=[], filters 객체, subFilters 재귀, stringify→deserialize round-trip).

**What was done**:
- **근본**: `SearchForm.sorts`/`filters`가 Map → host `JSON.stringify` 시 `{}` → backend `Cannot deserialize ArrayList from Object` 400. backend(`core/rcm-core-search/SearchRequest.java`) 거울로 `sorts:List<SortInfo>`(객체배열), `filters:LinkedHashMap<LogicalOperator,List<FilterItem>>`(AND/OR객체) 정합.
- **2차 발견**: deserialize 가 backend 실제 echo 형태(`[{field,direction,type,joinType,nullsFirst}]` 객체배열)를 인식 못해 서버 정렬 echo silent drop. + `withSort` prepend 특성상 forward 적용 시 다중정렬 primary 가 뒤집히는 잠재 버그 → 역순 적용으로 해결.
- type 생략=NORMAL / joinType 생략=INNER / nullsFirst 생략=null (backend default) 이므로 wire 에서 미방출.

**Verification**:
- `npx vitest run src/listgrid/form/SearchForm.test.ts` → 76 passed (69→76, +7).
- `npm run type-check` → 통과 (noUncheckedIndexedAccess 대응: `parsed[i]!` 구조분해).
- `npx vitest run` (전체) → 45 files / 912 passed · 1 todo, 회귀 0.
- `eslint` 변경파일 → 0 error (기존 prefer-const/unused 경고 7개는 변경 영역 밖).

**Invariant / Decision**:
- 내부 `sorts: Map<string,Direction>` 는 field+direction 만 보존 → backend `PrioritySortInfo`/joinType/nullsFirst 는 round-trip 불가(scope 외, listgrid 는 NORMAL 정렬만 생성). 향후 priority 정렬 필요 시 내부 표현 확장 별건.
- toJSON 이 cacheKey/preservedFilters(backend 미지정 필드)도 방출 — 기존 동작이 이미 방출 중이라 무회귀 유지 + sessionStorage(`useListGridLogic.ts:356 stringify`) 복원 정합. backend 는 unknown 필드 tolerate(현행 검증).
- toJSON 추가로 host wire 경로 + sessionStorage 경로 둘 다 배열 형태로 통일됨(과거 mapReplacer 는 sorts 를 객체로 방출했으나 deserialize 가 흡수).

---

## #6 ApiClient envelope 명시 + 방어적 wrap ✅ 2026-05-29

**GitHub Issue**: #6

**Changed files**:
- `src/listgrid/api/ApiClient.ts` — `ApiClient` 3개 메서드(callExternalHttpRequest/getExternalApiData/getExternalApiDataWithError)에 envelope 계약 JSDoc 추가. host 가 `ResponseData<T>.data` 로 payload 를 감싸야 함을 명시 + 올바른 어댑터 예제(`new ResponseData({ data, status })`).
- `README.md` — Quick start `configureApiClient` 예제를 raw `r.json()` → `new ResponseData({ data, status })` wrap 으로 교정 + import 에 `ResponseData` 추가 + ⚠️ envelope 주석.
- `src/listgrid/form/Type.ts` — `fetchListData` 성공 경로에 `const payload = response.data ?? response` 방어적 fallback 도입, 이후 `payload.{searchForm,searchRequest,list,content,totalCount,totalElements,totalPage,totalPages}` 로 deref.
- `src/listgrid/form/Type.test.ts` — +1 테스트(payload top-level fallback).

**What was done**:
- 핵심 gap: README quick-start 가 `fetch().then(r => r.json())` raw 반환을 예시 → 정확히 이슈가 경고한 silent 빈화면 유발 패턴. JSDoc/README/방어코드 3중 보강.
- 방어적 fallback 은 ResponseData 인스턴스인데 payload 를 top-level 에 둔 실수만 보정(정상 wrap 시 동일 동작). 완전 raw json(.isError 미보유)은 isError() 단계 throw → catch → 빈결과 + JSDoc 가이드로 유도(계약 자체는 ResponseData 의존 유지).

**Verification**:
- `npx vitest run` 전체 → 45 files / 914 passed · 1 todo (+1). `npm run type-check` 통과. eslint 변경파일 0 error(기존 catch unused 경고 1건만).

**Invariant / Decision**:
- ResponseData 는 메서드(`isError()`)를 가진 class → host 는 반드시 ResponseData 인스턴스 반환 필요(계약 불변). auto-wrap 을 boundary 전체로 확대하지 않은 이유 = isError/status 등 메서드 의존. JSDoc 로 계약 명문화.
- `payload = response.data ?? response` 에서 `response.data` class default 가 `null` 이라 nullish fallback 성립.

---

## #5 Next.js prerender Suspense — bare ViewListGrid 내부 감쌈 ✅ 2026-05-29

**GitHub Issue**: #5

**Changed files**:
- `src/listgrid/components/list/ViewListGrid.tsx`
  - react import 에 `Suspense` 추가.
  - 기존 `export const ViewListGrid` → `const ViewListGridInner` 로 rename (hook 호출 본체).
  - 신규 `export const ViewListGrid` = `<Suspense fallback={<ViewListGridSkeleton/>}><ViewListGridInner {...props}/></Suspense>` outer wrapper + displayName.

**What was done**:
- `useQueryStates`(nuqs)→`useSearchParams` 가 Next 15 정적 prerender 시 Suspense 경계 강제. 기존엔 `ViewListGridWrapper`(Suspense+dynamic ssr:false)만 안전하고 bare `ViewListGrid` 직접 import 시 build error.
- Suspense 경계는 hook 호출 컴포넌트의 **상위**여야 하므로 inner/outer 분리 — consumer 가 page 마다 Suspense 로 감쌀 필요 0.
- 두 export(ViewListGrid / ViewListGridWrapper) 모두 public. Wrapper 는 내부에서 dynamic 으로 ViewListGrid(=outer) 로드 → 이중 Suspense 무해.

**Verification**:
- `npm run type-check` 통과. `npx vitest run` 전체 45 files / 913 passed · 1 todo, 회귀 0. eslint 0 error(기존 exhaustive-deps 경고 3건).
- prerender 빌드 동작 자체는 jsdom 단위테스트 대상 아님 → 기존 `InlineSubCollectionView.test.tsx`(ViewListGrid 렌더) 가 새 wrapper 경로 통과로 회귀 커버.

**Invariant / Decision**:
- 내부 sub-collection 들(SubCollectionField/InlineSubCollectionView/Xref*View/ManyToOne*View)이 ViewListGrid 직접 import — 이제 각자 Suspense 경계 갖지만 이미 mounted client tree 라 fallback 즉시 resolve, 무해.
- fallback = `ViewListGridSkeleton`(모든 props optional).

---

## #2 default/headless UI primitive 셋 노출 ✅ 2026-05-29

**GitHub Issue**: #2 · **방향**: (A) headless named export + subpath (사용자 승인)

**Reuse review**: Reuse `../rcm-listgrid-sample/src/adapters/MinimalUIProvider.tsx`(352줄, consumer 검증된 49 컴포넌트 셋) → 라이브러리 `headlessUIComponents` 로 정식 흡수.

**Changed files**:
- `src/listgrid/ui/headless.tsx` (신규) — `headlessUIComponents: UIComponents` zero-styling baseline 49개(box/passthrough/stripLibraryProps + Table 복합 children + Modal/SelectBox 등). `UIComponents` from `./UIProvider`.
- `src/listgrid/ui/headless.test.tsx` (신규) — +5 테스트(49키 완전성·TextInput onChange·prop strip(readonly/placeHolder/internal)·Table 복합·Modal open/close).
- `package.json` — `./headless` subpath export 추가(`dist/listgrid/ui/headless.{js,d.ts}`).
- `README.md` — Quick start §1 에 headless baseline 사용법(`{...headlessUIComponents, ...overrides}`) 추가.

**What was done**:
- UIProvider 가 49 컴포넌트(47필수+2옵션) 전부 prop 요구 → consumer 마다 47 stub 부담. headless 셋을 subpath 로 노출해 한 줄(spread)로 해소.
- 설계: main index 미포함·`/headless` subpath 전용(core 번들 무영향, explicit>implicit, Radix/HeadlessUI 생태계 정합). zero-styling(이슈 명세) → styles.css 페어링 또는 override.

**Verification**:
- `npx vitest run src/listgrid/ui/headless.test.tsx` 5 passed. 전체 `npx vitest run` 46 files / 919 passed(+5). `npm run type-check` 통과. `npm run build` OK → `dist/listgrid/ui/headless.{js,d.ts}` 산출 확인.

**Invariant / Decision**:
- 옵션 컴포넌트(BreadcrumbItem/PasswordStrength)도 baseline 제공 → `Object.keys` 49.
- alias(CheckBoxChip=CheckBox, MarkdownEditor=Textarea, MultiSelectBox=SelectBox 등)는 sample 그대로 — baseline 목적상 충분.

---
