# PROGRESS — 0.4 재기초(re-foundation) 실행

**Created**: 2026-07-10
**Status**: active · 구동 트랙 = **하드닝/확장 트랙**(무인모드) · H ✅ · EF ✅ · **EA(A~D) ✅** · **Next up**: EA phase 리뷰 게이트 → EB(Daum 주소). EA-D2(Xref)는 EC2 뒤. P0/P1 publish는 외부 승인 대기(별건).
**운영 모드**: 무인(unattended)·토큰무제한·품질최우선. 마일스톤마다 멈추지 않고 자율 진행. **중단은 ① 새 세션 필요 ② 크리티컬 패스 결정**뿐 — 비크리티컬 결정은 §Open Questions에 누적해 일괄 질의. active-session marker 등록됨.
**Engine**: claude (codex eligible 태스크는 개별 표기 — 인용 기반 반복 작업만)
**Push**: manual (커밋까지 완료 후 사용자에게 push 대상 보고)
**Model policy**: fable 불필요. 세션 기본 sonnet, `[O]` 태스크만 opus. `[H]`=haiku 위임 가능. 설계 판단이 ADR/헌장으로 해소되지 않으면 구현하지 말고 §Open Questions에 기록 후 질의.
**Next session policy**: 새 세션은 ① 이 문서 → ② [documents/README.md](./README.md)(권위 순서) → ③ 착수 태스크가 가리키는 ADR만 읽고 재개. 분석 원자료(analysis/2026-07-10/raw/)는 읽지 않는다(정정 전 주장 포함).
**Last updated**: 2026-07-11 07:40 (**EA 페이즈 완료** — EA-D InlineMap `1f305f1`로 A~D 종결. 1720 unit+5 E2E green. 이식 완료 필드 누적 21종+기반, dead/연기 5종 기록. **Next=EA phase 리뷰 게이트**(fan-out 의무 — correctness·intent·dedup 차원) → EB. [archive](./progress-archive/phase-e-track-tasks.md) 읽고 재개)

## Goal

[ADR-0008](./adr/ADR-0008-refoundation-strategy.md) 재기초 전략의 실행: `v0.4` 브랜치 모노레포에 4계층 골격을 신축하고, 구엔진(0.3.x)의 검증된 로직을 특성화 테스트 오라클 아래 **이식**하여 0.4.0 GA에 도달. 보존 대상은 [개념 헌장](./prd/concept-charter.md) C1~C9이며, GA 게이트에서 대조표로 검증한다.

## Context

- **브랜치**: `main`=0.3.x 유지보수(P0만). **`v0.4`**=재기초(현 작업 브랜치). main에 0.4 코드 금지, v0.4에 0.3 픽스 직접 커밋 금지.
- **환경**: Node은 `.nvmrc` 기준. **Node 26에서는 기존 테스트 27건이 jsdom localStorage 문제로 실패하니 버전 확인 필수**(P0-8 폴리필로 해소됨). 품질 게이트: `npm run type-check && npm test && npm run lint && npm run format:check && npm run build`.
- **릴리스**: 0.3.26(main, P0), 0.4.0-alpha.N(v0.4, dist-tag `next`), 0.4.0 GA(P7). **npm publish는 외부 공개 — 반드시 사용자 승인 후.**
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

## 세션 인계 (Handoff — 다음 작업: EA-A 트리비얼 필드 12종)

