import { describe, it, expect, beforeEach } from 'vitest';
import {
  isOpenedAdvancedSearch,
  setOpenedAdvancedSearch,
  setClosedAdvancedSearch,
} from './AdvancedSearchOpenCache';

const STORAGE_KEY = 'advancedSearchFormOpened';

describe('AdvancedSearchOpenCache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('isOpenedAdvancedSearch', () => {
    it('returns false when localStorage is empty', () => {
      expect(isOpenedAdvancedSearch('key-1')).toBe(false);
    });

    it('returns false when key is not present in cache', () => {
      setOpenedAdvancedSearch('other-key');
      expect(isOpenedAdvancedSearch('missing-key')).toBe(false);
    });

    it('returns the stored value for a known key', () => {
      setOpenedAdvancedSearch('key-1');
      expect(isOpenedAdvancedSearch('key-1')).toBe(true);
    });

    it('distinguishes keys by postFix', () => {
      setOpenedAdvancedSearch('key-1', 'A');
      expect(isOpenedAdvancedSearch('key-1', 'A')).toBe(true);
      expect(isOpenedAdvancedSearch('key-1', 'B')).toBe(false);
      // bare key unaffected by postFixed entry
      expect(isOpenedAdvancedSearch('key-1')).toBe(false);
    });
  });

  describe('setOpenedAdvancedSearch', () => {
    it('persists an open state to localStorage', () => {
      setOpenedAdvancedSearch('my-key');
      expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
      expect(isOpenedAdvancedSearch('my-key')).toBe(true);
    });

    it('accepts explicit false via third arg', () => {
      setOpenedAdvancedSearch('my-key', undefined, true);
      expect(isOpenedAdvancedSearch('my-key')).toBe(true);
      setOpenedAdvancedSearch('my-key', undefined, false);
      expect(isOpenedAdvancedSearch('my-key')).toBe(false);
    });

    it('can store multiple different keys independently', () => {
      setOpenedAdvancedSearch('alpha');
      setOpenedAdvancedSearch('beta');
      expect(isOpenedAdvancedSearch('alpha')).toBe(true);
      expect(isOpenedAdvancedSearch('beta')).toBe(true);
      expect(isOpenedAdvancedSearch('gamma')).toBe(false);
    });
  });

  describe('setClosedAdvancedSearch', () => {
    it('flips an opened key back to closed', () => {
      setOpenedAdvancedSearch('key-1');
      expect(isOpenedAdvancedSearch('key-1')).toBe(true);
      setClosedAdvancedSearch('key-1');
      expect(isOpenedAdvancedSearch('key-1')).toBe(false);
    });

    it('closing a never-opened key is a no-op from the reader perspective', () => {
      setClosedAdvancedSearch('not-yet-opened');
      expect(isOpenedAdvancedSearch('not-yet-opened')).toBe(false);
    });

    it('respects postFix when closing', () => {
      setOpenedAdvancedSearch('key', 'a');
      setOpenedAdvancedSearch('key', 'b');
      setClosedAdvancedSearch('key', 'a');
      expect(isOpenedAdvancedSearch('key', 'a')).toBe(false);
      expect(isOpenedAdvancedSearch('key', 'b')).toBe(true);
    });
  });
});
