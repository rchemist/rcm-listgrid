# 백엔드 테스트 Full Set — 착수 리컨 (2026-07-13)

> **generated-by**: 워크플로우 `test-backend-recon`(5 병렬 sonnet 리더·594K tok·429s·0 err). 5 차원 — listgrid API 표면 · rcm-backend-framework 0.1.0 wire · edustack 실사용 · gjcu 폴백 · apps/sample mock 커버리지/갭. **전 주장 file:line 인용 강제**(엔진-라우팅 규범). raw = workflow transcript `wf_2a88c65f-37c`.
> **검증 로그**: 메인 세션이 backbone 사실을 직접 재확인 — BackendAdapter 5메서드(`packages/schema-core/src/backend/adapter.ts:25-58`)·listgrid 24 조건타입(`packages/schema-core/src/search/search-form.ts:41-75`)·mock 5/24(`apps/sample/lib/mock-backend/store.ts:49-78`)·framework wire 계약([2026-07-12 §15-22](../2026-07-12/w7-post-seal-gap-analysis.md)와 정합). 인용 스팟체크 통과.
> **목적**: 사용자 지시(2026-07-13) — "edustack/gjcu 분석 → 이 리포에 테스트 백엔드 구축 → listgrid 백엔드 테스트 full set → apps/sample서 listgrid 모든 API 테스트". 본 문서 = **PROGRESS Phase TB의 규범 참조**(각 태스크가 §N 인용). 구축은 **다음 세션**.

## §0 핵심 판단 + 아키텍처 결정

