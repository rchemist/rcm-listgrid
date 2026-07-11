# OLD EntityForm (0.3) — Public API Member Catalog

> **generated-by**: old-surface scout (sonnet, 2026-07-11, read-only)
> **method**: full read of `EntityForm.tsx` + the entire `form/` mixin chain (`EntityFormBase` → `EntityFormValidation` → `EntityFormData` → `EntityFormActions` → `EntityFormExtensions` → `EntityForm`); every method body was read, not just its name/signature; cross-checked call sites for the "is this ever invoked" questions (`cacheKeyFunc`, `executeClientExtensions`, `onFetchListData`, `getAllClientExtensions`, `title.view`) via repo-wide grep.
> **caveat**: file\:line below is accurate as of branch `v0.4` @ 2026-07-11. Re-verify against HEAD before an implementation pass — this is a snapshot, not a live index. Private helpers (`getTitlePostfix`, `getDataFields`, `getDataFieldsFromFields`, `withClientExtension`) are mentioned in Notes for context but **excluded** from the public member count.

## Scope & chain

```
EntityFormBase<T>        (src/listgrid/config/form/EntityFormBase.tsx)      — abstract, own state + generic accessors
  └─ EntityFormValidation<T>  (.../EntityFormValidation.tsx)                — errors, ManageEntityForm CRUD flags
       └─ EntityFormData<T>      (.../EntityFormData.tsx)                   — value mutation, dirty tracking, field copy
            └─ EntityFormActions<T> (.../EntityFormActions.tsx)             — alerts, list/filter fields, data-transfer, wizard steps
                 └─ EntityFormExtensions<T> (.../EntityFormExtensions.tsx)   — client-side extension-point registry
                      └─ EntityForm<T>          (src/listgrid/config/EntityForm.tsx) — concrete class: clone, initialize, save, delete, validate
```

File aliases used in tables below:

| Alias | Path |
|---|---|
| `EF` | `src/listgrid/config/EntityForm.tsx` |
| `Base` | `src/listgrid/config/form/EntityFormBase.tsx` |
| `Val` | `src/listgrid/config/form/EntityFormValidation.tsx` |
| `Data` | `src/listgrid/config/form/EntityFormData.tsx` |
| `Act` | `src/listgrid/config/form/EntityFormActions.tsx` |
| `Ext` | `src/listgrid/config/form/EntityFormExtensions.tsx` |

**Total public members counted: 189** (properties + methods, `this`-instance surface only; abstract stubs counted once at their concrete implementation site, not twice). This is meaningfully above the ~130 planning estimate — see Cross-Cutting Findings §1 for why.

---

## 1. lifecycle-hooks (13)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `onChanges` | `ModifyEntityFormFunc<T>[]?` | array of per-field-change mutators | `Base:109` | run by `executeOnChanges`; see notes there — results are discarded |
| `onFetchData` | `ModifyFetchedEntityFormFunc<T>[]?` | array of post-fetch mutators | `Base:113` | run inside `setFetchedValues`, **chained** (each result feeds the next) |
| `onInitialize` | `OnInitializeFunc<T>[]?` | array of post-initialize mutators | `Base:118` | run in `initialize()` **and again** after every successful `internalSave()` — fires twice per lifecycle, not once |
| `onFetchListData` | `PostFetchListData[]?` | array of list-fetch post-processors | `Base:120` | invoked from `useListGridLogic.ts` with an explicit "기존 hook 지원(하위호환성)" (legacy back-compat) comment — genuinely legacy, not dead |
| `withOnChanges` | `(...fns) => this` | additive append | `Base:753` | correctly additive (spread onto existing array) |
| `withOnFetchData` | `(...fns) => this` | additive append | `Base:758` | correctly additive |
| `withOnInitialize` | `(...fns) => this` | additive append | `Base:763` | correctly additive |
| `withOnPostFetchListData` | `(...fns) => this` | additive append | `Base:768` | correctly additive |
| `clearOnChanges` | `() => this` | resets to `[]` | `Data:82` | resets to empty array, not `undefined` — harmless but inconsistent with the field's optional-undefined default state |
| `clearOnFetchData` | `() => this` | resets to `[]` | `Data:87` | same pattern |
| `clearOnInitialize` | `() => this` | resets to `[]` | `Data:92` | same pattern |
| `clearOnPostFetchListData` | `() => this` | resets to `[]` | `Data:97` | same pattern |
| `executeOnChanges` | `(fieldName) => Promise<void>` | fires all `onChanges` callbacks for a field | `EF:122` (abstract decl `Data:34`) | **fire-and-forget**: iterates with `.forEach`, never `await`s each `onChange(...)` call, and discards the `Promise<EntityForm<T>>` each hook returns even though the type signature implies a functional transform. Both call sites (`resetValue`, `changeValue`) also don't `await` the method itself. Net effect: async `onChanges` hooks race independently and any value they "return" is silently thrown away — only in-place mutation of `this` actually works |

