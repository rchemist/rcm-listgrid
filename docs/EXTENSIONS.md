# Extension Points — Host Integration Patterns

When `@rchemist/listgrid` doesn't fit a host requirement out of the box, **don't reach for a sibling component or fork the page**. The library provides a catalog of extension points for exactly this — *override field rendering, dirty detection, save body, CRUD lifecycle, autosave storage*. This document catalogs them, explains when each fits, and shows two real case studies from production consumers.

> **Anti-pattern**: concluding "listgrid doesn't support X" after a brief grep and rolling your own sibling UI. The integration usually exists — it just lives under a less-obvious name like `withClientPreUpdate` or `FormField.saveValue`.

---

## TL;DR — Extension Catalog

| You want to… | Use | Where it lives |
|--------------|-----|----------------|
| **Render a field with a custom component** (rich text editor, map picker, file uploader UI) | `class XField extends FormField<XField, TValue>` + `renderInstance` override | `components/fields/abstract/FormField.tsx` |
| **Change how dirty is computed** for a field (e.g., HTML `<p><br></p>` empty vs markdown `\n`) | `isDirty()` override in your `FormField` subclass | same |
| **Transform a field value on save** (attach version, hash, normalize) | `FormField.saveValue?: (entityForm, field, renderType?) => Promise<TValue>` | `FormField.tsx:154-158` |
| **Transform a field value on display** (server `version` → form `expectedVersion`) | `FormField.displayFunc?: (entityForm, field, renderType?) => Promise<TValue>` | `EntityField.ts:127-131` |
| **Inject/transform whole PATCH/POST body before send** | `entityForm.withClientPreUpdate(handler)` (or `PreCreate`) | `config/form/EntityFormExtensions.tsx:91-103` |
| **React to a successful save** (toast, refetch, banner state) | `entityForm.withClientPostUpdate(handler)` or `useEntityFormSave({ postSave })` | `EntityFormExtensions.tsx:98-103` + `useEntityFormSave.ts:42` |
| **Catch save errors centrally** (409 LWW conflict → custom UX) | `withClientPostUpdate` handler that inspects errors, **or** wrap `EntityFormButton('save')` with custom error handling | `EntityFormExtensions.tsx` |
| **Add a custom button** to ViewEntityForm (transition / archive / undo) | `new EntityFormButton('id').withLabel().withOnClick(async props => ...)` (id `'save'` / `'delete'` replaces the built-in) | `config/EntityFormButton.tsx` |
| **Hide a button conditionally** (state-machine target already current) | `EntityFormButton.withHidden(async props => boolean)` | same |
| **Override autosave storage scope** (sessionStorage default → localStorage cross-session) | `useEntityFormAutoSave({ autoSaveKey })` accepts a host key; for full storage override wrap the hook or write a thin host adapter | `components/form/hooks/useEntityFormAutoSave.ts:29-42` |
| **Run pre/post lifecycle for list fetch** (inject default filters, decorate page results) | `withClientPreFetchList` / `withClientPostFetchList` | `EntityFormExtensions.tsx:46-58` |
| **Reorder rows *within one list*** (drag-handle priority sort) | `options.onDrag(idList)` + `onDragPriority.support` — up/down handles emit the full reordered id list. **Not** a kanban cross-column DnD (moving a card between status columns to transition it) — listgrid has no multi-column kanban primitive; the host owns that board (dnd-kit / HTML5) and only shares listgrid's *data* via the headless `useListGridLogic`. | `components/list/ui/ViewRows.tsx` |

All extensions are **chainable** on `EntityForm` and support `priority`, `enabled`, `continueOnError` via the second `options` arg.

---

## Decision Tree — Which Extension Point?

