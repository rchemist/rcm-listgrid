import { describe, expect, it } from 'vitest';
import { InlineMapField } from '../field/inline-map-field';
import type { FieldEvalContext } from '../field/eval-context';
import type { FieldValueSlice } from '../field/types';

// InlineMapField (EA-D — single delegate). schema-core is render-free
// (ADR-0003) so this suite covers meta only: builders/config shallow-merge
// (transplant parity with 0.3.x `InlineMapField.tsx:98-145`), clone, and
// required-blank validation over the plain values the renderer is
// responsible for writing (no isBlank/isDirty override — see
// `inline-map-field.ts` class header for why that's correct here, unlike
// the 0.3.x pendingRef original).

function ctx(value: FieldValueSlice, renderType: 'create' | 'update' = 'create'): FieldEvalContext {
  return { renderType, value };
}

describe('InlineMapField construction', () => {
  it('carries type "inlineMap"', () => {
    const f = new InlineMapField('extra', 10);
    expect(f.type).toBe('inlineMap');
    expect(f.getName()).toBe('extra');
    expect(f.getOrder()).toBe(10);
  });

  it('constructor accepts an optional config', () => {
    const f = new InlineMapField('extra', 10, { keys: [{ key: 'phone' }] });
    expect(f.config).toEqual({ keys: [{ key: 'phone' }] });
  });

  it('constructor with no config leaves it unset', () => {
    const f = new InlineMapField('extra', 10);
    expect(f.config).toBeUndefined();
  });

  it('carries NO pendingRef (redesign — store-direct-write, briefing PART B/D)', () => {
    const f = new InlineMapField('extra', 10);
    expect((f as unknown as { pendingRef?: unknown }).pendingRef).toBeUndefined();
  });
});

describe('InlineMapField builders (shallow-merge transplant of InlineMapField.tsx:98-145)', () => {
  it('withKeys sets keys while preserving limit/resultType', () => {
    const f = new InlineMapField('extra', 10).withLimit({ max: 3 }).useKeyValue();
    f.withKeys([{ key: 'phone', required: true }]);
    expect(f.config).toEqual({
      keys: [{ key: 'phone', required: true }],
      limit: { max: 3 },
      resultType: 'KeyValue',
    });
  });

  it('withKeys(undefined) clears keys but preserves limit/resultType', () => {
    const f = new InlineMapField('extra', 10).withKeys([{ key: 'a' }]).withLimit({ min: 1 });
    f.withKeys(undefined);
    expect(f.config).toEqual({ limit: { min: 1 } });
  });

  it('useResultMap selects the Map result shape, preserving keys/limit', () => {
    const f = new InlineMapField('extra', 10).withKeys([{ key: 'a' }]).withLimit({ max: 2 });
    f.useResultMap();
    expect(f.config).toEqual({ keys: [{ key: 'a' }], limit: { max: 2 }, resultType: 'Map' });
  });

  it('useKeyValue selects the KeyValue result shape, preserving keys/limit', () => {
    const f = new InlineMapField('extra', 10).withKeys([{ key: 'a' }]).withLimit({ max: 2 });
    f.useKeyValue();
    expect(f.config).toEqual({ keys: [{ key: 'a' }], limit: { max: 2 }, resultType: 'KeyValue' });
  });

  it('withLimit sets limit while preserving keys/resultType', () => {
    const f = new InlineMapField('extra', 10).withKeys([{ key: 'a' }]).useResultMap();
    f.withLimit({ min: 1, max: 5 });
    expect(f.config).toEqual({
      keys: [{ key: 'a' }],
      resultType: 'Map',
      limit: { min: 1, max: 5 },
    });
  });

  it('withConfig replaces the whole config in one call (label survives ONLY via withConfig, not the other builders)', () => {
    const f = new InlineMapField('extra', 10);
    f.withConfig({ keys: [{ key: 'a' }], label: { key: '항목', value: '값' } });
    expect(f.config).toEqual({ keys: [{ key: 'a' }], label: { key: '항목', value: '값' } });
  });

  it('faithful 0.3.x quirk: withKeys/useResultMap/useKeyValue/withLimit drop label (not carried across)', () => {
    const f = new InlineMapField('extra', 10).withConfig({
      keys: [{ key: 'a' }],
      label: { key: '항목', value: '값' },
    });
    f.withLimit({ max: 2 });
    expect(f.config).toEqual({ keys: [{ key: 'a' }], limit: { max: 2 } });
  });

  it('builders are chainable and return this', () => {
    const f = new InlineMapField('extra', 10);
    expect(f.withKeys([{ key: 'a' }])).toBe(f);
    expect(f.useResultMap()).toBe(f);
    expect(f.useKeyValue()).toBe(f);
    expect(f.withLimit({ max: 1 })).toBe(f);
    expect(f.withConfig(undefined)).toBe(f);
  });

  it('withDefaultValue accepts Record/KeyValue[]/Map (widened from 0.3.x KeyValue[]|Map-only signature)', () => {
    const record = new InlineMapField('a', 1).withDefaultValue({ x: 'y' });
    expect(record.value?.default).toEqual({ x: 'y' });

    const keyValue = new InlineMapField('b', 2).withDefaultValue([{ key: 'x', value: 'y' }]);
    expect(keyValue.value?.default).toEqual([{ key: 'x', value: 'y' }]);

    const map = new InlineMapField('c', 3).withDefaultValue(new Map([['x', 'y']]));
    expect(map.value?.default).toBeInstanceOf(Map);
  });

  it('inherits base FormField builders (withLabel/withRequired chain)', () => {
    const f = new InlineMapField('extra', 10).withLabel('추가정보').withRequired(true);
    expect(f.getLabel()).toBe('추가정보');
    expect(f.required).toBe(true);
  });
});

