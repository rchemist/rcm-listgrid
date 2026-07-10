> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# 서브시스템 지도: 프로바이더 · 어댑터 · 전역구성 계층

대상: `src/listgrid/auth/**`, `src/listgrid/ui/**`, `src/listgrid/router/**`, `src/listgrid/urlState/UrlStateProvider.tsx`, `src/listgrid/message/**`, `src/listgrid/loading/**`, `src/listgrid/menu/**`, `src/listgrid/api/**`, `src/listgrid/extensions/**`, `src/adapters/next/**`, `src/listgrid/config/RuntimeConfig.ts`, `src/listgrid/utils/i18n.ts` (+ 관련 모듈 전역 참조 확인을 위해 `src/listgrid/misc/index.ts`, `src/listgrid/store/index.ts`, `src/listgrid/transfer/**`, `src/listgrid/utils/simpleCrypt.ts`, `src/listgrid/view/ViewListGridWrapper.tsx`, `docs/getting-started.md` 를 보조로 열람)

---

## 1. 요약 판정

호스트 통합 계약은 **"6개 계약"이라는 공식 설명(`docs/getting-started.md:52-63`)보다 실제로는 훨씬 크고 누더기(accreted)에 가깝다.** React Context 기반 프로바이더 4개(Auth/UI/Router/UrlState)는 설계가 깔끔하고 일관되지만, 그 옆에 **모듈 전역(`let` 변수) 기반 `configure*`/`register*` 싱글턴이 최소 15개** 흩어져 있고 이 중 11개는 공식 온보딩 문서에 전혀 언급되지 않는다. 인증/권한 모델은 세션 role 체크(`hasAnyRole`)는 합리적으로 제네릭하지만, 메뉴 권한 체크(`checkAdminMenuPermission` + `DEFAULT_MENU_ALIAS`)는 "메뉴 테이블에 alias가 매핑된 백오피스 CMS" 라는 원 호스트의 도메인 모델을 이름 그대로 라이브러리 코어에 박아 넣은 것으로, 범용 CRUD UI 엔진이라기보다는 "그 프로젝트의 관리자 화면 프레임워크"의 흔적이 뚜렷하다. UIProvider의 ~65개 컴포넌트 계약은 문서화가 잘 되어 있고 headless 베이스라인이 실제로 동작하는 품질이라 실사용 가능하지만, 온보딩 비용(500~1000줄의 어댑터)이 크다는 점은 문서도 스스로 인정한다. Next 어댑터는 작고 깨끗하다.

---

## 2. `configure*` / `register*` 전역 싱글턴 전수 조사

레포 전체에서 `export function configure*` / `export function register*` 시그니처를 grep한 결과:

```
src/excel.ts:29                              registerExcelDataTransfer
src/listgrid/api/ApiClient.ts:71             configureApiClient
src/listgrid/auth/SessionProvider.ts:10      registerSignOut
src/listgrid/config/RuntimeConfig.ts:125     configureRuntime
src/listgrid/extensions/FieldExtensions.ts:20  registerSmsHistoryField
src/listgrid/extensions/FieldExtensions.ts:70  registerPhoneNumberSmsHistoryInject
src/listgrid/loading/index.ts:19             configureLoading
src/listgrid/menu/MenuPermissionChecker.ts:31  registerMenuPermissionChecker
src/listgrid/message/MessageProvider.ts:49    configureMessages
src/listgrid/misc/index.ts:434               configureAssetServerUrl
src/listgrid/misc/index.ts:438               configureAssetPrefix
src/listgrid/store/index.ts:62               configureOverlayZIndex
src/listgrid/transfer/Provider/ExcelProvider.ts:48  registerExcelCrypto
src/listgrid/transfer/registry.ts:31          configureDataTransfer
src/listgrid/utils/i18n.ts:31                configureTranslator
```

