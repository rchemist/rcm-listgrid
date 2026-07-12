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

<a id="gx-2"></a>
## #GX-2 apps/sample 백엔드 프레임워크 충실화 (2026-07-13 · sonnet 위임→메인 검증)

**결과**: apps/sample mock 백엔드 + backend-rcm 어댑터 에러 파서를 rcm-backend-framework 0.1.0 응답/에러 계약에 정합(GX-1 client wire의 상대편).

**변경**:
- `apps/sample/lib/mock-backend/envelope.ts`: `searchEnvelope`→9필드 `SearchResponse`(content/page/pageSize/totalElements/totalPages/sorts([] 최소)/searchRequest/attributes/errors)·`notFound`→RFC7807 ProblemDetail(top-level status/title/detail/type/code/errors/fieldErrors·field/traceId/tenantId는 컨텍스트 없어 omit)·"Spring Page" 주석 정정.
- `packages/backend-rcm/src/adapter.ts`: 에러 파서를 `detail ?? title ?? message ?? generic`으로(ProblemDetail 메시지 surface·구 `{error:{message}}`는 삼켜졌음). +`adapter.test.ts` 3 케이스(detail/title/fallback).
- `crud-routes.ts`·`store.ts`: `readFilters`가 GX-1 `FilterGroups{AND,OR,NOT}` 소비(empty `[]`=vacuous no-op 확인). `employee/collabo/search/route.ts`: hand-rolled(filters drop)→공유 `makeSearchHandler`(filters 배선).
- 신규 `e2e/backend-contract.spec.ts`: 실행 mock route로 404 ProblemDetail + 9필드 SearchResponse shape 고정.

**검증(메인 authoritative)**: type-check·typecheck:packages clean · **full unit 2254 pass**(+3·0회귀) · **full E2E 32/32**(+2 backend-contract·404 ProblemDetail 라이브 실증·기존 30 green=mock이 GX-1 wire 여전히 소비) · lint 0err.

**deviations**:
- **①** ProblemDetail `field/traceId/tenantId`를 explicit null 아닌 **omit**(프레임워크 조건부 setProperty·`ProblemDetailAdviceTest .field.doesNotExist()` 패턴 일치). risk:none.
- **②(§Needs Review)** mock filter 매칭이 **5/24 조건타입만**(EQUAL/NOT_EQUAL/IN/NOT_IN/LIKE·GX-2 이전과 동일·이제 주석 명시)·NOT 그룹은 wire 판독하나 매칭 no-op. 사유: 전 호출처 grep=이 5종+AND만 사용·NOT-group row-매칭 시맨틱은 인용 가능 스펙 없음(발명 금지). risk:low(테스트 mock·실사용 경로 전건 green). 실백엔드 필요 조건타입 확장 시 재검토.

<a id="gx-3"></a>
## #GX-3 `/utils` 패키지 + 전량 이식 (2026-07-13 · sonnet 위임→메인 검증 · done_with_deviations)

**결과**: 새 `@listgrid/utils`(published `@rchemist/listgrid/utils`) 신설·구 `./misc` 유틸 계층을 0.3 오라클서 이식. **런타임 의존 0**(date-fns devDep만·dist에 date-fns 0 실측)·React-free.

**변경(신규 `packages/utils/*` + 배선)**: package.json(`@listgrid/utils` zero-dep)·tsconfig·src barrel + `regex.ts`(11 상수)·`date.ts`(fDate/fDateTime/fTimestamp/fToNow/formatYearMonth/getCurrent* — **자체구현·date-fns@3.6.0 출력 바이트동일 검증**·fToNow=`Intl.RelativeTimeFormat('ko')`)·`compare.ts`(isNulls[구 비대칭]/isEquals/isEqualsIgnoreCase/isEqualCollection/isEmpty/isPositive/isNegative)·`url.ts`·`storage.ts`(CachedStorageItem wire-compat)·`asset-url.ts`(+주입 seam `setAssetServerBase`+전역 `ASSET_SERVER_URL` 폴백)·`format-price.ts` + 7 test(114). 배선: `tsup.config.ts`(utils entry+dts paths)·root `package.json`(`./utils` exports+typesVersions)·`tsconfig.json`(references)·`scripts/smoke-load.sh`(./utils cjs+esm).

**호스팅 결정**: `isEquals`/`isEqualCollection`을 **utils에 호스팅**(schema-core 배럴 재export 아님) — /schema 계수 188/190(GX-1 +2 후 여유 2)를 넘기지 않으려. schema-core 배럴 무변경(계수 무영향).

**검증(메인 authoritative)**: type-check·typecheck:packages clean · **full unit 2368 pass**(+114·0회귀) · build OK(dist/utils.{js,cjs,d.ts,d.cts}·**date-fns 0**) · attw `/utils` 🟢(4모드) · publint All good · **smoke:load `./utils` cjs+esm** green · **check:surface 49/57/188 PASS**.

**deviations(§Needs Review 2)**:
- **①** `AdapterProvider`를 `setAssetServerBase`에 배선 안 함 — 0.4 어댑터/`RcmAdapterOptions`에 asset-base 필드 부재({baseUrl,fetch,headers}만)·API host를 asset base로 전용하면 발명(API≠asset host 흔함). 주입 seam+전역 폴백은 완비. risk:low-med(현재 의존 0·미래 호스트가 명시 `setAssetServerBase` 호출 or 전역 폴백 필요). → 어댑터에 assetBaseUrl 필드 추가 여부=스펙 결정.
- **②** `isExternalUrl`을 utils에 로컬 재구현(schema-core import 안 함) — zero-dep 하드룰·byte-identical 4줄·상호참조 주석. risk:low(물리 2카피).

**계수 정정 기록**: /schema **186→188**(GX-1 `withFilter`/`withFilterIgnoreDuplicate` public 복원 +2·임계 190 미만) — GX-5서 spec §10-A W7 행 반영.
