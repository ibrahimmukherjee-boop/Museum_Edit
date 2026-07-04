#!/usr/bin/env node
/** Latency smoke — CORTEX fast path must respond in under 1s on EC2. */
const BASE = process.argv[2] ?? process.env.SMOKE_BASE_URL ?? "http://100.31.117.65:8080";
const MAX_MS = Number(process.env.SMOKE_FAST_MAX_MS ?? 1000);

async function timedFetch(path, body) {
  const t0 = performance.now();
  const res = await fetch(`${BASE}${path}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const ms = performance.now() - t0;
  const data = res.ok ? await res.json() : null;
  return { ms, ok: res.ok, data };
}

let passed = 0;

const health = await timedFetch("/api/health");
const healthOk = health.ok && health.data?.ollama && health.data?.slmReady !== false;
console.log(healthOk ? "✓" : "✗", `health ${health.ms.toFixed(0)}ms`, health.data ?? "");
if (healthOk && health.ms < MAX_MS) passed++;

const cortex = await timedFetch("/api/leonardo", {
  question: "Who are you?",
  polish: false,
});
const cortexOk =
  cortex.ok &&
  cortex.ms < MAX_MS &&
  cortex.data?.provider === "cortex" &&
  !/Leonardo's humour/i.test(cortex.data?.reply ?? "");
console.log(
  cortexOk ? "✓" : "✗",
  `cortex-only ${cortex.ms.toFixed(0)}ms (max ${MAX_MS}ms)`,
  cortex.data?.provider,
);
if (cortexOk) passed++;

console.log(`\nFast smoke: ${passed}/2 passed`);
process.exit(passed === 2 ? 0 : 1);
