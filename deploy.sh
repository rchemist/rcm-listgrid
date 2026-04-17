#!/bin/bash
# Deploy @rcm/listgrid — ships dist + metadata to the
# rchemist-rcm-listgrid-release repo, which consumers reference via
# `"@rcm/listgrid": "github:rchemist/rchemist-rcm-listgrid-release#vX.Y.Z"`.
#
# Mirrors the pattern used by rcm-framework/deploy.sh for Maven artifacts.

set -e

# Color output ------------------------------------------------------------
C_OFF='\033[0m'
C_CYAN='\033[1;36m'
C_GREEN='\033[1;32m'
C_RED='\033[1;31m'
C_YELLOW='\033[1;33m'

cd "$(dirname "$0")"
HERE=$(pwd)

RELEASE_DIR="${RELEASE_DIR:-$HOME/dev/rchemist-rcm-listgrid-release}"

if [ ! -d "$RELEASE_DIR/.git" ]; then
    echo -e "${C_RED}Release repo not found at $RELEASE_DIR${C_OFF}"
    echo "Clone it first:"
    echo "  git clone https://github.com/rchemist/rchemist-rcm-listgrid-release $RELEASE_DIR"
    exit 1
fi

# Version prompt ----------------------------------------------------------
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${C_CYAN}Current version: ${CURRENT_VERSION}${C_OFF}"
read -p "New version (e.g. 0.1.0 or 0.1.0-alpha.0): " NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
    echo -e "${C_RED}Version required.${C_OFF}"
    exit 1
fi

# Check tag isn't already taken on release repo.
if git -C "$RELEASE_DIR" rev-parse "v$NEW_VERSION" >/dev/null 2>&1; then
    echo -e "${C_RED}Tag v$NEW_VERSION already exists on release repo.${C_OFF}"
    exit 1
fi

# Build -------------------------------------------------------------------
echo -e "${C_GREEN}[1/5] Cleaning + building...${C_OFF}"
npm run clean
npm version "$NEW_VERSION" --no-git-tag-version >/dev/null
npm run build

if [ ! -d dist ] || [ ! -f dist/index.js ]; then
    echo -e "${C_RED}Build produced no dist/index.js — aborting.${C_OFF}"
    exit 1
fi

# Sync release repo -------------------------------------------------------
echo -e "${C_GREEN}[2/5] Pulling release repo...${C_OFF}"
git -C "$RELEASE_DIR" pull --rebase 2>/dev/null || true  # first-time push lacks upstream

echo -e "${C_GREEN}[3/5] Copying artifacts to release repo...${C_OFF}"
# Wipe previous dist to avoid stale files accumulating.
rm -rf "$RELEASE_DIR/dist"
cp -R dist "$RELEASE_DIR/dist"
cp package.json "$RELEASE_DIR/package.json"
[ -f README.md ]    && cp README.md    "$RELEASE_DIR/README.md"
[ -f DECISIONS.md ] && cp DECISIONS.md "$RELEASE_DIR/DECISIONS.md"
[ -f LICENSE ]      && cp LICENSE      "$RELEASE_DIR/LICENSE"

# Strip devDependencies and scripts from the published package.json so
# `git install` consumers don't pull transitive dev noise.
RELEASE_DIR="$RELEASE_DIR" node -e "
const fs = require('fs');
const p = process.env.RELEASE_DIR + '/package.json';
const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
delete pkg.devDependencies;
delete pkg.scripts;
delete pkg.private;
fs.writeFileSync(p, JSON.stringify(pkg, null, 4) + '\n');
"

# Commit + tag + push -----------------------------------------------------
echo -e "${C_GREEN}[4/5] Committing + tagging v$NEW_VERSION...${C_OFF}"
cd "$RELEASE_DIR"
git add -A
if git diff --cached --quiet; then
    echo -e "${C_YELLOW}No changes to commit — dist identical to last release.${C_OFF}"
else
    git commit -m "release v$NEW_VERSION"
fi
git tag "v$NEW_VERSION"

echo -e "${C_GREEN}[5/5] Pushing to origin...${C_OFF}"
# -u for the first push so subsequent pulls know the upstream.
CURRENT_BRANCH=$(git -C "$RELEASE_DIR" symbolic-ref --short HEAD)
git push -u origin "$CURRENT_BRANCH"
git push origin "v$NEW_VERSION"

cd "$HERE"
echo ""
echo -e "${C_CYAN}Deployed v$NEW_VERSION.${C_OFF}"
echo "Consumers can now pin with:"
echo "  \"@rcm/listgrid\": \"github:rchemist/rchemist-rcm-listgrid-release#v$NEW_VERSION\""
