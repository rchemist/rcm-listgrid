# @rchemist/listgrid

> Framework-free React CRUD UI engine. Wires a list/form renderer to any HTTP entity backend via a small set of provider contracts. No Tailwind required — ships its own primitive-based design system with CSS custom-property theming and container-query responsive layouts.

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)

---

## Why

If you've ever built a CRUD admin UI, you know the pattern:

- **List view**: 0-based pagination, multi-field quick/unified search, typed filters, sort,
  instant column picker, selection, row numbers, inline fetch errors, and optional popup actions
- **Form view**: field renderer + validation + revision history + file upload + inline sub-collections

Each app reimplements this with its own UI kit + backend conventions. `@rchemist/listgrid` extracts it into a reusable engine:

- **You provide**: entity metadata, field definitions, HTTP fetch
- **It renders**: full list/form UI with a stock stylesheet, CSS custom properties and `data-*`
  hooks for theming, plus app-wide UI primitive replacement through `UIProvider`

---

## Install

```bash
npm install @rchemist/listgrid
```

Then import the stylesheet once at your app root:

```ts
import '@rchemist/listgrid/styles.css';
```

### Peer dependencies

The main entry (`@rchemist/listgrid`) only pulls the **required** peers below — install
these and the package builds. Heavier, feature-specific peers are isolated behind
**opt-in subpaths**: a consumer that imports only the main entry never has to install
them, so `next build` no longer fails on uninstalled optional peers.

**Required**: `react >= 18` and `react-dom >= 18`. `next`, `react-daum-postcode`,
`xlsx-js-style`, and `file-saver` are optional peers used only by their matching features/subpaths.

**Opt-in subpaths** (install the peer only if you import that subpath):

| Import from | Provides | Required peer |
|---|---|---|
| `@rchemist/listgrid/next` | Next.js app-router adapter | `next >= 14` |
| `@rchemist/listgrid/excel` | Excel export/import + `registerExcelDataTransfer()` | `xlsx-js-style`, `file-saver` |

---

## Quick start

```tsx
import '@rchemist/listgrid/styles.css';
import { UIProvider, ViewListGrid, configureLabels } from '@rchemist/listgrid';
import { EntityForm, StringField, BooleanField, type BackendAdapter } from '@rchemist/listgrid/schema';
import { createListStore } from '@rchemist/listgrid/state';
import { defaultUIComponents } from '@rchemist/listgrid/ui-default';

const userForm = new EntityForm('UserEntityForm', '/api/users').addFields({
  items: [
    new StringField('name', 10).withLabel('이름').withList().withFilter(),
    new StringField('email', 20).withLabel('이메일').withList().withFilter(),
    new BooleanField('active', 30).withLabel('사용').withList().withFilter(),
  ],
});

const adapter: BackendAdapter = /* host HTTP adapter */;
const store = createListStore({ url: userForm.url, adapter, entityForm: userForm });

configureLabels({ searchError: '검색 요청을 처리하지 못했습니다.' });

export function UserList() {
  return (
    <UIProvider components={defaultUIComponents}>
      <ViewListGrid
        entityForm={userForm}
        store={store}
        selection={{ enabled: true, onConfirm: (ids) => console.log(ids) }}
        showRowNumbers
        columnSettings
        openInNewWindow={{
          enabled: true,
          getUrl: (row) => `/users/${String(row.id)}?popup=true`,
          showFilter: (row) => row.active !== false,
        }}
        toolbar={({ checkedIds }) => <span>{checkedIds.length} selected</span>}
      />
    </UIProvider>
  );
}
```

`withList()` opts a field into the table; `withFilter()` opts it into advanced/header filtering.
All filterable `text` list fields become quick-search fields (first main, remaining OR). Two or
more also enable the advanced panel's unified OR mode. Search failures render a dismissible
inline banner and clear on the next successful fetch. The stock stylesheet owns the searchbar,
popover, filter panel, table, popup button, and pagination layout.

---

## Theming

### CSS custom properties (recommended for brand)

Override tokens in your own stylesheet loaded **after** `@rchemist/listgrid/styles.css`:

```css
@import "@rchemist/listgrid/styles.css";

:root {
 --rcm-color-primary: #7c3aed; /* purple brand */
 --rcm-color-primary-hover: #6d28d9;
 --rcm-font-family: "Pretendard", sans-serif;
 --rcm-radius-md: 0.5rem; /* softer corners */
}
```

See [`tokens.css`](./src/listgrid/styles/tokens.css) for the full list (~50 tokens).

### Dark mode

Two activation paths — no code needed:

```html
<!-- Automatic: respects OS preference -->
<html>

<!-- Explicit: force dark regardless of system -->
<html data-theme="dark">

<!-- Explicit: force light, ignoring system dark -->
<html data-theme="light">
```

Individual injected UI primitives accept `className` where their contract declares it. For
list-level layout, override the stable `rcm-listgrid-*`, `rcm-quick-search-*`,
`rcm-column-settings-*`, and `rcm-adv-search-*` classes after the stock stylesheet.

### Full primitive reference

See [`docs/PRIMITIVES.md`](./docs/PRIMITIVES.md) for the catalog of primitive classes + their `data-*` variants. Every visual element (button, badge, icon, input, notice, tab, skeleton, etc.) uses `class="rcm-{name}" data-variant="..." data-size="..." data-color="..."` so you can restyle via standard CSS without fighting specificity.

## Extending listgrid for host requirements

When listgrid's defaults don't fit a host requirement (custom field rendering, server-required save body fields, 409 conflict UX, dirty detection quirks, autosave storage scope), reach for the **extension points** before forking the page or building a sibling. See [`docs/EXTENSIONS.md`](./docs/EXTENSIONS.md) for the catalog (`FormField` subclass · `saveValue` / `displayFunc` / `isDirty` · `withClientPreUpdate` / `withClientPostUpdate` · `EntityFormButton` · autosave key scoping) plus two real case studies (a host MarkdownField wrapping `@uiw/react-md-editor`, and LWW optimistic-concurrency save augmentation).

---

## Architecture

```
┌───────────────────────────────────────┐
│ Your App │
│ │
│ providers: Auth, UI, Router, … │
│ routes: /users, /users/:id │
│ │
│ ┌───────────────────────────────┐ │
│ │ <ViewListGrid /> <ViewEntityForm />
│ │ │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ @rchemist/listgrid │ │ │
│ │ │ – field renderer │ │ │
│ │ │ – search/filter/page │ │ │
│ │ │ – revision / subcol │ │ │
│ │ │ – styles.css (5 layers)│ │ │
│ │ └─────────────────────────┘ │ │
│ └───────────────────────────────┘ │
│ ↓ fetch via ApiClient │
│ │
└───────────────────────────────────────┘
 ↓
 Your RCM-framework backend
 (or any REST endpoint)
```

**CSS layers** (load order):
1. `tokens.css` — CSS custom properties
2. `primitives.css` — base primitive rules with `data-*` variants
3. `layouts.css` — structural composite (flex/grid)
4. `components.css` — component-specific chrome
5. `base.css` — global reset + utility helpers

Hosts override by loading their own CSS **after** step 5.

**Provider contracts** (decouple library from framework choices):

| Provider | Purpose |
|---|---|
| `AuthProvider` / `useSession` | user identity + role checks |
| `UIProvider` | swap UI primitives (Table, Tooltip, Select, etc.) for your UI kit |
| `RouterProvider` | router hooks (push/replace/usePathname/etc.) — thin adapter |
| `UrlStateProvider` | query-string state ↔ form sync (nuqs-compatible) |
| `configureApiClient` | HTTP client injection |
| `configureMessages` | toast/alert/confirm dialogs |
| `configureRuntime` | feature flags, crypto keys, dev-mode toggles |

---

## Browser support

Requires a browser with container queries and `color-mix` — **2023+**:

- Chrome / Edge 111+
- Firefox 113+
- Safari 16.2+

API reference: generate locally with `npm run docs` (TypeDoc output to `docs/api/`, not committed).

---

## Roadmap & Vision

### Next milestones

