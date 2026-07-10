#!/usr/bin/env bash
# Load smoke (ADR-0001 수용 기준): build + npm pack the package, install it into a
# throwaway project, and assert the PUBLISHED exports resolve and load through
# real Node resolution (not the source tree). Catches ERR_UNSUPPORTED_DIR_IMPORT
# / broken exports maps that a `test -f dist/index.js` check would miss.
#
# Note: pure-Node ESM `import` of the MAIN barrel is intentionally NOT asserted —
# it pulls react-sortablejs, a CJS-only peer with no static ESM named exports, so
# it fails under Node's CJS→ESM interop (works fine under Next.js/webpack, which
# is how every real consumer loads it). We assert CJS on the main barrel and both
# CJS+ESM on representative ESM-safe subpaths.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

echo "[smoke] building…"
npm run build >/dev/null

echo "[smoke] npm pack…"
TARBALL="$REPO/$(npm pack --silent)"

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP" "$TARBALL"; }
trap cleanup EXIT

cd "$TMP"
npm init -y >/dev/null 2>&1
# Install the tarball + the non-optional peers the loaded entrypoints need.
npm i "$TARBALL" \
  react react-dom \
  @headlessui/react @iconify/react @tabler/icons-react date-fns \
  react-select react-sortablejs sortablejs \
  --legacy-peer-deps >/dev/null 2>&1

echo "[smoke] loading published exports…"
node -e "require('@rchemist/listgrid'); console.log('  ✓ cjs  .')"
node -e "require('@rchemist/listgrid/misc'); console.log('  ✓ cjs  ./misc')"
node --input-type=module -e "await import('@rchemist/listgrid/misc'); console.log('  ✓ esm  ./misc')"
node -e "require('@rchemist/listgrid/headless'); console.log('  ✓ cjs  ./headless')"
node --input-type=module -e "await import('@rchemist/listgrid/headless'); console.log('  ✓ esm  ./headless')"

echo "[smoke] OK — published exports resolve and load"
