// Stage 3d — internal modal/overlay state using zustand (already a dep).
//
// Shape matches the original the legacy UI kit API surface used throughout
// listgrid: modalId-based, plus helpers closeTopModal / findModal /
// updateModalData. Typed permissively (`any` on content) so host apps
// can keep their existing modal conventions.

import { create } from 'zustand';
import type { ReactNode } from 'react';

export interface ModalOptions {
  modalId?: string;
  title?: ReactNode;
  size?: string;
  fullHeight?: boolean;
  maxHeight?: string;
  content?: ReactNode;
  onClose?: () => void;
  // intentional: host apps extend with their own modal props (UIProvider wrapper)
  [key: string]: unknown;
}

interface ModalManagerState {
  openModals: ModalOptions[];
  openModal: (options: ModalOptions) => string;
  closeModal: (modalId?: string, ...rest: unknown[]) => void;
  closeTopModal: () => Promise<void>;
  findModal: (modalId: string) => ModalOptions | undefined;
  updateModalData: (modalId: string, data: Partial<ModalOptions>) => void;
}

export const useModalManagerStore = create<ModalManagerState>((set, get) => ({
  openModals: [],
  openModal: (options) => {
    const modalId = options.modalId ?? `modal-${Math.random().toString(36).slice(2, 10)}`;
    const normalized = { ...options, modalId };
    set((state) => ({
      openModals: [...state.openModals.filter((m) => m.modalId !== modalId), normalized],
    }));
    return modalId;
  },
  closeModal: (modalId) =>
    set((state) => ({
      openModals: modalId ? state.openModals.filter((m) => m.modalId !== modalId) : [],
    })),
  closeTopModal: async () => {
    set((state) => ({
      openModals: state.openModals.slice(0, -1),
    }));
  },
  findModal: (modalId) => get().openModals.find((m) => m.modalId === modalId),
  updateModalData: (modalId, data) =>
    set((state) => ({
      openModals: state.openModals.map((m) => (m.modalId === modalId ? { ...m, ...data } : m)),
    })),
}));

// Overlay z-index helpers. Host apps that layer the library deep inside a
// portal can override via configureOverlayZIndex.
let _baseOverlayZIndex = 1000;

export function configureOverlayZIndex(base: number): void {
  _baseOverlayZIndex = base;
}

export function getOverlayZIndex(offset: number = 0): number {
  return _baseOverlayZIndex + offset;
}

export const POPOVER_Z_INDEX = 50;
