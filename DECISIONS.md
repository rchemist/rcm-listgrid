# Decision Log

이 리포에서 내려진 모든 비자명한 결정의 기록.

## 규칙

- **Append-only**: 과거 엔트리는 수정/삭제하지 않는다. 틀린 결정도 기록으로 남겨야 학습된다.
- **결정이 번복되면 새 엔트리로 작성**하고 이전 엔트리를 참조(`Reverses: 2026-04-17 #3`).
- **결정 직후 작성**. "나중에 기록하자"는 대부분 기록 안 됨.
- **Why를 반드시 쓴다**. What만 쓰면 6개월 뒤 의미 없음.
- Open Questions 섹션에 미결 이슈를 쌓고, 결정되면 해당 날짜 로그로 옮긴다.

---

## 2026-04-17

### #1 납품 프로젝트와 분리, 단방향 sync
`gjcu-academic-front/packages/ui/listgrid`에 손대지 않고 별도 리포(`~/dev/rcm-listgrid`)로 작업.
동기화 방향: `gjcu` → 이 리포 (단방향, 수동 cherry-pick).
**Why**: 납품 일정 영향 차단. 범용화 실험이 제품 코드를 흔들지 않게.

### #2 패키지명 `@rcm/listgrid`, 단일 패키지 구조
모노레포/Turbo 도입 안 함. `src/` 하나짜리 단순 패키지.
**Why**: 과설계 방지. headless/adapter 분리가 실제 필요해지면 그때 쪼갠다.

### #3 React peerDep `>=18` (원본은 19 사용)
peerDependencies로만 react를 선언. 버전 범위는 18 이상.
**Why**: 이 라이브러리 도입 희망 프로젝트가 React 19 강제되면 채택 장벽이 생김. 19-only 문법을 쓰지 않는 한 18 호환 유지.

### #4 Stage 0→6 로드맵 (껍질 → 안쪽 순서)
리팩토링 순서: Scaffolding → Inert Copy → Auth 분리 → UI 프리미티브 추상화 → 외부 라이브러리 정리 → 백엔드 계약 명시화 → 필드/폼 로직 정리.
**Why**: 안쪽(필드 로직)부터 건드리면 바깥 껍질(UI 프리미티브) 변경 시 재작업 발생. 의존성 방향의 역순으로 푸는 것이 재작업 최소.

### #5 "Inert Copy" 단계를 첫 리팩토링 전에 별도 커밋
원본 파일을 수정 없이 `src/`로 복사만 한 상태를 `c227d2b` 커밋으로 박음.
**Why**: 이후 리팩토링에서 회귀 의심 시 "원본은 어땠지?"의 기준점 확보. `git diff c227d2b -- src/<file>`로 즉시 비교 가능.

### #6 Stage 1 마무리는 "빠른 길" 선택
외부 의존성은 원본 `package.json`에서 그대로 복사. `@gjcu/*` 임포트는 stub(타입만 any/unknown으로 선언)로 처리. 의존성 가지치기는 Stage 4의 일.
**Why**: Stage 1 목적은 "타입체크 통과하는 baseline 확보"이지 의존성 정리가 아님. 범위 섞으면 진척 판단 어려움.

### #7 DECISIONS.md 도입, README에 Stage 완료 기준 명시
모든 비자명한 결정을 append-only 로그로 기록. 각 Stage는 `Done when:` 체크리스트로 완료 판단.
**Why**: 장기 리팩토링에서 가장 흔한 실패는 "왜 그렇게 했는지 아무도 모르는 상태". 결정 직후 기록이 유일한 방어선.

### #8 `@gjcu/*` 네임스페이스 유지 결정 (Stage 1에서 이름 변경 안 함)
원본 파일의 `@gjcu/ui`, `@gjcu/shared`, `@gjcu/entities/*` 임포트는 Stage 1에서 이름 변경하지 않음.
**Why**: 이 import들은 Stage 2(auth)/Stage 3(UI)/Stage 5(entities)에서 Provider 주입으로 **실제 코드 교체** 될 예정. 지금 prefix만 `@rcm-host/*` 같은 것으로 치환하면 같은 줄을 두 번 터치하는 churn. 자연 소멸 대기.
**검증**: Stage 3 Done-when에 "src/ 내 `@gjcu/*` import 0개" 조항 존재. 누락 방지됨.

### #9 `.npmrc`에 `legacy-peer-deps=true` 설정
**Why**: @tabler/icons-react(React 18 peer 요구) 등 일부 외부 의존성이 React 19와 peer 버전 불일치. 원본 프로젝트도 동일 문제를 monorepo에서 암묵적으로 처리 중. 명시적으로 .npmrc에 박아 재현성 확보.

### #10 stub 구조: `src/listgrid/` + 형제 stub 디렉터리
원본 파일의 상대경로 import(`../../../utils/BooleanUtil` 등)가 `packages/ui/` 형제 폴더를 참조하는 구조를 보존하기 위해, listgrid 콘텐츠를 `src/listgrid/`로 한 단계 내리고 형제 위치에 stub 디렉터리(`src/api/`, `src/auth/`, `src/utils/`, `src/menu/`, `src/components/`, `src/elements/`, `src/form.d.ts`, `src/store.d.ts`) 배치.
**Why**: `src/*` 바로 아래에 listgrid 두면 `../../../utils`가 프로젝트 루트 밖으로 탈출. `src/listgrid/X/...`로 이동 시 같은 상대 depth로 `src/` 내 형제를 정확히 지목 → 원본 파일 import 줄 0개 수정.

### #11 stub 패턴: `export const X: any; export type X = any;`
각 stub 파일에서 named export를 `value`와 `type` 양쪽으로 동시 선언. shorthand `declare module 'x';`는 "namespace를 type으로 쓸 수 없다" TS2709 에러를 유발하고, `declare const _: any; export = _;` 패턴은 named import를 막음. 양쪽 해결책으로 둘 다 명시 선언.
**Why**: 원본 코드가 `Session`, `SearchForm`, `PageResult` 같은 이름을 값과 타입 양쪽으로 사용. 하나만 선언하면 절반의 사용처가 에러.
**자동 생성**: 원본 listgrid 소스의 named import를 파싱해서 stub 블록/파일 생성. 원본 변경 시 재생성 필요.

### #12 Stage 1 의도적 편차: 9줄의 `@ts-expect-error STAGE1-baseline`
아래 6개 파일 9개 위치에 `// @ts-expect-error STAGE1-baseline` 추가:
- `src/listgrid/config/EntityForm.tsx` (×2, `errors: never[]` 추론)
- `src/listgrid/config/EntityFormMethod.ts` (×1, `Map.entries()` unknown)
- `src/listgrid/components/fields/ManyToOneField.tsx` (×1, string→undefined)
- `src/listgrid/components/fields/rule/RuleCondition.tsx` (×2, `fields.push`에서 never[])
- `src/listgrid/components/form/ViewEntityForm.tsx` (×2, `SafePerfectScrollbar` children prop)
- `src/listgrid/components/list/hooks/searchFormUrlSync.ts` (×1, Map.entries unknown)
**Why**: stub이 모두 `any`라 TypeScript의 control-flow 분석이 타입을 좁히지 못하는 부분들. Stage 3(UI Provider) 또는 Stage 6(코드 정리)에서 실제 타입 부여 시 자연스럽게 해결됨. marker 문자열 `STAGE1-baseline`으로 추적.
**추적 방법**: `grep -rn "STAGE1-baseline" src/`로 전수 리스트 확인. 각 Stage의 Done-when에 "이 grep 결과 감소 혹은 0" 조항 고려.

### #13 `noImplicitAny: false` 활성화 (Stage 1 한정)
tsconfig에서 strict는 유지하면서 `noImplicitAny`만 false로 설정.
**Why**: stub이 모두 `any`여서 콜백 파라미터가 implicit any가 되는 경우 다수 발생. strict 완전 비활성화보다 좁은 완화. Stage 3 UI Provider 도입 후 실제 타입이 들어오면 되돌릴 것.

### #14 테스트 파일 Stage 1 type-check에서 제외
`**/__tests__/**`, `**/*.test.ts`, `**/*.test.tsx`를 tsconfig exclude.
**Why**: 원본 테스트는 `@types/jest` 타입 의존. Stage 1은 core 로직 type-check 통과만 목표. 테스트는 Stage 6에서 재구성.

### #15 outlier stub: `ui/form.d.ts` (프로젝트 루트)
`src/listgrid/config/form/EntityFormExtensions.tsx`가 `../../../../ui/form`으로 4단계 climb 후 재진입하는 특이 경로. 현재 구조에선 `rcm-listgrid/ui/form`을 지목하므로 해당 위치에 stub 생성 + tsconfig include 추가.
**Why**: 원본에선 `packages/ui/form`으로 정상 리졸브되던 경로. 같은 destination을 다른 depth로 표현한 outlier. 소스 수정 대신 파일 시스템 레이아웃을 맞춰 대응.

---

## 2026-04-17 (Stage 2)

### #16 AuthProvider 계약 확정
`src/listgrid/auth/` 내부 모듈에 다음 공개 API:
```ts
// src/listgrid/auth/types.ts
export interface SessionUser {
    id?: string | number;
    name?: string;
    roles?: string[];
    [key: string]: any;
}
export interface Session {
    roles?: string[];
    authentication?: { roles?: string[]; [key: string]: any };
    getUser: () => SessionUser | null | undefined;  // required
    [key: string]: any;
}

// src/listgrid/auth/AuthContext.tsx
export function AuthProvider({ session, children }): JSX.Element;
export function useSession(): Session | undefined;
export function useAuth(): AuthContextValue;
```
**Why**:
- `getUser`를 required로 둠 — 원본 listgrid는 `session.getUser()` 존재를 가정. plain 객체 host는 session을 wrap해야 함.
- `roles`를 `readonly string[]`이 아닌 `string[]`으로 — 원본이 `isEqualsCollection(roles)` 같은 mutable 함수에 전달.
- `useSession`이 `Session | undefined` 반환 — 원본 사용처가 `undefined` 가정(`null` 아님).
- Provider 밖에서 훅 호출 시 throw — 조용한 `undefined` fallback보다 명시적 오류가 디버깅 이득.
- `NO_PROVIDER` Symbol sentinel로 "Provider 없음"과 "session 없음" 구분.

### #17 Stage 2 구조: 내부 모듈 + 상대경로 import
`src/listgrid/auth/`에 실제 구현 배치. 원본 파일의 모든 auth import를 스크립트로 bulk 치환:
- `@gjcu/ui/auth/types` / `@gjcu/ui/auth` → depth 기반 relative path
- 기존 `../../../auth` (stub 가리킴) → `../../auth` (1 `..` 감소, 내부 모듈 가리킴)
45개 파일에 import path만 변경(로직 수정 없음).
**Why**: 경로 alias(`@rcm/listgrid/auth`)는 publish 시 package.json exports와 얽혀 복잡. 상대경로가 자기 참조 문제 회피하고 tsc만으로 동작.