## 2. values (17)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `fields` | `Map<string, EntityField>` | field registry, keyed by (possibly dotted) name | `Base:68` | — |
| `collections` | `Map<string, SubCollectionField>` | sub-collection registry | `Base:70` | — |
| `hasField` | `(name) => boolean` | `fields.has` wrapper | `Base:308` | — |
| `getField` | `(name) => EntityField \| undefined` | `fields.get` wrapper, typed + untyped overload | `Base:312` | — |
| `getCollection` | `(name) => SubCollectionField \| undefined` | `collections.get` wrapper | `Base:318` | — |
| `getValue` | `(name) => Promise<any>` | `getField(name)?.getCurrentValue(renderType)` | `Base:322` | typed + untyped overload |
| `getValues` | `() => Promise<Record<string,any>>` | snapshots current value of **every** field | `Base:333` | **no permission or hidden filtering** — unlike `getSubmitFormData()` (save path), this exposes values for fields the user isn't permitted to see. Read/write asymmetry worth closing in redesign |
| `setValue` | `(name, value) => this` | silently sets `field.value` | `Data:42` | does **not** fire `onChanges` — the "quiet" setter |
| `setValues` | `(cloned: EntityFormBase<T>) => this` | copies `.value` from a donor form field-by-field | `Data:53` | mutates existing `EntityField` instances **in place** rather than replacing map entries; silent (no onChanges) |
| `changeValue` | `(name, value) => this` | sets value **and** fires `executeOnChanges` | `Data:71` | the "loud" counterpart to `setValue` — see lifecycle-hooks notes on what "firing" actually guarantees |
| `resetValue` | `(name, loadOnChanges=true) => this` | resets field to `default` per current renderType | `Data:23` | optionally fires onChanges |
| `isDirty` | `() => boolean` | true if any **non-hidden** field is dirty | `Data:102` | hidden fields are explicitly excluded (`!isTrue(field.hidden) && field.isDirty()`) — a hidden field's genuine change never trips the form-level dirty flag, even though `getSubmitFormData()` (the actual save path) does **not** apply the same hidden-exclusion when deciding what to submit. Two different "did anything change" definitions co-exist |
| `isDirtyField` | `(name) => boolean` | per-field dirty, no hidden filter | `Data:112` | asymmetric vs `isDirty()` above |
| `addFields` | `(props: AddFieldItemProps) => this` | registers fields/collections into a tab+fieldGroup | `Act:146` | dedups by name unless `overwrite:true`; auto-creates tab/fieldGroup on demand |
| `addCollections` | `(props) => this` | alias | `Act:198` | literally `return this.addFields(props)` — no distinct behavior, pure naming sugar |
| `removeField` | `(fieldName) => void` | `fields.delete` | `Act:190` | **not chainable** (void); only removes from `fields` map — the field's entry in its tab's `fieldGroup.fields` list is left dangling (orphaned metadata, silently filtered out downstream since `getField` resolves undefined) |
| `getFields` | `(type?, orderByView?) => EntityField[]` | returns all fields, optional type filter + view-order remap | `EF:495` | sorted by order; contains the dead `instanceof EntityForm` guard (see Cross-Cutting §2) |

## 3. fetch/init (16)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `id` | `string?` | entity id | `Base:45` | presence/absence is the sole discriminant for `getRenderType()` |
| `dataPreloaded` | `boolean?` | "values already bound" flag | `Base:80` | set by `setFetchedValues()`; guards `initialize()` from double-fetching |
| `fetchedEntity` | `T?` | raw last-fetched payload snapshot | `Base:84` | lets callers reach properties not modeled as `EntityField`s |
| `sessionRequired` | `boolean?` | gates `fetchData()` on session presence | `Base:103` | — |
| `overrideFetchData` | `(url, entityForm) => Promise<ResponseData>` `?` | full override of the network GET | `Base:155` | **no fluent setter exists** anywhere in the 6-file scope (asymmetric vs `overrideSubmitData`, which has `withOverrideSubmitData`) — only settable by direct property assignment |
| `getId` | `() => string \| undefined` | accessor | `Base:239` | — |
| `getRenderType` | `() => 'create' \| 'update'` | `getId() ? 'update' : 'create'` | `Base:243` | central branch-point reused by ~15 other methods |
| `isAbleFetch` | `() => boolean` | url and id both non-blank | `Base:250` | — |
| `getFetchUrl` | `() => string` | `${getUrl()}/${id}` | `Base:263` | throws if `!isAbleFetch()` |
| `isSessionRequired` | `() => boolean` | `isTrue(sessionRequired)` | `Base:270` | — |
| `withId` | `(id?) => this` | fluent setter | `Base:234` | flips `getRenderType()` |
| `getFetchedEntity` | `() => T \| undefined` | accessor for raw snapshot | `Base:328` | — |
| `initialize` | `(props) => Promise<EntityFormActionResult>` | clone → conditional fetch → CustomOption/PhoneNumberField field-injection → onInitialize chain → dynamic-field backfill | `EF:162` (abstract decl `Base:193`) | skips fetch entirely if `list:true` or `dataPreloaded`; on any fetch failure returns a **fresh clone** with a single generic Korean error string regardless of underlying cause (expired-token path still collapses to the same message for the caller) |
| `setFetchedValues` | `(entity) => Promise<EntityForm<T>>` | bulk-binds `{current,fetched,default}` per field from a raw payload (dotted-path aware) | `EF:534` | fields **absent** from the payload are explicitly reset to `undefined` — calling this twice with two partial/incremental payloads will blank out fields not present in the second call, not just merge; guards nullish `entity` with a console.error + early return |
| `fetchData` | `(fetchUrl?) => Promise<ResponseData>` | GET, or delegates to `overrideFetchData` | `EF:608` | calls `useSession()` (a React hook) **conditionally**, deep inside a class method — flagged by its own `eslint-disable-next-line react-hooks/rules-of-hooks` comment; architecturally fragile |
| `setFetchedValue` | `(name, value) => this` | sets `field.value.fetched` always, `.current` only if unset | `EF:135` | a **5th distinct value-mutation pathway** alongside `setValue`/`changeValue`/`setFetchedValues`/`resetValue` — see Cross-Cutting §3 |

