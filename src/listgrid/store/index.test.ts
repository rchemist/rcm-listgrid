import { describe, it, expect, beforeEach } from 'vitest';
import {
  useModalManagerStore,
  configureOverlayZIndex,
  getOverlayZIndex,
  POPOVER_Z_INDEX,
} from './index';

/**
 * Zustand stores expose both a React hook and a static `.getState()`/`.setState()`
 * API — we use the latter so tests run without rendering. Each test resets the
 * store to its initial state beforehand.
 */

function resetStore() {
  useModalManagerStore.setState({ openModals: [] });
}

describe('useModalManagerStore.openModal', () => {
  beforeEach(resetStore);

  it('adds a modal and returns a generated id when none is supplied', () => {
    const id = useModalManagerStore.getState().openModal({ title: 'Hi' });
    expect(typeof id).toBe('string');
    expect(id).toMatch(/^modal-/);
    const modals = useModalManagerStore.getState().openModals;
    expect(modals).toHaveLength(1);
    expect(modals[0]!.modalId).toBe(id);
  });

  it('respects an explicit modalId', () => {
    const id = useModalManagerStore.getState().openModal({ modalId: 'custom-1' });
    expect(id).toBe('custom-1');
  });

  it('opening twice with the same id replaces the entry (no duplicates)', () => {
    useModalManagerStore.getState().openModal({ modalId: 'dup', title: 'A' });
    useModalManagerStore.getState().openModal({ modalId: 'dup', title: 'B' });
    const modals = useModalManagerStore.getState().openModals;
    expect(modals).toHaveLength(1);
    expect(modals[0]!.title).toBe('B');
  });

  it('preserves earlier modals when a new one opens', () => {
    useModalManagerStore.getState().openModal({ modalId: 'm1' });
    useModalManagerStore.getState().openModal({ modalId: 'm2' });
    expect(useModalManagerStore.getState().openModals.map((m) => m.modalId)).toEqual(['m1', 'm2']);
  });
});

describe('useModalManagerStore.closeModal', () => {
  beforeEach(resetStore);

  it('removes a specific modal by id', () => {
    useModalManagerStore.getState().openModal({ modalId: 'm1' });
    useModalManagerStore.getState().openModal({ modalId: 'm2' });
    useModalManagerStore.getState().closeModal('m1');
    expect(useModalManagerStore.getState().openModals.map((m) => m.modalId)).toEqual(['m2']);
  });

  it('clears all modals when called without an id', () => {
    useModalManagerStore.getState().openModal({ modalId: 'm1' });
    useModalManagerStore.getState().openModal({ modalId: 'm2' });
    useModalManagerStore.getState().closeModal();
    expect(useModalManagerStore.getState().openModals).toEqual([]);
  });
});

describe('useModalManagerStore.closeTopModal', () => {
  beforeEach(resetStore);

  it('drops the last modal from the stack', async () => {
    useModalManagerStore.getState().openModal({ modalId: 'm1' });
    useModalManagerStore.getState().openModal({ modalId: 'm2' });
    await useModalManagerStore.getState().closeTopModal();
    expect(useModalManagerStore.getState().openModals.map((m) => m.modalId)).toEqual(['m1']);
  });

  it('is a no-op on an empty stack', async () => {
    await useModalManagerStore.getState().closeTopModal();
    expect(useModalManagerStore.getState().openModals).toEqual([]);
  });
});

describe('useModalManagerStore.findModal', () => {
  beforeEach(resetStore);

  it('returns the matching modal by id', () => {
    useModalManagerStore.getState().openModal({ modalId: 'a', title: 'Alpha' });
    expect(useModalManagerStore.getState().findModal('a')?.title).toBe('Alpha');
  });

  it('returns undefined for an unknown id', () => {
    expect(useModalManagerStore.getState().findModal('missing')).toBeUndefined();
  });
});

describe('useModalManagerStore.updateModalData', () => {
  beforeEach(resetStore);

  it('patches the matching modal with new data', () => {
    useModalManagerStore.getState().openModal({ modalId: 'a', title: 'Alpha' });
    useModalManagerStore.getState().updateModalData('a', { title: 'Beta' });
    expect(useModalManagerStore.getState().findModal('a')?.title).toBe('Beta');
  });

  it('is a no-op for an unknown id', () => {
    useModalManagerStore.getState().openModal({ modalId: 'a', title: 'Alpha' });
    useModalManagerStore.getState().updateModalData('missing', { title: 'X' });
    expect(useModalManagerStore.getState().findModal('a')?.title).toBe('Alpha');
  });
});

describe('overlay z-index helpers', () => {
  it('getOverlayZIndex defaults to 1000 when no override was applied', () => {
    // Reset by setting a fresh base value then reading it back.
    configureOverlayZIndex(1000);
    expect(getOverlayZIndex()).toBe(1000);
  });

  it('applies positive offsets above the base', () => {
    configureOverlayZIndex(2000);
    expect(getOverlayZIndex(5)).toBe(2005);
  });

  it('applies zero offset (default) when called without args', () => {
    configureOverlayZIndex(500);
    expect(getOverlayZIndex()).toBe(500);
  });

  it('allows negative offsets', () => {
    configureOverlayZIndex(1000);
    expect(getOverlayZIndex(-10)).toBe(990);
  });

  it('exposes POPOVER_Z_INDEX = 50', () => {
    expect(POPOVER_Z_INDEX).toBe(50);
  });
});
