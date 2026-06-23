#!/usr/bin/env bash
# Copy museum artwork from sibling folder into public/art/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/../museum 3"
DEST="$ROOT/public/art"
mkdir -p "$DEST"
if [ ! -d "$SRC" ]; then
  echo "Source not found: $SRC"
  echo "Copy JPG/PNG files manually into public/art/"
  exit 1
fi
cp "$SRC"/*.{jpg,png,jpeg} "$DEST/" 2>/dev/null || true
echo "Artwork copied to $DEST"
ls -la "$DEST" | head -20
