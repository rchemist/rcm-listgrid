> **generated-by**: v0.4 surface scout (sonnet, 2026-07-11), read-only.
> **method**: entry-barrel read (`package.json "exports"` → `src/index.ts`) + full source read for the depth targets (EntityForm, FormField, EntityField, FormMutator, onChanges catalog, permission/auth, BackendAdapter, form-store, initialize-form-store, list-store, all react providers/hooks/registry/components) + `grep -rn` across `packages/` and `apps/sample` for cross-package usage evidence. No writes outside this file; no git state touched.
> **caveat**: every `file:line` below was read at HEAD of branch `v0.4` on 2026-07-11. Re-verify line numbers at implementation time — several files are under active edit (see PROGRESS.md E-track) and line numbers drift fast. `dist/*.d.ts` files exist alongside `src/` but were NOT used as source of truth (they are build output of `src/`; all citations point at `src/`).

# v0.4 Public API Surface Catalog

All 8 packages resolve `package.json` `"exports"` to a single entry: `{".": "./src/index.ts"}` (no subpath exports declared — a deep import like `@listgrid/react/dist/providers/adapter` is not a supported public entry point even though it resolves inside this workspace). Two packages are currently empty stubs.

## Package overview

| Package | Barrel | Export count | Status |
|---|---|---|---|
| `@listgrid/schema-core` | `packages/schema-core/src/index.ts` | **165** | full — the field/validation/permission catalog |
| `@listgrid/state` | `packages/state/src/index.ts` | **9** | full — form-store + list-store + init pipe |
| `@listgrid/react` | `packages/react/src/index.ts` | **44** | full — providers/hooks/registry/components |
| `@listgrid/ui-default` | `packages/ui-default/src/index.ts` (`export *` ×2) | **41** (17 primitives + 24 types) | full reference UI kit |
| `@listgrid/backend-rcm` | `packages/backend-rcm/src/index.ts` | **2** | first-class default adapter |
| `@listgrid/next` | `packages/next/src/index.ts` | **2** | thin Next.js router adapter |
| `@listgrid/backend-rest` | `packages/backend-rest/src/index.ts` | **0** | stub — `export {}` only |
| `@listgrid/presets-rcm` | `packages/presets-rcm/src/index.ts` | **0** | stub — `export {}` only |
| **Total live exports** | | **263** | |

---

## 1. `@listgrid/schema-core` — full catalog

React-free (charter C7 / lint-enforced). Entry: `packages/schema-core/src/index.ts`.

### 1.1 Auth + field vocabulary + value

| Symbol | Kind | Purpose | Defined at |
|---|---|---|---|
| `Session`, `SessionUser` | interface | host-injected session shape (`roles` / `authentication.roles`) | `src/auth.ts:16`, `:9` |
| `FieldType` | type (union) | the `field.type` discriminant driving the react FieldRenderer registry | `src/field/types.ts:9` |
| `RenderType` | type | `'create' \| 'update'` | `src/field/types.ts:69` |
| `FieldValue<T>` | interface | declaration value seed (`default`/`fetched`/`current`) | `src/field/types.ts:76` |
| `FieldError` | interface | one validation error message | `src/field/types.ts:87` |
| `FieldValueSlice<T>` | interface | `FieldValue` + store runtime (`dirty`, `errors`) | `src/field/types.ts:105` |
| `FieldEvalContext<TValues>` | interface | `{renderType, values, value?, session?}` passed to every predicate/validation | `src/field/eval-context.ts:23` |
| `OptionalBoolean/String/ReactNode` | interface | `{onCreate?, onUpdate?}` conditional-by-renderType shape | `src/field/conditional.ts:15,19,23` |
| `ValuedBoolean/String/ReactNode` | type (fn) | `(ctx) => Promise<T>` conditional resolver fn shape | `src/field/conditional.ts:28-30` |
| `Conditional*Value`, `RequiredType`, `HiddenType`, `ReadOnlyType`, `PlaceHolderType`, `LabelType`, `HelpTextType`, `TooltipType` | type (union) | the composed meta-field types (`boolean\|OptionalBoolean\|ValuedBoolean` etc.) | `src/field/conditional.ts:32-45` |
| `getConditionalBoolean`, `getConditionalString` | function | resolve a boolean/string conditional against `FieldEvalContext` | `src/field/conditional.ts:53,80` |

### 1.2 View presets

| Symbol | Kind | Purpose | Defined at |
|---|---|---|---|
| `ViewPreset`, `ViewPresetType` | interface/type | `{hidden?, readonly?}` bundle + its 8 named-preset union | `src/field/view-preset.ts:11,59` |
| `ALWAYS,HIDDEN,ADD_ONLY,MODIFY_ONLY,VIEW_ONLY,LIST_ONLY,VIEW_HIDDEN,HAS_VALUE_READONLY,HAS_VALUE_HIDDEN` | const | 9 canned `ViewPreset` values | `src/field/view-preset.ts:17-53` |
| `getViewPreset(type)` | function | resolve a `ViewPresetType` name → its `ViewPreset` | `src/field/view-preset.ts:68` |

### 1.3 Field meta contract + lifecycle types

