import { describe, expect, it } from 'vitest';
import type { FieldEvalContext } from '../field/eval-context';
import { MessageViewField } from '../field/message-view-field';

// MessageViewField (EA-A fan-out — MessageView). Transplant of 0.3.x
// MessageViewField (src/listgrid/components/fields/MessageViewField.tsx:9-38)
// — display-only, no runtime value, no builders beyond the inherited
// FormField ones. These tests lock the two constructor-forced invariants
// (readonly/hideLabel always true, MessageViewField.tsx:14-15) and the
// consequence that follows from them: validate() always short-circuits
// clean, regardless of `required`/blank value, because FormField.validate
// (form-field.ts:109-115) skips readonly fields before the required-blank
// check ever runs.

function ctx(
  value: FieldEvalContext['value'],
  renderType: 'create' | 'update' = 'create',
): FieldEvalContext {
  return { renderType, value };
}

describe('MessageViewField (constructor)', () => {
  it('carries the dedicated messageView type (not the 0.3.x-reused "custom")', () => {
    const f = new MessageViewField('notice', 200, '안내 메시지');
    expect(f.type).toBe('messageView');
    expect(f.getName()).toBe('notice');
    expect(f.getOrder()).toBe(200);
  });

  it('forces readonly=true and hideLabel=true (0.3.x MessageViewField.tsx:14-15)', () => {
    const f = new MessageViewField('notice', 200, '안내 메시지');
    expect(f.readonly).toBe(true);
    expect(f.hideLabel).toBe(true);
  });

  it('stores the message conditional as-is (string literal) — resolution is a react-layer concern', () => {
    const f = new MessageViewField('notice', 200, '안내 메시지');
    expect(f.message).toBe('안내 메시지');
  });

  it('stores an {onCreate, onUpdate} conditional message unresolved', () => {
    const condition = { onCreate: '생성 안내', onUpdate: '수정 안내' };
    const f = new MessageViewField('notice', 200, condition);
    expect(f.message).toBe(condition);
  });

  it('stores a function-valued conditional message unresolved', () => {
    const fn = async () => '동적 안내';
    const f = new MessageViewField('notice', 200, fn);
    expect(f.message).toBe(fn);
  });
});

describe('MessageViewField.validate (base FormField — always skips, readonly is constructor-forced)', () => {
  it('required + blank value → still valid (readonly short-circuits before the required-blank check)', async () => {
    const f = new MessageViewField('notice', 200, '안내').withRequired(true).withLabel('공지');
    expect(await f.validate(ctx({ current: '' }))).toEqual([]);
  });

  it('not required + blank → valid', async () => {
    const f = new MessageViewField('notice', 200, '안내');
    expect(await f.validate(ctx(undefined))).toEqual([]);
  });

  it('declared validations never run either (readonly gate is unconditional)', async () => {
    const f = new MessageViewField('notice', 200, '안내').withRequired(true);
    // no explicit validations declared, but even a required-blank failure —
    // the strongest possible validate() outcome — is suppressed.
    expect(await f.validate(ctx({ current: undefined }))).toEqual([]);
  });
});

describe('MessageViewField.clone', () => {
  it('preserves type/message/readonly/hideLabel across a structural clone', () => {
    const original = new MessageViewField('notice', 200, '안내 메시지').withLabel('공지');
    const copy = original.clone();
    expect(copy).not.toBe(original);
    expect(copy.type).toBe('messageView');
    expect(copy.message).toBe('안내 메시지');
    expect(copy.readonly).toBe(true);
    expect(copy.hideLabel).toBe(true);
    expect(copy.getLabel()).toBe('공지');
  });

  it('drops the value unless includeValue is passed (inherited FormField behavior; MessageView never sets one in practice)', () => {
    const original = new MessageViewField('notice', 200, '안내 메시지');
    expect(original.clone().value).toBeUndefined();
  });
});
