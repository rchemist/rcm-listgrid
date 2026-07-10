# EA-B 스카우트 브리핑 — Datetime/CustomOption/Birthday/TelephoneNumber/Color (+Html 판정)

> **생성 주체**: EA-B 스카우트 에이전트(sonnet, read-only, 2026-07-11). /progress 세션이 pre-stage(EA-B0)·fan-out 브리핑용으로 보존. file:line 인용은 이식 에이전트가 **원본 직접 재확인** 후 사용.
> **전제**: [ea-a-scout-briefing.md](./ea-a-scout-briefing.md) PART 1(신엔진 구조) 기지 사실 — 아래는 델타/정정만.
> **Conductor 확정 결정(권고와 다르면 이쪽 우선)**: ① `setValue(name,v,{cascade?:boolean})` 신설 — **dispatchOnChanges만 스킵**(validate-on-change 스케줄·touched·dirty는 유지 = old-parity; 구엔진은 propagation=false에도 validate 항상 실행). FormMutator에는 미노출(핸들러 억제는 loop-guard 소관). 독립 조건으로 구현(`isTopLevel` 재사용 금지 — 다른 축). ② 소비자 = Birthday·TelephoneNumber·**Color**(scout PART D의 Color 제외 판단 뒤집음 — native color input의 브라우저 의존 연속 발화 대비, 중간값 `{cascade:false}`+blur 커밋으로 구 onChangeEnd(cascade 1회) semantics 정합). ③ **Html 드롭** — `Extend: MarkdownField` 판정(구엔진 자체가 byte-identical 중복, dedup 규율). 신규 HtmlField 클래스 만들지 않음. sanitize-view는 소비 경로 부재로 연기. rich-text sentinel isDirty는 백로그(V1 defer 주석 유지). ④ **EA-B1 시스테믹 수정**: `normalizeEmptyValue`가 빈 배열 `[]`을 empty로 정규화(EA-A Checkbox/MultiSelect/Tag + CustomOption-multiple의 isDirty 오판 갭 해소, 회귀 테스트 필수). rich-text sentinel은 이번에 안 다룸. ⑤ CustomOption = **host-injected fetch fn**의 `CustomOptionProvider`(BackendAdapter 비확장) + Promise-cache(**in-flight dedup 포함** — 구엔진에 없던 개선, 기록) + evict-on-fail + 키 `alias.trim().toUpperCase()`. bulk prefetch 연기(소비처=list 전용). 죽은 `withFetchUrl`/`getFetchUrl`류 드롭. ⑥ TelephoneNumber: 저장값 항상 digits-only(렌더러 onChange가 strip 후 write)+표시는 렌더러 포맷 변환. 마운트 시 fetched 하이픈 정규화 안 함(round-trip 유지 — Needs Review 기록). ⑦ Datetime: 'today' sentinel 렌더러 해석(Time 선례)·limit validate 추가 금지(구엔진도 없음)·기존 `registerFieldRenderer('datetime', DateRenderer)` placeholder 라인 교체는 **세션이 등록 단계에서** 수행(에이전트는 disjoint 파일만).

---

## PART A — propagation seam 사실 (구엔진)

**파일**: `src/listgrid/components/form/FieldRenderer.tsx` `applyFieldChange`(:78-148), 표준 경로 `viewParams.onChange`(:257-266)가 호출. Birthday/TelephoneNumber는 표준 경로 사용 — UI prop명 `commit`이 FieldRenderer의 `propagation` 2번째 인자로 흘러감(`BirthdayField.tsx:250-252`, `TelephoneNumberField.tsx:73,90`). **commit=false ⇔ propagation=false**, blur 시 commit=true.

`isPropagation = isTrue(propagation, true)`(:88, 기본 true) 게이팅:

| 동작 | propagation=false | 근거 |
|---|---|---|
| onChanges 루프 | **스킵** | :105-118 `if (isPropagation) {...}` |
| `validate({fieldNames:[fieldName]})` | **항상 실행** | :97-101 (분기 이전) |
| dirty 재계산 | 항상 | :94-95 |
| setEntityForm 리렌더 | 항상(양 분기) | :123-132 |
| manyToOneLink·에러 clear/merge | 항상 | :120-121, :83,101 |

**결론**: propagation=false는 **오직 onChanges cascade만** 막음.

**신엔진 현황**: `setValue(name, value)` 3번째 파라미터 없음(form-store.ts:79, form-mutator.ts:27). performSetValue(:264-281): writeValue(항상, old-parity) → dispatchOnChanges(`!batch.has(name)` 게이트) → scheduleValidateOnChange(EF5 opt-in·debounce·isTopLevel만 — 이미 승인된 divergence). **cascade:false가 스킵할 것은 dispatchOnChanges 호출(:270-273) 하나뿐**. 구현: `if (cascade !== false && !batch.has(name))` — isTopLevel/dispatchBatch로 흉내내지 말 것(loop-guard와 다른 축).

## PART B — CustomOption 기계 사실 (구엔진)

`src/listgrid/components/fields/CustomOptionField.tsx`:
- **fetch**: `getCustomOptionValues(alias)`(:212-233) 모듈 free function — `GET ${getEndpoint('customOptionByAlias')}/${trimmedAlias}` → `response.data.values[]`→`{value,label}`.
- **캐시**: 모듈 스코프 `Map<string, SelectOption[]>`(:23), 키 `alias.trim().toUpperCase()`(:27). **값 캐시만, in-flight dedup 없음**(동시 요청 → 중복 네트워크 호출).
- **bulk prefetch**: `prefetchCustomOptions(aliases[])`(:239-266) — 미캐시 alias만, `?aliases=...` 벌크 GET. 소비처 리스트 렌더 전용(`useListGridLogic.ts:195`) → **연기**.
- **endpoint seam**: `RuntimeConfig.getEndpoint`(:139-141), 기본 `/option/by-alias`·`/option/by-aliases`(:80-81), `configureRuntime({endpoints})` override.
- **⚠ 죽은 코드**: `withFetchUrl`/`withBulkFetchUrl`/`getFetchUrl`/`getBulkFetchUrl`(:47-65) — 어디서도 호출 안 됨(free function이 인스턴스 접근 불가; 전 리포 grep 확인). **드롭 확정(결정 ⑤)**.
- **4-branch**(renderInstance:78-117): combo&multiple→CheckBox / combo&!multiple→RadioInput / !combo&multiple→MultiSelectBox / !combo&!multiple→SelectBox. `key={cacheKey}` 강제 리마운트.
- **필드 보유**: `alias`, `multiple?`(기본 false), 생성자 `layout='half'`, `OptionalField` 상속, 자체 `isDirty()` override(:182-209 — multiple에서 fetched/current 모두 빈배열이면 not-dirty), `useListField()` sortable=false(:171-174).
- **⚠ isDirty 배열 갭(시스테믹)**: 신 `value.ts` isDirty(:55-92)의 `normalizeEmptyValue`(:40-48)가 **배열 미정규화** → `current=[]`·`default=undefined`에서 신엔진은 dirty=true 오판(value.ts:81 도달). **EA-A 배열 필드(Checkbox/MultiSelect/Tag) 공통** — 결정 ④(EA-B1)로 해소.

**H1 `useReferenceResolver`**(packages/react/src/providers/adapter.tsx:15-91): `Map<string, Promise<unknown>>` 키 `${url}::${id}`, 진짜 in-flight dedup(테스트 검증 many-to-one-reference-cache.test.tsx:65-80), 실패 시 evict(:100-139 재시도 검증), AdapterProvider 스코프. → CustomOptionProvider는 이 패턴의 두 번째 인스턴스화(결정 ⑤).

## PART C — 필드별 포트 테이블

