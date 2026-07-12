# W7 봉인 후 갭 분석 — 0.4 프레임워크 정합 + parity (2026-07-12)

> **generated-by**: 3개 검증 워크플로우(descope-classify · capability-gaps · backend-alignment)의 합성. 각 능력 판정은 **적대적 재검증(refute 시도) + git 고고학**을 거쳤고, 핵심 주장(SearchForm withFilter 부재·GJCU OR 사용·프레임워크 SearchRequest 계약)은 **메인 세션이 직접 grep/read로 재확인**(file:line). 소비자 레포 실측: GJCU(`~/dev/gjcu-academic-backend/gjcu-academic-front`)·edustack(`~/dev/edustack`)·프레임워크(`~/dev/rcm-backend-framework` 0.1.0). raw 워크플로우 산출은 세션 transcript.
>
> **맥락**: `/progress`로 W7-4/W7-5를 봉인하고 "Phase EG 완료"로 보고한 직후, 사용자가 제거된 공개 표면(§Needs Review #W7-4 descope)의 처분을 물으며 **#3 SSR 프록시·#4 SearchForm 검색이 온전한지** 재조사를 지시. 조사 결과 봉인이 **부분적으로 과했음**이 드러남(아래 §4·§5). 후속으로 사용자가 **"0.4는 rcm-backend-framework 0.1.0 기준(GJCU 0.2 아님)"** 제약을 추가.

## 확정 결정 (사용자, 2026-07-12)

1. **위젯/필드 = descope** — 필요 시 나중에 추가. CAP-29 편입.
2. **유틸 = 새 `/utils` 패키지 + 전량 이식** — RequestUtil/EntityError만 제외(죽은 코드).
3. **SearchForm `withFilter` = 완전 부활** — `withFilter('AND'|'OR', ...items)` 0.3 시그니처 그대로.
4. **타이밍 = GA-blocking** — 0.4.0 GA 전 처리. Phase EG "봉인"은 잠정 재개.
5. **wire 계약 = rcm-backend-framework 0.1.0** — apps/sample 테스트 백엔드·어댑터·SearchForm wire 모두 프레임워크 기준(edustack이 실사용 레퍼런스). GJCU 0.2는 폴백만.

## rcm-backend-framework 0.1.0 = wire 계약 source-of-truth

- **List = `SearchResponse<T>`**(record, @JsonInclude NON_NULL): `{content, page, pageSize, totalElements, totalPages, sorts, searchRequest, attributes, errors}`. **Spring Data Page 아님**(pageable/number/numberOfElements 없음·"0.0.5 ResponseListWrapper 1:1 흡수"). `SearchResponse.java:51-61`, `AbstractCrudController.java:137-152`.
- **단일 GET = bare 엔티티**(envelope 없음·`{success,data,error}` 폐기=Decision#1). `ProblemDetailAdviceTest.successResponse_isRawPassthrough_noEnvelope:164-175`.
- **Search = `SearchRequest`**: `{page, pageSize, operator, filters: LinkedHashMap<LogicalOperator,List<FilterItem>>, sorts, quickSearchFields, searchTerm, viewDetail, exactMatch, ...}`. `filters`는 **연산자 키 맵** `{"AND":[...],"OR":[...],"NOT":[...]}`. `SearchRequest.java:54-71`, `SearchRequestJacksonTest.java:47-66`.
- **FilterItem** = `{name(필수), value?, values?, queryConditionType?(기본 EQUAL), not?, subFilters?: {[op]: FilterItem[]}(중첩 그룹), joinType?}`. `FilterItem.java:46-56`.
- **QueryConditionType = 24종**: EQUAL/NOT_EQUAL/IN/NOT_IN/LIKE/NOT_LIKE/GREATER_THAN/GREATER_THAN_EQUAL/LESS_THAN/LESS_THAN_EQUAL/BETWEEN/IS_NULL/IS_NOT_NULL/… `QueryConditionType.java:38-81`.
- **에러 = RFC7807 ProblemDetail**: `{status, title, detail, type, code, field, errors, fieldErrors, traceId, tenantId}`. `ProblemDetailAdviceTest.java:78-95`.

## §3 API SSR 프록시 — **깨지지 않음**(초판 missing → 검증 partial-gap)

- 프록시 구현체는 **0.3에서도 항상 소비자 소유**(GJCU `backend-proxy.ts` 497줄·Next route handler·쿠키/세션/에러 sanitize). 라이브러리는 `serverProxy` 플래그+DI seam만 제공.
- 0.4는 `createRcmAdapter`의 **주입식 `fetch` + `baseUrl`**로 재현 가능(오히려 더 중앙집중)·`apps/sample`이 same-origin route 실증. `backend-rcm/src/adapter.ts:113-136`, `packages/react/src/providers/adapter.tsx`.
- **진짜 갭 = 문서/결정**: MIGRATION "`./api` 완전 대체"가 "프록시 자동 승계" 오해 유발·어떤 CAP/ADR도 `fetch`+`baseUrl`을 프록시 seam으로 명시 안 함. → 스펙 §6.2/ADR 애드덤 + 워크드 예제(~0.5일).
- **별개**: `getExternalApiData` 계열(SMS·캐시클리어 등 임의 백엔드 호출)은 0.4 범용 대응 無 — 그 UI 컴포넌트 이식 여부와 얽힌 별도 feature-parity 문제.

## §4 SearchForm 검색 — 코어 정상, **withFilter parity 갭(무변경 오표기·확인됨)**

- **검색 코어 작동**: SearchForm→POST /search→렌더 실브라우저 E2E 실증(`e2e/college.spec.ts:87-100`)·어댑터 배선 확인.
- **빠진 헬퍼 3종**(getQueryConditionTypes 등) = 안 쓰이는 RuleField 연산자 UI sugar → **버린 게 맞음**(descope).
- **진짜 갭**: 0.4 SearchForm엔 `addAndFilter(item)`(AND 단건)만 있고 **`withFilter('AND'|'OR',...items)`·`addOrFilter`·`withFilterIgnoreDuplicate` 부재**. GJCU 실사용 `.withFilter` **~72곳(AND 65 + OR 7·가변인자 다건)** — OR 필터 7곳은 0.4서 빌더로 표현 불가. git 이력: search-form.ts 첫 커밋부터 addAndFilter-only(2026-07-10 23:11)인데 14h 뒤 spec이 "무변경"이라 적음(2026-07-11 13:34)·W1~W7 전 리뷰 통과·봉인 11분 전 MIGRATION 진입.
- **확인된 거짓 문서**: `spec §9:370` + `MIGRATION:66` = "무변경 · 이름·시그니처 불변" → **정정 필수**.

## §5 백엔드 정합 — **프레임워크 shape(0.2 아님)·부분 충실도 갭**

정렬됨: apps/sample 전 route `content/totalElements/totalPages`·단일 GET bare·어댑터 프레임워크 primary(0.2=`??`폴백·adapter.test.ts:49-67 legacy). SearchForm.toJSON `{page,pageSize,sorts,filters:{AND,OR}}`=프레임워크 flat AND/OR 일치.

갭(GA 전 정합):
- **(a)** mock `searchEnvelope` `page/pageSize/sorts/attributes/errors` 누락 — `envelope.ts:13-25` vs `SearchResponse.java:51-61`.
- **(b)** `FilterItem.subFilters` flat 배열 → 중첩 그룹 `(a OR b) AND c` 불가 — `search-form.ts:34` vs `FilterItem.java:52`.
- **(c)** `filters` `{AND,OR}` 하드코딩 → NOT 없음 — `search-form.ts:42`.
- **(d)** `cacheKey` wire 유출(SearchRequest 필드 아님·엄격 Jackson 거부 위험) — `search-form.ts:38,132`. (0.3.22도 cacheKey+preservedFilters 유출·동일 위험).
- **(e)** QueryConditionType 12/24(BETWEEN·IN_RANGE·DATE_* 등 누락) — `search-form.ts:14-26`. (0.4는 프레임워크 名 subset이라 0.3.22의 divergent 名[GREATER/NULL/START_WITH]보다 오히려 정합↑).
- **(f)** mock 404 `{error:{message}}` → RFC7807도 어댑터 파서(top-level `message`)도 불일치 → 404 메시지 삼켜짐 — `envelope.ts:27-29`, `adapter.ts:45-48`.
- **(g)** employee·collabo search route가 `filters` 무시 — `employee/search/route.ts:8-14`·`collabo/search/route.ts:8-15`.
- **(h)** "Spring Page" 오명칭 주석(실제=custom SearchResponse) — `envelope.ts:5`·`adapter.ts:27`.

edustack 교차확인: 백엔드가 `AbstractCrudController`/`SearchRequest`/`SearchResponse` 직접 사용=계약 실증. 단 edustack 실사용은 `queryConditionType:'EQUAL'`만·generic AdvancedSearchForm 미사용 → (e) 조건타입 divergence는 실사용상 dormant. edustack도 ProblemDetail 에러 미판독(list-fetch가 하드코딩 폴백 메시지).

## GA-blocking 백로그 (실행급 태스크 — PROGRESS §Phase GX)

- **GX-1 SearchForm wire 완전 정합** — `withFilter('AND'|'OR',...items)`+`withFilterIgnoreDuplicate` 복원(결정3)·`FilterItem.subFilters`→`{[op]:FilterItem[]}` 중첩 맵(b)·`filters`에 NOT 키(c)·`cacheKey` wire 제거(d)·QueryConditionType 12→24(e)·quickSearch de-dup 버그. 검증: SearchRequestJacksonTest JSON과 toJSON 대조 유닛 + college E2E.
- **GX-2 apps/sample 백엔드 프레임워크 충실화** — `searchEnvelope` 9필드 완비(a)·404 RFC7807 ProblemDetail+어댑터 파서(f)·employee/collabo filters 배선(g)·"Spring Page" 주석 정정(h). 검증: E2E 30 + 어댑터 에러 경로 테스트.
- **GX-3 `/utils` 패키지 + 전량 이식**(결정2) — 새 패키지·정규식11·날짜포맷터·비교4·URL/스토리지·asset-URL·formatPrice(오라클 src/misc 기계 이식)·isEquals/isEqualCollection 배럴·RequestUtil/EntityError 제외. §2 exports+dts+attw+publint+smoke:load. **OQ 해소(2026-07-12 사용자)**: ①**날짜=자체구현·런타임 의존 0**(엔터프라이즈 판단: 의존성 최소화 철학·소비자에 date-fns 강제 금지·표준 `Intl.DateTimeFormat`/`RelativeTimeFormat`·고정포맷은 손수 짜 0.3 바이트동일·date-fns는 devDep만). ②**asset-URL=BackendAdapter 주입 base 우선 + 전역 `ASSET_SERVER_URL` 폴백**(util은 어댑터 hard import 금지·AdapterProvider가 base 주입).
- **GX-4 API 프록시 seam 문서화**(§3) — spec §6.2/ADR 애드덤에 `fetch`+`baseUrl`=프록시 seam 명시+워크드 예제·MIGRATION `./api` 행에 "serverProxy 자동 아님" 경고. 임의 외부호출(getExternalApiData)은 별도 컴포넌트-parity 트래킹.
- **GX-5 문서 정정 + descope 원장** — spec §9:370+MIGRATION:66 "무변경" 거짓 정정·정규식 "8종"→11종·widgets(QR/KakaoMap/ApiSpec/XrefPrice) CAP-29 descope 명문화·CAP 매트릭스에 프록시/조건타입 행.
