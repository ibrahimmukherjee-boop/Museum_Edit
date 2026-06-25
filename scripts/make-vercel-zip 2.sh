#!/usr/bin/env bash
# Creates ~/Desktop/leonardo-museum-vercel.zip — ready for Vercel CLI (2 min deploy).
set -euo pipefail
PROJECT="$(cd "$(dirname "$0")/.." && pwd)"
DESKTOP="$HOME/Desktop"
NAME="leonardo-museum-vercel"
BUNDLE="$DESKTOP/$NAME"
ZIP="$DESKTOP/$NAME.zip"

echo "Building…"
cd "$PROJECT"
npm install
npm run build

echo "Packaging…"
rm -rf "$BUNDLE" "$ZIP"
mkdir -p "$BUNDLE"
cp -R dist api public vercel.json package.json package-lock.json "$BUNDLE/"
cp src/cortex src/lib/prompt.ts "$BUNDLE/" 2>/dev/null || true
mkdir -p "$BUNDLE/src"
cp -R src/cortex src/server "$BUNDLE/src/" 2>/dev/null || true
cp src/lib/prompt.ts "$BUNDLE/src/lib/" 2>/dev/null || mkdir -p "$BUNDLE/src/lib" && cp src/lib/prompt.ts "$BUNDLE/src/lib/"

cat > "$BUNDLE/DEPLOY.txt" << 'EOF'
═══════════════════════════════════════════════════════
  LEONARDO MUSEUM — DEPLOY IN 2 MINUTES (VERCEL)
═══════════════════════════════════════════════════════

Vercel does NOT accept drag-and-drop zip in the browser.
This is the shortest real path:

  1. Open Terminal

  2. One-time login (browser opens):
     npm i -g vercel
     vercel login

  3. Deploy this folder:
     cd ~/Desktop/leonardo-museum-vercel
     vercel --prod

  You get: https://something.vercel.app
  Open:    https://something.vercel.app/#/login

  Chat works immediately (CORTEX in browser, no API key needed).

  Optional — smoother replies (free Groq):
     vercel env add GROQ_API_KEY
     vercel --prod

───────────────────────────────────────────────────────
  EVEN EASIER? Static-only (drag & drop, no API polish)
───────────────────────────────────────────────────────

  1. Zip ONLY the "dist" folder inside this bundle
  2. Go to: https://app.netlify.com/drop
  3. Drag the dist folder onto the page
  4. Done — instant URL

  (Parlor/Atelier work; polish uses CORTEX only.)

═══════════════════════════════════════════════════════
EOF

(cd "$DESKTOP" && zip -r -q "$NAME.zip" "$NAME")
echo ""
echo "✓ Created: $ZIP"
echo "  Unzip on Desktop → follow DEPLOY.txt"
open "$DESKTOP" 2>/dev/null || true
