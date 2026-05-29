# PROGRESS — 남은 열린 이슈(#1·#2·#5·#6) 정리 및 해소

**Created**: 2026-05-29
**Status**: in_progress
**Push**: manual
**Next session policy**: Continue current session — 모두 동일 repo(rcm-listgrid) frontend, 독립 task
**Last updated**: 2026-05-29 (#1·#5·#6 구현 완료 · 전체 914 tests green · #2 설계방향(A 추천) 승인대기)

## Goal
edustack XI-G 표준감사(2026-05-10) 발 6개 이슈 중 **노후화 2건(#3·#4)은 close 완료**. 남은 **4건(#1·#2·#5·#6)** 을 코드 대조로 판단 확정하고, 승인 시 순차 해소한다. 완료 시점에 4건 모두 fix 또는 명시적 close 상태가 되는 것이 목표.

## Context
- Repo: `/Users/kunner/IdeaProjects/rcm-listgrid` (현재 v0.3.8, npm 공개 publish 운영)
- Backend 진실의 원천: `/Users/kunner/IdeaProjects/rcm-backend-framework/core/rcm-core-search/`
  - `SearchRequest.java` — `List<SortInfo> sorts`, `LinkedHashMap<LogicalOperator,List<FilterItem>> filters`
  - `SortInfo.java`(sealed, `@JsonTypeInfo type=NORMAL|PRIORITY` default NORMAL) / `NormalSortInfo.java`(`field,direction,joinType,nullsFirst`) / `Direction.java`(`ASC|DESC`)
- 관련 프론트 파일:
  - `src/listgrid/form/SearchForm.ts` (#1)
  - `src/listgrid/form/Type.ts` (#1·#6)
  - `src/listgrid/ui/UIProvider.tsx`, `src/listgrid/ui/index.ts`, `docs/PRIMITIVES.md` (#2)
  - `src/listgrid/components/list/ViewListGrid.tsx`, `src/listgrid/view/ViewListGridWrapper.tsx`, `src/listgrid/urlState/` (#5)
  - `src/listgrid/api/ApiClient.ts`, `src/listgrid/api/types.ts`, `README.md`, `docs/getting-started.md` (#6)
- 처리 완료: #3 (npm publish 확인 → close), #4 (publish로 근본해소 + peerDeps → close)
- 사용자 결정 기록: 1차로 #1·#2 "판단만", #5·#6 "보류" → 본 PROGRESS로 4건 모두 추적 전환

## Progress State

| Phase | Status | Summary | Detail |
|-------|--------|---------|--------|
| 판단(verify) | ✅ | 6건 전수 코드 대조 · #3·#4 close · #1 backend 계약 확정 | 본 문서 §Tasks 판단란 |
| 해소(resolve) | [~] 진행 | #1·#5·#6 ✅ / #2 승인대기 | 본 문서 §Tasks |

**Progress notes**:
- Reorder: #6 → #5 보다 먼저 — #6(JSDoc+README+방어wrap)이 더 안전/단순, #5(ViewListGrid Suspense)는 렌더 변경 동반.
- #2 설계방향: (A) headless named export + `/headless` subpath 추천(explicit>implicit, tree-shakeable, Radix/HeadlessUI 생태계 정합). 47 컴포넌트 작성은 큰 작업 → 별도 승인 시 착수.

## Tasks

우선순위: #1(실버그·HIGH) → #2(기능) → #5(부분·마무리) → #6(부분·문서+방어). 각 task 의 *판단*은 완료, *구현*은 [ ].

- [x] **#1 SearchForm.sorts wire 직렬화** ✅ 2026-05-29 · toJSON(sorts→객체배열·filters→AND/OR객체·subFilters재귀) + deserialize backend SortInfo 객체배열 인식 + 다중정렬 순서보존 · 912 tests green · [detail](progress-archive/phase-resolve-tasks.md#1-searchformsorts-wire-직렬화-정합--2026-05-29)

- [ ] **#2 default/headless UI primitive 셋 노출 — consumer 47 stub 부담 제거** — 🟡 MEDIUM 기능
  - **판단(완료)**: `UIProvider` 는 여전히 47개 필수 prop 요구, 누락 시 throw(`UIProvider.tsx`). `headless`/`MinimalUIComponents` export·`/headless` subpath 없음. `docs/PRIMITIVES.md`는 CSS 프리미티브라 별개. 미해결.
  - **방향(택1, 구현 시 결정)**: (A) `headlessUIComponents` named export + `@rchemist/listgrid/headless` subpath, (C) `UIProvider` 미지정 component default fallback.
  - **Reuse review**: (구현 착수 시 필수) `rcm-listgrid-sample`/내부 minimal provider 패턴 재사용 검토.
  - **Changed files**: `src/listgrid/ui/`, `src/index.ts`, `package.json` exports
  - **Verification**: headless 셋만으로 UIProvider 렌더 + type-check

- [x] **#5 Next.js prerender Suspense — bare ViewListGrid 내부 감쌈** ✅ 2026-05-29 · ViewListGrid inner/outer 분리 + outer 가 `<Suspense fallback={Skeleton}>` 으로 hook 상위 경계 제공 · consumer page Suspense 0 · 914 tests green · [detail](progress-archive/phase-resolve-tasks.md#5-nextjs-prerender-suspense--bare-viewlistgrid-내부-감쌈--2026-05-29)

- [x] **#6 host ApiClient envelope 명시 + 방어적 wrap** ✅ 2026-05-29 · ApiClient JSDoc(envelope 계약) + README quick-start ResponseData wrap 교정 + Type.ts `payload=data??response` 방어 fallback · 914 tests green · [detail](progress-archive/phase-resolve-tasks.md#6-apiclient-envelope-명시--방어적-wrap--2026-05-29)

## Open Questions
- **구현 착수 승인**: 사용자가 1차로 #1·#2 "판단만"·#5·#6 "보류"를 지정함. 본 PROGRESS는 추적용으로 4건 모두 [ ] 등록. **어느 이슈부터 실제 구현할지**는 사용자 결정 사항(코드/문서로 추론 불가한 우선순위·범위) → 승인 시 #1부터 진행.
- #2·#5·#6 의 fix 방향(A/B/C)은 기능적으로 등가에 가까운 선택지 → 착수 시 1줄 확인 또는 기본안(A) 자동선택.

## Completion Summary (fill when closing)
(미완)
