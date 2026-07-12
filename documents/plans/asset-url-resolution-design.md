<!--
DESIGN ARTIFACT — 확정 설계 (asset-URL 해석 계약)
생성: 2026-07-13 · opus 세션 · 설계 워크플로우(저작 opus + 시나리오 어드버서리 opus + 관례 스카우트 sonnet → opus 합성)
성격: 엔터프라이즈 OSS 라이브러리용 asset-URL 해석 재설계 (GX-6 채택 결정의 제대로된 재설계 — 사용자 확정 2026-07-13)
검증: 18-시나리오 커버리지 매트릭스(16 handled·1 caveat[tree-shaking]·1 out-of-scope[relative file download link]) · Open Questions 0
supersedes: GX-6 stash(전역 싱글턴 기전 폐기) + #GX-3 Open Question("assetBaseUrl 필드 = 스펙 결정")
후속: 이 설계 → 실행급 패치 스펙(RV 방식)으로 전환하여 무결정 실행. 상류=[ADR-0005](../adr/ADR-0005-backend-adapter-contract.md)·[spec §2](./entityform-public-api-spec.md)·[중간점검 §6](../analysis/2026-07-13/midpoint-code-review.md).
-->

# Asset-URL Resolution Redesign — Finalized Design (rcm-listgrid v0.4)

## 0. Executive summary

Asset fields (image / file / profile / multipleAsset) render a URL that may be an **absolute** URL (pass through untouched) or a **relative** path (prepend an asset-server base + prefix). The library must resolve this **per value, at render time**, robustly for unknown enterprise consumers (multi-tenant SSR, RSC, non-React batch jobs, side-by-side tenants).

The redesign has **four layers, each pure at its own level, with ZERO mutable module-global request state**:

1. **`@listgrid/utils`** — one **pure** resolver `resolveAssetUrl(url, serverUrl?, prefix?)` (base is always an explicit argument). Delete the four mutable-global setters and the impure `getAccessableAssetUrl`.
2. **`@listgrid/schema-core`** — add plain-data optional `BackendAdapter.assetBaseUrl?: string` (tier i, per-adapter). React-free.
3. **`@listgrid/backend-rcm`** — forward `RcmAdapterOptions.assetBaseUrl` verbatim onto the returned adapter.
4. **`@listgrid/react`** — one internal context carrying the **already-resolved** `{serverUrl, prefix}`, fed by **two providers** (`AdapterProvider` extended = tier i; new `AssetBaseProvider` = tier ii host-global), read by one hook **`useAssetUrl()`** returning a resolver function. Base flows **only through React context / props** — never a module singleton. Mirrors the existing per-adapter `ReferenceResolver` discipline in `packages/react/src/providers/adapter.tsx`.

**Precedence (evaluated per resolution site, nearest-context-wins):** `adapter.assetBaseUrl` (tier i) → `AssetBaseProvider serverUrl` (tier ii) → `NEXT_PUBLIC_ASSET_SERVER` env constant (tier iii). An adapter whose `assetBaseUrl` is `undefined` **falls through** (nullish `??`) to the inherited value, never shadowing it.

---

## 1. Layer 1 — `@listgrid/utils`: pure resolver (React-free, zero-dependency)

**File:** `packages/utils/src/asset-url.ts` (rewrite).

### 1.1 Removed (the entire mutable-global surface)

| Symbol | Reason |
|---|---|
| `setAssetServerBase(base)` | GX-3 injection seam — the rejected GX-6 mechanism. Module-global write. |
| `configureAssetServerUrl(url)` | 0.3.x imperative global override. Module-global write. |
| `configureAssetPrefix(prefix)` | 0.3.x imperative prefix override. Module-global write. |
| `getAccessableAssetUrl(imgUrl)` | Impure — reads `effectiveAssetServerUrl()`/`effectiveAssetPrefix()` globals. |
| `_injectedAssetServerBase`, `_assetServerUrlOverride`, `_assetPrefixOverride`, `_warnedNoAssetServerUrl`, `effectiveAssetServerUrl()`, `effectiveAssetPrefix()` | Module-level mutable `let`s + the once-warn latch (banned by AS-13) + their readers. |

Only real source importer of these is the test file (§7); `dist/**` and `.d.ts` hits are stale build output regenerated on rebuild.

### 1.2 Kept (immutable, SSR-safe)

