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

## TB-4 CRUD 균일화 + bulk delete + revision passthrough — ✅ 2026-07-13

**Delegate**: sonnet general-purpose (`a5a47aa3cb6ae6ef0`)·status=`done_with_deviations`(2 minor). Engine=claude.

**실결함 수정**: adapter.remove=bulk-only(`DELETE {url}` body `{ids, revisionEntityName?}`·backend-rcm adapter.ts)인데 employee/collabo/org/staff/major는 collection DELETE 부재(hand-written POST-only) → bulk delete 실패. 균일화.

**구현 (changed files·apps/sample only)**:
- `crud-routes.ts` `makeCollectionHandlers.DELETE` — `body.revisionEntityName` 판독·passthrough(감사 store 없음→응답 에코, 조건부). 낙관락/stale 거부 없음(recon §6.2).
- `employee/collabo/org/staff/route.ts` — **consolidated**(hand-written POST=plain create passthrough → `export const {POST,DELETE} = makeCollectionHandlers(store)`, college/prof/univ 패턴 정합).
- `major/route.ts` — **added-DELETE only**(POST는 toWire/fromWire 브리지 유지·DELETE는 변환 불필요 → `makeCollectionHandlers(majorStore).DELETE` 재사용).
- `bulk-delete.test.ts` (신규·8 tests) — 5 결함엔티티 멀티행 bulk delete + revisionEntityName passthrough(있음/없음) + no-optimistic-lock(재삭제 no-throw) + college 무회귀.

**Authoritative verify (메인)**: apps/sample 유닛 67 green·`npm test` 전량 **190 files / 2466 passed**(2458+8·무회귀)·apps tsc/eslint/prettier clean.

**Deviations**:
1. DELETE 응답 shape `T[]`→`{removed:T[], revisionEntityName?}`(배열은 sibling 키 불가). adapter.remove=Promise<void>(body 미파싱)·기존 테스트 무파싱 확인→무영향. **단 framework bulk DELETE=204 no-body**(recon §2) → mock의 200+body는 pre-existing 비충실(TB-4 이전부터 json(removed) 반환). → **§Needs Review 등재**(TB-6 계약 스위트서 204 fidelity 재판정).
2. read-only `git diff`/`status` 셀프리뷰 실행(브리프 "no git" 대비). 무mutation·benign — §Needs Review 미등재.

**Discovery**: collabo/major = `.withCapabilities({delete:false})`(GJCU parity·UI delete 버튼 없음) → 이 두 엔티티 Playwright delete e2e 부재 근거. Playwright bulk-delete e2e=TB-7로 이연(route-level 8 테스트가 계약 증명).

**커버 매트릭스**: TB-C6(CRUD 균일화+bulk delete 멀티행+revisionEntityName passthrough) 충족.

## TB-5 M2O/참조 round-trip — ✅ 2026-07-13

**Delegate**: sonnet general-purpose agent (`aa4aa79fdde6e240d`)·status=`done`(무deviation). Engine=claude. 브리프=execution-grade(recon §3 R7·TB-C7·many-to-one-field.ts:79-84 serializeValue 계약·major.ts toWire/fromWire shape 인용).

**Search-first(중복 회피)**: 클라이언트 store flatten(`toSaveData`→`<name>Id`)은 `packages/state/src/__tests__/store.test.ts:96`에 기존 커버 → 재테스트 금지. TB-5 신규 = **mock-backend layer**(`major.ts` toWire/fromWire·grep 확인 ZERO 커버) + field-level serializeValue 계약을 그 경계에서.

**구현 (changed files·TEST-ONLY·무source변경)**:
- `apps/sample/lib/mock-backend/m2o-roundtrip.test.ts` (신규·12 tests) — 4 그룹:
  - **A 참조해석**(toWire 5): collegeId '1'→중첩`{id:'1',name:'공과대학'}`·self-ref parentMajorId→부모 중첩·dangling id('99999')→undefined·absent→undefined·wire에 flat `collegeId`/`parentMajorId` 키 부재(중첩만 방출).
  - **B save flatten/RV-R13 guard**(serializeValue 4): 중첩`{id,name}`→`{collegeId:'1'}`(`'college' in result`=false·string id)·**labelField-agnostic**(`{id,title}`+labelField:'title'→여전히 `{collegeId:'1'}`, idField-keyed = R7 클래스 가드·apps/sample name-fixture가 못 잡는 브랜치 명시 구성)·raw non-object('1')→base `{college:'1'}`·undefined→`{college:undefined}`.
  - **C fromWire 계약**(2): flat collegeId/parentMajorId 판독·**중첩 `{college:{id,name}}` 바디는 참조로 미판독**(collegeId=undefined → wire가 flatten을 요구함을 증명·RV-R13 쓰기측 실패모드).
  - **D 풀 라운드트립 클로저**(1): create→toWire(중첩)→serializeValue(`{collegeId:'1'}`)→PUT바디(**flat·`putBody.college`=undefined 단언**)→fromWire→update→toWire 멱등(무drift).
