import { runLeonardoCortex } from "../src/cortex/index";
import { sanitizeLeonardoReply } from "../src/cortex/corpusFilter";
import type { CortexInput } from "../src/cortex/types";

const baseMemory = { sessionId: "test", visitorName: "Guest", workingMemory: [] };

const cases: { name: string; input: CortexInput; checks?: (reply: string) => boolean }[] = [
  {
    name: "Excel — Who are you?",
    input: { question: "Who are you?", history: [], memory: baseMemory },
    checks: (r) => /Leonardo|Vinci|1452/i.test(r) && !/Leonardo's humour/i.test(r),
  },
  {
    name: "Excel — Mona Lisa",
    input: { question: "Tell me about the Mona Lisa", history: [], memory: baseMemory },
    checks: (r) => /Mona Lisa|Gioconda|sfumato/i.test(r) && !/Leonardo's humour/i.test(r),
  },
  {
    name: "Excel — Greatest invention",
    input: { question: "What was your greatest invention?", history: [], memory: baseMemory },
    checks: (r) => /ornithopter|invention|saper vedere|machine/i.test(r),
  },
  {
    name: "Excel — Sistine Chapel",
    input: { question: "Did you paint the Sistine Chapel?", history: [], memory: baseMemory },
    checks: (r) => /Michelangelo|not mine|No/i.test(r),
  },
  {
    name: "Parlor — flying machines",
    input: {
      question: "What do you think of our modern flying machines?",
      history: [],
      memory: baseMemory,
    },
    checks: (r) => /fly|flight|wing|machine/i.test(r),
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
      memory: baseMemory,
      folioContext: { title: "Mona Lisa", body: "Sfumato dissolves the corners of the mouth and eyes.", domain: "art" },
      hotspotLabel: "The Smile",
    },
  },
  {
    name: "Anatomy zone",
    input: {
      question: "What did dissection teach you about the shoulder?",
      history: [],
      memory: baseMemory,
      folioContext: { title: "Studies of the Shoulder", body: "Layered dissections revealing muscle and bone.", domain: "anatomy" },
    },
  },
  {
    name: "Engineering zone",
    input: {
      question: "Could your flying machine work?",
      history: [],
      memory: baseMemory,
      folioContext: { title: "Flying Machine", body: "Wings modeled on the bat.", domain: "engineering" },
    },
  },
];

let passed = 0;
const draftSnippets: string[] = [];

for (const c of cases) {
  const out = runLeonardoCortex(c.input);
  const reply = sanitizeLeonardoReply(out.reply, c.input.question);
  const ok =
    Boolean(reply.length > 40) &&
    Boolean(out.trace.zone) &&
    out.trace.verification.reasoning > 0 &&
    out.provider === "cortex" &&
    (c.checks ? c.checks(reply) : true) &&
    !/Leonardo's humour/i.test(reply);

  const dup = draftSnippets.some((s) => s.slice(0, 80) === reply.slice(0, 80));
  if (dup) {
    console.log("✗", c.name, "— duplicate draft (loop risk)");
    continue;
  }
  draftSnippets.push(reply);

  console.log(ok ? "✓" : "✗", c.name ?? "unnamed");
  console.log("  zone:", out.trace.zone);
  console.log("  reply:", `${reply.slice(0, 140)}…\n`);
  if (ok) passed++;
}

console.log(`CORTEX smoke test: ${passed}/${cases.length} passed`);
process.exit(passed === cases.length ? 0 : 1);
