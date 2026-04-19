import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('joins multiple class strings', () => {
    const out = cn('a', 'b');
    expect(out).toContain('a');
    expect(out).toContain('b');
  });

  it('ignores falsy values', () => {
    const falsy: string | false = false;
    expect(cn('a', falsy, null, undefined, 'c')).toContain('a');
    expect(cn('a', falsy, null, undefined, 'c')).toContain('c');
    expect(cn('a', falsy, null, undefined, 'c')).not.toContain('false');
  });

  it('applies tailwind-merge for conflicting utilities (last wins)', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  it('supports conditional object syntax via clsx', () => {
    const out = cn({ foo: true, bar: false });
    expect(out).toContain('foo');
    expect(out).not.toContain('bar');
  });

  it('flattens arrays', () => {
    const out = cn(['a', 'b'], 'c');
    expect(out).toContain('a');
    expect(out).toContain('b');
    expect(out).toContain('c');
  });

  it('returns empty string when no inputs', () => {
    expect(cn()).toBe('');
  });
});
