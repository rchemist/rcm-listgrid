# Migration guide

## 0.5.7 list-surface upgrade notes

- Quick search and `data-list-grid-toolbar` now share the top
  `.rcm-listgrid-searchbar > .rcm-listgrid-searchbar-inner` row. Remove 0.5.6 host flex-order,
  negative-margin, and after-table toolbar workarounds.
- Column settings is an anchored, outside-click-closing, instant-apply checkbox popover. It no
  longer uses the injected `Modal`; controlled `hiddenColumns`/`onHiddenColumnsChange` is
  unchanged and the final visible column remains guarded.
- `openInNewWindow={{enabled,getUrl,tooltip?,showFilter?,windowFeatures?}}` adds a dedicated row
  action column. `getUrl(row)` is host-owned and its button does not trigger `onRowClick`.
- A rejected list fetch renders a dismissible `data-list-error` banner; the next successful
  fetch clears it automatically.
- Header/advanced filter apply always emits `queryConditionType`. The public helper signature is
  `searchConditionFor(field, value?, rendererOperator?)`: a valid operator supplied by a filter
  renderer's `onChange(value, operator?)` has highest precedence, followed by a validated
  `withFilter({operator})`, then value/type mapping. Array-valued select/multiselect/checkbox/tag/
  customOption fields use `IN`; text/email/phone/textarea/string fields use `LIKE`; scalar select
  and other types use `EQUAL`. Backends or mocks that relied on condition-less filter items must
  verify their search schema.
- All `withList()` + `withFilter()` text-family fields (`text`/`string`/`email`/`phone`/`textarea`) feed quick search (first main, rest OR).
  Typing stays local; Enter/icon/clear run search. Two or more fields enable unified OR mode.
- The injected `Pagination` boundary remains 0-based; remove any host `+1/-1` conversion.

