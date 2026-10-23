#!/usr/bin/env bash
# unit-full.sh — heavy lane, LOCAL ONLY (harness docs/integrations/ci-pipeline.md §2-1).
#
# Former step "Test + coverage (enforces vitest.config.ts thresholds)" of the
# `quality` job in .github/workflows/ci.yml. The check lane now runs only the
# impacted tests (scripts/ci/test-impacted.sh); the whole suite and the
# coverage floors (statements 45 / branches 39 / functions 47 / lines 44) are
# asserted here, by the integration-stage owner once per merge batch and
# before a release. Delegates to the existing npm script — no second definition.
#
# Usage:
#   scripts/ci/unit-full.sh            # == npm run test:coverage (vitest run --coverage)
# Env:
#   VITEST_MAX_WORKERS  worker cap passed to vitest (default: 2, the ci-light assumption)
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
npm run test:coverage -- --maxWorkers="${VITEST_MAX_WORKERS:-2}"
echo "unit-full: passed rc=0"
