import { corpus } from "../data/museumCorpus";
import { PERSONA_VOICE_ANCHORS } from "../data/personaVoice";
import { TRAINING_CHUNKS } from "../data/trainingCorpus";
import { BM25 } from "./bm25";
import { isSafeCorpusChunk, polishContextFromSnippets } from "./corpusFilter";
import type { CortexFact } from "./types";

export interface KnowledgeSnippet {
  title: string;
  content: string;
  score: number;
  kind: string;
}

let museumIndex: BM25 | null = null;
let trainingIndex: BM25 | null = null;

function ensureMuseumIndex(): BM25 {
  if (museumIndex) return museumIndex;
  museumIndex = new BM25();
  for (const n of corpus.notebooks) {
    museumIndex.add(`codex-${n.id}`, `${n.title}. ${n.codex}. ${n.excerpt}`, {
      title: n.title,
      kind: "codex",
      domain: n.domain,
    });
  }
  for (const p of corpus.paintings) {
    museumIndex.add(`painting-${p.id}`, `${p.title}. ${p.description}. ${p.location ?? ""}`, {
      title: p.title,
      kind: "painting",
      domain: p.domain,
    });
  }
  return museumIndex;
}

function ensureTrainingIndex(): BM25 {
  if (trainingIndex) return trainingIndex;
  trainingIndex = new BM25();
  TRAINING_CHUNKS.forEach((c, i) => {
    if (!isSafeCorpusChunk(c.source, c.text)) return;
    const kind = c.source.startsWith("Personality:") ? "personality" : "training";
    trainingIndex!.add(`train-${i}`, c.text, {
      title: c.source,
      kind,
      domain: c.domain,
    });
  });
  return trainingIndex;
}

function boostScore(hit: { score: number; meta: { kind: string } }): number {
  if (hit.meta.kind === "personality") return hit.score * 1.5;
  if (hit.meta.kind === "codex" || hit.meta.kind === "painting") return hit.score * 1.35;
  return hit.score * 0.85;
}

export function retrieveKnowledge(query: string, domain?: string, topK = 6): KnowledgeSnippet[] {
  const museumHits = ensureMuseumIndex()
    .search(query, topK + 4)
    .filter((h) => !domain || h.meta.domain === domain)
    .map((h) => ({
      title: h.meta.title,
      content: h.text,
      score: boostScore(h),
      kind: h.meta.kind,
    }));

  const trainingHits = ensureTrainingIndex()
    .search(query, topK + 2)
    .filter((h) => !domain || h.meta.domain === domain || h.meta.domain === "general")
    .filter((h) => h.meta.kind === "personality")
    .map((h) => ({
      title: h.meta.title,
      content: h.text,
      score: boostScore(h),
      kind: h.meta.kind,
    }));

  const personaHits = PERSONA_VOICE_ANCHORS.map((a, i) => ({
    title: a.title,
    content: a.content,
    score: 0.9 - i * 0.04,
    kind: "persona-anchor",
  }));

  const merged = new Map<string, KnowledgeSnippet>();
  for (const hit of [...personaHits, ...museumHits, ...trainingHits]) {
    if (!isSafeCorpusChunk(hit.title, hit.content)) continue;
    const key = `${hit.title}::${hit.content.slice(0, 80)}`;
    const prev = merged.get(key);
    if (!prev || hit.score > prev.score) merged.set(key, hit);
  }

  return [...merged.values()].sort((a, b) => b.score - a.score).slice(0, topK + 2);
}

export function buildPolishContext(snippets: KnowledgeSnippet[], maxChars = 1800): string {
  return polishContextFromSnippets(snippets, maxChars);
}

export function extractFacts(snippets: { content: string; title: string }[]): CortexFact[] {
  const facts: CortexFact[] = [];
  for (const s of snippets) {
    if (!isSafeCorpusChunk(s.title, s.content)) continue;
    const sentences = s.content.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean);
    for (const sent of sentences.slice(0, 2)) {
      if (sent.length > 120 || !/\b(is|are|was|were|means|teaches|shows)\b/i.test(sent)) continue;
      const m = sent.match(/^(.{3,40}?)\s+(is|are|was|were|means|teaches|shows)\s+(.+)$/i);
      if (m) {
        facts.push({
          subject: m[1].trim(),
          predicate: m[2].toLowerCase(),
          object: m[3].trim().slice(0, 100),
          source: "notebooks",
          confidence: 0.72,
        });
      }
    }
  }
  return facts.slice(0, 4);
}
