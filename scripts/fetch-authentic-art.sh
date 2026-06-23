#!/usr/bin/env bash
# Download unique public-domain Leonardo artworks (Wikimedia Commons).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ART="$ROOT/public/art"
mkdir -p "$ART"
UA="Mozilla/5.0 (LeonardoMuseum/1.0; educational)"

min_ok=80000

download() {
  local file="$1" url="$2"
  local tmp="$ART/.tmp-$file"
  if curl -fsSL -A "$UA" --max-time 120 -o "$tmp" "$url"; then
    local size
    size=$(wc -c < "$tmp" | tr -d ' ')
    if [ "$size" -lt "$min_ok" ]; then
      echo "SKIP $file (response too small: ${size}b — likely rate-limited)"
      rm -f "$tmp"
      return 0
    fi
    mv -f "$tmp" "$ART/$file"
    echo "OK  $file (${size} bytes)"
  else
    echo "SKIP $file (curl failed)"
    rm -f "$tmp"
    return 0
  fi
  sleep 2
}

# —— Paintings ——
download "mona-lisa.jpg" "https://upload.wikimedia.org/wikipedia/commons/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg"
download "last-supper.jpg" "https://upload.wikimedia.org/wikipedia/commons/4/48/The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg"
download "vitruvian-man.jpg" "https://upload.wikimedia.org/wikipedia/commons/2/22/Da_Vinci_Vitruve_Luc_Viatour.jpg"
download "lady-ermine.jpg" "https://upload.wikimedia.org/wikipedia/commons/8/85/Lady_with_an_Ermine_-_Leonardo_da_Vinci_%28scan%29.jpg"
download "saint-john.jpg" "https://upload.wikimedia.org/wikipedia/commons/9/94/Leonardo_da_Vinci_-_Saint_John_the_Baptist_C2RMF.jpg"
download "annunciation.jpg" "https://upload.wikimedia.org/wikipedia/commons/d/d2/Leonardo_da_Vinci_%28attrib.%29_-_The_Annunciation_-_Google_Art_Project.jpg"
download "battle-anghiari.jpg" "https://upload.wikimedia.org/wikipedia/commons/c/c1/Peter_Paul_Rubens_-_Copy_of_Leonardo%27s_lost_Battle_of_Anghiari.jpg"

# —— Anatomy ——
download "anatomy-shoulder.jpg" "https://upload.wikimedia.org/wikipedia/commons/4/4f/Leonardo_da_Vinci_-_Muscles_of_the_shoulder_and_arm%2C_and_the_bones_of_the_arm_and_shoulder_-_Royal_Collection.jpg"
download "skull-sections.jpg" "https://upload.wikimedia.org/wikipedia/commons/0/0f/Leonardo_da_Vinci_-_The_skull_sectioned_%28drawing%29.jpg"
download "heart-blood.jpg" "https://upload.wikimedia.org/wikipedia/commons/8/8e/Leonardo_da_Vinci_-_The_heart_and_lungs.jpg"
download "anatomy-eye.jpg" "https://upload.wikimedia.org/wikipedia/commons/1/17/Leonardo_da_Vinci_-_Studies_of_the_Eye.jpg"
download "anatomy-embryo.jpg" "https://upload.wikimedia.org/wikipedia/commons/a/a7/Leonardo_da_Vinci_-_The_fetus_in_the_womb.jpg"

# —— Engineering reference sheets ——
download "ornithopter.jpg" "https://upload.wikimedia.org/wikipedia/commons/a/a8/Leonardo_da_Vinci_orinthopter.jpg"
download "tank.jpg" "https://upload.wikimedia.org/wikipedia/commons/1/1e/Leonardo_da_Vinci%27s_armoured_car.jpg"
download "water-study.jpg" "https://upload.wikimedia.org/wikipedia/commons/9/9f/Leonardo_water_study.jpg"
download "water-screw.jpg" "https://upload.wikimedia.org/wikipedia/commons/4/4e/Archimedes_screw_1.jpg"
download "eng-4.jpg" "https://upload.wikimedia.org/wikipedia/commons/5/5d/Leonardo_da_Vinci_helicopter_and_lifting_wing.jpg"
download "eng-5.jpg" "https://upload.wikimedia.org/wikipedia/commons/3/3f/Codex_Atlanticus%2C_folio_812_recto.jpg"
download "eng-2.jpg" "https://upload.wikimedia.org/wikipedia/commons/6/6a/Leonardo_da_Vinci_-_Fossil_study.jpg"

