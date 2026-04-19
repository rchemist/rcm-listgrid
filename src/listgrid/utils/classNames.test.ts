import { describe, it, expect } from 'vitest';
import { mergeSlot, resolveSlots } from './classNames';

describe('classNames', () => {
  describe('mergeSlot', () => {
    it('returns base when no override provided', () => {
      expect(mergeSlot('rcm-field-input')).toBe('rcm-field-input');
    });

    it('returns base when override is empty string', () => {
      expect(mergeSlot('rcm-field-input', '')).toBe('rcm-field-input');
    });

    it('merges base + override', () => {
      const merged = mergeSlot('rcm-field-input', 'extra-class');
      expect(merged).toContain('rcm-field-input');
      expect(merged).toContain('extra-class');
    });

    it('lets host override tailwind utility via tailwind-merge', () => {
      // cn uses twMerge, so override should win for conflicting utilities
      const merged = mergeSlot('p-4', 'p-2');
      expect(merged).toBe('p-2');
    });
  });

  describe('resolveSlots', () => {
    const defaults = { root: 'rcm-root', input: 'rcm-input' };

    it('returns defaults when no overrides provided', () => {
      expect(resolveSlots(defaults)).toEqual(defaults);
    });

    it('merges matching slots', () => {
      const result = resolveSlots(defaults, { input: 'extra' });
      expect(result.root).toBe('rcm-root');
      expect(result.input).toContain('rcm-input');
      expect(result.input).toContain('extra');
    });

    it('ignores undefined override values', () => {
      const result = resolveSlots(defaults, { input: undefined });
      expect(result.input).toBe('rcm-input');
    });

    it('returned object does not mutate defaults', () => {
      const originalRoot = defaults.root;
      resolveSlots(defaults, { root: 'other' });
      expect(defaults.root).toBe(originalRoot);
    });
  });
});
