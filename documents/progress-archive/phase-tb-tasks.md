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

## TB-7 전용 e2e 갭 폐쇄 (route-contract) — ✅ 2026-07-13

**Delegate**: sonnet general-purpose agent (`af702bfffcb9c1c5c`)·status=`done_with_deviations`(1 substantive). Engine=claude.

**스코핑 결정 (메인 세션·model-decidable·현실 강제)**: `employee`/`org`/`staff`/`university`=**무 UI 페이지**(picker/xref-only·recon §4 설계·페이지 신축=out-of-scope invention)·`professor`=페이지有이나 SubColl e2e만. → 5 엔티티 "전용 e2e(list/search/create/edit/delete)"=**route-level 계약 e2e**(5 엔티티 전부 `/api/<e>` 라우트 완비)·backend-contract.spec 패턴 확장. UI e2e/페이지 신축 금지(발명).

**구현 (changed files·TEST-ONLY)**:
- `e2e/entity-contract.spec.ts` (신규·25 tests = 5 엔티티 × 5 메서드) — DRY 파라미터 테이블(`ENTITIES[]`). 각 엔티티 `test.describe`: ① create `POST /api/<e>` 201 bare(minted id·sentField 에코) ② getOne `GET /{id}` 200 bare(no envelope) ③ search `POST /search` 9-field SearchResponse + created row membership(count-agnostic) ④ update `PUT /{id}` 200 partial-merge(untouchedField 생존) ⑤ bulk DELETE `DELETE /` 204 no-body + GET 404. SUFFIX=`Date.now()` 격리·throwaway self-cleanup(⑤가 삭제)·seed row(org 1-3·staff 1-3·univ 1-4·prof 1-8·emp 1-5) 무변경.

**Deviation(§Needs Review 등재)**: `staff.organization`=폼상 중첩 M2O picker이나 staff 라우트=**generic verbatim store**(major `college`식 toWire/fromWire 변환 無)→`GET /api/staff/{id}`가 중첩 `{id,name}` 그대로 에코(flatten/resolve 안 함). 실 fidelity 갭이나 out-of-scope=무패치·spec가 verbatim passthrough 명시 단언. **완화**: staff=폼 無(picker-only)→create/update wire가 실 listgrid 트래픽에서 미발생→실질 무영향·risk:low.

**비-deviation(정보)**: org/university=단일필드→update의 untouched-field 단언 생략(브리프 "where the entity has one" 허용·employee/staff/professor는 email 생존 단언有). org/search 라우트가 sorts 판독·filters 미판독(pre-existing TB-2 결정·이 spec는 membership/shape만 검사라 무관).

**Authoritative verify (메인·전량)**: **full Playwright 70 passed**(기존 45 + TB-7 25·무간섭)·`tsc -p apps/sample`·eslint·prettier clean·vitest 2478 무영향(e2e는 vitest 미포함).

**커버 매트릭스**: TB-C9(전용 e2e 갭 폐쇄 professor/university/employee/org/staff) 충족.

## TB-8 backend/rest 레퍼런스 어댑터 + 제네릭 REST mock — ✅ 2026-07-13

**Spec**: [ADR-0005 §Decision-5](../adr/ADR-0005-backend-adapter-contract.md) — generic REST 레퍼런스 어댑터(`GET /?page=&size=`·JSON 배열 바디+`totalCount` 헤더·표준 CRUD GET/{id}·POST·PUT/{id}·DELETE/{id}). "최소·계약 실용성 증명·문서 예제용·stretch(GA 무관)". **Reuse**: `packages/backend-rcm/src/adapter.ts` 구조 미러(createRcmAdapter factory·request 헬퍼·coerceRow·BackendAdapterError·RcmAdapterOptions). 계약=`packages/schema-core/src/backend/adapter.ts` BackendAdapter.

