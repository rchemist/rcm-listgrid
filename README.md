# @rcm/listgrid

RCM-framework 백엔드를 기반으로 CRUD UI를 빠르게 구성하기 위한 범용 ListGrid 엔진.

## 기원

`gjcu-academic-front/packages/ui/listgrid` (납품 프로젝트 내부에서 대폭 수정된 버전)을
스냅샷으로 복사해 범용화 작업을 진행하는 리포지터리입니다.

원본 프로젝트는 계속 독립적으로 유지보수되며, 이 리포로 자동 반영되지 않습니다.
납품 프로젝트의 개선사항은 수동 cherry-pick으로만 반영합니다(단방향).

## 로드맵

범용화는 "껍질 → 안쪽" 순서로 진행합니다.

- [ ] **Stage 0 — 스캐폴딩** (현재)
  프로젝트 초기화, 빌드 도구 세팅.

- [ ] **Stage 1 — Inert Copy**
  원본 파일을 그대로 `src/`에 복사.
  타입 에러 최소 패치만 해서 `tsc --noEmit` 통과시키기.
  이 시점의 첫 커밋이 "원본 동작"의 기준점.

- [ ] **Stage 2 — Auth 분리**
  `@gjcu/ui/auth` 의존 → `AuthProvider` 주입 패턴으로 전환.

- [ ] **Stage 3 — UI 프리미티브 추상화**
  `Button`/`Modal`/`Table`/`Alert` 등 UI 킷 결합을 Provider 계약으로 교체.

- [ ] **Stage 4 — 외부 라이브러리 정리**
  flatpickr / tiptap / kakao-map 등 무거운 의존성 optional peer로 전환.

- [ ] **Stage 5 — 백엔드 계약 명시화**
  rcm-framework 백엔드 응답/요청 스키마를 타입으로 고정.

- [ ] **Stage 6 — 필드/폼 로직 정리**
  마지막 단계. 껍질이 다 정리된 뒤에 손대기.

## 정책

- **동기화 방향**: `gjcu-academic-front` → 이 리포 (단방향)
- **UI 킷**: 비의존(Provider 주입) 방향. 초기 어댑터는 추후 결정.
- **React 버전**: peerDependencies `>=18` (원본은 19 사용 중)
