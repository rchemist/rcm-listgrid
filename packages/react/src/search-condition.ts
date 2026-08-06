import type { EntityField, FormField, QueryConditionType } from '@listgrid/schema-core';

/**
 * The field families that used LIKE in the 0.2.x list filters. `string` is
 * accepted for compatibility with hosts that use that legacy/custom type
 * name even though schema-core's built-in string field is named `text`.
 */
export const LIKE_FIELD_TYPES = new Set(['text', 'email', 'phone', 'textarea', 'string']);

const SELECT_FIELD_TYPES = new Set(['select', 'multiselect', 'checkbox', 'tag', 'customOption']);

const QUERY_CONDITION_TYPES = new Set<string>([
  'EQUAL',
  'NOT_EQUAL',
  'IN',
  'NOT_IN',
  'LIKE',
  'NOT_LIKE',
  'GREATER_THAN',
  'GREATER_THAN_EQUAL',
  'LESS_THAN',
  'LESS_THAN_EQUAL',
  'BETWEEN',
  'IS_NULL',
  'IS_NOT_NULL',
  'IS_BLANK',
  'IS_NOT_BLANK',
  'NULL_OR_EQUAL',
  'NULL_OR_BLANK',
  'IN_RANGE',
  'NOT_IN_RANGE',
  'DATE_BEFORE',
  'DATE_AFTER',
  'DATE_BETWEEN',
  'JSON_CONTAINS',
  'EXISTS',
] satisfies QueryConditionType[]);

export function isQueryConditionType(value: unknown): value is QueryConditionType {
  return typeof value === 'string' && QUERY_CONDITION_TYPES.has(value);
}

/**
 * Resolve the wire operator for a list filter. An explicitly configured
 * renderer-selected operator wins, followed by a valid
 * `withFilter({ operator })` value. Otherwise array-valued select families
 * use IN, text-like fields use LIKE, and every exact/value field uses EQUAL.
 */
export function searchConditionFor(
  field: EntityField,
  value?: unknown,
  rendererOperator?: QueryConditionType,
): QueryConditionType {
  if (isQueryConditionType(rendererOperator)) return rendererOperator;
  const config = (field as FormField).getFilterConfig();
  const configuredOperator = config ? config.operator : undefined;
  if (isQueryConditionType(configuredOperator)) return configuredOperator;
  if (SELECT_FIELD_TYPES.has(field.type) && Array.isArray(value)) return 'IN';
  return LIKE_FIELD_TYPES.has(field.type) ? 'LIKE' : 'EQUAL';
}
