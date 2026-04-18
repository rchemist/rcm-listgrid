# @rcm/listgrid

RCM-framework 백엔드를 기반으로 CRUD UI를 빠르게 구성하기 위한 범용 ListGrid 엔진.

## 기원

`gjcu-academic-front/packages/ui/listgrid` (납품 프로젝트 내부에서 대폭 수정된 버전)을
스냅샷으로 복사해 범용화 작업을 진행하는 리포지터리입니다.

원본 프로젝트는 계속 독립적으로 유지보수되며, 이 리포로 자동 반영되지 않습니다.
납품 프로젝트의 개선사항은 수동 cherry-pick으로만 반영합니다(단방향).

모든 비자명한 결정은 [`DECISIONS.md`](./DECISIONS.md)에 기록되어 있습니다.
작업 시작 전 먼저 읽어주세요.

## 로드맵

범용화는 "껍질 → 안쪽" 순서로 진행합니다. 각 Stage는 아래 `Done when:` 체크리스트가
모두 만족돼야 다음 Stage로 넘어갑니다.

### Stage 0 — 스캐폴딩 ✅

프로젝트 초기화, 빌드 도구 세팅.

**Done when:**
- [x] `git init`, `package.json`, `tsconfig.json`, `.gitignore`, `README.md` 존재
- [x] DECISIONS.md 도입
- [x] 첫 커밋 찍힘

### Stage 1 — Inert Copy ✅

