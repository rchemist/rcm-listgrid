# v1 로드맵 — 실행 순서와 수용 기준

**작성**: 2026-07-10 · **Status**: active · **근거**: [PRD](../prd/PRD-2026-07-v1-productization.md) · [ADR-0001~0007](../adr/) · [분석 보고서](../analysis/2026-07-10-zero-base-review.md)
**용도**: 각 페이즈를 그대로 GitHub 이슈/PROGRESS로 옮겨 실행한다. 페이즈마다 "무엇을·왜"는 링크된 ADR에 있으므로 **구현 세션은 해당 ADR만 읽으면 착수 가능**해야 한다 — 부족하면 ADR을 고칠 것(이 문서에 세부를 덧대지 말 것).

## 실행 원칙

- 페이즈는 **의존 순서**다. P0·P1은 병행 가능, P5는 P2와 P4 완료 전 착수 금지.
- 모든 페이즈: 착수 시 `documents/PROGRESS.md` 생성 → 완료 시 archive 이동 (documents/README.md 규칙).
- 검증 없는 완료 보고 금지 — 각 페이즈의 수용 기준은 실행 가능한 형태로 ADR에 있다.
- 모델 배분 힌트: `[S]`=sonnet 실행 가능(브리핑 충분), `[O]`=opus 설계 감리 필요, `[H]`=haiku 반복 가능.

## 페이즈

### P0 — 실버그 핫픽스 + 안전 기본값 (0.3.x patch 라인, 즉시)

분석 §6.1의 검증 확정 버그. 전부 국소 수정 — breaking 없음.

| # | 작업 | 근거 | 모델 |
|---|---|---|---|
| P0-1 | Validation.tsx:109-124 연산자 우선순위 괄호 수정 + update/create 모드 min/max 회귀 테스트 | B1 (high) | [S] |
| P0-2 | DatetimeField type 'date'→'datetime' + transfer 분기·필터 회귀 확인 (HeaderFieldFilter는 이미 양쪽 처리) | B2 (high) | [S] |
| P0-3 | FieldRenderer onChange 2벌 → `applyFieldChange` 헬퍼 통합 + IIFE try/catch(사용자 피드백 경로 보장) | B3 (high) | [S] |
| P0-4 | 전역 pageSize가 options.defaultPageSize를 덮어쓰는 우선순위 역전 수정 (명시 지정 > 전역 저장값) | B4 (high) | [S] |
| P0-5 | useLoadingStore 구독 부재 — zustand store로 교체 또는 useSyncExternalStore 배선 | B5 (high) | [S] |
| P0-6 | clone() manageEntityForm 얕은 복사 1줄 + 회귀 테스트 | B6 (low, 1줄) | [H] |
| P0-7 | 메뉴 권한 미설정 경고 + sanitizer 계약(configureHtmlSanitizer) + simpleCrypt 폴백 throw | ADR-0006 §1-3 | [S] |
| P0-8 | engines/.nvmrc + CI 매트릭스 + jsdom 27건 봉쇄 + CHANGELOG==버전 게이트 + no-any 동결 | ADR-0007 P0 | [S] |
| P0-9 | ASSET_SERVER_URL 127.0.0.1 폴백 제거, AdvancedSearchForm V1 @deprecated 마킹 | §6.3 | [H] |

**게이트**: 930+ green(신규 테스트 포함) · 0.3.26 릴리스 · 소비자 무변경 확인.

### P1 — 패키징 재건 [ADR-0001] (0.4.0 창구 개시)

tsup dual 산출 + exports 조건 분리 + 로드 스모크/publint/attw CI. **[S]** (config 설계 리뷰 [O])
**게이트**: ADR-0001 수용 기준 5항 전부.

### P2 — 특성화 테스트 그물 [ADR-0007 §2] (P4·P5의 선결)

FieldRenderer/폼로직/리스트로직/ViewEntityForm 행동 고정 + 렌더 테스트 레시피. **[S]**
**게이트**: 렌더 테스트 파일 9→25+ · 커버리지 래칫 가동.

### P3 — API 표면 재단 [ADR-0004] (0.4.0에 동승)

