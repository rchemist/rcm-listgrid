# PROGRESS — 0.4 재기초(re-foundation) 실행

**Created**: 2026-07-10
**Status**: active · W1~W4 ✅ seal. **Next up**: **D-pass**(사용자 지시 2026-07-12: 미결 §Needs Review 전건 일괄 결정 + **#W4-3a async save-gating 결함 수정**) → 그 후 W5 list-track. **2103 unit/E2E 24**·계수 47/49/182(임계 55/120/190). P0/P1 publish=외부 승인 대기.
**운영 모드**: 무인(unattended)·토큰무제한·품질최우선. 마일스톤마다 멈추지 않고 자율 진행. **중단은 ① 새 세션 필요 ② 크리티컬 패스 결정**뿐 — 비크리티컬 결정은 §Open Questions에 누적해 일괄 질의. active-session marker 등록됨.
**Engine**: claude (codex eligible 태스크는 개별 표기 — 인용 기반 반복 작업만)
**Push**: auto (사용자 확정 2026-07-11 — 커밋·push·배포까지 자율 실행 후 결과 보고. "커밋할까요/배포할까요" 금지)
**Model policy**: 설계 pass 완료 — **구현 wave(W1~W7)는 실행급 브리프로 opus/sonnet 세션 실행 가능**. 위임 기본 sonnet(waves 브리프=브리핑 원문). **스펙이 침묵하는 판단=구현 금지**(스펙 §10 게이트 4) — 스펙 개정만 상위 티어.
**Next session policy**: **W1~W4 ✅**. 새 세션은 **D-pass 먼저**(사용자 지시 2026-07-12: 결정 미루지 말고 일괄) — ① **D1 #W4-3a 구현**(async=일반 validation·게이트 결정됨) → ② **D2 잔여 §Needs Review 전건 결정**(스펙 저자로 모델 auto-decide+스펙 반영·domain만 §Open Q·**workflow 적합**) → ③ [W4 Handoff](./progress-archive/phase-eg-api-redesign.md#w4-페이즈-완료-인계-handoff--w5-list-track) 읽고 W5 entry brief. **상위 티어 세션**(스펙 개정 동반).
**Last updated**: 2026-07-12 (**W4 ✅ seal + /progress:next 재정렬**. 사용자 #W4-3a 결정: **async save-gating 필수**(shipped W4-3 결함=validateAll이 asyncState 무시하고 통과시킴)→D1 구현 태스크화. 다음 세션 = **D-pass**(D1 구현·D2 잔여 미결 일괄 결정)→W5. W4 `3b3518f`..`44edfae`·2103 unit·E2E 24·계수 47/49/182.)

## Goal

[ADR-0008](./adr/ADR-0008-refoundation-strategy.md) 재기초 전략의 실행: `v0.4` 브랜치 모노레포에 4계층 골격을 신축하고, 구엔진(0.3.x)의 검증된 로직을 특성화 테스트 오라클 아래 **이식**하여 0.4.0 GA에 도달. 보존 대상은 [개념 헌장](./prd/concept-charter.md) C1~C9이며, GA 게이트에서 대조표로 검증한다.

## Context

- **브랜치**: `main`=0.3.x 유지보수(P0만). **`v0.4`**=재기초(현 작업 브랜치). main에 0.4 코드 금지, v0.4에 0.3 픽스 직접 커밋 금지.
- **환경**: Node은 `.nvmrc` 기준. **Node 26에서는 기존 테스트 27건이 jsdom localStorage 문제로 실패하니 버전 확인 필수**(P0-8 폴리필로 해소됨). 품질 게이트: `npm run type-check && npm test && npm run lint && npm run format:check && npm run build`.
- **릴리스**: 0.3.26 **배포됨(2026-07-11)**, 0.4.0-alpha.N(W2 후·dist-tag `next`), 0.4.0 GA(W7 후). **배포 자율 실행(사용자 확정 2026-07-11)** — 게이트(CHANGELOG==version·full gate) 선행 + 소비자 영향 직접 검증. 타 팀 프로덕션 반영 조율만 보고 대상.
- 근거 문서: ADR-0001~0008 · 헌장 · [apps/sample 명세](./prd/sample-site-spec.md) · [로드맵](./plans/v1-roadmap.md)(페이즈 정의 원본 — 어긋나면 로드맵 우선).

## 불변 규율 (전 세션 공통 — ADR-0008 방지 장치)

1. **헌장 = 스코프 울타리**: 이식 중 신기능·개선 아이디어는 구현하지 말고 §Backlog에 한 줄 기록.
2. **이식 우선, 재발명 금지**: 리프 로직(필드/검증/포맷)은 테스트와 함께 옮긴다. 다시 쓰려면 커밋 메시지에 사유 필수.
3. **특성화 오라클**: P2 테스트 그물이 신구 양쪽에서 green이어야 이식 완료.
4. **이식 중 동시 처리는 고정 목록만**: i18n 키화 / 중복 통합 / `any` 제거 / 도메인 리터럴→presets-rcm / a11y 3종. 그 외 "하는 김에" 금지.
5. **검증 없는 ✅ 금지**: 완료 체크에는 증거(테스트 수·커맨드·결과) 한 줄 필수. 렌더 변경은 apps/sample에서 실제 화면 확인.
6. **매 태스크 종료**: diff 셀프 리뷰 → 논리 단위 커밋(`feat|fix|refactor(scope): 내용`) → 이 문서 갱신 커밋. push는 manual.

## Do-NOT (재론 금지 — 근거: 분석 §7, ADR-0002/0003/0008)

- 전면 백지 재작성(규율 2 위반) · SubViewEntityForm 단독 분리 · xstate 도입 · 전역 싱글턴의 React Context화 · 무료 기능 유료화
- 구 배럴(main)의 표면 재단(0.4에서만 — 이중 작업 금지) · docs/api 커밋 재개 · 헌장 밖 신기능의 v0.4 편입
- react-hook-form/TanStack Form로 폼 상태 대체(ADR-0002 기각 사유 참조)
- **0.2.x(`release/0.2`) 선제 수정 금지 (사용자 확정 2026-07-10)** — 프로덕션 가동 중. 에러 리포트 없는 한 백포트·수정 안 함. 0.3.x부터 자유 수정·배포 가능.

## Progress State

| 페이즈/트랙 | 브랜치 | 상태 | 릴리스 | 상세 |
|---|---|---|---|---|
| P0 실버그 핫픽스 | `p0-hotfixes` | 🟡 코드완료(publish/전환 승인 대기) | 0.3.26 | [archive](./progress-archive/phase-foundation-P0-P2.md) |
| P1 워크스페이스+패키징 | v0.4 | 🟡 코드완료(alpha.0 승인 대기) | alpha.0 | [archive](./progress-archive/phase-foundation-P0-P2.md) |
| P2 특성화 오라클 | v0.4 | ✅ 완료(내부) | — | [archive](./progress-archive/phase-foundation-P0-P2.md) |
| **수직 슬라이스 V0~V2** | v0.4 | ✅ 완료(5 E2E green) | — | [archive](./progress-archive/vertical-slice-V0-V2.md) |
| 형식 P3~P7 (계약골격→GA) | v0.4 | ⬜ 보류(수직 슬라이스가 앞당겨 실증) | — | [archive](./progress-archive/formal-roadmap-P3-P7.md) |
| **하드닝/확장 트랙** | v0.4 | [~] 진행 중 (H·EF·EA/EB/EC·EG W1~W4 ✅ · W5~W7 남음) | — | 이 문서 §Tasks · [E계획](./plans/e-track-field-parity.md) |

**타임박스**: P4 parity 6개월 초과 시 ADR-0008 §6 abort 검토 — 수직 슬라이스가 abort 판정을 **GO로 조기 실증**(2026-07-11)해 위험 완화됨.

## 세션 인계 (Handoff — **W1~W4 ✅ seal**. 다음: **D-pass**(#W4-3a 구현+잔여 미결 결정)→W5 — 전체 인계는 [W4 Handoff](./progress-archive/phase-eg-api-redesign.md#w4-페이즈-완료-인계-handoff--w5-list-track))

- **⚠ 다음 세션 = D-pass (사용자 지시 2026-07-12·상위 티어)**: W5 전에 미결 일괄 결정+결함 수정. **D1**: #W4-3a 결정 구현 — AsyncValidation은 일반 validation이므로 `asyncState!=='valid'`(unchecked/checking/invalid) 필드는 validateAll에서 invalid→**save 차단**. `form-store.ts` validateAll이 AsyncValidation 보유 필드를 asyncState로 게이트(sync `validate()`는 여전히 network 안 함=validateAll이 저장된 asyncState를 읽음). 스펙 §5.3/§6.2 반영. **shipped W4-3 결함**(asyncState=display-only·게이트 누락·CAP-05 미완결) 수정. **D2**: 잔여 §Needs Review 9건을 스펙 저자로 일괄 결정 — 사용자가 "결정하고 진행" 승인=**발명금지 게이트 이 항목엔 해제**(모델 auto-decide+기록+스펙 반영, domain 판단만 §Open Q). **workflow 적합**(항목별 병렬 결정안→opus 종합). 그 후 W5 entry brief.
- **재설계 governing docs(설계 pass ✅ 2026-07-11 fable)**: [waves 브리프](./plans/entityform-api-implementation-waves.md)(실행 계약 W1~W7·위임 원문)·[스펙 r2](./plans/entityform-public-api-spec.md)(규범 CAP-01~29)·[ADR-0009](./adr/ADR-0009-entityform-public-api-redesign.md)(결정). **W1~W3 실행 상세+W3 Handoff**=[phase-eg archive](./progress-archive/phase-eg-api-redesign.md).
- **읽는 순서(cold-start)**: ① waves 브리프 전역 규칙+해당 W표 → ② 스펙의 **인용된 §만** → ③ 판단 필요 시 ADR-0009. 구 `src/listgrid/`·8그룹 map·감사 문서는 W5 entry pass까지 불필요 — 스펙이 이미 소화했다.
- **실행 규율**: waves 브리프가 위임 브리핑의 원문(기본 sonnet). **스펙 §를 인용할 수 없는 설계 판단이 나오면 구현 금지** — §Open Questions에 올리고 스펙 개정 선행(스펙 §10 게이트 4). wave 종료마다 CAP-ID 대조(누락은 표 대조로 검출).
- **이미 SOUND한 것(유지)**: store 값 모델(ADR-0002)·schema-core 순수성(ADR-0003)·FormMutator seam·EF1-7 파이프라인·필드 24+주소+Xref·권한 배선(EG1/EG2). **1887 unit/16 E2E, 전부 push.** 재설계는 공개 표면 — 엔진 재작성 아님.
- **Do-NOT**: ① 0.3 복붙·구 버그 재현 금지(스펙 L8) ② SOUND 내부 재작성 금지 ③ store 직접 수신 금지(FormMutator 경유)·동적 mutation 후 entityForm.getFields() 직접 읽기 금지(store.fieldDefs) ④ exactOptionalPropertyTypes 조건 spread(반복 결함 1위 — waves 전역 규칙) ⑤ hot-file 3종(entity-form/form-store/ViewEntityForm) 병렬 편집 금지 ⑥ Agent 출력파일 jq 파이프 금지(JSONL — 구조화 추출→Write→Read) ⑦ **스펙 침묵 판단의 발명 금지**(위 실행 규율).
- **작업 규율**: 완료=logic 커밋→PROGRESS 커밋→push(사용자: 전부 push). 게이트 waves §전역 규칙(full gate+E2E 16+). active-session marker=이 PROGRESS.

---

## Tasks

완료: H(하드닝)·E-트랙(EF 명령형 라이프사이클·EA 필드24·EB 주소·EC 실브라우저 실증·EA-D2 Xref·EG1/2 권한) — **1876 unit + 16 E2E, 전부 push**. 상세 [archive](./progress-archive/phase-e-track-tasks.md). **현 활성 = Phase EG(공개 API first-principles 재설계, fable — §세션 인계 Handoff).**

### H — 하드닝 ✅ 완료 (전 5태스크 — 게이트·CI·SubColl·H1 캐시·H2 a11y) · [archive](./progress-archive/phase-hardening-H.md)

### E — 확장 (사용자 확정 2026-07-11: 전 필드 이식 + 동작 실증 + Daum 주소) · [계획](./plans/e-track-field-parity.md)

- [x] **E·Email/Phone** Email/Phone 필드클래스(내장 검증, C4 "클래스1+렌더러1" 패턴 실증, Subject E2E) · `20f5156`

**핵심**: 신 엔진은 선언적 라이프사이클(dependsOn cascade)만 있고 **명령형(onInitialize/onChanges/META 반응성)이 전무** → 필드 렌더만 이식하면 동작이 조용히 no-op. **Phase EF(기반) 먼저 → EA(필드 대량) → EB(주소) → EC(폼+E2E).** 근거·상세 [계획](./plans/e-track-field-parity.md) + [원자료](./analysis/2026-07-11/e-track-understand-workflow.md).

#### Phase EF ✅ 완료 (2026-07-11 — EF1~5 + 리뷰게이트 R1·R2 + gate 통과, 명령형 라이프사이클 완비 · 1205 unit+5 E2E) · [archive](./progress-archive/phase-e-track-tasks.md) · parity map [analysis](./analysis/2026-07-11/ef-gate-parity-map.md)

#### Phase EA/EB/EC ✅ 완료 (2026-07-11) · [archive](./progress-archive/phase-e-track-tasks.md)
- EA(필드21+공유기반)·EA-D2(Xref)·EB(주소+Daum)·EC1~3(실브라우저 실증)·EC3-0(TAB숨김)·EC-R1/EC-F·EF6/EF7 완료. E2E 5→16. 상세 [archive](./progress-archive/phase-e-track-tasks.md).
- [ ] **EC4** GraduationReview(custom onSave·role readonly·옵션 pruning) — 후순위(**W3 권한·능력 착지 후** role-readonly 실증으로 재개)

#### Phase EG — EntityForm 공개 API **first-principles 재설계** (PIVOT 2026-07-11)

**규범**: [ADR-0009](./adr/ADR-0009-entityform-public-api-redesign.md)+[스펙 r2](./plans/entityform-public-api-spec.md)(CAP-01~29) · **실행 계약**: [waves 브리프](./plans/entityform-api-implementation-waves.md). 구 blueprint는 체크리스트로 강등.

- [x] **EG1+EG2** 권한 배선 ✅ `a1f3deb` · isPermitted end-to-end(FieldRenderer 하드게이트·EF1 우회불가) · +10(1876)·16 E2E · [detail](./progress-archive/phase-eg-api-redesign.md)
- [x] **EG-D 재설계 설계 pass** ✅ 2026-07-11 · ADR-0009+스펙 r2+waves 브리프 · 4렌즈 검증 22건 반영 · [detail](./progress-archive/phase-eg-api-redesign.md)
- [x] **W1 표면 정비** ✅ 2026-07-11 · `599a3f3`..`4c04906` · 개명·without*·배럴·계수 CI · full gate·E2E 16·CAP-12일부 · [detail](./progress-archive/phase-eg-api-redesign.md)
- [x] **W2 훅+컨트롤러** ✅ 2026-07-11 · `005b4a3`..`ed77ecf` · 8훅+FormRuntime/Controller · E2E 16·1936u·계수 37/49/175 · [detail](./progress-archive/phase-eg-api-redesign.md#w2)
- [x] **W3 권한·능력·액션** ✅ `4d30159`..`b4ecda3` · 6 sub+W3-6 하드닝·CAP 7종·2003u·E2E 19·4버그 fix · [detail](./progress-archive/phase-eg-api-redesign.md#w3)
- [x] **W4 폼 완결** ✅ `3b3518f`..`44edfae` · 6 sub+하드닝(4버그)·CAP-05·07·10·13·23·2103u/E2E24·계수 47/49/182 · [detail](./progress-archive/phase-eg-api-redesign.md)
- [ ] **D1 async save-gating 구현** (#W4-3a **결정됨 2026-07-12**·CAP-05 완결) **← Next up** — `validateAll`이 AsyncValidation 보유 필드를 `asyncState==='valid'`일 때만 통과·그 외(unchecked/checking/invalid)=필드 invalid→**save 차단**+에러메시지. sync `validate()`는 network 없음(validateAll이 저장 asyncState 게이트). **shipped W4-3 결함 수정**. 파일: `packages/state/src/form-store.ts`(validateAll)·`async-validation.ts`. 스펙 §5.3/§6.2 반영. 증명: unchecked/invalid async 필드로 save 차단 unit+E2E.
- [ ] **D2 잔여 §Needs Review 전건 결정** (사용자 지시 2026-07-12: 일괄·발명금지 해제) — #W4-1a·1b·2a·6a·#W2-1·#W2-5·#W3-2·#W3-3·#W3-5b: 스펙 저자로 각 결정(모델 auto-decide+기록+스펙 반영)·구현 요하면 처리(#W2-5/#W3-2 SaveOutcome 판별자·#W3-3 controller 타입 정합 등). domain 판단만 §Open Q. workflow 적합(항목별 병렬 결정안→종합).
- [ ] **W5 list-track** (D-pass 완료 후) — **entry 브리핑 pass 선행**(waves §W5 규칙: 태스크 표를 먼저 추가·커밋) · CAP-18·19·20
- [ ] **W6 data-transfer** — entry pass 선행 · CAP-16·17
- [ ] **W7 패키징+마이그레이션** — subpath exports·headless fixture·MIGRATION+codemod · CAP-24·25

**Next up**: **D1 async save-gating 구현**(#W4-3a 결정됨: async=일반 validation → 미완료/실패 async 필드는 validateAll 실패 → save 차단). `form-store.ts` validateAll이 asyncState 게이트(sync validate() network 없음)·스펙 §5.3/§6.2 반영·증명 save 차단 unit+E2E. 이어 **D2**(잔여 §Needs Review 9건 일괄 결정)→ **W5 entry brief**(waves §W5~W7 규칙: 스펙 §5.1·§7·§2·§3.5·§3.6+[8그룹 map](./analysis/2026-07-11/eg-group-capability-maps.md)로 태스크 표 먼저 추가·커밋·계수 §10-A 182→~184). 사용자 지시(2026-07-12): 결정 미루지 말고 일괄 결정 후 진행.

---

## Needs Review (deviations — 사용자 확인 후 `[x]`)

- [x] **전건 처분(30항목) 2026-07-11** — 사용자 지시로 모델 확정: P0-7 소비자 영향 직접검증 해소·changeSelectOptions 레이스→W2-8 전환·나머지 28건 확정. [dispositions](./progress-archive/needs-review-dispositions-2026-07-11.md)
- [x] **브랜치 전략 확정(2026-07-10)** — main=0.3.x 유지, `p0-hotfixes`/`v0.4` 분리. 플립(0.3→release, v0.4→main)은 전작업+검증 완료 후.
- [ ] **#W2-1 onInit 통합 시맨틱(마이그레이션 확인)** — 구 onFetchData+onInitialize 2배열→onInit 1배열(registration-order·ctx.data 분기·반환-교체 hatch 폐기, §4.2/§9 결정). W7 gjcu 마이그레이션서 등록순서 의존·반환교체 사용처 확인 · risk: migration
- [ ] **#W2-5 SaveOutcome reason-less cancel 구별불가** — 스펙 §6.2 SaveOutcome는 exactOptional로 `cancelled: undefined` 불가 → reason 없는 cancel()이 {ok:false}로 validation-fail과 outcome 구별불가(부작용으로만 구별). 스펙 저자: 판별자 추가 or 현행 수용 · risk: api-semantics
- [ ] **#W3-2 capability-denied outcome 구별불가** — controller save/delete의 capability 거부가 `{ok:false}` 반환(타입상 유일 non-error·non-cancel 선택) → validation-fail·reason-less cancel과 형태 동일(#W2-5 동류). silent block(adapter 미호출)은 정상. 스펙 §6.2 저자: 판별자(예: `blocked?: 'capability'`) 추가 여부 · risk: api-semantics · [detail](./progress-archive/phase-eg-api-redesign.md#w3)
- [ ] **#W3-5b replaces:'save' 커스텀 액션이 formReadOnly Save-숨김 우회** — formReadOnly는 빌트인 saveBuiltin만 제외(merge 전)·replaces:'save' 커스텀 액션은 getActions 경유라 미게이트 → readOnly 폼에 커스텀 save-slot 액션 렌더. 스펙 §3.1 "빌트인 Save 어포던스 숨김"=빌트인만(literal OK)이나 의도상 애매. 스펙 저자: replaces:'save'도 formReadOnly 숨김 대상인지 · risk: api-semantics(spec-ambiguous·저위험)
- [ ] **#W4-1a getTitle 5단계 최종 폴백 문구(spec-silent)** — 스펙 §3.1 "renderType 기본문구"의 정확한 소비자 대면 카피 미명시 → 구현은 `this.name`(생성자 보장 non-empty) 폴백 채택(발명 회피). 스펙 저자: renderType별 기본문구(예: "새 college"/"college 수정") 확정 여부 or this.name 수용 · risk: ux-copy(저위험) · [detail](./progress-archive/phase-eg-api-redesign.md#w4--폼-완결-진행--hot-file-순차delegate-sonnetopus-검증--cap-050710132)
- [ ] **#W4-6a 위저드 step-hidden(id-based) vs 필드-hidden(store renderType) 분기(spec-silent)** — phase-end 리뷰 발견#5. step-hidden은 `actionRenderType`(id-based·W3-6 Fix#3), 그 step 안 필드-hidden은 store `renderType`. prefill(id 없는데 fetchedData/initialData로 store renderType='update')+renderType-keyed 필드 조건에서만 발산(좁은 edge·테스트 없음). 스펙 저자: 분기를 의도로 문서화 vs wizardActive시 필드-hidden도 id-based로 통일 · risk: api-semantics(좁은 edge·저위험)
- [x] **#W4-3a → DECIDED (사용자 2026-07-12): async save-gating 필수** — async=일반 validation → `asyncState!=='valid'` 필드는 validateAll 실패→save 차단. shipped W4-3 결함(게이트 누락)→구현 §Tasks **D1**·스펙 §5.3/§6.2 반영.
- [ ] **#W4-2a 위저드 전 step hidden시 액션바만 렌더(spec-silent edge)** — create 위저드에서 선언된 전 step이 hidden으로 해석되면 step content/nav 없이 액션바만 표시(크래시 없음·미테스트). 스펙 §3.2가 degenerate 케이스 미규정 → graceful fallback 채택. 스펙 저자: 이 케이스 의도 확정(예: 전체 폼 fallback or 경고) · risk: ux-edge(저위험)
- [ ] **#W4-1b withTitle 재호출=replace(merge 아님)** — 스펙 §3.1이 재호출 시맨틱 미명시 → L1 with* 기본(설정/교체) 적용(withCapabilities/withMeta의 명시 merge와 다름·title은 스칼라라 자연스러움). 스펙 저자: 명시 문서화 여부 · risk: api-semantics(저위험·L1 정합)
- [ ] **#W3-3 controller-optional vs ActionContext.controller(required) 타입 불일치** — ViewEntityForm.controller? optional인데 ActionContext.controller: FormRuntime(required) → controller 부재 시 커스텀 액션/빌트인 Delete/render-slot omit(빌트인 Save legacy만). 특히 replaces:'save'+no-controller=Save 버튼 아예 없음. 스펙 §3.4/§7 저자: controller required화 or ActionContext.controller optional화 · risk: api-type-consistency · [detail](./progress-archive/phase-eg-api-redesign.md#w3)

## Progress notes

- EF/EA 페이즈 노트(EF-R2 stash anomaly·EF-gate FIND-ONLY·EA-A fan-out 커밋방식·EA-D reorder)는 [archive](./progress-archive/phase-e-track-tasks.md#progress-notes-본문-이월-2026-07-11--efea-페이즈-완료로-아카이브)로 이월.
- W1~W3 방법론·검증 노트(W1 tsc+test 이중검증·EG-D 4렌즈·harness 교차리포·W2/W3 착수 규율·W3-1 발명게이트 해소)는 [phase-eg archive §Progress notes](./progress-archive/phase-eg-api-redesign.md)로 이월(2026-07-11 slim).
- 2026-07-11 W4-0 계수 재산정 방법론: `scripts/count-public-surface.mjs`의 EntityForm 계수는 public `get*Handlers`(훅당 1, §3.3 "엔진 내부"이나 cross-package라 public 필수)+getReadOnly까지 포함 → 최종 53. 스펙 "44 소비자 멤버"와 기계 계수(53)의 갭을 §10-A 표로 명문화. 계수 **규칙**은 무변경(임계값만 재산정). 대안(get*Handlers 계수 제외 규칙)은 채택 안 함 — cross-package public 불가피·규칙 예외 추가는 invention 리스크. W5/W6는 entry pass에서 §10-A 표 갱신+임계 재검증(waves 규칙 반영).

## Backlog (헌장 밖 아이디어 — v0.4 편입 금지, 기록만)

- 마이그레이션 how-to는 [리빙 문서](./plans/migration-0.3-to-0.4.md)로 P0-10에서 착수 — 각 페이즈가 호환성 변경을 발생 커밋에서 누적, P7에서 `docs/MIGRATION.md`+codemod로 승격.
- **P3-1 스카우트 발견 (필드 이식 시 처리)**: PhoneNumber/TelephoneNumber `validate()` 본문 동일(파라미터화 통합 후보) · `RegexFormularValidation.ts` 파일명 오타(클래스=`RegexFormulaValidation`, 이식 시 정정) · `Validation.tsx`→`.ts`(JSX 0) · `getConditionalReactNode`(React.isValidElement)는 렌더러 계층으로 이관 · SearchForm `quickSearchFields` 중복 사이드채널 · `EQUAL_IGNORECASE`/`NOT_LIKE`는 셀렉트 미노출(의도 확인).
- react-daum-postcode를 required peer로 전환(EB-R1) — 주소 미사용 소비자용 subpath opt-in 분리(#7 이슈 3분류 선례)는 P5 패키징에서 검토.

## Open Questions

- [x] **릴리스 기전 확정(2026-07-10)** — `v*` 태그 push→`publish.yml` 자동배포(dist-tag `-alpha`→next/`0.2.x`→legacy-0.2/else latest). 게이트 선행.
- [x] **0.3.26 실배포 완료(2026-07-11)** — 소비자 무회귀 확인 → main ff-merge `853660b` → `v0.3.26` 태그 → publish.yml latest 자동배포. [dispositions](./progress-archive/needs-review-dispositions-2026-07-11.md).
- [x] **0.4.0-alpha.N → W2 착지 후 보류(모델 결정 2026-07-11)** — 현 표면은 W1이 즉시 대개명할 표면(폐기 예정 이름에 소비자 통합 방지). W2 완료 시 자동 재개.
- [x] apps/sample 실백엔드 연결 → **fixture 단독 유지(모델 결정 2026-07-11)** — GA 데모 요구 시 재검토(§Backlog).
- [x] **0.2.x 백포트 → No (2026-07-10)** — `release/0.2` 프로덕션 핸즈오프(§Do-NOT). 에러 리포트 시만 대응.
- [x] **다음 방향 = 하드닝 + 점진 확장 (사용자 확정 2026-07-11)** — 실 worklist는 §Tasks(하드닝/확장 트랙)로 승격됨. **하드닝 H 트랙 완료**(게이트·CI·SubColl·H1 캐시·H2 a11y). 남음 = 확장 E 트랙(E1/E2).
- [x] **E-트랙 우선순위 → 전부 (사용자 확정 2026-07-11)** — 전 필드 이식+동작 실증+Daum 주소, foundation-first(EF→EA→EB→EC) 완료로 종결. [계획](./plans/e-track-field-parity.md)
- [x] **업로드 backend seam → 사용자 질문 아님으로 재분류(2026-07-11)** — W5/W6 착수 시 GJCU 관례 확인 후 모델 자동 결정(옵션: sample 업로드 endpoint / BackendAdapter.upload / 외부 URL만).
- [x] **계수 ceiling 재산정 완료(2026-07-11, W4-0)** — 스펙 §10-A 최종 인벤토리 근거로 재산정: **EntityForm 45→55**(최종 53=45 소비자멤버+8 get*Handlers+getReadOnly)·**/schema 180→190**(최종 186=180+W4 2+W5 2+W6 2)·root 120 유지(최종 ~55). count-public-surface.mjs+스펙 §2/§3/§10/§10-A+waves entry-rule 반영. **범위 확장**: Open Q는 /schema만 지목했으나 EntityForm도 최종 45 초과(W4-4서 46) 발견→동반 상향. 임의완화 아님(현값 41/180은 이미 PASS·상한을 최종 설계에 맞춤). gate 재검증: 41/49/180 PASS(임계 55/120/190).

## 완료 기록 (페이즈 완료 시 progress-archive로 이동)

- P0~P2 바닥다지기 + 수직 슬라이스 V0~V2 상세 → [progress-archive/](./progress-archive/) (foundation-P0-P2 · vertical-slice-V0-V2 · formal-roadmap-P3-P7)
