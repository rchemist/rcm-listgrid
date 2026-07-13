#!/usr/bin/env bash
# Load smoke (ADR-0001 수용 기준): build + npm pack the package, install it into a
# throwaway project, and assert the PUBLISHED exports resolve and load through
# real Node resolution (not the source tree). Catches ERR_UNSUPPORTED_DIR_IMPORT
# / broken exports maps that a `test -f dist/index.js` check would miss.
#
# W7-4 (2026-07-12) — rewritten for the v0.4 §2 subpath map (spec
# entityform-public-api-spec.md §2, waves §W7 결정1/2). The old script
# asserted REMOVED subpaths (`./misc`, `./headless` — gone in 0.4, see
# docs/MIGRATION.md §2) and installed the OLD 0.3.x UI peer set
# (@headlessui/react-select/react-sortablejs/@tabler/@iconify/date-fns/
# qrcode/kakao/sweetalert/nuqs — none of which `packages/*` import anymore,
# charter C7 host-provided widgets). New reality: peers reduced 26→6
# (required react/react-dom; optional next/xlsx-js-style/file-saver/
# react-daum-postcode).
#
# `./schema` and `./state` are React-runtime-free (W7-2 headless fixture
# proves this independently — see tests/headless/) — this script installs
# NO react-dependent peer for those two and still expects them to load.
#
# The root barrel must load without optional feature peers. Address lookup is
# dynamically imported only when its picker opens; Excel lives on `/excel`.
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
# Install only required root peers first. This intentionally omits every
# optional peer and proves the root package honours peerDependenciesMeta.
npm i "$TARBALL" \
  react react-dom \
  --legacy-peer-deps >/dev/null 2>&1

echo "[smoke] loading published exports…"

# root `.` — react barrel. The 0.3.x ESM caveat here (react-sortablejs, a
# CJS-only peer with no static ESM named exports, blocked `import` of the
# main barrel under Node's CJS→ESM interop) no longer applies — that peer
# was dropped along with the rest of the 0.3.x UI-widget peer set (charter
# C7, packages/* don't import it). Empirically re-verified 2026-07-12: ESM
# `import` of root now resolves cleanly, so both forms are asserted.
node -e "require('@rchemist/listgrid'); console.log('  ✓ cjs  .')"
node --input-type=module -e "await import('@rchemist/listgrid'); console.log('  ✓ esm  .')"

# /schema — React-runtime-free (W7-2 headless contract, CAP-25).
node -e "require('@rchemist/listgrid/schema'); console.log('  ✓ cjs  ./schema')"
node --input-type=module -e "await import('@rchemist/listgrid/schema'); console.log('  ✓ esm  ./schema')"

# /state — React-runtime-free (W7-2 headless contract, CAP-25).
node -e "require('@rchemist/listgrid/state'); console.log('  ✓ cjs  ./state')"
node --input-type=module -e "await import('@rchemist/listgrid/state'); console.log('  ✓ esm  ./state')"

# /utils — React-runtime-free, zero-runtime-dependency (GX-3, w7-post-seal-
# gap-analysis.md §GX-3). No peer/optional dep needed at load time.
node -e "require('@rchemist/listgrid/utils'); console.log('  ✓ cjs  ./utils')"
node --input-type=module -e "await import('@rchemist/listgrid/utils'); console.log('  ✓ esm  ./utils')"

# /excel — opt-in peers are installed only for this subpath. Both published
# module formats are runtime assertions, including native Node ESM interop.
npm i xlsx-js-style file-saver --legacy-peer-deps >/dev/null 2>&1
node -e "require('@rchemist/listgrid/excel'); console.log('  ✓ cjs  ./excel')"
node --input-type=module -e "await import('@rchemist/listgrid/excel'); console.log('  ✓ esm  ./excel')"

echo "[smoke] OK — published exports resolve and load"
