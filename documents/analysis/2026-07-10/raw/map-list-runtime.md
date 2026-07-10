> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# 서브시스템 지도+비평: 리스트 런타임 (ViewListGrid + urlState)

대상: `src/listgrid/components/list/**`, `src/listgrid/urlState/**`, `src/listgrid/form/SearchForm.ts`

---

## 1. 요약

리스트 런타임은 "테이블 렌더 + 검색/필터/정렬/페이지네이션 상태 관리 + URL 동기화"를 한 몸에 묶은, 이 라이브러리의 심장부다. `ViewListGrid.tsx`(745L)는 순수 렌더 컴포넌트가 아니라 권한 판정·테마 결정·서브컬렉션 재귀·postMessage 리스너까지 떠안고 있고, 실질 상태 머신은 `useListGridLogic.ts`(802L, 반환 타입 `any`)에 있다. URL 동기화는 `urlState/`가 벤더 중립 어댑터(`UrlStateProvider`)로 잘 추상화되어 있지만, **정작 `useListGridUrlState`가 이 어댑터를 무조건 호출**하기 때문에 URL sync 를 쓰지 않는 소비자도 `<UrlStateProvider>`로 앱을 감싸야 한다 — "framework-free"라는 표어와 어긋나는 강결합이다. `SearchForm.ts`(961L)는 사실 복잡한 설계는 아니고 필터/정렬을 다루는 평범한 mutable 빌더 클래스인데, 도메인 규칙(빠른검색 subFilters, 백엔드 wire 포맷)이 촘촘히 얽혀 961줄이 된 것이며 실제로 파괴적인 설계 결함은 별로 없다. 대신 **이 클래스가 mutable하다는 점을 리스트 런타임이 여러 곳에서 안전하지 않게 다룬다** (state 객체를 직접 mutate).

가장 심각한 발견은 전역 페이지 크기 localStorage 키가 `options.defaultPageSize`로 지정한 리스트별 설정을 마운트 시점에 조용히 덮어쓰는 버그(§4.1)와, `AdvancedSearchForm`(구버전, 218L)이 죽은 코드인 채로 공개 API에 노출되어 있는 점, 그리고 `ViewListGrid.tsx`/`useListGridLogic.ts` 두 핵심 파일 모두 유닛 테스트가 0건이라는 점이다.

---

## 2. 렌더링 파이프라인 (ViewListGrid.tsx)

`ViewListGrid`는 `Suspense` 경계로 감싼 `ViewListGridInner`를 렌더한다(`ViewListGrid.tsx:739-746`). Suspense가 필요한 이유는 nuqs의 `useSearchParams`가 Next 정적 프리렌더 시 경계를 요구하기 때문이라고 주석에 명시되어 있다(`ViewListGrid.tsx:730-738`) — 이 자체는 합리적인 대응이다.

`ViewListGridInner`(`ViewListGrid.tsx:75`)의 책임 목록을 실제로 세어보면:

- 서브컬렉션 인라인/모달 깊이 계산 (`ViewListGrid.tsx:120-131`)
- 성능 로깅 3종 useEffect (`ViewListGrid.tsx:141-181`)
- 세션·권한(`getPermission('canOpenInNewWindow')`) 판정 (`ViewListGrid.tsx:198-209`)
- quickSearch/list 필드명 Set 계산 (`ViewListGrid.tsx:213-229`)
- mappedBy 필드 필터링 (`ViewListGrid.tsx:233-239`)
- `postMessage` 리스너로 새창에서의 저장/삭제 이벤트 수신 (`ViewListGrid.tsx:250-269`)
- 테마 variant 자동 결정 + Context 병합 (`ViewListGrid.tsx:271-304`)
- 체크박스/삭제버튼 표시 여부를 좌우하는 조건식 3~4단 중첩 (`ViewListGrid.tsx:326-374`)
- 실제 테이블 JSX (400줄 이상, `ViewListGrid.tsx:383-726`)

즉 "뷰"라고 부르기엔 비즈니스 판정(권한, 표시 조건)과 인프라 관심사(성능 로깅, postMessage)가 렌더 트리와 나란히 박혀 있다. 유지보수자가 실제로 호소한 "UI와 로직이 스파게티로 섞여 있다"는 불만이 이 파일에서 가장 잘 확인된다. 다만 이 자체가 "고쳐야 할 버그"라기보다 "컴포넌트 분해가 안 된 구조적 부채"에 가깝다.

