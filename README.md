# @rchemist/listgrid

> Framework-free React CRUD UI engine. Wires a list/form renderer to any HTTP entity backend via a small set of provider contracts. No Tailwind required — ships its own primitive-based design system with CSS custom-property theming and container-query responsive layouts.

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)

---

## Why

If you've ever built a CRUD admin UI, you know the pattern:

- **List view**: paginated table + search + filters + sort + column picker + bulk actions
- **Form view**: field renderer + validation + revision history + file upload + inline sub-collections

Each app reimplements this with its own UI kit + backend conventions. `@rchemist/listgrid` extracts it into a reusable engine:

- **You provide**: entity metadata, field definitions, HTTP fetch
- **It renders**: full list/form UI, deeply customizable via CSS custom properties + per-instance `classNames` slots + UI primitive replacement

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

**Required**: `react >= 18`, `react-dom >= 18`, `@tabler/icons-react`, `@headlessui/react`

**Optional** (install only if you use the relevant feature):

| Feature | Peer |
|---|---|
| Next.js app-router adapter (`@rchemist/listgrid/next`) | `next`, `nuqs` |
| Alternative icon set | `@iconify/react` |
| Rich select fields | `react-select` |
| Drag-sort rows | `react-sortablejs`, `sortablejs` |
| QR code rendering | `qrcode.react` |
| Kakao Map fields | `react-kakao-maps-sdk` |
| Korean postcode lookup | `react-daum-postcode` |
| Excel export (styled) | `xlsx-js-style`, `file-saver` |
| Confirmation dialogs | `sweetalert2`, `sweetalert2-react-content` |

---

## Quick start

### 1. Wrap your app with the providers

```tsx
import {
 AuthProvider,
 UIProvider,
 configureApiClient,
 configureMessages,
 configureRuntime,
} from '@rchemist/listgrid';
import { RouterProvider, UrlStateProvider } from '@rchemist/listgrid/next'; // Next adapter

// One-time config at module load
configureRuntime({
 isDevelopment: process.env.NODE_ENV === 'development',
 cryptKey: 'your-client-side-crypto-salt',
});

configureApiClient({
 callExternalHttpRequest: (options) => fetch(options.url, options).then(r => r.json()),
 getExternalApiData: (url) => fetch(url).then(r => r.json()),
 getExternalApiDataWithError: (url) => fetch(url).then(async r => {
 if (!r.ok) throw await r.json();
 return r.json();
 }),
});

configureMessages({
 showAlert: ({ title, text }) => alert(`${title}\n${text}`),
 showConfirm: async ({ text }) => confirm(text),
 showToast: ({ text }) => console.log(text),
 showError: (err) => console.error(err),
});

function Root({ children }) {
 return (
 <AuthProvider session={currentSession}>
 <UIProvider components={/* map of UI primitives */}>
 <RouterProvider value={/* Next router hooks */}>
 <UrlStateProvider value={/* nuqs hooks */}>
 {children}
 </UrlStateProvider>
 </RouterProvider>
 </UIProvider>
 </AuthProvider>
 );
}
```

### 2. Define an entity

```tsx
import { EntityForm, StringField, NumberField, BooleanField } from '@rchemist/listgrid';

const userForm = new EntityForm('user', '/api/users').addFields({
 items: [
 new StringField('name', 1).withRequired(true),
 new StringField('email', 2).withRequired(true),
 new NumberField('age', 3),
 new BooleanField('active', 4),
 ],
});
```

> Fields are constructed with `(name, order)`. `addFields` expects `{ items: [...] }` (an object, not a bare array) — you can also pass `tab` / `fieldGroup` / `overwrite` options in the same call.

### 3. Render the list / form

```tsx
import { ViewListGrid, ViewEntityForm, ListGrid } from '@rchemist/listgrid';

function UserListPage() {
 return <ViewListGrid listGrid={new ListGrid(userForm)} />;
}

function UserDetailPage({ id }) {
 return <ViewEntityForm entityForm={userForm.clone().withId(id)} />;
}
```

That's it. The library handles search/filter/pagination/sort/row-actions/column-selection/advanced-search/revision-history/inline-subcollections/etc.

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

### Per-instance classNames slot

```tsx
<ViewListGrid
 classNames={{
 table: { container: 'my-custom-table-scroll' },
 header: { buttonGroup: 'my-button-row' },
 }}
/>
```

### Full primitive reference

See [`docs/PRIMITIVES.md`](./docs/PRIMITIVES.md) for the catalog of primitive classes + their `data-*` variants. Every visual element (button, badge, icon, input, notice, tab, skeleton, etc.) uses `class="rcm-{name}" data-variant="..." data-size="..." data-color="..."` so you can restyle via standard CSS without fighting specificity.

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

Auto-generated TypeDoc API reference: [`docs/api/`](./docs/api/README.md) (regenerate with `npm run docs`).

---

## Roadmap & Vision

### Next milestones (post-v0.2.0)

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

See [`docs/ROADMAP.md`](./docs/ROADMAP.md) for planned work.

---

## Status

**`v0.2.0` — first public minor.** The surface is stable enough for external adoption. Opt-in generics (`EntityForm<T>`, `FormField<TSelf, TValue, TForm>`, `FieldRenderParameters<T, TValue>`, `parse<T>`) give per-entity key narrowing where you use them.

**New to the library?** Start with [`docs/getting-started.md`](./docs/getting-started.md) — it walks through each provider contract and the most common adoption traps.

**Migrating?** See [`CHANGELOG.md`](./CHANGELOG.md) for the release notes and [`docs/MIGRATION.md`](./docs/MIGRATION.md) for a step-by-step migration guide with before/after code samples.

---

## Documents

| Document | Purpose |
|---|---|
| [`docs/getting-started.md`](./docs/getting-started.md) | Step-by-step onboarding — each provider contract, common adoption traps |
| [`docs/MIGRATION.md`](./docs/MIGRATION.md) | v0.2.0 breaking changes with before/after code |
| [`docs/PRIMITIVES.md`](./docs/PRIMITIVES.md) | Design-system primitive catalog (`rcm-*` classes + `data-*` variants) |
| [`docs/ROADMAP.md`](./docs/ROADMAP.md) | Planned work |
| [`CHANGELOG.md`](./CHANGELOG.md) | Release notes per version |
| [`docs/api/`](./docs/api/README.md) | Auto-generated TypeDoc API reference |

### API reference

`npm run docs` regenerates [`docs/api/`](./docs/api/) via TypeDoc. Run after any public API change; commit the regenerated output alongside.

---

## Contributing

Confirm your change fits the current [Roadmap](#roadmap--vision) — or open an issue first.

### Quality gates (all must pass)

```bash
npm install --legacy-peer-deps
npm run type-check # tsc --noEmit; all 5 strict options on
npm test # vitest; 884+ tests
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