- **현 상태**: **Phase EF ✅**(EF1~5+R1/R2+gate). 명령형 라이프사이클 완비, **1205 unit + 5 E2E green**, 전부 push. 상세 Handoff·패턴 카탈로그는 [archive §Next Phase Handoff](./progress-archive/phase-e-track-tasks.md) — 새 세션은 그것부터.
- **다음 = EA-A**: Checkbox·MultiSelect·Password·Month·Year·Time·Link·Tag·ColorPreset·MessageView·Profile·MappedJoin (12종). 규칙: 1필드=1커밋+테스트. 함정·값형태 [계획 §필드 인벤토리](./plans/e-track-field-parity.md). 기반 클래스 체인(OptionalField/MultipleOptionalField/CheckButtonValidationField/AbstractDateField) 필요 시 선행 이식.
- **fan-out 주의**: 필드 이식은 schema-core 배럴·react 레지스트리(default-renderers)가 **shared-by-construction** → 병렬화하려면 worktree isolation+patch-merge 또는 공유 지점 pre-stage 후 disjoint만 병렬.
- **Do-NOT**: ① store 직접 수신 금지(FormMutator 경유, ADR-0003) ② 동적 mutation 후 entityForm.getFields()류 직접 읽기 금지(store.fieldDefs 경유) ③ 동작 검증 생략 금지 ④ 형식 P3~P7 재개 금지 ⑤ ColorField dynamic Tailwind 이식 금지 ⑥ EA-B 라이브 마스킹류 착수 전 propagation seam 결정(계획 ⚠).
- **불변/함정**: EF1 override `??`·D4 단일필드 구독. EF2 loop-guard sync batch. EF3 build-after-hooks+clone(true). hydrate dotted-path·payload 보존. structureVersion add/remove만 bump.
- **작업 규율**: 설계=세션(conductor), 구현=sonnet 위임, 검증=세션 rigorous(full gate+공유경로 변경 시 full E2E). 완료=logic 커밋→PROGRESS 커밋→**push(사용자: 전부 push)**. 게이트: `type-check && typecheck:packages && test && lint && format:check && build`. Node26(폴리필 OK).

---

## Tasks — 하드닝/확장 트랙 (active · 무인모드)

**확정 방향 (사용자 2026-07-11)**: 수직 슬라이스(실 GJCU 3폼 → 신 엔진 6패키지 → Playwright E2E 5건 green, 헌장 C1~C9 실증)로 ADR-0008 abort 판정을 GO로 실증.
형식 P3~P7(표면 감사표·GA 대조표)은 GA 승격 시 재개하고, 그전까지는 **하드닝 + 점진 확장**으로 진행. 현재 전체 **1205 unit + 5 E2E green**.
게이트: 태스크마다 관련 단위/렌더/E2E 그물 green + (렌더 변경) sample 실화면 확인.

### H — 하드닝 ✅ 완료 (전 5태스크 — 게이트·CI·SubColl·H1 캐시·H2 a11y) · [archive](./progress-archive/phase-hardening-H.md)

### E — 확장 (사용자 확정 2026-07-11: 전 필드 이식 + 동작 실증 + Daum 주소) · [계획](./plans/e-track-field-parity.md)

- [x] **E·Email/Phone** Email/Phone 필드클래스(내장 검증, C4 "클래스1+렌더러1" 패턴 실증, Subject E2E) · `20f5156`

**핵심**: 신 엔진은 선언적 라이프사이클(dependsOn cascade)만 있고 **명령형(onInitialize/onChanges/META 반응성)이 전무** → 필드 렌더만 이식하면 동작이 조용히 no-op. **Phase EF(기반) 먼저 → EA(필드 대량) → EB(주소) → EC(폼+E2E).** 근거·상세 [계획](./plans/e-track-field-parity.md) + [원자료](./analysis/2026-07-11/e-track-understand-workflow.md).

#### Phase EF ✅ 완료 (2026-07-11 — EF1~5 + 리뷰게이트 R1·R2 + gate 통과, 명령형 라이프사이클 완비 · 1205 unit+5 E2E) · [archive](./progress-archive/phase-e-track-tasks.md) · parity map [analysis](./analysis/2026-07-11/ef-gate-parity-map.md)

#### Phase EA — 필드 전수 이식 (EF1~4 후, wave별 전개) **[S, 복잡건 O]**

