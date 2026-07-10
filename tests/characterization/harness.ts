// Characterization test harness — THE indirection layer (ADR-0008 / P2-1).
//
// Characterization tests under tests/characterization/** must NEVER import the
// engine directly (no `import ... from '../../src/...'`). They import
// EVERYTHING through this module instead. When P4 transplants verified logic
// into @listgrid/* packages, only the two `export * from '...'` specifiers
// below change — the tests that consume this module are untouched.
//
// This is the whole point of the harness: it is the single seam between
// "current monolith engine" (repo-root src/) and "re-foundation engine"
// (packages/@listgrid/*). Do not add deep `src/listgrid/...` imports here
// unless a symbol genuinely isn't reachable from the public barrel (see the
// `headlessUIComponents` exception below, which is intentionally excluded
// from the main barrel — see package.json `exports["./headless"]`).

import React from 'react';
import { render, type RenderResult } from '@testing-library/react';

// ---------------------------------------------------------------------------
// ENGINE POINTER #1 — public barrel (src/index.ts -> src/listgrid/index.ts).
// P4: flip this specifier from '../../src' to '@listgrid/core' (or whichever
// @listgrid/* package ends up owning EntityForm/fields/validations/SearchForm
// /ViewEntityForm/ViewListGrid/FieldRenderer). Every symbol re-exported below
// must exist on the new package's public surface under the same name.
// ---------------------------------------------------------------------------
export {
  // Entity/form config model
  EntityForm,
  EntityTab,
  SubCollectionField,
  TableSubCollectionField,
  CardSubCollectionField,
  excludeSelfOnManyToOneLookup,
  DEFAULT_TAB_INFO,
  DEFAULT_FIELD_GROUP_INFO,

  // Field classes (representative set used by the fixtures + smoke test)
  FormField,
  StringField,
  NumberField,
  BooleanField,
  SelectField,
  DateField,
  DatetimeField,
  EmailField,
  PhoneNumberField,
  ManyToOneField,

  // Validations
  RequiredValidation,
  EmailValidation,
  PhoneNumberValidation,

  // Search
  SearchForm,
  PageResult,

  // Render entry points
  ViewEntityForm,
  ViewListGrid,
  FieldRenderer,

  // UI provider contract + theming
  UIProvider,
  EntityFormThemeProvider,

  // Router + auth providers — full components (ViewEntityForm via useRouter,
  // default ManyToOneView via useSession) require these at render time.
  RouterProvider,
  AuthProvider,

  // API client injection seam (module-scope registry — see api/ApiClient.ts)
  configureApiClient,
  createResponseData,
  ResponseData,
} from '../../src';

export type {
  // Config/value types used when building fixtures
  TabInfo,
  FieldGroupInfo,
  ManyToOneConfig,
  FieldType,
  RenderType,

  // API client contract types (used by mockRcmFetch below)
  ApiClient,
  ApiRequestOptions,
  ApiMethod,

  // UI contract
  UIComponents,

  // SubCollection relation shape (used by the Project fixture)
  CardSubCollectionRelation,

  // Router + auth contracts (for renderWithProviders test defaults)
  RouterServices,
  RouterApi,
  Session,

  // Theming
  EntityFormThemeProviderProps,
} from '../../src';

// ---------------------------------------------------------------------------
// ENGINE POINTER #2 — headless UI baseline.
// P4: flip this specifier from '../../src/listgrid/ui/headless' to
// '@listgrid/react/headless' (or wherever the headless UIComponents baseline
// lands). Deliberately NOT re-exported from the main barrel today — the
// library only exposes it via the package.json `/headless` subpath so it
// never bloats the default bundle — so this is a real deep import, not a
// convenience shortcut. Keep it isolated on its own specifier for the flip.
// ---------------------------------------------------------------------------
export { headlessUIComponents } from '../../src/listgrid/ui/headless';

// ---------------------------------------------------------------------------
// Local imports for the harness's own helper implementations below. These
// import from the same two engine pointers as the re-exports above — no new
// seams — so they still only need to change in the two blocks above at P4.
// ---------------------------------------------------------------------------
import {
  UIProvider,
  EntityFormThemeProvider,
  RouterProvider,
  AuthProvider,
  configureApiClient,
  createResponseData,
} from '../../src';
import type {
  UIComponents,
  ApiClient,
  ApiMethod,
  ApiRequestOptions,
  EntityFormThemeProviderProps,
  RouterServices,
  RouterApi,
  Session,
} from '../../src';
import { headlessUIComponents } from '../../src/listgrid/ui/headless';