| Symbol | Kind | Purpose | Defined at |
|---|---|---|---|
| `EntityItem` | interface | shared base for field/tab/group/subcollection (permission+meta lifted here) | `src/field/entity-field.ts:35` |
| `EntityField<T>` | interface | full field meta contract, extends `EntityItem` | `src/field/entity-field.ts:82` |
| `FieldMetaOverride` | interface | EF1 imperative per-field override slot (`required/hidden/readonly/options/validations`) | `src/field/field-meta.ts:10` |
| `FormMutator` | interface | EF2 state-agnostic mutation surface passed to onChanges handlers | `src/field/form-mutator.ts:21` |
| `OnChangesHandler` | type (fn) | `(mutator, changedField) => void\|Promise<void>` | `src/field/form-mutator.ts:81` |
| `OnFetchDataHandler`, `OnInitializeHandler`, `SubmitTransformHandler` | type (fn) | EF3/EF6 lifecycle hooks (see §1.6 EntityForm) | `src/entity-form.ts:17,30,45` |

### 1.4 Permission + validation contracts

| Symbol | Kind | Purpose | Defined at |
|---|---|---|---|
| `isPermitted(required, user)` | function | ANY-OF permission predicate (canonical, was triplicated in 0.3.x) | `src/permission.ts:19` |
| `extractPermissions(session)` | function | `session.roles ?? session.authentication?.roles ?? []` | `src/permission.ts:42` |
| `mergeRequiredPermissions(existing, added)` | function | Set-dedup additive merge for `withRequiredPermissions` | `src/permission.ts:50` |
| `PermissionPolicy` | const (namespace) | `{isPermitted, extractPermissions, mergeRequiredPermissions}` bundle | `src/permission.ts:58` |
| `Validation` | interface | one declared validation rule contract | `src/validation.ts:38` |
| `ValidateResult` | class | `{error, message}` outcome + `.fail()/.success()/.hasError()/.withMessage()` | `src/validation.ts:13` |
| `ValidationItem` | abstract class | base the 10 concrete validations extend | `src/validation.ts:50` |

### 1.5 Validations catalog + regex constants + runtime value ops

| Symbol | Kind | Purpose | Defined at |
|---|---|---|---|
| `RegexValidation` | class | generic regex-match validation (+ `toStringValue` internal helper, **not barrel-exported**) | `src/validations/regex-validation.ts:21` |
| `EmailValidation` | class | extends `RegexValidation` w/ `RegexEmailAddress` | `src/validations/email-validation.ts:5` |
| `RegexFormulaValidation` | class | user-supplied regex-formula validation | `src/validations/regex-formula-validation.ts:16` |
| `MinMaxNumberValidation` | class | numeric min/max bound | `src/validations/min-max-number-validation.ts:19` |
| `StringValidation` | class | string length/pattern | `src/validations/string-validation.ts:14` |
| `PhoneNumberValidation`, `TelephoneNumberValidation` | class | phone-format validations | `src/validations/phone-number-validation.ts:16`, `telephone-number-validation.ts:12` |
| `PasswordValidation` | class | password-strength regex | `src/validations/password-validation.ts:8` |
| `IpAddressValidation`, `RegexAllowedIpAddr` | class/const | IPv4/CIDR allow-list validation | `src/validations/ip-address-validation.ts:31,15` |
| `CustomValidation` | class | host-supplied predicate function wrapped as a `Validation` | `src/validations/custom-validation.ts:9` |
| `RegexEmailAddress/PhoneNumber/TelephoneNumber/PasswordNormal` | const (RegExp) | the 4 canonical regexes the validations above are built on | `src/util/regex.ts:12-15` |
| `getCurrentValue,isBlank,isDirty,normalizeEmptyValue,resetValue` | function | pure value-slice ops (ADR-0002) — resolve/blank-check/dirty-check/reset a `FieldValueSlice` | `src/field/value.ts:16,28,68,50,112` |
| `isEquals,isEqualCollection` | function | deep-equality helpers `isDirty` depends on | `src/util/compare.ts:11,34` |
| `isExternalUrl` | function | URL classification for File/Image external-URL bypass | `src/util/url.ts:12` |
| `AssetConfig` | type | shared File/Image upload constraint shape (**`buildAssetConfig` builder fn NOT barrel-exported**, see §Observations) | `src/field/asset-config.ts:10` |
| `formatPhoneNumber,removePhoneNumberHyphens` | function | phone display/normalize formatting | `src/util/phone-util.ts:28,8` |

### 1.6 EntityForm — FULL public member list

`class EntityForm` — `packages/schema-core/src/entity-form.ts:93-348`. **30 public members**: 2 public readonly properties + 1 constructor + 27 methods.

