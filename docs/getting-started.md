# Getting started with `@rchemist/listgrid`

This guide takes you from an empty React app to a working list + form page. It expands on the Quick start block in the root [`README.md`](../README.md) by explaining **why** each step exists and flagging the spots where adopters most commonly get stuck.

If you already know the library and just want the API index, see [`src/listgrid/index.ts`](../src/listgrid/index.ts) — it is the single source of truth for what is publicly exported.

---

## 1. Prerequisites

- **Node**: `>= 18`. The library is published as an ES module; older Node can't resolve the package without a bundler.
- **React**: `>= 18`. Declared in `peerDependencies`. React 19 works — the library avoids 19-only syntax on purpose.
- **A bundler**: Vite, Next.js (14+), webpack, esbuild, Rspack — anything that honours the `exports` field in `package.json` and can load CSS. The styling pipeline ships a single `styles.css` plus individual layer files (`tokens.css`, `primitives.css`, `layouts.css`, `components.css`, `base.css`); hosts can either import the combined file or wire them into their own CSS layers.
- **A browser with container queries and `color-mix`**: Chrome / Edge 111+, Firefox 113+, Safari 16.2+. The responsive list/form layouts depend on `@container` rules.

If you are targeting an older browser matrix, stop here — the styling layer will not render correctly.

---

## 2. Install

```bash
npm install @rchemist/listgrid react react-dom @headlessui/react @tabler/icons-react
```

Then import the stylesheet **once** at your app root:

```ts
import '@rchemist/listgrid/styles.css';
```

(If you want finer control, import the individual layers — `@rchemist/listgrid/styles/tokens.css`, `.../primitives.css`, `.../layouts.css`, `.../components.css`, `.../base.css` — in that order.)

### Peer dependencies — what you actually need

| You use… | Install |
|---|---|
| The library at all | `react`, `react-dom`, `@tabler/icons-react`, `@headlessui/react` (all required) |
| Next.js app-router adapter (`@rchemist/listgrid/next`) | `next`, `nuqs` |
| Rich select fields (`SelectField` / `MultiSelectField`) | `react-select` |
| Drag-sort rows in a list | `react-sortablejs`, `sortablejs` |
| `QrField` | `qrcode.react` |
| `AddressMapField` (Korean map) | `react-kakao-maps-sdk` |
| Korean postcode lookup (`PostCodeSelector`) | `react-daum-postcode` |
| Styled Excel export (`DataExporter`) | `xlsx-js-style`, `file-saver` |
| `ApiSpecificationButton` / `XrefPriceMappingView` confirm dialogs | `sweetalert2`, `sweetalert2-react-content` |

Only install the rows you actually render. The rest of the peer list is marked `optional` in `peerDependenciesMeta` so package managers won't warn.

**Common gotcha**: if you are using `npm`, pair the install with `--legacy-peer-deps` (`npm install --legacy-peer-deps`). The library declares a wide React peer range (`>= 18`) and npm 7+ is stricter than yarn/pnpm about overlapping ranges when a transitive dep pins a narrower version.

---

## 3. The provider contracts — what you inject

The library is **framework-free by design**. It does not know how you do HTTP, routing, URL state, auth, or UI widgets. You wire these in once at bootstrap via six contracts:

| Contract | Form | Purpose |
|---|---|---|
| `AuthProvider` | React component | Session + role checks |
| `UIProvider` | React component | ~50 visual primitives (Table, Modal, Tooltip, …) |
| `RouterProvider` | React component | Framework router hooks (Next, React Router, …) |
| `UrlStateProvider` | React component | Query-string state sync (nuqs-compatible) |
| `configureApiClient` | Module-level function | HTTP transport + auth headers + CSRF |
| `configureMessages` | Module-level function | Toast / alert / confirm dialogs |
| `configureRuntime` | Module-level function | Dev-mode flag, client-side crypto salt |

`configure*` helpers are **module-scope registries** rather than React Context because listgrid reads them from class methods (`PageResult.fetchListData`, `EntityForm.initialize`, …) where Context is unavailable. Call each `configure*` function once, before your first `ViewListGrid` / `ViewEntityForm` renders.