## 4. save/CRUD (9)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `onSave` | `(entityForm) => Promise<EntityFormActionResult>` `?` | full override of the save network flow | `Base:123` | when set, `internalSave()` never runs |
| `postSave` | `(result) => Promise<void>` `?` | success-only post-save hook | `Base:128` | fires only when `isEmpty(result.errors)` |
| `overrideSubmitData` | `(entityForm, data) => Promise<{data, modifiedFields?, removePrevious?, error?, errors?}>` `?` | payload-shaping override | `Base:138` | invoked at the tail of `getSubmitFormData()` |
| `withPostSave` | `(fn) => this` | fluent setter | `Base:274` | — |
| `withOnSave` | `(fn?) => this` | fluent setter, **replaces** (not additive) | `Base:773` | single-slot override, consistent with it being a full bypass rather than a hook list |
| `withOverrideSubmitData` | `(fn) => this` | fluent setter | `EF:518` | no sibling `withOverrideFetchData` exists (see fetch/init) |
| `internalSave` | `(session?, skipValidation?, forceIncludeExceptOnSave?) => Promise<EntityFormActionResult>` | core POST/PUT flow | `EF:639` | "no changes" short-circuit (`수정된 항목이 없습니다`) runs **before** the `skipValidation` check, so `skipValidation` bypasses field validation only, not the dirty-gate; on error, hand-rolls an error-shape sniffer (Map vs plain-object `fieldError`, string vs object `entityError`) that near-duplicates the standalone `processApiError()` helper in `EntityFormMethod.ts` — that helper is **never called** from here (parallel, un-reused implementation) |
| `save` | `(session?, skipValidation?, forceIncludeExceptOnSave?) => Promise<EntityFormActionResult>` | dispatches to `onSave` override or `internalSave` | `EF:842` | when `onSave` is set, `skipValidation`/`forceIncludeExceptOnSave` are silently dropped — never passed to the user's `onSave` callback |
| `getSubmitFormData` | `(forceIncludeExceptOnSave?) => Promise<SubmitFormData>` | assembles the network payload | `EF:868` | filters by `field.isPermitted(userPermissions)`; ManyToOne fields collapsed to `xxxId` via a `processManyToOneField` closure **rebuilt on every call**; dotted names nested via a local `dataMap`; threads through `overrideSubmitData` last |

## 5. delete (6)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `postDelete` | `(entityForm, idList?) => Promise<void>` `?` | post-delete hook | `Base:132` | fires **unconditionally** (success or failure) — asymmetric vs `postSave`, which is success-only |
| `neverDelete` | `boolean?` | soft-delete-only marker | `Base:168` | — |
| `withPostDelete` | `(fn) => this` | fluent setter | `Base:279` | — |
| `withNeverDelete` | `(v=true) => this` | removes+re-adds an `active` field, installs an onInitialize hook that force-hides `active` when it's currently `true` | `Act:510` | one-way UI gating: the toggle only appears when the record is currently inactive (i.e. to reactivate it), then vanishes again once active |
| `delete` | `() => Promise<EntityFormActionResult>` | refuses on `renderType==='create'`, else delegates to `deleteAll([id])` | `EF:433` | dead `instanceof EntityForm` guard (Cross-Cutting §2) |
| `deleteAll` | `(idList) => Promise<EntityFormActionResult>` | bulk `DELETE {url}` + `BulkDeleteRequest{ids, revisionEntityName?}` | `EF:447` | `if (revisionEntityName)` is dead code — `getRevisionEntityName()`'s fallback chain (`revisionEntityName \|\| menuUrl \|\| name`) is **always truthy** since `name` is a required constructor arg; success path force-clears **all** alert messages including persistent ones (`clearAlertMessages(true)`); same dead `instanceof` guard |

## 6. permission (11)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `manageEntityForm` | `ManageEntityForm` (`{create,update,delete}`) | whole-entity capability flags | `Base:63` | distinct from field-level `requiredPermissions` (on `EntityTab`/`EntityFieldGroup`/`EntityField`, out of this scope) |
| `session` | `Session?` | role/permission carrier | `Base:60` | also feeds fetch (`isSessionRequired`) and title resolution — a single field serving 3 concerns |
| `getSession` | `() => Session \| undefined` | accessor | `Base:627` | — |
| `withSession` | `(session) => this` | fluent setter | `Base:631` | — |
| `withManageEntityForm` | `(m) => this` | replaces whole `{create,update,delete}` object | `Val:121` | — |
| `withCreatable` | `(v=true) => this` | sets `.create` | `Val:126` | — |
| `withUpdatable` | `(v=true) => this` | sets `.update` | `Val:131` | — |
| `withDeletable` | `(v=true) => this` | sets `.delete` | `Val:136` | — |
| `isCreatable` | `() => boolean` | accessor | `Val:141` | — |
| `isUpdatable` | `() => boolean` | accessor | `Val:145` | — |
| `isDeletable` | `() => boolean` | accessor | `Val:149` | — |

## 7. validation (9)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `errors` | `FieldError[]?` | last validation/save error set | `Base:73` | — |
| `fieldValidationStates` | `Map<string,{validated,message?,color?}>` | per-field async-check UI state (e.g. duplicate-check button) | `Base:90` | — |
| `getFieldValidationState` | `(name) => {...} \| undefined` | accessor | `Val:12` | — |
| `setFieldValidationState` | `(name, state) => void` | mutator | `Val:18` | **not chainable** |
| `clearFieldValidationState` | `(name) => void` | mutator | `Val:25` | **not chainable** |
| `withRequired` | `(name, required) => this` | fluent field-level required setter | `Val:29` | — |
| `withErrors` | `(errors) => this` | replaces whole `errors` array | `Val:37` | — |
| `validate` | `(props?: {fieldNames?, session?}) => Promise<FieldError[]>` | runs `field.validate()` per field, optionally scoped | `EF:1008` | `field.validate()` may return either `ValidateResult[]` or a single `ValidateResult` — this dual-shape contract forces an `Array.isArray()` branch here; a field-level API smell reflected up into the form |
| `withCheckDuplicate` | `(name, checkFn) => this` | wires an async duplicate-check to a field | `EF:1053` | silent no-op unless the field is a `CheckButtonValidationField` instance |