| Member | Signature (condensed) | Group | Line |
|---|---|---|---|
| `name` | `readonly string` | property | 94 |
| `fetchUrl` | `readonly string` | property | 95 |
| `constructor` | `(name: string, fetchUrl: string)` | ctor | 129 |
| `withTitle` | `(title: string): this` | builder | 135 |
| `withNeverDelete` | `(): this` | builder | 139 |
| `withId` | `(id: string): this` | builder | 144 |
| `withOnChanges` | `(handler: OnChangesHandler): this` — EF2, append | builder | 149 |
| `withOnFetchData` | `(handler: OnFetchDataHandler): this` — EF3, append | builder | 154 |
| `withOnInitialize` | `(handler: OnInitializeHandler): this` — EF3, append | builder | 159 |
| `withSubmitTransform` | `(handler: SubmitTransformHandler): this` — EF6, **replaces** (single-slot) | builder | 168 |
| `setValue` | `(name: string, value: unknown): this` — EF7 imperative override, chainable | mutator (chainable) | 187 |
| `setFetchedValue` | `(name: string, value: unknown): this` — EF7 fetched-baseline override, chainable | mutator (chainable) | 204 |
| `setTabHidden` | `(tabId: string, hidden: boolean): this` — EC3-0, chainable | mutator (chainable) | 227 |
| `addFields` | `(input: AddFieldsInput): this` | builder | 237 |
| `getName` | `(): string` | query | 265 |
| `getUrl` | `(): string` | query | 268 |
| `getTitle` | `(): string \| undefined` | query | 271 |
| `getId` | `(): string \| undefined` | query | 274 |
| `isNeverDelete` | `(): boolean` | query (predicate) | 277 |
| `getRenderType` | `(): RenderType` — `'update'` iff `id` set | query | 281 |
| `getOnChanges` | `(): OnChangesHandler[]` | query | 285 |
| `getOnFetchData` | `(): OnFetchDataHandler[]` | query | 289 |
| `getOnInitialize` | `(): OnInitializeHandler[]` | query | 293 |
| `getSubmitTransform` | `(): SubmitTransformHandler \| undefined` | query | 297 |
| `getFields` | `(): EntityField[]` — sorted by `order` | query | 302 |
| `getField` | `(name: string): EntityField \| undefined` | query | 305 |
| `getTabs` | `(): TabDef[]` — sorted | query | 308 |
| `getFieldGroups` | `(tabId?: string): FieldGroupDef[]` | query | 311 |
| `getGroupFields` | `(tabId: string, groupId: string): EntityField[]` | query | 322 |
| `clone` | `(includeValue = false): EntityForm` | structural | 329 |

Supporting types exported alongside: `FieldGroupDef` (`:56`), `TabDef` (`:62`, carries `hidden?` for EC3-0), `AddFieldsInput` (`:82`), `OnFetchDataHandler`/`OnInitializeHandler`/`SubmitTransformHandler` (`:17,30,45`).

**Naming note**: `with*` (11), `get*`/`is*` (16), `set*` (3), `addFields`, `clone` — 4 verb families for what is functionally 2 categories (chainable builder vs. read query). `setValue`/`setFetchedValue`/`setTabHidden` ARE chainable builders (`return this`) but use the `set*` verb instead of `with*`, breaking the builder-verb convention the other 11 builders establish.

### 1.7 FormField — FULL public member list (abstract base)

`abstract class FormField<TValue> implements EntityField<TValue>` — `packages/schema-core/src/field/form-field.ts:40-245`. **~47 public members**: 19 properties + 28 methods (`protected constructor`, not counted as public).

Properties (declaration meta, all optional except `order/name/type`): `order`, `name`, `type`, `label?`, `helpText?`, `tooltip?`, `hidden?`, `readonly?`, `required?`, `placeHolder?`, `hideLabel?`, `validations?`, `requiredPermissions?`, `exceptOnSave?`, `dependsOn?`, `renderedBy?`, `attributes?`, `value?`, `form?` (`:41-70`).

| Method | Signature (condensed) | Group | Line |
|---|---|---|---|
| `getName/getOrder/getLabel/getTabId/getFieldGroupId` | 5 sync getters | query | 79-93 |
| `isHidden(ctx)`, `isReadonly(ctx)`, `isRequired(ctx)` | `Promise<boolean>` — async, resolve `Conditional*Value` meta | predicate | 96-104 |
| `isPermitted(userPermissions?)` | `boolean` — **sync**, unlike the 3 above | predicate | 105 |
| `validate(ctx, override?)` | `Promise<ValidateResult[]>` — required-blank + declared validations, override-aware (EF1) | validation | 120 |
| `withLabel/withRequired/withReadOnly/withHidden/withPlaceHolder/withHelpText/withTooltip/withHideLabel` | 8 chainable meta builders | builder | 149-184 |
| `withValidations(...validations)` | `(...Validation[]): this` | builder | 185 |
| `withDependsOn(...names)` | `(...string[]): this` — cross-field cascade declaration | builder | 190 |
| `withRenderedBy(name)` | `(string): this` — EB2 render-suppression marker | builder | 196 |
| `withRequiredPermissions(...permissions)` | `(...string[]): this` | builder | 200 |
| `withViewPreset(preset)` | `(ViewPreset): this` | builder | 204 |
| `withForm(form)` | `({tabId,fieldGroupId}): this` | builder | 209 |
| `withOrder(order)` | `(number): this` | builder | 213 |
| `withDefaultValue(value)` | `(TValue): this` — seeds `default`+`current` | builder | 218 |
| `withValue(value)` | `(TValue): this` — sets `current` only | builder | 228 |
| `clone(includeValue?)` | `(boolean): this` — structural copy | structural | 234 |

**Sync/async inconsistency**: 3 of 4 predicates (`isHidden/isReadonly/isRequired`) are `Promise<boolean>`; `isPermitted` is synchronous `boolean`. The same split exists in the `EntityItem`/`EntityField` interfaces (§1.3), so it is a contract decision, not an implementation slip — but it means every call site must remember which predicate to `await`.

### 1.8 EntityField / EntityItem interfaces — full member list

`EntityItem` (`src/field/entity-field.ts:35-67`, 18 members): properties `order,name,label?,helpText?,hidden?,readonly?,hideLabel?,form?,requiredPermissions?` (9); methods `getOrder,getName,getLabel,getTabId,getFieldGroupId` (5 getters), `isHidden,isReadonly` (2 async predicates), `isPermitted` (1 sync predicate), `withViewPreset,withRequiredPermissions` (2 builders), `clone` (1).

`EntityField<T>` (`:82-133`, extends `EntityItem`, +13 additive members): properties `type,value?,placeHolder?,required?,validations?,exceptOnSave?,dependsOn?,attributes?,renderedBy?` (9); methods `isRequired` (async predicate), `validate` (validation), `withRequired,withValidations,withPlaceHolder,withValue` (4 builders).

