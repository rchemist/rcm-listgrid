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

export { AdapterProvider, useAdapter } from './providers/adapter';
export type { AdapterProviderProps } from './providers/adapter';

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
  useFieldValue,
  snapshotFieldValues,
} from './providers/form-store';
export type { FormStoreProviderProps } from './providers/form-store';

// --- initializeFormStore pipe entry point (EF3) ---
export { useEntityFormInitializer } from './hooks/use-entity-form-initializer';
export type {
  UseEntityFormInitializerOptions,
  UseEntityFormInitializerResult,
} from './hooks/use-entity-form-initializer';

// --- FieldRenderer registry (ADR-0003 §2) ---
export {
  registerFieldRenderer,
  getFieldRenderer,
  type FieldRendererComponent,
  type FieldRendererComponentProps,
} from './registry/field-renderer-registry';
export { registerDefaultRenderers } from './registry/default-renderers';

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
