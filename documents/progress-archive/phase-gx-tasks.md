# Phase GX — 0.4 프레임워크 정합 + parity (archive)

> 봉인 후 조사(2026-07-12)서 발견한 GA-blocking 갭 정합. 규범=[gap analysis](../analysis/2026-07-12/w7-post-seal-gap-analysis.md)·wire source-of-truth=rcm-backend-framework 0.1.0. 실행=sonnet 위임→메인 authoritative 검증.

<a id="gx-1"></a>
## #GX-1 SearchForm wire 완전 정합 (2026-07-12 · sonnet 위임→메인 검증)

**결과**: 0.4 `SearchForm`의 공개 빌더 + wire JSON(`toJSON`)을 rcm-backend-framework 0.1.0 `SearchRequest` 계약에 정렬하고, GJCU가 의존하는 `withFilter` 빌더 복원. `packages/schema-core/src/search/search-form.ts` 재작성.

**변경(파일: search-form.ts·index.ts·신규 `__tests__/search-form.test.ts`)**:
1. **`withFilter(condition, ...items)` 복원** — 0.3(`src/listgrid/form/SearchForm.ts:420-448`) 시맨틱 충실 이식(bucket 내 blank-name 제거·같은 name REPLACE·dedup은 pre-call 스냅샷 대상). condition을 `'AND'|'OR'|'NOT'`로 확장(후방호환 superset).
2. **`withFilterIgnoreDuplicate` 복원**(plain append·`:450-462`).
3. **`FilterItem.subFilters`** flat 배열 → 연산자 키맵 `FilterGroups={AND?,OR?,NOT?}`(중첩 그룹 표현 가능·프레임워크 `FilterItem.java:52`).
4. **`cacheKey` wire 완전 제거**(SearchRequest 필드 아님·엄격 Jackson 거부 위험).
5. **`QueryConditionType` 12→24** — `QueryConditionType.java:38-81` verbatim.
6. **quickSearch de-dup 버그 수정** — dead `startsWith('__quick__')` 가드를 prior-quickSearchFields 스냅샷 clear로 교체(반복 호출=누적 아닌 교체).
7. `addAndFilter`는 dumb-append 유지(W5-3/`ViewListGrid.tsx:254-272` 같은name 스택킹 의존 — withFilter replace로 재라우팅 안 함).

**검증(메인 authoritative)**: `type-check`(tsc --noEmit) clean · `typecheck:packages`(tsc -b) clean · **full unit 2251 pass**(+1 todo·신규 15 test 포함·0 회귀) · **college E2E 3/3 pass**(withFilter 구동 고급검색 AND 경로 라이브 실증) · 신규 유닛이 프레임워크 wire shape 2종(flat AND/IN·nested subFilters+NOT)·cacheKey 부재·24 조건타입 대조.

**deviations**:
- **①(§Needs Review)** `toJSON`이 `filters.AND`/`filters.OR`를 **항상 방출**(빈 `[]`도)·`NOT`만 omit-when-empty. 사유: 기존 테스트가 presence 하드어서트(`store.test.ts:381 toHaveLength(0)`·`many-to-one-filter.test.tsx:120 toEqual([])`) → Do-NOT(기존 테스트 파손 금지) 우선. risk:low(FilterGroups 타입은 완전 optional·프레임워크는 빈 배열/생략 둘 다 허용·`SearchRequestJacksonTest`는 역직렬화만 검증이라 프레임워크 자체 직렬화의 empty-group 생략 여부는 미확정). GX-2 mock 정렬 시 재확인.
- **②** `withFilter` condition을 `'NOT'`까지 확장(순수 widening·기존 호출처 무파손·req#3 NOT 그룹 빌드 위함). 리뷰 불요.