### 1.9 FormMutator interface — full member list

`packages/schema-core/src/field/form-mutator.ts:21-70`. **7 members**, all consumed by `OnChangesHandler` (`:81`) and implemented by `@listgrid/state`'s `createFormStore` (§2.1):

| Member | Signature | Line |
|---|---|---|
| `getValue(name)` | `(string): unknown` | 23 |
| `getValues()` | `(): Record<string, unknown>` | 25 |
| `setValue(name, value)` | `(string, unknown): void` — may itself trigger nested onChanges dispatch | 27 |
| `setMeta(name, partial)` | `(string, FieldMetaOverride): void` — shallow-merge into EF1 override | 29 |
| `addField(field)` | `(FormField): void` — EF4, mid-lifecycle field registration | 42 |
| `removeField(name)` | `(string): void` — EF4 | 48 |
| `setTabHidden(tabId, hidden)` | `(string, boolean): void` — EC3-0, does NOT cascade to field-level `hidden` | 69 |

### 1.10 onChanges builder catalog (EF2)

Port of 0.3.x `OnChangeEntityForm.ts` — **3 builders**, all `(sourceField, when) => OnChangesHandler`, dispatch-filtered to `changedField === sourceField`:

| Builder | Clause type | Semantics | Line |
|---|---|---|---|
| `changeHidden(sourceField, when)` | `ConditionalMetaClause \| []` | single clause: writes `hidden`+negation on every target every dispatch; array: only matching clauses apply, no revert | `src/onchanges/change-hidden.ts:38` |
| `changeRequired(sourceField, when)` | `ConditionalMetaClause \| []` | same shape/semantics as `changeHidden`, for `required` | `src/onchanges/change-required.ts:18` |
| `changeSelectOptions(sourceField, when)` | `ConditionalSelectOptionsClause \| []` | match → apply `options`; no-match → revert to declared (`options: undefined`) — singular and array clauses share ONE loop (unlike the other two) | `src/onchanges/change-select-options.ts:40` |

`ConditionalMetaClause` (`change-hidden.ts:9`, shared by changeHidden/changeRequired) and `ConditionalSelectOptionsClause` (`change-select-options.ts:12`) are the exported clause shapes.

### 1.11 permission.ts / auth.ts — full API

Covered inline in §1.4 (`isPermitted`, `extractPermissions`, `mergeRequiredPermissions`, `PermissionPolicy`) and §1.1 (`Session`, `SessionUser`). `auth.ts` is 25 lines total, 2 interfaces, no functions — a pure host-injected contract, deliberately minimal (`[key: string]: unknown` index signature so richer host `Session` shapes stay structurally assignable).

### 1.12 BackendAdapter contract — full signatures

`packages/schema-core/src/backend/adapter.ts:25-40`. **5 methods**, implemented by `@listgrid/backend-rcm` (`createRcmAdapter`, §5) — `@listgrid/backend-rest` has NOT implemented it yet (empty stub, §Observations):

```
list<T>(url: string, search: SearchForm): Promise<PageResult<T>>       // POST {url}/search
getOne<T>(url: string, id: string): Promise<T>                          // GET {url}/{id}
create<T>(url: string, data: Record<string,unknown>): Promise<T>        // POST {url}
update<T>(url: string, id: string, data: Record<string,unknown>): Promise<T>  // PUT {url}/{id}
remove(url: string, ids: string[]): Promise<void>                       // DELETE {url}, body {ids} — BULK ONLY
```

Plus `PageResult<T>` (`:9`, `{content,totalElements,totalPages}`), `BackendErrorCode` (`:16`, 4-way union), `BackendError` (`:18`, `{code,message,fieldErrors?}`).

### 1.13 Field class catalog + SearchForm (one-liners)

30 concrete field classes, all `extends FormField<T>` (a few via `OptionsField`/`MultiOptionsField`). Grouped by fan-out phase (per source comments):