### 2.1 상태 로직은 `useListGridLogic`에 위임 — 그러나 타입이 없다

```ts
// hooks/useListGridLogic.ts:38
export const useListGridLogic = (props: ViewListGridProps): any => {
```

802줄짜리 이 훅은 `fetchData`, `onChangeSearchForm`, `initializeSearchForm`, `deleteItems` 등 리스트의 전체 데이터 흐름을 구현하면서 반환 타입을 `any`로 선언한다. 즉 `ViewListGrid.tsx:75-118`에서 구조분해되는 30여 개 필드 전부가 컴파일 타임에 존재 여부/타입이 검증되지 않는다. "커머셜급 라이브러리"를 표방하는 프로젝트의 핵심 훅이 사실상 타입 안전성을 포기한 것으로, 리팩터링 중 필드 이름 오타나 삭제가 조용히 런타임 에러로만 나타난다. `ViewListGridProps`나 `ListGrid` 관련 타입은 잘 정의돼 있는데(타 서브시스템), 이 훅 하나가 타입 경계를 깨고 있다.

### 2.2 SearchForm 인스턴스 직접 mutate — 상태 불변성 위반 가능성

```ts
// ViewListGrid.tsx:719-724
const changePage = (page: number) => {
  (async () => {
    setRows([]);
    await onChangeSearchForm(entityForm, searchForm!.withPage(page));
  })();
};
```

`searchForm`은 `useState`로 관리되는 현재 상태 객체다(`useListGridLogic.ts:104`). `withPage()`는 `this.page = page; return this;`로 **인자 없이 그 자리에서 mutate**한다(`SearchForm.ts:326-329`). 즉 `changePage`는 리액트 state로 보관 중인 객체를 setState 호출 전에 이미 변형시킨다. `onChangeSearchForm` 내부에서 `searchForm.clone()`으로 복제하므로(`useListGridLogic.ts:426`) 최종적으로는 새 객체가 다음 state가 되긴 하지만, **mutate와 clone 사이의 찰나에 같은 렌더 사이클 내 다른 컴포넌트가 이전 `searchForm` 참조를 읽으면 이미 바뀐 값**을 보게 된다. 현재는 단일 스레드 동기 흐름이라 표면화된 버그는 못 찾았지만, "불변 상태"를 가정하는 리액트 패턴에서 이런 in-place mutation은 대표적인 버그 유발 패턴이며 `SearchForm` 전체에 걸쳐 반복된다(`withSort`, `withFilter`, `handleAndFilter` 모두 동일 패턴).

---

## 3. URL 상태 동기화 (urlState/**, hooks/useListGridUrlState.ts)

### 3.1 어댑터 설계는 훌륭하다 (강점)

`UrlStateProvider.tsx`는 nuqs를 직접 의존하지 않고 `UrlStateServices` 인터페이스만 요구하는 Context 기반 어댑터다(`urlState/UrlStateProvider.tsx:6-35`). `mustUrlState()`가 Provider 부재 시 이름까지 짚어주는 명확한 에러 메시지를 던진다(`urlState/UrlStateProvider.tsx:20-26`, "Wrap your app with `<UrlStateProvider value={...}>`... See `@rchemist/listgrid-next`"). 이 설계 자체는 "nuqs에 종속되지 않는 벤더 중립 URL 상태"라는 목표를 제대로 달성했고, `urlStateParsers.ts`의 필터 URL 포맷(`?filters=status:ACTIVE,name:like:홍길동`, `urlState/../hooks/urlStateParsers.ts:59-104`)도 사람이 읽고 쓸 수 있는 합리적인 스킴이다.

### 3.2 그런데 URL sync 를 끈 소비자도 Provider가 강제된다

```ts
// hooks/useListGridUrlState.ts:109-123
const [urlState, setUrlState] = useQueryStates(
  { page: parseAsPage, pageSize: parseAsPageSize, q: parseAsString, sort: parseAsSort, filters: parseAsFilters },
  { history: 'replace', shallow: true },
);
```

