// Stage 3c — optional host-supplied global loading state.
//
// The original the legacy UI kit exposed a zustand store with
// `setOpenBaseLoading`. Host apps that want a global spinner overlay call
// `configureLoading({ setOpenBaseLoading })`; otherwise calls no-op.

export interface LoadingStore {
  openBaseLoading: boolean;
  setOpenBaseLoading: (open: boolean) => void;
}

let _store: LoadingStore = {
  openBaseLoading: false,
  setOpenBaseLoading: (open) => {
    _store.openBaseLoading = open;
  },
};

export function configureLoading(store: LoadingStore): void {
  _store = store;
}

export function useLoadingStore(): LoadingStore {
  return _store;
}
