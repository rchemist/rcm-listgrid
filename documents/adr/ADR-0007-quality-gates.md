# ADR-0007 — 품질 게이트: 렌더 테스트 인프라·커버리지 래칫·환경 고정·문서 게이트

**Status**: accepted · **Date**: 2026-07-10 · **선행**: 없음 (P0/P2 — ADR-0002/0003의 선결이기도 함)
**근거**: raw/map-quality, raw/critique-enterprise(테스트), raw/docs-audit · 검증: high 확정 (PRD 조건 C4의 품질 절반)

## Context

- 930 테스트는 **로직 계층 전용**이다. 렌더 테스트는 48개 파일 중 9개뿐이고, 필드 컴포넌트 40종·ViewEntityForm·ViewListGrid·FieldRenderer에는 **렌더 테스트가 0건** — 코어 재설계(ADR-0002/0003)를 안전하게 수행할 그물이 없다.
- 커버리지 ~17%, vitest 임계치는 "baseline 바로 아래" **하향 고정**(회귀만 감지, 개선 강제 없음).
- **이 체크아웃(Node 26)에서 27건 실패** 실측 — engines/.nvmrc 부재로 "919 tests green" 주장이 환경 의존.
- 문서 드리프트 게이트 부재: CHANGELOG 최상단(0.3.22)과 package.json(0.3.25) 불일치 방치, docs/api 4월 이후 stale(→ git 추적 제거로 해소됨), README 수치 stale.
- 반면 **있는 테스트의 질은 양호**: snapshot 남용 0, skip 0, 이슈 기반 회귀 테스트 문화(EntityForm.initialize.test.ts) — 문화를 렌더 계층으로 확장하는 문제다.
- eslint `no-explicit-any: off`로 `: any` 338곳 방치 (useListGridLogic 반환 타입 any 포함).

## Decision

1. **환경 고정** (P0, ADR-0001과 공동): `engines.node >=20` + `.nvmrc`(22 LTS) + CI 매트릭스(Node 20/22 × React 18/19). 27건 실패의 근인(jsdom×Node26 localStorage)은 버전 고정으로 봉쇄 후 jsdom 셋업 수정을 별도 추적.
2. **특성화 테스트 그물** (P2 — 재설계 선결): 대상과 방식 —
   - `FieldRenderer`: 대표 필드 6종(String/Number/Select/Date/ManyToOne/Boolean)의 렌더→입력→검증→에러 표시 시나리오
   - `useEntityFormLogic`: 초기화(create/update)·저장·리셋·탭 전환 계약 (renderHook + fetch 목업)
   - `useListGridLogic`/`ViewListGrid`: 검색→페이지→정렬→선택 시나리오 1벌
   - `ViewEntityForm`: 스텝/서브컬렉션/버튼 배치 스냅숏이 아닌 **행동 단언**
   - 이 그물의 목적은 커버리지가 아니라 **동작 동등성 고정** — ADR-0002/0003 각 단계가 이 그물 green을 유지한 채 머지된다.
3. **커버리지 래칫**: 임계치를 "현재값 고정"에서 **단조 증가 게이트**로 — 머지마다 `coverage >= 기록된 최고치 - 0.5%p`, 분기마다 목표 상향(17→25→32→40). v1 게이트 40%.
4. **렌더 테스트 표준 레시피** 문서화: 필드 1종 추가 시 요구되는 최소 테스트 세트(렌더/입력/검증/리스트 셀)를 templates로 제공 — 이후 신규 필드의 DoD.
5. **문서·릴리스 게이트** (CI):
   - `node scripts/check-release-docs.mjs`: CHANGELOG 최상단 버전 == package.json 버전 (publish workflow에서 실패 처리)
   - madge circular 상한 게이트 (ADR-0003 이후 20, 그전까지 현재값 213 동결 — 증가만 차단)
   - 공개 심볼 수 상한 (ADR-0004 이후 220)
6. **타입 규율**: `no-explicit-any`를 error로 켜되 기존 위반은 파일 단위 eslint-disable로 동결(신규 유입만 차단). `useListGridLogic` 반환 타입 명시를 P0 목록에 포함.

## 기각한 대안

- **E2E(Playwright) 우선 도입** — 구 ROADMAP 항목이나, 앱이 아닌 라이브러리엔 vitest+testing-library 특성화가 선행. Playwright 시각 회귀는 examples/minimal 완성 후(P7+) 재검토.
- **커버리지 일괄 40% 강제** — 재설계 중 코드가 대량 이동하는 시기에 비현실적. 래칫이 정답.

## 구현 계획 & 수용 기준

| 단계 | 작업 | 수용 기준 |
|---|---|---|
| P0 | engines/.nvmrc + CI 매트릭스 + jsdom 27건 봉쇄 + check-release-docs 게이트 + no-explicit-any 동결 도입 | .nvmrc 버전에서 930 green · publish가 버전 불일치 시 실패 |
| P2 | 특성화 그물 4묶음 + 렌더 테스트 레시피 문서 | FieldRenderer/폼로직/리스트로직/ViewEntityForm 행동 테스트 존재, 렌더 테스트 파일 수 9→25+ |
| 상시 | 커버리지 래칫 + madge/심볼 수 게이트 | CI에 3개 수치 게이트 동작 |

규모: P0 0.5pw + P2 2~3pw. 전부 sonnet 실행 가능(레시피 설계 리뷰만 상위 티어).
