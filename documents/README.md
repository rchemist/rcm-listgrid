# documents/ — 제품·설계 문서 체계

이 디렉터리가 **제품 방향·설계 결정·작업 이력의 단일 진실 원천**이다.
`docs/`는 npm 소비자용 사용자 문서만 담는다(아래 §경계 참조).

## 구조와 권위 순서

어떤 문서를 믿을지 충돌이 나면 **위에서 아래 순서**로 우선한다.

| 순위 | 경로 | 내용 | 성격 |
|---|---|---|---|
| 1 | `adr/` | 아키텍처 결정 기록(ADR-0001~0007). **구현 세션은 여기서 시작한다** | 규범 (살아있음) |
| 2 | `prd/` | 제품 요구·포지셔닝·릴리스 전략 | 규범 (살아있음) |
| 3 | `plans/v1-roadmap.md` | 실행 순서·수용 기준·공수 | 규범 (살아있음) |
| 4 | `analysis/2026-07-10-zero-base-review.md` | 제로베이스 분석 보고서 — ADR/PRD의 근거 | 스냅샷 (2026-07-10 기준) |
| 5 | `analysis/2026-07-10/verification-log.md` | 분석 발견의 적대적 검증·심각도 정정 | 스냅샷 |
| 6 | `analysis/2026-07-10/raw/` | 분석 에이전트 원자료 18건 | **원자료 — 단독 인용 금지**, 반드시 5를 경유 |
| 7 | `issues/` | GitHub 이슈별 fix-plan·PROGRESS (완결된 수리 이력) | 이력 |
| 8 | `archive/`, `progress-archive/` | 완료·폐기된 계획/진행 문서 | 이력 (현행 아님) |

## AI 세션(클로드코드 등)을 위한 규칙

1. **stale 방지가 이 체계의 존재 이유다.** 계획이 실행 완료되면 그 계획 문서는 즉시 `archive/`로 옮기고 파일명에 날짜를 앞세운다 (`YYYY-MM-DD-<이름>.md`).
2. `analysis/**/raw/`의 주장을 코드 수정의 근거로 쓰지 마라 — 검증 로그에서 심각도가 정정된 항목이 다수다(예: clone aliasing critical→low). 반드시 `verification-log.md`와 종합 보고서를 우선하고, 그래도 애매하면 코드를 직접 재확인한다.
3. `documents/PROGRESS.md`는 **진행 중 작업의 활성 슬롯**이다. Status: completed 상태로 이 자리에 방치하지 마라(과거 사고 사례: 2026-05-29 완료본이 활성 슬롯에 남아 있었음 → archive로 이동됨).
4. 새 아키텍처 결정은 새 ADR로 추가하고(번호 증가), 기존 ADR을 뒤집을 땐 기존 문서 Status를 `superseded by ADR-XXXX`로 바꾼다. ADR 본문을 조용히 고치지 않는다.
5. 릴리스 시 게이트: **CHANGELOG 최상단 버전 == package.json 버전** 확인. 이 게이트가 없어서 0.3.23~25가 CHANGELOG에서 누락됐었다.

## docs/ 와의 경계

| | `docs/` | `documents/` |
|---|---|---|
| 독자 | npm 소비자 (외부) | 유지보수자·AI 세션 (내부) |
| 내용 | getting-started, MIGRATION, PRIMITIVES(패키지에 포함 — **경로 이동 금지**, package.json files 참조), EXTENSIONS | PRD, ADR, 로드맵, 분석, 이슈 이력 |
| 생성물 | `docs/api/` — `npm run docs`로 로컬 생성, **git 미추적**(.gitignore) | 없음 |

`docs/ROADMAP.md`와 `docs/REFACTOR_HOST_COUPLING.md`는 내부 계획 문서였으므로 `archive/`로 이관됐다 (2026-07-10).

## 배경 (한 단락)

이 리포는 GJCU 학사 시스템(Next.js 모노리스)에서 CRUD 계층을 추출해 npm 패키지화한 것이다. 2026-07-10 제로베이스 분석(42-에이전트 워크플로우 + 적대적 검증)의 판정은 **PIVOT — 조건부 GO**: 범용 어드민 프레임워크 정면승부는 기각, RCM-framework 내부 표준 + 한국형/규제산업 니치로 재정의. 선결 조건 C1(패키징)~C4(보안·품질)와 근거는 분석 보고서 §0 참조.
