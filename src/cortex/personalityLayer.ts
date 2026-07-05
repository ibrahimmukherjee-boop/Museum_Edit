import { PERSONA_VOICE_ANCHORS } from "../data/personaVoice";
import { TRAINING_CHUNKS } from "../data/trainingCorpus";
import { BM25 } from "./bm25";
import { hasPersonalityLeak, isSafeCorpusChunk, isSafeForVisitorText } from "./corpusFilter";

/** Meta / implementation text from Personality briefs — never send to the LLM or visitor. */
const PERSONALITY_META =
  /\b(DVNC\.ai|Complete Brief|Agent Prompts|Part I|Part II|Part III|Part IV|Part V|How to Use This Document|implementation-ready|For Ibrahim|Cognitive architecture|BEHAVIOURAL INSTRUCTION|mental models as simultaneous|Layer Document Function|scholarly basis|This document|viewed from three angles|Before proposing a solution)\b/i;

const THIRD_PERSON =
  /\b(The actual Leonardo|Leonardo's|Leonardo is|Leonardo was|He served Cesare|He was not|He does not|His notebooks also|His humour|His description)\b/i;

let personalityIndex: BM25 | null = null;

function ensurePersonalityIndex(): BM25 {
  if (personalityIndex) return personalityIndex;
  personalityIndex = new BM25();
  TRAINING_CHUNKS.forEach((c, i) => {
    if (!c.source.startsWith("Personality:")) return;
    if (!isSafePersonalityChunk(c.source, c.text)) return;
    personalityIndex!.add(`pers-${i}`, c.text, { source: c.source });
  });
  return personalityIndex;
}

export function isSafePersonalityChunk(source: string, text: string): boolean {
  if (!isSafeCorpusChunk(source, text)) return false;
  if (PERSONALITY_META.test(text)) return false;
  if (PERSONALITY_META.test(source)) return false;
  if (THIRD_PERSON.test(text)) return false;
  if (/^DVNC\.ai Leonardo Museum/i.test(text.trim())) return false;
  if (text.length < 50 || text.length > 520) return false;
  return true;
}

/** Rewrite third-person brief lines into Leonardo first person for polish context only. */
function toFirstPersonVoice(line: string): string {
  return line
    .replace(/\bLeonardo's humour\b/gi, "My humour")
    .replace(/\bLeonardo was\b/gi, "I was")
    .replace(/\bLeonardo is\b/gi, "I am")
    .replace(/\bHe who\b/g, "I who")
    .replace(/\bHis notebooks\b/gi, "My notebooks")
    .replace(/\s+/g, " ")
    .trim();
}

/** Always-on DVNC personality voice (first person) + query-matched brief excerpts. */
export function buildPersonalityContext(query: string, maxChars = 900): string {
  const blocks: string[] = [];
  let used = 0;

  for (const anchor of PERSONA_VOICE_ANCHORS) {
    if (hasPersonalityLeak(anchor.content)) continue;
    const line = anchor.content.slice(0, 220);
    if (used + line.length > maxChars) break;
    blocks.push(line);
    used += line.length;
  }

  const hits = ensurePersonalityIndex()
    .search(query, 8)
    .filter((h) => isSafePersonalityChunk(h.meta.source, h.text));

  for (const hit of hits) {
    let line = toFirstPersonVoice(hit.text.replace(/\s+/g, " ").slice(0, 300));
    if (!isSafeForVisitorText(line)) continue;
    if (blocks.some((b) => b.slice(0, 60) === line.slice(0, 60))) continue;
    if (used + line.length > maxChars) break;
    blocks.push(line);
    used += line.length;
  }

  return blocks.join("\n");
}
