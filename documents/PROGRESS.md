# PROGRESS — 0.4 재기초(re-foundation) 실행

**Created**: 2026-07-10
**Status**: active · 기반(…W1·W2) + **W3 권한·능력·액션 ✅ 완료**(6 sub-task+phase-end 하드닝·CAP-02/03/06/08/09/22/27 소화). **Next up**: **W4 폼 완결**(title·steps·AsyncValidation·revision·meta) — **⚠ W4-1 착수 전 /schema §10 ceiling 재산정 필수**(180/180 도달·§Open Q). **2003 unit/E2E 19**·계수 41/49/**180(==ceiling)** PASS. P0/P1 publish는 외부 승인 대기(별건).
**운영 모드**: 무인(unattended)·토큰무제한·품질최우선. 마일스톤마다 멈추지 않고 자율 진행. **중단은 ① 새 세션 필요 ② 크리티컬 패스 결정**뿐 — 비크리티컬 결정은 §Open Questions에 누적해 일괄 질의. active-session marker 등록됨.
**Engine**: claude (codex eligible 태스크는 개별 표기 — 인용 기반 반복 작업만)
**Push**: auto (사용자 확정 2026-07-11 — 커밋·push·배포까지 자율 실행 후 결과 보고. "커밋할까요/배포할까요" 금지)
**Model policy**: 설계 pass 완료 — **구현 wave(W1~W7)는 실행급 브리프로 opus/sonnet 세션 실행 가능**. 위임 기본 sonnet(waves 브리프=브리핑 원문). **스펙이 침묵하는 판단=구현 금지**(스펙 §10 게이트 4) — 스펙 개정만 상위 티어.
**Next session policy**: **W1~W3 ✅ 완료**. 새 세션(W4)은 ① [W3 Handoff](./progress-archive/phase-eg-api-redesign.md#w3-페이즈-완료-인계-handoff--w4-폼-완결)(도입 표면·Do-NOT·**W4-1 전 /schema ceiling 재산정 BLOCKING**) → ② [waves 브리프](./plans/entityform-api-implementation-waves.md) 전역 규칙+**W4 표** → ③ [스펙](./plans/entityform-public-api-spec.md) 인용 §만(§3.1·§5.3) → ④ (판단 필요 시) [ADR-0009](./adr/ADR-0009-entityform-public-api-redesign.md). 구 `src/listgrid/`·8그룹 map·감사는 W5 entry pass까지 불필요.
**Last updated**: 2026-07-11 (**W3 페이즈 ✅ 완료+seal** — W3-6 하드닝(phase-end 적대 리뷰 4버그 fix)+아카이브+Handoff. W3 전체 `4d30159`..`b4ecda3`(6 sub-task+하드닝)·**2003 unit·E2E 19**·계수 41/49/180. CAP 7종 소화. sonnet delegate·opus 검증(+phase-end 리뷰서 4버그 검출). **다음 세션 = W4**(착수 전 /schema ceiling 재산정). [W3 상세](./progress-archive/phase-eg-api-redesign.md#w3-페이즈-완료-인계-handoff--w4-폼-완결))

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
| **하드닝/확장 트랙** | v0.4 | [~] 진행 중 (H·EF ✅ · EA 착수) | — | 이 문서 §Tasks · [E계획](./plans/e-track-field-parity.md) |

**타임박스**: P4 parity 6개월 초과 시 ADR-0008 §6 abort 검토 — 수직 슬라이스가 abort 판정을 **GO로 조기 실증**(2026-07-11)해 위험 완화됨.

## 세션 인계 (Handoff — **W3 페이즈 ✅ 완료·seal**. 다음: **W4 폼 완결**(착수 전 /schema ceiling 재산정) — 전체 인계는 [W3 Handoff](./progress-archive/phase-eg-api-redesign.md#w3-페이즈-완료-인계-handoff--w4-폼-완결))

- **W2 완료(2026-07-11, 8 sub-task `005b4a3`..`ed77ecf`)**: 훅+컨트롤러 전건 — 라이프사이클 **8훅**(onInit/onChange/onBefore·After{Save,Delete,ListFetch})·InitContext(setMeta)·FormMutator+getRenderType/getSession·**messages** 채널·**serializeValue** seam(toSaveData 재작성)·**FormRuntime(schema)+createFormController(state)**·useEntityForm·EF6 제거·selectOptions 레이스 fix. **1936 unit/E2E 16 green·계수 EntityForm 37/45·root 49/120·/schema 175/180 PASS**. sonnet delegate 7+inline 1·opus 검증/커밋. 상세 [archive](./progress-archive/phase-eg-api-redesign.md#w2).
- **W3 착수 규율(하드)**: 권한·능력·액션(CAP-02·03·06·08·09·22·27). hot-file 3종 **순차·fan-out 금지** 유지(ViewEntityForm=버튼/액션바 대폭 수정). **승계 배선점**: ① ✅**W3-1 완결**(TabDef.hidden conditional 정적해석=getStaticConditionalBoolean·deriveTabs+seed 2곳 TODO 마감) ② ✅**W3-2 완결**(capability 게이트=controller save/del step1·denied silent {ok:false}·Save 버튼 sync 가시성·withNeverDelete 제거) ③ ✅**W3-3 완결**(Save 버튼 rewire→controller.save 단일 validate·onSave=post-save 콜백·통합 액션 바·빌트인 Delete 파생=update&&controller만·confirm+E2E는 W3-4) ④ **계수 ceiling 도달**: /schema **180**/180 — **W4 신타입 진입 시 초과**(§Open Questions 등재·W4-1 착수 전 §10 재산정)·EntityForm 37/45 — W3-2/3 신타입(Capabilities·FormAction·ActionContext·ActionRender) 추가 시 180 접근 감시. 멤버 제거/개명 검증=tsc+npm test 둘 다(tsc -b는 __tests__ 미커버).
- **설계 pass 완료(2026-07-11, fable)**: 공개 API 재설계 확정 — [ADR-0009](./adr/ADR-0009-entityform-public-api-redesign.md)(결정)·[스펙 r2](./plans/entityform-public-api-spec.md)(규범: CAP-01~29·EntityForm 44멤버·훅 8종·FormRuntime/FormController·messages 채널·serializeValue seam)·[waves 브리프](./plans/entityform-api-implementation-waves.md)(실행 계약: W1~W4 태스크급 완전 명세, W5~W7 entry-pass 규칙). 4렌즈 적대검증 22건(blocker 1) 전건 반영. 상세 [archive](./progress-archive/phase-eg-api-redesign.md).
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

