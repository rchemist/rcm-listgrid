# Migration guide

This document has two parts. [**§ v0.2.x → v0.3.x**](#v02x--v03x) covers the breaking changes
between the `0.2.x` and current `0.3.x` line. [**§ v0.2.0 — summary**](#v020--summary) below it
walks you from any `0.1.0-alpha.x` release to `v0.2.0`. Both expand the entries in
[`CHANGELOG.md`](../CHANGELOG.md) into before/after code samples and diagnostic messages so you
can grep for TypeScript errors and find the relevant fix directly.

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
