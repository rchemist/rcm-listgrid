# ADR-0005 — 백엔드 어댑터 계약: BackendAdapter + ./backend/rcm 기본 어댑터

**Status**: accepted · **Date**: 2026-07-10 · **선행**: ADR-0004(표면 창구), ADR-0003과 병행 가능
**근거**: raw/critique-host-coupling(핵심 발견 critical→high 정정), raw/critique-api-packaging §envelope(3-파일 경계 실측) · PRD 페르소나 "비RCM 백엔드 개발자"

## Context

"새 프로젝트가 원 호스트 아키텍처를 강제당한다"는 불만의 **실체가 여기다**:

- CRUD URL 관례가 하드와이어: create `POST {url}` / update `PUT {url}/{id}`(EntityForm.tsx:679-680), bulk delete `DELETE {url}`(:464-476), 검색 `POST {url}/search`(form/Type.ts:92-93) + `X-EntityForm-Name` 헤더.
- envelope 파싱이 두 세대 백엔드를 흡수하는 하드코딩: `list||content`, `totalCount??totalElements`, `searchForm??searchRequest`(form/Type.ts:144-168). 오버라이드 지점 없음 — RuntimeConfig.endpoints는 보조 경로(excel/sms/revision/asset)만 커버.
- 에러 의미 판별이 백엔드 한국어 문자열에 결합(EntityForm.tsx:194 — 검증 결과 사실상 no-op인 죽은 결합이지만, 살아있는 세션만료 판별도 `'Failed to fetch'+status 500` 신호(form/Type.ts:104-118)로 취약하긴 동일).
- 반면 검증이 확인한 **반례**: Router/UrlState/Message/Next 어댑터/옵트인 서브패스는 실제로 이식 가능. configureApiClient는 전송 계층 DI로 이미 깨끗 — 없는 것은 **의미 계층**(URL 조립·응답 해석·에러 해석)의 계약이다.

우회로(per-form onSave/overrideFetchData, URL-sniffing)는 존재하지만 "포크 없는 지저분한 우회"일 뿐 어댑터가 아니다 (critical→high 정정 사유).

## Decision

1. **`BackendAdapter` 인터페이스 신설** (schema-core 계층, React 무관):

```ts
interface BackendAdapter {
  buildEntityUrl(base: string, op: 'fetch'|'create'|'update'|'delete'|'bulkDelete'|'search', id?: EntityId): { url: string; method: ApiMethod };
  buildSearchBody(searchForm: SearchForm): unknown;                    // 현행 toJSON 로직 이사
  parseListResponse(payload: unknown): { list: DataRow[]; totalCount: number; searchForm?: unknown };
  parseEntityResponse(payload: unknown): DataRow;                      // 단건 GET/save 언랩
  parseError(response: ResponseData<any>): { code: BackendErrorCode; message: string };  // code: 'TOKEN_EXPIRED' | 'FORBIDDEN' | 'VALIDATION' | 'UNKNOWN' ...
  headers?(op: string, form: { name: string }): Record<string, string>; // X-EntityForm-Name 등
}
```

2. **`configureBackendAdapter(adapter)`** 전역 레지스트리(기존 configure* 패턴과 동형) + `EntityForm.withBackendAdapter()` 폼 단위 오버라이드 (resolution: 폼 > 전역 > 기본).
3. **기본 어댑터 = `@rchemist/listgrid/backend/rcm`**: 현행 하드코딩(URL 관례·이중 envelope 흡수·X-EntityForm-Name)을 **그대로 이사**해 rcm-backend-framework 0.1.0 어댑터로 명명. 코어의 기본값이 이 어댑터를 가리키므로 **기존 소비자는 무변경**.
4. **세션만료 등 의미 판별을 error code 기반으로**: EntityForm/Type.ts의 문자열 매칭을 `parseError().code === 'TOKEN_EXPIRED'` 분기로 교체. rcm 어댑터가 현행 신호(문자열/status)를 code로 번역한다. EntityForm.tsx:194의 죽은 한국어 리터럴 분기는 삭제.
5. **generic REST 레퍼런스 어댑터** (`backend/rest`): GET /?page=&size=, 표준 JSON 배열+헤더 totalCount 관례의 최소 구현 — 계약의 실용성 증명 + 문서 예제용.

## 기각한 대안

- **GraphQL/tRPC 어댑터 동시 제공** — 수요 검증 전 과투자. 계약이 견고하면 커뮤니티/후속 작업으로 가능(장기 비전 유지, 구현은 보류).
- **방어적 이중 언랩(`data.data ?? data`) 유지** — issue #9에서 이미 기각된 설계(오인 추출 위험). 어댑터별 단일 규약이 정답.

## Consequences

