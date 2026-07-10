# EA-A 12필드 이식 스카우트 브리핑 (구엔진 → 신엔진)

> **생성 주체**: EA-A 착수 스카우트 에이전트(sonnet, read-only, 2026-07-11) — /progress 세션이 fan-out 브리핑용으로 보존.
> **검증 상태**: 기계 생성 분석 산출물. file:line 인용은 스카우트가 실코드에서 추출 — 이식 에이전트는 **반드시 원본 파일을 직접 열어 재확인** 후 작업(인용 단독 신뢰 금지).
> **Conductor 확정 결정(이 문서의 권고와 다를 수 있음 — 이쪽이 우선)**: ① 렌더러는 트리비얼 포함 **전원 per-file**(default-renderers.tsx 인라인 금지 — fan-out 충돌 회피, many-to-one-renderer 선례) ② Profile=최소 placeholder(UserView 슬롯+텍스트 폴백, 호스트 오버라이드 전제) ③ ColorPreset=inline-style 정적 팔레트 ④ MultiSelect status-change 3종(enableImmediateChange/reason/validateStatusChange) descope ⑤ Time 'now' sentinel=렌더러측 해석 ⑥ MappedJoin=isHidden() override(true)+toSaveData 포함 테스트 ⑦ 리스트 셀 렌더는 전역 연기(list dispatch 부재) ⑧ Link CheckButtonValidation descope.

---

## PART 1 — 신엔진 구조

**schema-core field declaration** (`packages/schema-core/src/field/`):
- `basic-fields.ts:1-113` — every concrete field class extends `FormField<TValue>` (abstract base, `form-field.ts`). Constructor pattern: `super(name, order, '<type-string>')`, then set type-specific meta fields directly (no props object for simple fields; `props?: {...}` object arg only when 3+ optional knobs, e.g. `NumberField`). Builder methods are chainable `withX(): this` mutating `this` and returning it (see `SelectField.withOptions`).
- `types.ts:9-39` — `FieldType` is a flat string-literal union. **Already contains**: `'checkbox' | 'multiselect' | 'password' | 'time' | 'month' | 'tag' | 'year'` (7 of 12 pre-exist). **Missing, must be added**: `'link'`, `'colorPreset'`, `'messageView'`, `'profile'`, `'mappedJoin'` — old engine reused generic `'text'`/`'custom'`/`'hidden'` for these, which breaks the new registry's one-type-one-renderer dispatch. New dedicated type strings required.
- `form-field.ts:40-228` — full contract: getters, async predicates (`isHidden/isReadonly/isRequired` over `FieldEvalContext`), `validate()` (required-blank + declared `validations[]`), `withXxx` builders, `clone()`.
- `value.ts` — pure free functions over the store slice (`getCurrentValue`, `isBlank`, `isDirty`, `resetValue`), NOT instance methods (ADR-0002). Per-field runtime-value logic (e.g. Time `'now'` sentinel) must be renderer-side or default-time transform — instance `getCurrentValue` override 패턴은 신엔진에 없음.
- **No options-carrying base class exists yet.** `SelectField`(`basic-fields.ts:102-112`)는 options 직접 보유, 공유 부모 없음 — Checkbox/MultiSelect/Tag가 새 공유 base 필요(PART 3).
- `many-to-one-field.ts` = "field with own config file" 템플릿.

**react registry** (`packages/react/src/registry/`):
- `field-renderer-registry.tsx:17-38` — `registerFieldRenderer(type, component)`/`getFieldRenderer(type)`, module-scope Map. `FieldRendererComponentProps = { field, name, readOnly?, required?, invalid?, describedBy? }`.
- `default-renderers.tsx` — simple renderers + `registerDefaultRenderers()`(:202-216). 별도 파일 렌더러 선례: `many-to-one-renderer.tsx`, `sub-collection-renderer.tsx`(default-renderers.tsx에서 import·등록).
- Renderer hook seams: `useUI()`(host-injected, throw if unwired), `useFieldValue<T>(name)`, `useFieldMeta(name)`(EF1 override), `useFormStore().getState().setValue(name, v)`(write — never React state).
- a11y(H2, `field-a11y.test.tsx` 확인): FieldRenderer가 `required/invalid/describedBy`를 계산해 renderer에 prop으로 전달 — renderer는 UI 프리미티브의 `aria-required={required || undefined}` 형태로 forward만(`ui-default/src/primitives.tsx:44-47` 패턴).

**Barrel exports**:
- `packages/schema-core/src/index.ts:96-113` — 필드 클래스 flat export, 1줄씩 + config 인터페이스는 `export type {...}` (ManyToOneConfig 패턴 :110-113).
- `packages/react/src/index.ts:39-46` — registry 재export만; 개별 렌더러 함수는 미export 유지.