원본 파일을 `src/listgrid/`에 그대로 복사(구조 재배치로 한 단계 내림, DECISIONS #10 참고).
타입 에러는 최소 패치(stub + 9줄의 `@ts-expect-error STAGE1-baseline`)로만 해결.
이 단계가 끝난 시점의 커밋이 "원본 동작"의 기준점입니다.

**Done when:**
- [x] 원본 `packages/ui/listgrid/`의 모든 `.ts`/`.tsx` 파일이 `src/listgrid/`에 복사됨
- [x] 원본 대비 소스 파일 로직 수정 0 (9줄 `@ts-expect-error` 주석만 추가, DECISIONS #12)
- [x] `npm install` 성공
- [x] `npm run type-check` 통과 (stub + 의도적 편차 9줄 포함)

### Stage 2 — Auth 분리 ✅

`@gjcu/ui/auth` 직접 의존을 제거하고 `AuthProvider` / `useSession` 계약으로 주입.

**Done when:**
- [x] `src/` 내 `@gjcu/ui/auth` 직접 import 0개 (45개 파일 bulk 치환)
- [x] `AuthProvider` 계약이 `DECISIONS.md` #16에 문서화됨
- [x] `npm run type-check` 통과

### Stage 3 — UI 프리미티브 추상화 ✅ (레퍼런스 어댑터 제외)

`@gjcu/ui/elements/*`, `@gjcu/ui/form/*`, `@gjcu/ui/modals` 등 UI 킷 결합을
`UIProvider` 계약으로 교체. 순수 로직·유틸·도메인 모델은 listgrid로 inline.

**Done when:**
- [x] `src/` 내 `@gjcu/ui/*`·`@gjcu/shared`·`@gjcu/entities/*` 직접 import 0개 (검증: grep)
- [x] `UIProvider` 계약(Alert/Badge/Button/Modal/Table/Tree 등 ~50개 컴포넌트) 문서화 (DECISIONS #19~#22)
- [x] 보조 Provider: `MessageProvider`, `LoadingStore`, `ModalManagerStore`, `AuthProvider`(#16), SessionProvider·FieldExtensions registry
- [ ] 최소 1개 어댑터 레퍼런스 구현 — **Stage 6/별도 후속**으로 미룸(계약과 레퍼런스 구현 분리)

### Stage 4 — 외부 라이브러리 정리 ✅

원본 `packages/ui` `dependencies` 60개 중 실제 사용되는 것만 남기고, 사용처 폭에 따라
core / required peer / optional peer로 재분류.

**Done when:**
- [x] 모든 외부 의존성이 core / peer / optional 중 하나로 명시적으로 분류됨
- [x] optional 의존성은 README에 사용법과 함께 명시 (아래)
- [x] core 번들 크기가 측정·기록됨 (src 2.3M, `node_modules` 180 패키지로 축소; 원본 기준 321 패키지에서 141개 제거)

**분류:**

| 범주 | 항목 | 목적 |
|------|------|------|
| **dependencies** (core, 5) | `clsx`, `tailwind-merge`, `uuid`, `zustand`, `crypto-js` | 라이브러리 자체 구현에 직접 사용되는 유틸/상태 |
| **peerDependencies (required, 6)** | `react`, `react-dom`, `next`, `nuqs`, `@tabler/icons-react`, `@headlessui/react` | 호스트 앱이 반드시 제공. React/Next 런타임 + 아이콘/헤드리스 UI 토대 |
| **peerDependencies (optional, 10)** | `@iconify/react`, `react-select`, `react-sortablejs`, `qrcode.react`, `react-kakao-maps-sdk`, `react-daum-postcode`, `xlsx-js-style`, `file-saver`, `sweetalert2`, `sweetalert2-react-content` | 특정 필드·트랜스퍼 기능 사용 시에만 필요 |

**제거된 44개 의존성:** `@floating-ui/react`, `@fullcalendar/*`, `@tippyjs/react`, `@tiptap/*`, `apexcharts`, `axios`, `dompurify`, `flatpickr`, `lucide-react`, `nprogress`, `quill`, `react-animate-height`, `react-apexcharts`, `react-flatpickr`, `react-perfect-scrollbar`, `react-popper`, `react-quilljs`, `react-to-print`, `sortablejs`, `tippy.js`, 기타 — 원본 `packages/ui` 전체가 쓰던 의존성이지만 listgrid 내부에선 참조 없음.

**Optional peer 사용 가이드:**
- `@iconify/react`: 일부 필드의 icon prop으로 사용 가능.
- `react-select`, `react-sortablejs`: 필드 내부 UI (host가 UIProvider로 다른 구현을 내려주면 불필요).
- `qrcode.react`: `QrField` 사용 시.
- `react-kakao-maps-sdk`: `AddressMapField` / 지도 필드 사용 시.
- `react-daum-postcode`: 한국 주소 우편번호 검색 사용 시.
- `xlsx-js-style` + `file-saver`: Excel 익스포트 (`DataExporter`, `ExcelProvider`) 사용 시.
- `sweetalert2` + `sweetalert2-react-content`: `ViewApiSpecification`, `XrefPriceMappingView`가 직접 사용. 향후 Stage 6에서 `MessageProvider`로 치환 예정.

### Stage 5 — 백엔드 계약 명시화 ✅

rcm-framework 백엔드의 요청/응답 스키마를 타입으로 고정. API 클라이언트를
registry로 주입 가능하게.

**Done when:**
- [x] API 요청/응답 타입이 `src/listgrid/api/types.ts`에 명시 — `IEntityError`, `IEntityErrorBody`, `ResponseData<T>` (class + `isError()` 메서드)
- [x] `configureApiClient()` 주입 지점 존재 (`src/listgrid/api/ApiClient.ts`). `ApiClient` 인터페이스: `callExternalHttpRequest(options)`, `getExternalApiData(urlOrOptions)`, `getExternalApiDataWithError(urlOrOptions)`
- [x] 백엔드 호환 범위 README에 명시 (아래)

**백엔드 호환:**
- `rcm-framework` Java 백엔드 (Spring Boot 3.x 기반) 프로젝트용으로 설계.
- 요청은 JSON body 또는 SearchForm. 응답은 `{data, status, error?, entityError?}` 래퍼.
- `IEntityError.fieldError`는 Map 또는 Record 양쪽 형태 모두 파싱 (호환).
- host의 ApiClient 구현은 HTTP transport(fetch/axios/next-server-actions)·auth header·CSRF·재시도 정책을 책임짐. 라이브러리는 transport를 알지 않음.

### Stage 7 — Framework-free + Next.js 어댑터 ✅

Next.js 14/15/16 간의 파괴적 변경, 그리고 Python 백엔드 + Vite/Remix 등 non-Next 프로젝트 수요에 대응하기 위해 core를 framework-free로 만들고 Next.js 어댑터를 subpath로 분리.

**Done when:**
- [x] `grep next/dist src/listgrid = 0` — internal Next API (`hexHash`, `AppRouterInstance`, `unstable_noStore`) 모두 제거
- [x] `grep next/dynamic src/listgrid = 0` — `React.lazy + Suspense` 기반 `utils/lazy.tsx`로 대체
- [x] `grep next/navigation src/listgrid = 0` — `RouterProvider` + `useRouter/usePathname/useParams/useSearchParams/Link` (listgrid/router)
- [x] `grep next/link src/listgrid = 0` — 동일하게 `Link`는 `RouterProvider`가 제공
- [x] `grep nuqs src/listgrid = 0` — `UrlStateProvider` + `useQueryStates/createParser/parseAsString` (listgrid/urlState)
- [x] `@rcm/listgrid-next` 어댑터 동작 — `src/adapters/next/` 에서 `next/navigation`, `next/link`, `nuqs` 바인딩. `@rcm/listgrid/next` subpath로 export
- [x] `next`, `nuqs`가 **optional peer**로 이동 — non-Next 프로젝트는 `next`/`nuqs` 설치 불필요

**Next.js 사용처:**
```tsx
import { RouterProvider, UrlStateProvider } from '@rcm/listgrid';
import { nextRouterServices, nextUrlStateServices } from '@rcm/listgrid/next';

<RouterProvider value={nextRouterServices}>
    <UrlStateProvider value={nextUrlStateServices}>
        <AuthProvider session={...}>
            <UIProvider components={...}>
                <YourApp />
            </UIProvider>
        </AuthProvider>
    </UrlStateProvider>
</RouterProvider>
```

**다른 프레임워크(React Router / Remix / Tanstack Router / 자체):**
별도 어댑터를 만들어 `RouterProvider`와 `UrlStateProvider`에 주입하면 됩니다. 계약은 `RouterServices`, `UrlStateServices` 타입 참고.

### Stage 6 — 필드/폼 로직 정리 ✅ (실전 통합 검증 제외)

마지막 단계. 껍질이 다 정리된 뒤 내부 로직 중복 제거, 공개 API 문서화.

**Done when:**
- [x] 공개 API가 `src/listgrid/index.ts`에서 명시적으로 export되고 문서화됨 (`AuthProvider`, `UIProvider`, `configureMessages`, `configureApiClient`, `registerSignOut`, `registerSmsHistoryField`, `registerMenuPermissionChecker` 등 모든 host 주입 계약)
- [ ] 최소 1개 외부 프로젝트에 통합되어 실전 동작 확인 — 소비 프로젝트 확정 시 실행 (후속 작업). 현재는 `npm run type-check` 통과까지가 라이브러리의 책임.
- [x] `DECISIONS.md`의 Open Questions 중 Stage 작업으로 해소 가능한 것은 모두 정리됨 (배포 채널·테스트 전략·실전 검증 3개만 후속 파킹)

## 사용 (Host 프로젝트 기준)

```tsx
import {
    AuthProvider,
    UIProvider,
    configureMessages,
    configureApiClient,
    registerSignOut,
    registerMenuPermissionChecker,
    registerSmsHistoryField,
    configureAssetServerUrl,
} from '@rcm/listgrid';

// 1. 부트스트랩 시 host-주입 계약 등록 (bootstrap.ts 등에서 한 번만)
configureApiClient({
    async callExternalHttpRequest(opts) { /* fetch/axios/... */ },
    async getExternalApiData(urlOrOptions) { /* ... */ },
    async getExternalApiDataWithError(urlOrOptions) { /* ... */ },
});
configureMessages({
    showAlert: async (options) => { /* 커스텀 Alert */ },
    showConfirm: async (options) => { /* 커스텀 Confirm, true/false 반환 */ },
    // showError / showSuccess / showToast / openToast / clearAllToasts
});
registerSignOut(async () => { /* host의 signOut 로직 */ });
registerMenuPermissionChecker(async ({ url, alias }) => 'ALL' /* 'READ' | 'NONE' */);
configureAssetServerUrl('https://assets.example.com');

// 2. 앱 트리 루트에서 Provider 래핑
<AuthProvider session={mySession}>
    <UIProvider components={{ Button, Modal, Table, Alert, /* ~50개 */ }}>
        <YourApp />
    </UIProvider>
</AuthProvider>
```

공개 API 전체 목록: `src/listgrid/index.ts` 참고 (기존 ViewListGrid / ViewEntityForm / EntityForm / EntityField / SearchForm / PageResult 등 모든 기존 export 그대로 유지).

## 주요 Provider/Registry 맵

| 카테고리 | Provider/Registry | 설명 |
|---------|-------------------|------|
| Session/Role | `AuthProvider`, `useSession`, `useAuth`, `hasAnyRole` | 세션 상태, 역할 체크 |
| UI 컴포넌트 | `UIProvider`, `useUI` | ~50개 UI 컴포넌트 주입 |
| 메시지 | `configureMessages` + `showAlert`/`showConfirm`/... | 전역 토스트·알림·확인창 |
| 로딩 | `configureLoading` + `useLoadingStore` | 전역 로딩 오버레이 |
| 모달 | `useModalManagerStore` (zustand 내장) | 모달 스택 관리 |
| API | `configureApiClient` + ApiClient 계약 | 백엔드 호출 추상 |
| 인증 액션 | `registerSignOut` → `signOut()` | 세션 종료 |
| 필드 확장 | `registerSmsHistoryField` → `createSmsHistoryField()` | 도메인 필드 주입 |
| 메뉴 권한 | `registerMenuPermissionChecker` → `checkAdminMenuPermission()` | URL 기반 권한 게이팅 |

## 정책

- **동기화 방향**: `gjcu-academic-front` → 이 리포 (단방향)
- **UI 킷**: 비의존(Provider 주입) 방향. 초기 어댑터는 추후 결정.
- **React 버전**: peerDependencies `>=18` (원본은 19 사용 중)
- **결정 기록**: 모든 비자명한 결정은 작성 직후 [`DECISIONS.md`](./DECISIONS.md)에 append.
