#!/usr/bin/env bash
set -euo pipefail
PROJECT="$HOME/Desktop/Museum Full Version/leonardo-museum-web"
DESKTOP="$HOME/Desktop"
ZIP="$DESKTOP/dist.zip"
FOLDER="$DESKTOP/leonardo-museum-dist"

cd "$PROJECT"
echo "Building…"
npm install
npm run build

echo "Copying folder to Desktop…"
rm -rf "$FOLDER" "$ZIP"
cp -R dist "$FOLDER"

echo "Creating dist.zip on Desktop…"
(cd "$DESKTOP" && zip -r -q dist.zip leonardo-museum-dist)

echo ""
echo "Done:"
echo "  Folder: $FOLDER"
echo "  Zip:    $ZIP"
ls -lh "$ZIP"
open "$DESKTOP" 2>/dev/null || true