**재프레이밍**: GX 페이즈가 이미 mock을 프레임워크 정합(happy-path)시켰다. 사용자 요구는 **추가적 = 테스트 완전성** — 5개 어댑터 메서드 × 24 조건타입 × 전 에러코드 × 정렬/quickSearch/nested-group/bulk-delete를 apps/sample에서 전수 실증. 부수 효과로 **GA-L2 실백엔드 gated 항목(#GX-1/#GX-2/#W6-2b)이 구축으로 해소**된다(충실 테스트 백엔드 = 그 항목들이 기다리던 오라클).

**아키텍처 결정 = 옵션 A (기존 apps/sample mock을 프레임워크-0.1.0 충실 테스트 백엔드로 승격)**. 근거: ① apps/sample이 이미 쓰는 vehicle ② `store.ts`/`crud-routes.ts`/`envelope.ts` 재사용(Search-first) ③ `backend-contract.spec.ts`가 이미 route-level 핀 패턴 ④ framework 계약이 §2에 완전 명세돼 TS 재현 가능 ⑤ 신 패키지 발명 회피. **기각**: 옵션 B(신 `@listgrid/test-backend` 패키지·과투자)·옵션 C(실 Java framework 구동·크로스언어 CI 부담). *`backend/rest` 레퍼런스 어댑터(ADR-0005 수용#3·현 빈 스캐폴드)는 인접하나 별개 = TB-8 stretch.*

**테스트 3계층**: (a) mock 필터/정렬 엔진 **유닛** — `apps/sample/lib/mock-backend/*.test.ts` · (b) **route-level 계약** — `backend-contract.spec.ts` 확장(실행 route 직타·UI 무관) = "full set"의 핵심 · (c) 기존 **UI E2E 13종**(통합·유지).

## §2 규범 wire 계약 — rcm-backend-framework 0.1.0 (테스트 백엔드가 재현할 스펙)

출처: `~/dev/rcm-backend-framework`(`.framework-version:1`=0.1.0·io.rchemist·Java25·SpringBoot4.0.6·Jackson3/Records).

- **SearchRequest** `{page(0-base,def 0), pageSize(def 20), operator(LogicalOperator,def AND), filters, sorts, quickSearchFields, searchTerm, viewDetail, exactMatch, ignoreCache, ...}` — `SearchRequest.java:53-114`. `@JsonInclude(NON_NULL)`.
- **filters = `LinkedHashMap<LogicalOperator,List<FilterItem>>`** — 사용된 연산자 키만 존재. **빈 요청 = `filters:{}` (키 0개), `{AND:[],OR:[]}` 아님** — `SearchRequest.java:724-738`. ⚠️ **listgrid SearchForm.toJSON은 AND:[]/OR:[]를 항상 방출**(`search-form.ts:259-291`) → 테스트 백엔드는 listgrid의 빈 AND/OR를 **vacuous no-op으로 관용**해야 함(현 mock `store.ts:80-85`이 이미 그러함). **이것이 #GX-1의 실답**.
- **FilterItem** `{name(필수·@NonNull), value?, values?(IN/BETWEEN 다중), queryConditionType?(def EQUAL), not?(항목레벨 NOT), subFilters?:map(중첩 그룹), joinType?(INNER/LEFT/RIGHT)}` — `FilterItem.java:45-77`.
- **QueryConditionType = 24종 (framework `QueryConditionType.java:38-87` ≡ listgrid v0.4 `search-form.ts:41-75`, 완전 일치)**: `EQUAL, NOT_EQUAL, IN, NOT_IN, LIKE, NOT_LIKE, GREATER_THAN, GREATER_THAN_EQUAL, LESS_THAN, LESS_THAN_EQUAL, BETWEEN, IS_NULL, IS_NOT_NULL, IS_BLANK, IS_NOT_BLANK, NULL_OR_EQUAL, NULL_OR_BLANK, IN_RANGE, NOT_IN_RANGE, DATE_BEFORE, DATE_AFTER, DATE_BETWEEN, JSON_CONTAINS, EXISTS`. **EQUAL_IGNORECASE 없음**(Builder sugar가 wire 플래그 미설정). **GJCU 0.2의 START_WITH/ID_EQUAL 등은 divergent·폴백만·채택 금지**.
- **LogicalOperator** = `AND, OR, NOT` (`LogicalOperator.java:24-28`). **SortInfo** = polymorphic `{type:"NORMAL"|"PRIORITY"(def NORMAL), field, direction:ASC|DESC, joinType, nullsFirst}` — `SortInfo.java:34-47`·client가 PRIORITY 명시해야(자동추론 안 함).
- **SearchResponse<T> = 9필드** `{content, page, pageSize, totalElements, totalPages, sorts, searchRequest(에코), attributes(Map), errors(FieldErrorEntry[])}` — `SearchResponse.java:50-180`. **Spring Data Page 아님**(pageable/numberOfElements 없음). 단일 GET = bare 엔티티(envelope 없음).
- **ProblemDetail (RFC7807)** `{status, title, detail, type, code, field?, errors[]:{field,code,message}, fieldErrors:{field:[msg]}, traceId?, tenantId?}` — `ProblemDetailAdvice.java:106-310`. **고정 코드**: `CRUD.NOT_FOUND`(404)·`CRUD.DUPLICATE`(409)·`CRUD.UNPROCESSABLE`(422)·`VALIDATION.FAILED`(400)·`SEARCH.USE_POST_BODY`(400)·`REQUEST.BODY_INVALID`(400)·`REQUEST.PARAM_TYPE_MISMATCH`(400)·`SYSTEM.UNEXPECTED`(500).
- **CRUD 매트릭스(framework 9 route)** `AbstractCrudController.java:57-242` — POST /(create 201+Location)·GET /(simple 쿼리검색)·POST /search·POST /count·GET /{id}?viewType·PUT /{id}·DELETE /{id}(단건 204)·**DELETE /(bulk·body `BulkDeleteRequest{ids(@NotEmpty), revisionEntityName?}`·204)**·GET /search/schema.
  - **listgrid가 실제 쓰는 것**: `POST /search`·`GET /{id}`·`POST /`·`PUT /{id}`·`DELETE /`(bulk). GET /(simple)·POST /count·GET /search/schema·DELETE /{id}(단건)은 **미사용**.
- **revision/낙관락**: framework 0.1.0에 **@Version/ETag/If-Match 전무**(grep 0). `revisionEntityName`=미래 감사훅용 passthrough 필드일 뿐 — **낙관락 wire(409-on-stale) 재현 금지**.
- **Excel**: framework에 **범용 excel export/import 엔드포인트 없음**(BulkImportProcessor는 Java 유틸·wire DTO 없음). listgrid excel은 **100% 클라이언트**(export=file-saver·import=클라 파싱·POST는 host onSubmit) — `export-core.ts`/`import-core.ts`. **테스트 백엔드에 excel 엔드포인트 추가 금지**; excel 테스트=클라 round-trip.
- **Upload**: framework=AssetController(multipart 5엔드포인트)이나 listgrid는 **upload 엔드포인트 전무**(host `onUpload` 콜백 소유·`ui-default FileInput`). **upload=listgrid API 아님·테스트 대상 아님**(옵션 데모 엔드포인트만).

## §3 소비자 현실 — edustack(1차 레퍼런스) / gjcu(폴백)

- **edustack**(실사용 primary·단 `@rchemist/listgrid ^0.3.22`·framework-bom 0.1.0-SNAPSHOT):
  - **R7 확정**: manyToOne = 중첩 `{id, title}`(labelField='title')·쓰기 key=`<name>Id`·D-033 계약·backend `LmsCourseRefResolver` 투영 — `lms-syllabus.ts:31-37`. → 테스트 백엔드 M2O 기본 = 중첩 `{id,title}`.
  - **#GX-1**: 필터 없을 때 **`filters` 키 자체를 생략**(빈 AND/OR 안 보냄) — `submissions/api.ts:35-40`. → 빈 AND/OR는 listgrid 제네릭-UI 산물, 백엔드는 관용만.
  - **#GX-2**: 앱 코드는 **EQUAL만** 사용 — `enrollments/page.tsx:19-23` 외. (listgrid ViewListGrid 고급검색 UI가 런타임에 더 생성 가능 — edustack 소스로는 확인 불가·**TB-0 미결#1**.)
  - **xref/address**: **edustack 사용 0**(grep 0) → **#W6-2b(xref/address)는 실트래픽 미검증**·listgrid 자체 유닛으로 커버·과투자 금지.
  - BFF 프록시 전량 경유·에러=문자열 sanitize만(fieldErrors 미판독). 알려진 소비자 결함(참고): sorts Map→array 정규화(rcm-listgrid#1)·204 null-body.
- **gjcu**(폴백만·`@rchemist/listgrid 0.2.29`·framework 0.0.5): 커스텀 필드 서브클래스 **98종**(확장점)·M2O `field:{id,name}`(string|함수형·함수형은 전체객체 필요)·XrefMappingField `filters:[{name,queryConditionType:'EQUAL',value}]`·address=`applyFullAddressFields`(7 flat scalar·라이브러리 헬퍼)·조건타입 **0.2의 23종 divergent**(EQUAL_IGNORECASE/START_WITH/ID_EQUAL — 채택 금지). GJCU-local 프록시+ProxyInterceptor(X-EntityForm-Name/X-Extension-Point)·bespoke per-entity excel-download(pre-flatten 라벨 DTO=R7 갭의 증거).

## §4 현 커버리지 + 갭 (apps/sample mock + 테스트)

현: 11 엔티티·2경로(제네릭 `crud-routes.ts` 팩토리 + 수작성 major/org/staff/collabo). **갭 worklist**:
- **조건타입**: mock 5/24 구현(EQUAL/NOT_EQUAL/IN/NOT_IN/LIKE·`store.ts:49-78`)·나머지 **19종 no-op**(default result=true).
- **필터 그룹**: AND/OR flat만·**NOT 그룹 + FilterItem.subFilters wire 수용하나 미평가**(`crud-routes.ts:26-43`).
- **정렬**: sorts 에코만·실제 정렬 안 함(`envelope.ts:34-37`·store.search 무정렬). **quickSearchFields**: 아무 route도 미판독.
- **에러**: route가 **404만 방출**(`envelope.ts:63-80`). 400/401/403/409/422/500은 `adapter.test.ts` stub 유닛만·**실 route 미방출**.
- **bulk delete 불일치**: employee/org/staff/collabo=**per-id DELETE만**(bulk route 없음)·college/prof/univ/student/subject=bulk만·major=없음. **adapter.remove()는 bulk만 호출** → 전자 4엔티티 bulk-delete는 mock서 **실패**(실결함).
- **revisionEntityName**: 아무 route도 미판독. **계약 핀**: `backend-contract.spec.ts`=college 2사실만.
- **전용 e2e 없는 엔티티**: professor/university/employee/org/staff(피커/xref 부수 도달만).

## §5 커버리지 매트릭스 (Phase TB 태스크 앵커)

| ID | 커버 영역 | 규범 §·증거 | 태스크 |
|---|---|---|---|
| TB-C1 | 24 조건타입 전 필터 시맨틱 + no-op 명시 | §2 QCT·`store.ts:49-78` | TB-1 |
| TB-C2 | 필터 그룹 AND/OR/NOT + nested subFilters + 빈 AND/OR 관용 | §2 filters·`crud-routes.ts:26-43` | TB-1 |
| TB-C3 | 정렬 실적용(NORMAL·ASC/DESC·다중키) + quickSearchFields | §2 SortInfo·`envelope.ts:34-37` | TB-2 |
| TB-C4 | 페이지네이션 0-base·page/pageSize·totalElements/Pages | §2 pagination | TB-2 |
| TB-C5 | 에러 route 방출 400/401/403/404/409/422/500 → BackendErrorCode 매핑 | §2 ProblemDetail·`adapter.ts:71-106` | TB-3 |
| TB-C6 | CRUD 균일화 + bulk delete(멀티행) + revisionEntityName passthrough | §2 CRUD·§4 bulk 불일치 | TB-4 |
| TB-C7 | M2O round-trip: GET 중첩{id,title}→라벨→save flatten `<name>Id` (RV-R13 회귀류) + bare-id 참조해석 | §3 R7·`many-to-one-field.ts:79-84`·`adapter.tsx:13-53` | TB-5 |
| TB-C8 | full-set route 계약 스위트(5메서드 × 대표엔티티 × wire 변형) | §4·`backend-contract.spec.ts` | TB-6 |
| TB-C9 | 전용 e2e 갭 폐쇄(professor/university/employee/org/staff) | §4 | TB-7 |
| TB-C10 | GA-L2 해소(#GX-1 빈AND/OR·#GX-2 24종·#W6-2b passthrough) 신 테스트로 종결 | §2·§3 | TB-6/TB-9 |
| TB-C11 | *(stretch)* `backend/rest` 레퍼런스 어댑터 + 제네릭 REST mock (ADR-0005 수용#3) | ADR-0005 §Decision5 | TB-8 |

## §6 Do-NOT (발명 게이트 · 리컨 근거)

1. GJCU 0.2 조건타입名(EQUAL_IGNORECASE/START_WITH/ID_EQUAL) 채택 금지 — v0.4=framework 0.1.0의 24종.
2. 낙관락/revision-conflict(409-on-stale) 재현 금지 — framework 0.1.0에 계약 없음·revisionEntityName=passthrough.
3. Excel export/import를 "framework 계약" 백엔드 엔드포인트로 추가 금지 — excel=클라이언트(listgrid)·excel-upload=host 데모 endpoint만.
4. upload를 listgrid API로 테스트 금지 — host `onUpload` 소유.
5. 빈 AND/OR를 **필수 방출**로 만들지 말 것(framework={})·단 listgrid의 빈 AND/OR는 **vacuous no-op으로 관용 필수**.
6. xref/address TIER2 실트래픽 충실도 과투자 금지(edustack 사용 0) — listgrid 자체 유닛 + 한계 문서화.
7. `search-form.ts` toJSON/addAndFilter/withFilter wire 시맨틱 변경 금지(EG 봉인·frozen).
8. framework에 없는 조건타입 필터 시맨틱 발명 금지 — JSON_CONTAINS/EXISTS/DATE_*는 실 시맨틱 또는 **명시적 문서화 no-op**(§7 OQ-TB1).

## §7 Open Questions (미결 — 사용자 veto 대상·기본값=지시 "모든 API")

- **OQ-TB1**: DATE_BEFORE/DATE_AFTER/DATE_BETWEEN·JSON_CONTAINS·EXISTS·IN_RANGE/NOT_IN_RANGE·NULL_OR_* 등 in-memory store에서 시맨틱이 모호한 조건타입 — 실구현 vs 명시 no-op(계약 테스트로 오늘 동작 고정)? 기본=의미 있는 것(DATE_*/BETWEEN/IS_NULL/IS_BLANK/GT/LT류)은 구현·JSON_CONTAINS/EXISTS는 문서화 no-op(store가 평면 row라 JSON 경로 없음).
- **OQ-TB2**: NOT-그룹 + nested subFilters GA in-scope? 기본=구현(완전성). apps/sample에 멀티행 bulk-select-delete UI 실재 여부 next-session 확인(TB-4 선결).
- **OQ-TB3**: `backend/rest` 레퍼런스 어댑터(ADR-0005 수용#3) 이 페이즈 포함 vs 별도? 기본=TB-8 stretch(코어=RCM 경로 후).
- **OQ-TB0-검증**: (TB-0) edustack 실 M2O `{id,title}` 네트워크 페이로드 캡처(현재는 강한 in-code 근거·미캡처) + listgrid ViewListGrid 고급검색이 EQUAL 외 방출하는지 — 필요 시 Playwright network trace.

## §8 GA-L2 해소 매핑

Phase TB 완료 시 GA-L2 실백엔드 gated 항목이 **구축으로 종결**: #GX-1(빈 AND/OR 관용=TB-C2 테스트)·#GX-2(24종=TB-C1 테스트)·#W6-2b(M2O passthrough=TB-C7·xref/address=실트래픽 0으로 한계 문서화). R7 수정(RV-R13)=TB-C7 round-trip 회귀로 실증. → GA-L2는 "실 소비자 대기"에서 "충실 테스트 백엔드 오라클로 증명"으로 전환.
