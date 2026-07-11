import { useEffect, useState } from 'react';
import type { StoreApi } from 'zustand/vanilla';
import type { BackendAdapter, BackendError, EntityForm, Session } from '@listgrid/schema-core';
import { initializeFormStore, type FormStoreState } from '@listgrid/state';

// useEntityFormInitializer (EF3) — the react-layer entry point for the
// initializeFormStore pipe (@listgrid/state): fetch -> BIND -> onInit ->
// REBIND -> build. Additive: existing synchronous createFormStore call
// sites (e.g. apps/sample edit pages) keep working unchanged — this hook is
// an alternative for forms that declare onInit hooks (EF3/spec §4.1), not a
// replacement for createFormStore.

export interface UseEntityFormInitializerOptions {
  /** the declared form; never mutated. */
  entityForm: EntityForm;
  /** required to fetch by id; omit for create-mode or when initialData is supplied. */
  adapter?: BackendAdapter;
  /** existing-record id — triggers a fetch (via adapter) unless initialData is given. */
  id?: string;
  session?: Session;
  /** bypasses the adapter fetch — data already loaded by the host. */
  initialData?: Record<string, unknown>;
}

export interface UseEntityFormInitializerResult {
  /** undefined until the pipe resolves (loading === true). */
  store: StoreApi<FormStoreState> | undefined;
  /** the initialized EntityForm (post onFetchData/onInitialize) — render with
   *  THIS, not the input entityForm, so dynamically-added fields show up. */
  entityForm: EntityForm | undefined;
  loading: boolean;
  /** set only on a fetch failure — `store`/`entityForm` are still usable (empty/default). */
  error?: BackendError;
}

interface InternalState {
  store?: StoreApi<FormStoreState>;
  entityForm?: EntityForm;
  loading: boolean;
  error?: BackendError;
}

/**
 * Runs the initializeFormStore pipe once per {@link entityForm}/{@link adapter}/
 * {@link id} identity change (async-safe — a stale in-flight run's result is
 * ignored if the inputs changed or the component unmounted before it settled).
 * `session`/`initialData` are read at run time but intentionally excluded from
 * the re-run key (EF3 contract: identity of the form/transport/record drives
 * re-initialization, not every session/initialData reference change).
 */
export function useEntityFormInitializer(
  options: UseEntityFormInitializerOptions,
): UseEntityFormInitializerResult {
  const { entityForm, adapter, id, session, initialData } = options;
  const [state, setState] = useState<InternalState>({ loading: true });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true });

    initializeFormStore({
      entityForm,
      ...(adapter !== undefined ? { adapter } : {}),
      ...(id !== undefined ? { id } : {}),
      ...(session !== undefined ? { session } : {}),
      ...(initialData !== undefined ? { initialData } : {}),
    })
      .then((result) => {
        if (cancelled) return;
        setState({
          store: result.store,
          entityForm: result.entityForm,
          loading: false,
          ...(result.error !== undefined ? { error: result.error } : {}),
        });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        // the pipe itself rejected (should be rare — initializeFormStore
        // isolates its own handler throws — but never let the hook hang on
        // loading:true). Align the error shape with the fetch-error path.
        setState({
          loading: false,
          error:
            e !== null &&
            typeof e === 'object' &&
            'code' in e &&
            'message' in e &&
            typeof (e as { message: unknown }).message === 'string'
              ? (e as BackendError)
              : { code: 'UNKNOWN', message: e instanceof Error ? e.message : String(e) },
        });
      });

    return () => {
      cancelled = true;
    };
    // Re-run keyed on entityForm/adapter/id identity only (see doc comment);
    // session/initialData are read from the latest render's closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityForm, adapter, id]);

  return {
    store: state.store,
    entityForm: state.entityForm,
    loading: state.loading,
    ...(state.error !== undefined ? { error: state.error } : {}),
  };
}