**15개**. 여기에 React Context 기반 컴포넌트 프로바이더 4개(`AuthProvider`, `UIProvider`, `RouterProvider`, `UrlStateProvider`)와 렌더 트리에 수동으로 마운트해야 하는 `GlobalModalManager`(`src/listgrid/ui/GlobalModalManager.tsx:28`)까지 합치면 **호스트가 알아야 하는 통합 지점이 총 20개**에 달한다.

### 2.1 공식 문서와의 괴리

`docs/getting-started.md:52-63`은 다음 표만 제시한다:

```
| Contract | Form | Purpose |
| `AuthProvider` | React component | Session + role checks |
| `UIProvider` | React component | ~50 visual primitives |
| `RouterProvider` | React component | Framework router hooks |
| `UrlStateProvider` | React component | Query-string state sync |
| `configureApiClient` | Module-level function | HTTP transport |
| `configureMessages` | Module-level function | Toast / alert / confirm |
| `configureRuntime` | Module-level function | Dev-mode flag, crypto salt |
```

즉 "6개 계약"이라 소개하지만, 실제로는 다음 11개가 **온보딩 문서에 단 한 줄도 등장하지 않는다** (grep 결과 0건, 확인 커맨드: `grep -n "registerSignOut\|registerMenuPermissionChecker\|registerSmsHistoryField\|registerPhoneNumberSmsHistoryInject\|configureLoading\|registerExcelCrypto\|configureDataTransfer\|configureAssetServerUrl\|configureAssetPrefix\|configureOverlayZIndex\|registerExcelDataTransfer\|GlobalModalManager" docs/getting-started.md` → 결과 없음):

- `registerSignOut` (`src/listgrid/auth/SessionProvider.ts:10`) — 로그아웃 훅. 없으면 `signOut()` 호출 시 콘솔 경고만 뜨고 조용히 실패.
- `registerMenuPermissionChecker` (`src/listgrid/menu/MenuPermissionChecker.ts:31`) — 모든 `ViewListGrid`/`ViewEntityForm` 페이지 진입 시 실행되는 권한 게이트. 미설정 시 기본값이 전면 허용(`() => 'ALL'`, `MenuPermissionChecker.ts:27`)이라 **프로덕션에 배포하고도 권한 체크가 없는 상태를 눈치채기 어렵다.**
- `registerSmsHistoryField` / `registerPhoneNumberSmsHistoryInject` (`src/listgrid/extensions/FieldExtensions.ts:20,70`) — SMS 발송 이력 필드 자동 주입. 매우 도메인 특화(한국 SMS 발송 이력) 기능이 "extensions"라는 범용적 이름의 모듈에 살고 있다.
- `configureLoading` (`src/listgrid/loading/index.ts:19`) — 전역 로딩 오버레이. 미설정 시 완전 무동작.
- `registerExcelCrypto` (`src/listgrid/transfer/Provider/ExcelProvider.ts:48`) — 암호화된 엑셀 다운로드. 미설정 시 호출하면 throw.
- `configureDataTransfer` (`src/listgrid/transfer/registry.ts:31`), `registerExcelDataTransfer` (`src/excel.ts:29`) — 엑셀 가져오기/내보내기 구현체 등록.
- `configureAssetServerUrl` / `configureAssetPrefix` (`src/listgrid/misc/index.ts:434,438`) — 정적 자산 서버 오버라이드.
- `configureOverlayZIndex` (`src/listgrid/store/index.ts:62`) — 모달 z-index 베이스.
- `GlobalModalManager` — 마운트하지 않으면 `useModalManagerStore().openModal(...)`이 상태만 바뀌고 아무것도 렌더링되지 않는다(`src/listgrid/ui/GlobalModalManager.tsx:11-14` 주석이 스스로 인정).

**결론**: 프로바이더 표면은 "6개의 깔끔한 계약"이 아니라 **20개에 가까운 누적된 통합 지점**이며, 절반 이상이 공식 문서 밖에 존재한다. 신규 채택자는 실제로 무엇을 등록해야 완전한 기능을 얻는지 소스코드를 grep해야만 알 수 있다 — "framework-free generic library"라는 표방과 "누적된 확장 지점"이라는 실체 사이의 괴리가 이 계층의 핵심 문제다.

