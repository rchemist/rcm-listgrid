# Phase EG 아카이브 — 공개 API first-principles 재설계 (설계 pass)

> PROGRESS 본문에서 이월된 완료 태스크 상세. 규범 산출물: [ADR-0009](../adr/ADR-0009-entityform-public-api-redesign.md) · [스펙](../plans/entityform-public-api-spec.md) · [waves 브리프](../plans/entityform-api-implementation-waves.md).

## #EG-D 재설계 설계 pass (fable, 2026-07-11)

**실행 구조**: 수집 4스카우트(sonnet 병렬, 산출물 `analysis/2026-07-11/`에 보존) → fable 설계(ADR-0009+스펙 r1) → 4렌즈 적대검증 워크플로우(wf_c55e83dc-6b1: coverage·consumer sonnet-high / feasibility opus-high / dx sonnet-med, 437k tokens) → **22건 발견 전건 수용·r2 반영** → opus 봉인 재검증 1회.

**수집 산출물 4종** (전부 배너+방법론 포함, 커밋됨):
- `v04-public-surface.md` (394줄) — 현 표면 263 심볼, EntityForm 30멤버, 관찰 10건(미수출 훅 2·동명이의 footgun·stub 패키지 2 등)
- `old-entityform-member-catalog.md` (378줄) — 구 표면 **189멤버**(추정 ~130의 1.45배), 21 concern 그룹, 결함 원장 Cross-Cutting §1~9(reload no-op·getTitle `''`·5중 값세터·shallow-Map 누수·뷰-실행 client-ext 등)
- `consumer-usage-audit.md` (401줄) — 소비자 5제품(gjcu-front 951파일 최대), 실사용 116멤버/zero 84, hack 패턴 6종(47-prop UIProvider·headless 회피·buttonGuard·40파일 래퍼·`as any` 286회)
- `eg-group-capability-maps.md` (736줄) — 계획 워크플로우 wf_8d0b6d02-1cc의 8그룹 정밀 map 저널 추출(jq 금지 규율 준수)

**설계 골자(스펙 r2)**: EntityForm 44멤버(-77%)·선언 동사군 4종(with/add/on/without)·`set*` 0개·라이프사이클 8훅 통합(client-ext 10종 흡수, 엔진 실행 L7)·FormRuntime(schema 구조적 인터페이스)+FormController(state)·messages 단일 채널·serializeValue keyed-맵 seam·withReadOnly 선언 복원(M2O 전파)·InitContext.setMeta(blocker fix)·열린 FieldType+확장 계약·단일 패키지+subpath(headless `/schema`+`/state`)·CAP-01~29 커버리지 매트릭스·116멤버 마이그레이션 전수표.

**검증 22건 내역**: blocker 1(consumer-1 InitContext 메타토글 부재 — gjcu `withHidden(name,·)` 774회 이식 불가) · major 18(계층 위반 ActionContext→FormRuntime 해소, EF6 "미출시 무비용" 허위 정정, serializeValue 모호성, setSearchForm 주입 경로, removeTab hide-다운그레이드 → without* 신설, name-키 sugar 재분류, renderType/session mutator 추가, FormAction render/className, withMeta merge, 멤버계수 불일치, 조건부 타입명 3종 혼용, withCapabilities TS 불법 시그니처, setReadOnly headless 갭 등) · minor 3. 상세는 워크플로우 저널 wf_c55e83dc-6b1.

**실행급 상향(사용자 지시 반영)**: 스펙 §8 CAP-ID·§10 발명금지 게이트·계수 규칙 + waves 브리프(W1~W4 태스크급 파일·before→after·증명·Do-NOT, W5~W7 entry-pass 규칙). 동일 규율을 harness에 제도화(팀규약·model-routing·progress-authoring/delegate·issue·codex 미러 — harness `b178fa6`).

**커밋**: (이 아카이브와 같은 번들) — analysis 4종 + ADR-0009 + 스펙 + waves + blueprint 강등 배너 + PROGRESS.

## #W1 표면 정비 (진행 중 — 실행 로그)

> 스펙 §3·§7·§10-2 · [waves §W1](../plans/entityform-api-implementation-waves.md). 실행: sonnet delegate(waves 브리프=브리핑 원문) → opus 검증(full gate)+커밋. hot-file 순차. 착수 green baseline: 1876 unit·type-check/typecheck:packages/lint(0err)/format/build 전부 ✅.

- **W1-1** `readonly`→`readOnly` 식별자 개명(행동 무변경) — 18파일(schema-core field 8·state·react 5·sample collabo·테스트 3). ViewPreset 6프리셋+`isReadonly`→`isReadOnly` 메서드+`FieldMetaOverride.readonly`+`override?.readonly` 접근 전부. **proof=tsc**(개명이 stale 참조를 깨므로 green tsc=전 참조 개명). 제외: TS `readonly` 수식어·DOM `toHaveAttribute('readonly')`·0.3 인용 주석·로컬 var·`src/listgrid/**` 레거시(스코프 밖). 검증: full gate green·1876·`git grep -nw isReadonly` empty. deviation 0.

- **W1-2** `placeHolder`→`placeholder` 개명 — 4파일(conditional/entity-field/form-field/index). **결정(opus)**: 타입 `PlaceHolderType`→`PlaceholderType`도 개명("placeholder"=1단어→PascalCase는 Placeholder. property fix의 평행. W1-1이 정상 케이싱 `ReadOnlyType`을 남긴 것과 정합 — read-only는 2단어). 소비자·렌더러 `.placeHolder` 접근 0(dormant 선언)·caller 0. 검증: full gate green·1876·grep empty. deviation 0.

## #EG1+EG2 권한 배선 (2026-07-11, `a1f3deb`)

**LIVE 보안갭 fix** — 재설계(W1~)와 무관하게 유지되는 실배선. `isPermitted`를 end-to-end로 연결:
- **toSaveData 제외**: 비허가 필드는 저장 페이로드에서 배제(우회 저장 차단).
- **FieldRenderer 하드게이트**: 렌더 계층에서 비허가 필드를 강제 차단 — EF1 파이프라인으로 우회 불가.
- **규모**: +10 테스트(누계 1876 unit) · 16 E2E green. 재설계 스펙(CAP-02·03 권한군)이 이 배선을 상위 개념으로 흡수하나, 구현 자체는 SOUND로 유지(§세션 인계 Do-NOT: SOUND 내부 재작성 금지).
