import { describe, it, expect } from 'vitest';
import { InlineMapField, isInlineMapValueBlank } from '../InlineMapField';

describe('isInlineMapValueBlank', () => {
  it('treats undefined / null as blank', () => {
    expect(isInlineMapValueBlank(undefined)).toBe(true);
    expect(isInlineMapValueBlank(null)).toBe(true);
  });

  it('treats empty plain object as blank', () => {
    expect(isInlineMapValueBlank({})).toBe(true);
  });

  it('treats empty array as blank', () => {
    expect(isInlineMapValueBlank([])).toBe(true);
  });

  it('treats empty Map as blank', () => {
    expect(isInlineMapValueBlank(new Map())).toBe(true);
  });

  it('treats object with at least one key as not blank', () => {
    expect(isInlineMapValueBlank({ a: '1' })).toBe(false);
    expect(isInlineMapValueBlank({ 1: '1', 2: '2' })).toBe(false);
  });

  it('treats non-empty array (KeyValue[]) as not blank', () => {
    expect(isInlineMapValueBlank([{ key: 'a', value: '1' }])).toBe(false);
  });

  it('treats non-empty Map as not blank', () => {
    const m = new Map<string, string>();
    m.set('a', '1');
    expect(isInlineMapValueBlank(m)).toBe(false);
  });
});

describe('InlineMapField - isBlank', () => {
  it('falls back to FormField.isBlank when pendingRef is not modified', async () => {
    const field = new InlineMapField('attributes', 1);
    expect(await field.isBlank()).toBe(true);
  });

  /**
   * 회귀 테스트: rcm-listgrid issue #1289
   *
   * 사용자가 InlineMap UI 에 값을 입력하면 입력은 pendingRef.current.value 에 누적되고
   * pendingRef.current.modified 만 true 로 표시됩니다. form 의 this.value.current 는
   * getSaveValue 시점까지 비어있는 상태로 남습니다.
   *
   * 이전 버전에서는 FormField.isBlank 가 this.value.current 만 보았기 때문에,
   * required + 사용자 입력 있음 → "필수 값입니다" 에러로 저장이 차단되었습니다.
   */
  it('returns false when pendingRef has values even though this.value.current is empty', async () => {
    const field = new InlineMapField('attributes', 1).withRequired(true);
    field.pendingRef.current = {
      value: { 1: '1', 2: '2' },
      modified: true,
    };
    expect(await field.isBlank()).toBe(false);
  });

  it('returns true when pendingRef is modified but cleared to empty object', async () => {
    const field = new InlineMapField('attributes', 1);
    field.pendingRef.current = {
      value: {},
      modified: true,
    };
    expect(await field.isBlank()).toBe(true);
  });

  it('returns false when pendingRef value is non-empty KeyValue array', async () => {
    const field = new InlineMapField('attributes', 1);
    field.pendingRef.current = {
      value: [{ key: 'foo', value: 'bar' }],
      modified: true,
    };
    expect(await field.isBlank()).toBe(false);
  });

  it('returns true when pendingRef value is empty array', async () => {
    const field = new InlineMapField('attributes', 1);
    field.pendingRef.current = {
      value: [],
      modified: true,
    };
    expect(await field.isBlank()).toBe(true);
  });
});