### Datetime
- old: `DatetimeField.tsx:1-131`(AbstractDateField 상속 — limit/range/withMin/withMax는 `AbstractDateField.tsx:13-83`) · renderer 동파일 :46-73(readonly→TextInput fDateTime, editable→FlatPickr)
- valueShape: `string`(`yyyy-MM-dd'T'HH:mm`) / range `[string,string]` · base: 불요(Time 선례로 limit/range 인라인)
- **신엔진 유의**: FieldType `'datetime'` 이미 존재 + `default-renderers.tsx:222`에 `DateRenderer` placeholder 이미 등록(주석 명시 trivial placeholder) — **세션이 등록 단계에서 교체**. DatetimeField 클래스는 신규.
- builders: withLimit(MinMaxStringLimit)/withMin/withMax/withRange. **validate override 없음 — limit은 UI 힌트 전용(구엔진 사실). Month처럼 lexicographic validate를 추가하지 말 것.**
- renderer: time-renderer.tsx 패턴 복제 — TextInput `'datetime-local'`(EA-B0 union 확장), range면 2-input, **'today' sentinel 렌더러 해석**(단일: `fDate(now, yyyy-MM-dd'T'HH:mm)` / range: `[today, tomorrow]` — 구 :27-41 재확인). 3-branch list 연기.
- 신규: `schema-core/src/field/datetime-field.ts` · `react/src/registry/datetime-renderer.tsx` · 테스트 2

### CustomOption
- old: `CustomOptionField.tsx:34-210`(OptionalField 상속) · renderer 동파일 :70-118
- valueShape: multiple=false→scalar / true→배열 · base: **EA-A0 `OptionsField`**(MultiOptionsField 아님 — min/max count validate 없음). `combo`는 EA-A0 제외 목록이었으므로 CustomOptionField 자체 프로퍼티로 재도입하되, **렌더는 2-branch로 축소**(multiple→checkbox-group[multi-select-renderer 패턴]/!multiple→SelectBox — combo/RadioInput 브랜치는 프리미티브 부재로 descope, MultiSelect 선례 동일 논리).
- builders: withOptions(상속)+ctor alias+withMultiple. 죽은 withFetchUrl류 드롭(결정 ⑤).
- pitfalls: fetch는 렌더 시점 트리거(options===undefined→fetch) — **CustomOptionProvider(EA-B0) 경유 useEffect+loading**; isDirty 배열 갭(EA-B1이 해소); layout='half' 이식.
- 신규: `schema-core/src/field/custom-option-field.ts` · `react/src/registry/custom-option-renderer.tsx` · 테스트 2-3 (provider는 EA-B0)

### Html → **드롭 (결정 ③)**
- 구엔진 `HtmlField.tsx`는 `MarkdownField.tsx`와 type('markdown')·renderInstance·isDirty 로직 **byte-identical**, 유일 차이 = view-mode sanitize 렌더(:29-44, 소비 경로 부재로 연기 대상). 신엔진 MarkdownField 이미 존재(Textarea-fallback 렌더러 등록됨) → 신규 작업 없음. rich-text sentinel isDirty('<p><br></p>')는 백로그(V1 defer — value.ts 범용 isDirty에 hook 없음, 구조 결정 필요).

### Birthday
- old: `BirthdayField.tsx:229-298`(ListableFormField, 구 type='custom' 재사용) · renderer 동파일 :33-219(BirthdayInput — 로컬 마스킹)
- valueShape: `string`(includeHyphen=false→YYYYMMDD / true→YYYY-MM-DD) · base: FormField 직속 · 신 FieldType `'birthday'`(EA-B0)
- builders: `withIncludeHyphen(boolean)` · validate: **entityForm-level 없음** — 검증은 렌더러 로컬 state(validateDate :64-131, UI-only) 그대로 재구현(store 무관, 저위험)
- renderer: raw `<input type=text inputMode=numeric maxLength>` 유지(프리미티브 불요) + 라이브 마스킹. **중간 키입력 = `setValue(v, {cascade:false})`, blur = `setValue(v)`(commit)** — 구 commit=false/true parity(EA-B0 seam 선행 필수).
- 신규: `schema-core/src/field/birthday-field.ts` · `react/src/registry/birthday-renderer.tsx` · 테스트 2

