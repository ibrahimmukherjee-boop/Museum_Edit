import { corpus } from "../data/museumCorpus";
import { TRAINING_CHUNKS } from "../data/trainingCorpus";
import { BM25 } from "./bm25";
import type { CortexFact } from "./types";

let index: BM25 | null = null;

function ensureIndex(): BM25 {
  if (index) return index;
  index = new BM25();
  for (const n of corpus.notebooks) {
    index.add(`codex-${n.id}`, `${n.title}. ${n.codex}. ${n.excerpt}`, {
      title: n.title,
      kind: "codex",
      domain: n.domain,
    });
  }
  for (const p of corpus.paintings) {
    index.add(`painting-${p.id}`, `${p.title}. ${p.description}. ${p.location ?? ""}`, {
      title: p.title,
      kind: "painting",
      domain: p.domain,
    });
  }
  return index;
}

export function retrieveKnowledge(query: string, domain?: string, topK = 4) {
  const hits = ensureIndex().search(query, topK * 2);
  const training = searchTraining(query, domain, topK);
  const museum = hits
    .filter((h) => !domain || h.meta.domain === domain)
    .slice(0, topK)
    .map((h) => ({
      title: h.meta.title,
      content: h.text,
      score: h.score,
      kind: h.meta.kind,
    }));
  return [...training, ...museum].slice(0, topK + 2);
}

function searchTraining(query: string, domain?: string, topK = 3) {
  const q = query.toLowerCase().split(/\W+/).filter(Boolean);
  const scored = TRAINING_CHUNKS.map((c) => {
    if (domain && c.domain !== "general" && c.domain !== domain) return null;
    const words = c.text.toLowerCase().split(/\W+/);
    let score = 0;
    for (const w of q) if (words.includes(w)) score += 1;
    return score > 0
      ? { title: c.source, content: c.text, score, kind: "training" as const }
      : null;
  }).filter(Boolean) as { title: string; content: string; score: number; kind: string }[];
  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

export function extractFacts(snippets: { content: string; title: string }[]): CortexFact[] {
  const facts: CortexFact[] = [];
  for (const s of snippets) {
    const sentences = s.content.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean);
    for (const sent of sentences.slice(0, 2)) {
      const m = sent.match(/^(.{3,40}?)\s+(is|are|was|were|means|teaches|shows)\s+(.+)$/i);
      if (m) {
        facts.push({
          subject: m[1].trim(),
          predicate: m[2].toLowerCase(),
          object: m[3].trim().slice(0, 120),
          source: s.title,
          confidence: 0.72,
        });
      }
    }
  }
  return facts.slice(0, 6);
}
