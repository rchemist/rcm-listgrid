# Roadmap

`@rchemist/listgrid`가 어디로 향하고 있는지에 대한 문서. 현재 버전(`v0.2.0`)까지의 세부 변경 이력은 [`CHANGELOG.md`](../CHANGELOG.md)에 있고, 이 문서는 **앞으로 할 일**만 다룬다.

---

## 다음 마일스톤

### UIProvider reference adapter

`UIProvider`가 요구하는 ~50개 primitive 계약(Button / Modal / Table / Tooltip / Select 등)을 주류 headless 킷(HeadlessUI + Tailwind 기준)으로 구현한 1-차 어댑터. 별도 패키지 또는 `@rchemist/listgrid/adapters/headless-tailwind` 서브 경로로 제공될 예정. 이게 있어야 호스트 앱이 "설치 후 바로 실행"이 가능해진다.

### `examples/minimal`

`git clone → npm install → npm run dev` 3단계로 동작하는 Next.js + `@rchemist/listgrid` + reference adapter 최소 예제. README의 quick-start를 end-to-end로 검증하는 샘플 앱.

### Playwright visual regression suite

Primitive 스냅샷(button variants / modal / table / tab) + 다크모드 + container query 레이아웃에 대한 회귀 테스트. CI 통합.

---

## v1.0 안정화 조건

- 공개 surface의 `@deprecated` / `@experimental` 마커 0개
- 최소 1개 외부 프로젝트가 `@rchemist/listgrid`를 production에서 사용
- 브라우저 호환 범위 2023+ 유지, bundle size 예산 설정, test coverage 40% (현재 ~17%)
- 공개 API 계약 freeze → semver 하에서 breaking은 다음 major에서만

---

## 장기 비전

1. **Framework-free CRUD UI의 reference engine** — React 생태계의 Next.js / Vite / Remix / Tanstack Router 어디에 떨어져도 동작하는 단일 엔진. UI 킷 선택은 호스트 자유.
2. **Backend adapter 다변화** — 현재는 RCM-framework의 JSON 응답 래퍼(`ResponseData<T>`) 전제. 향후 `ApiClient` 위에 얇은 어댑터 계층을 둬서 generic REST / GraphQL / tRPC / Python(DRF) 스타일의 응답 스키마도 지원.
3. **Design system 독립 재사용** — `tokens.css` + `primitives.css` + `layouts.css`를 `@rchemist/primitives` 같은 별도 패키지로 분리해 listgrid를 쓰지 않는 프로젝트도 동일한 visual vocabulary를 채택 가능하게.

---

## Non-goals (명시적 스코프 제외)

의도적으로 스코프 밖. 수요가 있어도 이 리포는 다루지 않음.

- **실시간 sync / WebSocket 기반 라이브 업데이트** — 호스트의 상태 계층이 책임 (React Query / SWR / Zustand 등)
- **Optimistic UI / 뮤테이션 큐** — 동일하게 호스트 데이터 레이어 책임
- **Offline-first / service worker 캐싱** — 범위 외
- **Vue / Svelte / Angular 포팅** — React 전용
- **Visual form builder / drag-drop 스키마 에디터** — 라이브러리는 선언적 entity metadata를 소비할 뿐. 스키마 저작은 호스트 관심사
- **복잡한 차트 / 분석 대시보드** — ListGrid는 CRUD에 집중. 시각화는 별도 라이브러리
