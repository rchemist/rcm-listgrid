// getConditionalReactNode — transplant of 0.3.x
// `src/listgrid/config/Config.ts:163-197`. Mirrors that function's branch
// order 1:1: falsy → '', function → await (fallback ''), string/number/valid
// React element → passthrough, {onCreate,onUpdate} → pick by renderType
// (falling back to onCreate ?? onUpdate when renderType is unset), else →
// null. First real consumer is MessageViewField (EA-A `messageView`).

import { describe, expect, it } from 'vitest';
import type { ConditionalReactNodeValue, FieldEvalContext } from '@listgrid/schema-core';
import { getConditionalReactNode } from '../util/conditional-react-node';

function ctx(renderType?: 'create' | 'update'): FieldEvalContext {
  return renderType ? { renderType } : {};
}

describe('getConditionalReactNode (transplant of Config.ts:163-197)', () => {
  it('falsy conditions resolve to empty string', async () => {
    expect(await getConditionalReactNode(ctx(), undefined)).toBe('');
    expect(await getConditionalReactNode(ctx(), '')).toBe('');
    // 0 is falsy in JS — verbatim transplant of `!condition`, so it hits the
    // same branch as undefined/'' even though 0 is a valid ReactNode.
    expect(await getConditionalReactNode(ctx(), 0)).toBe('');
  });

  it('plain string/number passes through unchanged', async () => {
    expect(await getConditionalReactNode(ctx(), 'hello')).toBe('hello');
    expect(await getConditionalReactNode(ctx(), 42)).toBe(42);
  });

  it('a valid React element passes through unchanged (same reference)', async () => {
    const el = <span>hi</span>;
    expect(await getConditionalReactNode(ctx(), el)).toBe(el);
  });

  it('function branch: awaits the value, falls back to "" on a nullish resolve', async () => {
    const fn = async () => 'dynamic value';
    expect(await getConditionalReactNode(ctx(), fn)).toBe('dynamic value');

    const nullFn = async () => null;
    expect(await getConditionalReactNode(ctx(), nullFn)).toBe('');
  });

  it('function branch receives the eval context', async () => {
    const fn = async (c: FieldEvalContext) => `renderType=${c.renderType}`;
    expect(await getConditionalReactNode(ctx('update'), fn)).toBe('renderType=update');
  });

  it('{onCreate, onUpdate}: picks by ctx.renderType', async () => {
    const condition = { onCreate: 'created view', onUpdate: 'updated view' };
    expect(await getConditionalReactNode(ctx('create'), condition)).toBe('created view');
    expect(await getConditionalReactNode(ctx('update'), condition)).toBe('updated view');
  });

  it('{onCreate, onUpdate}: renderType unset falls back to onCreate ?? onUpdate', async () => {
    expect(await getConditionalReactNode(ctx(), { onUpdate: 'updated only' })).toBe('updated only');
    expect(await getConditionalReactNode(ctx(), { onCreate: 'created', onUpdate: 'updated' })).toBe(
      'created',
    );
  });

  it('{onCreate, onUpdate}: missing branch for the active renderType falls back to ""', async () => {
    expect(await getConditionalReactNode(ctx('update'), { onCreate: 'created only' })).toBe('');
  });

  it('an unrecognized object shape resolves to null', async () => {
    const condition = { foo: 'bar' } as unknown as ConditionalReactNodeValue;
    expect(await getConditionalReactNode(ctx(), condition)).toBeNull();
  });
});
