#!/usr/bin/env bash
# Modern pairing images for Workshop pop-out foregrounds.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ART="$ROOT/public/art"
mkdir -p "$ART"
UA="Mozilla/5.0 (LeonardoMuseum/1.0; educational)"

download() {
  local file="$1" url="$2"
  local tmp="$ART/.tmp-$file"
  if curl -fsSL -A "$UA" --max-time 120 -o "$tmp" "$url"; then
    local size
    size=$(wc -c < "$tmp" | tr -d ' ')
    if [ "$size" -lt 30000 ]; then
      echo "SKIP $file (too small)"
      rm -f "$tmp"
      return 0
    fi
    mv -f "$tmp" "$ART/$file"
    echo "OK  $file"
  else
    echo "SKIP $file"
    rm -f "$tmp"
  fi
  sleep 2
}

download "modern-helicopter.jpg" "https://upload.wikimedia.org/wikipedia/commons/5/5a/UH-60_Black_Hawk_helicopter.jpg"
download "modern-turbine.jpg" "https://upload.wikimedia.org/wikipedia/commons/4/4e/Hoover_Dam_powerplant_turbines.jpg"
download "modern-tank.jpg" "https://upload.wikimedia.org/wikipedia/commons/8/8e/M1A1_Abrams_fires_its_main_gun.jpg"
download "modern-drone.jpg" "https://upload.wikimedia.org/wikipedia/commons/0/02/Quadcopter.jpg"
download "modern-canal-lock.jpg" "https://upload.wikimedia.org/wikipedia/commons/6/6e/Panama_Canal_Miraflores_Locks.jpg"
download "modern-fossil-display.jpg" "https://upload.wikimedia.org/wikipedia/commons/4/4e/Ammonite_fossil.jpg"

echo "Modern pairing images complete."