- `export const ASSET_SERVER_URL: string` = `(typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ASSET_SERVER) || ''` — read-once build-time constant (tier iii). No request state.
- `export const ASSET_PREFIX: string = '/static-resource/'`.
- `export function isExternalUrl(url)` — **unchanged** (byte-identical triple-dup per repo policy; do NOT alter — `file-renderer.tsx` depends on its exact `http(s)`-only semantics).
- `export function validatedAssetFileName(fileName)` — unchanged.

### 1.3 New / changed signatures

**Before → After:**

```
// REMOVED:
getAccessableAssetUrl(imgUrl: string | null | undefined): string   // impure, global reads

// NEW (public /utils export):
resolveAssetUrl(
  url: string | null | undefined,
  serverUrl?: string,                 // explicit base; undefined/'' => no base
  prefix: string = ASSET_PREFIX,
): string

// CHANGED (was: removeAssetServerPrefix(url) reading globals):
removeAssetServerPrefix(
  url: string | null | undefined,
  serverUrl: string = '',             // explicit; no global read
  prefix: string = ASSET_PREFIX,
): string
```

### 1.4 `resolveAssetUrl` body (deterministic, hydration-safe, no `typeof window`, no console)

```
export function resolveAssetUrl(url, serverUrl, prefix = ASSET_PREFIX) {
  if (!url) return '';                                    // null/undefined/'' -> ''
  const t = url.trim();
  const base = serverUrl ? serverUrl.replace(/\/+$/, '') : '';   // SINGLE normalization point (AS-14)

  // absolute http(s): own-server -> normalize; foreign -> passthrough (AS-4/AS-5)
  if (t.startsWith('http://') || t.startsWith('https://')) {
    if (base && t.startsWith(base)) {
      let u = removeAssetServerPrefix(t, base, prefix);   // strip base+prefix, re-encode segments
      if (u.startsWith('/')) u = u.substring(1);
      return base + prefix + u;                           // idempotent rebuild
    }
    return t;                                             // foreign CDN -> byte-for-byte passthrough
  }

  // other absolute/opaque schemes pass through untouched (AS-12)
  if (t.startsWith('//') || t.startsWith('data:') || t.startsWith('blob:')) return t;

  // relative
  let u = removeAssetServerPrefix(url, base, prefix);
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/')) u = u.substring(1);
  return base + prefix + u;    // empty base => '/static-resource/' + path (root-relative, same-origin)
}
```

**`removeAssetServerPrefix` body** (pure; strip explicit base+prefix, then `split('/').map(encodeURIComponent).join('/')` — unchanged encoding, so the scheme-colon fix and Korean/space segment encoding are preserved; `'/'` separators untouched).

**Purity guarantees (hard):** no module-global read, no `process.env` read at call time, no DOM/`window`, no `console`. Same `(url, serverUrl, prefix)` → byte-identical output on server and client (AS-11). Feeding output back in is a fixed point (AS-5 idempotency): the rebuilt own-server URL, re-run, matches `base` again, strips, re-encodes an already-encoded segment — **`removeAssetServerPrefix` must not double-encode**; because segments are re-`encodeURIComponent`'d, `%20` would become `%2520`. **Mitigation:** the resolver only re-encodes on the *strip* path where the input segment is the decoded stored path; the fixed-point test (§7) pins idempotency for the standard `/static-resource/한글.png` shape. Do-NOT: add a second `encodeURIComponent` pass anywhere.

**Do-NOT:** import `@listgrid/schema-core` or `@listgrid/react` into utils (layer purity + zero-dep). Do-NOT reintroduce any `let` holding base/prefix/a warn-flag. Do-NOT emit `console.warn` from the resolver (moved to the React layer — keeps Node/RSC callers silent, AS-7).

**Empty-base semantics (decided, D15):** `resolveAssetUrl('photo.jpg', '')` → `'/static-resource/photo.jpg'` — preserves the documented 0.3 behavior (test line 140; MIGRATION §1.3 "상대경로(빈 서버)로 충분하면 무행동"). Do-NOT change this to "return relative unchanged"; the prefix-prepended root-relative path is the intended same-origin mode.

---

## 2. Layer 2 — `@listgrid/schema-core`: `BackendAdapter.assetBaseUrl` (plain data)

**File:** `packages/schema-core/src/backend/adapter.ts`. Add to the `BackendAdapter` interface (currently `list`/`getOne`/`create`/`update`/`remove` only):

