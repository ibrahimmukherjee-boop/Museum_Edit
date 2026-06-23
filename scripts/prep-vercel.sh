#!/usr/bin/env bash
# One-shot prep for Vercel: install, art, test, build.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== npm install ==="
npm install

echo "=== fetch art ==="
bash scripts/fetch-authentic-art.sh
bash scripts/fetch-modern-art.sh
bash scripts/assign-codex-art.sh
node scripts/verify-art-unique.mjs || echo "WARN: some art duplicates/missing — assign fallbacks applied"

echo "=== cortex tests ==="
npm run test:cortex

echo "=== production build ==="
npm run build

ART_COUNT=$(ls dist/art 2>/dev/null | wc -l | tr -d ' ')
echo ""
echo "Ready for Vercel."
echo "  dist/ assets: $(ls dist/assets | wc -l | tr -d ' ') files"
echo "  dist/art/:    ${ART_COUNT} images"
echo ""
echo "Next: push to GitHub, import on vercel.com, set GROQ_API_KEY"
