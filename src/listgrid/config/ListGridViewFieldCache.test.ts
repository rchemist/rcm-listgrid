import { describe, it, expect, beforeEach } from 'vitest';
import {
  getListFieldsFromCache,
  setListFieldsToCache,
  clearListFieldsToCache,
} from './ListGridViewFieldCache';

const STORAGE_KEY = 'listGridViewFields';

describe('ListGridViewFieldCache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getListFieldsFromCache', () => {
    it('returns empty array when nothing is stored', () => {
      // cache context initializes an empty map so returns []
      expect(getListFieldsFromCache('view-1')).toEqual([]);
    });

    it('returns stored list of fields', () => {
      setListFieldsToCache('view-1', undefined, ['a', 'b', 'c']);
      expect(getListFieldsFromCache('view-1')).toEqual(['a', 'b', 'c']);
    });

    it('distinguishes entries with and without postFix', () => {
      setListFieldsToCache('view-1', undefined, ['no-postfix']);
      setListFieldsToCache('view-1', 'tab-a', ['tab-a-fields']);
      expect(getListFieldsFromCache('view-1')).toEqual(['no-postfix']);
      expect(getListFieldsFromCache('view-1', 'tab-a')).toEqual(['tab-a-fields']);
    });

    it('returns empty array for unknown key', () => {
      setListFieldsToCache('view-1', undefined, ['a']);
      expect(getListFieldsFromCache('view-999')).toEqual([]);
    });
  });

  describe('setListFieldsToCache', () => {
    it('persists fields to localStorage', () => {
      setListFieldsToCache('view-1', undefined, ['x', 'y']);
      expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
      expect(getListFieldsFromCache('view-1')).toEqual(['x', 'y']);
    });

    it('overwrites existing entry on repeat write', () => {
      setListFieldsToCache('view-1', undefined, ['a']);
      setListFieldsToCache('view-1', undefined, ['b', 'c']);
      expect(getListFieldsFromCache('view-1')).toEqual(['b', 'c']);
    });

    it('accepts an empty array as a legitimate value', () => {
      setListFieldsToCache('view-1', undefined, []);
      expect(getListFieldsFromCache('view-1')).toEqual([]);
    });

    it('stores multiple keys independently', () => {
      setListFieldsToCache('view-1', undefined, ['a']);
      setListFieldsToCache('view-2', undefined, ['b']);
      expect(getListFieldsFromCache('view-1')).toEqual(['a']);
      expect(getListFieldsFromCache('view-2')).toEqual(['b']);
    });
  });

  describe('clearListFieldsToCache', () => {
    it('removes a specific entry', () => {
      setListFieldsToCache('view-1', undefined, ['a']);
      clearListFieldsToCache('view-1', undefined);
      expect(getListFieldsFromCache('view-1')).toEqual([]);
    });

    it('only clears matching postFix', () => {
      setListFieldsToCache('k', 'p1', ['one']);
      setListFieldsToCache('k', 'p2', ['two']);
      clearListFieldsToCache('k', 'p1');
      expect(getListFieldsFromCache('k', 'p1')).toEqual([]);
      expect(getListFieldsFromCache('k', 'p2')).toEqual(['two']);
    });

    it('clearing an unknown key is a no-op', () => {
      clearListFieldsToCache('never-set', undefined);
      expect(getListFieldsFromCache('never-set')).toEqual([]);
    });
  });
});
