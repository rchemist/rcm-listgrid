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

### Stage 1 — Inert Copy (진행 중)

원본 파일을 `src/`에 그대로 복사. 타입 에러는 최소 패치(stub)로만 해결.
이 단계가 끝난 시점의 커밋이 "원본 동작"의 기준점이 됩니다.

**Done when:**
- [x] 원본 `packages/ui/listgrid/`의 모든 `.ts`/`.tsx` 파일이 `src/`에 복사됨
- [x] 원본 대비 `src/` 파일 내용 수정 0 (복사만, 수정·삭제 없음)
- [ ] `npm install` 성공
- [ ] `npm run type-check` 통과 (stub 허용, 로직 수정 금지)

### Stage 2 — Auth 분리

`@gjcu/ui/auth` 직접 의존을 제거하고 `AuthProvider` / `useAuth` 계약으로 주입.

**Done when:**
- [ ] `src/` 내 `@gjcu/ui/auth` 직접 import 0개
- [ ] `AuthProvider` 계약이 `DECISIONS.md`에 문서화됨
- [ ] `npm run type-check` 통과

### Stage 3 — UI 프리미티브 추상화

`@gjcu/ui/elements/*`, `@gjcu/ui/form/*`, `@gjcu/ui/modals` 등 UI 킷 결합을
`UIProvider` 계약으로 교체.

**Done when:**
- [ ] `src/` 내 `@gjcu/ui/*` 직접 import 0개
- [ ] `UIProvider` 계약(Button / Modal / Table / Alert 등 최소 인터페이스) 문서화
- [ ] 최소 1개 어댑터 레퍼런스 구현으로 동작 증명

### Stage 4 — 외부 라이브러리 정리

flatpickr / tiptap / kakao-map / xlsx-js-style 등 무거운 의존성을 검토해
`dependencies` / `peerDependencies` / optional로 재분류.

**Done when:**
- [ ] 모든 외부 의존성이 core / peer / optional 중 하나로 명시적으로 분류됨
- [ ] optional 의존성은 README에 사용법과 함께 명시
- [ ] core 번들 크기가 측정·기록됨

### Stage 5 — 백엔드 계약 명시화

rcm-framework 백엔드의 요청/응답 스키마를 타입으로 고정. API 클라이언트를
Provider로 주입 가능하게.

**Done when:**
- [ ] API 요청/응답 타입이 `src/` 내부에 명시적으로 정의됨(암묵적 `any` 제거)
- [ ] `ApiClientProvider` 또는 동등한 주입 지점 존재
- [ ] 백엔드 버전 호환 범위가 README에 명시됨

### Stage 6 — 필드/폼 로직 정리

마지막 단계. 껍질이 다 정리된 뒤 내부 로직 중복 제거, 공개 API 문서화,
실전 검증.

**Done when:**
- [ ] 공개 API가 `src/index.ts`에서 명시적으로 export되고 문서화됨
- [ ] 최소 1개 외부 프로젝트에 통합되어 실전 동작 확인
- [ ] `DECISIONS.md`의 Open Questions 남김 없이 정리됨

## 정책

- **동기화 방향**: `gjcu-academic-front` → 이 리포 (단방향)
- **UI 킷**: 비의존(Provider 주입) 방향. 초기 어댑터는 추후 결정.
- **React 버전**: peerDependencies `>=18` (원본은 19 사용 중)
- **결정 기록**: 모든 비자명한 결정은 작성 직후 [`DECISIONS.md`](./DECISIONS.md)에 append.