| Class | Value type | One-liner | Defined at |
|---|---|---|---|
| `StringField` | `string` | single-line text (`useCopy` flag) | `basic-fields.ts:11` |
| `EmailField` | `string` | text + auto-attached `EmailValidation` | `basic-fields.ts:21` |
| `PhoneNumberField` | `string` | text + auto-attached `PhoneNumberValidation` | `basic-fields.ts:30` |
| `BooleanField` | `boolean` | checkbox/toggle, optional `emptyLabel` | `basic-fields.ts:38` |
| `NumberField` | `number` | numeric, `currency/double/limit` | `basic-fields.ts:60` |
| `TextareaField` | `string` | multi-line text, `rows` default 10 | `basic-fields.ts:77` |
| `MarkdownField` | `string` | rich-text placeholder (real editor deferred to V1) | `basic-fields.ts:90` |
| `DateField` | `string` | plain `yyyy-mm-dd` | `basic-fields.ts:99` |
| `SelectField` | `string\|number\|boolean` | dropdown, `options: SelectOption[]` | `basic-fields.ts:110` |
| `ManyToOneField<T>` | `T` | relation via lazy `() => EntityForm` thunk (D1) | `many-to-one-field.ts:42` |
| `SubCollectionField` | `Record<string,unknown>[]` | child collection, isolated child store | `sub-collection-field.ts:26` |
| `OptionsField<T>` (abstract) | `T` | base for anything backed by `SelectOption[]` | `options-field.ts:22` |
| `MultiOptionsField<T>` (abstract) | `T` | `OptionsField` + selected-count min/max validate | `options-field.ts:41` |
| `CheckboxField` | `string[]` | one checkbox per option | `checkbox-field.ts:43` |
| `MultiSelectField` | `string[]` | multi-select dropdown | `multi-select-field.ts:37` |
| `PasswordField` | `string` | password + strength rules | `password-field.ts:41` |
| `MonthField` | `string` | `YYYY-MM`, lexicographic limit compare | `month-field.ts:22` |
| `YearField` | `string` | year-only | `year-field.ts:18` |
| `TimeField` | `TimeFieldValue` | `HH:mm` (or `'now'` sentinel passthrough) | `time-field.ts:29` |
| `LinkField` | `string` | URL link | `link-field.ts:20` |
| `TagField` | `string[]` | tokenized tag input | `tag-field.ts:39` |
| `ColorPresetField` | `string` | preset color swatch picker | `color-preset-field.ts:20` |
| `MessageViewField` | `unknown` | static/conditional message display, no store value | `message-view-field.ts:30` |
| `ProfileField` | `unknown` | host-owned user-profile placeholder | `profile-field.ts:29` |
| `MappedJoinField` | `string` | derived display of a joined value | `mapped-join-field.ts:18` |
| `FileField` | `string\|string[]` | file upload (URL-string value; HTTP host-owned) | `file-field.ts:40` |
| `ImageField` | `string\|string[]` | image upload variant of `FileField` | `image-field.ts:41` |
| `MultipleAssetField` | `AssetItem[]` | multi-file/image upload | `multiple-asset-field.ts:61` |
| `DatetimeField` | `DatetimeFieldValue` | date+time combined | `datetime-field.ts:33` |
| `CustomOptionField` | (options-carrying) | alias-keyed host-fetched option list | `custom-option-field.ts:85` |
| `BirthdayField` | `string` | date-of-birth specialization | `birthday-field.ts:21` |
| `TelephoneNumberField` | `string` | landline (vs. `PhoneNumberField` mobile) | `telephone-number-field.ts:35` |
| `ColorField` | `string` | free color picker | `color-field.ts:15` |
| `InlineMapField` | `InlineMapValue` | fixed/free key-value row editor | `inline-map-field.ts:93` |
| `AddressField` | `Address` | Daum 우편번호 composite; owns 5 `renderedBy`-suppressed siblings | `address-field.ts:48` |
| `XrefMappingField` | `XrefMappingValue` | plain cross-reference mapping view | `xref-mapping-field.ts:90` |
| `XrefPreferMappingField` | `XrefPreferMappingValue` | xref mapping + a "preferred" flag | `xref-prefer-mapping-field.ts:60` |

`SearchForm` (class, `search/search-form.ts:46`) — list query model: `page,pageSize,sorts,filters,quickSearchFields,cacheKey` state; `.create()/.clone()/.withPage()/.withPageSize()/.withSort()/.clearSort()/.quickSearch()/.addAndFilter()/.toJSON()` (9 members). `toJSON()` is the literal `POST /{url}/search` body. Supporting types: `Direction`, `SortSpec`, `QueryConditionType` (12-way union), `FilterItem`, `SearchFormJSON`.

`SCHEMA_CORE_VERSION` (const, `index.ts:226`) — see §Observations (leftover P1 workspace-wiring smoke-test marker, still shipped).

---

## 2. `@listgrid/state` — full catalog

Framework-agnostic (`zustand/vanilla`). Entry: `packages/state/src/index.ts` (17 lines, 3 re-export groups).

### 2.1 form-store — public state shape + actions

`FormStoreState` interface, `packages/state/src/form-store.ts:42-143`. **25 members**: 10 state fields + 15 actions.

State: `fields: Record<string,FieldValueSlice>` (value slices), `meta: Record<string,FieldMetaOverride>` (EF1 overrides), `fieldDefs: Record<string,EntityField>` (EF4 LIVE field registry — NOT `entityForm.getFields()`), `structureVersion: number` (bumped only by addField/removeField), `tabHidden: Record<string,boolean>` (EC3-0 runtime override), `renderType`, `tabIndex`, `initialized`, `saving`, `formErrors: string[]`.

Actions: `setValue(name,value,opts?)` (dispatches onChanges unless `opts.cascade===false`), `getValue(name)`, `hydrate(data)`, `setMeta(name,partial)`, `getMeta(name)`, `addField(field)` (EF4), `removeField(name)` (EF4), `validateField(name): Promise<boolean>`, `validateAll(): Promise<boolean>`, `reset()`, `isDirty()`, `setSaving(saving)`, `setTabIndex(tabIndex)`, `setTabHidden(tabId,hidden)`, `toSaveData(): Record<string,unknown>` (drops `exceptOnSave`+unpermitted fields, flattens ManyToOne → `<name>Id`, applies `submitTransform`).

`createFormStore(entityForm, opts?)` — `:188` — factory; `CreateFormStoreOptions` (`:145`: `session?,renderType?,validateOnChange?,fetchedData?`). Also exports `resolveFetchedValue(data,name)` (`:26`) — dotted-path fetched-record reader, reused by `initializeFormStore`'s BIND/REBIND steps.

### 2.2 initializeFormStore — pipeline (EF3, reordered EF7)

`initializeFormStore(options): Promise<InitializeFormStoreResult>` — `packages/state/src/initialize-form-store.ts:105-182`. Ordered steps:

