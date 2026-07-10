import { isValidElement, type ReactNode } from 'react';
import type {
  ConditionalReactNodeValue,
  FieldEvalContext,
  OptionalReactNode,
} from '@listgrid/schema-core';

// getConditionalReactNode — the ReactNode-valued conditional resolver
// schema-core deliberately does NOT ship (ADR-0003 §Decision 5: the
// *-ReactNode conditional TYPES are pure/type-only in schema-core, but
// resolving one needs `React.isValidElement`, which is value-level React —
// forbidden there, legal here). Verbatim port of 0.3.x
// `src/listgrid/config/Config.ts:163-197`, with the same signature
// narrowing `getConditionalBoolean`/`getConditionalString` already made
// (schema-core `field/conditional.ts`): the old `ConditionalValue` param
// (which carried a whole `entityForm` for its `getRenderType()` fallback)
// is replaced by {@link FieldEvalContext}, whose `renderType` is already
// resolved — no `entityForm` fallback needed.
//
// First consumer: MessageViewField's `message` (EA-A `messageView`); also
// reusable for `helpText`/`tooltip` once a renderer needs to resolve those.

function isOptionalReactNode(condition: unknown): condition is OptionalReactNode {
  return (
    condition !== null &&
    typeof condition === 'object' &&
    (typeof (condition as OptionalReactNode).onCreate !== 'undefined' ||
      typeof (condition as OptionalReactNode).onUpdate !== 'undefined')
  );
}

/**
 * Resolve a ReactNode conditional against the eval context. Transplant of
 * `Config.ts:163-197` — same branch order: falsy → '', function → call it
 * (fallback ''), string/number/valid-element → pass through as-is,
 * `{onCreate, onUpdate}` → pick by `ctx.renderType` (create-first, falling
 * back to `onCreate ?? onUpdate` when renderType is unset), else → `null`.
 */
export async function getConditionalReactNode(
  ctx: FieldEvalContext,
  condition: ConditionalReactNodeValue | undefined,
): Promise<ReactNode> {
  if (!condition) {
    return '';
  }

  if (typeof condition === 'function') {
    return (await condition(ctx)) ?? '';
  }

  if (typeof condition === 'string' || typeof condition === 'number' || isValidElement(condition)) {
    return condition;
  }

  if (isOptionalReactNode(condition)) {
    const renderType = ctx.renderType;
    const result = renderType
      ? renderType === 'create'
        ? condition.onCreate
        : condition.onUpdate
      : (condition.onCreate ?? condition.onUpdate);
    return result ?? '';
  }

  return null;
}