## 8. server-errors (3)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `getErrorMap` | `() => Map<string, FieldError[]>` | groups `this.errors` by containing tab | `Val:42` | **known bug**: keys the map by `tab.label` (display text), not `tab.id` — two tabs sharing the same label (e.g. two "기본 정보" tabs, a common default) silently merge their error buckets into one |
| `mergeError` | `(name, errors) => void` | merges/replaces/clears errors for one field name | `Val:92` | **not chainable**; convoluted control flow — loops to find a same-name match, then abandons the loop's partial `newErrors` and instead recomputes via `mergeFieldErrors(this.errors, errors)` over the *entire* original list; passing an empty `errors[]` is overloaded to mean "delete errors for this name" — not obvious from the signature |
| `getLabel` | `(name) => ReactNode` | field label lookup, `''` if not found | `Base:652` | primary in-scope call sites are error-labeling (`internalSave`, `EntityFormMethod.entityErrorToString`); doubles as a general label accessor |

## 9. tabs/groups (16)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `tabs` | `Map<string, EntityTab>` | tab registry | `Base:66` | — |
| `hasTab` | `(id) => boolean` | accessor | `Base:341` | — |
| `getTab` | `(id) => EntityTab \| undefined` | accessor | `Base:345` | — |
| `getViewableTabs` | `(includeHide?, createStepFields?, session?) => Promise<EntityTab[]>` | permission + fieldGroup-visibility filtered, sorted | `Base:349` | 4-way session fallback (`session?.roles ?? session?.authentication?.roles ?? this.session?.roles ?? this.session?.authentication?.roles`) — param `session` wins over `this.session`, a pattern **not** mirrored by `getValues()` (which takes no session param at all) |
| `getTabs` | `() => EntityTab[]` | **all** tabs, sorted, no filtering | `Base:392` | asymmetric vs `getViewableTabs` (no permission/hidden filter) |
| `removeTabs` | `(tabs: (EntityTab\|string)[]) => this` | bulk delete by id/ref | `Base:402` | — |
| `removeTab` | `(tab: EntityTab\|string) => this` | single-tab delete | `Base:414` | near-duplicate of `removeTabs` with one item; could trivially compose |
| `getFieldGroup` | `(tabId, groupId) => EntityFieldGroup \| undefined` | accessor | `Base:420` | — |
| `getViewableFieldGroups` | `(props) => Promise<string[]>` | ids of groups passing `isViewableFieldGroup` | `Base:428` | — |
| `isViewableFieldGroup` | `(props) => Promise<boolean>` | permission gate + at-least-one-visible-field/collection check | `Base:460` | SubCollection viewability only considered when `renderType==='update'`; dead `instanceof EntityForm` guard |
| `getVisibleFields` | `(tabId, groupId, session?, createStepFields?) => Promise<{fieldGroup?, fields?}>` | permission+hidden filtered, sorted | `Base:537` | dead `instanceof EntityForm` guard |
| `getVisibleCollections` | `(tabId, groupId, session?) => Promise<{fieldGroup?, collections?}>` | hidden-filtered sub-collections | `Base:588` | **unlike `getVisibleFields`, does not check `isPermitted()` before the hidden-check** — permission-filtering asymmetry between fields and collections |
| `withFieldGroupConfig` | `(tabId, groupId, config) => this` | merges `{open?}` onto an existing group's config | `Base:641` | — |
| `getTabFields` | `(tabId) => EntityField[]` | flattens all fields under a tab, cloned + re-ordered | `Base:707` | composite order key `groupOrder*1000 + fieldOrder` |
| `withHidden` | `(props: FIELD\|GROUP\|TAB\|legacyString, hidden?) => this` | unified field/group/tab hidden toggler | `EF:349` | GROUP and TAB branches each compute a local `affectedFields` counter that's incremented but **never read, returned, or logged** — dead local in both branches; also retains a deprecated string-based legacy call form alongside the typed union |
| `getViewOrder` | `(tabId, groupId, fieldOrder) => number` | composite order key: `tab.order*10000 + group.order*1000 + fieldOrder` | `Act:359` | **different magnitude scale** than `getListableFieldOrder`'s `1e6`/`1e4` — two independently-invented "flatten hierarchy into a sortable number" schemes coexist in the same class chain |

## 10. wizard/steps (4)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `createStep` | `CreateStep[]?` (`{id,label,order,hidden?,description?,fields[]}`) | multi-step create wizard definition | `Base:62` | — |
| `getCreateStep` | `() => CreateStep[] \| undefined` | returns non-hidden steps only | `Act:545` | does **not** re-sort (assumes `setCreateStep` already sorted); **used by `EF.cloneWithEntityForm`** to populate the clone's `createStep` — meaning every `clone()` call (which happens on nearly every operation: save, initialize, merge) permanently drops any step already marked `hidden`, since the filtered result becomes the new source of truth going forward |
| `setCreateStep` | `(steps?) => void` | sorts by order, assigns | `Act:559` | **not chainable** |
| `withCreateStep` | `(steps?) => this` | fluent wrapper around `setCreateStep` | `Act:566` | duplicate-with-different-contract pair (void vs `this`) for the same operation — mirrors the `setReadOnly`/`withReadonly` split (§ sugar/misc) |