1. **Clone** — `entityForm.clone(true)`, then `.withId(id)` if given. Declared form is never mutated. (`:115-116`)
2. **Resolve fetched data** — `initialData` if given; else `adapter.getOne(ef.getUrl(), id)` if `id`+`adapter` given. On fetch error: **short-circuit** — return `{store: createFormStore(ef), entityForm: ef, error}` (empty-but-usable store, steps 3-7 skipped). (`:123-131`)
3. **BIND** — `bindFetchedData(ef, data)`: unconditionally overwrite every field's `fetched`+`current` from `data` (dotted-name aware). Runs BEFORE hooks so a hook's `ef.setValue` can override it (the EF7 fix — old engine ran `onInitialize` after `setFetchedValues` for this exact reason). (`:80-85`, `:137-139`)
4. **onFetchData** — sequential, only if `data` present; each handler wrapped in try/catch (throw → logged + skipped, remaining handlers still run). (`:145-153`)
5. **onInitialize** — sequential, always (create mode too); same per-handler isolation. (`:155-163`)
6. **REBIND** — `rebindLateAddedFields(ef, data)`: fills `fetched`+`current` ONLY for fields a hook added after BIND (skip-guard: `field.value?.fetched !== undefined` → already bound, never re-touched). (`:96-103`, `:168-170`)
7. **Build** — `createFormStore(ef, {...session, validateOnChange, fetchedData: data})`. Every field's `value.current` is already final (hook override > fetched record > declared default); no separate `hydrate()` call. (`:172-179`)

Returns `{store, entityForm: ef, error?}` — render with the RETURNED `entityForm`, not the input, since hooks may have added fields.

### 2.3 list-store — public surface

`ListStoreState<T>` interface, `packages/state/src/list-store.ts:9-22`. **11 members**: state `rows: T[], totalElements, totalPages, loading, error, searchForm: SearchForm`; actions `fetch(): Promise<void>`, `setPage(page)`, `setPageSize(pageSize)`, `setSort(field,direction)`, `quickSearch(fields,value)` — all 4 mutators clone `searchForm` immutably then call `fetch()`.