// ============================================================================
// renderWithProviders — React Testing Library render wrapped in the provider
// tree every listgrid component requires at minimum (UIProvider). Mirrors
// src/listgrid/components/form/FieldRenderer.p0.test.tsx.
// ============================================================================

// A no-op RouterServices for tests: navigation methods are spies you can assert
// on, and the location hooks return stable empty values. Full listgrid
// components (ViewEntityForm's useEntityFormLogic calls useRouter()
// unconditionally) mount cleanly with this. Override via options.routerServices.
export function createTestRouterServices(overrides?: Partial<RouterApi>): RouterServices {
  const api: RouterApi = {
    push: () => {},
    replace: () => {},
    refresh: () => {},
    back: () => {},
    forward: () => {},
    prefetch: () => {},
    ...overrides,
  };
  return {
    useRouter: () => api,
    usePathname: () => '/',
    useParams: () => ({}),
    useSearchParams: () => new URLSearchParams(),
    Link: ({ href, children }) => React.createElement('a', { href }, children),
  };
}

export interface RenderWithProvidersOptions {
  /** UIComponents to inject via <UIProvider>. Defaults to headlessUIComponents. */
  uiComponents?: UIComponents;
  /**
   * Session for <AuthProvider>. Defaults to `undefined` (a valid "no session"
   * state — AuthProvider is still present so useSession() returns undefined
   * instead of throwing "must be called within an <AuthProvider>").
   */
  session?: Session;
  /** RouterServices for <RouterProvider>. Defaults to createTestRouterServices(). */
  routerServices?: RouterServices;
  /**
   * When present, additionally wraps `ui` in <EntityFormThemeProvider {...}>
   * (custom field renderers, theme class overrides, button labels, etc.).
   * Omitted by default — most characterization tests don't need it.
   */
  themeProviderProps?: Omit<EntityFormThemeProviderProps, 'children'>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderWithProvidersOptions,
): RenderResult {
  const uiComponents = options?.uiComponents ?? headlessUIComponents;
  const routerServices = options?.routerServices ?? createTestRouterServices();

  // NOTE: children is passed inside the props object (not as createElement's
  // variadic 3rd+ args) — the provider prop types declare `children` as
  // required and this repo's exactOptionalPropertyTypes makes the variadic-
  // children createElement overload fail to typecheck against that. Passing
  // `children` explicitly keeps this file JSX-free (harness.ts, not .tsx).
  //
  // Provider nesting (outer → inner): RouterProvider → AuthProvider →
  // UIProvider → [EntityFormThemeProvider] → ui. All four are ancestors of the
  // rendered UI so useRouter/useSession/useUI all resolve. Fields that don't
  // touch router/auth are unaffected (the extra providers are inert for them).
  const inner = options?.themeProviderProps
    ? React.createElement(EntityFormThemeProvider, {
        ...options.themeProviderProps,
        children: ui,
      })
    : ui;

  const tree = React.createElement(RouterProvider, {
    value: routerServices,
    children: React.createElement(AuthProvider, {
      session: options?.session,
      children: React.createElement(UIProvider, {
        components: uiComponents,
        children: inner,
      }),
    }),
  });

  return render(tree);
}

// ============================================================================
// mockRcmFetch — backend mock, installed at the configureApiClient() seam.
//
// WHY this layer and not global `fetch`: listgrid never calls `fetch` (or
// XHR) directly. Every network call funnels through the module-scope
// registry in src/listgrid/api/ApiClient.ts — `callExternalHttpRequest` /
// `getExternalApiData` / `getExternalApiDataWithError` all delegate to a host
// -supplied ApiClient set via `configureApiClient(client)`. This is already
// the established test pattern in this repo (see src/listgrid/form/Type.test.ts
// which stubs the client the same way) — there is no fetch call to intercept.
// P4: this stays true regardless of engine — @listgrid/backend-rcm (see
// packages/backend-rcm, currently an empty P1 scaffold) is the eventual home
// for a *real* ApiClient implementation of this same contract; the mock here
// only needs to keep matching the `ApiClient` interface shape.
// ============================================================================

export interface RecordedRequest {
  url: string;
  method: ApiMethod;
  body?: unknown;
}

