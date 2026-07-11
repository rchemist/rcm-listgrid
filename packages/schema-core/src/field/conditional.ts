import type { ReactNode } from 'react';
import type { FieldEvalContext } from './eval-context';

// Conditional value types (charter C2 — "정책은 코드가 아니라 데이터다").
// A policy value is one of: a literal, a per-render-type pair, or a function of
// the FieldEvalContext. Transplanted from src/listgrid/config/Config.ts (0.3.x),
// with the function branch's param narrowed from ConditionalValue → FieldEvalContext.
//
// React coupling note (ADR-0003 §Decision 5): the *-ReactNode branches use a
// TYPE-ONLY `import type { ReactNode }` — no value-level React. The resolver
// that needs `React.isValidElement` (getConditionalReactNode, Config.ts:163-197)
// does NOT live here — it moves to the renderer layer. schema-core ships only
// the two pure resolvers below.

export interface OptionalBoolean {
  onCreate?: boolean;
  onUpdate?: boolean;
}
export interface OptionalString {
  onCreate?: string;
  onUpdate?: string;
}
export interface OptionalReactNode {
  onCreate?: ReactNode;
  onUpdate?: ReactNode;
}

export type ValuedBoolean = (ctx: FieldEvalContext) => Promise<boolean>;
export type ValuedString = (ctx: FieldEvalContext) => Promise<string>;
export type ValuedReactNode = (ctx: FieldEvalContext) => Promise<ReactNode>;

export type ConditionalBooleanValue = boolean | OptionalBoolean | ValuedBoolean;
export type ConditionalStringValue = string | OptionalString | ValuedString;
export type ConditionalReactNodeValue = ReactNode | OptionalReactNode | ValuedReactNode;

// Named aliases (charter C2 vocabulary) — required/hidden/readOnly share one
// boolean-conditional type; placeholder is string-conditional; label/help/tooltip
// carry ReactNode (type-only).
export type RequiredType = ConditionalBooleanValue;
export type HiddenType = ConditionalBooleanValue;
export type ReadOnlyType = ConditionalBooleanValue;
export type PlaceHolderType = ConditionalStringValue;
export type LabelType = string | ReactNode | false;
export type HelpTextType = ConditionalReactNodeValue;
export type TooltipType = ConditionalReactNodeValue;

/**
 * Resolve a boolean conditional against the eval context. Pure, React-free.
 * Transplanted from Config.ts:108-135 — the only change is that the render-type
 * source is `ctx.renderType` directly (the old `?? entityForm.getRenderType()`
 * fallback is gone because renderType is now carried on the context).
 */
export async function getConditionalBoolean(
  ctx: FieldEvalContext,
  condition: ConditionalBooleanValue | undefined,
): Promise<boolean> {
  if (!condition) {
    return false;
  }
  if (typeof condition === 'function') {
    return (await condition(ctx)) ?? false;
  }
  if (typeof condition === 'boolean') {
    return condition;
  }
  const renderType = ctx.renderType;
  const result = renderType
    ? renderType === 'create'
      ? condition.onCreate
      : condition.onUpdate
    : (condition.onCreate ?? condition.onUpdate);
  return result ?? false;
}

/**
 * Resolve a string conditional against the eval context. Pure, React-free.
 * Transplanted from Config.ts:137-162 (note the 0.3.x `update`-first branch
 * order is preserved for byte-parity).
 */
export async function getConditionalString(
  ctx: FieldEvalContext,
  condition: ConditionalStringValue | undefined,
): Promise<string> {
  if (!condition) {
    return '';
  }
  if (typeof condition === 'function') {
    return (await condition(ctx)) ?? '';
  }
  if (typeof condition === 'string') {
    return condition;
  }
  const renderType = ctx.renderType;
  const result =
    renderType !== undefined
      ? renderType === 'update'
        ? condition.onUpdate
        : condition.onCreate
      : (condition.onCreate ?? condition.onUpdate);
  return result ?? '';
}