### 2.2 자산 서버 기본값에 원 호스트의 흔적이 그대로 남아있음

```ts
// src/listgrid/misc/index.ts:423-425
export const ASSET_SERVER_URL: string =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ASSET_SERVER) ||
  'http://127.0.0.1:8320';
```

환경변수가 없을 때 하드코딩된 폴백이 `http://127.0.0.1:8320` — 원 호스트 개발 서버의 로컬 포트로 추정된다. "제네릭 라이브러리"를 표방하지만 기본값이 원본 프로젝트의 로컬 환경을 그대로 반영하고 있어, 이 계층이 진짜 범용으로 설계된 것이 아니라 **원 서비스에서 그대로 추출(extract)만 된 것**임을 보여주는 직접적 증거다.

---

## 3. Auth / 권한 모델

### 3.1 `AuthProvider` / `useSession` / `hasAnyRole` — 이 부분은 잘 설계됨

`src/listgrid/auth/AuthContext.tsx:6-43`은 표준적인 React Context 패턴이다. `NO_PROVIDER` 심볼로 "프로바이더 없음"과 "세션 없음(undefined)"을 구분하는 처리(`AuthContext.tsx:10-12`)는 흔히 놓치는 엣지케이스를 제대로 잡은 좋은 설계다.

`src/listgrid/auth/index.ts:9-27`의 `hasAnyRole`도 합리적으로 제네릭하다:

```ts
export function hasAnyRole(session: Session | undefined | null, ...allowedRoles: string[]): boolean {
  if (!session) return false;
  const user = typeof session.getUser === 'function' ? session.getUser() : undefined;
  const roles = user?.roles ?? session.roles ?? (session.authentication?.roles as string[] | undefined);
  ...
}
```

세 가지 세션 shape(`getUser().roles`, `session.roles`, `session.authentication.roles`)를 모두 허용하는 것은 과도해 보일 수 있지만, 타입 정의(`src/listgrid/auth/types.ts:20-31`)에 주석으로 "원본 listgrid 사용 방식을 반영"이라 명시되어 있어 의도적 하위호환 설계로 보인다. 이 부분 자체는 정당한 절충이다.

### 3.2 `checkAdminMenuPermission` — 이름부터 호스트 특화, 제네릭 아님

```ts
// src/listgrid/menu/MenuPermissionChecker.ts:8-39
export const DEFAULT_MENU_ALIAS = 'default';
export type MenuPermissionChecker = (args: MenuPermissionCheckArgs) => PermissionType | Promise<PermissionType>;
const DEFAULT_CHECKER: MenuPermissionChecker = () => 'ALL';
let _checker: MenuPermissionChecker = DEFAULT_CHECKER;
export function registerMenuPermissionChecker(checker: MenuPermissionChecker): void { _checker = checker; }
export function checkAdminMenuPermission(args: MenuPermissionCheckArgs): PermissionType | Promise<PermissionType> {
  return _checker(args);
}
```

그리고 실제 호출부(`src/listgrid/view/ViewListGridWrapper.tsx:91-94`, `ViewEntityFormWrapper.tsx:97-99`):

```ts
const permissionType = await checkAdminMenuPermission({ url: pathname, alias: DEFAULT_MENU_ALIAS });
```

문제점:

