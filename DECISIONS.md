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

## Open Questions

작업 중 떠오른 미결 이슈. 결정되면 날짜 로그로 이동.

- **UI 킷 주입 계약**: 첫 어댑터를 HeroUI / shadcn / tailwind-only 중 어디로 만들지. Stage 3에서 결정.
- **외부 라이브러리 분류**: flatpickr / tiptap / kakao-map / xlsx-js-style 등을 core 번들에 둘지 optional peer로 뺄지. Stage 4에서 결정.
- **rcm-framework 백엔드 API 계약**: 응답/요청 스키마를 어디서 어떻게 타입화할지. 백엔드 OpenAPI/Swagger 스펙이 있으면 그걸로 생성, 없으면 수동 정의. Stage 5에서 결정.
- **패키지 배포 채널**: 사내 npm registry / GitHub Packages / 그냥 git 의존성 중 무엇으로 배포할지. 첫 외부 소비자가 정해질 때 결정.
- **테스트 전략**: 원본에 있던 `config/__tests__`를 그대로 가져왔음. jest 설정을 새로 구성할지, Stage 6에서 재작성할지 미정.