**기존 base-class 인벤토리 vs 구엔진** (`src/listgrid/components/fields/abstract/`):
| 구 abstract base | 신엔진 대응 | 판정 |
|---|---|---|
| FormField(0.3.x) | `form-field.ts` FormField | 이식됨(meta-only) |
| ListableFormField | 없음 | list 지원은 클래스별 ad hoc; ViewListGrid에 per-type 셀 dispatch 자체가 없음(`ViewListGrid.tsx:133` `String(row[name] ?? '')`) — V0.4 의도적 최소 |
| OptionalField/MultipleOptionalField(`abstract/OptionalField.tsx:55-346`) | **없음** | **pre-stage 이식**(Checkbox·MultiSelect·Tag) |
| AbstractDateField | 없음 | 12종 중 Time만 — base 이식 대신 TimeField에 inline |
| CheckButtonValidationField | 없음 | 12종 중 Link만 — descope(결정 ⑧) |

**Test idioms**:
- schema-core: `__tests__/field-core.test.ts` — hand-built EntityForm 위 describe/it, meta/getter/getCurrentValue/isBlank/isDirty 검증.
- react: `field-a11y.test.tsx`·`dynamic-fields.test.tsx` 템플릿 — EntityForm→createFormStore→`<UIProvider><AuthProvider><FormStoreProvider><ViewEntityForm/>` 래핑, `registerDefaultRenderers()` module-scope 1회, `screen.findByLabelText`/`fireEvent`/`waitFor`. **fan-out 에이전트는 자기 렌더러를 테스트 파일에서 `registerFieldRenderer` 직접 호출로 등록**(default-renderers.tsx 무접촉).

---

## PART 2 — 필드별 구엔진 사실

### Checkbox
- old: `src/listgrid/components/fields/CheckboxField.tsx:16-59` (renderer :24-37 → CheckBox limit/combo/options; list `abstract/OptionalField.tsx:394-440`)
- valueShape: `string[]` (멀티 체크그룹 — Boolean 단일과 다름) · base: **MultipleOptionalField**
- builders: withOptions·withComboType(row/column)·withLimit/withMin/withMax·useChip/withSingleFilter(chip 변형 — descope 후보)
- validate: MultipleOptionalField min/max-count(`OptionalField.tsx:281-345`)
- renderer: options 바인딩 체크박스 배열, combo=방향 · pitfalls: MultipleOptionalField 배열 처리에 전부 위임(Boolean처럼 만들지 말 것); createCacheKey(:253-260)는 신 store-driven 렌더에 불필요할 수 있음
- 신규 파일: `schema-core/src/field/checkbox-field.ts` · `react/src/registry/checkbox-renderer.tsx` · 테스트 2

### MultiSelect
- old: `src/listgrid/components/fields/MultiSelectField.tsx:37-168` (renderer :60-101 → CheckBoxChip or MultiSelectBox)
- valueShape: `string[]` · base: **MultipleOptionalField**
- builders: withOptions·withLimit·withComboType·useChip (+withImmediateChange/withReason/withValidateStatusChange — **descope 확정, 결정 ④**)
- validate: min/max-count 동일 · renderer: chip UI vs multi-select box 이중 모드 — 신 UIComponents에 두 프리미티브 없음 → **최소형**: SelectBox multiple 또는 체크박스 리스트로 (pre-stage TagsInput과 별개)
- 신규 파일: `schema-core/src/field/multi-select-field.ts` · `react/src/registry/multi-select-renderer.tsx` · 테스트 2

### Password
- old: `src/listgrid/components/fields/PasswordField.tsx:15-100` (renderer :47-62 → TextInput or PasswordStrengthView)
- valueShape: `string` · base: 없음(EmailField 동형, `basic-fields.ts:19-35`)
- builders: `withStrength` — **validations 배열 mutate**: id `'PasswordValidation'` 항목 필터아웃 후 strength.regex[]마다 `RegexValidation('passwordStrength-'+name, pattern, error)` append. 생성자는 `PasswordValidation` 자동 부착(이식됨 `validations/password-validation.ts:8-12`).
- pitfalls: id-tag 매칭이 load-bearing · PasswordStrength 실형태는 호스트 소유(구 `UIProvider.tsx:225` `= any`) — regex 배열 shape 가정만 이식
- renderer: `<input type="password">` — pre-stage에서 TextInput `type` prop 확장 후 사용
- 신규 파일: `schema-core/src/field/password-field.ts` · `react/src/registry/password-renderer.tsx` · 테스트 2