```
You hit something listgrid "doesn't support"
  │
  ├─ Field-level (one field renders/saves/dirties wrong)
  │    │
  │    ├─ Rendering wrong (need custom React component)
  │    │     → FormField subclass with `renderInstance` override
  │    │       (case study #1 below)
  │    │
  │    ├─ isDirty wrong (e.g., HTML "empty" vs markdown "empty")
  │    │     → `isDirty()` override
  │    │
  │    ├─ Save body needs a transform (host-required field)
  │    │     → `FormField.saveValue` hook
  │    │
  │    └─ Display from server needs a transform (rename, derive)
  │          → `FormField.displayFunc` hook
  │
  ├─ Whole-form / lifecycle level
  │    │
  │    ├─ Inject a value into PATCH body that isn't a field
  │    │     → `withClientPreUpdate(handler)` and mutate `data` before return
  │    │
  │    ├─ React after save (refetch, toast, banner state)
  │    │     → `withClientPostUpdate` *or* `useEntityFormSave({ postSave })`
  │    │
  │    ├─ Catch 409 / 422 from save
  │    │     → `withClientPostUpdate` reads `data.error` (host-shaped),
  │    │       or wrap the save EntityFormButton with try/catch
  │    │
  │    └─ Drop/replace built-in Save or Delete button
  │          → `new EntityFormButton('save'|'delete')` — `id` matching
  │            built-in replaces it (case study #2)
  │
  └─ Action / button level
       │
       ├─ N transition buttons (state machine)
       │     → `EntityFormButton(...)` × N + `.withHidden(props => current === target)`
       │       (case study #2)
       │
       └─ Custom action button (run-now, restore, ...)
            → `EntityFormButton.withOnClick(async props => entityForm)`
              (return new EntityForm if you mutated it, else return `props.entityForm`)
```

> **Heuristic**: if your override changes *one field*, subclass `FormField`. If it changes *the whole save body or save lifecycle*, use a client extension (`withClientPreUpdate` / `withClientPostUpdate`). If it adds *a new button*, use `EntityFormButton`.

---

## Case Study #1 — Custom Field (host MarkdownField wrapping `@uiw/react-md-editor`)

**Project**: `rchemist/project-manager` Sprint 31f (Wave 6 detail page migration).

### The mismatch

`project-manager` ships a rich markdown editor (`MarkdownEditor.tsx`) with image paste/drag-drop, `@user` mentions, `#issue` mentions, AI prefill, `aria-label` forwarding, and a11y wrapping. The listgrid built-in `'markdown'` `FieldType` routes through the host's `UIAdapter` `MarkdownEditor` slot — which is a `Textarea` stub in this consumer (`RcmUIPrimitives.tsx:904`: `const MarkdownEditor = Textarea`). The built-in `MarkdownField`'s `renderInstance` therefore renders a plain textarea, *losing every host feature*.

### Wrong move (anti-pattern)

> "listgrid `'markdown'` FieldType only gives me a textarea, so I'll keep the host MarkdownEditor as a sibling modal and disable listgrid's body field."

This breaks the listgrid form view, defeats the whole detail-page migration, and forks the save flow.

### Right move — subclass `FormField` with `'custom'` type

```tsx
// frontend/src/rcm-adapters/MarkdownField.tsx
import { FormField, FormFieldProps, FieldRenderParameters } from '@rchemist/listgrid';
import { MarkdownEditor } from '@frontend/components/markdown/MarkdownEditor';
import type { EntityType } from '@project-manager/shared';

export interface MarkdownFieldOpts {
  projectId: string;
  entityType: EntityType;
  entityId?: string;
  enableImageUpload?: boolean;
  enableMention?: boolean;
  preview?: 'edit' | 'live' | 'preview';
  height?: number;
  placeholder?: string;
}

export interface MarkdownFieldProps extends FormFieldProps<string>, MarkdownFieldOpts {}

export class MarkdownField extends FormField<MarkdownField, string> {
  projectId: string;
  entityType: EntityType;
  // ... opts copied to instance ...

  constructor(name: string, order: number, opts: MarkdownFieldOpts) {
    super(name, order, 'custom'); // ★ NOT 'markdown' — that routes to UIAdapter stub
    this.projectId = opts.projectId;
    this.entityType = opts.entityType;
    // ...
  }

  protected renderInstance(
    params: FieldRenderParameters<Record<string, unknown>, string>,
  ): Promise<React.ReactNode | null> {
    return (async () => {
      const value = await this.getDisplayValue(
        params.entityForm,
        params.entityForm.getRenderType(),
      );
      const ariaLabel = typeof this.getLabel() === 'string' ? this.getLabel() : this.getName();
      const readonly = params.readonly === true;
      return (
        <MarkdownEditor
          value={(value as string) ?? ''}
          onChange={(next) => params.onChange(next, false)} // propagation=false: per-keystroke
          projectId={this.projectId}
          entityType={this.entityType}
          entityId={this.entityId}
          ariaLabel={ariaLabel as string}
          enableImageUpload={readonly ? false : this.enableImageUpload}
          preview={readonly ? 'preview' : this.preview}
          // ...
        />
      );
    })();
  }

  protected createInstance(name: string, order: number): MarkdownField {
    return new MarkdownField(name, order, /* opts */);
  }

  static create(props: MarkdownFieldProps): MarkdownField {
    return new MarkdownField(props.name, props.order, /* opts */).copyFields(props);
  }
}
```