```
export interface BackendAdapter {
  // ...existing 5 methods...
  /**
   * Optional per-adapter asset-server base (tier i) for resolving RELATIVE
   * asset paths (image/file/profile/multipleAsset). Absolute URLs pass
   * through untouched. Plain data — React-free. When undefined, resolution
   * falls through to a host-global <AssetBaseProvider> then
   * NEXT_PUBLIC_ASSET_SERVER. Read by @listgrid/react's AdapterProvider into
   * an AssetBase context; never a module global.
   */
  assetBaseUrl?: string;
}
```

**Count impact:** `BackendAdapter` is already a `/schema` barrel export; adding an interface *field* adds **0** barrel symbols (`count-public-surface.mjs` counts exported barrel symbols, not interface members). `/schema` stays **188/190**. Do-NOT introduce a new exported `AssetConfig`-style type for the base — it would consume the last 2 units of `/schema` headroom.

**Do-NOT:** make it required (must stay optional — every existing adapter, `createRcmAdapter` included, compiles unchanged). Do-NOT normalize here (trailing-slash stripping lives in `resolveAssetUrl`, single point).

---

## 3. Layer 3 — `@listgrid/backend-rcm`: forward the option

**File:** `packages/backend-rcm/src/adapter.ts`. `RcmAdapterOptions` (currently `baseUrl?`/`fetch?`/`headers?`) gains `assetBaseUrl?: string`; forward it onto the returned adapter with a conditional spread for `exactOptionalPropertyTypes`:

```
export interface RcmAdapterOptions {
  // ...existing...
  assetBaseUrl?: string;
}

// in createRcmAdapter(...):
return {
  list, getOne, create, update, remove,
  ...(options.assetBaseUrl !== undefined ? { assetBaseUrl: options.assetBaseUrl } : {}),
};
```

**Count impact:** `/backend-rcm` is not one of the three gated surfaces (only EntityForm/root/`/schema`). No gate change. Do-NOT assign `assetBaseUrl: undefined` unconditionally (violates `exactOptionalPropertyTypes`).

---

## 4. Layer 4 — `@listgrid/react`: context + two providers + one hook

**New file:** `packages/react/src/providers/asset-base.tsx`. Mirrors `adapter.tsx`'s per-adapter context discipline. No top-level side effects (tree-shakeable, `sideEffects:false` honored).

### 4.1 Context (internal — not exported from the barrel)

```
import { ASSET_SERVER_URL, ASSET_PREFIX, resolveAssetUrl, isExternalUrl } from '@listgrid/utils';

interface AssetBase { serverUrl: string; prefix: string }

// default = tier-iii env constant, so useAssetUrl() NEVER throws (optional capability)
const AssetBaseContext = createContext<AssetBase>({ serverUrl: ASSET_SERVER_URL, prefix: ASSET_PREFIX });
export { AssetBaseContext };   // exported for adapter.tsx ONLY (internal import; not re-exported from index.ts)
```

The context carries the **raw** base (un-normalized); `resolveAssetUrl` does the single trailing-slash normalization at resolution time (AS-14). Default value is the build-time env constant → identical on server and client (AS-11 hydration-safe), and `useAssetUrl()` degrades gracefully rather than throwing (charter C7; matches `RouterProvider`'s working-default posture, NOT `useAdapter`/`useSession`'s throw).

### 4.2 `AssetBaseProvider` (tier ii host-global; PUBLIC)

```
export interface AssetBaseProviderProps {
  serverUrl?: string;
  prefix?: string;
  children?: ReactNode;
}

export function AssetBaseProvider({ serverUrl, prefix, children }: AssetBaseProviderProps) {
  const inherited = useContext(AssetBaseContext);           // folds env / an outer provider
  const value = useMemo<AssetBase>(() => ({
    serverUrl: serverUrl ?? inherited.serverUrl,
    prefix: prefix ?? inherited.prefix,
  }), [serverUrl, prefix, inherited.serverUrl, inherited.prefix]);
  return <AssetBaseContext.Provider value={value}>{children}</AssetBaseContext.Provider>;
}
```

Works with **no `AdapterProvider` present** (pure display trees, static export, Storybook — AS-3). Declarative 1:1 replacement for 0.3's `configureAssetServerUrl`/`configureAssetPrefix`.

### 4.3 `AdapterProvider` (tier i; EXTENDED — same file `adapter.tsx`)

Add a THIRD sibling context provider (alongside `AdapterContext` + `ReferenceResolverContext`), reading inherited context so nesting composes:

```
import { AssetBaseContext } from './asset-base';
// inside AdapterProvider(...):
const inheritedAsset = useContext(AssetBaseContext);
const assetBase = useMemo(() => ({
  serverUrl: adapter.assetBaseUrl ?? inheritedAsset.serverUrl,   // '??' => undefined falls through (AS-8)
  prefix: inheritedAsset.prefix,
}), [adapter, inheritedAsset.serverUrl, inheritedAsset.prefix]);

return (
  <AdapterContext.Provider value={adapter}>
    <ReferenceResolverContext.Provider value={resolveReference}>
      <AssetBaseContext.Provider value={assetBase}>
        {children}
      </AssetBaseContext.Provider>
    </ReferenceResolverContext.Provider>
  </AdapterContext.Provider>
);
```

**No `useEffect`, no module write** (this is the exact fix vs. rejected GX-6). `adapter.tsx` imports only the tiny `AssetBaseContext` object — NOT `resolveAssetUrl` — so adapter-only bundles don't pull the resolver (AS-9). Memoized on `[adapter, inheritedAsset.serverUrl, inheritedAsset.prefix]` → referentially stable, re-derives only when the base actually changes (AS-10 runtime tenant swap re-renders consumers; no churn/hydration diff, AS-11).

### 4.4 `useAssetUrl()` (PUBLIC hook) + `AssetUrlResolver` (PUBLIC type)

```
export type AssetUrlResolver = (url: string | null | undefined) => string;

export function useAssetUrl(): AssetUrlResolver {
  const { serverUrl, prefix } = useContext(AssetBaseContext);
  const warned = useRef(false);   // instance-scoped dedupe — request-safe, NOT module state (AS-13)
  return useCallback<AssetUrlResolver>((url) => {
    if (process.env.NODE_ENV !== 'production' && !warned.current && !serverUrl && url) {
      const t = url.trim();
      const isRelative = !/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(t);   // no scheme, not protocol-relative
      if (isRelative) {
        warned.current = true;
        console.warn(
          `[@listgrid/react] useAssetUrl(): resolving relative asset path "${t}" with no asset base ` +
          `configured (tier i adapter.assetBaseUrl / tier ii <AssetBaseProvider> / tier iii ` +
          `NEXT_PUBLIC_ASSET_SERVER all empty). Falling back to "${ASSET_PREFIX}${t}".`,
        );
      }
    }
    return resolveAssetUrl(url, serverUrl, prefix);
  }, [serverUrl, prefix]);
}
```

Returns a **function** (not a resolved string) so renderers resolve N urls inside `.map` without breaking hook rules — mirrors `useReferenceResolver`. **Non-throwing** (env default). Dev warning is **instance-scoped** via `useRef` → no cross-request SSR leak (AS-13), no top-level side effect (tree-shakeable). The warning does not alter the returned string, so SSR/client markup stays byte-identical (AS-11).

**Do-NOT:** add any module-level `let warned` / once-latch (AS-13 ban). Do-NOT throw. Do-NOT recreate the resolver closure without `useCallback` (referential churn).

### 4.5 Barrel (`packages/react/src/index.ts`)

```
export { AssetBaseProvider, useAssetUrl } from './providers/asset-base';
export type { AssetBaseProviderProps, AssetUrlResolver } from './providers/asset-base';
```

`AssetBaseContext`/`AssetBase` stay internal (not exported). Root barrel **57 → 61**, well under **120**.

---

## 5. Renderer wiring (`packages/react/src/registry/*`)

**Decisive rule:** resolution applies to display **SINKS** that consume a URL as a live asset reference (`<img src>`, download `href`) — **NEVER** to an element that EDITS the stored value. A `FileInput value` must round-trip the RAW stored path; resolving it would persist the derived absolute URL back to the backend on save (data-integrity bug, AS: edit round-trip).

| File | Line(s) | Change | Raw (untouched) |
|---|---|---|---|
| `image-renderer.tsx` | 94, 143 | `const resolveAsset = useAssetUrl();` → `<img src={resolveAsset(url)} …>` (single + multi) | `FileInput value={url}` (86, 138) |
| `multiple-asset-renderer.tsx` | 230 | `<img src={resolveAsset(asset!.url)} …>` | modal `FileInput value={draft.url}` (288); stored `AssetItem.url` |
| `file-renderer.tsx` | 78-86, 108-109 | wrap `ExternalUrlLink` `href` with `resolveAsset` (foreign absolute → identity passthrough; own-server absolute → normalized) | `FileInput value={url ?? ''}` (114, 170) |
| `profile-renderer.tsx` | — | **NO auto-resolve** (D9). Host-owned value shape (may be a user id/object). Forward raw `value` to `UserView` slot; slot renders inside the context and MAY call `useAssetUrl()` itself. Document in-file. | entire value |

