#!/usr/bin/env bash
# Copies only the public site into dist/ for Cloudflare Pages.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist && mkdir dist
cp -r index.html privacy.html terms.html 404.html _headers robots.txt sitemap.xml site.webmanifest \
  favicon.svg favicon-32.png apple-touch-icon.png icon-192.png icon-512.png .well-known css js img vendor dist/
echo "dist ready: $(find dist -type f | wc -l) files, $(du -sh dist | cut -f1)"
