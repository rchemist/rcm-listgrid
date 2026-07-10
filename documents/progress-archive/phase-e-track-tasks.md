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