### Month
- old: `src/listgrid/components/fields/MonthField.tsx:15-94` (renderer :27-38 → TextInput type='month' min/max)
- valueShape: `string`(`YYYY-MM`) · base: 없음
- builders: `withLimit(MinMaxStringLimit)` · validate: base 후 **사전식 문자열 비교** `min > value`/`max < value`(:79-82) — YYYY-MM은 사전식=시간순. **Date 파싱으로 "고치지" 말 것**(faithful transplant).
- 신규 파일: `schema-core/src/field/month-field.ts` · `react/src/registry/month-renderer.tsx`(TextInput type='month') · 테스트 2

### Year
- old: `src/listgrid/components/fields/YearField.tsx:14-134` (renderer :31-59 → [min,max] 연도 desc SelectOption 생성→SelectBox, limit 없으면 NumberInput)
- valueShape: `string`(연도 문자열) · base: 없음
- builders: `withLimit(MinMaxLimit)` — **기본 min=1900·max=현재연도, 생성자+withLimit 양쪽에서 eager 계산**(:20-26,121-129 — 그대로 이식, lazy로 "고치지" 말 것)
- validate: base만(limit은 옵션 생성용) · renderer: 기존 SelectBox 재사용(신규 프리미티브 불요 — 최저비용)
- list: useListField가 multiFilter/IN — 미이식(list dispatch 없음)
- 신규 파일: `schema-core/src/field/year-field.ts` · `react/src/registry/year-renderer.tsx` · 테스트 2

### Time
- old: `src/listgrid/components/fields/TimeField.tsx:13-59` (renderer :36-47 → FlatPickrDateField type='time')
- valueShape: `string`(`HH:mm`) 또는 range 시 `[string,string]` · base: AbstractDateField — **inline으로 대체**(limit/range 필드 직접 보유)
- builders: `withLimit(MinMaxStringLimit)`·`withRange(boolean)`
- pitfalls: **`getCurrentValue()` override(:18-31)** — 저장값이 `'now'`면 읽기 시점 `getFormattedTime()`(HH:mm)/range면 `[now, now+12min]`(`misc/index.ts:135-147`). 신엔진은 인스턴스 override 불가 → **렌더러측 해석**(결정 ⑤): 렌더러가 `value==='now'`일 때 표시값 계산. getFormattedTime 동형 로직은 렌더러 파일 내 로컬로.
- renderer: native `<input type="time">`(FlatPickr 대체)
- 신규 파일: `schema-core/src/field/time-field.ts` · `react/src/registry/time-renderer.tsx` · 테스트 2

### Link
- old: `src/listgrid/components/fields/LinkField.tsx:18-104` (input :26-39, list :70-98)
- valueShape: `string`(URL) · base: CheckButtonValidationField — **descope(결정 ⑧)**, 신 타입 `'link'` 부여(구는 'text' 재사용)
- renderer: TextInput 재사용 · list의 stopPropagation+`window.open(normalizeUrl(value))`(:82-92)와 `normalizeUrl`(`misc/index.ts:246-252`)은 list dispatch 생길 때 이식(연기 — 결정 ⑦, 기록만)
- 신규 파일: `schema-core/src/field/link-field.ts` · `react/src/registry/link-renderer.tsx` · 테스트 2

### Tag
- old: `src/listgrid/components/fields/TagField.tsx:22-130` (renderer :45-89 → TagsInput data/filter/onValidateTag/minTags/maxTags)
- valueShape: `string[]` · base: **MultipleOptionalField**
- builders: `withTagValidation(fn: (value)=>TagValidationResult|Promise<…>)` + 상속 withOptions/withLimit
- validate: min/max-count(=태그 수) · pitfalls: tagValidation은 **입력 시점 태그별 async 검증**(렌더러 레벨 — Validation 클래스 아님, TagsInput 프리미티브에 passthrough)
- renderer: pre-stage의 TagsInput 프리미티브 사용; filter는 대소문자 무시 word-token 매칭(:52-60)
- 신규 파일: `schema-core/src/field/tag-field.ts` · `react/src/registry/tag-renderer.tsx` · 테스트 2

### ColorPreset
- old: `src/listgrid/components/fields/ColorPresetField.tsx:11-47` (renderer :69-123 ColorPresetFieldView — Popover 스와치 그리드)
- valueShape: `string`(색이름 키) · base: 없음 · 생성자 `presets?: string[]`(빌더 없음)
- pitfalls: 구 타입 'text' → 신 `'colorPreset'` · AllColorTypes/getAdditionalColorClass 등 **Tailwind 클래스 헬퍼 이식 금지** → **inline-style 정적 팔레트**(결정 ③): 렌더러 내 named-color→hex 맵 + inline background-color, presets로 부분집합 선택
- renderer: 버튼+간단 팝오버(Modal 재사용 또는 로컬 팝오버) 스와치
- 신규 파일: `schema-core/src/field/color-preset-field.ts` · `react/src/registry/color-preset-renderer.tsx` · 테스트 2

