#!/usr/bin/env node
/** Report duplicate image hashes for museum folio keys. */
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ART = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "art");

const KEYS = [
  "annunciation", "last-supper", "mona-lisa", "vitruvian-man", "lady-ermine", "saint-john", "battle-anghiari",
  "anatomy-shoulder", "skull-sections", "heart-blood", "anatomy-eye", "anatomy-embryo",
  "codex-art-1", "codex-art-2", "codex-art-3", "codex-art-4", "codex-art-5", "codex-art-6",
  "codex-anatomy-1", "codex-anatomy-2", "codex-anatomy-3", "codex-anatomy-4", "codex-anatomy-5", "codex-anatomy-6",
  "codex-eng-1", "codex-eng-2", "codex-eng-3", "codex-eng-4", "codex-eng-5", "codex-eng-6",
  "modern-helicopter", "modern-turbine", "modern-tank", "modern-drone", "modern-canal-lock", "modern-fossil-display",
];

function md5(path) {
  return createHash("md5").update(readFileSync(path)).digest("hex");
}

const byHash = new Map();
let missing = 0;

for (const key of KEYS) {
  const p = join(ART, `${key}.jpg`);
  if (!existsSync(p)) {
    console.log(`MISSING  ${key}.jpg`);
    missing++;
    continue;
  }
  const h = md5(p);
  if (!byHash.has(h)) byHash.set(h, []);
  byHash.get(h).push(key);
}

let dupes = 0;
for (const [hash, keys] of byHash) {
  if (keys.length > 1) {
    dupes++;
    console.log(`DUPLICATE (${keys.length}): ${keys.join(", ")}`);
  }
}

console.log(`\n${KEYS.length - missing} present, ${missing} missing, ${dupes} duplicate groups`);
process.exit(missing > 0 || dupes > 0 ? 1 : 0);
