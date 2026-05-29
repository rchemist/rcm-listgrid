# PROGRESS — 남은 열린 이슈(#1·#2·#5·#6) 정리 및 해소

**Created**: 2026-05-29
**Status**: completed
**Push**: manual
**Next session policy**: Continue current session — 모두 동일 repo(rcm-listgrid) frontend, 독립 task
**Last updated**: 2026-05-29 (4건 main+release/0.2 양쪽 반영 완료 · 919 tests green 양쪽 · push 미실행(manual) · GitHub 이슈 close 대기)

## Goal
edustack XI-G 표준감사(2026-05-10) 발 6개 이슈 중 **노후화 2건(#3·#4)은 close 완료**. 남은 **4건(#1·#2·#5·#6)** 을 코드 대조로 판단 확정하고 순차 해소한다.
**제약(2026-05-29 사용자 지시): 모든 변경은 v0.3.x(`main`) + v0.2.x(`release/0.2`) 양쪽에 반영해야 한다.**

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
| 해소(resolve, main/v0.3.x) | ✅ | #1·#2·#5·#6 전부 구현 · 919 tests green | 본 문서 §Tasks |
| 백포트(release/0.2, v0.2.x) | ✅ | 4건 backport 1커밋(393fc4e) · 919 tests green · build OK | 본 문서 §Backport |

**Progress notes**:
- Reorder: #6 → #5 보다 먼저 — #6(JSDoc+README+방어wrap)이 더 안전/단순, #5(ViewListGrid Suspense)는 렌더 변경 동반.
- #2 설계방향: (A) headless named export + `/headless` subpath 추천(explicit>implicit, tree-shakeable, Radix/HeadlessUI 생태계 정합). 47 컴포넌트 작성은 큰 작업 → 별도 승인 시 착수.

## Tasks

우선순위: #1(실버그·HIGH) → #2(기능) → #5(부분·마무리) → #6(부분·문서+방어). 각 task 의 *판단*은 완료, *구현*은 [ ].

- [x] **#1 SearchForm.sorts wire 직렬화** ✅ 2026-05-29 · toJSON(sorts→객체배열·filters→AND/OR객체·subFilters재귀) + deserialize backend SortInfo 객체배열 인식 + 다중정렬 순서보존 · 912 tests green · [detail](progress-archive/phase-resolve-tasks.md#1-searchformsorts-wire-직렬화-정합--2026-05-29)

- [x] **#2 default/headless UI primitive 셋 노출** ✅ 2026-05-29 · (A) `headlessUIComponents` + `@rchemist/listgrid/headless` subpath · sample MinimalUIProvider 흡수(49 컴포넌트) · 919 tests green · build OK · [detail](progress-archive/phase-resolve-tasks.md#2-defaultheadless-ui-primitive-셋-노출--2026-05-29)

## Backport (release/0.2 = v0.2.x)

전제: main↔release/0.2 의 대상 파일은 `Type.ts`·`package.json` 빼고 **전부 IDENTICAL** → 동일파일은 `git checkout main -- <file>`, divergent 만 수동.

- [x] **B1 동일파일 포팅(#1·#5·#2 + #6 ApiClient/README)** ✅ 2026-05-29 · `git checkout main --` 로 8파일(IDENTICAL base) 가져옴.
- [x] **B2 divergent 수동 적응** ✅ 2026-05-29 · `Type.ts` v0.2.x 구조에 `payload=data??response` 방어 적용 + `package.json` `./headless` subpath 추가(version 0.2.22 유지). type-check+919 tests+build 전부 green. 1커밋 `393fc4e`.

- [x] **#5 Next.js prerender Suspense — bare ViewListGrid 내부 감쌈** ✅ 2026-05-29 · ViewListGrid inner/outer 분리 + outer 가 `<Suspense fallback={Skeleton}>` 으로 hook 상위 경계 제공 · consumer page Suspense 0 · 914 tests green · [detail](progress-archive/phase-resolve-tasks.md#5-nextjs-prerender-suspense--bare-viewlistgrid-내부-감쌈--2026-05-29)

- [x] **#6 host ApiClient envelope 명시 + 방어적 wrap** ✅ 2026-05-29 · ApiClient JSDoc(envelope 계약) + README quick-start ResponseData wrap 교정 + Type.ts `payload=data??response` 방어 fallback · 914 tests green · [detail](progress-archive/phase-resolve-tasks.md#6-apiclient-envelope-명시--방어적-wrap--2026-05-29)

## Open Questions
- ~~구현 착수 승인~~ → 해결: "작업을 진행해" 로 #1→#6→#5→#2 순 구현 승인.
- ~~#2 방향(A/C)~~ → 해결: 사용자 "A 로 하자" → headless named export + subpath.
- **남은 후속(사용자 결정)**: (1) `git push`(main +4, release/0.2 +1) 실행 여부 — 현재 manual 미실행. (2) GitHub 이슈 #1·#2·#5·#6 구현 코멘트+close (`/issue:finalize`). (3) 양쪽 라인 release(version bump + publish).

## Completion Summary
6개 열린 이슈 전수 판단 → #3·#4 노후화로 close(코멘트 후). 남은 4건(#1 SearchForm 직렬화 실버그 / #6 ApiClient envelope / #5 prerender Suspense / #2 headless UI export) 을 **v0.3.x(main) + v0.2.x(release/0.2) 양쪽**에 반영.
- main: 5커밋(72dc631 #1, b60fe73 #6, 4f936dd #5, ebf1e94 #2) — 919 tests green, type-check+build clean.
- release/0.2: 1커밋(393fc4e backport 4건) — 919 tests green, build OK.
- 신규 테스트 +13(#1 ×7, #6 ×1, #2 ×5). 신규 export: `@rchemist/listgrid/headless`. 무회귀(feedback_no_feature_regression 준수).
- push 미실행(Push: manual). GitHub 이슈 close 는 finalize 단계.