### Minimal bootstrap

```tsx
import {
 AuthProvider,
 UIProvider,
 RouterProvider,
 UrlStateProvider,
 configureApiClient,
 configureMessages,
 configureRuntime,
} from '@rchemist/listgrid';
import { nextRouterServices, nextUrlStateServices } from '@rchemist/listgrid/next';
import '@rchemist/listgrid/styles.css';
import { uiComponents } from './ui'; // your primitive map — see § 4

configureRuntime({
 isDevelopment: process.env.NODE_ENV === 'development',
 cryptKey: process.env.NEXT_PUBLIC_CRYPT_KEY!, // any stable salt
});

configureApiClient({
 callExternalHttpRequest: async (options) => {
 const res = await fetch(options.url, {
 method: options.method ?? 'POST',
 headers: { 'content-type': 'application/json' },
 body: JSON.stringify(options.formData),
 });
 return res.json();
 },
 getExternalApiData: async (urlOrOptions) => {
 const url = typeof urlOrOptions === 'string' ? urlOrOptions : urlOrOptions.url;
 const res = await fetch(url);
 return res.json();
 },
 getExternalApiDataWithError: async (urlOrOptions) => {
 const url = typeof urlOrOptions === 'string' ? urlOrOptions : urlOrOptions.url;
 const res = await fetch(url);
 if (!res.ok) throw await res.json();
 return res.json();
 },
});

configureMessages({
 showAlert: async ({ title, text }) => { window.alert(`${title}\n${text}`); },
 showConfirm: async ({ text }) => window.confirm(text),
 showToast: ({ text }) => console.log('[toast]', text),
 showSuccess: ({ text }) => console.log('[success]', text),
 showError: (err) => console.error(err),
 openToast: () => {},
 clearAllToasts: () => {},
});

export function Root({ session, children }: { session: Session; children: React.ReactNode }) {
 return (
 <RouterProvider value={nextRouterServices}>
 <UrlStateProvider value={nextUrlStateServices}>
 <AuthProvider session={session}>
 <UIProvider components={uiComponents}>{children}</UIProvider>
 </AuthProvider>
 </UrlStateProvider>
 </RouterProvider>
 );
}
```

**Common gotcha**: `useUI must be called within a <UIProvider>` — you called a library component outside the tree. Almost every page has to live below all four providers.

### Non-Next.js frameworks

`@rchemist/listgrid/next` is a thin binding to `next/navigation` + `nuqs`. For React Router / Remix / TanStack Router, write your own `RouterServices` and `UrlStateServices` implementations — their contracts are exported as types:

```ts
import type { RouterServices, UrlStateServices } from '@rchemist/listgrid';
```

Each is a plain object of hooks (`useRouter`, `usePathname`, `useParams`, `useSearchParams`, `Link`) you delegate to your router. No adapter currently ships for non-Next frameworks — this is the most concrete gap for OSS adopters today.

---

## 4. `UIProvider` — the biggest single hurdle

`UIProvider` takes a `components` prop of type `UIComponents` (see [`src/listgrid/ui/UIProvider.tsx`](../src/listgrid/ui/UIProvider.tsx)) — a map of **~50 visual primitives** the library composes internally. Every prop is typed `ComponentType<any>` on purpose so you can plug any UI kit with any prop shape. The library does not ship a default set.

### The full primitive list (categorised)

| Category | Components |
|---|---|
| Layout | `Box`, `Flex`, `Grid`, `SimpleGrid`, `Stack`, `Group`, `Paper` |
| Feedback | `Alert`, `Badge`, `Indicator`, `LinearIndicator`, `LoadingOverlay`, `Skeleton`, `Stepper` |
| Overlays | `Modal`, `Popover`, `Tooltip`, `TooltipCard` |
| Inputs (text) | `TextInput`, `Textarea`, `NumberInput`, `ColorInput` |
| Inputs (choice) | `SelectBox`, `MultiSelectBox`, `CheckBox`, `CheckBoxChip`, `RadioInput`, `RadioChip`, `BooleanRadio`, `TagsInput`, `Dropdown` |
| Inputs (specialised) | `EmailDomainInput`, `EmailDomainCheckButtonInput`, `CheckButtonValidationInput`, `FileUploadInput`, `LazyFileUploadInput`, `PasswordStrengthView`, `FlatPickrDateField`, `MarkdownEditor`, `InlineMap` |
| Data | `Table`, `Tree`, `Pagination`, `Breadcrumb` |
| Actions | `Button` |
| App-specific | `UserView` (renders a user chip), `SafePerfectScrollbar` |