1. **함수명이 `checkAdminMenuPermission`인데 관리자 화면이 아닌 모든 `ViewListGrid`/`ViewEntityForm`에서 호출된다.** "메뉴 alias 기반 backoffice 권한 테이블"이라는 원 호스트 CMS의 개념을 이름 그대로 코어에 심어놓은 흔적 — 제네릭 라이브러리라면 `checkPagePermission` 같은 중립적 이름이어야 한다.
2. **`alias`가 항상 `DEFAULT_MENU_ALIAS = 'default'` 고정값으로 전달된다** (`ViewListGridWrapper.tsx:93`). alias 파라미터 자체가 현재 사용처에서는 아무 의미가 없어 죽은 확장 포인트에 가깝다 — 다치명 메뉴 시스템을 염두에 뒀지만 실제로 배선되지 않은 미완성 추상화다.
3. **기본 구현이 전면 허용(`() => 'ALL'`)** 이라 `registerMenuPermissionChecker`를 호출하지 않고 배포하면 권한 체크가 사실상 없는 상태가 되는데, 이를 알리는 실행시 경고가 전혀 없다(`registerSignOut`/`configureMessages` 등 다른 모듈은 최소한 `console.warn`이라도 낸다 — 참고: `src/listgrid/message/MessageProvider.ts:22-44`). 권한이라는 보안 민감 영역에서 "미설정 시 조용히 통과"는 상업화 관점에서 위험한 기본값이다.
4. **5초 하드코딩 세션 타임아웃** (`src/listgrid/view/ViewListGridWrapper.tsx:73-81`, 동일 패턴이 `ViewEntityFormWrapper.tsx`에도 존재):
   ```ts
   if (session === undefined) {
     timeoutId = setTimeout(() => {
       console.warn('Session timeout - 5초 후에도 세션을 가져올 수 없습니다.');
       setPermissionType('NONE');
       setMounted(true);
     }, 5000);
     return;
   }
   ```
   매직 넘버 5000ms가 설정 불가능하게 박혀 있고, 한국어 하드코딩 로그 메시지가 라이브러리 코어(호스트 비의존이어야 할 계층)에 남아있다 — i18n 계약(`src/listgrid/utils/i18n.ts`)이 버젓이 존재함에도 이 경로는 그것을 우회한다.

### 3.3 결론

Auth 자체(세션 프로바이더, role 체크)는 이 리포에서 몇 안 되게 "제네릭 라이브러리"라는 이름에 값하는 설계다. 반면 메뉴 권한 계층은 원 호스트의 관리자 메뉴 시스템 개념(alias, admin 접두어, 전면허용 기본값)을 그대로 라이브러리 코어 API로 승격시킨 것이며, 유지보수자가 제기한 "permission handling이 이상하다"는 불만은 코드로 확인된다.

---

## 4. `UIProvider` ~65개 원시 컴포넌트 계약

`src/listgrid/ui/UIProvider.tsx:13-65`의 `UIComponents` 인터페이스는 실측 65개 필드(옵셔널 2개 포함)로, 문서(`docs/getting-started.md`)가 표방하는 "~50개"보다 실제로 더 많다.

### 4.1 설계 자체는 나쁘지 않다

- `useUI()` 훅이 프로바이더 부재 시 명확한 에러 메시지를 던진다(`UIProvider.tsx:80-86`) — DX가 좋다.
- `makeWrapper` 팩토리(`UIProvider.tsx:120-161`)가 Proxy를 통해 `Table.Th` 같은 compound 하위 컴포넌트를 지연 바인딩하면서, React가 컴포넌트를 클래스 컴포넌트로 오인해 경고를 내지 않도록 `REACT_INTROSPECTION_PROPS`(`UIProvider.tsx:99-118`)로 세심하게 예외 처리한 것은 실전에서 겪은 버그를 고친 흔적이 뚜렷한 좋은 엔지니어링이다.
- `FileFieldValue` 클래스(`UIProvider.tsx:247-388`)는 파일 업로드의 new/exist/delete 3-way diff를 캡슐화한 값 객체로, 로직이 명확하고 독립적으로 테스트 가능하다.

### 4.2 그러나 "실사용 가능성" 관점에서는 다음이 걸린다