- [x] **EG1+EG2** 권한 배선 ✅ `a1f3deb` — isPermitted end-to-end(FieldRenderer 하드게이트·EF1 우회불가)·LIVE 보안갭 fix·재설계 무관 유지. +10(1876)·16 E2E · [detail](./progress-archive/phase-eg-api-redesign.md)
- [x] **EG-D 재설계 설계 pass** ✅ 2026-07-11 · ADR-0009+스펙 r2+waves 브리프 · 4렌즈 검증 22건 반영 · [detail](./progress-archive/phase-eg-api-redesign.md)
- [x] **W1 표면 정비** ✅ 2026-07-11 · 7커밋 `599a3f3`..`4c04906` · 개명·정체성·without*·배럴·계수 CI · full gate+E2E 16·계수 PASS · CAP-12일부 · [detail](./progress-archive/phase-eg-api-redesign.md)
- [x] **W2 훅+컨트롤러** ✅ 2026-07-11 · 8 sub-task `005b4a3`..`ed77ecf` · 8훅+FormRuntime/Controller · full gate+E2E 16·1936 unit·계수 37/49/175 · [detail](./progress-archive/phase-eg-api-redesign.md#w2)
- [x] **W3 권한·능력·액션** ✅ `4d30159`..`b4ecda3`(6 sub-task+W3-6 하드닝) — CAP-02/03/06/08/09/22/27 소화·2003 unit·E2E 19·계수 41/49/180·phase-end 적대 리뷰(4버그 검출→fix) · [detail](./progress-archive/phase-eg-api-redesign.md#w3-페이즈-완료-인계-handoff--w4-폼-완결)
- [ ] **W4 폼 완결** — title·steps·AsyncValidation·revision·meta(merge) · Spec §3.1·§5.3 · CAP-05·07·10·13·23 · [waves §W4](./plans/entityform-api-implementation-waves.md)
- [ ] **W5 list-track** — **entry 브리핑 pass 선행**(waves §W5 규칙: 태스크 표를 먼저 추가·커밋) · CAP-18·19·20
- [ ] **W6 data-transfer** — entry pass 선행 · CAP-16·17
- [ ] **W7 패키징+마이그레이션** — subpath exports·headless fixture·MIGRATION+codemod · CAP-24·25

**Next up (다음 세션)**: **W4 폼 완결**(W4-1 title·W4-2 steps·W4-3 AsyncValidation·W4-4 revision·W4-5 meta · 스펙 §3.1·§5.3 · CAP-05·07·10·13·23 · [waves §W4](./plans/entityform-api-implementation-waves.md)). **⚠ W4-1 착수 전 BLOCKING**: /schema 계수 180/180 ceiling 재산정(§Open Questions·스펙 §10). hot-file 순차·delegate 기본 sonnet·opus 검증+**phase-end 적대 리뷰 필수**(W3서 4버그 검출 실증). W3 도입 표면·Do-NOT·미결은 [W3 Handoff](./progress-archive/phase-eg-api-redesign.md#w3-페이즈-완료-인계-handoff--w4-폼-완결).

---

## Needs Review (deviations — 사용자 확인 후 `[x]`)

- [x] **전건 처분(30항목) 2026-07-11** — 사용자 지시로 모델 확정: P0-7 소비자 영향 직접검증 해소·changeSelectOptions 레이스→W2-8 전환·나머지 28건 확정. [dispositions](./progress-archive/needs-review-dispositions-2026-07-11.md)
- [x] **브랜치 전략 확정(2026-07-10)** — main=0.3.x 유지, `p0-hotfixes`/`v0.4` 분리. 플립(0.3→release, v0.4→main)은 전작업+검증 완료 후.
- [ ] **#W2-1 onInit 통합 시맨틱(마이그레이션 확인)** — 구 onFetchData+onInitialize 2배열→onInit 1배열(registration-order·ctx.data 분기·반환-교체 hatch 폐기, §4.2/§9 결정). W7 gjcu 마이그레이션서 등록순서 의존·반환교체 사용처 확인 · risk: migration
- [ ] **#W2-5 SaveOutcome reason-less cancel 구별불가** — 스펙 §6.2 SaveOutcome는 exactOptional로 `cancelled: undefined` 불가 → reason 없는 cancel()이 {ok:false}로 validation-fail과 outcome 구별불가(부작용으로만 구별). 스펙 저자: 판별자 추가 or 현행 수용 · risk: api-semantics
- [ ] **#W3-2 capability-denied outcome 구별불가** — controller save/delete의 capability 거부가 `{ok:false}` 반환(타입상 유일 non-error·non-cancel 선택) → validation-fail·reason-less cancel과 형태 동일(#W2-5 동류). silent block(adapter 미호출)은 정상. 스펙 §6.2 저자: 판별자(예: `blocked?: 'capability'`) 추가 여부 · risk: api-semantics · [detail](./progress-archive/phase-eg-api-redesign.md#w3)
- [ ] **#W3-5b replaces:'save' 커스텀 액션이 formReadOnly Save-숨김 우회** — formReadOnly는 빌트인 saveBuiltin만 제외(merge 전)·replaces:'save' 커스텀 액션은 getActions 경유라 미게이트 → readOnly 폼에 커스텀 save-slot 액션 렌더. 스펙 §3.1 "빌트인 Save 어포던스 숨김"=빌트인만(literal OK)이나 의도상 애매. 스펙 저자: replaces:'save'도 formReadOnly 숨김 대상인지 · risk: api-semantics(spec-ambiguous·저위험)
- [ ] **#W3-3 controller-optional vs ActionContext.controller(required) 타입 불일치** — ViewEntityForm.controller? optional인데 ActionContext.controller: FormRuntime(required) → controller 부재 시 커스텀 액션/빌트인 Delete/render-slot omit(빌트인 Save legacy만). 특히 replaces:'save'+no-controller=Save 버튼 아예 없음. 스펙 §3.4/§7 저자: controller required화 or ActionContext.controller optional화 · risk: api-type-consistency · [detail](./progress-archive/phase-eg-api-redesign.md#w3)

## Progress notes

- EF/EA 페이즈 노트(EF-R2 stash anomaly·EF-gate FIND-ONLY·EA-A fan-out 커밋방식·EA-D reorder)는 [archive](./progress-archive/phase-e-track-tasks.md#progress-notes-본문-이월-2026-07-11--efea-페이즈-완료로-아카이브)로 이월.
- 2026-07-11 W1 방법론: `tsc -b`(typecheck:packages)는 __tests__ 미타입체크 → EntityForm 멤버 제거/개명 시 테스트파일 콜러는 `npm test`로만 검출. rename 웨이브 검증은 tsc+test 둘 다 필수(W1-3에서 발견, W1-4/5 승계).
- 2026-07-11 EG-D 검증: 4렌즈 적대검증(wf_c55e83dc-6b1) 22건(blocker 1·major 18·minor 3) **전건 수용·r2 반영** — blocker=InitContext.setMeta 부재(gjcu 774+118 콜사이트 이식 불가). opus 봉인 재검증 1회 수행.
- 2026-07-11 교차리포: 실행급 스펙 규율을 harness에 제도화(팀규약·model-routing·progress-authoring/delegate·issue·codex 미러 — harness `b178fa6` push+install). 사용자 지시: opus-only 모드에서도 균질 실행.
- 2026-07-11 W2 착수: 8 sub-task(W2-1~8) hot-file 순차·delegate 기본 sonnet(waves §W2 브리핑 원문)·opus 검증/커밋. sub-task 상세는 [phase-eg-api-redesign](./progress-archive/phase-eg-api-redesign.md)에 행 누적, W2 §Tasks 라인은 8/8 후 [x].
- 2026-07-11 W3 착수: 5 sub-task(W3-1~5) hot-file 순차·fan-out 금지·delegate 기본 sonnet(waves §W3=브리핑 원문)·opus 검증(full gate+diff 발명감사)/커밋. 상세는 [archive #w3](./progress-archive/phase-eg-api-redesign.md#w3) 행 누적, W3 §Tasks 라인은 5/5 후 [x]. **W3-1 발명게이트 1건**(sync ConditionalBoolean 해석=async resolver뿐)→[blueprint EG4 sync 근사 GO](./plans/eg-entityform-full-parity.md) 사전판정 바인딩으로 해소(getStaticConditionalBoolean 신설·발명 아님).

## Backlog (헌장 밖 아이디어 — v0.4 편입 금지, 기록만)

- 마이그레이션 how-to는 [리빙 문서](./plans/migration-0.3-to-0.4.md)로 P0-10에서 착수 — 각 페이즈가 호환성 변경을 발생 커밋에서 누적, P7에서 `docs/MIGRATION.md`+codemod로 승격.
- **P3-1 스카우트 발견 (필드 이식 시 처리)**: PhoneNumber/TelephoneNumber `validate()` 본문 동일(파라미터화 통합 후보) · `RegexFormularValidation.ts` 파일명 오타(클래스=`RegexFormulaValidation`, 이식 시 정정) · `Validation.tsx`→`.ts`(JSX 0) · `getConditionalReactNode`(React.isValidElement)는 렌더러 계층으로 이관 · SearchForm `quickSearchFields` 중복 사이드채널 · `EQUAL_IGNORECASE`/`NOT_LIKE`는 셀렉트 미노출(의도 확인).
- react-daum-postcode를 required peer로 전환(EB-R1) — 주소 미사용 소비자용 subpath opt-in 분리(#7 이슈 3분류 선례)는 P5 패키징에서 검토.

## Open Questions

- [x] **릴리스 기전 확정(2026-07-10)** — `v*` 태그 push→`publish.yml` 자동배포(dist-tag `-alpha`→next/`0.2.x`→legacy-0.2/else latest). 게이트 선행.
- [x] **0.3.26 실배포 — 실행 완료(2026-07-11)** — 소비자 검증(무회귀 확인) → main ff-merge `853660b` → `v0.3.26` 태그 push → publish.yml latest 자동배포. 처분 상세 [dispositions](./progress-archive/needs-review-dispositions-2026-07-11.md).
- [x] **0.4.0-alpha.N → W2 착지 후 보류(모델 결정 2026-07-11)** — 현 표면은 W1이 즉시 대개명할 표면(폐기 예정 이름에 소비자 통합 방지). W2 완료 시 자동 재개.
- [x] apps/sample 실백엔드 연결 → **fixture 단독 유지(모델 결정 2026-07-11)** — GA 데모 요구 시 재검토(§Backlog).
- [x] **0.2.x 백포트 → No (2026-07-10)** — `release/0.2` 프로덕션 핸즈오프(§Do-NOT). 에러 리포트 시만 대응.
- [x] **다음 방향 = 하드닝 + 점진 확장 (사용자 확정 2026-07-11)** — 실 worklist는 §Tasks(하드닝/확장 트랙)로 승격됨. **하드닝 H 트랙 완료**(게이트·CI·SubColl·H1 캐시·H2 a11y). 남음 = 확장 E 트랙(E1/E2).
- [x] **E-트랙 우선순위 → 전부 (사용자 확정 2026-07-11)** — 전 필드 이식+동작 실증+Daum 주소, foundation-first(EF→EA→EB→EC) 완료로 종결. [계획](./plans/e-track-field-parity.md)
- [x] **업로드 backend seam → 사용자 질문 아님으로 재분류(2026-07-11)** — W5/W6 착수 시 GJCU 관례 확인 후 모델 자동 결정(옵션: sample 업로드 endpoint / BackendAdapter.upload / 외부 URL만).
- [ ] **/schema 계수 ceiling(스펙 §10) 재산정 — W4 착수 전(모델/스펙 저자)** — W3-3에서 /schema 180/180 도달(FormAction/ActionContext/ActionRender +3). W4 신타입(StepDef·FieldListConfig·FieldFilterConfig·AsyncValidation·DataFieldSpec 등)은 첫 export에서 180 초과. §10 ceiling을 **최종 타입 인벤토리 기준으로 재산정**(임의완화 아님 — 초기 추정치가 최종 설계에 미달). W4-1 착수 시 처리. risk: gate-blocking

## 완료 기록 (페이즈 완료 시 progress-archive로 이동)

- P0~P2 바닥다지기 + 수직 슬라이스 V0~V2 상세 → [progress-archive/](./progress-archive/) (foundation-P0-P2 · vertical-slice-V0-V2 · formal-roadmap-P3-P7)
