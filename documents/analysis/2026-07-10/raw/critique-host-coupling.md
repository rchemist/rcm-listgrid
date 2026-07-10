> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# 심판 리포트 — 호스트 결합·이식성 (원 RCM 호스트로의 강제 결합 여부)

**심판 대상 주장**: "새 프로젝트가 원 호스트(RCM)의 아키텍처로 강제 편입된다."
**입력**: `map-providers.md`(scratchpad), `undefined/map-aux-features.md`, `documents/analysis/map-fields.md` + 직접 코드 검증(`package.json`, `ApiClient.ts`, `api/types.ts`, `form/Type.ts`, `config/EntityForm.tsx`, `config/RuntimeConfig.ts`, `menu/MenuPermissionChecker.ts`, `view/ViewListGridWrapper.tsx`, `urlState/UrlStateProvider.tsx`, `components/list/hooks/useListGridUrlState.ts`, `utils/lazy.tsx`, `message/MessageProvider.ts`, `src/listgrid/index.ts`, 전체 한글 문자열 grep).

---

## 0. 결론 먼저

주장은 **부분적으로 사실이고, 부분적으로 과장됐다.** 세 개의 이식성 계층이 뚜렷이 분리되어 있다:

1. **잘 격리된 계층** — Router/UrlState 프로바이더, `MessageServices`(sweetalert2 미노출), Next 어댑터, i18n 팩토리, excel/qr/address/api-spec/xref-price 옵트인 서브패스. 여기서는 "강제 편입" 주장이 코드로 반박된다.
2. **설정 가능하지만 원 호스트 어휘가 그대로 승격된 계층** — `RuntimeConfig`의 `endpoints`/`permissions`, `checkAdminMenuPermission`/`DEFAULT_MENU_ALIAS`. 오버라이드는 가능하지만 이름·구조 자체가 "메뉴 alias 기반 백오피스"라는 원 호스트 개념을 그대로 코어 API로 만들었다. 다만 이 게이트는 **문서가 권장하는 진입점(`ViewListGrid`/`ViewEntityForm` 직접 사용)에서는 아예 발동되지 않는다** — `ViewListGridWrapper`를 안 쓰면 회피 가능하다. 즉 "강제"라는 표현은 정확하지 않고, "레거시 호환 경로에 남은 흔적"이 더 정확하다.
3. **오버라이드 지점 자체가 없는, 코어에 하드와이어된 계층** — 백엔드 envelope/엔드포인트 관례(`{url}/search`, POST create, `PUT {url}/{id}`, bulk `DELETE {url}` + body), 정확한 한국어 에러 문자열 매칭(`'만료된 토큰 정보 입니다.'`), `SelectField`의 학원/결제 도메인 색상 맵, `Preset.tsx` 전체, `RevisionField`의 백엔드 스키마 전제. 이 계층에서는 유지보수자의 불만이 **코드로 직접 검증된다.**

가장 정확한 한 줄 요약: **"이식 불가능"이 아니라 "이식하려면 무엇을 오버라이드해야 하는지 코드를 읽어야 하고, 오버라이드 지점이 없는 부분(백엔드 envelope, 도메인 어휘)은 포크하거나 참거나 해야 한다."**

---

## 1. (a) 백엔드 계약 — 오버라이드 지점이 사실상 없는 하드와이어

### 1.1 요청 URL 관례 — REST 엔드포인트 형태가 코드에 리터럴로 박혀 있음

