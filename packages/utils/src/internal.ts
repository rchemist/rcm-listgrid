// Private helpers shared across this package's modules — NOT exported from
// the barrel (src/index.ts). Mirrors src/listgrid/misc/index.ts's
// module-local `isBlank`/`isTrue` (0.3.x StringUtil.ts/BooleanUtil.ts
// subsets), which were never part of the public misc surface either.

export function isBlank(data: unknown): boolean {
  return data === undefined || data === null || data === '';
}
