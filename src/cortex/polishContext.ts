import { buildPersonalityContext } from "./personalityLayer";
import { retrieveKnowledge, buildPolishContext, type KnowledgeSnippet } from "./knowledge";
import type { LeonardoZone } from "./types";

/** Full context for Qwen polish: personality voice + museum facts (no source labels). */
export function buildLeonardoPolishContext(
  question: string,
  zone?: LeonardoZone,
  topK = 6,
): string {
  const personality = buildPersonalityContext(question, 900);
  const snippets = retrieveKnowledge(question, zone === "general" ? undefined : zone, topK);
  const factual = buildPolishContext(snippets, 1200);
  const parts = [
    personality ? `VOICE AND CHARACTER (speak this way — first person only):\n${personality}` : "",
    factual ? `FACTS FROM MY NOTEBOOKS AND WORK (preserve in your answer):\n${factual}` : "",
  ].filter(Boolean);
  return parts.join("\n\n");
}

export function retrieveForCortex(question: string, zone?: LeonardoZone): KnowledgeSnippet[] {
  return retrieveKnowledge(question, zone === "general" ? undefined : zone, 7);
}
