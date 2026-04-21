# Migration guide

This document walks you from any `0.1.0-alpha.x` release of `@rchemist/listgrid` to **`v0.2.0`**. It expands the entries in [`CHANGELOG.md`](../CHANGELOG.md) into before/after code samples and diagnostic messages so you can grep for TypeScript errors and find the relevant fix directly.

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