## 11. title (3)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `title` | `{title?: string, field?: string, view?: (form)=>Promise<ReactNode>}?` | title source config | `Base:47` | **`view` is dead**: structurally accepted by the type and by `withTitle()`, but `getTitlePostfix()` (the only reader) never checks `this.title.view` at all — only `.title` and `.field` are handled. Setting a `view` renderer has zero effect on `getTitle()` |
| `withTitle` | `(title?: string \| {...}) => this` | fluent setter, string shorthand or full object | `Base:210` | accepts the inert `view` field with no warning |
| `getTitle` | `(append?, appendPostfix?) => Promise<string>` | builds `${append}${appendPostfix ? ' / '+postfix : ''}` | `Base:284` | **calling `getTitle()` with no arguments always returns `''`** — the real title text only surfaces through the private `getTitlePostfix()` (resolves `.title` → `.field`'s current value → `name` field's current value → `id` → `'신규 입력'`), which is only reachable by passing `{appendPostfix: true}`. A getter named `getTitle` that returns blank by default is a significant surprise for a redesign pass |

## 12. buttons/header (4)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `buttons` | `((form) => Promise<EntityFormButtonType[]>)[]?` | array of async button-list providers | `Base:174` | shape is "array of functions, each returning an array" — resolved/flattened at render time; closest in-scope match to the brief's "degrees-array `[fn]`" quirk description (no literal `degrees` text found anywhere in-repo — flagging this as the best-guess candidate, to be confirmed against the original observation) |
| `headerArea` | `(form) => Promise<ReactNode>` `?` | custom sticky region between header buttons and alert area | `Base:187` | — |
| `withButtons` | `(fn) => this` | appends one more provider fn | `Base:748` | correctly additive (unlike `withAppendAdvancedSearchFields`, see list-track) |
| `withHeaderArea` | `(fn) => this` | fluent setter | `Base:783` | — |

## 13. alerts (6)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `alertMessages` | `AlertMessage[]` (`{key,message,description?,color,persistent?,link?}`) | banner message list | `Base:87` | — |
| `clearAlertMessages` | `(includePersistent=false) => this` | clears non-persistent, or all | `Act:63` | default (`false`) is essentially never exercised internally — every in-scope caller (`internalSave`, `save`, `deleteAll` success paths) passes `true` explicitly |
| `withAlertMessages` | `(messages) => this` | de-dupes by `key`, replaces same-key entries | `Act:79` | — |
| `removeAlertMessage` | `(key) => this` | removes one by key | `Act:94` | — |
| `getAlertMessages` | `() => AlertMessage[]` | defensive-copy accessor | `Act:112` | — |
| `clearAllMessages` | `(includePersistent=false) => this` | wrapper around `clearAlertMessages` | `Act:121` | contains a stale `// TODO: Toast, SweetAlert 메시지 지원 추가 필요` comment — currently 100% equivalent to `clearAlertMessages`, an acknowledged-incomplete abstraction |

## 14. attributes-bag (9)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `attributes` | `Map<string, unknown>?` | free-form per-form key/value bag | `Base:181` | excluded from save payload; view-only customization |
| `withAttributes` | `(attributes?) => this` | replaces the whole Map wholesale | `Base:778` | no merge semantics |
| `getAttributes` | `() => Map<string, unknown>` | defensive-copy accessor | `Base:788` | — |
| `putAttribute` | `(key, value) => this` | lazily inits Map, sets one entry | `Base:793` | — |
| `removeAttribute` | `(key) => this` | deletes one entry | `Base:801` | — |
| `hasAttribute` | `(key) => boolean` | accessor | `Base:808` | — |
| `addAttributeToField` | `(fieldName, key, value) => void` | attaches an attribute to a specific field's own `attributes` map | `Base:812` | **not chainable** — inconsistent with every sibling `with*`/`put*` method in this file returning `this` |
| `removeAttributeToField` | `(fieldName, key) => void` | removes a field-level attribute | `Base:822` | **not chainable** |
| `getFieldAttributes` | `(fieldName) => Map<string, unknown> \| undefined` | accessor | `Base:832` | — |

## 15. client-extensions (14)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `clientExtensions` | `Map<ExtensionPoint, ClientExtensionConfig[]>` | registry of client-side pre/post CRUD hooks | `Base:96` | shallow-cloned on `EF.clone()` — see Cross-Cutting §4 |
| `withClientPreFetchList` | `(handler, options?) => this` | registers a `PRE_FETCH_LIST` hook | `Ext:46` | — |
| `withClientPostFetchList` | `(handler, options?) => this` | registers `POST_FETCH_LIST` | `Ext:53` | — |
| `withClientPreCreate` | `(handler, options?) => this` | registers `PRE_CREATE` | `Ext:61` | — |
| `withClientPostCreate` | `(handler, options?) => this` | registers `POST_CREATE` | `Ext:68` | — |
| `withClientPreRead` | `(handler, options?) => this` | registers `PRE_READ` | `Ext:76` | — |
| `withClientPostRead` | `(handler, options?) => this` | registers `POST_READ` | `Ext:83` | — |
| `withClientPreUpdate` | `(handler, options?) => this` | registers `PRE_UPDATE` | `Ext:91` | — |
| `withClientPostUpdate` | `(handler, options?) => this` | registers `POST_UPDATE` | `Ext:98` | — |
| `withClientPreDelete` | `(handler, options?) => this` | registers `PRE_DELETE` | `Ext:106` | — |
| `withClientPostDelete` | `(handler, options?) => this` | registers `POST_DELETE` | `Ext:113` | 10 registration points total (list ×2, CRUD ×4 pre/post) — **none of them are invoked from `EF.internalSave`/`fetchData`/`deleteAll` themselves.** Execution is orchestrated entirely from outside the model, by `useEntityFormSave.ts` and `useListGridLogic.ts` (React hooks) which call `hasClientExtensions`/`executeClientExtensions` manually. A headless/non-React consumer of `EntityForm.save()`/`.delete()` never gets these hooks fired |
| `executeClientExtensions` | `(point, data, context) => Promise<T>` | runs enabled configs for a point in priority order | `Ext:123` | catches per-handler errors, continues unless `continueOnError===false` |
| `hasClientExtensions` | `(...points) => boolean` | any registered+enabled config for any of the points | `Ext:152` | — |
| `getClientExtensions` | `(point) => ClientExtensionConfig[]` | accessor for one point | `Ext:162` | — |