표면 감사표(580 심볼 3분류) → 화이트리스트 배럴 → presets/rcm 격리 → iconify 제거 → 색상맵/RevisionField/Excel 로깅 주입화 → MIGRATION+codemod. 감사표 작성 [S], 분류 판정 리뷰 [O], 치환 실행 [H/S].
**게이트**: ADR-0004 수용 기준 6항. `ui-default` 서브패스는 독립 트랙으로 분리 가능(0.4.x 중 아무 때나).

### P4 — config↔render 분리 [ADR-0003] (0.5.0)

EntityField 계약 분해 → 렌더러 레지스트리 → 필드 40종 이관(파일럿 1종 [O] 후 39종 [H/S] 반복) → SubCollection JSX 추방+buildSearchForm 통합 → useSession 인자화 [O] → lint 경계 + madge 게이트.
**게이트**: ADR-0003 수용 기준 6항 (madge 213→≤20 포함).

### P5 — 폼 상태 재설계 [ADR-0002] (0.5.x, **성패의 핵심**)

createFormStore → 값/메타 분리 → 셀렉터 구독 → 드릴링 제거 → 중첩 캐시. 단계 설계 [O], 각 단계 실행 [S], 단계별 독립 머지.
**게이트**: ADR-0002 수용 기준 5항 (키 입력 리렌더 = 1필드, clone 0회, 재fetch 0회).

### P6 — 백엔드 어댑터 계약 [ADR-0005] (0.6.0)

BackendAdapter + backend/rcm(무변경 이사) + 에러 코드 + backend/rest 레퍼런스. **[S]** (계약 리뷰 [O])
**게이트**: ADR-0005 수용 기준 4항.

### P7 — 엔터프라이즈 마감 + 제품화 표면 (0.7.x → 1.0-rc)

- i18n 가시 표면 이관 + 한글 키 검출 [S] (ADR-0006 §5)
- a11y 3종(Modal/정렬/aria-live) [S] (ADR-0006 §6)
- 중복 정리 잔여: Xref 베이스 추출, misc/utils 이중 API 단일화, EntityFormBase instanceof 제거 [H/S] (§6.2-6.3)
- `examples/minimal` — quick-start e2e 검증 앱 [S]
- 권한 기본값 deny 전환 + checkPagePermission 개명 (v1.0 breaking, ADR-0006 §2)
- docs/api 재생성(표면 재단 후) + getting-started/EXTENSIONS 전면 개정

**게이트**: PRD §5 성공 지표 측정 가능 상태 + v1.0 선언 기준(PRD §4) 전부.

### 보류/차기 (착수 금지 — 재론 시 새 ADR)

- SSR 멀티테넌트 요청 스코프 컨테이너 (판매 포인트 확정 시)
- field.type 문자열 스위치 14파일 → 다형 메서드 전환 (차기 major)
- EntityForm 5단 상속 → 컴포지션 (P5 완료 후 별도 판단 — P5가 역할을 줄이면 규모 재산정)
- xstate 흐름 머신, GraphQL/tRPC 어댑터, 디자인 시스템 독립 패키지(CSS 충돌 셀렉터 정리 + tailwind-merge 제거 선결 — raw/map-styles §5)
- 리스트 가상화 (medium 정정 — 대용량 opt-in 수요 확인 시)

## 진행 추적

| 페이즈 | 상태 | 릴리스 | 착수일 | 완료일 |
|---|---|---|---|---|
| P0 | 미착수 | 0.3.26 | | |
| P1 | 미착수 | 0.4.0 | | |
| P2 | 미착수 | (내부) | | |
| P3 | 미착수 | 0.4.0 | | |
| P4 | 미착수 | 0.5.0 | | |
| P5 | 미착수 | 0.5.x | | |
| P6 | 미착수 | 0.6.0 | | |
| P7 | 미착수 | 1.0-rc | | |

PRD §6의 6개월 창: P0~P3 완주가 3개월 내 안 되면 스코프 재협상(외부 상용화 중단 → 내부 표준 전환)을 트리거한다.