`createListStore(opts)` — `:42` — factory; `CreateListStoreOptions` (`:24`: `url, adapter, initialSearch?, postFetch?` — `postFetch` runs on EVERY fetch, outside the adapter's try/catch, so a throwing `postFetch` propagates uncaught by design).

---

## 3. `@listgrid/react` — full catalog

Entry: `packages/react/src/index.ts` (68 lines). Zero owned UI (charter C7) — dispatches to `@listgrid/ui-default` primitives via `UIProvider`.

### 3.1 Providers + hooks

| Provider | Injects | Hook(s) | Throws if unwired? | Line |
|---|---|---|---|---|
| `UIProvider` | `UIComponents` registry | `useUI()` | yes | `providers/ui.tsx:18,27` |
| `AuthProvider` | `Session \| undefined` | `useSession()` | yes (missing PROVIDER; session itself may legitimately be `undefined` — distinguished via a private `Symbol` sentinel) | `providers/auth.tsx:23,32` |
| `RouterProvider` | `Router {push,replace}` | `useRouter()` | **no** — real no-op default (`console.warn` + no-op) | `providers/router.tsx:41,46` |
| `AdapterProvider` | `BackendAdapter` | `useAdapter()`, `useReferenceResolver()` (dedup/cache for `getOne(url,id)`, **NOT re-exported from index.ts** — see §Observations) | yes | `providers/adapter.tsx:28,64,81` |
| `CustomOptionProvider` | `FetchCustomOptions` | `useCustomOptions()` (alias-keyed dedup/cache) | yes | `providers/custom-option.tsx:33,79` |
| `FormStoreProvider` | `StoreApi<FormStoreState>` | `useFormStore()`, `useFormField(name)`, `useFieldValue<T>(name)`, `snapshotFieldValues(state)`, plus **`useFieldMeta(name)` — defined here (`:58`) but NOT re-exported from index.ts** | yes | `providers/form-store.tsx:22,27,46,68,76` |

`configureMessages(config)`, `getMessages()`, `resetMessages()` (`messages.ts:44,49,54`) — module-scope toast/confirm/error registry; unconfigured calls fall back to `console.warn`/`console.error`, never throw.

### 3.2 initializeFormStore React entry point

`useEntityFormInitializer(options): UseEntityFormInitializerResult` — `packages/react/src/hooks/use-entity-form-initializer.ts:51`. Wraps `initializeFormStore` (§2.2) in a `useEffect`, keyed on `entityForm/adapter/id` identity (session/initialData read from closure, deliberately excluded from the re-run key). Returns `{store, entityForm, loading, error?}` — `store`/`entityForm` are `undefined` until the pipe resolves.

### 3.3 FieldRenderer registry API

`packages/react/src/registry/field-renderer-registry.tsx`. **4 exports**: `registerFieldRenderer(type, component)` (`:31`, module-scope `Map<FieldType,Component>`, last write wins), `getFieldRenderer(type)` (`:36`), `FieldRendererComponent` (type alias, `:26`), `FieldRendererComponentProps` (`:17`: `{field,name,readOnly?,required?,invalid?,describedBy?}` — note `readOnly` camelCase here vs. schema-core's `readonly` lowercase, see §Observations).

`registerDefaultRenderers()` — `registry/default-renderers.tsx:226` — registers 29 built-in type→component mappings in one call (idempotent, must run before host overrides since last-write-wins). Notable: `'datetime'` maps to a dedicated `DatetimeFieldRenderer` (not the `DateRenderer` fallback the file's own comment describes — comment is stale relative to code, `:19,234`); `'xrefPriorityMapping'` is deliberately renderer-less (0 audited consumers).

### 3.4 Components

| Component | Props type | Purpose | Line |
|---|---|---|---|
| `FieldRenderer` | `FieldRendererProps {field, name?}` | per-field wrapper: label+asterisk, async hidden/required/readonly resolution, EG2 permission hard-gate, error list, type-dispatch via registry | `components/FieldRenderer.tsx:27,33` |
| `ViewEntityForm` | `ViewEntityFormProps {entityForm, store, onSave?}` | top-level form screen: tabs (only if >1), groups, fields, Save w/ validateAll + focus-first-invalid-field | `components/ViewEntityForm.tsx:17,102` |
| `ViewListGrid` | `ViewListGridProps {entityForm, store, onRowClick?, columns?, selection?, toolbar?}` | list screen: quick-search, table, pagination, EA-D2-0 row-selection + toolbar slot | `components/ViewListGrid.tsx:49,136` |

`getConditionalReactNode(ctx, condition)` — `util/conditional-react-node.ts:39` — the ReactNode-valued conditional resolver schema-core deliberately omits (needs `React.isValidElement`).

### 3.5 messages.ts — full API

`MessagesRegistry {showConfirm, showToast, showError}` (`messages.ts:10`), `ToastKind = 'success'|'error'|'info'` (`:8`), `configureMessages/getMessages/resetMessages` (`:44,49,54`).

---

## 4. `@listgrid/ui-default` (light depth)

Entry re-exports everything from `primitives.tsx` + `types.ts` (`export *` ×2, `src/index.ts:15-16`).

**Primitives (17)**: `TextInput, Textarea, NumberInput, DateInput, CheckBox, SelectBox, TagsInput, FileInput, InlineMap, UserView, Button, Modal, Table (+.Thead/.Tbody/.Tr/.Th/.Td), Pagination, Stack, LoadingOverlay` — all plain semantic HTML, unstyled, normalize `onChange` to the VALUE (never raw DOM event). `defaultUIComponents: UIComponents` (`primitives.tsx:727`) bundles all of them into the registry `UIProvider` expects.

**Types (24)**: one `*Props` interface per primitive above, plus `SelectOption`, `TagValidationResult`, `InlineMapKeyDef`, `ButtonVariant`, `TableComponent`, and the `UIComponents` registry shape (`types.ts:260`) itself.

---

## 5. `@listgrid/backend-rcm` (light depth)

`createRcmAdapter(opts?): BackendAdapter` — `packages/backend-rcm/src/adapter.ts:107`. First-class default `BackendAdapter` impl (ADR-0005) for rcm-framework 0.1.0. Wire contract: `list`→`POST {url}/search`, `getOne`→`GET {url}/{id}`, `create`→`POST {url}`, `update`→`PUT {url}/{id}`, `remove`→`DELETE {url}` (bulk body `{ids}`). Absorbs the dual list-envelope (Spring Page vs. legacy: `content ?? list`, `totalElements ?? totalCount`, `totalPages ?? totalPage`) and coerces every row's `id` to `String(id)`. Maps HTTP status + body `code` to the 4 `BackendErrorCode`s (401→`TOKEN_EXPIRED`, 403→`FORBIDDEN`, 400/422→`VALIDATION`, else `UNKNOWN`), throwing a `BackendAdapterError` (internal class, not exported) that implements `BackendError`. `RcmAdapterOptions {baseUrl?, fetch?, headers?}` (`:9`).

---

## 6. `@listgrid/next` (light depth)

`NextRouterProvider({children})` — `packages/next/src/NextRouterProvider.tsx:16` — `'use client'` component wiring `@listgrid/react`'s `RouterProvider` seam to `next/navigation`'s `useRouter()`. `NextRouterProviderProps {children?}` (`:12`). This is the ONLY adapter package with a concrete implementation; it is a straight pass-through (2 lines of logic: `push`/`replace`).

---

## 7. `@listgrid/backend-rest` and `@listgrid/presets-rcm` — empty stubs

Both files are literally:
```ts
export {};
```
`packages/backend-rest/src/index.ts:6`, `packages/presets-rcm/src/index.ts:6`. Zero symbols. Both carry a header comment declaring them "Re-foundation scaffold (P1). Transplant target for P4/P5" — i.e. these are placeholder packages in the workspace graph (present in `pnpm-workspace`, buildable, importable) that currently contribute **0** of the 8 packages' combined API surface. `@listgrid/backend-rest` means schema-core's `BackendAdapter` contract (§1.12) has exactly ONE implementation today (`backend-rcm`) — there is no generic-REST reference to characterize the contract against, which is a real gap if a non-rcm host tries to adopt this engine.

---

## Observations

1. **Two internally-used hooks are missing from the react barrel.** `useFieldMeta` (`packages/react/src/providers/form-store.tsx:58`) and `useReferenceResolver` (`packages/react/src/providers/adapter.tsx:81`) are exported from their own modules and consumed throughout the package (7+ call sites for `useFieldMeta`: `FieldRenderer.tsx:11`, `default-renderers.tsx:3`, `checkbox-renderer.tsx`, `tag-renderer.tsx`, `multi-select-renderer.tsx`, `custom-option-renderer.tsx`, `address-renderer.tsx`; `useReferenceResolver` in `many-to-one-renderer.tsx:7` + tests) — but neither is re-exported from `packages/react/src/index.ts`. Every sibling hook from the SAME files (`useFormField`, `useFieldValue`, `snapshotFieldValues` from `form-store.tsx`; `useAdapter` from `adapter.tsx`) IS exported. A host that wants to read a field's EF1 meta-override or build a custom ManyToOne-style deduped picker cannot do so through the public API today — only a deep import (`@listgrid/react/src/providers/form-store` or `/adapter`) reaches it, and the package's `"exports"` map (`{".": "./src/index.ts"}`, no subpaths declared) does not sanction that path. Looks like an oversight rather than a deliberate internal/public split, given the pattern of "export every other hook from this file."

2. **`SCHEMA_CORE_VERSION` is a stale P1 smoke-test marker still shipping in the v0.4 public surface.** `packages/schema-core/src/index.ts:226`, value hardcoded `'0.0.0'`. Its own comment says: "P1-5 workspace-wiring marker — apps/sample imports this to prove the `@listgrid/*` workspace path resolves." Its only consumer, `apps/sample/app/page.tsx:13`, is a debug/demo page printing the constant — not a real usage. Candidate for removal now that P1 wiring is long proven (current work is P3/E-track per PROGRESS.md).

3. **`PermissionPolicy` is a redundant, unused-in-practice export.** `permission.ts:58` bundles `{isPermitted, extractPermissions, mergeRequiredPermissions}` into one const "for ergonomic call sites: `PermissionPolicy.isPermitted(...)`" — but a monorepo-wide grep finds **zero** call sites using the namespaced form; `contract.test.ts` and every internal caller import the bare functions directly (`isPermitted(...)`, not `PermissionPolicy.isPermitted(...)`). Two public names for the same 3 functions, and only one is ever used.

4. **A structural type-cast escape hatch bypasses the field-class boundary.** `packages/state/src/form-store.ts:583`: `const idField = (field as { getIdField?: () => string }).getIdField?.() ?? 'id';` — `toSaveData()` needs `ManyToOneField.getIdField()` (schema-core, `many-to-one-field.ts:55`) but `@listgrid/state` never imports `ManyToOneField` (presumably to avoid a heavier import), so it duck-types the shape instead of using `field.type === 'manyToOne'` + a shared type guard. Any field class that happens to expose a same-shaped `getIdField(): string` method (coincidence, not a contract) would silently match. No `isManyToOneField()` guard is exported from schema-core for this.

5. **`readonly` vs. `readOnly` casing crosses the schema-core/react boundary inconsistently.** Every schema-core surface uses lowercase `readonly` — `FormField.readonly?` (`form-field.ts:49`), `FieldMetaOverride.readonly?` (`field-meta.ts:13`). Every react-layer prop uses camelCase `readOnly` — `FieldRendererComponentProps.readOnly?` (`field-renderer-registry.tsx:20`), `FieldRenderer`'s local `readOnly`/`effReadOnly` variables. A consumer moving from a field declaration to a renderer prop must remember the casing flips.

6. **`buildAssetConfig` and `toStringValue` are non-barrel helper functions sitting next to barrel-exported siblings that ARE similarly "just a helper."** `buildAssetConfig` (`field/asset-config.ts:25`, used by `FileField`/`ImageField` constructors) and `toStringValue` (`validations/regex-validation.ts:15`, used inside `RegexValidation.validate`) are both `export function` at module scope but not re-exported through `index.ts` — while structurally similar extracted-helper functions (`getConditionalBoolean`/`getConditionalString`, `formatPhoneNumber`) ARE barrel-exported. Likely fine (intentionally private), but the boundary between "helper the barrel exposes" and "helper it doesn't" isn't obviously principled from the outside.

7. **`isEquals`/`isEqualCollection` are public API with zero external consumers.** Both are barrel-exported (`index.ts:94`) but a monorepo grep finds their only real call sites inside the SAME package (`field/value.ts:84,92,102,104`, which `isDirty` depends on) — no consumer in `@listgrid/state`, `@listgrid/react`, or `apps/sample` imports them. Legitimate general-purpose utilities, but currently dead weight from the public-surface-size perspective (2 of schema-core's 165 exports have zero known external readers).

8. **Same-named methods carry different semantics across 3 layers a host actively juggles.** `setValue`/`setTabHidden` exist on (a) `EntityForm` (pre-store declaration mutation, chainable `this`, §1.6), (b) `FormMutator`/`FormStoreState` (runtime store write, void return, dispatches onChanges, §1.9/§2.1) — same method names, same rough intent ("set this value" / "hide this tab"), but calling the wrong one at the wrong lifecycle stage is a real footgun for a form author who is expected to hold both an `EntityForm` and a `FormMutator` reference inside `onInitialize`/`onChanges` handlers respectively.

9. **`@listgrid/backend-rest` and `@listgrid/presets-rcm` are 2 of the 8 charter packages and currently ship 0 exports each** (`export {};`, §7) — both are on the P4/P5 transplant roadmap per their own header comments, but today the workspace's ONLY `BackendAdapter` implementation is the rcm-specific one (`backend-rcm`), so the "adapter contract is host-swappable" claim (ADR-0005) is unverified by a second real implementation.

10. **`apps/sample` never wires `CustomOptionProvider`** (`apps/sample/app/providers.tsx:21-31` wires `UIProvider`/`AuthProvider`/`AdapterProvider`/`NextRouterProvider` but not `CustomOptionProvider`) — if any sample entity used `CustomOptionField`, `useCustomOptions()` would throw at render time. Not currently exercised (no `CustomOptionField` found in `apps/sample/lib/entities/*`), so this is latent rather than a live bug, but it's a gap between the react package's provider list (6 providers) and what the reference host app actually demonstrates (4 providers).
