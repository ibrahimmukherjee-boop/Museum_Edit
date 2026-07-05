import { buildPolishContext, retrieveKnowledge, type KnowledgeSnippet } from "./knowledge";
import type { LeonardoZone } from "./types";

const VOICE_HINT =
  "Speak as Leonardo: first person, present tense, observant, precise. Wit through observation — never meta-commentary about humour or personality.";

/** Factual context only — personality lives in leonardo-museum modelfile. */
export function buildLeonardoPolishContext(
  question: string,
  zone?: LeonardoZone,
  topK = 4,
): string {
  const snippets = retrieveKnowledge(question, zone === "general" ? undefined : zone, topK);
  const factual = buildPolishContext(snippets, 700);
  const parts = [
    VOICE_HINT,
    factual ? `FACTS (preserve in answer):\n${factual}` : "",
    `QUESTION: ${question}`,
  ].filter(Boolean);
  return parts.join("\n\n");
}

export function retrieveForCortex(question: string, zone?: LeonardoZone): KnowledgeSnippet[] {
  return retrieveKnowledge(question, zone === "general" ? undefined : zone, 7);
}