### Key decisions

1. **`extends FormField<TSelf, TValue>`, not `extends MarkdownField` (the built-in)** — the built-in's `renderInstance` is a one-liner that renders the UIAdapter stub. Nothing to inherit. Subclass the abstract directly.
2. **`FieldType = 'custom'`, not `'markdown'`** — the latter routes through the UIAdapter's `MarkdownEditor` slot (a textarea in this host). `'custom'` is the host-defined extension type — the renderer just calls your `renderInstance`.
3. **Host-required props (`projectId`, `entityType`) plumb via constructor opts**, not via EntityForm value or React context — they're page-scoped, not entity-scoped. Same pattern as built-in `TextareaField`'s `rows` / `limit`.
4. **`getInputRendererParameters` helper is internal** — inline its essence (`getDisplayValue` + `getName` + `getLabel`) in your `renderInstance`.
5. **Name collisions are solved by import path**: host `MarkdownField` lives at `@frontend/rcm-adapters`, library `MarkdownField` lives at `@rchemist/listgrid`. Consumers import explicitly; IDE auto-import is the only trap (consider aliasing if it bites).

### Consumer

```tsx
MarkdownField.create({
  name: 'body',
  order: 10,
  projectId,
  entityType: 'issue',
  entityId: issueId,
  height: 320,
  placeholder: '본문 (이미지 paste · @user · #issue 멘션)',
})
```

The rest of the EntityForm (fetch, save, dirty tracking, AutoSave, validation, view/edit toggle) works unchanged — the subclass plugs straight into the lifecycle.

---

## Case Study #2 — Save Body Augmentation + 409 Conflict UX (LWW pattern)

**Project**: `rchemist/project-manager` Sprint 31f W.3.D (issues detail page).

### The mismatch

The backend's `IssueUpdateSchema` (Zod) requires `expectedVersion: z.number().int().min(0)` (Last-Write-Wins optimistic concurrency). The listgrid auto-save sends only `EntityForm` field values in the PATCH body — `expectedVersion` is computed from the fetched `version` and isn't a user-facing field, so it never makes it into the body. The backend returns **400** ("missing expectedVersion") before ever reaching the version check, so the host's existing `LWWBanner` (which trigger on 409 CONFLICT) never sees the trigger.

### Wrong move (anti-pattern, observed mid-sprint)

> "ViewEntityFormWrapper auto-PATCH doesn't carry expectedVersion, integration is too complex — let's make the page view-only and drop the LWWBanner."