## 16. data-transfer/excel (5)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `dataTransferConfig` | `DataTransferConfig?` | excel import/export configuration | `Base:162` | — |
| `withDataTransferConfig` | `(props) => this` | builds config, auto-fills export URL/filename, optional explicit field list | `Act:373` | — |
| `getExportableFields` | `() => Promise<DataField[] \| undefined>` | `config.export.fields` if non-empty, else derived from all fields | `Act:429` | — |
| `getImportableFields` | `() => Promise<DataField[] \| undefined>` | intended: `config.import.fields` if non-empty, else derived | `Act:444` | **known copy-paste bug** at line 448: checks `isEmpty(this.dataTransferConfig.export?.fields)` (copied from `getExportableFields`) instead of `.import?.fields`, before falling back to the derive-from-all-fields path; only the final `return` correctly reads `.import?.fields`. If `export.fields` is populated while `import.fields` is empty, this method wrongly skips the fallback and can return an empty/undefined import list |
| `getDataTransferConfig` | `() => Promise<DataTransferConfig \| undefined>` | validates config against the live field set, then returns it | `Act:490` | calls private `getDataFieldsFromFields()` (`Act:459`, itself carrying a dead `instanceof EntityForm` guard) |

## 17. list-track (10)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `appendAdvancedSearchFields` | `ListableFormField<any>[]?` | extra advanced-search-panel fields | `Base:93` | — |
| `excludeListFields` | `string[]?` | field names excluded from `getListFields()` | `Base:99` | never initialized to `[]` anywhere — default is `undefined` |
| `withAppendAdvancedSearchFields` | `(...fields) => this` | **intended** to append | `EF:154` | **bug**: `this.appendAdvancedSearchFields = fields;` — replaces the array wholesale every call despite the "Append" name; last caller wins |
| `withExcludeListFields` | `(...fields) => this` | **intended** to append (with dedup via `Set`) | `Act:99` | **bug, more severe**: entire body is gated on `if (this.excludeListFields)`, which is `undefined` by default with no other initializer anywhere in scope — **the first call always silently no-ops.** Only works if the array was somehow already populated by other means, which doesn't exist in this codebase |
| `useListFields` | `(...names) => this` | marks specific fields "used" for the list view | `Act:202` | — |
| `getListFields` | `() => ListableFormField<any>[]` | computes the ListGrid column set | `Act:220` | falls back to the first Listable field if none are marked `supportList`; throws if there are no Listable fields at all |
| `getFilterableFields` | `() => ListableFormField<any>[]` | computes advanced-search filter fields | `Act:257` | auto-injects a synthetic `.name`/`.user.name` `StringField` alongside filterable ManyToOne relations; dedups afterward; same throw-if-none fallback |
| `getListableFieldOrder` | `(field) => number` | composite order key: `tab.order*1e6 + group.order*1e4 + field.order` | `Act:39` | see `getViewOrder` cross-reference (tabs/groups) — a second, differently-scaled ordering scheme |
| `withListConfig` | `(fieldName, config) => this` | sets a field's `IListConfig` | `Act:130` | only affects `ListableFormField` instances |
| `withFilterable` | `(fieldName, filterable=true) => this` | toggles a field's filterable flag | `Act:502` | only affects `ListableFormField` instances |