### #18 Stage 2 편차: 원본 import 경로 45파일 수정
Stage 1 "원본 수정 0" 원칙에서 벗어남. 그러나 **의미 변경 없는 문자열 치환**(경로만 다름).
**Why**: Stage 2는 의도적으로 원본 auth 결합을 제거하는 단계. import path 변경은 불가피. 로직은 그대로 유지.

---

## 2026-04-17 (Stage 3)

### #19 Stage 3 전략: inline + Provider 주입 혼합
`@gjcu/ui/*` (약 450+ import site)를 (a) inline과 (b) Provider 주입 두 방식으로 분리:
- **inline** (호스트와 무관한 순수 로직): `common/type`, `common/func`, `utils/*`, `form/Type`, `form/SearchForm`, `form/TagsInput/types`, `misc/*` (regex, format, storage, compare), `auth/hasAnyRole`
- **Provider** (호스트가 구현 제공): `UIProvider` (컴포넌트 ~50개), `MessageProvider` (showAlert/showConfirm/showToast/showError), `LoadingStore` (configureLoading), `ModalManagerStore` (zustand 내장 구현)
- **Registry** (정적 호출 컨텍스트용): `registerSignOut`, `registerSmsHistoryField`
**Why**: 단일 거대 Provider는 host 설정이 벅참. 순수 로직은 라이브러리 소유, UI·메시징은 host 책임으로 분리해 계약 최소화.

### #20 UIProvider 구현: Proxy 기반 compound 컴포넌트 지원
`makeWrapper(name)`이 Proxy로 감싸 `Table.Th`, `Tooltip.Content` 같은 compound 접근을 동적으로 지원.
**Why**: 원본 소스가 `<Table.Th>` 패턴을 사용. 각 wrapper가 단순 function이면 static 하위 컴포넌트 접근 불가. Proxy로 lazy 조회해 "host가 제공한 Table에 Th가 있으면 사용, 없으면 runtime error".

### #21 UI 프리미티브 타입 전략: any prop + dual value/type 선언
각 wrapper는 `ComponentType<any>`로 타입. 원본이 value + type 양쪽으로 쓰는 이름들(`BreadcrumbItem`, `Currency`, `Double`, `PasswordStrength`, `Tree`, `TreeNodeData`, `TooltipColor`, `InlineMapPendingRef`, `KeyValue`)은 `export const` + `export type` 동시 선언. `FileFieldValue`는 instanceof 체크되므로 class로 구현.
**Why**: 정확한 per-component prop 타이핑은 Stage 6 정리. 지금은 원본 API 표면 호환성 우선.

### #22 Modal manager: 원본 API 형태(modalId 기반) 유지
`ModalOptions.modalId` (원본 필드명 유지, `id` 아님), `closeTopModal`/`findModal`/`updateModalData` 포함. `openModal`이 `string`(생성된 modalId) 반환.
**Why**: 원본 call site가 `const modalId = openModal({...})`, `closeModal(modalId, true)` 패턴 사용. 계약 변경 없이 내부 zustand 구현으로 대체.

### #23 SessionProvider + FieldExtensions: 모듈-스코프 registry
non-React/정적 클래스 컨텍스트에서 호출되는 host 서비스들(`signOut`, SMS 필드 생성)은 React Context 접근 불가. 모듈-scope mutable registry로 대체.
**Why**: `PageResult.fetchListData` 같은 static 메서드가 `signOut()` 호출. `EntityForm.initialize`도 클래스 내부. Context 훅 사용 불가 → registry 패턴.

### #24 domain coupling 제거: SmsHistoryField → createSmsHistoryField()
`@gjcu/entities/Academic/Common/fields/smshistory.SmsHistoryField` 하드 import 제거. `createSmsHistoryField(name, order, target)` factory로 교체, host가 `registerSmsHistoryField(Ctor)` 호출해 실제 구현 주입. 미등록 시 경고 로그만 남기고 skip.
**Why**: 학사 도메인(SMS 발송 이력)이 범용 라이브러리에 박혀있는 건 부적절. host 확장 가능하도록 추상화.

### #25 misc/index.ts: 원본 `@gjcu/ui` 루트 barrel의 37개 export 구현
Regex 상수(Alias/Email/Password/Phone/Telephone/Url), 날짜 포맷(fDate/fDateTime/fToNow/getFormattedTime/formatPrice), 비교 헬퍼(isEmpty/isEquals/isEqualsIgnoreCase/isEqualCollection/isPositive), URL 유틸(normalizeUrl/removeTrailingSeparator), storage 래퍼(get/set LocalStorage/SessionStorage), 자산 서버 유틸(ASSET_SERVER_URL/configureAssetServerUrl/getAccessableAssetUrl/removeAssetServerPrefix), DefinedDate 헬퍼 등.
API 호출 헬퍼(`callExternalHttpRequest`, `getExternalApiData*`)는 Stage 5 `ApiClientProvider`로 이관 예정이며 현재는 throw stub.
**Why**: 원본 API 표면 그대로 유지해 call site 변경 최소화. 순수 유틸은 host-agnostic이라 inline이 자연스러움.

### #26 `utilsNone` 버그 (내부 기록)
Stage 3a 중 Python regex 치환에서 `match.group(2)`가 None일 때 문자열 합성으로 `utilsNone`이 생성되는 버그 발생, 2개 파일(`EntityForm.tsx`, `SelectFieldRenderer.tsx`)에서 sed로 복구.
**Why**: 재발 방지 기록. Python bulk rewrite 시 `match.group(N) or ''` 사용 필수.

### #27 Stage 3 완료 검증
- `src/listgrid/` 내 `@gjcu/*` 직접 import **0건** (주석 제외)
- 유일하게 남은 `declare module '@gjcu/ui/listgrid/*'`는 dynamic import catch-all이었으나 실제 import가 relative로 교체되어 현재 미사용 (삭제 가능, Stage 4에서 정리)
- Stage 1의 `@ts-expect-error STAGE1-baseline` 9개는 남아있음 — stub 기반 narrowing 문제가 실제 타입 도입으로 상당수 해소되어 Stage 6에서 재확인

---

## 2026-04-17 (Stage 4)

### #28 의존성 분류: core / required-peer / optional-peer 3분할
원본 `packages/ui/package.json`의 60개 `dependencies`를 실제 listgrid 사용처 분석(AST-level import scan) 후 재분류.
- **core (5)**: `clsx`, `tailwind-merge`, `uuid`, `zustand`, `crypto-js` — 내부 구현에 직접 사용
- **required peer (6)**: `react`, `react-dom`, `next`, `nuqs`, `@tabler/icons-react`(43회 사용), `@headlessui/react`(8회)
- **optional peer (10)**: 특정 필드/트랜스퍼에만 사용 — `@iconify/react`, `react-select`, `react-sortablejs`, `qrcode.react`, `react-kakao-maps-sdk`, `react-daum-postcode`, `xlsx-js-style`, `file-saver`, `sweetalert2`, `sweetalert2-react-content`
- **제거 (44)**: `@floating-ui/react`, `@tiptap/*`, `@fullcalendar/*`, `apexcharts`, `axios`, `dompurify`, `flatpickr`, `lucide-react`, `nprogress`, `quill`, `react-animate-height`, `react-apexcharts`, `react-flatpickr`, `react-perfect-scrollbar`, `react-popper`, `react-quilljs`, `react-to-print`, `sortablejs`, `tippy.js`, `@tippyjs/react` 등
**Why**: 원본 `packages/ui`는 listgrid뿐 아니라 다른 UI 영역도 포괄했기에 의존성이 넓었음. listgrid만 추출한 이상 실제 쓰지 않는 의존성을 끌고 다닐 이유 없음. required peer와 optional peer 구분은 host가 "없이 써도 되는 기능"을 알 수 있게.

### #29 sweetalert2 — optional peer 유지 (Stage 6에서 MessageProvider로 치환 예정)
`ViewApiSpecification.tsx`, `XrefPriceMappingView.tsx` 2곳이 아직 `import Swal from 'sweetalert2'` 직접 사용. MessageProvider로 치환하는 리팩토링은 Stage 6 범위.
**Why**: Stage 4의 목적은 의존성 분류이지 호출부 리팩토링이 아님. 2개 파일의 직접 호출을 Provider 호출로 바꾸는 건 별도 작업. optional peer로 기록해 host에게 선택권 제공.

### #30 `node_modules` 패키지 수 감소 (321 → 180)
`npm install` 기준 설치 패키지 수가 약 44% 감소. 번들 크기(dist)는 Stage 6에서 bundle analyzer로 측정 예정.
**Why**: 측정 가능한 성과. "라이브러리가 가벼워졌다"는 주장의 근거.

---

## 2026-04-17 (Stage 5)

### #31 ApiClient 계약 확정 (src/listgrid/api/ApiClient.ts)
```ts
interface ApiClient {
    callExternalHttpRequest<T>(options: ApiRequestOptions): Promise<ResponseData<T>>;
    getExternalApiData<T>(urlOrOptions: string | ApiRequestOptions): Promise<ResponseData<T>>;
    getExternalApiDataWithError<T>(urlOrOptions: string | ApiRequestOptions): Promise<ResponseData<T>>;
}
```
`configureApiClient(client)` 호출로 주입. 미등록 시 호출 함수가 throw (디버깅성).
**Why**:
- 3개 메서드 모두 필요 — 원본 call site가 구분해 사용.
- `string | ApiRequestOptions` 오버로드 — 원본 코드가 `getExternalApiDataWithError(url)`와 `getExternalApiDataWithError({url, method, formData})` 두 형태 혼용.
- non-React 컨텍스트 호출이 많아 module-scope registry (signOut/Messages와 동일 패턴).

### #32 ResponseData class 유지
원본이 `new ResponseData()` 후 필드 세팅하는 패턴을 여러 곳에서 사용. interface가 아닌 class로 유지.
**Why**: 원본 call site 6곳 이상이 `new ResponseData()` 호출. interface로 바꾸면 factory 함수 호출로 전부 리팩토링 필요 — 범위 밖.

### #33 `IEntityErrorBody.fieldError` — Map과 Record 양쪽 수용
원본 코드가 `fieldError` 를 `Map<string, string[]>` 이나 `Record<string, string[]>` 어느 쪽이든 처리. 파싱 로직(`processApiError`)이 `instanceof Map` 체크 후 분기.
**Why**: 백엔드 응답 직렬화 방식에 따라 둘 다 나올 수 있음. 타입으로도 양쪽 허용해 call site 수정 없이 호환.

