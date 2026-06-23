#!/usr/bin/env bash
# Fill gaps only — never overwrite successful Wikimedia downloads.
set -euo pipefail
ART="$(cd "$(dirname "$0")/.." && pwd)/public/art"
cd "$ART"

min_bytes() { wc -c < "$1" 2>/dev/null | tr -d ' ' || echo 0; }

copy_if_needed() {
  local dest="$1" src="$2"
  local min="${3:-60000}"
  if [ ! -f "$src" ]; then
    echo "SKIP $dest — missing source $src"
    return 0
  fi
  if [ ! -f "$dest" ] || [ "$(min_bytes "$dest")" -lt "$min" ]; then
    cp -f "$src" "$dest"
    echo "mapped $dest <- $src"
  else
    echo "keep $dest ($(min_bytes "$dest") bytes)"
  fi
}

# Studio codex
copy_if_needed codex-art-1.jpg anatomy-eye.jpg
copy_if_needed codex-art-2.jpg art-2.jpg
copy_if_needed codex-art-3.jpg vitruvian-man.jpg
copy_if_needed codex-art-4.jpg art-6.jpg
copy_if_needed codex-art-5.jpg eng-1.jpg
copy_if_needed codex-art-6.jpg battle-anghiari.jpg

# Dissection codex
copy_if_needed codex-anatomy-1.jpg anatomy-shoulder.jpg
copy_if_needed codex-anatomy-2.jpg heart-blood.jpg
copy_if_needed codex-anatomy-3.jpg anatomy-3.jpg
copy_if_needed codex-anatomy-4.jpg anatomy-eye.jpg
copy_if_needed codex-anatomy-5.jpg anatomy-embryo.jpg
copy_if_needed codex-anatomy-6.jpg skull-sections.jpg

# Workshop codex
copy_if_needed codex-eng-1.jpg ornithopter.jpg
copy_if_needed codex-eng-2.jpg water-study.jpg
copy_if_needed codex-eng-3.jpg tank.jpg
copy_if_needed codex-eng-4.jpg eng-4.jpg
copy_if_needed codex-eng-5.jpg eng-5.jpg
copy_if_needed codex-eng-6.jpg eng-2.jpg

# Modern workshop foregrounds (only if fetch-modern missed)
copy_if_needed modern-helicopter.jpg ornithopter.jpg
copy_if_needed modern-turbine.jpg water-study.jpg
copy_if_needed modern-tank.jpg tank.jpg
copy_if_needed modern-drone.jpg eng-4.jpg
copy_if_needed modern-canal-lock.jpg eng-5.jpg
copy_if_needed modern-fossil-display.jpg eng-2.jpg

PLACEHOLDER_SIZE=105967
for key in lady-ermine saint-john battle-anghiari annunciation; do
  if [ -f "${key}.jpg" ] && [ "$(min_bytes "${key}.jpg")" = "$PLACEHOLDER_SIZE" ]; then
    echo "WARN: ${key}.jpg still placeholder — re-run fetch-authentic-art.sh"
  fi
done

echo "Codex assignment complete."
