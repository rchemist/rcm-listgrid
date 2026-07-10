# 재기초 로드맵 — 0.4.x 신엔진, 실행 순서와 수용 기준

**작성**: 2026-07-10 · **개정**: 2026-07-10 — ADR-0008(재기초 전략) 확정 반영으로 P1 이후 전면 재편 (구판은 git 이력 62801ca~1aed211 참조)
**근거**: [PRD](../prd/PRD-2026-07-v1-productization.md) · [개념 헌장](../prd/concept-charter.md) · [ADR-0001~0008](../adr/) · [분석 보고서](../analysis/2026-07-10-zero-base-review.md)
**용도**: 각 페이즈를 그대로 GitHub 이슈/PROGRESS로 옮겨 실행한다. "무엇을·왜"는 링크된 ADR에 있으므로 **구현 세션은 해당 ADR + 헌장만 읽으면 착수 가능**해야 한다 — 부족하면 ADR을 고칠 것(이 문서에 세부를 덧대지 말 것).

## 브랜치·버전 (ADR-0008 §버전·브랜치 계획)

- `main` = 0.3.x 유지보수(P0만 여기). BREAKING 금지 · `release/0.2` = 기존 관례 유지
- **`v0.4`** = 재기초 워크스페이스 (P1~P7). 진행 중 `0.4.0-alpha.N`을 dist-tag `next`로 상시 배포
- 0.4.0 GA 시: main→`release/0.3` 이관 + `v0.4` 승격(병합 아닌 기본 브랜치 전환) · 1.0 = 이후의 표면 동결 선언

## 실행 원칙

- 모든 페이즈: 착수 시 `documents/PROGRESS.md` 생성 → 완료 시 archive (documents/README.md 규칙).
- **헌장 = 스코프 울타리, 이식 우선·재발명 금지, 특성화 오라클, 동시 처리 고정 목록** — ADR-0008 방지 장치 6개는 전 페이즈 공통 규율.
- 검증 없는 완료 보고 금지. 모델 배분: `[S]`=sonnet 실행 가능, `[O]`=opus 설계/감리, `[H]`=haiku 반복.

## 페이즈

### P0 — 실버그 핫픽스 + 안전 기본값 (main, 0.3.26) — 유일한 구엔진 작업

검증 확정 버그(분석 §6.1). **여기서 고친 로직이 이식 대상이 된다** — 버그째 이식하지 않기 위한 선행이기도 하다.

| # | 작업 | 근거 | 모델 |
|---|---|---|---|
| P0-1 | Validation.tsx:109-124 연산자 우선순위 수정 + min/max 회귀 테스트 | B1 | [S] |
| P0-2 | DatetimeField type 'date'→'datetime' + transfer 회귀 확인 | B2 | [S] |
| P0-3 | FieldRenderer onChange 2벌 → 공통 헬퍼 + IIFE try/catch | B3 | [S] |
| P0-4 | 전역 pageSize의 defaultPageSize 덮어쓰기 우선순위 수정 | B4 | [S] |
| P0-5 | useLoadingStore 구독 배선(zustand 또는 useSyncExternalStore) | B5 | [S] |
| P0-6 | clone() manageEntityForm 얕은 복사 1줄 + 테스트 | B6 | [H] |
| P0-7 | 메뉴 권한 미설정 경고 + configureHtmlSanitizer 계약 + simpleCrypt 폴백 throw | ADR-0006 | [S] |
| P0-8 | engines/.nvmrc + CI 매트릭스 + jsdom 27건 봉쇄 + CHANGELOG==버전 게이트 | ADR-0007 | [S] |
| P0-9 | ASSET_SERVER_URL 폴백 제거, AdvancedSearchForm V1 @deprecated | §6.3 | [H] |

**게이트**: .nvmrc 버전에서 930+ green · 0.3.26 릴리스 · 소비자 무변경.

### P1 — v0.4 브랜치 개시: 워크스페이스 스캐폴드 + 패키징 [ADR-0008 구조, ADR-0001]

`v0.4` 분기 → npm workspaces(packages/schema-core·state·react·ui-default·backend-rcm·backend-rest·presets-rcm·next + **apps/sample**) → tsup dual 빌드 + exports 조건 분리 + 로드 스모크/publint/attw CI(main·v0.4 이중 트리거) → **빈 골격이라도 `0.4.0-alpha.0` 첫 배포**(배포 파이프라인을 첫날부터 검증) → apps/sample 스캐폴드(목업 rcm 백엔드 + 홈, [명세](../prd/sample-site-spec.md) §P1). 구성 리뷰 [O], 실행 [S].
**게이트**: ADR-0001 수용 기준(로드 4경로) + alpha.0이 dist-tag next로 설치·로드됨 + `npm run dev -w apps/sample` 단독 기동.

### P2 — 특성화 테스트 그물 (이식 오라클) [ADR-0007 §2]

구엔진(main) 동작을 행동 테스트로 고정: FieldRenderer 대표 6종 / 폼 로직(초기화·저장·리셋·탭) / 리스트 로직(검색→페이지→정렬→선택) / ViewEntityForm(스텝·서브컬렉션). **신구 양쪽에서 실행 가능한 형태**(진입점 추상화)로 작성 — 이 그물이 P4~P6의 parity 판정 기준이다. [S]
**게이트**: 렌더 테스트 파일 9→25+ · 그물이 main에서 green.