이 훅은 `resolvedOptions.enabled`가 `false`여도(예: subCollection, `urlSync: false` 지정, 팝업) `useQueryStates`를 무조건 호출한다. `useQueryStates`는 Context가 없으면 예외를 던지므로(`UrlStateProvider.tsx:20-26`), **리스트를 하나라도 렌더하는 앱은 URL sync 사용 여부와 무관하게 반드시 `<UrlStateProvider>`로 앱 전체를 감싸야 한다.** "새 프로젝트가 원 호스트의 아키텍처에 강제로 편입된다"는 유지보수자 불만이 정확히 여기서 재현된다 — URL 동기화는 옵션인데 Provider 의존은 옵션이 아니다. `isEnabled` 체크를 훅 호출 여부가 아니라 훅 호출 *이후* 결과에만 적용한 것이 원인이다.

### 3.3 URL 왕복 시 다중 정렬이 첫 번째 정렬로 손실된다

`SearchForm.sorts`는 `Map<string, Direction>`으로 다중 컬럼 정렬을 지원한다(`SearchForm.ts:188`, `withSort`가 최신 정렬을 맨 앞에 두는 방식으로 다중 정렬을 쌓는다 `SearchForm.ts:349-369`). 그러나 URL 직렬화는:

```ts
// hooks/searchFormUrlSync.ts:36-45
const sorts = searchForm.getSorts();
if (sorts.size > 0) {
  const [field, direction] = Array.from(sorts.entries())[0]!; // 첫 번째(=최신) 정렬만
  ...
  urlState.sort = { field, direction };
}
```

`parseAsSort`도 단일 `{field, direction}`만 다룬다(`hooks/urlStateParsers.ts:44-56`). 즉 사용자가 2개 이상의 컬럼으로 정렬한 상태에서 새로고침하거나 링크를 공유하면 **두 번째 이후 정렬 조건은 URL에도, 복원 시에도 사라진다.** 다중 정렬이 SearchForm 레벨에서 1급 기능인데 URL 계약이 이를 지원하지 않는 것은 기능 손실이자 스펙 불일치다.

### 3.4 마운트 시 이중 조회 가능성 (fragile 타이밍 의존)

`initialize()`(`useListGridLogic.ts:524-551`)가 `initializeSearchForm()` → `onChangeSearchForm()` → `fetchData()`로 최초 조회를 수행하면서, URL에 파라미터가 있으면 `initializedFromUrlRef.current = true`로 미리 표시한다(`useListGridLogic.ts:454-455`). 그런데 별도의 `useEffect`(`useListGridLogic.ts:642-675`)가 `urlStateHook.urlState` 변경 시마다 재조회를 트리거하며, 최초 마운트에서 이 effect가 한 번 더 실행되어 `currentPage !== urlPage`를 검사한다. 두 effect의 실행 순서와 `initializedFromUrlRef` mutation 타이밍에 의존하는 이 로직은 리액트 18 Strict Mode(2번 마운트) 환경이나 향후 리액트 동시성 모드에서 조회가 중복 실행될 위험을 안고 있다. eslint-disable로 의존성 배열을 억누른 채(둘 다 `// eslint-disable-next-line react-hooks/exhaustive-deps`) 타이밍에 의존하는 코드라 회귀에 취약하다.

---

## 4. SearchForm 클래스 설계 (961L) — "왜 이렇게 긴가"

내용을 보면 실제로는 다음 세 덩어리로 나뉜다: (1) 쿼리 조건 타입/헬프텍스트 메타데이터(`SearchForm.ts:10-169`, 약 160줄이 그냥 UI용 라벨/설명 딕셔너리), (2) 상태와 빌더 메서드(`SearchForm.ts:181-871`), (3) 백엔드 wire 포맷 변환(`toJSON`, `filterItemToWire`, `SearchForm.ts:891-939`). 즉 **961줄의 태반은 "복잡한 설계"가 아니라 "장황한 도메인 상수 + 반복적인 getter/setter"**다. God object라기보다는 SRP를 살짝 넘어선 유틸리티 모음에 가깝다. 다만 다음은 실질적 문제다.

### 4.1 전역 페이지 크기가 리스트별 `defaultPageSize` 옵션을 마운트 시 덮어쓴다 (Critical)

