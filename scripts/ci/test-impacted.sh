#!/usr/bin/env bash
# test-impacted.sh — check-lane unit tests, impacted scope only
# (harness docs/integrations/ci-pipeline.md §5, Node row: `vitest related`).
#
# Selects the Vitest test files whose static import graph touches a file
# changed since IMPACT_BASE (or the test file itself), and runs only those.
# The full suite with the coverage thresholds from vitest.config.ts is the
# heavy lane and runs locally: scripts/ci/unit-full.sh (§2-1).
#
# Usage:
#   IMPACT_BASE=<rev> scripts/ci/test-impacted.sh      # CI: PR base sha / push `before`
#   scripts/ci/test-impacted.sh                        # local: merge-base with origin/main
#   TEST_IMPACTED_LIST=1 scripts/ci/test-impacted.sh   # print mode + changed files, run nothing
#
# Modes (one summary line goes to $GITHUB_STEP_SUMMARY when set):
#   none    — nothing changed since base            → no-op success (lane stays green)
#   related — `vitest related --run <changed files>` (tests importing them, or changed tests)
#   full    — a file every test depends on changed (lockfile / vitest or tsconfig config /
#             test setup / this script / the check workflow), or the base is unresolvable
#             → `vitest run`: the impact of that change is the whole suite
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

# Files whose change invalidates the whole import graph.
full_trigger='^(package\.json|package-lock\.json|\.npmrc|vitest\.config\.[cm]?[jt]s|vitest\.setup\.[cm]?[jt]s|tsconfig[^/]*\.json|src/test-setup\.ts|src/test-server-only\.ts|scripts/ci/test-impacted\.sh|\.github/workflows/ci\.yml|(packages|apps)/[^/]+/(package\.json|tsconfig[^/]*\.json))$'

base="${IMPACT_BASE:-}"
mode=""
if [[ -z "$base" || "$base" =~ ^0+$ ]] || ! git cat-file -e "${base}^{commit}" 2>/dev/null; then
  if git rev-parse --verify -q origin/main >/dev/null 2>&1; then
    base=$(git merge-base origin/main HEAD)
  else
    mode=full
    base="(unresolvable)"
  fi
fi

changed=()
if [[ -z "$mode" ]]; then
  # --diff-filter=d: deleted files have no import graph to follow; a test that
  # still imports a deleted file fails type-check in the same lane.
  while IFS= read -r f; do [[ -n "$f" ]] && changed+=("$f"); done \
    < <(git diff --name-only --diff-filter=d "$base" HEAD)
  if ((${#changed[@]} == 0)); then
    mode=none
  elif printf '%s\n' "${changed[@]}" | grep -Eq "$full_trigger"; then
    mode=full
  else
    mode=related
  fi
fi

if [[ "${TEST_IMPACTED_LIST:-}" == 1 ]]; then
  echo "unit-impacted: base=$base mode=$mode changed=${#changed[@]}"
  ((${#changed[@]})) && printf '  %s\n' "${changed[@]}"
  exit 0
fi

out="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/vitest-impacted.json"
rm -f "$out"
rc=0
case "$mode" in
  none)
    ;;
  related)
    npx vitest related --run --passWithNoTests --maxWorkers=2 \
      --reporter=default --reporter=json --outputFile.json="$out" "${changed[@]}" || rc=$?
    ;;
  full)
    npx vitest run --maxWorkers=2 \
      --reporter=default --reporter=json --outputFile.json="$out" || rc=$?
    ;;
esac

counts=""
if [[ -f "$out" ]]; then
  counts=$(node -e '
    const r = require(process.argv[1]);
    const n = (k) => r[k] || 0;
    console.log(`passed=${n("numPassedTests")} failed=${n("numFailedTests")} skipped=${n("numPendingTests") + n("numTodoTests")} suites=${n("numTotalTestSuites")}`);
  ' "$out" 2>/dev/null || echo "counts=unavailable")
fi
summary="unit-impacted: base=$base mode=$mode changed=${#changed[@]} ${counts:-passed=0 failed=0 skipped=0 suites=0} rc=$rc"
echo "$summary"
[[ -n "${GITHUB_STEP_SUMMARY:-}" ]] && echo "$summary" >> "$GITHUB_STEP_SUMMARY"
exit "$rc"