## 18. sugar/misc (22)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `version` | `string` | construction timestamp | `Base:42` | re-stamped on every `new EntityForm()`/`clone()`; read by `FieldRenderer.tsx` (`setVersion(entityForm.version)`) purely to force a re-render key — not copied forward by `cloneWithEntityForm` (each clone gets a **fresh** value via its own constructor call) |
| `parentId` | `string?` | parent entity id for ManyToOne/SubCollection contexts | `Base:44` | — |
| `name` | `string` | required identifier | `Base:46` | used as `X-EntityForm-Name` save header, `revisionEntityName` fallback, and (as a field name) title fallback |
| `readonly` | `boolean?` | form-wide readonly flag | `Base:58` | set exclusively via `setReadOnly()` (cascades to all fields+collections); name collides conceptually with field-level `withReadonly(name, ...)` |
| `shouldReload` | `boolean?` | "view layer should reload" flag | `Base:76` | set by `withShouldReload`; read externally (out of scope) |
| `withParentId` | `(parentId?) => this` | fluent setter | `Base:229` | — |
| `withShouldReload` | `(v?) => this` | fluent setter | `Base:636` | — |
| `getHelpText` | `(name, session?) => Promise<ReactNode>` | field help-text accessor | `Base:662` | — |
| `withHelpText` | `(name, helpText) => this` | fluent field-level setter | `Base:672` | — |
| `withTooltip` | `(name, tooltip) => this` | fluent field-level setter | `Base:680` | — |
| `withReadonly` | `(name, readonly) => this` | fluent **field-level** readonly setter | `Base:688` | naming collision with form-level `setReadOnly` (see above) |
| `withOptions` | `(name, options) => this` | fluent select-options setter | `Base:696` | only works on `OptionalField` instances; logs `console.error` and silently no-ops otherwise (chain doesn't break, but no caller-visible signal) |
| `setReadOnly` | `(readonly=true) => void` | cascades readonly to all fields + collections | `Base:837` | **not chainable**; whole-form scope, vs. `withReadonly`'s single-field scope — same "readonly" vocabulary, two different scopes and two different naming conventions (`set` vs `with`) |
| `clone` | `(includeValue?) => EntityForm<T>` | deep-ish clone | `EF:38` (abstract decl `Base:198`) | delegates to `cloneWithEntityForm` |
| `cloneWithEntityForm` | `(entityForm, includeValue?) => EntityForm<T>` | the actual clone workhorse | `EF:43` | see Cross-Cutting §4 for the shallow `clientExtensions` clone and the `createStep` step-loss bug; `errors` only copied `if isTrue(includeValue)` (else cleared) while `alertMessages`/`fieldValidationStates` are **always** copied regardless of `includeValue` — no single rule governs what "includeValue" gates; ends with a defensive `Object.setPrototypeOf(entityForm, EntityForm.prototype)` that is redundant given `entityForm` was already constructed via `new EntityForm(...)` |
| `merge` | `(origin) => this` | **misleadingly named** — one-directional overwrite | `EF:129` | calls `origin.cloneWithEntityForm(this, true)`, i.e. clones **origin's** full state onto `this`, discarding whatever `this` held; not a two-way merge despite the name |
| `withFieldToLayout` | `(layout: 'full'\|'half') => this` | bulk-sets `.withLayout()` on every `FormField` | `EF:1066` | silently skips non-`FormField` entries (e.g. `SubCollectionField`) |
| `withCreatedAtField` | `() => this` | adds `StatusCreatedAtFieldPreset` | `Act:138` | — |
| `withCreatedAndUpdatedAtFields` | `() => this` | adds `StatusCreatedAndUpdatedAtFieldPreset` | `Act:142` | — |
| `withStatusCreatedAndUpdatedAtField` | `() => this` | adds `StatusCreatedAndUpdatedAtFieldPreset` | `Act:535` | **exact duplicate** of `withCreatedAndUpdatedAtFields` above — same preset, different name, both exist simultaneously |
| `withStatusCreatedAtField` | `() => this` | adds `StatusCreatedAtFieldPreset` | `Act:540` | **exact duplicate** of `withCreatedAtField` above |
| `copyEntityFormToInnerFields` | `(props: {prefix, entityForm, tab?, fieldGroup?, excludeFields?, explicitFields?}) => void` | embeds another EntityForm's fields into `this` as nested/prefixed fields | `Data:117` | not chainable; supports a small explicit-field-override mini-DSL (string name or `{name, tab, fieldGroup, label, helpText, hidden, readonly, required, order}`) for renaming/repositioning individual copied fields |

## 19. url/menu (5)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `url` | `string` | backend collection endpoint | `Base:54` | trailing slash stripped only in `getUrl()`, not stored normalized |
| `menuUrl` | `string?` | secondary "search UI" URL for ManyToOne popups | `Base:56` | consumed by field code outside this 6-file scope |
| `withUrl` | `(url) => this` | fluent setter | `Base:205` | — |
| `withMenuUrl` | `(menuUrl?) => this` | fluent setter | `Base:200` | — |
| `getUrl` | `() => string` | `url` with trailing slash stripped | `Base:254` | — |

## 20. revision (4)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `revisionEntityName` | `string?` | entity name used for optimistic-lock/revision-history association | `Base:43` | — |
| `withRevisionEntityName` | `(name) => this` | fluent setter | `Base:738` | — |
| `getRevisionEntityName` | `() => string` | fallback chain `revisionEntityName \|\| menuUrl \|\| name` | `Base:743` | **always truthy** (since `name` is a required constructor arg) — every `if (getRevisionEntityName())` guard elsewhere in the codebase (e.g. `deleteAll`) is dead code |
| `setRevisionEntityNameIfBlank` | `(path) => void` | only-if-unset setter | `Base:847` | not chainable |

## 21. dead/vestigial (3)

| Member | Signature | Semantics | File:Line | Notes |
|---|---|---|---|---|
| `cacheKeyFunc` | `(entityForm) => string` `?` | declared cache-key generator | `Base:105` | **fully inert**: copied forward on every `clone()` (`EF:93`) but never invoked anywhere in the repo, and there is no fluent `withCacheKeyFunc` setter — the only way to populate it is direct property assignment, and nothing ever reads it back out |
| `reload` | `() => Promise<void>` | intended: reload this form's data | `Base:189` | `async reload(): Promise<void> { this.initialize({}); }` — the call is **not awaited** and its returned `{entityForm}` is **discarded**; `initialize()` never mutates `this` (it only builds and returns a clone), so calling `formInstance.reload()` triggers a real fetch as a side effect but has **zero observable effect** on the instance it was called on. A caller expecting "the form's data is now fresh" gets nothing |
| `getAllClientExtensions` | `() => Map<ExtensionPoint, ClientExtensionConfig[]>` | "debugging" introspection accessor | `Ext:169` | shallow-cloned Map (`new Map(this.clientExtensions)` — inner arrays still shared by reference); repo-wide grep found **zero call sites** outside its own declaration |

---

## Cross-Cutting Findings

These don't fit a single table row but recur across many members and matter more to a redesign than any individual line:

1. **The surface is ~45% bigger than the ~130 planning estimate (189 vs ~130).** Plain data properties count as public API surface just as much as methods do, and `EntityFormBase.tsx` alone contributes 101 of the 189 members (40 properties + 61 methods) — more than half the entire chain. Any redesign that only budgets for "the fluent builder methods" will under-scope by roughly a third.

2. **Pervasive dead `instanceof EntityForm` guards.** `EF.getFields`, `EF.delete`, `EF.deleteAll`, `Base.isViewableFieldGroup`, `Base.getVisibleFields`, `Base.getVisibleCollections`, and private `Act.getDataFieldsFromFields` all guard on `this instanceof EntityForm` (throwing or early-returning if false). Since `EntityForm` is the **only** concrete class in the entire chain (`EntityFormBase` is abstract and everything between is also abstract), this check can never be false in practice — most strikingly in `EF.getFields`/`delete`/`deleteAll`, which are defined **directly on `EntityForm` itself**, making the guard tautological at the call site where it's written.

3. **Field-value mutation is fragmented across 5+ entry points with different semantics**, none of which cross-reference each other in their docs: `setValue` (silent), `changeValue` (fires `onChanges`, fire-and-forget), `setFetchedValue` (singular — sets baseline/fetched, conditionally current), `setFetchedValues` (bulk, fires `onFetchData` chain, marks `dataPreloaded`), `resetValue` (resets to default, optionally fires `onChanges`). A redesign should either collapse these into one entry point with mode flags, or make the distinctions explicit and discoverable.

4. **Two shallow-clone bugs share one root cause: `new Map(existingMap)` is a shallow copy.** `EF.cloneWithEntityForm` (`EF:55`, `entityForm.clientExtensions = new Map(this.clientExtensions)`) and `Ext.getAllClientExtensions` (`Ext:169-171`) both copy the outer `Map` but leave the inner `ClientExtensionConfig[]` arrays shared by reference. Since `withClientExtension` (the private registration primitive, `Ext:20`) does `configs.push(config)` on whatever array `.get(point)` returns, registering a new client extension on a **clone** can silently mutate the array still referenced by the original instance (or any sibling clone) — a live cross-instance data leak, not just a cosmetic copy issue.

5. **Naming convention is split `with*` (chainable) vs `set*` (mixed chainability) with no discoverable rule.** Most builder methods use `withX()` and return `this`. But `setValue`/`setValues`/`setFetchedValue(s)` also return `this` despite the "set" prefix, while `setFieldValidationState`, `setCreateStep`, `setRevisionEntityNameIfBlank`, `setReadOnly`, `removeField`, `addAttributeToField`, `removeAttributeToField`, and `mergeError` return `void`. Three pairs exist where both a `set*` (void) and `with*` (chainable) version of the *same* operation coexist: `setCreateStep`/`withCreateStep`, and the conceptually-overlapping `setReadOnly` (whole-form)/`withReadonly` (single-field).

6. **`onSave`/`onInitialize`/`onFetchData` execution order has a hidden double-fire.** `onInitialize` hooks run once inside `initialize()` and then **again** inside `internalSave()` after every successful save (`EF:704-713`) — a save operation silently re-runs the same initialize hooks that ran when the form was first opened, which may not be intended for hooks with side effects assumed to be "once per view session."

7. **Client extensions are registered on the model but executed by the view.** The 10 `withClientPre*/Post*` registration methods plus `executeClientExtensions` all live on `EntityForm`, but nothing in `EF.internalSave`/`fetchData`/`deleteAll` ever calls `executeClientExtensions` — the actual invocation is done externally by `useEntityFormSave.ts` and `useListGridLogic.ts` (React hooks). A non-React or headless consumer of `.save()`/`.delete()` gets **none** of these hooks fired automatically, despite them appearing to be an intrinsic part of the model's CRUD lifecycle.

8. **Two independently-invented composite ordering schemes** exist for the same "flatten tab→group→field hierarchy into one sortable number" problem: `getListableFieldOrder` (`Act:39`, scale `1e6`/`1e4`) and `getViewOrder` (`Act:359`, scale `1e4`/`1e3`). Both are used in different rendering paths (list columns vs. field-group view), with no shared constant or utility.

9. **`getTitle()` returns `''` by default.** Calling `entityForm.getTitle()` with no arguments — the naive, expected call — always yields an empty string; the real resolved title text is gated behind `{appendPostfix: true}` and lives in the *private* `getTitlePostfix()`. Any redesign should treat "get the display title" as needing a single always-correct entry point.

---

## Summary Table

| Concern group | Member count | % of surface |
|---|---:|---:|
| sugar/misc | 22 | 11.6% |
| values | 17 | 9.0% |
| tabs/groups | 16 | 8.5% |
| fetch/init | 16 | 8.5% |
| client-extensions | 14 | 7.4% |
| lifecycle-hooks | 13 | 6.9% |
| permission | 11 | 5.8% |
| list-track | 10 | 5.3% |
| validation | 9 | 4.8% |
| save/CRUD | 9 | 4.8% |
| attributes-bag | 9 | 4.8% |
| delete | 6 | 3.2% |
| alerts | 6 | 3.2% |
| url/menu | 5 | 2.6% |
| data-transfer/excel | 5 | 2.6% |
| wizard/steps | 4 | 2.1% |
| revision | 4 | 2.1% |
| buttons/header | 4 | 2.1% |
| title | 3 | 1.6% |
| server-errors | 3 | 1.6% |
| dead/vestigial | 3 | 1.6% |
| **Total** | **189** | **100%** |
