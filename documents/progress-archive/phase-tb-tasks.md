# Phase TB — 백엔드 테스트 Full Set · 태스크 상세 아카이브

> 활성 페이즈. PROGRESS 본문 §Tasks Phase TB의 완료 태스크 rich detail. 규범=[test-backend-recon.md](../analysis/2026-07-13/test-backend-recon.md) + [tb-matching-semantics.md](../analysis/2026-07-13/tb-matching-semantics.md).

## TB-0 리컨 소화 + 계약 확정 — ✅ 2026-07-13 (`cc40196`)

인용 스팟체크 PASS·OQ-TB0~3 처분·§2 계약 확정. 상세=[tb0-contract-confirmation.md](../analysis/2026-07-13/tb0-contract-confirmation.md).

## TB-1 mock 필터 엔진 완성 — ✅ 2026-07-13

**Delegate**: sonnet general-purpose agent (`aa0a98615e2af6e71`)·status=`done_with_deviations`. Engine=claude(header). 브리프=execution-grade(tb-matching-semantics.md §1/§2/§3 근거).

**구현 (changed files)**:
- `apps/sample/lib/mock-backend/store.ts` — `matchesFilter`를 5-case→**24 QueryConditionType 전건**(exhaustive switch, TS `never`-checked, 각 case를 FilterDispatcher.java 라인 인용). 타입 인지 비교 `compareOrdered`(numeric→chronological(Date.parse)→lexical, null/mismatch→FALSE). 빈값 엣지 정확 재현(IN empty→false·NOT_IN empty→true·BETWEEN/IN_RANGE/DATE_BETWEEN <2→false·NOT_IN_RANGE <2→true). `JSON_CONTAINS`/`EXISTS`=명시 always-TRUE no-op(§3 데이터모델 한계 주석). `item.subFilters`→`hasNestedGroup()`(Java `hasSubFilters()`=맵 키 카운트 재현)로 재귀·item.not 적용. `matchesFilterGroup`=`andOk∧orOk∧notOk`, 공유 `combineGroup`(빈 버킷 vacuous-TRUE·NOT=`!(all)`). `SearchFilters`=`export type = FilterGroups`(schema-core 재사용·search-first). 내부 헬퍼(isNumericValue/toEpoch/compareOrdered/isBetween/isBlank/hasNestedGroup/combineGroup)=두 함수의 private 확장(신 모듈 아님).
- `apps/sample/lib/mock-backend/crud-routes.ts` — `readFilters`가 AND/OR/NOT 임의 부분집합 수용(기존=AND+OR 배열 강제·NOT drop). 오도 주석(:27-38, "framework가 NOT-group 미문서화") 정정→`SearchRequestPlanner.combineGroup:184` 인용.
- `apps/sample/lib/mock-backend/filter-engine.test.ts` (신규·29 tests) — 24 타입 각(+엣지)·숫자/날짜 정렬비교·JSON_CONTAINS/EXISTS no-op·item.not·그룹(AND-all/OR-any/빈OR/NOT `!(all)`/빈NOT/다중그룹)·nested subFilters.

**메인 세션 config 결정(모델-decidable·recon §0 의도)**: root `vitest.config.ts` `include`에 `'apps/**/*.test.{ts,tsx}'` 추가 — 신 유닛 스위트가 `npm test`/CI에 발견되도록(기존 globs=src/tests/packages만·apps 미포함). `*.test.`만 → Playwright `e2e/*.spec.ts` 불포함. 이것이 delegate의 유일 deviation(=tracked config로 실행 불가·임시 `-c` override로 검증) 해소.

