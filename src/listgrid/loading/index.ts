// Stage 3c — optional host-supplied global loading state.
//
// The original the legacy UI kit exposed a zustand store with
// `setOpenBaseLoading`. Host apps that want a global spinner overlay call
// `configureLoading({ setOpenBaseLoading })`; otherwise calls no-op.

import { create } from 'zustand';

export interface LoadingStore {
  openBaseLoading: boolean;
  setOpenBaseLoading: (open: boolean) => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  openBaseLoading: false,
  setOpenBaseLoading: (open) => set({ openBaseLoading: open }),
}));

export function configureLoading(store: LoadingStore): void {
  useLoadingStore.setState(store);
}