That deletes UX behavior to dodge a 50-line integration. (And another wave's worth of pages need the same integration.)

### Right move — `withClientPreUpdate` + `withClientPostUpdate`

**(a) Attach `expectedVersion` to every PATCH body**:

```tsx
import { ExtensionPoint } from '@rchemist/listgrid';

const entityForm = new EntityForm('IssueEntityForm', url)
  .addFields({ items: [/* title, body, priority, severity */] })
  .withClientPreUpdate(async (data, context) => {
    // data = the request payload listgrid is about to PATCH
    const version = await context.entityForm.getValue('version'); // fetched server version
    return { ...data, expectedVersion: version };
  })
  .clone(true);
```

Alternatively, if `version` is a hidden field on the EntityForm, use `FormField.saveValue` on a renamed/mirrored field:

```tsx
NumberField.create({ name: 'expectedVersion', order: 999, hidden: true, readonly: true })
  // displayFunc populates from fetched `version`
  .withDisplayFunc(async (entityForm) => (await entityForm.getValue('version')) as number)
  // saveValue passes through (default)
```

**(b) Catch 409 and trigger the host LWWBanner**:

```tsx
.withClientPostUpdate(async (data, context) => {
  // listgrid surfaces errors via data.error / data.errors depending on host shape;
  // in this consumer the convention is: thrown errors propagate, success returns the DTO.
  // Either let the error bubble to useEntityFormSave's setErrors() and read it from there,
  // or register a host-level error handler:
  if (data?.statusCode === 409) {
    hostLWWBannerStore.trigger({
      onShowLatest: () => refetchAndDismiss(context.entityForm),
      onIgnore: () => forceSaveWithFreshVersion(context.entityForm),
      onClose: () => hostLWWBannerStore.dismiss(),
    });
  }
  return data;
})
```

If your host already exposes `useLWWBanner(error)` over a mutation, the cleanest wiring is to **let listgrid's `useEntityFormSave` `setErrors` populate the host's error store**, and have the LWWBanner observe that store — no manual `postUpdate` plumbing needed.

### Key decisions

1. **`withClientPreUpdate` is the canonical place to attach host-required fields not modeled as form fields**. Don't fork the save flow.
2. **For 409 / domain-specific error UX**, prefer letting the standard error path populate a host error store + observe it from the banner — extension hooks are for *transform / side effect*, not for *replacing the error pipeline*.
3. **`displayFunc` mirrors server fields into form fields** — the inverse of `saveValue`. Pair them when the wire shape and form shape diverge.

---

## When *not* to extend

These genuinely belong to the host, not listgrid:

- **Cross-session draft persistence** (the host's `useFormDraft` localStorage banner) when its semantics differ from listgrid's per-tab `useEntityFormAutoSave` (sessionStorage). Run them side by side: listgrid handles refresh-recovery, host handles cross-session — they don't conflict.
- **Page-level toast/notification UX with undo actions** (delete + transition undo). Use host `useToast()` and capture it into your `EntityFormButton.withOnClick` closure. Listgrid's `showToast` is intentionally minimal.
- **External entity panels** (linked issues, AI analysis, comments, agent sessions). These are pure host React, rendered as siblings around `ViewEntityFormWrapper`.
- **Multi-column kanban boards** (drag a card between status columns to transition it). `options.onDrag` is a *within-list* row-reorder hook, **not** cross-column DnD — there is no listgrid kanban primitive. Build the board with the host's own dnd-kit/HTML5 DnD, and feed it listgrid's *data* by consuming the headless `useListGridLogic` (shared search/filter/fetch/selection state) instead of a parallel fetch. This keeps one data source of truth while the board rendering stays host-owned.

The line: if it modifies the EntityForm's lifecycle, use an extension. If it lives *next to* the form, render it as a sibling and pass the entity via the host's data hooks.

---

## Checklist Before You Sideline a Listgrid Feature

Before concluding "listgrid doesn't support X":

- [ ] Did I check `FormField` overridable methods (`renderInstance`, `isDirty`, `displayFunc`, `saveValue`)?
- [ ] Did I look at `withClientPreUpdate` / `withClientPostUpdate` (and the PRE/POST variants for CREATE/READ/DELETE/FETCH_LIST)?
- [ ] Did I look at `EntityFormButton` for action-level overrides (including replacing built-in `'save'` / `'delete'`)?
- [ ] Did I look at `useEntityFormSave({ postSave })` for one-shot save-result hooks?
- [ ] If it's about a *field's* behavior, did I try a `FormField` subclass with `'custom'` type?
- [ ] Did I read at least one case study above for the *shape* of the integration before concluding it's impossible?

If all six are checked and the integration still doesn't fit, **then** consider a sibling component or a host-side workaround — and please open an issue / PR back to this repo so the next consumer doesn't repeat the discovery.

---

## See also

- [`README.md`](../README.md) — Quick start and architecture overview
- [`docs/PRIMITIVES.md`](./PRIMITIVES.md) — Visual primitive catalog (CSS class + `data-*` variants)
- [`docs/getting-started.md`](./getting-started.md) — Provider contract and adoption traps
- [`docs/MIGRATION.md`](./MIGRATION.md) — v0.2.x → v0.3.x migration notes
- [`src/listgrid/extensions/EntityFormExtension.types.ts`](../src/listgrid/extensions/EntityFormExtension.types.ts) — Extension type definitions
- [`src/listgrid/config/form/EntityFormExtensions.tsx`](../src/listgrid/config/form/EntityFormExtensions.tsx) — `withClient*` method implementations
- [`src/listgrid/components/fields/abstract/FormField.tsx`](../src/listgrid/components/fields/abstract/FormField.tsx) — `FormField` abstract + override hooks
- [`src/listgrid/config/EntityFormButton.tsx`](../src/listgrid/config/EntityFormButton.tsx) — `EntityFormButton` API