**모델 결정 2건 (ADR-anchored·발명 없음)**:
1. **filter→query-param 매핑 범위 = page/size ONLY**. ADR §5가 `GET /?page=&size=`만 명시 → search의 filters/sorts/quickSearch를 쿼리파라미터로 매핑하면 ADR 밖 REST 관례 발명(발명게이트). `list`에 DECIDED 주석(§Decision-5 인용) 명기.
2. **미출판(published-surface 무배선)**. `tsup.config.ts` entry·root `package.json` exports/typesVersions **무변경** — backend-rest는 `private:true` 워크스페이스 패키지 유지. TB-8=stretch·GA 무관이라 GA 표면(attw/publint/surface-count 게이트) 확장은 out-of-scope. 라운드트립 테스트(vitest·packages/** 포함)가 계약 실증. 실제 출판은 full ADR-0005 롤아웃(§구현계획 5·P6)·GA-L downstream.

**구현 (changed files·source+test)**:
- `packages/backend-rest/src/index.ts` (187 lines) — `createRestAdapter(opts: RestAdapterOptions = {}): BackendAdapter`. list=GET `{url}?page=&size=`(search.page/pageSize 공개필드·totalCount 헤더→totalElements·`pageSize>0` 가드 `Math.ceil`→totalPages·coerceRow String id)·getOne=GET `/{id}`(coerceRow)·create=POST·update=PUT `/{id}`·remove=per-id `Promise.all` DELETE `/{id}`(bulk 엔드포인트 無·revision 무시)·parseError 상태→코드(401 TOKEN_EXPIRED/403 FORBIDDEN/400·422 VALIDATION/else UNKNOWN·ProblemDetail 바디 미파싱=REST 관례 미발명)·assetBaseUrl 조건부 스프레드(exactOptionalPropertyTypes). `RestAdapterOptions`={baseUrl,fetch,headers(obj|thunk),assetBaseUrl}=RcmAdapterOptions 서브셋.
- `packages/backend-rest/src/__tests__/adapter.test.ts` (222 lines·17 tests) — injected fetch(mockResponse=.ok/.status/.json/.headers.get). 커버: list(쿼리빌드·totalCount→totalPages math·id 강제·헤더부재→0)·getOne(String id)·create·update·remove(per-id fan-out·revision 무시=1 DELETE no-body)·baseUrl/headers 포워딩·assetBaseUrl 유무·에러 5매핑(401/403/400/422/500).

**비-deviation(정보·§Needs Review 미등재)**: ① getOne이 반환 엔티티 id를 String 강제 — 브리프 명시 지시(rcm getOne은 raw 반환·DB가 이미 stringify 가정). REST 레퍼런스=명시적 parity 지시 준수. ② `remove` 공개 시그니처가 `revision?` 파라미터 **생략**(accept-and-ignore 대신)=TS 구조적 유효(적은 파라미터 함수는 optional-param 인터페이스에 assignable)·"ignore it" 준수·테스트가 3-arg 호출 시 1 DELETE no-body 확인. → 실질 deviation 아님.

**Authoritative verify (메인·전량)**: type-check clean(`tsc --noEmit`)·vitest **2495 passed**(2478+17·무회귀·1 todo)·lint **0 errors**(262 pre-existing warnings·backend-rest 무관)·prettier clean(test 파일 `--write` 1회 후 재검 green)·build green(backend-rest는 tsup entry 미포함=published bundle 무영향=의도). 어댑터 CRUD 라운드트립 실증(injected fetch seam·17 assert).

**커버 매트릭스**: TB-C11(stretch·`backend/rest` 레퍼런스 어댑터+제네릭 REST mock·ADR-0005 §Decision-5) 충족.

## TB-9 GA-L2 종결 (#GX-1/#GX-2/#W6-2b 신 테스트 종결 + 재판정) — ✅ 2026-07-13

**Spec**: [recon §8](../analysis/2026-07-13/test-backend-recon.md) GA-L2 해소 매핑 + [ga-l2-closure.md](../analysis/2026-07-13/ga-l2-closure.md)(처분 근거·§1 매핑/§2 실동작/§3 재판정). GA-L1서 GA-L2에 재앵커된 #GX-1/#GX-2/#W6-2b를 충실 테스트 백엔드+기존 excel 유닛+**실 export 관찰**로 종결.

**종결 매핑**(상세=[ga-l2-closure.md §1](../analysis/2026-07-13/ga-l2-closure.md)):
- #GX-2(mock 5/24 조건타입?) → TB-1 filter-engine.test.ts 24종 전건(framework 계약 상한=오라클). CLOSED.
- #GX-1(빈 AND/OR vacuous?) → TB-1 빈그룹 관용 + TB-6 backend-contract 빈 AND/OR=no-filter 등가. CLOSED.
- #W6-2b(M2O/xref/address TIER2 garbage?) → M2O 충실(labelField·value-transform.test.ts:185-211+R7)·**address 충실**(평면 sibling·신규 export-core.test.ts 관찰)·**xref만 진짜 손실**(한계 문서화·실트래픽 0). CLOSED.

**실행·관찰 (추정 아님·이 태스크 핵심 교훈)**: address를 xref와 동일 "data-loss"로 오판한 초안을 **실 export 관찰**로 정정. buildExportAoa 하니스(적대적 검증 워크플로우) → address body=`['Kim','','Seoul','Gangnam','123 Main','Apt 5','06236']`: composite `address` 빈셀+5 sibling(state/city/address1/address2/postalCode) 충실 → **address=무손실**(composite 빈 컬럼=vestige). xref=`{mapped,deleted}`→빈셀·carrier 無·silent(TIER-3 아님→warn 無)=**유일 진짜 손실**. 적대적 검증(opus)이 두 주장 CONFIRMED.

**구현 (changed files·TEST+DOC ONLY·product source 무변경)**:
- `packages/excel/src/__tests__/value-transform.test.ts` — address 방어 케이스 실 셰이프(`{state,city,address1,address2,postalCode}`)+NOT-data-loss 코멘트.
- `packages/excel/src/__tests__/export-core.test.ts` — 신규 통합 테스트(applyFullAddressFields→buildExportAoa faithful siblings 관찰 lock·composite 빈셀·resolved.fields 7항목 순서).
- `documents/analysis/2026-07-13/ga-l2-closure.md` — 종결 처분 기록.

**정정 이력 (2회 오류 → 관찰로 확정·사용자 지적)**: ① `{zonecode,roadAddress}`=Daum 위젯 콜백 키(address-renderer.tsx:44-49)이지 저장/export되는 Address 멤버(state/city/address1/address2/postalCode) 아님. ② address를 xref와 동일 data-loss로 프레이밍. 둘 다 **실 export 미관찰·추정**에서 비롯 → 실행·관찰+적대적 검증으로 정정. **교훈=composite 필드 export 동작은 추정 말고 buildExportAoa로 관찰**. citation `§6.6`(recon 미존재)→recon:38(§3)/:76(§6#6) 정정.

**Authoritative verify (메인·전량)**: type-check·vitest **2497**(2495+2·무회귀·1 todo)·lint 0 errors·prettier·build green.

**커버 매트릭스**: TB-C10(GA-L2 해소·#GX-1/#GX-2/#W6-2b 신 테스트 종결) 충족. → **Phase TB 전 커버리지(TB-C1~11) 완료.**

## Next Phase Handoff (Phase TB → GA-L / GA-latest)

- **Phase TB ✅ 완료(TB-0~9·TB-C1~11 전 커버리지)**: framework-0.1.0 충실 테스트 백엔드 구축 + listgrid 백엔드 full-set 실증. vitest 2478→**2497**·Playwright 70 green. **부수: GA-L2 CLOSED**([closure](../analysis/2026-07-13/ga-l2-closure.md)).
- **다음 = Phase GA-L(downstream·사용자 게이트)**: GA-L1/L2 ✅. **GA-L3(`v0.4`→`main` 플립)·GA-L4(0.4.0 `latest` 배포)=사용자 "GA-latest go" 결정(크리티컬 패스) 대기**. 무인 세션은 이 결정 없이 독립 코드 작업 없음(운영 모드 중단 조건 ②). 릴리스 기전=PROGRESS §Handoff.
- **도입/재사용 패턴(Patterns)**: ① mock-backend 승격(옵션 A·`apps/sample/lib/mock-backend` store.ts/crud-routes.ts=framework-0.1.0 충실 오라클) ② route-level 계약 e2e(`backend-contract.spec`/`entity-contract.spec` — 무 UI 엔티티도 `/api` 라우트로 계약 증명) ③ `makeCollectionHandlers` 통합(collection route 균일화) ④ `backend-rest` 레퍼런스 어댑터(`createRcmAdapter` 구조 미러·injected fetch seam) ⑤ **composite export 관찰 검증**(buildExportAoa 하니스+적대적 워크플로우로 address/xref 실동작 확정).
- **Do-NOT(계승)**: ① composite 필드(address/xref/M2O) export 동작은 **추정 금지·`buildExportAoa`로 관찰**(TB-9 교훈: address를 xref와 동일 data-loss로 오판→사용자 지적→관찰 정정). ② `{zonecode,roadAddress}`는 **Daum 위젯 콜백 키**(`address-renderer.tsx:44-49`)이지 저장/export Address 멤버(state/city/address1/address2/postalCode) 아님. ③ xref/address 실트래픽 fidelity 과투자 금지(edustack 사용 0·recon:38/:76). ④ #GX-1/#GX-2/#W6-2b(M2O·address)는 신 테스트로 이미 증명(재테스트 금지·인용). ⑤ framework에 없는 조건타입 시맨틱 발명 금지(JSON_CONTAINS/EXISTS=문서화 no-op).
- **후속(§Backlog·비차단)**: xref export silent data-loss(TIER-3 아님→warn 無)=미래 xref-export 소비자 함정·GA 후 완화 검토.
- **세션 정책**: **새 세션 권장(선택)** — 잔여는 사용자 GA-latest go 결정 대기라 코드 작업 없음. 재개는 `/progress`(이 archive + PROGRESS §Handoff + [GA-L2 closure](../analysis/2026-07-13/ga-l2-closure.md)만 읽으면 충분).