A handful are optional (`BreadcrumbItem`, `PasswordStrength`); the rest are required. If the library renders a field whose UI primitive is missing, you get:

```
[@rchemist/listgrid] UI component "SelectBox" missing from UIProvider.
```

### Three strategies for building your primitive map

**(a) Build them yourself with headless UI + your own CSS.** The library's own CSS already styles `rcm-button`, `rcm-notice`, `rcm-badge`, etc. via `data-*` attributes, so a thin `<button className="rcm-button" data-variant={props.variant}>{props.children}</button>` wrapper is often enough for feedback primitives. Inputs and overlays benefit from `@headlessui/react` (already a required peer). Cost: ~500–1000 lines of glue, high control.

**(b) Wrap an existing UI kit.** MUI, Chakra, shadcn/ui, Ant Design, Mantine — any kit works. You write one adapter module that maps each primitive to a kit component, translating props. Cost: ~300–500 lines, follows whatever design language your app already has.

> **No official adapter ships yet.** See [`docs/ROADMAP.md`](./ROADMAP.md) — a reference adapter is follow-up work. Until then, every adopter writes their own map. This is the biggest single integration cost.

### Shape of a primitive

The library never introspects primitive props — it just splats whatever props its internal composition calls with. Typical callsite inside listgrid:

```tsx
<TextInput
 name={name}
 value={value}
 onChange={onChange}
 readonly={readonly}
 placeholder={placeholder}
 className={className}
 data-error={hasError}
/>
```

So your `TextInput` implementation needs to accept at least those props. The easiest way to discover the surface is to start with minimal stubs (`const TextInput = (props: any) => <input {...props} />`) and iterate until each field in your form renders.

### Compound children (`Table.Th`, etc.)

Some primitives have compound children — the library calls them as `<Table.Th>`, `<Table.Td>`, `<Table.Tr>`, `<Table.Thead>`, `<Table.Tbody>`. The provider implementation proxies any `PascalCase` property access through to the host component, so your `Table` implementation needs to expose matching static sub-components:

```tsx
const Table: any = (props) => <table {...props} />;
Table.Thead = (props: any) => <thead {...props} />;
Table.Tbody = (props: any) => <tbody {...props} />;
Table.Tr = (props: any) => <tr {...props} />;
Table.Th = (props: any) => <th {...props} />;
Table.Td = (props: any) => <td {...props} />;
```

If the library calls a compound that doesn't exist on your host component, you get:

```
[@rchemist/listgrid] Compound "Table.Th" missing on host component.
```

---

## 5. The `ApiClient` contract

The library calls the backend through three injection points (see [`src/listgrid/api/ApiClient.ts`](../src/listgrid/api/ApiClient.ts)):

```ts
interface ApiClient {
 callExternalHttpRequest<T>(options: ApiRequestOptions): Promise<ResponseData<T>>;
 getExternalApiData<T>(urlOrOptions: string | ApiRequestOptions): Promise<ResponseData<T>>;
 getExternalApiDataWithError<T>(urlOrOptions: string | ApiRequestOptions): Promise<ResponseData<T>>;
}
```

- `getExternalApiData` — simple GET; errors resolve to a `ResponseData` with `error` / `status`.
- `getExternalApiDataWithError` — like the above, but throws (your `Promise<T>` rejects) on non-2xx so callers can `try/catch`.
- `callExternalHttpRequest` — anything else (POST / PUT / DELETE / PATCH) with `formData` as the body.

### The `ResponseData<T>` envelope

The backend is expected to return this shape ([`src/listgrid/api/types.ts`](../src/listgrid/api/types.ts)):