### #34 src/api/ 형제 stub 제거
Stage 1에서 만든 `src/api/types.d.ts`, `src/api/types/EntityError.d.ts`, `src/api/types/ResponseData.d.ts` 제거. 원본 파일들의 `../../api/types/*` 임포트를 `../../api` (새 위치 `src/listgrid/api/`)로 재작성. 한 `../` 레벨 감소 패턴(Stage 2 auth와 동일).
**Why**: stub이 실타입 구현으로 대체됨. 여전히 남아있으면 타입 안전성 후퇴.

---

## 2026-04-17 (Stage 6)

### #35 잔여 sibling stub 3개 제거
`src/components/scrollbar/SafePerfectScrollbar.d.ts`, `src/elements/tooltip/Tooltip.d.ts`, `src/menu/MenuPermissionChecker.d.ts` 제거. 전자 2개는 UIProvider 소비(`../../ui`)로 치환, menu는 `src/listgrid/menu/MenuPermissionChecker.ts` 실구현(host-registered checker)으로 이동.
**Why**: 원본 `packages/ui` 구조 재현을 위한 가짜 stub이 유일한 목적이었고, Provider/registry 계약이 갖춰져 제거 가능.

### #36 `STAGE1-baseline` 9개 마커 전원 해소
Stage 6에서 각각 실제 코드 수정으로 처리:
- `EntityForm.tsx` 2개 → `const errors: string[] = []` 명시 타입
- `EntityFormMethod.ts` 1개 → `instanceof Map` 분기 + `as string[]` cast
- `ManyToOneField.tsx` 1개 → `let value: any = undefined`
- `RuleCondition.tsx` 2개 → `const fields: React.ReactNode[] = []`
- `ViewEntityForm.tsx` 2개 → `SafePerfectScrollbar: React.ComponentType<any>` 명시 + dynamic import cast

`grep -rn "STAGE1-baseline" src`가 0을 반환. Stage 1 의도적 편차 #12 전원 해소.

### #37 `MenuPermissionChecker` 계약 확정
```ts
type PermissionType = 'ALL' | 'READ' | 'NONE'; // config/Config.ts
type MenuPermissionChecker = (args: { url: string; alias?: string; [k: string]: any })
                               => PermissionType | Promise<PermissionType>;
```
default checker는 모두 `'ALL'` 반환(무제한 허용). host가 `registerMenuPermissionChecker(fn)`으로 덮어씀.
**Why**: 원본 call site가 `{url, alias}` 객체 단일 인자, 반환은 config의 3-level enum. 다른 stub들(signOut, message, SmsHistoryField)과 동일한 module-scope registry 패턴.

### #38 `src/_stubs/gjcu-ambient.d.ts` 완전 제거
Stage 3 끝에서 빈 주석 블록만 남았고, Stage 6에서 최종 삭제. assets.d.ts의 `@gjcu/ui/listgrid/*` catch-all도 제거. 현재 남은 stub은 `src/_stubs/assets.d.ts`의 CSS/이미지 모듈 선언 + kakao 전역 뿐.
**Why**: `@gjcu/*` 네임스페이스 완전 소멸 — Stage 3 DECISIONS #8의 "자연 소멸 예정"이 그대로 실현됨.

### #39 공개 API 정비: src/listgrid/index.ts가 Provider 계약 전면 export
모든 host-주입 계약(`AuthProvider`/`useSession`, `UIProvider`/`useUI`, `configureMessages`, `configureApiClient`, `registerSignOut`, `registerSmsHistoryField`, `registerMenuPermissionChecker`)과 핵심 유틸(`hasAnyRole`, `fDate*`, Regex, storage 등)을 index.ts에서 export. `ResponseData`, `SearchForm`, 필드 클래스 등 기존 export도 유지.
**Why**: 라이브러리 API 표면을 한 파일에서 관찰 가능하게. 실제 소비 프로젝트의 첫 인상이 이 파일.