- 65개 **필수** 컴포넌트 중 옵셔널은 단 2개(`BreadcrumbItem`, `PasswordStrength`)뿐이다. 어댑터를 아직 안 쓰는 필드용 컴포넌트(`InlineMap`, `MarkdownEditor`, `FlatPickrDateField` 등 특정 기능에서만 쓰이는 것들)까지 전부 필수로 요구해, 그리드/기본 폼만 쓰려는 채택자도 65개를 전부 채워야 타입이 통과한다. 실제로 안 쓰는 필드가 있으면 headless 세트로 채워 넣는 임시방편이 사실상 강제된다.
- 문서(`docs/getting-started.md:143-146`)도 "No official adapter ships yet... this is the biggest single integration cost"라고 스스로 인정한다 — 즉 유지보수자 자신도 이 계약이 온보딩 장벽 1순위임을 알고 있다.
- 타입이 전부 `ComponentType<any>`(`UIProvider.tsx:14-64` 전체)라서 컴파일 타임에 어떤 props가 필요한지 전혀 검증되지 않는다. 실제 필요한 props는 `docs/getting-started.md` 산문 설명(§4 "Shape of a primitive")에만 존재하고, 타입 시스템에는 없다. TypeScript 라이브러리로서 이 지점의 타입 안전성은 사실상 0이다.

### 4.3 headless 베이스라인 — 실제로 동작하는 품질

`src/listgrid/ui/headless.tsx` 전체를 검토한 결과, 이는 "때우기용 스텁"이 아니라 **실사용 가능한 최소 구현**이다:

- `stripLibraryProps`(`headless.tsx:40-55`)로 라이브러리 내부 전용 props(`entityForm`, `subCollectionEntity` 등)를 DOM에 새기 전에 걸러내고, `readonly`→`readOnly`, `placeHolder`→`placeholder` 같은 케이스 정규화까지 처리한다 — 실제 DOM 경고를 겪고 고친 흔적.
- `Table`이 `Table.Thead/Tbody/Tr/Th/Td` compound를 `Object.assign`으로 제공(`headless.tsx:156-169`)해 `UIProvider`의 Proxy 메커니즘과 정합적으로 동작한다.
- 65개 전 표면을 커버(`headless.tsx:289-339`)하되, 다수는 CSS 없는 순수 시맨틱 태그(`passthroughChildren`)로 처리해 "0줄로 그리드가 뜨는" 최초 경험을 실제로 제공한다.

이 headless 세트는 이 서브시스템 전체에서 손에 꼽히게 잘 만들어진 부분이다.

---

## 5. Router / UrlState 프로바이더 — 이 계층에서 가장 깨끗한 설계

`src/listgrid/router/`와 `src/listgrid/urlState/UrlStateProvider.tsx`는 정말로 프레임워크 독립적이다:

- `RouterServices`(`src/listgrid/router/types.ts:35-46`)는 5개 훅 + `Link` 컴포넌트로만 구성된 순수 인터페이스이며, Next 종속이 전혀 없다.
- `UrlStateServices`(`src/listgrid/urlState/types.ts:23-32`)도 nuqs 특정 타입을 노출하지 않고 자체 `UrlParser<T>` 추상화(`types.ts:7-11`)로 감쌌다.
- 두 곳 모두 `mustRouter`/`mustUrlState`(`RouterProvider.tsx:17-28`, `UrlStateProvider.tsx:17-28`) 헬퍼로 동일한 에러 메시지 패턴을 반복 사용해 일관적이다.

이 두 모듈은 "새 프로젝트가 원 호스트 아키텍처에 강제로 끌려간다"는 유지보수자의 불만이 **적용되지 않는** 유일한 영역이다. 실제로 `docs/getting-started.md:147-152`도 "Non-Next.js frameworks — write your own... contracts are exported as types"라고 정확히 안내한다.

### 5.1 Next 어댑터(`src/adapters/next/**`) 품질

- `NextRouterAdapter.tsx:19-44`는 `next/navigation` 훅을 얇게 감싸는 정직한 어댑터. `useSearchParams`가 `ReadonlyURLSearchParams`를 `URLSearchParams`로 복사하는 처리(`NextRouterAdapter.tsx:37-42`)는 호출부가 mutate를 시도할 때 생기는 실제 버그를 예방한 것으로 보인다.
- `NextUrlStateAdapter.ts:21-34`는 nuqs 파서로의 변환이 명확하다.
- `NextListGridProvider.tsx:22-28`는 두 프로바이더를 합치는 편의 컴포넌트일 뿐 로직이 없다 — 작고 안전하다.

