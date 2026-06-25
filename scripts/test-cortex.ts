import { runLeonardoCortex } from "../src/cortex/index";
import type { CortexInput } from "../src/cortex/types";

const cases: { name: string; input: CortexInput }[] = [
  {
    name: "Parlor — flying machines",
    input: {
      question: "What do you think of our modern flying machines?",
      history: [],
      memory: { sessionId: "test", visitorName: "Guest", workingMemory: [] },
    },
  },
  {
    name: "Parlor — general",
    input: {
      question: "What is saper vedere?",
      history: [],
      memory: { sessionId: "test", visitorName: "Test Visitor", workingMemory: [] },
    },
  },
  {
    name: "Atelier hotspot — Mona Lisa smile",
    input: {
      question: "Why does her expression seem to change as the viewer moves?",
      history: [],
      memory: { sessionId: "test", visitorName: "Guest", workingMemory: [] },
      folioContext: { title: "Mona Lisa", body: "Sfumato dissolves the corners of the mouth and eyes.", domain: "art" },
      hotspotLabel: "The Smile",
    },
  },
  {
    name: "Anatomy zone",
    input: {
      question: "What did dissection teach you about the shoulder?",
      history: [],
      memory: { sessionId: "test", visitorName: "Guest", workingMemory: [] },
      folioContext: { title: "Studies of the Shoulder", body: "Layered dissections revealing muscle and bone.", domain: "anatomy" },
    },
  },
  {
    name: "Engineering zone",
    input: {
      question: "Could your flying machine work?",
      history: [],
      memory: { sessionId: "test", visitorName: "Guest", workingMemory: [] },
      folioContext: { title: "Flying Machine", body: "Wings modeled on the bat.", domain: "engineering" },
    },
  },
];

let passed = 0;
for (const c of cases) {
  const out = runLeonardoCortex(c.input);
  const ok =
    Boolean(out.reply?.length && out.reply.length > 40) &&
    Boolean(out.trace.zone) &&
    out.trace.verification.reasoning > 0 &&
    (out.provider === "cortex" || out.provider === "cortex+curated") &&
    (c.name?.includes("flying") ? out.reply.includes("astonish") : true);
  console.log(ok ? "✓" : "✗", c.name ?? "unnamed");
  console.log("  zone:", out.trace.zone);
  console.log("  scores:", out.trace.verification);
  console.log("  reply:", `${out.reply.slice(0, 140)}…\n`);
  if (ok) passed++;
}

console.log(`CORTEX smoke test: ${passed}/${cases.length} passed`);
process.exit(passed === cases.length ? 0 : 1);
