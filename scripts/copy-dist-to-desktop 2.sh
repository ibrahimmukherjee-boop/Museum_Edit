#!/usr/bin/env bash
set -euo pipefail
PROJECT="$HOME/Desktop/Museum Full Version/leonardo-museum-web"
DEST="$HOME/Desktop/leonardo-museum-dist"

cd "$PROJECT"
echo "Building museum app…"
npm install
npm run build

echo "Copying to Desktop…"
rm -rf "$DEST"
cp -R dist "$DEST"

echo ""
echo "✓ Ready: $DEST"
echo "  Drag the folder 'leonardo-museum-dist' to https://app.netlify.com/drop"
open "$DEST" 2>/dev/null || true