이 어댑터 계층은 규모도 작고(4개 파일, ~120줄) 책임도 명확해 이식성 문제가 거의 없다.

---

## 6. Message / Loading — 계약은 있으나 재사용성이 얕음

- `MessageServices`(`src/listgrid/message/MessageProvider.ts:11-18`)의 모든 메서드가 `options: unknown`으로 타입이 없다(`MessageProvider.ts:11-18` 전체). 실제 사용처가 무엇을 넘기는지 이 파일만 봐서는 전혀 알 수 없다 — "opaque options"라는 주석(`MessageProvider.ts:9`)이 사실상 "우리도 정확한 타입을 모른다"의 완곡한 표현이다.
- `useLoadingStore`(`src/listgrid/loading/index.ts:23-25`)는 이름은 훅이지만 **React 구독 메커니즘이 전혀 없다**:
  ```ts
  let _store: LoadingStore = { openBaseLoading: false, setOpenBaseLoading: (open) => { _store.openBaseLoading = open; } };
  export function configureLoading(store: LoadingStore): void { _store = store; }
  export function useLoadingStore(): LoadingStore { return _store; }
  ```
  `use`로 시작하는 이름이 React 훅 관례를 암시하지만 내부에 `useState`/`useSyncExternalStore` 등 구독 로직이 전혀 없어, 호출한 컴포넌트는 `_store`가 바뀌어도 리렌더되지 않는다. 함수명과 실제 동작이 어긋나는 API로, 이름만 보고 쓰면 오작동하는 함정이다. (참고로 모달 스토어는 실제로 zustand `create()`를 써서 올바르게 구독형으로 구현되어 있다 — `src/listgrid/store/index.ts:31` — 같은 서브시스템 내에서도 구현 품질 편차가 크다.)

---

## 7. API 계층 (`src/listgrid/api/**`)

- `ApiClient` 인터페이스(`src/listgrid/api/ApiClient.ts:29-67`)의 JSDoc이 "envelope contract"를 매우 구체적으로 설명하고, 흔한 실수(raw `fetch().json()`을 그대로 리턴)까지 예제로 짚어준다(`ApiClient.ts:33-49`) — 문서화 품질은 훌륭하다.
- 다만 이 계약 자체가 **호스트 백엔드의 특정 응답 포맷(`response.data.list` / `.content` / `.searchForm`, `isError()`)에 강하게 결합**되어 있다(`ApiClient.ts:36-38` 주석에서 스스로 명시). "어떤 백엔드에도 붙는 범용 어댑터"가 아니라 "원 호스트의 REST 응답 포맷을 그대로 인터페이스로 승격시킨 것"이며, 다른 응답 포맷(JSON:API, GraphQL, 단순 배열 응답 등)을 쓰는 신규 채택자는 이 envelope 규약에 맞춰 별도 매핑 레이어를 직접 짜야 한다.
- `configureApiClient`가 정적 클래스 메서드(`PageResult.fetchListData` 등)에서 호출되기 때문에 React Context를 쓸 수 없다는 설계 근거(`ApiClient.ts:10-13`)는 타당하다 — 다만 이는 "정적 메서드에서 API를 호출하는 아키텍처 자체"가 문제의 근본 원인이라는 뜻이기도 하다(코드 조직 계층의 이슈, 이번 스코프 밖이지만 원인으로 짚어둔다).

---

## 8. Extensions (`src/listgrid/extensions/**`)

