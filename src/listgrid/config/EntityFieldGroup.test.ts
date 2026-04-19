import { describe, it, expect } from 'vitest';
import { EntityFieldGroup } from './EntityFieldGroup';

describe('EntityFieldGroup', () => {
  describe('constructor', () => {
    it('uses sensible defaults when no config is passed', () => {
      const g = new EntityFieldGroup();
      expect(g.id).toBe('default');
      expect(g.label).toBe('기본 정보');
      expect(g.order).toBe(100);
      expect(g.fields).toEqual([]);
      expect(g.description).toBeUndefined();
      expect(g.requiredPermissions).toBeUndefined();
    });

    it('applies passed config values', () => {
      const g = new EntityFieldGroup({
        id: 'addr',
        label: '주소',
        order: 10,
        description: 'addr info',
        config: { open: true },
        requiredPermissions: ['ADMIN'],
      });
      expect(g.id).toBe('addr');
      expect(g.label).toBe('주소');
      expect(g.order).toBe(10);
      expect(g.description).toBe('addr info');
      expect(g.config?.open).toBe(true);
      expect(g.requiredPermissions).toEqual(['ADMIN']);
    });
  });

  describe('static create', () => {
    it('builds a group from primitive args', () => {
      const g = EntityFieldGroup.create('g1', 'Label', 5);
      expect(g.id).toBe('g1');
      expect(g.label).toBe('Label');
      expect(g.order).toBe(5);
    });
  });

  describe('withRequiredPermissions', () => {
    it('initializes requiredPermissions when not set', () => {
      const g = new EntityFieldGroup();
      g.withRequiredPermissions('READ', 'WRITE');
      expect(g.requiredPermissions).toEqual(['READ', 'WRITE']);
    });

    it('appends without duplicates', () => {
      const g = new EntityFieldGroup({
        id: 'x',
        label: 'L',
        order: 1,
        requiredPermissions: ['READ'],
      });
      g.withRequiredPermissions('READ', 'WRITE');
      expect(g.requiredPermissions).toEqual(['READ', 'WRITE']);
    });

    it('returns the same instance (fluent)', () => {
      const g = new EntityFieldGroup();
      expect(g.withRequiredPermissions('A')).toBe(g);
    });
  });

  describe('isPermitted', () => {
    it('returns true when no required permissions set', () => {
      const g = new EntityFieldGroup();
      expect(g.isPermitted()).toBe(true);
      expect(g.isPermitted([])).toBe(true);
      expect(g.isPermitted(['ADMIN'])).toBe(true);
    });

    it('returns true when requiredPermissions is an empty array', () => {
      const g = new EntityFieldGroup({
        id: 'x',
        label: 'L',
        order: 1,
        requiredPermissions: [],
      });
      expect(g.isPermitted(['ADMIN'])).toBe(true);
    });

    it('returns false when user has no permissions', () => {
      const g = new EntityFieldGroup({
        id: 'x',
        label: 'L',
        order: 1,
        requiredPermissions: ['ADMIN'],
      });
      expect(g.isPermitted(undefined)).toBe(false);
      expect(g.isPermitted([])).toBe(false);
    });

    it('returns true when user has at least one required permission', () => {
      const g = new EntityFieldGroup({
        id: 'x',
        label: 'L',
        order: 1,
        requiredPermissions: ['ADMIN', 'STAFF'],
      });
      expect(g.isPermitted(['STAFF'])).toBe(true);
    });

    it('returns false when user permissions do not overlap', () => {
      const g = new EntityFieldGroup({
        id: 'x',
        label: 'L',
        order: 1,
        requiredPermissions: ['ADMIN'],
      });
      expect(g.isPermitted(['USER'])).toBe(false);
    });
  });

  describe('clone', () => {
    it('produces a deep-ish copy with separate fields array', () => {
      const g = EntityFieldGroup.create('g1', 'Label', 5);
      g.fields.push({ name: 'a', order: 1 });
      g.span = { md: 6 };
      g.requiredPermissions = ['READ'];

      const clone = g.clone();
      expect(clone).not.toBe(g);
      expect(clone.id).toBe('g1');
      expect(clone.fields).toEqual([{ name: 'a', order: 1 }]);
      expect(clone.fields).not.toBe(g.fields);
      expect(clone.span).toEqual({ md: 6 });
      expect(clone.requiredPermissions).toEqual(['READ']);
      expect(clone.requiredPermissions).not.toBe(g.requiredPermissions);
    });

    it('clone leaves requiredPermissions undefined if source had none', () => {
      const g = EntityFieldGroup.create('g1', 'Label', 5);
      const clone = g.clone();
      expect(clone.requiredPermissions).toBeUndefined();
    });
  });
});
