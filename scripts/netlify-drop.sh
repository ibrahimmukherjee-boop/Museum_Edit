#!/usr/bin/env bash
# Build and open the dist folder — drag THIS folder to Netlify Drop.
set -euo pipefail
cd "$(dirname "$0")/.."
npm install
npm run build
echo ""
echo "Done. Drag this folder to https://app.netlify.com/drop"
echo "  → $(pwd)/dist"
open dist 2>/dev/null || open .
open "https://app.netlify.com/drop" 2>/dev/null || true