- `EntityFormExtension.types.ts`의 `ClientExtensionContext`, `ExtensionPoint` enum(`PRE_FETCH_LIST`~`POST_DELETE`, `EntityFormExtension.types.ts:41-55`)은 CRUD 라이프사이클 훅으로 합리적으로 제네릭하다.
- 반면 `FieldExtensions.ts` 전체는 "SMS 발송 이력"이라는 매우 한국 SMS 도메인 특화 기능(`registerSmsHistoryField`, `registerPhoneNumberSmsHistoryInject`, 기본 탭 라벨이 `'SMS 발송 이력'` 하드코딩 — `FieldExtensions.ts:65`)이며, 이것이 "extensions"라는 범용적 이름의 모듈에 유일하게 존재하는 두 확장 포인트다. 이름과 실제 내용물의 범위가 어긋난다 — 신규 채택자가 "extensions 모듈을 보면 확장 방법을 알 수 있겠지"라고 기대하면, 실제로는 SMS 필드 하나를 위한 특수 배선만 발견하게 된다.

---

## 9. `RuntimeConfig` — 이름은 범용, 내용은 특정 필드 세트

`src/listgrid/config/RuntimeConfig.ts:21-42`의 `ListGridEndpoints`는 `excelUpload`, `smsSenderList`, `smsNotificationSend`, `revisionApi` 등 특정 기능 엔드포인트 이름을 그대로 나열한다. "Stage 9 host-coupling detox"(`RuntimeConfig.ts:8-12` 주석)라는 리팩터링이 실제로 있었음을 시사하지만, 결과물은 호스트 결합을 없앤 것이 아니라 **호스트의 엔드포인트 이름·구조를 설정 가능한 상수로 승격**시킨 것에 가깝다 — 새 프로젝트가 엑셀 업로드나 SMS 발송 기능을 쓰지 않아도 이 타입들을 눈으로 봐야 한다.

`ListGridPermissions`(`RuntimeConfig.ts:49-54`)의 `canSendSms`, `canOpenInNewWindow`도 마찬가지로 원 호스트의 특정 UI 어포던스에 맞춘 이름이다. 제네릭 `permissions: Record<string, (session?: Session) => boolean>` 형태였다면 확장성이 더 나았을 것이다.

---

## 10. i18n (`src/listgrid/utils/i18n.ts`)

이 파일은 이 계층에서 가장 작지만 가장 깔끔한 계약 중 하나다:

```ts
export type TranslatorFactory = () => Translator;
let _factory: TranslatorFactory | undefined;
export function configureTranslator(factory: TranslatorFactory): void { _factory = factory; }
export function getTranslation(): Translator {
  if (_factory) {
    try { return _factory(); }
    catch (e) { console.warn(...); return DEFAULT_TRANSLATOR; }
  }
  return DEFAULT_TRANSLATOR;
}
```

팩토리 패턴(고정 translator가 아니라 매번 재평가)으로 언어 전환을 지원하고, identity fallback으로 미설정 시에도 UI가 깨지지 않게 하며, 팩토리가 throw해도 앱 전체가 죽지 않도록 try/catch로 방어한다(`i18n.ts:43-51`). 이 파일 하나만 보면 "생각이 잘 정리된 라이브러리"라는 인상을 준다 — 문제는 이런 수준의 설계 일관성이 나머지 14개 싱글턴에는 적용되지 않았다는 점이다.

---

## 11. SSR / RSC 안전성