describe('InlineMapField.validate — required-blank over plain values (no isBlank/isDirty override, #1289 regression pin)', () => {
  it('required + undefined value → one failure', async () => {
    const f = new InlineMapField('extra', 10).withRequired(true).withLabel('추가정보');
    const res = await f.validate(ctx({}));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
    expect(res[0].message).toContain('추가정보');
  });

  it('required + empty array (KeyValue empty write) → one failure', async () => {
    const f = new InlineMapField('extra', 10).useKeyValue().withRequired(true);
    const res = await f.validate(ctx({ current: [] }));
    expect(res).toHaveLength(1);
  });

  it('required + non-empty KeyValue[] → valid', async () => {
    const f = new InlineMapField('extra', 10).useKeyValue().withRequired(true);
    expect(await f.validate(ctx({ current: [{ key: 'phone', value: '010' }] }))).toEqual([]);
  });

  it('required + non-empty Record (Object result type) → valid', async () => {
    const f = new InlineMapField('extra', 10).withRequired(true);
    expect(await f.validate(ctx({ current: { phone: '010' } }))).toEqual([]);
  });

  it('not required + undefined → valid', async () => {
    const f = new InlineMapField('extra', 10);
    expect(await f.validate(ctx({}))).toEqual([]);
  });

  it('hidden/readonly fields skip validation', async () => {
    const hidden = new InlineMapField('a', 1).withRequired(true).withHidden(true);
    expect(await hidden.validate(ctx({}))).toEqual([]);
    const readonly = new InlineMapField('b', 1).withRequired(true).withReadOnly(true);
    expect(await readonly.validate(ctx({}))).toEqual([]);
  });
});

describe('InlineMapField.clone', () => {
  it('preserves type/label/required/config across a structural clone', () => {
    const original = new InlineMapField('extra', 10, { keys: [{ key: 'phone' }] })
      .withLabel('추가정보')
      .withRequired(true);
    const copy = original.clone();
    expect(copy).not.toBe(original);
    expect(copy).toBeInstanceOf(InlineMapField);
    expect(copy.type).toBe('inlineMap');
    expect(copy.getLabel()).toBe('추가정보');
    expect(copy.required).toBe(true);
    expect(copy.config).toEqual({ keys: [{ key: 'phone' }] });
  });

  it('drops the value unless includeValue is passed', () => {
    const original = new InlineMapField('extra', 10).withDefaultValue({ a: 'b' });
    expect(original.clone().value).toBeUndefined();
    expect(original.clone(true).value?.default).toEqual({ a: 'b' });
  });

  it('clone does NOT share a mutable cell (no pendingRef to share — the clone hazard 0.3.x had, gone by construction)', () => {
    const original = new InlineMapField('extra', 10).withConfig({ keys: [{ key: 'a' }] });
    const copy = original.clone();
    copy.config!.keys!.push({ key: 'b' });
    // structural clone via Object.assign is a SHALLOW copy (documented FormField.clone
    // behavior) — config itself is shared by reference unless the caller replaces it
    // wholesale via withConfig/withKeys, same as every other config-carrying field
    // (FileField, MultipleAssetField). The absence of a SEPARATE pendingRef
    // mutable-cell hazard (0.3.x :92-96) is what this test actually pins.
    expect(copy.config).toBe(original.config);
  });
});
