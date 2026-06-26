#!/usr/bin/env node
/**
 * Ingest DVNC training assets → src/data/trainingCorpus.ts (CORTEX BM25 index).
 * Sources: Personality, PDFs, JSON corpora (codex, masterclass, polymath).
 */
import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  readdirSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets =
  process.env.DA_VINCI_ASSETS ?? join(process.env.HOME ?? "", "Downloads", "Da_Vinci_Assets");

const personalityDir = join(assets, "Personality");
const outTs = join(root, "src", "data", "trainingCorpus.ts");
const publicCorpus = join(root, "public", "corpus");

mkdirSync(publicCorpus, { recursive: true });

function docxToText(path) {
  try {
    return execSync(`textutil -convert txt -stdout "${path}"`, {
      encoding: "utf8",
      maxBuffer: 8_000_000,
    });
  } catch {
    return "";
  }
}

function pdfToText(path) {
  try {
    return execSync(`pdftotext "${path}" -`, { encoding: "utf8", maxBuffer: 12_000_000 });
  } catch {
    try {
      return execSync(`textutil -convert txt -stdout "${path}"`, {
        encoding: "utf8",
        maxBuffer: 12_000_000,
      });
    } catch {
      return "";
    }
  }
}

function chunkText(text, source, domain = "general", maxChunks = 48) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.length > 40);
  const chunks = [];
  let buf = "";
  for (const s of sentences) {
    if (buf.length + s.length > 480) {
      if (buf.length > 60) chunks.push({ source, domain, text: buf.trim() });
      buf = s;
    } else {
      buf = buf ? `${buf} ${s}` : s;
    }
    if (chunks.length >= maxChunks) break;
  }
  if (buf.length > 60 && chunks.length < maxChunks) chunks.push({ source, domain, text: buf.trim() });
  return chunks;
}

function domainForDocId(docId) {
  const id = (docId ?? "").toLowerCase();
  if (/anatom|heart|skull|dissect|muscle|fetus|womb/.test(id)) return "anatomy";
  if (/ornith|machine|engine|water|bridge|tank|screw|fortif/.test(id)) return "engineering";
  if (/codex|notebook|treatise|painting|mona|supper|vitruvian/.test(id)) return "art";
  return "general";
}

function ingestJsonFile(filename, label, maxChunksPerDoc = 16) {
  const path = join(assets, filename);
  if (!existsSync(path)) return;
  copyFileSync(path, join(publicCorpus, filename.replace(/\s+/g, "_")));
  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    console.warn("skip invalid JSON:", filename);
    return;
  }
  const rows = Array.isArray(data) ? data : [data];
  let n = 0;
  for (const row of rows) {
    const text = row.text ?? row.content ?? row.body ?? "";
    const docId = row.doc_id ?? row.id ?? row.title ?? label;
    if (!text || text.length < 80) continue;
    const domain = domainForDocId(String(docId));
    const source = `${label}: ${docId}`;
    const added = chunkText(text, source, domain, maxChunksPerDoc);
    entries.push(...added);
    n += added.length;
  }
  console.log(`✓ ${filename} → ${n} chunks`);
}

const entries = [];

if (existsSync(personalityDir)) {
  for (const f of readdirSync(personalityDir)) {
    if (!f.endsWith(".docx")) continue;
    const text = docxToText(join(personalityDir, f));
    const label = f.replace(/\.docx$/i, "").replace(/_/g, " ");
    entries.push(...chunkText(text, `Personality: ${label}`, "general", 28));
  }
}

const pdfs = [
  [join(assets, "Corpus_Training", "notebook_pdf", "notebook_of_da_vinci.pdf"), "notebook_of_da_vinci.pdf", "Codex: Notebook of da Vinci", "art", 36],
  [
    join(assets, "The Mental Models of Leonardo da Vinci_ Applications to Real-World Contexts.docx (1).pdf"),
    "mental_models_leonardo.pdf",
    "Mental Models of Leonardo da Vinci",
    "general",
    40,
  ],
];

for (const [src, dest, label, domain, maxC] of pdfs) {
  if (!existsSync(src)) continue;
  copyFileSync(src, join(publicCorpus, dest));
  const pdfText = pdfToText(src);
  entries.push(...chunkText(pdfText, label, domain, maxC));
  console.log(`✓ PDF ${dest}`);
}

ingestJsonFile("codex_data (1).json", "Codex", 24);
ingestJsonFile("Masterclass_data (2).json", "Masterclass", 20);
ingestJsonFile("Polymath_festival.json", "Polymath Festival", 12);

const worksDir = join(assets, "leonardo_da_vinci_works", "leonardo_da_vinci");
if (existsSync(worksDir)) {
  const imgs = readdirSync(worksDir).filter((f) => /\.(jpe?g|png)$/i.test(f));
  entries.push({
    source: "Leonardo works archive",
    domain: "art",
    text: `The museum archive holds ${imgs.length} high-resolution Leonardo folio images including annunciation, last supper, mona lisa, vitruvian man, anatomy sheets, and engineering designs.`,
  });
}

const unique = entries.filter((e, i, a) => a.findIndex((x) => x.text === e.text) === i);

const ts = `/** Auto-generated by scripts/ingest-training-corpus.mjs — do not edit by hand. */
export interface TrainingChunk {
  source: string;
  domain: string;
  text: string;
}

export const TRAINING_CHUNKS: TrainingChunk[] = ${JSON.stringify(unique, null, 2)};
`;

writeFileSync(outTs, ts, "utf8");
console.log(`\nIngested ${unique.length} training chunks → ${outTs}`);