- **`UIProvider` reference adapter** — first-party adapter wiring the primitive contracts (Button, Modal, Table, Tooltip, Select, …) to a mainstream headless kit (HeadlessUI + Tailwind). Unblocks `examples/minimal`.
- **`examples/minimal`** — a copy-paste-runnable Next.js + `@rchemist/listgrid` demo. Validates the quick-start in this README end-to-end.
- **Playwright visual regression suite** — lock down primitive rendering + dark-mode + container-query layouts.

### v1.0 stabilization criteria

- Zero `@deprecated` / `@experimental` markers on the public surface.
- At least one external project running `@rchemist/listgrid` in production.
- Browser floor extended back to 2023+ retained; bundle size budget set; coverage 40% (current ~17%).
- Public API contract frozen under semver — breaking changes only in subsequent major.

### Long-term vision

- `@rchemist/listgrid` as a **reference engine for framework-free CRUD UI** — reusable across React ecosystems without dragging in Next.js, Tailwind, or any specific UI kit.
- **Backend adapters beyond RCM-framework** — a thin layer over the existing `ApiClient` contract for generic REST, GraphQL, tRPC, and Python/Django conventions.
- **Design system extraction** — `tokens.css` + `primitives.css` + `layouts.css` published as a standalone package (`@rchemist/primitives` or similar) so non-listgrid projects can adopt the same visual vocabulary.

### Non-goals (explicit scope exclusions)

- **Real-time sync / WebSockets** — use your own store on top.
- **Optimistic UI / mutation queue** — handled by the host's data layer (React Query / SWR / TanStack).
- **Offline-first / service worker caching** — out of scope.
- **Vue / Svelte / Angular ports** — React-only by design.
- **Visual form builder / drag-drop schema editor** — the engine consumes declarative entity metadata; schema authoring is a host concern.

Detailed product/architecture planning lives in [`documents/`](./documents/README.md) (PRD, ADRs, roadmap).

---

## Status

**`v0.5.x` — current release line (latest: see CHANGELOG.md).** The surface is stable enough for external adoption. Opt-in generics (`EntityForm<T>`, `FormField<TSelf, TValue, TForm>`, `FieldRenderParameters<T, TValue>`, `parse<T>`) give per-entity key narrowing where you use them.

**New to the library?** Start with [`docs/getting-started.md`](./docs/getting-started.md) — it walks through each provider contract and the most common adoption traps.

**Migrating?** See [`CHANGELOG.md`](./CHANGELOG.md) for the release notes and [`docs/MIGRATION.md`](./docs/MIGRATION.md) for a step-by-step migration guide with before/after code samples.

---

## Documents

| Document | Purpose |
|---|---|
| [`docs/getting-started.md`](./docs/getting-started.md) | Step-by-step onboarding — each provider contract, common adoption traps |
| [`docs/MIGRATION.md`](./docs/MIGRATION.md) | Breaking-change guides (v0.2.x → v0.3.x and earlier) with before/after code |
| [`docs/PRIMITIVES.md`](./docs/PRIMITIVES.md) | Design-system primitive catalog (`rcm-*` classes + `data-*` variants) |
| [`CHANGELOG.md`](./CHANGELOG.md) | Release notes per version |
| [`docs/api/`](./docs/api/) | Auto-generated TypeDoc API reference — generated locally via `npm run docs` (not committed) |

### API reference

`npm run docs` generates the TypeDoc reference into `docs/api/` (git-ignored). Generate after public API changes when you need to browse the surface.

---

## Contributing

Confirm your change fits the current [Roadmap](#roadmap--vision) — or open an issue first.

### Quality gates (all must pass)

```bash
npm install --legacy-peer-deps
npm run type-check # tsc --noEmit; all 5 strict options on
npm test # vitest; 930 tests
npm run lint # ESLint flat config; zero errors
npm run format:check # Prettier; zero diff
npm run build # tsc + CSS copy → dist/
```

CI runs all five on every PR. Local pre-commit should match.

### Version policy

- **alpha line closed.** the alpha line are historical.
- **semver from v0.2.0 onward.** Patch for fixes, minor for additive features, major for breaking surface changes.
- **Breaking changes land only in a major bump** and ship with a migration entry in [`docs/MIGRATION.md`](./docs/MIGRATION.md).
- `@deprecated` APIs are retained for at least one minor before removal in the next major.

---

## License

Apache-2.0 — see [`LICENSE`](./LICENSE).