- 스코프 내 모든 모듈 전역 싱글턴(`ApiClient.ts`, `RuntimeConfig.ts`, `MessageProvider.ts`, `MenuPermissionChecker.ts`, `SessionProvider.ts`, `loading/index.ts`, `i18n.ts`)에는 `'use client'`/`'use server'` 지시어가 전혀 없다(확인: 해당 6개 파일 grep 결과 0건). 반면 실제 React Context 프로바이더(`AuthContext.tsx:1`, `UIProvider.tsx:1`, `GlobalModalManager.tsx:1`, `RouterProvider.tsx:1`, `UrlStateProvider.tsx:1`)에는 전부 `'use client'`가 붙어 있다 — 이는 의도적 구분으로 보인다: **컴포넌트가 아닌 모듈 전역은 서버/클라이언트 어디서든 import될 수 있다는 뜻.**
- 이 자체가 즉시 버그는 아니다(단일 테넌트 앱에서 부트스트랩 시 1회만 `configure*`를 호출하는 일반적 사용 패턴이라면 문제없다). 그러나 **Next.js 서버 환경(다중 요청을 하나의 Node 프로세스가 동시 처리)에서 `configureRuntime`/`configureApiClient` 등이 요청마다 다른 값으로 재호출될 가능성이 있는 멀티테넌트/멀티환경 시나리오**(예: 프리뷰 환경 vs 프로덕션 환경을 같은 프로세스에서 서빙, 또는 세션별로 다른 API 클라이언트가 필요한 경우)에서는 모듈 레벨 `let` 변수가 요청 간에 공유되어 **경쟁 상태(race condition)** 로 이어질 수 있다. 이 위험에 대한 경고나 문서화는 어디에도 없다(`RuntimeConfig.ts`, `ApiClient.ts` 전체에 "per-request" 관련 주석 없음, 확인 완료).
- `getRuntimeConfig()`가 매번 같은 객체 참조를 반환하는 것도(`RuntimeConfig.ts:135-137`) React 서버 컴포넌트 렌더링 중 이 값을 읽는 코드가 있다면, Next의 dev 모드 모듈 캐시 무효화(HMR) 시 `configureRuntime`이 호출되기 전 컴포넌트가 먼저 임포트되는 순서 문제도 이론상 가능하다 — 다만 이는 부트스트랩 순서를 지키면 회피 가능한 수준이라 severity는 낮게 본다.

---

## 12. 강점 (근거 포함)

1. **Router/UrlState 프로바이더**(`src/listgrid/router/**`, `src/listgrid/urlState/**`)는 실제로 프레임워크 독립적이며, Next 외 어댑터를 직접 짜기 쉬운 최소 인터페이스로 잘 설계되었다.
2. **headless UI 베이스라인**(`src/listgrid/ui/headless.tsx`)은 스텁이 아니라 실사용 가능한 품질이며, `stripLibraryProps` 등 실전에서 겪은 문제를 해결한 흔적이 뚜렷하다.
3. **`i18n.ts`**의 팩토리 패턴 + identity fallback + try/catch 방어는 이 계층에서 가장 사려 깊은 설계다.
4. **`AuthContext`의 `NO_PROVIDER` 심볼 처리**(`AuthContext.tsx:10-12`)는 "세션 없음"과 "프로바이더 없음"을 구분하는, 자주 놓치는 엣지케이스를 정확히 처리했다.
5. **`ApiClient`의 JSDoc**(`ApiClient.ts:33-49`)은 계약을 어겼을 때 생기는 구체적 실패 모드까지 예시로 남긴, 문서화 모범 사례다.

---

## 13. 종합 판정 (제품화 관점)

이 서브시스템은 "일관된 프로바이더 아키텍처"가 아니라 **"몇 개의 잘 설계된 React Context 프로바이더 위에, 원 호스트에서 그때그때 뜯어낸 15개의 모듈 전역 registry가 누적된 것"**이다. 상업화하려면:

- 15개 싱글턴을 하나의 `configureListGrid({ api, messages, runtime, menu, sms, excel, assets, overlay, ... })` 같은 단일 진입점으로 통합하거나, 최소한 온보딩 문서를 실제 표면과 일치시켜야 한다(현재는 6개라고 말하고 20개를 요구한다).
- `checkAdminMenuPermission` / `DEFAULT_MENU_ALIAS`류의 호스트 특화 네이밍은 중립화하고, 기본값을 "전면 허용"에서 "명시적 미설정 시 콘솔 경고"로 바꿔야 한다(현재 유일하게 경고가 없는 registry).
- `useLoadingStore`처럼 이름은 훅인데 구독 메커니즘이 없는 API는 즉시 수정 대상이다(호출부가 리렌더되지 않는 조용한 버그의 근원).
- `ASSET_SERVER_URL`의 `127.0.0.1:8320` 폴백처럼 원 호스트의 흔적이 남은 기본값은 전부 제거해야 한다.
