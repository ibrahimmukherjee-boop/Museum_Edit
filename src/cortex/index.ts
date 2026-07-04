import { demoLeonardoReply } from "../lib/demoResponses";
import { composeLeonardoReply } from "./composeReply";
import { domainBrain, runCritic, verify } from "./domainBrain";
import { extractFacts, retrieveKnowledge } from "./knowledge";
import type { KnowledgeSnippet } from "./knowledge";
import { routeZone } from "./zoneRouter";
import type { CortexInput, CortexOutput } from "./types";

/** CORTEX-style pipeline — curated museum answers first, reasoning enriches the rest. */
export function runLeonardoCortex(input: CortexInput): CortexOutput {
  const zone = routeZone(input);

  const snippets = retrieveKnowledge(input.question, zone === "general" ? undefined : zone, 7);
  if (input.folioContext) {
    snippets.unshift({
      title: input.folioContext.title,
      content: input.folioContext.body,
      score: 2,
      kind: "folio",
    });
  }
  const facts = extractFacts(snippets);
  const brain = domainBrain(zone, input.question, facts, input.folioContext?.body);
  const criticNotes = runCritic(brain.insights, brain.risks);
  const verification = verify(facts, brain.insights);

  const reply = composeLeonardoReply(input, zone, brain.insights, snippets, facts);
  const finalReply = reply.length > 120 ? reply : demoLeonardoReply(input.question);

  return {
    reply: finalReply,
    trace: {
      zone,
      plan: brain.plan,
      facts,
      insights: brain.insights,
      risks: brain.risks,
      criticNotes,
      verification,
      recommendation: brain.recommendation,
    },
    provider: "cortex",
  };
}

/** Re-export for backwards compatibility. */
export { polishWithLlm } from "./llmCloud";
export { polishWithOllama, ensureOllamaModel, ollamaReady } from "./ollama";
export { polishDraft } from "./polish";