export interface MockRoute {
  method: ApiMethod;
  /** Exact string, RegExp, or predicate matched against the request URL. */
  url: string | RegExp | ((url: string) => boolean);
  /**
   * Returns the *backend payload* (NOT a ResponseData envelope) — i.e. what
   * rcm-framework 0.1.0 puts on the wire: a Spring-Data-Page shape for
   * search responses (see {@link searchPageEnvelope}), or a bare entity for
   * GET/POST/PUT/DELETE (see {@link bareEntity}). The harness wraps this
   * into `ResponseData.data` the same way a real ApiClient adapter would
   * (see ApiClient.ts JSDoc "envelope contract").
   */
  handler: (options: ApiRequestOptions) => unknown | Promise<unknown>;
}

export interface MockRcmFetchHandle {
  /** Every request observed since installation, in call order. */
  requests: RecordedRequest[];
  /**
   * Re-configures the ApiClient to a sentinel that throws loudly on any
   * call. There is no "unconfigured" state to restore to — configureApiClient
   * is a module-scope singleton with no reset export — so this is the
   * cross-test isolation guard: a test that forgets to call mockRcmFetch()
   * gets a clear error instead of silently reusing a previous test's routes.
   */
  restore(): void;
}

function matchRoute(routes: MockRoute[], method: ApiMethod, url: string): MockRoute | undefined {
  return routes.find((route) => {
    if (route.method !== method) return false;
    if (typeof route.url === 'string') return route.url === url;
    if (route.url instanceof RegExp) return route.url.test(url);
    return route.url(url);
  });
}

export function mockRcmFetch(routes: MockRoute[]): MockRcmFetchHandle {
  const requests: RecordedRequest[] = [];

  const resolve = async (options: ApiRequestOptions) => {
    const method = options.method ?? 'GET';
    requests.push({ url: options.url, method, body: options.formData });

    const route = matchRoute(routes, method, options.url);
    if (!route) {
      return createResponseData({
        status: 404,
        error: `[characterization] mockRcmFetch: no route for ${method} ${options.url}`,
      });
    }

    const payload = await route.handler(options);
    return createResponseData({ data: payload, status: 200 });
  };

  const client: ApiClient = {
    callExternalHttpRequest: (options) => resolve(options),
    getExternalApiData: (urlOrOptions) =>
      resolve(
        typeof urlOrOptions === 'string' ? { url: urlOrOptions, method: 'GET' } : urlOrOptions,
      ),
    getExternalApiDataWithError: (urlOrOptions) =>
      resolve(
        typeof urlOrOptions === 'string' ? { url: urlOrOptions, method: 'GET' } : urlOrOptions,
      ),
  };

  configureApiClient(client);

  return {
    requests,
    restore() {
      const notMocked: ApiClient = {
        callExternalHttpRequest: () => {
          throw new Error(
            '[characterization] ApiClient not mocked in this test — call mockRcmFetch(routes) first.',
          );
        },
        getExternalApiData: () => {
          throw new Error(
            '[characterization] ApiClient not mocked in this test — call mockRcmFetch(routes) first.',
          );
        },
        getExternalApiDataWithError: () => {
          throw new Error(
            '[characterization] ApiClient not mocked in this test — call mockRcmFetch(routes) first.',
          );
        },
      };
      configureApiClient(notMocked);
    },
  };
}

/**
 * Builds a Spring-Data-Page-shaped search response body (rcm-framework
 * 0.1.0 line — see apps/sample/lib/mock-backend/envelope.ts#searchEnvelope
 * and src/listgrid/form/Type.ts PageResult.fetchListData, which absorbs
 * `content`/`totalElements`/`totalPages` and echoes `searchRequest`).
 */
export function searchPageEnvelope<T>(
  content: T[],
  options?: { totalElements?: number; totalPages?: number; searchRequest?: unknown },
): { content: T[]; totalElements: number; totalPages: number; searchRequest: unknown } {
  return {
    content,
    totalElements: options?.totalElements ?? content.length,
    totalPages: options?.totalPages ?? 1,
    searchRequest: options?.searchRequest ?? {},
  };
}

/**
 * A bare-entity response (rcm-framework 0.1.0 AbstractCrudController GET
 * /{id}, POST, PUT all return the entity with no envelope — the ApiClient
 * adapter is what wraps it into ResponseData.data, which mockRcmFetch's
 * `resolve()` already does). This helper exists mainly for readability at
 * call sites — `bareEntity(employee)` documents intent — and as the seam
 * to add response mutation later without touching test call sites.
 */
export function bareEntity<T>(entity: T): T {
  return entity;
}