This document has two parts. [**§ v0.2.x → v0.3.x**](#v02x--v03x) covers the breaking changes
between the `0.2.x` and current `0.3.x` line. [**§ v0.2.0 — summary**](#v020--summary) below it
walks you from any `0.1.0-alpha.x` release to `v0.2.0`. Both expand the entries in
[`CHANGELOG.md`](../CHANGELOG.md) into before/after code samples and diagnostic messages so you
can grep for TypeScript errors and find the relevant fix directly.

---

## v0.3.x → v0.4.0 (BREAKING — 공개 API 재기초)

`0.4.0`은 `EntityForm`/`ListGrid` 공개 API의 **first-principles 재설계**다(규범: [`entityform-public-api-spec.md`](../documents/plans/entityform-public-api-spec.md), [ADR-0009](../documents/adr/ADR-0009-entityform-public-api-redesign.md)). 0.3.x의 189-멤버 `EntityForm` 체인 중 실사용 116멤버 전수(§9)가 재배치되었고, published 진입점이 구 `src/` 엔진에서 신 `packages/*`(`@listgrid/schema-core`/`react`/`state`/`ui-default`/`backend-rcm`/`next`/`excel`) 워크스페이스로 전환되며 subpath 맵 자체도 바뀌었다. 이 절은 네 부분으로 구성된다:

1. [**§9 전수 대응표**](#1-§9-전수-대응표-03-실사용-116멤버-전수) — 0.3 실사용 116멤버 전수(42개 그룹 행, 빈 행 0)의 구→신 대응.
2. [**서브패스 제거 절**](#2-서브패스-제거-절-removed-published-subpaths) — 0.4에서 삭제된 9개 published subpath와 각각의 0.4 대응.
3. [**페이지 셸 컴포지션**](#3-페이지-셸-컴포지션-호스트-소유) — `ViewEntityFormWrapper`/`ViewListGridWrapper`(§9 최대 항목)의 마이그레이션 경로.
4. [**data-transfer 미이관 목록**](#4-data-transfer-미이관-목록) — 코어 밖(charter C6)으로 남은 엑셀 관련 기능.

기계적으로 치환 가능한 행은 `scripts/codemod/`의 jscodeshift 변환으로 커버된다(아래 §1 표의 `방식=codemod` 행 — 실행: `npx jscodeshift -t node_modules/@rchemist/listgrid/scripts/codemod/v0.4.cjs --parser=tsx --extensions=ts,tsx <path-glob>`, 먼저 `-d`(dry-run)로 diff를 검토할 것을 권장). `방식=수동`/`준-기계적` 행은 값-의미 재작성이 필요해 코드모드 대상이 아니다(오변환 위험) — 아래 표의 지침을 따라 직접 고친다.

### 1. §9 전수 대응표 (0.3 실사용 116멤버 전수)

> 원본: [`entityform-public-api-spec.md` §9](../documents/plans/entityform-public-api-spec.md#9-마이그레이션-표-03-실사용-116멤버-전수--그룹-압축)(42행, 빈 행 0). 아래 표는 그 42행을 전수 전재하고, `방식=수동` 행은 spec의 1:1 지침을 실행 가능한 before→after로 확장했다. `#`열은 spec 원본 행 순서(1~42)와 1:1 대응 — 다른 행에서 교차 참조할 때 이 번호를 쓴다.

| # | 구 (사용량) | 신 | 방식 | 마이그레이션 지침 |
|---|---|---|---|---|
| 1 | `withLabel`(2946)/`withRequired`(1914·필드)/`withHidden`(1184·필드)/`withReadOnly`(749)/`withHelpText`(512)/`withDefaultValue`(315)/`withTooltip`/`withHideLabel`/`withValidations`/`withOrder`/`withValue`/`withMin`/`withMax`/`withRange`/`withLimit`/`withOptions`(필드)/`withComboType`(5) | 동일 | 무변경 | 필드 선언 빌더 20종 — 이름·시그니처 변경 없음, 코드 수정 불요. **단, 함수형 조건부 값**(예: `withHidden((props) => ...)`)의 **파라미터 타입이 바뀐다**: 구 `ConditionalValue`/`FieldInfoParameters`(EntityForm 전체를 포함)가 신 `FieldEvalContext`(`{renderType?, session?, value?, values?}` — schema-core React-free화, ADR-0003 §Decision 4)로 교체됐다. `props.entityForm.getRenderType()` → `ctx.renderType`; 형제 필드 값 읽기 `props.entityForm.getValue(name)` → `ctx.values?.[name]`; 세션 `props.entityForm.getSession()` → `ctx.session`. |
| 2 | `withHidden`(name,·gjcu 774)/`withRequired`(name,·118)/`withReadonly`(name,148)/`withOptions`(name,49)/`withHelpText`(name)/`withTooltip`(name) — EntityForm-레벨 name-키 sugar(훅 안 런타임) | onInit: `ctx.setMeta(name,{…})` · onChange: `mutator.setMeta(name,{…})` · 순수 선언: 필드 빌더 | 수동 | `hidden`/`required`/`readOnly`(L2 camelCase — 구 `withReadonly`는 소문자 o)/`options` 4종은 `FieldMetaOverride`(`packages/schema-core/src/field/field-meta.ts`) 키와 정확히 대응한다. Before(0.3.x `onInitialize` 안) `ef.withHidden('x', true)` → After(0.4 `onInit` 안) `ctx.setMeta('x', { hidden: true })`. Before(`onChanges` 안) `ef.withRequired('x', isTrue)` → After(`onChange` 안) `mutator.setMeta('x', { required: isTrue })`. **`withHelpText(name,...)`/`withTooltip(name,...)`는 `FieldMetaOverride`에 대응 키가 없다**(hidden/required/readOnly/options/validations 5종뿐) — `HelpTextType`/`TooltipType`이 이미 `ConditionalReactNodeValue`(FieldEvalContext를 받는 함수)로 선언돼 있으므로, 관용적 0.4 대응은 훅으로 매 change마다 밀어넣는 대신 **필드 선언 시 조건부 함수로 1회 선언**: Before `ef.withTooltip('x', session.role==='ADMIN'?'A':'B')`(onChanges 안) → After `field.withTooltip((ctx) => ctx.session?.role==='ADMIN'?'A':'B')`(필드 선언, 매 렌더 자동 재평가). 선언 시점 1회성 변경만 필요하면 `onInit` 안에서 구조적 변형 `ctx.form.getField('x')?.withHelpText('...')`도 가능하다 — 단 onChange(런타임) 시점의 반응형 helpText/tooltip 교체는 0.4에 대응 채널이 없다(gap — 조건부 함수로 흡수 안 되면 커스텀 필드로 개별 대응). |
| 3 | `withModifyOnly`(323)/`withAddOnly`(175)/`withViewPreset`(172)/`withViewHidden`(41)/`withListOnly`(11) | 동일(sugar 유지) | 무변경 | 뷰 프리셋 sugar — 이름/시그니처 변경 없음. |
| 4 | `useListField`(985)/`withListConfig`(199)/`useListFields` | `withList(config?)` | codemod | `scripts/codemod` 규칙 1 — `.useListField()`/`.withListConfig()`/`.useListFields()` → `.withList()`(인자 없으면 `{}`). `withList(false)`는 명시적 열외(신규 tri-state 시맨틱, spec §5.1). |
| 5 | `withExcludeListFields`(8) | 필드 조회 후 개별 `withList(false)` | 수동 | 런타임 계산 배열 → 필드별 호출이라 코드모드 불가(검증 consumer-6). Before `ef.withExcludeListFields('a','b')` → After `['a','b'].forEach((name) => ef.getField(name)?.withList(false))`. |
| 6 | `withPlaceHolder`(15) | `withPlaceholder` | codemod | `scripts/codemod` 규칙 2 — 이름만 camelCase 통일(L2), 인자/의미 불변. |
| 7 | `addFields`(891)/`addCollections`(73) | `addFields`(group 키 개명) | codemod | `scripts/codemod` 규칙 3 — `.addCollections(` → `.addFields(`로 메서드명 통일 + 객체 키 `fieldGroup:` → `group:`로 개명(`AddFieldsInput.group`). |
| 8 | `withOnInitialize`(132)/`withOnFetchData`(6) | `onInit(ctx)` | 수동 | Before `ef.withOnInitialize((ef, session) => { ef.withTitle('X'); return ef; })` → After `ef.onInit((ctx) => { ctx.form.withTitle('X'); })`(제자리 변형, "return 대체 EntityForm" 패턴 폐기; `ctx.session`이 세션). `withOnFetchData`(데이터 있을 때만 실행)는 `ctx.data` 존재로 분기: `ef.onInit((ctx) => { if (ctx.data) { /* fetch 시에만 */ } })`. 값 설정 `ef.setValue(...)` → `ctx.values.set(name, value)`; 메타 토글은 #2행 규칙과 동일 `ctx.setMeta(name, {...})`. |
| 9 | `withOnChanges`(100) | `onChange` | 수동 | Before `ef.withOnChanges((ef, changedField) => { if (changedField==='x') ef.setValue('y', v); })` → After `ef.onChange((mutator, changedField) => { if (changedField==='x') mutator.setValue('y', v); })`. renderType 분기: 구 `ef.getRenderType()` → 신 `mutator.getRenderType()`. |
| 10 | `setValue`(165)/`changeValue`/`setFetchedValue`(23)/`setFetchedValues`/`resetValue` | 훅 안: `ctx.values.set`/`setFetched` · 런타임: `mutator.setValue` | 수동(1:1 표) | `ef.setValue(name,v)`(onInitialize/onFetchData 안) → `ctx.values.set(name,v)`(onInit 안). `ef.setFetchedValue(name,v)` → `ctx.values.setFetched(name,v)`. `ef.setFetchedValues(record)` → onInit이 `ctx.data`로 이미 바인딩하므로 개별 `ctx.values.setFetched(name,v)` 반복 또는 무동작(BIND가 처리, spec §4.2). `ef.changeValue(name,v)`(onChanges 트리거) → `mutator.setValue(name,v)`(onChange 안 호출 시 store가 재귀 dispatch). `ef.resetValue(name)`(단일 필드 리셋) → **직접 대응 API 없음** — 전체 폼 리셋은 `store.getState().reset()`(`@listgrid/state`)뿐, 단일 필드만 되돌리려면 `mutator.setValue(name, <default>)`를 수동 구현(§Needs Review 후보 — 단일 필드 reset 액션 부재). |
| 11 | `getValue`(802)/`getValues`/`getCurrentValue`(32) | 훅: `mutator.getValue`/`ctx.values.get` · 컴포넌트: `useFieldValue` | 수동 | onInit 안 읽기: `ctx.values.get(name)`. onChange/액션 안 읽기: `mutator.getValue(name)`/`mutator.getValues()`. React 컴포넌트 안: `useFieldValue(name)`(`@rchemist/listgrid` 훅). |
| 12 | `withOverrideSubmitData`(11) | `onBeforeSave`(ctx.data 변형) | 수동 | Before `ef.withOverrideSubmitData((data) => ({...data, extra: 1}))` → After `ef.onBeforeSave((ctx) => { ctx.setData({...ctx.data, extra: 1}); })`(`BeforeSaveContext.data`/`setData`). |
| 13 | `withOnSave`(4) | `ViewEntityForm` `onSave` prop 또는 `addAction(replaces:'save')` | 수동 | 저장 자체를 가로채려면 `<ViewEntityForm onSave={(data) => ...} />`(validateAll 통과 후 이 콜백이 저장 트랜스포트를 대체). Save 버튼 슬롯만 커스텀하려면 `ef.addAction({ id:'save', replaces:'save', label:'저장', run: (ctx) => ctx.controller.save() })`. |
| 14 | `withPostSave`(4)/`withPostDelete`(1) | `onAfterSave`/`onAfterDelete` | 준-기계적 | 이름 변경 + 파라미터가 `(ef, savedData)` → `ctx: AfterSaveContext`(`{result, data, renderType, session, mutator}`) 객체로 바뀐다. Before `ef.withPostSave((ef, saved) => toast(saved.id))` → After `ef.onAfterSave((ctx) => toast(ctx.result))`. |
| 15 | `withOnPostFetchListData`(3) | `onAfterListFetch` | 준-기계적 | `ListGrid.onAfterListFetch((ctx) => ...)`(`AfterListFetchContext.rows`/`setRows`) — 목록 fetch 후 행 변형. |
| 16 | client-ext 8종(1파일) | `onBefore/After{Save,Delete,ListFetch}` | 수동(1파일) | `withClientPre/PostFetchList`·`withClientPre/PostCreate`·`withClientPre/PostRead`·`withClientPre/PostUpdate`·`withClientPre/PostDelete` 8종은 `onBeforeSave`/`onAfterSave`/`onBeforeDelete`/`onAfterDelete`/`onBeforeListFetch`/`onAfterListFetch` 6개 훅으로 재배선 — 0.3.x는 CRUD별 pre/post가 별도였으나 0.4는 save 하나가 create/update를 겸한다(`renderType`으로 분기). 구 `executeClientExtensions`가 실행하던 로직을 대상 훅 본문으로 직접 이식(1파일 통합 작업). |
| 17 | `withButtons`(26)/`withHeaderArea`(2) | `addAction`(선언 버튼=label/run·커스텀 컴포넌트 버튼=render·클래스=className) / `slots.header` | 수동 | Before `ef.withButtons([{label:'승인', onClick: fn}])` → After `ef.addAction({ id:'approve', label:'승인', run: (ctx) => fn(ctx) })`. 완전 커스텀 노드는 `render: (ctx) => <MyButton .../>`. visible/enabled 조건부는 `FormAction.visible`/`.enabled`(ConditionalBooleanValue)가 구 버튼가드 패턴을 대체. `withHeaderArea` → `<ViewEntityForm slots={{ header: (ctx) => <MyHeader/> }} />`. |
| 18 | `withNeverDelete`(21) | `withCapabilities({delete:false})`(+active 필드 패턴은 `/presets/rcm`) | 준-기계적 | Before `ef.withNeverDelete()` → After `ef.withCapabilities({ delete: false })`(다른 capability는 기본 허용 유지). |
| 19 | `setReadOnly`(26) | 선언 변형: `EntityForm.withReadOnly()`(M2O 전파 포함) · 페이지 조건부: `ViewEntityForm` `readOnly` prop | 준-기계적(검증 consumer-7) | 폼 전체를 고정적으로 읽기전용 선언하려면 `ef.withReadOnly()`. 페이지 단위 조건부(예: 권한에 따라)는 `<ViewEntityForm readOnly={!canEdit} />`. |
| 20 | `withShouldReload`(224) | **삭제**(store 반응성이 대체) | codemod: 호출 제거 | `scripts/codemod` 규칙 5 — `.withShouldReload(...)` 호출을 체인에서 제거만 한다. 스토어 구독 기반 반응성이 대체하므로 수동 개입 불요. |
| 21 | `withTitle`(210) | 동일(객체형은 `{text, fromField}`) | 준-기계적 | 문자열 형태는 그대로. 객체 형태였다면 `{text?, fromField?}` 키만 확인(변경 없음, 0.4에서 정규화 로직만 명확화). |
| 22 | `getRenderType`(197)/`getField`(209)/`getTabs`(3)/`getTab`/`getTabFields`(5)/`getLabel`(3)/`getId`(7) | 동일/`getField(n)?.getLabel()` | 무변경/준-기계적 | `getRenderType`/`getField`/`getTabs`/`getId`는 이름·시그니처 그대로. `getLabel`은 EntityForm 레벨 메서드가 없으므로 `entityForm.getField(name)?.getLabel()`으로 통일. **`getTab(tabId)`**(단일 조회)는 0.4에 직접 메서드가 없다 — `entityForm.getTabs().find(t => t.id === tabId)`로 대체. **`getTabFields(tabId)`**도 직접 메서드가 없다 — `entityForm.getFields().filter(f => f.getTabId() === tabId)`로 대체(필드가 `getTabId()`/`getFieldGroupId()`를 직접 보유, `addFields`가 세팅). |
| 23 | `getName`(22)/`getUrl`(≤2) | `.name`/`.url`(public readonly prop) | codemod | `scripts/codemod` 규칙 4 — `.getName()` → `.name`, `.getUrl()` → `.url`(메서드 호출 → 프로퍼티 접근). |
| 24 | `withId`(160)/`withSession`(4)/`getSession`(16) | `withId` 동일 · session은 `useEntityForm`/controller 옵션 + `ctx.session`/`mutator.getSession()` | 수동(선언에서 제거) | `withId`는 그대로. `withSession`(EntityForm에 세션을 박아두는 구 패턴)은 **제거** — 세션은 이제 `useEntityForm({ session })` 훅 옵션 또는 `createFormController({ session })`로 주입하고, 훅 안에서는 `ctx.session`(InitContext/BeforeSaveContext 등), 런타임에서는 `mutator.getSession()`으로 읽는다. |
| 25 | `getFetchedEntity`(10) | `store.fetchedData` / `ctx.data` | 준-기계적 | onInit 안: `ctx.data`. 컴포넌트/스토어 레벨: `useFormStore().fetchedData`. |
| 26 | `getFetchUrl`(3)/`isAbleFetch` | `adapter.getOne` 내부화 — 삭제 | 수동(직접 fetch는 adapter 호출) | 개별 fetch URL 조립 로직은 0.4에 없다 — `BackendAdapter.getOne(url, id)`를 DI로 주입된 adapter 인스턴스에서 직접 호출(`useAdapter()` 훅 또는 controller 내부가 이미 처리). |
| 27 | `withDataTransferConfig`(15) | `withDataTransfer({export?,import?})`(최소 표면) | 준-기계적(codemod) | `scripts/codemod` 규칙 10 — 메서드명 rename. `export`/`import` 키는 보존, 그 외 구 rich 옵션(`urls`/`mode`/`sampleData`/`maxCount`/`description`)은 최소 표면 밖이라 코드모드가 자동 제거하지 않고 `/* TODO(0.4): withDataTransfer 최소표면 — 이 키는 수동 제거 */` 주석으로 표시한다 — 수동으로 정리(아래 §4 data-transfer 미이관 목록 참조). |
| 28 | data-transfer 런타임 DI(Exporter/Importer 주입·`@rchemist/listgrid/excel`) | `@listgrid/excel`: `registerExcelDataTransfer()` 부트스트랩 + `ViewListGrid` `toolbar` seam 컴포지션(호스트) · import upload=호스트 `onSubmit` prop | 수동(호스트 배선·W6-3 선례) | 앱 루트에서 1회 `registerExcelDataTransfer()`(`@rchemist/listgrid/excel`) 호출 후, `<ViewListGrid toolbar={(ctx) => <ExportButton/><ImportButton onSubmit={...}/>} />`처럼 호스트가 툴바에 직접 배선한다(별도 prop 없음, `toolbar` seam 재사용). **미이관 기능**(officecrypto/password export·excelDownloadHistory 로깅·DataImportSample·DataImportResultView·DynamicDataImporter)은 소비자 요구 시 `/excel` 확장 — 아래 [§4](#4-data-transfer-미이관-목록) 참조. |
| 29 | `withCreatedAndUpdatedAtFields`(30)/중복 별칭 2종 | `/presets` 감사필드 헬퍼(`addFields({items: auditFields()})`) | **수동/이연**(spec 원표기: codemod — W7 결정5로 codemod 대상에서 제외) | **편차 고지**: spec §9는 이 행을 `codemod`로 표기하지만, `packages/presets-rcm/src/index.ts`가 현재 **빈 스캐폴드**(`export {}`, waves 결정7 omit-if-empty)라 대상 헬퍼(`auditFields()` 등)가 아직 존재하지 않는다 — 없는 심볼을 import하는 코드모드는 오변환이라 W7-4 codemod 스크립트에서 **의도적으로 제외**했다(waves §W7 결정5·Do-NOT). `/presets/rcm`에 감사필드 헬퍼가 추가되면(§12 Open, 비차단) 그때 codemod를 별도로 낸다. 현재는 `withCreatedAndUpdatedAtFields()`/`withStatusCreatedAndUpdatedAtField()`(중복 별칭) 호출을 수동으로 필드 3~4개(생성일시/수정일시 등) 직접 선언으로 치환. |
| 30 | `withCheckButtonValidation`(17)/`withCheckButtonLabel`(3) | `AsyncValidation(trigger:'button')` | 수동 | Before `ef.getField('email').withCheckButtonValidation(fn).withCheckButtonLabel('중복확인')` → After `field.withValidations([new AsyncValidation(fn, { trigger:'button', buttonLabel:'중복확인' })])`(`packages/schema-core/src/validations/async-validation.ts`). |
| 31 | `withAttributes`(2)/`getAttributes`(18)/`hasAttribute`(1) | `withMeta`(merge)/`getMeta` | 준-기계적 | Before `ef.withAttributes(new Map([['k','v']]))` / `ef.getAttributes().get('k')` / `ef.hasAttribute('k')` → After `ef.withMeta({k:'v'})`(shallow-merge, Map이 아닌 plain object) / `ef.getMeta().k` / `'k' in ef.getMeta()`. |
| 32 | `removeField`(13)/`removeTabs`(3)/`removeTab` | `withoutField`/`withoutTab`(구조 제거 의미론 보존) | codemod | `scripts/codemod` 규칙 6 — `.removeField(` → `.withoutField(`, `.removeTab(` → `.withoutTab(`(둘 다 단일 문자열 인자, 1:1 rename). **`.removeTabs([a,b,c])`**(구, 배열 인자)는 신 `withoutTab(tabId: string)`이 단일 id만 받으므로 배열 리터럴이면 코드모드가 `.withoutTab(a).withoutTab(b).withoutTab(c)`로 펼친다 — 배열이 리터럴이 아니면(변수 참조 등) 코드모드가 `/* TODO(0.4): removeTabs 배열 인자 — 개별 withoutTab 호출로 수동 전개 */` 주석만 남기고 원형을 보존하니 수동으로 펼쳐야 한다. |
| 33 | `withCreateStep`(1) | `withSteps` | 준-기계적 | `scripts/codemod` 규칙 8이 이름만 rename(`.withCreateStep(` → `.withSteps(`) — 단, 구는 단일 스텝 추가(append 느낌)였고 신 `withSteps(steps: StepDef[])`은 **배열 전체를 교체**하는 L1 `with*` 시맨틱이므로, 여러 번 호출해 누적하던 코드는 한 번의 `withSteps([...])` 호출로 합치는 수동 정리가 추가로 필요할 수 있다. |
| 34 | `isDirty`(14)/`isRequired`(19)/`isBlank` | `store.isDirty` / 필드 predicate(현행) | 준-기계적 | 폼 전체 dirty 여부: `useFormStore().isDirty()`(또는 `store.getState().isDirty()`). 필드별 predicate(`isRequired`/`isBlank`)는 필드 조건부 평가 로직이 이어받는다(현행 유지, `FieldEvalContext` 기반). |
| 35 | `getSaveValue`(4) | `serializeValue` override | 수동(커스텀 필드) | 커스텀 필드 클래스에서 `serializeValue(value, ctx): Record<string,unknown>`(`FormField` 기반 메서드, `packages/schema-core/src/field/form-field.ts:128`)를 오버라이드해 구 `getSaveValue`의 저장 시 값 변환 로직을 이식. |
| 36 | `withOverrideRenderListItem`(30)/`withOverrideRender`(5)/`withDisplayFunc`(10)/`useChip`(3)/`withCardIcon`/`withLineBreak`(5) | list-cell 레지스트리/`ViewListGrid` columns override/`getDisplayValue` | 수동(렌더 소관 — react 계층) | 목록 셀 커스터마이즈는 `registerListCellRenderer(type, Component)`(전역, 타입별) 또는 `<ViewListGrid columns={[...]} />`(페이지별 override)로 이관. 값 표시 문자열만 바꾸려면 필드 클래스에 `getDisplayValue(value): string`를 구현(`ViewListGrid`가 셀 렌더러 미등록 시 폴백으로 조회, `packages/react/src/components/list-columns.ts`). |
| 37 | `withLayout`(17) | 동일(필드) — `withFieldToLayout`(6)은 삭제(필드별로) | 준-기계적 | `withLayout('full'\|'half')`는 필드 레벨에서 그대로. `withFieldToLayout(layout)`(EntityForm 레벨, 전 필드 일괄 적용)은 **삭제** — `scripts/codemod` 규칙 9가 호출 자체를 체인에서 제거한다; 일괄 적용이 필요했다면 `entityForm.getFields().forEach(f => f.withLayout('half'))`로 수동 이식. |
| 38 | `withSortable`(6)/`withFilterable`(5) | `withList({sortable})`/`withFilter()` | codemod | `scripts/codemod` 규칙 7 — `.withSortable()` → `.withList({ sortable: true })`, `.withFilterable()` → `.withFilter()`. |
| 39 | SearchForm군: `withFilter`(20)/`withSort`(5)/`withPage`(16)/`withPageSize`(25)/`withFilterIgnoreDuplicate`/`quickSearch` | `SearchForm` 존치(불변 빌더) · **wire=rcm-backend-framework 0.1.0 `SearchRequest` 정합(GX-1)** | 빌더 시그니처 무변경 · **wire 정합(GX-1)** | `SearchForm` 클래스·빌더 메서드는 **이름·시그니처 불변**(`withFilter('AND'\|'OR',...items)`·`withFilterIgnoreDuplicate`는 GX-1에서 0.3.x 시그니처 그대로 복원 — `'NOT'`까지 후방호환 확장), import 경로만 `/schema`. **단 wire body(`toJSON`)는 프레임워크 `SearchRequest`에 정렬됨(GX-1)**: `FilterItem.subFilters`=연산자 키맵 `{AND?,OR?,NOT?}`(중첩 그룹)·`queryConditionType` 24종(프레임워크 enum)·`cacheKey`는 wire에서 제거. 대부분 소비자는 빌더만 쓰므로 무영향이나, 직접 `toJSON()`/`FilterItem` shape에 의존하던 코드는 조정 필요. **주의**: `SearchForm.withFilter(...)`(필터 추가)와 필드 레벨 `FormField.withFilter(config)`(#38행)는 동명·다른 클래스. |
| 40 | `ListGrid`+`withSearchForm`(37)/`getSearchForm`(1) | `createListStore({initialSearch})` | 수동 | Before `new ListGrid(ef).withSearchForm(sf)` → After `createListStore({ url, adapter, initialSearch: sf })`(`@rchemist/listgrid/state`) — `ListGrid` 클래스 자체가 사라지고 스토어 팩토리로 대체. |
| 41 | `ViewEntityFormWrapper`(249)/`ViewListGridWrapper`(138) | `ViewEntityForm`/`ViewListGrid` + 호스트 페이지 셸(W5에 페이지 컴포지션 포함) | 수동 — **MIGRATION 최대 항목, 전용 절** | §9에서 가장 큰 단일 사용량 행. 상세 마이그레이션 경로는 별도 전용 절 [§3 페이지 셸 컴포지션](#3-페이지-셸-컴포지션-호스트-소유)에 있다 — 페이지 chrome(`<main>`/헤더행/"새로 만들기" 버튼)은 호스트가 조립하고, 엔진은 `ViewEntityForm`/`ViewListGrid` 컴포넌트 한 조각만 제공한다. |
| 42 | `withMaskedValue`/`withSaveValue`/`withParentId`/`withMenuUrl`/기타 ≤2회 34종 | 필드별 대응(M2O 옵션/serializeValue/…) | 수동 — 개별 대응은 [부표](#부표-42행-기타-≤2회-34종-개별-대응) 참조 | 34개 심볼(26개 개별 + client-ext 8종[#16행 기수록])의 개별 before→after는 아래 부표로 분리 — 한 셀에 압축하면 가독성이 떨어져 별도 표로 전개했다(정보 손실 없음, 그룹 압축 아님). |

#### 부표: #42행 "기타 ≤2회 34종" 개별 대응

> 출처: [`consumer-usage-audit.md`](../documents/analysis/2026-07-11/consumer-usage-audit.md) 137행(정확한 34개 심볼 목록) + 코드 추적(`packages/schema-core/src/entity-form.ts`, `src/listgrid/config/*`). 8개는 이미 §1 표의 다른 행에 개별 등재돼 있어 "참조"로 교차 링크한다(중복 서술 방지, 빠짐 없음).

| 구 | 신 | 방식 | 지침 |
|---|---|---|---|
| `withSaveValue` | `serializeValue` override | 수동 | #35행(`getSaveValue`)과 동일 채널 — 커스텀 필드에서 `serializeValue(value, ctx)` 오버라이드. |
| `withParentId` | (구조적 흡수) | 제거 | `SubCollectionConfig.mappedBy`(자식 필드가 부모를 참조하는 키, 자동 필터/숨김)가 부모 참조를 구조적으로 처리 — `packages/*`에 `parentId` 개념 자체가 없다(grep 0). 호스트가 수동으로 `clone().withParentId(id)`를 호출하던 패턴은 통째로 불필요. |
| `withMenuUrl` | (M2O 필드가 대상 url 그대로 사용) | 제거 | `ManyToOneConfig`(`packages/schema-core/src/field/many-to-one-field.ts`)에 별도 menuUrl 슬롯이 없다 — 피커가 `entityForm().url`(대상 엔티티 자신의 url)을 그대로 쓴다. 검색 결과를 좁히려면 `filter?: () => Promise<FilterItem[]>` 옵션을 쓴다. |
| `withMaskedValue` | (0.4 미제공) | 제거/이연 | 값 마스킹 표시 헬퍼가 0.4에 없다. 커스텀 필드에서 `getDisplayValue`(#36행) 오버라이드로 직접 구현. |
| `withLimit` | 동일 | 무변경 | #1행("필드 선언 빌더 동일군")에 이미 포함 — 중복 언급. |
| `withHeaderArea` | `slots.header` | 수동 | #17행(`withButtons`/`withHeaderArea`) 참조. |
| `withCreatedAtField` | `/presets` 감사필드 헬퍼(생성일자만) | 수동/이연 | #29행과 동일 사유(`presets-rcm` 빈 스캐폴드) — 확장 후 codemod 대상 후보. |
| `withAttributes` | `withMeta` | 준-기계적 | #31행 참조. |
| `isBlank` | 필드 predicate(현행) | 준-기계적 | #34행 참조. |
| `getUrl` | `.url` | codemod | #23행 참조(`scripts/codemod` 규칙 4). |
| `getTab` | `entityForm.getTabs().find(t => t.id === tabId)` | 준-기계적 | #22행 참조 — 직접 메서드 없음, `getTabs()` 결과에서 조회. |
| `getFields` | `entityForm.getFields(): EntityField[]` | 준-기계적 | **이름은 유지**되지만 구 시그니처 `(type?: FieldType, orderByView?: boolean)`의 필터 인자가 0.4엔 없다(전체 필드 반환만) — `entityForm.getFields().filter(f => f.type === type)`로 대체. |
| `getFieldGroup` | `entityForm.getFieldGroups(tabId).find(g => g.id === fieldGroupId)` | 준-기계적 | 구 `getFieldGroup(tabId, fieldGroupId)` 단일 조회 → 신 `getFieldGroups(tabId?)`(배열 반환)에서 `.find()`로 대체. |
| `getDisplayValue` | `getDisplayValue`(필드 메서드) | 수동 | #36행 참조 — 이름 자체는 0.4 필드 클래스에도 존재(렌더 소관). |
| `getSearchForm` | `createListStore({initialSearch})` | 수동 | #40행 참조. |
| `withUrl` | (제거 — 생성자 전용 readonly) | 제거 | `EntityForm.url`은 생성자에서만 설정되는 `readonly string`(spec §3.1) — 런타임 재설정 API가 없다. url을 바꿔야 하면 새 `EntityForm` 인스턴스를 생성한다. |
| `withTabId`/`withFieldGroupId`(필드별 소속 재배치) | `addFields({tab:{id},group:{id},items:[field]})` | 수동 | 개별 필드의 tab/group 소속을 나중에 재배치하는 API가 0.4엔 없다 — 필드는 `addFields()` 호출 시점에 `tab`/`group` 입력으로 배치되고(`field.form = {tabId, fieldGroupId}`), 이후 재배치하려면 해당 필드를 다른 `addFields()` 호출로 다시 선언해야 한다. |
| `withStatusCreatedAtField` | (중복 별칭 → `withCreatedAtField`로 통합) | 제거(중복 통합) | 0.3.x 자체 주석에서 "exact duplicate of withCreatedAtField"로 확인됨 — 위 `withCreatedAtField` 행과 동일하게 처리. |
| `withSingleFilter` | (0.4 미제공) | 제거/이연 | `FieldFilterConfig`(`operator?`/`order?`/`label?`)에 단일값 전용 필터 UI variant가 없다. 커스텀 `registerFilterRenderer`로 구현 가능(수동). |
| `withPostDelete` | `onAfterDelete` | 준-기계적 | #14행 참조. |
| `withCreateStep` | `withSteps` | 준-기계적 | #33행 참조. |
| `hasAttribute` | `'k' in ef.getMeta()` | 준-기계적 | #31행 참조. |
| `getListConfig` | `getListConfig()`(필드 메서드) | **무변경** | 이름 그대로 존치(`FormField.getListConfig(): FieldListConfig \| false \| undefined`) — 반환 타입만 tri-state로 정교화(선언 안 함/명시 제외/객체). |
| `getCollection` | `entityForm.getField(name)` | 준-기계적 | `SubCollectionField`도 통합된 `fields` 배열의 일원이 됐다 — `getField(name)`으로 조회 후 필요 시 `instanceof SubCollectionField`로 타입 좁히기. |
| `withCheckDuplicate` | (0.4 미제공) | 제거 | consumer-usage-audit §5 기록상 0.3.x 구현체에서 이미 주석 처리돼 사실상 미사용(0에 가까움) — 0.4 대응 없음. 필요하면 `AsyncValidation`(#30행)으로 신규 구현. |
| client-extension 8종 | `onBefore/After{Save,Delete,ListFetch}` | 수동(1파일) | #16행 참조. |

### 2. 서브패스 제거 절 (removed published subpaths)

0.4.0은 breaking major다 — 아래 9개 0.3.x published subpath가 `package.json` `exports`에서 **제거**됐다(spec §2 subpath 표가 exhaustive normative 계약이므로 표에 없는 subpath는 삭제, by-omission authorization — waves §W7 결정2). 각 행은 "구 subpath가 무엇을 내보냈는지"와 "그 심볼이 0.4의 어디로 갔는지(또는 갔는지 여부)"를 코드 추적으로 확인한 결과다.

| 구 subpath | 0.3 내용 | 0.4 대응 |
|---|---|---|
| `./form/SearchForm`(구 `src/listgrid/form/SearchForm.ts`) | `SearchForm` 클래스(AND/OR 필터 wire-format 빌더) + `QueryConditionType`/`QueryConditionValueType`/`FilterItem`/`Direction`/`SearchValue`/`SearchValueConfig` 타입 + `getQueryConditionTypes`/`getQueryConditionValueType`/`getQueryConditionHelpText` 헬퍼 함수 | **`SearchForm` 클래스는 그대로 존치**(spec §9: "SearchForm 존치(wire format, 불변 빌더)") — `@rchemist/listgrid/schema`(`packages/schema-core/src/search/search-form.ts`, index.ts 258~266행)로 이관. `Direction`/`SortSpec`/`QueryConditionType`/`FilterItem`/`SearchFormJSON` 타입도 함께 `/schema`에서 재수출. **`getQueryConditionTypes`/`getQueryConditionValueType`/`getQueryConditionHelpText` 3개 헬퍼 함수는 `/schema` 배럴에 재수출되지 않는다** — 고급검색 연산자 UI를 직접 구현하던 소비자는 자체 구현하거나 §3의 내장 고급검색 패널(CAP-20)로 대체. |
| `./form/Type`(구 `src/listgrid/form/Type.ts`) | `SelectOption`/`MinMaxLimit`/`MinMaxStringLimit`/`EntityWithId` 타입 + `PageResult` 클래스 | `SelectOption`/`MinMaxLimit`/`MinMaxStringLimit`는 `/schema`(`packages/schema-core/src/field/basic-fields.ts`, index.ts 128행)로 이관. `PageResult`는 **클래스에서 `BackendAdapter` 계약의 `PageResult<T>` 인터페이스**(`packages/schema-core/src/backend/adapter.ts`, index.ts 269행)로 재구성 이관 — 필드명도 바뀐다(`{list,totalCount,totalPage,searchForm,errors}` → `{content,totalElements,totalPages}`, ADR-0005 dual-envelope 흡수). `EntityWithId`는 **미이관** — `BackendAdapter`의 모든 메서드가 제네릭 `T = Record<string, unknown>`을 쓰므로 그걸로 대체. |
| `./api`(구 `src/listgrid/api/`) | `ApiClient` 인터페이스(host 구현 HTTP 클라이언트 계약) + `ResponseData`/`createResponseData` + `configureApiClient`/`callExternalHttpRequest`/`getExternalApiData`/`getExternalApiDataWithError` | **아키텍처 자체가 대체** — "host가 `ApiClient` 구현 후 `configureApiClient`로 전역 등록"하던 0.3.x 패턴은 0.4의 **`BackendAdapter` 인터페이스**(`/schema`, `packages/schema-core/src/backend/adapter.ts`) + `<AdapterProvider adapter={...}>` DI(charter C7)로 완전 대체됐다. `@rchemist/listgrid/backend-rcm`의 `createRcmAdapter`가 rcm-framework 0.1.0 대상 1급 구현. `ResponseData` 래핑/`callExternalHttpRequest` 등 개별 HTTP 유틸은 **미이관**(adapter가 전송 계층을 통째로 캡슐화). **⚠ SSR 프록시 주의**: 0.3.x `serverProxy` 기반 백엔드-프록시 라우팅은 **자동 승계되지 않는다** — 프록시 route handler는 0.3에서도 host 소유였고, 0.4에서 host는 `createRcmAdapter({ baseUrl, fetch })`의 `baseUrl`(same-origin 프록시 경로) 또는 `fetch` 주입(URL 재작성)으로 재배선해야 한다(같은 노력 수준·[ADR-0005 부록 A](../documents/adr/ADR-0005-backend-adapter-contract.md#부록-a--ssr-프록시-seam-gx-4-2026-07-13) 워크드 예제). |
| `./misc`(구 `src/listgrid/misc/`) | (a) 정규식 상수 12종 (b) 날짜 포맷터(`fDate`/`fDateTime`/`fTimestamp`/`fToNow`/`formatYearMonth`/`getCurrentYear` 등) (c) 비교 유틸(`isNulls`/`isEquals`/`isEqualCollection`/`isEqualsIgnoreCase`/`isEmpty`/`isPositive`/`isNegative`) (d) URL·스토리지 유틸(`normalizeUrl`/`removeTrailingSeparator`/`stringify`/`parse`/`get·setLocalStorageItem`/`get·setSessionStorageItem`) (e) asset URL 헬퍼(`ASSET_SERVER_URL`/`configureAssetServerUrl`/`getAccessableAssetUrl`/`isExternalUrl`/`removeAssetServerPrefix`/`validatedAssetFileName`) (f) `formatPrice` (g) `RequestUtil`/`EntityError`(레거시 플레이스홀더) (h) `./api` 재수출 | **대부분 `@rchemist/listgrid/utils`로 재이관됨(GX-3, 0.4.0)** — zero-dependency·React-free 유틸 패키지. 매핑: 정규식은 4종(`RegexEmailAddress`/`RegexPhoneNumber`/`RegexTelephoneNumber`/`RegexPasswordNormal`)이 `/schema`(`util/regex.ts`)에 있고 **나머지 11종**(`RegexKoreanName`/`RegexLoginName`/`RegexAlias`/`RegexDomain` 등)은 **`/utils`**. 비교 유틸(`isNulls`[구 비대칭 시맨틱]/`isEquals`/`isEqualCollection`/`isEqualsIgnoreCase`/`isEmpty`/`isPositive`/`isNegative`)·URL/스토리지(`normalizeUrl`/`stringify`/`parse`/local·sessionStorage)·asset URL은 **재설계됨(2026-07-13)**: `/utils`는 순수 `resolveAssetUrl`(+`ASSET_SERVER_URL`/`ASSET_PREFIX`/`removeAssetServerPrefix`/`validatedAssetFileName`)만 공개하고 구 전역 세터(`configureAssetServerUrl`/`configureAssetPrefix`/`getAccessableAssetUrl`/`setAssetServerBase`)는 **제거** → react의 `AssetBaseProvider`/`useAssetUrl`(context-스코프) + `createRcmAdapter({assetBaseUrl})`로 대체([design](../documents/plans/asset-url-resolution-design.md)). `formatPrice`는 **`/utils`에서 공개**. `isExternalUrl`은 `/schema`+`/utils` 양쪽 공개. **날짜 포맷터**(`fDate`/`fDateTime`/`fTimestamp`/`fToNow`/`formatYearMonth`/`getCurrentYear`)는 **`/utils`에서 자체 구현**(0.3 date-fns 출력 바이트 동일·`fToNow`는 `Intl.RelativeTimeFormat` — **런타임 date-fns 의존 없음**). `RequestUtil`/`EntityError`는 **미이관**(0.3에서도 죽은 `any` 플레이스홀더). `./api` 재수출은 §`./api` 행(BackendAdapter) 참조. |
| `./qr`(구 `src/qr.ts`, `QrField`) | `QrField`(`qrcode.react` 기반 QR 코드 필드) | **제거 — 0.4 대응 없음.** 0.4 `FieldType` 초집합(`packages/schema-core/src/field/types.ts`)에 QR 타입이 없다(필드/렌더러 자체가 이식되지 않음). 필요하면 `type:'custom'` 필드 + `registerFieldRenderer`로 직접 구현(`qrcode.react`는 root `peerDependencies`에서도 제거됨). |
| `./address`(구 `src/address.ts`) | `AddressFieldView`/`AddressMapField`/`PostCodeSelector`/`KakaoMap`(지도 표시, react-kakao-maps-sdk)/`ApplyFullAddressFields` | **부분 이관.** 선언은 `AddressField`/`applyFullAddressFields`/`addressSiblingNames`(`/schema`, `packages/schema-core/src/field/address-field.ts`)로, 렌더는 루트 `registerDefaultRenderers()`가 자동 등록하는 기본 렌더러(`packages/react/src/registry/address-renderer.tsx`, 필드 타입 `'address'`)로 배선. `react-daum-postcode`는 주소 검색 모달을 열 때만 동적 로드되는 optional peer이므로 주소를 쓰지 않는 root consumer에는 설치가 필요 없다. AddressField 사용 호스트만 설치한다. **`KakaoMap`은 미이관** — 지도 표시가 필요하면 커스텀 필드로 구현. |
| `./api-spec`(구 `src/api-spec.ts`) | `ViewApiSpecification`/`ApiSpecificationButton`(API 명세 뷰어 위젯, sweetalert2 기반) | **제거 — 0.4 대응 없음**(`packages/*` 전체에 유사 컴포넌트 없음, grep 0). API 문서화가 필요하면 호스트가 자체 구현. |
| `./xref-price`(구 `src/xref-price.ts`) | `XrefPriceMappingField`/`XrefPiceMappingView`(가격 매핑 특화 xref 필드, sweetalert2 기반) | **제거 — 0.4 대응 없음.** 0.4 `FieldType`은 일반 xref 필드 4종(`xrefMapping`/`xrefPriorityMapping`/`xrefAvailableMapping`/`xrefPreferMapping`, `packages/schema-core/src/field/xref-mapping-field.ts` 등, plain views only — EA-D2-1)만 제공하고 가격 특화 변형은 이식되지 않았다. 필요하면 일반 xref 필드를 확장하거나 커스텀 필드로 구현. |
| `./headless`(구 `src/listgrid/ui/headless.ts`, `headlessUIComponents`) | 49종 UI 프리미티브의 **무스타일(unstyled) 기본 구현**(한 세트로 `<UIProvider components={headlessUIComponents}>` 즉시 동작) | **개념 자체가 대체.** 0.4의 "headless"는 **React 런타임/의존성이 0인 것**을 뜻한다(spec §2 headless 계약, CAP-25): `@rchemist/listgrid/schema` + `/state`만 import하면 React/UI peer 설치 없이 `EntityForm` 선언·검증·스토어 로직이 동작한다(W7-2 headless fixture로 실측 고정). UI 프리미티브 baseline이 필요하면 **`@rchemist/listgrid/ui-default`**(`defaultUIComponents`, `packages/ui-default`)를 쓴다 — 이름은 다르지만 "설치 즉시 동작하는 기본 프리미티브 세트"라는 기능적 역할은 이 subpath가 계승한다(무스타일이 아니라 최소 스타일 참조 구현). |

**0.4 published subpath 맵**(신규, 참고 — spec §2): `.`(root/react) · `/schema` · `/state` · `/ui-default` · `/backend-rcm` · `/next` · `/excel` · `/styles.css` · `/styles/{tokens,primitives,layouts,components,base}.css`. `/next`와 `/excel`은 0.3.x와 **이름은 같지만 내용이 `packages/*`로 재지정**됐다(구 `/excel`은 `src/excel.ts`, 신 `/excel`은 `@listgrid/excel` — W6 신설 런타임). `/backend-rest`·`/presets/rcm`은 대응 패키지가 현재 빈 스캐폴드(`export {}`)라 published exports에서 생략됐다(omit-if-empty, waves 결정7) — 심볼이 생기면 그때 노출.

### 3. 페이지 셸 컴포지션 (호스트 소유)

> 이 절은 [`list-page-composition-guide.md`](../documents/plans/list-page-composition-guide.md)를 **전문 흡수**한 것이다(waves §W7 결정6 — 정보 손실 없이 이 위치로 통합). §1 표의 [#41행](#1-§9-전수-대응표-03-실사용-116멤버-전수)(`ViewEntityFormWrapper`(249)/`ViewListGridWrapper`(138) → `ViewEntityForm`/`ViewListGrid` + 호스트 페이지 셸)이 이 절을 가리킨다 — §9에서 가장 큰 단일 사용량 행의 마이그레이션 경로다.

#### 3.0. 핵심 원칙 — 페이지 셸은 호스트 소유다 (컴포넌트 아님)

`@listgrid/*`는 **리스트 페이지 컴포넌트를 제공하지 않는다.** 페이지 chrome(`<main>` 레이아웃·제목 헤더·"새로 만들기" 버튼·라우팅)은 **호스트 애플리케이션이 소유**한다(헌장 C7). 엔진이 제공하는 것은 리스트 *그리드* 한 조각 — `ViewListGrid` — 뿐이며, 그것을 페이지로 조립하는 것은 호스트의 몫이다.

- **왜 컴포넌트가 아닌가**: 스펙 §7 react 표에 페이지-셸 컴포넌트가 없고, §9가 페이지 셸을 "호스트 소유·MIGRATION 전용 절"로 프레이밍한다. 구 `ViewListGridWrapper`(0.3.x)를 이식하는 것은 스펙이 명세하지 않은 표면의 발명(스펙 §10 게이트 4 위반)이다.
- **이미 동작 중**: `apps/sample`의 6개 리스트 페이지(college·subject·student·major·professor·collabo)는 이미 이 bare 컴포지션으로 동작한다. 이 가이드는 그 정준(canonical) 패턴을 성문화한 것이다.
- **결과적 자유**: 호스트는 자기 디자인 시스템·레이아웃·라우팅으로 페이지를 감싸고, 엔진 그리드는 그 안에 드롭한다. 엔진이 페이지 레이아웃을 강제하지 않는다.

#### 3.1. 프로바이더 배선 (루트에서 1회 — 호스트 주입 seam, C7)

리스트/폼 페이지가 렌더되기 전에, 호스트 주입 seam(UI 프리미티브·세션·어댑터·라우터·메시지)을 앱 루트에서 1회 배선한다. `apps/sample/app/providers.tsx` 정준 예시:

```tsx
'use client';
import {
  AdapterProvider, AuthProvider, UIProvider,
  configureMessages, registerDefaultRenderers,
} from '@listgrid/react';
import { NextRouterProvider } from '@listgrid/next';
import { defaultUIComponents } from '@listgrid/ui-default';
import { rcmAdapter } from '../lib/adapter';

registerDefaultRenderers();                 // 빌트인 필드 렌더러 등록 (모듈-로드 사이드이펙트·멱등)
configureMessages({ showConfirm, showToast, showError });  // 삭제 확인 등 메시지 채널

export function Providers({ children }) {
  return (
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={{ roles: ['ADMIN'] }}>
        <AdapterProvider adapter={rcmAdapter}>
          <NextRouterProvider>{children}</NextRouterProvider>
        </AdapterProvider>
      </AuthProvider>
    </UIProvider>
  );
}
```

- **`ListGridProvider` 편의형(스펙 §7)**: 위 6종 개별 프로바이더 나열이 부담이면 `ListGridProvider({ui, adapter, session, router, messages, customOptions})` 원샷 편의형이 동일 배선을 한 번에 감싼다. 개별 프로바이더도 존치한다(둘 다 유효).
- **커스텀 필터/셀 렌더러**: 커스텀 필드 타입을 쓰면 이 루트 모듈에서 `registerFilterRenderer(type, comp)`(고급검색 입력)·`registerListCellRenderer(type, comp)`(리스트 셀)도 함께 등록한다(§3.3 참조).

#### 3.2. 정준 리스트 페이지 컴포지션

`apps/sample/app/college/page.tsx` — 가장 단순한 완결 예시(컬럼은 `withList` 파생, 고급검색은 `withFilter` 파생):

```tsx
'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createListStore } from '@listgrid/state';
import { ViewListGrid } from '@listgrid/react';
import { CollegeEntityForm, collegeFetchUrl } from '../../lib/entities/college';
import { rcmAdapter } from '../../lib/adapter';

export default function CollegeListPage() {
  const router = useRouter();
  // 헌장 C1: 같은 EntityForm 선언이 리스트와 폼 페이지를 함께 구동한다.
  const entityForm = useMemo(() => CollegeEntityForm(), []);
  const store = useMemo(
    () => createListStore({ url: collegeFetchUrl, adapter: rcmAdapter }), [],
  );

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* 헤더 행: 제목 + "새로 만들기" — 호스트 소유 chrome */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>단과대학</h1>
        <button type="button" onClick={() => router.push('/college/new')}>새로 만들기</button>
      </div>
      <ViewListGrid
        entityForm={entityForm}
        store={store}
        onRowClick={(row) => router.push(`/college/${String(row.id)}`)}
      />
    </main>
  );
}
```

**해부**:

| 조각 | 소유 | 근거 |
|---|---|---|
| `useMemo(() => EntityForm(), [])` | 호스트 | 안정된 EntityForm 인스턴스 — 리스트/폼 공용 선언(C1) |
| `useMemo(() => createListStore({url, adapter}), [])` | 호스트 | 리스트 스토어(SearchForm+페이지 결과·C9). 마운트 시 fetch |
| `<main>` + maxWidth/padding | 호스트 | 페이지 chrome — 엔진 무관(C7) |
| 제목 `<h1>` + "새로 만들기" `<button>` | 호스트 | 헤더 행·생성 네비게이션은 페이지 몫(ViewListGrid에 "New" 없음) |
| `<ViewListGrid entityForm store onRowClick>` | **엔진** | 리스트 그리드 한 조각 |
| 컬럼 | **엔진 파생** | 필드 `withList()` 선언에서 파생(CAP-19). `columns` prop 미지정 시 |
| 고급검색 패널 | **엔진 파생** | 필드 `withFilter()` 선언이 있으면 자동 노출(CAP-20). 선언 0건이면 패널·토글 미렌더 |

#### 3.3. ViewListGrid 표면 요약 (컴포지션 관점)

`<ViewListGrid {entityForm, store, onRowClick?, selection?, toolbar?, columns?, showRowNumbers?, columnSettings?, hiddenColumns?, onHiddenColumnsChange?, openInNewWindow?}>`(스펙 §7):

- **컬럼(CAP-19)**: 기본은 필드 `withList({order?, label?, align?, width?, sortable?})` 선언에서 파생된다. **마법 폴백 없음** — `withList` 선언이 0건이면 빈 컬럼 + dev 경고(구 "첫 ~4개 비숨김 필드 자동채택" 폐기).
- **`columns` escape hatch**: `columns={['name','type','majorCode']}`처럼 명시하면 파생을 건너뛰고 그 순서/필드로 렌더한다(`apps/sample/app/major/page.tsx` 예시). 파생 오버라이드가 필요한 페이지에서만.
- **정렬**: `sortable: true`인 컬럼 헤더 클릭 → `store.setSort` → refetch(`aria-sort` 반영).
- **셀 렌더링**: `getListCellRenderer(field.type)` 조회 → 없으면 `field.getDisplayValue` → `String`. 커스텀 셀은 루트에서 `registerListCellRenderer(type, comp)`.
- **고급검색(CAP-20)**: 필드 `withFilter({operator?, order?, label?})` 선언이 하나라도 있으면 그리드가 "고급검색" 토글 + 패널을 **내장**해 자동 노출한다(별도 컴포넌트 조립 불요). 입력은 `getFilterRenderer(field.type)` 조회 → 없으면 기본 텍스트 입력(useUI). "검색"은 비어있지 않은 값을 AND로 적용하고 draft를 비운 필드의 기존 AND 절을 제거한다. 오퍼레이터 우선순위는 renderer의 `onChange(value, operator?)` → 유효한 `withFilter({operator})` → 값/타입 매핑(text/email/phone/textarea/string `LIKE`, 그 외 `EQUAL`)이다. filterable text list field가 2개 이상이면 통합검색 OR 모드도 노출된다.
  - **커스텀 필터 입력**: `registerFilterRenderer(type, comp)`(props `{field, value, onChange(value, operator?)}`)를 루트에서 등록하면 해당 타입 필터가 그 입력으로 렌더된다.
  - **주의(발명 금지, waves 결정 2)**: 구 엔진의 ManyToOne 합성 필터 자동주입(`<field>.name` 등)은 이식되지 않았다. 관계 필드를 고급검색에 노출하려면 소비자가 명시적으로 `withFilter`를 선언한다.

#### 3.4. 컴포지션 변형 레시피

- **명시 컬럼**: `columns` prop(§3.3). 파생 대신 고정 컬럼 세트가 필요할 때.
- **행 네비게이션**: `onRowClick={(row) => router.push(...)}`. 라우팅은 호스트 라우터(예: `NextRouterProvider`) 몫.
- **툴바/선택**: `toolbar`·`selection` prop(체크박스 선택 등). toolbar 출력은 표 뒤가 아닌 상단 searchbar actions에 렌더된다. 기본 selection 확인 버튼은 선택된 행이 있을 때만 렌더된다. 호스트가 자체 action을 렌더하면 `selection.showConfirm: false`로 기본 버튼을 끄고, `selection.onCheckedChange(checkedIds)`로 행/전체 선택과 rows 변경 초기화(`[]`)를 관찰한다. data-transfer(엑셀 등)가 툴바 opt-in을 확장한다(§4 참조).
- **폼 페이지**: 같은 `EntityForm()` 선언을 `/new`·`/[id]` 페이지에서 `useEntityForm`+`ViewEntityForm`으로 조립(C1 — 리스트와 폼이 한 선언 공유). 이 절 범위 밖(폼 컴포지션은 별도).

#### 3.5. list-track(W5) 커버리지 대조 — CAP-18/19/20

이 절이 문서화하는 소비자 표면이 소화하는 capability:

| CAP | 착지 | 소비자 접점(이 절) |
|---|---|---|
| CAP-18 | `withList`/`withFilter` 필드 선언 substrate (W5-1) | §3.2 필드 선언이 리스트/필터 참여를 opt-in |
| CAP-19 | ViewListGrid 컬럼 파생 + `registerListCellRenderer` (W5-2) | §3.3 컬럼 파생·`columns` escape·커스텀 셀 |
| CAP-20 | 고급검색 패널(내장) + `registerFilterRenderer` (W5-3) | §3.3 고급검색 패널·커스텀 필터 입력 |

#### 3.6. 알려진 한계 (§Needs Review 연동)

- **고급검색 재적용/clear**: 0.5.7은 같은 이름의 AND 절을 교체하고, draft를 비운 필드의 기존 절을 제거한다. 페이지 리로드/스토어 재생성 우회는 더 이상 필요하지 않다.

### 4. data-transfer 미이관 목록

W6(§9 [#28행](#1-§9-전수-대응표-03-실사용-116멤버-전수))가 `/excel` 코어(export=클라 xlsx 생성, import=파싱→POST)를 이식하면서, charter **C6**(export/import는 코어 밖) 판단에 따라 아래 5개 기능은 **의도적으로 미이관**됐다(waves §W6 결정7, spec §9 line 359, spec line 142):

| 기능 | 0.3.x 위치 | 미이관 사유 |
|---|---|---|
| 비밀번호 export(officecrypto 암호화) | `src/listgrid/transfer/` | officecrypto 의존성 자체가 코어 밖(C6) — xlsx 생성 코어에 암호화는 부가 기능 |
| `excelDownloadHistory` 로깅 | `src/listgrid/transfer/` | 다운로드 이력 로깅은 호스트 감사(audit) 관심사, 엔진 코어 밖 |
| `DataImportSample`(264 LOC) 템플릿 다운로드 | `src/listgrid/transfer/` | 샘플 템플릿 생성 UI는 코어 import/export 왕복과 별개 |
| `DataImportResultView`(232 LOC) | `src/listgrid/transfer/` | import 결과 리포트 뷰 — 코어는 파싱→POST까지만 책임 |
| `DynamicDataImporter`(32 LOC) | `src/listgrid/transfer/` | 동적 임포터 변형 — 코어 경로 밖 |

**이 목록은 회귀가 아니다** — 소비자가 요구하면 `/excel`을 확장해 개별 기능을 다시 붙일 수 있다("소비자 요구 시 `/excel` 확장", spec §9 line 359). 코어가 책임지는 것은 export(필드→xlsx blob 다운로드)와 import(xlsx→행 파싱→POST) 왕복뿐이며, 위 5개는 그 위에 얹히는 부가 기능이라 최소 표면(§9 [#27행](#1-§9-전수-대응표-03-실사용-116멤버-전수) `withDataTransferConfig`→`withDataTransfer` 최소화와 같은 원칙)에서 제외됐다.

**부가로, 스타일 소스 미이관(waves §W7 결정8)**: `packages/*` 하위에는 CSS가 없다(cold-reader 확인 0건) — published `./styles.css`+5개 style subpath의 소스는 여전히 구 `src/listgrid/styles/*.css`다(디자인시스템 계층은 본 스펙 §2 범위 밖, `docs/PRIMITIVES.md` 소관). `packages/*`로의 스타일 재배치는 비크리티컬 후속 트랙(§12 Open)이며 v0.4.0 시점의 회귀는 아니다.

---

## v0.2.x → v0.3.x

Covers `0.3.1`, `0.3.21`, and `0.3.22` — the three releases in the `0.3.x` line with
consumer-visible breaking changes or required cleanup. If you are upgrading straight from
`0.1.0-alpha.x`, read [§ v0.2.0 — summary](#v020--summary) first, then apply this section.

### 0.3.1 — rcm-backend-framework 0.1.0 endpoint alignment (BREAKING)

**What changed.** The `0.3.x` line targets `rcm-backend-framework` **v0.1.0 GA**'s endpoint
matrix instead of the older `0.0.5` line. Upgrading the package without upgrading the backend (or
vice versa) breaks list/search/create/bulk-delete calls.

| Area | 0.2.x (0.0.5 backend) | 0.3.x (0.1.0 backend) |
|---|---|---|
| Search / list | `POST {url}` (`SearchForm` body) | `POST {url}/search` (`SearchRequest` body) |
| Create | `POST {url}/add` (`Form` body) | `POST {url}` (`CreateForm` body) |
| Bulk delete | `POST {url}/delete` (body `{ ids, revisionEntityName? }`) | `DELETE {url}` + body `BulkDeleteRequest{ids, revisionEntityName?}` |
| Schema | `POST {url}/_search/schema` | `GET {url}/search/schema` |

**Response payload aliases** — the `0.3.x` line accepts both the 0.0.5-line and 0.1.0-line list
response shapes (dual absorption; no host code change required for this part):

| Field | 0.0.5 line | 0.1.0 line |
|---|---|---|
| Result list | `data.list` | `data.content` |
| Total count | `data.totalCount` | `data.totalElements` |
| Echoed search form | `data.searchForm` | `data.searchRequest` |

**Fix.** Upgrade your backend to `rcm-backend-framework 0.1.0` GA alongside the package bump, or
stay on `@rchemist/listgrid@^0.2.x` if you can't upgrade the backend yet:

```ts
// 0.2.x — backend is still the 0.0.5 line
"@rchemist/listgrid": "^0.2.15"

// 0.3.x — backend is rcm-backend-framework 0.1.0 GA
"@rchemist/listgrid": "^0.3.1"
```

No `EntityForm` / `ListGrid` / `ViewListGridWrapper` usage code changes are required — the
alignment is internal to `src/listgrid/form/Type.ts` and `src/listgrid/config/EntityForm.tsx`.
Source: `CHANGELOG.md` `[0.3.1]`.

### 0.3.21 — peer reclassification + subpath moves (BREAKING)

**What changed.** Peers the main barrel always needs were reclassified from optional to
**required** (a build that omits them now fails honestly, instead of succeeding and breaking at
runtime), and leaf components that only some hosts use were moved out of the main barrel into
**opt-in subpaths**.

**Newly required peers** — install these if you don't already have them:

```bash
npm install @iconify/react react-select react-sortablejs sortablejs date-fns
```

**Components relocated from the main barrel to a subpath:**

| Before (main barrel) | After (subpath) | Peer required |
|---|---|---|
| `QrField` | `@rchemist/listgrid/qr` | `qrcode.react@^3` (v4 no longer supported — the default export it relies on was removed) |
| `AddressFieldView`, `AddressMapField`, `KakaoMap`, `PostCodeSelector`, `ApplyFullAddressFields` | `@rchemist/listgrid/address` | `react-kakao-maps-sdk`, `react-daum-postcode` |
| `ViewApiSpecification`, `ApiSpecificationButton` | `@rchemist/listgrid/api-spec` | `sweetalert2`, `sweetalert2-react-content` |
| `XrefPriceMappingField` | `@rchemist/listgrid/xref-price` | `sweetalert2`, `sweetalert2-react-content` |
| Excel export/import (`DataExporter`, `DataImporter`, …) | `@rchemist/listgrid/excel` + `registerExcelDataTransfer()` | `xlsx-js-style`, `file-saver` |

**Before:**

```ts
import { QrField, AddressMapField, ViewApiSpecification } from '@rchemist/listgrid';
```

**After:**

```ts
import { QrField } from '@rchemist/listgrid/qr';
import { AddressMapField } from '@rchemist/listgrid/address';
import { ViewApiSpecification } from '@rchemist/listgrid/api-spec';
```

**Excel export/import is now injected, not bundled.** Register it once at bootstrap:

```ts
import { registerExcelDataTransfer } from '@rchemist/listgrid/excel';
registerExcelDataTransfer(); // requires xlsx-js-style + file-saver installed
```

Without this call the list header's export/import modal simply doesn't render — no crash, no
console error, just a missing button. Skip it if you don't use Excel export/import.

**Fix checklist.**

- [ ] Install the five newly-required peers above.
- [ ] Grep your codebase for the relocated component names imported from the main barrel; switch
      each to its matching subpath.
- [ ] If you use list export/import, call `registerExcelDataTransfer()` at bootstrap.
- [ ] Pin `qrcode.react` to `^3` if you were on `^4`.

Source: `CHANGELOG.md` `[0.3.21]`, [`documents/issues/7/fix-plan.md`](../documents/issues/7/fix-plan.md).

### 0.3.22 — single-entity GET envelope depth (breaks GET double-wrap workarounds)

**What changed.** `EntityForm.initialize()`'s single-entity `GET` now unwraps the response at
**1-depth** (`response.data` = the entity), matching the depth `save` / `list` / `delete` already
used. It previously read `response.data.data` (2-depth) — a legacy asymmetry that happened to
work against the old `0.0.5`-line backend (which double-wrapped GET responses) but crashes
against `rcm-backend-framework 0.1.0`'s bare-entity `GET` (`TypeError: Cannot read properties of
undefined (reading 'manageEntityForm')`).

**Fix.** If your `ApiClient` adapter's `getExternalApiData` / `getExternalApiDataWithError`
double-wraps the GET response to compensate for the old 2-depth read, **remove that workaround**:

```ts
// ❌ before — compensating for the old 2-depth read
getExternalApiData: async (url) => {
  const res = await fetch(url);
  const entity = await res.json();
  return new ResponseData({ data: { data: entity } }); // double-wrap workaround
},

// ✅ after — standard 1-depth envelope (same shape save/list/delete already use)
getExternalApiData: async (url) => {
  const res = await fetch(url);
  const entity = await res.json();
  return new ResponseData({ data: entity });
},
```

If you keep the double-wrap after upgrading, `response.data` becomes `{ data: entity }` and the
edit/detail form renders with empty values instead of the fetched entity. Standard adapters
(single-depth `{ data: json }`, as documented in the `ApiClient` contract) need no change.

Source: [`documents/issues/9/fix-plan.md`](../documents/issues/9/fix-plan.md) ("컨슈머 적용 안내" section).

---

## v0.2.0 — summary

`v0.2.0` is the first **public minor** after the alpha line. It folds two things into one version bump:

1. **Six small breaking changes** on the public API (legacy `any` cleanup and deprecated slot removal).
2. **Two non-breaking generics** landed in interim alpha releases (alpha.48 / alpha.49) — opt-in type narrowing you can adopt incrementally.

In practice, migration is cheap: the type-check went from the last alpha → v0.2.0 with **zero source changes**. TypeScript 5.x is lenient enough about `unknown === 'literal'` comparisons that most `Map<string, any>` → `Map<string, unknown>` call sites compile unchanged.

Expect to touch code in three cases only:

- You were reading `.getAttributes.get(key).someProperty` — i.e. dereferencing a property off the attributes value. Add a cast.
- You were passing `headerButtons` to `ViewListGridClassNames`, or `InlineSubCollectionField.withRowActions(...)`, or using the five deprecated theme slots, or `AlertStyles.bg` / `hoverBg` / `text`, or importing `getColorIndicator`. Rename or swap.
- You want to opt into the new generics (`EntityForm<User>`, `FieldRenderParameters<Post, string>`, `parse<T>`). Non-breaking — your existing code compiles without change.

---

## 1. Upgrade the package

```bash
npm install @rchemist/listgrid@^0.2.0
```

Then refresh TypeScript:

```bash
npm run type-check
```

---

## 2. Breaking changes

### A-1. `attributes: Map<string, any>` → `Map<string, unknown>`

**What broke.** Every attributes-adjacent API now carries `unknown` values instead of `any`:

- `EntityField.attributes`
- `FormField.attributes` (and `FormFieldProps.attributes`)
- `EntityForm.getAttributes()` return value
- `EntityForm.putAttribute(key, value)` / `.addAttributeToField(name, key, value)` / `.getFieldAttributes(name)`
- `ConditionalProps.attributes` in `config/Config.ts`

Reading a property directly off an attributes value no longer type-checks:

```
error TS2339: Property 'toUpperCase' does not exist on type 'unknown'.
```

**Why.** The value bag is genuinely heterogenous — strings, numbers, booleans, objects, arrays. `any` silently suppressed errors for the caller; `unknown` forces the call site to declare what it expects. TypeScript 5.x still lets `raw === 'literal'` comparisons compile without narrowing, so most callers need no change.

**Fix.** Cast once when you read, or narrow with `typeof` / `instanceof`.

```ts
// ❌ before
const mode = entityForm.getAttributes().get('collaboMode');
if (mode.startsWith('custom')) { /* ... */ }

// ✅ after — cast
const mode = entityForm.getAttributes().get('collaboMode') as string | undefined;
if (mode?.startsWith('custom')) { /* ... */ }

// ✅ after — narrow (stricter)
const raw = entityForm.getAttributes().get('collaboMode');
const mode = typeof raw === 'string' ? raw : undefined;
```

Literal comparisons already work untouched:

```ts
const mode = entityForm.getAttributes().get('collaboMode');
if (mode === 'custom') { /* still compiles — TS 5.x allows unknown === literal */ }
```

---

### A-2. `ViewListGridTheme.headerButtons` slot removed

**What broke.** The `headerButtons` slot (and its 11 sub-slots: `wrapper`, `default`, `primary`, `outline`, `danger`, `icon`, `delete`, `refresh`, `download`, `upload`, `create`) is gone from `ViewListGridClassNames`:

```
error TS2353: Object literal may only specify known properties, and 'headerButtons' does not exist in type 'ViewListGridClassNames'.
```

**Why.** The actual `HeaderActionButtons` JSX has been emitting `rcm-button` + `data-variant` / `data-color` primitive markup for several alphas — the slot was already a no-op. The v0.2.0 cleanup just deletes the dead surface.

**Fix.** Drop the field from the theme object, and restyle via CSS targeting the primitive:

```diff
 const theme: ViewListGridClassNames = {
 table: { container: 'my-table' },
- headerButtons: {
- primary: 'my-primary-btn',
- outline: 'my-outline-btn',
- },
 };
```

```css
/* in your own stylesheet, loaded after @rchemist/listgrid/styles.css */
.rcm-button[data-variant="primary"] { /* ... */ }
.rcm-button[data-variant="outline"] { /* ... */ }
```

---

### A-3. `InlineSubCollectionField.rowActions*` removed

**What broke.** The deprecated row-actions API is gone:

- `InlineRowActionsConfig` interface
- `InlineSubCollectionField.inlineRowActions` / `inlineRowActionsConfig` fields
- `InlineSubCollectionField.withRowActions` / `.withRowActionsConfig` methods
- Constructor arguments `props.rowActions` / `props.rowActionsConfig`
- The `rowActions` → `rowActionColumns` runtime conversion
- `InlineSubCollectionViewProps.rowActions` / `.rowActionsConfig`

```
error TS2339: Property 'withRowActions' does not exist on type 'InlineSubCollectionField'.
```

**Why.** Row actions got promoted to a first-class column abstraction (`InlineRowActionColumn`) some time ago. The old single-bag shape was kept around only to avoid churn; v0.2.0 is the scheduled removal.

**Fix.** Replace the chained `withRowActions(...).withRowActionsConfig(...)` with a single `.withRowActionColumns(...)`:

```diff
 field
- .withRowActions(actionEdit, actionDelete)
- .withRowActionsConfig({ order: 1 });
+ .withRowActionColumns(
+ new InlineRowActionColumn({
+ id: 'default',
+ order: 1,
+ actions: [actionEdit, actionDelete],
+ }),
+ );
```

Multiple columns? Pass multiple `InlineRowActionColumn` instances. Each column can have its own `id`, `order`, and `actions[]`.

---

### B-4. `ViewEntityFormTheme` deprecated slots removed

**What broke.** Five slot names have been replaced by their new counterparts (the old names were `@deprecated` since early alphas):

| Old slot | New slot |
|---|---|
| `ViewEntityFormTabPanelStyles.container` | `panel` |
| `ViewEntityFormTabPanelStyles.emptyMessage` | `empty` |
| `ViewFieldGroupStyles.headerWrapper` | `header` |
| `ViewFieldGroupStyles.icons` | `actions` |
| `ViewFieldGroupStyles.collapseIcon` | `collapseToggle` |

```
error TS2353: Object literal may only specify known properties, and 'headerWrapper' does not exist in type 'ViewFieldGroupStyles'.
```

**Why.** The new slot names mirror the rendered DOM structure more accurately. The internal JSX has been emitting the new names for many alphas — only external theme objects are affected.

**Fix.** Rename in your theme object:

```diff
 const theme: ViewEntityFormClassNames = {
 tabPanel: {
- container: 'my-panel',
- emptyMessage: 'my-empty',
+ panel: 'my-panel',
+ empty: 'my-empty',
 },
 fieldGroup: {
- headerWrapper: 'my-group-header',
- icons: 'my-group-actions',
- collapseIcon: 'my-collapse-toggle',
+ header: 'my-group-header',
+ actions: 'my-group-actions',
+ collapseToggle: 'my-collapse-toggle',
 },
 };
```

---

### B-5. `AlertStyles.bg` / `hoverBg` / `text` removed

**What broke.** Three legacy fields are gone from the `AlertStyles` interface:

- `bg` — was returning the literal string `'rcm-notice'`
- `hoverBg` — unused since CSS primitive transition
- `text` — unused since CSS primitive transition

```
error TS2339: Property 'bg' does not exist on type 'AlertStyles'.
```

**Why.** The primitive/data-attr pattern (`className='rcm-notice'` + `data-tone='...'`) has replaced the color-class approach. `AlertStyles` now returns just `{ className, dataTone }`.

**Fix.** Read the new shape:

```diff
 const style = getAlertStyles(color);
- <div className={style.bg}>
+ <div className={style.className} data-tone={style.dataTone}>
 {message}
 </div>
```

---

### B-6. `useAlertManager.getColorIndicator` removed

**What broke.** The function is no longer exported:

```
error TS2305: Module '"@rchemist/listgrid"' has no exported member 'getColorIndicator'.
```

**Why.** `getColorIndicator` was a class-name mapping that predated the `data-tone` primitive. `getIndicatorTone` + a static `rcm-alerts-indicator` class now covers the same case without style drift.

**Fix.** Use `getIndicatorTone` + a static class:

```diff
- import { getColorIndicator, getIndicatorTone } from '@rchemist/listgrid';
+ import { getIndicatorTone } from '@rchemist/listgrid';

 <div
- className={`rcm-alerts-indicator ${getColorIndicator(color)}`}
- data-tone={getIndicatorTone(color)}
+ className="rcm-alerts-indicator"
+ data-tone={getIndicatorTone(color)}
 />
```

---

## 3. Optional improvements (non-breaking)

None of the following require action. They are new opt-in type narrowing released in alpha.48 and alpha.49, now part of `v0.2.0`. Adopt incrementally where it pays off.

### `EntityForm<T>` key narrowing

Pass your entity type to `EntityForm` and `getValue` / `setValue` / `changeValue` narrow on keys:

```ts
interface User {
 id: string;
 name: string;
 email: string;
 age: number;
}

const userForm = new EntityForm<User>('user', '/api/users');

const name = await userForm.getValue('name'); // Promise<string | undefined>
const bad = await userForm.getValue('nope'); // ❌ TS error: not a key of User
```

Default is `any` (`new EntityForm('user', '/api/users')`) so existing call sites compile unchanged. Rollout strategy: pick one entity, type it, see how it flows through handlers.

### `FormField<TSelf, TValue, TForm>`

The F-bounded self type stays in slot 1; new parameters `TValue` (the field's value type) and `TForm` (the containing entity) snap into slot 2 and 3. All 33+ concrete field classes (`StringField`, `NumberField`, …) compile unchanged because the defaults are `= any, = any`.

Adopt in a custom field:

```ts
class SlugField extends FormField<SlugField, string, Post> {
 // ↑ TSelf ↑ TValue ↑ TForm
 // renderInstance's `params.onChange` is now `(value: string) => void`
 // `params.entityForm` is `EntityForm<Post>`
}
```

### `FieldRenderParameters<T, TValue>`

`renderInstance`, `renderListFilter`, `validate`, etc. now accept a typed `params` object:

```ts
protected renderInstance(
 params: FieldRenderParameters<Post, string>,
): Promise<React.ReactNode | null> {
 params.onChange('new-slug'); // ✅ string required
 const author = await params.entityForm.getValue('author'); // ✅ narrows to Post['author']
 return /* ... */;
}
```

### `parse<T>(json)`

`parse` got a generic parameter; the default changed from `any` to `unknown`:

```ts
// Still works (default = unknown)
const raw = parse(jsonString);

// Opt-in narrowing
const user = parse<User>(jsonString);
console.log(user.name); // typed

// Or equivalent cast
const user2 = parse(jsonString) as User;
```

If you have code like `parse(json).foo` (direct dereference on the `any`), TypeScript will now flag it — narrow with `parse<Foo>(json)` or cast.

### `ViewRenderProps<TForm>` / `ViewValueProps<TForm>`

Both now accept an optional entity type parameter. Default is `any`, so existing overrides compile. When you pass a type, `props.item` narrows to `TForm` and `props.entityForm` to `EntityForm<TForm>`.

---

## 4. Verification checklist

After bumping the pin, run through this list:

- [ ] `npm install` (or yarn / pnpm) — lockfile regenerated, peer deps resolved.
- [ ] `npm run type-check` / `tsc --noEmit` — **no new errors**. Any error should map to one of the six breaking changes above; cross-reference and apply the fix.
- [ ] Static analysis on callers of `.getAttributes.get(...)` — cast to the expected type at the read site.
- [ ] Grep your code for removed names: `headerButtons`, `withRowActions`, `withRowActionsConfig`, `inlineRowActions`, `InlineRowActionsConfig`, `headerWrapper`, `emptyMessage` (inside `tabPanel`), `collapseIcon`, `AlertStyles.bg`, `getColorIndicator`.
- [ ] Boot each list page — check the row-action column still renders after migrating `rowActions` → `rowActionColumns`.
- [ ] Boot a form page with a tabbed layout — check that `ViewFieldGroup` / `ViewTabPanel` still look right after the B-4 slot rename.
- [ ] Visual smoke test on alerts / notices — B-5 / B-6 touched only the className shape, not the rendered output, but the `data-tone` attribute is how the new CSS hooks match.
- [ ] Keep an eye on runtime errors during the first week — `Map<string, unknown>` is purely a compile-time move, but overly-aggressive downstream casts can mask shape drift.

If you hit an edge the CHANGELOG doesn't cover, open an issue on the source repo.