**Authoritative verify (메인 세션·tracked config)**:
- `npx vitest run apps/sample/lib/mock-backend/filter-engine.test.ts` → 29/29 (발견 확인).
- `npm test`(전량) → **187 files / 2428 passed**(+1 todo) = 2399 baseline + 29. 무회귀.
- `npx tsc --noEmit -p apps/sample/tsconfig.json` → clean(root type-check는 apps 제외 → apps-local 필수).
- eslint(3 파일)·prettier(--write 후 clean). `npm run build`=무영향(packages/* 소스 무변경)로 스킵.

**커버 매트릭스**: TB-C1(24 조건타입+no-op 명시)·TB-C2(AND/OR/NOT+nested subFilters+빈그룹 관용) 충족.

**Deviation(§Needs Review 등재)**: delegate가 `vitest.config.ts`를 스코프 펜스 밖으로 판단·미수정→needs_decision. 메인 세션이 recon §0 의도 근거로 include 확장(옵션 a)·in-commit 해소. risk:low(behavioral=apps 유닛이 CI 게이트 진입·의도된 것).

## TB-2 정렬 실적용 + quickSearch/페이지네이션 검증 — ✅ 2026-07-13

**Delegate**: sonnet general-purpose (`a99b2da4574726150`)·status=`done`(무deviation). Engine=claude.

**핵심 재프레이밍(TB-0/브리핑 시 발견)**: listgrid는 framework `searchTerm` 경로를 **안 씀**(grep 0). `SearchForm.quickSearch()` (`search-form.ts:178-199`)가 각 필드를 `filters.OR`에 LIKE로 pre-expand → quickSearch 필터링은 **TB-1의 OR-group matcher가 이미 완전 처리**. 따라서 TB-2 실작업 = **정렬 적용**(신규) + quickSearch/pagination **검증 테스트**(신규 구현 없음). tb-matching-semantics.md §4를 이 사실로 정정.

**구현 (changed files)**:
- `store.ts` — `compareBySort`/`sortRows` 추가. `search()`에 `sorts?: SortSpec[]` 파라미터, 필터 후·페이지네이션 전 적용. 다중키(선언순 우선·tie→다음키·full tie→0 stable), per-key `compareOrdered`**재사용**(중복 없음), **nulls-last**(ASC/DESC 무관·SortBuilder DBMS무관 기본), 빈/부재 sorts→무재정렬. non-comparable non-null→0(tied·안전 기본·인라인 문서화).
- `crud-routes.ts` — `readSorts(body)` export·`makeSearchHandler`가 전달.
- `app/api/major/search/route.ts`·`app/api/org/search/route.ts` — `readSorts` 전달(org/search는 filters 미판독 유지).
- `sort-engine.test.ts` (신규·15 tests) — 정렬(단일 ASC/DESC·numeric-not-lexical·chronological·다중키·nulls-last ASC+DESC·stable·sort-before-paginate)·quickSearch OR-group narrowing 회귀·pagination(0-base·totals·last short page).

**Authoritative verify (메인·tracked config)**: apps/sample 유닛 44 green·`npm test` 전량 **188 files / 2443 passed**(2428+15·무회귀)·apps tsc/eslint/prettier clean. build=무영향(packages 무변경) 스킵.

**커버 매트릭스**: TB-C3(정렬 실적용 NORMAL·ASC/DESC·다중키+quickSearch)·TB-C4(0-base 페이지네이션) 충족.

## TB-3 에러 route 방출 — ✅ 2026-07-13

**Delegate**: sonnet general-purpose (`a63c7d7a2641b48f5`)·status=`done`. Engine=claude.

**계약(메인 세션 검증)**: framework ProblemDetail 코드=`CrudErrorType.java:37-43`(NOT_FOUND/404·DUPLICATE/409·UNPROCESSABLE/422)+`ProblemDetailAdvice`(VALIDATION.FAILED/400·SYSTEM.UNEXPECTED/500·REQUEST.*). **401=Spring-Security HttpStatusEntryPoint(bare)·403=access-denied(bare)** — web-advice ProblemDetail 코드 아님(AUTH.* 발명 금지). 클라 어댑터 매핑=`backend-rcm/src/adapter.ts:71-85` parseBackendError: 401|body TOKEN_EXPIRED→TOKEN_EXPIRED·403→FORBIDDEN·400|422→VALIDATION·else(404/409/500)→UNKNOWN·fieldErrors=body.fieldErrors. BackendErrorCode 4종(schema-core adapter.ts:16).

**구현 (changed files·apps/sample only)**:
- `envelope.ts` — 6 팩토리 추가(notFound와 동일 shape): `validationFailed(fieldErrors)` 400·`duplicate` 409·`unprocessable` 422·`systemError` 500(generic detail·내부 비노출)·`unauthorized` 401(code TOKEN_EXPIRED body)·`forbidden` 403(code ACCESS_DENIED·비framework 명시).
- `crud-routes.ts` — `mockErrorResponse()` 트리거: 예약 헤더 `x-mock-error`(VALIDATION/DUPLICATE/UNPROCESSABLE/SYSTEM/UNAUTHORIZED/FORBIDDEN·ci)를 5개 제네릭 핸들러 상단서 체크(body/store 전). 실 엔티티 데이터와 충돌 불가(헤더=비-데이터). 미인식/부재→정상 통과(자연 404 유지). 인라인 문서화(test scaffolding).
- `error-routes.test.ts` (신규·15 tests) — route-level(status+code+fieldErrors) + **route→adapter 라운드트립**: 실 route 핸들러 Response를 `createRcmAdapter`의 주입형 `fetch` seam(RcmAdapterOptions.fetch·adapter 설계 훅)으로 투입→BackendAdapterError.code/fieldErrors 단언. 7 매핑 전건 PASS(400→VALIDATION·422→VALIDATION·409→UNKNOWN·500→UNKNOWN·404→UNKNOWN·401→TOKEN_EXPIRED·403→FORBIDDEN).

**Authoritative verify (메인)**: apps/sample 유닛 59 green·`npm test` 전량 **189 files / 2458 passed**(2443+15·무회귀)·apps tsc/eslint/prettier clean. build 무영향 스킵.

**Note(deviation 아님·개선)**: delegate가 global fetch monkey-patch 대신 어댑터의 주입형 `fetch` 옵션(설계된 test seam·기존 backend-rcm 테스트 패턴) 사용 — 증명 동일·글로벌 변이 위험 제거. 스코프 내·intent 무drift → §Needs Review 미등재.

**커버 매트릭스**: TB-C5(400/401/403/404/409/422/500 방출→BackendErrorCode 매핑) 충족.
