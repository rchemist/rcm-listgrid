#!/usr/bin/env bash
# e2e.sh — heavy lane, LOCAL ONLY (harness docs/integrations/ci-pipeline.md §2-1).
#
# Former GitHub Actions job `e2e` in .github/workflows/ci.yml, removed from CI
# on 2026-10-23 (heavy runs never execute on the CI server). Same steps, same
# order. v0.4 vertical-slice acceptance — drives apps/sample (new @listgrid/*
# engine + mock RCM backend) in a real Chromium (documents/plans/
# e2e-parity-vertical-slice.md). The integration-stage owner runs it once per
# merge batch and before a release (test-economics.md §스테이지).
#
# Usage:
#   scripts/ci/e2e.sh
# Env:
#   E2E_INSTALL   1 = run `npm ci --legacy-peer-deps` first (the old job always did);
#                 0 = reuse node_modules; default: install only when node_modules is missing
#   CI            exported as 1 so Playwright keeps the CI settings of the old job
#                 (forbidOnly, retries=1, line reporter — playwright.config.ts)
# Hosts: none. The app under test listens on localhost:3100 (playwright.config.ts)
#   and the mock backend uses a temp sqlite file; no mesh endpoint is contacted.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
export CI="${CI:-1}"

install="${E2E_INSTALL:-auto}"
if [[ "$install" == 1 || ( "$install" == auto && ! -d node_modules ) ]]; then
  npm ci --legacy-peer-deps
fi

rc=0
run_step() { # <name> <cmd...>
  local name=$1; shift
  echo "::group::$name"
  "$@" || { rc=$?; echo "e2e: step failed: $name (rc=$rc)"; }
  echo "::endgroup::"
  return "$rc"
}

run_step "Install Playwright browser (chromium)"                      npx playwright install chromium
run_step "E2E (Playwright — College / Subject / Professor)"           npm run test:e2e
run_step "EntityForm proof persistence (real Next restarts)"          npm run test:e2e:persistence
run_step "EntityForm proof production smoke (next start + Chromium)"  npm run test:sample-production-smoke

echo "e2e: passed rc=0"
