#!/usr/bin/env node
/**
 * Post-deploy smoke test — Excel QA cases against /api/leonardo on EC2.
 * Usage: node scripts/smoke-ec2-parlor.mjs [baseUrl]
 */
const BASE = process.argv[2] ?? process.env.SMOKE_BASE_URL ?? "http://100.31.117.65:8080";
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS ?? 120_000);

const CASES = [
  {
    name: "Who are you?",
    question: "Who are you?",
    mustInclude: [/Leonardo|painter|Vinci|1452/i],
    mustExclude: [/Leonardo's humour/i],
    needLlm: true,
  },
  {
    name: "Mona Lisa",
    question: "Tell me about the Mona Lisa",
    mustInclude: [/Mona Lisa|Gioconda|sfumato|Louvre/i],
    mustExclude: [/Leonardo's humour/i],
    needLlm: true,
  },
  {
    name: "Greatest invention",
    question: "What was your greatest invention?",
    mustInclude: [/ornithopter|invention|machine|saper vedere|see/i],
    mustExclude: [/Leonardo's humour/i],
    needLlm: true,
  },
  {
    name: "Sistine Chapel",
    question: "Did you paint the Sistine Chapel?",
    mustInclude: [/Michelangelo|No|not mine|Buonarroti/i],
    mustExclude: [/Leonardo's humour/i],
    needLlm: true,
  },
  {
    name: "Modern flying machines",
    question: "What do you think of our modern flying machines?",
    mustInclude: [/fly|flight|wing|machine|air/i],
    mustExclude: [/Leonardo's humour/i],
    needLlm: true,
  },
];

async function ask(question) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}/api/leonardo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({ question, polish: true }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function checkPatterns(text, patterns, label) {
  for (const re of patterns) {
    if (!re.test(text)) {
      console.log(`  ✗ missing ${label}: ${re}`);
      return false;
    }
  }
  return true;
}

let passed = 0;
const replies = [];

console.log(`Smoke test → ${BASE}/api/leonardo (${TIMEOUT_MS / 1000}s timeout)\n`);

for (const c of CASES) {
  process.stdout.write(`${c.name}… `);
  try {
    const data = await ask(c.question);
    const reply = data.reply ?? "";
    const provider = data.provider ?? "unknown";
    replies.push(reply);

    let ok = reply.length > 40;
    ok &&= checkPatterns(reply, c.mustInclude, "required");
    ok &&= !c.mustExclude.some((re) => re.test(reply)) || (console.log(`  ✗ forbidden pattern in reply`), false);
    if (c.needLlm) ok &&= provider.includes("leonardo") || provider.includes("qwen");

    // No A/B loop — each reply should differ from prior
    const dup = replies.slice(0, -1).some((r) => r.slice(0, 80) === reply.slice(0, 80));
    if (dup) {
      console.log("  ✗ duplicate of prior reply (response loop)");
      ok = false;
    }

    if (ok) {
      console.log(`✓ (${provider})`);
      passed++;
    } else {
      console.log(`✗ provider=${provider}`);
      console.log(`  reply: ${reply.slice(0, 160)}…`);
    }
  } catch (e) {
    console.log(`✗ ${e.message ?? e}`);
  }
}

console.log(`\nSmoke: ${passed}/${CASES.length} passed`);
process.exit(passed === CASES.length ? 0 : 1);
