import { demoLeonardoReply } from "../lib/demoResponses";
import { domainBrain, runCritic, verify } from "./domainBrain";
import { extractFacts, retrieveKnowledge } from "./knowledge";
import { routeZone } from "./zoneRouter";
import type { CortexInput, CortexOutput } from "./types";

/** CORTEX-style pipeline adapted for Leonardo museum — reasoning is explicit, not LLM-generated. */
export function runLeonardoCortex(input: CortexInput): CortexOutput {
  const zone = routeZone(input);
  const snippets = retrieveKnowledge(input.question, zone === "general" ? undefined : zone, 4);
  if (input.folioContext) {
    snippets.unshift({
      title: input.folioContext.title,
      content: input.folioContext.body,
      score: 1,
      kind: "folio",
    });
  }
  const facts = extractFacts(snippets);
  const brain = domainBrain(zone, input.question, facts, input.folioContext?.body);
  const criticNotes = runCritic(brain.insights, brain.risks);
  const verification = verify(facts, brain.insights);

  const structured = {
    zone,
    plan: brain.plan,
    facts,
    insights: brain.insights,
    risks: brain.risks,
    criticNotes,
    verification,
    recommendation: brain.recommendation,
  };

  const reply = phraseLeonardo(structured, input);
  return {
    reply,
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

function phraseLeonardo(
  s: {
    zone: string;
    insights: string[];
    recommendation: string;
    facts: { subject: string; predicate: string; object: string; source: string }[];
  },
  input: CortexInput,
): string {
  const hotspot = input.hotspotLabel ? `You touch upon ${input.hotspotLabel} — ` : "";
  const visitor = input.memory.visitorName !== "Guest" ? `Friend ${input.memory.visitorName}, ` : "";

  const factPhrase =
    s.facts.length > 0
      ? `From my ${s.facts[0].source}: ${s.facts[0].subject} ${s.facts[0].predicate} ${s.facts[0].object}. `
      : "";

  const core = `${visitor}${hotspot}${s.recommendation} ${factPhrase}${s.insights[0] ?? ""}`.trim();

  if (core.length > 80) return core.replace(/\s+/g, " ");

  return demoLeonardoReply(input.question);
}

/** Re-export for backwards compatibility. */
export { polishWithLlm } from "./llmCloud";
export { polishWithOllama, ensureOllamaModel, ollamaReady } from "./ollama";
export { polishDraft } from "./polish";