# —— Codex folios ——
download "codex-art-1.jpg" "https://upload.wikimedia.org/wikipedia/commons/1/17/Leonardo_da_Vinci_-_Studies_of_the_Eye.jpg"
download "codex-art-2.jpg" "https://upload.wikimedia.org/wikipedia/commons/6/6d/Leonardo_da_Vinci_-_Perspective_study.jpg"
download "codex-art-3.jpg" "https://upload.wikimedia.org/wikipedia/commons/2/22/Da_Vinci_Vitruve_Luc_Viatour.jpg"
download "codex-art-4.jpg" "https://upload.wikimedia.org/wikipedia/commons/b/b5/Leonardo_da_Vinci_-_Study_of_hands.jpg"
download "codex-art-5.jpg" "https://upload.wikimedia.org/wikipedia/commons/0/0e/Leonardo_da_Vinci_-_Mirror_writing.jpg"
download "codex-art-6.jpg" "https://upload.wikimedia.org/wikipedia/commons/c/c1/Peter_Paul_Rubens_-_Copy_of_Leonardo%27s_lost_Battle_of_Anghiari.jpg"
download "codex-anatomy-1.jpg" "https://upload.wikimedia.org/wikipedia/commons/9/9a/Leonardo_da_Vinci_-_Anatomical_studies_of_the_shoulder.jpg"
download "codex-anatomy-2.jpg" "https://upload.wikimedia.org/wikipedia/commons/8/8e/Leonardo_da_Vinci_-_The_heart_and_lungs.jpg"
download "codex-anatomy-3.jpg" "https://upload.wikimedia.org/wikipedia/commons/4/4f/Leonardo_da_Vinci_-_Muscles_of_the_shoulder_and_arm%2C_and_the_bones_of_the_arm_and_shoulder_-_Royal_Collection.jpg"
download "codex-anatomy-4.jpg" "https://upload.wikimedia.org/wikipedia/commons/1/17/Leonardo_da_Vinci_-_Studies_of_the_Eye.jpg"
download "codex-anatomy-5.jpg" "https://upload.wikimedia.org/wikipedia/commons/a/a7/Leonardo_da_Vinci_-_The_fetus_in_the_womb.jpg"
download "codex-anatomy-6.jpg" "https://upload.wikimedia.org/wikipedia/commons/5/5a/Leonardo_da_Vinci_-_The_spine.jpg"
download "codex-eng-1.jpg" "https://upload.wikimedia.org/wikipedia/commons/a/a8/Leonardo_da_Vinci_orinthopter.jpg"
download "codex-eng-2.jpg" "https://upload.wikimedia.org/wikipedia/commons/9/9f/Leonardo_water_study.jpg"
download "codex-eng-3.jpg" "https://upload.wikimedia.org/wikipedia/commons/1/1e/Leonardo_da_Vinci%27s_armoured_car.jpg"
download "codex-eng-4.jpg" "https://upload.wikimedia.org/wikipedia/commons/5/5d/Leonardo_da_Vinci_helicopter_and_lifting_wing.jpg"
download "codex-eng-5.jpg" "https://upload.wikimedia.org/wikipedia/commons/3/3f/Codex_Atlanticus%2C_folio_812_recto.jpg"
download "codex-eng-6.jpg" "https://upload.wikimedia.org/wikipedia/commons/6/6a/Leonardo_da_Vinci_-_Fossil_study.jpg"

[ -f "$ART/annunciation.png" ] || cp "$ART/annunciation.jpg" "$ART/annunciation.png" 2>/dev/null || true
[ -f "$ART/last-supper.png" ] || cp "$ART/last-supper.jpg" "$ART/last-supper.png" 2>/dev/null || true

echo "Done — $(ls "$ART" | wc -l | tr -d ' ') files in public/art/"
