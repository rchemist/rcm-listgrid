# Phase resolve — Task Detail Log

**Parent PROGRESS**: [../PROGRESS.md](../PROGRESS.md)

## #1 SearchForm.sorts wire 직렬화 정합 ✅ 2026-05-29

**commit**: (see git log — bundled with this archive)
**GitHub Issue**: #1

**Changed files**:
- `src/listgrid/form/SearchForm.ts`
  - `toJSON()` 신규 (~L900) — `JSON.stringify(searchForm)` 진입점. sorts Map → `[{field,direction}]` 객체 배열(backend `SortInfo`), filters Map → `{AND:[...],OR:[...]}` 객체. cacheKey/page/pageSize/ignoreCache/viewDetail/shouldReturnEmpty/preservedFilters/quickSearchFields 동시 방출(기존 enumerable 직렬화 무회귀).
  - `filterItemToWire()` private static 신규 — FilterItem.subFilters Map 재귀 변환.
  - `createByObject()` sorts 복원부 (~L251) — backend `[{field,direction}]` 객체 배열 인식 추가 + 구 튜플/객체 형태 하위호환 유지 + **역순 적용으로 다중정렬 순서(앞=primary) 보존**.
- `src/listgrid/form/SearchForm.test.ts` — +7 테스트(object-array 복원, 다중정렬 순서, toJSON sorts 배열, 빈 sorts=[], filters 객체, subFilters 재귀, stringify→deserialize round-trip).

**What was done**:
- **근본**: `SearchForm.sorts`/`filters`가 Map → host `JSON.stringify` 시 `{}` → backend `Cannot deserialize ArrayList from Object` 400. backend(`core/rcm-core-search/SearchRequest.java`) 거울로 `sorts:List<SortInfo>`(객체배열), `filters:LinkedHashMap<LogicalOperator,List<FilterItem>>`(AND/OR객체) 정합.
- **2차 발견**: deserialize 가 backend 실제 echo 형태(`[{field,direction,type,joinType,nullsFirst}]` 객체배열)를 인식 못해 서버 정렬 echo silent drop. + `withSort` prepend 특성상 forward 적용 시 다중정렬 primary 가 뒤집히는 잠재 버그 → 역순 적용으로 해결.
- type 생략=NORMAL / joinType 생략=INNER / nullsFirst 생략=null (backend default) 이므로 wire 에서 미방출.

**Verification**:
- `npx vitest run src/listgrid/form/SearchForm.test.ts` → 76 passed (69→76, +7).
- `npm run type-check` → 통과 (noUncheckedIndexedAccess 대응: `parsed[i]!` 구조분해).
- `npx vitest run` (전체) → 45 files / 912 passed · 1 todo, 회귀 0.
- `eslint` 변경파일 → 0 error (기존 prefer-const/unused 경고 7개는 변경 영역 밖).

**Invariant / Decision**:
- 내부 `sorts: Map<string,Direction>` 는 field+direction 만 보존 → backend `PrioritySortInfo`/joinType/nullsFirst 는 round-trip 불가(scope 외, listgrid 는 NORMAL 정렬만 생성). 향후 priority 정렬 필요 시 내부 표현 확장 별건.
- toJSON 이 cacheKey/preservedFilters(backend 미지정 필드)도 방출 — 기존 동작이 이미 방출 중이라 무회귀 유지 + sessionStorage(`useListGridLogic.ts:356 stringify`) 복원 정합. backend 는 unknown 필드 tolerate(현행 검증).
- toJSON 추가로 host wire 경로 + sessionStorage 경로 둘 다 배열 형태로 통일됨(과거 mapReplacer 는 sorts 를 객체로 방출했으나 deserialize 가 흡수).

---