```jsonc
{
 "data": /* T — the entity or list payload */,
 "status": 200,
 "error": "optional error message",
 "entityError": {
 "error": {
 "error": true,
 "message": "Validation failed",
 "fieldError": { "email": ["must be unique"] }
 }
 }
}
```

`fieldError` may be serialised as either a `Map` or a plain record — the library accepts both. This shape matches the **RCM-framework** Java backend (Spring Boot 3.x) the library was originally built against. If your backend uses a different envelope, wrap the response in your `ApiClient` implementation:

```ts
configureApiClient({
 async getExternalApiData(urlOrOptions) {
 const url = typeof urlOrOptions === 'string' ? urlOrOptions : urlOrOptions.url;
 const res = await fetch(url);
 const payload = await res.json();
 // translate your API shape → ResponseData<T>
 return { data: payload.result, status: res.status };
 },
 // ...
});
```

### List endpoints — query parameters

`PageResult.fetchListData(url, searchForm)` serialises pagination / sort / filter state using these parameter names:

- `page` — zero-indexed
- `pageSize`
- `sorts` — `{ fieldName: 'ASC' | 'DESC' }` map
- `filters` — `{ AND: FilterItem[], OR: FilterItem[] }` nested object
- Each `FilterItem` carries `name`, `value` (or `values[]`), `queryConditionType` (`EQUAL`, `LIKE`, `BETWEEN`, …), and `not`

See [`src/listgrid/form/SearchForm.ts`](../src/listgrid/form/SearchForm.ts) for the exhaustive serialisation and the `QueryConditionType` union.

**Common gotcha**: your backend returns an array, not `{ data: { list, totalCount, totalPage } }` — fix by wrapping in `ApiClient` (as above) so `response.data.list` is populated.

---

## 6. Defining an entity

Entities are described as a fluent builder. Start with `new EntityForm(name, url)`, add fields via `addFields({ items: [...] })`, and you are done:

```tsx
import {
 EntityForm,
 StringField,
 NumberField,
 BooleanField,
} from '@rchemist/listgrid';

export function createUserForm {
 return new EntityForm('user', '/api/users').addFields({
 items: [
 new StringField('name', 1).withRequired(true).withLabel('Full name'),
 new StringField('email', 2).withRequired(true).withLabel('Email'),
 new NumberField('age', 3).withLabel('Age'),
 new BooleanField('active', 4).withLabel('Active'),
 ],
 });
}
```

Every field class is a constructor (`new StringField(name, order)`). Orders dictate rendering sequence in both list and form views.

### Key methods on `EntityForm`

- `.withTitle('Users')`
- `.withId(id)` — switches to "update" mode, causes `fetchData` to GET `${url}/${id}`
- `.clone(includeValue?)` — cheap copy; always `.clone()` before attaching per-row state, so the underlying form stays reusable
- `.getValue(name)` / `.setValue(name, value)` — read / mutate the current working entity
- `.getAttributes() / .putAttribute(key, value)` — per-form opaque state bag (as of v0.2.0, values are `unknown` — cast or narrow on read)

### Opt into key narrowing with `EntityForm<T>` (v0.2.0+)

`EntityForm` accepts an optional entity type parameter:

```ts
interface User {
 id: string;
 name: string;
 email: string;
 age: number;
 active: boolean;
}

const form = new EntityForm<User>('user', '/api/users');

const email = await form.getValue('email'); // Promise<string | undefined>
const bogus = await form.getValue('bogus'); // ❌ TS error: not a key of User
```

Default is `any` — existing code compiles without change. Opt in entity-by-entity when you want the safety. The same `<T>` parameter flows through `FieldRenderParameters<T, TValue>`, `FilterRenderParameters<T, TValue>`, `ViewRenderProps<T>`, and `ViewValueProps<T>` (see [`CHANGELOG.md`](../CHANGELOG.md)).

---

## 7. Rendering the list and form

With an entity form in hand, the renderers are two one-liners:

