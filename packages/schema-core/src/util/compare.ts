// Deep-equality helpers — transplanted verbatim from src/listgrid/misc/index.ts
// (0.3.x isEquals/isEqualCollection, which FormField.isDirty depends on). These
// are charter-C4 micro-decisions: changing them changes dirty-detection, so they
// move unchanged. React-free.

function isNulls(a: unknown, b: unknown): boolean {
  return (a === null || a === undefined) && (b === null || b === undefined);
}

/** plain-object deep comparison (matches original CompareUtil.isEquals). */
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

/** element-wise (or order-insensitive) array equality. */
export function isEqualCollection(
  value: unknown[],
  other: unknown[],
  ignoreOrder = false,
): boolean {
  if (value.length !== other.length) return false;
  if (ignoreOrder) {
    return value.every((v) => other.includes(v));
  }
  return value.every((v, i) => isEquals(v, other[i]));
}
