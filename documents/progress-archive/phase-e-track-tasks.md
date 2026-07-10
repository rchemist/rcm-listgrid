# E-트랙 태스크 상세 아카이브 (delegate 결과 기록)

**Parent PROGRESS**: [../PROGRESS.md](../PROGRESS.md) · **계획**: [../plans/e-track-field-parity.md](../plans/e-track-field-parity.md)

---

## EF2 — onChanges cascade (FormMutator + loop-guard + 빌더 3종)

**완료**: 2026-07-11 · **실행**: delegate(sonnet, wf_009e959f-b2b, 130k tokens/64 tool calls/9.6min) · **status**: `done_with_deviations` (4건 — 본문 §Needs Review)

**Reuse review**: Extend: form-store.setValue + EF1 meta-slice(setMeta) + EntityForm(withOnChanges 추가) — New: FormMutator(ADR-0003 순수성 — FieldEvalContext는 read-only 평가용이라 부적합) + 빌더 3종(구 카탈로그 이식).

### 구현 (에이전트 notes 요약)

- **schema-core** — 신규 `field/form-mutator.ts`: `interface FormMutator { getValue(name); getValues(); setValue(name, value); setMeta(name, partial: FieldMetaOverride) }` + `type OnChangesHandler = (mutator, changedField) => void | Promise<void>`. `entity-form.ts`: `private onChanges: OnChangesHandler[] = []` + `withOnChanges(h)`(append) + `getOnChanges()` + `clone()`이 `copy.onChanges = [...this.onChanges]` 전파(구 EntityForm.tsx:94 parity).
- **빌더 카탈로그** `schema-core/src/onchanges/`: `changeHidden`·`changeRequired`(`(sourceField, ConditionalMetaClause|[])→OnChangesHandler`, Record<string,boolean>, 단수모드 negation/배열모드 match-only — 구 OnChangeEntityForm.ts:328-361/293-327 이식), `changeSelectOptions`(match→set / no-match→revert via `setMeta({options: undefined})` — 구 203-292 이식). 3종 모두 `changedField === sourceField` 자체 필터, mutate는 오직 `m.setMeta`.
- **state** `form-store.ts`: setValue→내부 `performSetValue` + **batch changed-set loop-guard**(`dispatchBatch: Set<string>|null` — top-level이 batch 열고, 중첩 mutator.setValue는 항상 값 기록·batch 내 필드는 dispatch skip, try/finally로 핸들러 throw에도 batch 해제). store-backed FormMutator closure 주입. async 핸들러는 fire-and-forget + `.catch(()=>{})`(unhandled rejection 방지). 등록순 dispatch.

### 검증 (에이전트 자가보고 — 세션 authoritative 게이트는 별도 수행)

- `npm run typecheck:packages` clean · 변경 11파일 eslint clean · 신규 3 테스트파일 22/22 green (dispatch 순서·전핸들러 호출·형제 setValue/setMeta 가시성·A→B→C 허용·A→B→A 종료·batch 초기화·async fire-and-forget·getValues 스냅샷·withOnChanges/getOnChanges/clone 전파·빌더 3종 fake-FormMutator 단위·react 통합 1건: 실제 fireEvent.change→Secret 필드 DOM 제거/복원)
- 전체 `npx vitest run`: **79 파일 / 1160 passed** (1 pre-existing todo, 0 fail — 1138→1160, +22)

### Deviations (4건 — §Needs Review 라우팅됨)

