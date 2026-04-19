# @rcm/listgrid

> Framework-free React CRUD UI engine. Wires a list/form renderer to any HTTP entity backend via a small set of provider contracts. No Tailwind required — ships its own primitive-based design system with CSS custom-property theming and container-query responsive layouts.

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)

---

## Why

If you've ever built a CRUD admin UI, you know the pattern:

- **List view**: paginated table + search + filters + sort + column picker + bulk actions
- **Form view**: field renderer + validation + revision history + file upload + inline sub-collections

Each app reimplements this with its own UI kit + backend conventions. `@rcm/listgrid` extracts it into a reusable engine:

- **You provide**: entity metadata, field definitions, HTTP fetch
- **It renders**: full list/form UI, deeply customizable via CSS custom properties + per-instance `classNames` slots + UI primitive replacement

---

## Install

> **Note**: not yet on npm. Until the first npm publish, install via the GitHub release repo:
>
> ```jsonc
> // package.json
> {
>   "dependencies": {
>     "@rcm/listgrid": "github:rchemist/rchemist-rcm-listgrid-release#v0.2.0"
>   }
> }
> ```
>
> Once published, this becomes `npm install @rcm/listgrid`.

Then import the stylesheet once at your app root:

```ts
import '@rcm/listgrid/styles.css';
```

### Peer dependencies

**Required**: `react >= 18`, `react-dom >= 18`, `@tabler/icons-react`, `@headlessui/react`

**Optional** (install only if you use the relevant feature):

| Feature | Peer |
|---|---|
| Next.js app-router adapter (`@rcm/listgrid/next`) | `next`, `nuqs` |
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
} from '@rcm/listgrid';
import { RouterProvider, UrlStateProvider } from '@rcm/listgrid/next'; // Next adapter

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
import { EntityForm, StringField, NumberField, BooleanField } from '@rcm/listgrid';

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
import { ViewListGrid, ViewEntityForm, ListGrid } from '@rcm/listgrid';

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

Override tokens in your own stylesheet loaded **after** `@rcm/listgrid/styles.css`:

```css
@import "@rcm/listgrid/styles.css";

:root {
  --rcm-color-primary: #7c3aed;        /* purple brand */
  --rcm-color-primary-hover: #6d28d9;
  --rcm-font-family: "Pretendard", sans-serif;
  --rcm-radius-md: 0.5rem;              /* softer corners */
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
│ Your App                              │
│                                       │
│   providers: Auth, UI, Router, …      │
│   routes:    /users, /users/:id       │
│                                       │
│   ┌───────────────────────────────┐   │
│   │  <ViewListGrid /> <ViewEntityForm />
│   │                               │   │
│   │  ┌─────────────────────────┐  │   │
│   │  │ @rcm/listgrid           │  │   │
│   │  │  – field renderer       │  │   │
│   │  │  – search/filter/page   │  │   │
│   │  │  – revision / subcol    │  │   │
│   │  │  – styles.css (5 layers)│  │   │
│   │  └─────────────────────────┘  │   │
│   └───────────────────────────────┘   │
│         ↓ fetch via ApiClient         │
│                                       │
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

Requires a browser with container queries and `color-mix()` — **2023+**:

- Chrome / Edge 111+
- Firefox 113+
- Safari 16.2+

---

## API reference

Auto-generated TypeDoc output: [`docs/api/README.md`](./docs/api/README.md). Regenerate with `npm run docs`.

---

## Status

**`v0.2.0` — first public minor.** The alpha line (`0.1.0-alpha.1` through `0.1.0-alpha.49`) is closed; deprecated theme slots and legacy `any`-leaks across the public API have been cleaned up. The surface is stable enough for external adoption, and Task E/F/G generics (`EntityForm<T>`, `FormField<TSelf, TValue, TForm>`, `FieldRenderParameters<T, TValue>`, `parse<T>`) give per-entity key narrowing where you opt in.

**Not yet on npm.** Install via the [GitHub release repo](https://github.com/rchemist/rchemist-rcm-listgrid-release) — see the [Install](#install) section. The first npm publish will follow once the reference `UIProvider` adapter lands (see [`docs/ROADMAP.md`](./docs/ROADMAP.md) Stage 6).

**New to the library?** Start with [`docs/getting-started.md`](./docs/getting-started.md) — it walks through each provider contract and the most common adoption traps.

**Upgrading from an alpha?** See [`CHANGELOG.md`](./CHANGELOG.md) for the full v0.2.0 release notes and [`docs/MIGRATION.md`](./docs/MIGRATION.md) for a step-by-step migration guide with before/after code samples.

The library was extracted from a production project ([`docs/ROADMAP.md`](./docs/ROADMAP.md) tracks the Stage 0 → Stage 7 extraction history); design decisions behind every non-trivial choice live in [`DECISIONS.md`](./DECISIONS.md).

---

## Contributing

See [`DECISIONS.md`](./DECISIONS.md) before opening a PR. All non-trivial design choices are recorded there; add your own decision log entry if you change one.

```bash
npm install --legacy-peer-deps
npm run type-check
npm test
npm run lint
npm run build
```

---

## License

Apache-2.0 — see [`LICENSE`](./LICENSE).