```tsx
import { ViewListGrid, ViewEntityForm, ListGrid } from '@rchemist/listgrid';
import { createUserForm } from './userForm';

export function UserListPage() {
 const form = createUserForm;
 return <ViewListGrid listGrid={new ListGrid(form)} />;
}

export function UserDetailPage({ id }: { id: string }) {
 const form = createUserForm.withId(id);
 return <ViewEntityForm entityForm={form} />;
}
```

`ListGrid` is a thin wrapper around an `EntityForm` that holds list-only state (`SearchForm`, sort/filter overrides). Always pass a fresh `new ListGrid(form)` so each page instance gets its own state.

Out of the box you get: pagination, column selection, quick search, advanced search (AND/OR filter builder), sort, bulk row actions, per-row actions, inline sub-collections, revision history, advanced column visibility, Excel export (if the peer deps are installed), and per-row edit modals.

### Customising appearance without forking

- **Tokens**: override CSS custom properties in your own stylesheet loaded **after** `@rchemist/listgrid/styles.css`. See [`src/listgrid/styles/tokens.css`](../src/listgrid/styles/tokens.css) for the full ~50-token list.
- **Primitives**: every rendered element uses `rcm-{name}` classes with `data-*` variants (`data-variant`, `data-color`, `data-size`). See [`docs/PRIMITIVES.md`](./PRIMITIVES.md).
- **Per-instance slots**: pass a `classNames={{ table: { container: 'my-custom' }, ... }}` prop to `<ViewListGrid />` / `<ViewEntityForm />` to splat extra classes onto specific slots.

---

## 8. FAQ — common adoption traps

**`error TS2305: Module '"@rchemist/listgrid"' has no exported member 'X'`.** Something you are importing does not exist at the top-level entry. Check [`src/listgrid/index.ts`](../src/listgrid/index.ts) — it is the only surface. Field files (`StringField`, …), configuration (`EntityForm`, `ListGrid`), and providers (`AuthProvider`, `UIProvider`, …) are all re-exported from there.

**`[@rchemist/listgrid] useUI must be called within a <UIProvider>`.** You are rendering a listgrid component outside the provider tree, or you imported a field from a test setup that skipped providers. Wrap the tree, or use a test wrapper that mounts all five providers.

**`[@rchemist/listgrid] UI component "X" missing from UIProvider`.** Your `components` prop to `UIProvider` doesn't include that primitive. Add it — see the table in § 4.

**`[@rchemist/listgrid] ApiClient called but no ApiClient has been configured`.** You rendered a list / form before `configureApiClient(...)` ran. Make sure the `configure*` calls live at module scope or run before any component mounts (a `bootstrap.ts` imported at the top of your entry file works well).

**Peer deps not installed (`Cannot find module 'react-select'`).** You rendered a `SelectField` / `MultiSelectField` but didn't install `react-select`. Either install the peer or swap the `SelectBox` primitive in `UIProvider` for something that doesn't need it.

**Backend returns an array, list doesn't render.** The library expects `{ data: { list, totalCount, totalPage } }`. Wrap the raw response in your `ApiClient.getExternalApiData` implementation.

**`unknown is not assignable to string` after upgrading to v0.2.0.** The `attributes` map now uses `unknown` values. See [`docs/MIGRATION.md`](./MIGRATION.md) — add a cast or a `typeof` narrow at the call site.

**Dates / numbers look localised incorrectly.** Override the formatter functions the library uses internally (`fDate`, `fDateTime`, `formatPrice`) — or import your own equivalents from the `@rchemist/listgrid` misc barrel and wrap field render logic.

---

## Where to next

- [`README.md`](../README.md) — one-page overview, theming, architecture diagram.
- [`CHANGELOG.md`](../CHANGELOG.md) — what changed in v0.2.0.
- [`docs/MIGRATION.md`](./MIGRATION.md) — upgrading from v0.1.0-alpha.x.
- [`docs/PRIMITIVES.md`](./PRIMITIVES.md) — the full list of `rcm-*` CSS classes and their `data-*` variants.
- [`docs/ROADMAP.md`](./ROADMAP.md) — planned work.
- [`src/listgrid/index.ts`](../src/listgrid/index.ts) — the canonical list of every public export.
