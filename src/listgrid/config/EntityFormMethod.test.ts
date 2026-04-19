import { describe, it, expect, vi } from 'vitest';
import { entityErrorToString, mergeFieldErrors, processApiError, delay } from './EntityFormMethod';
import type { FieldError } from './EntityFormTypes';
import type { IEntityError } from '../api';

describe('EntityFormMethod', () => {
  describe('entityErrorToString', () => {
    it('returns the message when error flag is truthy and message set', () => {
      const ee: IEntityError = {
        error: { error: true, message: 'boom' },
      };
      expect(entityErrorToString(ee)).toBe('boom');
    });

    it('formats a fieldError Record to "key: val1, val2"', () => {
      const ee: IEntityError = {
        error: {
          error: true,
          fieldError: { name: ['required', 'tooShort'] },
        },
      };
      expect(entityErrorToString(ee)).toBe('name: required, tooShort');
    });

    it('formats a fieldError Map to "key: val1, val2"', () => {
      const ee: IEntityError = {
        error: {
          error: true,
          fieldError: new Map<string, string[]>([['email', ['invalid']]]),
        },
      };
      expect(entityErrorToString(ee)).toBe('email: invalid');
    });

    it('fieldError wins over message (fieldError branch first)', () => {
      const ee: IEntityError = {
        error: {
          error: true,
          message: 'generic',
          fieldError: { a: ['x'] },
        },
      };
      expect(entityErrorToString(ee)).toBe('a: x');
    });

    it('returns fallback when error flag is falsy', () => {
      const ee: IEntityError = {
        error: { error: false, message: 'ignored' },
      };
      expect(entityErrorToString(ee)).toBe('failed to parse error');
    });

    it('returns fallback when no inner error body', () => {
      const ee = { error: undefined } as unknown as IEntityError;
      expect(entityErrorToString(ee)).toBe('failed to parse error');
    });
  });

  describe('mergeFieldErrors', () => {
    it('returns origin unchanged when errors is empty', () => {
      const origin: FieldError[] = [{ name: 'a', label: 'A', errors: ['x'] }];
      const merged = mergeFieldErrors(origin, []);
      expect(merged).toEqual(origin);
      // returns copies, not the same reference
      expect(merged[0]).not.toBe(origin[0]);
    });

    it('appends new field errors not in origin', () => {
      const origin: FieldError[] = [{ name: 'a', label: 'A', errors: ['x'] }];
      const extra: FieldError[] = [{ name: 'b', label: 'B', errors: ['y'] }];
      const merged = mergeFieldErrors(origin, extra);
      expect(merged.map((e) => e.name).sort()).toEqual(['a', 'b']);
    });

    it('merges errors for a duplicate name and dedupes', () => {
      const origin: FieldError[] = [{ name: 'a', label: 'A', errors: ['x', 'y'] }];
      const extra: FieldError[] = [{ name: 'a', label: 'A', errors: ['y', 'z'] }];
      const merged = mergeFieldErrors(origin, extra);
      expect(merged).toHaveLength(1);
      expect(merged[0]!.errors.sort()).toEqual(['x', 'y', 'z']);
    });

    it('preserves tabId from origin when set, else inherits from new', () => {
      const origin: FieldError[] = [{ name: 'a', label: 'A', errors: ['x'], tabId: 'tab1' }];
      const extra: FieldError[] = [{ name: 'a', label: 'A', errors: ['y'], tabId: 'tab2' }];
      const merged = mergeFieldErrors(origin, extra);
      expect(merged[0]!.tabId).toBe('tab1');

      const origin2: FieldError[] = [{ name: 'a', label: 'A', errors: ['x'] }];
      const extra2: FieldError[] = [{ name: 'a', label: 'A', errors: ['y'], tabId: 'tab2' }];
      const merged2 = mergeFieldErrors(origin2, extra2);
      expect(merged2[0]!.tabId).toBe('tab2');
    });

    it('empty origin + non-empty errors gives the errors list', () => {
      const extra: FieldError[] = [{ name: 'b', label: 'B', errors: ['y'] }];
      const merged = mergeFieldErrors([], extra);
      expect(merged).toEqual(extra);
      expect(merged[0]).not.toBe(extra[0]); // copy
    });
  });

  describe('processApiError', () => {
    it('handles a non-JSON string error as the global message', () => {
      const result = processApiError({ error: 'plain text error' });
      expect(result.hasError).toBe(true);
      expect(result.fieldErrors).toEqual([]);
      expect(result.globalError).toBe('plain text error');
    });

    it('extracts fieldError from entityError (object form)', () => {
      const result = processApiError({
        error: 'ignored',
        entityError: {
          error: {
            fieldError: { name: ['required'] },
          },
        },
      });
      expect(result.hasError).toBe(true);
      expect(result.fieldErrors).toHaveLength(1);
      expect(result.fieldErrors[0]!.name).toBe('name');
      expect(result.fieldErrors[0]!.errors).toEqual(['required']);
      // fieldErrors are present → globalError is undefined
      expect(result.globalError).toBeUndefined();
    });

    it('extracts fieldError from a Map', () => {
      const result = processApiError({
        error: 'x',
        entityError: {
          error: {
            fieldError: new Map<string, string[]>([['email', ['bad']]]),
          },
        },
      });
      expect(result.fieldErrors).toHaveLength(1);
      expect(result.fieldErrors[0]!.name).toBe('email');
      expect(result.fieldErrors[0]!.errors).toEqual(['bad']);
    });

    it('uses entityError.error string as the globalError message', () => {
      const result = processApiError({
        error: 'fallback',
        entityError: { error: 'from entityError' },
      });
      expect(result.fieldErrors).toEqual([]);
      // string entityError.error is wrapped to { message } — used as globalError
      expect(result.globalError).toBe('from entityError');
    });

    it('returns the default message when there is no parseable content', () => {
      // entityError present but fully empty → no fieldErrors, no message
      const result = processApiError({
        error: 'x',
        entityError: { error: {} },
      });
      expect(result.fieldErrors).toEqual([]);
      expect(result.globalError).toBe('저장 중 오류가 발생했습니다.');
      expect(result.hasError).toBe(true);
    });

    it('uses form.getLabel for fieldError label when form is passed', () => {
      const getLabel = vi.fn().mockReturnValue('라벨');
      const form = { getLabel } as any;
      const result = processApiError(
        {
          error: 'x',
          entityError: { error: { fieldError: { name: ['x'] } } },
        },
        form,
      );
      expect(getLabel).toHaveBeenCalledWith('name');
      expect(result.fieldErrors[0]!.label).toBe('라벨');
    });

    it('falls back to "저장 오류" label when form.getLabel returns undefined', () => {
      const form = { getLabel: vi.fn().mockReturnValue(undefined) } as any;
      const result = processApiError(
        {
          error: 'x',
          entityError: { error: { fieldError: { name: ['x'] } } },
        },
        form,
      );
      expect(result.fieldErrors[0]!.label).toBe('저장 오류');
    });

    it('returns no error info when response.error is absent (hasError still true)', () => {
      // Current behaviour: body sets hasError=true unconditionally at the end.
      const result = processApiError({});
      expect(result.hasError).toBe(true);
      expect(result.fieldErrors).toEqual([]);
      expect(result.globalError).toBe('저장 중 오류가 발생했습니다.');
    });

    it('accepts an object-shaped response.error with message', () => {
      const result = processApiError({
        error: { message: 'oops' } as unknown as string,
      });
      expect(result.fieldErrors).toEqual([]);
      expect(result.globalError).toBe('oops');
    });

    it('accepts a JSON-string error and parses fieldError', () => {
      const json = JSON.stringify({ error: { fieldError: { a: ['x'] } } });
      const result = processApiError({ error: json });
      expect(result.fieldErrors).toHaveLength(1);
      expect(result.fieldErrors[0]!.name).toBe('a');
    });
  });

  describe('delay', () => {
    it('resolves after roughly the given duration', async () => {
      const start = Date.now();
      await delay(20);
      // jitter tolerance — use ≥ 10 to avoid flake on slow CI
      expect(Date.now() - start).toBeGreaterThanOrEqual(10);
    });

    it('returns a Promise', () => {
      const p = delay(1);
      expect(p).toBeInstanceOf(Promise);
      return p;
    });
  });
});
