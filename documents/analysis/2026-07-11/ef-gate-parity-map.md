# EF-gate 특성화 패리티 맵 (구엔진 → 신엔진)

> **생성 주체**: EF-gate 리뷰 워크플로우 `wf_72477e22-eef` 의 `find:characterization-parity` 에이전트 (model: sonnet) — 저장 결과는 opus adversarial verify 단계를 거쳐 최종 확정됨.
> **날짜**: 2026-07-11
> **검증 상태**: 이 문서에 담긴 발견 항목은 opus adversarial verify 를 거쳐 **blocking 2 · non-blocking 1** 로 확정되었으며(이 dimension 자체의 발견 1건은 아래 §3 참조), 상세 라우팅은 `documents/progress-archive/phase-e-track-tasks.md` §EF-gate 를 참고할 것.
> **주의**: 본 문서는 **기계 생성 분석 산출물**이며, raw 주장(coverage_note/findings 원문) 단독 인용을 금지한다 — 반드시 opus 검증 결과 및 `phase-e-track-tasks.md` 의 라우팅 표와 함께 인용할 것.

---

## 1. 개요

이 문서는 워크플로우 저널 `subagents/workflows/wf_72477e22-eef/journal.jsonl` 의 `find:characterization-parity` 에이전트(agentId `ae2057c63fad3de59`) 결과 라인에서 추출한 `coverage_note`(구엔진 ↔ 신엔진 패리티 맵, 14개 항목)와 `findings` 배열(1건)을 원문 내용 손실 없이 재구성한 것이다. 원문 서술 순서(1~14)를 그대로 유지했고, 각 항목을 **구엔진 동작 / 신엔진 구현 위치 / pinning 테스트 / 비고**로 재구조화했다(재포맷은 허용, 내용 삭제는 금지 — 원문에 없는 필드는 "명시 없음"으로 표기).

원문 리드 문장(coverage_note 전체에 대한 전제): *"Parity map (old behavior → new-engine implementation → pinning test). All rows are CONFIRMED matching unless flagged; recorded/already-accepted EF1-EF4 deviations are noted but not re-reported."*

---

## 2. 패리티 맵 (14개 항목)

### 1. executeOnChanges 디스패치 (전체 핸들러·등록순·동기 forEach·async 미대기·가드 없음)

- **구엔진 동작**: executeOnChanges: every handler, every change, registration order, sync forEach, async not awaited, no guard (EntityForm.tsx:122-127)
- **신엔진 구현**: dispatchOnChanges in packages/state/src/form-store.ts:243-253 (for...of over entityForm.getOnChanges(), fire-and-forget .catch(()=>{})); registration order via EntityForm.getOnChanges() (packages/schema-core/src/entity-form.ts:176-178, push-order in withOnChanges:114-117). The sync-batch loop-guard is a NEW capability layered on top for the new setValue-based mutation path (old handlers mutated the entityForm object directly, not through a re-entrant setValue, so a loop was structurally impossible in 0.3.x) — per given ground rules this is accepted architecture, not a deviation.
- **pinning 테스트**: packages/state/src/__tests__/on-changes.test.ts ("runs every registered handler, in registration order", "every handler runs on every field change", "an async handler is fire-and-forget", "an async handler rejection does not surface", loop-guard tests), packages/schema-core/src/__tests__/on-changes.test.ts (registration order + clone propagation).

### 2. initialize() 세션 우선순위

- **구엔진 동작**: initialize(): clone, session precedence this.session ?? props.session (EntityForm.tsx:162-164)
- **신엔진 구현**: initializeFormStore clones (packages/state/src/initialize-form-store.ts:63-64) but the new EntityForm class carries NO `session` field at all — session is passed once, directly, via InitializeFormStoreOptions.session / CreateFormStoreOptions.session. Architectural simplification (declaration vs. runtime session fully separated), not a behavioral contradiction — no declared-form session concept survives to be overridden, so not flagged.
- **pinning 테스트**: 명시 없음 (원문에 언급 없음 — 아키텍처적 단순화로 판단되어 flag 대상 아님).