```ts
// hooks/useQuickSearchBar.ts:112-117
useEffect(() => {
  const globalPageSize = getGlobalPageSize();
  if (searchForm.getPageSize() !== globalPageSize) {
    onChangeSearchForm(searchForm.clone().withPage(0).withPageSize(globalPageSize));
  }
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

`getGlobalPageSize()`는 앱 전체에서 공유하는 단일 localStorage 키 `listgrid_global_page_size`를 읽는다(`useQuickSearchBar.ts:28-40`). 반면 `useListGridLogic.initializeSearchForm()`은 호스트가 명시한 `props.options?.defaultPageSize`를 우선 적용한다(`useListGridLogic.ts:461,484,498,739`: `props.options?.defaultPageSize ?? getGlobalPageSize()`).

문제는 `QuickSearchBar`(→ `useQuickSearchBar`)가 리스트마다 렌더되고, 마운트 시 무조건 "현재 searchForm의 pageSize가 글로벌 값과 다르면 글로벌 값으로 강제 교체"하는 별도 이펙트를 돌린다는 것이다. 시나리오:

1. 사용자가 리스트 A에서 페이지 크기를 50으로 바꿈 → `setGlobalPageSize(50)` (`useQuickSearchBar.ts:42-44`) → localStorage 전역 키 갱신.
2. 호스트 개발자가 리스트 B에 `options.defaultPageSize: 10`을 명시적으로 지정(예: "이 화면은 10개씩만 보여줘야 함").
3. 리스트 B 마운트 → `initializeSearchForm`이 pageSize=10으로 초기화 → **곧바로 `useQuickSearchBar`의 마운트 이펙트가 10 ≠ 50을 감지, `withPageSize(50)`으로 강제 재조회.**
4. 리스트 B는 개발자가 지정한 10건이 아니라 50건을 보여주며, 불필요한 API 재호출까지 발생한다.

즉 **"페이지 크기 기억"이라는 편의기능이 명시적 per-list 설정을 조용히 이기는 설계 결함**이며, 게다가 마운트마다 조회가 1회 더 나갈 수 있다(초기화 조회 + 이 강제 교정 조회). "커머셜급으로 여러 프로젝트에 재사용"하려는 목표에 정면으로 배치되는 버그다 — 같은 브라우저에서 여러 다른 목적의 리스트를 쓰는 순간 서로의 페이지 크기를 오염시킨다.

### 4.2 필터 조작 API 3벌이 유사 로직을 중복 구현

`handleAndFilter`(`SearchForm.ts:372-418`), `withFilter`(`SearchForm.ts:420-448`), `withFilterIgnoreDuplicate`(`SearchForm.ts:450-462`)는 모두 "AND/OR 조건에 필터 추가"를 하지만 중복 판정 로직이 제각각이다(`handleAndFilter`는 순회하며 mutate, `withFilter`는 이름 기준 dedup 후 재삽입, `withFilterIgnoreDuplicate`는 이름 그대로 dedup을 안 한다). 호출부 입장에서 언제 어떤 메서드를 써야 하는지 문서화가 없고, 세 메서드의 동작 차이는 이름만으로 추측해야 한다.

---

## 5. AdvancedSearchForm vs V2 — 죽은 코드가 공개 API에 노출됨

```ts
// index.ts:192
export { AdvancedSearchForm } from './components/list/AdvancedSearchForm';
```

```ts
// ViewListGrid.tsx:9
import { AdvancedSearchFormV2 as AdvancedSearchForm } from './AdvancedSearchFormV2';
```

`ViewListGrid`가 실제로 렌더하는 것은 `AdvancedSearchFormV2`(637L)뿐이고, 구버전 `AdvancedSearchForm.tsx`(218L)는 라이브러리 내부 어디에서도 import되지 않는다(전체 코드베이스 grep 결과 `index.ts`의 재수출 1건뿐). 즉:

- 218줄짜리 컴포넌트, `isNotCondition` 헬퍼 중복 정의(V2/`useQuickSearchBar.ts`에도 동일 함수가 각각 존재 — 3중 복사, `AdvancedSearchForm.tsx:22-37`, `useQuickSearchBar.ts:11-26`), `FilterView` 의존까지 통째로 유지보수 대상에 남아있지만 실제로는 아무도 실행하지 않는다.
- 공개 API로 노출되어 있어 외부 소비자가 실수로 이 구버전을 직접 import해서 쓸 수 있고, 그 경우 V2에만 있는 기능(예: OR 검색, orFields)이 빠진 채 동작한다.
- Deprecation 주석/`@deprecated` 태그가 전혀 없다 — 이름만 보고는 "레거시"인지 알 방법이 없다.

이건 명백한 "죽은 코드"이며, 유지 관리 부채이자 API 혼란의 원인이다.

---

## 6. 캐시 3종 (ListGridViewFieldCache, AdvancedSearchOpenCache, headerFilterStore)

`ListGridViewFieldCache.ts`(61L)와 `AdvancedSearchOpenCache.ts`(53L)는 내부 `CacheContext` 클래스가 사실상 **동일한 코드를 값 타입만 바꿔 복사**한 것이다(둘 다: localStorage 전체 blob을 매 호출마다 `JSON.parse` → Map 재구성 → 조회/수정 → 전체 blob `JSON.stringify` 후 재저장, `ListGridViewFieldCache.ts:5-40` vs `AdvancedSearchOpenCache.ts:3-33`). 제네릭 `CacheContext<V>` 하나로 통합 가능한데 두 벌 유지되고 있다 — 사소하지만 "search-first, 중복 생성 금지" 원칙에 어긋나는 전형적 사례.

기능적으로도 매 `get`/`set` 호출이 localStorage 전체를 파싱하고 전체를 다시 쓰는 O(전체 캐시 크기) 동작이라, 필드가 많은 앱에서 리스트마다 필드 선택을 바꿀 때마다 전체 캐시 JSON을 왕복 직렬화한다 — 리스트 개수가 늘어날수록 선형으로 느려지는 구조이나, 실사용 규모에서는 성능 이슈보다는 설계 위생 문제로 본다.

`headerFilterStore.ts`(zustand, 32L)는 반대로 깔끔하다 — 열린 필터 ID 하나만 전역으로 관리하는 단순한 스토어로, 과설계 없이 필요한 만큼만 구현되어 있다(강점으로 언급할 만함).

---

## 7. 테마 variant 시스템 — 강점으로 평가할 부분

`ListGridThemeContext.tsx`의 `deepMerge` + variant 프리셋(`getVariantTheme`, `ListGridThemeContext.tsx:57-71`) + `ListGridThemeProvider`는 이 리포에서 보기 드물게 "라이브러리답게" 설계된 부분이다:

- 기본 테마(`defaultListGridTheme.ts`)는 전부 `rcm-*` scoped 클래스만 사용해 호스트의 Tailwind/디자인 시스템과 충돌하지 않도록 격리했고, 커스터마이즈 경로 4가지(CSS 변수, 클래스 재정의, `classNames` prop, Provider theme)를 문서화한 주석까지 갖췄다(`defaultListGridTheme.ts:3-14`).
- `ViewListGrid.tsx:280-292`에서 Context variant가 `default`가 아니면 Context를 우선하고, 아니면 자동판정된 variant로 폴백하는 계층 구조가 명확하다.
- variant 자동 결정 로직(`popup > subCollection > main > default`, `ViewListGrid.tsx:272-277`)도 단순하고 예측 가능하다.

이 부분만 놓고 보면 "커머셜급으로 여러 프로젝트에 재사용 가능"이라는 목표에 가장 근접한 서브모듈이다.

---

## 8. 리스트 ↔ 폼 서브시스템 결합

`SubCollectionViewModal.tsx:4`에서 리스트 런타임이 폼 서브시스템의 `ViewEntityForm`을 직접 import해서 렌더한다:

```ts
// ui/SubCollectionViewModal.tsx:1-7
import { ViewEntityForm } from '../../form/ViewEntityForm';
...
<ViewEntityForm entityForm={collectionEntityForm} ... postSave={...} postDelete={...} />
```

리스트가 "행을 클릭하면 상세/편집 폼을 모달로 띄운다"는 기능을 가지려면 필연적으로 폼을 참조해야 하므로 결합 자체가 부당하다고 보긴 어렵다. 다만 이 지점이 유지보수자가 말한 "EntityForm이 재귀적으로 ViewEntityForm을 다시 렌더한다"는 구조의 시작점이며, 리스트 서브시스템은 이 지도의 스코프상 "폼을 호출하는 지점이 있다"까지만 확인되고, 재귀 자체의 설계 평가는 폼 서브시스템 리포트의 영역이다. `EntityFormScopeContext.tsx`가 `depth`/`maxInlineDepth`로 재귀 깊이를 제어하는 방어 장치를 이미 갖추고 있다는 점(`EntityFormScopeContext.tsx:78`: `isInlineMode = effectiveDepth <= effectiveMaxInlineDepth`)은 무모한 무한 재귀가 아니라 의도적으로 깊이를 관리하고 있다는 증거로, 이 부분은 설계자가 문제를 인지하고 완화책을 넣은 사례로 평가한다.

---

## 9. 테스트 커버리지 갭

리스트 런타임 스코프 안에서 `*.test.*` 파일 존재 여부:

- `ViewListGrid.tsx` (745L) — **테스트 없음**
- `useListGridLogic.ts` (802L) — **테스트 없음**
- `useListGridUrlState.ts`, `searchFormUrlSync.ts`, `urlStateParsers.ts` — **테스트 없음** (URL 계약의 핵심 변환 로직 전부)
- `AdvancedSearchFormV2.tsx` (637L, 실제 렌더되는 고급검색) — **테스트 없음**
- `SearchForm.test.ts`(612L)만 유일하게 두터운 테스트를 갖고 있다 — 클래스 자체 로직은 검증되지만, 그 클래스를 소비하는 훅/컴포넌트 레이어는 전혀 검증되지 않는다.
- 존재하는 테스트는 `EntireChecker`, `EntityFormScopeContext`, `mappedByFieldFilter`, `useSubCollectionExpansion`, 서브컬렉션 인라인/카드 뷰 등 지엽적인 유닛에 집중되어 있다.

즉 리스트 런타임의 "심장"인 데이터 조회·URL 동기화·페이지네이션 흐름 전체가 리그레션 테스트 없이 순수하게 수동 QA에 의존한다. §4.1의 전역 페이지 크기 버그, §3.4의 이중 조회 위험 같은 문제들이 테스트로 잡히지 않은 이유가 바로 이 커버리지 갭이다.

---

## 10. 강점 정리 (근거 있는 긍정 평가)

1. **테마 variant 시스템** (§7) — deepMerge + 4단계 커스터마이즈 경로 + scoped CSS 클래스. 라이브러리다운 설계.
2. **URL 상태 어댑터 패턴** (§3.1) — nuqs 직접 의존을 Context 인터페이스로 추상화해 `@rchemist/listgrid-next` 같은 별도 어댑터 패키지로 분리 가능하게 함. 벤더 종속을 피하려는 의도가 명확하고 실제로 구현됨.
3. **`options.filtersKey` (#10 이슈)** (`useListGridLogic.ts:612-639`) — host-owned 필터를 remount 없이 재적용하는 최근 수정으로, 코드에 "왜 이렇게 했는지"에 대한 주석이 충실하고(`체크박스는 켜졌는데 host 선택 상태는 비는 불일치` 등 실패 시나리오까지 명시), 커밋 로그(`48ab863`, `f83babe`)로 보아 이슈 기반으로 신중하게 다듬어진 흔적이 보인다. 이 리포에서 보기 드물게 "왜"가 기록된 코드다.
4. **`SearchForm.toJSON()` wire 변환** (`SearchForm.ts:891-939`) — `Map`이 `JSON.stringify`에서 `{}`로 깨지는 문제를 인지하고 재귀적으로 plain object로 변환하는 명시적 해결책을 두었으며, 주석에 실제로 겪었던 백엔드 400 에러(`Cannot deserialize ArrayList from Object`)까지 남겨둬 왜 이 코드가 필요한지 추적 가능하다.
5. **`EntityFormScopeContext`의 깊이 제어** (§8) — 서브컬렉션 무한 재귀를 막기 위한 `depth`/`maxInlineDepth`/`forceModalMode` 장치가 사전에 설계되어 있다.

---

## 11. 결론

리스트 런타임은 "동작은 한다"는 확인 이상의 신뢰를 주기 어렵다. 렌더와 로직이 한 컴포넌트에 뒤섞인 문제는 리팩터링으로 해결 가능한 구조적 부채지만, §4.1(전역 페이지 크기가 per-list 설정을 덮어씀)은 상용 배포 중인 여러 프로젝트에서 실제로 발생 중일 가능성이 높은 **활성 버그**이고, §3.2(URL sync 옵션인데 Provider 의존은 강제)는 "framework-free"라는 핵심 판매 포인트를 훼손하는 아키텍처 결함이다. 두 핵심 파일에 테스트가 0건이라는 사실은 이 서브시스템의 어떤 리팩터링도 "고쳤다고 믿는" 수준 이상으로 검증하기 어렵다는 뜻이며, 상용화를 노린다면 §4.1/§3.2 수정과 최소한의 `useListGridLogic`/URL sync 계약 테스트 확보가 최우선 과제다.