### #40 Open Questions 결산
- ✅ **UI 킷 어댑터**: 보류 해제. 계약(UIProvider interface)이 어떤 UI킷에도 대응 가능. 첫 어댑터 구현은 소비 프로젝트가 결정(HeroUI든 shadcn이든). 레퍼런스 어댑터는 별도 리포에서.
- ✅ **외부 라이브러리 분류**: Stage 4 완료 (#28).
- ✅ **rcm-framework API 계약**: Stage 5 완료 (#31). OpenAPI 생성은 추후 백엔드팀 협의.
- 🟡 **패키지 배포 채널**: 미결. 사내 npm registry 최우선 고려, 첫 외부 소비자 정해질 때 결정. DECISIONS에 계속 파킹.
- 🟡 **테스트 전략**: 미결. 현재 `__tests__`는 tsconfig exclude. Jest 재설정 + testing-library stub 결정은 별도 후속. DECISIONS에 계속 파킹.

---

## Open Questions

작업 중 떠오른 미결 이슈. 결정되면 날짜 로그로 이동.

- **패키지 배포 채널**: 사내 npm registry / GitHub Packages / git submodule 중 선택. 첫 외부 소비자가 정해질 때 확정.
- **테스트 전략**: `config/__tests__`, `list/context/EntityFormScopeContext.test.tsx` 등을 Jest로 되살릴지 Playwright 통합으로 갈지 미정. 현재 tsconfig exclude 상태.
- **실전 통합 검증**: Stage 6 Done-when 체크리스트 중 "최소 1개 외부 프로젝트에 통합되어 실전 동작 확인"은 소비 프로젝트가 확정될 때 실행. 현재 **타입체크/패키지 구조**까지가 라이브러리의 책임 범위.

---

## 2026-04-17 (Stage 7)

### #41 Stage 7 착수 사유: Next.js 14/15/16 버전 파편화 + non-Next 수요
사내 프로젝트가 Next 15/16 혼용, 그리고 Python 백엔드 기반 프로젝트가 이 라이브러리를 쓰고 싶어하지만 Next.js 결합 때문에 막혀있음. `peer next >= 14`는 실제로는 internal API(`hexHash`, `AppRouterInstance`) 의존 때문에 15/16에서 깨질 가능성 높음 — 진짜 framework-free로 가야 함.

### #42 `next/dist/*` internal API 제거 (Phase 7a)
- `hexHash` (`next/dist/shared/lib/hash`) → 자체 FNV-1a 구현으로 교체 (`src/listgrid/utils/hash.ts`, 10줄). Output 형식(unsigned 32-bit hex) 원본과 동일해 cache key·React `key` 호환.
- `AppRouterInstance` (`next/dist/shared/lib/app-router-context.shared-runtime`) 타입 import → `any /* AppRouterInstance */` inline 주석으로 교체. 실제 사용처는 `router` 파라미터 1곳. Stage 7c에서 `RouterApi`로 대체되면 자연 소멸.
- `unstable_noStore()` 호출 1곳 (`PageResult.fetchListData`) 제거 — Next 15+에선 caching opt-in 기본이라 불필요.

### #43 `next/dynamic` → `React.lazy` (Phase 7b)
`src/listgrid/utils/lazy.tsx`에 `lazyImport`(별칭 `dynamic`) 구현. API 호환을 위해 `{ loading, ssr }` 옵션을 받고 `loading`은 Suspense fallback으로, `ssr`은 무시.
**Why SSR 무시**: React.lazy는 SSR이 제한적. 기존 call site 중 `ssr: false`를 명시한 곳은 문제없음. SSR이 필요한 host는 어댑터에서 `utils/lazy`를 자기 구현으로 overlay 가능(추후 과제).

### #44 RouterProvider 계약 설계 (Phase 7c)
```ts
interface RouterServices {
    useRouter: () => RouterApi;  // {push, replace, refresh?, back?, forward?, prefetch?}
    usePathname: () => string;
    useParams: () => Record<string, string | string[] | undefined>;
    useSearchParams: () => URLSearchParams;
    Link: ComponentType<RouterLinkProps>;
}
```
Context 값에 hook 함수들을 담는 **Option A** 선택 (vs. Provider에서 hook 결과를 snapshot으로 담는 Option B).
**Why**: host 어댑터가 thin(next hook을 thin wrap). state 분리 slice별 재렌더는 이 context 자체 재렌더와 동등 — listgrid가 router 상태에 민감하게 반응하지 않기에 충분.

### #45 UrlStateProvider 계약 + 타입 완화
```ts
interface UrlStateServices {
    useQueryStates(parsers: Record<string, UrlParser<any>>, options?: UrlStateSetOptions)
        : [Record<string, any>, QueryStatesSetter];
}
interface UrlParser<T> { parse: (v: string) => T | null; serialize: (v: T) => string; eq?(a, b): boolean; }
```
framework-agnostic `createParser`와 `parseAsString`은 listgrid 내부에 단순 구현. Next 어댑터(`nuqsCreateParser` 래핑)가 실제 nuqs와 연결.
**Why 타입 완화**: nuqs의 `SetValues` 타입이 `Promise<URLSearchParams>` 반환해 library 계약 `Promise<void>`와 호환 안 됨. 반환 타입을 `any`로 완화해 어댑터 호환성 확보. 반환값 사용 안 하는 library call site는 영향 없음.

### #46 Subpath 어댑터 `@rcm/listgrid/next` (Phase 7e)
- `package.json` `exports` field로 `"./next": "./src/adapters/next/index.ts"` 노출.
- `next`, `nuqs`가 **optional peer**로 이동 — non-Next 프로젝트는 설치 불필요. 어댑터 import(`@rcm/listgrid/next`) 시에만 번들에 포함.
- 별도 npm 패키지 대신 subpath 선택. 단일 리포 유지 + 단일 install.
**Why**: 초기에 별도 패키지(`@rcm/listgrid-next`) 분리는 overhead. subpath가 실사용성 동일하면서 관리 부담 최소. 향후 별도 리포가 필요해지면 그때 분리(이때 현 subpath는 re-export shim으로 유지).

### #47 Stage 7 완료 검증
- `grep -rn "next/\|nuqs" src/listgrid` = 0 (주석 제외)
- `@rcm/listgrid` core — peer: react, react-dom, @tabler/icons-react, @headlessui/react (+11 optional)
- `@rcm/listgrid/next` — peer: next, nuqs 추가 요구
- non-Next 프로젝트(예: Vite + 자체 Router)가 `RouterProvider`/`UrlStateProvider`에 자기 어댑터 주입하면 동작 가능한 구조

---

## 2026-04-17 (Stage 8)

### #48 Stage 8 착수: 실전 소비자 연결로 검증
Stage 7까지는 타입체크/구조 리팩토링만 했고 한 번도 실행한 적 없음. 실사용 가능성 검증을 위해 `~/dev/rcm-listgrid-sample` (Vite + React, non-Next)을 만들어 `file:../rcm-listgrid`로 연결.
**Why**: "framework-free"가 이론인지 실재인지 증명 필요.

### #49 Stage 8에서 발견된 실제 버그들
**런타임에서만 보이는 플랫폼 결합이 여전히 존재했음.** Stage 7 완료라 선언했지만 검증 안 한 채였음:
- `process.env.NEXT_PUBLIC_*` 7곳 — 브라우저에서 `process` undefined
- `NodeJS.Timeout` 2곳 — 브라우저 TS lib에 없음
- `require('officecrypto-tool')` + `Buffer.from()` — CJS require는 Vite/브라우저에서 fail
- `*.module.css` import 4곳 — 산출물에 CSS 없음 (inert copy 때 .css 파일 미복사)
- `UIProvider` Proxy가 React 내부 introspection(`childContextTypes`, `getDerivedStateFromProps` 등)까지 가로채 "class component" 오인시켜 경고 폭탄
- 라이브러리가 non-standard 속성명(`readonly` vs `readOnly`, `placeHolder` vs `placeholder`)을 UI 킷에 전달 — DOM까지 누수 시 경고

### #50 RuntimeConfig registry 도입
`src/listgrid/config/RuntimeConfig.ts`: `configureRuntime({cacheControl, useServerSideCache, searchFormHashKey, debugListGridPerformance, isDevelopment, kakaoMapAppKey, cryptKey})`. 모든 `process.env.NEXT_PUBLIC_*` 접근을 이 registry 조회로 교체.
**Why**: Next(`NEXT_PUBLIC_*`)·Vite(`import.meta.env`)·서버(`process.env`) 어떤 환경이든 host가 자기 방식으로 값을 읽어 `configureRuntime` 호출하면 됨. 라이브러리는 plain JS 런타임 값만 본다.

### #51 ExcelProvider 리팩토링: Node-only 기능 lazy registry화
`officecrypto-tool` (암호화 Excel)과 `Buffer`는 Node 전용. 모듈 최상단 `require()`를 제거하고 `registerExcelCrypto(impl)` + 런타임 `globalThis.Buffer` 조회로 lazy 전환. 비밀번호 없는 Excel 익스포트는 브라우저에서 정상 동작, 암호화는 host가 명시 등록 시에만 가능.
**Why**: 원본이 require 호출을 최상단에 둬서 import만 해도 브라우저 번들 실패. 실사용 feature를 optional로 분리.

### #52 UIProvider Proxy 개선: React introspection 차단
`makeWrapper`의 Proxy `get` trap이 모든 property 접근을 compound child로 오해해서 `childContextTypes`, `getDerivedStateFromProps` 등 React 내부 체크에도 함수 반환 → React 경고. 수정:
1. `REACT_INTROSPECTION_PROPS` Set으로 알려진 internal property 제외
2. PascalCase로 시작하는 이름만 compound로 간주 (`Table.Th` OK, `childContextTypes` 거부)
**Why**: Phase B 렌더링 실험 중 콘솔 에러 23개 관찰 → Proxy 디자인 결함 확인. 실전 검증 없이 Stage 3에서 넘겼을 결함.

### #53 라이브러리 빌드 파이프라인 정식화
- `tsconfig.build.json`: `noEmit=false`, `outDir=dist`, declaration·sourcemap 활성
- `package.json`: `main`/`types`/`exports`가 `dist/` 가리키도록 변경. `files: ["dist"]` 추가.
- `npm run build`로 6.1MB dist 산출 (.js + .d.ts + .js.map + .d.ts.map)
- 소비자는 이제 `.ts` 소스를 재타입체크하지 않음 — `.d.ts`만 보므로 ambient stub이 소비자까지 흘러갈 필요 없음

### #54 Stage 8 Phase B 실전 렌더 검증 결과
`~/dev/rcm-listgrid-sample/src/App.tsx`에서:
- `<AuthProvider>` + `<UIProvider components={minimalUIComponents}>` + `<RouterProvider value={minimalRouterServices}>` + `<UrlStateProvider value={minimalUrlStateServices}>` 래핑
- `configureRuntime`/`configureApiClient`/`configureMessages` mock 주입
- `new EntityForm('user', '/api/users').addFields([StringField('name'), StringField('email'), NumberField('age')])`
- `<ViewEntityForm entityForm={form} />` 렌더

**실측 결과** (Playwright headless 브라우저로 확인):
- 페이지 로드 성공, 콘솔 **에러 0**
- DOM에 "신규 입력" 타이틀, "저장"/"목록" 버튼, "기본 정보" 섹션
- 실제 입력 가능한 `<input>` 3개 (이름/이메일/나이) 렌더
- 남은 warning 1개: `xlsx-js-style`의 `stream` 모듈 browser externalization — Excel 익스포트 실사용 시에만 문제, smoke test 범위 밖

### #55 host adapter 책임 문서화
UIProvider 컴포넌트들이 받는 props 중 일부는 **library 내부 상태**(`entityForm`, `clearError`, `helpText`, `session`, `field`, `config`, `subCollectionEntity`, `updateEntityForm`, `resetEntityForm`, `onError`, `viewType`, `renderType`)로, **host 어댑터가 DOM에 흘려보내지 않고 걸러내거나 자체 로직에 사용할 책임**이 있음. 또한 `readonly`/`placeHolder` 등 non-standard casing을 받아 `readOnly`/`placeholder`로 매핑하는 것도 host 책임.
**Why**: 원본 `@gjcu/ui`가 이런 UI 킷이었음. 범용 계약을 엄격히 하려면 prop 이름을 정규화할 수도 있지만, 그 작업은 수많은 call site 수정 필요. 지금은 "host는 자기 UI 킷에서 filter/rename 계층을 가진다"는 규약으로 정리.

### #56 Stage 8 진정한 완료 판단
- ✅ 라이브러리 빌드 성공 (`dist/` 생성)
- ✅ 소비자 빌드 성공 (Vite production, 1.4MB 번들)
- ✅ 소비자 dev 서버 정상 부팅
- ✅ **실제 컴포넌트 렌더링 검증** — `<ViewEntityForm>` with 3 fields, DOM 확인 완료
- ✅ 콘솔 에러 0 (warning 1: xlsx browser externalization, 예상됨)
- ⚠️ 저장/fetch 플로우는 아직 구동 안 됨 — mock API만 연결, click + API round-trip 테스트는 안 함
- ⚠️ UIProvider prop 필터 계약은 **host adapter 책임**으로 결정 (library가 강제 안 함)
- ⚠️ 실 스타일링 없음 (Tailwind 등) — 입력은 되지만 예쁘지 않음

### #57 Stage 9 Phase 1.1 — UI 프레임워크 독립을 위한 자체 CSS 기반 도입
**목표**: 라이브러리 소비자가 Tailwind/shadcn/HeroUI 등 특정 UI 프레임워크에 묶이지 않도록, 기본 UI는 라이브러리가 제공하되 override 경로를 전면 개방.

**문제 인식** (사용자 질의 통해 확인):
- 라이브러리는 `@heroui`/`@nextui`/`@shadcn`/`radix-ui`를 직접 import하는 곳 **없음** (확인 완료)
- 유일한 UI 결합은 **JSX에 하드코딩된 Tailwind 유틸리티 문자열** (134 파일, 602줄)
- 호스트가 Tailwind 설정 없으면 스타일 깨짐 — 이것이 마지막 누수

**Phase 1.1 인프라 (이번 작업)**:
1. `src/listgrid/styles/tokens.css` — CSS 변수로 디자인 토큰 노출 (색/폰트/간격/radius/shadow/z-index)
2. `src/listgrid/styles/base.css` — `@layer rcm-listgrid`로 감싼 scoped 클래스 정의 (rcm-root, rcm-field-root, rcm-field-input, rcm-button, rcm-spinner, rcm-table, rcm-notice, rcm-readonly 등)
3. `src/listgrid/styles/index.css` — 위 두 파일 `@import` 합본
4. `package.json` exports에 `./styles.css`, `./styles/tokens.css`, `./styles/base.css` 추가
5. `npm run build:styles`로 `dist/styles.css` (합본) + `dist/styles/{tokens,base}.css` 복사
6. `utils/classNames.ts` — `mergeSlot(base, override?)` / `resolveSlots(defaults, overrides?)` / `ClassNamesMap<K>` 추가 (host 필드 커스터마이징용)
7. `readonlyClass()`의 Tailwind 문자열(`bg-gray-100 opacity-60 cursor-not-allowed`) → `rcm-readonly` 스코프 클래스로 교체

**Override 메커니즘 (4단계, Mantine/MUI와 동등)**:
- (1) CSS 변수: `:root { --rcm-color-primary: ... }` — 전역 리브랜딩
- (2) `@layer rcm-listgrid` 밖 CSS: `.rcm-button { ... }` — specificity 전쟁 없이 무조건 이김
- (3) `classNames={{ root, input, error }}` prop — 인스턴스별 override (다음 Phase에서 필드별 wire)
- (4) `UIProvider.components` — 프리미티브 완전 교체 (기존)

**Neutral 디자인 원칙**: brand color 없음, system font, 4px 간격 grid, 기능적 accent color(success/warning/error/info)만 노출. gjcu 디자인 선택은 `UIAdapter.ts`에 갇혀 있고 라이브러리는 모름.

**Why**: 수십 개 필드 재구현 강요(완전 headless)와 기본 디자인 강요(Tailwind 종속) 사이의 업계 표준 해법. Mantine `@layer mantine` + MUI `sx/slots` + HeroUI `classNames` 등과 동일한 패턴.

**남은 작업 (Phase 1.2 / 1.3)**:
- Phase 1.2: 필드 컴포넌트들에 `classNames` prop 받아 `mergeSlot`으로 wire
- Phase 1.3: 134 파일 602줄의 하드코딩된 Tailwind 유틸리티 → scoped `rcm-*` 클래스로 점진 교체 (파일 단위로 검증하며 진행)

### #58 Stage 9 Phase 1.3 중간 진행 — Tailwind 하드코딩 → rcm-* scoped 교체
#57의 인프라 위에서 실제 컴포넌트/테마의 Tailwind 문자열을 scoped 클래스로 전환.

**최고 레버리지 작업 완료**:
- `defaultListGridTheme.ts` — ListGrid 기본 테마의 모든 btn/form/panel/white-light/bg-dark/bg-primary-light 전부 `rcm-*`로 교체
- `defaultEntityFormTheme.ts` — EntityForm 기본 테마도 동일 작업
- `mainTheme/modalTheme/subCollectionTheme.ts` variant 3종 전부 중립화

**효과**: ViewListGrid/ViewEntityForm 하위 수십 개 컴포넌트가 `themeClasses.X ?? '...'` fallback으로 이 테마를 쓰고 있었음. 테마를 중립화하면 fallback 경로 전체가 자동으로 중립화됨. 단일 파일 편집으로 수십 개 컴포넌트가 혜택.

**개별 컴포넌트 작업 완료**:
- InlineSubCollectionField/CardSubCollectionField/TableSubCollectionField 로딩 스피너
- DataExporter, ExcelPasswordField, DynamicDataImporter
- ViewEntityFormSkeleton, ViewListGridSkeleton

**남은 작업**:
- 약 527줄의 하드코딩된 Tailwind 문자열이 개별 컴포넌트 JSX에 아직 남음. 단, 이것들 중 상당수는 theme fallback 때문에 실제 렌더링엔 사용 안 되는 dead code일 가능성 있음.
- 순수 presentational 스타일(컬러/간격/폰트)은 중립 default CSS로 동작하고, 커스터마이즈 경로 4개 모두 열림.
- Button variants/Notice/Skeleton 시스템 완성.

**검증 필요**: gjcu 실험 워크트리에서 기존 UI가 그대로 동작하는지 확인. 테마 교체가 시각적으로 차이를 만들 수 있음.

---

## 2026-04-18 (Phase 6 병렬 + Phase 7 split + Phase 8 cleanup — alpha.36)

### #59 8 블록 병렬 에이전트 dispatch 로 Phase 6 잔여 일괄 완료
한 메시지에 8 개 Agent tool use (subagent_type=general-purpose) 로 CardManyToOneView / CardItem / AdvancedSearchFormV2 / RevisionField / FieldSelector / DataImport* / ContentAsset / Alerts 각각의 composite → primitive 전환을 병렬 수행. 각 에이전트는 자기 담당 JSX 만 편집하고 "CSS 삭제 후보 리스트" 를 구조화된 리포트로 반환. 메인 세션은 8 리포트 집계 + base.css 일괄 Edit + type-check/build + 커밋.
**Why**: 리팩터 블록 간 상호 독립 (각 블록이 다른 파일군을 건드림) → 순차 진행 대비 5x+ 시간 단축. 또한 각 블록의 컴포넌트 소스 전체 읽기/분석을 메인 context 에서 격리 — 메인은 프롬프트 + 최종 리포트만 유지. 한 세션에서 3 개 phase 완료 가능해진 핵심 동인.
**Trade-off**: 에이전트가 프롬프트 구조를 이탈하면 파싱 실패 가능 → 프롬프트에 "정확히 이 구조" 강조 + 예시 포함으로 방어. 결과적으로 8 리포트 모두 지정 포맷 준수.

### #60 base.css 3-way split: layouts / components / base(utilities)
Phase 7 에서 base.css (4,390줄) 를 `layouts.css` (2,912줄, 구조적 flex/grid composite 377 classes) + `components.css` (1,456줄 → Phase 8 후 1,386, component-specific 190 classes) + `base.css` (100줄, root/surface/readonly + text utilities + keyframes 15 classes) 로 분리. cascade 순서: `tokens → primitives → layouts → components → base`.
**Why**: 한 파일 안에서 primitive / layout / component-special / utility 가 섞여 있으면 (a) 리팩터 시 어느 층을 건드리는지 불명 (b) 호스트 override 경로가 파일 단위로 분리되지 않아 교체/재정의 전략 한정적. 3 파일 분리 시 호스트는 원하는 층만 교체 가능 (예: layouts 는 유지, components 만 자체 구현). `package.json exports` 에 각 파일 노출.
**순서 선택 근거**: utilities (base) 가 **마지막** 로드 → specificity 없이 overrides 이기는 자연 cascade. primitives 는 가장 먼저 로드되어 다른 층이 primitive 를 override 가능. layouts → components 순은 "components 가 layout 의 특수 케이스" 모델에 맞춤.
**검증**: 분리 전후 rule set 동일성 검증 (645 selector+body multiset, 0 missing 0 extra). dist/styles.css 는 주석 3 블록만큼 +1,203 bytes 증가, 본문 byte-identical.

### #61 Theme string 정리 + button variant CSS 완전 삭제
Phase 8 에서 defaultListGridTheme / defaultTheme / subCollectionTheme 의 "rcm-button rcm-button-{primary,outline,danger,outline-danger,secondary,sm,icon}" 문자열을 "rcm-button" 또는 "" 로 단순화. JSX consumers (CreateButton 등) 에 data-variant / data-color / data-size attr 을 hardcode. components.css 에서 `.rcm-button-primary` / `.rcm-button-outline` / `.rcm-button-danger` / `.rcm-button-outline-danger` / `.rcm-button-secondary` / `.rcm-button-sm` / `.rcm-button-icon` 및 hover variants 완전 삭제 (−70줄).
**Why**: Phase 2 에서 JSX 의 className 은 이미 data-attr 로 전환됨. 그러나 테마 파일의 className string 은 여전히 legacy class 를 emit → 호스트가 theme override 를 부분만 해도 legacy class 가 다시 삽입되어 불명확. theme string 도 primitive 단일화하면 (a) 단일 소스 (primitives.css `.rcm-button[data-variant=...]`) 로 모든 버튼 스타일 흐름 (b) legacy class 삭제 가능 → components.css 슬림.
**grep 검증**: `rcm-button-primary` / `-outline` / `-danger` / `-outline-danger` / `-secondary` / `-sm` / `-icon` 모두 src/**/*.{ts,tsx} 참조 0. components.css 에도 해당 셀렉터 0.
**유예 사항**: ViewListGridTheme.types 의 일부 theme slot (searchInput.button, advancedSearch.*, filterDropdown.*, priority.* 등) 은 현재 JSX 에서 소비되지 않지만 v0.2 major bump 전까지 공개 API breaking 을 피하고자 slot 자체는 유지 (string 만 비움). "TODO: remove in v0.2" JSDoc 으로 표시.

### #71 v0.3 Task E 세션 2 — Generic refactor 구현 완료

`docs/GENERIC_DESIGN.md` § 5 의 5 phase 순서대로 1 에이전트 구현. 세션 1 (#70) 의 설계를 거의 그대로 따름. 설계와 달라진 점은 아래 "설계 보정" 섹션 참고.

**구현 결과 (전 phase 기준)**:
- Phase 1 (foundation): `FieldValue<TValue = any>`. `ModifyEntityFormFunc<T = any>` / `ModifyFetchedEntityFormFunc<T>` / `OnInitializeFunc<T>` 3 callback 타입 제네릭화
- Phase 2 (abstract chain): EntityFormBase → Validation → Data → Actions → Extensions → EntityForm 6 클래스에 `<T extends object = any>` 전파. 각 `extends Parent<T>`. clone/cloneWithEntityForm/merge 반환타입 `EntityForm<T>`. onChanges/onFetchData/onInitialize/onSave/postDelete/overrideFetchData/buttons/headerArea/withTitle.view/withPostDelete/withOverrideSubmitData/withCheckDuplicate 등 17 개 callback 시그니처 `EntityForm<T>` 승격
- Phase 3 (keyof T overloads): getField / getValue / setValue / changeValue / setFetchedValue 에 `<K extends keyof T & string>` overload 추가. 순서 구체→일반 엄수
- Phase 4 (FormField chain): `FormField<T>` → `FormField<TSelf, TValue = any, TForm extends object = any>` rename + append. 6 abstract (FormField / ListableFormField / OptionalField / MultipleOptionalField / CheckButtonValidationField / AbstractManyToOneField / AbstractDateField) 동일 패턴. 33+ concrete 서브클래스 무수정 동작 확인. FormFieldProps / ListableFormFieldProps / OptionalFieldProps / MultipleOptionalFieldProps / CheckButtonValidationFieldProps / AbstractManyToOneFieldProps / AbstractDateFieldProps 7 interface 전부 `<TValue, TForm>` 전파. FormField.value / getCurrentValue / getSaveValue / getFetchedValue 반환타입 `TValue | undefined` 로 승격
- Phase 4b (추가 승격): fetchedEntity / getFetchedEntity / getValues / initialize 내 fetchedEntity 지역변수 `T` 계열로 승격
- Phase 5 (검증): type-check PASS, 900+1 tests PASS (0 회귀), lint 0 errors, format:check PASS, build PASS

**수치**:
- `: any` 카운트 295 → 286 (9 건 감축). 설계 예상 (306 → 200대) 대비 보수적 — 이유: 다수 any 가 default `= any` 로 승격되어 같은 `: any` 문자열을 유지 (파라미터 타입이 제네릭 파라미터로 치환됐지만 grep 패턴에는 안 잡힘). 실제 "타입 파라미터로 치환된 논리적 any" 는 30+ 건
- 테스트 900 passing + 1 todo → 동일 유지
- commits: `a0af52e` (Phase 1-2), `4d6cfec` (Phase 3), `72f303b` (Phase 4), `0da1b68` (Phase 4b)

**설계 보정 (#70 GENERIC_DESIGN.md 에 반영된 내용 외)**:
1. **`EntityField.getDisplayValue` 인터페이스 시그니처 수정** — 기존 `Promise<string>` 선언이었으나 실제 모든 구현체 (FormField 포함) 는 `Promise<any>` 를 리턴하는 불일치 존재. Task E 구현 중 `FormField.getDisplayValue` 를 `Promise<TValue>` 로 승격 시도 시 EntityField 인터페이스와 비호환 드러남. **EntityField 인터페이스를 `Promise<any>` 로 바로잡음** (기존 코드의 잠재 버그 해소). 최종적으로 `FormField.getDisplayValue` 도 `Promise<any>` 유지 — TValue 로 좁히면 구현체 서브클래스 (SelectField 등 displayFunc 반환이 다양함) 에서 타입 오류 유발
2. **`FormField.resetValue` / `withDefaultValue` 의 exactOptionalPropertyTypes 호환** — `this.value.current = this.value.fetched` 는 `TValue` vs `TValue | undefined` 충돌. `delete this.value.current` + 조건부 할당 패턴으로 교체
3. **Phase 2 에서 원 설계 외 추가 승격**: EntityForm.setFetchedValues 의 entity 파라미터는 `Partial<T> | any` (타입 체크 편의 + 기존 동작 유지). initialize 의 `fetchedEntity` 지역변수는 `(T & Record<string, any>) | null` (T=any 디폴트에서 인덱스 접근 호환 확보)

**가시화된 소비자 영향**:
- 기존 `new EntityForm('User', '/api/user')` → `EntityForm<any>` 로 해석. 무수정 동작
- 점진 승격 `new EntityForm<User>(...)` 사용 시 `getValue('name')` 이 `Promise<User['name']>` 로 narrow, `getValue('typo')` 는 컴파일 에러
- 기존 `class MyField extends FormField<MyField>` → `FormField<MyField, any, any>` 로 해석. 무수정
- 점진 승격 `extends FormField<MyField, string, User>` 사용 가능

**gjcu 호스트 검증**: 구현 세션에서 실측은 안 함 (워크트리 격리 원칙). 설계 세션 (#70) 에서 예측한 13 + 1 + 10 + 1 개소 패턴은 전부 default = any 경로이므로 타입 오류 0 예상. 실측은 다음 세션 또는 alpha.46 배포 후 관찰

**후속 과제 (Task F/G 후보)**:
- `FieldRenderParameters<T, TValue>` 제네릭화 — UI 컴포넌트 층 전파 (FieldRenderer / ViewEntityForm 등). 설계 § 2.8 참고
- `parse()` → `unknown` 전환 — 런타임 검증 도구 결합 시 의미
- `attributes: Map<string, any>` → `Map<string, unknown>` — breaking. v0.2.0 major bump 시 후보

### #70 v0.3 Task E 세션 1 — Generic refactor 설계 (`EntityForm<T>` / `FormField<TSelf, TValue, TForm>`)

Task E 를 2 세션으로 분할 (설계 → 구현). 이 엔트리는 세션 1 산출물 (`docs/GENERIC_DESIGN.md`) 의 결정 기록. 구현 결과는 세션 2 이후 별도 엔트리.

**핵심 결정 (변경 불가 포인트)**:

1. **`EntityForm<T extends object = any>`** — entity 스키마 T 로 제네릭화. `Record<string, unknown>` 대신 `object` 로 constraint 한 이유: `keyof T` 를 좁은 union 으로 보존해야 `getValue<K extends keyof T & string>(name: K): Promise<T[K]>` 의 키 narrowing 이 실효. `= any` default 로 `new EntityForm(...)` bare call 호환.

2. **FormField 기존 T 를 `TSelf` 로 rename + `TValue = any, TForm extends object = any` append** — `FormField<T extends FormField<T>>` 의 F-bounded 셀프 타입은 33+ 서브클래스의 `class XxxField extends FormField<XxxField>` 에서 쓰이므로 제거 불가. 앞이 아닌 **뒤에** 추가해서 `<Self>` 만 쓴 기존 서브클래스 전부 무수정 동작.

3. **Inheritance chain 전부 제네릭 전파** — `EntityFormBase → EntityFormValidation → EntityFormData → EntityFormActions → EntityFormExtensions → EntityForm` 6 클래스. 각 `extends Parent<T>` 로 T 내려보냄.

4. **`FieldValue<TValue = any>`** — `current/fetched/default` 승격. 가장 효과적인 any 감축 지점 (`FormField.value?: FieldValue<TValue>` 전파).

5. **`FieldRenderParameters` 는 이 Task 에서 제외** — UI 컴포넌트 층 (FieldRenderer / ViewEntityForm 등) 까지 제네릭 전파가 폭증하므로 별도 Task F 로 분리. 구현 세션은 config 층만.

6. **UIProvider `ComponentType<any>` 유지** — 의도된 any (DECISIONS #21). React 컴포넌트 prop 다형성은 제네릭으로 해결 불가.

7. **기본값 전부 `= any`** — 소비자 무수정 호환 계약. gjcu 호스트 측정 결과 13 개소 `new EntityForm(...)` + 1 개소 `extends FormField<Self>` 전부 무수정 컴파일 예상.

**소비자 영향 측정** (gjcu admin 기준):
- `new EntityForm(...)`: 13 개소 → `EntityForm<any>` 로 암묵 유지
- `extends FormField<Self>`: 1 개소 (RelatedMemoField) → default any 로 무수정
- `entityForm.getValue('name')`: 10+ 개소 → `Promise<any>` 유지 (옵션으로 `EntityForm<User>` 승격 시 narrowing)
- `getField('x') as SubClass` cast 패턴: 1 개소 → 변경 없음 (필드클래스 ↔ 엔티티키 1:1 매핑 불가 — generic 으로 해결 안 됨)

**Any 감축 예상**: 306 → ~200~230. 승격 가능 ~70~90 건 (FieldValue 3, getField/getValue 관련 15, displayFunc/saveValue 8, getCurrentValue 등 10, setFetchedValue 1, withValue/setValue 6, config/form 내부 ~25). 유지: UIProvider wrapper, parse(), attributes: Map<string, any>, ConditionalProps.value.

**Breaking change 판정**: 타입/런타임 모두 호환. overload 시그니처 순서 (구체 → 일반) 로 `T = any` 시 `keyof any & string` = `string` 으로 축약 → 기존 호출 무변경 해석. **alpha.46 minor bump 권고**. v0.2.0 major bump 불필요 (소비자 관점 차이 없음).

**구현 전략**: **1 에이전트** (3 병렬 불가 — 전역 타입 시그니처 변경은 중간 상태가 깨짐). 5 phase 순서:
1. foundation types (FieldValue, EntityField, ModifyEntityFormFunc)
2. abstract chain 제네릭화 (5 abstract + EntityForm)
3. 메소드 overload 추가 (getField / getValue / setValue / withValue)
4. FormField 체인 (FormField + 5 abstract fields)
5. 검증 (type-check + test + lint + format + build + gjcu 재설치)

**설계 변경 포인트** (원 설계 대비):
- `docs/NEXT_SESSION.md` § 4 의 초기 제안 `FormField<TValue = any, TForm = any>` → **`FormField<TSelf, TValue, TForm>`** 3-param 으로 수정. 이유: 기존 서브클래스 33+ 개의 `FormField<T>` 사용 (T=subclass) 을 무수정 호환하려면 F-bounded 셀프 타입 유지 필수. 제거하면 33+ concrete 필드 + gjcu host subclass 모두 수정 필요 → 설계 목표 (backward-compat) 위배.

**Why 세션 분리**: 세션 1 에서 설계 vagueness 를 제거하지 않으면 구현 세션에서 반복 수정 (제네릭 파라미터 위치 / constraint / 전파 범위 변경) 이 메인 context 폭증의 주범이 됨. gjcu 사용 패턴 측정 + F-bounded 셀프 타입 유지 결정이 설계 단계에서 확정되어야 구현 세션은 기계적 리팩터로 수렴.

**산출물**: `docs/GENERIC_DESIGN.md` (11 섹션). 세션 2 진입 시 § 0 TL;DR + § 5 구현 전략 + § 9 프롬프트 를 순서대로 따름.

### #69 v0.3 Task D — exactOptionalPropertyTypes 승격 (430 errors → 0)

`docs/NEXT_SESSION.md` § 3 (Task D) 실행. 3 병렬 에이전트로 영역별 분담:

1. **D-1 (config/transfer/form)**: 151 → 0, 24 파일. EntityForm 29, InlineSubCollectionField 18, SubCollectionField 15, EntityFormBase 14, TableSubCollectionField/CardSubCollectionField 8+8, transfer/Type 17 등
2. **D-2 (components/fields)**: 190 → 0, 52 파일. **2 세션 분할** (첫 세션 101 개 수정 후 병렬 응답 실패로 중단 → 재개 세션이 잔여 89 처리). FormField 25 (abstract), SelectField 14, OptionalField 12, ManyToOneField 11, NumberField 10, ApplyFullAddressFields 8, ListableFormField/Xref 계열/Address/ContentAsset 등
3. **D-3 (list+form+revision+validations+ui+adapters)**: 89 → 0, 40 파일. ViewListGrid 6, FieldRenderer 9, 그 외 list/form hooks, validations/UIProvider 옵셔널 프로퍼티 정리

**에러 타입 분포 (원본 430)**:
- TS2412 — 옵셔널 타입 불일치 (`x?: T` ← `T | undefined`): 201
- TS2375 — 객체 리터럴 `x: undefined` 포함: 122
- TS2379 — 함수 인자 `undefined` 전달: 94
- TS2532/2769/2345/2322: 13

**수정 패턴**:
- **TS2412 (대부분)**: public `interface Foo { x?: T }` → `{ x?: T | undefined }` 로 넓힘. 호출자 관점에서 완전히 호환 (JS 런타임 동일, 생략/undefined 전달 모두 가능)
- **TS2412 (internal)**: 클래스 내부에서 `this.x = undefined` → `delete this.x` (동일 런타임 효과) 또는 `if (val !== undefined) this.x = val` narrow
- **TS2375 JSX**: `<View prop={x}>` 에서 x 가 undefined 가능 시 조건부 스프레드 `{...(x !== undefined ? { prop: x } : {})}` 패턴
- **TS2379**: 메소드 시그니처에 `arg?: T | undefined` 명시
- **TS2375 spread cast**: `{...await getInputRendererParameters(this, params) as React.ComponentProps<typeof X>}` 로 InputRendererProps 의 옵셔널 필드 호환성 확보 (Xref/Address/Color 계열 Views)

**tsconfig 변경**:
- `"exactOptionalPropertyTypes": true` 추가. tsconfig.build.json 은 extends 로 자동 상속
- 이로써 strict 옵션 **5 종 전부 true**: strict + noImplicitAny + noImplicitReturns + noFallthroughCasesInSwitch + noUncheckedIndexedAccess + exactOptionalPropertyTypes

**메인 컨텍스트 보호 원칙 실전 검증**:
- 메인은 큰 파일 (EntityForm.tsx 839 줄, FormField.tsx 809 줄) 을 직접 읽지 않음. 에이전트 3 개가 영역별로 읽고 고정 포맷 리포트 반환
- 2차 병렬 dispatch 시 3 응답 중 2 개가 internal error 로 회수 불가. 하지만 git diff 로 실제 파일 수정은 반영되어 있음 확인 → **부분 진행 후 재개 가능**. 이 실패 모드 이후 세션 정책: 병렬 실패 시 git status / tsc error count 로 상태 회수, 실패 영역만 직렬 재 dispatch

**public API 변경 영향**:
- 모든 변경이 `x?: T` → `x?: T | undefined` 형태로 **넓어지는 방향**. 기존 소비자 (gjcu) 는 호환
- IListConfig, Address, MultipleAssetForm/AssetItem, XrefPrice/Prefer/PriorityMappingValue 등 export interface 옵셔널 필드도 동일
- 런타임 동작 0 변경. 타입 annotation only

**Why**: `exactOptionalPropertyTypes: false` 상태에서는 `{ x: undefined }` 와 `{}` 이 타입상 동일하게 처리되어 "의도적으로 누락" vs "의도적으로 undefined 대입" 이 구분 안 됨. `true` 승격으로 이 모호성 제거. 향후 옵셔널 필드의 존재 여부 체크 (`'x' in obj` vs `obj.x !== undefined`) 가 실제 의미를 가짐

**배포 판단**: public API 타입이 확장만 되었고 런타임 변경 0. 소비자 (gjcu) 에서 exactOpt 활성화 여부에 따라 이득이 다름 — 활성화 상태면 이 라이브러리 업그레이드로 타입 체크가 더 촘촘해짐, 비활성화 상태면 영향 없음. **alpha.46 배포는 선택적**. Task E 완료 시 함께 배포하는 것도 가능

**v0.3 잔여**: Task E (EntityForm<T> / FieldValue<T> generic refactor). 이후 v0.2.0 major bump 검토

### #68 v0.3 Task C — coverage 8.1% → 16.9% (config/form/fields 테스트 525 개 추가)

`docs/NEXT_SESSION.md` § 2 (Task C) 실행. 3 병렬 에이전트로 영역별 분담:

1. **C-1 (config/)**: 164 tests / 9 파일 (Config 55, OnChangeEntityForm 22, EntityFormMethod 23, EntityTab 15, EntityFieldGroup 13, ListGridViewFieldCache 11, AdvancedSearchOpenCache 10, CommonType 8, RuntimeConfig 7). 순수 모델/로직 .ts 만 대상, .tsx (EntityForm 등) 제외. config 11.7% → **34.22%** statements
2. **C-2 (form/misc/store/message/menu/router/urlState/)**: 202 tests / 9 파일 (misc 70, SearchForm 69, store 17, form/Type 10, MessageProvider 10, RouterProvider 10, urlState/types 7, menu/PermissionChecker 6, UrlStateProvider 3). 순수 함수 + Provider 의 delegation 만. store/menu/router/urlState 모두 100% 도달
3. **C-3 (components/fields/abstract/)**: 159 tests + 1 todo / 6 파일 (FormField 68, ListableFormField 28, OptionalField 28, AbstractDateField 12 + 1 todo, AbstractManyToOneField 12, CheckButtonValidationField 11). React render 는 배제, 클래스 메소드 (accessors, builders, clone 등) 입출력 계약만. abstract 1.18% → **60.86%**

**전체 수치 변화**:
- 테스트: 375 → **900 passing** + 1 todo (525 개 추가, 43 files)
- Coverage: 8.1% → **16.9%** statements / 6.46% → 14.98% branches / 6.46% → 17.97% functions / 8.19% → 16.81% lines
- vitest.config.ts thresholds: 8/6/6/8 → **16/14/17/16** (baseline 바로 아래)

**작업 규칙 고수**:
- React 렌더 테스트 최소화. 순수 로직 우선 (UIProvider / Session 없이 테스트 가능한 경로)
- 기존 구현 코드 무수정. 버그 의심 지점은 `it.todo` 또는 현행 동작을 lock-in 하는 pin test (AbstractDateField.clone 의 limit/range 참조 버그 추정 지점만 1 todo)
- 의도된 비직관 동작 2 건 lock-in (misc/index.ts 의 `isEqualsIgnoreCase(null, null) → false`, `getAccessableAssetUrl` 의 URL-encode 후 http(s) 조기 반환 비작동)
- 메인 context 보호: 에이전트 3 개 병렬, 큰 파일 (FormField 809 줄) 은 grep 으로 시그니처만 추출해서 분석

**Why**: 커버리지는 "회귀 안전망". v0.3 의 Task D (exactOpt 430 errors) / Task E (generic refactor) 가 foundation 파일을 광범위하게 손댈 예정이므로, config/form/fields 층의 단위 테스트가 먼저 있어야 회귀 감지 가능. utils/common 은 이미 93~94% 지만 도메인 코드 (config/form/fields) 는 DECISIONS #67 이전까지 0~15% 였음.

**배포 필요성 판단**: dev-only 변경 (테스트 + vitest 임계치). 런타임 영향 0. alpha.46 배포 불필요.

**v0.3 잔여**: Task D (exactOpt 승격, 430 errors) / Task E (EntityForm<T> generic refactor).

### #67 품질 게이트 완전 강제 — noUncheckedIndexedAccess + prettier + utils 테스트

DECISIONS #66 에 이어 품질 게이트 3 건을 hard-enforced 상태로 마감.

1. **`noUncheckedIndexedAccess: true` 승격** — 118 errors 를 2 병렬 에이전트가 영역별로 분담:
   - 영역 A (utils/adapters/config/transfer/form/misc): 58 → 0. simpleCrypt 20, EntityForm 7, Type 6 등
   - 영역 B (components/*): 60 → 0. useContentAsset 7, MultipleAssetField 6, searchFormUrlSync 4 등
   - Fix 패턴: 루프 / length 가드 뒤 `arr[i]!`, `split` / `Object.keys` 결과 `parts[n]!`, optional data `?.` 또는 `?? fallback`
   - 43 파일 수정. 런타임 동작/public API 무변경

2. **Prettier 일괄 포맷** — 299 파일 `npm run format` 으로 공백/따옴표/trailing comma 통일. CI 의 `format:check || echo` 제거 → 실패 시 빌드 fail

3. **utils + common 테스트 대량 추가** — 11 파일에 242 tests 작성 (BooleanUtil/StringUtil/CompareUtil/PhoneUtil/jsonUtils/classNames/cn/hash/i18n/simpleCrypt/common-func)
   - utils 2.3% → 93.04%, common 0% → 94.18%, 전체 4.5% → **8.1%**
   - simpleCrypt: roundtrip (ASCII/Unicode/empty)
   - hash.ts: FNV-1a 알려진 벡터로 검증
   - i18n: dictionary / factory / runtime switch 패턴 커버
   - vitest.config.ts thresholds 상향: statements 4→8, branches 2→6, functions 3→6, lines 4→8 (baseline 바로 아래)

**세션 누적 품질 게이트 상태** (DECISIONS #64~#67 종합):
- `npm run type-check`: strict + noImplicit{Any,Returns} + noFallthroughCasesInSwitch + noUncheckedIndexedAccess
- `npm run lint`: 0 errors 강제 (ESLint v10 flat config)
- `npm run format:check`: 0 drift 강제 (Prettier)
- `npm run test:coverage`: thresholds 강제 (8%/6%/6%/8%)
- CI 는 위 4 개 + build + dist 검증. 하나라도 깨지면 PR fail

**Why**: "품질 게이트가 존재하는 상태" 와 "게이트가 실제로 기능하는 상태" 는 다르다. alpha.44 에서 ESLint / CI 는 설정만 있었고 `|| echo` 로 실패를 숨기고 있었음. #66~#67 로 모든 게이트가 실제로 blocking 하도록 정비. 이제부터 기여자는 type / lint / format / coverage 중 하나라도 깨면 PR 이 통과하지 않음 → **오픈소스 협업 표준 품질** 달성.

**배포 판단**: 모든 변경이 dev-facing + pure assertion. 런타임 동일. alpha.46 배포 불필요.

**v0.3 재확정**: (1) coverage 점진 상향 (8.1% → 20%+, config/form/fields 테스트) (2) `exactOptionalPropertyTypes` 승격 (430 errors — foundation 파일 대거 수정 필요) (3) `EntityForm<T>` / `FieldValue<T>` generic refactor 로 의도된 any 해소 (4) Playwright 스냅샷 regression suite (DECISIONS #63 권고)

### #66 alpha.45 후속 정비 — ESLint v10 flat config + strict 옵션 + coverage 임계치

alpha.45 배포 직후 CI/품질 gate 정비 3 건을 한 세션에 완료.

1. **ESLint v10 flat config 마이그레이션**. `.eslintrc.json` 은 ESLint v9+ 에서 동작하지 않으나 CI 가 `|| echo "lint warnings"` 로 실패를 숨김 → 로컬/CI 모두 lint 실질 미작동 상태였음. 해결:
   - `eslint.config.mjs` 신규 (flat 포맷). `@eslint/js`, `typescript-eslint`, `globals` 의존성 추가
   - `react.version: 'detect'` → `'18.2'` 하드코드 (eslint-plugin-react 7.x 가 ESLint v10 의 context API 변경으로 detect 실패)
   - **React Hooks v7 의 React Compiler 룰 비활성화**. `recommended` preset 에 포함된 `set-state-in-effect`, `preserve-manual-memoization`, `static-components` 등은 React Compiler 사용자용이며 기존 코드에서 45+9 개 cascading-render 에러 유발. Compiler 미사용 프로젝트에는 noise. `rules-of-hooks` + `exhaustive-deps` 만 유지
   - 30 실제 에러 fix: no-duplicate-case 3 (common/func.ts 의 `case 'dark'` 중복), no-non-null-asserted-optional-chain 7 (`foo?.bar!` → `foo!.bar` 또는 `?? fallback`), no-useless-catch 3, no-useless-assignment 6, no-unused-expressions 2, no-var 1, no-wrapper-object-types 1 (`String` → `string`), rules-of-hooks 6 (4 곳은 useMemo 를 early return 앞으로 hoist, `mustRouter`/`mustUrlState` 2 곳은 eslint-disable + 이유 주석), preserve-caught-error 1 (`throw new Error(msg, { cause: e })`)
   - CI: `npm run lint || echo` → `npm run lint` (실패 시 빌드 fail)

2. **tsconfig strict 옵션 3 개 승격**. `strict: true` + `noImplicitAny: true` (alpha.45) 에 이어:
   - `noImplicitReturns: true` — 2 useEffect 의 조건부 return 에 `return undefined` 명시
   - `noFallthroughCasesInSwitch: true` — **0 errors, 무료 승격**
   - 측정 후 미승격 (v0.3 backlog): `noUncheckedIndexedAccess` (118 errors, 배열/맵 index 전수 점검 필요), `exactOptionalPropertyTypes` (429 errors, optional prop 대거 보수)

3. **Coverage baseline + CI 임계치**. 지금까지 coverage 측정은 가능했으나 CI 검증 없음 → 회귀 감지 불가. 해결:
   - `vitest.config.ts` 에 thresholds 지정: statements 4% / branches 2% / functions 3% / lines 4% (baseline 4.52% / 2.42% / 3.91% / 4.65% 바로 아래)
   - `package.json`: `test:coverage` 스크립트
   - CI: `npm test` → `npm run test:coverage` 로 교체

**Why**: alpha.45 에서 "v0.2 backlog 소진" 으로 v0.2 의 주요 타입 작업은 끝났으나, 실제 OSS 프로젝트 품질 게이트 3 개가 미작동이었음 (lint 미실행 / strict 옵션 제한 / coverage 임계치 없음). 이번 정비로 **CI 가 회귀를 실제로 감지** 하는 상태 달성. 이후부터는 기여자가 type / lint / coverage 중 어느 하나라도 깨면 PR 이 fail.

**배포 필요성 판단**: 모든 변경이 dev-facing (CI / eslint / tsconfig strict / vitest threshold). 런타임 영향 0 — 소비자 (gjcu) 입장에서는 alpha.45 와 동일한 바이너리. 별도 alpha.46 배포 불필요.

**v0.3 목표 갱신**: (1) coverage 점진 상향 (목표 20%+, Field/Config/Form 우선) (2) `noUncheckedIndexedAccess` 승격 (3) `exactOptionalPropertyTypes` 승격 (4) 잔여 의도된 any 를 generic refactor (EntityForm<T>/FieldValue<T>) 로 해소 (5) Playwright 스냅샷 regression suite (DECISIONS #63 권고).

### #65 alpha.45 — v0.2 backlog 소진 (테스트 포팅 + any 정리 + noImplicitAny)

alpha.44 에서 연기한 v0.2 backlog 2 개를 한 세션에서 해소.

1. **테스트 포팅 5 파일**: jest → vitest 포팅이 불완전했던 파일들. 주요 원인 (에이전트가 해결):
   - `require('../../ViewListGrid')` CJS → top-level `import` (vi.mock hoisting 이 spy 로 교체하므로 정상 동작)
   - 폐기된 `vi.requireActual` 호출 (Vitest 에 없음 — `await vi.importActual` 필요) 제거. 그 `misc` mock 은 OSS 추출 후 불필요해짐
   - `vi.fn().mockImplementation(...)` 에 `new` 호출이 불가 → `class MockListGrid` 로 전환
   - `vi.Mock` 타입 → `import { type Mock } from 'vitest'`
   - `.animate-pulse` 기대 셀렉터 → `[class*="rcm-subcollection-skeleton"]` 로 보정 (framework-free 전환 반영)
   - jsdom fetch 가 `AbortController.signal.addEventListener` 요구 → MockAbortController 대신 prototype spy
   - 결과: 33 → **133 tests passing, 8 files**, vitest.config.ts exclude 0

2. **`any` 정리 459 → 328 (−131)**: 3 병렬 에이전트가 영역 분담:
   - B-1 (config/form/misc/message/utils/api/store/common/auth): 208 → 129
   - B-2 (components/fields+form+helper/extensions/adapters/router/menu/_stubs): 189 → 165
   - B-3 (components/list + transfer): 246 → 209
   
   패턴별 처리:
   - `catch (e: any)` → `catch (e: unknown)` + type guard
   - parameter `any` → concrete (`EntityForm` / `RouterApi` / `MouseEvent` / `ReactNode` / `number`)
   - `as any` 불필요한 assertion 제거
   - `[key: string]: any` → `[key: string]: unknown` (host extensibility 유지)
   
   **의도적 유지 (DECISIONS #21)**: generic entity payload (`FieldValue.current/fetched/default`, `data` payload, `FormField<any>`), UIProvider `ComponentType<any>` wrapper props, `parse()` 반환 타입 (consumer 가 즉시 필드 dereference). 예상 잔여 any 는 대부분 이 의도적 카테고리.

3. **`noImplicitAny: true` 승격**: tsconfig.json `noImplicitAny: false` → `true`. 승격 시 TS7006/TS7031 에러 40 개 발생 (20 파일, 대부분 `components/fields/` 의 callback parameter). 에이전트가 일괄 수정:
   - TextInput/SelectBox/Tags 콜백 → concrete `string` 또는 도메인 enum
   - Pagination/MouseEvent 이벤트 핸들러 → concrete
   - 외부 라이브러리 콜백 (FlatPickr / kakao geocoder / ColorInput / Tree renderNode) → 명시적 `any` 또는 concrete
   - 결과: `npm run type-check` PASS, `npm test` 133 passing 유지

**Why**: alpha.44 의 "OSS 공개 준비" 가 형식적 블로커 (라이선스 / 테스트 infra / CI / README) 만 해결했다면, alpha.45 는 실제 품질 블로커 (테스트 커버리지 / 타입 엄격성) 를 올림. `noImplicitAny: true` 는 외부 공개 라이브러리의 기본 기대치.

**한계**: `any` 는 200 목표를 넘어 328 으로 멈춤. 잔여 대부분이 generic entity payload (설계상 의도된 any — 임의 entity 스키마 지원 위해 필수). 더 줄이려면 generic refactor (EntityForm<T> / FieldValue<T>) 필요 — v0.3 작업.

**세션 패턴 재확인**: 메인 context 보호 원칙 (DECISIONS #62) 이 이번에도 유효. 큰 파일 (CardManyToOneView 1,000+ lines, Type.ts 24 any) 은 에이전트가 읽고 고정 포맷 리포트 반환 → 메인은 집계 + 빌드 + 커밋 + 배포만. 블록별 commit 분리 (test / refactor-any / feat-types / chore-bump) 로 각 블록 독립 rollback 가능.

### #64 alpha.44 — OSS 공개 준비 완료 (Apache-2 / 테스트 / CI / README)

alpha.40 에서 framework-free 달성 후, 오픈소스 공개 준비를 위한 4 개 치명적 블로커 해결:

1. **License**: Apache-2.0 전문 LICENSE 파일 추가. `package.json`: `license: "UNLICENSED"` → `"Apache-2.0"`, `private: true` → `false`. description / keywords / author 필드 추가.

2. **Test infra**: vitest + @vitest/coverage-v8 + jsdom + @testing-library/{react,jest-dom} + @testing-library/dom 설치. `vitest.config.ts` 생성 (jsdom env, globals, coverage). 기존 5 테스트 파일 jest → vi API 포팅 (Python 기반 일괄 치환). 33 tests passing (3 파일). 포팅 미완 5 파일은 vitest exclude + v0.2 backlog.

3. **CI**: `.github/workflows/ci.yml` — type-check / lint / format:check / test / build / dist 검증. PR + main push 에서 실행. lint / format drift 는 fail 안 시키되 경고로 리포트.

4. **Consumer README**: 기존 Stage 0~8 내부 로드맵 → `docs/ROADMAP.md` 이동. 새 README 는 소비자용 — Install / Peer deps 표 / Provider 배치 + EntityForm 정의 + JSX 렌더 Quick start / 테마 (토큰 / 다크모드 / classNames) / 아키텍처 다이어그램 / Provider 계약 / 브라우저 지원 / 기여 가이드.

추가 정리:
- ESLint + Prettier 구성 (typescript-eslint + react + react-hooks 플러그인, print-width 100, 2-space). npm run lint / lint:fix / format / format:check.
- console.log/debug: 69 → 9. performanceLogger.ts 의 `configureRuntime({ debugListGridPerformance })` gated logger 만 유지.
- `@ts-ignore`: 3 → 0. jsonUtils.ts 의 replacer/reviver 에 명시 타입. ViewApiSpecification 의 `<pre>{formData}</pre>` 를 `String(formData)` 캐스트로 전환.
- 루트 artifact 정리: alpha19~21 PNG 스크린샷 7 개, `=` 빈 파일, `.playwright-mcp/`, `.mcp.json`, `.idea/`, `.claude/` 모두 제거 + `.gitignore` 보강.

연기 (v0.2 backlog):
- 포팅 실패 5 테스트 파일 (mock 구조 + CJS require 잔재) → 다음 세션.
- `any` 타입 457 개 → 다음 세션. `noImplicitAny: true` 승격 시도 예정.

`docs/NEXT_SESSION.md` 에 다음 세션 플랜 + 에이전트 프롬프트 3 개 (1 테스트 + 3 any 병렬) 준비 완료.

### #63 alpha.37~40 시각 회귀 fix + framework-free 달성

alpha.36 배포 후 사용자 수동 QA 에서 3 건 회귀 발견, alpha.37~39 에서 순차 수정:
- ManyToOneView 찾기 버튼 색상 (Primary(파랑) → Secondary(보라 #805dca)). gjcu 원본의 `bg-secondary` 색 토큰을 rcm 에 미이식했던 것이 원인. `--rcm-color-secondary` 신규 토큰 + `.rcm-m2o-action-btn` / `.rcm-m2o-addon` / `.rcm-m2o-addon-btn` 재정의로 대응.
- SearchBarActions 우측 정렬 실패. `.rcm-listgrid-searchbar` 의 `display: flex` 가 modal 테마 (innerWrapper 빈 문자열) 에서 자식 div 를 자연 너비로 쪼그라뜨려 `rcm-row-between` 의 space-between 이 동작 안 함. `display: flex` → `width: 100%` 블록 전환.
- AdvancedSearch 그리드가 모달에서도 1280px media query 로 3 columns 됨. `@media` → `@container` query 전환으로 해결. `.rcm-adv-search-inner` 에 `container-type: inline-size` 지정, 640px (2 cols) / 1200px (3 cols) 컨테이너 breakpoint.

alpha.40: 잔여 Tailwind/gjcu-custom 하드코딩 전량 제거. 3 블록 병렬 에이전트 (list/form/fields) + 메인 theme fallback 정리. 변경 파일 18, 신규 CSS 규칙 ~30. grep 최종 검증 결과 `src/**/*.tsx` 에서 Tailwind utility/gjcu-custom 참조 **0건**.

**Why**: 오픈소스 품질 달성의 최대 블로커였음. 라이브러리가 Tailwind 설치 없이 정상 동작해야 함. 이번 작업으로 호스트는 `@rcm/listgrid/styles.css` 한 줄 import 만으로 완전 동작 확인.

**검증 도구 개선 필요**: 시각 회귀 3건 모두 HTTP 303 통과 후 사용자 수동 QA 에서 발견. Playwright 스냅샷 regression suite 가 다음 세션 Top priority.

### #62 메인 세션 context 보호 원칙 공식화
장기 리팩터 세션에서 "컴포넌트 소스 전체 읽기" 는 메인 context 폭증의 주범. 이번 세션에서 확립된 규칙:
1. 컴포넌트 JSX 읽기 / CSS 블록 grep 은 **에이전트**가 수행
2. 메인은 (a) 에이전트 프롬프트 작성 (b) 리포트 집계 (c) 전역 파일 (base.css, package.json) 일괄 편집 (d) 빌드 / 커밋 / 배포 만 담당
3. 에이전트 리포트 포맷은 **구조화된 마크다운 템플릿** 강제 → 메인 파싱 비용 최소화
4. 블록별 commit 분리 → 회귀 시 특정 commit 만 rollback
**Why**: Opus 4.7 1M context 라도 4,390 줄 base.css + 600+ 줄 JSX 를 9 번 (각 블록 + split + cleanup) 반복 읽으면 한 세션이 200k+ 토큰 소비. 에이전트 격리 시 메인은 ~30k 선 유지 가능 → 한 세션에서 Phase 6 잔여 + 7 + 8 (3 phase) 완료 달성.
**적용 범위**: 향후 Phase 9 (v0.2 cleanup) 도 동일 패턴. 새 기능 개발 (non-refactor) 도 큰 파일이 관여하면 동일하게 적용.
