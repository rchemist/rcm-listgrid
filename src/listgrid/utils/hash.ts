// Self-implemented hex hash to replace next/dist/shared/lib/hash#hexHash.
//
// The original Next.js internal hash is FNV-1a on a 32-bit accumulator,
// formatted as unsigned hex. This implementation matches that behavior so
// call sites (cache keys, React `key` props) keep stable output across
// the framework-free migration.

export function hexHash(value: string): string {
  let h = 0x811c9dc5; // FNV offset basis, 32-bit
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    // FNV prime 16777619, force 32-bit via Math.imul
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}
