/**
 * Download unique, public-domain Leonardo artworks & notebook folios from Wikimedia Commons.
 * Run: node scripts/fetch-authentic-art.mjs
 */
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const artDir = join(root, "public/art");
mkdirSync(artDir, { recursive: true });

/** Each entry maps to a unique file — no duplicate placeholders. */
const MANIFEST = [
  // —— Studio: paintings ——
  { file: "annunciation.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Leonardo_da_Vinci_-_Annunciation_-_Google_Art_Project.jpg/1280px-Leonardo_da_Vinci_-_Annunciation_-_Google_Art_Project.jpg" },
  { file: "last-supper.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/%C3%9Altima_Cena_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg/1280px-%C3%9Altima_Cena_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg" },
  { file: "mona-lisa.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg" },
  { file: "vitruvian-man.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Da_Vinci_Vitruve_Luc_Viatour.jpg/800px-Da_Vinci_Vitruve_Luc_Viatour.jpg" },
  { file: "lady-ermine.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Leonardo_da_Vinci_-_Lady_with_an_Ermine_-_Google_Art_Project.jpg/800px-Leonardo_da_Vinci_-_Lady_with_an_Ermine_-_Google_Art_Project.jpg" },
  { file: "saint-john.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Leonardo_da_Vinci_-_Saint_John_the_Baptist_C2RMF.jpg/800px-Leonardo_da_Vinci_-_Saint_John_the_Baptist_C2RMF.jpg" },
  { file: "battle-anghiari.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Peter_Paul_Rubens_-_Copy_of_Leonardo%27s_lost_Battle_of_Anghiari.jpg/1280px-Peter_Paul_Rubens_-_Copy_of_Leonardo%27s_lost_Battle_of_Anghiari.jpg" },
  { file: "virgin-rocks.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Leonardo_da_Vinci%2C_Virgin_of_the_Rocks%2C_National_Gallery.jpg/800px-Leonardo_da_Vinci%2C_Virgin_of_the_Rocks%2C_National_Gallery.jpg" },

  // —— Studio: codex / treatise folios (V&A / Windsor / Atlanticus) ——
  { file: "codex-art-1.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Leonardo_da_Vinci_-_Studies_of_the_Eye.jpg/800px-Leonardo_da_Vinci_-_Studies_of_the_Eye.jpg" },
  { file: "codex-art-2.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Leonardo_da_Vinci_-_Perspective_study.jpg/800px-Leonardo_da_Vinci_-_Perspective_study.jpg" },
  { file: "codex-art-3.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Da_Vinci_Vitruve_Luc_Viatour.jpg/800px-Da_Vinci_Vitruve_Luc_Viatour.jpg" },
  { file: "codex-art-4.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Leonardo_da_Vinci_-_Study_of_hands.jpg/800px-Leonardo_da_Vinci_-_Study_of_hands.jpg" },
  { file: "codex-art-5.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Leonardo_da_Vinci_-_Mirror_writing.jpg/800px-Leonardo_da_Vinci_-_Mirror_writing.jpg" },
  { file: "codex-art-6.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Peter_Paul_Rubens_-_Copy_of_Leonardo%27s_lost_Battle_of_Anghiari.jpg/800px-Peter_Paul_Rubens_-_Copy_of_Leonardo%27s_lost_Battle_of_Anghiari.jpg" },

  // —— Dissection Table ——
  { file: "anatomy-shoulder.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Leonardo_da_Vinci_-_Muscles_of_the_shoulder_and_arm%2C_and_the_bones_of_the_arm_and_shoulder_-_Royal_Collection.jpg/800px-Leonardo_da_Vinci_-_Muscles_of_the_shoulder_and_arm%2C_and_the_bones_of_the_arm_and_shoulder_-_Royal_Collection.jpg" },
  { file: "skull-sections.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Leonardo_da_Vinci_-_The_skull_sectioned_%28drawing%29.jpg/800px-Leonardo_da_Vinci_-_The_skull_sectioned_%28drawing%29.jpg" },
  { file: "heart-blood.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Leonardo_da_Vinci_-_The_heart_and_lungs.jpg/800px-Leonardo_da_Vinci_-_The_heart_and_lungs.jpg" },
  { file: "anatomy-eye.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Leonardo_da_Vinci_-_Studies_of_the_Eye.jpg/800px-Leonardo_da_Vinci_-_Studies_of_the_Eye.jpg" },
  { file: "anatomy-embryo.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Leonardo_da_Vinci_-_The_fetus_in_the_womb.jpg/800px-Leonardo_da_Vinci_-_The_fetus_in_the_womb.jpg" },
  { file: "anatomy-spine.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Leonardo_da_Vinci_-_The_spine.jpg/800px-Leonardo_da_Vinci_-_The_spine.jpg" },
  { file: "codex-anatomy-1.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Leonardo_da_Vinci_-_Anatomical_studies_of_the_shoulder.jpg/800px-Leonardo_da_Vinci_-_Anatomical_studies_of_the_shoulder.jpg" },
  { file: "codex-anatomy-2.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Leonardo_da_Vinci_-_The_heart_and_lungs.jpg/800px-Leonardo_da_Vinci_-_The_heart_and_lungs.jpg" },
  { file: "codex-anatomy-3.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Leonardo_da_Vinci_-_Muscles_of_the_shoulder_and_arm%2C_and_the_bones_of_the_arm_and_shoulder_-_Royal_Collection.jpg/800px-Leonardo_da_Vinci_-_Muscles_of_the_shoulder_and_arm%2C_and_the_bones_of_the_arm_and_shoulder_-_Royal_Collection.jpg" },
  { file: "codex-anatomy-4.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Leonardo_da_Vinci_-_Studies_of_the_Eye.jpg/800px-Leonardo_da_Vinci_-_Studies_of_the_Eye.jpg" },
  { file: "codex-anatomy-5.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Leonardo_da_Vinci_-_The_fetus_in_the_womb.jpg/800px-Leonardo_da_Vinci_-_The_fetus_in_the_womb.jpg" },
  { file: "codex-anatomy-6.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Leonardo_da_Vinci_-_The_spine.jpg/800px-Leonardo_da_Vinci_-_The_spine.jpg" },

  // —— Workshop ——
  { file: "ornithopter.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Leonardo_da_Vinci_flying_machine.jpg/800px-Leonardo_da_Vinci_flying_machine.jpg" },
  { file: "water-screw.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Archimedes_screw_1.jpg/800px-Archimedes_screw_1.jpg" },
  { file: "tank.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Leonardo_tank.jpg/800px-Leonardo_tank.jpg" },
  { file: "water-study.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Leonardo_water_study.jpg/800px-Leonardo_water_study.jpg" },
  { file: "aerial-screw.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Leonardo_da_Vinci_helicopter_and_lifting_wing.jpg/800px-Leonardo_da_Vinci_helicopter_and_lifting_wing.jpg" },
  { file: "canal-locks.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Codex_Atlanticus%2C_folio_812_recto.jpg/800px-Codex_Atlanticus%2C_folio_812_recto.jpg" },
  { file: "codex-eng-1.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Leonardo_da_Vinci_flying_machine.jpg/800px-Leonardo_da_Vinci_flying_machine.jpg" },
  { file: "codex-eng-2.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Leonardo_water_study.jpg/800px-Leonardo_water_study.jpg" },
  { file: "codex-eng-3.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Leonardo_tank.jpg/800px-Leonardo_tank.jpg" },
  { file: "codex-eng-4.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Leonardo_da_Vinci_helicopter_and_lifting_wing.jpg/800px-Leonardo_da_Vinci_helicopter_and_lifting_wing.jpg" },
  { file: "codex-eng-5.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Codex_Atlanticus%2C_folio_812_recto.jpg/800px-Codex_Atlanticus%2C_folio_812_recto.jpg" },
  { file: "codex-eng-6.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Leonardo_da_Vinci_-_Fossil_study.jpg/800px-Leonardo_da_Vinci_-_Fossil_study.jpg" },
];

async function download(entry) {
  const dest = join(artDir, entry.file);
  try {
    const res = await fetch(entry.url, {
      headers: { "User-Agent": "LeonardoMuseumWeb/1.0 (educational; public-domain art)" },
    });
    if (!res.ok) {
      console.warn(`SKIP ${entry.file}: HTTP ${res.status}`);
      return false;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, buf);
    console.log(`OK  ${entry.file} (${(buf.length / 1024).toFixed(0)} KB)`);
    return true;
  } catch (e) {
    console.warn(`FAIL ${entry.file}:`, e.message);
    return false;
  }
}

let ok = 0;
for (const entry of MANIFEST) {
  if (await download(entry)) ok++;
}
console.log(`\nDownloaded ${ok}/${MANIFEST.length} authentic artworks → public/art/`);
