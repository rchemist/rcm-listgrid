// Comparison utilities — transplanted verbatim from src/listgrid/misc/index.ts
// (0.3.x CompareUtil.ts). GX-3 (w7-post-seal-gap-analysis.md §GX-3).
// React-free, zero runtime dependencies.
//
// `isEquals`/`isEqualCollection` ALSO exist privately inside
// `@listgrid/schema-core/src/util/compare.ts` (FormField.isDirty depends on
// that internal copy — untouched by this file). They are hosted here too
// (not re-exported from schema-core's barrel) so this package stays
// self-contained and adding them doesn't grow `/schema`'s public-surface
// count (check:surface gate — /schema sat at 188/190 at authoring time,
// 2 headroom only). This is the ONE public copy of these two symbols —
// schema-core's copy stays private/internal.
//
// `isNulls` here is the OLD PUBLIC asymmetric version (misc/index.ts:171-181)
// — NOT the same as schema-core's private, symmetric-narrowed `isNulls`
// (util/compare.ts:6-8, which only treats null+undefined pairs as nullish).
// This one additionally treats `''` as nullish when paired against an
// `undefined` counterpart (but NOT against `null` — asymmetric by design,
// matching the original CompareUtil.isNulls exactly). Do not "fix" this.

/**
 * Asymmetric nullish-pair check (verbatim port of the 0.3.x public
 * `CompareUtil.isNulls`): `undefined` treats a `null` OR `''` partner as
 * nullish-equal; `null`/`''` only treat an `undefined` partner as
 * nullish-equal (i.e. `isNulls(null, '')` is `false`).
 */
export function isNulls(value: unknown, other: unknown): boolean {
  if (value === undefined && other === undefined) return true;
  if (value === undefined) {
    if (other === null) return true;
    if (other === '') return true;
  } else if (other === undefined) {
    if (value === null) return true;
    if (value === '') return true;
  }
  return false;
}

/** Deep equality: nullish-pair short-circuit, reference/primitive equality, then
 *  plain-object key-wise recursion. Arrays are NOT deep-compared here (matches
 *  original CompareUtil.isEquals — use `isEqualCollection` for arrays). */
export function isEquals(value: unknown, other: unknown): boolean {
  if (isNulls(value, other)) return true;
  if (value === other) return true;

  if (
    typeof value === 'object' &&
    typeof other === 'object' &&
    value !== null &&
    other !== null &&
    !Array.isArray(value) &&
    !Array.isArray(other)
  ) {
    const a = value as Record<string, unknown>;
    const b = other as Record<string, unknown>;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => keysB.includes(key) && isEquals(a[key], b[key]));
  }
  return false;
}

export function isEqualsIgnoreCase(
  value: string | null | undefined,
  other: string | null | undefined,
): boolean {
  if (isNulls(value, other)) return true;
  if (value == null || other == null) return false;
  return value.toLowerCase() === other.toLowerCase();
}

/** Element-wise (or order-insensitive, via `ignoreOrder`) array equality. */
export function isEqualCollection(
  value: unknown[],
  other: unknown[],
  ignoreOrder: boolean = false,
): boolean {
  if (value.length !== other.length) return false;
  if (ignoreOrder) {
    return value.every((v) => other.includes(v));
  }
  return value.every((v, i) => isEquals(v, other[i]));
}

export function isEmpty(collection: Map<unknown, unknown> | unknown[] | undefined | null): boolean {
  if (collection === undefined || collection === null) return true;
  if (collection instanceof Map) return collection.size === 0;
  return collection.length === 0;
}

export function isPositive(value?: number): boolean {
  if (value === undefined || value === null) return false;
  return value > 0;
}

export function isNegative(value?: number): boolean {
  if (value === undefined || value === null) return false;
  return value < 0;
}
