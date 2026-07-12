#!/usr/bin/env bash
# Headless build/run gate — spec §10 gate 5 / CAP-25 (W7-2).
#
# The `/schema` + `/state` subpaths must be consumable with ZERO React/UI
# **runtime** peers (spec §2 headless 계약 — the killer feature is running form
# schema + store logic in a non-UI service without bundling React at runtime).
# This packs the published package, installs it WITHOUT react / react-dom / any
# UI peer, then asserts a fixture importing only /schema + /state both RUNS
# (node, cjs + esm, react absent) and TYPE-CHECKS (tsc). Catches any regression
# where a shared build chunk leaks React into the runtime headless path.
#
# Note on @types/react: the /schema surface legitimately exposes ReactNode-based
# conditional types (OptionalReactNode / ValuedReactNode — field labels/values
# may be React nodes). So the .d.ts references React *types*; a headless consumer
# needs @types/react as a dev-only type dep for full tsc. That is NOT a runtime
# peer — the runtime (node run below, react absent) stays React-free, which is
# the contract. (Interpretation flagged in §Needs Review for spec-author confirm.)
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

echo "[headless] building…"
npm run build >/dev/null

echo "[headless] npm pack…"
TARBALL="$REPO/$(npm pack --silent)"

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP" "$TARBALL"; }
trap cleanup EXIT

cp tests/headless/consumer.ts "$TMP/consumer.ts"
cd "$TMP"
npm init -y >/dev/null 2>&1
# Install the package + typescript + @types/node + @types/react (type-only dev
# dep for the ReactNode-based schema types). NO react, NO react-dom, NO UI peers
# at RUNTIME. --legacy-peer-deps stops npm from auto-installing the (react) peer,
# which would defeat the headless runtime isolation. zustand is a regular
# dependency of the package, so it installs automatically (as intended).
npm i "$TARBALL" typescript @types/node @types/react --legacy-peer-deps >/dev/null 2>&1

# Guard: the react RUNTIME (and UI peers) must NOT have leaked into the install.
# @types/react (type-only) is allowed — see header note.
for banned in react react-dom @headlessui/react react-select @tabler/icons-react; do
  if [ -e "node_modules/$banned" ]; then
    echo "[headless] FAIL — runtime peer '$banned' present in a headless install; not isolating React at runtime"; exit 1
  fi
done

cat > tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "target": "es2020",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": false,
    "types": ["node"]
  },
  "include": ["consumer.ts"]
}
JSON

echo "[headless] tsc (@types/react type-only, no react runtime)…"
npx --yes tsc -p tsconfig.json
echo "  ✓ tsc green — /schema + /state type-check (react runtime absent)"

echo "[headless] node run (cjs)…"
node -e "
  const { EntityForm, StringField } = require('@rchemist/listgrid/schema');
  const { createFormStore } = require('@rchemist/listgrid/state');
  const f = new EntityForm('H', '/u').addFields({ tab: { id: 'm', label: 'M', order: 0 }, items: [ new StringField('name', 100).withLabel('Name') ] });
  const s = createFormStore(f);
  if (f.getField('name').getLabel() !== 'Name' || typeof s.getState().getValue !== 'function') throw new Error('cjs headless assert failed');
  console.log('  ✓ cjs — /schema + /state run React-free');
"

echo "[headless] node run (esm)…"
node --input-type=module -e "
  import { EntityForm, StringField } from '@rchemist/listgrid/schema';
  import { createFormStore } from '@rchemist/listgrid/state';
  const f = new EntityForm('H', '/u').addFields({ tab: { id: 'm', label: 'M', order: 0 }, items: [ new StringField('name', 100).withLabel('Name') ] });
  const s = createFormStore(f);
  if (f.getField('name').getLabel() !== 'Name') throw new Error('esm headless assert failed');
  console.log('  ✓ esm — /schema + /state run React-free');
"

echo "[headless] OK — /schema + /state consumable with zero React peers"
