import { useMemo } from 'react';
import type { StoreApi } from 'zustand/vanilla';
import type {
  BackendAdapter,
  BackendError,
  EntityForm,
  FormRuntime,
  Session,
} from '@listgrid/schema-core';
import { createFormController, type FormStoreState } from '@listgrid/state';
import {
  useEntityFormInitializer,
  type UseEntityFormInitializerOptions,
} from './use-entity-form-initializer';

// useEntityForm (spec §7; W2-7) — succeeds useEntityFormInitializer (EF3) as
// the single react-layer entry point: it composes that hook's existing
// cancellation-safe initializeFormStore pipe (BIND -> onInit -> REBIND ->
// build, use-entity-form-initializer.ts) with createFormController (spec
// §6.2, @listgrid/state/form-controller.ts) so a consumer gets a ready-to-use
// FormRuntime alongside the store/entityForm, instead of wiring the two
// together by hand at every call site. Deliberately a thin compose — no
// duplicated async/cancellation logic (Do-NOT, this task's briefing): all
// fetch/BIND/onInit/REBIND/cancellation behavior is inherited verbatim from
// useEntityFormInitializer.

export interface UseEntityFormOptions {
  /** the declared form; never mutated. */
  entityForm: EntityForm;
  /** existing-record id — triggers a fetch (via adapter) unless initialData is given. */
  id?: string;
  /** required to fetch by id, and required for `controller` to be built (no
   *  adapter => no save/delete transport => controller stays undefined). */
  adapter?: BackendAdapter;
  session?: Session;
  /** bypasses the adapter fetch — data already loaded by the host. */
  initialData?: Record<string, unknown>;
  /**
   * EF5 passthrough (spec §7) — opt-in validate-on-change (default OFF).
   * Forwarded through {@link useEntityFormInitializer} into
   * `initializeFormStore` → the store build (W2-7 wired the initializer's
   * passthrough).
   */
  validateOnChange?: boolean;
}

export interface UseEntityFormResult {
  /** undefined until the pipe resolves (loading === true). */
  store: StoreApi<FormStoreState> | undefined;
  /** the initialized EntityForm (post onInit) — render with THIS, not the
   *  input entityForm, so dynamically-added fields show up. */
  entityForm: EntityForm | undefined;
  /** the FormRuntime (save/delete/reload/validate) bound to `store`/
   *  `entityForm`/`adapter` — undefined until store+entityForm are ready AND
   *  an adapter was supplied. */
  controller: FormRuntime | undefined;
  loading: boolean;
  /** set only on a fetch failure — `store`/`entityForm` are still usable. */
  error?: BackendError;
}

/**
 * Bundles {@link useEntityFormInitializer} (the initializeFormStore pipe)
 * with {@link createFormController} (the FormRuntime save/delete lifecycle)
 * behind a single entry point (spec §7). The returned `controller` is
 * memoized on `store`/`entityForm`/`adapter`/`session` identity so a stable
 * instance persists across re-renders once the pipe resolves.
 */
export function useEntityForm(opts: UseEntityFormOptions): UseEntityFormResult {
  const initOptions: UseEntityFormInitializerOptions = {
    entityForm: opts.entityForm,
    ...(opts.adapter !== undefined ? { adapter: opts.adapter } : {}),
    ...(opts.id !== undefined ? { id: opts.id } : {}),
    ...(opts.session !== undefined ? { session: opts.session } : {}),
    ...(opts.initialData !== undefined ? { initialData: opts.initialData } : {}),
    ...(opts.validateOnChange !== undefined ? { validateOnChange: opts.validateOnChange } : {}),
  };
  const init = useEntityFormInitializer(initOptions);
  const { adapter, session } = opts;

  const controller = useMemo(
    () =>
      init.store && init.entityForm && adapter
        ? createFormController({
            entityForm: init.entityForm,
            store: init.store,
            adapter,
            ...(session !== undefined ? { session } : {}),
          })
        : undefined,
    [init.store, init.entityForm, adapter, session],
  );

  return {
    store: init.store,
    entityForm: init.entityForm,
    controller,
    loading: init.loading,
    ...(init.error !== undefined ? { error: init.error } : {}),
  };
}