1. **FieldMetaOverride.options 타입 확장** — `SelectOption[]` → `SelectOption[] | undefined` (field-meta.ts). 사유: changeSelectOptions revert가 `setMeta({options: undefined})`로 선언 옵션 폴백해야 하는데 `exactOptionalPropertyTypes: true`에서 `| undefined` 없이는 tsc 실패. FormMutator에 'clear' 프리미티브 신설 대신 최소 확장. risk: Low(추가적 확장, 기존 콜사이트 무영향).
2. **빌더 3종 자체 필터링** — 구엔진은 매 변경마다 무조건 재계산(결과는 sourceField 값에만 의존 → no-op 재계산). 신 빌더는 `changedField !== sourceField`면 early return으로 불필요 setMeta 생략. **dispatch 루프 자체는 여전히 전 핸들러 무조건 호출**(커스텀 핸들러는 구 semantics 그대로) — 콜카운트 literal port가 아닌 해석 선택. risk: Low(최종 settled state 동일, 테스트 검증).
3. **defaultValue·withShouldReload 미이식** — 구 ConditionalSelectOptionProps.defaultValue는 구 소스에서 dead code 확인(콜사이트가 실제 전달 안 함). withShouldReload는 신 EntityForm에 대응 개념 없음(reload 신호는 EF4 structure-version 영역). risk: Low(행동 0 이식 누락 / 기존 스코프 갭).
4. **onChanges 내부 표현** — `onChanges?: OnChangesHandler[]` 대신 `private onChanges: OnChangesHandler[] = []`(비옵셔널 빈배열). getOnChanges() 공개 계약은 스펙대로. risk: Negligible.

proposed_helper: 없음.

---

## EF3 — initializeFormStore 파이프 (build-after-hooks)

**완료**: 2026-07-11 · **실행**: delegate(sonnet, wf_0bdcf17e-90b, 127k tokens/87 tool calls/9.2min) · **status**: `done_with_deviations` (2건 — 본문 §Needs Review)

**Reuse review**: Extend: EntityForm(EF2 withOnChanges 패턴)·createFormStore/hydrate 호출 재사용 — New: state initializeFormStore 파이프 + react useEntityFormInitializer.

### 구현 (에이전트 notes 요약)

- **schema-core** `entity-form.ts`: `OnFetchDataHandler`/`OnInitializeHandler` 타입(순수 EntityForm-in/out) + private 배열 + `withOnFetchData`/`withOnInitialize`(append) + getter + `clone()` 전파 — EF2 onChanges 패턴 그대로.
- **state** 신규 `initialize-form-store.ts`: `initializeFormStore({entityForm, adapter?, id?, session?, initialData?}) → {store, entityForm, error?}` — clone→`withId(id)`→(initialData ?? adapter.getOne)→onFetchData*(data 있을 때만, 순차)→onInitialize*(순차, per-handler catch+continue)→**createFormStore(훅 적용 후 build)**→hydrate(data). fetch 실패 시 훅·hydrate 생략+normalized BackendError 반환(구 198-203 parity). 
- **state** `form-store.ts`: hydrate가 flat `data[name]`만 지원하던 갭 → 내부 비공개 `resolveFetchedValue(data, name)` dotted-path walker 추가(구 setFetchedValues parity). flat 이름 동작 byte-identical.
- **react** 신규 `hooks/use-entity-form-initializer.ts`: `useEntityFormInitializer` → {store, entityForm, loading, error?} — cancellation-safe useEffect, dep은 entityForm/adapter/id identity만(session/initialData는 latest closure — providers/adapter.tsx idiom). 기존 동기 createFormStore 콜사이트 무변경.

### 검증 (에이전트 자가보고 — 세션 authoritative 게이트 별도)

- typecheck:packages clean · 터치 파일 eslint 0/0 · 전체 vitest **81 파일/1176 passed**(1160→1176, +16)
- state 9/9: 파이프 순서·핸들러가 새 EntityForm 반환 시 교체·onInitialize throw catch+continue·**동적 추가 필드가 슬라이스+fetched 값 수신(flat AND dotted)**·initialData 우회·fetch 에러 시 훅 skip+store 사용가능·create 모드 onInitialize만·hydrate가 EF2 onChanges 미발화
- react 1/1: 실제 ViewEntityForm 렌더 — fake adapter+동적 필드 추가 onInitialize → loading 해소 후 원본+동적 필드 fetched 값 DOM 표시

### Deviations (2건 — §Needs Review 라우팅됨)