### 3. fetch-once + dataPreloaded skip

- **구엔진 동작**: fetch-once + dataPreloaded skip (EntityForm.tsx:171)
- **신엔진 구현**: `initialData` bypasses the adapter entirely (initialize-form-store.ts:71-79).
- **pinning 테스트**: initialize-form-store.test.ts "initialData bypasses the adapter entirely".
- **비고**: (Old's dataPreloaded=false-but-not-fetchable branch additionally did `await delay(100)` as a modal tab-order UI workaround, EntityForm.tsx:206-208 — not ported, but this is a React-focus polish hack orthogonal to lifecycle semantics, not flagged.)

### 4. 에러 조기 반환(early-return) 시맨틱

- **구엔진 동작**: error early-return semantics (EntityForm.tsx:183-204)
- **신엔진 구현**: initializeFormStore's fetch try/catch returns `{ store: createFormStore(ef, storeOpts), entityForm: ef, error: toBackendError(e) }`, skipping hooks/hydrate (initialize-form-store.ts:72-79).
- **pinning 테스트**: initialize-form-store.test.ts "adapter fetch error: hooks are skipped, store is still usable, error is returned".

### 5. onInitialize 순차 실행 + per-handler catch+continue

- **구엔진 동작**: onInitialize sequential with per-handler catch+continue (EntityForm.tsx:257-265)
- **신엔진 구현**: initialize-form-store.ts:90-96 (sequential for...of, try/catch logs via console.error and continues).
- **pinning 테스트**: initialize-form-store.test.ts "onInitialize handler throw is caught (logged) and remaining handlers still run".

### 6. late-added-field fetched 값 재바인딩 (dotted path 포함)

- **구엔진 동작**: late-added-field fetched rebinding incl. dotted paths (EntityForm.tsx:268-302)
- **신엔진 구현**: form-store.ts addField (362-393) rebinds from the retained `fetchedData` via resolveFetchedValue (form-store.ts:23-31, dotted-path walk), and initializeFormStore builds the store AFTER onInitialize so init-time additions are first-class from the start (doc comment initialize-form-store.ts:13-18).
- **pinning 테스트**: state/__tests__/dynamic-fields.test.ts ("rebinds a flat-named field", "rebinds a dotted-named field"), state/__tests__/initialize-form-store.test.ts ("gets a store slice AND its fetched value (flat name)", "...with a dotted name resolves a nested path").

### 7. list-mode 스킵

- **구엔진 동작**: list-mode skips (EntityForm.tsx: `if (!list)` wrapping onInitialize / late-rebind / fetch)
- **신엔진 구현**: no `list` parameter exists anywhere in InitializeFormStoreOptions; onInitialize always runs.
- **pinning 테스트**: 명시 없음.
- **비고**: Not flagged: grep across src/listgrid confirms `initialize({ list: true })` has NO live caller anywhere in the 0.3.x codebase (only its own default-parameter path and unit test exercise it) — old list-mode form initialization is itself dead code, so its absence carries no practical parity risk. The new engine's list/search UI is a structurally separate class (SearchForm, charter C9), not an EntityForm mode.

### 8. changeHidden/changeRequired 단일-부정 / 배열-매치전용

- **구엔진 동작**: changeHidden/changeRequired singular-mode negation, array-mode match-only (OnChangeEntityForm.ts:293-361)
- **신엔진 구현**: packages/schema-core/src/onchanges/change-hidden.ts, change-required.ts (single clause: matched target gets declared boolean, unmatched gets negation; array: only matching clauses apply, no negation of the rest).
- **pinning 테스트**: schema-core/__tests__/on-changes.test.ts "single clause: matched target gets the declared boolean, unmatched gets its negation", "array of clauses: only the matching clause applies, no negation for the rest", changeRequired equivalent.

### 9. changeSelectOptions no-match 시 선언값으로 revert

- **구엔진 동작**: changeSelectOptions revert-to-declared on no-match, singular/array treated identically (OnChangeEntityForm.ts:203-292)
- **신엔진 구현**: change-select-options.ts:40-60 (`{ options: undefined }` on no-match); FieldRenderer's SelectRenderer merges `metaOptions ?? field.options ?? []` (packages/react/src/registry/default-renderers.tsx:150-153), reproducing revertOptions's declared-list fallback.
- **pinning 테스트**: schema-core/__tests__/on-changes.test.ts "matched clause sets the target options", "unmatched clause reverts (clears) the target options override", "array of clauses: each clause independently applies or reverts".
- **비고**: Old's `entityForm.withShouldReload(changed)` full-remount-on-option-change side effect is deliberately NOT ported — a setMeta-driven single-field re-render replaces it, consistent with item 11 below and the given ground rules (not flagged).

### 10. 사용자 onChange 시에만 검증 (cascade 쓰기는 검증 대상 아님)

- **구엔진 동작**: validate on user onChange only (FieldRenderer.tsx:97-101 — validates via `cloned.validate({fieldNames:[fieldName]})` only from the renderer's own onChange handler; cascade-driven writes on OTHER fields were never separately validated)
- **신엔진 구현**: EF5's touched-gating: performSetValue (form-store.ts:264-281) only calls scheduleValidateOnChange for the TOP-LEVEL (isTopLevel) write; nested mutator.setValue calls from inside onChanges handlers never mark touched/schedule.
- **pinning 테스트**: state/__tests__/validate-on-change.test.ts "cascade writes (onChanges setting a sibling) do not mark it touched / schedule validation, while the user-edited source field still validates".
- **비고**: (EF5 itself being opt-in/default-off and debounced rather than old's always-on synchronous validate is a given, accepted ground rule — "EF5 default-off" — not flagged.)

### 11. shouldReload 풀 리마운트 → structureVersion 기반 부분 재렌더

- **구엔진 동작**: shouldReload full-remount (EntityFormBase.tsx:75-76,636-638; useEntityFormLogic.ts:263-273 — new cacheKey + `entityForm.clone(true).withShouldReload()` + setEntityForm forces a full component remount)
- **신엔진 구현**: EF4's structureVersion (form-store.ts:66, bumped only by addField/removeField, form-store.ts:390/406) + ViewEntityForm re-deriving tabs/groups/fields from `state.fieldDefs` on a structureVersion-only subscription (ViewEntityForm.tsx:95-104), with FieldRenderer subscribing per-field (D4) so untouched fields never re-render.
- **pinning 테스트**: react/__tests__/dynamic-fields.test.tsx "selecting 'extended' adds Extra ... the form is not remounted" (asserts same DOM node identity + surviving in-progress edit on an unrelated field across a structure-version bump).
- **비고**: Minor doc-accuracy nit (not a behavior finding): the test's own comment claims the old remount path "would have reset both" DOM identity AND the in-progress edit, but 0.3.x `clone(true)` copies `current` values forward so the value itself would likely have survived a remount (only DOM identity/focus/scroll would reset) — doesn't affect new-engine correctness, just an overstated comparison in a comment.

### 12. FieldRenderer EF1 meta `??` 머지 + D4 단일 필드 구독

- **원문 서술** (화살표 구조 없이 cross-check 형태로 기술됨 — 구/신 구분 없이 원문 그대로 보존): FieldRenderer.tsx EF1 meta `??` merge, D4 single-field subscription — cross-checked against packages/react/src/components/FieldRenderer.tsx:84-86 (`metaOverride.hidden ?? hidden` etc.) and useFormField/useFieldMeta (D4-scoped subscriptions).
- **pinning 테스트**: react/__tests__/field-meta-reactive.test.tsx, state/__tests__/field-meta.test.ts (validateField override `??` semantics, explicit false wins).

### 13. OnChangeEntityForm.derivedValidations — 미이식(기록된 의도적 생략)

- **구엔진 동작**: OnChangeEntityForm.derivedValidations (OnChangeEntityForm.ts:98-201, the 4th builder)
- **신엔진 구현**: NOT ported. This IS a recorded intentional omission (schema-core/src/index.ts:125: "derivedValidations is out of scope, later task") — not flagged as a finding per the task's own criteria, but noted since EC-track field ports (validation cascades) may eventually need it and documents/plans/e-track-field-parity.md does not yet mention it by name — worth an explicit line item when that later task is scoped.
- **pinning 테스트**: 명시 없음 (미이식 항목).

### 14. onChange(value, propagation=false) cascade 억제 — 신엔진 대응 부재 (갭)

- **구엔진 동작**: onChange(value, propagation=false) cascade suppression (EntityField.ts:155-157, FieldRenderer.tsx:88/105-118)
- **신엔진 구현**: NO new-engine equivalent found anywhere in FormMutator/form-store/renderers. See the blocking finding above — this is the one genuine, unrecorded gap this review surfaces.
- **pinning 테스트**: 없음 — 이 항목이 바로 §3 의 findings 배열에 실린 발견의 근거임.

---

## 3. 이 dimension에서 나온 findings 및 라우팅

`find:characterization-parity` 에이전트의 `findings` 배열에는 **1건**이 담겨 있다 (위 §2 항목 14 와 동일 근거).

### 발견: old-engine `onChange(value, propagation=false)` cascade-suppression has no new-engine equivalent — FormMutator.setValue always dispatches onChanges unconditionally

- **file**: packages/schema-core/src/field/form-mutator.ts
- **line**: 27
- **원 severity (find 단계 자체 평가)**: blocking
- **evidence** (원문 그대로): Old engine: EntityField.ts:155-157 declares `onChange: (value: TValue, propagation?: boolean) => void` with doc "propagation 상위로 onChange 를 전파할 지 여부, 기본은 true, textarea 나 HTML 에디터 필드와 같은 경우 글자가 변경될 때 마다 상위 전파를 하면 안 되기 때문에 이 값을 선택적으로 설정하게 한다." FieldRenderer.tsx:88 computes `isPropagation = isTrue(propagation, true)` and FieldRenderer.tsx:105-118 gates the entire onChanges dispatch loop behind `if (isPropagation)` — a value write with propagation=false updates the field but SKIPS executeOnChanges entirely for that write. This is live, exercised behavior: src/listgrid/components/fields/TelephoneNumberField.tsx:73, BirthdayField.tsx:171/188, MultipleAssetField.tsx:202, view/PhoneNumberFieldView.tsx:69, view/LinkFieldView.tsx:104, view/XrefMappingView.tsx:208/227/245, view/XrefPriorityMappingView.tsx:138/221/237/254, view/XrefAvailableDateMappingView.tsx:158/374, and view/XrefPreferMappingView.tsx:111/321 all call `onChange(value, false)` — composite/formatting widgets (phone-number formatting, birthday reformatting, multi-asset arrays, xref mapping tables) deliberately suppress cascade re-dispatch on intermediate/derived writes.

    New engine: `FormMutator.setValue(name: string, value: unknown): void` (packages/schema-core/src/field/form-mutator.ts:27) carries no suppression parameter. `performSetValue` in packages/state/src/form-store.ts:264-281 always calls `dispatchOnChanges(name)` on every write except when the SAME field is already in the current synchronous loop-guard batch (an unrelated re-entrancy protection, not a caller-requested opt-out). Every registered renderer in packages/react/src/registry/default-renderers.tsx (lines 35, 61, 83, 107, 130, 158, 183) calls `store.getState().setValue(name, v)` with a single argument — there is no channel, even in principle, through which a future field renderer could request "write this value but don't cascade".

    This is not on the given already-reported-deviations list and is not documented anywhere in the EF1-EF5 diff as an intentional omission (unlike derivedValidations, which schema-core/src/index.ts:125 explicitly marks "out of scope, later task"). It directly affects fields slated for EA-B (BirthdayField/PhoneNumberField/TelephoneNumberField — 모더릿/고빈도 필드), EA-C (MultipleAssetField — 업로드 필드), and EA-D (Xref*MappingView family — xref/도메인 필드), all still pending. Porting any of these without a suppression mechanism means every intermediate formatting keystroke or composite-widget write will now dispatch the full onChanges cascade (validation/hidden/required/select-options recompute on every character), a behavior change from the old engine's deliberate throttling — or those field ports will each have to invent an ad-hoc workaround to the FormMutator contract that the EF track was supposed to settle first.

- **suggestion** (원문 그대로): Before EA-B/EA-C/EA-D land, decide and document (or implement) a propagation-equivalent on FormMutator.setValue / store setValue — e.g. an optional `{ cascade?: boolean }` third argument defaulting to true — or explicitly record this as an accepted deviation with a rationale (e.g. "formatting fields will be refactored to only call setValue once, on commit, instead of per keystroke") so EA-track implementers aren't left to independently rediscover and re-solve it per field.

### 라우팅 (opus adversarial verify 결과)

이 발견은 workflow journal 의 verify 라인(`v2:24471fe280e71bde93dcbf6fe69d2ced1e0ee8b3756bd25e2bc3a334989e6da1`, agentId `a8b379524b2967af3`)에서 **`isReal: false`, confidence: high** 로 반박(refuted)되었다. verify 사유(원문): "Factually the code is as described ..., but the failure scenario is not concretely reachable in the reviewed EF1-EF5 diff. Every field the claim depends on (Birthday/Phone/Telephone/MultipleAsset/Xref*MappingView) is admittedly still-pending EA-track work, not yet ported. ... The argument is entirely forward-looking ('before EA-B/EA-C/EA-D land, decide/document...'), i.e. EA-track design input, not a characterization-parity departure in the landed code. ... Legitimate design note for EA planning, not a reachable defect in this diff." (`severity_adjust: "unchanged"`이지만 `isReal: false`이므로 confirmed 집계에는 포함되지 않음.)

이에 따라 `documents/progress-archive/phase-e-track-tasks.md` §EF-gate(라인 104-116)의 **refuted** 목록 ②에 다음과 같이 반영되어 있다: *"`propagation=false`(구 renderer 중간입력 cascade 억제) 대응 seam 부재 — 현 이식 필드 무영향, **EA-B 설계 인풋으로 계획서에 ⚠ 등재**(Birthday/Telephone 라이브 마스킹류)."*

즉 이 발견은 **EF-R1/EF-R2 로 라우팅되지 않았다** (해당 라우팅은 confirmed 3건 — blocking 2·non-blocking 1 — 에만 적용됨). 대신 `documents/plans/e-track-field-parity.md` 라인 48 에 EA-B 착수 전 설계 결정 사항(⚠)으로 등재되었다:

> "⚠ **라이브 마스킹류(Birthday/Telephone) 착수 전**: 구 renderer `propagation=false`(중간입력 cascade 억제) 대응 seam 결정 필요 — 신 store.setValue는 무조건 dispatch(EF-gate 리뷰 노트, renderer-layer seam으로 ADR-0003 무저촉 추가 가능 or commit-시점 1회 setValue)"

참고로 confirmed 된 3건(EF-R1①/EF-R1②/EF-R2)은 `correctness` dimension(`find:correctness` 에이전트)에서 나온 발견이며 이 `characterization-parity` dimension 소관이 아니다 — 상세는 `documents/progress-archive/phase-e-track-tasks.md` §EF-gate 표(라인 109-113) 참조.