전개 규칙: wave 착수 시 필드별 `[ ]` 생성(1필드=1커밋+테스트). 함정·값형태는 [계획 §필드 인벤토리]. 빈도순: Datetime40·Xref26·File21·CustomOption17 우선.
- [x] **EA-A 트리비얼 12종** ✅ `e9c1121`(A0 pre-stage)+`5566c21`(wave) · 12/12 이식+196 테스트(1430 green)·E2E 5/5·full gate ✓ · [상세 표](./progress-archive/phase-e-track-tasks.md)
- [x] **EA-B 모더릿 5종+B0/B1** ✅ `4727c22`(pre-stage)+`7cf849f`(wave) · Html 드롭(중복 판정)·cascade seam·배열 isDirty 시스테믹 해소 · +136 테스트(1566 green)·E2E 5/5 · [상세](./progress-archive/phase-e-track-tasks.md)
- [x] **EA-C 업로드 3종+C0** ✅ `544014c`+`b7341dd` · plain string 값+FileInput 슬롯(호스트 업로드)·ContentAsset 연기 · +104 테스트(1670 green)·E2E 5/5 · [상세](./progress-archive/phase-e-track-tasks.md)
- [x] **EA-D InlineMap+dead 정리** ✅ `1f305f1` · store-direct-write 재설계(#1289류 원천 소멸)·dead 3종 연기·Xref→EA-D2 · +50 테스트(1720 green)·E2E 5/5 · [상세](./progress-archive/phase-e-track-tasks.md)
- [~] **EA-R1 (phase 리뷰게이트 수정 5건)** — ① InlineMap fixed-keys `''`값 required 우회(**blocking**, 재현됨 — buildResult에서 빈값 entry 필터+회귀) ② Image multi 데이터 소실(file-renderer multi 모드 미러) ③ Tag meta-options 관례 ④ Password static create 제거 ⑤ file-field buildAssetConfig 공유 import
- [ ] **EA-D2 Xref 인프라+이식** (reorder: EC2 뒤·EC3 앞) — ViewListGrid 확장 4종(selection/subCollection/onFetched/fields — [O] 설계, EC3 실폼 요구 주도) → XrefMapping(29 사이트)+XrefPrefer(+'xrefPreferMapping' 타입). 드래그 재정렬 별도 판단.

#### Phase EB — 주소 (Daum 우편번호, 무료) **[S]**

- [ ] **EB1** schema-core AddressField(exceptOnSave 가상 composite) + applyFullAddressFields(flat 형제 required) — form-store 무변경
- [ ] **EB2** react AddressRenderer — 형제 useFieldValue + useUI 2단 모달 + `<DaumPostcode>` 직접 import + onComplete→형제 setValue fan-out. peerDep react-daum-postcode. (Kakao 지도 연기)

#### Phase EC — EntityForm 사용예 + E2E (동작 실증)

- [ ] **EC1** StudentAddress 재현(주소 baseline, onInit/onChanges 0) + E2E
- [ ] **EC2** Collabo 재현(dynamic options·조건부 required/hidden·M2O 자동채움·file·submit transform) + E2E — EF2/EF3 실증
- [ ] **EC3** Major 재현(TAB hidden·self-ref tree M2O·xref) + E2E
- [ ] **EC4** GraduationReview(custom onSave·role readonly·옵션 pruning) — 후순위/선택

**Next up**: **EA-A** (트리비얼 필드 12종 wave 전개 — 착수 시 필드별 `[ ]` 생성, 1필드=1커밋+테스트).

---

## Needs Review (deviations — 사용자 확인 후 `[x]`)

- [ ] **P0-7 Breaking 소비자 영향** (最우선, publish 전 확인) — simpleCrypt cryptKey 미설정 throw / HTML 싱크 텍스트폴백 / asset-url 폴백제거. GJCU·edustack이 `configureRuntime({cryptKey})` + (HTML 필요시)`configureHtmlSanitizer` 설정하는지 확인해야 무회귀. [detail](./plans/migration-0.3-to-0.4.md#1-0325--0326-하드닝-릴리스--지금-조치-필요)
- [ ] **P0-7 API 범위** — ADR-0006 §3의 encrypt/decrypt 공개 API 제거는 v1.0 단계로 판단, 이번엔 폴백키 제거+throw만 구현(encrypt/decrypt 여전히 export). 의도 확인.
- [ ] **P0-3 신규 사용자 문구** — 에러 표면화 시 `'필드 값을 처리하는 중 오류가 발생했습니다.'` 신설(리포 관례 '~하는 중 오류가 발생했습니다.' 따름). i18n 키화는 P5 동시처리 목록으로 이월.
- [ ] **P0-4 최소범위 초과** — hook이 per-list defaultPageSize에 접근 불가라 `QuickSearchBar`/`ViewListGrid`에 prop 스레딩 추가(1→3파일). 브리핑의 useListGridLogic 우선순위 정렬 지시상 불가피.
- [ ] **P0-8 동결 방식** — no-explicit-any 135파일 동결을 인라인 주석 대신 `eslint.config.mjs` override 블록으로(동일 효과·1파일 diff·whittle-down 용이).
- [ ] **P1-2 ESM 메인배럴 caveat** — 순수 Node ESM `import('@rchemist/listgrid')`(메인)은 `react-sortablejs`(CJS-only peer)의 named export 미검출로 실패. 번들러(Next/webpack) 소비자는 정상. 대응: (a) 수용+MIGRATION 명시 / (b) v0.4에서 @dnd-kit 등 ESM 대체로 교체(P5). 결정 필요.
- [x] **브랜치 전략 확정(2026-07-10)** — main=0.3.x 유지, `p0-hotfixes`/`v0.4` 분리. 플립(0.3→release, v0.4→main)은 전작업+검증 완료 후.
- [ ] **P2 렌더 파일수 게이트** — 게이트 문구는 "렌더 테스트 파일 9→25+"이나 실제는 밀도높은 5파일 68테스트. 파일수 목표 문자적 충족 vs 행동밀도 인정 — 커버리지 래칫 재측정과 함께 판단.
- [ ] **P3-1 조건부 컨텍스트 협소화 (소비자 breaking)** — 조건부 함수 `withHidden((props)=>…)` 등이 EntityForm-carrying `ConditionalValue` 대신 순수 `FieldEvalContext{renderType,session,value,values}`를 받음. 근거 ADR-0003§4·헌장 C2. MIGRATION 1:1 대응표 필요 + P5 렌더러 배선서 실사용 검증. [detail](../packages/schema-core/src/field/eval-context.ts)
- [ ] **P3-1 권한추출 협소화 (행동 narrowing)** — canonical `extractPermissions`=2-way(`roles ?? authentication.roles`)만; 구엔진 getViewableTabs의 `this.session` 인스턴스 폴백(EntityFormBase:356-361) 제거(ADR-0002 정합). 무영향 예상 — 확인. [detail](../packages/schema-core/src/permission.ts)
- [ ] **EF2 meta options 확장** — FieldMetaOverride.options `SelectOption[]`→`| undefined`(revert가 선언옵션 폴백하려면 필요, exactOptionalPropertyTypes) · risk: low · [detail](./progress-archive/phase-e-track-tasks.md)
- [ ] **EF2 빌더 자체필터** — 구엔진 매변경 무조건 재계산 → 신 빌더3종은 changedField≠source면 skip(루프는 전핸들러 호출 유지·settled state 동일) · risk: low · [detail](./progress-archive/phase-e-track-tasks.md)
- [ ] **EF2 미이식 2건** — ConditionalSelectOption defaultValue(구소스 dead code 확인)·withShouldReload(신 대응개념 없음, EF4 영역) · risk: low · [detail](./progress-archive/phase-e-track-tasks.md)
- [ ] **EF2 onChanges 내부표현** — `onChanges?:` 옵셔널 대신 private 빈배열(공개 getOnChanges 계약은 스펙대로) · risk: negligible · [detail](./progress-archive/phase-e-track-tasks.md)
- [ ] **EF3 withId 전파** — 브리핑 미명시였으나 clone 직후 `withId(id)` 추가(fetch-error 경로도 update 모드 유지, sample idiom 일치) · risk: low · [detail](./progress-archive/phase-e-track-tasks.md)
- [ ] **EF3 hydrate dotted 수정(공유코드)** — "지원 확인" 결과 미지원이라 hydrate 내부 resolveFetchedValue 신설(flat 동작 동일·1176 green). EC2 실사용 검증 예정 · risk: low-med · [detail](./progress-archive/phase-e-track-tasks.md)
- [ ] **EF4 fieldDefs=단일 진실** — 동적 mutation 후 entityForm.getFields()류 직접 읽기는 stale(현 콜사이트 0 확인·Handoff Do-NOT 등재). EA/EC 신규 소비자는 store 경유 필수 · risk: low(latent) · [detail](./progress-archive/phase-e-track-tasks.md)
- [ ] **EA-A MultiOptions validate 특성** — min/max-count 체크가 hidden/readonly 상태 재확인 없이 수행(base 설계) — hidden+limited 필드의 빈 값이 count 검증에 걸릴 수 있음 · risk: low · [detail](./progress-archive/phase-e-track-tasks.md)
- [ ] **EA-A Password 참조 push** — withStrength가 구 shallow-copy 대신 validation 참조 유지(구 방식은 프로토타입 메서드 소실 latent bug — 의도적 개선) · risk: low · [detail](./progress-archive/phase-e-track-tasks.md)
- [ ] **EA-A Time 브리핑 정정** — range 'now' sentinel=+12시간(+12분 아님, 구 원본 재확인 후 충실 이식) · risk: none(기록) · [detail](./progress-archive/phase-e-track-tasks.md)
- [ ] **EA-A Month min/max 미전달** — 렌더러가 native input min/max 속성 미전달(TextInputProps에 없음) — validate가 실게이트, UX만 차이 · risk: low · [detail](./progress-archive/phase-e-track-tasks.md)
- [ ] **EA-A Checkbox combo 추가** — withComboType(row/column 힌트)을 base 아닌 Checkbox 전용으로 이식(브리핑 미명시 판단) · risk: negligible · [detail](./progress-archive/phase-e-track-tasks.md)
- [ ] **EA-B Telephone round-trip** — 마운트 시 fetched 하이픈 정규화 안 함(사용자 미편집 값은 원본 유지 — 구 getSaveValue 방어 strip과 다를 수 있음) · risk: low · [detail](./progress-archive/phase-e-track-tasks.md)
- [ ] **EA-B CustomOption layout** — 공유 FormField에 layout 멤버가 없어 필드 own-property로 선언(그룹/레이아웃 시스템 도입 시 재정렬 후보) · risk: low · [detail](./progress-archive/phase-e-track-tasks.md)
- [ ] **EA-C ContentAsset 연기** — "전 필드 이식" 스코프에서 제외: 양 소비자 실사용 0·구엔진에서도 업로드 미완성 스텁(동작 실증 불가)·child EntityForm+FileField 대체 실존 · risk: 스코프 축소(의도 확인) · [detail](./analysis/2026-07-11/ea-c-scout-briefing.md)
- [ ] **EA-D Dead 3종 연기** — Rule(1264줄, 채택 0·bespoke 계약 미확인)·XrefPrice(자체 opt-in 격리)·XrefAvailableDate(순수 미채택): 양 소비자 실사용 0 전수 확인 · risk: 스코프 축소(의도 확인) · [detail](./analysis/2026-07-11/ea-d-scout-briefing.md)
- [ ] **EA-D Map compare 갭(시스테믹)** — schema-core isEquals/normalizeEmptyValue가 Map 인스턴스 전맹(Object.keys 기반 — blank/equal 오판·JSON `{}` 소실). InlineMap은 Record 협소화로 회피; 장래 Map 값 필드 도입 시 선결 · risk: low(latent) · [detail](./progress-archive/phase-e-track-tasks.md)
- [ ] **EA-C 값 shape 다운그레이드** — FileFieldValue envelope 대신 plain string/string[](purity·소비자·백엔드 3중 정합). 구 envelope wire 계약을 쓰는 호스트는 어댑터 변환 필요 · risk: med(마이그레이션 문서화 필요) · [detail](./analysis/2026-07-11/ea-c-scout-briefing.md)

## Progress notes

- 2026-07-11 EF-R2 anomaly: 위임 에이전트가 red-green 증명에 `git stash` 사용(no-git 규칙 위반) — HEAD 불변·stash 잔여 없음 확인, 피해 없음. 브리핑의 no-git 문구는 유지.
- 2026-07-11 EF-gate: 무인 FIND-ONLY 준수 — 발견 3건 전부 태스크(EF-R1/R2) 경유로 수정, 리뷰 자체는 무변경.
- 2026-07-11 EA-A fan-out: 12필드 병렬(disjoint 신규 파일+등록 manifest, 공유 무접촉 확인). **1필드=1커밋 대신 wave 단일 원자 커밋** — fanout 프로토콜(/progress 1회 커밋) 우선, 필드 단위는 파일·테스트로 보존. deviation 17건 중 benign(배럴 대기 import) 다수는 등록으로 해소, 실질 5건만 §Needs Review.
- 2026-07-11 Reorder: EA-D를 분할 — InlineMap만 즉시, Xref 2종은 EA-D2로 EC2 뒤 배치(선행 병목 ViewListGrid 확장을 EC3 실폼 요구 주도로 설계하기 위함 — 과잉설계 방지). Dead 3종(~2.3k줄) 연기로 이식 예산 절약.

## Backlog (헌장 밖 아이디어 — v0.4 편입 금지, 기록만)

- 마이그레이션 how-to는 [리빙 문서](./plans/migration-0.3-to-0.4.md)로 P0-10에서 착수 — 각 페이즈가 호환성 변경을 발생 커밋에서 누적, P7에서 `docs/MIGRATION.md`+codemod로 승격.
- **P3-1 스카우트 발견 (필드 이식 시 처리)**: PhoneNumber/TelephoneNumber `validate()` 본문 동일(파라미터화 통합 후보) · `RegexFormularValidation.ts` 파일명 오타(클래스=`RegexFormulaValidation`, 이식 시 정정) · `Validation.tsx`→`.ts`(JSX 0) · `getConditionalReactNode`(React.isValidElement)는 렌더러 계층으로 이관 · SearchForm `quickSearchFields` 중복 사이드채널 · `EQUAL_IGNORECASE`/`NOT_LIKE`는 셀렉트 미노출(의도 확인).

## Open Questions

- [x] **릴리스 기전 확정(2026-07-10)** — `v*` 태그 push→`publish.yml` 자동배포(dist-tag `-alpha`→next/`0.2.x`→legacy-0.2/else latest). 게이트 선행.
- [ ] **0.3.26 실배포 트리거 (외부 — 사용자 실행/승인)** — 준비 완료(`p0-hotfixes`, 게이트 green). 절차: `p0-hotfixes`→main 병합 → `git tag v0.3.26` → push → latest 자동배포. **선결: 0.3.26은 hardening Breaking 3종 포함(patch에 breaking) — GJCU/edustack이 cryptKey/sanitizer 설정했는지 확인 후 배포**(§Needs Review). 로컬 미푸시 유지 중.
- [ ] **0.4.0-alpha.N 배포** — `v0.4.0-alpha.N` 태그 push → next 자동배포. P1 완료로 준비됨. 사용자 실행/승인 시점 결정.
- [ ] apps/sample 목업 백엔드에 실제 rcm-backend-framework 연결 옵션(로컬 인스턴스)을 둘지 — 현재 명세는 fixture 단독.
- [x] **0.2.x 백포트 → No (2026-07-10)** — `release/0.2` 프로덕션 핸즈오프(§Do-NOT). 에러 리포트 시만 대응.
- [x] **다음 방향 = 하드닝 + 점진 확장 (사용자 확정 2026-07-11)** — 실 worklist는 §Tasks(하드닝/확장 트랙)로 승격됨. **하드닝 H 트랙 완료**(게이트·CI·SubColl·H1 캐시·H2 a11y). 남음 = 확장 E 트랙(E1/E2).
- [x] **E-트랙 우선순위 → 전부 (사용자 확정 2026-07-11)** — 구엔진 전 필드 이식 + 동작(onInitialize/onChanges/state) 실증 + Daum 주소(무료). GJCU 것 활용/창작 자유. 계획: [e-track-field-parity.md](./plans/e-track-field-parity.md). foundation-first(EF→EA→EB→EC).
- [ ] **업로드 backend seam (EA-C 착수 시 결정)** — File/Image/MultipleAsset/ContentAsset 이식은 업로드 저장/서빙 방식 필요. GJCU는 asset 서버 사용. sample 목업에 업로드 endpoint를 둘지 vs BackendAdapter에 upload 시그니처 추가 vs 외부 asset URL만 지원. EA-C 도달 시 GJCU 관례 확인 후 결정.

## 완료 기록 (페이즈 완료 시 progress-archive로 이동)

- P0~P2 바닥다지기 + 수직 슬라이스 V0~V2 상세 → [progress-archive/](./progress-archive/) (foundation-P0-P2 · vertical-slice-V0-V2 · formal-roadmap-P3-P7)
