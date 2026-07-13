# Phase TB — 백엔드 테스트 Full Set · 태스크 상세 아카이브

> 활성 페이즈. PROGRESS 본문 §Tasks Phase TB의 완료 태스크 rich detail. 규범=[test-backend-recon.md](../analysis/2026-07-13/test-backend-recon.md) + [tb-matching-semantics.md](../analysis/2026-07-13/tb-matching-semantics.md).

## TB-0 리컨 소화 + 계약 확정 — ✅ 2026-07-13 (`cc40196`)

인용 스팟체크 PASS·OQ-TB0~3 처분·§2 계약 확정. 상세=[tb0-contract-confirmation.md](../analysis/2026-07-13/tb0-contract-confirmation.md).

## TB-1 mock 필터 엔진 완성 — ✅ 2026-07-13

**Delegate**: sonnet general-purpose agent (`aa0a98615e2af6e71`)·status=`done_with_deviations`. Engine=claude(header). 브리프=execution-grade(tb-matching-semantics.md §1/§2/§3 근거).

**구현 (changed files)**:
- `apps/sample/lib/mock-backend/store.ts` — `matchesFilter`를 5-case→**24 QueryConditionType 전건**(exhaustive switch, TS `never`-checked, 각 case를 FilterDispatcher.java 라인 인용). 타입 인지 비교 `compareOrdered`(numeric→chronological(Date.parse)→lexical, null/mismatch→FALSE). 빈값 엣지 정확 재현(IN empty→false·NOT_IN empty→true·BETWEEN/IN_RANGE/DATE_BETWEEN <2→false·NOT_IN_RANGE <2→true). `JSON_CONTAINS`/`EXISTS`=명시 always-TRUE no-op(§3 데이터모델 한계 주석). `item.subFilters`→`hasNestedGroup()`(Java `hasSubFilters()`=맵 키 카운트 재현)로 재귀·item.not 적용. `matchesFilterGroup`=`andOk∧orOk∧notOk`, 공유 `combineGroup`(빈 버킷 vacuous-TRUE·NOT=`!(all)`). `SearchFilters`=`export type = FilterGroups`(schema-core 재사용·search-first). 내부 헬퍼(isNumericValue/toEpoch/compareOrdered/isBetween/isBlank/hasNestedGroup/combineGroup)=두 함수의 private 확장(신 모듈 아님).
- `apps/sample/lib/mock-backend/crud-routes.ts` — `readFilters`가 AND/OR/NOT 임의 부분집합 수용(기존=AND+OR 배열 강제·NOT drop). 오도 주석(:27-38, "framework가 NOT-group 미문서화") 정정→`SearchRequestPlanner.combineGroup:184` 인용.
- `apps/sample/lib/mock-backend/filter-engine.test.ts` (신규·29 tests) — 24 타입 각(+엣지)·숫자/날짜 정렬비교·JSON_CONTAINS/EXISTS no-op·item.not·그룹(AND-all/OR-any/빈OR/NOT `!(all)`/빈NOT/다중그룹)·nested subFilters.

**메인 세션 config 결정(모델-decidable·recon §0 의도)**: root `vitest.config.ts` `include`에 `'apps/**/*.test.{ts,tsx}'` 추가 — 신 유닛 스위트가 `npm test`/CI에 발견되도록(기존 globs=src/tests/packages만·apps 미포함). `*.test.`만 → Playwright `e2e/*.spec.ts` 불포함. 이것이 delegate의 유일 deviation(=tracked config로 실행 불가·임시 `-c` override로 검증) 해소.

**Authoritative verify (메인 세션·tracked config)**:
- `npx vitest run apps/sample/lib/mock-backend/filter-engine.test.ts` → 29/29 (발견 확인).
- `npm test`(전량) → **187 files / 2428 passed**(+1 todo) = 2399 baseline + 29. 무회귀.
- `npx tsc --noEmit -p apps/sample/tsconfig.json` → clean(root type-check는 apps 제외 → apps-local 필수).
- eslint(3 파일)·prettier(--write 후 clean). `npm run build`=무영향(packages/* 소스 무변경)로 스킵.

**커버 매트릭스**: TB-C1(24 조건타입+no-op 명시)·TB-C2(AND/OR/NOT+nested subFilters+빈그룹 관용) 충족.

**Deviation(§Needs Review 등재)**: delegate가 `vitest.config.ts`를 스코프 펜스 밖으로 판단·미수정→needs_decision. 메인 세션이 recon §0 의도 근거로 include 확장(옵션 a)·in-commit 해소. risk:low(behavioral=apps 유닛이 CI 게이트 진입·의도된 것).