`config/EntityForm.tsx:676-682` (Decision #31 주석 직접 인용):

```ts
// v0.3.0+ — rcm-framework 0.1.0 endpoint 표준 (Decision #31).
//   create = POST {url}        (was POST {url}/add in 0.0.5 line)
//   update = PUT  {url}/{id}   (unchanged)
const targetUrl = renderType === 'create' ? this.getUrl() : `${this.getUrl()}/${this.id}`;
const method = renderType === 'create' ? 'POST' : 'PUT';
```

`config/EntityForm.tsx:460-475` (bulk delete):

```ts
// v0.3.0+ — rcm-framework 0.1.0 endpoint 표준 (Decision #31).
// bulk delete = DELETE {url} + RequestBody BulkDeleteRequest{ids,revisionEntityName?}.
const response = await getExternalApiDataWithError({ url, method: 'DELETE', formData: { ids: idList, ...(revisionEntityName && { revisionEntityName }) } });
```

`form/Type.ts:91-93` (검색):

```ts
// v0.3.0+ — rcm-framework 0.1.0 endpoint 표준 (Decision #31).
// 검색은 POST {url}/search (RequestBody SearchRequest). underscore prefix 거부.
const response = await callExternalHttpRequest({ url: `${url}/search`, method: 'POST', formData: searchForm, ... });
```

이 URL 패턴(`POST {url}`, `PUT {url}/{id}`, `DELETE {url}` bulk, `POST {url}/search`)은 **오버라이드 포인트가 전혀 없다** — `RuntimeConfig.endpoints`는 excel/sms/revision 등 부가 기능 URL만 재구성 가능하고, CRUD 본체 URL 패턴은 `EntityForm.getUrl()` 하나로 파생되는 고정 규칙이다. GraphQL, JSON:API, 혹은 `POST /api/v1/{entity}/create` 같은 다른 관례를 쓰는 백엔드는 이 규칙에 맞춰 URL을 재작성할 수 없고, `getUrl()` 자체를 오버라이드해도 method/suffix 조합까지는 못 바꾼다.

또한 성공 응답에 커스텀 헤더 계약도 코어에 박혀 있다(`config/EntityForm.tsx:684-688`):

```ts
overrideHeaders: new Map([
  ['X-EntityForm-Name', this.name],
  ['X-Extension-Point', extensionPoint],
]),
```

`X-EntityForm-Name`/`X-Extension-Point` 헤더로 서버가 CRUD 라이프사이클 훅(`PRE_CREATE`/`PRE_UPDATE` 등)을 디스패치한다고 가정한다 — 이건 그 자체로는 합리적으로 제네릭한 확장점 설계(`EntityFormExtension.types.ts`의 `ExtensionPoint` enum, map-providers §8에서도 "합리적으로 제네릭"이라 평가)지만, 헤더 이름 자체가 rcm-framework 전용 프로토콜이다.

### 1.2 응답 envelope — 두 세대의 원 호스트 백엔드 포맷을 동시에 흡수하도록 하드코딩

`form/Type.ts:134-168`이 스스로 남긴 주석:

```ts
// v0.3.0+ — server echo 호환:
//   0.0.5 line: payload.searchForm (deserialize)
//   0.1.0 line (Decision #31 SearchResponse): payload.searchRequest (echo only)
const echoForm = payload.searchForm ?? payload.searchRequest;
...
// list (0.0.5) 또는 content (Spring Data Page<T> / SearchResponse 0.1.0) 흡수.
const listData = payload.list || payload.content || [];
...
// pagination 메타: totalCount/totalPage (0.0.5) 또는 totalElements/totalPages (0.1.0).
const totalCount = payload.totalCount ?? payload.totalElements ?? 0;
const totalPage = payload.totalPage ?? payload.totalPages ?? 0;
```

이건 "제네릭 어댑터"가 아니라 **원 호스트가 실제로 겪은 두 세대(0.0.5 line vs 0.1.0 line / Spring Data `Page<T>`)의 백엔드 응답 포맷을 흡수하는 호환 코드**다. 세 번째 백엔드(JSON:API, tRPC, 커스텀 REST)가 오면 `list`/`content`, `totalCount`/`totalElements` 어느 쌍에도 안 걸려 조용히 `[]`/`0`으로 폴백한다 — throw 없이 빈 리스트를 렌더링하므로 신규 채택자는 "왜 항상 데이터가 없지"를 디버깅해야 한다.

단건 조회(GET)는 봉투 없이 bare entity를 반환한다고 명시(`config/EntityForm.tsx:177-179`):

```ts
// 단건 GET 도 save/list/delete 와 동일하게 ResponseData.data = backend payload (1-depth).
// rcm-framework 0.1.0 AbstractCrudController 는 GET /{id} 를 봉투 없는 bare entity 로 반환하고,
// 표준 어댑터가 { data: entity } 로 한 번 감싼다 (ApiClient envelope 계약, Issue #9).
```

즉 목록 API는 `{list|content, totalCount|totalElements, ...}`을, 단건 API는 완전히 다른 shape(bare entity)을 기대한다 — 어댑터를 짜는 쪽이 엔드포인트별로 다른 unwrap 규칙을 알아야 한다.

`ApiClient.ts:33-49`의 JSDoc은 이 envelope 계약을 명시적으로 문서화하고, 계약을 어겼을 때의 실패 모드까지 예시로 남긴 점은 **문서화 품질로는 훌륭하다**(map-providers 강점과 일치, 직접 확인). 하지만 문서화가 잘 되어 있다는 것과 계약 자체가 제네릭하다는 것은 다른 문제다 — 이건 "어떤 백엔드에도 붙는 어댑터 인터페이스"가 아니라 "RCM 백엔드의 정확한 응답 shape을 문서화한 것"이다.

### 1.3 에러 바디 shape

`api/types.ts:12-22`:

```ts
export interface IEntityError {
  error: IEntityErrorBody;
  [key: string]: unknown;
}
export interface IEntityErrorBody {
  error?: boolean | string;
  message?: string;
  fieldError?: Map<string, string[]> | Record<string, string[]>;
  [key: string]: unknown;
}
```

`fieldError`가 `Map` **또는** `Record`를 동시에 허용하는 유니온 자체가, 서로 다른 두 시기의 백엔드 직렬화 방식(Map 직렬화 vs 순수 JSON)을 한 타입으로 억지로 통합한 흔적이다. `isError(): !!(this.error || this.entityError || (this.status && this.status >= 400))`(`api/types.ts:41-43`)는 로직 자체는 합리적이나, `fieldError`의 이중 shape을 소비하는 모든 필드 검증 표시 코드가 두 shape을 모두 처리해야 한다는 부담을 그대로 물려준다.

### 1.4 검색조건(SearchForm) 와이어 포맷

`form/SearchForm.ts`의 `toJSON()`이 실제로 서버에 보내는 payload:

```ts
{
  cacheKey, page, pageSize,
  sorts: Array.from(this.sorts, ([field, direction]) => ({ field, direction })),
  filters: { AND?: FilterItem[], OR?: FilterItem[] },
  ignoreCache, viewDetail, shouldReturnEmpty, preservedFilters, quickSearchFields,
}
```

`FilterItem`(`queryConditionType`, `not`, `values` 등)의 필드명과 `AND`/`OR` 최상위 키 구조 자체가 이미 RCM 백엔드의 필터 DSL과 1:1 대응하도록 설계된 것으로 보인다(다른 백엔드가 이 정확한 JSON을 파싱하는 `SearchRequest` 컨트롤러를 짜야 한다). 이는 오버라이드가 불가능한 게 아니라(서버가 이 JSON을 파싱하는 로직을 새로 짜면 됨) **"어댑터가 필요 없는 자기서술적 포맷"이 아니라 "원 호스트 SearchRequest DTO를 그대로 직렬화하는 포맷"**이라는 뜻이다.

### 1.5 판정

**이미 opt-in 경계 뒤에 있는가? → 아니오.** 이 절 전체(1.1~1.4)는 core barrel(`src/listgrid/index.ts`)에서 무조건 로드되는 `config/EntityForm.tsx`, `form/Type.ts`, `api/types.ts`, `form/SearchForm.ts`에 있다. `configureApiClient`로 HTTP 전송(헤더/인증/베이스 URL)은 대체 가능하지만, **URL 패턴·envelope 필드명·에러 바디 shape·필터 DSL은 코드를 고쳐야 바꿀 수 있는 하드코딩**이다 — RuntimeConfig 레지스트리가 커버하는 범위 밖에 있다.

---

## 2. (b) 도메인 특화 잔재의 공개 표면 노출 여부 — 실측: 옵트인된 것과 새어든 것이 반반

`src/listgrid/index.ts`(411줄, `export` 190건)를 grep으로 직접 대조한 결과:

| 항목 | 배럴 노출 여부 | 근거 |
|---|---|---|
| `SelectField`(학원/결제 상태값 색상 맵 `ENROLLED`/`GRADUATED`/`PAID`/`UNPAID` 하드코딩, `SelectField.tsx:413-437`) | **코어에 노출** | `src/listgrid/index.ts:209` `export { SelectField }` |
| `Preset.tsx` 전체(`MarketingField`, `DeviceTypes`, `PublishStatusFieldPreset` 등 CMS/이커머스 어휘) | **코어에 노출** | `src/listgrid/index.ts:299` `export * from './components/fields/Preset'` |
| `RevisionField`(고정 필터 키 `revisionEntityId`, `AUDIT_FIELD_NAMES` 휴리스틱) | **코어에 노출** | `src/listgrid/index.ts:309` `export { RevisionField }` |
| `XrefMappingField` | **코어에 노출** | `src/listgrid/index.ts:238` |
| `XrefPriceMappingField`(가격 도메인) | **옵트인 서브패스로 분리됨** | `src/listgrid/index.ts:239` 주석 "moved to opt-in subpath `@rchemist/listgrid/xref-price` (sweetalert2 peer)" — 실제로 격리 |
| `AddressMapField`/`PostCodeSelector`/`KakaoMap`(카카오맵, 다음 우편번호) | **옵트인 서브패스로 분리됨** | `src/listgrid/index.ts:255-264` 주석 — `@rchemist/listgrid/address`, "정적으로 인스턴스화하므로 메인 바렐에 두면 peer가 딸려온다"고 명시 |
| SMS 발송 이력(`PhoneNumberField` 내 `enableSms`, `registerPhoneNumberSmsHistoryInject`) | **필드 자체는 코어에 있으나 기능은 이중 게이트** | `PhoneNumberField.tsx:35` `enableSms ?? false`(기본 비활성) + `extensions/FieldExtensions.ts`의 `registerSmsHistoryField` 호출 필요 — 실사용까지 2단계 명시적 opt-in 필요, 이 부분은 **설계가 합리적**(map-providers §8 평가와 별개로, 실제 게이트 확인) |
| sweetalert2 | **코어에 미노출** | `grep -rln sweetalert2 src` → `index.ts`(타입 참조만), `api/ViewApiSpecification.tsx`, `xref-price.ts`, `api-spec.ts` — 전부 옵트인 서브패스, `MessageServices`(`message/MessageProvider.ts:10-18`)는 `unknown` opaque 계약으로 sweetalert2를 전혀 노출하지 않음 |

**판정**: "도메인 잔재가 옵트인 뒤에 숨었는가"라는 질문에 대해, 라이브러리는 **일관되지 않은 두 정책을 동시에 쓰고 있다.** 무거운 npm 의존성이 걸린 것(Kakao SDK, Daum 우편번호, xref-price의 sweetalert2)은 서브패스로 격리하는 규율을 지켰지만, **의존성이 안 걸리고 그냥 문자열/로직만 도메인 특화인 것(SelectField 색상 맵, Preset.tsx, RevisionField 스키마 가정)은 격리 기준에서 빠져 코어에 그대로 남았다.** 즉 "무거운 peer 분리"라는 실용적 동기는 있었지만 "도메인 오염 제거"라는 이식성 동기는 없었다 — 옵트인 경계의 설계 원칙이 "번들 크기"였지 "제네릭성"이 아니었다는 뜻이다.

---

## 3. (c) 인프라 가정

### 3.1 Next.js — 대체로 잘 격리됨, 예외 1건

`grep -rln "from 'next" src/listgrid`(adapters/next 제외) 결과 **0건**. `utils/lazy.tsx`가 "Drop-in replacement for `next/dynamic`"이라 주석을 달았지만 실제로는 `React.lazy` + `Suspense`로 구현된 Next-무관 코드다(직접 확인, `utils/lazy.tsx:1,20-34`). Router/UrlState 프로바이더도 Next 타입을 노출하지 않는 순수 인터페이스(`router/types.ts`, `urlState/types.ts`)다. **이 부분은 "framework-free" 표방에 값한다.**

예외: `view/ViewListGridWrapper.tsx`/`ViewEntityFormWrapper.tsx`가 여전히 `'use client'` 지시어와 Next 스타일 `dynamic()` 호출 패턴(실체는 `utils/lazy`)을 갖고 있다 — 동작에는 문제없으나 두 Wrapper가 "Next 프로젝트에서 옮겨온 코드"라는 인상을 준다. 다만 이 두 Wrapper는 앞서 언급했듯 공식 quick-start 경로가 아니다(§4 참고).

### 3.2 nuqs / URL 상태 — 계약은 옵트인, 강제 호출 버그 1건 존재

`package.json` peerDependenciesMeta 확인 결과 `nuqs`/`next` 모두 **`optional: true`**(직접 확인, package.json:170행대 근처). `UrlStateProvider`(`urlState/UrlStateProvider.tsx:1-28`)도 nuqs 타입을 전혀 노출하지 않는 제네릭 Context다.

그러나 `components/list/hooks/useListGridUrlState.ts:109-121`을 직접 읽은 결과, `urlSync.enabled`가 `false`여도 `useQueryStates(...)`가 **무조건 호출**된다:

```ts
const isEnabled = resolvedOptions.enabled ?? false;
...
const [urlState, setUrlState] = useQueryStates({ page: parseAsPage, ... }, { history: 'replace', shallow: true });
```

`useQueryStates`는 `mustUrlState()`(`UrlStateProvider.tsx:16-27`)를 거치므로, `UrlStateProvider`로 앱을 감싸지 않으면 **URL 동기화를 아예 안 쓰는 소비자도 즉시 throw**한다. 이건 "URL 상태는 옵트인"이라는 설계 의도(nuqs가 optional peer)와 실제 구현(Provider 부재 시 무조건 예외) 사이의 불일치이며, map-list-runtime의 주장을 코드로 재확인했다. **개별 기능은 옵트인이지만 관문(Provider)은 강제된다**는 패턴 — 이 리포에서 반복되는 결함 유형이다.

### 3.3 메뉴-alias 권한 개념 — 강제 아님, 문서 권장 경로 밖의 레거시

`menu/MenuPermissionChecker.ts:8-39`, `view/ViewListGridWrapper.tsx:91-94` 확인 결과 `checkAdminMenuPermission({ url, alias: DEFAULT_MENU_ALIAS })`는 **`ViewListGridWrapper`/`ViewEntityFormWrapper`를 사용할 때만** 호출된다. 그런데 `docs/getting-started.md:349-359`이 제시하는 표준 사용 예시는 `ViewListGrid`/`ViewEntityForm`(Wrapper가 아닌 원본 컴포넌트)을 직접 렌더링하는 코드다:

```ts
import { ViewListGrid, ViewEntityForm, ListGrid } from '@rchemist/listgrid';
return <ViewListGrid listGrid={new ListGrid(form)} />;
```

즉 **공식 온보딩 경로는 메뉴-alias 게이트를 아예 거치지 않는다.** `checkAdminMenuPermission`/`DEFAULT_MENU_ALIAS`은 원 호스트가 쓰던 `*Wrapper` 컴포넌트에 남아있는 레거시이지, 신규 채택자가 반드시 통과해야 하는 관문이 아니다. **map-providers의 "모든 ViewListGrid/ViewEntityForm 페이지에서 호출된다"는 서술은 부정확하다** — 정확히는 "Wrapper 계열을 쓰는 페이지에서만" 호출된다. 다만 이는 오히려 **다른 문제**를 드러낸다: 두 개의 병렬 진입점(`ViewListGrid` vs `ViewListGridWrapper`)이 공개 API에 공존하고, 어느 쪽이 "권장"인지 타입 수준에서 구분되지 않으며, 원 호스트에서 이관하는 프로젝트는 익숙한 이름(`*Wrapper`)을 골랐다가 의도치 않게 admin-menu 권한 게이트와 5초 세션 타임아웃, 하드코딩된 한국어 콘솔 경고(`view/ViewListGridWrapper.tsx:73-81`)까지 딸려오는 것을 모르고 채택할 위험이 있다.

기본값은 여전히 위험하게 설정되어 있다: `DEFAULT_CHECKER: MenuPermissionChecker = () => 'ALL'`(`MenuPermissionChecker.ts:27`)이라 `registerMenuPermissionChecker`를 안 부르고 Wrapper를 쓰면 권한 체크가 조용히 전면 허용 상태가 된다 — 경고 로그조차 없다(`registerSignOut`/`configureMessages` 등 다른 registry는 최소 console.warn을 낸다는 점과 대비된다, 직접 대조 확인: `MessageProvider.ts:21-45`의 `DEFAULT`는 전부 `console.warn`).

### 3.4 자산 서버 URL — 원 호스트 흔적이 남은 기본값

`misc/index.ts:423-425`(직접 확인):

```ts
export const ASSET_SERVER_URL: string =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ASSET_SERVER) ||
  'http://127.0.0.1:8320';
```

환경변수 미설정 시 원 호스트 로컬 개발 서버로 추정되는 `127.0.0.1:8320`이 그대로 남아있다. `configureAssetServerUrl`로 오버라이드 가능하지만, 오버라이드를 안 하면 이 값이 살아있다는 것 자체가 "제네릭 라이브러리로 처음부터 설계된 게 아니라 호스트 코드를 그대로 뽑아온 것"의 직접 증거다.

### 3.5 Excel 다운로드 로깅 — 옵트아웃 스위치 부재 (직접 확인)

`transfer/Provider/ExcelProvider.ts:20-36`을 직접 읽은 결과, `logExcelDownload()`는 `getEndpoint('excelDownloadHistory')`(기본값 `/excel-download-history/add'`, `RuntimeConfig.ts:79`)로 무조건 POST하며, 이를 끄는 옵션(예: `endpoints.excelDownloadHistory = null`)이 코드 어디에도 없다. try/catch로 실패는 삼켜지지만(`ExcelProvider.ts:34-36`) **네트워크 요청 자체는 항상 발생**한다. 다만 이 기능은 애초에 `excel.ts` 옵트인 서브패스 뒤에 있으므로(§2 표 참고), "Excel export 기능을 쓰기로 한 프로젝트" 안에서의 옵트아웃 부재이지, 코어 전체의 문제는 아니다 — 카테고리를 정확히 하면 "(c) 인프라 가정 중, 옵트인 기능 내부의 옵트아웃 부재"다.

### 3.6 판정 요약

| 인프라 가정 | 이미 옵트인 경계 뒤인가 | 근거 |
|---|---|---|
| Next.js | **예** (adapters/next로 완전 격리, 코어에 `next` import 0건) | §3.1 |
| nuqs | **경계 설계는 있으나 강제 호출 버그로 실질 미격리** | §3.2 |
| 메뉴-alias 권한 | **부분적으로 예** (Wrapper를 안 쓰면 회피됨, 다만 공개 API에 위험한 기본값과 함께 공존) | §3.3 |
| 자산 서버 URL | **오버라이드 가능하나 기본값에 원 호스트 흔적** | §3.4 |
| Excel 다운로드 로깅 | **옵트인 기능 내부에서 옵트아웃 불가** | §3.5 |

---

## 4. (d) UX 가정

### 4.1 sweetalert2 — 코어에 강제되지 않음(직접 반증)

`MessageServices`(`message/MessageProvider.ts:10-18`)의 7개 메서드 시그니처가 전부 `options: unknown`이며, 기본 구현(`DEFAULT`, `:21-45`)은 sweetalert2를 전혀 참조하지 않고 `console.warn` 노옵으로 대체된다. `grep -rln sweetalert2 src`의 4개 히트 전부 옵트인 서브패스(`api-spec.ts`, `xref-price.ts`, 그 안의 컴포넌트)에 국한된다(직접 확인). **"sweetalert2가 UX를 강제한다"는 가정은 코어 기준으로는 사실이 아니다** — sweetalert2를 실제로 렌더링하는 구현체는 호스트가 `configureMessages`에 주입해야 하며, 라이브러리 자체는 알지 못한다.

### 4.2 한국어 UI 문자열 — 코어 로직 깊숙이 침투 (가장 심각한 (d) 항목)

`grep -rl "[가-힣]"`로 비-테스트 `.ts`/`.tsx` 파일을 전수 조사한 결과, **총 300개 파일 중 221개(약 74%)에 한글 문자열이 존재**한다(직접 실행 확인). 문제는 이게 단순히 라벨/헬프텍스트 수준이 아니라는 점이다. `config/EntityForm.tsx:194-195`:

```ts
if (e instanceof Error && e.message === '만료된 토큰 정보 입니다.') {
  throw new Error('만료된 토큰 정보 입니다.', { cause: e });
}
```

이는 **에러 메시지를 정확한 한국어 문자열 일치로 판별**해 토큰 만료 흐름을 분기하는 코드다. `i18n.ts`(`configureTranslator`)는 UI 라벨 번역용이지, 이 에러 판별 로직과는 전혀 무관하다 — 즉 이 분기는 (1) 반드시 한국어 백엔드여야 하고, (2) 반드시 이 정확한 문구(`'만료된 토큰 정보 입니다.'`)를 반환해야 동작한다. 영어 백엔드, 혹은 같은 한국어라도 "토큰이 만료되었습니다" 같은 다른 표현을 쓰는 백엔드에서는 이 분기가 조용히 무력화된다 — 무력화돼도 크래시는 안 나고 그냥 일반 에러 처리(`'데이터를 조회할 수 없습니다.'`, 역시 하드코딩 한국어, `EntityForm.tsx:198`)로 빠지므로 **버그 발생이 티가 안 난다.**

같은 파일, `config/EntityForm.tsx:457`도 `'삭제할 대상이 없습니다.'`처럼 삭제 검증 실패 메시지가 하드코딩되어 있고 i18n 계약을 우회한다.

이는 map이 지적한 "ViewListGridWrapper의 5초 타임아웃 한국어 콘솔 경고"보다 한 단계 더 심각하다 — 그건 UI 계층의 로그였지만, 이건 **`EntityForm.initialize()`라는, 모든 폼 진입 시 실행되는 코어 로직 안의 에러 판별 분기**다.

### 4.3 판정

| UX 가정 | 이미 옵트인 경계 뒤인가 | 근거 |
|---|---|---|
| sweetalert2 | **예 — 코어는 opaque `unknown` 계약** | §4.1 |
| 한국어 UI 문자열(라벨/헬프텍스트) | **부분적** — i18n.ts로 번역 가능한 영역과, 애초에 i18n 밖에서 하드코딩된 영역이 혼재 | §4.2 |
| 한국어 에러 문자열 매칭(로직 분기) | **아니오 — 코어 로직에 하드와이어, 오버라이드 지점 없음** | §4.2 (`EntityForm.tsx:194`) |

---

## 5. "제네릭 코어"의 최소 컷 — 무엇을 남기고 무엇을 드러내야 하는가

이번 조사에서 직접 확인한 사실을 근거로, 제네릭 코어에 남아야 할 것과 옵트인/어댑터로 밀어내야 할 것을 나눈다.

### 5.1 이미 코어 자격이 있는 것 (그대로 유지)

- Router/UrlState 프로바이더 인터페이스(`router/types.ts`, `urlState/types.ts`) — Next 비의존 확인됨.
- `MessageServices`/`i18n.ts`의 opaque 계약 — sweetalert2/특정 UI 킷 비노출 확인됨.
- `FormField` 추상 계층(빌더 패턴, `clone()`/`copyFields()`, `isDirty()`) — 도메인 오염 없음(map-fields §2.1, 직접 조사 범위 밖이나 map 근거 신뢰).
- excel/qr/address/api-spec/xref-price 서브패스 + `registry.ts` DI 패턴 — 무거운 peer 격리 확인됨.

### 5.2 코어에서 반드시 빼내야 하는 것 (이번에 직접 검증)

1. **에러 문자열 매칭 로직**(`EntityForm.tsx:194`) — 한국어 리터럴 비교를 `entityError.code`류의 구조화된 에러 코드 비교로 교체해야 한다. 현재는 두 번째 백엔드가 오면 **조용히 죽는 기능**(토큰 만료 리다이렉트)이 생긴다.
2. **`SelectField`의 하드코딩 색상 맵**(`SelectField.tsx:413-437`) — 코어 배럴에서 도메인 어휘(`ENROLLED`/`PAID` 등)를 빼고, 색상 맵을 필드 생성자 옵션으로 주입받게 해야 한다.
3. **`Preset.tsx` 전체**(`src/listgrid/index.ts:299`의 `export *`) — CMS/이커머스 프리셋 모음을 코어 배럴에서 제거하고, 원한다면 `@rchemist/listgrid/presets/rcm` 같은 명시적 "원 호스트 호환" 서브패스로 이전해야 한다. 현재처럼 `export *`로 코어에 있으면 두 번째 프로젝트가 자동완성에서 이 필드들을 마주치고 오해하게 된다.
4. **`RevisionField`의 고정 필터 키/필드 세트**(`RevisionField.tsx:116-123,201-205`) — `revisionEntityId`, `AUDIT_FIELD_NAMES`를 생성자 옵션으로 주입받게 리팩터링하거나, 코어 배럴에서 빼서 옵트인 서브패스로 이전.
5. **URL 패턴/envelope 파싱**(`form/Type.ts:134-168`, `EntityForm.tsx:676-688`) — `fetchListData`/`save`/`delete`의 URL 조합·메서드·envelope 파싱을 `ApiClient`가 아니라 **별도의 "RCM backend adapter" 계층**으로 옮기고, 코어는 `{ buildListUrl, buildSaveRequest, parseListResponse, parseErrorResponse }` 같은 함수형 계약만 남겨야 한다. 지금은 이 로직이 `ApiClient`(전송)와 뒤섞이지 않고 `EntityForm`/`PageResult` 안에 직접 박혀 있어, **`configureApiClient`를 아무리 다르게 구현해도 URL 패턴과 envelope 파싱 자체는 바꿀 수 없다** — 이게 이번 조사에서 발견한 가장 근본적인 결합이다.

### 5.3 두 번째(비-RCM) 참조 백엔드 어댑터를 만들려면 필요한 것

실측한 계약을 그대로 나열하면, 두 번째 어댑터는 최소한 다음을 구현/우회해야 한다:

- `POST {baseUrl}/search` — body는 `SearchForm.toJSON()` 형태(`{page, pageSize, sorts:[{field,direction}], filters:{AND,OR}, ...}`)를 그대로 받아 파싱하거나, **코어의 §5.2-5 리팩터링이 선행되지 않는 한 이 정확한 JSON을 파싱하는 컨트롤러를 백엔드에 새로 만들어야 함**.
- 응답은 `{list 또는 content, totalCount 또는 totalElements, totalPage 또는 totalPages}` 중 한 쌍을 만족해야 함(`form/Type.ts:150-158`).
- `GET {baseUrl}/{id}`는 **봉투 없는 bare entity**를 반환해야 하고, `ApiClient` 구현체가 `{ data: entity }`로 감싸야 함(`EntityForm.tsx:177-179`).
- `POST {baseUrl}`(create) / `PUT {baseUrl}/{id}`(update) — 성공 시 `response.data.id`가 있어야 함(`EntityForm.tsx:693`).
- `DELETE {baseUrl}`(bulk, body `{ids, revisionEntityName?}`) — revision 기능을 안 써도 이 필드명 존재를 감안한 파서가 필요.
- 검증 실패 시 `IEntityError { error: { message?, fieldError?: Map|Record } }` shape.
- `X-EntityForm-Name`/`X-Extension-Point` 헤더 — 서버 훅 디스패치를 안 쓰더라도 헤더 자체는 항상 전송되므로 무시하거나 로그만 하면 됨(이건 어댑터 부담 아님, 서버가 무시하면 그만).
- `checkAdminMenuPermission`을 등록하지 않을 것이라면 `ViewListGridWrapper`/`ViewEntityFormWrapper` 대신 `ViewListGrid`/`ViewEntityForm`을 직접 사용(§3.3) — 이건 어댑터가 아니라 "어떤 컴포넌트를 쓸지"의 문서화 문제.
- `RevisionField`/`Preset.tsx`류 도메인 특화 필드는 아예 안 쓰면 그만이지만, 코어 배럴에 있는 한 타입 표면(`SelectField`의 색상 맵 등)에서 계속 마주치게 됨.

**결론**: 서브패스/프로바이더 계층(80% 이상)은 실제로 두 번째 백엔드·두 번째 프레임워크에 이식 가능한 수준으로 이미 설계돼 있다. 그러나 **CRUD의 심장부(URL 관례, envelope 파싱, 에러 문자열 매칭)는 어댑터 계약으로 뽑혀 있지 않고 `EntityForm`/`PageResult`에 직접 박혀 있어서, 두 번째 백엔드를 붙이려면 "RCM 백엔드와 동일한 API 계약을 구현"하거나 "라이브러리 코어 소스를 포크"하는 두 선택지만 남는다.** 이것이 유지보수자가 느낀 "새 프로젝트가 원 호스트 아키텍처로 강제 편입된다"는 불만의 가장 근본적이고 고치기 어려운 근거이며, 나머지(메뉴-alias, 자산 서버 URL, Excel 로깅)는 상대적으로 지엽적이고 이미 부분적으로 완화돼 있다.