- form/Type.ts(PageResult)·EntityForm의 fetch/save/delete 경로가 어댑터 호출로 재배선된다 — ADR-0002 단계 2(값/메타 분리)와 파일이 겹치므로 **로드맵에서 순서 조율 필수**(P6은 P5 완료 후).
- RuntimeConfig.endpoints(보조 경로)는 유지 — 어댑터는 CRUD 의미 계층만 담당. 중복되는 항목이 생기면 어댑터 우선.

## 구현 계획

1. 인터페이스 + 레지스트리 + rcm 어댑터(현행 로직 이사, 동작 무변경) — 특성화 테스트로 동등성 고정
2. EntityForm/Type.ts 호출부 재배선 (5개 경로: initialize/save/delete/bulkDelete/search)
3. 에러 코드 계층 + 세션만료 재배선 + 죽은 리터럴 삭제
4. backend/rest 레퍼런스 + getting-started "비RCM 백엔드 연결" 챕터
5. exports 맵에 `./backend/rcm`, `./backend/rest` 추가

규모: 3~4pw. 1~3은 sonnet 실행 가능(특성화 테스트 전제), 계약 설계 리뷰만 opus.

## 수용 기준

- [ ] rcm 어댑터 기본값에서 기존 소비자 시나리오(초기 fetch/save/delete/search/서브컬렉션) 특성화 테스트 전량 green — **동작 무변경**
- [ ] `grep -rn "'/search'\|X-EntityForm-Name\|totalElements\|만료된 토큰" src/listgrid/config src/listgrid/form` → backend/rcm 어댑터 파일 밖 0건
- [ ] backend/rest 어댑터 + json-server급 목업으로 리스트+폼 e2e 시나리오 통과 (examples 또는 테스트 픽스처)
- [ ] 세션만료가 error code로 판별되고, rcm 어댑터가 구 신호를 code로 번역함을 단위 테스트로 고정

## 부록 A — SSR 프록시 seam (GX-4, 2026-07-13)

**맥락**: 0.3.x `./api`(`ApiClient`+`serverProxy` 플래그)는 "브라우저가 백엔드를 직접 호출하지 않고 전부 백엔드 SSR 프록시 경유"라는 보안 속성을 지탱했다. 단 **프록시 구현체(Next.js route handler·쿠키/세션 포워딩·에러 sanitize)는 항상 host 소유**였고, 라이브러리는 DI seam + `serverProxy` 신호만 제공했다(GJCU `backend-proxy.ts`가 그 host 코드). MIGRATION의 "`./api` 완전 대체" 문구가 "프록시 보안이 0.4에서 자동 승계된다"는 오해를 줄 수 있어 seam을 명문화한다.

**결정 — 0.4의 프록시 seam = `RcmAdapterOptions.{fetch, baseUrl}`**. 전 CRUD(list/getOne/create/update/remove)가 단일 `request()`→단일 `doFetch`를 경유하므로, host가 프록시 라우팅을 재현하는 방법은 둘:
1. **`baseUrl`을 same-origin 프록시 경로로** (예: `createRcmAdapter({ baseUrl: '/api/proxy/backend' })`) — 가장 단순. `apps/sample`이 same-origin route 배선을 실증.
2. **`fetch` 주입으로 URL 재작성** — 0.3.x `serverProxy` per-call 시맨틱(일부 경로만 프록시 우회)이 필요하면, 커스텀 `fetch`가 URL 패턴을 보고 same-origin 프록시로 재작성 or 우회한다(GJCU `ProxyInterceptor.shouldSkipProxy`와 구조 동일). 실제 프록시 route handler는 **여전히 host 소유**(0.3과 동일 — 라이브러리는 route handler를 제공하지 않음).

```ts
// worked example — serverProxy 스타일 라우팅을 fetch 주입으로 재현
const proxyFetch: typeof fetch = (input, init) => {
  const url = String(input);
  const skip = /^https?:\/\//.test(url) || url.startsWith('/api/'); // 이미 절대/프록시 경로면 우회
  const target = skip ? url : `/api/proxy/backend?path=${encodeURIComponent(url)}`;
  return fetch(target, init);
};
const adapter = createRcmAdapter({ baseUrl: '', fetch: proxyFetch });
```

**미해결(별도 트래킹)**: `getExternalApiData`/`callExternalHttpRequest` 계열(SMS 발송·캐시 클리어 등 CRUD 밖 임의 백엔드 호출)은 0.4 `BackendAdapter`에 범용 대응이 없다(좁은 `CustomOptionProvider.fetchOptions` seam만 존재). 이는 해당 UI 컴포넌트 이식 여부와 얽힌 **컴포넌트-parity 문제**로, 본 프록시 아키텍처와 분리해 다룬다. **asset-URL** 리졸브도 어댑터 base 주입(`setAssetServerBase`)이 미배선(GX-3 §Needs Review) — `RcmAdapterOptions`에 `assetBaseUrl` 필드 추가 여부는 후속 스펙 결정.