**Do-NOT (per renderer):**
- image/multiple-asset: do NOT wrap `FileInput value` with `resolveAsset`.
- file: do NOT invent a display affordance for relative (non-external) files — none exists today (pre-existing UX gap, out of scope); only the external/own-server link href is wrapped.
- profile: do NOT `resolveAsset(value)` — `resolveAssetUrl` on a non-URL relative string (e.g. a bare user id) would wrongly prepend the base.

---

## 6. Packaging & build integrity

- **`packages/react/package.json`** `dependencies`: add `"@listgrid/utils": "*"` (react's first dep on utils; utils has zero deps → clean, no new transitive/peer dep, AS-9).
- **`packages/react/tsconfig.json`** `references`: add `{ "path": "../utils" }` (currently references schema-core/state/ui-default only). Without it, warm-cache incremental `tsc -b` misses utils-API breakage — the exact gap flagged in `midpoint-code-review.md §6`.
- `sideEffects: false` already declared in both packages; the new `asset-base.tsx` module has no top-level side effects, so unused exports (`useAssetUrl` in an asset-field-free app) tree-shake away (AS-9). No new hard peer dependency.

---

## 7. Test changes (proof method)

**Rewrite** `packages/utils/src/__tests__/asset-url.test.ts` (drops all `configure*`/`setAssetServerBase`/module-flag tests):

- `resolveAssetUrl(null|undefined|'') === ''`.
- Foreign absolute passthrough incl. the gjcu dynamic-endpoint URL (`.../FileView.do?gbn=X08&F_USER_ID=...`) → byte-identical (AS-4).
- Own-server absolute (`base='https://assets.example.com'`, prefix `'/files/'`) → normalized, and **fixed-point** re-run equals itself (AS-5 idempotency, incl. a Korean/space segment).
- Relative → `base + prefix + encodedPath` (AS-?).
- **Empty base** → `resolveAssetUrl('photo.jpg', '') === '/static-resource/photo.jpg'` (D15, pins line-140 behavior).
- **AS-12 passthrough:** `data:image/png;base64,AAA`, `blob:https://app/uuid`, `//cdn.example.com/x.png` each return unchanged (no base, no encoding).
- **AS-14 normalization:** trailing-slash base (`'https://cdn/'`), embedded-path base (`'https://host/tenantA'`), path with/without leading `/` → exactly one `/` between base·prefix·path, no `//` seams.
- `removeAssetServerPrefix(url, base, prefix)` pure: strips explicit base+prefix, encodes segments, `null → ''`.
- `isExternalUrl` / `validatedAssetFileName` unchanged.

**New** `packages/react/src/providers/__tests__/asset-base.test.tsx` (React Testing Library):

- **AS-1 side-by-side:** two sibling `<AdapterProvider>` with different `assetBaseUrl`; each subtree's `useAssetUrl()('/uploads/x.png')` resolves against its own base (no cross-talk).
- **AS-8 nesting:** outer `<AssetBaseProvider serverUrl={cdnDefault}>` + inner `<AdapterProvider adapter={{assetBaseUrl: cdnOverride}}>`; inner site → `cdnOverride`, sibling-outside-inner site → `cdnDefault`.
- **AS-8 fall-through:** adapter with `assetBaseUrl: undefined` inside a host provider → inherits `cdnDefault` (not `''`).
- **AS-3 no-adapter:** `<AssetBaseProvider serverUrl={x}>` alone resolves relative paths.
- **AS-13 dev-warn:** empty base + relative url warns once per hook instance in dev; a second hook instance (new subtree/"tenant") warns again (proves no shared latch).
- **AS-11 determinism:** same `(value, base)` yields identical string across two independent renders.
- **useAssetUrl never throws** with no provider (env default).

Mechanical acceptance: `npm test` green in both packages; `npm run check:surface` prints `root: 61/120 PASS`, `/schema: 188/190 PASS`, `EntityForm: 49/55 PASS`; `tsc -b` clean with the new project reference.

---

## 8. Governing-doc updates (invention gate — every new symbol is nameable)

- **`documents/adr/ADR-0005-backend-adapter-contract.md` line 83** — replace the open-question sentence ("asset-URL 리졸브도 어댑터 base 주입(`setAssetServerBase`)이 미배선 … `assetBaseUrl` 필드 추가 여부는 후속 스펙 결정") with the **ratified** decision: `BackendAdapter.assetBaseUrl?` (tier i) + `RcmAdapterOptions.assetBaseUrl`, resolved via React-context (`AdapterProvider`/`AssetBaseProvider`/`useAssetUrl`), module-global `setAssetServerBase` mechanism removed. Close the Open Question.
- **`documents/plans/entityform-public-api-spec.md` §2** — add the asset-resolution surface: root gains `AssetBaseProvider`/`useAssetUrl`/`AssetBaseProviderProps`/`AssetUrlResolver`; `/schema` `BackendAdapter.assetBaseUrl` (field, +0 count); `/utils` `resolveAssetUrl` (replaces `getAccessableAssetUrl`). Note tier i via `RcmAdapterOptions.assetBaseUrl` alongside the existing multi-tenant `headers` seam.
- **`docs/MIGRATION.md` line 113** (the `./misc` → `/utils` mapping) — update the asset-URL helper list: remove `configureAssetServerUrl`/`getAccessableAssetUrl` from the exported-from-`/utils` set; add `resolveAssetUrl`; keep `ASSET_SERVER_URL`/`removeAssetServerPrefix`/`validatedAssetFileName`/`isExternalUrl`.
- **`documents/plans/migration-0.3-to-0.4.md` §1.3 / §2.2** — record the imperative→declarative map (§9 below).

---

## 9. Migration (0.3 → 0.4)

| 0.3.x | 0.4 replacement |
|---|---|
| `NEXT_PUBLIC_ASSET_SERVER` env | **unchanged** (tier iii, build-time static). |
| `configureAssetServerUrl(url)` (imperative global) | `<AssetBaseProvider serverUrl={url}>` (host-global, tier ii) **or** `createRcmAdapter({ assetBaseUrl: url })` (per-adapter, tier i). |
| `configureAssetPrefix(prefix)` | `<AssetBaseProvider prefix={prefix}>`. |
| `getAccessableAssetUrl(url)` | `useAssetUrl()` (React) **or** pure `resolveAssetUrl(url, base, prefix?)` (RSC/Node/batch). |
| `setAssetServerBase(base)` | **Removed** — never a shipped public seam; it was the rejected mechanism. |
| Renderers rendered raw values (relative broke) | Renderers call `useAssetUrl()` → relative paths now resolve. |

Breaking-change signal for out-of-repo 0.3 consumers is the compile error (missing export); the migration table above is the only guidance they get — keep it explicit. Callout: a host that assumed the library auto-resolves **profile** image URLs must now resolve inside its `UserView` slot (not a regression — profile value shape is host-owned).

---

## 10. Design decisions superseding the inputs

- **Author D3/publicSurface "keep stashed schema-core + backend-rcm changes":** ⛔ SUPERSEDED — the stash is fully reverted; `assetBaseUrl` must be **added fresh** to both interfaces (working tree confirmed clean; no `assetBaseUrl` in HEAD).
- **Author D12 "`resolveAssetUrl` NOT a published `/utils` export":** ⛔ SUPERSEDED — AS-6 (RSC non-hook path) and AS-7 (non-React Node batch) both **require** a public pure resolver; the React hook also imports it from the `/utils` barrel. `resolveAssetUrl` **is** a public `/utils` export and the 1:1 `getAccessableAssetUrl` replacement. (`/utils` is not a gated surface, so no threshold concern.)
- **Author's module-scoped dev-warn dedupe boolean:** ⛔ SUPERSEDED — AS-13 bans module-level once-latches. Use `useRef` instance dedupe in `useAssetUrl` (repo precedent: `router.tsx` warns without a module flag).
- **Author's scenario "no base + relative → returns relative path unchanged":** ⛔ CORRECTED — actual + preserved behavior is `'/static-resource/' + path` (root-relative, same-origin), per test line 140 / MIGRATION §1.3.
- **`data:`/`blob:`/`//` passthrough:** ADDED (AS-12) — the current code corrupts these; the pure resolver's passthrough set is now explicit and complete. `isExternalUrl` stays `http(s)`-only and unchanged; the extra guards live inside `resolveAssetUrl`.