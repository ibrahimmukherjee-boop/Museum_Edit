#!/usr/bin/env node
/**
 * Copy all high-quality Da Vinci assets → public/art for museum + GitHub Pages.
 * Sources: leonardo_images, High_Res_Images, Notebooks (selected), Google Assets.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "art");
const assetsRoot =
  process.env.DA_VINCI_ASSETS ?? join(process.env.HOME ?? "", "Downloads", "Da_Vinci_Assets");

const leonardoImages = join(assetsRoot, "leonardo_images");
const hiRes = join(assetsRoot, "High_Res_Images");

/** Primary folio map — leonardo_images (full set, includes 6.6MB Mona Lisa). */
const MAP = [
  ["01_annunciation.jpg", "annunciation.jpg"],
  ["02_last_supper.jpg", "last-supper-hires.jpg"],
  ["03_mona_lisa.jpg", "mona-lisa.jpg"],
  ["04_vitruvian_man.jpg", "vitruvian-man-hires.jpg"],
  ["05_lady_with_ermine.jpg", "lady-ermine.jpg"],
  ["06_st_john_baptist.jpg", "saint-john.jpg"],
  ["07_battle_of_anghiari.jpg", "battle-anghiari.jpg"],
  ["08_virgin_of_rocks.jpg", "virgin-of-rocks-hires.jpg"],
  ["09_anatomy_shoulder_neck.jpg", "anatomy-shoulder.jpg"],
  ["10_anatomy_thigh.jpg", "anatomy-thigh.jpg"],
  ["11_anatomy_bears_foot.jpg", "anatomy-bears-foot.jpg"],
  ["12_anatomy_foot_calf.jpg", "anatomy-foot-calf.jpg"],
  ["13_anatomy_skull.jpg", "skull-sections.jpg"],
  ["14_anatomy_heart.jpg", "heart-blood.jpg"],
  ["15_anatomy_eye.jpg", "anatomy-eye.jpg"],
  ["16_anatomy_embryo.jpg", "anatomy-embryo.jpg"],
  ["17_ornithopter.jpg", "ornithopter.jpg"],
  ["18_flying_machine_air_screw.jpg", "flying-machine.jpg"],
  ["19_tank.jpg", "tank.jpg"],
  ["20_water_wheel_archimedes_screw.jpg", "water-screw.jpg"],
  ["21_golden_horn_bridge.jpg", "bridge.jpg"],
  ["22_giant_crossbow.jpg", "crossbow.jpg"],
  ["23_water_study.jpg", "water-study.jpg"],
];

/** Hi-res overrides — only copy if file exists and is non-empty. */
const HI_RES_OVERRIDES = [
  ["Leonardo_da_Vinci_(1452-1519)_-_The_Last_Supper_(1495-1498).jpg", "last-supper-hires.jpg"],
  ["Third_Image.jpeg", "annunciation-hires.jpg"],
  ["Seventh_Image.jpeg", "virgin-of-rocks-hires-alt.jpg"],
  ["Second_Image.jpeg", "mona-lisa-alt.jpg"],
  ["Leonardo_da_Vinci,_Ginevra_de'_Benci,_1474-78.png", "ginevra-de-benci.png"],
  ["Leonardo_da_Vinci_(attrib)-_la_Belle_Ferroniere.jpg", "belle-ferroniere.jpg"],
];

function copyIfValid(src, dest) {
  if (!existsSync(src)) return false;
  const size = statSync(src).size;
  if (size < 1024) return false;
  copyFileSync(src, dest);
  return true;
}

function slugify(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

mkdirSync(out, { recursive: true });

let n = 0;

for (const [from, to] of MAP) {
  const src = join(leonardoImages, from);
  if (copyIfValid(src, join(out, to))) {
    n++;
    console.log("✓", to);
  } else {
    console.warn("skip (missing):", from);
  }
}

for (const [from, to] of HI_RES_OVERRIDES) {
  const src = join(hiRes, from);
  if (copyIfValid(src, join(out, to))) {
    n++;
    console.log("✓ hi-res", to);
  }
}

// Notebook extras — copy as notebook-*.jpg for reference corpus
const notebooks = join(assetsRoot, "Notebooks");
if (existsSync(notebooks)) {
  for (const file of readdirSync(notebooks)) {
    const ext = extname(file).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;
    const src = join(notebooks, file);
    if (!copyIfValid(src, join(out, `notebook-${slugify(file)}${ext === ".webp" ? ".webp" : ".jpg"}`))) continue;
    n++;
  }
}

// Google reference assets
const google = join(assetsRoot, "Google Assets");
if (existsSync(google)) {
  for (const file of readdirSync(google)) {
    if (!/\.(png|jpe?g)$/i.test(file)) continue;
    const src = join(google, file);
    if (copyIfValid(src, join(out, `google-${slugify(file)}.png`))) n++;
  }
}

// Pick largest mona-lisa candidate
const monaCandidates = [
  join(leonardoImages, "03_mona_lisa.jpg"),
  join(hiRes, "Second_Image.jpeg"),
  join(out, "mona-lisa-alt.jpg"),
].filter(existsSync);
let bestMona = monaCandidates[0];
let bestSize = 0;
for (const p of monaCandidates) {
  const s = statSync(p).size;
  if (s > bestSize) {
    bestSize = s;
    bestMona = p;
  }
}
if (bestMona && bestSize > 0) {
  copyFileSync(bestMona, join(out, "mona-lisa.jpg"));
  console.log(`✓ mona-lisa.jpg (best: ${Math.round(bestSize / 1024)}KB)`);
}

console.log(`\nSynced ${n}+ assets → public/art`);
console.log(`Assets root: ${assetsRoot}`);