### TelephoneNumber
- old: `TelephoneNumberField.tsx:107-202`(ListableFormField, 구 type='text') · renderer 동파일 :37-105
- valueShape: `string`(store엔 digits-only) · base: FormField 직속 · 신 FieldType `'telephoneNumber'`(EA-B0 — **'phone' 재사용 금지**: PhoneNumberField가 선점, 기능 상이)
- validate: `TelephoneNumberValidation` **이미 schema-core에 존재**(validations/telephone-number-validation.ts) — 재사용, 이식 불요. ctor에서 validations 검색해 UI pattern/message 추출(:126-136)은 렌더러 재현 시 참고.
- **저장/표시 전략(결정 ⑥)**: getDisplayValue/getSaveValue 훅이 신엔진에 없음 → 렌더러 onChange가 `removePhoneNumberHyphens` 적용 후 write(store=digits-only 불변), 표시는 매 렌더 `formatPhoneNumber`. 중간입력 `{cascade:false}`+blur commit(Birthday 동일). 마운트 정규화 안 함(fetched 하이픈 round-trip — Needs Review).
- phone-util(formatPhoneNumber/removePhoneNumberHyphens, 구 utils/PhoneUtil.ts)은 **EA-B0가 schema-core/src/util/phone-util.ts로 이식**(순수 유틸).
- 신규: `schema-core/src/field/telephone-number-field.ts` · `react/src/registry/telephone-number-renderer.tsx` · 테스트 2

### Color
- old: `ColorField.tsx:9-37`(ListableFormField, 구 type='custom') · renderer 동파일 :58-101(ColorInput onChangeEnd)
- valueShape: `string`(hex) · base: FormField 직속 · 신 FieldType `'color'`(EA-B0)
- renderer: TextInput `'color'`(EA-B0 union 확장 — 구 headless도 native input 폴백이라 기능 손실 없음). **구 semantics = onChangeEnd 커밋 1회(중간 호출 없음)**. native input의 change/input 발화 빈도는 브라우저 의존 → **중간 발화는 `{cascade:false}`, blur에서 commit**(결정 ②)으로 cascade 1회 보장. jsdom 테스트로 cascade 억제 검증, 실브라우저 발화 빈도는 EC 단계 확인 노트.
- list-cell dynamic Tailwind(`!bg-[${v}]`)는 연기 경로라 자연 회피(폼 편집 경로엔 동적클래스 없음).
- 신규: `schema-core/src/field/color-field.ts` · `react/src/registry/color-renderer.tsx` · 테스트 2

## PART D — 공유 선행물 (EA-B0 스코프 확정)

1. `setValue` `{cascade?: boolean}` 옵션(PART A 구현 지침) + 테스트(cascade:false → dispatch만 스킵·validate 스케줄/touched/dirty 유지·loop-guard 무간섭)
2. FieldType +4: `'birthday' | 'telephoneNumber' | 'color' | 'customOption'` ('datetime'·'html' 기존재)
3. TextInput type union +2: `'datetime-local' | 'color'`
4. `CustomOptionProvider`(react) — host-injected `fetchOptions(alias)=>Promise<SelectOption[]>` + Promise-cache(in-flight dedup·evict-on-fail·키 정규화) — H1 useReferenceResolver 패턴 두 번째 인스턴스화(팩토리화는 선택)
5. `schema-core/src/util/phone-util.ts` — formatPhoneNumber/removePhoneNumberHyphens 이식(+테스트)
6. **EA-B1**: `normalizeEmptyValue` 빈 배열 정규화(value.ts) + EA-A 배열 필드 isDirty 회귀 테스트(Checkbox/MultiSelect/Tag: `current=[]`·default=undefined → not dirty)

단일 소비자 인라인: Datetime limit/range(AbstractDateField 재추출 안 함 — Time 선례).