1. **withId(id) 전파** — 브리핑 a단계에 미명시였으나 clone 직후 `ef.withId(id)` 추가. 없으면 fetch-error 경로가 create 모드와 구분 불가(getId undefined→update URL 불능). sample edit page의 기존 idiom(`clone().withId(id)`)과 일치. risk: Low(추가적, 기존 테스트 무영향).
2. **hydrate dotted-path 수정(공유 코드)** — 브리핑 "dotted 지원 확인 — 될 것" 실제론 미지원 → hydrate 내부에 비공개 resolveFetchedValue 추가. EF3 수용기준(동적 필드 dotted 바인딩)에 필수. 공유 hydrate 변경이나 flat 동작 동일·전 스위트 green. risk: Low-medium. **EC2(Collabo nested 필드)가 실사용 검증 예정.**

---

## EF4 — 동적 필드 add/remove + structure-version (shouldReload 정밀 대체)

**완료**: 2026-07-11 · **실행**: delegate(sonnet, wf_1e3a85c3-746, 159k tokens/81 tool calls/10.7min) · **status**: `done_with_deviations` (2건 — 실질 1건만 §Needs Review, 1건은 브리핑에 명시 지시된 기계적 변경)

**Reuse review**: Extend: form-store(fieldDefs+structureVersion)·FormMutator(addField/removeField — 이번 태스크 인터페이스 확장 인가)·ViewEntityForm(version 구독) — New: 없음.

### 구현 (에이전트 notes 요약)

- **schema-core** `form-mutator.ts`: FormMutator에 `addField(field: FormField)`/`removeField(name)` 확장(계약 doc-comment). on-changes.test.ts의 fakeMutator에 no-op stub 추가(인터페이스 정합 — 브리핑 명시 지시).
- **state** `form-store.ts`: `fieldDefs: Record<string,EntityField>` **live field registry**(생성 시 entityForm.getFields() 복사, 이후 hydrate/validateField/validateAll/toSaveData의 유일한 읽기 원천 — entityForm 인스턴스는 불변 유지) + `structureVersion`(add/remove만 bump). `addField`: form 미지정 시 default tab/group 배치(구 addFields default parity)·`seedSlice()` 공유 시딩·보존된 hydrate payload(`fetchedData`)에서 resolveFetchedValue로 재바인딩(dotted 지원)·중복명=필드정의+슬라이스 전체 교체(구 fields.set parity). `removeField`: fieldDefs/values/meta 삭제·부재 시 진성 no-op(bump 없음). 둘 다 performSetValue 밖 plain set — EF2 loop-guard 무간섭·추가 필드 retro-dispatch 없음. store-backed FormMutator 어댑터에 위임 배선.
- **react** `ViewEntityForm.tsx`: 파일스코프 liveFields/deriveTabs/deriveGroups/deriveGroupFields — store.fieldDefs에서 구조 재도출(선언 TabDef/FieldGroupDef는 label/order만 참조, 미선언 id는 unlabeled 후순위 폴백). `structureVersion` 구독=순수 리렌더 트리거, 값 편집은 이 구독 미발화(D4 보존). focusFirstInvalidField·그룹 렌더 루프도 live registry로 통일.

### 검증 (에이전트 자가보고)