- 로컬 헬퍼만(신 모듈 아님): `dummyEntityForm`(throwing thunk=serializeValue가 thunk 미호출 증명)·`ctx={} as FieldEvalContext`(override가 `_ctx` 무시)·`collegeField(labelField)`.

**Authoritative verify (메인·tracked config)**: 신 파일 12 green·`npm test` 전량 **191 files / 2478 passed**(2466+12·무회귀)·`tsc -p apps/sample`·eslint·prettier clean. build=무영향(packages 무변경) 스킵.

**Note**: 발명 없음·source defect 미발견(toWire/fromWire/serializeValue 전부 인용 계약대로 동작). RV-R13 회귀 가드 = B(a)/B(b)/D.

**커버 매트릭스**: TB-C7(M2O round-trip: GET 중첩{id,title}→라벨→save flatten `<name>Id` + bare-id 참조해석) 충족.

## TB-6 full-set route 계약 스위트 + bulk DELETE 204 fidelity — ✅ 2026-07-13

**Delegate**: sonnet general-purpose agent (`ae49b6ef5548d6de4`)·status=`done`(무deviation). Engine=claude. 브리프=execution-grade(204 결정 + recon §2 계약 + isolation 제약 명시).

**메인 세션 DECIDED (#TB-4 재판정)**: bulk `DELETE {url}` 응답 `200+{removed,revisionEntityName?}` → **204 no-body**(framework recon §2 충실). 근거: client adapter `remove()`(`packages/backend-rcm/src/adapter.ts:207-219`)가 `request(...)` 호출만 하고 **응답 body 미파싱** → 204 no-body가 client 완전 호환(메인 직접 확인). 이 결정으로 **#TB-4 §Needs Review(bulk DELETE fidelity) 해소**.

**구현 (changed files)**:
- `crud-routes.ts` `makeCollectionHandlers.DELETE` — `return new NextResponse(null,{status:204})`. `body.ids` 판독+`getStore().remove(id)`(이미 삭제된 id=quiet no-op·409/에러 없음·recon §6.2)·`revisionEntityName`=accept-and-ignore(no echo·wire surface 없음)·`mockErrorResponse` 단락 유지. 파일헤더 wire-recap + 핸들러 주석 204로 갱신. `major/route.ts`=makeCollectionHandlers.DELETE 재수출→204 자동 상속(무변경).
- `bulk-delete.test.ts` — 8 tests **state-based 재작성**: `status===204` + `expect(await res.text()).toBe('')` + `store().findById(id)===undefined`(각 엔티티 `employeeStore`/`collaboStore`/`orgStore`/`staffStore`/`majorStore`/`collegeStore` accessor). revisionEntityName=accept-and-ignore·no-optimistic-lock(재삭제 204 no-op)·college regression 의도 보존. 동일 8 count·`.removed` assertion 0.
- `e2e/backend-contract.spec.ts` — **2→15 tests**(원 2 verbatim 유지). `test.describe` 그룹: ① college 5-메서드(POST create 201·GET bare·PUT bare·**DELETE 204 no-body + GET 404 = fidelity lock**) ② major 중첩 M2O wire transform(POST/GET/search content 전부 nested `college:{id,name}`·no flat collegeId·TB-5 round-trip over 실 HTTP·DELETE 204) ③ filter/sort/GX-1(**빈 AND/OR vacuous = no-filter 등가**·LIKE narrowing·DESC sort·전부 count-agnostic·throwaway rows finally cleanup) ④ error injection(`x-mock-error` VALIDATION→400 fieldErrors·SYSTEM→500). SUFFIX=`Date.now()` 이름 충돌 회피·seed row(college 1-6·major 1/2) 무변경·절대 count 단언 없음.

**Authoritative verify (메인·전량)**: vitest **191 files / 2478 passed**(무회귀·bulk-delete 재작성=동일 8 count)·**full Playwright 45 passed**(contract 15 + 전 UI e2e — 특히 `college-delete.spec.ts` UI delete flow 포함 = 204 변경이 adapter.remove UI 경로 무영향 실증)·`tsc -p apps/sample`·eslint·prettier(3 files) clean.

**커버 매트릭스**: TB-C8(full-set route 계약 5메서드×대표엔티티×wire 변형) 충족. TB-C10 부분 진전(#GX-1 빈 AND/OR over wire = GX-1 등가 테스트로 lock) — GA-L2 최종 종결은 TB-9.

**#TB-4 §Needs Review 해소**: 204 no-body 정렬(framework-faithful)·client 무영향 실증.
