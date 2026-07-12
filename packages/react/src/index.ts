// @listgrid/react — renderer registry + field renderers, ViewEntityForm,
// host-injected providers (ADR-0003). Turns an EntityForm declaration + a
// form store (@listgrid/state) into a rendered form via a FieldRenderer
// REGISTRY dispatched on `field.type`, with zero owned UI (charter C7 — every
// concrete widget comes from the host through UIProvider).

// --- providers + hooks (charter C7 seams) ---
export { UIProvider, useUI } from './providers/ui';
export type { UIProviderProps } from './providers/ui';

export { AuthProvider, useSession } from './providers/auth';
export type { AuthProviderProps } from './providers/auth';

export { RouterProvider, useRouter } from './providers/router';
export type { RouterProviderProps, Router } from './providers/router';

export { AdapterProvider, useAdapter, useReferenceResolver } from './providers/adapter';
export type { AdapterProviderProps } from './providers/adapter';

export { AssetBaseProvider, useAssetUrl } from './providers/asset-base';
export type { AssetBaseProviderProps, AssetUrlResolver } from './providers/asset-base';

export { CustomOptionProvider, useCustomOptions } from './providers/custom-option';
export type {
  CustomOptionProviderProps,
  FetchCustomOptions,
  CustomOptionResolver,
} from './providers/custom-option';

export { configureMessages, getMessages, resetMessages } from './messages';
export type { MessagesRegistry, ToastKind } from './messages';

export {
  FormStoreProvider,
  useFormStore,
  useFormField,
  useFieldMeta,
  useFieldValue,
  snapshotFieldValues,
} from './providers/form-store';
export type { FormStoreProviderProps } from './providers/form-store';

// --- initializeFormStore pipe entry point (EF3) ---
/** @deprecated W2-7 — use {@link useEntityForm} (bundles the controller). Removed a wave later. */
export { useEntityFormInitializer } from './hooks/use-entity-form-initializer';
export type {
  UseEntityFormInitializerOptions,
  UseEntityFormInitializerResult,
} from './hooks/use-entity-form-initializer';

// --- useEntityForm (spec §7; W2-7) — bundles useEntityFormInitializer +
// createFormController into the single react-layer entry point ---
export { useEntityForm } from './hooks/use-entity-form';
export type { UseEntityFormOptions, UseEntityFormResult } from './hooks/use-entity-form';

// --- FieldRenderer registry (ADR-0003 §2) ---
export {
  registerFieldRenderer,
  getFieldRenderer,
  type FieldRendererComponent,
  type FieldRendererComponentProps,
} from './registry/field-renderer-registry';
export { registerDefaultRenderers } from './registry/default-renderers';

// --- ListCellRenderer registry (spec §7 EG23, CAP-19; W5-2) ---
export {
  registerListCellRenderer,
  getListCellRenderer,
  type ListCellRendererComponent,
  type ListCellRendererComponentProps,
} from './registry/list-cell-renderer-registry';

// --- FilterRenderer registry (spec §7 EG24, CAP-20; W5-3) ---
export {
  registerFilterRenderer,
  getFilterRenderer,
  type FilterRendererComponent,
  type FilterRendererComponentProps,
} from './registry/filter-renderer-registry';

// --- components ---
export { FieldRenderer } from './components/FieldRenderer';
export type { FieldRendererProps } from './components/FieldRenderer';

export { ViewEntityForm } from './components/ViewEntityForm';
export type { ViewEntityFormProps } from './components/ViewEntityForm';

export { ViewListGrid } from './components/ViewListGrid';
export type { ViewListGridProps } from './components/ViewListGrid';

// --- conditional resolvers that need value-level React (ADR-0003 §Decision 5;
// schema-core ships only the React-free getConditionalBoolean/String) ---
export { getConditionalReactNode } from './util/conditional-react-node';
