import { describe, it, expect } from 'vitest';
import { EntityTab } from './EntityTab';
import type { EntityItem } from './EntityItem';

/**
 * Minimal EntityItem stub — only the methods EntityTab actually calls (getName / getOrder)
 * plus the `name` property it inspects for duplication. Everything else is irrelevant here.
 */
function makeItem(name: string, order: number): EntityItem {
  return {
    name,
    order,
    getName: () => name,
    getOrder: () => order,
  } as unknown as EntityItem;
}

describe('EntityTab', () => {
  describe('constructor', () => {
    it('uses default values when no config is given', () => {
      const t = new EntityTab();
      expect(t.id).toBe('default');
      expect(t.order).toBe(100);
      expect(t.label).toBe('기본 정보');
      expect(t.hidden).toBe(false);
      expect(t.description).toBeUndefined();
      expect(t.fieldGroups).toEqual([]);
      expect(t.requiredPermissions).toBeUndefined();
    });

    it('applies passed config', () => {
      const t = new EntityTab({
        id: 'info',
        label: '정보',
        order: 5,
        hidden: true,
        description: 'some info',
        requiredPermissions: ['READ'],
      });
      expect(t.id).toBe('info');
      expect(t.label).toBe('정보');
      expect(t.order).toBe(5);
      expect(t.hidden).toBe(true);
      expect(t.description).toBe('some info');
      expect(t.requiredPermissions).toEqual(['READ']);
    });
  });

  describe('withRequiredPermissions', () => {
    it('sets permissions from scratch', () => {
      const t = new EntityTab();
      t.withRequiredPermissions('A', 'B');
      expect(t.requiredPermissions).toEqual(['A', 'B']);
    });

    it('merges without duplicates', () => {
      const t = new EntityTab({
        id: 'x',
        label: 'L',
        order: 1,
        requiredPermissions: ['A'],
      });
      t.withRequiredPermissions('A', 'B');
      expect(t.requiredPermissions).toEqual(['A', 'B']);
    });

    it('is fluent', () => {
      const t = new EntityTab();
      expect(t.withRequiredPermissions('A')).toBe(t);
    });
  });

  describe('isPermitted', () => {
    it('is true when no permissions required', () => {
      const t = new EntityTab();
      expect(t.isPermitted()).toBe(true);
      expect(t.isPermitted(['any'])).toBe(true);
    });

    it('is false when user lacks all permissions', () => {
      const t = new EntityTab({
        id: 'x',
        label: 'L',
        order: 1,
        requiredPermissions: ['ADMIN'],
      });
      expect(t.isPermitted(undefined)).toBe(false);
      expect(t.isPermitted([])).toBe(false);
      expect(t.isPermitted(['USER'])).toBe(false);
    });

    it('is true when user has at least one required permission', () => {
      const t = new EntityTab({
        id: 'x',
        label: 'L',
        order: 1,
        requiredPermissions: ['ADMIN', 'STAFF'],
      });
      expect(t.isPermitted(['STAFF'])).toBe(true);
    });
  });

  describe('addField', () => {
    it('creates a new field group if it does not exist and adds the item', () => {
      const t = new EntityTab();
      t.addField({ id: 'fg1', label: 'FG1', order: 1 }, makeItem('name', 2));
      expect(t.fieldGroups).toHaveLength(1);
      expect(t.fieldGroups[0]!.id).toBe('fg1');
      expect(t.fieldGroups[0]!.fields).toEqual([{ name: 'name', order: 2 }]);
    });

    it('reuses an existing field group by id', () => {
      const t = new EntityTab();
      t.addField({ id: 'fg1', label: 'FG1', order: 1 }, makeItem('a', 1));
      t.addField({ id: 'fg1', label: 'FG1', order: 1 }, makeItem('b', 2));
      expect(t.fieldGroups).toHaveLength(1);
      expect(t.fieldGroups[0]!.fields.map((f) => f.name)).toEqual(['a', 'b']);
    });

    it('keeps field groups sorted by order when adding new ones', () => {
      const t = new EntityTab();
      t.addField({ id: 'fg2', label: 'FG2', order: 20 }, makeItem('a', 1));
      t.addField({ id: 'fg1', label: 'FG1', order: 10 }, makeItem('b', 1));
      expect(t.fieldGroups.map((g) => g.id)).toEqual(['fg1', 'fg2']);
    });

    it('does not add a duplicate field (same name) to the same group', () => {
      const t = new EntityTab();
      t.addField({ id: 'fg1', label: 'FG1', order: 1 }, makeItem('dup', 1));
      t.addField({ id: 'fg1', label: 'FG1', order: 1 }, makeItem('dup', 2));
      expect(t.fieldGroups[0]!.fields).toEqual([{ name: 'dup', order: 1 }]);
    });
  });

  describe('clone', () => {
    it('produces an independent copy of scalar fields', () => {
      const t = new EntityTab({
        id: 'info',
        label: 'L',
        order: 3,
        hidden: true,
        description: 'desc',
        requiredPermissions: ['READ'],
      });
      const clone = t.clone();
      expect(clone).not.toBe(t);
      expect(clone.id).toBe('info');
      expect(clone.label).toBe('L');
      expect(clone.order).toBe(3);
      expect(clone.hidden).toBe(true);
      expect(clone.description).toBe('desc');
      expect(clone.requiredPermissions).toEqual(['READ']);
      expect(clone.requiredPermissions).not.toBe(t.requiredPermissions);
    });

    it('clones nested field groups (deep)', () => {
      const t = new EntityTab();
      t.addField({ id: 'fg1', label: 'FG1', order: 1 }, makeItem('a', 1));

      const clone = t.clone();
      expect(clone.fieldGroups).toHaveLength(1);
      expect(clone.fieldGroups[0]).not.toBe(t.fieldGroups[0]);
      expect(clone.fieldGroups[0]!.fields).toEqual([{ name: 'a', order: 1 }]);
    });

    it('leaves requiredPermissions undefined when source has none', () => {
      const t = new EntityTab();
      expect(t.clone().requiredPermissions).toBeUndefined();
    });
  });
});