### MessageView
- old: `src/listgrid/components/fields/MessageViewField.tsx:9-38` (renderer :22-26 → `<div>{message}</div>`) — 생성자에서 readonly=true·hideLabel=true
- valueShape: 없음(display-only) · base: 없음
- **순수성 해법(확정)**: message는 `ConditionalReactNodeValue`/`OptionalReactNode` 타입(`conditional.ts:23-34`, type-only import — helpText/tooltip 선례 :44-45). 실해석(React.isValidElement)은 **pre-stage가 만든 react측 `getConditionalReactNode` 재사용**(구 Config.ts:163-197 이식본).
- 신규 파일: `schema-core/src/field/message-view-field.ts` · `react/src/registry/message-view-renderer.tsx` · 테스트 2

### Profile
- old: `src/listgrid/components/fields/ProfileField.tsx:7-29` (renderer :17-21 → `<UserView/>`) — 생성자 hideLabel=true·readonly=true
- valueShape: **호스트 소유**(UserView는 구 리포에서 headless 스텁 `UIProvider.tsx:211`) → **최소 placeholder(결정 ②)**: pre-stage의 `UIComponents.UserView` 슬롯 사용(ui-default 폴백=값 텍스트 표시), 값 타입 unknown
- 신규 파일: `schema-core/src/field/profile-field.ts` · `react/src/registry/profile-renderer.tsx` · 테스트 2

### MappedJoin
- old: `src/listgrid/components/fields/MappedJoinField.tsx:7-41` (renderer :15-25 → `<input type="hidden">`) — 생성자 `name`만(order=10·type='hidden' 하드코딩)
- valueShape: scalar(join key) · base: 없음 · builders: 없음
- pitfalls(확정 결정 ⑥): **`isHidden()` override로 항상 true**(:38-40 그대로 — 신 form-field.ts:85-87 일반 메서드라 override 가능). 신 타입 `'mappedJoin'`. FieldRenderer가 hidden이면 null 반환하므로 **hidden 필드 값이 toSaveData에 포함되는지 테스트로 고정**(store 경유 round-trip).
- 신규 파일: `schema-core/src/field/mapped-join-field.ts` · `react/src/registry/mapped-join-renderer.tsx`(raw `<input type="hidden">`) · 테스트 2

---

## PART 3 — 공유 선행물 (pre-stage EA-A0 — fan-out 전 순차 1태스크)

1. **OptionsField/MultiOptionsField base** — 구 `abstract/OptionalField.tsx:55-346` 이식(최소형: options+limit+min/max-count validate). combo/chipConfig/preservedOptions/singleFilter/changeOptions/revertOptions는 **제외**(UX 변형 노브 — 필요 시 후속). 대상: `packages/schema-core/src/field/options-field.ts`. 소비자: Checkbox·MultiSelect·Tag.
2. **MinMaxStringLimit** (`{min?: string; max?: string}`, 구 `form/Type.ts:37`) — Month·Time용. 기존 MinMaxLimit(numeric)와 병존.
3. **FieldType +5**: `'link' | 'colorPreset' | 'messageView' | 'profile' | 'mappedJoin'` (`types.ts:9-39`).
4. **react `getConditionalReactNode`** — 구 `Config.ts:163-197` 이식(`packages/react/src/util/conditional-react-node.ts`). MessageView가 첫 소비자, helpText/tooltip도 장차 사용.
5. **ui-default/UIComponents 확장**: ① TextInput에 `type?: 'text'|'password'|'month'|'time'` prop(기본 'text', 하위호환) ② `TagsInput` 슬롯+ui-default 최소 구현(토큰 입력: Enter 추가·삭제 버튼·suggestions 선택) ③ `UserView` 슬롯+ui-default 폴백(값 텍스트 표시).

**단일 소비자라 base 미이식(인라인)**: AbstractDateField(Time)·CheckButtonValidationField(Link, descope).

**명시 연기(기록)**: 리스트 셀 per-type dispatch(ViewListGrid 최소 상태) → Checkbox/MultiSelect/Tag/Link/ColorPreset의 list 렌더 전부 연기 · Link normalizeUrl+stopPropagation은 그때 이식 · MultiSelect status-change 3종은 SelectField status-change 기계 이식 시.
