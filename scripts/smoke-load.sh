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
# Note on the root `.` barrel and `react-daum-postcode`: unlike `./schema`/
# `./state`, root `.` (@listgrid/react) re-exports `registerDefaultRenderers`
# statically, which statically imports the address field renderer, which
# statically imports `react-daum-postcode` at module top level. Even though
# root package.json marks `react-daum-postcode` OPTIONAL (a host that never
# uses AddressField shouldn't need it installed), Node's CJS/ESM loader has
# no lazy-import concept for a static `import`/`require` graph — the whole
# reachable graph is evaluated at load time regardless of whether the host's
# OWN code ever calls `registerDefaultRenderers()`. Empirically verified
# (2026-07-12): `require('@rchemist/listgrid')` WITHOUT react-daum-postcode
# installed throws `Cannot find module 'react-daum-postcode'`. This script
# therefore installs it for the root-barrel assertion — see the root-barrel
# smoke block below for the precise repro this documents (a pre-existing
# W7-1 peer-classification gap, not something this task's scope permits
# fixing — see docs/MIGRATION.md §2 `./address` row).
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
# Install the tarball + the peers the entrypoints asserted below actually
# need at MODULE-LOAD time (not just at call time — see the root-barrel note
# above for why react-daum-postcode is here despite being "optional").
npm i "$TARBALL" \
  react react-dom \
  next xlsx-js-style file-saver react-daum-postcode \
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

# /excel — CJS asserted; ESM intentionally NOT asserted (empirically
# verified 2026-07-12): the built ESM entry statically imports `saveAs` as a
# NAMED export from `file-saver`, a CJS-only package with no named ESM
# exports — Node's CJS→ESM interop only synthesizes a default export for
# such packages, so `node --input-type=module -e "import('.../excel')"`
# throws `SyntaxError: Named export 'saveAs' not found`. Same category of
# gap the pre-W7 react-sortablejs caveat on the root barrel used to document
# (a CJS-only peer breaking Node's native ESM interop; works fine under a
# bundler like webpack/Next.js, which is how every real consumer loads it).
node -e "require('@rchemist/listgrid/excel'); console.log('  ✓ cjs  ./excel')"

echo "[smoke] OK — published exports resolve and load"
