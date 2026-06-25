import { demoLeonardoReply, isCuratedDemoReply } from "../lib/demoResponses";
import { domainBrain, runCritic, verify } from "./domainBrain";
import { extractFacts, retrieveKnowledge } from "./knowledge";
import { routeZone } from "./zoneRouter";
import type { CortexInput, CortexOutput } from "./types";

/** CORTEX-style pipeline — curated museum answers first, reasoning enriches the rest. */
export function runLeonardoCortex(input: CortexInput): CortexOutput {
  const zone = routeZone(input);

  // Museum-quality scripted replies take priority (Parlor starters, domain topics).
  if (isCuratedDemoReply(input.question)) {
    return {
      reply: demoLeonardoReply(input.question),
      trace: {
        zone,
        plan: ["Serve the curated exhibit voice"],
        facts: [],
        insights: ["Curated reply matched visitor intent"],
        risks: [],
        criticNotes: [],
        verification: { reasoning: 1, evidence: 1, contradiction: 0 },
        recommendation: "Deliver the prepared Leonardo line.",
      },
      provider: "cortex+curated",
    };
  }

  const snippets = retrieveKnowledge(input.question, zone === "general" ? undefined : zone, 5);
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

  const reply = phraseLeonardo(
    {
      zone,
      insights: brain.insights,
      recommendation: brain.recommendation,
      facts,
    },
    input,
  );

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
  const hotspot = input.hotspotLabel
    ? `You touch upon ${input.hotspotLabel} — I lean closer to show you. `
    : "";
  const visitor = input.memory.visitorName !== "Guest" ? `${input.memory.visitorName}, ` : "";

  const lastUser =
    [...(input.history ?? [])].reverse().find((m) => m.role === "user")?.content ?? input.question;

  const factPhrase =
    s.facts.length > 0
      ? `From my ${s.facts[0].source}: ${s.facts[0].subject} ${s.facts[0].predicate} ${s.facts[0].object}. `
      : "";

  const insight = s.insights.slice(0, 2).join(" ");
  const folioLead = input.folioContext
    ? `Before us — “${input.folioContext.title}”. ${input.folioContext.body.slice(0, 220).trim()}… `
    : "";

  const answerLead = lastUser !== input.question ? `On “${lastUser.slice(0, 80)}” — ` : "";

  const core = [visitor, folioLead, hotspot, answerLead, s.recommendation, factPhrase, insight]
    .filter(Boolean)
    .join("")
    .replace(/\s+/g, " ")
    .replace(/ ,/g, ",")
    .trim();

  if (core.length > 80) return core;

  return demoLeonardoReply(input.question);
}

/** Re-export for backwards compatibility. */
export { polishWithLlm } from "./llmCloud";
export { polishWithOllama, ensureOllamaModel, ollamaReady } from "./ollama";
export { polishDraft } from "./polish";