- tsc -b(3패키지+repo-wide) clean · `npx vitest run packages` 19 파일/160 passed(신규 14: state 13+react 1, 기존 EF1~3 무회귀)
- state 13: default 시드·flat/dotted 재바인딩·payload 부재 시 default 유지·중복명 교체·값편집 version 불변·remove 슬라이스+meta 삭제·부재 no-op·onChanges발 add/remove(loop-guard·no-retro-dispatch)·validateAll 동적 required 포함/제거 배제
- react 1(통합): Select 변경→onChanges가 m.addField/m.removeField — 신규 필드 DOM 출현(default값)/revert 시 소멸/**형제 필드 DOM node identity+미커밋 타이핑 값이 version bump에서 생존(무 remount 증명)**

### Deviations

1. *(§Needs Review 미등재 — 브리핑에 명시 지시된 변경이라 departure 아님)* fakeMutator no-op stub(schema-core on-changes.test.ts) — 인터페이스 확장에 따른 기계적 정합. risk: None.
2. **store가 live 구조의 단일 진실이 됨(fieldDefs)** — EntityForm 불변(스코프 제외) + 동적 필드 가시성/validate 참여 + remove 실효라는 3제약의 유일 해. 결과: **동적 mutation 이후 entityForm.getFields()/getTabs()/getFieldGroups() 직접 읽기는 stale** — 현 코드베이스에 그런 콜사이트 없음(에이전트 grep 확인, ViewEntityForm/form-store만 해당·모두 전환됨). EA/EC에서 신규 소비자가 생기면 반드시 store 경유. risk: Low(latent). → §Needs Review + Handoff Do-NOT 등재.

---

## EF5 — validate-on-change (opt-in)

**완료**: 2026-07-11 · **실행**: delegate(sonnet, wf_9e419f68-3ff, 101k tokens/64 tool calls/5.9min) · **status**: `done` (deviation 0)

**Reuse review**: Extend: form-store(validateField 그대로 재사용 + 옵션/touched/debounce 배관)·initializeFormStore(passthrough) — New: 없음(사설 file-local 함수 2개만, 미export).

### 구현

- `CreateFormStoreOptions.validateOnChange?: boolean | { debounceMs?: number }` — **기본 OFF**(부재/false = 기존 동작 무변경). initializeFormStore는 기존 storeOpts로 plain passthrough.
- createFormStore closure 내부 사설 상태: `touchedFields: Set` + `validationTimers: Map` (FormStoreState 비노출 — 공개 API 표면 무증가). `performSetValue`가 **isTopLevel(EF2 dispatchBatch-null 체크 재사용)일 때만** scheduleValidateOnChange 호출 — cascade(중첩) 쓰기는 touched 마킹·검증 스케줄 없음(구 renderer-onChange parity). trailing debounce 300ms(재입력 시 타이머 리셋), 발화 시 기존 `validateField(name)` 호출(검증 로직 미복제·통과 시 기존 경로로 에러 클리어). dispose API 신설 없음.

### 검증 (에이전트 자가보고 · 세션 게이트 별도)

- typecheck clean · state 61/61(신규 8) · react 통합 1/1(react 코드 무변경 — EF1/D4 기존 에러 슬라이스 구독으로 충분함을 확인) · packages 168 · **전체 1199 passed**(1190→1199, +9) · prettier 4파일 clean
- 행동: off 무발화·trailing 단일 발화(최신값)·valid 시 에러 클리어·cascade 형제 미발화·untouched 미검증·custom debounceMs·passthrough E2E

---

## EF-gate — phase 리뷰 게이트 1차 결과 (2026-07-11)

**실행**: 3차원 find(sonnet: correctness·intent-conformance·특성화 parity) + 발견별 adversarial verify(opus) — 8 agents/516k tokens/8.2min · diff `e3aa840..HEAD`(29파일 +2394/-125) · 무인모드 FIND-ONLY
**집계**: confirmed 3(blocking 2·non-blocking 1 → EF-R1/EF-R2) / refuted 2 / **intent-conformance 이탈 0**(5개 위임 태스크 전부 브리핑 충실 이행 — 미신고 departure 없음) / parity map → [analysis](../analysis/2026-07-11/ef-gate-parity-map.md)

| # | sev | 발견 (file:line) | 검증 | 라우팅 |
|---|-----|------|------|--------|
| 1 | **blocking** | initializeFormStore `clone()`=includeValue false → `withDefaultValue`/`withValue` 선언값 전량 소실(create 모드는 hydrate 없어 미보정). 기존 테스트 사각: store.test는 createFormStore 직접 호출이라 통과 (initialize-form-store.ts:63) | opus high — 빈 vitest 재현 | **EF-R1①** |
| 2 | **blocking** | onFetchData 훅 무격리 — throw 시 파이프 전체 reject·error 미기록·onInitialize 미실행 + initializer 훅 .catch 부재로 **무한 loading**. 구 0.3.x는 per-handler catch(591-600)+outer try 이중 보호 → 회귀 (initialize-form-store.ts:82) | opus high — 빈 vitest 재현 | **EF-R1②** |
| 3 | non-blocking | removeField/중복 addField가 validationTimers·touchedFields 미정리 → 이름 재사용 신규 필드에 stale debounce 타이머가 오검증(untouched 필드에 에러 표시) (form-store.ts:220) | opus high — 재현 성공 | **EF-R2** |

**refuted**: ① onChanges sync-throw 미격리 — 구 fire-and-forget(EntityForm.tsx:122-127)의 의도적 이식, onInitialize와 달리 격리 요구 없음(설계 확인) ② `propagation=false`(구 renderer 중간입력 cascade 억제) 대응 seam 부재 — 현 이식 필드 무영향, **EA-B 설계 인풋으로 계획서에 ⚠ 등재**(Birthday/Telephone 라이브 마스킹류).

---

## EF-R1 — 리뷰게이트 blocking 수정 (EF3 파이프)

**완료**: 2026-07-11 · **실행**: delegate(sonnet, wf_3357fff8-cdd, 62k tokens/27 tool calls/2.9min) · **status**: `done` (deviation 1 — 테스트 국소)

- ① `clone()`→`clone(true)`(구 EntityForm.tsx:163 exact parity — 공유 clone semantics 불변). create-mode withDefaultValue/withValue가 store 도달, edit-mode hydrate 우선순위 무회귀 테스트로 고정.
- ② onFetchData 루프에 onInitialize와 동일한 per-handler try/catch+continue(구 591-600 parity) + initializer 훅 `.catch`(cancelled 가드 유지, loading:false+정규화 error — fetch-error 경로와 동일 BackendError 형태 인라인).
- 회귀 테스트 4건(+state 3·react 1). 격리 후엔 어댑터 throw만으로 파이프가 reject하지 않아, 훅 `.catch` 분기 검증은 테스트 내 clone() 몽키패치로 재현(deviation — 프로덕션 무영향).
- 에이전트 자가보고: typecheck clean·packages 174/174·prettier clean.

---

## EF-R2 — stale 타이머/touched 정리 (리뷰 발견 #3)

**완료**: 2026-07-11 · **실행**: delegate(sonnet, wf_540c0829-acf, 44k tokens/2min) · **status**: `done` (deviation 0)

- removeField + addField 중복교체 분기에서 clearTimeout+validationTimers.delete+touchedFields.delete (부재 no-op 계약 보존). 회귀 테스트 1건 — **red-green 증명 수행**(수정 임시 제거 시 정확히 리뷰 증상 재현 후 복원 green).
- ⚠ 순수성 anomaly: 에이전트가 red-green 증명에 `git stash`를 사용(no-git 규칙 위반). HEAD 불변·stash 잔여 없음 확인 — 피해 없음, 이후 브리핑에 "테스트만 검증, git 절대 금지" 강조 유지.

---

## EF-gate — 최종 판정 (2026-07-11) ✅ 통과

- **리뷰 발견 3건 전부 해소**: #1·#2 → EF-R1 `5230a56`(+4 회귀 테스트), #3 → EF-R2 `1a64dbb`(+1 red-green 증명 테스트). refuted 2건은 설계 확인/EA-B 계획 등재.
- **intent-conformance 이탈 0** (5개 위임 태스크 전부 브리핑 충실).
- **특성화 오라클**: 구→신 14개 동작 parity map 확정·보존 — [analysis/2026-07-11/ef-gate-parity-map.md](../analysis/2026-07-11/ef-gate-parity-map.md). 미이식으로 확정 기록된 것: derivedValidations 빌더(필드 이식 시 확장)·withShouldReload(EF4 대체)·propagation seam(EA-B 결정).
- 최종 게이트: **1205 unit + 5 E2E green**, full gate ✓. **EA 착수 조건 충족.**

---

## Patterns Introduced / Reused (Phase EF)

- **FormMutator** (`schema-core/src/field/form-mutator.ts`) — 핸들러가 받는 유일한 mutation seam(getValue/getValues/setValue/setMeta/addField/removeField). 새 명령형 기능은 store 직접 노출 금지, 이 인터페이스 확장으로.
- **onChanges 빌더 카탈로그** (`schema-core/src/onchanges/`) — changeHidden/changeRequired/changeSelectOptions 스타일(순수 함수→OnChangesHandler, setMeta만 사용). 후속 빌더(derivedValidations 등)는 이 패턴으로.
- **batch loop-guard** (`state/src/form-store.ts` performSetValue) — top-level 판별(dispatchBatch null 체크)은 EF5 touched 게이팅도 재사용 중. 신규 "사용자 편집시에만" 기능은 이 체크 재사용.
- **build-after-hooks 파이프** (`state/src/initialize-form-store.ts`) — 재조립 금지, 호출 재사용. clone(true) 필수(선언값 보존).
- **fieldDefs live registry + structureVersion** — 동적 구조의 단일 진실은 store. 구조 소비자는 store 경유(entityForm getter는 mutation 후 stale).
- **useEntityFormInitializer** (`react/src/hooks/`) — cancellation-safe + .catch(무한 loading 금지 계약).
- **resolveFetchedValue** (form-store 내부) — dotted-path 바인딩 walker. 중복 구현 금지.

## Next Phase Handoff (→ EA-A 트리비얼 필드 12종)

- **현 상태**: Phase EF ✅(EF1~5+R1/R2+gate). 명령형 라이프사이클(META 반응성·onChanges cascade·init 파이프·동적 필드·validate-on-change) 완비, **1205 unit + 5 E2E green**, 전부 push. 필드 대량 이식 개시 조건 충족.
- **EA-A 스코프**: Checkbox·MultiSelect·Password·Month·Year·Time·Link·Tag·ColorPreset·MessageView·Profile·MappedJoin (12종, 빈도순 아님 — 트리비얼 묶음). 규칙: 1필드=1커밋+테스트(구 특성화 or 신규 렌더). 함정·값형태는 [계획 §필드 인벤토리](../plans/e-track-field-parity.md).
- **공유 터치포인트 주의(fan-out 시)**: 필드 이식은 schema-core 배럴(index.ts)·react 레지스트리(default-renderers)·기반 클래스 체인(OptionalField/MultipleOptionalField/CheckButtonValidationField/AbstractDateField 필요 시 선행 이식)이 **shared-by-construction** — fan-out하면 worktree isolation 필수 또는 공유 지점 pre-stage 후 disjoint 파일만 병렬.
- **Do-NOT**: ① 훅/빌더가 store 직접 수신 금지(FormMutator 경유, ADR-0003) ② 동적 mutation 후 entityForm.getFields()류 직접 읽기 금지(store.fieldDefs 경유) ③ 동작 검증 생략 금지(사용자 강조) ④ 형식 P3~P7 재개 금지 ⑤ ColorField dynamic Tailwind(`!bg-[${v}]`) 이식 금지→inline-style ⑥ EA-B 라이브 마스킹류(Birthday/Telephone) 착수 전 propagation seam 결정(계획서 ⚠)
- **Unacknowledged Needs Review**: 16건 open (P0/P1/P2/P3 9건 + EF2 4건 + EF3 2건 + EF4 1건) — 본문 §Needs Review.
- **세션 정책**: continue 권장(컨텍스트 연속성 — EF 패턴 참조가 EA 브리핑에 직결). 새 세션이라면 이 Handoff + 계획 §EA + parity map만 읽고 재개.