### P3 — 계약 골격 + 표면 감사표 (spec-first 게이트)

ADR-0002/0003/0005의 계약을 **코드 골격으로 실물화**: schema-core의 EntityField 메타 계약·PermissionPolicy(3중복 통합 + SubCollection 권한 포함), state의 createFormStore/createListStore API, BackendAdapter 인터페이스. 병행으로 구 배럴 580 심볼 **감사표**(유지/이동/삭제 3분류, ADR-0004 기준) → v0.4 화이트리스트 초안. 마지막에 **헌장 대조 리뷰**(C1~C9가 계약 골격에서 표현 가능한지). 설계 [O], 감사표 [S].
**게이트**: 계약 골격이 컴파일되고 헌장 대조 리뷰 통과 · 감사표 완성(공개 심볼 목표 ≤220).

### P4 — 코어 이식 (schema-core + state) — **abort 판정 지점**

EntityForm 선언 모델(5단 상속→컴포지션), 검증 12종, SearchForm 직렬화, 권한 정책 — 구엔진에서 **이식**. 값/메타 분리 원칙(ADR-0002)에 따라 런타임 상태는 store로. [S, 감리 O]
**게이트**: 특성화 그물 중 로직 계층 테스트가 신 코어에서 동일 통과 · madge circular ≤ 20 · **추정 150% 초과 시 ADR-0008 §6 abort 발동 검토**.

### P5 — 렌더러 이식 (react 패키지)

파일럿 StringField로 레시피 확정 [O] → 39종 반복 이식 [H/S] → ViewEntityForm/ViewListGrid를 store 셀렉터 구독으로 재구성(드릴링 없음) → CSS 이식(+레이어 충돌 4건 정리, raw/map-styles §2.3). **이식 중 동시 처리(고정 목록만)**: i18n 키화 · 중복 통합(SubCollection 3변형/Xref 4형제/misc-utils) · `any` 제거 · 도메인 리터럴→presets-rcm 격리 · a11y 3종(ADR-0006 §6). `apps/sample`이 이식과 함께 자란다(엔티티 3종 + /theming — 명세 §P5) — 매 alpha가 데모 가능해야 한다.
**게이트**: ADR-0002 수용 기준(키 입력 리렌더 = 1필드, onChange 경로 clone 0회, 중첩 재fetch 0회) + 특성화 그물 전량 green + `t()` 한글 키 0건.

### P6 — 어댑터·표면 완성

backend-rcm(현행 URL/envelope 관례를 **무변경 이사**) + backend-rest 레퍼런스 + 에러 코드 계층(ADR-0005) · ui-default 스타일드 프리미티브 · next 어댑터 이식 · exports 맵 완성(화이트리스트 착지). [S, 계약 리뷰 O]
**게이트**: ADR-0005 수용 기준 4항 + ADR-0004 수용 기준(심볼 ≤220, 도메인 어휘 코어 0건, 코어 필수 peer ≤4).

### P7 — 0.4.0 GA

MIGRATION "0.3→0.4" + codemod · docs/api 재생성 · **헌장 대조표 게이트**(C1~C9 × 구현 위치 × 시연 시나리오 — 빈 행 시 GA 불가) · 실엔티티 1종 재현 검증(헌장 §보존 검증 3) · 브랜치 플립(main→release/0.3, v0.4 승격) · 0.3.x 지원 정책 고지(6개월 보안/치명만).
**이후**: PRD §5 안정화 기준 충족 시 1.0 = 표면 동결 선언.

### 보류/차기 (착수 금지 — 재론 시 새 ADR)

SSR 멀티테넌트 요청 스코프 · field.type 문자열 스위치→다형 메서드(0.4 이식 중 자연 해소분 제외) · xstate 흐름 머신 · GraphQL/tRPC 어댑터 · 위젯 빌드/웹 컴포넌트(다른 프론트 기술 — schema-core React 0%가 문을 열어둠) · 디자인 시스템 독립 패키지 · 리스트 가상화.

## 진행 추적

| 페이즈 | 브랜치 | 상태 | 릴리스 | 착수일 | 완료일 |
|---|---|---|---|---|---|
| P0 | main | 미착수 | 0.3.26 | | |
| P1 | v0.4 | 미착수 | 0.4.0-alpha.0 | | |
| P2 | main(+v0.4) | 미착수 | (내부) | | |
| P3 | v0.4 | 미착수 | alpha.N | | |
| P4 | v0.4 | 미착수 | alpha.N | | |
| P5 | v0.4 | 미착수 | alpha.N | | |
| P6 | v0.4 | 미착수 | 0.4.0-rc | | |
| P7 | v0.4→main | 미착수 | **0.4.0 GA** | | |

**타임박스**: P0~P3 완주가 3개월 내 안 되면 일정 재협상. P4 parity가 6개월 내 안 되면 ADR-0008 §6 abort 기준(전략 A 회귀 — P3 골격은 그대로 A의 목적지로 재사용) 발동. 재협상 대상은 야망이 아니라 일정이다(PRD §1 피벗의 의미).
