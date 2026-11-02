#!/usr/bin/env bash
# Usage: bash tools/set-domain.sh maracassprings.com
# Swaps the SITE_DOMAIN placeholder (or the previous domain) for the real one.
set -euo pipefail
new="${1:?give the domain, e.g. maracassprings.com}"
cd "$(dirname "$0")/.."
old=$(cat tools/.domain 2>/dev/null || echo SITE_DOMAIN)
grep -rl --include='*.html' --include='*.xml' --include='*.txt' "$old" . | xargs sed -i "s#${old}#${new}#g"
echo "$new" > tools/.domain
echo "Domain set to $new"
